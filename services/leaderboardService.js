// utils/leaderboardService.js

export const DEFAULT_LEADERBOARD_DATA = [
  {
    id: 'hero_1',
    rank: 1,
    nickname: '陈大川',
    avatar: '👨‍👧',
    substituted: 1420,
    savedMoney: 3550,
    days: 92,
    title: '无烟圣尊',
    likes: 2841,
    quote: '答应小公主的话，一定要做到！现在呼吸一身轻松。'
  },
  {
    id: 'hero_2',
    rank: 2,
    nickname: '老张不吸烟',
    avatar: '🧗‍♂️',
    substituted: 1260,
    savedMoney: 3780,
    days: 85,
    title: '意志泰斗',
    likes: 2430,
    quote: '想抽了就用【我抽一支】过过干瘾，真的顶过去了。'
  },
  {
    id: 'hero_3',
    rank: 3,
    nickname: '清风徐来',
    avatar: '🍵',
    substituted: 1100,
    savedMoney: 2750,
    days: 78,
    title: '金牌克制家',
    likes: 2105,
    quote: '咽炎和咳嗽全好了，这辈子最划算的投资。'
  },
  {
    id: 'hero_4',
    rank: 4,
    nickname: '浩然',
    avatar: '🎁',
    substituted: 980,
    savedMoney: 3920,
    days: 70,
    title: '孝心楷模',
    likes: 1950,
    quote: '以前抽高档烟太烧钱，今年母亲节直接送老妈金镯子！'
  },
  {
    id: 'hero_5',
    rank: 5,
    nickname: '阿杰要自律',
    avatar: '🏃‍♂️',
    substituted: 890,
    savedMoney: 2225,
    days: 64,
    title: '坚毅行者',
    likes: 1720,
    quote: '不给肺泡增加一毫克焦油，坚持就是胜利。'
  },
  {
    id: 'hero_6',
    rank: 6,
    nickname: '林间小鹿',
    avatar: '👨‍💻',
    substituted: 820,
    savedMoney: 2460,
    days: 60,
    title: '代码清风',
    likes: 1530,
    quote: '以前写代码靠抽烟找灵感，现在喝茶灵感更多。'
  },
  {
    id: 'hero_7',
    rank: 7,
    nickname: '刘工_现场安全',
    avatar: '🏃',
    substituted: 760,
    savedMoney: 1900,
    days: 58,
    title: '耐力先锋',
    likes: 1420,
    quote: '清晨跑完步深吸一口新鲜空气，这感觉香烟给不了。'
  },
  {
    id: 'hero_8',
    rank: 8,
    nickname: '随遇而安',
    avatar: '🍱',
    substituted: 710,
    savedMoney: 2840,
    days: 52,
    title: '理财达人',
    likes: 1280,
    quote: '省下来的真金白银带老婆吃好吃的，太香了！'
  },
  {
    id: 'hero_9',
    rank: 9,
    nickname: '微笑面对',
    avatar: '🪥',
    substituted: 660,
    savedMoney: 1650,
    days: 49,
    title: '形象管理',
    likes: 1150,
    quote: '洗了牙彻底告别烟渍，跟客户谈业务自信多了。'
  },
  {
    id: 'hero_10',
    rank: 10,
    nickname: '李建国',
    avatar: '🧔',
    substituted: 620,
    savedMoney: 1550,
    days: 46,
    title: '自律标杆',
    likes: 1040,
    quote: '烟龄20年，终于打破心魔，给同路人加油！'
  },
  {
    id: 'hero_11',
    rank: 11,
    nickname: '海阔天空',
    avatar: '👃',
    substituted: 580,
    savedMoney: 1450,
    days: 43,
    title: '嗅觉归真',
    likes: 960,
    quote: '嗅觉味觉全部恢复！终于理解不抽烟的人多讨厌烟味了。'
  },
  {
    id: 'hero_12',
    rank: 12,
    nickname: '阿凯',
    avatar: '🤝',
    substituted: 540,
    savedMoney: 1620,
    days: 41,
    title: '誓言卫士',
    likes: 890,
    quote: '跟发小立了字据，谁先复吸谁输一万，目前我赢面极大！'
  },
  {
    id: 'hero_13',
    rank: 13,
    nickname: '周师傅',
    avatar: '🚴',
    substituted: 510,
    savedMoney: 1275,
    days: 39,
    title: '活力先锋',
    likes: 840,
    quote: '肺活量从3000飙到4500，生活充满正能量。'
  },
  {
    id: 'hero_14',
    rank: 14,
    nickname: '追风少年老王',
    avatar: '🚙',
    substituted: 480,
    savedMoney: 1200,
    days: 37,
    title: '高原雄鹰',
    likes: 780,
    quote: '以前上高原喘成狗，戒烟一个月翻越折多山毫无压力。'
  },
  {
    id: 'hero_15',
    rank: 15,
    nickname: '向阳花开',
    avatar: '💓',
    substituted: 450,
    savedMoney: 1125,
    days: 35,
    title: '强健心跳',
    likes: 730,
    quote: '以前静息心率85+，戒烟一个月心电图彻底正常。'
  },
  {
    id: 'hero_16',
    rank: 16,
    nickname: '阿峰',
    avatar: '💻',
    substituted: 430,
    savedMoney: 2150,
    days: 33,
    title: '装备达人',
    likes: 690,
    quote: '每天省下买包好烟的钱，两个月硬是攒出一台4080！'
  },
  {
    id: 'hero_17',
    rank: 17,
    nickname: '小宇爸爸',
    avatar: '🧸',
    substituted: 410,
    savedMoney: 1025,
    days: 32,
    title: '温柔奶爸',
    likes: 650,
    quote: '放学接儿子，他第一次主动埋在我怀里说爸爸身上真香。'
  },
  {
    id: 'hero_18',
    rank: 18,
    nickname: '阳光宅男',
    avatar: '🌱',
    substituted: 390,
    savedMoney: 975,
    days: 30,
    title: '担当暖男',
    likes: 610,
    quote: '给未来的宝宝一个最洁净健康的无烟家庭环境。'
  },
  {
    id: 'hero_19',
    rank: 19,
    nickname: '大鹏展翅',
    avatar: '🚴‍♂️',
    substituted: 370,
    savedMoney: 925,
    days: 29,
    title: '破风骑手',
    likes: 580,
    quote: '以前骑车5公里肺要炸，现在环湖40公里脸不红心不跳。'
  },
  {
    id: 'hero_20',
    rank: 20,
    nickname: '赵明',
    avatar: '📱',
    substituted: 350,
    savedMoney: 875,
    days: 28,
    title: '克瘾标兵',
    likes: 550,
    quote: '每次心瘾犯了就打开小程序抽两支赛博烟，真的管用！'
  },
  {
    id: 'hero_21',
    rank: 21,
    nickname: '平凡之路',
    avatar: '🛏️',
    substituted: 335,
    savedMoney: 838,
    days: 27,
    title: '安眠卫士',
    likes: 520,
    quote: '晚上睡觉不憋气了，老婆说我终于不打雷鸣呼噜了。'
  },
  {
    id: 'hero_22',
    rank: 22,
    nickname: '老陈和儿子',
    avatar: '👴',
    substituted: 320,
    savedMoney: 800,
    days: 26,
    title: '互督先锋',
    likes: 490,
    quote: '带老爸一起打卡，老烟枪父子俩互相监督很有成就感。'
  },
  {
    id: 'hero_23',
    rank: 23,
    nickname: '静水流深',
    avatar: '🧬',
    substituted: 305,
    savedMoney: 763,
    days: 25,
    title: '机能新生',
    likes: 460,
    quote: '看着体内细胞自愈的进度条，根本舍不得再去碰真烟。'
  },
  {
    id: 'hero_24',
    rank: 24,
    nickname: '知足常乐',
    avatar: '🍵',
    substituted: 290,
    savedMoney: 725,
    days: 24,
    title: '克制达人',
    likes: 435,
    quote: '最艰难的戒断期已经挺过去了，现在内心毫无波澜。'
  },
  {
    id: 'hero_25',
    rank: 25,
    nickname: '跑者阿勇',
    avatar: '🏅',
    substituted: 275,
    savedMoney: 688,
    days: 23,
    title: '半马跑将',
    likes: 410,
    quote: '21天形成一个好习惯，下个月正式出征半程马拉松。'
  },
  {
    id: 'hero_26',
    rank: 26,
    nickname: '文质彬彬',
    avatar: '👔',
    substituted: 260,
    savedMoney: 780,
    days: 22,
    title: '清爽绅士',
    likes: 390,
    quote: '见客户喷香水不再混杂焦油臭，自信心直接拉满。'
  },
  {
    id: 'hero_27',
    rank: 27,
    nickname: '吃货大魏',
    avatar: '🍜',
    substituted: 245,
    savedMoney: 613,
    days: 21,
    title: '五味觉醒',
    likes: 370,
    quote: '吃什么都觉得特别鲜美，这才叫生活的人间烟火气！'
  },
  {
    id: 'hero_28',
    rank: 28,
    nickname: '老钓翁',
    avatar: '🎣',
    substituted: 230,
    savedMoney: 575,
    days: 20,
    title: '静心钓客',
    likes: 350,
    quote: '以前坐一天钓箱抽两包，现在专心看漂渔获还翻倍了。'
  },
  {
    id: 'hero_29',
    rank: 29,
    nickname: '明天会更好',
    avatar: '🌿',
    substituted: 215,
    savedMoney: 538,
    days: 19,
    title: '健康破茧',
    likes: 330,
    quote: '晨起不再卡痰，呼吸透亮清爽的感觉太棒了。'
  },
  {
    id: 'hero_30',
    rank: 30,
    nickname: '阿豪',
    avatar: '👜',
    substituted: 200,
    savedMoney: 1200,
    days: 18,
    title: '深情相伴',
    likes: 310,
    quote: '省下买好烟的钱存进恋爱基金，女朋友开心我也健康。'
  },
  {
    id: 'hero_31',
    rank: 31,
    nickname: '珍惜当下',
    avatar: '🩺',
    substituted: 185,
    savedMoney: 463,
    days: 17,
    title: '健康自觉',
    likes: 295,
    quote: '体检微小结节让我吓出一身冷汗，彻底扔掉打火机！'
  },
  {
    id: 'hero_32',
    rank: 32,
    nickname: '小杨跑腿',
    avatar: '🏢',
    substituted: 170,
    savedMoney: 425,
    days: 16,
    title: '步履如飞',
    likes: 280,
    quote: '电梯维保一口气爬六楼，腿不软气不喘，通透！'
  },
  {
    id: 'hero_33',
    rank: 33,
    nickname: '自渡',
    avatar: '🦁',
    substituted: 155,
    savedMoney: 388,
    days: 15,
    title: '自律卫士',
    likes: 265,
    quote: '尼古丁戒断反应已经消退，剩下的心瘾靠自律碾碎。'
  },
  {
    id: 'hero_34',
    rank: 34,
    nickname: '铁馆老王',
    avatar: '🏋️‍♂️',
    substituted: 140,
    savedMoney: 350,
    days: 14,
    title: '健身硬汉',
    likes: 250,
    quote: '健身撸铁和抽烟势不两立，为了清晰腹肌冲了！'
  },
  {
    id: 'hero_35',
    rank: 35,
    nickname: '春风十里',
    avatar: '☀️',
    substituted: 130,
    savedMoney: 325,
    days: 13,
    title: '新生萌芽',
    likes: 235,
    quote: '一步一个脚印，每天替一支，就是前进一大步。'
  },
  {
    id: 'hero_36',
    rank: 36,
    nickname: '麦霸小孙',
    avatar: '🎤',
    substituted: 120,
    savedMoney: 300,
    days: 12,
    title: '天籁之声',
    likes: 220,
    quote: '以前唱K两首嗓子就劈，现在气息绵长高音稳稳拿捏。'
  },
  {
    id: 'hero_37',
    rank: 37,
    nickname: '投资人老沈',
    avatar: '📈',
    substituted: 110,
    savedMoney: 550,
    days: 11,
    title: '理财先锋',
    likes: 205,
    quote: '每天省下40块直接定投理财，复利力量战胜香烟。'
  },
  {
    id: 'hero_38',
    rank: 38,
    nickname: '橙子味夏天',
    avatar: '🚗',
    substituted: 100,
    savedMoney: 250,
    days: 10,
    title: '清爽座驾',
    likes: 190,
    quote: '车厢里彻底洗掉烟味，载朋友家人再也不觉得尴尬。'
  },
  {
    id: 'hero_39',
    rank: 39,
    nickname: '自由风',
    avatar: '🍃',
    substituted: 90,
    savedMoney: 225,
    days: 9,
    title: '自在如风',
    likes: 175,
    quote: '随手点开小程序解解嘴瘾，无焦油无一氧化碳真好。'
  },
  {
    id: 'hero_40',
    rank: 40,
    nickname: '早睡早起身体好',
    avatar: '🌙',
    substituted: 80,
    savedMoney: 200,
    days: 8,
    title: '安稳好梦',
    likes: 160,
    quote: '夜里不再咳嗽憋醒，睡眠质量提升了不止一个档次。'
  },
  {
    id: 'hero_41',
    rank: 41,
    nickname: '青衫磊落',
    avatar: '🖐️',
    substituted: 70,
    savedMoney: 175,
    days: 8,
    title: '净手修心',
    likes: 145,
    quote: '烟熏黄的食指和中指恢复正常肉色，干干净净。'
  },
  {
    id: 'hero_42',
    rank: 42,
    nickname: '一战成硕',
    avatar: '📚',
    substituted: 60,
    savedMoney: 150,
    days: 7,
    title: '专注上岸',
    likes: 130,
    quote: '自习室里不能抽烟，索性彻底戒了，全神贯注上岸！'
  },
  {
    id: 'hero_43',
    rank: 43,
    nickname: '笃行不怠',
    avatar: '🛡️',
    substituted: 52,
    savedMoney: 130,
    days: 7,
    title: '百炼成钢',
    likes: 115,
    quote: '最艰难的前7天已经跨过，后面的日子信心百倍！'
  },
  {
    id: 'hero_44',
    rank: 44,
    nickname: '阿强',
    avatar: '💖',
    substituted: 45,
    savedMoney: 113,
    days: 6,
    title: '模范标兵',
    likes: 100,
    quote: '每天截屏打卡发家庭群，一家老小都是我的坚强后盾。'
  },
  {
    id: 'hero_45',
    rank: 45,
    nickname: '球场小马达',
    avatar: '🏀',
    substituted: 38,
    savedMoney: 95,
    days: 5,
    title: '球场战神',
    likes: 88,
    quote: '以前第四节只能折返跑，今天全场飞奔还能快攻上篮！'
  },
  {
    id: 'hero_46',
    rank: 46,
    nickname: '清晨的阳光',
    avatar: '🕊️',
    substituted: 32,
    savedMoney: 80,
    days: 5,
    title: '晨光晨爽',
    likes: 76,
    quote: '早上刷牙不再恶心干呕，清清爽爽开启元气一天。'
  },
  {
    id: 'hero_47',
    rank: 47,
    nickname: '小志在努力',
    avatar: '⚔️',
    substituted: 26,
    savedMoney: 65,
    days: 4,
    title: '无畏新秀',
    likes: 65,
    quote: '刚开始戒烟，每天看着排行榜的大佬们，动力爆棚！'
  },
  {
    id: 'hero_48',
    rank: 48,
    nickname: '行稳致远',
    avatar: '🌟',
    substituted: 20,
    savedMoney: 50,
    days: 3,
    title: '持之以恒',
    likes: 54,
    quote: '戒烟最好的时间是十年前，其次是现在，加油！'
  },
  {
    id: 'hero_49',
    rank: 49,
    nickname: '微光倾城',
    avatar: '🌅',
    substituted: 15,
    savedMoney: 38,
    days: 2,
    title: '晨曦破晓',
    likes: 45,
    quote: '克服了早上睁眼必须点火的习惯，迈出了关键一步！'
  },
  {
    id: 'hero_50',
    rank: 50,
    nickname: '追梦人',
    avatar: '🚀',
    substituted: 10,
    savedMoney: 25,
    days: 1,
    title: '自律启航',
    likes: 38,
    quote: '决不再做尼古丁的提线木偶，兄弟们监督我，冲！'
  }
];

