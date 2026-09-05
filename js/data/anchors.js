// 锚点事件：手写的主线剧情节点（区别于 templates.js 的模板流水）。
// 结构：静态事件直接写对象；需要掷骰/读状态生成文案的用 make(state) 工厂。
// choice 字段：text / cost(展示用) / conditions(不满足则置灰) / effects / result。
var GAME = globalThis.GAME || (globalThis.GAME = {});

(function (G) {
  const { util, CONFIG } = G;
  const P = CONFIG.PRICES;

  const ANCHORS = [
    // ---------- 出生 ----------
    {
      id: 'a_birth', kind: 'anchor', priority: 'main', day: [0, 0],
      title: '第一眼',
      art: { pose: '新生儿', expr: '熟睡', outfit: '包被', scene: '产房' },
      text: '产房的门开过很多次，每一次你们都弹起来，每一次都不是叫你们。\n终于，护士抱着一个皱巴巴、红扑扑、闭着眼睛的小家伙走出来，念了名字。\n那一刻大脑一片空白，只听见自己的心跳。',
      make(state) {
        if (state.perspective !== 'mama') return {};
        return {
          text: '产房的白炽灯很亮。你听见一声啼哭，然后整个世界忽然又安静、又嘈杂。\n护士把一个皱巴巴、湿漉漉的小家伙放在你胸口："来，妈妈抱一下。"\n据说门外的他，眼泪当场就下来了。',
          choices: [
            {
              text: '用尽力气，伸手抱了抱他',
              effects: { marriage: 3, security: 2, log: { text: '你人生中第一次抱起这个小人儿，累得手都在抖，但没舍得放。', hl: true } },
              result: '很轻，很烫，哭声震得你胸口发麻。你小声说了句"你好"，像认识了很多年那样。',
            },
            {
              text: '半梦半醒间问："孩子……好吗？"',
              effects: { mama: 8, marriage: 5 },
              result: '"好，都好。"他一边说一边哭。你在半梦半醒间听见他给两边爸妈打电话，声音都是抖的。',
            },
            {
              text: '被推出产房时，他正在家族群里直播',
              effects: { face: 6, mama: -2, marriage: 1 },
              result: '九宫格都已经发出去了，你的素颜特写赫然在列。"删掉！"产后第一嗓子，献给了家属群。',
            },
          ],
        };
      },
      choices: [
        {
          text: '颤抖着接过孩子',
          effects: { marriage: 3, security: 2, log: { text: '你人生中第一次抱起这个小人儿，手抖得不像话。', hl: true } },
          result: '七斤来重，小小的一团，却把你整个人压得不敢动。他皱着眉，哼了一声，抓住了你的衣角。',
        },
        {
          text: '先冲进去看妻子',
          effects: { mama: 8, marriage: 5 },
          result: '她脸色苍白，看到你的第一句话是："孩子好吗？"你点头，她的眼泪一下子涌出来。',
        },
        {
          text: '掏出手机冲进家族群报喜',
          effects: { face: 6, mama: -2, marriage: 1 },
          result: '家族群瞬间被"恭喜"刷屏。两个小时后她出来，幽幽地说："我还在里面缝针呢，你都发完朋友圈了。"',
        },
      ],
    },

    // ---------- 月子安排（本原型最大的抉择，婆媳线的第一个收敛源） ----------
    {
      id: 'a_yuezi_plan', kind: 'anchor', priority: 'main', day: [1, 3],
      conditions: { careModeIs: null },
      title: '月子怎么坐',
      art: { pose: '新生儿', expr: '熟睡', outfit: '包被', scene: '家中' },
      text: [
        {
          when: { perspectiveIs: 'mama' },
          text: '你还没出院，月子的事必须今天定下来。婆婆昨天已经把行李箱搬进了客房，说："请什么人，我来。"\n她腰不好，去年还住院看过。可她说这话时的眼神，让你没法接下一句。',
        },
        {
          text: '妻子还没出院，月子的事必须今天定下来。婆婆昨天已经把自己的行李箱搬进了客房，说："请什么人，我来。"\n她的腰不好，去年还住院看过。但她说这话时的眼神，让你没法接下一句。',
        },
      ],
      choices: [
        {
          text: '顶级月子中心，专业的事交给专业的人',
          cost: { money: P.yueziCenter },
          conditions: { moneyGte: P.yueziCenter },
          effects: {
            money: -P.yueziCenter, spendKind: 'care', mama: 15, marriage: 6, face: 6,
            careMode: 'center', setFlags: { '婆婆失落': '月子中心的决定把她排除在外' },
          },
          result: '拎包入住，护士查房，月子餐三正三副。婆婆在参观回来后很沉默，只说了一句："挺好的，就是贵。"',
        },
        {
          text: '请住家育儿嫂，婆婆搭把手',
          cost: { money: P.yuesao },
          conditions: { moneyGte: P.yuesao },
          effects: {
            money: -P.yuesao, spendKind: 'care', mama: 6, inLaw: 2, marriage: 2,
            careMode: 'yuesao',
          },
          result: '阿姨手脚麻利，夜里值主班。婆婆负责监工，每天都在挑毛病，但到底能睡个整觉了。',
        },
        {
          text: '让婆婆来，这是她的心意',
          effects: {
            inLaw: 6, mama: -4, marriage: -2,
            careMode: 'grandma', setFlags: { '婆婆主导': '月子期的家，是婆婆在主持' },
          },
          result: '婆婆进了厨房就没再出来过，一天六顿汤。她的确用心，只是"科学"两个字，不在她的字典里。',
        },
        {
          text: '谁也不麻烦，两个人自己扛',
          effects: {
            security: 4, mama: -6, marriage: -5,
            careMode: 'self',
          },
          result: '查资料、做笔记、互相打气。第一个星期你们就瘦了，但孩子每一次哼唧，你们都在。',
        },
      ],
    },

    // ---------- 取名 ----------
    {
      id: 'a_naming', kind: 'anchor', priority: 'main', day: [1, 5],
      title: '取名大战',
      art: { pose: '新生儿', expr: '平静', outfit: '包被', scene: '家中' },
      text: [
        {
          when: { perspectiveIs: 'mama' },
          text: '出生证明不能空着名字了。爷爷抱着族谱说辈分排到"绍"字；你手机里存了三年的一页名字；婆婆神神秘秘递来一张纸条：楼下大师算的，说这三个字镇得住。',
        },
        {
          text: '出生证明不能空着名字了。爷爷抱着族谱说辈分排到"绍"字；妻子手机里存了三年的一页名字；婆婆神神秘秘地递来一张纸条：楼下大师算的，说这三个字镇得住。',
        },
      ],
      make(state) {
        const boy = state.child.gender === 'boy';
        const names = boy
          ? { grandpa: '绍祺', mama: '之遥', master: '昊鑫' }
          : { grandpa: '淑仪', mama: '知夏', master: '梓萱' };
        return {
          choices: [
            {
              text: `听爷爷的，按辈分来：「${names.grandpa}」`,
              effects: { inLaw: 8, marriage: -3, face: 4, childName: names.grandpa },
              result: `爷爷当场老泪纵横。${names.grandpa}，绍字辈，族谱上从此有一笔。妈妈没说话，回去把手机里那页名字删了。`,
            },
            {
              text: `用妈妈准备了很多年的：「${names.mama}」`,
              effects: { marriage: 4, inLaw: -6, childName: names.mama },
              result: `${names.mama}。写上出生证明那一刻，妈妈轻轻念了一遍，说："欢迎你来。"婆婆嘀咕：像网名。`,
            },
            {
              text: `听大师的，三个金字压得住：「${names.master}」`,
              cost: { money: P.naming },
              conditions: { moneyGte: P.naming },
              effects: { money: -P.naming, spendKind: 'other', face: 6, inLaw: 3, childName: names.master },
              result: `大师收了两千块红包，说这孩子五行缺金。${names.master}——爷爷沉默，妈妈翻了个白眼，婆婆很满意。`,
            },
          ],
        };
      },
    },

    // ---------- 喂养方式 ----------
    {
      id: 'a_feeding', kind: 'anchor', priority: 'main', day: [1, 3],
      conditions: { feedingModeIs: null },
      title: '第一口奶',
      art: { pose: '新生儿', expr: '哭', outfit: '连体衣', scene: '家中' },
      text: [
        {
          when: { perspectiveIs: 'mama' },
          text: '开奶的疼让你倒吸一口凉气，护士说多吸才能通。另一边，他抱着奶粉罐研究了半小时成分表，试探着说："要不……你决定，我都行。"',
        },
        {
          text: '开奶的疼让她掉眼泪，护士说多吸才能通。另一边，母婴店里几十种奶粉罐排成一面墙，导购的声音在耳边回荡："最接近母乳配方，喝了聪明。"',
        },
      ],
      choices: [
        {
          text: '坚持母乳',
          effects: { feedingMode: 'mu', mama: -3, security: 1 },
          result: [
            {
              when: { perspectiveIs: 'mama' },
              text: '凌晨三点，吸奶器的哒哒声是你的背景音。你咬着牙对自己说：再试试。到底是通了。',
            },
            {
              text: '凌晨三点，吸奶器的哒哒声是这个家的背景音。她咬着牙说：再试试。到底是通了。',
            },
          ],
        },
        {
          text: '奶粉，大家都省点力',
          cost: { money: 600 },
          effects: { money: -600, spendKind: 'care', feedingMode: 'nai', mama: 3 },
          result: '洗奶瓶、控水温、按比例，一个月用掉四罐。她终于能睡整段觉了，就是总有人问："怎么不喂母乳？"',
        },
        {
          text: '混合喂养，各取所长',
          effects: { feedingMode: 'mix' },
          result: '白天母乳，夜里那一顿交给奶粉。这是你们研究了一晚上得出的、最像外交条约的方案。',
        },
      ],
    },

    // ---------- 黄疸（含恶化后续，风险链演示） ----------
    {
      id: 'a_jaundice', kind: 'anchor', priority: 'main', day: [3, 5],
      title: '黄疸来了',
      art: { pose: '新生儿', expr: '不适', outfit: '包被', scene: '医院' },
      make(state) {
        const weak = state.child.constitution <= 1 || state.child.birthWeight < 2.5;
        let severity;
        if (util.chance(0.05 + (weak ? 0.1 : 0))) severity = 'severe';
        else if (util.chance(0.33 + (weak ? 0.06 : 0))) severity = 'moderate';
        else severity = 'mild';

        const textBySeverity = {
          mild: '出院前的例行检测：面部微微泛黄。医生说多数新生儿都有，多吃多排，会自己退。',
          moderate: '社区上门测黄疸，数值偏高，黄已经从脸蔓延到胸口。医生建议：每天来测，最好住院照蓝光。',
          severe: '经皮胆红素明显超标，医生直接开了单子："别回去了，现在就办住院，照蓝光。"',
        };
        const observeChance = { mild: 0.12, moderate: 0.5, severe: 0.85 }[severity];
        const folkChance = { mild: 0.3, moderate: 0.68, severe: 0.95 }[severity];

        const choices = [
          {
            text: '遵医嘱，照蓝光',
            cost: { money: P.lanGuang },
            effects: { money: -P.lanGuang, spendKind: 'medical', mama: -4 },
            result: severity === 'mild'
              ? '其实数值不算高，医生也说可以回家观察，但你们不敢赌。三天蓝光，白回来一个黄胖子。这笔钱买的是安心。'
              : '小小的人独自躺在蓝光箱里，蒙着眼罩，你们隔玻璃看着，谁也没说话。一周后，数值正常，出院。',
          },
        ];
        if (severity !== 'severe') {
          choices.push({
            text: '带回家，多吃多排，天天晒太阳观察',
            effects: {
              setFlags: { '黄疸观察中': '带回家观察的胆红素' },
              later: [{
                afterDays: 2, chance: observeChance, eventId: 'follow_jaundice_worse',
                preview: '黄疸退不下去的话，观察就成了拖延。',
              }],
            },
            result: '从此每天早上第一件事：拉开窗帘晒黄疸，喂奶，记录大便颜色。你在备忘录里建了个表格。',
          });
          choices.push({
            text: '听婆婆的：葡萄糖水 + 金银花，退胎黄',
            effects: {
              setFlags: { '黄疸观察中': '土方观察中', '黄疸土方': '葡萄糖水退黄' },
              later: [{
                afterDays: 2, chance: folkChance, eventId: 'follow_jaundice_worse',
                preview: '偏方赌赢了是运气，赌输了是孩子受罪。',
              }],
            },
            result: '婆婆连夜熬了金银花水，一小勺一小勺地喂。她说你们仨都是这么退的黄，"医院的蓝光，那是遭罪"。',
          });
        }
        return { text: textBySeverity[severity], choices };
      },
    },

    // ---------- 尿不湿档位（每周自动扣费的第一个决定） ----------
    {
      id: 'a_diaper_tier', kind: 'anchor', priority: 'main', day: [2, 4],
      title: '尿不湿，定哪个档',
      art: { pose: '新生儿', expr: '平静', outfit: '连体衣', scene: '家中' },
      text: '待产包里的尿不湿见底了，得定下长期用的牌子。母婴群里正在接龙，价格差了三倍，每一层楼都说自己用的是"红屁屁克星"。\n这是这个家第一笔"每周都要付"的钱。',
      make() {
        const { diaper } = G.CONFIG.CONSUMABLES;
        const build = (tier, extra) => ({
          text: `${tier.name}（每周约 ${util.fmtMoney(tier.weekly)}）——${tier.hint}`,
          effects: { setConsumable: { diaper: tier.id }, ...(extra || {}) },
        });
        return {
          choices: [
            {
              ...build(diaper.tiers[0]),
              result: '一片不到一块钱，垫上就是了。婆婆很赞成："我们那时候用尿布，不也过来了。"你没说的是：便宜款透气性差一截，这个赌注，押的是他的小屁股。',
            },
            {
              ...build(diaper.tiers[1]),
              result: '母婴群的主流答案。不便宜也不心疼，红屁屁概率不高不低——中产的选择，中产的味道。',
            },
            {
              ...build(diaper.tiers[2], { face: 1 }),
              result: '小红书人手一箱。拆箱的时候你闻了闻，确实有股"贵"的味道。这个月少下两次馆子，就当给他的屁股投资。',
            },
          ],
        };
      },
    },

    // ---------- 奶粉档位（仅奶粉/混合喂养） ----------
    {
      id: 'a_formula_tier', kind: 'anchor', priority: 'main', day: [3, 6],
      conditions: { feedingModeIn: ['nai', 'mix'] },
      title: '奶粉，定哪个档',
      art: { pose: '新生儿', expr: '熟睡', outfit: '连体衣', scene: '商场' },
      text: '奶粉罐要按月买了。货架从一百多排到四百多，导购说："一段最关键，别在口粮上省。"\n这句话对不对不知道，但它确实起效了。',
      make() {
        const { formula } = G.CONFIG.CONSUMABLES;
        const build = (tier, extra) => ({
          text: `${tier.name}（每周约 ${util.fmtMoney(tier.weekly)}）——${tier.hint}`,
          effects: { setConsumable: { formula: tier.id }, ...(extra || {}) },
        });
        return {
          choices: [
            {
              ...build(formula.tiers[0]),
              result: '老牌国产，配方表你逐行研究过，挑不出毛病。婆婆说"我们喝米汤都长大了"，这句话你决定不接。',
            },
            {
              ...build(formula.tiers[1], { mama: 2 }),
              result: '母婴店 C 位，广告里全是科研感。多花的那部分钱买没买到营养不好说，买到了安心是真的。',
            },
            {
              ...build(formula.tiers[2], { face: 2 }),
              result: 'A2 蛋白、有机认证、罐身一圈金边。结账时你想起点开过的一个冷知识：三百块的奶粉，成本可能不到六十。但你还是买了。',
            },
          ],
        };
      },
    },

    // ---------- 账本见红（负债危机线） ----------
    {
      id: 'a_debt', kind: 'anchor', priority: 'main', day: [5, 27],
      conditions: { moneyLte: -100 },
      title: '账本见红了',
      art: { pose: '婴儿', expr: '平静', outfit: '连体衣', scene: '家中·深夜' },
      text: '深夜你翻开记账 App，手指停住了——存款那一栏，出现了这几个月来的第一个负号。\n下个星期还有尿不湿和奶粉，工资还有半个月。这笔账，怎么平？',
      choices: [
        {
          text: '找双方父母周转',
          effects: {
            money: 15000, inLaw: -6, face: -4,
            setFlags: { '接济': '账本见红，向老人开了口' },
          },
          result: '电话里没人说不行。第二天钱到账，附赠一句"省着点花"。你在备忘录里记下这笔账——钱的和情绪的，都记下了。',
        },
        {
          text: '信用卡分期先顶上',
          effects: {
            money: 8000,
            setFlags: { '卡债': '这个月的账单，先欠着' },
            later: [{ afterDays: 6, chance: 1, effects: { money: -900, spendKind: 'other' }, preview: '分期的利息，安静地躺在下个账单日。' }],
          },
          result: '额度批得很快，钱到账的短信和"最低还款"的提醒只隔了三秒。这个月平了，下个月的坑在后面等着。',
        },
        {
          text: '全家进入紧缩模式',
          effects: { setConsumable: { diaper: 'econ' }, mama: -3, marriage: -2 },
          result: '尿不湿换回经济款，购物车清空，奶瓶消毒改成开水煮。日子能过，就是每个人都紧了一点。',
        },
      ],
    },

    // ---------- 婚姻红线（离婚分支的种子章） ----------
    {
      id: 'a_marriage_redline', kind: 'anchor', priority: 'main', day: [6, 27],
      conditions: { familyLte: { marriage: 46 } },
      title: '"离婚"两个字，第一次出现',
      art: { pose: '婴儿', expr: '哭', outfit: '连体衣', scene: '家中·凌晨' },
      text: '又是一场从奶粉温度吵到人生选择的凌晨。吵到最后，不知道是谁先说的——"离婚"两个字，第一次出现在了这个家。\n房间里安静下来，只剩孩子被吵醒后的抽泣。谁都没再去抱他。',
      choices: [
        {
          text: '天亮之前，把话摊开说',
          cost: { energy: 2 },
          effects: {
            energy: -2, marriage: 12, security: 2,
            setFlags: { '悬崖边拉回': '红灯之夜，你们把话说完了' },
          },
          result: '凌晨四点，两个人坐在餐桌前，从"我们怎么了"说到"我们还要不要"。没吵出胜负——但都说完了。天亮的时候，他先去抱了孩子。',
        },
        {
          text: '先这样吧，各睡各的',
          effects: { marriage: -5, setFlags: { '月子仇': '红灯之夜，谁也没退' } },
          result: '一个主卧一个客房，中间隔着婴儿房。日子照常过，话越来越少。有些东西碎掉了，当晚谁也没听见响声。',
        },
        {
          text: '让老人来评评理',
          effects: { marriage: 2, inLaw: -6, setFlags: { '月子仇': '老人搅进来的那一夜' } },
          result: '老人凌晨被电话叫醒，各有各的立场，各帮各的孩子。火上浇的是油，理没评出来，两家人的账倒是都翻出来了。',
        },
        {
          text: '"都是孩子闹的，忍忍就过去了"',
          effects: { mama: -3, marriage: -2, setFlags: { '月子仇': '你把忍当成了办法' } },
          result: '这句话说出口的瞬间，你看见她的眼神暗了下去。忍不是办法——它只是把利息调到了以后。',
        },
      ],
    },

    // ---------- 定期体检（day 7/14/21，读生长曲线生成文案） ----------
    {
      id: 'a_growth_d7', kind: 'anchor', priority: 'side', day: [7, 7],
      title: '第七天·体重秤上的数字',
      art: { pose: '新生儿', expr: '平静', outfit: '连体衣', scene: '家中' },
      make(state) { return G.makeGrowthCheck(state, 7); },
    },
    {
      id: 'a_growth_d14', kind: 'anchor', priority: 'side', day: [14, 14],
      title: '第十四天·社区儿保',
      art: { pose: '婴儿', expr: '平静', outfit: '连体衣', scene: '医院' },
      make(state) { return G.makeGrowthCheck(state, 14); },
    },
    {
      id: 'a_growth_d21', kind: 'anchor', priority: 'side', day: [21, 21],
      title: '第二十一天·体重复盘',
      art: { pose: '婴儿', expr: '平静', outfit: '连体衣', scene: '家中' },
      make(state) { return G.makeGrowthCheck(state, 21); },
    },

    // ---------- 脐带护理（婆婆主导线专属） ----------
    {
      id: 'a_cord', kind: 'anchor', priority: 'main', day: [8, 14],
      conditions: { careModeIs: 'grandma' },
      title: '脐带残端的护理',
      art: { pose: '新生儿', expr: '平静', outfit: '尿布', scene: '家中' },
      text: '脐带残端还没掉。你按护士教的一天两次碘伏消毒，婆婆拦住你："别碰它！我们那时候用紫药水一抹，自然就掉了。碰多了要发炎的。"',
      choices: [
        {
          text: '坚持科学护理，每天碘伏',
          effects: { marriage: 2, inLaw: -4, nursingSkill: 1 },
          result: '婆婆在旁边看着你消毒，全程叹气。第七天，脐带完好脱落，肚脐眼干干净净。她没说话，但下次消毒没再拦你。',
        },
        {
          text: '依婆婆的，紫药水',
          effects: { inLaw: 6, marriage: -2, setFlags: { '脐带土法': '紫药水护理脐带' } },
          result: '紫药水抹上去，紫红一片，看不出红肿也看不出渗液。婆婆很满意："这样捂着才好得快。"',
        },
        {
          text: '请社区护士上门演示',
          cost: { money: P.nurseVisit },
          effects: { money: -P.nurseVisit, spendKind: 'care', inLaw: 2, marriage: 2, nursingSkill: 1 },
          result: '护士上门演示了一遍标准消毒，婆婆全程点头："专业的就是不一样。"同一件事，不一样的人说，效果天差地别。',
        },
      ],
    },

    // ---------- 夜醒风暴（由夜哭模板累计触发） ----------
    {
      id: 'a_nightstorm', kind: 'anchor', priority: 'main', day: [12, 22],
      conditions: { childGte: { nightWakeStreak: 5 } },
      title: '夜醒风暴',
      art: { pose: '婴儿', expr: '大哭', outfit: '连体衣', scene: '家中·凌晨' },
      text: [
        {
          when: { perspectiveIs: 'mama' },
          text: '连续不知道第几个凌晨三点，客厅永远坐着一个人影，怀里抱着一个终于睡着的炸弹。\n你们很久没在同一个时间醒来了。有一天夜里你抱着孩子坐在床边，眼泪没忍住，掉在了他的后颈上——他太累了，没有醒。',
        },
        {
          text: '连续不知道第几个凌晨三点，客厅永远坐着一个人影，怀里抱着一个终于睡着的炸弹。\n你们很久没在同一个时间醒来了。有一天夜里你听见她小声哭，孩子也在哭，两边的哭声混在一起。',
        },
      ],
      choices: [
        {
          text: '爸爸全包下半夜',
          effects: { energy: -1, mama: 8, marriage: 6, security: 3, nightWakeStreak: -5, setFlags: { '夜醒风暴亲历者': '凌晨三点的班，你替她值了' } },
          result: [
            {
              when: { perspectiveIs: 'mama' },
              text: '从此凌晨三点是他的班。白天他开会站着都能睡着，但你说"这辈子没这么爱过你"的时候，是真心的。',
            },
            {
              text: '从此凌晨三点是你的班。白天开会站着都能睡着，但她说"这辈子没这么爱过你"。',
            },
          ],
        },
        {
          text: [
            { when: { perspectiveIs: 'mama' }, text: '妈妈全包，他负责白天' },
            { text: '妈妈全包，你负责白天' },
          ],
          effects: { mama: -10, security: 3, nightWakeStreak: -5, setFlags: { '妈妈透支': '夜醒风暴里她扛了大半', '夜醒风暴亲历者': '她一个人扛过了大半夜' } },
          result: [
            {
              when: { perspectiveIs: 'mama' },
              text: '你说你来——"你抱他总要醒"，这句话你都说过多少次了。一个月后你瘦了六斤，眼下的乌青再也盖不住了。',
            },
            {
              text: '她说她来，因为"你抱他总要醒"。一个月后她瘦了六斤，眼下的乌青再也盖不住了。',
            },
          ],
        },
        {
          text: '严格轮流，写进备忘录',
          effects: { marriage: 4, mama: 3, energy: -1, nightWakeStreak: -5, setFlags: { '夜醒风暴亲历者': '严格轮班的战友' } },
          result: '单日单周，严格轮换，交接班要汇报奶量和换尿布次数。像打仗，但至少是两个人一起打。',
        },
        {
          text: '把孩子抱去婆婆屋里睡',
          effects: { energy: 1, inLaw: -6, security: -3, nightWakeStreak: -5, setFlags: { '夜醒风暴亲历者': '那段时间孩子夜里跟着奶奶' } },
          result: '你们终于睡了整觉。婆婆第二天说没事，但脸色骗不了人。孩子夜里换了个人抱，哭了两场。',
        },
      ],
    },

    // ---------- 产后情绪（延迟后果的旗舰演示） ----------
    {
      id: 'a_mama_blue', kind: 'anchor', priority: 'main', day: [14, 24],
      conditions: { anyOf: [{ familyLte: { mama: 58 } }, { careModeIs: 'self' }] },
      title: '她最近不太对劲',
      art: { pose: '婴儿', expr: '熟睡', outfit: '连体衣', scene: '家中' },
      text: '她开始对什么都提不起兴趣。喂奶的时候盯着窗外，一坐就是半小时。孩子哭了她也会抱，但像是在完成任务。\n你想起网上那个词：产后抑郁。又想：不至于吧，家里事也不多。',
      make(state) {
        if (state.perspective !== 'mama') return {};
        return {
          title: '撑不住的时候',
          text: '你开始对什么都提不起兴趣。喂奶的时候盯着窗外，一坐就是半小时。孩子哭了你也会抱，但像是在完成任务。\n深夜你搜了"产后抑郁"三个字，看了一半，又默默删掉了记录——不至于吧？可为什么总是想哭。',
          choices: [
            {
              text: '把感受原原本本说给他听',
              cost: { energy: 2 },
              effects: {
                energy: -2, mama: 16, marriage: 8,
                setFlags: { '被看见': '你说出来了，他也停下来了' },
              },
              result: '他愣了很久，然后说："我请假。"那一周他没碰工作，做饭、抱着孩子遛弯、听你翻来覆去讲月子里受的委屈。你哭了一场，然后睡了很长的一觉。',
            },
            {
              text: '"都是我该做的，别矫情了"（你对自己说）',
              effects: {
                mama: -14, marriage: -4,
                setFlags: { '产后情绪被忽视': '你把搜索记录删了，把话咽了回去' },
              },
              result: '你把搜索记录删了，把话咽了回去。有些情绪不会消失，只会改期。',
            },
            {
              text: '把亲妈接来住一阵',
              cost: { money: 800 },
              effects: { money: -800, spendKind: 'other', mama: 10, inLaw: -5, marriage: 2 },
              result: '亲妈来的那天，你在她怀里哭了一场，像回到了小时候。婆婆的表情有些复杂——两个妈的磁场，需要他从中斡旋。',
            },
          ],
        };
      },
      choices: [
        {
          text: '请一周假，认真陪她',
          cost: { energy: 2 },
          effects: {
            energy: -2, mama: 16, marriage: 8,
            setFlags: { '被看见': '她最低落的那周，你请了假' },
          },
          result: '那一周你没碰工作。做饭、抱着孩子遛弯、听她翻来覆去讲月子里受的委屈。她哭了一场，然后睡了很长的一觉。',
        },
        {
          text: '"哪个女人不生孩子，别矫情"',
          effects: {
            mama: -14, marriage: -8,
            setFlags: { '产后情绪被忽视': '你觉得她在矫情' },
          },
          result: '她愣了一下，说"哦"，转身进了房间。那扇门后来关上的次数，越来越多。',
        },
        {
          text: '把丈母娘接来住一阵',
          cost: { money: 800 },
          effects: { money: -800, spendKind: 'other', mama: 10, inLaw: -5, marriage: 2 },
          result: '亲妈来了，她肉眼可见地松了下来。婆婆的表情有些复杂——两个妈的磁场，需要你从中斡旋。',
        },
      ],
    },

    // ---------- 婆媳破裂线 ----------
    {
      id: 'a_poxi_break', kind: 'anchor', priority: 'main', day: [16, 26],
      conditions: {
        careModeIs: 'grandma',
        anyOf: [{ familyLte: { inLaw: 52 } }, { flagsAll: ['婆媳紧张'] }],
      },
      title: '婆婆收拾了行李',
      art: { pose: '婴儿', expr: '平静', outfit: '连体衣', scene: '家中' },
      text: [
        {
          when: { perspectiveIs: 'mama' },
          text: '导火索是一件小事：婆婆偷偷给孩子喂了黄连水，说是去胎毒，被你抓了个正着。\n但行李箱立在门口的时候你明白，压垮的不是这一根稻草——这些年你咽下去的那些，都装在这个箱子里。',
        },
        {
          text: '导火索是一件小事：她偷偷给孩子喂了黄连水，说是去胎毒，被你撞见。\n但行李箱立在门口的时候你明白，压垮的不是这一根稻草。',
        },
      ],
      choices: [
        {
          text: [
            { when: { perspectiveIs: 'mama' }, text: '让他去劝，把婆婆留下来' },
            { text: '认错，把她留下来' },
          ],
          effects: { inLaw: 14, marriage: -4, face: -3 },
          result: [
            {
              when: { perspectiveIs: 'mama' },
              text: '他出面说尽了好话，婆婆红着眼圈把箱子推回去了。你什么也没说——认错的不是你，受委屈的从头到尾是你。',
            },
            {
              text: '你说尽了好话，她红着眼圈把箱子推回去了。这件事你妻子记了很久——认错的是你，受委屈的在她看来是她。',
            },
          ],
        },
        {
          text: '让她回去，临时请育儿嫂',
          cost: { money: P.yuesao },
          effects: { money: -P.yuesao, spendKind: 'care', careMode: 'yuesao', inLaw: 4, mama: 4, marriage: 4 },
          result: '婆婆走的时候在门口站了很久。家里安静了，科学了，也空了一块。她在电话里跟老姐妹说：那边用不上我了。',
        },
        {
          text: '让她回去，自己咬牙顶上',
          effects: { careMode: 'self', mama: -4, security: 2, marriage: 2 },
          result: '从此夜班是你的，早班是她的，你顶着黑眼圈学会了全套技能。累，但这个家终于只剩一种声音。',
        },
      ],
    },

    // ---------- 夫妻冷战 ----------
    {
      id: 'a_cold_war', kind: 'anchor', priority: 'main', day: [8, 26], repeat: 6,
      conditions: {
        anyOf: [{ familyLte: { marriage: 55 } }, { flagsAll: ['妈妈透支'] }],
      },
      title: '凌晨一点的争吵',
      art: { pose: '婴儿', expr: '委屈', outfit: '连体衣', scene: '家中·厨房' },
      text: '导火索是"冲奶粉到底该用 40 度还是 45 度"。声音压得很低，因为孩子刚睡着。\n其实谁都知道，吵的不是水温，是这一个月攒下的、没处安放的累。',
      choices: [
        {
          text: '先低头："是我没弄好，你去睡"',
          effects: { marriage: 8, energy: -1 },
          result: '她愣住，眼泪下来了："我不是冲你。"那晚你们坐在厨房地板上，把该说的话说完了。',
        },
        {
          text: '摔门出去透了口气',
          effects: { marriage: -6, mama: -4 },
          result: '楼下便利店坐了一个小时。回来时她背对着门，孩子在你妈屋里。谁也没再提那晚。',
        },
        {
          text: '翻出说明书，就事论事',
          effects: { marriage: 2 },
          result: '说明书上写着 40-50 度均可。你们对着那行字看了半天，不知道谁先笑的。仗没打成。',
        },
      ],
    },

    // ---------- 第一次笑 ----------
    {
      id: 'a_first_smile', kind: 'anchor', priority: 'main', day: [18, 26],
      title: '第一次笑',
      art: { pose: '婴儿', expr: '笑', outfit: '连体衣', scene: '家中·清晨' },
      text: '清晨六点，换尿布的间隙，他忽然停了一下，然后冲你咧开没牙的嘴，"咯咯"地笑出了声。\n你确定那不是胀气。你百分之百确定，那是在冲你笑。',
      choices: [
        {
          text: '压着嗓子喊妻子来看',
          effects: { marriage: 5, security: 2, log: { text: '清晨六点，他第一次笑出了声。你们俩蹑手蹑脚挤在婴儿床边，像围观什么世界奇迹。', hl: true } },
          result: '两个人蹲在床边看了十分钟，一遍遍重复"再来一个"。他没再笑，但一直看着你们。',
        },
        {
          text: '拍下来发家族群',
          effects: { face: 5, marriage: 2 },
          result: '九宫格配文"人类幼崽官方认证营业"。婆婆秒回六个大拇指，外婆打来电话，笑得比孩子还响。',
        },
        {
          text: '愣在原地，眼眶一热',
          effects: { marriage: 3, security: 2 },
          result: '这一个月所有凌晨的闹钟、洗不完的奶瓶、吸奶器的声音，忽然都值了。你把脸轻轻贴上去，他抓了抓你的头发。',
        },
      ],
    },

    // ---------- 满月酒 ----------
    {
      id: 'a_fullmoon_party', kind: 'anchor', priority: 'main', day: [25, 26],
      title: '满月酒，办不办',
      art: { pose: '婴儿', expr: '熟睡', outfit: '礼服', scene: '酒店' },
      make(state) {
        const gift = util.randInt(5000, 9000);
        const isMama = state.perspective === 'mama';
        return {
          text: isMama
            ? '按老家的规矩，满月要办酒。婆婆已经拟好了名单：三桌起步。你的意思是家里吃顿饭就行——孩子太小，你自己也还没缓过来。'
            : '按老家的规矩，满月要办酒。婆婆已经拟好了名单：三桌起步。妻子的意思是家里吃个饭就行，孩子太小，别折腾。',
          choices: [
            {
              text: '大办，给足婆婆面子',
              cost: { money: P.partyBig },
              effects: {
                money: -P.partyBig, income: gift, spendKind: 'party', face: 12, inLaw: 6, mama: -6,
                log: { text: '满月酒三桌，孩子穿着小礼服被抱出来展览，收了一堆长命锁和红包。', hl: true },
              },
              result: `三桌酒席，孩子被轮番抱了一圈，睡了醒醒了哭。礼金收了 ${util.fmtMoney(gift)}，婆婆全程笑得合不拢嘴。${isMama ? '回家的车上，你一句话也不想说。' : '回家路上，妻子一句话也没说。'}`,
            },
            {
              text: '至亲小聚一顿',
              cost: { money: P.partySmall },
              effects: { money: -P.partySmall, income: 2000, spendKind: 'party', face: 2, mama: 2, inLaw: 2 },
              result: '一桌人，一锅汤，孩子睡在婴儿床里全程没被打扰。简单，但什么都齐了。礼金聊胜于无。',
            },
            {
              text: '不办了，仪式感自己给',
              effects: { face: -8, inLaw: -8, mama: 6, marriage: 2 },
              result: '婆婆打了两天电话跟亲戚解释。你们在家给孩子拍了一组照片，手写了封信，塞进了他的百宝箱。面子这东西，丢就丢了吧。',
            },
          ],
        };
      },
    },

    // ---------- 满月体检（终章事件） ----------
    {
      id: 'a_fullmoon_checkup', kind: 'anchor', priority: 'main', day: [27, 27],
      title: '满月体检',
      art: { pose: '婴儿', expr: '平静', outfit: '连体衣', scene: '医院' },
      make(state) {
        const wp = Math.round(G.growth.weightPercentile(state));
        const wpText = wp >= 85
          ? '体重冲到了生长曲线的上沿，医生笑着打趣"养得真好"，又补了一句"注意别过度喂养"。'
          : wp <= 15
            ? '体重曲线贴着下限走，医生多问了几句奶量，你们的心的确揪了一下。'
            : '体重身长都稳稳落在正常区间，医生说：很好，继续。';
        return {
          text: `二十八天，就这样过去了。\n体检台很凉，他哭了两嗓子。各项数据量完：${wpText}\n${G.CONFIG.TEMPERAMENTS.find(t => t.id === state.child.temperament).hint}——此刻的你，还读不懂这句话的分量。`,
          choices: [
            {
              text: '长舒一口气',
              effects: { mama: 2, marriage: 2 },
              result: '不管这二十八天多难，孩子健康，就是满分答卷的第一题。',
            },
            {
              text: '当场搜起了"早教班几个月上合适"',
              effects: { energy: -1, setFlags: { '焦虑父母': '满月当天就开始研究早教' } },
              result: '搜索记录从"黄疸多久退"变成了"早教班有没有用"。第一场军备竞赛的枪声，是你自己打响的。',
            },
            {
              text: '抱着孩子，认真拍了张全家福',
              effects: { marriage: 3, log: { text: '满月体检完，医院门口的合影。三个人都有些憔悴，都在笑。', hl: true } },
              result: '医院门口，自拍杆举了三次才框下所有人。多年以后这张照片会被翻出来，成为一切的起点。',
            },
          ],
        };
      },
    },

    // ============================================================
    // 第二章 · 婴儿期（满月 → 1 岁生日，按周推进）
    // ============================================================

    // ---------- 产假结束，孩子谁带（本章最大抉择） ----------
    {
      id: 'a_back_to_work', kind: 'anchor', priority: 'main', day: [1, 6], stage: 'infant',
      title: '产假倒计时',
      art: { pose: '婴儿', expr: '熟睡', outfit: '连体衣', scene: '家中' },
      text: '产假进入最后两周。重返职场的日子定下来了，但"孩子谁来带"这张答卷，必须本周交。\n你们列了个表：老人、托育机构、住家阿姨、自己带——四个选项，各有各的账，钱的账和别的账。',
      choices: [
        {
          text: '老人来带（免费，但……）',
          effects: { careMode: 'grandma2', inLaw: 2, marriage: -1, setFlags: { '隔代养育': '产假结束后，老人搬了进来' } },
          result: '行李箱又一次出现在玄关。钱是省下了，但你隐约知道：这个家的权力结构，从今天起改写了。',
        },
        {
          text: '送托育机构（每周约 ¥1,000）',
          effects: { careMode: 'daycare', security: -2 },
          result: '面了三家：一家太远，一家太贵，一家老师说"我们主张自主进食"——你听成了"不喂饭"。定下的这家，老师抱他的手法很熟练。只是第一个月，生病是躲不掉的学费。',
        },
        {
          text: '请住家阿姨（每周约 ¥1,500）',
          effects: { careMode: 'nanny', mama: 3 },
          result: '阿姨做事麻利，孩子三天就跟她熟了。你在监控里看了一个星期，第五天开始，只偶尔看一眼了。',
        },
        {
          text: '妈妈辞职，自己带',
          effects: {
            careMode: 'stayhome', monthlyIncomeMul: 0.55, security: 2, mama: 3,
            setFlags: { '全职妈妈': '她把工牌收进了抽屉最里面' },
          },
          result: '辞职信发出去的那一刻她哭了，说不清是舍不得还是解脱。家庭收入少了一半——从今天起，每一笔支出都要重新算。',
        },
      ],
    },

    // ---------- 自费疫苗档位 ----------
    {
      id: 'a_paid_vaccine', kind: 'anchor', priority: 'main', day: [3, 8], stage: 'infant',
      title: '自费疫苗，打不打',
      art: { pose: '婴儿', expr: '大哭', outfit: '连体衣', scene: '医院' },
      text: '社区医院的通知单上列着：一类疫苗免费，必须打。下面还有一行小字：五联、肺炎13价、轮状病毒……自费，自愿。\n"自愿"两个字，是这个世界最贵的东西之一。',
      choices: [
        {
          text: '只打免费的一类疫苗',
          effects: {
            later: [{ afterDays: 30, chance: 0.12, effects: { money: -300, spendKind: 'medical' }, preview: '少打的针，不一定变成病；变成病的时候，才知道值不值。' }],
          },
          result: '医生面无表情地说"也可以"。你在接种室外面坐了一会儿，把手机里收藏的科普文章又读了一遍。',
        },
        {
          text: '加五联和轮状（少挨十来针）', cost: { money: 2500 },
          effects: { money: -2500, spendKind: 'medical', nursingSkill: 1 },
          result: '一针顶五针，孩子少哭，大人少跑。付费窗口前排队的父母，脸上都是同一种表情：心疼钱，更心疼针。',
        },
        {
          text: '全套安排：肺炎13价也上', cost: { money: 6000 },
          effects: { money: -6000, spendKind: 'medical', face: 2 },
          result: '接种本上盖满了章。妈妈群里问起来，你轻描淡写地说"都打了"——这句话在这个圈子里，约等于低调的炫富。',
        },
      ],
    },

    // ---------- 翻身 ----------
    {
      id: 'a_roll_over', kind: 'anchor', priority: 'main', day: [8, 16], stage: 'infant',
      title: '他会翻身了',
      art: { pose: '婴儿', expr: '笑', outfit: '连体衣', scene: '家中' },
      make(state) {
        const fast = state.child.constitution >= 3;
        const slow = state.child.constitution <= 1;
        const flavor = fast
          ? '比书上写的早了半个月。'
          : slow
            ? '比书上写的晚了些，医生说再观察——"每个孩子有自己的节奏"，这句话你已经听了八百遍。'
            : '不早不晚，正是教科书上的时间。';
        return {
          text: `某天清晨，你进房间看他，发现他趴着睡着了——自己翻过来的。${flavor}\n从今天起，"放在哪儿"不再是一个安全的问题。`,
          choices: [
            {
              text: '每天安排趴练，练起来',
              effects: { energy: -1, security: 1, nursingSkill: 1 },
              result: '毛巾卷、摇铃引逗、每天两次"健身房"。他翻得越来越溜，你腰越来越酸。',
            },
            {
              text: '顺其自然，床上装个围栏就好',
              cost: { money: 150 },
              effects: { money: -150, spendKind: 'care' },
              result: '围栏到货那天，他在里面翻了个身，冲你笑。发育这件事，好像真的急不来。',
            },
          ],
        };
      },
    },

    // ---------- 认生期 ----------
    {
      id: 'a_stranger_anxiety', kind: 'anchor', priority: 'main', day: [12, 20], stage: 'infant',
      title: '他开始认生了',
      art: { pose: '婴儿', expr: '大哭', outfit: '连体衣', scene: '亲戚家' },
      make(state) {
        const sensitive = state.child.temperament === 'sensitive';
        return {
          text: sensitive
            ? '亲戚伸手要抱，他"哇"地哭到打嗝，小手死死抓住你的衣领。敏感型的孩子，认生来得又早又猛——七大姑八大姨的手，在他的世界里都是入侵。'
            : '亲戚伸手要抱，他先愣住，再瘪嘴，然后哭。以前谁都抱得走的小甜甜，突然变成了只认爸妈的小刺猬。',
          choices: [
            {
              text: '多带出门，慢慢脱敏',
              cost: { energy: 1 },
              effects: { energy: -1, security: 1 },
              result: '每天下楼、逛超市、去亲子餐厅。一个月后，他终于肯让电梯里遇到的奶奶摸一下手——重大外交突破。',
            },
            {
              text: '在家稳着，少见生人',
              effects: { security: 1 },
              result: '这段时间就少聚会吧。他的世界小一点，但很安稳。',
            },
            {
              text: '多让亲戚抱一抱，练练胆子',
              effects: { security: -3 },
              result: '他哭，你硬着头皮递过去："没事没事，哭哭就好了。"哭是好了，抱他的时候，他往你怀里钻得比以前更深。',
            },
          ],
        };
      },
    },

    // ---------- 出牙与夜醒回潮 ----------
    {
      id: 'a_teething', kind: 'anchor', priority: 'main', day: [16, 26], stage: 'infant',
      title: '出牙了，夜醒也回来了',
      art: { pose: '婴儿', expr: '不适', outfit: '连体衣', scene: '家中·凌晨' },
      text: '下牙床冒出两个小白点。白天他逮什么啃什么，夜里——睡得好好的日子，结束了。\n夜醒回潮，比月子那次还磨人：这次他醒，是疼。',
      choices: [
        {
          text: '冷藏牙胶 + 睡前按摩牙床',
          cost: { money: 80 },
          effects: { money: -80, spendKind: 'care', security: 1, nursingSkill: 1, nightWakeStreak: 1 },
          result: '冰过的牙胶成了救命稻草。醒还是要醒的，但哄得回来了。这一关，你们又熬过来了三分之一。',
        },
        {
          text: '抱着走，走着哄',
          effects: { energy: -2, security: 1, nightWakeStreak: 1 },
          result: '凌晨两点的客厅，你们又开始踱步——熟悉的配方，熟悉的腰疼。',
        },
        {
          text: '夜里加一顿奶，吃饱了好睡',
          effects: { overfed: 1, nightWakeStreak: 1 },
          result: '吃了确实能睡。体检表上的曲线也确实……往上翘了一点。牙疼和长胖，总得选一个。',
        },
      ],
    },

    // ---------- 辅食第一口 ----------
    {
      id: 'a_solids', kind: 'anchor', priority: 'main', day: [17, 24], stage: 'infant',
      title: '辅食，第一口',
      art: { pose: '婴儿', expr: '专注', outfit: '围兜', scene: '家中' },
      text: '满六个月，该加辅食了。高铁米粉调一小碗，勺子递过去——他人生第一次吃到"奶以外的味道"。\n（这一勺下去，过敏、口味、饭桌战争，全都开始了。）',
      make(state) {
        const allergic = util.chance(0.2);
        const allergyTail = allergic
          ? '\n三天后加蛋黄，他嘴边起了一圈红疹。深夜的急诊，医生说：记住这个蛋，半年后再试。'
          : '';
        const allergyFx = allergic ? { money: -300, spendKind: 'medical', nursingSkill: 1 } : {};
        const choices = [
          {
            text: '每天亲手做泥',
            cost: { energy: 1 },
            effects: { energy: -1, nursingSkill: 2, ...allergyFx },
            result: `南瓜泥、山药泥、猪肝泥，冰格里冻满了一个星期的爱。他吐出来一半，吃进去一半，你拍了两百张照片。${allergyTail}`,
          },
          {
            text: '成品辅食泥，省事',
            cost: { money: 400 },
            effects: { money: -400, spendKind: 'care', ...allergyFx },
            result: `货架上的小罐子，配料表干净得像情书。贵是贵了点，但你今天多睡了一小时。${allergyTail}`,
          },
        ];
        if (state.family.careMode === 'grandma2') {
          choices.push({
            text: '老人说：嚼碎了喂，有味道他才吃',
            effects: {
              ...(util.chance(0.5)
                ? { money: -300, spendKind: 'medical', setFlags: { '隔代养育': '嚼碎喂的那一勺' } }
                : { inLaw: 4 }),
              ...allergyFx,
            },
            result: util.chance(0.5)
              ? `老人嚼过的那一勺还没喂完，你就从科普文章里跳了出来："大人嘴里有细菌！"这场战争，从辅食正式打响。${allergyTail}`
              : `他吃得吧唧作响，老人得意："看，还是我喂得好。"你把想说的话，和科普截图一起咽了回去。${allergyTail}`,
          });
        }
        return { choices };
      },
    },

    // ---------- 会爬了 ----------
    {
      id: 'a_crawl', kind: 'anchor', priority: 'main', day: [22, 32], stage: 'infant',
      title: '他会爬了',
      art: { pose: '婴儿', expr: '笑', outfit: '连体衣', scene: '家中' },
      text: '先是倒退，再是原地转圈，某个下午，他忽然手脚并用向前拱了半米——会爬了。\n从此这个家进入了"移动目标时代"：数据线、拖鞋、猫粮盆，都成了他的目的地。',
      choices: [
        {
          text: '全屋安全改造', cost: { money: 600 },
          effects: { money: -600, spendKind: 'care', nursingSkill: 1 },
          result: '插座保护盖、防撞条、抽屉锁、柜子固定器。师傅装了一下午，你在旁边递工具，像个装修监工。',
        },
        {
          text: '铺个爬行垫，其余靠盯',
          cost: { money: 200 },
          effects: { money: -200, spendKind: 'care', energy: -1 },
          result: '两平米的领土扩张。他在垫子上爬，你的眼睛长在他身上，手机使用时间下降了 40%。',
        },
        {
          text: '不用改，盯紧点就行',
          effects: { energy: -2 },
          result: '一周后他从床上滚下来一次，万幸没事。你把这件事讲出来的时候，所有的父母都沉默了——因为都干过。',
        },
      ],
    },

    // ---------- 第一声爸爸妈妈 ----------
    {
      id: 'a_first_word', kind: 'anchor', priority: 'main', day: [26, 40], stage: 'infant',
      title: '第一声"爸爸/妈妈"',
      art: { pose: '婴儿', expr: '笑', outfit: '连体衣', scene: '家中' },
      make(state) {
        let first = util.chance(0.5) ? '爸爸' : '妈妈';
        if (state.family.careMode === 'grandma2' && util.chance(0.45)) first = '奶奶';
        const sting = first === '奶奶'
          ? (state.perspective === 'mama'
            ? '\n他先叫的是"奶奶"。你笑着夸他真棒，转身进厨房站了很久。'
            : '\n他先叫的是"奶奶"。你妈很得意，你妻子在旁边笑了笑，没说话。')
          : '';
        return {
          text: `那天傍晚，他坐在爬行垫上，含混地蹦出一串音节——然后忽然清晰地喊了出来："${first}！"\n全场安静了两秒。${sting}`,
          choices: [
            {
              text: '录下来，反复回放',
              effects: { marriage: 2, security: 1, log: { text: `他人生第一个词是"${first}"。这段 11 秒的视频，你看了四十遍。`, hl: true } },
              result: `十一秒的视频，你回放了四十遍，发给了能发的所有人。${first === '奶奶' ? '配文你想了很久，最后只写了三个感叹号。' : '配文："会叫人了。"配图：他流着口水的笑脸。'}`,
            },
            {
              text: '立刻发家族群',
              effects: { face: 4, marriage: 1 },
              result: '家族群瞬间沸腾。两位老人开始争"他其实在叫的是我"，这场辩论预计持续到他会说整句为止。',
            },
            {
              text: '凑近再教一遍',
              effects: { security: 2, nursingSkill: 1 },
              result: `你把脸凑过去，一字一顿："${first === '奶奶' ? '妈、妈' : '宝、宝'}。"他抓着你的脸，咯咯地笑。教是教不会的，但你舍不得起来。`,
            },
          ],
        };
      },
    },

    // ---------- 二胎话题 ----------
    {
      id: 'a_second_child', kind: 'anchor', priority: 'main', day: [30, 40], stage: 'infant',
      title: '二胎，要不要',
      art: { pose: '婴儿', expr: '熟睡', outfit: '连体衣', scene: '家中·深夜' },
      text: '孩子终于能睡整觉了，老人开始旁敲侧击："趁年轻，再要一个，有个伴。"\n你看着刚收拾完的客厅、刚关掉的夜灯、刚喘匀的气——这道题，比当年高考最后一道大题还难。',
      choices: [
        {
          text: '顺其自然，缘分到了再说',
          effects: { marriage: 1 },
          result: '"顺其自然"是个万能答案，翻译过来是：现在还不敢想。这个问题，会在未来某个时刻再次浮出水面。',
        },
        {
          text: '坚决只要这一个',
          effects: { setFlags: { '独生': '你们认真谈过，只要这一个' } },
          result: '你们认真谈了一晚上，得出结论：把所有的时间、钱和爱，给这一个。老人叹了口气，没再劝。',
        },
        {
          text: '开始备孕',
          effects: { energy: -1, mama: -1, setFlags: { '二胎计划': '你们决定再要一个' } },
          result: '叶酸瓶出现在了餐桌上。你们对视一眼，都笑了——上一个的夜还没完全熬完，下一个的征程又要开始了。',
        },
      ],
    },

    // ---------- 学步：保护还是放手 ----------
    {
      id: 'a_first_steps', kind: 'anchor', priority: 'main', day: [36, 46], stage: 'infant',
      title: '他扶着东西站起来了',
      art: { pose: '婴儿', expr: '专注', outfit: '学步装', scene: '家中' },
      text: '他扶着沙发边缘，摇摇晃晃地站了起来，回头看你，眼睛亮得惊人。\n走路这件事近在眼前。而你要做的第一个决定是：护到什么程度。',
      choices: [
        {
          text: '全程护着，防摔装备买齐', cost: { money: 300 },
          effects: { money: -300, spendKind: 'care', security: 1, setFlags: { '过度保护': '学步期，你把地面都包了起来' } },
          result: '防摔枕、护膝、桌角套一应俱全。他确实没摔过——你也没敢错过他走的每一步。',
        },
        {
          text: '铺好垫子，放手让他摔',
          effects: { nursingSkill: 1, setFlags: { '放手型父母': '摔跤是学费，他自己交' } },
          result: '摔了三次，每次都自己撑着爬起来，第四次，走了四步。你把手揣进兜里，把"小心"咽了回去。',
        },
        {
          text: '买个学步车，省心', cost: { money: 400 },
          effects: { money: -400, spendKind: 'toys' },
          result: '他坐在学步车里横冲直撞，撞翻了垃圾桶。儿保医生看到照片欲言又止："……影响腿型，建议少用。"买都买了。',
        },
      ],
    },

    // ---------- 断奶 ----------
    {
      id: 'a_weaning', kind: 'anchor', priority: 'main', day: [42, 47], stage: 'infant',
      title: '断奶这件事',
      art: { pose: '婴儿', expr: '委屈', outfit: '连体衣', scene: '家中' },
      text: '一周岁了，断奶提上日程。妈妈群里流传着各种流派：自然离乳派、快速断奶派、分离断奶派——每一派都说自己是科学的，说别人的是残忍的。',
      choices: [
        {
          text: '自然离乳，慢慢来',
          cost: { energy: 1 },
          effects: { energy: -1, security: 2, mama: 2 },
          result: '不主动给，也不强行断。两个月后的某个午后，他忽然忘了这回事。没有仪式，没有眼泪——就像所有真正的告别一样，悄无声息。',
        },
        {
          text: '快刀斩乱麻，三天断掉',
          effects: { security: -4, mama: -2 },
          result: '第一天哭了四十分钟，第二天二十分钟，第三天，他看着你，没哭。赢了，但你不知道赢了什么。',
        },
        {
          text: '妈妈回避一周，分离式断奶',
          effects: { security: -6, marriage: -3, mama: -4 },
          result: '她拖着行李箱回了娘家。那一个星期，他每天夜里都在找人。奶是断了——有些别的东西，也跟着断了一下。',
        },
      ],
    },

    // ---------- 周岁抓周（本章终章） ----------
    {
      id: 'a_first_birthday', kind: 'anchor', priority: 'main', day: [46, 47], stage: 'infant',
      title: '周岁 · 抓周',
      art: { pose: '婴儿', expr: '笑', outfit: '礼服', scene: '家中' },
      make(state) {
        const c = state.child;
        const pool = [
          { name: '算盘', hint: '跟钱有缘', w: 2 },
          { name: '听诊器', hint: '白衣天使的兆头', w: c.constitution <= 1 ? 3 : 2 },
          { name: '一本书', hint: '读书人的命', w: c.security >= 55 ? 3 : 2 },
          { name: '麦克风', hint: '吃开口饭的', w: c.temperament === 'social' ? 4 : 2 },
          { name: '小球', hint: '运动健将的坯子', w: c.constitution >= 3 ? 4 : 2 },
          { name: '鼠标', hint: '以后要对着屏幕吃饭', w: 3 },
          { name: '印章', hint: '体制内的好苗子', w: 3 },
        ];
        const picked = util.weighted(pool.map((p) => p.name), pool.map((p) => p.w));
        const hint = pool.find((p) => p.name === picked).hint;
        return {
          text: `一周岁生日。蛋糕上的蜡烛是他这辈子见过的第一根火苗。\n红布上摆开物件，全家人屏住呼吸——他爬过去，一把抓住了【${picked}】。\n"${hint}。"老人喜笑颜开地下了结论。你半信半疑，掏出手机拍了张照。`,
          choices: [
            {
              text: '"好兆头！顺势培养起来"',
              effects: { energy: -1, face: 2, setFlags: { '焦虑父母': '抓周抓什么就学什么' } },
              result: '第二天购物车里多了早教卡片和兴趣班询价记录。抓周是个游戏，但当真的父母，从来不止你一个。',
            },
            {
              text: '一笑了之，随他去',
              effects: { marriage: 2, security: 1 },
              result: '"他能抓到什么，取决于你摆了什么。"你把这句话说给老人听，老人想了想，居然点头了。',
            },
            {
              text: '把想让他抓的东西挪到最前面',
              effects: { face: 1 },
              result: '全家都看见了你的小动作，全家都假装没看见。他"如愿"抓住了那个——一场被安排的命运，就此收场。',
            },
          ],
        };
      },
    },

    // ============================================================
    // 第三章 · 幼儿期（1 → 3 岁，按月推进）
    // ============================================================

    // ---------- terrible two 开场 ----------
    {
      id: 'a_terrible_two', kind: 'anchor', priority: 'main', day: [1, 6], stage: 'toddler',
      title: '他说"不"了',
      art: { pose: '幼儿', expr: '生气', outfit: '罩衣', scene: '家中' },
      text: '"喝水吗？""不！""吃饭吗？""不！""那抱抱？""不！！"\n不知道从哪天起，他嘴里最流利的字是"不"。从前那个软软糯糯任人摆布的小婴儿，一夜之间变成了一个有主见、且主见全用来反对你的小人。\n网上说，这叫 terrible two，是自我意识觉醒的标志——"值得庆祝"。',
      choices: [
        {
          text: '给他有限的选择权："红色杯子还是蓝色杯子？"',
          effects: { security: 2, nursingSkill: 2 },
          result: '"蓝色！"他抓过杯子，一饮而尽，仿佛是自己赢了。你也赢了。这是谈判的艺术：让对方以为是自己做的决定。',
        },
        {
          text: '正面刚：不许说不，照做',
          effects: { security: -3, energy: -1 },
          result: '一场亲子拉锯战，以他哭到打嗝、你气到胸闷告终。你赢了这一回合，但隐隐觉得输掉了什么别的。',
        },
        {
          text: '随他去，大了自然就好了',
          effects: { energy: 1, mama: 1 },
          result: '你降低了期待值，血压也跟着降了。有些阶段不是拿来战胜的，是拿来穿过去的。',
        },
      ],
    },

    // ---------- 语言爆发 ----------
    {
      id: 'a_language_burst', kind: 'anchor', priority: 'main', day: [2, 8], stage: 'toddler',
      title: '语言爆发期来了',
      art: { pose: '幼儿', expr: '平静', outfit: '罩衣', scene: '家中' },
      make(state) {
        const social = state.child.temperament === 'social';
        return {
          text: social
            ? '词汇量像开了闸：三个字、五个字、一整句，一个月全齐了。他甚至开始主动搭话："奶奶买菜菜！""叔叔再见！"——全小区都认识他了。'
            : '词汇量像开了闸：先是蹦单词，然后是电报句——"妈妈抱""还要""不要这个"。他话不多，但每个字都用在刀刃上。',
          choices: [
            {
              text: '每天固定亲子共读，多聊天',
              effects: { energy: -1, security: 2, nursingSkill: 2 },
              result: '同一本《小熊很忙》读了四十遍，你都能背了，他每次还是像第一次读。后来你才懂：重复，是他确认世界的方式。',
            },
            {
              text: '报个双语早教，磨耳朵',
              cost: { money: 3000 },
              effects: { money: -3000, spendKind: 'education', face: 1 },
              result: '每周两节课，会唱半首英文歌。值不值不好说，但你确实看到了他眼睛里多了一点对"新东西"的期待。',
            },
            {
              text: '自然生长，话迟早都会说',
              effects: { mama: 1 },
              result: '确实都会说。区别只是：别人家在早教中心说的话，你家在饭桌上说了。',
            },
          ],
        };
      },
    },

    // ---------- 如厕训练 ----------
    {
      id: 'a_toilet_training', kind: 'anchor', priority: 'main', day: [3, 10], stage: 'toddler',
      title: '如厕训练',
      art: { pose: '幼儿', expr: '专注', outfit: '小内裤', scene: '家中' },
      text: '同龄孩子开始告别尿不湿了。你买了小马桶、训练裤和贴纸奖励表。\n老人有不同意见："把尿多省事，我们那时候……"——这句话的第无数次出现了。',
      choices: [
        {
          text: '顺其自然，等他自己ready',
          effects: { security: 2, nursingSkill: 1 },
          result: '湿了几条裤子之后，某个下午他自己跑向了小马桶。全程没有战争——只是晚了几周，和尿不湿多用了两包。',
        },
        {
          text: '严格训练，按点坐盆',
          effects: { security: -2, energy: -1, money: -150, spendKind: 'care' },
          result: '定时提醒、成功贴纸、失败重来。两周基本学会了，代价是他现在每次坐盆都要先确认你在旁边。',
        },
        {
          text: '听老人的，把尿',
          effects: { inLaw: 3, setFlags: { '隔代养育': '如厕训练，又回到了把尿' } },
          result: '老人把着尿，确实"省"了几条裤子。你在科普文章和现实和平之间，又一次选择了后者。',
        },
      ],
    },

    // ---------- 超市躺地 ----------
    {
      id: 'a_tantrum_supermarket', kind: 'anchor', priority: 'main', day: [5, 14], stage: 'toddler',
      title: '超市，躺下了',
      art: { pose: '幼儿', expr: '大哭', outfit: '罩衣', scene: '超市' },
      text: '玩具区，他看中了一辆挖掘机——家里已经有七辆了。\n"不买。"话音刚落，他直挺挺地躺了下去，在超市的地板上，哭声穿透了整个生鲜区。所有人都在看你。',
      make(state) {
        const learned = Boolean(state.flags['哭闹有效']);
        return {
          text: learned
            ? '玩具区，他又看中了一辆车——这是这个月第四次。上一次你买了，上上次你也买了。\n"不买"两个字刚出口，他熟练地躺下去，还回头看了你一眼。他知道这招管用。'
            : '玩具区，他看中了一辆挖掘机——家里已经有七辆了。\n"不买。"话音刚落，他直挺挺地躺了下去，在超市的地板上，哭声穿透了整个生鲜区。所有人都在看你。',
          choices: [
            {
              text: '蹲下来平静地说：不买，哭完我们回家',
              effects: { security: 1, face: -2, nursingSkill: 2 },
              result: '你在旁边站了十分钟，接受了两三位阿姨的"孩子不能这样惯着"的现场指导。他哭累了，伸手要抱。你抱了——车没买。',
            },
            {
              text: '赶紧买了，别丢人了',
              cost: { money: 89 },
              effects: { money: -89, spendKind: 'toys', face: 2, setFlags: { '哭闹有效': '超市的地板，是他谈下来的第一笔订单' } },
              result: '哭声戛然而止，像关了闸。他抱着挖掘机冲你笑了。你解决了一场危机，也签了一份以后很难撕毁的合同。',
            },
            {
              text: '抱起来就走，回家再谈',
              effects: { energy: -1, security: 1 },
              result: '他被扛在肩上，一路踢一路哭。回家后你们谈了谈——他可能没听懂，但他知道你不会因为哭闹改变主意。',
            },
          ],
        };
      },
    },

    // ---------- 抢玩具 ----------
    {
      id: 'a_toy_sharing', kind: 'anchor', priority: 'main', day: [6, 14], stage: 'toddler',
      title: '玩具保卫战',
      art: { pose: '幼儿', expr: '生气', outfit: '罩衣', scene: '公园' },
      text: '亲子活动上，一个小朋友伸手来拿他的挖掘机。他一把夺回来，抱紧，大喊："我的！！"\n对方妈妈笑着说："没事没事，小孩子都这样。"你也笑笑，但心里在飞速盘算：要不要趁机教他分享？',
      choices: [
        {
          text: '"是他的，他有权决定要不要分享"',
          effects: { security: 3, nursingSkill: 1 },
          result: '他没分享，对方小朋友去玩别的了。回家路上他一直抱着挖掘机。物权先于分享——你把这个顺序记在了心里。',
        },
        {
          text: '劝他让给弟弟玩一下',
          effects: { security: -2, face: 1 },
          result: '他松了手，眼圈红了。对方妈妈夸他"真棒"，他没笑。大方有时是被夸出来的，有时是被逼出来的。',
        },
        {
          text: '再买一个一样的，一人一个',
          cost: { money: 89 },
          effects: { money: -89, spendKind: 'toys' },
          result: '两个挖掘机，两个满意的小孩，一个扫码支付的你。钱能解决的问题，在这个阶段还占大多数。',
        },
      ],
    },

    // ---------- 屏幕时间第一战 ----------
    {
      id: 'a_screen_time', kind: 'anchor', priority: 'main', day: [8, 18], stage: 'toddler',
      title: '屏幕，第一战',
      art: { pose: '幼儿', expr: '专注', outfit: '罩衣', scene: '客厅' },
      text: '他发现了动画片。那个会动、会唱、永远不会说"不"的世界，让他一动不动能坐四十分钟——你终于知道"安静"长什么样了。\n儿保医生说：两岁以下尽量不看屏幕。医生孩子几岁，没人告诉你。',
      choices: [
        {
          text: '立规矩：每天二十分钟，闹钟说了算',
          effects: { energy: -1, setFlags: { '屏幕规则': '规矩立在了 terrible two' } },
          result: '前三天哭了两场，第四天闹钟响了，他自己关了电视。你被自己惊到了——原来规矩是这个意思：先难，后易。',
        },
        {
          text: '忙不过来的时候，随他看',
          effects: { mama: 1 },
          result: '做饭的四十分钟，屏幕替你值了班。你告诉自己"就这一段"——这句话以后还会说很多次。',
        },
        {
          text: '完全不接触，家里电视都收起来',
          effects: { energy: -2, security: 1 },
          result: '客厅回到了没有屏幕的年代。代价是你错过了三个重要电话和一整季想看的剧——为人父母，从失去追剧自由开始。',
        },
      ],
    },

    // ---------- 隔代溺爱（老人带娃线） ----------
    {
      id: 'a_grandma_spoil', kind: 'anchor', priority: 'main', day: [8, 20], stage: 'toddler',
      conditions: { careModeIs: 'grandma2' },
      title: '"找奶奶去"',
      art: { pose: '幼儿', expr: '笑', outfit: '罩衣', scene: '家中' },
      text: '你刚说完"今天不能再吃糖了"，他转身就往厨房跑："奶奶——"\n老人从围裙口袋里摸出一颗糖，动作熟练得像演练过一百遍。你们四目相对，一个装没看见，一个装不认识。',
      choices: [
        {
          text: '跟老人认真谈一次：规则要一致',
          effects: { inLaw: -5, marriage: 2, setFlags: { '隔代溺爱': '你谈过了，效果待观察' } },
          result: '"好好好，以后不给了。"老人答应得很痛快。第三天，糖又出现了——这次藏在了饼干盒里。谈判继续。',
        },
        {
          text: '算了，一颗糖而已',
          effects: { inLaw: 2 },
          result: '你退出了这场执法。规矩的口子一旦开了，就会越开越大——但你实在不想再吵了。',
        },
        {
          text: '当面没收，告诉他规则就是规则',
          effects: { security: -1, inLaw: -3, face: -2 },
          result: '糖从手里被拿走，他哭得撕心裂肺，老人脸色铁青。规则保住了，餐桌上的空气凝固了三顿饭。',
        },
      ],
    },

    // ---------- 挑食 ----------
    {
      id: 'a_picky_eating', kind: 'anchor', priority: 'main', day: [10, 20], stage: 'toddler',
      title: '他开始挑食了',
      art: { pose: '幼儿', expr: '委屈', outfit: '罩衣', scene: '餐桌' },
      text: '从前的干饭小能手，忽然变成了饭桌钉子户：青菜挑出去，肉嚼两口吐掉，只有白米饭和炸鸡是真爱。\n体检的时候体重倒还正常——但每顿饭都是一场拉锯战。',
      choices: [
        {
          text: '变着花样做，把菜藏进包子',
          cost: { energy: 1 },
          effects: { energy: -1, nursingSkill: 2, mama: 1 },
          result: '西兰花碎藏进肉丸，胡萝卜泥揉进馒头。他吃得喷香，你在厨房看着自己的手艺，笑出了声。',
        },
        {
          text: '不吃就饿着，下顿再说',
          effects: { mama: -2, security: -1 },
          result: '他真的饿了顿把饭，下顿确实吃得香了。老一辈说这招管用，确实管用——你只是不太喜欢他看你的眼神。',
        },
        {
          text: '追着喂，吃一口是一口',
          effects: { energy: -2, setFlags: { '隔代养育': '追喂的传统艺能，全家中最投入的是你' } },
          result: '一顿饭四十分钟，家里三个人轮流上。吃是吃了，从那以后，他再也不肯自己拿勺子了。',
        },
      ],
    },

    // ---------- 早教班档位 ----------
    {
      id: 'a_early_edu', kind: 'anchor', priority: 'main', day: [10, 20], stage: 'toddler',
      title: '早教班，报不报',
      art: { pose: '幼儿', expr: '平静', outfit: '罩衣', scene: '商场' },
      text: '商场里的早教中心灯火通明，落地玻璃里一群孩子在"感统训练"。销售递来课程表："三岁前是大脑发育黄金期，我们这边一节课 260，报课包更划算。"\n旁边等待试听的家长，人手一杯咖啡，眼神坚定。',
      choices: [
        {
          text: '不报，公园和厨房就是早教',
          effects: { face: -1, mama: 2 },
          result: '"挖沙是最好的感统训练，做饭是最好的化学启蒙。"你把这句话发在群里，收获五个赞和三个"心大"。',
        },
        {
          text: '报普通早教班', cost: { money: 3000 },
          effects: { money: -3000, spendKind: 'education', security: 1 },
          result: '每周一次，唱歌、攀爬、认识小动物。他玩得很开心，你也认识了几个同龄家长——这个"家长社交圈"，是附带的最大福利。',
        },
        {
          text: '上双语托育衔接班', cost: { money: 15000 },
          effects: { money: -15000, spendKind: 'education', face: 3, setFlags: { '焦虑父母': '一岁半就报了双语班' } },
          result: '账单划出去的那一刻，你在心里算了算每节课的单价，然后决定不算了。孩子会说 apple 的那天，你觉得都值了。',
        },
      ],
    },

    // ---------- 滑梯与放手 ----------
    {
      id: 'a_playground', kind: 'anchor', priority: 'main', day: [12, 22], stage: 'toddler',
      title: '滑梯上的两分钟',
      art: { pose: '幼儿', expr: '专注', outfit: '运动装', scene: '公园' },
      make(state) {
        const overprotective = Boolean(state.flags['过度保护']);
        const handsOff = Boolean(state.flags['放手型父母']);
        const flavor = overprotective
          ? '他爬上滑梯的每一步，你的手都虚扶在他身后半寸。别的家长坐在长椅上，你站在滑梯旁——像个保镖。'
          : handsOff
            ? '他自己爬上去，自己滑下来，摔了个屁股墩，自己拍拍土站起来又去排队。你坐在长椅上，手里握着没打开的水壶。'
            : '他爬上滑梯，回头找你。你冲他比了个大拇指。他咧嘴一笑，滑了下来。';
        return {
          text: `${flavor}\n游乐场是最好的观察室：孩子怎么玩，父母怎么站，一眼就能看出这对家庭的相处模式。`,
          choices: [
            {
              text: '继续现在的策略',
              effects: { security: 1 },
              result: '他玩得满头大汗。回家的路上在你的臂弯里睡着了——这是当天的结尾，也是所有策略的验收。',
            },
            {
              text: '比现在松一点/紧一点，随时调整',
              effects: { nursingSkill: 2 },
              result: '育儿没有一劳永逸的方案，只有不断校准的罗盘。今天你校准了一格。',
            },
          ],
        };
      },
    },

    // ---------- 第一次撒谎（撒谎链的第一颗种子） ----------
    {
      id: 'a_first_lie', kind: 'anchor', priority: 'main', day: [14, 22], stage: 'toddler',
      title: '"是娃娃干的"',
      art: { pose: '幼儿', expr: '平静', outfit: '罩衣', scene: '家中' },
      text: '"哐当——"\n你从厨房出来，牛奶杯躺在地板上，白色的液体淌了一片。他站在两步开外，手里还捏着一块饼干，眼神第一次出现了那种……大人才有的躲闪。\n"是不是你打翻的？"\n他低下头，很小声、但很清楚地说："是娃娃干的。"\n娃娃躺在沙发上，离案发现场三米远。',
      choices: [
        {
          text: '蹲下来："牛奶洒了没关系，我们一起擦。但娃娃没干活儿，是你干的，对吗？"',
          effects: { security: 3, nursingSkill: 2, setFlags: { '诚实被温柔对待': '第一次撒谎，被温和接住了' } },
          result: '他愣了几秒，点点头："我干的。"你们一起擦了地板，他擦得特别认真。\n两岁半的"谎言"不是品德问题，是智力里程碑——他学会了揣测你的想法。而你刚刚告诉他：说真话，天不会塌。',
        },
        {
          text: '严肃批评："撒谎的孩子会被狼吃掉！"',
          effects: { security: -4, setFlags: { '第一颗隐瞒种子': '他学会了：说真话会挨骂' } },
          result: '他被吓得一哆嗦，"哇"地哭了，边哭边喊"我不敢了"。\n他确实不敢了——不敢的除了打翻杯子，还有告诉你真相。',
        },
        {
          text: '笑着揭穿："娃娃可干不了这个哦～"',
          effects: { security: 1, setFlags: { '第一颗隐瞒种子': '谎言被当成了可爱的表演' } },
          result: '你把这一幕拍下来发到了家庭群，配文"小小年纪就会甩锅了哈哈哈"。收获一片"机灵""随他爸"。\n他记住了另一件事：原来这样说话，大人会笑。',
        },
      ],
    },

    // ---------- 体检（18月/2岁） ----------
    {
      id: 'a_growth_18m', kind: 'anchor', priority: 'side', day: [5, 6], stage: 'toddler',
      title: '一岁半体检',
      art: { pose: '幼儿', expr: '平静', outfit: '罩衣', scene: '医院' },
      make(state) { return G.makeToddlerCheck(state, '一岁半'); },
    },
    {
      id: 'a_growth_2y', kind: 'anchor', priority: 'side', day: [11, 12], stage: 'toddler',
      title: '两岁体检',
      art: { pose: '幼儿', expr: '平静', outfit: '罩衣', scene: '医院' },
      make(state) { return G.makeToddlerCheck(state, '两岁'); },
    },

    // ---------- 入园准备 ----------
    {
      id: 'a_daycare_transition', kind: 'anchor', priority: 'main', day: [20, 23], stage: 'toddler',
      title: '入园倒计时',
      art: { pose: '幼儿', expr: '平静', outfit: '小书包', scene: '家中' },
      text: '秋天他就要上幼儿园了。家长群里已经开始传"入园分离焦虑攻略"：提前调整作息、练习自己吃饭、参观幼儿园、准备安抚物……\n有人群里的妈妈说，她家孩子哭了整整一个月。',
      choices: [
        {
          text: '照攻略逐条准备',
          effects: { energy: -1, security: 2, setFlags: { '入园准备': '提前三个月，逐条备战' } },
          result: '作息调了，自己吃饭练了，幼儿园参观了两次，小书包里放了他最喜欢的小恐龙。能做的都做了——剩下的，交给九月。',
        },
        {
          text: '顺其自然，到时候就好了',
          effects: { mama: 1 },
          result: '"孩子比我们想象的适应力强。"这句话是真的。头两个星期哭成泪人也是真的。两件事并不矛盾。',
        },
      ],
    },

    // ---------- 三岁生日 + 择园（本章终章） ----------
    {
      id: 'a_third_birthday', kind: 'anchor', priority: 'main', day: [22, 23], stage: 'toddler',
      title: '三岁生日，和一张报名表',
      art: { pose: '幼儿', expr: '笑', outfit: '礼服', scene: '家中' },
      text: '三岁生日蛋糕上插了一根"3"字蜡烛。他鼓起腮帮子一口气吹灭，全家人鼓掌——从今天起，他不再是"婴幼儿"，是个大孩子了。\n桌上放着一样东西抢了蛋糕的风头：幼儿园报名表。这个家的下一道选择题，比蛋糕上的蜡烛烫手得多。',
      choices: [
        {
          text: '公办园（约 ¥600/月，摇号）',
          effects: { setFlags: { '幼儿园·公办': '把命运交给了摇号机' }, face: 1 },
          result: '报名表交上去的那一刻，你体会到了什么叫"听天由命"。便宜、正规、离家近——前提是，中签。',
        },
        {
          text: '普惠民办园（约 ¥1,500/月）',
          effects: { money: -1500, spendKind: 'education', setFlags: { '幼儿园·普惠': '限价内的安心之选' } },
          result: '政府限价，老师稳定，园长在家长会上说了三次"我们凭良心"。你在报名表上签了字，笔迹很踏实。',
        },
        {
          text: '中端民办园（约 ¥4,500/月）', cost: { money: 4500 },
          effects: { money: -4500, spendKind: 'education', setFlags: { '幼儿园·民办': '咬牙选了外教和兴趣班' }, face: 2 },
          result: '开放日那天，教室里有钢琴角和科学墙，老师一半持证、一半海归。你算了算这笔钱占家庭收入的比例，然后把计算器合上了。',
        },
        {
          text: '国际园（约 ¥15,000/月）', cost: { money: 15000 },
          conditions: { moneyGte: 15000 },
          effects: { money: -15000, spendKind: 'education', setFlags: { '幼儿园·国际': '一条和公立平行的路' }, face: 4 },
          result: '园长用双语做了介绍，最后说："我们培养的是世界公民。"你在缴费单上签的字，比当年签购房合同还郑重。',
        },
      ],
    },
  ];
  const ANCHOR_FOLLOWUPS = [
    {
      id: 'follow_jaundice_worse', kind: 'followup', priority: 'main', day: [4, 27],
      title: '复测：数值飙了',
      art: { pose: '新生儿', expr: '不适', outfit: '包被', scene: '医院' },
      make(state) {
        const folk = Boolean(state.flags['黄疸土方']);
        return {
          text: folk
            ? '社区复测，胆红素不降反升。医生问在家做了什么处理，听到"葡萄糖水和金银花"时，笔停了一下："马上住院。"\n婆婆攥着缴费单，一路没敢说话。'
            : '社区复测，胆红素不降反升，黄染已经过了肚脐。医生收起了笑容："别观察了，今天必须住院。"',
          choices: [
            {
              text: '办住院，照蓝光',
              cost: { money: P.lanGuangRetry },
              effects: folk
                ? {
                    money: -P.lanGuangRetry, spendKind: 'medical', mama: -8, security: -2,
                    unsetFlags: ['黄疸观察中', '黄疸土方'],
                    setFlags: { '婆媳紧张': '黄疸偏方，险些误事' },
                  }
                : { money: -P.lanGuangRetry, spendKind: 'medical', mama: -8, security: -2, unsetFlags: ['黄疸观察中'] },
              result: '五天蓝光，黄疸退了。出院那天你们在缴费单上签了三次字——有些观察的代价，是用住院费结算的。',
            },
          ],
        };
      },
    },
  ];

  // 幼儿期体检文案（18月/2岁共用）
  G.makeToddlerCheck = function (state, label) {
    const wp = Math.round(G.growth.weightPercentile(state));
    const verdict = wp >= 88
      ? `${label}体检：体重又冲上了曲线上沿。医生这回没打趣，直接聊了饮食结构。`
      : wp <= 12
        ? `${label}体检：曲线还是贴着下限走。医生排除了病理原因："有的孩子就是这样，饭量小，密度大。"`
        : `${label}体检：一切正常。身高体重的曲线，稳稳地走在中间。`;
    return {
      text: `${verdict}\n体检室外面的墙上贴着同龄孩子的发育对照表，你逐行看过去，在"语言""大运动""社交"三栏停了很久。`,
      choices: [
        {
          text: '逐项对照，落后的补，超前的夸',
          effects: { energy: -1, mama: -1, setFlags: { '焦虑父母': '体检对照表前，你又开始加码' } },
          result: '回家路上你列了个"追赶计划"。执行了四天，第五天他被逗得咯咯笑，你忽然觉得——慢点就慢点吧。',
        },
        {
          text: '看完就看完，不对照',
          effects: { mama: 2, marriage: 1 },
          result: '每个孩子都有自己的时刻表——这句话你从医生嘴里听第一次，现在终于自己也信了。',
        },
      ],
    };
  };

  // 体检事件文案（day 7/14/21 共用）
  G.makeGrowthCheck = function (state, day) {
    const wp = Math.round(G.growth.weightPercentile(state));
    const gained = Math.round((state.child.weight - state.child.birthWeight) * 1000);
    const pct = util.fmtPct(wp);
    let text;
    if (wp >= 88) {
      text = `体重 ${state.child.weight}kg（较出生 ${gained >= 0 ? '+' : ''}${gained}g，第 ${pct} 百分位）。\n社区医生翻着曲线图笑："养得是真好——就是有点太快了，奶粉别冲太浓，别过度喂养。"\n亲戚们都说这叫"有福气"，只有医生在皱眉。`;
    } else if (wp <= 12) {
      text = `体重 ${state.child.weight}kg（较出生 ${gained >= 0 ? '+' : ''}${gained}g，第 ${pct} 百分位）。\n医生盯着曲线图看了很久："增长有点慢，母乳够不够？要不要补一顿奶粉？"\n回家的路上，谁都没说话。`;
    } else {
      text = `体重 ${state.child.weight}kg（较出生 ${gained >= 0 ? '+' : ''}${gained}g，第 ${pct} 百分位）。\n一切正常，曲线稳稳走在中间。医生说了句"很好，继续"，三秒钟结束了问诊。\n你们在诊室外面站了一会儿，才反应过来：这次的"很好"，不用花一分钱。`;
    }
    const lowChoices = [
      {
        text: '加一顿奶粉，追体重',
        effects: { overfed: 1, mama: -2, setFlags: { '焦虑父母': '生长曲线偏低，开始追体重' } },
        result: '从此每天的奶量表上多了一行。体重慢慢上来了，也有点收不住的意思。',
      },
      {
        text: '听医生的，按需喂养，下周再称',
        effects: { mama: 2, nursingSkill: 1 },
        result: '忍住没加量。一周后再称，曲线自己爬上来一点。医生说：看，他有他的节奏。',
      },
      {
        text: '不放心，挂个专家号',
        cost: { money: P.expert },
        effects: { money: -P.expert, spendKind: 'medical', mama: 1, face: 1 },
        result: '专家号 200 块，看了三分钟，结论和社区医生一字不差。买了个踏实。',
      },
    ];
    const highChoices = [
      {
        text: '得意地发家族群',
        effects: { face: 4 },
        result: '"我家这个，一个月两斤半！"评论区一水儿的"有福气""会养"。没人问医生皱眉的事。',
      },
      {
        text: '控制奶量，按需不按哭',
        effects: { overfed: -1, mama: 2, nursingSkill: 1 },
        result: '哭不一定是饿——你开始分辨他的哭声。两周后，曲线的坡度缓了下来。',
      },
    ];
    const normalChoices = [
      {
        text: '安心',
        effects: { mama: 2, marriage: 1 },
        result: '很奇怪，明明是最普通的结果，你们却高兴得像中了奖。',
      },
      {
        text: '顺手发个朋友圈记录',
        effects: { face: 2 },
        result: `配文：第 ${day} 天，一切正常。配图是体重秤上的小肉腿。`,
      },
    ];
    return {
      text,
      choices: wp >= 88 ? highChoices : wp <= 12 ? lowChoices : normalChoices,
    };
  };

  G.ANCHORS = ANCHORS;
  G.ANCHOR_FOLLOWUPS = ANCHOR_FOLLOWUPS;
})(GAME);
