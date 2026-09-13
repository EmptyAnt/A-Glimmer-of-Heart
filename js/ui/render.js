// 渲染层：纯 DOM 操作，按当前 state 重绘各面板与卡片。
// art block 是"组合式立绘"的占位实现：体态×表情×服装×场景，
// 换真图时只需把这里的占位块替换成拼图层。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  const { util, CONFIG } = G;

  const EXPR_EMOJI = {
    熟睡: '😴', 平静: '🙂', 大哭: '😭', 哭: '😭', 笑: '😂', 委屈: '🥺', 不适: '🤒',
    专注: '👀', 生气: '😤',
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function barClass(v) {
    return v >= 60 ? 'bar-good' : v >= 35 ? 'bar-mid' : 'bar-bad';
  }

  function barRow(parent, label, value) {
    parent.appendChild(el('div', 'stat-row', null)).append(
      el('span', null, label), el('span', null, String(Math.round(value))),
    );
    const bar = el('div', `bar ${barClass(value)}`);
    const fill = el('div');
    fill.style.width = `${Math.round(value)}%`;
    bar.appendChild(fill);
    parent.appendChild(bar);
  }

  function artBlock(art) {
    const box = el('div', 'art-block');
    box.appendChild(el('div', 'emoji', EXPR_EMOJI[art.expr] || '🙂'));
    box.appendChild(el('div', 'art-key', `体态·${art.pose}｜表情·${art.expr}\n服装·${art.outfit}｜场景·${art.scene}`));
    return box;
  }

  function careModeLabel(mode) {
    return {
      center: '月子中心', yuesao: '育儿嫂', grandma: '婆婆照顾', self: '自己扛',
    }[mode] || '待定';
  }

  function securityVibe(v) {
    if (v >= 60) return '最近很安定';
    if (v >= 45) return '还好';
    if (v >= 30) return '有点容易惊醒';
    return '总是不安';
  }

  function renderTopbar(container, state) {
    container.textContent = '';
    document.body.dataset.stage = state.stage; // 阶段主题色
    const stage = G.engine.stageOf(state.day);
    const tick = state.day - stage.startTick + 1;
    const row = el('div', 'topbar-row');
    row.append(
      el('h1', null, `${CONFIG.TITLE} · ${stage.name}`),
      el('span', 'sub', `第 ${tick} ${stage.unitLabel} / 共 ${stage.ticks} ${stage.unitLabel}`),
    );
    container.appendChild(row);
    const progress = el('div', 'progress');
    const fill = el('div');
    fill.style.width = `${Math.round(((state.day + 1) / G.engine.totalTicks()) * 100)}%`;
    progress.appendChild(fill);
    container.appendChild(progress);
  }

  function renderPanels(familyBox, childBox, state) {
    // 家庭面板
    familyBox.textContent = '';
    familyBox.appendChild(el('h3', null, `家庭（${CONFIG.PRESETS.find((p) => p.id === state.family.preset).name}）`));
    familyBox.appendChild(el('div', 'stat-row', null)).append(
      el('span', null, '存款'), el('span', null, util.fmtMoney(state.family.money)),
    );
    const careAdj = CONFIG.ENERGY_BY_CARE[state.family.careMode] || 0;
    const maxEnergy = Math.max(1, CONFIG.DAILY_ENERGY + careAdj);
    const energy = state.family.energy;
    const dots = energy >= 0
      ? '●'.repeat(Math.min(energy, maxEnergy)) + '○'.repeat(Math.max(0, maxEnergy - energy))
      : `○`.repeat(maxEnergy) + ` 透支 ${-energy}`;
    familyBox.appendChild(el('div', 'stat-row', null)).append(
      el('span', null, '今日精力'), el('span', 'energy-dots', dots),
    );
    barRow(familyBox, '夫妻感情', state.family.marriage);
    barRow(familyBox, '老人关系', state.family.inLaw);
    barRow(familyBox, state.perspective === 'mama' ? '我的状态（产后）' : '她的状态（产后）', state.family.mama);
    barRow(familyBox, '面子', state.family.face);
    familyBox.appendChild(el('div', 'stat-row', null)).append(
      el('span', null, '月子安排'), el('span', null, careModeLabel(state.family.careMode)),
    );

    // 孩子面板
    childBox.textContent = '';
    childBox.appendChild(el('h3', null, `孩子：${state.child.name}`));
    const gained = Math.round((state.child.weight - state.child.birthWeight) * 1000);
    childBox.appendChild(el('div', 'stat-row', null)).append(
      el('span', null, '体重'),
      el('span', null, `${state.child.weight}kg（${gained >= 0 ? '+' : ''}${gained}g）`),
    );
    childBox.appendChild(el('div', 'stat-row', null)).append(
      el('span', null, '身长'), el('span', null, `${state.child.length.toFixed(1)}cm`),
    );
    childBox.appendChild(el('div', 'stat-row', null)).append(
      el('span', null, '体重百分位'),
      el('span', null, util.fmtPct(G.growth.weightPercentile(state))),
    );
    childBox.appendChild(el('div', 'stat-row', null)).append(
      el('span', null, '安全感'),
      el('span', null, securityVibe(state.child.security)),
    );
    childBox.appendChild(el('div', 'stat-row', null)).append(
      el('span', null, '父母熟练度'),
      el('span', null, state.child.nursingSkill >= 3 ? '熟练工' : '新手'),
    );
    const chips = el('div', 'chips');
    chips.appendChild(el('span', 'chip', state.child.gender === 'girl' ? '女宝' : '男宝'));
    chips.appendChild(el('span', 'chip', `${state.birthMonth}月生 · ${state.region === 'north' ? '北方' : '南方'}`));
    const feeding = { mu: '母乳', nai: '奶粉', mix: '混合喂养' }[state.child.feedingMode];
    if (feeding) chips.appendChild(el('span', 'chip', feeding));
    for (const flagId of Object.keys(state.flags)) {
      if (flagId.includes('观察中')) chips.appendChild(el('span', 'chip', '观察中'));
    }
    childBox.appendChild(chips);
  }

  function renderEventCard(container, event, queuePos, queueLen, state, onChoose) {
    container.textContent = '';
    const card = el('div', 'event-card');
    card.appendChild(artBlock(event.art));
    card.appendChild(el('div', 'event-title', event.title));
    card.appendChild(el('div', 'event-text', event.text));
    const choices = el('div', 'choices');
    for (const choice of event.choices) {
      const btn = el('button', 'choice-btn');
      const label = el('span', null, choice.text);
      btn.appendChild(label);
      if (choice.cost) {
        const cost = [];
        if (choice.cost.money) cost.push(util.fmtMoney(-choice.cost.money));
        if (choice.cost.energy) cost.push(`精力-${choice.cost.energy}`);
        const costEl = el('span', 'cost', cost.join(' ｜ '));
        btn.appendChild(costEl);
      }
      const reason = G.conditions.choiceBlockReason(state, choice);
      if (reason) {
        btn.disabled = true;
        btn.appendChild(el('span', 'cost', reason));
      } else {
        btn.addEventListener('click', () => onChoose(choice));
      }
      choices.appendChild(btn);
    }
    card.appendChild(choices);
    container.appendChild(card);
    if (queueLen > 1) {
      container.appendChild(el('div', 'queue-dots', '●'.repeat(queuePos + 1) + '○'.repeat(queueLen - queuePos - 1)));
    }
  }

  function renderResultCard(container, event, resultText, onContinue) {
    container.textContent = '';
    const card = el('div', 'event-card');
    card.appendChild(el('div', 'event-title', event.title));
    card.appendChild(el('div', 'result-text', resultText));
    const btn = el('button', null, '继续');
    btn.addEventListener('click', onContinue);
    card.appendChild(btn);
    container.appendChild(card);
  }

  function renderCalmDay(container, onNext) {
    container.textContent = '';
    const card = el('div', 'event-card');
    const calm = el('div', 'day-calm');
    calm.appendChild(el('div', null, '今天暂时没有事发生。'));
    calm.appendChild(el('div', 'sub', '喂奶、换尿布、洗奶瓶，日子在指缝里流过去。'));
    card.appendChild(calm);
    const btn = el('button', 'next-day-btn', '进入下一天 →');
    btn.addEventListener('click', onNext);
    card.appendChild(btn);
    container.appendChild(card);
  }

  function renderLog(container, state) {
    container.textContent = '';
    const items = [...state.log].reverse();
    for (const item of items) {
      const row = el('div', item.hl ? 'log-item hl' : 'log-item');
      const dayLabel = (() => {
        const st = G.engine.stageOf(item.day);
        const tick = item.day - st.startTick + 1;
        return `${st.name.slice(0, 2)}·${tick}${st.unitLabel}`;
      })();
      row.appendChild(el('span', 'd', dayLabel));
      if (item.title) row.appendChild(el('span', 't', `【${item.title}】`));
      row.appendChild(el('span', null, item.text));
      container.appendChild(row);
    }
  }

  function renderDev(container, state) {
    container.textContent = '';
    const dev = {
      day: state.day,
      ageDays: state.ageDays,
      stage: state.stage,
      hidden: {
        体质: CONFIG.CONSTITUTION_TIERS[state.child.constitution].name,
        气质: CONFIG.TEMPERAMENTS.find((t) => t.id === state.child.temperament).name,
        安全感: state.child.security,
        夜醒连击: state.child.nightWakeStreak,
        过度喂养: state.child.overfed,
        探视累计: state.child.visitorCount,
        胀气累计: state.child.gasCount,
      },
      flags: state.flags,
      pending: state.pending.map((p) => ({ dueDay: p.dueDay, eventId: p.eventId, preview: p.preview })),
      stats: state.stats,
    };
    container.appendChild(el('pre', null, JSON.stringify(dev, null, 2)));
  }

  // ---------- 开局屏 ----------
  function renderStart(container, onStart) {
    container.textContent = '';
    const box = el('div', 'start-box');
    box.appendChild(el('h1', null, '寸 心'));
    box.appendChild(el('div', 'sub tagline', 'A Glimmer of Heart · 长忧九十九 —— 家长视角的育儿人生模拟'));

    const persLabel = el('div', null, '你要扮演——');
    persLabel.style.margin = '4px 0 8px';
    box.appendChild(persLabel);
    const persCards = el('div', 'preset-cards');
    let perspective = 'mama'; // 默认妈妈视角：这个题材的主力玩家
    const persEls = {};
    for (const p of CONFIG.PERSPECTIVES) {
      const card = el('div', 'preset-card');
      card.appendChild(el('div', null, p.name));
      card.appendChild(el('div', 'desc', p.desc));
      card.addEventListener('click', () => {
        perspective = p.id;
        for (const [id, node] of Object.entries(persEls)) {
          node.style.borderColor = id === perspective ? 'var(--accent)' : 'transparent';
        }
      });
      persEls[p.id] = card;
      persCards.appendChild(card);
    }
    persEls[perspective].style.borderColor = 'var(--accent)';
    box.appendChild(persCards);

    const form = el('div', 'name-form');
    form.style.margin = '20px 0';
    const inputs = {};
    for (const [key, label, def] of [['papaName', '爸爸', '陈阳'], ['mamaName', '妈妈', '林晚'], ['nickname', '孩子乳名', '小汤圆']]) {
      const input = document.createElement('input');
      input.placeholder = label;
      input.value = def;
      inputs[key] = input;
      form.appendChild(input);
    }
    box.appendChild(form);

    // 出生设定：留白给命运，或亲手掷骰
    const fateLabel = el('div', null, '出生设定（默认随机——也可以自己掷）');
    fateLabel.style.margin = '4px 0 8px';
    box.appendChild(fateLabel);
    const fateForm = el('div', 'name-form');
    fateForm.style.margin = '0 0 8px';
    const selects = {};
    const buildSelect = (key, label, options) => {
      const wrap = el('label', null, null);
      wrap.style.display = 'flex';
      wrap.style.flexDirection = 'column';
      wrap.style.fontSize = '12px';
      wrap.style.color = 'var(--ink-light)';
      const sel = document.createElement('select');
      sel.style.marginTop = '4px';
      sel.style.padding = '8px';
      sel.style.border = '1px solid var(--line)';
      sel.style.borderRadius = '8px';
      sel.style.background = 'var(--card)';
      sel.style.fontFamily = 'inherit';
      for (const [value, text] of options) {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = text;
        sel.appendChild(opt);
      }
      wrap.append(el('span', null, label), sel);
      selects[key] = sel;
      fateForm.appendChild(wrap);
    };
    buildSelect('birthMonth', '出生月份', [['', '随机（推荐）'], ...Array.from({ length: 12 }, (_, i) => [String(i + 1), `${i + 1} 月`])]);
    buildSelect('region', '地域', [['', '随机（推荐）'], ['north', '北方'], ['south', '南方']]);
    buildSelect('parentAge', '生育年龄', [
      ['', '随机（推荐）'],
      ...CONFIG.PARENT_AGES.map((a) => [a.id, `${a.name} —— ${a.desc}`]),
    ]);
    box.appendChild(fateForm);

    const cards = el('div', 'preset-cards');
    let selected = CONFIG.PRESETS[0].id;
    const cardEls = {};
    for (const preset of CONFIG.PRESETS) {
      const card = el('div', 'preset-card');
      card.appendChild(el('div', null, preset.name));
      card.appendChild(el('div', 'money', `${util.fmtMoney(preset.money)} 存款 · 月入 ${util.fmtMoney(preset.monthlyIncome)}`));
      card.appendChild(el('div', 'desc', preset.desc));
      card.addEventListener('click', () => {
        selected = preset.id;
        for (const [id, node] of Object.entries(cardEls)) {
          node.style.borderColor = id === selected ? 'var(--accent)' : 'transparent';
        }
      });
      cardEls[preset.id] = card;
      cards.appendChild(card);
    }
    cardEls[selected].style.borderColor = 'var(--accent)';
    box.appendChild(cards);

    const btn = el('button', null, '开始这一家的人生');
    btn.style.marginTop = '28px';
    btn.addEventListener('click', () => onStart({
      presetId: selected,
      perspective,
      birthMonth: selects.birthMonth.value ? Number(selects.birthMonth.value) : undefined,
      region: selects.region.value || undefined,
      parentAge: selects.parentAge.value || undefined,
      papaName: inputs.papaName.value.trim() || '陈阳',
      mamaName: inputs.mamaName.value.trim() || '林晚',
      nickname: inputs.nickname.value.trim() || '小汤圆',
    }));
    box.appendChild(btn);

    const editorLink = el('a', 'sub', '⚙ 事件编辑器（开发者工具）');
    editorLink.href = 'editor.html';
    editorLink.style.display = 'block';
    editorLink.style.marginTop = '16px';
    box.appendChild(editorLink);
    container.appendChild(box);
  }

  // ---------- 出生报告屏 ----------
  function renderBirth(container, state, onBegin) {
    container.textContent = '';
    const box = el('div', 'birth-box');
    box.appendChild(el('h1', null, '出生报告'));
    const child = state.child;
    const card = el('div', 'birth-card');
    const genderText = child.gender === 'boy' ? '是个儿子' : '是个女儿';
    const SEASON_FLAVOR = {
      winter: '窗外正是最冷的时候。他人生第一个月，将在暖气房里度过。',
      spring: '窗外的玉兰开了。他人生第一个月，有整个春天作背景。',
      summer: '蝉声正盛。他人生第一个月，空调和痱子粉将并肩作战。',
      autumn: '秋高气爽。他人生第一个月，将从一件薄抱被开始。',
    };
    card.appendChild(el('h2', null, `${state.names.papa} & ${state.names.mama}：${genderText}。`));
    card.appendChild(el('div', 'sub', `她生他时 ${state.parentAgeNum} 岁。${state.birthMonth} 月 · ${state.region === 'north' ? '北方' : '南方'}出生。${SEASON_FLAVOR[G.util.seasonOf({ birthMonth: state.birthMonth, ageDays: 0 })]}`));
    if (state.parentAge === 'late') {
      card.appendChild(el('div', 'sub', '（高龄产妇：产检档案比人厚，无创、糖耐、胎监，每一项都是选择题。好在——你都答完了。）'));
    }
    const stats = el('div', 'birth-stats');
    for (const [label, value] of [['出生体重', `${child.birthWeight} kg`], ['出生身长', `${child.birthLength} cm`], ['体重百分位', util.fmtPct(G.growth.weightPercentile({ ...state, ageDays: 0, child: { ...child, weight: child.birthWeight, length: child.birthLength } }))]]) {
      const col = el('div');
      col.appendChild(el('span', 'sub', label));
      col.appendChild(el('b', null, value));
      stats.appendChild(col);
    }
    card.appendChild(stats);
    const tier = CONFIG.CONSTITUTION_TIERS[child.constitution];
    const temper = CONFIG.TEMPERAMENTS.find((t) => t.id === child.temperament);
    card.appendChild(el('div', null, `${tier.hint}`));
    card.appendChild(el('div', 'sub', `${temper.hint}——此刻没人知道这意味着什么。`));
    card.appendChild(el('div', 'sub', '（体质与气质由系统随机决定，无法选择。往后的日子里，它们会自己显形。）'));
    box.appendChild(card);
    const btn = el('button', null, '回到产房，开始第一天');
    btn.addEventListener('click', onBegin);
    box.appendChild(btn);
    container.appendChild(box);
  }

  // ---------- 结算屏 ----------
  function renderEnd(container, report, onRestart) {
    container.textContent = '';
    const box = el('div', 'end-box');
    box.appendChild(el('h1', null, '又一个轮回'));
    box.appendChild(el('div', 'sub center', '—— 从呱呱坠地，到你也抱起了那个小东西 ——'));

    // ======== 一生回顾时间线 ========
    if (report.timeline) {
      const tl = el('div', 'end-section');
      tl.appendChild(el('h2', null, '这一生'));
      for (const item of report.timeline) {
        const row = el('div', 'timeline-item');
        row.appendChild(el('span', 'tl-icon', item.icon));
        const body = el('div', 'tl-body');
        body.appendChild(el('div', 'tl-stage', item.stage));
        body.appendChild(el('div', 'tl-text', item.text));
        row.appendChild(body);
        tl.appendChild(row);
      }
      box.appendChild(tl);
    }

    // ======== 灵魂：孩子的信 ========
    if (report.letter) {
      const letterBox = el('div', 'letter-box');
      const L = report.letter;
      const full = [L.opening, '', L.body1, '', L.body2, '', L.body3, '', L.closing].join('\n');
      const pre = el('pre', 'letter-text');
      pre.textContent = full;
      letterBox.appendChild(pre);
      box.appendChild(letterBox);
    }

    // ======== 数据报告 ========
    const body = el('div', 'end-section');
    body.appendChild(el('h2', null, '他的档案'));
    body.appendChild(el('div', null, `天赋「${report.talent ? report.talent.name : '—'}」｜气质「${report.temperament}」｜体质「${report.constitution}」`));
    body.appendChild(el('div', null, `身高 ${report.length.toFixed(1)}cm（${util.fmtPct(report.lengthP)}）｜体重 ${report.weight}kg（${util.fmtPct(report.weightP)}）`));
    body.appendChild(el('div', null, `出生：${report.birth.month}月 · ${report.birth.region === 'north' ? '北方' : '南方'}｜安全感 ${Math.round(report.security)}`));
    box.appendChild(body);

    const fam = el('div', 'end-section');
    fam.appendChild(el('h2', null, '这一家'));
    fam.appendChild(el('div', null, `存款 ${util.fmtMoney(report.family.money)}｜夫妻感情 ${Math.round(report.family.marriage)}｜面子 ${Math.round(report.family.face)}`));
    box.appendChild(fam);

    const ledger = el('div', 'end-section');
    ledger.appendChild(el('h2', null, `育儿账本 · 十八年`));
    const spendEntries = Object.entries(report.spend || {}).sort((a, b) => b[1] - a[1]);
    for (const [kind, amount] of spendEntries.slice(0, 5)) {
      ledger.appendChild(el('div', null, `${CONFIG.SPEND_KINDS[kind] || kind}：${util.fmtMoney(amount)}`));
    }
    const spendTotal = spendEntries.reduce((sum, [, v]) => sum + v, 0);
    if (spendTotal > 0) ledger.appendChild(el('div', null, `合计：${util.fmtMoney(spendTotal)}`));
    box.appendChild(ledger);

    const seeds = el('div', 'end-section');
    seeds.appendChild(el('h2', null, `种下的种子（${report.seeds.length}）`));
    seeds.appendChild(el('div', 'sub', '每一颗种子都是你们一起选的。'));
    for (const seed of report.seeds.slice(0, 12)) {
      const item = el('div', 'seed-item');
      item.appendChild(el('div', 'seed-name', `◆ ${seed.id}`));
      item.appendChild(el('div', 'seed-src', `${seed.source}`));
      if (seed.preview) item.appendChild(el('div', 'seed-preview', seed.preview));
      seeds.appendChild(item);
    }
    if (report.seeds.length > 12) seeds.appendChild(el('div', 'sub', `……还有 ${report.seeds.length - 12} 颗种子`));
    box.appendChild(seeds);

    const album = el('div', 'end-section');
    album.appendChild(el('h2', null, '时光相册'));
    for (const item of report.log.filter((l) => l.hl)) {
      const row = el('div', 'log-item hl');
      row.appendChild(el('span', null, item.text));
      album.appendChild(row);
    }
    box.appendChild(album);

    const stats = el('div', 'end-section');
    stats.appendChild(el('h2', null, '运行数据'));
    const statRow = el('div', 'end-stats');
    const statDefs = [
      [report.stats.anchor, '锚点'],
      [report.stats.templateTotal, '流水事件'],
      [report.stats.illness, '疾病'],
    ];
    for (const [num, label] of statDefs) {
      const cell = el('div');
      cell.appendChild(el('b', null, String(num)));
      cell.appendChild(el('span', null, label));
      statRow.appendChild(cell);
    }
    stats.appendChild(statRow);
    box.appendChild(stats);

    const btn = el('button', null, '再来一局（命运重掷）');
    btn.addEventListener('click', onRestart);
    box.appendChild(btn);
    container.appendChild(box);
  }

  G.ui = {
    renderTopbar, renderPanels, renderEventCard, renderResultCard,
    renderCalmDay, renderLog, renderDev, renderStart, renderBirth, renderEnd,
  };
})(GAME);
