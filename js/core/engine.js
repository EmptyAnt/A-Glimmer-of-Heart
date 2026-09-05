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

  // 本周消耗品开销：尿不湿/奶粉按档位（母乳=0，混合=半量）+ 托育/阿姨的照护开销
  function weeklyConsumableCost(state) {
    const diaperCfg = CONFIG.CONSUMABLES.diaper;
    const diaperTier = diaperCfg.tiers.find((t) => t.id === (state.consumables.diaper || diaperCfg.default));
    let cost = diaperTier.weekly;
    if (state.child.feedingMode === 'nai' || state.child.feedingMode === 'mix') {
      const formulaCfg = CONFIG.CONSUMABLES.formula;
      const formulaTier = formulaCfg.tiers.find((t) => t.id === (state.consumables.formula || formulaCfg.default));
      cost += state.child.feedingMode === 'mix' ? Math.round(formulaTier.weekly / 2) : formulaTier.weekly;
    }
    cost += CONFIG.CARE_WEEKLY_COST[state.family.careMode] || 0;
    return cost;
  }

  function settleConsumables(state, weeks) {
    const cost = weeklyConsumableCost(state) * weeks;
    const careCost = (CONFIG.CARE_WEEKLY_COST[state.family.careMode] || 0) * weeks;
    G.effects.apply(state, { money: -cost, spendKind: 'consumables' });
    if (careCost > 0) {
      G.effects.apply(state, { money: -careCost, spendKind: 'care' });
    }
    state.log.push({
      day: state.day,
      title: '',
      text: `近 ${weeks} 周固定开销：${util.fmtMoney(cost)}（尿不湿/奶粉按档位${careCost > 0 ? ` + 带娃开销 ${util.fmtMoney(careCost)}` : ''}）`,
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
      state.log.push({ day: state.day, title: '', text: `工资到账：${util.fmtMoney(state.family.monthlyIncome)}。` });
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

  // 满月结算：派生最终 flag（这是"收敛"在结尾的最后一次表演）
  function endGame(state) {
    const wp = G.growth.weightPercentile(state);
    if (wp >= 88 && !state.flags['小胖墩苗子']) {
      state.flags['小胖墩苗子'] = { day: state.day, source: '满月体重冲上 P88 以上' };
    }
    if (wp <= 12 && !state.flags['瘦小苗子']) {
      state.flags['瘦小苗子'] = { day: state.day, source: '满月体重仍在 P12 以下' };
    }
    if (state.child.security < 45 && !state.flags['安全感不足(早期)']) {
      state.flags['安全感不足(早期)'] = { day: state.day, source: '这二十八天里，很多次哭没有得到回应' };
    }

    const seeds = Object.entries(state.flags)
      .filter(([id]) => !id.includes('观察中') && !id.includes('土方')) // 过程性 flag 不进种子清单
      .map(([id, info]) => {
        const meta = G.FLAGS[id] || {};
        return {
          id,
          desc: meta.desc || '（未注册的 flag，未来章节里它也会生长）',
          preview: meta.preview || '',
          source: info.source,
          day: info.day,
        };
      });

    return {
      perspective: state.perspective,
      gender: state.child.gender,
      stage: state.stage,
      spend: state.stats.spend,
      weightP: Math.round(wp),
      lengthP: Math.round(G.growth.lengthPercentile(state)),
      weight: state.child.weight,
      length: state.child.length,
      constitution: CONFIG.CONSTITUTION_TIERS[state.child.constitution].name,
      temperament: CONFIG.TEMPERAMENTS.find((t) => t.id === state.child.temperament).name,
      temperamentHint: CONFIG.TEMPERAMENTS.find((t) => t.id === state.child.temperament).hint,
      family: { ...state.family },
      security: state.child.security,
      seeds,
      log: state.log,
      stats: {
        ...state.stats,
        templateTotal: Object.values(state.stats.template).reduce((a, b) => a + b, 0),
      },
      pendingLeft: state.pending.length,
    };
  }

  G.engine = { advanceDay, resolveEvent, finishDay, endGame, weeklyConsumableCost, stageOf, totalTicks };
})(GAME);
