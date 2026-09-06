// 校验器：死链 / 不可达 / flag 拼写与注册 / 字段合法性 / make 工厂可执行性。
// 对含 make() 的动态事件，会用一组覆盖各阶段的 mock 状态实际执行实例化，
// 校验的就是真实运行时产物，而不是猜。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  const KNOWN_EFFECTS = [
    'money', 'energy', 'marriage', 'inLaw', 'mama', 'face', 'security',
    'nursingSkill', 'gasCount', 'visitorCount', 'overfed', 'nightWakeStreak',
    'weightG', 'lengthCm', 'careMode', 'feedingMode', 'childName',
    'monthlyIncomeMul', 'setConsumable', 'setFlags', 'unsetFlags', 'later', 'log', 'spendKind', 'income', 'habit',
  ];
  const KNOWN_CONDITIONS = [
    'anyOf', 'day', 'dayGte', 'dayLte', 'flagsAll', 'flagsAny', 'notFlags',
    'careModeIs', 'careModeIn', 'feedingModeIs', 'feedingModeIn',
    'genderIs', 'perspectiveIs', 'moneyGte', 'moneyLte', 'energyGte',
    'familyLte', 'familyGte', 'childLte', 'childGte', 'weightPGte', 'weightPLte',
  ];

  // 构造覆盖各阶段 × 各带娃模式 × 喂养方式的 mock 状态矩阵
  function mockStates() {
    const careModes = [null, 'center', 'yuesao', 'grandma', 'grandma2', 'daycare', 'nanny', 'stayhome', 'self'];
    const feedings = ['mu', 'nai', 'mix'];
    const states = [];
    for (const stage of G.CONFIG.STAGES.filter((s) => s.ticks !== undefined)) {
      for (const care of careModes) {
        const s = G.state.createGame({ presetId: 'zhongchan', perspective: 'papa', papaName: 'a', mamaName: 'b', nickname: 'c' });
        s.day = stage.startTick + Math.floor(stage.ticks / 2);
        s.family.careMode = care;
        s.child.feedingMode = feedings[states.length % feedings.length];
        s.family.money = 1000000; // 让 moneyGte 条件的选项都能生成
        states.push(s);
      }
    }
    return states;
  }

  // 汇总所有事件定义（锚点/后续/模板/疾病）
  function allDefs() {
    return [
      ...G.ANCHORS.map((d) => ({ pool: 'anchors', def: d })),
      ...G.ANCHOR_FOLLOWUPS.map((d) => ({ pool: 'followups', def: d })),
      ...G.TEMPLATES.map((t) => ({ pool: 'templates', def: t })),
      ...G.illness.list().map((d) => ({ pool: 'illness', def: d })),
      ...G.illness.followups().map((d) => ({ pool: 'illnessFollowups', def: d })),
    ];
  }

  // 取一个定义的 choices 集合：静态的直接用；动态的用 mock 状态执行 make
  function choiceSets(def, mocks) {
    if (Array.isArray(def.choices) && def.choices.length > 0) return [def.choices];
    if (!def.make) return [];
    const sets = [];
    for (const s of mocks) {
      try {
        const ev = def.make(s);
        if (ev && Array.isArray(ev.choices) && ev.choices.length > 0) sets.push(ev.choices);
      } catch (err) {
        // 由调用方统计 make 失败
      }
    }
    return sets;
  }

  function walkConditions(cond, visit) {
    if (!cond || typeof cond !== 'object') return;
    if (Array.isArray(cond.anyOf)) {
      for (const c of cond.anyOf) walkConditions(c, visit);
    }
    visit(cond);
  }

  function validate() {
    const issues = [];
    const flagIndex = {
      setBy: {}, unsetBy: {}, readBy: {}, registered: { ...G.FLAGS },
    };
    const report = (severity, pool, id, msg) => issues.push({ severity, pool, id, msg });
    const mocks = mockStates();
    const defs = allDefs();

    // ---- id 唯一性 ----
    const seen = new Map();
    for (const { pool, def } of defs) {
      if (!def.id) { report('error', pool, '(无名)', '缺少 id'); continue; }
      if (seen.has(def.id)) report('error', pool, def.id, `id 重复：与 ${seen.get(def.id)} 冲突`);
      else seen.set(def.id, pool);
    }

    const validEventIds = new Set(defs.map((d) => d.def.id));
    const careModesSettable = new Set([null]);
    const careModesRequired = [];

    // ---- 逐项检查 ----
    for (const { pool, def } of defs) {
      const loc = `${pool}/${def.id}`;

      // 阶段与窗口（'both' = 所有可玩阶段通用：模板/疾病/跨章节锚点）
      const stageId = def.stage || 'newborn';
      if (stageId !== 'both') {
        const stage = G.CONFIG.STAGES.find((s) => s.id === stageId);
        if (!stage) {
          report('error', pool, def.id, `未知阶段 stage: '${stageId}'`);
        } else if (stage.ticks === undefined) {
          report('warn', pool, def.id, `阶段 '${stageId}' 尚未开放（无 ticks），事件永远不会触发`);
        } else if (Array.isArray(def.day)) {
          const [d0, d1] = def.day;
          if (d0 > d1) report('error', pool, def.id, `day 窗口非法：[${d0}, ${d1}]`);
          if (d1 > stage.ticks - 1) report('warn', pool, def.id, `day 窗口上界 ${d1} 超出阶段长度（${stage.ticks} ${stage.unitLabel}）`);
          if ((def.priority || 'main') === 'main' && d1 - d0 < 2 && d1 > 2) {
            report('info', pool, def.id, `主线窗口仅 ${d1 - d0 + 1} 个 tick，调度拥挤时可能被同 deadline 锚点挤掉`);
          }
        }
      }

      if (def.make) {
        const ok = mocks.some((s) => { try { def.make(s); return true; } catch (e) { return false; } });
        if (!ok) report('error', pool, def.id, 'make(state) 在所有 mock 状态下都抛出异常');
      }
      if (pool === 'templates') {
        if (!def.make) report('warn', pool, def.id, '模板家族缺少 make 工厂');
        if (!def.canTrigger) report('warn', pool, def.id, '模板家族缺少 canTrigger 门槛');
        if (def.weight !== undefined && def.weight <= 0) report('warn', pool, def.id, `weight=${def.weight} 不会被抽中`);
      }

      // choices 明细
      const sets = choiceSets(def, mocks);
      if (sets.length === 0 && def.make) report('info', pool, def.id, 'make 产物未生成 choices（可能依赖罕见状态，静态覆盖不到）');
      for (const choices of sets) {
        for (const choice of choices) {
          if (!choice.text) report('error', pool, def.id, '存在缺少 text 的选项');
          if (!choice.result) report('info', pool, def.id, `选项"${(choice.text || '').slice(0, 12)}…"缺少 result 结果文案`);
          const fx = choice.effects || {};

          for (const key of Object.keys(fx)) {
            if (!KNOWN_EFFECTS.includes(key)) report('warn', pool, def.id, `effects 含未知字段 "${key}"（拼写错误？）`);
          }
          if (fx.careMode) careModesSettable.add(fx.careMode);
          if (fx.money !== undefined && choice.cost && choice.cost.money !== undefined) {
            if (typeof fx.money === 'number' && fx.money !== -choice.cost.money) {
              report('info', pool, def.id, `cost 显示 ¥${choice.cost.money} 但 effects.money=${fx.money}（动态定价属正常）`);
            }
          }

          for (const [flagId] of Object.entries(fx.setFlags || {})) {
            (flagIndex.setBy[flagId] || (flagIndex.setBy[flagId] = [])).push(loc);
          }
          for (const flagId of fx.unsetFlags || []) {
            (flagIndex.unsetBy[flagId] || (flagIndex.unsetBy[flagId] = [])).push(loc);
          }
          for (const later of fx.later || []) {
            if (later.eventId && !validEventIds.has(later.eventId)) {
              report('error', pool, def.id, `later 死链：eventId '${later.eventId}' 不存在于任何事件池`);
            }
          }
        }

        // conditions 明细
        const condRoots = [def.conditions, ...choices.map((c) => c.conditions)];
        for (const cond of condRoots) {
          walkConditions(cond, (c) => {
            for (const key of Object.keys(c)) {
              if (key !== 'anyOf' && !KNOWN_CONDITIONS.includes(key)) {
                report('warn', pool, def.id, `conditions 含未知字段 "${key}"（拼写错误？）`);
              }
            }
            for (const f of c.flagsAll || []) (flagIndex.readBy[f] || (flagIndex.readBy[f] = [])).push(loc);
            for (const f of c.flagsAny || []) (flagIndex.readBy[f] || (flagIndex.readBy[f] = [])).push(loc);
            if (c.careModeIs !== undefined) careModesRequired.push([c.careModeIs, loc]);
            for (const v of c.careModeIn || []) careModesRequired.push([v, loc]);
          });
        }
      }
    }

    // ---- flag 层面 ----
    for (const [flagId, locs] of Object.entries(flagIndex.readBy)) {
      if (!flagIndex.setBy[flagId]) {
        issues.push({ severity: 'error', pool: 'flags', id: flagId, msg: `被条件要求但从未被任何事件设置（不可达）：${locs.join(', ')}` });
      }
    }
    for (const flagId of [...Object.keys(flagIndex.setBy), ...Object.keys(flagIndex.unsetBy)]) {
      if (!G.FLAGS[flagId]) {
        issues.push({ severity: 'warn', pool: 'flags', id: flagId, msg: '未在 FLAGS 注册表登记（过程性 flag 可忽略；长线种子建议登记以获得发芽预告）' });
      }
    }

    // ---- careMode 可达性：条件要求的值必须能被某个事件设置 ----
    for (const [mode, loc] of careModesRequired) {
      if (!careModesSettable.has(mode)) {
        issues.push({ severity: 'error', pool: 'careMode', id: String(mode), msg: `被 ${loc} 要求，但没有任何事件会把 careMode 设为 '${mode}'（永不可达）` });
      }
    }

    const order = { error: 0, warn: 1, info: 2 };
    issues.sort((a, b) => order[a.severity] - order[b.severity]);
    // 去重（动态定价等会在多个 mock 状态下产生同源提示）：按 池+id+归一化消息
    const deduped = [];
    const seenKeys = new Set();
    for (const item of issues) {
      const key = `${item.severity}|${item.pool}|${item.id}|${item.msg.replace(/[-¥0-9.,]+/g, '#')}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      deduped.push(item);
    }
    return { issues: deduped, flagIndex };
  }

  G.editor = G.editor || {};
  G.editor.validate = validate;
})(GAME);
