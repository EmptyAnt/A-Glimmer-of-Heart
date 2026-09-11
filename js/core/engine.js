// 每日引擎：推进一天 = 生长结算 → 精力刷新 → 工资 → 延迟后果 → 疾病掷骰 → 事件调度。
// UI 与无头模拟器调用同一套 API，保证模拟结果即真实体验。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  const { CONFIG, util } = G;

  // 全局 tick → 所处阶段（day 是跨阶段的统一 tick 计数，各阶段粒度不同）
  function stageOf(day) {
    let start = 0;
    for (const st of CONFIG.STAGES) {
      if (st.ticks === undefined) break;
      if (day < start + st.ticks) return { ...st, startTick: start };
      start += st.ticks;
    }
    const playable = CONFIG.STAGES.filter((s) => s.ticks !== undefined);
    const last = playable[playable.length - 1];
    return { ...last, startTick: start - last.ticks };
  }

  function totalTicks() {
    return CONFIG.STAGES.reduce((sum, s) => sum + (s.ticks || 0), 0);
  }

  // 本周消耗品开销，按年龄换挡：尿不湿 3 岁停（如厕训练后）、奶粉 6 岁降为鲜奶+文具杂费。
  // 托育/阿姨的周费只在婴儿期收——幼儿园期由学费接管（见月度结算）。
  function weeklyConsumableCost(state) {
    const age = state.ageDays;
    let cost = 0;
    if (age <= 1095) {
      const diaperCfg = CONFIG.CONSUMABLES.diaper;
      const diaperTier = diaperCfg.tiers.find((t) => t.id === (state.consumables.diaper || diaperCfg.default));
      cost += diaperTier.weekly;
    }
    if (age <= 2190 && (state.child.feedingMode === 'nai' || state.child.feedingMode === 'mix')) {
      const formulaCfg = CONFIG.CONSUMABLES.formula;
      const formulaTier = formulaCfg.tiers.find((t) => t.id === (state.consumables.formula || formulaCfg.default));
      cost += state.child.feedingMode === 'mix' ? Math.round(formulaTier.weekly / 2) : formulaTier.weekly;
    }
    if (age > 2190) cost += 60; // 6岁后：鲜奶、文具与学习杂费
    if (G.engine.stageOf(state.day).id === 'infant') cost += CONFIG.CARE_WEEKLY_COST[state.family.careMode] || 0;
    return cost;
  }

  function settleConsumables(state, weeks) {
    const cost = weeklyConsumableCost(state) * weeks;
    G.effects.apply(state, { money: -cost, spendKind: 'consumables' });
    state.log.push({
      day: state.day,
      title: '',
      text: `近 ${weeks} 周固定开销：${util.fmtMoney(cost)}（尿不湿/奶粉按档位）`,
    });
  }

  function advanceDay(state) {
    state.day++;
    const stage = stageOf(state.day);
    if (stage.id !== state.stage) {
      state.stage = stage.id;
      state.log.push({ day: state.day, title: '新的一章', text: `—— ${stage.name}，开始了 ——`, hl: true });
    }

    const days = stage.dayWeight;
    state.ageDays += days;
    const growth = G.growth.applyGrowth(state, days);

    const careAdj = CONFIG.ENERGY_BY_CARE[state.family.careMode] || 0;
    state.family.energy = Math.max(1, stage.energy + careAdj);
    state.todayFamilyCount = {};
    state.hadNightcryToday = false;
    state.marriageHitToday = false;

    // 工资：月子期第14天发产假工资（六成），此后按真实月度周期发全薪
    if (state.day === 14) {
      const pay = Math.round(state.family.monthlyIncome * 0.6);
      state.family.money += pay;
      state.log.push({ day: state.day, title: '', text: `产假工资到账：${util.fmtMoney(pay)}（六成）。` });
    }
    const monthNow = Math.floor(state.ageDays / 30);
    if (state.day !== 14 && monthNow > state.lastSalaryMonth) {
      state.family.money += state.family.monthlyIncome;
      state.lastSalaryMonth = monthNow;
      // 幼儿园学费随月结算：择园 flag 决定档位；公办大班（入园第25个月起）免保教费
      let tuitionNote = '';
      if (state.stage === 'kindergarten') {
        const kgMonth = state.tuitionMonths = (state.tuitionMonths || 0) + 1;
        const isPublicFree = state.flags['幼儿园·公办'] && kgMonth > 24;
        const tierFlag = Object.keys(CONFIG.KG_TUITION).find((f) => state.flags[f]) || '幼儿园·公办';
        if (!isPublicFree) {
          const tuition = CONFIG.KG_TUITION[tierFlag];
          G.effects.apply(state, { money: -tuition, spendKind: 'education' });
          tuitionNote = `，幼儿园学费 -${util.fmtMoney(tuition)}`;
        } else if (kgMonth === 25) {
          state.log.push({ day: state.day, title: '', text: '大班开学：公办园保教费全免（2025年秋季学期起的政策）。省下的这笔钱，你给它想好了三个去处。' });
        }
      }
      state.log.push({ day: state.day, title: '', text: `工资到账：${util.fmtMoney(state.family.monthlyIncome)}${tuitionNote}。` });
    }

    // 固定开销追账式结算：跨月 tick（幼儿期一跳 30 天）也要把中间的每一周都补上
    const weeksElapsed = Math.floor((state.ageDays - state.lastSettleAge) / 7);
    if (weeksElapsed > 0) {
      settleConsumables(state, weeksElapsed);
      state.lastSettleAge += weeksElapsed * 7;
    }

    const injected = G.effects.processPending(state);
    const illness = G.illness.roll(state);
    if (illness) injected.push({ ...illness, uid: `illness#${state.day}` });

    state.dayQueue = G.events.selectDay(state, injected);
    return { day: state.day, growth, queue: state.dayQueue };
  }

  function resolveEvent(state, event, choice) {
    return G.events.resolveChoice(state, event, choice);
  }

  function finishDay(state) {
    const f = state.family;
    // 剩余精力=喘口气；透支=身体和关系记账；吵过架的当天不给感情回血
    if (f.energy >= 2) {
      f.mama = util.clamp(f.mama + 1, 0, 100);
      if (!state.marriageHitToday) f.marriage = util.clamp(f.marriage + 1, 0, 100);
    } else if (f.energy === 1) {
      f.mama = util.clamp(f.mama + 1, 0, 100);
    } else if (f.energy < 0) {
      f.mama = util.clamp(f.mama - 1, 0, 100);
      f.marriage = util.clamp(f.marriage - 1, 0, 100);
      if (f.energy <= -2) f.face = util.clamp(f.face - 1, 0, 100);
    }
    // 今天没有夜哭，连击衰减；太平日子修复安全感（高位于 75 封顶，留出下坠空间）
    if (!state.hadNightcryToday) {
      state.child.nightWakeStreak = Math.max(0, state.child.nightWakeStreak - 1);
      if (state.child.security <= 75) state.child.security = util.clamp(state.child.security + 1, 0, 100);
    }
    if (f.money < 0) {
      f.face = util.clamp(f.face - 1, 0, 100);
      if (!state.inDebt) state.log.push({ day: state.day, title: '', text: '存款见底了。这个月的账，还不知道怎么平。' });
    }
    state.inDebt = f.money < 0;
    if (state.day >= totalTicks() - 1) state.ended = true;
  }

  // 十八年终局：派生最终 flag + 生成孩子的信
  function endGame(state) {
    // 派生终态 flag（不在满月/某章设——到十八岁才"定型"）
    if (state.child.security < 45) {
      state.flags['安全感不足(早期)'] = { day: state.day, source: '很多次的哭，没有得到回应' };
    }

    const seeds = Object.entries(state.flags)
      .filter(([id]) => !id.includes('观察中') && !id.includes('土方'))
      .map(([id, info]) => {
        const meta = G.FLAGS[id] || {};
        return { id, desc: meta.desc || '', preview: meta.preview || '', source: info.source, day: info.day };
      });

    const letter = buildLetter(state);

    return {
      perspective: state.perspective,
      gender: state.child.gender,
      stage: state.stage,
      birth: { month: state.birthMonth, region: state.region },
      talent: CONFIG.TALENTS.find((t) => t.id === state.child.talent),
      spend: state.stats.spend,
      weightP: Math.round(G.growth.weightPercentile(state)),
      lengthP: Math.round(G.growth.lengthPercentile(state)),
      weight: state.child.weight,
      length: state.child.length,
      constitution: CONFIG.CONSTITUTION_TIERS[state.child.constitution].name,
      temperament: CONFIG.TEMPERAMENTS.find((t) => t.id === state.child.temperament).name,
      temperamentHint: CONFIG.TEMPERAMENTS.find((t) => t.id === state.child.temperament).hint,
      family: { ...state.family },
      security: state.child.security,
      letter,
      seeds,
      log: state.log,
      stats: {
        ...state.stats,
        templateTotal: Object.values(state.stats.template).reduce((a, b) => a + b, 0),
      },
      pendingLeft: state.pending.length,
    };
  }

  // ============================================================
  // 孩子的信：终局的灵魂——不用数字评分，用一封他写给你的信
  // ============================================================
  function buildLetter(state) {
    const f = state.flags;
    const sec = state.child.security;
    const talentName = CONFIG.TALENTS.find((t) => t.id === state.child.talent).name;
    const parent = state.perspective === 'mama' ? '妈' : '爸';
    const other = state.perspective === 'mama' ? '爸' : '妈';

    // 开头：按撒谎链终态决定称呼和第一句
    let opening;
    if (f['诚实被温柔对待'] && !f['谎言升级']) {
      opening = `${parent}：\n\n写这封信的时候，我在火车上。窗外的风景很快，像这十八年。\n\n我记得的事情，可能比你们以为的多。`;
    } else if (f['谎言升级']) {
      opening = `${parent}：\n\n这封信我写了很久。不是不知道写什么——是不知道该不该写给你看。\n\n因为你可能不知道：有些话，我练了很多年才学会怎么不说。`;
    } else {
      opening = `${parent}：\n\n到学校了。宿舍比想象的小，但窗户很大。\n\n有些话当面说不出，写下来好像容易一点。`;
    }

    // 中段1：安全感/被接住
    let body1;
    if (f['被接住']) {
      body1 = `我记得高三那个晚上。你说"跟妈/爸说说"，然后就只是听。\n那个晚上我没有变好——但我开始相信，有人会接住我。\n这件事我大概一辈子都不会忘记，也大概一辈子都说不出口。写在这里，算是说了。`;
    } else if (sec >= 60) {
      body1 = `小时候的事我记得不多，但我记得一种感觉：家里是安全的。\n不是没有争吵，是吵完了还在。这种感觉成了我的底色——走得再远，也不怕。`;
    } else if (f['心理危机']) {
      body1 = `高三那年，我说过一次"好累"。\n你说"谁不累"。\n你没有恶意，我知道。但那句话之后，我学会了所有的事自己扛。\n现在扛得动了——只是偶尔会想：如果那时候有人坐下来听，我是不是能更早学会哭。`;
    } else {
      body1 = `安全感这个东西，我说不清楚自己有多少。\n但每次放假回家，推开门闻到饭的味道，我觉得——嗯，这是我要回来的地方。`;
    }

    // 中段2：志愿/天赋
    let body2;
    if (f['为自己活']) {
      body2 = `志愿表上那个专业，是${state.perspective === 'mama' ? '你' : '你'}递笔给我、让我自己签的。\n你来送我那天，在站台上没怎么说话。但我看见你哭了——你以为我没回头，其实我回了。\n${talentName}这条路我会好好走。因为是我自己选的，所以怎么走都不算辜负。`;
    } else if (f['为你活']) {
      body2 = `专业是你选的，如你所愿。\n我会好好读完它——我答应过的。\n只是偶尔，走过那个专业的教室（画室/操场/机房）的时候，我会停一秒。\n就一秒。然后继续走。这不是抱怨——只是想让你知道：那一秒，是真的。`;
    } else {
      body2 = `大学的专业，不好也不坏——像大多数人的大多数选择。\n但我找到了一件课外的事，做得挺开心。${talentName}——你以前好像就说过，我在这个上面有点不一样。`;
    }

    // 中段3：婚姻/离异
    let body3;
    if (f['婚姻·离异']) {
      body3 = `关于你和${other}的事。\n我小时候以为你们不知道我知道。后来才明白：你们只是假装不知道我知道。\n我不怪你们。两个人走不下去，比一个人走更累。\n只是——高考那天你们都来了，隔着人群没有说话。我在考场里想了三分钟这件事，然后开始做题。\n那三秒钟的停顿，是我给你们的全部。以后会不会更多——看你们，也看我。`;
    } else if (state.family.marriage >= 60) {
      body3 = `你和${other}偶尔还是会吵。但吵完了，${other}会给你倒杯水，你会给${other}削个苹果。\n我从你们身上学到的最重要的事，不是不吵架——是吵完了还在。\n以后我如果喜欢上一个人，也照这个标准来。`;
    } else {
      body3 = `你和${other}，不好不坏。有时候我在想，你们是因为我才在一起的这么久，还是因为习惯了。\n这个问题没有答案，我也不需要答案。你们是你们，我是我。`;
    }

    // 结尾：按整体基调
    let closing;
    if (f['诚实被温柔对待'] && sec >= 55 && !f['心理危机']) {
      closing = `\n${parent}，谢谢你。\n不是谢谢你的钱（虽然确实花了很多），是谢谢你在我打翻牛奶的时候说"没关系"。\n那句话我用了十八年来验证——它是对的。\n\n放假我就回来。\n\n${state.child.name}\n写于开往大学的火车上`;
    } else if (f['谎言升级'] || f['心理危机']) {
      closing = `\n${parent}，这封信到这里。\n不是结尾——是逗号。我们还有很多年，可以慢慢学会怎么把话说出来。\n我正在学。希望你也是。\n\n放假的时候，我回来吃饭。\n\n${state.child.name}\n写于开往大学的火车上`;
    } else {
      closing = `\n${parent}，我到站了要。\n车快停了，就写到这。\n冰箱里有${other}做的菜，帮我热一下——我大概还有四十分钟到家。\n\n${state.child.name}\n写于开往大学的火车上`;
    }

    return { opening, body1, body2, body3, closing };
  }

  G.engine = { advanceDay, resolveEvent, finishDay, endGame, weeklyConsumableCost, stageOf, totalTicks };
})(GAME);
