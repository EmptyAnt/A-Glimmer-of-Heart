// 模板事件家族：日常流水事件由参数槽组合生成，一个家族展开出几十个实例。
// 每个家族是一个工厂：canTrigger 门槛 + make(state) 生成完整事件。
// 夜哭家族内置「原因(隐藏) × 应对 × 天生气质」结果矩阵——玩家只能通过
// 哭声线索猜原因，同样选"任由哭"，天使型和高需求型的代价完全不同。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  const { util } = G;

  const NL = String.fromCharCode(10); // 换行（避免 heredoc 转义问题）

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
        hint: '小嘴一张一合地咂着，头转来转去地找——你把手背凑过去，他立刻扭头追着啃。',
        feed: { text: '奶下肚，十个哈欠打了两个，眼睛一闭就睡了。原来就是饿。' + NL + '放下他的时候你的胳膊已经麻了，但不敢动——像捧着一枚刚拆的雷。', effects: { energy: -1, ...nw } },
        hold: { text: '抱着颠了二十分钟，放下就醒，抱起又哭——他一直在找奶，只是你没读懂。' + NL + '你的睡衣领子被他啃湿了一片。', effects: { energy: -1, security: 1, ...nw } },
        cryitout,
        grandma: { text: '婆婆抱着满屋走，"哦——哦——"地哄了半小时。睡着是睡着了，放下的时候全家屏住呼吸——她的腰，第二天疼了一个星期。', effects: { inLaw: 2, security: -1, ...nw } },
      },
      gas: {
        hint: '两条小腿乱蹬，脸憋得通红，身子扭成一根麻花——哭声是一阵一阵的，中间还夹着用力的哼唧。',
        feed: { text: '一喂就呛，"噗"地吐了你一身奶，哭得更凶了——他不是饿，是肚子里有气。', effects: { energy: -1, mama: -2, gasCount: 1, ...nw } },
        hold: { text: '竖着抱起来拍，背上拍出一个响嗝，紧接着一个悠长的屁。安静了。' + NL + '你保持着拍嗝的姿势又站了五分钟，才敢相信真的好了。', effects: { energy: -1, security: 1, nursingSkill: 1, gasCount: 1, ...nw } },
        cryitout,
        grandma: { text: '婆婆搓热手心捂在他肚子上，顺时针揉。手法很老，但确实管用。', effects: { inLaw: 2, gasCount: 1, ...nw } },
      },
      startled: {
        hint: '突然一声嚎，四肢猛地一乍，像是被什么吓到了——小拳头攥得死紧，指甲在你脖子上划了一道。',
        feed: { text: '含了两口就扭头吐掉，头往后仰，根本不吃。', effects: { energy: -1, ...nw } },
        hold: { text: '用包被裹紧，贴在胸口，一下一下轻拍。你的心跳声比任何摇篮曲都管用——五分钟，呼吸就匀了。', effects: { energy: -1, security: 2, nursingSkill: 1, ...nw } },
        cryitout,
        grandma: { text: '婆婆披衣起来"叫叫"——在门口轻声喊了三遍名字，说魂吓掉了要叫回来。你半信半疑，但孩子确实慢慢不哭了。', effects: { inLaw: 2, security: 1, ...nw } },
      },
      soothe: {
        hint: '不冷、不饿、尿布干爽、额头不烫、嗝也拍了——每一项都觉得对，他就是哭。',
        feed: { text: '又灌了 30ml，全喝了，打了个饱嗝——然后继续哭。他不是饿，你喂多了。', effects: { energy: -1, overfed: 1, ...nw } },
        hold: { text: '抱起来的一瞬间，哭声降了一个调，小脑袋往你怀里拱，像在确认什么。' + NL + '他要的就是这个——而你，也需要这个。', effects: { energy: -1, security: 2, ...nw } },
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
        { t: '"后脑勺都磨秃了，这是缺钙！得赶紧补。"', stage: 'newborn' },
        { t: '"得给孩子睡个平头，后脑勺圆圆的像什么样子。"', stage: 'newborn' },
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
    // 三档事件：卫生(0.2) / 旧规矩(0.3) / 日常语录
    const roll = Math.random();
    const useHygiene = roll < 0.2;
    const useFolk = !useHygiene && roll < 0.5;
    const pool = useFolk ? VISITORS.filter((v) => v.rel === 'po') : VISITORS;
    const who = util.weighted(pool, pool.map((v) => v.w(state)));
    // 妈妈视角下，娘家人不再叫"丈母娘"
    const whoName = state.perspective === 'mama' && who.mamaName ? who.mamaName : who.name;
    const gift = util.chance(0.25) ? util.randInt(200, 600) : 0;
    const giftSuffix = gift > 0 ? `\n临走时塞了个红包：${util.fmtMoney(gift)}。` : '';
    const visitorPlus = { visitorCount: 1, ...(gift ? { money: gift } : {}) };

    if (useHygiene) {
      const hands = util.pick(['刚按过门铃', '刚扶过楼道扶手', '刚拍了拍自家的狗', '正在剥橘子', '刚掏完手机']);
      return {
        title: `${whoName}伸手要抱他`,
        art: { pose: state.day <= 13 ? '新生儿' : '婴儿', expr: '熟睡', outfit: '连体衣', scene: '家中' },
        text: `${whoName}一进门就直奔婴儿床，两只手${hands}，伸过来就要抱。\n那双手离孩子还有三十公分。护士说过的话在你耳边循环播放：回家的人，先洗手。`,
        choices: [
          {
            text: '"先洗手！护士特别交代的"',
            effects: { ...visitorPlus, security: 1, nursingSkill: 1, inLaw: who.rel === 'po' ? -2 : 0 },
            result: `${whoName}愣了半秒，笑着说"对对对，应该的"，转身进了卫生间。出来的时候手洗得发红——顺便把手机也用酒精棉擦了一遍。${whoName === '你妈' ? '亲妈的执行力，永远超出预期。' : ''}${giftSuffix}`,
          },
          {
            text: '不好意思开口，事后默默消毒了一圈',
            effects: { ...visitorPlus, security: -1, mama: -1 },
            result: `抱完了，聊完了，人走了。你抱着孩子在屋里转了三圈，把TA碰过的东西全擦了一遍。有些话没说出口，就自己多干点活。${giftSuffix}`,
          },
          {
            text: '递上免洗洗手液："来，消个毒～"',
            cost: { money: 30 },
            effects: { ...visitorPlus, face: 1, inLaw: 1 },
            result: `你把免洗洗手液递过去的动作行云流水，谁都不尴尬。${whoName}搓着手夸你想得周到——三十块钱，买了一场体面。${giftSuffix}`,
          },
        ],
      };
    }

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
    // 幼儿园商品
    {
      name: '电话手表（顶配版）', price: 1299, kind: 'care', gender: null, stage: 'kindergarten',
      pitch: '"全班就他没有！定位、通话、防水——家长的安心，孩子的社交入场券。"',
      effects: { money: -1299, spendKind: 'care', face: 2, security: 1 }, perk: '戴上第一天，他给全家每人打了电话，包括外婆家固定电话。第二天，他用手表和同桌"碰一碰"加了好友。',
    },
    {
      name: '轮滑鞋 + 护具全套', price: 599, kind: 'toys', gender: null, stage: 'kindergarten',
      pitch: '"广场上同龄人手一双，摔出来的都是平衡感！"',
      effects: { money: -599, spendKind: 'toys' }, perk: '护具比鞋还贵。第一个月你们在广场的塑胶地上度过了八个傍晚——他摔了十七次，站起来了十八次。',
    },
    {
      name: '进阶百科绘本（30册）', price: 328, kind: 'education', gender: null, stage: 'kindergarten',
      pitch: '"恐龙、太空、人体——十万个为什么的官方答案库！"',
      effects: { money: -328, spendKind: 'education', security: 1 }, perk: '三十本书，他最爱的是恐龙那本——已经被翻到卷边。你现在能准确区分霸王龙和迅猛龙，这是你没想到的技能点。',
    },
    // 小学商品
    {
      name: '护脊书包（德国工学）', price: 499, kind: 'care', gender: null, stage: 'primary',
      pitch: '"孩子脊椎在发育！书包自重轻一半，护脊从一年级开始！"',
      effects: { money: -499, spendKind: 'care', face: 1 }, perk: '自重确实轻，功能确实多——唯一的缺点是他坚持要挂满挂件，把省下的重量全挂了回去。',
    },
    {
      name: '错题打印机', price: 399, kind: 'education', gender: null, stage: 'primary',
      pitch: '"拍一下就打印，错题本从此不用手抄！学霸都在用！"',
      effects: { money: -399, spendKind: 'education', habit: 1 }, perk: '第一周打了五十道错题，贴满了整本。第二周打了十道。第三周，它在书架上开始吃灰——但它确实好用过一周。',
    },
    {
      name: '全套《米小圈上学记》', price: 129, kind: 'education', gender: null, stage: 'primary',
      pitch: '"全班都在看！不爱读书的孩子也能看入迷！"',
      effects: { money: -129, spendKind: 'education', security: 1 }, perk: '他趴在床上笑出了猪叫。你看了一眼定价除以笑声——这是教育支出里性价比最高的一笔。',
    },
  ];
  const SHOP_CHANNELS = ['母婴店导购', '直播间', '妈妈群里的接龙', '商场专柜', '朋友圈代购'];

  function makeShopping(state) {
    const gender = state.child.gender;
    const stageId = G.engine.stageOf(state.day).id;
    // 性别化商品权重更高——算法比你更懂"该给你推什么"，这正是种草的日常
    const pool = SHOP_ITEMS.filter((item) => !item.gender || item.gender === gender)
      .filter((item) => (item.stage || 'newborn') === stageId);
    if (pool.length === 0) pool.push(SHOP_ITEMS[0]); // 阶段货池为空时兜底，避免空池异常
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
    // 幼儿园场景
    {
      name: '接送路上', stage: 'kindergarten', mishap: '放学排队接娃，你迟到了十分钟。他站在老师旁边，看见你的瞬间嘴一瘪——又忍住了。',
      smooth: '他远远看见你就开始跑，书包在背后一颠一颠。一路上嘴没停过：今天吃了什么、谁摔了、老师说了什么。',
      smoothEffects: { security: 2 },
      mishapEffects: { security: -1 },
    },
    {
      name: '亲子作业', stage: 'kindergarten', mishap: '"亲子手工：落叶贴画"。交上去的作品太精致了，老师当众表扬——全班都知道是家长做的。',
      smooth: '胶水糊了一手，树叶贴歪了三片，他坚持要自己完成。作品交上去朴素得像个笑话，他得意得像个国王。',
      smoothEffects: { security: 2, nursingSkill: 1 },
      mishapEffects: { face: 1, security: -2 },
    },
    // 小学场景
    {
      name: '放学路上', stage: 'primary', mishap: '明明十分钟的路走了四十分钟——你在后面远远跟着，看见他和同学蹲在花坛边看了二十分钟蚂蚁。',
      smooth: '走路回家的二十分钟，是他一天里话最多的时候：谁被老师点了名、食堂今天有什么、同桌的橡皮又丢了。',
      smoothEffects: { security: 2 },
    },
    {
      name: '睡前夜读', stage: 'primary', mishap: '读到第三章你说"今天到这了"，他抗议无效——但五分钟后你在门缝里看见，他打着手电在被窝里接着看。',
      smooth: '一章读完，他忽然说："{parent}，书里这个人好像我们班的谁。"你愣了一下——他已经在用文学分析生活了。',
      smoothEffects: { security: 2, habit: 1 },
    },
  ];

  function makeDaily(state) {
    const stageId = G.engine.stageOf(state.day).id;
    const scenes = DAILY_SCENES.filter((s) => (s.stage || 'newborn') === stageId);
    const scene = util.pick(scenes.length > 0 ? scenes : DAILY_SCENES);
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
    { t: '"人家中班识字量就破五百了，你们开始学了吗？"', stage: 'kindergarten' },
    { t: '"同事家孩子钢琴都考二级了，你们学什么了？"', stage: 'kindergarten' },
    { t: '"人家孩子都能自己读绘本了，你们还陪读呢？"', stage: 'kindergarten' },
    { t: '"幼小衔接班报了吗？现在零基础入学就是灾难。"', stage: 'kindergarten' },
    { t: '"人家这次数学又是满分。你们家呢？"', stage: 'primary' },
    { t: '"同事家孩子奥数拿奖了，据说初中都预定好了。"', stage: 'primary' },
    { t: '"三好学生名单出来了，有你家吗？"', stage: 'primary' },
    { t: '"六年级了还不报衔接班？初一要吃大亏的。"', stage: 'primary' },
  ];

  function makeCompare(state) {
    const stageId = G.engine.stageOf(state.day).id;
    const src = util.pick(COMPARE_SOURCES);
    const points = COMPARE_POINTS.filter((p) => p.stage === stageId);
    const point = (points.length > 0 ? util.pick(points) : COMPARE_POINTS[0]).t;
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
        // 时间质感与伴侣状态：每一个不眠之夜的钟点不一样；连击越久，两个人越像轮班
        const clock = util.pick(['一点二十', '两点五十', '三点四十', '四点整', '四点二十']);
        const spouse = state.perspective === 'mama' ? '他' : '她';
        const streak = state.child.nightWakeStreak;
        const spouseLine = streak >= 5
          ? `\n${spouse}在被窝里翻了个身，没有起来——你们已经默契地不再互相叫醒了。这不是体贴，是没力气了。`
          : streak >= 2
            ? `\n${spouse}含糊地问了句"要不要我起来"，没等回答就又睡了过去。`
            : `\n${spouse}翻了个身，手在床边摸了两下，想帮忙又不知从哪儿帮起。`;
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
          title: `凌晨${clock}，哭声又响了`,
          art: { pose: state.day <= 13 ? '新生儿' : '婴儿', expr: '大哭', outfit: '连体衣', scene: '家中·凌晨' },
          text: `凌晨${clock}。哭声又一次准时响起，像有人在你耳边按下了开关。\n你摸黑过去检查：${outcome.hint}\n到底是为什么，没有人告诉你。你只能猜。${spouseLine}` + (G.util.seasonOf(state) === 'winter' ? '\n（冬天的凌晨，客厅冷得像个冰柜——你把睡衣裹紧了一点再去抱他。）' : ''),
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
      // 隔代养育冲突：婆婆妈妈们的经典战场（婴儿期+幼儿园期，老人仍在带娃或接送时）
      id: 'tpl_grandparent', name: '隔代冲突', stage: 'both', weight: 18, minDay: 3, perDayMax: 1, cooldown: 3,
      canTrigger: (state) => ['grandma', 'grandma2'].includes(state.family.careMode)
        && G.engine.stageOf(state.day).id !== 'newborn',
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
            text: '"摸着后脖颈是凉的，加一件！"老人一边说一边又套了件马甲。你摸了摸——他在冒汗。' + (G.util.seasonOf(state) === 'winter' ? '\n（顺便说一句：今天室外零下二度。这场辩论，你先天不占理——但"冷"和"捂出汗"，从来是两回事。）' : ''),
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
              { text: '搬出医生的话', effects: { inLaw: 3 }, result: '"儿保医生说了：括约肌要到三岁才发育成熟，把尿反而容易尿频、尿床，还伤髋关节。"医生这张牌一出，老人嘟囔了两句，把尿盆收了起来。' },
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
      // 同学社交日常：幼儿园的小社会
      id: 'tpl_classmate', name: '幼儿园的江湖', stage: 'kindergarten', weight: 16, minDay: 2, perDayMax: 1, cooldown: 3,
      canTrigger: () => true,
      make(state) {
        const scenes = [
          {
            name: '最好的朋友', text: '他宣布和豆豆"一辈子做朋友"，因为豆豆分了他半块饼干。第二天他们绝交了，因为抢了一辆黄色的小车。第三天，和好了。',
            choices: [
              { text: '认真听完全部剧情', effects: { security: 1, nursingSkill: 1 }, result: '你全程忍住了"这有什么好吵的"。小孩的友谊和成人的友谊规格相同——只是周期以天计。' },
              { text: '"这有什么好吵的，明天就和好了"', effects: { security: -1 }, result: '他说"你不懂"，跑开了。你说中了结局，但错过了过程。' },
            ],
          },
          {
            name: '交换贴纸', text: '他用三张"闪卡"换了一张贴纸，回来越想越亏，想反悔又不敢，饭都吃得不香。',
            choices: [
              { text: '陪他演练怎么去"重新谈"', effects: { security: 2, nursingSkill: 2 }, result: '你们演了三轮"我可以换回来吗"。第二天他成功了，回家时举着三张闪卡，像举着奖杯。', },
              { text: '"吃一堑长一智，下次想清楚"', effects: { security: 0 }, result: '他似懂非懂地点头。半个学期后，他成了班里最精明的贴纸商人——不知道和你有没有关系。' },
              { text: '找老师把贴纸要回来', effects: { face: -1 }, result: '贴纸要回来了，"抠门"的外号也传开了。有些亏，吃了才是赚的。' },
            ],
          },
          {
            name: '没人跟他玩', text: '放学路上他忽然说："今天做游戏，没有人选我。"\n他说得很平静，平静得让你心里一沉。',
            choices: [
              { text: '抱抱他，问细节，教他下次主动一点', cost: { energy: 1 }, effects: { energy: -1, security: 3, nursingSkill: 1 }, result: '你们聊了一路。第二天你向老师打听：分组时他确实慢半拍。又过了两周，他有了固定的"工地三人组"（他们自称）。' },
              { text: '"那明天带点贴纸去分给同学"', effects: { face: 1, setFlags: { '社交初体验': '用贴纸换来的朋友' } }, result: '立竿见影，第二天他就"朋友遍地"。你隐约觉得哪里不对，但说不出来。' },
              { text: '"没事，{parent}小时候也这样"', effects: { security: 1 }, result: '他抬头看你，眼睛里的问题很明显：那你后来有朋友了吗？你一时不知道怎么答。' },
            ],
          },
        ];
        const scene = util.pick(scenes);
        return {
          title: `幼儿园的江湖：${scene.name}`,
          art: { pose: '幼儿', expr: '平静', outfit: '园服', scene: '幼儿园' },
          text: scene.text,
          choices: scene.choices,
        };
      },
    },
    {
      // 家长群生态：面子与信息焦虑的主战场
      id: 'tpl_parentgroup', name: '家长群', stage: 'kindergarten', weight: 14, minDay: 1, perDayMax: 1, cooldown: 4,
      canTrigger: () => true,
      make() {
        const scenes = [
          {
            name: '老师的照片', text: '老师发了一组活动照（九张，四十个孩子）。你放大、再放大，在第三张的边角找到了他——半个后脑勺。',
            choices: [
              { text: '"谢谢老师！老师辛苦了！"', effects: { face: 1 }, result: '你回复了标准答案，和其他三十七位家长一字不差。剩下两位回的是语音。' },
              { text: '私聊老师问孩子在园情况', effects: { face: -1, nursingSkill: 1 }, result: '老师回复得很客气："都挺好的。"三个字，你反复读了五遍，读出了二十种含义。' },
            ],
          },
          {
            name: '接龙', text: '群公告：明天春游，需要四位家长志愿者随行。下面已经接龙三位，都是你眼熟的"骨干妈妈"。',
            choices: [
              { text: '报名接龙', effects: { energy: -1, face: 3, marriage: 1 }, result: '春游那天你举着小旗子走在最前面，负责十二个孩子和一包鹌鹑蛋。累到失语，但他在同伴面前骄傲得发光。' },
              { text: '装没看见', effects: {}, result: '接龙很快满员。你退出了聊天界面，把这归类为"这周没排上的事"之一。' },
            ],
          },
          {
            name: '凡尔赛', text: '有家长晒图：孩子在家用乐高搭了个"城堡"，配文"随便玩玩"。群里排队点赞，夸声整齐得像复制粘贴。',
            choices: [
              { text: '点赞并夸回去', effects: { face: 1 }, result: '你写了一段彩虹屁，删删改改发出去。家长群的礼尚往来，是一门精算学。' },
              { text: '放下手机陪自己家孩子搭了半小时积木', effects: { security: 2, energy: -1 }, result: '他搭了个"停车场"，比城堡朴素得多。他说这是给你停车用的——你瞬间觉得群里的城堡也没什么。' },
            ],
          },
        ];
        const scene = util.pick(scenes);
        return {
          title: `家长群：${scene.name}`,
          art: { pose: '幼儿', expr: '平静', outfit: '园服', scene: '家中·手机屏幕' },
          text: scene.text,
          choices: scene.choices,
        };
      },
    },
    {
      // 小意外家族：移动目标时代的日常惊魂（婴儿期+幼儿园期）
      id: 'tpl_accident', name: '小意外', stage: 'both', weight: 14, minDay: 10, perDayMax: 1, cooldown: 4,
      canTrigger: (state) => G.engine.stageOf(state.day).id !== 'newborn',
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
    {
      // 父母病倒：家里没人能病。感冒/流感/隔离——年龄越大中招越勤（PARENT_AGES.sickMul）
      id: 'tpl_parent_sick', name: '父母病倒', stage: 'both', weight: 6, minDay: 5, perDayMax: 1, cooldown: 18,
      canTrigger: (state) => {
        const season = G.util.seasonOf(state);
        // 冬春高发 + 年龄档系数：高龄父母更容易中招（目标全程 2~3 次，保持稀缺感）
        const seasonP = season === 'winter' ? 0.3 : season === 'autumn' || season === 'spring' ? 0.15 : 0.06;
        const ageMul = (G.CONFIG.PARENT_AGES.find((a) => a.id === state.parentAge) || {}).sickMul || 1;
        return util.chance(seasonP * ageMul);
      },
      make(state) {
        const selfSick = util.chance(0.5); // 病的是视角本人还是伴侣
        const flu = util.chance(0.35); // 流感：更重
        const patient = selfSick ? '你' : (state.perspective === 'mama' ? '他' : '她');
        const fever = flu ? '，体温计显示 38.9℃' : '，嗓子像塞了砂纸';
        const text = flu
          ? `${patient}早上醒来就觉得不对——中午开始浑身酸痛${fever}。流感季的中招，来得毫无悬念。\n这个家最讽刺的定律：孩子病了有爸妈，爸妈病了——只剩爸妈。`
          : `${patient}开始流鼻涕、打喷嚏${fever}。普通感冒，扛一扛好像也行——但家里还有一个要抱要陪要夜里两点喂奶的小人。`;
        const choices = [
          {
            text: '戴口罩、分房睡，物理隔离',
            effects: { energy: -1, security: -1, marriage: 2 },
            result: `${patient}戴上口罩退到次卧，家人隔着门缝交流。孩子在大人之间来回找，晚上多哭了两次。\n三天后退烧，全家无人中招——科学防护，就是有点冷清。`,
          },
          {
            text: '硬撑着带，家里离了谁都不行',
            effects: (() => {
              const infected = util.chance(0.45);
              return {
                mama: -4,
                ...(infected ? { money: -300, spendKind: 'medical', security: -2 } : {}),
              };
            })(),
            result: (util.chance(0.45))
              ? '硬撑了两天，第三天孩子也烧了——38.5℃。一大一小两个病号，家里像临时诊所。你在药店和厨房之间来回跑，忽然很想念没什么用的自己一个人感冒的日子。'
              : '硬撑了三天，居然谁都没传染。感冒好了，人瘦了两斤——这个家的韧性，都是这么练出来的。',
          },
        ];
        if (['grandma', 'grandma2'].includes(state.family.careMode)) {
          choices.push({
            text: '向老人求援，让TA顶几天',
            effects: (() => {
              const elderCaught = util.chance(0.2);
              return { energy: 1, inLaw: elderCaught ? -3 : 2, ...(elderCaught ? { mama: -2 } : {}) };
            })(),
            result: (util.chance(0.2))
              ? '老人二话不说接管了一切——三天后，老人也病倒了。两代人接力病倒，这个家的运转全靠最后一根火柴。'
              : '老人二话不说接管了一切：做饭、带娃、消毒，顺手还把你泡的枸杞水骂了一顿。有些时候，救场的就是那个平时被你纠正育儿观念的人。',
          });
        }
        if (flu) {
          choices.push({
            text: '（流感）请假卧床，全家停摆一天',
            effects: { energy: -2, face: -1, marriage: 1 },
            result: '工作请假、孩子交给另一半，全家降速运行一天。世界没有停——原来停下来的只有你们，而这也够了。',
          });
        }
        return {
          title: flu ? `${patient === '你' ? '你' : patient}得了流感` : '家里有人感冒了',
          art: { pose: state.day <= 13 ? '新生儿' : state.day <= 99 ? '婴儿' : '幼儿', expr: '平静', outfit: '连体衣', scene: '家中' },
          text,
          choices,
        };
      },
    },
    {
      // 作业日常：小学家长的每晚八点档
      id: 'tpl_homework', name: '晚上八点档', stage: 'primary', weight: 14, minDay: 2, perDayMax: 1, cooldown: 6,
      canTrigger: () => true,
      make(state) {
        const scenes = [
          {
            name: '听写之夜', text: '今晚听写，"的地得"三个兄弟全军覆没。"慢慢地跑"他写成了"地"，"跑得快"写成了"的"。\n你试图用"土办法"讲解，讲到一半发现——你自己也快不会了。',
          },
          {
            name: '口算崩盘', text: '口算 100 题，对答案：错了 3 题。第 4 题是 7×8，他写了 54。\n你深吸一口气："7×8 是多少？"他不假思索："56！"——那卷子上这个 54 是谁写的？',
          },
          {
            name: '手抄报', text: '周五布置、周日交的手抄报，主题是"垃圾分类"。\n他画了两个格子就去拼乐高了。现在是周日晚上七点四十。',
          },
          {
            name: '背课文', text: '"盼望着，盼望着，东风来了，春天的脚步近了。"——朱自清的春天很美，你儿子背到"盼望着，盼望着"就卡住了，已经卡了四遍。',
          },
          {
            name: '书包考古', text: '你帮他理书包，从里面出土了：三张揉皱的卷子、半块橡皮、一根霉掉的香蕉，和两周前"需要家长签字"的通知单。',
          },
        ];
        const scene = util.pick(scenes);
        return {
          title: `作业：${scene.name}`,
          art: { pose: '少年', expr: '专注', outfit: '校服', scene: '家中·书桌' },
          text: scene.text,
          choices: [
            {
              text: '深呼吸，重头再来一遍',
              cost: { energy: 1 },
              effects: { energy: -1, habit: 2, nursingSkill: 1 },
              result: '第九遍的时候，他终于背顺了。你鼓掌，他也笑了——晚上九点半的客厅，像刚打完一场胜仗。',
            },
            {
              text: '吼完再教（教是教了，吼也是吼了）',
              effects: { security: -2, marriage: -1, habit: 1 },
              result: '作业完成了，正确率不错。他睡前小声问你："{parent}，你是不是不喜欢我了？"\n你说没有。你说完这句，在客厅黑着灯坐了一会儿。',
            },
            {
              text: '今晚算了，明天再说',
              effects: { habit: -2, mama: 1 },
              result: '手抄报第二天早上七点二十分完成了（主要是你完成的）。路上你跟他说"下次早点"，他说"哦"。\n你们都知道还有下次。',
            },
          ],
        };
      },
    },
    {
      // 自主提案：青春期的核心互动——孩子提出主张，你只能支持/反对/协商
      id: 'tpl_autonomy', name: '他有他的想法', stage: 'junior', weight: 20, minDay: 2, perDayMax: 1, cooldown: 3,
      canTrigger: () => true,
      make(state) {
        const proposals = [
          {
            name: '退掉钢琴班', text: '"我不想学钢琴了。"他说得很平静，像通知而不是商量。"我喜欢的是吉他。"\n你想起那些年练琴的傍晚——琴声和眼泪都还在耳边。',
            support: '钢琴退了，吉他报了。三个月后他能弹完整的《晴天》，眼睛里有钢琴台上从没有过的光。\n你终于分清了：你要的和他要的，一直是两件事。',
            oppose: '"学都学了六年，现在退？"他没争，回房了。\n琴声照旧每天响起——只是你听出来了，那是打卡，不是音乐。',
          },
          {
            name: '周末和同学去漫展', text: '"我们几个想去漫展，就一天，坐地铁去。"他做了个三页的"安全预案"：路线、同伴、预算。\n你看着那页纸——他在用你能接受的语言，申请自由。',
            support: '预案被批准，附加条款一条：每小时报个平安。\n他玩得很尽兴，晚上带回来一个徽章别在书包上——那是他"自己的周末"的勋章。',
            oppose: '"那种地方人多杂乱，不去。"他的预案被驳回，理由是三个字的感觉。\n他没去成漫展——去了同学家，"同学家"做了什么你不知道。被否决的申请，换成了不申请。',
          },
          {
            name: '自己上下学', text: '"别再送我了，同学都是自己走。"他在校门口五百米外就让你停车。\n后视镜里，他背对着你走进人群——步子迈得又急又硬，是逃离，也是出发。',
            support: '你妥协到"送到街口"。他走剩下的八百米，一天、一周、一学期。\n后来那八百米变成了全程——你在某个清晨忽然发现：已经很久没送过了，而他从来没有迟到。',
            oppose: '"路上车多。"你还是每天送。\n他不再抗议，只是上车就戴上耳机。车程二十分钟，静默十九分半。',
          },
          {
            name: '养一只仓鼠', text: '"我都查好了：笼子、垫料、粮食，一个月就五十块。我自己攒的零花钱买。"\n他甚至准备了《仓鼠饲养手册》的打印版。这种认真程度，比对待物理作业高出三档。',
            support: '仓鼠入住，取名"牛顿"。他每天清理垫料、控制喂食，坚持了整整两年——比任何人预期的都久。\n照顾一个比自己弱小的生命，是最好的责任感教材。',
            oppose: '"家里不养宠物，脏。"他没再提。\n那本打印的饲养手册，在书架最底层放了很多年——后来你搬家时翻到，纸都黄了。',
          },
        ];
        const p = util.pick(proposals);
        return {
          title: `提案：${p.name}`,
          art: { pose: '少年', expr: '平静', outfit: '家居服', scene: '家中' },
          text: p.text,
          choices: [
            { text: '支持——让他试试', effects: { security: 3, marriage: 1, nursingSkill: 1 }, result: p.support },
            { text: '反对——听我的', effects: { security: -2, setFlags: { '青春期·封闭': '又一次，他的想法被"不"挡了回去' } }, result: p.oppose },
            {
              text: '协商——各退一步',
              effects: { security: 1, nursingSkill: 2 },
              result: '谈判桌上你俩各有让步：他要的自由打了八折，你的底线让了两成。\n不完美，但可持续——青春期的亲子关系，本质就是一份不断重新谈判的合同。',
            },
          ],
        };
      },
    },
    {
      // 青春期日常：微小的疏离与微小的靠近
      id: 'tpl_teen_mood', name: '少年心事', stage: 'junior', weight: 14, minDay: 1, perDayMax: 1, cooldown: 3,
      canTrigger: () => true,
      make() {
        const scenes = [
          { name: '耳机时代', text: '他的耳朵里常驻一副耳机。你说话的第一遍，永远听不见。\n某天你发现他把耳机分了一只给你："{parent}，你听这段。"——那首歌你一个字都没听懂，但你听完了。', effects: { security: 1 } },
          { name: '"随便"', text: '"晚饭吃什么？""随便。""周末去哪？""随便。"\n你研究了三个月，破译了这门语言：随便=别问我+但不许不管我。难度堪比甲骨文。', effects: { mama: -1, nursingSkill: 1 } },
          { name: '深夜的灯', text: '凌晨十二点半，他房间的灯还亮着。你敲门送牛奶，看见他在刷题——不是作业，是自己的错题本。\n你没说话，把牛奶放下就出来了。有些努力，他自己知道就够了。', effects: { habit: 1, security: 1 } },
          { name: '饭桌沉默', text: '晚饭桌上，全程对话如下："好吃。""嗯。""再来一碗？""嗯。"\n你努力想找个话题，翻遍脑库存，只找到"这次月考"。话到嘴边，咽回去了——饭桌不该是审讯室。', effects: { mama: -1 } },
          { name: '同学的电话', text: '他跟同学打电话，声音又轻又快，笑了七八次，通话四十分钟。\n挂了电话你问他聊什么呢这么开心。"没什么。"\n对同学如沐春风，对家人惜字如金——这代少年的标准配置。', effects: {} },
        ];
        const scene = util.pick(scenes);
        return {
          title: `少年心事：${scene.name}`,
          art: { pose: '少年', expr: '平静', outfit: '家居服', scene: '家中' },
          text: scene.text,
          choices: [
            { text: '在旁边坐一会儿，不多说', effects: { ...scene.effects, security: 1 }, result: '陪伴青春期的正确姿势：在场，但不打扰。像一盏路灯——不追着照，但他回头时你在。' },
            { text: '找话聊，打破沉默', effects: scene.effects, result: '"你们班那个谁怎么样了？"——这个问题像万能钥匙，偶尔能打开话匣子，偶尔锁得更死。今天试了一把：开了条缝。' },
          ],
        };
      },
    },
    {
      // 高三日常：倒计时下的两百个日夜
      id: 'tpl_gaokao_daily', name: '倒计时', stage: 'senior', weight: 18, minDay: 20, perDayMax: 1, cooldown: 2,
      canTrigger: () => true,
      make() {
        const scenes = [
          {
            name: '模考过山车', text: '二模比一模高了 30 分，全家刚高兴完一个周末，三模掉了 20 分。\n他的表情像 K 线图，你的心情跟着做波段。',
            choices: [
              { text: '"看趋势，别看单点。"', effects: { security: 2, habit: 1 }, result: '你把三次成绩画成折线——整体是向上的。他盯着那条线看了很久："确实是涨的。"' },
              { text: '"掉了 20 分？！这还了得？"', effects: { security: -2, setFlags: { '成绩焦虑': '三模后的家庭气氛冰点' } }, result: '那晚饭桌上没人说话。他晚上加做了一套卷子——是恐惧在做，不是脑子。' },
            ],
          },
          {
            name: '百日誓师', text: '学校操场，红旗，誓词，广播里放着《相信自己》。他举着拳头喊口号，声音混在两千个声音里。\n你在家长群里看直播，忽然鼻子一酸。',
            choices: [
              { text: '给他写一封信，塞进书包', effects: { security: 3 }, result: '信里没提成绩，只写了三件他小时候的糗事和一句话："无论考成什么样，家里的灯给你留着。"\n后来他说，那封信他在考场上想起过。' },
              { text: '拍下誓师照片，发家族群', effects: { face: 3 }, result: '家族群瞬间沸腾。奶奶转发到了广场舞群——现在整个小区都知道你家有高三生。' },
            ],
          },
          {
            name: '晚自习的灯', text: '晚上十点，你在校门口等他。教学楼灯火通明，每一格亮着的窗户后面，都是一个伏案的十七岁。\n人流涌出来，路灯把校服照成一片蓝白。',
            choices: [
              { text: '接他，路上什么都不聊', effects: { security: 2 }, result: '车里的沉默是舒服的。偶尔他说一句"今天物理好难"，你回"嗯"。\n到了楼下他说："{parent}，明天想吃你煮的面。"这是高三最贵的点歌。' },
              { text: '让他自己走回来，锻炼独立', effects: {}, result: '他走的那条路要二十分钟。后来他告诉你，高三最喜欢的就是这二十分钟——可以不想任何题，也可以想任何事。' },
            ],
          },
        ];
        const scene = util.pick(scenes);
        return {
          title: `高三：${scene.name}`,
          art: { pose: '青年', expr: '专注', outfit: '高中校服', scene: '教室' },
          text: scene.text,
          choices: scene.choices,
        };
      },
    },
    {
      // 代沟日常：他长大了，你们的世界开始换轨
      id: 'tpl_gap', name: '代际时差', stage: 'senior', weight: 12, minDay: 2, perDayMax: 1, cooldown: 4,
      canTrigger: () => true,
      make() {
        const scenes = [
          { name: '反过来教你', text: '他教你怎么用手机银行转账、怎么识别诈骗链接、怎么把照片存到"云"上。\n"{parent}，你这个密码太简单了。"他一边嫌弃一边帮你改。你看着他操作如飞的手——什么时候轮到他教你东西了？', effects: { nursingSkill: 1, security: 1 } },
          { name: '饭桌辩论', text: '他开始跟你辩论：高考制度、内卷、他喜欢的主播、你看不懂的亚文化。\n"你不懂。"他说。你刚要反驳，忽然想起：你爸妈当年也听不懂你的磁带和金庸。', effects: { marriage: 1 } },
          { name: '深夜长谈', text: '一个不用上晚自习的晚上，他忽然话很多：讲他的困惑、未来的迷茫、以及"其实我知道你们不容易"。\n你握着茶杯听了一个小时，没敢接话——怕一接，这个频道就关了。', effects: { security: 2, marriage: 2 } },
        ];
        const scene = util.pick(scenes);
        return {
          title: `代际时差：${scene.name}`,
          art: { pose: '青年', expr: '平静', outfit: '家居服', scene: '家中' },
          text: scene.text,
          choices: [
            { text: '认真听，少说', effects: { ...scene.effects, nursingSkill: 1 }, result: '你发现了一个秘密：十七岁的孩子不需要指导，需要观众。而你是他唯一的终身观众。' },
            { text: '用你的人生经验给他指路', effects: {}, result: '"我们那时候……"你讲了十分钟。他听完说："时代不一样了，{parent}。"\n你说"道理是一样的"——他笑了笑，没反驳。那笑里有敬爱，也有距离。' },
          ],
        };
      },
    },
  ];

  // 导出内容池给事件编辑器的"数据池"面板（只读展示）
  G.POOLS = { SHOP_ITEMS, DAILY_SCENES, COMPARE_POINTS, VISITORS, FOLK_QUOTES, SHOP_CHANNELS, COMPARE_SOURCES };
})(GAME);
