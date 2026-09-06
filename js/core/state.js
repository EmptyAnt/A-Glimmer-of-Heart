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
    // 天赋六型：等权随机，全程隐藏，靠事件显形——将来教育分流的核心输入
    const talent = util.weighted(
      CONFIG.TALENTS.map((t) => t.id),
      CONFIG.TALENTS.map(() => 1),
    );
    // 出生月份与地域：季节系统的种子（黄疸有没有太阳、冬天穿太多之争谁占理）
    const birthMonth = util.randInt(1, 12);
    const region = util.chance(0.5) ? 'north' : 'south';

    // 出生体重：正态近似 + 8% 低体重；低体重会影响黄疸概率与初始体质观感
    let birthWeight = (gender === 'boy' ? 3.3 : 3.2) + (util.rand(-1, 1) * 0.45);
    if (util.chance(0.08)) birthWeight = util.rand(2.3, 2.5);
    birthWeight = Math.round(util.clamp(birthWeight, 2.3, 4.3) * 100) / 100;
    const birthLength = Math.round(((gender === 'boy' ? 50.5 : 49.8) + util.rand(-1.6, 1.6)) * 10) / 10;

    return { gender, constitution, temperament, talent, birthMonth, region, birthWeight, birthLength };
  }

  function createGame(opts) {
    const preset = CONFIG.PRESETS.find((p) => p.id === opts.presetId) || CONFIG.PRESETS[0];
    const birth = rollBirth();

    // 开局命运：可选或随机（月份/地域/父母生育年龄）
    const pickAge = () => {
      if (opts.parentAge && CONFIG.PARENT_AGES.some((a) => a.id === opts.parentAge)) return opts.parentAge;
      return util.weighted(
        CONFIG.PARENT_AGES.map((a) => a.id),
        [15, 45, 30, 10],
      );
    };
    const parentAge = pickAge();
    const ageMeta = CONFIG.PARENT_AGES.find((a) => a.id === parentAge);
    const ageRange = { young: [22, 26], prime: [27, 31], mature: [32, 36], late: [37, 42] }[parentAge];
    const parentAgeNum = util.randInt(ageRange[0], ageRange[1]);
    const birthMonth = Number.isInteger(opts.birthMonth) && opts.birthMonth >= 1 && opts.birthMonth <= 12
      ? opts.birthMonth : birth.birthMonth;
    const region = opts.region === 'north' || opts.region === 'south' ? opts.region : birth.region;
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
      birthMonth, // 出生月份（1-12）：季节系统的种子
      region, // 'north' | 'south'
      parentAge, // 生育年龄档
      parentAgeNum, // 具体年龄（文案用）
      names: { papa: opts.papaName, mama: opts.mamaName },
      family: {
        preset: preset.id,
        money: preset.money,
        monthlyIncome: Math.round(preset.monthlyIncome * ageMeta.incomeMul), // 年龄档收入系数
        energy: CONFIG.DAILY_ENERGY,
        marriage: 70,
        inLaw: 65,
        mama: util.clamp(72 + ageMeta.mamaStart, 0, 100), // 高龄档产后状态起点更低
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
        study: { habit: 50 }, // 学习习惯基线（小学章起被事件塑形）
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
