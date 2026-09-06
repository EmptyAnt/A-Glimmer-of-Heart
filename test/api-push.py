# -*- coding: utf-8 -*-
# 备用推送通道：github.com 不可达而 api.github.com 可用时（间歇性网络问题的常见组合），
# 用 Git Data API 在远端构造提交（blob → tree → commit → 更新 ref）。
# 用法：python test/api-push.py（自动读取 origin 远端与当前分支，推送本地领先提交）
# 注意：API 构造的提交 SHA 与本地不同（内容相同）；网络恢复后执行
#   git fetch && git reset --hard origin/main  对齐本地。
import base64
import json
import subprocess
import sys
import urllib.request


def git(*args):
    return subprocess.run(['git'] + list(args), capture_output=True, check=True).stdout.decode('utf-8').strip()


REPO = git('remote', 'get-url', 'origin').strip().removeprefix('https://github.com/').removesuffix('.git')
BRANCH = git('rev-parse', '--abbrev-ref', 'HEAD')
TOKEN = []  # token 只在内存中流转，不打印不落盘


def git(*args):
    return subprocess.run(['git'] + list(args), capture_output=True, check=True).stdout.decode('utf-8').strip()


def api(method, path, payload=None):
    token = TOKEN[0]
    req = urllib.request.Request(
        f'https://api.github.com/repos/{REPO}/{path}',
        data=json.dumps(payload).encode('utf-8') if payload is not None else None,
        method=method,
        headers={
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json',
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = resp.read().decode('utf-8')
        return json.loads(body) if body else {}


# token 从凭据管理器取（不打印不落盘）
cred = subprocess.run(['git', 'credential', 'fill'], input=b'protocol=https\nhost=github.com\n\n',
                      capture_output=True, check=True).stdout.decode('utf-8')
TOKEN.append([l.split('=', 1)[1] for l in cred.splitlines() if l.startswith('password=')][0])

# 1) 远端当前 HEAD 与 tree
head = api('GET', f'commits/{BRANCH}')
remote_head = head['sha']
base_tree = head['commit']['tree']['sha']

# 2) 本地待推文件
files = git('diff', '--name-only', 'origin/main..main').splitlines()
if not files:
    print('没有待推变更')
    sys.exit(0)
print(f'待推文件 {len(files)} 个')

# 3) 逐文件建 blob
tree_items = []
for path in files:
    with open(path, 'rb') as f:
        content = base64.b64encode(f.read()).decode('ascii')
    blob = api('POST', 'git/blobs', {'content': content, 'encoding': 'base64'})
    tree_items.append({'path': path, 'mode': '100644', 'type': 'blob', 'sha': blob['sha']})

# 4) 建 tree（基于远端当前 tree）
tree = api('POST', 'git/trees', {'base_tree': base_tree, 'tree': tree_items})

# 5) 建 commit（父提交 = 远端 HEAD）
message = git('log', '-1', '--pretty=%B')
commit = api('POST', 'git/commits', {
    'message': message,
    'tree': tree['sha'],
    'parents': [remote_head],
})

# 6) 快进更新 ref
ref = api('PATCH', f'git/refs/heads/{BRANCH}', {'sha': commit['sha'], 'force': False})
print(f'远端 main: {remote_head[:7]} -> {commit["sha"][:7]}')
print(f'HTML: {ref["object"]["sha"][:7]} 已更新')
