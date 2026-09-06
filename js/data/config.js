// 全局配置：家庭预设、体质、气质、价格。
// 所有文件通过 GAME 命名空间共享（file:// 下双击即可运行，不用构建工具）。
var GAME = globalThis.GAME || (globalThis.GAME = {});

GAME.CONFIG = {
  VERSION: '0.1.0',
  TITLE: '寸心',
  DAILY_ENERGY: 3,         // 月子期每天的基础精力（婴儿期由 STAGES 配置覆盖）

  PRESETS: [
    {
      id: 'gongxin',
      name: '工薪家庭',
      money: 80000,
      monthlyIncome: 15000,
      desc: '六十平的老房子，存款是双方父母凑的。月子中心的传单，看一眼就折起来了。',
    },
    {
      id: 'zhongchan',
      name: '中产家庭',
      money: 400000,
      monthlyIncome: 35000,
      desc: '有房贷，但咬牙也能上得起月子中心——就是肉疼。',
    },
    {
      id: 'fuyu',
      name: '富裕家庭',
      money: 1200000,
      monthlyIncome: 65000,
      desc: '钱不是这个月要操心的事。要操心的，从来都不是钱能解决的那些。',
    },
  ],

  // 体质五档：出生时系统随机，玩家不可选。只影响路径难易，不决定结局好坏。
  CONSTITUTION_TIERS: [
    { name: '体弱多病', illnessMult: 2.2, growthMod: -2, hint: '哭声细弱，医生多看了两眼，说再观察观察。' },
    { name: '偏弱', illnessMult: 1.5, growthMod: -1, hint: '小手小脚，抱起来轻得让人心疼。' },
    { name: '正常', illnessMult: 1.0, growthMod: 0, hint: '哭声有力，抓着你的手指就不撒手。' },
    { name: '强健', illnessMult: 0.7, growthMod: 1, hint: '嗓门洪亮，整层楼都知道他来了。' },
    { name: '铁打', illnessMult: 0.5, growthMod: 2, hint: '护士抱出来的时候都夸：这孩子真结实。' },
  ],
  CONSTITUTION_WEIGHTS: [8, 18, 46, 20, 8],

  // 天生气质：出生随机、对玩家隐藏，只通过行为暴露（"影响而非控制"的核心）。
  TEMPERAMENTS: [
    { id: 'angel', name: '天使型', weight: 22, hint: '吃饱就睡，醒了也不怎么哭。' },
    { id: 'demanding', name: '高需求型', weight: 28, hint: '一放下就醒，一醒来就要抱，仿佛自带雷达。' },
    { id: 'sensitive', name: '敏感型', weight: 25, hint: '一点动静就惊醒，换个人抱就哭。' },
    { id: 'social', name: '社牛型', weight: 25, hint: '谁抱都行，见到人就手舞足蹈。' },
  ],

  // 视角：世界与数值完全相同，变的是叙事视角（文案变体 + 面板称谓）
  PERSPECTIVES: [
    {
      id: 'papa',
      name: '爸爸视角',
      desc: '你在外场奔波挣钱，也是第一次学着抱起一条小命。婆媳之间的每一道暗流，都要经过你转达。',
    },
    {
      id: 'mama',
      name: '妈妈视角',
      desc: '产后的是你，夜奶的是你，被议论"奶够不够"的也是你。这一次，选择权在你自己手里。',
    },
  ],

  // 人生阶段与主题色：带 ticks 的阶段可玩（day=全局tick，窗口按阶段内序数计算），
  // dayWeight 是每个 tick 代表的真实天数（变粒度时间轴：月子按天、婴儿期按周）
  STAGES: [
    { id: 'newborn', name: '月子期', ticks: 28, dayWeight: 1, energy: 3, unitLabel: '天' },
    { id: 'infant', name: '婴儿期', ticks: 48, dayWeight: 7, energy: 5, unitLabel: '周' },
    { id: 'toddler', name: '幼儿期', ticks: 24, dayWeight: 30, energy: 4, unitLabel: '月' },
    { id: 'kindergarten', name: '幼儿园', ticks: 36, dayWeight: 30, energy: 4, unitLabel: '月' },
    // 以下阶段仅预配置主题色，尚未开放
    { id: 'primary', name: '小学' },
    { id: 'junior', name: '初中' },
    { id: 'senior', name: '高中' },
    { id: 'college', name: '大学' },
    { id: 'adult', name: '成家立业' },
  ],

  // 幼儿园学费（月/元，按择园 flag 匹配）；公办园大班（入园第25个月起）免保教费——2025新政
  KG_TUITION: {
    '幼儿园·公办': 600,
    '幼儿园·普惠': 1500,
    '幼儿园·民办': 4500,
    '幼儿园·国际': 15000,
  },

  // 托育/阿姨的每周开销（careMode 在婴儿期切换为这些值）
  CARE_WEEKLY_COST: { daycare: 1000, nanny: 1500 },

  // 消费分类标签（effects.spendKind），满月结算的"育儿账本"按此记账
  SPEND_KINDS: {
    clothes: '衣服穿搭', toys: '玩具', medical: '医疗健康',
    care: '照护服务', party: '人情酒席', education: '早教教育',
    consumables: '日常消耗（尿不湿/奶粉）', other: '其他',
  },

  // 消耗品档位（每周自动扣费，数字来自公开市场价：新生儿月耗尿不湿约 300 片、
  // 奶粉约 3-4 罐；经济款≈¥1/片，主流款≈¥1.2-1.5/片，高端款≈¥2.5+/片）
  CONSUMABLES: {
    diaper: {
      name: '尿不湿',
      default: 'brand',
      tiers: [
        { id: 'econ', name: '经济款', weekly: 65, hint: '一片不到一块钱，量足管饱' },
        { id: 'brand', name: '大众品牌款', weekly: 105, hint: '母婴群的主流选择' },
        { id: 'premium', name: '进口高端款', weekly: 195, hint: '小红书人手一箱的"红屁屁克星"' },
      ],
    },
    formula: {
      name: '奶粉',
      default: 'mid',
      tiers: [
        { id: 'econ', name: '国产大牌', weekly: 160, hint: '老牌国企，配方够用' },
        { id: 'mid', name: '主流进口', weekly: 260, hint: '爱他美们，母婴店 C 位' },
        { id: 'premium', name: '高端有机/A2', weekly: 400, hint: '一罐抵半天工资，买的说是安心' },
      ],
    },
  },

  // 未来章节的价格基准（量级参考，来自 2025 公开收费数据）：
  // 幼儿园：公办 200-1000/月（2025 秋季起大班免保教费），普惠园限价 700-900/月，
  // 普通民办 3000-6000/月，国际/双语园 10000-25000/月
  FUTURE_TIERS: {
    kindergarten: [
      { name: '公办园', monthly: 600 },
      { name: '普惠民办园', monthly: 1500 },
      { name: '中端民办园', monthly: 4500 },
      { name: '国际/双语园', monthly: 15000 },
    ],
  },

  // 天赋六型：出生随机、对玩家隐藏，通过抓周/兴趣班/日常逐章显形。
  // 没有好坏——它决定的是"哪条路走得顺"，不是"人生的高低"。
  TALENTS: [
    { id: 'verbal', name: '语言', hint: '开口早、用词准，连谎言都撒得比人圆' },
    { id: 'logic', name: '逻辑', hint: '积木必须按颜色分类，问题能问到你想查手机' },
    { id: 'art', name: '艺术', hint: '一支笔画一下午，唱歌走调但声情并茂' },
    { id: 'sport', name: '运动', hint: '大运动样样提前，沙发就是他的珠峰' },
    { id: 'empathy', name: '共情', hint: '谁不高兴他第一个发现，会把玩具分给哭的人' },
    { id: 'handson', name: '动手', hint: '拆掉一切能拆的，包括你的手机' },
  ],

  // 疾病季节乘数（依据儿科流行规律：呼吸道冬春高发、手足口4-7月+9-11月双峰、湿疹夏冬双高发）
  SEASON_ILLNESS: {
    cold: { winter: 1.6 },
    hfmd: { spring: 1.8, summer: 1.8, autumn: 1.5 },
    eczema: { summer: 1.4, winter: 1.3 },
  },

  PRICES: {
    yueziCenter: 68000,    // 顶级月子中心
    yuesao: 13000,         // 住家育儿嫂（月）
    naming: 2000,          // 大师取名
    nurseVisit: 300,       // 社区护士上门
    lanGuang: 5000,        // 蓝光住院
    lanGuangRetry: 6000,   // 复发转院
    clinic: 300,           // 普通门诊
    feverER: 800,          // 夜间急诊
    expert: 500,           // 专家号
    partyBig: 9000,        // 满月酒大办
    partySmall: 1500,      // 至亲小聚
    swimCard: 3800,        // 婴儿游泳年卡
    sterilizer: 1600,      // 高端消毒柜
    hairPen: 1288,         // 胎毛笔+金锁
  },

  // 各档位对每日精力的影响（careMode）
  ENERGY_BY_CARE: { center: 1, yuesao: 0, grandma: 0, self: -1 },
};

