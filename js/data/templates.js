// 模板事件家族：日常流水事件由参数槽组合生成，一个家族展开出几十个实例。
// 每个家族是一个工厂：canTrigger 门槛 + make(state) 生成完整事件。
// 夜哭家族内置「原因(隐藏) × 应对 × 天生气质」结果矩阵——玩家只能通过
// 哭声线索猜原因，同样选"任由哭"，天使型和高需求型的代价完全不同。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  const { util } = G;

  // ---------- 家族一：夜里又哭了（高频核心循环） ----------
  function nightcryReason(state) {
    const t = state.child.temperament;
    const reasons = [
      { id: 'hungry', w: 40 + (state.child.feedingMode === 'mu' ? 10 : 0) - (state.child.feedingMode === 'nai' ? 5 : 0) },
      { id: 'gas', w: 12 + (state.child.constitution <= 1 ? 10 : 0) + (state.day > 7 ? 6 : 0) },
      { id: 'startled', w: 12 + (t === 'sensitive' ? 14 : 0) },
      { id: 'soothe', w: 14 + (t === 'demanding' ? 20 : 0) },
    ];
    return util.weighted(reasons.map((r) => r.id), reasons.map((r) => r.w));
  }

  // 结果矩阵：[原因][应对]。文案在 make 时根据气质做最终填充。
  function nightcryOutcomes(state, reason) {
    const t = state.child.temperament;
    const nw = { nightWakeStreak: 1 }; // 每个不眠之夜都计入"夜醒风暴"的进度
    let cryitout;
    if (reason === 'soothe' && t === 'angel') {
      cryitout = {
        text: '哭了十五分钟，声音越来越小，自己睡着了。你盯着监控屏幕愣了半天——居然真的有用。',
        effects: { energy: -1, security: -1, ...nw },
      };
    } else if (t === 'demanding') {
      cryitout = {
        text: '哭了四十五分钟，哭到打嗝、咳嗽、最后变成干嚎。你冲进去抱起来的时候，他抽噎了整整十分钟才停。',
        effects: { energy: -2, security: -6, setFlags: { '哭声免疫实践': '高需求宝宝的哭声免疫实验' }, ...nw },
      };
    } else {
      cryitout = {
        text: '哭了四十分钟，从洪亮哭到沙哑，最后抽噎着睡着。你们躺在床上，谁都没睡着。',
        effects: { energy: -2, security: -4, ...nw },
      };
    }

    const matrix = {
      hungry: {
        hint: '小嘴一张一合地咂着，头转来转去地找。',
        feed: { text: '奶下肚，十个哈欠打了两个，眼睛一闭就睡了。原来就是饿。', effects: { energy: -1, ...nw } },
        hold: { text: '抱着颠了二十分钟，放下就醒，抱起又哭——他一直在找奶，只是你没读懂。', effects: { energy: -1, security: 1, ...nw } },
        cryitout,
        grandma: { text: '婆婆抱着满屋走，"哦——哦——"地哄了半小时。睡着是睡着了，放下的时候全家屏住呼吸。', effects: { inLaw: 2, security: -1, ...nw } },
      },
      gas: {
        hint: '两条小腿乱蹬，脸憋得通红，身子扭成一根麻花。',
        feed: { text: '一喂就呛，"噗"地吐了你一身奶，哭得更凶了——他不是饿，是肚子里有气。', effects: { energy: -1, mama: -2, gasCount: 1, ...nw } },
        hold: { text: '竖着抱起来拍，背上拍出一个响嗝，紧接着一个悠长的屁。安静了。', effects: { energy: -1, security: 1, nursingSkill: 1, gasCount: 1, ...nw } },
        cryitout,
        grandma: { text: '婆婆搓热手心捂在他肚子上，顺时针揉。手法很老，但确实管用。', effects: { inLaw: 2, gasCount: 1, ...nw } },
      },
      startled: {
        hint: '突然一声嚎，四肢猛地一乍，像是被什么吓到了。',
        feed: { text: '含了两口就扭头吐掉，头往后仰，根本不吃。', effects: { energy: -1, ...nw } },
        hold: { text: '用包被裹紧，贴在胸口，一下一下轻拍。五分钟，呼吸就匀了。', effects: { energy: -1, security: 2, nursingSkill: 1, ...nw } },
        cryitout,
        grandma: { text: '婆婆披衣起来"叫叫"——在门口轻声喊了三遍名字，说魂吓掉了要叫回来。你半信半疑，但孩子确实慢慢不哭了。', effects: { inLaw: 2, security: 1, ...nw } },
      },
      soothe: {
        hint: '不冷、不饿、尿布干爽、额头不烫。就是哭。',
        feed: { text: '又灌了 30ml，全喝了，打了个饱嗝——然后继续哭。他不是饿，你喂多了。', effects: { energy: -1, overfed: 1, ...nw } },
        hold: { text: '抱起来的一瞬间，哭声降了一个调，小脑袋往你怀里拱。他要的就是这个。', effects: { energy: -1, security: 2, ...nw } },
        cryitout,
        grandma: { text: '婆婆抱起来颠了两下就笑了——"还是奶奶有办法"她说。', effects: { inLaw: 3, security: -1, ...nw } },
      },
    };
    return matrix[reason];
  }

  // ---------- 家族二：亲友探视 ----------
  // quotes 支持两种条目：'纯文案'（不限性别）或 { t: '文案', g: 'girl'|'boy' }
  // 性别化语录来自真实的社交语境：出生起就被粉色/蓝色编码、
  // "招商银行/建设银行"、"女宝要打扮/男娃费玩具"——只呈现，不评判。
  const VISITORS = [
    {
      name: '婆婆', rel: 'po', w: (s) => (s.family.careMode === 'grandma' ? 3 : 2),
      quotes: [
        '"奶够不够？孩子怎么看着瘦了。"',
        '"我们那时候哪有这么多讲究，不也都过来了。"',
        '"妈妈别老抱，抱惯了以后放不下。"',
        { t: '"小姑娘就是要打扮，头花裙子都安排上，咱家不差这个。"', g: 'girl' },
        { t: '"男娃费玩具，以后车啊枪啊，得给他堆满一间屋。"', g: 'boy' },
      ],
    },
    {
      name: '大姑姐', rel: 'po', w: () => 1,
      quotes: [
        '"这孩子眉毛淡，随谁啊？"',
        '"你们这些纸尿裤不透气，我们那时候都是布的。"',
        { t: '"女宝衣服好买，样式多得挑花眼，弟妹有得买咯。"', g: 'girl' },
        { t: '"男宝省心，衣服随便穿穿就行，钱留着买玩具。"', g: 'boy' },
      ],
    },
    {
      name: '老家来的三姨', rel: 'po', w: () => 1,
      quotes: [
        '"我们那时候哪有月子中心，不也都过来了。"',
        '"二胎要趁早，一个孩子太孤单。"',
        { t: '"招商银行啊！闺女贴心，你们后半辈子享福咯。"', g: 'girl' },
        { t: '"建设银行嘛，得，你们俩从今天起好好挣钱。"', g: 'boy' },
      ],
    },
    {
      name: '丈母娘', rel: 'ma', mamaName: '你妈', w: () => 2,
      quotes: [
        '"瘦了，真的瘦了，是不是奶不够？"',
        '"孩子睡颠倒了，白天别让他多睡。"',
      ],
    },
    {
      name: '邻居王阿姨', rel: 'n', w: () => 2,
      quotes: [
        '"这孩子嗓门真亮，像他爸。"',
        '"我们楼上那家孩子，满月就会抬头了。"',
        '"妈妈别老抱，抱惯了以后放不下。"',
        { t: '"随妈妈，穿什么都好看——裙子买起来，有得你买咯。"', g: 'girl' },
        { t: '"小子虎头虎脑的，蓝色一穿，真精神。"', g: 'boy' },
      ],
    },
    {
      name: '来探望的同事', rel: 'n', w: () => 1,
      quotes: [
        '"哇，才一个月就这么白了。"',
        '"你家这日子过得可以啊，这奶粉不便宜吧。"',
        '"我们组长家孩子，满月就睡整觉。"',
        { t: '"女宝衣服样式也太多了吧，我感觉你要控不住手了。"', g: 'girl' },
        { t: '"男宝是不是能省点衣服钱？玩具钱可一分省不下来。"', g: 'boy' },
      ],
    },
  ];
  // 旧习俗语录：单独一档，选择更重
  const FOLK_QUOTES = [
    { quote: '"乳头要挤一挤，不挤将来孩子要遭罪。"', folk: '挤乳头' },
    { quote: '"腿要绑一绑，不绑要长成罗圈腿的。"', folk: '绑腿' },
    { quote: '"喂点黄连水，去胎毒，一辈子不上火。"', folk: '黄连水' },
  ];

  function makeVisitor(state) {
    const useFolk = util.chance(0.3);
    // 旧规矩只会从婆系长辈嘴里说出来——也是这类矛盾的常见现实
    const pool = useFolk ? VISITORS.filter((v) => v.rel === 'po') : VISITORS;
    const who = util.weighted(pool, pool.map((v) => v.w(state)));
    // 妈妈视角下，娘家人不再叫"丈母娘"
    const whoName = state.perspective === 'mama' && who.mamaName ? who.mamaName : who.name;
    const gift = util.chance(0.25) ? util.randInt(200, 600) : 0;
    const giftSuffix = gift > 0 ? `\n临走时塞了个红包：${util.fmtMoney(gift)}。` : '';
    const visitorPlus = { visitorCount: 1, ...(gift ? { money: gift } : {}) };

    if (useFolk) {
      const fq = util.pick(FOLK_QUOTES);
      return {
        title: `${whoName}的"老规矩"`,
        art: { pose: state.day <= 13 ? '新生儿' : '婴儿', expr: '熟睡', outfit: '连体衣', scene: '家中' },
        text: `${whoName}凑近看了半天，忽然很郑重地说：${fq.quote}\n她说这话时不容置疑，因为"我们那边人人都这样"。`,
        choices: [
          {
            text: '半推半就，照做了',
            effects: { ...visitorPlus, inLaw: 4, marriage: -4, mama: -3, security: -1 },
            result: `你依着做了${fq.folk}。孩子哭了一场。你后来拿这事问了医生，医生的表情让你决定不告诉${whoName}。${giftSuffix}`,
          },
          {
            text: '坚决拒绝，科学育儿',
            effects: {
              ...visitorPlus, inLaw: -6, marriage: 5, mama: 3,
              setFlags: { '婆媳紧张': `旧习俗之争（${fq.folk}）` },
            },
            result: `空气凝固了三十秒。${whoName}讪讪地说"行行行，你们年轻人懂"。${state.perspective === 'mama' ? '这一局你自己扛住了——没人帮你，但你顶住了。' : '事后妻子说：那一刻她觉得你们是一伙的。'}${giftSuffix}`,
          },
          {
            text: '掏出手机，把医嘱截图递过去',
            effects: { ...visitorPlus, face: 3, inLaw: 2, marriage: 3, mama: 2 },
            result: `截图上白纸黑字。${whoName}扶着老花镜看了半天，把手机递回来："医生的号召，那听医生的。"${giftSuffix}`,
          },
        ],
      };
    }

    const quotes = who.quotes
      .map((q) => (typeof q === 'string' ? { t: q } : q))
      .filter((q) => !q.g || q.g === state.child.gender);
    const quote = util.pick(quotes).t;
    const isPo = who.rel === 'po';
    return {
      title: `${whoName}来了`,
      art: { pose: state.day <= 13 ? '新生儿' : '婴儿', expr: '平静', outfit: '连体衣', scene: '家中' },
      text: `门铃响，${whoName}拎着东西进来，鞋都来不及换就直奔婴儿床。第一句话是：${quote}`,
      choices: [
        {
          text: '笑着应付过去',
          effects: { ...visitorPlus, face: 2, energy: -1, mama: -1 },
          result: `"哎对对对""是是是"。送走人之后，你们在沙发上瘫了十分钟。这种话每周都有，每句都得接。${giftSuffix}`,
        },
        {
          text: '认真解释科学道理',
          effects: { ...visitorPlus, face: -2, mama: 3, inLaw: isPo ? -4 : 0 },
            result: isPo
              ? `你从头到尾讲了一遍原理。${whoName}听完只说了一句："我们那时候……"这场对话没有赢家。${state.perspective === 'mama' ? '但至少，这话是你自己说清楚的。' : '但妻子悄悄握了握你的手。'}${giftSuffix}`
              : `你认真解释了一通，对方将信将疑地点头。至少这次，话说清楚了。${giftSuffix}`,
        },
        {
          text: '打哈哈转移话题',
          effects: { ...visitorPlus, marriage: 1 },
          result: `"来来来先吃水果！"话题被引向了别处。育儿观没吵起来，晚上也没多聊一句。${giftSuffix}`,
        },
      ],
    };
  }

  // ---------- 家族三：消费主义轰炸（性别化货池：女宝被种草衣服，男宝被种草玩具） ----------
  const SHOP_ITEMS = [
    // 通用线：照护与服务
    {
      name: '婴儿游泳年卡', price: G.CONFIG.PRICES.swimCard, kind: 'care', gender: null,
      pitch: '"从小游泳，心肺功能好、睡得香，办年卡单次才六十！"',
      effects: { money: -G.CONFIG.PRICES.swimCard, spendKind: 'care' }, perk: '孩子下水扑腾得很欢，当晚睡得意外地沉。办卡的时候你想起医生说的"多运动"。',
    },
    {
      name: '高端奶瓶消毒柜', price: G.CONFIG.PRICES.sterilizer, kind: 'care', gender: null,
      pitch: '"开水烫不干净的，紫外线加烘干，一步到位。"',
      effects: { money: -G.CONFIG.PRICES.sterilizer, spendKind: 'care' }, perk: '柜子很漂亮，运行时有淡蓝的光。从此洗奶瓶多了一个仪式，少了一层焦虑。',
    },
    {
      name: '早教体验课（三个月）', price: 400, kind: 'education', gender: null,
      pitch: '"三个月就可以上早教了，神经元突触的窗口期，一天都不能等！"',
      effects: { money: -400, spendKind: 'education' }, perk: '课上老师拿着黑白卡晃了二十分钟，孩子在最后五分钟睡着了。回家的路上你若有所思。',
    },
    // 女宝线：衣柜是无底洞（社交平台上"女宝穿搭"的日常）
    {
      name: '蝴蝶结头饰套装', price: 199, kind: 'clothes', gender: 'girl',
      pitch: '"十个发卡五对袜套，配裙子绝了，女宝妈妈必入！"',
      effects: { money: -199, spendKind: 'clothes', face: 1 }, perk: '发卡比袜子还小，戴上确实可爱。问题在于：她一根头发都还没有。',
    },
    {
      name: '纱裙三件套（出门穿）', price: 399, kind: 'clothes', gender: 'girl',
      pitch: '"这套裙子上身直接封神！遛弯回头率百分之两百。"',
      effects: { money: -399, spendKind: 'clothes', face: 2 }, perk: '裙子确实好看。她穿着它睡了整整一天，只在换尿布的十分钟里"出席"了一下。',
    },
    {
      name: '母女亲子装', price: 299, kind: 'clothes', gender: 'girl',
      pitch: '"和女儿穿一样的，是妈妈的浪漫～"',
      effects: { money: -299, spendKind: 'clothes', marriage: 1 }, perk: '两件一模一样的碎花裙挂在衣柜里。他看了一眼价格，什么也没说，什么也都说了。',
    },
    {
      name: '手编胎帽（定制款）', price: 168, kind: 'clothes', gender: 'girl',
      pitch: '"手工人字纹，粉白配色，戴上就是小公主本主。"',
      effects: { money: -168, spendKind: 'clothes' }, perk: '确实精致。戴了三天，被她自己在睡梦里蹭掉了十一次。',
    },
    // 男宝线：客厅正在变成玩具展厅
    {
      name: '钢琴健身架', price: 388, kind: 'toys', gender: 'boy',
      pitch: '"男宝大运动起步神器！躺着踢、趴着玩，一步到位。"',
      effects: { money: -388, spendKind: 'toys' }, perk: '他确实会踢琴键了——用最标准的婴儿躺姿。整套设备最爱的可能是猫。',
    },
    {
      name: '汽车造型床铃', price: 168, kind: 'toys', gender: 'boy',
      pitch: '"小车迷从娃娃抓起，旋转一圈全是车，男宝盯着不动窝。"',
      effects: { money: -168, spendKind: 'toys' }, perk: '小车转圈，眼睛跟着转圈。此后他的第一句"话"，很可能是引擎声。',
    },
    {
      name: '安抚牙胶摇铃套装', price: 129, kind: 'toys', gender: 'boy',
      pitch: '"口欲期必备，啃就完了，一套顶半年。"',
      effects: { money: -129, spendKind: 'toys' }, perk: '摇铃、牙胶、软球，他挨个啃了一遍，最爱的还是你的手指。',
    },
    {
      name: '蓝色出门套装', price: 259, kind: 'clothes', gender: 'boy',
      pitch: '"男宝就要穿蓝色，小绅士既视感，帅他一跳。"',
      effects: { money: -259, spendKind: 'clothes', face: 1 }, perk: '蓝色连体衣小领结，确实精神。奶奶看了直说"像个大孩子了"。',
    },
    {
      name: '胎毛笔 + 足金小锁', price: G.CONFIG.PRICES.hairPen, kind: 'other', gender: null,
      pitch: '"胎毛一生只剃一次，不留下就是一辈子的遗憾。"',
      effects: { money: -G.CONFIG.PRICES.hairPen, spendKind: 'other', face: 4 }, perk: '礼盒很沉，证书很烫金。婆婆摸着金锁说值，你看着账单说不出话。',
    },
    {
      name: '直播间"哄睡神器"', price: 199, kind: 'other', gender: null, stage: 'newborn',
      pitch: '"家人们，模拟子宫音，三秒哄睡，最后三百单！"',
      effects: { money: -199, spendKind: 'other' }, perk: '粉红色的机器发出"沙——沙——"的白噪音。孩子没什么反应，你倒是听着睡着了。',
    },
    // 婴儿期商品
    {
      name: '爬行垫 + 围栏套装', price: 399, kind: 'care', gender: null, stage: 'infant',
      pitch: '"XPE材质无味无毒，围出他自己的领地！"',
      effects: { money: -399, spendKind: 'care' }, perk: '两平米的彩色领土。他在上面翻滚、流口水、练习爬行——这可能是这个家性价比最高的一笔投资。',
    },
    {
      name: '机能学步鞋', price: 288, kind: 'clothes', gender: null, stage: 'infant',
      pitch: '"第一步就要穿对的鞋，足弓发育不能输！"',
      effects: { money: -288, spendKind: 'clothes', face: 1 }, perk: '鞋很软，很轻，很贵。他穿着它走了六步，然后决定还是爬比较快。',
    },
    {
      name: '辅食料理机', price: 599, kind: 'care', gender: null, stage: 'infant',
      pitch: '"蒸煮搅打一体，十分钟一碗泥，职场妈妈救星！"',
      effects: { money: -599, spendKind: 'care', mama: 2 }, perk: '南瓜进去，南瓜泥出来。它确实省了事——省下来的时间，你用来研究下一周吃什么泥。',
    },
    {
      name: '安全座椅（isize认证）', price: 1580, kind: 'care', gender: null, stage: 'infant',
      pitch: '"碰撞测试满分，这一笔不能省，谁劝都不好使。"',
      effects: { money: -1580, spendKind: 'care', face: 2 }, perk: '装上之后他哭了一路——安全这件事，他现在还不懂。这笔钱花得没有一丝犹豫，这是为人父母的底线课。',
    },
    {
      name: '中英文点读绘本套装', price: 199, kind: 'education', gender: null, stage: 'infant',
      pitch: '"语言敏感期别浪费，点哪里读哪里！"',
      effects: { money: -199, spendKind: 'education' }, perk: '他目前最喜欢的用法是啃书角。但点读笔发出的每个单词，都让你们觉得未来可期。',
    },
    // 幼儿期商品
    {
      name: '平衡车（轻量版）', price: 399, kind: 'toys', gender: null, stage: 'toddler',
      pitch: '"同龄人手一辆！大运动协调、专注力、方向感，一辆全练！"',
      effects: { money: -399, spendKind: 'toys' }, perk: '第一周他推着车走，第二周坐上去蹭，第三个月，公园里已经追不上他了。',
    },
    {
      name: '防走失背包（带牵引绳）', price: 129, kind: 'care', gender: null, stage: 'toddler',
      pitch: '"人贩子新闻看得心慌？一根绳的安全感，值！"',
      effects: { money: -129, spendKind: 'care' }, perk: '小恐龙造型的背包，后面拖着一条尾巴一样的绳。他背上以后再也不肯摘——为了这只恐龙，走丢是不可能走丢的。',
    },
    {
      name: '磁力片积木（豪华装）', price: 459, kind: 'toys', gender: null, stage: 'toddler',
      pitch: '"空间思维从搭积木开始，一套磁力片，玩到小学！"',
      effects: { money: -459, spendKind: 'toys', security: 1 }, perk: '确实玩到了——只是大部分时间是你在搭，他在拆。你们各取所需，配合默契。',
    },
    {
      name: '儿童壁挂画板', price: 199, kind: 'education', gender: null, stage: 'toddler',
      pitch: '"扼杀毕加索的，从来不是天赋，是一面墙。"',
      effects: { money: -199, spendKind: 'education', face: 1 }, perk: '从此墙保住了，纸上、桌上、沙发上到处都是"作品"。你挑了一张贴在冰箱上，像个策展人。',
    },
  ];
  const SHOP_CHANNELS = ['母婴店导购', '直播间', '妈妈群里的接龙', '商场专柜', '朋友圈代购'];

  function makeShopping(state) {
    const gender = state.child.gender;
    const stageId = G.engine.stageOf(state.day).id;
    // 性别化商品权重更高——算法比你更懂"该给你推什么"，这正是种草的日常
    const pool = SHOP_ITEMS.filter((item) => !item.gender || item.gender === gender)
      .filter((item) => (item.stage || 'newborn') === stageId);
    const item = util.weighted(pool, pool.map((i) => (i.gender ? 2 : 1)));
    const channel = util.pick(SHOP_CHANNELS);
    const outfit = gender === 'girl' ? '粉色连体衣' : '蓝色连体衣';
    return {
      title: `${channel}："这个真的要有"`,
      art: { pose: '婴儿', expr: '平静', outfit, scene: '商场' },
      text: `${channel}把东西递到你面前：${item.pitch}\n你看了看价格：${util.fmtMoney(item.price)}。你想起昨天刚看过的那篇《新手爸妈智商税大全》——但那篇文章，好像没提这个。`,
      choices: [
        {
          text: `标准款：${item.name}`, cost: { money: item.price },
          conditions: { moneyGte: item.price },
          effects: { ...item.effects, mama: 2 },
          result: item.perk,
        },
        {
          text: `加钱上顶配：${item.name} Pro（${util.fmtMoney(Math.round(item.price * 1.8))}）`,
          cost: { money: Math.round(item.price * 1.8) },
          conditions: { moneyGte: Math.round(item.price * 1.8) },
          effects: { ...item.effects, money: -Math.round(item.price * 1.8), face: 1, mama: 3 },
          result: `${item.perk}\n（顶配版的包装盒都更好看。你把盒子留下了，不知道为什么。）`,
        },
        {
          text: '买个平替凑合', cost: { money: 99 },
          effects: { money: -99, spendKind: item.kind },
          result: '九十九块的平替到货了。功能大概是原版的六成，心情是原版的两成。',
        },
        {
          text: '再想想，先不买',
          effects: {
            later: [{
              afterDays: util.randInt(2, 5), chance: 0.35, effects: { energy: -1 },
              preview: '凌晨三点第 N 次起身的时候，你会想起这个东西。',
            }],
          },
          result: '你退出了页面，为自己的理性感到骄傲。这种骄傲能维持多久，不好说。',
        },
      ],
    };
  }

  // ---------- 家族四：育儿日常 ----------
  const DAILY_SCENES = [
    {
      name: '拍嗝', mishap: '一个没拍住，奶从鼻子里喷出来，喷了你满身——他倒是舒坦了，打了个大嗝。',
      smooth: '三分钟，一个响嗝，稳稳放下。你已经摸清了他打嗝前的三个信号。',
    },
    {
      name: '换尿布', mishap: '尿布刚拆开，一道水柱精准命中你的脸和刚换的床单。',
      smooth: '三十秒完成拆、擦、涂、穿全套动作，孩子全程没醒。行云流水。',
    },
    {
      name: '洗澡', mishap: '手一滑，孩子在浴盆里滑了一下，呛了一大口水，哭得撕心裂肺。你抱着他，手抖得比他还厉害。',
      smooth: '水温、托头、洗、擦、抚触，一气呵成。他泡在水里舒服得直哼哼。',
      mishapEffects: { security: -1, mama: -2 },
    },
    {
      name: '剪指甲', mishap: '指甲剪碰到了指尖的小肉肉，渗出一点血珠。他"哇"一声哭出来，你恨不得剪自己的手。',
      smooth: '趁他睡熟，十个手指甲三分钟解决，全程没醒。',
      mishapEffects: { mama: -2 },
    },
    {
      name: '推车遛弯', mishap: '楼下的奶奶们围了上来，一人一句"这孩子真好看"，你推着车突围，像走红毯。',
      smooth: '傍晚的公园，他睁着眼睛看树影，看着看着睡着了。',
      mishapEffects: { face: 2 },
    },
    {
      name: '抚触按摩', mishap: '手刚放上去他就开始哭，抚触油涂了一手，最终以喂奶收场。',
      smooth: '按到后背的时候，他发出一声绵长的叹气，舒服得像个小老头。',
      smoothEffects: { security: 1 },
    },
    // 婴儿期场景
    {
      name: '陪爬', stage: 'infant', mishap: '你陪他在垫子上爬了半小时，起身的时候膝盖咔了一声。他爬得意犹未尽，你扶着腰站了三秒。',
      smooth: '你们在客厅里"赛爬"，他咯咯笑着往前扑——这段视频后来成了家庭群的镇群之宝。',
      smoothEffects: { security: 1, face: 1 },
    },
    {
      name: '辅食首秀', stage: 'infant', mishap: '一勺米粉泼在脸上，第二勺扣在头上。辅食吃进去三分之一，剩下的成了一幅抽象画。',
      smooth: '他张嘴像小鸟，一勺接一勺，吃完还砸吧嘴。你在心里给他颁了米其林三星。',
      mishapEffects: { mama: -1 },
    },
    {
      name: '读布书', stage: 'infant', mishap: '你声情并茂读了十分钟，抬头一看，他啃着书角睡着了。',
      smooth: '你读到"小兔子"，他伸手拍了拍页面。这一幕让你认真考虑起了双语幼儿园的价格。',
      smoothEffects: { security: 1 },
    },
    {
      name: '楼下遛弯', stage: 'infant', mishap: '小区的奶奶们又围上来了，一人一句"这孩子真好看"，你推着车突围，像走红毯。',
      smooth: '傍晚的公园，他在婴儿车里看着树影摇，看着看着睡着了。',
      mishapEffects: { face: 2 },
    },
    // 幼儿期场景
    {
      name: '公园撒欢', stage: 'toddler', mishap: '他像上了发条一样满场跑，你追了二十分钟，心率比他高。',
      smooth: '他捡了三片叶子、两颗石子，郑重地放进你的口袋。你把它们带回了家，一颗都没舍得扔。',
      smoothEffects: { security: 1 },
    },
    {
      name: '搭积木', stage: 'toddler', mishap: '塔搭到第十层，他伸手要放最后一块——塌了。他愣了两秒，扭头看你，嘴一瘪。',
      smooth: '你们搭了一座"城堡"，他往里面塞了一只小恐龙，宣布这是恐龙的家。',
      smoothEffects: { security: 1 },
    },
    {
      name: '亲子共读', stage: 'toddler', mishap: '读到第三页他跑了，回来的时候手里拿着另一本书："读这个。"两本循环，谁也别想读完。',
      smooth: '他靠在你怀里，跟着你一字一句地念。念错一个字他会纠正你——这本书他其实已经背下来了。',
      smoothEffects: { security: 2 },
    },
  ];

  function makeDaily(state) {
    const stageId = G.engine.stageOf(state.day).id;
    const scenes = DAILY_SCENES.filter((s) => (s.stage || 'newborn') === stageId);
    const scene = util.pick(scenes);
    const skilled = state.child.nursingSkill >= 3;
    const isMishap = skilled ? util.chance(0.3) : util.chance(0.6);
    const body = isMishap ? scene.mishap : scene.smooth;
    const bodyEffects = isMishap ? (scene.mishapEffects || {}) : (scene.smoothEffects || {});
    const setup = isMishap
      ? `又到了${scene.name}的时间。你深吸一口气，希望今天顺利。`
      : `又到了${scene.name}的时间。今天的你，已经不是上个月的你了。`;
    return {
      title: `日常：${scene.name}`,
      art: { pose: state.day <= 13 ? '新生儿' : '婴儿', expr: isMishap ? '大哭' : '平静', outfit: '连体衣', scene: '家中' },
      text: `${setup}\n${body}`,
      choices: [
        {
          text: '叫另一半来搭把手',
          effects: { marriage: 1, energy: -1, ...bodyEffects },
          result: '两个人一起，一个抱一个递，兵荒马乱里居然有点默契。',
        },
        {
          text: '自己硬着头皮上',
          effects: { energy: -1, nursingSkill: 1, ...bodyEffects },
          result: '手忙脚乱地收拾完，你瘫在床边看着这个小东西，心想：也没什么难的嘛（并没有）。',
        },
        {
          text: '拍下来发家庭群',
          effects: { face: 1, ...bodyEffects },
          result: '群里瞬间炸出一排"哈哈哈哈"，婆婆发了个大拇指，外婆打来视频电话。',
        },
      ],
    };
  }

  // ---------- 家族五：别人家的孩子 ----------
  const COMPARE_SOURCES = ['婆婆', '老家亲戚', '同事', '邻居王阿姨'];
  const COMPARE_POINTS = [
    { t: '"我们老家那谁家的孩子，满月就长了三斤。"', stage: 'newborn' },
    { t: '"同事家孩子，满月就开始睡整觉了。"', stage: 'newborn' },
    { t: '"楼下豆豆三个月就会翻身了，你们这个……"', stage: 'newborn' },
    { t: '"隔壁家孩子白天不哭晚上不闹，好带得很。"', stage: 'newborn' },
    { t: '"现在出生的孩子一个比一个重，你家这个是不是没喂饱？"', stage: 'newborn' },
    { t: '"人家八个月都会爬了，你们这个还躺着呢？"', stage: 'infant' },
    { t: '"隔壁孩子一岁都能牵着走了，急人不急人。"', stage: 'infant' },
    { t: '"人家同龄的都会叫爸爸妈妈了，你们这个金口难开啊。"', stage: 'infant' },
    { t: '"长了几颗牙了？人家都会用小勺吃饭了。"', stage: 'infant' },
    { t: '"人家两岁都会背古诗了，你们这个会数几了？"', stage: 'toddler' },
    { t: '"同事家孩子早教班都上两年了，你们还没报？"', stage: 'toddler' },
    { t: '"人家孩子幼儿园面试一把过，你们想好上哪个园了吗？"', stage: 'toddler' },
    { t: '"你家这个还穿尿不湿呢？我们家早就不穿了。"', stage: 'toddler' },
  ];

  function makeCompare(state) {
    const stageId = G.engine.stageOf(state.day).id;
    const src = util.pick(COMPARE_SOURCES);
    const point = util.pick(COMPARE_POINTS.filter((p) => p.stage === stageId)).t;
    const isPo = src === '婆婆' || src === '老家亲戚';
    return {
      title: '别人家的孩子',
      art: { pose: '婴儿', expr: '平静', outfit: '连体衣', scene: '家中' },
      text: `${src}刷着手机，忽然开口：${point}\n你看了看怀里这个刚睡着的小家伙，胸口莫名堵了一下。`,
      choices: [
        {
          text: '焦虑上头，决定加码',
          effects: { energy: -1, mama: -2, setFlags: { '焦虑父母': `${src}的比较进了家门` } },
          result: '当晚你搜了两个小时的"追重奶粉""睡眠引导"。购物车里多了三样东西，睡眠少了一个小时。',
        },
        {
          text: '"每个孩子有自己的节奏"',
          effects: { mama: 3, marriage: 2, face: -2 },
          result: `这句话说得平静，其实说给你们自己听的成分居多。${src}撇撇嘴没再说什么。`,
        },
        {
          text: '面子反击："我们这叫科学喂养"',
          effects: { face: 4, inLaw: isPo ? -3 : 0 },
          result: '你引用了医生原话和三篇科普。对方"行行行"地结束话题。赢了嘴，输了和气。',
        },
      ],
    };
  }

  G.TEMPLATES = [
    {
      id: 'tpl_nightcry', name: '夜里又哭了', stage: 'newborn', weight: 30, minDay: 2, perDayMax: 2, cooldown: 0,
      canTrigger: (state) => state.family.careMode !== null,
      make(state) {
        const reason = nightcryReason(state);
        const outcome = nightcryOutcomes(state, reason);
        const choices = [
          { text: '冲奶粉喂一顿', outcome: outcome.feed },
          { text: '抱起来哄', outcome: outcome.hold },
          { text: '咬牙让他哭，不抱（哭声免疫）', outcome: outcome.cryitout },
        ];
        if (state.family.careMode === 'grandma') {
          choices.push({ text: '让婆婆去', outcome: outcome.grandma });
        }
        return {
          title: '凌晨，哭声又响了',
          art: { pose: state.day <= 13 ? '新生儿' : '婴儿', expr: '大哭', outfit: '连体衣', scene: '家中·凌晨' },
          text: `夜里的哭声又准时响起。你摸过去检查：${outcome.hint}\n到底是为什么，没有人告诉你。你只能猜。`,
          choices: choices.map((c) => ({
            text: c.text,
            effects: c.outcome.effects,
            result: c.outcome.text,
          })),
        };
      },
    },
    {
      id: 'tpl_visitor', name: '亲友探视', stage: 'newborn', weight: 16, minDay: 3, perDayMax: 1, cooldown: 2,
      canTrigger: () => true,
      make: makeVisitor,
    },
    {
      id: 'tpl_shopping', name: '消费主义轰炸', stage: 'both', weight: 12, minDay: 4, perDayMax: 1, cooldown: 3,
      canTrigger: () => true,
      make: makeShopping,
    },
    {
      id: 'tpl_daily', name: '育儿日常', stage: 'both', weight: 22, minDay: 2, perDayMax: 2, cooldown: 1,
      canTrigger: (state) => state.family.careMode !== null,
      make: makeDaily,
    },
    {
      id: 'tpl_compare', name: '别人家的孩子', stage: 'both', weight: 10, minDay: 8, perDayMax: 1, cooldown: 7,
      canTrigger: () => true,
      make: makeCompare,
    },
    {
      // 十万个为什么：幼儿期日常的脑力马拉松
      id: 'tpl_why', name: '十万个为什么', stage: 'toddler', weight: 16, minDay: 3, perDayMax: 1, cooldown: 3,
      canTrigger: () => true,
      make(state) {
        const qs = [
          { q: '"为什么天是蓝的？"', a: '你组织了一下语言，从光的散射讲到大气层，讲到一半发现他已经在问下一个问题了。' },
          { q: '"为什么鱼不闭眼睛？"', a: '"因为没有眼皮。"他哦了一声，你以为结束了，他接着问："为什么没有眼皮？"' },
          { q: '"为什么爸爸可以看手机，我不可以？"', a: '这个问题像一发子弹，精准命中。你张了张嘴，把"因为我是大人"咽了回去。' },
          { q: '"为什么要去上班？"', a: '"为了挣钱呀。""挣钱干什么？""给你买奶粉呀。""我已经不喝奶粉了。"\n对话陷入僵局。' },
          { q: '"月亮为什么跟着我们走？"', a: '这个问题问得好，你掏出手机想查，又默默放下了——有些问题，就让它在月亮上多待一会儿吧。' },
        ];
        const picked = util.pick(qs);
        return {
          title: '灵魂拷问',
          art: { pose: '幼儿', expr: '专注', outfit: '罩衣', scene: '家中' },
          text: `晚饭后，他忽然仰起头：${picked.q}\n（这已经是今天的第十七个"为什么"。）`,
          choices: [
            {
              text: '认真回答，不会的就去查',
              cost: { energy: 1 },
              effects: { energy: -1, security: 2, nursingSkill: 1 },
              result: picked.a + '\n你知道答案不一定重要——重要的是他知道：问了，就有回应。',
            },
            {
              text: '"你猜猜看？"',
              effects: { security: 1 },
              result: '他歪着头认真想："因为……它喜欢我们！"这个答案比你查到的任何百科都好。',
            },
            {
              text: '"别问了，自己玩会儿去"',
              effects: { security: -2 },
              result: '他"哦"了一声，安静了。那天晚上再也没问过为什么。你获得了半小时安静，和一点点说不清的失落。',
            },
          ],
        };
      },
    },
    {
      // 躺地日常：terrible two 的常规弹药
      id: 'tpl_tantrum', name: '又躺下了', stage: 'toddler', weight: 20, minDay: 2, perDayMax: 1, cooldown: 2,
      canTrigger: () => true,
      make(state) {
        const scenes = [
          { name: '不肯穿外套', text: '"不穿！"夺过来扔在地上，还踩了一脚。外面零下两度。' },
          { name: '不肯回家', text: '游乐园闭园音乐都响了，他抱住旋转木马的柱子，宣布今晚就住在这里。' },
          { name: '不肯关电视', text: '遥控器被没收的瞬间，他的世界崩塌了，塌得比音量键还快。' },
          { name: '不肯洗澡', text: '听到"洗澡"两个字，他抱着沙发垫开始尖叫，像一只被强制营业的小动物。' },
        ];
        const scene = util.pick(scenes);
        const learned = Boolean(state.flags['哭闹有效']);
        return {
          title: `日常风暴：${scene.name}`,
          art: { pose: '幼儿', expr: '大哭', outfit: '罩衣', scene: '家中' },
          text: `${scene.text}${learned ? '\n他一边哭一边偷瞄你——上次这招管用，他在确认这次还管不管用。' : ''}`,
          choices: [
            {
              text: '温和而坚定：等他哭完，事情照旧',
              effects: { security: 1, energy: -1, nursingSkill: 1 },
              result: '十分钟后，风暴过去。外套穿了，电视关了，澡也洗了。他眼角挂泪地在你怀里抽噎——规矩没塌，天也没塌。',
            },
            {
              text: '满足他，息事宁人',
              effects: { setFlags: { '哭闹有效': '每一次妥协，都是下一次躺地的定金' } },
              result: '外套不穿了（车里开空调），电视多看了二十分钟，澡明天再说。世界安静了——暂时。',
            },
            {
              text: '吼一嗓子，立竿见影',
              effects: { security: -3, energy: -1 },
              result: '吼完的第三秒你就后悔了。他瞬间安静，眼睛里的惊恐大于委屈。有效，但这个"有效"让你夜里想了很久。',
            },
          ],
        };
      },
    },
    {
      // 隔代养育冲突：婆婆妈妈们的经典战场，cond 绑定老人带娃模式
      id: 'tpl_grandparent', name: '隔代冲突', stage: 'infant', weight: 18, minDay: 3, perDayMax: 1, cooldown: 3,
      canTrigger: (state) => ['grandma', 'grandma2'].includes(state.family.careMode),
      make(state) {
        const conflicts = [
          {
            topic: '追着喂',
            text: '饭点到了，老人端着碗跟在他屁股后面："再来一口，就一口。"你看着儿保科普里"自主进食"四个字，陷入沉默。',
            choices: [
              { text: '当面拦下：让他自己吃', effects: { inLaw: -5, marriage: 2, setFlags: { '隔代养育': '喂饭战争，你开了第一枪' } }, result: '老人愣住了，碗停在半空。孩子趁机把饭抹了一头。这场仗没有赢家，只有洗不完的衣服。' },
              { text: '睁一只眼闭一只眼', effects: { mama: -1 }, result: '你转身进了厨房。有些仗，现在还打不起。' },
              { text: '发一篇科普视频到家庭群', effects: { inLaw: 2, face: 1 }, result: '视频讲得头头是道。老人回了个"知道了"，第二天的饭点，碗还是跟着屁股走。' },
            ],
          },
          {
            topic: '穿太多',
            text: '"摸着后脖颈是凉的，加一件！"老人一边说一边又套了件马甲。你摸了摸——他在冒汗。',
            choices: [
              { text: '脱！捂出热疹更麻烦', effects: { inLaw: -3, security: 1 }, result: '你把马甲脱了，老人把脸转过去了。室温26度，两代人之间的温度差了十度。' },
              { text: '随老人去吧，别为一个马甲吵架', effects: {}, result: '他捂出了一身红点点，老人心疼得直自责。你什么也没说——有些道理，要用红点点讲。' },
              { text: '掏出体温计实测', effects: { inLaw: 2, nursingSkill: 1 }, result: '36.8度，数据面前人人平等。老人盯着体温计看了半天："这东西还挺准。"' },
            ],
          },
          {
            topic: '把尿',
            text: '老人把他的腿一架："纸尿裤捂着多难受，把一把，从小就干爽。"你在家长课上学的内容和眼前这一幕正在激烈冲突。',
            choices: [
              { text: '坚决制止', effects: { inLaw: -6, marriage: 2, setFlags: { '隔代养育': '把尿之争，寸土不让' } }, result: '"我们都是这么把出来的！"老人的声音大了八度。这场辩论从卫生间一直打到客厅，孩子在一旁茫然地蹬腿。' },
              { text: '偶尔为之，别伤和气', effects: { inLaw: 2 }, result: '你选择没看见。科学育儿的纯度，在现实面前总要打点折。' },
              { text: '搬出医生的话', effects: { inLaw: 3 }, result: '"儿保医生说影响髋关节。"医生这张牌一出，老人嘟囔了两句，把尿盆收了起来。' },
            ],
          },
        ];
        const conflict = util.pick(conflicts);
        return {
          title: `隔代分歧：${conflict.topic}`,
          art: { pose: '婴儿', expr: '平静', outfit: '连体衣', scene: '家中' },
          text: conflict.text,
          choices: conflict.choices,
        };
      },
    },
    {
      // 小意外家族：移动目标时代的日常惊魂
      id: 'tpl_accident', name: '小意外', stage: 'infant', weight: 14, minDay: 10, perDayMax: 1, cooldown: 4,
      canTrigger: () => true,
      make(state) {
        const skilled = state.child.nursingSkill >= 5;
        const accidents = [
          {
            name: '从床上滚下来了',
            text: '"咚"的一声，然后是两秒的安静，然后是撕心裂肺的哭。你冲过去的时候，他已经躺在地板上，额头红了一块。',
            extra: skilled ? {} : { mama: -3 },
          },
          {
            name: '啃数据线被你一把夺下',
            text: '他坐着啃一条数据线，啃得正香。你看见了，心脏骤停半拍，一个箭步冲过去夺了下来。他愣了愣，哭得比任何时候都委屈。',
            extra: {},
          },
          {
            name: '抓花自己的脸',
            text: '指甲长了一点没来得及剪，早上一看，小脸上三道血印，像被小猫挠的。他倒是没事人一样冲你笑。',
            extra: { face: -1 },
          },
        ];
        const accident = util.pick(accidents);
        return {
          title: `小意外：${accident.name}`,
          art: { pose: '婴儿', expr: '大哭', outfit: '连体衣', scene: '家中' },
          text: `${accident.text}\n${skilled ? '好在你们已经是老手了：检查、安抚、观察，一气呵成。' : '你抱着他检查了三遍，手一直在抖。'}`,
          choices: [
            {
              text: '自责一晚上',
              effects: { mama: -2, marriage: -1, ...accident.extra },
              result: '凌晨你还在翻监控回放。为人父母的内疚感，来得比任何 KPI 都快。',
            },
            {
              text: '把该买的防护都买了', cost: { money: 200 },
              effects: { money: -200, spendKind: 'care', nursingSkill: 1, ...accident.extra },
              result: '防撞条、监护器、地垫补货。消费是焦虑的止疼药，今晚吃一片。',
            },
            {
              text: '发到家长群取经',
              effects: { face: -1, nursingSkill: 1, ...accident.extra },
              result: '群里秒回二十条"我家也是"，你忽然松了口气——原来所有的父母，都在同一艘船上。',
            },
          ],
        };
      },
    },
  ];
})(GAME);
