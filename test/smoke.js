// 无头模拟器：批量随机通关，输出平衡数据与覆盖率报告。
// 既是冒烟测试（任何异常都会被捕获计数），也是"自动模拟器"工具链的雏形——
// 将来万级事件库的平衡调整靠跑数据，不靠手感。
//
// 用法：node test/smoke.js [局数，默认 2000]
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = [
  'js/data/config.js',
  'js/data/flags.js',
  'js/data/growth.js',
  'js/data/illness.js',
  'js/data/anchors.js',
  'js/data/templates.js',
  'js/core/conditions.js',
  'js/core/effects.js',
  'js/core/events.js',
  'js/core/state.js',
  'js/core/engine.js',
];
const code = FILES.map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n');
(0, eval)(code);

const GAME = globalThis.GAME;
if (!GAME || !GAME.engine) {
  console.error('加载失败：GAME 命名空间不完整');
  process.exit(1);
}

const RUNS = Number(process.argv[2]) || 2000;
const PRESETS = GAME.CONFIG.PRESETS.map((p) => p.id);

function playOne(presetId, perspective) {
  const state = GAME.state.createGame({
    presetId,
    perspective,
    papaName: '陈阳',
    mamaName: '林晚',
    nickname: '小汤圆',
  });
  while (!state.ended) {
    const { queue } = GAME.engine.advanceDay(state);
    for (const event of queue) {
      const usable = (event.choices || []).filter((c) => !GAME.conditions.choiceBlockReason(state, c));
      if (usable.length === 0) continue;
      GAME.engine.resolveEvent(state, event, GAME.util.pick(usable));
    }
    GAME.engine.finishDay(state);
  }
  return { state, report: GAME.engine.endGame(state) };
}

// ---------- 跑批 ----------
const stats = {
  runs: 0,
  errors: 0,
  firstError: null,
  flagCount: {},
  flagSources: {},        // flagId -> { source -> n }  收敛来源分布
  anchorFired: {},
  templateFired: {},
  illnessFired: 0,
  spendByKind: {},
  weightPSum: 0,
  securitySum: 0,
  moneySum: 0,
  pendingLeft: 0,
  endedBefore28: 0,
};
const allAnchors = GAME.ANCHORS.map((a) => a.id);
const allTemplates = GAME.TEMPLATES.map((t) => t.id);

for (let i = 0; i < RUNS; i++) {
  try {
    const { state, report } = playOne(
      PRESETS[i % PRESETS.length],
      i % 2 === 0 ? 'papa' : 'mama', // 两种视角都要被跑到
    );
    stats.runs++;
    if (state.day < GAME.CONFIG.TOTAL_DAYS - 1) stats.endedBefore28++;
    stats.weightPSum += report.weightP;
    stats.securitySum += report.security;
    stats.moneySum += report.family.money;
    stats.pendingLeft += report.pendingLeft;
    stats.illnessFired += report.stats.illness;
    for (const [kind, amount] of Object.entries(state.stats.spend)) {
      stats.spendByKind[kind] = (stats.spendByKind[kind] || 0) + amount;
    }
    for (const [id, info] of Object.entries(state.flags)) {
      stats.flagCount[id] = (stats.flagCount[id] || 0) + 1;
      const src = stats.flagSources[id] || (stats.flagSources[id] = {});
      src[info.source] = (src[info.source] || 0) + 1;
    }
    for (const id of Object.keys(state.doneAnchors)) {
      stats.anchorFired[id] = (stats.anchorFired[id] || 0) + 1;
    }
    for (const [id, n] of Object.entries(report.stats.template)) {
      stats.templateFired[id] = (stats.templateFired[id] || 0) + n;
    }
  } catch (err) {
    stats.errors++;
    if (!stats.firstError) stats.firstError = err.stack;
  }
}

// ---------- 报告 ----------
function pct(n) {
  return (100 * n / Math.max(1, stats.runs)).toFixed(1) + '%';
}
function topSources(flagId, limit = 6) {
  const src = Object.entries(stats.flagSources[flagId] || {}).sort((a, b) => b[1] - a[1]);
  return src.slice(0, limit).map(([s, n]) => `${s}（${n}）`).join('；');
}

console.log('==== 无头模拟器 · 学前三年（月子+婴儿期+幼儿期） ====');
console.log(`局数: ${stats.runs} / ${RUNS}，异常: ${stats.errors}${stats.errors ? '\n首个异常:\n' + stats.firstError : ''}`);
if (stats.runs > 0) {
  console.log(`\n-- 平均值 -- 体重百分位: ${(stats.weightPSum / stats.runs).toFixed(0)}｜安全感: ${(stats.securitySum / stats.runs).toFixed(1)}｜期末存款: ¥${Math.round(stats.moneySum / stats.runs).toLocaleString()}｜未发芽延迟后果: ${(stats.pendingLeft / stats.runs).toFixed(2)}/局`);
  if (stats.endedBefore28 > 0) console.log(`⚠ 有 ${stats.endedBefore28} 局未到满月就结束`);

  console.log('\n-- flag 分布（收敛验证）--');
  for (const [id, n] of Object.entries(stats.flagCount).sort((a, b) => b[1] - a[1])) {
    console.log(`${id}: ${n} 局 (${pct(n)})${Object.keys(stats.flagSources[id] || {}).length > 1 ? '\n   来源: ' + topSources(id) : ''}`);
  }

  const neverFired = allAnchors.filter((id) => !stats.anchorFired[id]);
  console.log(`\n-- 锚点覆盖率: ${allAnchors.length - neverFired.length}/${allAnchors.length} --`);
  for (const [id, n] of Object.entries(stats.anchorFired).sort((a, b) => b[1] - a[1])) {
    console.log(`${id}: ${n} (${pct(n)})`);
  }
  // a_marriage_redline / a_debt 是"作死型玩法专属"：随机策略踩不到是设计预期，
  // 已用"专挑最伤感情选项"的机器人验证过可达性（红线 ~76%）
  const expectedRare = ['a_marriage_redline', 'a_debt'];
  const unexpected = neverFired.filter((id) => !expectedRare.includes(id));
  if (unexpected.length) console.log('⚠ 从未触发（非预期）: ' + unexpected.join(', '));

  console.log('\n-- 模板触发次数 --');
  for (const id of allTemplates) {
    console.log(`${id}: ${stats.templateFired[id] || 0} (均 ${( (stats.templateFired[id] || 0) / stats.runs).toFixed(1)}/局)`);
  }
  console.log(`疾病/后续事件: ${stats.illnessFired} (均 ${(stats.illnessFired / stats.runs).toFixed(2)}/局)`);

  console.log('\n-- 育儿账本（随机策略下均支出/局）--');
  const spendTotal = Object.values(stats.spendByKind).reduce((a, b) => a + b, 0);
  for (const [kind, amount] of Object.entries(stats.spendByKind).sort((a, b) => b[1] - a[1])) {
    console.log(`${GAME.CONFIG.SPEND_KINDS[kind] || kind}: ¥${Math.round(amount / stats.runs).toLocaleString()}`);
  }
  console.log(`合计: ¥${Math.round(spendTotal / stats.runs).toLocaleString()}/局`);
}
process.exit(stats.errors > 0 ? 1 : 0);
