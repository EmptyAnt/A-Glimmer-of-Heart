// 疾病池（新生儿期）：每天按 体质×环境 掷骰触发。
// 每种疾病是一个工厂：canTrigger 门槛 + dailyProb 概率 + make 生成事件。
// 发烧/捂汗的错误选择通过 later+eventId 走"恶化"后续事件——延迟风险链的最小演示。
var GAME = globalThis.GAME || (globalThis.GAME || (globalThis.GAME = {}));

(function (G) {
  const { chance, randInt } = G.util;

  // 月子前两周是"新生儿"体态，之后是"婴儿"
  function poseOf(state) {
    return state.day <= 13 ? '新生儿' : '婴儿';
  }

  const ILLNESSES = [
    {
      id: 'eczema',
      name: '湿疹',
      stage: 'newborn',
      canTrigger: () => true,
      dailyProb(state) {
        return 0.02 * G.CONFIG.CONSTITUTION_TIERS[state.child.constitution].illnessMult;
      },
      make(state) {
        const folkWin = chance(0.5);
        return {
          id: 'ill_eczema', kind: 'illness', title: '脸上起了小红点',
          art: { pose: poseOf(state), expr: '不适', outfit: '连体衣', scene: '家中' },
          text: '脸颊和眉间起了一片密集的小红点，孩子蹭来蹭去，看起来很痒。婆婆说："这是胎毒，抹点母乳就好了。"',
          choices: [
            {
              text: '保持保湿，严重就看医生', cost: { money: G.CONFIG.PRICES.clinic, energy: 1 },
              result: '儿保医生开了保湿霜和弱效药膏，嘱咐别捂太多。三天后红点退了下去。',
              effects: { money: -G.CONFIG.PRICES.clinic, spendKind: 'medical', energy: -1, security: 1, nursingSkill: 1 },
            },
            {
              text: '听婆婆的，抹母乳试试',
              result: folkWin
                ? '居然真的消下去不少。婆婆很得意，你也松了口气。'
                : '越抹越湿，红点开始渗液。你连夜挂了号，医生叹气：母乳不是药啊。',
              effects: folkWin
                ? { inLaw: 4, face: 2 }
                : { money: -G.CONFIG.PRICES.clinic, spendKind: 'medical', mama: -4, setFlags: { '婆媳紧张': '湿疹抹母乳，偏方误事' } },
            },
          ],
        };
      },
    },
    {
      id: 'colic',
      name: '肠绞痛',
      stage: 'newborn',
      canTrigger: (state) => state.day >= 10 && state.child.gasCount >= 2,
      dailyProb(state) {
        return 0.08 * G.CONFIG.CONSTITUTION_TIERS[state.child.constitution].illnessMult;
      },
      make(state) {
        return {
          id: 'ill_colic', kind: 'illness', title: '黄昏开始定时哭闹',
          art: { pose: poseOf(state), expr: '大哭', outfit: '连体衣', scene: '家中' },
          text: '每天傍晚六点，准时开哭。腿往肚子上蜷，脸憋得通红，怎么抱都不行，哭满一小时才肯罢休。网上说这叫"肠绞痛"，二月闹。',
          choices: [
            {
              text: '飞机抱、白噪音，轮班熬过这段',
              cost: { energy: 2 },
              result: '飞机抱有点用，白噪音有点用，但最有用的还是熬。三周后，它像来时一样突然消失了。',
              effects: { energy: -2, security: 1, nursingSkill: 1, setFlags: { '夜醒风暴亲历者': '肠绞痛的黄昏' } },
            },
            {
              text: '带去医院，一定要查个明白',
              cost: { money: G.CONFIG.PRICES.expert, energy: 1 },
              result: '排了三小时队，查了个遍。医生说：肠绞痛，原因不明，会自己好。你们悬着的心放下了一半，另一半还在疼。',
              effects: { money: -G.CONFIG.PRICES.expert, spendKind: 'medical', energy: -1, face: -1 },
            },
          ],
        };
      },
    },
    {
      id: 'diaper_rash',
      name: '红屁股',
      stage: 'both',
      // 尿不湿档位的风险结算：经济款透气差 → 概率翻数倍，高端款最低
      canTrigger: (state) => state.day >= 5,
      dailyProb(state) {
        const tier = state.consumables.diaper || 'brand';
        const base = tier === 'econ' ? 0.04 : tier === 'premium' ? 0.005 : 0.01;
        return base * G.CONFIG.CONSTITUTION_TIERS[state.child.constitution].illnessMult;
      },
      make(state) {
        return {
          id: 'ill_diaper_rash', kind: 'illness', title: '小屁股红了',
          art: { pose: poseOf(state), expr: '不适', outfit: '尿布', scene: '家中' },
          text: '换尿布的时候你愣住了：小屁股红了一片，摸上去发烫，他一碰就扭身子哭。婆婆凑过来看了一眼："抹点香油就好了。"',
          choices: [
            {
              text: '换透气款 + 护臀膏', cost: { money: 120 },
              result: '你下单了护臀膏，白天晾屁股、夜里勤换。三天后红退了下去。购物车里的高端尿不湿，你犹豫了一下还是加上了。',
              effects: { money: -120, spendKind: 'consumables', nursingSkill: 1 },
            },
            {
              text: '先什么都不涂，晾着，勤换', cost: { energy: 1 },
              result: chance(0.5)
                ? '两天后红退了。省下一百多块，代价是你这一周洗了三十块尿布垫。'
                : '越晾越红，范围还大了。你还是去买了护臀膏，多挨了两天哭。',
              effects: chance(0.5)
                ? { energy: -1, nursingSkill: 1 }
                : { energy: -1, money: -120, spendKind: 'consumables', mama: -2 },
            },
            {
              text: '听婆婆的，抹香油',
              result: chance(0.55)
                ? '香油居然真的管用，红渐渐退了。婆婆很得意："老法子值不值？"'
                : '香油糊住不透气，第二天红得更厉害，还起了小疹子。你挂了号，医生说：香油是厨房的，不是药房的。',
              effects: chance(0.55)
                ? { inLaw: 4 }
                : { money: -G.CONFIG.PRICES.clinic, spendKind: 'medical', mama: -3, setFlags: { '婆媳紧张': '红屁股抹香油，偏方误事' } },
            },
          ],
        };
      },
    },
    {
      id: 'fever',
      name: '发烧',
      stage: 'newborn',
      canTrigger: () => true,
      dailyProb(state) {
        // 亲友探视越多，交叉感染风险越高——模板系统与疾病系统的联动
        return 0.006 * G.CONFIG.CONSTITUTION_TIERS[state.child.constitution].illnessMult
          * (1 + 0.25 * state.child.visitorCount);
      },
      make(state) {
        return {
          id: 'ill_fever', kind: 'illness', title: '体温 37.9℃',
          art: { pose: poseOf(state), expr: '不适', outfit: '包被', scene: '家中' },
          text: '傍晚量体温，37.9℃。新生儿发烧和大人不一样，属于需要立刻重视的事。婆婆说："捂一捂，发发汗就好了。"',
          choices: [
            {
              text: '立刻去夜间急诊', cost: { money: G.CONFIG.PRICES.feverER, energy: 2 },
              result: '验血、留观、等到凌晨三点。万幸只是普通感染。医生说：新生儿发烧，你们来得对。',
              effects: { money: -G.CONFIG.PRICES.feverER, spendKind: 'medical', energy: -2, security: 1, nursingSkill: 1 },
            },
            {
              text: '先物理降温，观察一晚',
              cost: { energy: 1 },
              result: '贴退热贴、温水擦身，你们轮流守了一夜，每半小时量一次体温。',
              effects: {
                energy: -1,
                later: [{
                  afterDays: 1, chance: 0.45, eventId: 'follow_fever_high',
                  preview: '如果体温继续升，这一晚的观察就是代价。',
                }],
              },
            },
            {
              text: '听婆婆的，多盖一床捂汗',
              result: '孩子被裹得严严实实，哭声越来越蔫。',
              effects: {
                later: [{
                  afterDays: 1, chance: 0.75, eventId: 'follow_fever_high',
                  withFlags: { '婆媳紧张': '发烧捂汗这一晚' },
                  preview: '捂热不是退烧，是加柴。',
                }],
              },
            },
          ],
        };
      },
    },
    {
      id: 'cord',
      name: '脐炎',
      stage: 'newborn',
      canTrigger: (state) => Boolean(state.flags['脐带土法']),
      dailyProb(state) {
        return state.day >= 8 && state.day <= 18 ? 0.05 : 0;
      },
      make(state) {
        const selfHeal = chance(0.5);
        return {
          id: 'ill_cord', kind: 'illness', title: '肚脐周围有点红',
          art: { pose: poseOf(state), expr: '不适', outfit: '尿布', scene: '家中' },
          text: '换尿布时发现，脐带残端周围发红，还有点异味。当初那个"土法"的选择，此刻找上了门。',
          choices: [
            {
              text: '立刻就医', cost: { money: G.CONFIG.PRICES.clinic, energy: 1 },
              result: '医生重新消毒处理，开了碘伏，严肃叮嘱：脐部感染对新生儿不是小事。这次是花钱买教训。',
              effects: { money: -G.CONFIG.PRICES.clinic, spendKind: 'medical', energy: -1, nursingSkill: 1 },
            },
            {
              text: '自己加强消毒观察两天',
              result: selfHeal
                ? '红肿慢慢消退，算你运气，也可能是消毒起效了。'
                : '第二天红肿扩大，还是去了医院。医生的表情让你把"再等等"三个字咽了回去。',
              effects: selfHeal
                ? { nursingSkill: 1 }
                : { money: -G.CONFIG.PRICES.clinic, spendKind: 'medical', energy: -1, mama: -3, face: -2 },
            },
          ],
        };
      },
    },
    // ---------- 婴儿期疾病 ----------
    {
      // 幼儿急疹：教科书式"烧三天疹出热退"，考验父母扛不扛得住
      id: 'roseola',
      name: '幼儿急疹',
      stage: 'infant',
      canTrigger: (state) => state.ageDays >= 120 && state.ageDays <= 300,
      dailyProb(state) {
        return 0.02 * G.CONFIG.CONSTITUTION_TIERS[state.child.constitution].illnessMult;
      },
      make(state) {
        return {
          id: 'ill_roseola', kind: 'illness', title: '无缘无故烧到 39℃',
          art: { pose: '婴儿', expr: '不适', outfit: '连体衣', scene: '家中' },
          text: '没有咳嗽，没有流涕，精神还不错——但体温就是 39℃。夜里烧上来，他蔫蔫地趴在你肩膀上。老人说："怕是要出疹子。"你半信半疑。',
          choices: [
            {
              text: '立刻就医，查个明白', cost: { money: 500, energy: 1 },
              effects: { money: -500, spendKind: 'medical', energy: -1, nursingSkill: 1 },
              result: '验血、排队、等结果：病毒感染，大概率幼儿急疹，"回家观察，热退疹出就确诊了"。医生说的和老人说的，居然是同一件事。',
            },
            {
              text: '在家观察护理，退烧药备好',
              effects: {
                energy: -2, nursingSkill: 1, security: 1,
                later: [{ afterDays: 3, chance: 1, effects: { money: -100, spendKind: 'medical' }, preview: '第三天，热退疹出——满身红疹反而是好消息。' }],
              },
              result: '三天，你定了八个闹钟量体温。第四天清晨烧退了，前胸后背出了一片红疹——他趴在那儿，冲你笑了。教科书诚不欺我。',
            },
            {
              text: '听老人的："捂汗发出来就好"',
              effects: {
                energy: -2, security: -2,
                later: [{ afterDays: 2, chance: 0.4, effects: { money: -600, spendKind: 'medical', mama: -4 }, preview: '捂汗捂不出疹子，只会捂出高热。' }],
              },
              result: '裹了两层被子，体温不降反升。凌晨两点你在"再等等"和"去医院"之间反复横跳。',
            },
          ],
        };
      },
    },
    {
      // 普通感冒：上托育后的交叉感染学费
      id: 'cold',
      name: '感冒',
      stage: 'both',
      canTrigger: () => true,
      dailyProb(state) {
        const daycareMult = state.family.careMode === 'daycare' ? 2.2 : 1;
        return 0.012 * daycareMult * G.CONFIG.CONSTITUTION_TIERS[state.child.constitution].illnessMult;
      },
      make(state) {
        const inDaycare = state.family.careMode === 'daycare';
        return {
          id: 'ill_cold', kind: 'illness', title: '流鼻涕、咳嗽、低烧',
          art: { pose: '婴儿', expr: '不适', outfit: '连体衣', scene: '家中' },
          text: inDaycare
            ? '从托育班带回来的第一份"作业"：流鼻涕，咳嗽，37.8℃。老师说班里五个孩子都在咳，这是每个新生的必修课。'
            : '开始只是几声咳嗽，中午就挂了鼻涕，晚上量了体温：37.8℃。',
          choices: [
            {
              text: '就诊，验个血放心', cost: { money: 300 },
              effects: { money: -300, spendKind: 'medical', nursingSkill: 1 },
              result: '病毒性感冒，无特效药，回去多喝水多休息。"那来干什么？""图个放心。"医生居然表示理解。',
            },
            {
              text: '在家护理，观察两天', cost: { energy: 1 },
              effects: { energy: -1, security: 1 },
              result: '生理盐水喷鼻、加湿器开到最大。三天后鼻涕变少了，你成了半个呼吸科护士。',
            },
          ],
        };
      },
    },
    {
      // 食物过敏：辅食期的隐藏关卡
      id: 'food_allergy',
      name: '食物过敏',
      stage: 'infant',
      canTrigger: (state) => state.ageDays >= 150,
      dailyProb(state) {
        return 0.01 * G.CONFIG.CONSTITUTION_TIERS[state.child.constitution].illnessMult;
      },
      make(state) {
        const food = G.util.pick(['蛋白', '芒果', '小麦', '虾粉']);
        const urgent = chance(0.4);
        return {
          id: 'ill_allergy', kind: 'illness', title: `吃了${food}，怎么起了疹子`,
          art: { pose: '婴儿', expr: '不适', outfit: '围兜', scene: '家中' },
          text: `新食材加了两天，嘴巴周围起了一圈红疹，胳膊上也冒了几颗。他一直蹭，看起来很痒。
添加辅食的笔记上，你划掉了一行。`,
          choices: [
            {
              text: '停掉新食物，就医确认', cost: { money: 300 },
              effects: { money: -300, spendKind: 'medical', nursingSkill: 2 },
              result: `医生开了检查单，结果显示${food}过敏。你在辅食笔记上郑重写下：忌口，半年后复查。从此这个家的餐桌词典里，多了一个敏感词。`,
            },
            {
              text: '先停掉观察，不着急去医院',
              effects: urgent
                ? { money: -300, spendKind: 'medical', nursingSkill: 1 }
                : { nursingSkill: 1 },
              result: urgent
                ? '疹子越起越多，还是去了医院。挂号费三百，教训无价：过敏这件事，不等人。'
                : '停了两天，疹子自己退了。是过敏还是不耐受说不清——下次再加，你打算只加一小口。',
            },
          ],
        };
      },
    },
    {
      // 手足口：幼儿期社交的"入场仪式"
      id: 'hfmd',
      name: '手足口',
      stage: 'toddler',
      canTrigger: () => true,
      dailyProb(state) {
        const socialMult = state.family.careMode === 'daycare' ? 1.8 : 1;
        return 0.01 * socialMult * G.CONFIG.CONSTITUTION_TIERS[state.child.constitution].illnessMult;
      },
      make(state) {
        const inDaycare = state.family.careMode === 'daycare';
        const intro = inDaycare
          ? '托班群里通知：班里有孩子确诊手足口，请家长注意观察。'
          : '周末的亲子乐园回来两天，他忽然没什么胃口，还有点低烧。';
        return {
          id: 'ill_hfmd', kind: 'illness', title: '手心脚心起了小疱疹',
          art: { pose: '幼儿', expr: '不适', outfit: '罩衣', scene: '医院' },
          text: `${intro}当晚你翻了他的手心脚心——小红包已经起来了几个，嘴里还有两个溃疡点，疼得不肯吃饭。`,
          choices: [
            {
              text: '居家隔离，对症护理', cost: { energy: 2 },
              effects: { energy: -2, nursingSkill: 2 },
              result: '请假一周，凉粥、温水、口喷，挨过了最难的前三天。群里的病假接龙越来越长——这个病，好像每个孩子都躲不过。',
            },
            {
              text: '就医确诊 + 开药', cost: { money: 400 },
              effects: { money: -400, spendKind: 'medical', nursingSkill: 1 },
              result: '医生看了一眼手心："典型手足口，轻症，回家等自愈。"药只开了口喷和退烧的。这四百块买的是确诊的踏实。',
            },
          ],
        };
      },
    },
  ];

  // 发烧恶化后续事件（由 later+eventId 注入）
  const FOLLOWUP_EVENTS = [
    {
      id: 'follow_fever_high', kind: 'illness', title: '夜里烧到 38.9℃',
      make(state) {
        return {
          art: { pose: poseOf(state), expr: '不适', outfit: '包被', scene: '医院' },
          text: '凌晨两点再量，38.9℃。新生儿这个体温必须就医，没有任何侥幸可言。你们抱着孩子冲进了夜色里。',
          choices: [
            {
              text: '住院观察', cost: { money: 1500, energy: 2 },
              result: '办住院、抽血、输液，孩子哭得撕心裂肺，她站在治疗室外面掉眼泪。三天后出院，虚惊一场，也后怕很久。',
              effects: { money: -1500, spendKind: 'medical', energy: -2, mama: -6, security: -2 },
            },
          ],
        };
      },
    },
  ];

  G.illness = {
    // 每天掷骰，返回 0~1 个疾病事件
    roll(state) {
      const stageId = G.engine.stageOf(state.day).id;
      for (const ill of ILLNESSES) {
        if ((ill.stage || 'newborn') !== stageId && ill.stage !== 'both') continue;
        if (!ill.canTrigger(state)) continue;
        if (chance(ill.dailyProb(state))) return ill.make(state);
      }
      return null;
    },
    // later 机制需要按 id 查找的后续事件池
    // 编辑器与校验器需要检视疾病池
    list: () => ILLNESSES,
    followups: () => FOLLOWUP_EVENTS,
    findFollowup(id) {
      return FOLLOWUP_EVENTS.find((e) => e.id === id) || null;
    },
  };
})(GAME);
