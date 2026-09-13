// 事件系统：实例化（make 工厂 + 文案槽替换）、每日调度、选择结算。
// 调度规则：疾病/后续事件优先插队 → 主线锚点(每天最多1) → 侧线锚点(体检，最多1)
//          → 模板流水(1~2个，带冷却与权重)。队列上限 5，避免事件轰炸。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  const QUEUE_CAP = 5;

  // 文案槽替换：{child}/{ta}/{papa}/{mama}/{spouse}/{spouse_name}/{spouse_pron}/{parent}/{sibling}/{day}
  // {parent}=孩子对你的称呼（视角决定）、{sibling}=大宝对二宝的称呼（第一个孩子的性别决定）
  function resolveText(text, state) {
    if (typeof text !== 'string') return text;
    const pronoun = state.child.gender === 'boy' ? '他' : '她';
    const isMama = state.perspective === 'mama';
    const sibling = state.child.gender === 'boy' ? '哥哥' : '姐姐'; // 第一个孩子是男孩→二宝叫他哥哥
    return text
      .replace(/\{child\}/g, state.child.name)
      .replace(/\{ta\}/g, pronoun)
      .replace(/\{parent\}/g, isMama ? '妈' : '爸')
      .replace(/\{sibling\}/g, sibling)
      .replace(/\{papa\}/g, state.names.papa)
      .replace(/\{mama\}/g, state.names.mama)
      .replace(/\{spouse\}/g, isMama ? '老公' : '老婆')
      .replace(/\{spouse_name\}/g, isMama ? state.names.papa : state.names.mama)
      .replace(/\{spouse_pron\}/g, isMama ? '他' : '她')
      .replace(/\{day\}/g, String(state.day + 1));
  }

  // 条件文案变体：text 字段允许写成 [{when:{perspectiveIs:'mama'}, text}, {text}]
  // 从上到下取第一个 when 通过的；不带 when 的是兜底，放最后。
  function pickVariant(state, value) {
    if (!Array.isArray(value)) return value;
    for (const item of value) {
      if (!item.when || G.conditions.check(state, item.when)) return item.text;
    }
    return '';
  }

  // 把锚点定义实例化：make(state) 的返回值覆盖 text/choices
  function instantiate(def, state) {
    const event = {
      uid: `${def.id}#${state.day}`,
      defId: def.id,
      kind: def.kind || 'anchor',
      priority: def.priority || 'main',
      title: def.title,
      art: def.art,
      text: def.text,
      choices: def.choices,
    };
    if (def.make) {
      const merged = def.make(state);
      if (merged.title !== undefined) event.title = merged.title;
      if (merged.art !== undefined) event.art = merged.art;
      if (merged.text !== undefined) event.text = merged.text;
      if (merged.choices !== undefined) event.choices = merged.choices;
    }
    event.title = resolveText(pickVariant(state, event.title), state);
    event.text = resolveText(pickVariant(state, event.text), state);
    event.repeat = def.repeat || null;
    event.choices = (event.choices || []).map((choice) => {
      const result = pickVariant(state, choice.result);
      return {
        ...choice,
        text: resolveText(pickVariant(state, choice.text), state),
        result: typeof result === 'string' ? resolveText(result, state) : result,
      };
    });
    return event;
  }

  // later/eventId 引用解析：先查疾病后续池（可能是静态对象或 make 工厂），再查锚点/后续定义
  function resolveEventRef(id, state) {
    const fromIllness = G.illness.findFollowup(id);
    if (fromIllness) {
      const event = { ...fromIllness, uid: `${id}#${state.day}`, defId: id }; // defId 让触发率统计能覆盖到
      if (fromIllness.make) {
        const merged = fromIllness.make(state);
        delete event.make;
        Object.assign(event, merged); // make 产物覆盖 art/text/choices
      }
      return event;
    }
    const defs = G.ANCHORS.concat(G.ANCHOR_FOLLOWUPS);
    const def = defs.find((d) => d.id === id);
    return def ? instantiate(def, state) : null;
  }

  // repeat 字段的锚点（如"凌晨争吵"）可重复触发：距上次触发 ≥ repeat 天即重新入池。
  // 锚点带 stage 字段（默认 newborn）；day 窗口是阶段内序数（各阶段粒度不同）。
  function dueAnchors(state) {
    const stage = G.engine.stageOf(state.day);
    const stageTick = state.day - stage.startTick;
    const defs = G.ANCHORS.concat(G.ANCHOR_FOLLOWUPS);
    return defs.filter((def) => {
      if (def.kind === 'followup') return false;
      // stage: 'both' 表示所有可玩阶段通用（如负债线）；day 窗口按所在阶段内序数计算
      const defStage = def.stage || 'newborn';
      if (defStage !== 'both' && defStage !== stage.id) return false;
      const repeatReady = def.repeat && state.day - (state.repeatLast[def.id] ?? -99) >= def.repeat;
      if (state.doneAnchors[def.id] && !repeatReady) return false;
      return G.conditions.check(state, def.conditions)
        && stageTick >= def.day[0] && stageTick <= def.day[1];
    });
  }

  function pickTemplates(state) {
    const stage = G.engine.stageOf(state.day);
    const stageId = stage.id;
    const stageTick = state.day - stage.startTick;
    const eligible = G.TEMPLATES.filter((tpl) => {
      if (tpl.stage !== 'both' && (tpl.stage || 'newborn') !== stageId) return false;
      if (tpl.minDay !== undefined && stageTick < tpl.minDay) return false;
      if (!tpl.canTrigger(state)) return false;
      const shownToday = state.todayFamilyCount[tpl.id] || 0;
      if (shownToday >= tpl.perDayMax) return false;
      const last = state.lastShownDay[tpl.id];
      return last === undefined || state.day - last > tpl.cooldown;
    });
    if (eligible.length === 0) return [];

    const picked = [];
    const draw = () => {
      const pool = eligible.filter((tpl) => !picked.includes(tpl));
      if (pool.length === 0) return;
      const tpl = G.util.weighted(pool, pool.map((t) => t.weight));
      picked.push(tpl);
    };
    draw();
    if (G.util.chance(0.35)) draw();
    return picked.map((tpl) => ({
      ...tpl.make(state),
      uid: `${tpl.id}#${state.day}#${picked.indexOf(tpl)}`,
      familyId: tpl.id,
      kind: 'template',
    }));
  }

  function selectDay(state, injected) {
    const queue = [...injected];

    const due = dueAnchors(state);
    // 主线锚点按窗口截止日排序：窗口越紧的越优先出场，避免被宽窗口事件挤掉
    const mains = due
      .filter((d) => d.priority === 'main')
      .sort((a, b) => a.day[1] - b.day[1] || a.day[0] - b.day[0]);
    const sides = due.filter((d) => d.priority === 'side');
    for (const def of mains.slice(0, 1)) queue.push(instantiate(def, state));
    for (const def of sides.slice(0, 1)) queue.push(instantiate(def, state));
    queue.push(...pickTemplates(state));

    return queue.slice(0, QUEUE_CAP);
  }

  // 结算一次选择：应用效果、记录已见、写入时光相册
  function resolveChoice(state, event, choice) {
    G.effects.apply(state, choice.effects);

    if (event.defId) state.doneAnchors[event.defId] = true;
    if (event.defId && event.repeat) state.repeatLast[event.defId] = state.day;
    if (event.familyId) {
      state.lastShownDay[event.familyId] = state.day;
      state.todayFamilyCount[event.familyId] = (state.todayFamilyCount[event.familyId] || 0) + 1;
      state.stats.template[event.familyId] = (state.stats.template[event.familyId] || 0) + 1;
      if (event.familyId === 'tpl_nightcry') state.hadNightcryToday = true;
    }
    if (event.kind === 'illness' || event.kind === 'followup') {
      state.stats.illness += 1;
    } else if (event.kind === 'anchor') {
      state.stats.anchor += 1;
    }

    state.log.push({ day: state.day, title: event.title, text: choice.result || '' });
    return choice.result || '';
  }

  G.events = { instantiate, resolveEventRef, selectDay, resolveChoice, resolveText, dueAnchors };
})(GAME);
