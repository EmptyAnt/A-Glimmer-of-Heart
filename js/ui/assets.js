// 图片资产管理：约定文件名 → 自动发现 → 缺图降级 emoji。
//
// 目录约定（assets/ 下，文件名即 key，小写，UTF-8）：
//   assets/poses/     人物立绘：{体态}-{服装}.png        例：婴儿-连体衣.png
//   assets/exprs/     表情贴片：{表情}.png               例：大哭.png
//   assets/scenes/    背景板：{场景}.png                 例：家中-凌晨.png
//
// 命名规则：与事件数据里的 art.{pose|outfit|expr|scene} 完全一致（去掉中间空格）。
// 例：art = { pose: '新生儿', outfit: '包被' } → 找 assets/poses/新生儿-包被.png
//     找不到精确组合时按 pose 单独找 assets/poses/{pose}.png，再找不到降级 emoji。
//
// 加图即生效：把 png 丢进对应目录即可，无需改代码。存在 assets/manifest.json
// 时按清单预加载（可选，未列出也能按需加载）。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  // 已知资源 key 清单（用于生成提示词库与资产盘点）
  const REGISTRY = {
    poses: [],   // {pose, outfit}
    exprs: [],   // {expr}
    scenes: [],  // {scene}
  };

  // 扫描全部事件定义，收集出现过的 art 组合
  function scanRegistry() {
    if (REGISTRY.poses.length) return REGISTRY;
    const seen = { pose: new Set(), expr: new Set(), scene: new Set() };
    const collect = (art) => {
      if (!art) return;
      if (art.pose) seen.pose.add(art.pose);
      if (art.expr) seen.expr.add(art.expr);
      if (art.scene) seen.scene.add(art.scene);
    };
    for (const d of G.ANCHORS) collect(d.art);
    for (const d of G.ANCHOR_FOLLOWUPS) collect(d.art);
    for (const d of G.illness.list()) collect(d.art);
    for (const t of G.TEMPLATES) collect(t.art);
    for (const pose of seen.pose) {
      // 服装档：从已知文案中提取（连体衣/包被/园服/校服…），pose 单独也登记一份作降级
      REGISTRY.poses.push({ pose, outfit: null });
    }
    REGISTRY.poses = [...seen.pose].map((p) => ({ pose: p, outfit: null }));
    REGISTRY.exprs = [...seen.expr].map((e) => ({ expr: e }));
    REGISTRY.scenes = [...seen.scene].map((s) => ({ scene: s }));
    return REGISTRY;
  }

  // 文件名规范化：去空格、斜杠转连字符
  function fileName(...parts) {
    return parts.filter(Boolean).join('-').replace(/\s+/g, '').replace(/\//g, '-') + '.png';
  }

  const cache = {};

  // 探测图片是否存在（Image onerror 缓存结果）
  function probe(url) {
    if (url in cache) return cache[url];
    cache[url] = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
    return cache[url];
  }

  function url(kind, ...parts) {
    return `assets/${kind}/${fileName(...parts)}`;
  }

  // 解析一个 art 对象 → { sceneUrl, poseUrl, exprUrl }（均可能为 null）
  async function resolve(art) {
    if (!art) return {};
    const sceneUrl = url('scenes', art.scene);
    // 优先 精确组合（pose-outfit），退回 pose 单人立绘
    const poseCombo = art.outfit ? url('poses', art.pose, art.outfit) : null;
    const poseSolo = url('poses', art.pose);
    const exprUrl = url('exprs', art.expr);

    const [sceneOk, comboOk, soloOk, exprOk] = await Promise.all([
      probe(sceneUrl),
      poseCombo ? probe(poseCombo) : Promise.resolve(false),
      probe(poseSolo),
      probe(exprUrl),
    ]);
    return {
      sceneUrl: sceneOk ? sceneUrl : null,
      poseUrl: comboOk ? poseCombo : (soloOk ? poseSolo : null),
      exprUrl: exprOk ? exprUrl : null,
    };
  }

  G.assets = { resolve, scanRegistry, fileName, REGISTRY };
})(GAME);
