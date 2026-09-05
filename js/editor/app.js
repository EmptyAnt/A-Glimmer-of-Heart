// 编辑器主界面：Tab 切换、校验渲染、事件库浏览、Flag 收敛图、模拟看板。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  const $ = (id) => document.getElementById(id);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // JSON 序列化：函数标记为 [Function]，便于展示含 make 工厂的定义
  function prettyDef(def) {
    return JSON.stringify(def, (key, value) => {
      if (typeof value === 'function') return '[Function]';
      return value;
    }, 2);
  }

  // ---------- Tab ----------
  for (const btn of document.querySelectorAll('.ed-tabs .tab-btn')) {
    btn.addEventListener('click', () => {
      for (const b of document.querySelectorAll('.ed-tabs .tab-btn')) b.classList.remove('active');
      btn.classList.add('active');
      for (const page of document.querySelectorAll('.ed-page')) page.classList.add('hidden');
      $(`tab-${btn.dataset.tab}`).classList.remove('hidden');
    });
  }

  // ---------- 校验 ----------
  let lastValidation = null;
  function runValidation() {
    lastValidation = G.editor.validate();
    const { issues } = lastValidation;
    const counts = { error: 0, warn: 0, info: 0 };
    for (const item of issues) counts[item.severity]++;
    $('validate-summary').textContent = `错误 ${counts.error} · 警告 ${counts.warn} · 提示 ${counts.info}（点击条目跳转到事件库）`;

    const list = $('validate-list');
    list.textContent = '';
    if (issues.length === 0) {
      const ok = el('div', 'v-item', '✓ 全部通过：无死链、无可达性问题、无字段拼写错误。');
      list.appendChild(ok);
    }
    const labels = { error: '错误', warn: '警告', info: '提示' };
    for (const item of issues) {
      const row = el('div', `v-item ${item.severity}`);
      row.appendChild(el('div', 'v-loc', `[${labels[item.severity]}] ${item.pool} · ${item.id}`));
      row.appendChild(el('div', 'v-msg', item.msg));
      row.addEventListener('click', () => {
        if (item.pool === 'anchors' || item.pool === 'followups' || item.pool === 'illness' || item.pool === 'illnessFollowups') {
          openLibrary(item.pool, item.id);
        }
      });
      list.appendChild(row);
    }
  }
  $('btn-validate').addEventListener('click', runValidation);

  // ---------- 事件库 ----------
  const library = {
    anchors: () => G.ANCHORS,
    followups: () => G.ANCHOR_FOLLOWUPS,
    templates: () => G.TEMPLATES,
    illness: () => G.illness.list(),
  };

  function currentPoolId() { return $('filter-pool').value === 'illnessFollowups' ? 'illness' : $('filter-pool').value; }
  let selectedId = null;

  function defOf(poolId, id) {
    const pool = library[poolId] || (poolId === 'illnessFollowups' ? G.illness.followups : library[poolId]);
    return (pool || []).find((d) => d.id === id);
  }

  function renderLibrary() {
    const poolId = $('filter-pool').value;
    const stageFilter = $('filter-stage').value;
    const q = $('filter-search').value.trim();
    const items = (library[poolId] ? library[poolId]() : []).filter((def) => {
      if (stageFilter && (def.stage || 'newborn') !== stageFilter) return false;
      if (q) {
        const hay = `${def.id} ${def.title || def.name || ''} ${JSON.stringify(prettyDef(def))}`;
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    $('library-count').textContent = `${items.length} 项`;

    const table = el('table', 'ed-table');
    const thead = el('thead');
    const headRow = el('tr');
    for (const h of ['ID', '标题/名称', '阶段', '窗口/门槛', '选项', '种下的 flag']) headRow.appendChild(el('th', null, h));
    thead.appendChild(headRow);
    table.appendChild(thead);
    const tbody = el('tbody');

    for (const def of items) {
      const row = el('tr');
      if (def.id === selectedId) row.classList.add('selected');
      const dayText = Array.isArray(def.day) ? `${def.day[0]}~${def.day[1]}` : (def.canTrigger ? 'canTrigger' : '—');
      const choiceCount = Array.isArray(def.choices) ? def.choices.length : '动态';
      const flagSet = new Set();
      const collect = (choices) => {
        for (const c of choices || []) {
          for (const f of Object.keys((c.effects && c.effects.setFlags) || {})) flagSet.add(f);
        }
      };
      collect(def.choices);
      row.append(
        el('td', 'id', def.id),
        el('td', null, def.title || def.name || ''),
        el('td', null, def.stage || 'newborn'),
        el('td', null, dayText),
        el('td', null, String(choiceCount)),
        el('td', null, [...flagSet].join('、') || '—'),
      );
      row.addEventListener('click', () => { selectedId = def.id; renderLibrary(); renderDetail(def, poolId); });
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    $('library-table').textContent = '';
    $('library-table').appendChild(table);
  }

  function renderDetail(def, poolId) {
    const box = $('library-detail');
    box.textContent = '';
    box.appendChild(el('h3', null, def.title || def.name || def.id));
    const meta = el('div', 'meta');
    meta.textContent = `池：${poolId} · 阶段：${def.stage || 'newborn'} · 窗口：${Array.isArray(def.day) ? def.day.join('~') : '—'} · ${def.make ? 'make 动态生成' : '静态定义'}`;
    box.appendChild(meta);

    const actions = el('div', 'detail-actions');
    const copyBtn = el('button', 'ghost', '复制 JSON');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(prettyDef(def)).then(() => { copyBtn.textContent = '已复制 ✓'; setTimeout(() => (copyBtn.textContent = '复制 JSON'), 1200); });
    });
    actions.appendChild(copyBtn);
    const simBtn = el('button', 'ghost', '在模拟看板看它的触发率');
    simBtn.addEventListener('click', () => {
      document.querySelector('.ed-tabs [data-tab="sim"]').click();
    });
    actions.appendChild(simBtn);
    box.appendChild(actions);

    const pre = el('pre');
    pre.textContent = prettyDef(def);
    box.appendChild(pre);
  }

  function openLibrary(poolId, id) {
    // illnessFollowups 归并到 illness 下拉
    $('filter-pool').value = poolId === 'illnessFollowups' ? 'illness' : poolId;
    selectedId = id;
    document.querySelector('.ed-tabs [data-tab="library"]').click();
    renderLibrary();
    const def = poolId === 'illnessFollowups' ? G.illness.followups().find((d) => d.id === id) : defOf(poolId, id);
    if (def) renderDetail(def, poolId === 'illnessFollowups' ? 'illnessFollowups' : poolId);
  }

  // 阶段筛选下拉
  for (const stage of G.CONFIG.STAGES) {
    const opt = document.createElement('option');
    opt.value = stage.id;
    opt.textContent = stage.name;
    $('filter-stage').appendChild(opt);
  }
  for (const evt of ['change', 'input']) {
    $('filter-pool').addEventListener(evt, renderLibrary);
    $('filter-stage').addEventListener(evt, renderLibrary);
    $('filter-search').addEventListener(evt, renderLibrary);
  }

  // ---------- Flag 收敛图 ----------
  function renderFlagsMap() {
    if (!lastValidation) lastValidation = G.editor.validate();
    const { flagIndex } = lastValidation;
    const table = el('table', 'ed-table');
    const thead = el('thead');
    const headRow = el('tr');
    for (const h of ['Flag', '注册', '设置来源（收敛路径）', '被条件消费']) headRow.appendChild(el('th', null, h));
    thead.appendChild(headRow);
    table.appendChild(thead);
    const tbody = el('tbody');

    const ids = new Set([
      ...Object.keys(G.FLAGS),
      ...Object.keys(flagIndex.setBy),
      ...Object.keys(flagIndex.readBy),
      ...Object.keys(flagIndex.unsetBy),
    ]);
    for (const id of [...ids].sort()) {
      const row = el('tr');
      const setBy = flagIndex.setBy[id] || [];
      const readBy = flagIndex.readBy[id] || [];
      const reg = G.FLAGS[id] ? `✓ ${G.FLAGS[id].preview ? '有发芽预告' : '已登记'}` : '✗ 未注册';
      row.append(
        el('td', 'id', id),
        el('td', null, reg),
        el('td', null, setBy.length ? `${setBy.length} 处：${[...new Set(setBy)].slice(0, 4).join('、')}${setBy.length > 4 ? ' …' : ''}` : '（结算派生或初始）'),
        el('td', null, readBy.length ? [...new Set(readBy)].join('、') : '—'),
      );
      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    $('flags-table').textContent = '';
    $('flags-table').appendChild(table);
  }
  document.querySelector('.ed-tabs [data-tab="flags"]').addEventListener('click', renderFlagsMap);

  // ---------- 模拟看板 ----------
  let simStop = false;
  $('btn-sim').addEventListener('click', () => {
    const runs = Math.max(50, Math.min(5000, Number($('sim-runs').value) || 500));
    simStop = false;
    $('btn-sim').disabled = true;
    $('btn-sim-stop').disabled = false;
    $('sim-report').textContent = '';
    $('sim-status').textContent = '运行中…';

    G.editor.runSimulation({
      runs,
      shouldStop: () => simStop,
      onProgress(done, total) {
        $('sim-progress-fill').style.width = `${Math.round((done / total) * 100)}%`;
        $('sim-status').textContent = `${done} / ${total} 局`;
      },
      onDone(report) { renderSimReport(report, runs); },
    });
  });
  $('btn-sim-stop').addEventListener('click', () => { simStop = true; });

  function rateCell(n, total) {
    const pct = total ? (100 * n / total) : 0;
    const td = el('td', 'bar-cell');
    const fill = el('div', 'fill');
    fill.style.width = `${Math.min(100, pct)}%`;
    const txt = el('div', 'txt', `${n} (${pct.toFixed(1)}%)`);
    td.append(fill, txt);
    return td;
  }

  function renderSimReport(report, requested) {
    $('btn-sim').disabled = false;
    $('btn-sim-stop').disabled = true;
    const r = Math.max(1, report.runs);
    $('sim-status').textContent = `完成 ${report.runs} 局${report.stopped ? '（手动停止）' : ''} · 异常 ${report.errors}`;

    const box = $('sim-report');
    box.textContent = '';

    const summary = el('div', 'sim-block');
    summary.appendChild(el('h3', null, '总览'));
    summary.appendChild(el('div', 'kv', `局数 ${report.runs}/${requested} ｜ 异常 ${report.errors}${report.firstError ? '（详见控制台）' : ''}`));
    summary.appendChild(el('div', 'kv', `三岁均值：体重 P${(report.weightPSum / r).toFixed(0)} ｜ 安全感 ${(report.securitySum / r).toFixed(1)}`));
    const spendTotal = Object.values(report.spendByKind).reduce((a, b) => a + b, 0);
    const spendLine = Object.entries(report.spendByKind)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${G.CONFIG.SPEND_KINDS[k] || k} ¥${Math.round(v / r).toLocaleString()}`)
      .join(' ｜ ');
    summary.appendChild(el('div', 'kv', `均支出：¥${Math.round(spendTotal / r).toLocaleString()}（${spendLine}）`));
    if (report.firstError) {
      console.error('[模拟器首个异常]', report.firstError);
    }
    box.appendChild(summary);

    // 锚点触发率
    const anchorBlock = el('div', 'sim-block');
    anchorBlock.appendChild(el('h3', null, '锚点触发率'));
    const at = el('table', 'ed-table');
    const athead = el('thead');
    const ahr = el('tr');
    for (const h of ['锚点', '触发率']) ahr.appendChild(el('th', null, h));
    athead.appendChild(ahr);
    at.append(athead);
    const atbody = el('tbody');
    const expectedRare = ['a_marriage_redline', 'a_debt'];
    const sorted = [...report.allAnchorIds].sort((a, b) => (report.anchorFired[b] || 0) - (report.anchorFired[a] || 0));
    for (const id of sorted) {
      const n = report.anchorFired[id] || 0;
      const row = el('tr');
      row.append(el('td', 'id', id + (n === 0 && !expectedRare.includes(id) ? '  ⚠从未触发' : '')), rateCell(n, report.runs));
      atbody.appendChild(row);
    }
    at.appendChild(atbody);
    anchorBlock.appendChild(at);
    box.appendChild(anchorBlock);

    // 模板与 flag
    const tplBlock = el('div', 'sim-block');
    tplBlock.appendChild(el('h3', null, '模板家族 / Flag 分布'));
    const tt = el('table', 'ed-table');
    const tthead = el('thead');
    const thr = el('tr');
    for (const h of ['项目', '数值']) thr.appendChild(el('th', null, h));
    tthead.appendChild(thr);
    tt.append(tthead);
    const ttbody = el('tbody');
    for (const tpl of G.TEMPLATES) {
      const n = report.templateFired[tpl.id] || 0;
      const row = el('tr');
      row.append(el('td', 'id', `${tpl.id}（${tpl.name}）`), el('td', null, `${n} 次 · 均 ${(n / r).toFixed(1)}/局`));
      ttbody.appendChild(row);
    }
    const flags = Object.entries(report.flagCount).sort((a, b) => b[1] - a[1]);
    for (const [id, n] of flags) {
      const row = el('tr');
      row.append(el('td', 'id', `flag: ${id}`), rateCell(n, report.runs));
      ttbody.appendChild(row);
    }
    tt.appendChild(ttbody);
    tplBlock.appendChild(tt);
    box.appendChild(tplBlock);
  }

  // ---------- 启动 ----------
  try {
    renderLibrary();
    runValidation();
  } catch (e) {
    const summary = $('validate-summary');
    if (summary) summary.textContent = `启动失败：${e.message}`;
    console.error('[编辑器启动异常]', e);
  }
})(GAME);
