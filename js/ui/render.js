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
      row.appendChild(el('span', 'd', `第${item.day + 1}天`));
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
    box.appendChild(el('h1', null, '十五岁了'));
    box.appendChild(el('div', 'sub center', '—— 从呱呱坠地，到中考放榜 ——'));

    const body = el('div', 'end-section');
    body.appendChild(el('h2', null, '满月体检报告'));
    body.appendChild(el('div', null, `体重 ${report.weight}kg（${util.fmtPct(report.weightP)}）｜身长 ${report.length.toFixed(1)}cm（${util.fmtPct(report.lengthP)}）`));
    body.appendChild(el('div', null, `这个月你大概也猜到了：这是个「${report.constitution}」的孩子。`));
    if (report.talent) {
      body.appendChild(el('div', null, `他的天赋是「${report.talent.name}」——${report.talent.hint}。`));
      body.appendChild(el('div', 'sub', '天赋没有好坏，只有赛道。它将在小学的兴趣、初中的分流、高考的志愿里，一次次被兑现。'));
    }
    body.appendChild(el('div', null, `而他的气质是「${report.temperament}」——${report.temperamentHint}`));
    box.appendChild(body);

    const fam = el('div', 'end-section');
    fam.appendChild(el('h2', null, '这一家的近况'));
    fam.appendChild(el('div', null, `存款：${util.fmtMoney(report.family.money)}`));
    fam.appendChild(el('div', null, `夫妻感情 ${Math.round(report.family.marriage)} ／ 老人关系 ${Math.round(report.family.inLaw)} ／ ${report.perspective === 'mama' ? '我的状态' : '她的状态'} ${Math.round(report.family.mama)} ／ 面子 ${Math.round(report.family.face)}`));
    fam.appendChild(el('div', 'sub', `孩子安全感：${securityVibe(report.security)}（${Math.round(report.security)}）`));
    box.appendChild(fam);

    // 育儿账本：按消费分类汇总这二十八天的支出
    const ledger = el('div', 'end-section');
    ledger.appendChild(el('h2', null, '育儿账本 · 这二十八天'));
    const spendEntries = Object.entries(report.spend || {}).sort((a, b) => b[1] - a[1]);
    if (spendEntries.length === 0) {
      ledger.appendChild(el('div', 'sub', '一分钱没花？这二十八天过得也太顺了。'));
    }
    for (const [kind, amount] of spendEntries) {
      ledger.appendChild(el('div', null, `${CONFIG.SPEND_KINDS[kind] || kind}：${util.fmtMoney(amount)}`));
    }
    const spendTotal = spendEntries.reduce((sum, [, v]) => sum + v, 0);
    if (spendTotal > 0) ledger.appendChild(el('div', null, `合计：${util.fmtMoney(spendTotal)}`));
    if (report.gender === 'girl' && (report.spend.clothes || 0) > 0) {
      ledger.appendChild(el('div', 'sub', '衣柜里她的衣服已经比你的多了。这只是第一个月。'));
    }
    if (report.gender === 'boy' && (report.spend.toys || 0) > 0) {
      ledger.appendChild(el('div', 'sub', '摇铃和健身架已经占领了客厅。这只是先锋部队。'));
    }
    box.appendChild(ledger);

    const seeds = el('div', 'end-section');
    seeds.appendChild(el('h2', null, `种下的种子（${report.seeds.length}）`));
    seeds.appendChild(el('div', 'sub', '这些伏笔会在未来章节发芽——现在只能看到预告。'));
    if (report.seeds.length === 0) {
      seeds.appendChild(el('div', null, '平平淡淡二十八天，什么雷也没埋，什么花也没种。'));
    }
    for (const seed of report.seeds) {
      const item = el('div', 'seed-item');
      item.appendChild(el('div', 'seed-name', `◆ ${seed.id}`));
      item.appendChild(el('div', 'seed-src', `来源（第${seed.day + 1}天）：${seed.source}`));
      if (seed.desc) item.appendChild(el('div', 'seed-src', seed.desc));
      if (seed.preview) item.appendChild(el('div', 'seed-preview', `发芽预告：${seed.preview}`));
      seeds.appendChild(item);
    }
    box.appendChild(seeds);

    const album = el('div', 'end-section');
    album.appendChild(el('h2', null, '时光相册 · 高光'));
    for (const item of report.log.filter((l) => l.hl)) {
      const row = el('div', 'log-item hl');
      row.appendChild(el('span', 'd', `第${item.day + 1}天`));
      row.appendChild(el('span', null, item.text));
      album.appendChild(row);
    }
    box.appendChild(album);

    const stats = el('div', 'end-section');
    stats.appendChild(el('h2', null, '运行数据（开发者）'));
    const statRow = el('div', 'end-stats');
    const statDefs = [
      [report.stats.anchor, '主线锚点'],
      [report.stats.templateTotal, '模板流水事件'],
      [report.stats.illness, '疾病/后续事件'],
      [report.pendingLeft, '未发芽的延迟后果'],
    ];
    for (const [num, label] of statDefs) {
      const cell = el('div');
      cell.appendChild(el('b', null, String(num)));
      cell.appendChild(el('span', null, label));
      statRow.appendChild(cell);
    }
    stats.appendChild(statRow);
    stats.appendChild(el('div', 'sub', '模板分布：' + Object.entries(report.stats.template).map(([k, v]) => `${k.replace('tpl_', '')}×${v}`).join('　')));
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
