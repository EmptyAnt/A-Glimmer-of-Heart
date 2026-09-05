// 模拟看板：在浏览器里直接跑无头模拟（与 test/smoke.js 同一套引擎）。
// 分批执行避免阻塞 UI，可中途停止。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  function playOne(presetId, perspective) {
    const state = G.state.createGame({
      presetId, perspective,
      papaName: '陈阳', mamaName: '林晚', nickname: '小汤圆',
    });
    while (!state.ended) {
      const { queue } = G.engine.advanceDay(state);
      for (const event of queue) {
        const usable = (event.choices || []).filter((c) => !G.conditions.choiceBlockReason(state, c));
        if (usable.length === 0) continue;
        G.engine.resolveEvent(state, event, G.util.pick(usable));
      }
      G.engine.finishDay(state);
    }
    return state;
  }

  /**
   * 分批跑模拟。
   * opts: { runs, onProgress(done, total), onDone(report), shouldStop() }
   */
  function runSimulation(opts) {
    const runs = opts.runs;
    const report = {
      runs: 0, errors: 0, firstError: null,
      anchorFired: {}, templateFired: {}, illnessFired: 0,
      flagCount: {}, flagSources: {},
      weightPSum: 0, securitySum: 0, spendByKind: {},
      allAnchorIds: G.ANCHORS.map((a) => a.id),
    };
    let i = 0;
    const BATCH = 25;

    function step() {
      const t0 = Date.now();
      while (i < runs && Date.now() - t0 < 60) { // 每批最多 60ms，保持界面可响应
        const idx = i;
        try {
          const state = playOne(
            G.CONFIG.PRESETS[idx % G.CONFIG.PRESETS.length].id,
            idx % 2 === 0 ? 'papa' : 'mama',
          );
          report.runs++;
          const final = G.engine.endGame(state);
          report.weightPSum += final.weightP;
          report.securitySum += final.security;
          report.illnessFired += final.stats.illness;
          for (const [id] of Object.entries(state.doneAnchors)) {
            report.anchorFired[id] = (report.anchorFired[id] || 0) + 1;
          }
          for (const [id, n] of Object.entries(final.stats.template)) {
            report.templateFired[id] = (report.templateFired[id] || 0) + n;
          }
          for (const [kind, amount] of Object.entries(state.stats.spend)) {
            report.spendByKind[kind] = (report.spendByKind[kind] || 0) + amount;
          }
          for (const [id, info] of Object.entries(state.flags)) {
            report.flagCount[id] = (report.flagCount[id] || 0) + 1;
            const src = report.flagSources[id] || (report.flagSources[id] = {});
            src[info.source] = (src[info.source] || 0) + 1;
          }
        } catch (err) {
          report.errors++;
          if (!report.firstError) report.firstError = err.stack;
        }
        i++;
      }
      opts.onProgress(Math.min(i, runs), runs);
      if (opts.shouldStop()) { report.stopped = true; opts.onDone(report); return; }
      if (i < runs) { setTimeout(step, 0); return; }
      opts.onDone(report);
    }
    setTimeout(step, 0);
  }

  G.editor = G.editor || {};
  G.editor.runSimulation = runSimulation;
})(GAME);
