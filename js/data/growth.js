// 生长系统：WHO 生长曲线的极简版（关键年龄锚点线性插值 + 分段日增率）。
// 月子章按天结算、婴儿章按周结算，统一走 applyGrowth(state, days)。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  const { clamp, randInt, rand } = G.util;

  // 关键年龄锚点（天）：出生~6岁 + 7~12岁（小学章）
  const AGE_ANCHORS = [0, 28, 90, 180, 270, 365, 540, 730, 1095, 1460, 1825, 2190, 2555, 2920, 3285, 3650, 4015, 4380, 4745, 5110, 5475];

  const WEIGHT_REF = {
    boy: {
      p3: [2.5, 3.4, 5.0, 6.4, 7.1, 7.7, 9.1, 10.2, 12.1, 13.7, 15.3, 17.2, 19.0, 21.2, 23.5, 26.0, 28.8, 31.8, 35.0, 40.5, 48.5],
      p50: [3.3, 4.5, 6.4, 7.9, 8.9, 9.6, 10.9, 12.2, 14.3, 16.3, 18.3, 20.5, 22.9, 25.3, 28.1, 31.2, 34.4, 37.8, 45.0, 50.8, 56.0],
      p97: [4.1, 5.6, 8.0, 9.7, 10.8, 11.5, 12.9, 14.5, 17.2, 19.4, 21.8, 24.4, 27.2, 30.3, 33.7, 37.5, 41.5, 45.7, 54.0, 60.5, 66.0],
    },
    girl: {
      p3: [2.4, 3.2, 4.6, 5.8, 6.5, 7.0, 8.4, 9.5, 11.4, 13.1, 14.8, 16.7, 18.6, 20.7, 23.0, 25.6, 28.6, 32.0, 36.0, 38.0, 39.5],
      p50: [3.2, 4.2, 5.8, 7.3, 8.2, 8.9, 10.2, 11.5, 13.9, 15.9, 17.9, 20.1, 22.4, 24.9, 27.7, 30.8, 34.3, 38.2, 43.5, 45.5, 47.0],
      p97: [4.0, 5.2, 7.3, 8.9, 9.9, 10.6, 12.3, 13.9, 16.9, 19.1, 21.5, 23.9, 26.6, 29.6, 32.9, 36.6, 40.8, 45.2, 51.5, 54.0, 56.5],
    },
  };
  const LENGTH_REF = {
    boy: {
      p3: [46.5, 51.0, 57.5, 63.0, 67.0, 70.5, 77.5, 82.1, 90.7, 96.7, 103.3, 109.1, 114.7, 120.2, 125.5, 130.7, 135.9, 141.2, 147.0, 152.5, 157.0],
      p50: [50.5, 54.5, 61.4, 67.8, 72.0, 75.7, 82.3, 87.1, 96.1, 103.3, 110.0, 116.1, 121.8, 127.4, 132.9, 138.4, 143.9, 149.5, 156.2, 163.9, 169.6],
      p97: [54.0, 58.0, 65.3, 71.5, 76.0, 79.5, 87.1, 92.3, 101.7, 109.9, 116.7, 123.1, 128.9, 134.6, 140.3, 146.1, 151.9, 157.7, 164.0, 171.0, 176.0],
    },
    girl: {
      p3: [46.0, 50.5, 56.5, 62.0, 65.8, 69.0, 76.0, 80.6, 89.4, 95.8, 102.3, 108.3, 113.8, 119.3, 124.8, 130.3, 136.0, 141.9, 147.0, 149.5, 151.0],
      p50: [49.8, 53.5, 59.9, 66.0, 70.1, 74.0, 80.7, 85.7, 95.1, 102.3, 109.1, 115.1, 120.7, 126.3, 131.9, 137.5, 143.3, 149.3, 153.5, 155.5, 156.5],
      p97: [53.0, 57.0, 64.0, 70.0, 74.5, 78.0, 85.7, 91.1, 100.7, 108.9, 116.0, 122.3, 128.2, 133.9, 139.6, 145.4, 151.4, 157.5, 161.5, 163.0, 164.0],
    },
  };

  // 喂养方式对应的基础日增重（克，1-6月内有效；加辅食后影响减弱）
  const GAIN_BY_FEEDING = { mu: 35, nai: 43, mix: 39 };

  function bracket(arr, age) {
    for (let i = 1; i < arr.length; i++) {
      if (age <= arr[i]) return [arr[i - 1], arr[i], i];
    }
    return [arr[arr.length - 2], arr[arr.length - 1], arr.length - 1];
  }

  // 三点参考值（P3/P50/P97）近似百分位，够原型用
  function percentileOf(value, p3, p50, p97) {
    if (value <= p3) return 2;
    if (value >= p97) return 98;
    if (value <= p50) return 3 + ((value - p3) / (p50 - p3)) * 47;
    return 50 + ((value - p50) / (p97 - p50)) * 47;
  }

  function refAt(refTable, gender, key, age) {
    const series = refTable[gender][key];
    const [a0, a1, i] = bracket(AGE_ANCHORS, age);
    const t = (age - a0) / Math.max(1, a1 - a0);
    return series[i - 1] + (series[i] - series[i - 1]) * t;
  }

  G.growth = {
    weightPercentile(state) {
      const age = clamp(state.ageDays, 0, 5475);
      return percentileOf(
        state.child.weight,
        refAt(WEIGHT_REF, state.child.gender, 'p3', age),
        refAt(WEIGHT_REF, state.child.gender, 'p50', age),
        refAt(WEIGHT_REF, state.child.gender, 'p97', age),
      );
    },
    lengthPercentile(state) {
      const age = clamp(state.ageDays, 0, 5475);
      return percentileOf(
        state.child.length,
        refAt(LENGTH_REF, state.child.gender, 'p3', age),
        refAt(LENGTH_REF, state.child.gender, 'p50', age),
        refAt(LENGTH_REF, state.child.gender, 'p97', age),
      );
    },

    // 推进 days 天的生长，返回变化摘要
    applyGrowth(state, days) {
      const c = state.child;
      const age = state.ageDays;
      const mod = G.CONFIG.CONSTITUTION_TIERS[c.constitution].growthMod;
      // 过度喂养的影响在辅食期前最明显（半岁后代谢摊平）
      const over = c.overfed > 0 && age <= 180 ? 4 : 0;

      // 分段日增重：生理性跌秤（出生体重 3-9%，取 ~5%，7-10 天恢复）→ 月内猛长 → 逐步放缓
      let dailyWeight;
      if (age <= 3) {
        // 前 3 天按出生体重百分比跌秤（累计约 5%，个体 ±20%）
        const dipPct = [0.02, 0.017, 0.013][age - 1] * rand(0.8, 1.2);
        dailyWeight = -Math.round(c.birthWeight * 1000 * dipPct);
      } else if (age <= 28) dailyWeight = 45 + mod + over + randInt(-5, 8);
      else if (age <= 90) dailyWeight = 26 + mod + over + randInt(-4, 6);
      else if (age <= 180) dailyWeight = 18 + Math.round(mod / 2) + over + randInt(-3, 5);
      else if (age <= 270) dailyWeight = 13 + randInt(-3, 4);
      else if (age <= 365) dailyWeight = 9 + randInt(-3, 4);
      else if (age <= 730) dailyWeight = 8 + randInt(-3, 4); // 1-2岁：稳步长
      else if (age <= 1095) dailyWeight = 6 + randInt(-3, 4); // 2-3岁
      else if (age <= 2190) dailyWeight = 5 + randInt(-3, 4); // 3-6岁：每年约2公斤
      else if (age <= 4380) dailyWeight = 8 + randInt(-4, 5); // 6-12岁：六年约增17公斤
      else dailyWeight = c.gender === 'boy' ? 16 + randInt(-5, 6) : 5 + randInt(-3, 4); // 青春期猛长：男孩三年约+16kg，女孩已放缓

      // 各段日速精确对标 WHO p50 增量（累计误差 <1cm）
      const dailyLen = age <= 28 ? 0.12 : age <= 90 ? 0.112 : age <= 180 ? 0.071 : age <= 270 ? 0.047
        : age <= 365 ? 0.039 : age <= 540 ? 0.038 : age <= 730 ? 0.026 : age <= 1095 ? 0.025
        : age <= 2190 ? 0.0183 : age <= 4380 ? 0.0153
        : (c.gender === 'boy' ? 0.0183 : 0.0065); // 青春期冲刺：男孩三年+20cm（13-14岁最猛），女孩+7cm基本定型

      const weightG = Math.round(dailyWeight * days);
      // 身高浮点直存不取整（round 会把 0.0153 进位成 0.02，多年累计虚增数十厘米），展示层才 toFixed
      const lengthCm = dailyLen * days;
      c.weight = Math.round((c.weight + weightG / 1000) * 1000) / 1000;
      c.length = c.length + lengthCm;
      return { weightG, lengthCm: Math.round(lengthCm * 10) / 10 };
    },
  };
})(GAME);
