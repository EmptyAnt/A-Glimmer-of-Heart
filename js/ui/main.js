// 主流程：屏幕切换与每日循环。
// 一天的流程：进入下一天 → 事件队列逐张弹出 → 队列清空 → finishDay → 平静夜/结算。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  const $ = (id) => document.getElementById(id);
  let state = null;

  function show(screenId) {
    for (const sec of document.querySelectorAll('.screen')) {
      sec.classList.add('hidden');
    }
    $(screenId).classList.remove('hidden');
  }

  function refreshPanels() {
    G.ui.renderTopbar($('topbar'), state);
    G.ui.renderPanels($('panel-family'), $('panel-child'), state);
    G.ui.renderLog($('tab-log'), state);
    G.ui.renderDev($('tab-dev'), state);
  }

  function startGame(opts) {
    state = G.state.createGame(opts);
    document.body.dataset.stage = state.stage; // 阶段主题色
    G.ui.renderBirth($('screen-birth'), state, () => {
      show('screen-game');
      nextDay();
    });
    show('screen-birth');
  }

  function nextDay() {
    const { queue } = G.engine.advanceDay(state);
    refreshPanels();
    state.dayQueue = queue;
    if (queue.length === 0) {
      dayComplete();
    } else {
      showEvent(0);
    }
  }

  function showEvent(index) {
    const event = state.dayQueue[index];
    G.ui.renderEventCard($('event-area'), event, index, state.dayQueue.length, state, (choice) => {
      G.engine.resolveEvent(state, event, choice);
      refreshPanels();
      G.ui.renderResultCard($('event-area'), event, choice.result || '', () => {
        if (index + 1 < state.dayQueue.length) {
          showEvent(index + 1);
        } else {
          dayComplete();
        }
      });
    });
  }

  function dayComplete() {
    G.engine.finishDay(state);
    refreshPanels();
    if (state.ended) {
      const report = G.engine.endGame(state);
      G.ui.renderEnd($('screen-end'), report, () => location.reload());
      show('screen-end');
      return;
    }
    G.ui.renderCalmDay($('event-area'), nextDay);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.body.dataset.stage = 'newborn';
    G.ui.renderStart($('screen-start'), startGame);
    show('screen-start');

    for (const btn of document.querySelectorAll('.tab-btn')) {
      btn.addEventListener('click', () => {
        for (const b of document.querySelectorAll('.tab-btn')) b.classList.remove('active');
        btn.classList.add('active');
        $('tab-log').classList.toggle('hidden', btn.dataset.tab !== 'log');
        $('tab-dev').classList.toggle('hidden', btn.dataset.tab !== 'dev');
      });
    }
  });
})(GAME);
