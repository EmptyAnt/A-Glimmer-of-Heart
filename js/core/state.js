// 游戏状态：创建一局 = roll 一次"命运"。
// 体质/气质/出生体重都是系统随机且对玩家隐藏——不可选难度，这就是人生。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  const { util, CONFIG } = G;

  function rollBirth() {
    const gender = util.chance(0.5) ? 'boy' : 'girl';
    const constitution = util.weighted(
      CONFIG.CONSTITUTION_TIERS.map((_, i) => i),
      CONFIG.CONSTITUTION_WEIGHTS,
    );
    const temperament = util.weighted(
      CONFIG.TEMPERAMENTS.map((t) => t.id),
      CONFIG.TEMPERAMENTS.map((t) => t.weight),
    );

    // 出生体重：正态近似 + 8% 低体重；低体重会影响黄疸概率与初始体质观感
    let birthWeight = (gender === 'boy' ? 3.3 : 3.2) + (util.rand(-1, 1) * 0.45);
    if (util.chance(0.08)) birthWeight = util.rand(2.3, 2.5);
    birthWeight = Math.round(util.clamp(birthWeight, 2.3, 4.3) * 100) / 100;
    const birthLength = Math.round(((gender === 'boy' ? 50.5 : 49.8) + util.rand(-1.6, 1.6)) * 10) / 10;

    return { gender, constitution, temperament, birthWeight, birthLength };
  }

  function createGame(opts) {
    const preset = CONFIG.PRESETS.find((p) => p.id === opts.presetId) || CONFIG.PRESETS[0];
    const birth = rollBirth();
    const perspective = CONFIG.PERSPECTIVES.some((p) => p.id === opts.perspective)
      ? opts.perspective
      : 'mama';

    const state = {
      day: -1, // 全局 tick：月子 0-27（按天），婴儿期 28-75（按周）
      ageDays: 0, // 真实年龄（天）：生长曲线、月度工资、周结算都看它
      lastSalaryMonth: 0,
      ended: false,
      stage: 'newborn', // 人生阶段：驱动界面主题色切换
      perspective,
      names: { papa: opts.papaName, mama: opts.mamaName },
      family: {
        preset: preset.id,
        money: preset.money,
        monthlyIncome: preset.monthlyIncome,
        energy: CONFIG.DAILY_ENERGY,
        marriage: 70,
        inLaw: 65,
        mama: 72,
        face: 50,
        careMode: null,
      },
      child: {
        name: opts.nickname,
        ...birth,
        weight: birth.birthWeight,
        length: birth.birthLength,
        feedingMode: null,
        security: 50,
        nursingSkill: 0,
        gasCount: 0,
        visitorCount: 0,
        overfed: 0,
        nightWakeStreak: 0,
      },
      flags: {},
      pending: [],
      log: [],
      consumables: { diaper: null, formula: null }, // 档位选择：null=未定（按默认档计费）
      lastSettleAge: 0, // 消耗品上次结算到的年龄（天），追账式结算的游标
      inDebt: false, // 负债日志只在新陷入时记一次
      doneAnchors: {},
      repeatLast: {},
      todayFamilyCount: {},
      lastShownDay: {},
      hadNightcryToday: false,
      dayQueue: [],
      stats: { anchor: 0, illness: 0, template: {}, spend: {} },
    };

    // 出生即 0 天龄
    state.ageDays = 0;
    state.log.push({
      day: 0,
      title: '出生',
      text: `${state.names.papa}和${state.names.mama}的孩子「${state.child.name}」出生了。${birth.birthWeight < 2.5 ? '体重只有 ' + birth.birthWeight + 'kg，一出生就被送进了观察室。' : '体重 ' + birth.birthWeight + 'kg，哭声嘹亮。'}`,
      hl: true,
    });
    return state;
  }

  G.state = { createGame };
})(GAME);
