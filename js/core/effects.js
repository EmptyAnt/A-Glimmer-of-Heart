// 效果系统：所有数值变动、flag 设置、延迟后果统一从这里进出。
// later 是延迟后果机制：{afterDays, chance?, effects?, eventId?, withFlags?, preview?}
// 到期掷骰，通过则应用 effects / 注入 eventId 指向的后续事件。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  const { clamp } = G.util;

  const FAMILY_BARS = ['marriage', 'inLaw', 'mama', 'face'];
  const CHILD_COUNTERS = ['nursingSkill', 'gasCount', 'visitorCount', 'overfed'];

  function apply(state, effects) {
    if (!effects) return;
    const f = state.family;
    const c = state.child;

    if (effects.money) {
      f.money += effects.money;
      // 负数支出按 effects.spendKind 记入育儿账本（默认"其他"）
      if (effects.money < 0) {
        const kind = effects.spendKind || 'other';
        state.stats.spend[kind] = (state.stats.spend[kind] || 0) + (-effects.money);
      }
    }
    // income：与 money 分离的进账（礼金等），不进支出账本
    if (effects.income) f.money += effects.income;
    if (effects.energy) f.energy += effects.energy; // 允许透支为负，finishDay 结算代价
    for (const key of FAMILY_BARS) {
      if (effects[key]) {
        f[key] = clamp(f[key] + effects[key], 0, 100);
        // 吵过架的日子，当晚不该再享受"喘口气"式的关系回血
        if (key === 'marriage' && effects[key] < 0) state.marriageHitToday = true;
      }
    }
    if (effects.security) c.security = clamp(c.security + effects.security, 0, 100);
    for (const key of CHILD_COUNTERS) {
      if (effects[key]) c[key] = Math.max(0, c[key] + effects[key]);
    }
    if (effects.nightWakeStreak) c.nightWakeStreak = Math.max(0, c.nightWakeStreak + effects.nightWakeStreak);
    if (effects.habit) c.study.habit = clamp(c.study.habit + effects.habit, 0, 100);
    if (effects.weightG) c.weight = Math.round((c.weight + effects.weightG / 1000) * 1000) / 1000;
    if (effects.lengthCm) c.length = Math.round((c.length + effects.lengthCm) * 10) / 10;

    if (effects.careMode) f.careMode = effects.careMode;
    if (effects.feedingMode) c.feedingMode = effects.feedingMode;
    if (effects.childName) c.name = effects.childName;
    // 家庭收入倍率（如全职妈妈后单收入）
    if (effects.monthlyIncomeMul) f.monthlyIncome = Math.round(f.monthlyIncome * effects.monthlyIncomeMul);
    if (effects.setConsumable) Object.assign(state.consumables, effects.setConsumable);

    if (effects.setFlags) {
      for (const [flagId, source] of Object.entries(effects.setFlags)) {
        // 先入为主：flag 已存在时保留最早的来源（收敛点记录"最初怎么来的"）
        if (!state.flags[flagId]) state.flags[flagId] = { day: state.day, source };
      }
    }
    if (effects.unsetFlags) {
      for (const flagId of effects.unsetFlags) delete state.flags[flagId];
    }
    if (effects.later) {
      for (const later of effects.later) {
        state.pending.push({ ...later, dueDay: state.day + later.afterDays });
      }
    }
    if (effects.log) {
      state.log.push({ day: state.day, title: '', text: effects.log.text, hl: true });
    }
  }

  // 每天推进时结算到期的延迟后果，返回需要注入的后续事件
  function processPending(state) {
    const events = [];
    const kept = [];
    for (const pending of state.pending) {
      if (state.day < pending.dueDay) {
        kept.push(pending);
        continue;
      }
      if (pending.chance !== undefined && !G.util.chance(pending.chance)) continue; // 没触发，移除
      if (pending.withFlags) apply(state, { setFlags: pending.withFlags });
      if (pending.effects) apply(state, pending.effects);
      if (pending.eventId) {
        const event = G.events.resolveEventRef(pending.eventId, state);
        if (event) events.push(event);
      }
    }
    state.pending = kept;
    return events;
  }

  G.effects = { apply, processPending };
})(GAME);
