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
          text: '你还没出院，月子的事必须今天定下来。婆婆昨天就把行李箱搬进了客房——拉杆还没收，摆在床脚，像一种不需要商量的通知。\n"请什么人？我来。"她一边说一边把厨房的锅往灶上放，"月子里吃什么，谁比我懂？你们年轻人，连红糖水放几勺都不知道。"\n她腰不好，去年还住院看过。可她说这话时的眼神，让你没法接下一句。',
        },
        {
          text: '妻子还没出院，月子的事必须今天定下来。婆婆昨天就把行李箱搬进了客房——拉杆还没收，摆在床脚，像一种不需要商量的通知。\n"请什么人？我来。"她一边说一边把厨房的锅往灶上放，"月子里吃什么，谁比我懂？你们年轻人，连红糖水放几勺都不知道。"\n她的腰不好，去年还住院看过。但她说这话时的眼神，让你没法接下一句。',
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
          severe: '经皮胆红素明显超标。医生把单子推过来，笔尖点了两下："别回去了。现在就办住院，照蓝光。"\n他没多说一个字——这种沉默，比任何交代都让你心慌。',
        };
        // 季节判定：黄疸发生在出生头几天，直接看出生月。冬春出生（北方尤甚）——没太阳可晒
        const sunPoor = [11, 12, 1, 2, 3].includes(state.birthMonth) && (state.region === 'north' || [12, 1, 2].includes(state.birthMonth));
        const sunNote = sunPoor ? '\n（他出生在 ' + state.birthMonth + ' 月的' + (state.region === 'north' ? '北方' : '南方') + '——冬天的太阳，只是个态度。）' : '';
        const observeChance = ({ mild: 0.12, moderate: 0.5, severe: 0.85 })[severity] + (sunPoor ? 0.08 : 0);
        const folkChance = ({ mild: 0.3, moderate: 0.68, severe: 0.95 })[severity] + (sunPoor ? 0.08 : 0);

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
            text: '带回家，多吃多排，天天晒太阳观察' + sunNote,
            effects: {
              setFlags: { '黄疸观察中': '带回家观察的胆红素' },
              later: [{
                afterDays: 2, chance: observeChance, eventId: 'follow_jaundice_worse',
                preview: '黄疸退不下去的话，观察就成了拖延。',
              }],
            },
            result: sunPoor
              ? '冬天的太阳指望不上，你抱着他在窗边坐了几天——紫外线隔着玻璃，本来就到不了皮肤。观察变成了一场对胆红素的祈祷。'
              : '从此每天早上第一件事：拉开窗帘晒黄疸，喂奶，记录大便颜色。你在备忘录里建了个表格。',
          });
          choices.push({
            text: '听婆婆的：葡萄糖水 + 金银花，退胎黄' + sunNote,
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
      id: 'a_debt', kind: 'anchor', priority: 'main', day: [5, 27], stage: 'both',
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
      text: '脐带残端还没掉。你按护士教的一天两次碘伏消毒，婆婆伸手拦住你，动作不大，但很笃定：\n"别碰它。"她说，"碰多了要发炎。我们那时候，紫药水一抹，自然就掉了——三个孩子，个个这么带大的。"\n她说完就去厨房了，留下你自己掂量。',
      choices: [
        {
          text: '坚持科学护理，每天碘伏',
          effects: { marriage: 2, inLaw: -4, nursingSkill: 1 },
          result: '婆婆在旁边看着你消毒，全程叹气。第七天，脐带完好脱落，肚脐眼干干净净。她没说话，但下次消毒没再拦你。',
        },
        {
          text: '依婆婆的，紫药水',
          effects: { inLaw: 6, marriage: -2, setFlags: { '脐带土法': '紫药水护理脐带' } },
          result: '紫药水抹上去，紫红一片，看不出红肿也看不出渗液。婆婆凑近看了一眼，满意地点头："捂着才好得快。"\n她转身去洗手，水声里哼着一段老调——那种"我说对了吧"的哼法，你听得出来。',
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
        // 派生体重 flag（原在 endGame，现移到首次正式体检时种下）
        if (wp >= 85 && !state.flags['小胖墩苗子']) state.flags['小胖墩苗子'] = { day: state.day, source: '满月体重冲上 P85' };
        if (wp <= 12 && !state.flags['瘦小苗子']) state.flags['瘦小苗子'] = { day: state.day, source: '满月体重仍在 P12 以下' };
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
          result: '医生头也没抬："也可以。"笔在接种本上划了一下，"自费的在外面对窗口，自愿的。"\n你在接种室外的塑料椅上坐了一会儿，把手机里收藏的那篇科普又读了一遍——读到一半，你发现自己其实早就决定了，只是想找个人替你说出来。',
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
      id: 'a_roll_over', kind: 'anchor', priority: 'main', day: [14, 24], stage: 'infant',
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
      id: 'a_stranger_anxiety', kind: 'anchor', priority: 'main', day: [24, 34], stage: 'infant',
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
      id: 'a_teething', kind: 'anchor', priority: 'main', day: [20, 30], stage: 'infant',
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
      id: 'a_crawl', kind: 'anchor', priority: 'main', day: [30, 42], stage: 'infant',
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
      id: 'a_first_word', kind: 'anchor', priority: 'main', day: [38, 47], stage: 'infant',
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
          result: '他坐在学步车里横冲直撞，撞翻了垃圾桶。儿保医生看到照片，这次没有欲言又止："加拿大 2004 年就把这东西禁售了——翻台阶、烫伤、O 形腿，还耽误学爬。"买都买了，你把它收进了储物间。',
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
        // 天赋加权：抓周是一场被命运加了权的随机——他天生会往某个方向多看两眼
        const talentPick = {
          verbal: ['一本书', '麦克风'], logic: ['算盘', '鼠标'], art: ['一支画笔'],
          sport: ['小球'], empathy: ['听诊器'], handson: ['鼠标', '印章'],
        }[c.talent] || [];
        const pool = [
          { name: '算盘', hint: '跟钱有缘', w: 2 },
          { name: '听诊器', hint: '白衣天使的兆头', w: c.constitution <= 1 ? 3 : 2 },
          { name: '一本书', hint: '读书人的命', w: c.security >= 55 ? 3 : 2 },
          { name: '麦克风', hint: '吃开口饭的', w: c.temperament === 'social' ? 4 : 2 },
          { name: '小球', hint: '运动健将的坯子', w: c.constitution >= 3 ? 4 : 2 },
          { name: '鼠标', hint: '以后要对着屏幕吃饭', w: 3 },
          { name: '印章', hint: '体制内的好苗子', w: 3 },
          { name: '一支画笔', hint: '下一个画画的人', w: 2 },
        ].map((p) => (talentPick.includes(p.name) ? { ...p, w: p.w * 3 } : p));
        const picked = util.weighted(pool.map((p) => p.name), pool.map((p) => p.w));
        const isFate = talentPick.includes(picked);
        const hint = pool.find((p) => p.name === picked).hint;
        return {
          text: `一周岁生日。蛋糕上的蜡烛是他这辈子见过的第一根火苗。\n红布上摆开物件，全家人屏住呼吸——他爬过去，一把抓住了【${picked}】。${isFate ? '抓得那样紧，抱在怀里不撒手。' : ''}\n"${hint}。"老人喜笑颜开地下了结论。你半信半疑，掏出手机拍了张照。`,
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
      id: 'a_terrible_two', kind: 'anchor', priority: 'main', day: [6, 14], stage: 'toddler',
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
      id: 'a_language_burst', kind: 'anchor', priority: 'main', day: [6, 14], stage: 'toddler',
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
      id: 'a_toilet_training', kind: 'anchor', priority: 'main', day: [6, 12], stage: 'toddler',
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
      text: '你刚说完"今天不能再吃糖了"，他转身就往厨房跑，声音拖得又长又甜："奶——奶——"\n老人从围裙口袋里摸出一颗糖——你第一次知道那个口袋里常年有糖。动作熟练得像演练过一百遍。\n"就一颗。"她说，"小孩子，馋了可怜。"\n你们四目相对，一个装没看见，一个装不认识。',
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

    // ============================================================
    // 第四章 · 幼儿园（3 → 6 岁，按月推进）
    // ============================================================

    // ---------- 录取通知与学费单（含公办摇号） ----------
    {
      id: 'a_kg_enroll', kind: 'anchor', priority: 'main', day: [0, 1], stage: 'kindergarten',
      title: '录取通知到了',
      art: { pose: '幼儿', expr: '笑', outfit: '园服', scene: '幼儿园门口' },
      make(state) {
        const publicApplied = Boolean(state.flags['幼儿园·公办']);
        const tierFlag = Object.keys(G.CONFIG.KG_TUITION).find((f) => state.flags[f]);
        const tierName = (tierFlag || '幼儿园·公办').split('·')[1];
        if (publicApplied && util.chance(0.3)) {
          return {
            text: '摇号结果出来了——**没中**。\n短信很客气："很遗憾，您的孩子未被录取。"你盯着这条十四个字看了三遍，然后开始给名单上的普惠园打电话。\n好在那家还有名额，学费从六百变成一千五。运气这件事，从幼儿园就开始了。',
            choices: [
              {
                text: '接受现实，转普惠园',
                effects: { unsetFlags: ['幼儿园·公办'], setFlags: { '幼儿园·普惠': '公办摇号落榜后的兜底' }, mama: -2 },
                result: '缴费单换了一版，孩子的书包没换。你在朋友圈发了条"缘分未到"，配了个笑脸。',
              },
            ],
          };
        }
        const feeText = { 公办: '每月六百，还能更香吗', 普惠: '每月一千五，限价内的踏实', 民办: '每月四千五，外教和兴趣班都在里面', 国际: '每月一万五，双语环境和一辆自行车钱' }[tierName] || '';
        return {
          text: `录取通知到了——${tierName}园。园服两套、被褥一套、名字贴五十枚。${publicApplied ? '摇号中了！你在家长群里谦虚地说"运气好"。' : ''}\n学费：${feeText}。从下个月起，它将准时出现在每一张工资条旁边。`,
          choices: [
            {
              text: '采购入园装备，静待开学',
              effects: { money: -400, spendKind: 'clothes', face: 1 },
              result: '印着他名字的小书包挂在门后，他每天都要背一下——还不知道等待他的是什么。',
            },
          ],
        };
      },
    },

    // ---------- 开学第一天（分离焦虑结算） ----------
    {
      id: 'a_kg_first_day', kind: 'anchor', priority: 'main', day: [1, 2], stage: 'kindergarten',
      title: '开学第一天',
      art: { pose: '幼儿', expr: '大哭', outfit: '园服', scene: '幼儿园门口' },
      make(state) {
        const prepared = Boolean(state.flags['入园准备']);
        const security = state.child.security;
        let scene;
        if (prepared && security >= 55) {
          scene = '他背着小书包，在校门口回头看了你一眼，挥挥手，自己走了进去。\n你站在原地，准备好的一整套"分离焦虑话术"一句没用上。旁边一个孩子哭得撕心裂肺，你忽然有点不是滋味——他就这么……走了？';
        } else if (security >= 45) {
          scene = '他抓着你的衣角进了教室，眼圈红红的，但没有哭出声。老师说："放心，一般十分钟就好了。"\n你在校门口的早餐摊站了十分钟，像个刚失恋的人。';
        } else {
          scene = '从换鞋开始他就哭了，抱着你的腿，哭到打嗝。老师接过去的时候，他的哭声穿透了整条走廊。\n你躲在电线杆后面听了五分钟，被另外三个同样躲着的家长认了出来。';
        }
        return {
          text: `${scene}\n（${prepared ? '入园准备做得早，这一天的剧本比预想的温柔。' : '没做准备——此刻你们都在现场学习什么叫"分离"。'}）`,
          choices: [
            {
              text: '坚定告别，说到做到',
              effects: { security: 2, nursingSkill: 1 },
              result: '你说"下午四点，{parent}第一个来接"，然后转身就走。四点差十分，你已经在门口了——这句承诺，你兑现了整整三年。',
            },
            {
              text: '趁他不注意偷偷溜走',
              effects: { security: -4, setFlags: { '安全感不足(早期)': state.child.security < 45 ? '出生就攒下的不安，被溜走加重了' : '开学第一天，你选择了消失' } },
              result: '下午接他时，老师说他找了你一上午。他看着你的眼神里多了一层东西——从那天起，他学会了在分别时抓紧你。',
            },
            {
              text: '请半天假，陪他适应',
              effects: { energy: -1, security: 1 },
              result: '你坐在教室后面的小椅子上，像个旁听生。第二天你没去，他也没哭——原来需要适应的不止是他。',
            },
          ],
        };
      },
    },

    // ---------- 第一兴趣班 ----------
    {
      id: 'a_interest_class', kind: 'anchor', priority: 'main', day: [4, 10], stage: 'kindergarten',
      title: '第一个兴趣班',
      art: { pose: '幼儿', expr: '专注', outfit: '运动装', scene: '商场' },
      make(state) {
        const girl = state.child.gender === 'girl';
        const recs = girl
          ? ['舞蹈（形体和气质，女宝标配）', '画画（安静坐得住，还能发朋友圈）']
          : ['跆拳道（男孩子的精气神）', '乐高（空间思维，工程师的起点）'];
        // 天赋与方向的匹配：同一个兴趣班，命中天赋的孩子和没命中的孩子，是两种体验
        const classTalent = { 画画: 'art', 跆拳道: 'sport', 舞蹈: 'art', 乐高: 'logic' };
        const hotClass = recs[0].split('（')[0];
        const hotMatches = classTalent[hotClass] === state.child.talent;
        return {
          text: `幼儿园门口的传单又厚了一沓。中班，是"兴趣班黄金期"——舞蹈、画画、跆拳道、乐高、轮滑……\n推荐最多的是：${recs.join('；')}。还有一个选项没人推荐：不报，先玩。`,
          choices: [
            {
              text: `报热门款：${recs[0].split('（')[0]}`, cost: { money: 3600 },
              effects: { money: -3600, spendKind: 'education', face: 2, security: hotMatches ? 1 : 0, setFlags: { '兴趣班': hotMatches ? '家长的选择——碰巧选对了' : '家长的选择' } },
              result: hotMatches
                ? '一年 96 课时。第三节课老师私下说："这孩子上手上得有点快——不像纯练出来的。"你在玻璃窗外，忽然觉得这份钱花得值。'
                : '一年 96 课时。第一节课他在教室里，你在玻璃窗外——像当年自己的父母一样，只是这次你拍了视频。',
            },
            {
              text: '看他平时盯着什么，报他真正喜欢的',
              cost: { money: 3600 },
              effects: { money: -3600, spendKind: 'education', security: 3, setFlags: { '兴趣班': '他自己的选择' } },
              result: '你蹲了一周观察：他在哪里停得最久。报的名可能冷门，但每次上课他跑得最快。\n（"影响而非控制"，从选兴趣班开始。）',
            },
            {
              text: '不报，幼儿园放学就是放学',
              effects: { mama: 2, face: -1 },
              result: '放学后的操场、沙坑和晚饭前的动画片。有人说你心大，也有老师私下说：这样的孩子，眼睛是亮的。',
            },
          ],
        };
      },
    },

    // ---------- 撒谎链第二次发芽（化石级种子的逆转窗口） ----------
    {
      id: 'a_second_lie', kind: 'anchor', priority: 'main', day: [10, 16], stage: 'kindergarten',
      title: '花瓶，和一只不在场的猫',
      art: { pose: '幼儿', expr: '平静', outfit: '园服', scene: '家中' },
      make(state) {
        const hasLie = Boolean(state.flags['第一颗隐瞒种子']);
        if (hasLie) {
          return {
            text: '"哐当——"\n客厅的花瓶碎了。他从沙发后面探出头，这次没有慌张，甚至先看了一眼碎片的分布：\n"是猫打翻的。"\n你们家没有猫。上个月起，猫寄养在外婆家。\n他的谎，比一年半前圆多了：有动机，有细节，有平静的眼神。这是「第一颗隐瞒种子」结出的第一批果实。' + (state.child.talent === 'verbal' ? '\n（你后来才知道：语言型的孩子，连谎言也是语言。）' : ''),
            choices: [
              {
                text: '当场戳穿，罚站想清楚',
                effects: { security: -3, setFlags: { '谎言升级': '被罚出来的策略——下次会更小心' } },
                result: '"猫在哪？"你问。他卡壳了两秒，眼神开始躲闪。罚站的十分钟里他哭了吗？没有。他在复盘哪里出了破绽。',
              },
              {
                text: '平静地谈："猫不会打花瓶。但我不想骂你——你怕的到底是什么？"',
                effects: {
                  security: 3,
                  unsetFlags: ['第一颗隐瞒种子'],
                  setFlags: { '诚实被温柔对待': '一年半后的逆转：化石级种子被你亲手起了出来' },
                  log: { text: '花瓶事件的那个晚上，他说出了"我怕你生气"。这一年半的第一句真话。', hl: true },
                },
                result: '他憋了很久，说："我怕你生气。"\n你们聊了花瓶，聊了害怕，聊了"说真话天不会塌"。化石级的种子也能逆转——但窗口不多了，这一次，你抓住了。',
              },
              {
                text: '懒得追究，自己收拾了碎片',
                effects: { setFlags: { '谎言升级': '谎言没有被看见，于是继续生长' }, marriage: -1 },
                result: '你扫掉了碎片，也扫掉了一次对话。他回房间的时候脚步很轻——谎言第一次没有代价，这本身就是一个代价。',
              },
            ],
          };
        }
        return {
          text: '"哐当——"\n客厅的花瓶碎了。他站在碎片旁边，愣了几秒，然后自己走到你面前：\n"我打碎的。对不起。"\n上一次打翻牛奶，你温和地接住了他。这一次，他选择了先说真话——「诚实被温柔对待」的种子，发芽了。',
          choices: [
            {
              text: '抱住他："人没事就好，我们一起收拾"',
              effects: { security: 3, marriage: 2, log: { text: '打碎花瓶的那个傍晚，他主动说了"对不起"。你们蹲在地上捡碎片，像在捡别的什么。', hl: true } },
              result: '他拿来扫帚的样子特别认真。诚实被奖励的次数多了，就会变成性格。',
            },
            {
              text: '"承认错误很好。花瓶的钱，从零花钱里分期扣"',
              cost: { money: 0 },
              effects: { security: 1, setFlags: { '金钱观启蒙': '一只花瓶换来的第一课' } },
              result: '他问："分期是什么？"你说："就是每周扣两块，扣到小学。"\n他认真地点头，从此对"多少钱"有了概念。',
            },
            {
              text: '"主动承认是好孩子，但下次注意！"然后还是凶了两句',
              effects: { security: -4, unsetFlags: ['诚实被温柔对待'], setFlags: { '第一颗隐瞒种子': '好孩子的心，凉了半截' } },
              result: '"好孩子"和"凶两句"出现在同一分钟里。他低下头的瞬间，你亲手把一年半前种下的好种子，换了一颗坏的。',
            },
          ],
        };
      },
    },

    // ---------- 同学矛盾（主线版） ----------
    {
      id: 'a_classmate_conflict', kind: 'anchor', priority: 'main', day: [8, 20], stage: 'kindergarten',
      title: '他在幼儿园被起外号了',
      art: { pose: '幼儿', expr: '委屈', outfit: '园服', scene: '幼儿园' },
      make(state) {
        const chubby = Boolean(state.flags['小胖墩苗子']);
        const nickname = chubby ? '"小胖墩"——体检表上那条冲高的曲线，成了别人的武器' : '"爱哭鬼"——因为他入园头两个月确实哭过';
        return {
          text: `接他放学的路上，他忽然说不想去幼儿园了。问了很久才说：有小朋友给他起外号，${nickname}。\n你握着他的小手，心里已经过了三遍气、理性和"该不该找老师"。`,
          choices: [
            {
              text: '找老师沟通',
              effects: { face: -1, security: 1, setFlags: { '社交初体验': '第一次冲突，大人出面解决的' } },
              result: '老师处理得很快，两个小孩握手言和。第二天他们又玩到了一起——小孩的仇，保质期通常不超过一顿加餐。但你心里那口气，保质期长得多。',
            },
            {
              text: '教他自己应对："下次看着他说，我不喜欢这个名字"',
              cost: { energy: 1 },
              effects: { energy: -1, security: 3, nursingSkill: 2, setFlags: { '社交初体验': '第一次冲突，自己学会应对的' } },
              result: '你在家陪他演练了三遍。一周后他说："我说了，他们就不叫了。"\n晚上他睡着以后你想：这一课，比一百个兴趣班都值。',
            },
            {
              text: '直接找对方家长',
              effects: { face: 1, setFlags: { '社交初体验': '两家大人的战争，替他打的' } },
              result: '对方家长道了歉，家长群里安静了三天。他从你和他爸爸/妈妈的通话里听懂了什么——下次再有事，他可能不说了。',
            },
          ],
        };
      },
    },

    // ---------- 老师约谈 ----------
    {
      id: 'a_teacher_talk', kind: 'anchor', priority: 'main', day: [12, 24], stage: 'kindergarten',
      title: '老师请你聊聊',
      art: { pose: '幼儿', expr: '平静', outfit: '园服', scene: '幼儿园' },
      make(state) {
        const active = ['social', 'demanding'].includes(state.child.temperament);
        const topic = active
          ? '"他特别聪明，就是坐不住。集体活动的时候，他总想按自己的来。"'
          : '"他很乖，就是太安静了。分组活动从来不主动，我有点担心他的存在感。"';
        return {
          text: `接他放学，班主任在门口把你叫住。她先说"孩子挺好的啊"，然后话锋一转——那是一种你熟悉的句式，家长会专用委婉语：\n${topic}\n她说话时会微微侧头，像在斟酌每个词；你点头如捣蒜，脑子里已经在放各种培训班广告。`, 
          choices: [
            {
              text: '回家针对性练：规则游戏/多约小朋友',
              cost: { energy: 1 },
              effects: { energy: -1, security: 2, nursingSkill: 2 },
              result: active ? '木头人、抢椅子、轮流棋——规则在游戏里长进了身体。一个月后老师说："进步很大。"' : '每周约一次小朋友来家里。第三次，你听见他在卧室里咯咯地笑，声音大得陌生。',
            },
            {
              text: '"老师您多担待，孩子有自己的节奏"',
              effects: { mama: 1, face: -1 },
              result: '老师笑了笑没再说什么。你也不确定自己是在保护他，还是在回避问题——当父母的大部分时刻，都是这种不确定。',
            },
            {
              text: '报个专注力训练班，缺啥补啥',
              cost: { money: 2800 },
              effects: { money: -2800, spendKind: 'education', setFlags: { '焦虑父母': '老师一句"坐不住"，你听成了"输在起跑线"' } },
              result: '八千八的感统课包，教室里全是同样焦虑的父母。孩子的表现没大变化——你的焦虑倒是有了去处。',
            },
          ],
        };
      },
    },

    // ---------- 六一表演 ----------
    {
      id: 'a_kg_performance', kind: 'anchor', priority: 'main', day: [18, 26], stage: 'kindergarten',
      title: '六一，他站在台上',
      art: { pose: '幼儿', expr: '笑', outfit: '演出服', scene: '礼堂' },
      make(state) {
        const social = state.child.temperament === 'social';
        const talent = state.child.talent;
        const talentLine = talent === 'art'
          ? '领舞的位置，老师想了想，给了他。'
          : talent === 'sport'
            ? '他的动作是全班最标准的一个——连谢幕的鞠躬都是。'
            : talent === 'verbal'
              ? '报幕词他背得比谁都熟，虽然这轮还轮不到他报幕。'
              : '';
        return {
          text: (social
            ? '六一汇演，他站在第一排正中间——这是他自己争取来的位置，老师说他"天生属于舞台"。'
            : '六一汇演，他站在第二排靠边——这是他抽签抽到的位置。排练了一个月，他在家跳了八十遍。') + (talentLine ? '\n' + talentLine : ''),
          choices: [
            {
              text: '举着手机录完全程',
              effects: { face: 2, marriage: 1, log: { text: '六一汇演。他在台上认真到发抖的样子，你录了整整三段视频。', hl: true } },
              result: '相册里多了 47 张照片和 3 段视频，张张糊的。发家族群的时候你选了九张最清晰的——奶奶连夜设成了屏保。',
            },
            {
              text: '请假没去成，看回放',
              effects: { security: -2, mama: -2 },
              result: '加班/出差错过了现场。老师发的视频里，他每隔十几秒就往台下看一眼。\n那个位置本来是你的。',
            },
          ],
        };
      },
    },

    // ---------- 体检（4岁/5岁） ----------
    {
      id: 'a_growth_4y', kind: 'anchor', priority: 'side', day: [11, 12], stage: 'kindergarten',
      title: '四岁体检',
      art: { pose: '幼儿', expr: '平静', outfit: '园服', scene: '医院' },
      make(state) { return G.makeToddlerCheck(state, '四岁'); },
    },
    {
      id: 'a_growth_5y', kind: 'anchor', priority: 'side', day: [23, 24], stage: 'kindergarten',
      title: '五岁体检',
      art: { pose: '幼儿', expr: '平静', outfit: '园服', scene: '医院' },
      make(state) { return G.makeToddlerCheck(state, '五岁'); },
    },

    // ---------- 幼小衔接焦虑 ----------
    {
      id: 'a_premath', kind: 'anchor', priority: 'main', day: [28, 33], stage: 'kindergarten',
      title: '"人家都在学拼音了"',
      art: { pose: '幼儿', expr: '专注', outfit: '园服', scene: '家中' },
      text: '大班上学期过半，家长群的画风变了：识字量、二十以内加减法、拼音班、坐姿训练……\n"零基础入学=灾难现场"的文章转了一篇又一篇。老师私下说：其实都会教。但没有人敢停。',
      choices: [
        {
          text: '报幼小衔接班，提前学',
          cost: { money: 4000 },
          effects: { money: -4000, spendKind: 'education', setFlags: { '幼小衔接·补习': '拼音和加减法，提前学完了' } },
          result: '三个月学完了拼音。他确实会了——代价是对一年级的课堂，提前失去了新鲜感。',
        },
        {
          text: '不提前学，只练习惯：作息、收拾、坐得住',
          cost: { energy: 1 },
          effects: { energy: -1, security: 2, setFlags: { '幼小衔接·习惯': '知识没抢跑，习惯练了半年' } },
          result: '每天固定十分钟"自己的事情自己收"，睡前书包自己理。一年级老师最喜欢的就是这种孩子：进度可能落后两周，节奏完全跟得上。',
        },
        {
          text: '什么都不做，让他玩完最后一年',
          effects: { mama: 2, face: -2 },
          result: '滑梯、沙坑、下河摸鱼（公园的假河）。童年最后一年，过成了童年的样子。至于一年级——到时候再说吧。',
        },
      ],
    },

    // ---------- 幼儿园的"喜欢" ----------
    {
      id: 'a_kg_crush', kind: 'anchor', priority: 'main', day: [28, 33], stage: 'kindergarten',
      title: '"{parent}，我喜欢一个人"',
      art: { pose: '幼儿', expr: '笑', outfit: '园服', scene: '家中' },
      text: '接他回家的路上，他忽然拉了拉你的手，声音压得很低——虽然整条街只有你们两个人："{parent}，我跟你说个秘密。"\n"我们班的王雨晴，我最喜欢她了。"\n他说这话的时候眼睛亮晶晶的，认真到你想笑又不敢笑。\n"她今天借了我一块橡皮。是香味的。"',
      choices: [
        {
          text: '"她也喜欢你吗？"',
          effects: { security: 2, setFlags: { '童年心动': '五岁，喜欢一个有香味橡皮的女孩' } },
          result: '"她说我是她最好的朋友！"他说得斩钉截铁。\n"好朋友"和"喜欢"在五岁的字典里是同一个词——这可能是人一辈子最纯粹的一次心动。',
        },
        {
          text: '"好好学习，别想这些。"',
          effects: { security: -1 },
          result: '他"哦"了一声，把后半句话咽了回去。\n那天晚上他画了一幅画：一个扎辫子的小人和一个短发的小人手拉手。他没给你看——是你后来收拾桌子的时候发现的。',
        },
      ],
    },

    // ---------- 毕业（本章终章） ----------
    {
      id: 'a_kg_graduation', kind: 'anchor', priority: 'main', day: [34, 35], stage: 'kindergarten',
      title: '幼儿园毕业了',
      art: { pose: '幼儿', expr: '笑', outfit: '学士服', scene: '礼堂' },
      make(state) {
        const goodFriends = ((state.flags['社交初体验'] || {}).source || '').includes('自己学会');
        // 天赋揭示：六年养育，答案此刻摊开——这一行将来会被小学、中学、高考志愿反复引用
        const talentMeta = G.CONFIG.TALENTS.find((t) => t.id === state.child.talent);
        return {
          text: `毕业典礼上，他穿着小小的学士服，和班上的小朋友挨个合影。\n${goodFriends ? '那个曾经给他起外号又和好的小伙伴，哭着说要"一辈子做朋友"。' : '他挤在人群里笑着，学士帽有点歪。'}\n三年，一千多个日夜。门后那个小书包，换成了印着拼音的书包——小学的书包。\n（六年了。从产房到礼堂，你陪他走完了人生的第一段路。这些年你大概也看出来了：他在【${talentMeta.name}】上，有种旁若无人的专注——${talentMeta.hint}。\n下一段路上，会有成绩单、家长会，和越来越多的、他自己的秘密。）`,
          choices: [
            {
              text: '把毕业照和满月照放在一起',
              effects: { marriage: 3, log: { text: '幼儿园毕业照旁边，摆上了当年的满月照。两张照片之间，隔着整整六年。', hl: true } },
              result: '一个皱巴巴的红包襁褓，一个歪学士帽的少年。你把两张照片设成了手机壁纸——换个角度，这也是你的毕业照。',
            },
            {
              text: '开始研究学区房和小学排名',
              effects: { energy: -1, setFlags: { '焦虑父母': '毕业典礼当晚就开始研究学区' } },
              result: '典礼还没散场，你的搜索记录已经换成了"XX小学 对口学区"。下一场军备竞赛的发令枪，是你自己按响的。',
            },
          ],
        };
      },
    },
  // ============================================================
  // 第五章 · 小学（6 → 12 岁，按学期月推进，暑假自动折叠）
  // ============================================================

  // ---------- 幼升小抉择 ----------
  {
    id: 'a_primary_enroll', kind: 'anchor', priority: 'main', day: [0, 1], stage: 'primary',
    title: '幼升小，这道题',
    art: { pose: '少年', expr: '平静', outfit: '书包', scene: '家中' },
    text: '幼儿园毕业照还没塑封，幼升小的战场已经摆开了。\n对口小学：走路五分钟，学费全免——但听说一个班五十个人，老师管不过来。家长群里流传着一张神秘的"学校梯队表"，对口的那个名字，在第三档。',
    choices: [
      {
        text: '接受对口，把省下的钱花在陪伴上',
        effects: { mama: 2, marriage: 2 },
        result: '报名表交得很快，你们是全校最早交的一批。晚上你们算了算：不买学区房省下的一百万，够全家每年旅行一次，一直到他十八岁。',
      },
      {
        text: '挤民办小学（面谈+学费）', cost: { money: 80000 },
        conditions: { moneyGte: 80000 },
        effects: { money: -80000, spendKind: 'education', face: 2, setFlags: { '焦虑父母': '幼升小就报了民办' } },
        result: '面谈那天他背了首古诗、数到一百、把积木搭成了桥。录取通知来的那天，全家在群里发了红包——你发出去的，比收回来的多。',
      },
      {
        text: '咬牙买学区房', cost: { money: 600000 },
        conditions: { moneyGte: 600000 },
        effects: { money: -600000, spendKind: 'education', face: 4, setFlags: { '学区房': '一百万换一扇校门' } },
        result: '中介说"这房子从来不为居住，只为报名表"。签字那天你的手很稳——回家的路上，你路过那所学校的围墙，往里看了很久。',
      },
    ],
  },

  // ---------- 一年级第一天 ----------
  {
    id: 'a_primary_first_day', kind: 'anchor', priority: 'main', day: [1, 2], stage: 'primary',
    title: '一年级，第一天',
    art: { pose: '少年', expr: '平静', outfit: '校服', scene: '小学门口' },
    make(state) {
      const prepared = state.flags['幼小衔接·习惯'];
      const drilled = state.flags['幼小衔接·补习'];
      const sec = state.child.security;
      let scene;
      if (prepared && sec >= 55) {
        scene = '他背着书包走进教室，把文具按顺序摆好，坐下，等老师上课——像演练过一百遍一样自然。老师投来"这孩子省心"的眼神。';
      } else if (drilled) {
        scene = '拼音全会的他，第一节课就开始转铅笔。老师说"他都会了"，语气里有欣赏，也有一点别的什么。';
      } else if (sec >= 45) {
        scene = '他在校门口回头看了你一眼——没哭。放学接他的时候，他冲出来喊的第一句话是："{parent}，小学有课间餐！"';
      } else {
        scene = '从进校门起他的眼圈就是红的，忍到了第二节课，还是哭了。老师发来照片：小小的一个人，坐在教室最后一排，背着书包不肯摘。';
      }
      return {
        text: `${scene}\n（六年前产房外的那个你，现在站在小学门口。时间就是这样，一格一格，把你推到今天。）`,
        choices: [
          {
            text: '每天接送，风雨无阻',
            effects: { security: 2, energy: -1 },
            result: '校门口的人群里，你们成了彼此的钟点。这一接，就是六年。',
          },
          {
            text: '教会他自己过马路，慢慢放手',
            effects: { security: 1, nursingSkill: 2 },
            result: '第三周起他开始要求"走到小区门口就好"。你跟在后面二十米，他没回头——你既失落又骄傲。',
          },
        ],
      };
    },
  },

  // ---------- 拼音关 ----------
  {
    id: 'a_pinyin', kind: 'anchor', priority: 'main', day: [2, 6], stage: 'primary',
    title: '拼音，第一道坎',
    art: { pose: '少年', expr: '专注', outfit: '校服', scene: '家中·书桌' },
    make(state) {
      const talent = state.child.talent;
      const flavor = talent === 'verbal'
        ? '他念得又快又准，还纠正你"是翘舌，zh-ū-n，春"。这门课对他不是坎，是滑梯。'
        : talent === 'logic'
          ? '"为什么要用字母表示汉字的读音？"他问。你答不上来——他背是背下来了，但满脸"这个系统设计得不优雅"。'
          : talent === 'art'
            ? '他把 b 和 p 画成了两个小人在推门。"多可爱啊！"他说。可爱，但听写错了四个。'
            : 'b、d、p、q 在他眼里是四胞胎。晚上听写，全家跟着一起复习。';
      return {
        text: `一年级的第一个月，全家都在上拼音课。\n${flavor}`,
        choices: [
          {
            text: '亲子夜读 + 每日打卡',
            cost: { energy: 1 },
            effects: { energy: -1, habit: 3, security: 1, nursingSkill: 1 },
            result: '四十天后，他捧着注音版《没头脑和不高兴》自己读完了第一页。你在这四十天里，把拼音表焊进了自己的梦里。',
          },
          {
            text: '报个拼音冲刺班', cost: { money: 3000 },
            effects: { money: -3000, spendKind: 'education', habit: 2 },
            result: '两周强化，效果显著。老师在群里表扬了他——你截图发到了家族群，配文"慢慢来"。',
          },
          {
            text: '不着急，老师后面还会再教',
            effects: { mama: 1 },
            result: '期中之前他自然跟上了。孩子的内存和大人不一样——有些东西，装进去只是需要多一点时间。',
          },
        ],
      };
    },
  },

  // ---------- 辅导作业之战 ----------
  {
    id: 'a_homework_war', kind: 'anchor', priority: 'main', day: [3, 10], stage: 'primary',
    title: '晚上八点，作业桌',
    art: { pose: '少年', expr: '委屈', outfit: '校服', scene: '家中·书桌' },
    text: '"远上寒山石径斜——"你刚教完"斜"在这里读 xiá，第二天老师教读 xié。\n你查手机，度娘说：教材已改，读 xié。他看着你，眼神里没有胜利的喜悦，只有对大人世界的第一丝怀疑。\n晚上八点十五分。作业还剩口算一页、背诵一篇、预习两课。桌边的空气已经开始变稠。',
    choices: [
      {
        text: '全程陪写，随叫随到',
        cost: { energy: 2 },
        effects: { energy: -2, habit: 5, security: 1 },
        result: '一学期下来，他的字进步了，你的血压也进步了。班主任说他是全班"完成度最稳定"的孩子——没人知道这五个字背后，是三百多个八点钟。',
      },
      {
        text: '作业托管班，专业的事交给专业的人', cost: { money: 3600 },
        effects: { money: -3600, spendKind: 'education', habit: 3, mama: 2 },
        result: '每天六点到八点，他在托管班写完作业再回家。饭桌重新变成了饭桌——这钱买的不是作业，是你们家的晚间和平。',
      },
      {
        text: '自己的作业自己负责，写不完自己跟老师交代',
        effects: { habit: -4, security: 1 },
        result: '他被老师留堂两次之后，开始自己记作业了。习惯分低开高走——但代价是前两个月的成绩单不太好看。',
      },
    ],
  },

  // ---------- 小学：情窦初开 ----------
  {
    id: 'a_primary_crush', kind: 'anchor', priority: 'main', day: [14, 22], stage: 'primary',
    title: '书包里的信',
    art: { pose: '少年', expr: '平静', outfit: '校服', scene: '家中' },
    text: '你帮他理书包，从语文课本里掉出来一张折成心形的纸。\n打开：铅笔写的"我喜欢你"，落款是同桌的名字。\n他把纸条一把抢过去，脸红到了耳根："你别看！"\n但他没有否认。',
    choices: [
      {
        text: '"挺好的。她学习好不好？"',
        effects: { security: 3, setFlags: { '童年心动': '四年级，心形的纸条' } },
        result: '他愣了一下，然后笑了——他以为你会骂他。\n"还行吧。"他低头扒饭，嘴角翘着。\n你没再追问。有些话题开了头就够了。',
      },
      {
        text: '"这么小就想这些？以后不许了。"',
        effects: { security: -3, setFlags: { '青春期·封闭': '心形的纸条被没收了' } },
        result: '他"嗯"了一声，把那张纸条交给了你。\n你把它扔进了垃圾桶——连同他下次再跟你分享心事的可能。',
      },
      {
        text: '什么都没说，把纸条放回原处',
        effects: { security: 2 },
        result: '你把书包理好，那张纸条放在原来的位置。\n他不知道你看见了——或者知道，只是你没说。\n有些事情不需要大人参与。它自己会长。',
      },
    ],
  },

  // ---------- 成绩单签字（撒谎链第三次发芽） ----------
  {
    id: 'a_sign_report', kind: 'anchor', priority: 'main', day: [8, 12], stage: 'primary',
    title: '一张需要签字的卷子',
    art: { pose: '少年', expr: '平静', outfit: '校服', scene: '家中·书桌' },
    make(state) {
      const score = G.reportScore(state);
      const hasHonest = Boolean(state.flags['诚实被温柔对待']);
      const hasLie = Boolean(state.flags['第一颗隐瞒种子'] || state.flags['谎言升级']);

      // 学霸线
      if (score >= 85) {
        return {
          text: `期中卷子发下来了：${score} 分，全班第五。\n他冲进家门的速度比平时快了三成，卷子往桌上一拍："签字！"\n那个"签字"说得理直气壮——像出示战利品。`,
          choices: [
            {
              text: '郑重签上名字："这是你应得的"',
              effects: { security: 2, marriage: 1, log: { text: `期中 ${score} 分，全班第五。签字的那支笔，你换了一支新的。`, hl: true } },
              result: '他把你签过字的卷子端端正正夹在书包最外层——第二天是要给同桌看的。有些骄傲，需要观众。',
            },
            {
              text: '"第五？前面还有四个呢。"',
              effects: { security: -3, setFlags: { '成绩焦虑': '全班第五也不够好' } },
              result: '他的笑容停了两秒，说"哦"。然后把卷子折起来，塞进了书包最里层。\n那天晚饭他没怎么说话。你后来想起这个瞬间，会想起一个词：封存。',
            },
          ],
        };
      }

      // 诚实线：主动递卷子
      if (hasHonest && !hasLie) {
        return {
          text: `期中卷子发下来了：${score} 分，全班二十名开外。\n他把卷子在桌角放了很久，最后还是推了过来："这次没考好。老师说要签字。"\n他没有藏——六年前那只花瓶、那次温和的谈话，此刻正在发光。`,
          choices: [
            {
              text: '"谢谢你告诉我。我们看看错在哪。"',
              effects: { security: 3, habit: 2, marriage: 2 },
              result: '你们把卷子摊开，一道题一道题地过。最后一道应用题的错因是"没读懂题"——你念了一遍题目，他"啊"了一声。\n签完字他说："下次我考好了，还第一个给你看。"',
            },
            {
              text: '签字，但眉头皱了三秒',
              effects: { security: -2, setFlags: { '成绩焦虑': '皱眉的三秒，他都看见了' } },
              result: '你确实签了，也确实没说什么。但那三秒的沉默，比一顿骂更响。\n他把卷子收走的时候，走得很轻。诚实还在——只是开始收费了。',
            },
          ],
        };
      }

      // 隐瞒线：伪造签名（撒谎链三发）
      const caught = util.chance(0.6);
      if (caught) {
        return {
          text: `期中成绩单需要家长签字。\n你没有等到那张卷子——等来的是老师的电话："家长您好，孩子的回执上……这个签名，是他自己签的吧？"\n卷子被拍照发来：${score} 分，全班倒数。卷子右下角，"家长签名"一栏里，赫然是你名字的模仿体——还描了两遍。`,
          choices: [
            {
              text: '当场对质，严肃处理',
              effects: { security: -4, face: -2, setFlags: { '谎言升级': '伪造签名被抓，信任降级' } },
              result: '"你居然敢伪造我的签名！"这句话说出口的瞬间，他哭了，你也听见了自己声音里的颤抖。\n他记住的重点可能不是"诚实"，而是"下次别被抓住"。',
            },
            {
              text: '平静地谈："我想知道，你为什么要模仿，而不是给我？"',
              cost: { energy: 1 },
              effects: {
                energy: -1, security: 3,
                unsetFlags: ['谎言升级', '第一颗隐瞒种子'],
                setFlags: { '诚实被温柔对待': '签名事件的深夜大逆转' },
                log: { text: '那个晚上他终于说："我怕你失望。"——距离打翻牛奶那晚，已经过去四年了。', hl: true },
              },
              result: '他憋了很久，说："我怕你失望。"\n你们谈了四十分钟——关于分数、关于害怕、关于"{parent}失望也还是{parent}"。\n这是撒谎链的最后一次逆转窗口。你抓住了。',
            },
            {
              text: '跟老师说"是我签的"，私下再处理',
              effects: { face: -1, setFlags: { '谎言升级': '你替他把谎圆上了' } },
              result: '电话里你说了谎——以家长的身份，给孩子看。\n挂了电话你们对视了一眼，谁都没说话。这个家的诚实账户，双方各取了一笔。',
            },
          ],
        };
      }
      // 没被发现
      return {
        text: `期中卷子发下来了：${score} 分。\n你没见过这张卷子——它绕过了你的签字栏（他自己代劳了，模仿得还行），直接进了书包夹层。\n你只是隐约觉得，最近他写作业时，房门关得比以前紧了一点。`,
        choices: [
          {
            text: '还没发现——继续过日子',
            effects: { setFlags: { '谎言升级': '签名伪造成功，裂缝在内部蔓延' } },
            result: '一切如常。成绩单在书包夹层里慢慢卷边。\n（有些事不是不存在，只是你还没看见。）',
          },
        ],
      };
    },
  },

  // ---------- 同桌 ----------
  {
    id: 'a_deskmate', kind: 'anchor', priority: 'main', day: [5, 14], stage: 'primary',
    title: '同桌与三八线',
    art: { pose: '少年', expr: '笑', outfit: '校服', scene: '教室' },
    text: '他和同桌用铅笔在课桌中间划了一条线："过线的东西，归对方。"\n第一周，橡皮越线被没收；第二周，他的胳膊肘越线，被同桌用尺子量了三厘米；第三周，同桌的自动铅笔滚过来了——他捡起来，犹豫了一下，还了回去。',
    choices: [
      {
        text: '"然后呢？快说！"',
        effects: { security: 1, nursingSkill: 1 },
        result: '"然后我们现在是好朋友了。"他总结道，"三八线是三八线，朋友是朋友。"\n你把这句话记了下来——成年人的世界，缺的就是这种条款意识。',
      },
      {
        text: '"胳膊肘疼不疼？要不要跟老师说？"',
        effects: {},
        result: '"{parent}——"他无奈地看着你，"男生之间的事情，你不懂。"\n你确实不懂了。十岁的小社会，已经有自己的外交惯例。',
      },
    ],
  },

  // ---------- 兴趣池（天赋显形第二幕） ----------
  {
    id: 'a_interest_pool', kind: 'anchor', priority: 'main', day: [10, 20], stage: 'primary',
    title: '学校社团招新',
    art: { pose: '少年', expr: '笑', outfit: '校服', scene: '操场' },
    make(state) {
      const map = {
        art: '美术社（他一进门就不想走）', sport: '田径队（体育老师说他是块料）',
        verbal: '朗诵主持班（他把招募令念得像颁奖词）', logic: '数学思维社（别的孩子走了，他还在解）',
        empathy: '他没报社团——但班主任让他当了"纪律小助手"，说他会照顾人', handson: '科学实验组（他造了一座会亮灯的纸桥）',
      };
      const his = map[state.child.talent];
      return {
        text: `学校社团招新，操场摆开了三十张桌子：美术、田径、主持、编程、合唱、围棋……\n他拉着你在人群里穿行，最后停在了一张桌子前——${his}。\n旁边就是"奥数集训队"的报名表，排队的家长比孩子多。`,
        choices: [
          {
            text: '报他停下来的那个',
            effects: { security: 3, setFlags: { '兴趣深耕': '他自己选的路，跪着也走得开心' } },
            result: '报名表上，他自己写下了名字——笔画歪歪扭扭，但一笔都没犹豫。\n（天赋这颗种子，从抓周的加权，到今天，终于落进了土里。）',
          },
          {
            text: '"奥数更实用"——把队排上', cost: { money: 4800 },
            effects: { money: -4800, spendKind: 'education', security: -2, setFlags: { '焦虑父母': '兴趣让位给了升学' } },
            result: '他回头看了一眼那张桌子，然后把视线收了回来。\n奥数班他坐得住——只是每次路过美术室（/操场/广播站），脚步会慢半拍。',
          },
          {
            text: '都不报，小学就是玩',
            effects: { mama: 2, face: -1 },
            result: '放学的操场、周末的自行车。你顶着家长群的暗流按住了报名的手——"兴趣班，先让他对世界有兴趣吧。"',
          },
        ],
      };
    },
  },

  // ---------- 二胎出生 ----------
  {
    id: 'a_second_child_born', kind: 'anchor', priority: 'main', day: [14, 30], stage: 'primary',
    conditions: { flagsAll: ['二胎计划'] },
    title: '二宝来了',
    art: { pose: '少年', expr: '平静', outfit: '校服', scene: '医院' },
    make(state) {
      const girl = util.chance(0.5);
      const word = girl ? '妹妹' : '弟弟';
      state.child2 = { gender: girl ? 'girl' : 'boy' }; // 二宝性别落盘，后续章节的对话才叫得准
      const sec = state.child.security;
      const mood = sec >= 60
        ? `他对这个皱巴巴的小家伙充满了好奇，放学第一件事就是趴在婴儿床边看。${word}哭的时候，他会第一个喊你们。`
        : sec >= 45
          ? `他表现得很平静——太平静了。你说"去摸摸${word}"，他说"我作业还没写完"，然后回房间关上了门。`
          : `他开始频繁地肚子疼、头疼，检查又什么都没有。医生私下提醒：大宝的症状，多半在心里。`;
      return {
        title: `${word}来了`,
        text: `三年前种下的那颗种子，今天发芽了——${word}出生了。\n${mood}`,
        choices: [
          {
            text: '"你是{sibling}了"——让他参与照顾',
            cost: { energy: 1 },
            effects: { energy: -1, security: 2, marriage: 2, nursingSkill: 1 },
            result: `他学会了冲奶粉的温度和拍嗝的手法，笨拙但认真。${word}第一次笑，是对着他笑的。\n那个瞬间的照片，后来在你的手机里存了很多年。`,
          },
          {
            text: '先隔开，别让大宝打扰小宝休息',
            effects: { security: -2, inLaw: 2 },
            result: '他搬去了老人屋里住了一阵——"方便照顾"。没人做错什么，但他学会了在饭桌上安静，像客人。',
          },
          {
            text: '给他买个新礼物，"补偿"一下', cost: { money: 800 },
            effects: { money: -800, spendKind: 'toys', face: 1 },
            result: '新球鞋让他高兴了三天。第四天他试探着问："你们是不是更喜欢妹妹/弟弟？"\n球鞋回答不了这个问题。',
          },
        ],
      };
    },
  },

  // ---------- 家长会 ----------
  {
    id: 'a_parent_meeting', kind: 'anchor', priority: 'main', day: [18, 22], stage: 'primary',
    title: '家长会',
    art: { pose: '少年', expr: '平静', outfit: '校服', scene: '教室' },
    make(state) {
      const score = G.reportScore(state);
      const talent = state.child.talent;
      const verdict = score >= 80
        ? `"孩子很稳，就是课堂上有点安静——给他多一点发言的机会会更好。"`
        : score >= 65
          ? `"中等偏上，属于'再推一把就上去'的那档。家里要坚持抓习惯。"`
          : `"成绩暂时落后，但我观察他${talent === 'art' ? '画画很有想法' : talent === 'sport' ? '体育特别突出' : talent === 'empathy' ? '特别会照顾同学，是班里的暖宝宝' : talent === 'handson' ? '动手能力全班第一，劳动课的作品我都拍了照' : '反应其实很快，只是心不在卷子上'}——每个孩子的花期不一样。"`;
      return {
        text: `家长会，你坐在他的座位上——椅子很小，膝盖顶着桌板。\n班主任轮到你时说：${verdict}`,
        choices: [
          {
            text: '认真记笔记，回家一条条落实',
            cost: { energy: 1 },
            effects: { energy: -1, habit: 3, nursingSkill: 1 },
            result: '记了满满两页。回家路上你在车里坐了十分钟，把"抓习惯"翻译成了三个具体动作。',
          },
          {
            text: '"老师，是不是座位安排的问题？"',
            effects: { face: -2, setFlags: { '成绩焦虑': '家长会上的防御性提问' } },
            result: '老师保持微笑："座位每周轮换。"你意识到自己刚才在做什么——家长会上最难治的病，是家长的脸。',
          },
          {
            text: '散会后单独留下来，多聊十分钟',
            cost: { energy: 1 },
            effects: { energy: -1, habit: 2, marriage: 1 },
            result: '十分钟里，老师讲了一个你没见过的他：会帮值日生倒垃圾、会安慰哭鼻子的同学。\n原来老师眼中的孩子，和你眼中的，是同一个人的两页。',
          },
        ],
      };
    },
  },

  // ---------- 三年级现象 ----------
  {
    id: 'a_grade3', kind: 'anchor', priority: 'main', day: [26, 34], stage: 'primary',
    title: '三年级，分水岭',
    art: { pose: '少年', expr: '专注', outfit: '校服', scene: '家中·书桌' },
    make(state) {
      const habit = state.child.study.habit;
      const sliding = habit < 50;
      const score = G.reportScore(state, sliding ? -10 : 0);
      const explain = sliding
        ? `三年级开始，成绩从"背多分"转向"理解题"。以前靠记忆能拿的分，现在要靠习惯和阅读量来撑。\n他这次考了 ${score} 分——不是他变笨了，是赛道换了，而他的学习习惯，还停留在一年级。`
        : `都说三年级是道坎，他稳稳地迈过去了：${score} 分。\n题目变难了，但每天固定的作业时间和阅读时间，让坡度对他来说没那么陡。`;
      return {
        text: `教育圈有句话："一二年级不分上下，三年级开始分化。"\n期中成绩出来，你们终于亲眼见到了这道"分水岭"。\n${explain}`,
        choices: [
          {
            text: '加码：补习班 + 每日刷题', cost: { money: 6000 },
            effects: { money: -6000, spendKind: 'education', habit: 4, security: -2, setFlags: { '补习依赖': '三年级开始依赖补习' } },
            result: '成绩两周后开始回升。代价是他的画笔（/球鞋/课外书）在书架上落了灰——你安慰自己：等成绩稳了就还给他。"稳了"的定义，可以无限后移。',
          },
          {
            text: '降难度，先重建信心',
            cost: { energy: 1 },
            effects: { energy: -1, security: 3, habit: 3 },
            result: '你把目标从"追上大部队"改成"这周比上周多做对一道题"。一个月后他自己说："其实我慢慢会了。"\n信心这东西，摔碎容易，是这么一片一片粘回来的。',
          },
          {
            text: '找原因：也许不是学习的问题',
            effects: { habit: 2, security: 2 },
            result: `你翻了最近三个月的卷子，发现错的题里有一半是"没读完题"。再往深处看：他最近睡眠不足——因为${state.flags['屏幕大战'] ? '晚上在被窝里刷手机' : '你们最近总在争吵'}。\n成绩单是结果，原因永远在别处。`,
          },
        ],
      };
    },
  },

  // ---------- 视力筛查 ----------
  {
    id: 'a_myopia', kind: 'anchor', priority: 'main', day: [20, 36], stage: 'primary',
    title: '视力表上的 E 变小了',
    art: { pose: '少年', expr: '平静', outfit: '校服', scene: '医院' },
    make(state) {
      const screenRule = Boolean(state.flags['屏幕规则']);
      return {
        text: `学校视力筛查的结果发到家长群：右眼 4.8，左眼 4.9，建议复查。\n复查结果：近视 125 度。医生问："平时户外活动多吗？用眼习惯怎么样？"\n${screenRule ? '你想起三年前立的屏幕规矩——幸好立得早，否则今天可能不止这个度数。' : '你想起那些"看会儿平板安静一会儿"的傍晚。它们都记得账。'}`,
        choices: [
          {
            text: '配 OK 镜（角膜塑形镜）', cost: { money: 9800 },
            effects: { money: -9800, spendKind: 'medical', face: 1 },
            result: '每晚睡前戴、早上摘，度数涨得慢。一万块换一副"夜里偷偷工作的眼镜"——贵，但眼镜店老板说这是"最值得的近视税"。',
          },
          {
            text: '普通框架眼镜', cost: { money: 800 },
            effects: { money: -800, spendKind: 'medical', setFlags: { '近视': '眼镜人生，从九岁开始' } },
            result: '配镜师说"度数还会涨，一年一查"。他戴上眼镜照镜子，看了很久，说："好像个书呆子。"\n第二天到学校，班里一半同学都戴着——他很快就不是"书呆子"了，是"正常的大家"。',
          },
          {
            text: '先不配，每天户外两小时试试',
            cost: { energy: 1 },
            effects: { energy: -1, security: 1 },
            result: '放学后的公园、周末的球场，每天雷打不动两小时。半年后复查：度数没涨。\n医生说"户外是目前唯一被证实有效的预防"——最便宜的药，是阳光。',
          },
        ],
      };
    },
  },

  // ---------- 校园边界事件 ----------
  {
    id: 'a_bully', kind: 'anchor', priority: 'main', day: [22, 42], stage: 'primary',
    title: '操场角落的事',
    art: { pose: '少年', expr: '委屈', outfit: '校服', scene: '操场' },
    make(state) {
      const sensitive = state.child.temperament === 'sensitive';
      return {
        text: `班主任来电：课间的时候，班里几个孩子给他起了外号，还把他的水杯藏了起来。\n${sensitive ? '他没告诉任何人——是别的同学看不下去说的。你接电话的手在抖：他回家什么都没提，还照常写了作业、道了晚安。' : '他跟人推搡了两下，都没受伤。老师说"孩子间的事，已经批评了"。'}`,
        choices: [
          {
            text: '感谢老师，回家只听不说',
            cost: { energy: 1 },
            effects: { energy: -1, security: 3, nursingSkill: 2 },
            result: '晚上你只是搂着他聊天，聊了四十分钟别的事。最后他自己开口："{parent}，有同学拿我水杯。"\n你等到了这句话。有些事，孩子需要自己决定什么时候说。',
          },
          {
            text: '要求对方当众道歉，找对方家长',
            effects: { face: 2, security: 1 },
            result: '道歉当着全班进行，水杯物归原主。事情解决了——只是后来那几个孩子见他绕着走，全班也安静了几天。正义到场，气氛没到。',
          },
          {
            text: '教他"下次直接还手"',
            effects: { security: -1, setFlags: { '社交初体验': '被教了用拳头说话' } },
            result: '"不许先动手，但别人动手你必须还。"他背口诀一样记住了。\n你看着他，忽然想起自己爸爸说这话时，你也是这么大。',
          },
        ],
      };
    },
  },

  // ---------- 手机之战 ----------
  {
    id: 'a_phone_first', kind: 'anchor', priority: 'main', day: [36, 50], stage: 'primary',
    title: '他要一部手机',
    art: { pose: '少年', expr: '专注', outfit: '校服', scene: '家中' },
    make(state) {
      const rule = Boolean(state.flags['屏幕规则']);
      return {
        text: rule
          ? '"全班就我没有手机。"这句话他每周说一次，已经说了两个月。\n三年级立下的屏幕规矩，正在经受青春前夜的第一次压力测试。'
          : '他开始频繁借用你的手机"查题"——你后来发现查题十分钟，短视频二十五分钟。\n没有规矩的地基，这一次要现挖。',
        choices: [
          {
            text: '电话手表→学生手机，功能逐级开放',
            cost: { money: 1200 },
            effects: { money: -1200, spendKind: 'care', security: 1, nursingSkill: 1 },
            result: '能打电话、能定位、不能装游戏。他不太满意，但接受了——因为合同是你俩一起签的，包括"五年级开放听歌，初一开放微信"。',
          },
          {
            text: '直接给旧手机，约定使用时间',
            effects: { setFlags: { '屏幕规则': '迟到六年的规矩，从手机开始补课' } },
            result: '第一周超时三次，扣掉三次周末使用权。第四周开始，闹钟响他自己关屏幕——规矩建立的最佳时机永远是"最早"，其次是"现在"。',
          },
          {
            text: '给了手机，没立规矩',
            effects: { setFlags: { '屏幕大战': '没有规则的开放，是战争的开始' }, security: -1 },
            result: '他安静了很多，也远了很多。饭桌上的"嗯"越来越多，眼睛越来越不离开那块屏幕。\n你隐约知道，初中还有更大的仗要打。',
          },
        ],
      };
    },
  },

  // ---------- 小升初（本章终章） ----------
  {
    id: 'a_small_graduation', kind: 'anchor', priority: 'main', day: [57, 59], stage: 'primary',
    title: '小升初',
    art: { pose: '少年', expr: '笑', outfit: '校服', scene: '礼堂' },
    make(state) {
      const score = G.reportScore(state, 3);
      const lieChain = state.flags['谎言升级'] ? '谎话连篇' : state.flags['诚实被温柔对待'] ? '诚实依旧' : '不好说';
      let track, trackFlag;
      if (score >= 75) {
        track = '重点民办的实验班向他敞开了门——面试那天他侃侃而谈的样子，像极了抓周时紧紧攥住命运的那个婴儿。';
        trackFlag = '小升初·优质';
      } else if (score >= 55) {
        track = '对口直升，一切平顺。没有惊喜，也没有惊吓——大多数人的故事，都是这个版本。';
        trackFlag = '小升初·对口';
      } else {
        track = '分数卡在录取线上，最终进了一所民办的最后一档，学费不菲，底子偏虚——初中三年，是一场逆风局。';
        trackFlag = '小升初·踩线';
      }
      const echo = state.flags['谎言升级']
        ? '（你还记得吗——六年前那杯打翻的牛奶，四年前那个模仿的签名。今天他自己把成绩单放在了你桌上，你翻开一看：每一科都在，没有藏。）'
        : '';
      return {
        text: `毕业典礼在礼堂举行，和幼儿园那次只隔了六年。\n${track}\n（这六年：撒谎链的最终状态——${lieChain}；天赋在他身上长成了形状；而你们，从产房外的年轻人，变成了能在毕业典礼上冷静鼓掌的中年人。）${echo}`,
        choices: [
          {
            text: '拍全家福，和满月照、幼儿园毕业照放在一起',
            effects: { marriage: 3, setFlags: { [trackFlag]: '小升初的答案，六年养育的总分' }, log: { text: '小学毕业。三张照片排成一排：襁褓、学士帽、红领巾。你数了数中间隔的年数，没数完就笑了。', hl: true } },
            result: '三张照片排成一排。中间隔着的，是一千多个"晚上八点十五分"的作业桌，和无数个你已经想不起来、但都在场的普通日子。',
          },
          {
            text: '当晚开始研究初中择校和分班考',
            cost: { energy: 1 },
            effects: { energy: -1, setFlags: { [trackFlag]: '小升初的答案，六年养育的总分', '焦虑父母': '毕业典礼当晚就在研究分班考' } },
            result: '搜索记录：初中分班考范围、初一预习资料、寄宿 vs 走读。下一场军备竞赛的枪声，又一次由你亲手鸣响。',
          },
        ],
      };
    },
    },

    // ============================================================
    // 第六章 · 初中（12 → 15 岁，按学期月推进）：青春期与分流
    // ============================================================

    // ---------- 初一报到 ----------
    {
      id: 'a_middle_first_day', kind: 'anchor', priority: 'main', day: [0, 1], stage: 'junior',
      title: '初一，新世界',
      art: { pose: '少年', expr: '平静', outfit: '中学校服', scene: '中学门口' },
      make(state) {
        const track = state.flags['小升初·优质'] ? '重点班' : state.flags['小升初·踩线'] ? '借读的最后一档' : '普通班';
        const flavor = track === '重点班'
          ? '重点班的第一节课，老师没讲课文，讲了一句："在这里，你们每个人以前都是第一。"他的入学排名，是全班倒数第七。'
          : track === '借读的最后一档'
            ? '学费单比成绩单先到。班主任很客气，但你能听出来"借读"两个字的分量——这个学期，他要先证明自己配得上这张课桌。'
            : '普通班的教室在三楼，采光很好。同桌是小学同校的，两人用眼神完成了"又是你"的问候。';
        return {
          text: `${flavor}\n（小学用了六年证明的东西，初中三年就要重新证明一遍——成长就是这样不断清零重来的过程。）`,
          choices: [
            {
              text: '开学第一周，全家节奏跟着调',
              cost: { energy: 1 },
              effects: { energy: -1, habit: 2, security: 1 },
              result: '作息表重排：六点半起床、十点熄灯。你把自己的手机静音时间也调到了十点——身教这张牌，你打得心甘情愿。',
            },
            {
              text: '让他自己适应，你只管饭',
              effects: { mama: 1 },
              result: '第一个月手忙脚乱：忘带课本两次、坐过站一次。第二个月，他出门前会自己检查书包了。\n你只管饭——但饭桌上的十分钟，他每天都讲学校的事。',
            },
          ],
        };
      },
    },

    // ---------- 初潮（女孩·双视角） ----------
    {
      id: 'a_puberty_girl', kind: 'anchor', priority: 'main', day: [1, 8], stage: 'junior',
      conditions: { genderIs: 'girl' },
      title: '她来了例假',
      art: { pose: '少年', expr: '平静', outfit: '中学校服', scene: '家中' },
      make(state) {
        const isMama = state.perspective === 'mama';
        return {
          text: isMama
            ? '她在卫生间待了很久，出来的时候红着脸，声音很小："妈，我好像……来了。"\n你早就准备好了那包东西——在柜子第二层，放了一年。这一天来了，你反而有点想哭：她真的长大了。'
            : '是妻子发来的微信："她来例假了，你下班买两包那个，牌子在照片里。"\n你在超市货架前站了十分钟，对着照片比对了三遍，最后买了两种——拿回家让她们挑，剩下的错不了。\n那天晚上你敲她房门送热水的时候，突然意识到：那个骑在你脖子上的小姑娘，开始有自己的秘密了。',
          choices: [
            {
              text: '认认真真谈一次：身体的、心理的、保护的',
              cost: { energy: 1 },
              effects: { energy: -1, security: 3, marriage: 2, log: { text: '初潮那晚的长谈。她说"{parent}，其实我早就知道了，同学都讲过"——但你的那部分，她记了很多年。', hl: true } },
              result: isMama
                ? '你们聊了四十分钟，从卫生巾聊到月经周期聊到"以后遇到什么事都可以告诉我"。她说："妈，你好专业。"\n你笑着说"我也是过来人"，心里想的是：谢谢你自己，当年没人跟你讲这些。'
                : '妻子主讲，你在旁边补充了一句："以后谁欺负你，告诉爸爸。"\n她翻了个白眼说"都什么年代了"——但那个白眼后面的笑，你看见了。',
            },
            {
              text: '塞给她一本书，让她自己看',
              effects: { security: 1 },
              result: '《女孩的秘密书》放在她枕头上，附一张便利贴："有问题随时问。"\n第二天书不见了，也没被提起。但那周她主动要求买了新的内衣——她看懂了需要的部分。',
            },
          ],
        };
      },
    },

    // ---------- 变声与喉结（男孩） ----------
    {
      id: 'a_puberty_boy', kind: 'anchor', priority: 'main', day: [3, 12], stage: 'junior',
      conditions: { genderIs: 'boy' },
      title: '他的声音劈叉了',
      art: { pose: '少年', expr: '委屈', outfit: '中学校服', scene: '家中' },
      make(state) {
        const sib = state.child2 ? (state.child2.gender === 'girl' ? '妹妹' : '弟弟') : null;
        const crowd = sib ? `${sib}笑出了声，你憋笑憋出了内伤` : '你憋笑憋出了内伤';
        return {
          text: `饭桌上他喊了声"{parent}"，那声音像一根被踩了尾巴的二胡——前半句童声，后半句突然降了八度。\n他自己愣了一下，全家愣了三秒，然后${crowd}。他放下碗就回了房间。\n那周之后，他说话越来越少——不是不想说，是每次开口都在赌嗓子的走向。`,
        };
      },
      choices: [
        {
          text: '买点润喉糖，装作没听见那些劈叉',
          effects: { security: 2, marriage: 1 },
          result: '桌上多了一罐润喉糖，谁都没解释。他拿了就走。\n两个月后，一个陌生的低音在客厅喊"我回来了"——你回头找了两秒，才认出是这个家的声音。',
        },
        {
          text: '跟他聊"爸爸当年也是这样"',
          cost: { energy: 1 },
          effects: { energy: -1, security: 2, nursingSkill: 1 },
          result: '你讲了自己初二在课堂上朗读劈叉、全班笑翻的惨案。他笑出了声——然后自己也劈了一个，两人笑作一团。\n男人的青春期，需要一个过来人告诉他：这不丢人。',
        },
      ],
    },

    // ---------- 身高冲刺 ----------
    {
      id: 'a_growth_spurt', kind: 'anchor', priority: 'main', day: [4, 14], stage: 'junior',
      title: '裤脚又短了',
      art: { pose: '少年', expr: '笑', outfit: '中学校服', scene: '商场' },
      make(state) {
        const boy = state.child.gender === 'boy';
        return {
          text: boy
            ? '半年，八厘米。校裤换了两条，鞋码从 38 直奔 42——你以为买了能穿两年，结果三个月就顶脚。\n饭量翻倍，晚上喊饿，早上膝盖疼（医生说那叫"生长痛"，是好事）。你的钱包和他的骨头，在进行一场速度竞赛。'
            : '她抽条的速度慢了下来，但该来的都来了。衣柜里去年的裤子全变成了九分裤，她站在镜子前的时间明显变长。\n你看着她，想起自己也曾在那样的镜子前，练习怎么站才显得腿长一点。',
          choices: [
            {
              text: '该买就买，长身体不等人', cost: { money: 900 },
              effects: { money: -900, spendKind: 'clothes', security: 1 },
              result: '两个月的"裤子基金"就这么没了。但看他/她穿着合身的校服走进校门的背影——高得让你需要仰视一点了——这钱花得像风一样自然。',
            },
            {
              text: '买大一码，"还能穿两年"',
              effects: { face: -1, security: -1 },
              result: '卷起的裤脚在校门口格外显眼。同学问"你裤子怎么这么长"，他说"我{parent}说能穿两年"。\n那天的晚饭他吃得很快。',
            },
          ],
        };
      },
    },

    // ---------- 房门 ----------
    {
      id: 'a_bedroom_door', kind: 'anchor', priority: 'main', day: [2, 8], stage: 'junior',
      title: '他的房门，关上了',
      art: { pose: '少年', expr: '平静', outfit: '家居服', scene: '家中·走廊' },
      text: '不知道从哪天起，他进房间就关门。不是摔门，就是……轻轻地、但是确定地关上。\n门上后来贴了一张便签，字迹工整："进门请敲门。"\n你站在那条走廊上，手里端着切好的果盘，第一次意识到：这个家，多了一道国境线。',
      choices: [
        {
          text: '敲门，等他说"请进"',
          cost: { energy: 1 },
          effects: { security: 3, setFlags: { '青春期·敞开': '尊重国境线，反而常常免签' } },
          result: '你敲了，他说"进"。果盘放下，你退出去，关门。\n三个月后那张便签自己掉了——因为门开着的时间，越来越多了。尊重边界的人，反而被允许越境。',
        },
        {
          text: '这是我家，推门就进',
          effects: { security: -3, setFlags: { '青春期·封闭': '被入侵的领土，开始修建工事' } },
          result: '你推门进去的那两次，看到的都是他迅速扣掉的手机屏幕。\n第三次，门锁装上了。有些边界你不承认，它就会变成实体。',
        },
      ],
    },

    // ---------- 手机战争（正面战场） ----------
    {
      id: 'a_phone_war', kind: 'anchor', priority: 'main', day: [4, 12], stage: 'junior',
      title: '手机，正面战场',
      art: { pose: '少年', expr: '生气', outfit: '家居服', scene: '家中' },
      make(state) {
        const hadRule = Boolean(state.flags['屏幕规则'] || state.flags['手机合约']);
        if (hadRule) {
          return {
            text: '月考成绩下滑，班主任在家长会上点名"个别同学课堂精神不振"。\n你回家打开他的平板使用记录——游戏时长 11 小时/周，短视频 6 小时。规矩立过，但青春期的执行成本，和幼儿园完全是两个量级。',
            choices: [
              {
                text: '开家庭会议，重新签合约',
                cost: { energy: 1 },
                effects: { energy: -1, security: 2, habit: 2, setFlags: { '手机合约': '初中版：每周游戏 3 小时，超时下周冻结' } },
                result: '新合约他讨价还价：游戏 3 小时、周末加 1 小时、考试周全禁。你全盘接受——因为他参与制定的规则，他会自己执行。\n签约那天你忽然明白：管手机的本质，是教他和欲望谈判。',
              },
              {
                text: '直接没收，月底归还',
                effects: { security: -3, marriage: -1 },
                result: '没收的过程像一次缴械。他没哭没闹，只是说了一句："你不是签过合约吗。"\n你愣在原地——规矩是你定的，也是你先破坏的。',
              },
            ],
          };
        }
        return {
          text: '凌晨一点，你去倒水，发现他房间的被窝里有光。\n掀开：手机、耳机、《王者荣耀》的结算界面。这是你给他配的"联系用"手机——现在它联系着的，是另一个世界。\n初二上学期，月考排名下降了 200 名。',
          choices: [
            {
              text: '当场没收，全家断网整顿',
              effects: { security: -4, setFlags: { '屏幕大战': '战争升级：没收与反没收' } },
              result: '手机被锁进你的抽屉，他三天没跟你说话。第四天，你在他书包里发现了第二部手机——同学淘汰给他的旧机器。\n堵不如堵不如堵。这场仗，才刚刚开始。',
            },
            {
              text: '深呼吸，天亮再谈',
              cost: { energy: 1 },
              effects: { energy: -1, security: 1, setFlags: { '手机合约': '深夜的克制，换来第二天的谈判桌' } },
              result: '那晚你把手机放回原处，回房睡了——这是你这几年做过最难的事。\n第二天的谈话从"我没收你手机"变成了"我们聊聊昨晚那一局"。他认了错，你们签了第一份使用合约。',
            },
          ],
        };
      },
    },

    // ---------- 初二学业分化 ----------
    {
      id: 'a_study_divide', kind: 'anchor', priority: 'main', day: [8, 16], stage: 'junior',
      title: '初二，物理来了',
      art: { pose: '少年', expr: '专注', outfit: '中学校服', scene: '家中·书桌' },
      make(state) {
        const logic = state.child.talent === 'logic';
        const verbal = state.child.talent === 'verbal';
        const flavor = logic
          ? '物理是他在全班扬眉吐气的科目——"受力分析"三个字，在别人是噩梦，在他是拼图。\n第一次物理月考，他考了年级前十。老师在卷子上写："有天赋，保持。"'
          : verbal
            ? '语文英语稳如老狗，物理化学步步惊心。他说："为什么浮力要用公式，不能用文字讲道理？"\n你无言以对——这个世界的答案，确实分成两种写法。'
            : '物理第一天，他就在"参照物"上迷失了。"为什么坐在车里算静止，算相对运动？"这不是刁难，是真诚的困惑。\n初二这道坎，坎的就是抽象思维。';
        return {
          text: `都说"初二分水岭"——几何证明、物理入门、英语语法三座大山同时压来，成绩第一次出现了结构性的分化。\n${flavor}`,
          choices: [
            {
              text: '弱科补强：报一对一', cost: { money: 9600 },
              effects: { money: -9600, spendKind: 'education', habit: 3, setFlags: { '补习依赖': '初中一对一，300/课时' } },
              result: '物理老师一周两次，一次两小时。两个月后他不再怕"参照物"了。\n账单每月 4800——你开始在记账 App 里专门建了一个分类，叫"赎金"。',
            },
            {
              text: '发挥长板：把强科练到极致',
              effects: { habit: 2, security: 2 },
              result: '扬长避短也是战略。强科保持年级前列，弱科保证不崩——中考是总分的游戏，不是单科的表演。',
            },
            {
              text: '顺其自然，健康第一',
              effects: { mama: 2, security: 2 },
              result: '你没加码，只保证了三件事：睡眠八小时、周末半天户外、饭桌不谈成绩。\n排名中等，但他眼睛里有光——你赌的是长跑，不是这一圈。',
            },
          ],
        };
      },
    },

    // ---------- 早恋苗头（撒谎链联动） ----------
    {
      id: 'a_crush_first', kind: 'anchor', priority: 'main', day: [10, 22], stage: 'junior',
      title: '抽屉里的信',
      art: { pose: '少年', expr: '平静', outfit: '中学校服', scene: '家中' },
      make(state) {
        const honest = Boolean(state.flags['诚实被温柔对待']);
        const found = util.chance(0.7); // 是否被你发现
        if (!found) {
          return {
            text: '你什么都没发现。\n只是最近他放学回家的时间晚了十分钟，笑点变低了，写作业时哼歌的频率变高了。\n你把这一切归档为"初中生心情好"——大抵也没错。',
            choices: [
              { text: '日子照常过', effects: {}, result: '有些故事不需要观众也能好好发生。多年后他自己讲起来，你会假装第一次听说。' },
            ],
          };
        }
        if (honest) {
          return {
            text: '你在他校服口袋里发现一张对折的小纸条——不是情书，但字迹娟秀，末尾画了个笑脸。\n晚饭后你把纸条原样放回，然后问了一句："最近，有什么想跟{parent}说的吗？"\n他盯着你看了五秒，说："有个女生……老给我递纸条。"说完自己先笑了。',
            choices: [
              {
                text: '"恭喜啊，说明你有魅力。然后呢？"',
                effects: { security: 3, marriage: 1, setFlags: { '早恋·阳光处理': '十四岁的心事，第一次有了出口' } },
                result: '他讲了半小时：她是谁、成绩怎么样、"我们就是朋友"重复了四遍。\n你全程没提"早恋"两个字。最后你说："有人喜欢你是好事，但中考之后，你们的分数会把你们送去同一所学校或者不同的学校。"\n他愣了愣——这句话他听进去了，比你预想的深。',
              },
              {
                text: '"现在是关键时期，这种事想都不要想"',
                effects: { security: -3, setFlags: { '早恋·地下化': '被否决的心事转入了地下' } },
                result: '他"哦"了一声，回房关门。\n后来你再没听他提过这个女生——但他的书包侧袋里，多了一个你没见过的钥匙扣。',
              },
            ],
          };
        }
        return {
          text: '你在他书包里发现一张纸条，字迹娟秀。你拿着它去问他，他说是"同学随便写的"。\n但他的耳朵红了。十二年前打翻的那杯牛奶、八年前模仿的那个签名——在你的追问下，他熟练地选择了同一条老路：否认。',
          choices: [
            {
              text: '不再追问，先递出信任',
              effects: { security: 2, marriage: 1, setFlags: { '早恋·地下化': '你没拆穿，谎言继续，但恨意没生成' } },
              result: '你把纸条还给他："好，{parent}信你。"\n他接过纸条的时候手抖了一下。\n你没赢这场对话——但你保住了下次对话的资格。',
            },
            {
              text: '穷追猛打，翻出聊天记录',
              effects: { security: -4, setFlags: { '青春期·封闭': '被搜查的房间，从此有了防伪措施' } },
              result: '聊天记录确实翻出来了——一个很正常的、聊作业和动漫的对话框。\n你举着手机的手悬在半空。他看着你，眼神里的东西让你想起了十二年前那个打翻牛奶的下午：\n恐惧。然后是比恐惧更糟的：冷漠。',
            },
          ],
        };
      },
    },

    // ---------- 叛逆表达 ----------
    {
      id: 'a_rebel_style', kind: 'anchor', priority: 'main', day: [12, 24], stage: 'junior',
      title: '他想染一撮头发',
      art: { pose: '少年', expr: '平静', outfit: '中学校服', scene: '理发店' },
      text: '他的手机相册里存了十几张发型图——左边铲青，头顶一撮闷青色。\n"学校规定不能染发。"你说。\n"遮挡起来看不见。"他说。\n你看着他：那撮头发对他来说是什么？你想起自己当年藏在抽屉里的磁带和贴纸。',
      choices: [
        {
          text: '陪他去，选个不那么夸张的颜色',
          cost: { money: 300 },
          effects: { money: -300, spendKind: 'clothes', security: 3, face: -1 },
          result: '理发店里他挑染了一撮很低调的深棕。走出店门的时候，他看了一眼镜子，笑了。\n周一到校，班主任让他戴了一周帽子——但那撮头发过两周就褪没了，而他记住了"我{parent}带我去染的"。',
        },
        {
          text: '"校规就是校规。不行。"',
          effects: { security: -2 },
          result: '他没再坚持，头发也没染。\n但那个周末他出门和同学打了一整天球，回来时你闻到他身上有一股淡淡的烟味——没有证据，只有直觉。\n被堵死的表达，总会找别的出口。',
        },
      ],
    },

    // ---------- 朋友圈 ----------
    {
      id: 'a_friend_circle', kind: 'anchor', priority: 'main', day: [6, 18], stage: 'junior',
      title: '他的朋友们',
      art: { pose: '少年', expr: '笑', outfit: '中学校服', scene: '球场' },
      make(state) {
        const empathy = state.child.talent === 'empathy';
        const flavor = empathy
          ? '他的朋友圈是个联合国：学霸、体育生、动漫宅、转学生——因为他谁都接得住。老师说他"有群众基础"。'
          : '他的朋友固定三五个，全是球场认识的。聊的话题你一个都插不上嘴，但笑声是通的。';
        return {
          text: `初中生的友谊，质量和数量都开始分化。\n${flavor}\n周五晚上他们照例在球场集合。你远远看过一次：一群半大的孩子，穿着晃荡的球衣，笑得像不需要理由。`,
          choices: [
            {
              text: '把家门敞开，欢迎他的朋友来',
              cost: { energy: 1 },
              effects: { energy: -1, security: 3, face: 2 },
              result: '冰箱常备可乐和西瓜。他家成了据点——你借此认识了那群孩子每一个的名字和笑脸。\n多年后他们会说："叔叔/阿姨家，我们初中最快乐的地方。"',
            },
            {
              text: '"少跟学习不好的玩"',
              effects: { security: -2, setFlags: { '青春期·封闭': '朋友被你分类，心事也被' } },
              result: '他"哦"了一声。\n后来你才知道，那个"学习不好的"孩子，在他发烧的深夜陪他走了两公里去急诊。\n成绩单量不出朋友的重量——这句话你晚了三年才懂。',
            },
          ],
        };
      },
    },

    // ---------- 体育中考 ----------
    {
      id: 'a_pe_exam', kind: 'anchor', priority: 'main', day: [16, 26], stage: 'junior',
      title: '体育中考，30 分',
      art: { pose: '少年', expr: '专注', outfit: '运动服', scene: '操场' },
      make(state) {
        const sport = state.child.talent === 'sport' || state.child.constitution >= 3;
        return {
          text: sport
            ? '体育中考在他这不是备考，是表演项目——一千米 3 分 20，篮球运球满分线以下随便停。\n体育老师找他谈了话：市青少年队要不要试试？'
            : '一千米 4 分 40，离满分线差 40 秒。跳绳倒是稳的。\n"每天傍晚陪我跑两圈。"他说这话的时候没看你，看着操场——这是他初中三年第一次主动要求你陪他做什么。',
          choices: [
            {
              text: '每天傍晚，陪练',
              cost: { energy: 2 },
              effects: { energy: -2, security: 3, marriage: 2, setFlags: { '体育中考·达标': '四十秒，是父子/母子俩一圈一圈磨掉的' } },
              result: '从四圈喘成狗，到八圈面不改色——用了五个月。\n考试那天他跑出了 4 分 05。冲线之后他在终点找你，找到了，挥了一下手。\n那 40 秒里，有你陪跑的两百公里。',
            },
            {
              text: '报个体育冲刺班', cost: { money: 3600 },
              effects: { money: -3600, spendKind: 'education', setFlags: { '体育中考·达标': '用钱换时间，也是一种办法' } },
              result: '专业教练就是不一样：摆臂、呼吸、配速，两个月成绩提到了满分线内。\n但他路过操场的时候，还是会看一眼你们没跑成的那条跑道。',
            },
          ],
        };
      },
    },

    // ---------- 中考与分流（本章终章） ----------
    {
      id: 'a_zhongkao', kind: 'anchor', priority: 'main', day: [26, 29], stage: 'junior',
      title: '中考',
      art: { pose: '少年', expr: '平静', outfit: '考试服', scene: '考场' },
      make(state) {
        const talent = state.child.talent;
        // 应试赛道的天赋错配：logic/verbal 在中考有天然优势，art/handson/sport/empathy 更难够到普高线
        // ——他们不是学不好，是这条赛道不量他们的长处。职高的专业匹配线因此真实可达。
        const score = G.reportScore(state, { logic: 6, verbal: 3 }[talent] ?? -5);
        const lieEcho = state.flags['谎言升级']
          ? '（你在成绩公布当晚才知道他的估分——不是他告诉你的，是班主任发的短信。十二年了，从牛奶到签名到估分，他习惯了自己扛。）'
          : state.flags['诚实被温柔对待']
            ? '（出考场他就给你发了消息："{parent}，物理最后一道大题我蒙的。"连蒙的都汇报——这条线，你们走了十二年。）'
            : '';
        let trackFlag, trackText;
        if (score >= 81) {
          trackFlag = '分流·重点普高';
          trackText = '分数够了市重点。录取通知书到的那天，他把信封端详了很久，然后递给你："帮我收着吧。"\n——这个动作你们心照不宣：他不确信自己配得上，需要你替他确信。';
        } else if (score >= 66) {
          trackFlag = '分流·普通普高';
          trackText = '普通高中，录取线擦边而过。没有惊喜，没有意外——你们去了对口的普高报到，交学费，领课本。\n"三年后再看。"他在新校门口说了这么一句，像在对你说，又像对自己。';
        } else if (score >= 52) {
          const major = {
            art: '数字媒体设计', handson: '智能制造（数控方向）', sport: '运动训练',
            empathy: '护理', verbal: '播音主持', logic: '电子技术应用',
          }[talent];
          trackFlag = '分流·职高';
          trackText = `分数落在普高线以下。填报志愿那晚，全家沉默——直到他指着职高招生简章的${major}专业说："我想读这个。"\n你看着那个专业名，又看看他——从抓周那天起就在看的东西，终于有了名字。${talent === 'handson' || talent === 'art' ? '"行家一出手"的赛道，从此开始。' : ''}`;
        } else {
          trackFlag = '分流·中专/其他';
          trackText = '中考失利。分数出来那晚，他在房间里待到十二点，出来喝了一次水。\n最终去了一所中专——不是终点，是岔路。十八岁那年的单招/高考，还有一次翻盘的机会。';
        }
        return {
          text: `六月，蝉声如沸。中考三天，你在考点外站了三天——和十四年前产房外的那个你，隔着一整个童年对望。\n分数公布：${score} 分。\n${trackText}${lieEcho}`,
          choices: [
            {
              text: '尘埃落定，全家吃顿好的',
              effects: { marriage: 3, security: 2, setFlags: { [trackFlag]: '中考的答案，十五年养育的总分' }, log: { text: `中考出分：${score}。饭桌上他把杯子举向你："谢谢{parent}。"——初中三年，就这一句，够了。`, hl: true } },
              result: '没有升学宴，没有朋友圈报喜（或报忧）。一家人的这顿饭吃了两个小时，聊的全是过去的糗事。\n十五年了。从产房到考场，你陪他把第一段人生走完了。',
            },
            {
              text: '当晚开始研究高中的竞争格局',
              cost: { energy: 1 },
              effects: { energy: -1, setFlags: { [trackFlag]: '中考的答案，十五年养育的总分', '焦虑父母': '出分当晚就开始研究高考' } },
              result: '新学期分班考、竞赛规划、选科建议——你收藏了十七篇攻略。\n他路过你身后看了一眼，什么也没说，回房关门。门关上的声音很轻。',
            },
          ],
        };
      },
    },

    // ============================================================
    // 第七章 · 高中（15 → 18 岁，按学期月推进）：高考与送行
    // ============================================================

    // ---------- 高一报到（四轨开局） ----------
    {
      id: 'a_senior_first', kind: 'anchor', priority: 'main', day: [0, 1], stage: 'senior',
      title: '高中，第一天',
      art: { pose: '青年', expr: '平静', outfit: '高中校服', scene: '高中门口' },
      make(state) {
        const track = state.flags['分流·重点普高'] ? '重点高中' : state.flags['分流·职高'] ? '职业高中' : state.flags['分流·中专/其他'] ? '中专校园' : '普通高中';
        const flavor = {
          '重点高中': '这里的每个人都曾是"别人家的孩子"——包括他。第一次摸底考，他排在全班第 41。\n回家的路上他没说话。你说了一句："这个班的第 41，放到全市还是前列。"他想了想，说："这话班主任也说过。"\n你俩同时笑了——重点高中的家长和孩子的第一课：接受重新洗牌。',
          '普通高中': '入学分数不算亮眼，但校门口的横幅很提气："今天你以母校为荣，明天母校以你为荣。"\n他的同桌中考分数比他高三分——"普高里面也分三六九等。"他说这话时的语气，像个小大人。',
          '职业高中': '实训楼比教学楼新，数控机床的铭牌擦得锃亮。班主任说："咱们这儿不比分数比手艺。"\n他摸了摸那台机器——你在旁边看着，忽然想起抓周那天，他抓着那个物件不撒手的样子。',
          '中专校园': '报到那天人不多，宿舍六人间。他收拾床铺的时候很安静。\n你在楼下站了很久，给自己发了一条微信："十八岁还有一次机会，单招、高考、专升本。路是弯的，但通。"',
        }[track];
        return {
          text: `${flavor}\n（从产房到高中门口——十五年了。你以为熬出来了，其实才到中盘。）`,
          choices: [
            {
              text: '"高中三年，我们一起过"',
              effects: { security: 2, marriage: 1, habit: 2 },
              result: '"一起"的意思是：他熬夜你陪着（哪怕只是假装看书），他模考失利你先递吃的后谈分数。\n这三年的胜负，一半在考场，一半在饭桌。',
            },
            {
              text: '"高中了，你自己对自己负责"',
              effects: { security: -1, habit: 1 },
              result: '你退到幕后。他自己选了住宿、自己定闹钟、自己在错题本上写"下次一定"。\n放权有放权的代价和收获——他在学做一个大人，从犯错开始。',
            },
          ],
        };
      },
    },

    // ---------- 选科 ----------
    {
      id: 'a_choose_track', kind: 'anchor', priority: 'main', day: [1, 4], stage: 'senior',
      title: '3+1+2，选科',
      art: { pose: '青年', expr: '专注', outfit: '高中校服', scene: '家中·餐桌' },
      make(state) {
        const t = state.child.talent;
        const hisWant = { logic: '物化生——"受力分析让我快乐"', verbal: '史地政——"文字让我有安全感"', art: '历史+地理+"政治也行，反正不选物理"', sport: '物理+"生物也选，运动员要懂身体"', empathy: '历史+政治+"我想学的是人"', handson: '物理+"但求别让我背历史"' }[t];
        const yourWant = t === 'logic' ? '你毫无意见——学理科，天经地义。' : '"物化生吧，"你说，"好就业。"\n他看着他面前那张选科表，第一次在你面前露出"我们看到的不是同一张表"的表情。';
        return {
          text: `高一上学期结束，选科表发下来了。3+1+2，二十种组合，一周时间决定。\n他想选：${hisWant}。\n${yourWant}`,
          choices: [
            {
              text: '尊重他的选择',
              effects: { security: 3, setFlags: { '选科·文科': '他的赛道他做主' } },
              result: '选科表交上去的那天，他哼着歌回家的——你已经很久没听他哼歌了。\n高考是赛道，选科是选赛道。这一步让他自己迈。',
            },
            {
              text: '"听我的，物化生"',
              effects: { security: -3, habit: 1, setFlags: { '选科·理科': '好就业，但不是他的热爱' } },
              result: '他沉默地改了表格。此后的物理课，他学得不差——"不差"，是他能给这门课的全部热情。\n有些拒绝不是用嘴说的，是用成绩的形状说的。',
            },
            {
              text: '一起研究：找老师聊、做职业测评',
              cost: { energy: 1 },
              effects: { energy: -1, security: 2, nursingSkill: 2, setFlags: { '选科·文科': '测评说他适合跟人打交道——跟他的直觉一致' } },
              result: '职业测评报告八页纸，结论和他的直觉一致。他把报告折好放进书包："{parent}，这下你信了吧。"\n你信了——不是信报告，是信他终于学会了用证据说话。',
            },
          ],
        };
      },
    },

    // ---------- 第一次排名 ----------
    {
      id: 'a_rank_first', kind: 'anchor', priority: 'main', day: [5, 10], stage: 'senior',
      title: '第一次大考排名',
      art: { pose: '青年', expr: '平静', outfit: '高中校服', scene: '家中' },
      make(state) {
        const score = G.reportScore(state);
        const top = state.flags['分流·重点普高'];
        const rank = score >= 82 ? '班级前十——成绩单拿回家的时候，他的下巴是抬着的' : score >= 62 ? '中游，不好不坏——像大多数人的大多数时刻' : '后半段。他把成绩单折成四折塞进校服内袋，到家也没主动拿出来';
        return {
          text: `${top ? '重点班' : '班里'}第一次大考出分：${score} 分，${rank}。\n你看着那个数字，忽然想起十五年前体重秤上的数字——从那天起，每个数字都牵动你的心跳。${score < 62 ? '\n（他说"我就这样了"——这句话不是陈述，是求救。）' : ''}`,
          choices: [
            {
              text: '"名次是别人的，进步是自己的。跟上次比。"',
              effects: { security: 3, habit: 2 },
              result: '你们把三次大考的分数画成一条折线贴在书桌前——不看排名，看趋势。\n折线在第三次开始抬头。他盯着那条线说："这个是活的。"',
            },
            {
              text: '"怎么退步了？！找找原因！"',
              effects: { security: -3, setFlags: { '成绩焦虑': '高中的第一次排名危机' } },
              result: '那次谈话持续了四十分钟，他哭了。\n你在他哭的时候还在讲"错题归类法"——多年后你会明白：他需要的不是方法，是一个可以哭的地方。',
            },
          ],
        };
      },
    },

    // ---------- 艺考路线 ----------
    {
      id: 'a_art_exam', kind: 'anchor', priority: 'main', day: [8, 18], stage: 'senior',
      conditions: { flagsAll: ['兴趣深耕'] },
      title: '"我想艺考"',
      art: { pose: '青年', expr: '专注', outfit: '画室围裙', scene: '画室' },
      make(state) {
        const artType = { art: '美术', verbal: '编导', sport: '体育单招', logic: '信息学竞赛' }[state.child.talent] || '艺术';
        return {
          text: `高二上学期，他放学回家，把一张打印的纸放在你面前：《${artType}艺考（单招）路线规划》。\n"集训半年，学费八万，十二月联考，明年三月校考，文化课要保住。"\n他讲得比你当年做任何项目汇报都清楚。你看着那张纸，看到了三样东西：八万块、半年的分离、和他眼睛里你从来没见过的坚定。`,
          choices: [
            {
              text: '支持。八万，出了。', cost: { money: 80000 },
              conditions: { moneyGte: 80000 },
              effects: { money: -80000, spendKind: 'education', security: 3, setFlags: { '艺考路线': '全家的赌注，他的战场' } },
              result: '集训的日子，画室的灯亮到凌晨。他手指磨出茧，颜料渗进指纹洗不掉。\n十二月联考，他考完出来，第一句话是："{parent}，稳了。"\n那三个字，值八万。',
            },
            {
              text: '"艺考是独木桥，走普通高考吧。"',
              effects: { security: -4, setFlags: { '成绩焦虑': '放弃的艺考，成了心口的朱砂痣' } },
              result: '他把那张规划表收起来，回了普通高考的教室。\n成绩没受影响——只是每次路过画室（操场/机房），他的脚步会慢半拍。有些路没走，会想一辈子。',
            },
            {
              text: '"家里拿不出八万"——坦诚地谈',
              effects: { security: 1, marriage: 2, setFlags: { '艺考路线': '半工半读的版本：周末集训+网课' } },
              result: '"{parent}的钱不够，但你的路不能堵。"——你们找到了折中方案：周末班+网课，费用两万八。\n他比谁都珍惜那两万八——因为知道那是怎么省出来的。',
            },
          ],
        };
      },
    },

    // ---------- 心理健康线（本作最重的选择之一） ----------
    {
      id: 'a_burnout', kind: 'anchor', priority: 'main', day: [10, 24], stage: 'senior',
      conditions: { anyOf: [{ flagsAll: ['成绩焦虑'] }, { familyLte: { marriage: 45 } }, { childLte: { security: 45 } }] },
      title: '"妈，我好累"',
      art: { pose: '青年', expr: '委屈', outfit: '高中校服', scene: '家中·深夜' },
      make(state) {
        const isMama = state.perspective === 'mama';
        return {
          text: `深夜十一点半，你去他房间送牛奶——灯没开，他坐在黑暗里。\n"怎么不开灯？"你摸到开关。\n"别开。"他说。停了很久，声音很轻："${isMama ? '妈' : '爸'}，我好累。活着好累。"\n那句话落在黑暗里，像一根针掉进海——但你有听见了。这一刻，比高考提前到来，考的是你。`,
          choices: [
            {
              text: '坐下来，开一盏最暗的灯："跟我说说。"',
              cost: { energy: 2 },
              effects: { energy: -2, security: 6, mama: 5, setFlags: { '被接住': '那句"活着好累"落进了稳稳的手里' }, log: { text: '那个深夜的长谈。天亮的时候他说："{parent}，我想请两天假。"——你批了，像批一份病假条，因为确实是。', hl: true } },
              result: '你们聊到凌晨三点。他说了排名、说了睡不着、说了"怕考不好对不起你们"。\n你只回了三句话："高考不是刑场。""家里永远是退路。""累就停，天塌不下来。"\n他请了两天假，睡了一个完整的白天。第三天早上，他自己背起了书包。',
            },
            {
              text: '第二天带他看心理咨询师', cost: { money: 1200 },
              effects: { money: -1200, spendKind: 'medical', security: 4, setFlags: { '被接住': '专业的人做了专业的事' } },
              result: '咨询师室里五十分钟，你在外面等。出来的时候他眼睛红着，但呼吸是顺的。\n咨询师跟你说了十个字："能说出来的累，都有救。"\n此后每两周一次——这是这个家花过最值的钱。',
            },
            {
              text: '"谁不累？我们当年比你苦多了。熬过去就好。"',
              effects: { security: -6, mama: -4, setFlags: { '心理危机': '求救的信号，被"熬过去"挡了回去' } },
              result: '他"哦"了一声，把牛奶喝了。\n你说的每个字都对——都对，但没有一个字进得去。\n那晚之后他再没说过累。你以为他熬过去了。他只是学会了不说。',
            },
          ],
        };
      },
    },

    // ---------- 祖辈住院 ----------
    {
      id: 'a_grandpa_ill', kind: 'anchor', priority: 'main', day: [12, 28], stage: 'senior',
      conditions: { familyLte: { inLaw: 200 } },
      title: '爷爷住院了',
      art: { pose: '青年', expr: '平静', outfit: '高中校服', scene: '医院·走廊' },
      text: '老人在厨房晕倒，送到医院，诊断为脑梗——命保住了，右边身体不听使唤了。\n病房里，爷爷见到他的第一句话是："影响你学习了吧？快回去。"\n他没走。那个教他下象棋、把他架在肩膀上看灯会的爷爷，现在连筷子都握不稳了。',
      make(state) {
        return {
          choices: [
            {
              text: '周末让他去医院陪爷爷——学习可以挤',
              effects: { security: 2, inLaw: 8, setFlags: { '祖辈的记忆': '病房里的象棋，用左手慢慢下' } },
              result: '他用左手跟爷爷下象棋——爷爷右手不行了，他替爷爷走子。一盘棋下一个小时，谁输谁赢已经不重要。\n出院那天爷爷跟护工说："我孙子，每周都来。"',
            },
            {
              text: '"高三了，别分心，我替你去。"',
              effects: { security: -2, setFlags: { '祖辈的记忆': '隔着教室的窗，他没能好好告别' } },
              result: '你替他去了七次，第八次老人走了——走在他期末考的那个周三。\n葬礼上他没哭。回家整理书包时，翻出一枚旧棋子，攥了很久。\n成绩没受影响。但有些东西，成绩衡量不了。',
            },
          ],
        };
      },
    },

    // ---------- 恋爱收尾 ----------
    {
      id: 'a_serious_love', kind: 'anchor', priority: 'main', day: [16, 28], stage: 'senior',
      conditions: { flagsAny: ['早恋·阳光处理', '早恋·地下化'] },
      title: '高三，她的名字',
      art: { pose: '青年', expr: '笑', outfit: '高中校服', scene: '校园' },
      make(state) {
        const sunny = Boolean(state.flags['早恋·阳光处理']);
        return {
          text: sunny
            ? '那个初中递纸条的女生，高中还在同一所学校——只是不同班。\n高三了，他们的"朋友关系"维持了三年：一起晚自习、互相抽背单词、模考后互相报分数。\n班主任都找他们谈过话，得到的回答是："我们在互相监督学习。"——这话竟然没毛病。'
            : '你一直知道他书包侧袋那个钥匙扣是谁给的——只是从来没点破。\n高三了，那个女生在隔壁班。他们的"地下关系"维持三年，你从没收缴过任何东西——不是不知道，是决定不打这场仗。',
          choices: [
            {
              text: '约法三章：高考前，感情可以，底线要有',
              effects: { security: 3, marriage: 1 },
              result: '"可以来往，三条底线：成绩不掉、十点前回家、不许隐瞒。"\n他想了想，说："成交。"——高中三年最后一份合同，双方自愿，执行良好。',
            },
            {
              text: '强力拆散，"高考后再谈"',
              effects: { security: -4, setFlags: { '青春期·封闭': '被拆散的两个人，把联络转到了你找不到的地方' } },
              result: '你找过班主任、约谈过对方家长——雷霆手段，立竿见影，他"专心"了。\n只是高考完的当晚，他拖着行李箱出门，一夜未归。第二天回来，一句话："我们没断过。"\n你赢了这一学期，输了整个信任。',
            },
            {
              text: '装不知道，让他自己处理',
              effects: { security: 1, nursingSkill: 1 },
              result: '你既不鼓励也不打压，只保证饭桌永远有热饭。\n十八岁的感情该怎么处理——这是他的课题。你能给的最好支持，是让家像一个不需要戒备的地方。',
            },
          ],
        };
      },
    },

    // ---------- 婚姻危机与离婚落地 ----------
    {
      id: 'a_marriage_crisis', kind: 'anchor', priority: 'main', day: [8, 26], stage: 'senior',
      conditions: { familyLte: { marriage: 40 } },
      title: '那道裂缝，裂到了高三',
      art: { pose: '青年', expr: '委屈', outfit: '高中校服', scene: '家中·深夜' },
      text: '你们以为瞒得很好——争吵压在喉咙里，冷战藏在"没事"后面。\n但孩子什么都感觉得到。高三的某个深夜，他在门缝里塞出一张纸条："你们要离就趁早离，别等我考完。"\n那张纸条比任何一次争吵都响。',
      choices: [
        {
          text: '去做婚姻咨询——最后一次努力', cost: { money: 8000 },
          effects: { money: -8000, spendKind: 'other', marriage: 15, security: 3, setFlags: { '悬崖边拉回': '高三那年的八堂咨询课' } },
          result: '咨询师让你们各自说"我为什么留下来"。她的答案和你的一样：舍不得，也怕伤了他。\n八次咨询没让你们回到热恋——但让你们学会了在同一个屋檐下，好好吵架。',
        },
        {
          text: '认真长谈：为了孩子，先并肩到高考',
          effects: { marriage: 8, security: 2 },
          result: '那天晚上你们在他睡着后谈到三点。达成的不是和解，是停战协议：高考前，家里不见硝烟。\n停战有时是和平的开始——有时只是给了和平一个观察期。',
        },
        {
          text: '平静地去领了证（离婚证）',
          effects: { marriage: -20, security: -5, setFlags: { '婚姻·离异': '高三上学期，一纸协议' } },
          result: '手续办得异常平静，财产分割你们早就谈好了——最后争的是他归谁"监护"。\n他说："我谁都不跟，我住校。"\n高考那天你们都去了，隔着人群，没有说话。',
        },
      ],
    },

    // ---------- 高三冲刺 ----------
    {
      id: 'a_sprint', kind: 'anchor', priority: 'main', day: [24, 28], stage: 'senior',
      title: '高三，最后两百天',
      art: { pose: '青年', expr: '专注', outfit: '高中校服', scene: '教室·倒计时' },
      text: '教室后墙的倒计时牌翻到了"200"。黑板右上角写着一行小字："提高一分，干掉千人。"\n他每天六点十分出门，晚上十点半晚自习结束回家，再加一小时题。全家的作息以他为轴心旋转——连你刷手机都自觉静音。',
      choices: [
        {
          text: '一对一冲刺补课，最后的弹药', cost: { money: 30000 },
          conditions: { moneyGte: 30000 },
          effects: { money: -30000, spendKind: 'education', habit: 4 },
          result: '每周三次，一次两小时，600/课时。老师就讲一件事：把他会做的题，变成必对的题。\n最后一个月，他的模考成绩稳住了。你说不清这钱值不值——但它花在了你俩都不后悔的地方。',
        },
        {
          text: '不补了，保证睡眠和三餐',
          effects: { security: 3, mama: 3, habit: 1 },
          result: '十一点熄灯，六点半起床，八小时睡眠——高三的一股清流。\n班主任提醒"别人都在拼"，你说"他先得是个人，才是考生"。\n最后两百天，他的状态是全班最稳的。',
        },
      ],
    },

    // ---------- 高考 ----------
    {
      id: 'a_gaokao', kind: 'anchor', priority: 'main', day: [28, 30], stage: 'senior',
      title: '高考，三天',
      art: { pose: '青年', expr: '平静', outfit: '考试服', scene: '考场外' },
      make(state) {
        const divorced = Boolean(state.flags['婚姻·离异']);
        return {
          text: `六月七号，天很蓝。\n你把他送到考点门口——他想让你停在两百米外，你停在了三百米外，然后自己走了剩下那两百米。\n${divorced ? '他爸/他妈也来了。你们隔着人群没有说话，但都望着同一个门口。\n' : ''}三天，四场。每一场结束，人潮涌出来——你踮着脚找他，找到了，第一件事是看表情。\n（十八年前产房外、三年前中考外的那个你，此刻在同一个位置站完第三班岗。）`,
          choices: [
            {
              text: '"考完一门扔一门，回家吃饭。"',
              effects: { security: 3, mama: 3, marriage: 1 },
              result: '每场结束你只说这一句。第一场数学难哭了半个考点，他出来说"砸了"，你说"砸了也吃饭"。\n那顿饭他吃了两碗——晚上自己翻书对答案，对完说："其实没那么砸。"',
            },
            {
              text: '每场结束立刻对答案估分',
              effects: { security: -3, setFlags: { '成绩焦虑': '考场外最后一场仗' } },
              result: '数学那场，他边对边脸白。你说"没事没事"，但你的手也在抖。\n当晚他失眠了——第二天理综的发挥，没人说得清和这一晚有没有关系。',
            },
          ],
        };
      },
    },

    // ---------- 志愿之争（本作核心命题） ----------
    {
      id: 'a_volunteer', kind: 'anchor', priority: 'main', day: [30, 32], stage: 'senior',
      title: '志愿表上的两个名字',
      art: { pose: '青年', expr: '专注', outfit: '短袖', scene: '家中·餐桌' },
      make(state) {
        const score = G.reportScore(state, 8);
        const t = state.child.talent;
        const hisMajor = { art: '数字媒体艺术', verbal: '中文系（或新闻）', logic: '计算机', sport: '运动康复', empathy: '心理学（或学前教育）', handson: '机械设计（或电气自动化）' }[t];
        const yourMajor = { art: '会计——"画画能当饭吃吗"', verbal: '法学——"考公最容易"', logic: '计算机——"这个咱俩意见一致"', sport: '体育教育——"稳定"', empathy: '师范——"铁饭碗"', handson: '土木——"好找工作"' }[t];
        return {
          text: `分数出来了：${score} 分——比预估高四分，全家松了半口气。\n志愿表摊在餐桌上。第一栏，他填了【${hisMajor}】。\n你手里的笔悬在草稿纸上——你写的是【${yourMajor}】。\n${t === 'logic' ? '——罕见的一致。但你们还是为一志愿冲还是稳，谈到了十一点。' : '一张表，两种人生。十八岁的他第一次发现：原来爸妈的人生规划里，一直有一个"他的位置"。'}`,
          choices: [
            {
              text: `把笔递给他："你的名字，你自己签。"`,
              effects: { security: 5, marriage: 2, setFlags: { '为自己活': `第一志愿：${hisMajor}——他自己选的` } },
              result: `他接过笔，在第一志愿那格写下【${hisMajor}】，笔画很稳。\n你说："选了就走下去，别回头。"\n他点头。那一刻你看见的不是抓周时那个抓着玩具的婴儿，而是一个真的要出发的大人。`,
            },
            {
              text: `"听{parent}的，${yourMajor}。这是为你好。"`,
              effects: { security: -5, setFlags: { '为你活': `第一志愿被改成：${state.child.talent === 'logic' ? '金融（你觉得比计算机体面）' : yourMajor}` } },
              result: '他看着你把那一格涂掉重写，没有争。\n"行。"他说。就一个字。\n你如愿以偿——但在他收拾行李去大学的那天，你会想起这一个字，想起它有多轻，又有多重。',
            },
            {
              text: '各退一步：他的一志愿 + 你的"服从调剂"保险',
              effects: { security: 2, setFlags: { '为自己活': '志愿表上的停战协议' } },
              result: '第一志愿他的，最后一栏你的学校的保底。\n"你要是滑档了，就到{parent}给你留的那条路上来。"\n他说："用不上。"—但那晚他把保底那栏的代码，工工整整抄了三遍。',
            },
          ],
        };
      },
    },

    // ---------- 录取 ----------
    {
      id: 'a_admission', kind: 'anchor', priority: 'main', day: [33, 34], stage: 'senior',
      title: 'EMS，红色的信封',
      art: { pose: '青年', expr: '笑', outfit: '短袖', scene: '家门口' },
      make(state) {
        // 映射到真实高考满分750：内部20-98 → 200-735
        const raw = G.reportScore(state, 3);
        const gaokao = Math.round(raw * 7.5); // 真实高考分
        const L = G.CONFIG.GAOKAO_LINES;
        const forSelf = Boolean(state.flags['为自己活']);
        let uniFlag, uniText;
        if (gaokao >= L.c985) { uniFlag = '大学·985/211'; uniText = `${gaokao}分。985录取。信封上那枚校徽，你在新闻联播里见过。亲戚群里有人@你了。`; }
        else if (gaokao >= L.c211) { uniFlag = '大学·985/211'; uniText = `${gaokao}分。211录取。学校名字前面带着省份，说出来谁都知道是好学校。`; }
        else if (gaokao >= L.cBen1) { uniFlag = '大学·一本'; uniText = `${gaokao}分。过了一本线${gaokao - L.cBen1}分。一所不错的一本。校名念出来，亲戚们都会点头。`; }
        else if (gaokao >= L.cBen2) { uniFlag = '大学·二本'; uniText = `${gaokao}分。二本。快递员比你们先看到"录取"两个字。你说"挺好挺好"，语气里那点遗憾他自己也听见了。`; }
        else if (gaokao >= L.cBen3) { uniFlag = '大学·三本'; uniText = `${gaokao}分。民办三本。录取通知书的质感不输名校——学费也不输：一年三万，四年十二万。`; }
        else { uniFlag = '大学·大专'; uniText = `${gaokao}分。大专。三年制，学费不高，专业很实。你说"也挺好"，这次是真的也挺好。`; }
        return {
          text: `七月末的一个下午，EMS 的车停在楼下。\n红色的大信封。他拆开——${gaokao}分。\n${uniText}${forSelf ? '\n专业那一栏，印的是他自己填的那个名字。' : ''}`,
          choices: [
            {
              text: '当晚全家下馆子，请了双方老人',
              effects: { marriage: 3, face: 5, setFlags: { [uniFlag]: '红色信封里的第一段人生答案' }, log: { text: `录取通知书到家。饭桌上爷爷喝多了，举着杯子说："我们家，出大学生了。"`, hl: true } },
              result: '十八年了，这顿饭你等了很久。\n饭桌上老人说起他出生那天的天气、满月酒的样子、第一次叫人的月份——原来这些他们全都记得。\n他坐在中间，被各种版本的"他小时候"包围着，笑着笑着眼睛红了。',
            },
            {
              text: (uniFlag === '复读' ? '"行，再战一年。全家陪你。"' : '"学费和生活费，{parent}来。你只管去。"'),
              effects: { security: 3, setFlags: { [uniFlag]: '红色信封里的第一段人生答案' } },
              result: uniFlag === '复读'
                ? '高四的教室八月就开了门。他在台历上重新挂了倒计时——三百六十五页，一页一天。\n你说"全家陪你"，是真的：这一年你们连吵架都约在了他上学的时间。'
                : '学费打过去的那天，你多打了一个月生活费——备注栏写着："第一个月，宽裕点。"\n他回了个"收到"，过了两分钟又发来一句："谢谢{parent}。"\n你盯着那五个字看了很久。',
            },
          ],
        };
      },
    },

    // ---------- 送行（第一幕终章） ----------
    {
      id: 'a_departure', kind: 'anchor', priority: 'main', day: [34, 35], stage: 'senior',
      title: '站台',
      art: { pose: '青年', expr: '笑', outfit: '新衣', scene: '火车站' },
      make(state) {
        const lieFinal = state.flags['谎言升级'] ? '撒谎的孩子' : state.flags['诚实被温柔对待'] ? '什么都会跟你说的孩子' : '有自己的秘密的孩子';
        return {
          text: `八月末，行李箱的轮子碾过站台。\n你帮他扛着箱子，他嫌你走得慢——"{parent}，我自己来。"这句"我自己来"，他练习了十八年。\n检票口前，他停下，回头。\n（十八年了。从产房里那声啼哭，到站台上这一眼——中间隔着两万多个"晚上八点档"。他曾是你的全部世界，现在世界成为了他的。）\n他挥挥手，说："回去吧。"\n然后转身，走向检票口——没有再回头。\n${state.flags['祖辈的记忆'] ? '你注意到他的背包侧袋里，露出半枚旧棋子。' : ''}`,
          choices: [
            {
              text: '目送他走远，直到人潮吞没那个背影',
              effects: { marriage: 3, log: { text: '站台送行。他走进检票口没有回头——你也没让他看见你哭。回家的公交上，你给他发了一条很长的微信，又全部删掉，只发了两个字："到了说。"', hl: true } },
              result: `那个背影消失在闸机后面的第 ${state.flags['婚姻·离异'] ? '十八年，你们俩，隔着三米，各自抹了把脸' : '三分钟，你转身出了站'}。\n回家的路上，手机震了一下。是他："上车了。{parent}，回去吧。"\n（十八年前你目送他离开你的身体；十八年后你目送他走进他自己的人生。养育就是这样的两场目送。）\n（这十八年，他从一个${lieFinal}，长成了一个会回头挥手的人。）`,
            },
            {
              text: '憋住所有叮嘱，只说了一句"常回来"',
              effects: { security: 2, marriage: 1 },
              result: '你想说的太多了——天冷加衣、按时吃饭、别乱花钱、想家就回——最后只汇成三个字：常回来。\n他"嗯"了一声，拖箱进站。\n这三字是中国父母的摩斯密码，孩子要过很多年才破译：我想你。',
            },
          ],
        };
      },
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
            ? '社区复测，胆红素不降反升。医生问在家做了什么处理，听到"葡萄糖水和金银花"时，笔停了一下："马上住院。"\n他还多问了一句："足跟血筛查做过吗？孩子要是有蚕豆病，黄连、金银花这类东西碰都不能碰——会溶血的。"\n婆婆攥着缴费单，一路没敢说话。'
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

    // ============================================================
    // 第八章 · 大学（18 → 22 岁）——离巢
    // ============================================================

    {
      id: 'a_college_call', kind: 'anchor', priority: 'main', day: [0, 1], stage: 'college',
      title: '第一个电话',
      art: { pose: '青年', expr: '笑', outfit: '新衣', scene: '宿舍' },
      text: '晚上九点，手机响了。是他的号码。\n你接起来的速度比自己预想的快了三秒——然后你听见了宿舍的嘈杂声、室友的笑骂声。\n通话时长：47 秒。他挂了以后你才想起来，有十个问题没问。',
      choices: [
        {
          text: '"到了就好。缺什么跟我说。"',
          effects: { security: 1, marriage: 1 },
          result: '"知道了。"又是这两个字——十八年了，字典没换过。\n但这次你听着，心里是踏实的。',
        },
        {
          text: '"室友怎么样？食堂吃了吗？被子够不够？"',
          effects: { security: 2, face: -1 },
          result: '"{parent}——我都安排好了。"他的语气里有一丝不耐烦，但你听出来了：那是"我已经行了的"不耐烦。\n你"哦"了一声，挂了电话，把那十个问题咽回去。',
        },
      ],
    },

    {
      id: 'a_allowance', kind: 'anchor', priority: 'main', day: [1, 3], stage: 'college',
      title: '生活费，给多少',
      art: { pose: '青年', expr: '平静', outfit: '新衣', scene: '银行App' },
      text: '新生群里的家长在讨论生活费：有说 1500 的、2000 的、3000 的。\n你算了一笔账：食堂饭钱、日用、话费、社交……不算不知道，一算发现"供一个大学生"这五个字，每个月都在扣款。',
      choices: [
        {
          text: '给宽裕些，别让孩子在同学面前抬不起头',
          effects: { security: 2, setFlags: { '生活费·宽裕': '每月按时到账，从不问怎么花' } },
          result: '每月一号准时打款，从不问开销。他也没乱花——但你不知道这件事。\n你只知道，他从来没有因为"没钱"给你打过电话。',
        },
        {
          text: '给得刚好，让他学会规划',
          effects: { security: 1, habit: 2 },
          result: '生活费按月打，月初一个数。第一个月他月底吃了一周泡面——第二个月开始记账。\n"饿"是最好的理财课，虽然这话你只敢在心里说。',
        },
        {
          text: '给得紧一些，鼓励他做兼职',
          effects: { setFlags: { '生活费·紧张': '他学会了比价、拼单、领优惠券' } },
          result: '他确实做了兼职——家教、发传单、图书馆助理。\n但你也发现了：他开始有些事不跟你说了。不是不爱你，是怕你担心钱。',
        },
      ],
    },

    {
      id: 'a_first_home', kind: 'anchor', priority: 'main', day: [2, 4], stage: 'college',
      title: '第一个寒假',
      art: { pose: '青年', expr: '笑', outfit: '外套', scene: '家门口' },
      text: '行李箱的轮子碾过家门口的地砖——四个月前你听到过一模一样的声音，方向相反。\n他推门进来。头发长了，说话节奏慢了，连换鞋的姿势都带着"我住过宿舍"的从容。\n四个月。他有了你不知道的日常。',
      choices: [
        {
          text: '"回来就好。想吃什么？"',
          effects: { security: 3, mama: 3, marriage: 1 },
          result: '"随便。"他一边说一边打开冰箱——这个动作和以前一样。\n那天你做了六个菜，他吃了三碗饭。\n走的时候你说"下次回来提前说"，他说"好"。',
        },
        {
          text: '"在学校怎么样？学习跟得上吗？"',
          effects: { security: -1, setFlags: { '成绩焦虑': '大学了还在问成绩' } },
          result: '"挺好的。"他说，语气里有一堵你翻不过去的墙。\n你意识到：大学以后，"学习"这个话题在你们的饭桌上翻篇了。而新的话题，你们还没找到。',
        },
      ],
    },

    {
      id: 'a_bring_home', kind: 'anchor', priority: 'main', day: [8, 12], stage: 'college',
      title: '"我带个人回来"',
      art: { pose: '青年', expr: '笑', outfit: '正式', scene: '家门口' },
      make(state) {
        const boy = state.child.gender === 'boy';
        // 15% 的大学恋情走不到最后——这是不婚线/分手线的入口种子
        if (util.chance(0.85)) {
          state.flags['恋爱走到最后'] = { day: state.day, source: '大学恋情走到了谈婚论嫁' };
        }
        return {
          text: `微信消息只有五个字："我带个人回来。"\n你盯着这条消息看了两分钟，然后开始打扫卫生。\n门开了。${boy ? '他身后' : '她身后'}站着那个${boy ? '女孩' : '男生'}——比照片好看（他/她发过合照，你存下来了但假装没存）。`,
          choices: [
            {
              text: '"快进来，外面冷。吃饭了吗？"',
              effects: { security: 3, marriage: 2, setFlags: { '带回家的TA': '第一印象：懂礼貌，眼里有活' } },
              result: `那个${boy ? '女孩' : '男生'}很懂事，进门换鞋、叫人、帮你端菜。\n送走之后，${boy ? '他' : '她'}问："怎么样？"\n你说："挺好的。"然后补了一句："你喜不喜欢，比我们喜不喜欢重要。"`,
            },
            {
              text: '饭桌上做"背景调查"',
              effects: { security: -2, face: -1, setFlags: { '带回家的TA': '条件还行，但你总觉得差了点什么' } },
              result: `饭桌变成了面试。你问了家哪的、父母做什么的。\n${boy ? '他在桌子底下踢了你好几次。' : '她在桌子底下踢了你好几次。'}\n送走之后冷战了两天。第三天${boy ? '他' : '她'}说："你能不能先问问我过得开不开心？"`,
            },
            {
              text: '"才大三，别着急。学业为重。"',
              effects: { security: -1, setFlags: { '带回家的TA': '被"学业为重"挡了一下的缘分' } },
              result: `他/她"哦"了一声。\n后来那个${boy ? '女孩' : '男生'}还是来过——但次数在变少。\n你不确定是因为你说的话还是别的。有些影响，你永远确认不了。`,
            },
          ],
        };
      },
    },

    {
      id: 'a_grad_decision', kind: 'anchor', priority: 'main', day: [12, 14], stage: 'college',
      title: '十字路口',
      art: { pose: '青年', expr: '平静', outfit: '新衣', scene: '视频通话' },
      make(state) {
        const forSelf = Boolean(state.flags['为自己活']);
        return {
          text: `视频通话里，他/她说到了毕业去向——大三了，身边的人开始分流：考研的、找工作的、出国的、考公的。\n"我想${forSelf ? '继续读研，这个方向想走深一点' : '先工作吧，早点独立'}。"\n你听着，想起四年前那张志愿表——${forSelf ? '他自己填的那个专业，他要走深了' : '你替他改的那个专业，他选了尽快离开'}。`,
          choices: [
            {
              text: '"你决定就好。需要什么支持跟我说。"',
              effects: { security: 3, marriage: 2 },
              result: '"嗯。"他/她笑了一下——隔着屏幕你也看见了。\n四年前的志愿表你递过笔；四年后的这个路口，你没递。因为他/她已经学会了自己走。',
            },
            {
              text: '"还是听妈/爸的吧——我们经验多。"',
              effects: { security: -2 },
              result: '电话那头沉默了三秒。\n"我知道了。"他说——和四年前填志愿时那个"行"一样轻。\n你又一次替他做了决定。但这一次你不确定他会不会听。',
            },
          ],
        };
      },
    },

    // ---------- 大学意外怀孕（性别分支：女儿怀孕/儿子让女友怀孕） ----------
    {
      id: 'a_unplanned_pregnancy', kind: 'anchor', priority: 'main', day: [5, 9], stage: 'college',
      title: '深夜电话',
      art: { pose: '青年', expr: '委屈', outfit: '新衣', scene: '宿舍' },
      make(state) {
        const isGirl = state.child.gender === 'girl';
        const isMama = state.perspective === 'mama';
        if (isGirl) {
          return {
            text: isMama
            ? '\u51cc\u6668\u4e00\u70b9\u3002\u7535\u8bdd\u54cd\u4e86\u3002\u5c4f\u5e55\u4eae\u7740\u5979\u7684\u540d\u5b57\u3002\n\u63a5\u8d77\u6765\uff0c\u5148\u542c\u5230\u7684\u4e0d\u662f\u8bdd\u2014\u2014\u662f\u54ed\u3002\n"\u5988\u3002\u3002\u3002\u6211\u6000\u5b55\u4e86\u3002\u3002\u3002"\n\u90a3\u4e09\u4e2a\u5b57\u4e4b\u540e\uff0c\u4f60\u7684\u5927\u8111\u7a7a\u4e86\u4e00\u79d2\u3002\u7136\u540e\u4f60\u542c\u89c1\u81ea\u5df1\u7684\u58f0\u97f3\u8bf4\uff1a"\u522b\u54ed\u3002\u5148\u522b\u54ed\u3002\u544a\u8bc9\u5988\u600e\u4e48\u4e86\u3002"'
            : '\u51cc\u6668\u4e00\u70b9\u3002\u59bb\u5b50\u628a\u4f60\u63a8\u9192\u2014\u2014\u5979\u7684\u624b\u5728\u6296\u3002\n"\u5973\u513f\u6253\u7535\u8bdd\u4e86\u3002\u5979\u3002\u3002\u3002\u6000\u5b55\u4e86\u3002\u3002\u3002"\n\u4f60\u5750\u8d77\u6765\uff0c\u624b\u5728\u5e8a\u8fb9\u6478\u4e86\u4e24\u4e0b\u624d\u6478\u5230\u624b\u673a\u3002\u56de\u62e8\u8fc7\u53bb\uff0c\u5148\u542c\u5230\u7684\u4e0d\u662f\u8bdd\u2014\u2014\u662f\u5979\u7684\u54ed\u3002\u4f60\u53ea\u8bf4\u4e86\u4e00\u53e5\uff1a"\u522b\u6015\u3002\u7238\u5728\u3002"',
            choices: [
              {
                text: '"\u5148\u56de\u5bb6\u3002\u5176\u4ed6\u7684\u4e8b\u56de\u5bb6\u518d\u8bf4\u3002"',
                cost: { energy: 2 },
                effects: { energy: -2, security: 5, mama: 5, marriage: 2 },
                result: '\u4f60\u8ba2\u4e86\u6700\u65e9\u7684\u9ad8\u94c1\u3002\u5979\u5728\u51fa\u7ad9\u53e3\u770b\u89c1\u4f60\u4eec\u7684\u65f6\u5019\uff0c\u54ed\u5f97\u50cf\u4e2a\u8d70\u4e22\u7684\u5c0f\u5b69\u3002\n\u90a3\u4e2a\u5468\u672b\u4f60\u4eec\u6ca1\u8c08"\u600e\u4e48\u529e"\uff0c\u53ea\u662f\u716e\u4e86\u5979\u7231\u5403\u7684\u3001\u966a\u5979\u770b\u4e86\u4e24\u90e8\u7535\u5f71\u3002\n\u5468\u4e00\u5979\u81ea\u5df1\u8bf4\uff1a"\u5988\uff0c\u6211\u60f3\u597d\u4e86\u3002\u6211\u60f3\u5148\u4e0d\u8981\u3002"\n\u4f60\u8bf4\uff1a"\u597d\u3002\u4e0b\u6b21\u4e0d\u7ba1\u4ec0\u4e48\u4e8b\uff0c\u5148\u6253\u7535\u8bdd\u3002"',
              },
              {
                text: '"\u5148\u544a\u8bc9\u90a3\u4e2a\u7537\u751f\u3002\u8fd9\u4e0d\u662f\u4f60\u4e00\u4e2a\u4eba\u7684\u4e8b\u3002"',
                effects: { security: 2, inLaw: -2 },
                result: '\u90a3\u4e2a\u7537\u751f\u63a5\u4e86\u7535\u8bdd\uff0c\u58f0\u97f3\u5f88\u5e74\u8f7b\u3001\u5f88\u602f\u3002\u4f60\u8bf4\uff1a"\u4f60\u4eec\u4e24\u4e2a\u4eba\u5546\u91cf\u3002\u5546\u91cf\u5b8c\u4e86\u544a\u8bc9\u6211\u3002"\n\u540e\u6765\u4ed6\u4eec\u5546\u91cf\u7684\u7ed3\u679c\u662f\uff1a\u5206\u624b\uff0c\u624b\u672f\u8d39\u4ed6\u51fa\u4e86\u4e00\u534a\u3002\u53e6\u4e00\u534a\uff0c\u4f60\u5077\u5077\u6253\u7ed9\u4e86\u5973\u513f\u3002',
              },
              {
                text: '"\u600e\u4e48\u8fd9\u4e48\u4e0d\u81ea\u7231\uff01\u8ba9\u6211\u4eec\u600e\u4e48\u89c1\u4eba\uff01"',
                effects: { security: -5, mama: -5, setFlags: { '\u9752\u6625\u671f\u00b7\u5c01\u95ed': '\u6700\u9700\u8981\u4f60\u7684\u65f6\u5019\u4f60\u5728\u9a82\u5979' } },
                result: '\u5979\u4e0d\u54ed\u4e86\u3002\u6302\u4e86\u7535\u8bdd\u3002\n\u540e\u6765\u5979\u81ea\u5df1\u53bb\u4e86\u533b\u9662\uff0c\u81ea\u5df1\u7b7e\u7684\u5b57\uff0c\u81ea\u5df1\u56de\u7684\u5b66\u6821\u3002\n\u90a3\u4e2a\u5bd2\u5047\u5979\u6ca1\u56de\u5bb6\u3002\u4f60\u4eec\u4e5f\u6ca1\u63d0\u3002\u4f46\u4f60\u77e5\u9053\u2014\u2014\u6709\u4e9b\u4e8b\uff0c\u4e00\u53e5\u8bdd\u5c31\u53d8\u4e86\u3002',
              },
            ],
          };
        }
        // 儿子让女友怀孕
        return {
          text: '\u4ed6\u6253\u7535\u8bdd\u6765\u7684\u65f6\u5019\uff0c\u58f0\u97f3\u4f60\u4ece\u6ca1\u542c\u8fc7\u2014\u2014\u53c8\u5e74\u8f7b\u53c8\u6c89\u3002\n"\u7238\uff0c\u5988\u3002\u3002\u3002\u5c0f\u96e8\u5979\u3002\u3002\u3002\u6000\u5b55\u4e86\u3002\u3002\u3002"\n\u5c0f\u96e8\u662f\u4ed6\u5973\u53cb\u3002\u4f60\u89c1\u8fc7\u4e24\u6b21\uff0c\u4e0d\u9ad8\u3001\u8bdd\u4e0d\u591a\u3001\u7b11\u8d77\u6765\u5f88\u5e72\u51c0\u3002\n\u4f60\u628a\u7535\u8bdd\u5f00\u4e86\u514d\u63d0\u3002\u4f60\u8bf4\uff1a"\u5148\u522b\u6025\u3002\u544a\u8bc9\u6211\u4ed6\u4eec\u5bb6\u600e\u4e48\u8bf4\u7684\u3002"',
          choices: [
            {
              text: '"\u4f60\u53bb\u89c1\u5979\u7238\u5988\u3002\u8e72\u597d\u4e86\u518d\u56de\u6765\u3002"',
              cost: { energy: 2 },
              effects: { energy: -2, security: 3, marriage: 2, face: 2 },
              result: '\u4ed6\u53bb\u4e86\u3002\u5bf9\u65b9\u7236\u6bcd\u6ca1\u6253\u4ed6\uff0c\u4f46\u8ba9\u4ed6\u5728\u5ba2\u5385\u5750\u4e86\u4e00\u4e0a\u5348\u3002\n\u4e24\u5bb6\u4eba\u6700\u540e\u5546\u91cf\uff1a\u5148\u4e0d\u7ed3\u5a5a\uff0c\u5148\u628a\u4e66\u8bfb\u5b8c\u3002\u533b\u836f\u8d39\u4e24\u5bb6\u5206\u3002\n\u4ed6\u56de\u6765\u7684\u65f6\u5019\u4f60\u770b\u89c1\u4ed6\u7684\u80cc\u9a7b\u76f4\u4e86\u4e00\u4e9b\u2014\u2014\u6709\u4e9b\u6210\u957f\uff0c\u662f\u88ab\u903c\u51fa\u6765\u7684\u3002',
            },
            {
              text: '"\u80fd\u4e0d\u80fd\u5148\u4e0d\u8981\uff1f\u4f60\u4eec\u8fd8\u5c0f\u3002"',
              effects: { security: -1, marriage: -2 },
              result: '\u7535\u8bdd\u90a3\u5934\u6c89\u9ed8\u4e86\u5f88\u4e45\u3002\n"\u5988\uff0c\u8fd9\u4e2a\u4e8b\u2026\u2026\u4e0d\u662f\u6211\u4e00\u4e2a\u4eba\u8bf4\u4e86\u7b97\u7684\u3002"\n\u4f60\u610f\u8bc6\u5230\u81ea\u5df1\u521a\u521a\u8bf4\u4e86\u4e00\u53e5\u4e0d\u8be5\u8bf4\u7684\u8bdd\u3002\u8fd9\u4ef6\u4e8b\u91cc\u6700\u4e0d\u8be5\u53d1\u8a00\u7684\u4eba\u662f\u4f60\u3002',
            },
            {
              text: '"\u9700\u8981\u591a\u5c11\u94b1\uff1f\u6211\u6253\u7ed9\u4f60\u3002\u5176\u4ed6\u7684\u4f60\u4eec\u81ea\u5df1\u5546\u91cf\u3002"',
              effects: { money: -5000, spendKind: 'medical', security: 2 },
              result: '\u4f60\u628a\u94b1\u6253\u8fc7\u53bb\u4e86\u3002\u6ca1\u591a\u95ee\uff0c\u6ca1\u5c11\u8bf4\u3002\n\u540e\u6765\u4ed6\u544a\u8bc9\u4f60\uff1a\u5c0f\u96e8\u9009\u62e9\u4e86\u624b\u672f\u3002\u4ed6\u966a\u5979\u53bb\u7684\u3002\n\u90a3\u5929\u4ed6\u5728\u533b\u9662\u8d70\u5eca\u91cc\u7ad9\u4e86\u4e09\u4e2a\u5c0f\u65f6\u3002\u2014\u2014\u8fd9\u4e09\u4e2a\u5c0f\u65f6\uff0c\u4ed6\u4e00\u4e0b\u5b50\u61c2\u4e86\u5f88\u591a\u4e8b\u3002',
            },
          ],
        };
      },
    },

    // ---------- 大学退学（挂科/游戏/迷茫） ----------
    {
      id: 'a_college_dropout', kind: 'anchor', priority: 'main', day: [5, 8], stage: 'college',
      conditions: { notFlags: ['大学·985/211'] },
      title: '辅导员的电话',
      art: { pose: '青年', expr: '委屈', outfit: '新衣', scene: '宿舍' },
      make(state) {
        const reason = util.pick([
          '挂了三门——不是不会，是上课的时候人在教室，魂在游戏里。',
          '挂了两门。他说"大学比高三轻松多了"，然后就真的轻松了。',
          '不适应。室友通宵开黑，他跟了两个月，绩点掉到了1.4。',
        ]);
        return {
          text: `辅导员打电话来了。\n"${reason}"\n学校给了两个选择：留级重修，或者退学。`,
          choices: [
            {
              text: '"留级！砸锅卖铁也要读完！"',
              effects: { money: -15000, spendKind: 'education', energy: -2, security: 2, habit: 3 },
              result: '留级一年，重修所有挂掉的课。他搬出了原来的宿舍，换了批室友。\n一年后他过了所有科目——虽然毕业证比同龄人晚了一年。',
            },
            {
              text: '"退学吧。回家再说。"',
              effects: { security: -3, setFlags: { '退学': '大学退学' } },
              result: '他/她拖着行李箱回了家。那年春节亲戚问"孩子上大学了吧"，你们说"嗯"——然后迅速转移了话题。\n退学不是终点。但你们花了很长时间才接受这句话。',
            },
            {
              text: '让他自己决定',
              effects: { security: 1 },
              result: '电话里他/她说："我想休学一年，不是退学。我想清楚自己要什么。"\n你同意了。一年后他/她回来了——虽然还是不知道要什么，但至少知道不要什么了。',
            },
          ],
        };
      },
    },

    // ---------- 硕士/博士深造 ----------
    {
      id: 'a_grad_school', kind: 'anchor', priority: 'main', day: [13, 14], stage: 'college',
      conditions: { notFlags: ['退学'] },
      title: '"我想继续读"',
      art: { pose: '青年', expr: '专注', outfit: '新衣', scene: '图书馆' },
      make(state) {
        const elite = Boolean(state.flags['大学·985/211']);
        const goGrad = elite ? 0.55 : 0.30;
        if (util.chance(goGrad)) {
          return {
            text: '大四上学期，他/她说："我想考研究生。"\n不是找不到工作——是想在这个方向再走深一点。\n图书馆的灯他/她坐了三年，现在想再坐两三年。',
            choices: [
              {
                text: '"考！家里全力支持。"',
                effects: { money: -8000, spendKind: 'education', security: 3, habit: 3 },
                result: '备考八个月，初试过线，复试通过。\n研究生录取通知书比本科那张薄——但分量不一样。本科是"考上了"，研究生是"选择了"。',
              },
              {
                text: '"早点工作吧，学历够用了。"',
                effects: { security: -1 },
                result: '他/她"嗯"了一声。找了份工作，干得还行。\n工作两年后他/她还是考了在职研究生——用自己挣的钱。',
              },
            ],
          };
        }
        return {
          text: '大四上学期，身边的人都在做选择：考研的、找工作的、考公的、出国的。\n他/她说："我想直接工作。读了十六年了，够了。"',
          choices: [
            {
              text: '"好。翅膀硬了。"',
              effects: { security: 2, marriage: 1 },
              result: '他/她笑了一下——不是敷衍的笑，是"你终于懂了"的笑。\n从小学到大学，十六年。你陪了十六年。接下来，该他自己走了。',
            },
          ],
        };
      },
    },

    {
      id: 'a_college_grad', kind: 'anchor', priority: 'main', day: [15, 15], stage: 'college',
      title: '学位服',
      art: { pose: '青年', expr: '笑', outfit: '学位服', scene: '大学礼堂' },
      text: '他/她穿着学位服从礼堂出来，手里举着毕业证书。\n你举起手机拍照——取景框里那个穿着黑色长袍、戴着帽子的年轻人，和二十二年前产房里那个皱巴巴的小人，很难重叠。\n但确实是他/她。确实是你们，一路走到了这里。',
      choices: [
        {
          text: '全家在校门口拍一张全家福',
          effects: { marriage: 3, face: 3, log: { text: '大学毕业典礼。学位服、学位帽、拨穗的瞬间——从产房到礼堂，这条路你们走了二十二年。', hl: true } },
          result: '这张照片后来被你设成了手机壁纸——和满月那张、幼儿园毕业那张排在一起。\n三部曲，完了。',
        },
        { text: '"下一步怎么打算？"', effects: { security: 1 }, result: '"先找份工作，自己的路自己走。"\n这句话你听过——好像是你以前说过的。' },
      ],
    },

    // ============================================================
    // 第九章 · 成家立业（22 → 28 岁）——轮回
    // ============================================================

    {
      id: 'a_first_job', kind: 'anchor', priority: 'main', day: [0, 2], stage: 'adult',
      title: '第一份工作',
      art: { pose: '青年', expr: '平静', outfit: '正装', scene: '写字楼' },
      text: '他/她发了条朋友圈：配图是一张工牌，定位是一栋你没去过的写字楼。文字只有两个字："入职。"\n你点了个赞——想了想又取消，改成了评论："加油。"\n这个距离刚好：你看见了，但不打扰。',
      choices: [
        {
          text: '"缺钱吗？家里随时支援。"',
          effects: { security: 1 },
          result: '"不用！"回得很快。然后隔了两分钟又来一条："……真不用。"\n你把刚打开的转账界面关了。相信他能行，也是一种支持。',
        },
        {
          text: '"好好干。别怕吃苦。"',
          effects: { marriage: 1 },
          result: '"知道了。"\n这两个字你听了一辈子——从第一声叫妈/爸到现在的微信回复，字典从来没换过页。',
        },
      ],
    },

    // ---------- 不婚宣言 ----------
    {
      id: 'a_no_marriage', kind: 'anchor', priority: 'main', day: [4, 7], stage: 'adult',
      conditions: { notFlags: ['恋爱走到最后'] },
      title: '"我不打算结婚"',
      art: { pose: '青年', expr: '平静', outfit: '正装', scene: '家中' },
      text: '某个普通的饭桌。他/她忽然说："{parent}，我跟你们说个事。"\n"我不打算结婚。不是没遇到合适的——是我想清楚了，一个人过挺好的。"\n你手里的筷子停了三秒。你想到的不是"传宗接代"那些大词，而是：以后过年，饭桌上就少了一个人。',
      choices: [
        {
          text: '"你想清楚了就好。你的人生你做主。"',
          effects: { security: 5, marriage: 2, setFlags: { '不婚主义': '被尊重的选择' } },
          result: '他/她看着你，眼眶红了一下——她/他做好了吵架的准备，没想到等来的是这句话。\n"谢谢。"轻到几乎听不见。\n后来他/她一个人旅行、养猫、升职、换了三座城市。每次视频通话，你都看见一种平静——不是没有孤独，是和孤独达成了协议。',
        },
        {
          text: '"你才多大就说了这种话？以后会遇到对的人的。"',
          effects: { security: -3, setFlags: { '不婚主义': '被催婚的坚持——TA会证明给你看' } },
          result: '他/她笑了笑，没争。\n但你发现，从那以后，有些话他/她不再跟你说了——不是在赌气，是在避免一个永远不会有结论的讨论。\n你依然爱他/她。只是你们之间的频道，关了一个。',
        },
      ],
    },

    // ---------- 就业现实：学历≠饭碗 ----------
    {
      id: 'a_job_reality', kind: 'anchor', priority: 'main', day: [2, 5], stage: 'adult',
      title: '投了两百份简历之后',
      art: { pose: '青年', expr: '平静', outfit: '正装', scene: '出租屋' },
      make(state) {
        const elite = Boolean(state.flags['大学·985/211']);
        const vocational = Boolean(state.flags['大学·大专'] || state.flags['大学·三本']);
        if (elite && util.chance(0.35)) {
          return {
            text: '他/她投了两百份简历，收到的面试邀请不到十个。\n"985硕士，秋招全军覆没。"朋友圈里这样的帖子越来越多。\n他/她开始怀疑：那张录取通知书，到底是入场券还是长衫？',
            choices: [
              {
                text: '"先找个差不多的干着，骑驴找马。"',
                effects: { security: 1, setFlags: { '就业·学历倒挂': '985毕业，先做了月薪六千的运营' } },
                result: '他/她找到了一份和专业无关的工作——月薪六千，双休，五险一金。同事都是二本三本，没人问他是哪个学校的。\n半年后他/她说："其实也没那么差。"\n孔乙己的长衫，有时候是自己脱下来的。',
              },
              {
                text: '"再等等，总会有的。你的学历不会白读。"',
                effects: { energy: -1, setFlags: { '就业·学历倒挂': '海投第200天，还在等' } },
                result: '又投了三个月。房租在扣，存款在减，面试一轮比一轮远。\n你开始后悔当年说过"考上好大学就什么都好了"——那句话你自己也不信，但你说的时候，他/她信了。',
              },
            ],
          };
        }
        if (vocational && util.chance(0.55)) {
          return {
            text: '他/她没走投简历的独木桥——大专学的机电维修，校企合作直接进了厂。\n你原以为"只读了大专"是你最遗憾的事。直到第一个月工资到账：一万四。\n比你当年工作五年的月薪还高。',
            choices: [
              {
                text: '"好好干。手艺是自己的。"',
                effects: { security: 3, setFlags: { '就业·蓝领逆袭': '机电维修，月薪一万四起' } },
                result: '越干越顺手，第二年考了焊工证，工资又涨了。\n你偶尔想起当年为了中考分数发愁的那些夜晚——现在你只想笑。\n有些孩子不是不会读书，是不该只读书。',
              },
              {
                text: '"工作虽好，还是应该升个学历。"',
                effects: { security: -1 },
                result: '他/她报了专升本，白天上班晚上刷题。\n你说的没错——学历确实有用。但他/她也知道：你说的"应该"，和当年那个"考上就好了"一样，是同一个句式。',
              },
            ],
          };
        }
        return { choices: [{ text: '日子照常过', effects: {}, result: '工作找到了，不好不坏——像大多数人一样。' }] };
      },
    },

    {
      id: 'a_partner_visit', kind: 'anchor', priority: 'main', day: [6, 10], stage: 'adult',
      conditions: { notFlags: ['不婚主义'] },
      title: '"我们想跟你们说件事"',
      art: { pose: '青年', expr: '笑', outfit: '正装', scene: '家中' },
      make(state) {
        const boy = state.child.gender === 'boy';
        return {
          text: `他们一起回来的。饭桌上，${boy ? '他' : '她'}忽然放下筷子说："{parent}，我们想定下来了。"\n你看看那个${boy ? '女孩' : '男生'}——见过三次了，每次都带东西，每次都${boy ? '帮你洗碗' : '帮你搬东西'}。`,
          choices: [
            {
              text: '"好。你们自己过得好就行。"',
              effects: { security: 3, marriage: 3, setFlags: { '带回家的TA': '你们点了头' } },
              result: `那个${boy ? '女孩' : '男生'}的眼眶红了一下。\n这一刻你知道：从今以后，饭桌上要多一副碗筷了。`,
            },
            {
              text: '"条件……我们想再了解一下。"',
              effects: { security: -2, setFlags: { '带回家的TA': '你的犹豫他们都看见了' } },
              result: `你问了房、问了工作、问了家庭。都是该问的——但问完之后桌上安静了很久。\n后来${boy ? '他' : '她'}说："{parent}，我不是在买东西。我在选一个人。"\n这句话你想了很久。你年轻的时候，也这么选过。`,
            },
          ],
        };
      },
    },

    {
      id: 'a_bride_price', kind: 'anchor', priority: 'main', day: [10, 13], stage: 'adult',
      conditions: { notFlags: ['不婚主义'] },
      title: '彩礼',
      art: { pose: '青年', expr: '平静', outfit: '正装', scene: '餐厅' },
      make(state) {
        const boy = state.child.gender === 'boy';
        return {
          text: `两家人坐在一起——话题只有一个：${boy ? '彩礼' : '嫁妆'}。\n${boy ? '对面女方家长开口了一个数字。那个数字在你脑子里转了三圈。' : '你家准备了陪嫁。对方问"你们打算出多少"。这个问题像个天平——你怕放太轻，也怕放太重。'}`,
          choices: [
            {
              text: '答应了——往后是一家人',
              effects: { money: -150000, spendKind: 'party', face: 3, setFlags: { '彩礼·谈判成功': '两家都让了步' } },
              result: '你们给了诚意，对方回了一句"孩子跟了你们，我们放心"。\n散场时两位妈妈在停车场聊了半小时——你远远看着，忽然想：她们是不是也在聊自己二十年前的事？',
            },
            {
              text: '"能不能再商量商量？"',
              effects: { marriage: -2, setFlags: { '彩礼·谈崩': '两家人第一次合作以委屈告终' } },
              result: '数字砍下来了一些，但两家人心里都留了一根刺。\n他/她后来跟你说："{parent}，彩礼是给外人看的。日子是我们俩过的。"',
            },
            {
              text: '"我们能力有限，但全力支持。"',
              effects: { money: -50000, spendKind: 'party', marriage: 2, setFlags: { '彩礼·谈判成功': '坦诚换来的体面' } },
              result: '你把家底摊开说了。对面沉默了一会："行。"\n后来那位家长跟你喝了一杯："我们那会儿也难。都一样的。"',
            },
          ],
        };
      },
    },

    {
      id: 'a_house', kind: 'anchor', priority: 'main', day: [12, 14], stage: 'adult',
      conditions: { notFlags: ['不婚主义'] },
      title: '首付',
      art: { pose: '青年', expr: '平静', outfit: '正装', scene: '银行' },
      text: '首付缺口：四十万。\n你的存款加上养老钱——够。但付完之后，你们的退休计划要重写。',
      choices: [
        {
          text: '出。养老的事以后再说。',
          conditions: { moneyGte: 400000 },
          effects: { money: -400000, spendKind: 'other', security: 3, face: 3, setFlags: { '买房·掏空养老': '存款清零，退休计划改写' } },
          result: '转账确认的那声"叮"，比你想象的响。\n他/她发来一条很长的微信，最后一句："等我有钱了加倍还你们。"\n你回了两个字："不用。"',
        },
        {
          text: '"能帮的就这些，月供你们自己扛。"',
          effects: { money: -100000, spendKind: 'other', setFlags: { '买房·量力而行': '付了十万，留了底线' } },
          result: '十万块转过去，你补了一句："年轻人有压力，不是坏事。"\n他/她"嗯"了一声——里面有失望，也有"终于不用靠他们了"的释然。',
        },
        {
          text: '"家里实在拿不出。你们先租着。"',
          effects: { security: -2, setFlags: { '买房·量力而行': '没帮上忙——但也不想拖垮自己' } },
          result: '"知道了。"声音很平静。\n视频里你看见他们的出租屋——收拾得很干净，阳台上有两盆绿萝。\n你说"挺好的"。心里不知道是什么滋味。',
        },
      ],
    },

    {
      id: 'a_wedding', kind: 'anchor', priority: 'main', day: [14, 15], stage: 'adult',
      conditions: { notFlags: ['不婚主义'] },
      title: '婚礼',
      art: { pose: '青年', expr: '笑', outfit: '礼服', scene: '婚礼现场' },
      make(state) {
        const boy = state.child.gender === 'boy';
        return {
          text: boy
            ? '他穿着西装站在台上——是你买的那件。他牵着那个女孩的手，朝你这边看了一眼——你认得那个眼神：他小时候第一次自己走路上学也是这样，紧张，但准备好了。'
            : '她穿着婚纱站在台上——是你陪她挑的那件。她的手放在你的手心里。从小到大你牵过无数次，但今天，是最后一次以"爸爸"的名义牵着走。走完这一段，她就交出去了。',
          choices: [
            {
              text: '走上台，"我把孩子交给你们了"',
              effects: { marriage: 3, security: 3, setFlags: { '婚礼·圆满': '台上台下都笑着' }, log: { text: '婚礼。他/她朝你看的那一眼——你等了二十七年，就是为了让TA能够这样看你、然后去过自己的人生。', hl: true } },
              result: boy ? '你把他的手交给了那个女孩。两个年轻人朝你鞠了一躬。\n你下台时，妻子/丈夫握了握你的手。二十七年，不需要再说了。' : '你牵着她的手走了红毯，把她交给了那个男生。\n他接过你女儿的手，朝你深深鞠了一躬。',
            },
            {
              text: '坐在台下，让他们自己走完',
              effects: { security: 2, marriage: 1 },
              result: '你没上台。他/她也没叫你——"妈/爸，我们自己来。"\n你坐在第一排看着他们念誓词、交换戒指。\n台上的灯光很亮。你的眼眶也很亮。',
            },
          ],
        };
      },
    },

    {
      id: 'a_grandchild', kind: 'anchor', priority: 'main', day: [15, 15], stage: 'adult',
      conditions: { notFlags: ['不婚主义'] },
      title: '又一个电话',
      art: { pose: '青年', expr: '笑', outfit: '新衣', scene: '医院' },
      text: '电话响起时你在做饭。\n"妈/爸——"声音有点抖，"生了。六斤八两。"\n你的手还握着锅铲，锅里的菜还在响。但你什么都听不见了——只听见电话那头传来一个婴儿的哭声。\n\n你做外婆/奶奶了。或者，你做爷爷/外公了。\n\n你放下锅铲，关了火，拿起外套。妻子/丈夫问你干什么去。\n"抱孙子/孙女。"你说。',
      choices: [
        {
          text: '赶到医院，把那个小东西抱进怀里',
          effects: { marriage: 3, security: 3, setFlags: { '孙辈·降临': '你终于可以笑完就还回去了' }, log: { text: '你抱过很多次婴儿——但这一次，你终于可以笑完就还回去了。这就是"老人"的全部特权。', hl: true } },
          result: '那个小东西皱巴巴的、红扑扑的、闭着眼睛。\n你抱着他/她的时候，忽然想起二十七年前产房外那个护士抱出来的小东西——一模一样的皱巴巴。\n只不过这次，你不需要整夜不睡了。',
        },
        {
          text: '"好，我明天来。你们先休息。"',
          effects: { marriage: 2, nursingSkill: 1 },
          result: '你挂了电话，把菜炒完，坐下，吃了一口。\n然后你发现自己在笑。\n那个二十七年前开始的故事，翻到了新的一页。',
        },
      ],
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
      text = `体重 ${state.child.weight}kg（较出生 ${gained >= 0 ? '+' : ''}${gained}g，第 ${pct} 百分位）。\n"养得真好。"医生笑了一下，随即翻了页，"——奶粉别冲太浓。不是说你家，说给所有家长听。"\n亲戚们说这叫"有福气"。只有医生在皱眉。`;
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

  // 成绩公式（小学章核心）：成绩 = 天赋底盘 + 习惯 + 状态（安全感） + 择校加成 + 随机
  // 撒谎链不在公式里——它决定的是"你什么时候知道成绩"。
  G.reportScore = function (state, bonus = 0) {
    const talentBase = { logic: 8, verbal: 4 }[state.child.talent] || 0;
    const habit = state.child.study.habit
      + (state.flags['幼小衔接·习惯'] ? 8 : 0)
      + (state.flags['幼小衔接·补习'] ? 5 : 0)
      + (state.flags['学区房'] ? 3 : 0);
    // 安全感下限保护有效、加分封顶（避免长期满值安全感把分数顶穿）
    const secuMod = util.clamp(Math.round((state.child.security - 50) / 4), -10, 5);
    return Math.max(20, Math.min(98, 54 + talentBase + Math.round((habit - 50) / 2) + secuMod + bonus + util.randInt(-8, 8)));
  };

  G.ANCHORS = ANCHORS;
  G.ANCHOR_FOLLOWUPS = ANCHOR_FOLLOWUPS;
})(GAME);
