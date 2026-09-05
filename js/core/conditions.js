// 条件系统：事件/选项的触发门槛。字段之间是 AND，anyOf 支持 OR。
// 设计要点：下游事件只读"状态"（flag + 属性阈值），不读路径——这是收敛的关键。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  function check(state, cond) {
    if (!cond) return true;
    // anyOf 只是 AND 链中的一员：任一子条件成立即可，但不能短路其它字段（如 day 窗口）
    if (cond.anyOf && !cond.anyOf.some((c) => check(state, c))) return false;

    const { family, child } = state;
    if (cond.day && (state.day < cond.day[0] || state.day > cond.day[1])) return false;
    if (cond.dayGte !== undefined && state.day < cond.dayGte) return false;
    if (cond.dayLte !== undefined && state.day > cond.dayLte) return false;

    if (cond.flagsAll && !cond.flagsAll.every((f) => state.flags[f])) return false;
    if (cond.flagsAny && !cond.flagsAny.some((f) => state.flags[f])) return false;
    if (cond.notFlags && cond.notFlags.some((f) => state.flags[f])) return false;

    if (cond.careModeIs !== undefined && family.careMode !== cond.careModeIs) return false;
    if (cond.careModeIn && !cond.careModeIn.includes(family.careMode)) return false;
    if (cond.feedingModeIs !== undefined && child.feedingMode !== cond.feedingModeIs) return false;
    if (cond.feedingModeIn && !cond.feedingModeIn.includes(child.feedingMode)) return false;
    if (cond.genderIs && child.gender !== cond.genderIs) return false;
    if (cond.perspectiveIs !== undefined && state.perspective !== cond.perspectiveIs) return false;

    if (cond.moneyGte !== undefined && family.money < cond.moneyGte) return false;
    if (cond.moneyLte !== undefined && family.money > cond.moneyLte) return false;
    if (cond.energyGte !== undefined && family.energy < cond.energyGte) return false;

    for (const [k, v] of Object.entries(cond.familyLte || {})) {
      if (family[k] > v) return false;
    }
    for (const [k, v] of Object.entries(cond.familyGte || {})) {
      if (family[k] < v) return false;
    }
    for (const [k, v] of Object.entries(cond.childLte || {})) {
      if (child[k] > v) return false;
    }
    for (const [k, v] of Object.entries(cond.childGte || {})) {
      if (child[k] < v) return false;
    }

    if (cond.weightPGte !== undefined && G.growth.weightPercentile(state) < cond.weightPGte) return false;
    if (cond.weightPLte !== undefined && G.growth.weightPercentile(state) > cond.weightPLte) return false;
    return true;
  }

  // 选项可用性：返回 null 表示可用，否则返回置灰原因文案
  function choiceBlockReason(state, choice) {
    if (!choice.conditions) return null;
    if (choice.conditions.moneyGte !== undefined && state.family.money < choice.conditions.moneyGte) {
      return '钱不够';
    }
    return check(state, choice.conditions) ? null : '条件不满足';
  }

  G.conditions = { check, choiceBlockReason };
})(GAME);