// 通用工具：整数/浮点随机、加权抽取、按权重挑对象
GAME.util = {
  rand(min, max) { return min + Math.random() * (max - min); },
  randInt(min, max) { return Math.floor(GAME.util.rand(min, max + 1)); },
  chance(p) { return Math.random() < p; },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  // items: [{... , weight}] 或平行数组 (items, weights)
  weighted(items, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      roll -= weights[i];
      if (roll < 0) return items[i];
    }
    return items[items.length - 1];
  },
  clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },
  // 当前公历月（1-12）：出生月 + 已过月龄
  monthOf(state) {
    return ((state.birthMonth - 1 + Math.floor(state.ageDays / 30)) % 12) + 1;
  },
  // 当前季节：'spring' | 'summer' | 'autumn' | 'winter'
  seasonOf(state) {
    const m = GAME.util.monthOf(state);
    if (m >= 3 && m <= 5) return 'spring';
    if (m >= 6 && m <= 8) return 'summer';
    if (m >= 9 && m <= 11) return 'autumn';
    return 'winter';
  },
  fmtMoney(v) {
    const sign = v < 0 ? '-' : '';
    return sign + '¥' + Math.abs(Math.round(v)).toLocaleString('zh-CN');
  },
  fmtPct(p) { return 'P' + Math.round(p); },
};