const LIKES_KEY = 'just_one_smoke_leaderboard_likes';

function getUserQuote(substituted = 0, days = 1) {
  if (days >= 30) return '跨过满月大关，呼吸如山风般纯净透亮！';
  if (days >= 7) return '挺过关键首周，意志坚如磐石，彻底告别焦油！';
  if (substituted >= 20) return '每一支被克制的烟，都是重获新生的勋章！';
  if (substituted >= 5) return '自律起航，多替一支，离健康无烟就更近一步！';
  return '戒烟最好的时间是十年前，其次是现在！';
}

function getCategoryKey(category) {
  if (category === 'saved') return 'savedMoney';
  if (category === 'days') return 'days';
  return 'substituted';
}

export const leaderboardService = {
  getLeaderboard(category = 'substituted', myStats = { substituted: 0, savedMoney: 0, days: 1 }, userProfile = null) {
    let likesMap = {};
    try {
      likesMap = wx.getStorageSync(LIKES_KEY) || {};
    } catch (e) {
      likesMap = {};
    }

    // 解析当前用户资料（防御式回退支持持久化缓存）
    let profile = userProfile;
    if (!profile || !profile.nickName) {
      try {
        const raw = wx.getStorageSync('SMOKEFREE_PROFILE');
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        profile = Object.assign({}, profile, parsed);
      } catch (e) {}
    }

    // 称号判定 (纯净中文称号，不带任何尾部图标与Emoji)
    let myTitle = '无烟觉醒者';
    if (myStats.substituted >= 100) myTitle = '黄金替瘾先锋';
    else if (myStats.substituted >= 30) myTitle = '意志破茧者';
    else if (myStats.substituted >= 10) myTitle = '健康启航者';

    // 构建当前用户榜单实体
    const meItem = {
      id: 'me',
      isMe: true,
      nickname: (profile && profile.nickName) ? profile.nickName : '微信烟友',
      avatar: '🌟',
      avatarUrl: (profile && profile.avatarUrl) ? profile.avatarUrl : '',
      substituted: myStats.substituted || 0,
      savedMoney: myStats.savedMoney || 0,
      days: myStats.days || 1,
      title: myTitle,
      likes: (50 + Math.min(50, myStats.substituted || 0)) + (likesMap['me'] ? 1 : 0),
      isLiked: !!likesMap['me'],
      quote: (profile && profile.customQuote) ? profile.customQuote : getUserQuote(myStats.substituted, myStats.days)
    };

    // 复制基础数据并更新点赞
    let mockList = DEFAULT_LEADERBOARD_DATA.map(item => ({
      ...item,
      likes: item.likes + (likesMap[item.id] ? 1 : 0),
      isLiked: !!likesMap[item.id]
    }));

    // 依据选定分类排序
    const metricKey = getCategoryKey(category);
    mockList.sort((a, b) => b[metricKey] - a[metricKey]);

    // 计算用户当前自己的排位 (1-indexed)
    let myVal = meItem[metricKey] || 0;
    let myRank = mockList.length + 1; // 默认 51 席
    for (let i = 0; i < mockList.length; i++) {
      if (myVal >= mockList[i][metricKey]) {
        myRank = i + 1;
        break;
      }
    }

    // 构造最终榜单列表：榜单严格只展示前 50 席英雄
    let list;
    if (myRank <= 50) {
      mockList.splice(myRank - 1, 0, meItem);
      list = mockList.slice(0, 50).map((item, index) => ({
        ...item,
        rank: index + 1
      }));
    } else {
      // 当前用户未入前 50 席时，榜单纯净展示前 50 名，用户排位（如 No.51）在顶部专属卡片呈现
      list = mockList.slice(0, 50).map((item, index) => ({
        ...item,
        rank: index + 1
      }));
    }

    // 击败全国百分比
    let beatPercent = Math.min(99.4, Math.max(15.2, Math.round((1 - (myRank - 1) / 100) * 100 * 10) / 10));

    return {
      list,
      myRankInfo: {
        rank: myRank,
        title: myTitle,
        beatPercent,
        substituted: myStats.substituted,
        savedMoney: myStats.savedMoney,
        days: myStats.days,
        quote: meItem.quote
      }
    };
  },

  toggleLike(id) {
    try {
      let likesMap = wx.getStorageSync(LIKES_KEY) || {};
      let isLiked = !likesMap[id];
      likesMap[id] = isLiked;
      wx.setStorageSync(LIKES_KEY, likesMap);
      return isLiked;
    } catch (e) {
      return false;
    }
  }
};
