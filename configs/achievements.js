// configs/achievements.js
import { ACHIEVEMENT_ICONS, getAchievementIconUri } from './achievementIcons.js';

/**
 * 赛博替烟 · 荣耀称号殿堂全量元数据配置 (Tencent Games 体验总监阶梯进阶级)
 * 严格按照【从低到高 (Lv.1 ~ Lv.16)】梯度排列
 * 点亮规则：【严格线性逐级点亮】(只能从第1个 -> 第2个 -> 第3个依次点亮，不可跳级)
 * 
 * 六阶流光品阶体系：
 * - 启蒙 (翠绿 · Tier 1): Lv.1 ~ Lv.3  (青涩初启，建立心理替代正向反馈)
 * - 进阶 (苍蓝 · Tier 2): Lv.4 ~ Lv.6  (跨越三天生理峰值与积微成著)
 * - 稀有 (幽紫 · Tier 3): Lv.7 ~ Lv.9  (七日代谢排空与从容自若)
 * - 史诗 (琥珀金 · Tier 4): Lv.10 ~ Lv.12 (重塑新程与金石为开)
 * - 传说 (离火绯 · Tier 5): Lv.13 ~ Lv.14 (百日涅槃与千帆历尽)
 * - 神话 (曜世金 · Tier 6): Lv.15 ~ Lv.16 (心如琉璃与返璞归真终极境界)
 */
export const ACHIEVEMENTS = [
  // ================= 1. 青阶 · 启蒙 (Lv.1 ~ Lv.3) =================
  {
    id: 'title_1',
    level: 1,
    name: '破土初萌',
    tier: 'green',
    tierTag: '启蒙',
    weight: 10,
    tagColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.14)',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    category: '青涩初启',
    icon: '🌱',
    quote: '种子破土的瞬间微小，却孕育着整片苍翠森林的生机。',
    description: '成功完成第 1 次拟真替烟，迈出摆脱真烟的第一步，点亮无烟火花。',
    conditionDesc: '累计替烟达到 1 支',
    targetType: 'subs',
    targetVal: 1,
    check: (stats) => (stats.totalSubstituted || 0) >= 1
  },
  {
    id: 'title_2',
    level: 2,
    name: '第一缕风',
    tier: 'green',
    tierTag: '启蒙',
    weight: 20,
    tagColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.14)',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    category: '青涩初启',
    icon: '💨',
    quote: '当第一缕清风穿透胸膛，纯净呼吸的治愈旅程已然启程。',
    description: '累计替烟 5 支，熟练掌握赛博替代与心理脱瘾节奏。',
    conditionDesc: '累计替烟达到 5 支',
    targetType: 'subs',
    targetVal: 5,
    check: (stats) => (stats.totalSubstituted || 0) >= 5
  },
  {
    id: 'title_3',
    level: 3,
    name: '晨曦破晓',
    tier: 'green',
    tierTag: '启蒙',
    weight: 30,
    tagColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.14)',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    category: '青涩初启',
    icon: '🌅',
    quote: '熬过最初的微澜，身心每一个细胞都在渴望更纯澈的晨光。',
    description: '持续坚持无烟 2 天，体内一氧化碳与残余尼古丁浓度开始快速骤降。',
    conditionDesc: '持续无烟达到 2 天',
    targetType: 'days',
    targetVal: 2,
    check: (stats) => (stats.quitDays || 0) >= 2
  },

  // ================= 2. 蓝阶 · 进阶 (Lv.4 ~ Lv.6) =================
  {
    id: 'title_4',
    level: 4,
    name: '三日生机',
    tier: 'blue',
    tierTag: '进阶',
    weight: 40,
    tagColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    borderColor: 'rgba(56, 189, 248, 0.55)',
    category: '生机破浪',
    icon: '🌿',
    quote: '最艰难的峰值已被你踏在脚下，生机的萌芽正在不可逆地绽放。',
    description: '持续无烟坚持 3 天，成功跨越尼古丁戒断反应生理峰值期，重拾生机。',
    conditionDesc: '持续无烟达到 3 天',
    targetType: 'days',
    targetVal: 3,
    check: (stats) => (stats.quitDays || 0) >= 3
  },
  {
    id: 'title_5',
    level: 5,
    name: '积微成著',
    tier: 'blue',
    tierTag: '进阶',
    weight: 50,
    tagColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    borderColor: 'rgba(56, 189, 248, 0.55)',
    category: '生机破浪',
    icon: '📦',
    quote: '少抽一整盒的自律克制，是对肺泡最温柔、最长情的救赎。',
    description: '累计替烟 20 支，实打实少抽一整包真烟，避开有害焦油超 200mg。',
    conditionDesc: '累计替烟达到 20 支',
    targetType: 'subs',
    targetVal: 20,
    check: (stats) => (stats.totalSubstituted || 0) >= 20
  },
  {
    id: 'title_6',
    level: 6,
    name: '日省月试',
    tier: 'blue',
    tierTag: '进阶',
    weight: 60,
    tagColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    borderColor: 'rgba(56, 189, 248, 0.55)',
    category: '生机破浪',
    icon: '🍱',
    quote: '每一分省下的真金白银，都是你为自己积攒下的纯粹自由。',
    description: '累计节省烟钱超 ¥100，健康与财富同时回血，生活更显从容自如。',
    conditionDesc: '累计节省烟钱达到 ¥100',
    targetType: 'money',
    targetVal: 100,
    check: (stats) => (stats.totalSavedMoney || 0) >= 100
  },

  // ================= 3. 紫阶 · 稀有 (Lv.7 ~ Lv.9) =================
  {
    id: 'title_7',
    level: 7,
    name: '七日淬火',
    tier: 'purple',
    tierTag: '稀有',
    weight: 70,
    tagColor: '#c084fc',
    badgeBg: 'rgba(192, 132, 252, 0.16)',
    glowColor: 'rgba(192, 132, 252, 0.55)',
    borderColor: 'rgba(192, 132, 252, 0.65)',
    category: '千锤百炼',
    icon: '🔥',
    quote: '七昼夜纯净代谢，血液里的浊气散尽，意志在淬火中初露锋芒。',
    description: '持续无烟坚持 7 天，度过第一个完整的自律周，体内代谢毒素基本排空。',
    conditionDesc: '持续无烟达到 7 天',
    targetType: 'days',
    targetVal: 7,
    check: (stats) => (stats.quitDays || 0) >= 7
  },
  {
    id: 'title_8',
    level: 8,
    name: '身轻气爽',
    tier: 'purple',
    tierTag: '稀有',
    weight: 80,
    tagColor: '#c084fc',
    badgeBg: 'rgba(192, 132, 252, 0.16)',
    glowColor: 'rgba(192, 132, 252, 0.55)',
    borderColor: 'rgba(192, 132, 252, 0.65)',
    category: '千锤百炼',
    icon: '🍃',
    quote: '呼吸由浊转清，步伐由重转轻，久违的通透活力正重归身心。',
    description: '持续无烟 14 天，支气管纤毛全面苏醒，肺活量与深层血液携氧显著改善。',
    conditionDesc: '持续无烟达到 14 天',
    targetType: 'days',
    targetVal: 14,
    check: (stats) => (stats.quitDays || 0) >= 14
  },
  {
    id: 'title_9',
    level: 9,
    name: '从容自若',
    tier: 'purple',
    tierTag: '稀有',
    weight: 90,
    tagColor: '#c084fc',
    badgeBg: 'rgba(192, 132, 252, 0.16)',
    glowColor: 'rgba(192, 132, 252, 0.55)',
    borderColor: 'rgba(192, 132, 252, 0.65)',
    category: '千锤百炼',
    icon: '🎖️',
    quote: '百支替烟的沉淀，让克制不再是强撑，而是优雅从容的日常。',
    description: '累计替烟 100 支（整整 5 包），自律化为日常习惯，气道呼吸全面通畅。',
    conditionDesc: '累计替烟达到 100 支',
    targetType: 'subs',
    targetVal: 100,
    check: (stats) => (stats.totalSubstituted || 0) >= 100
  },

  // ================= 4. 金阶 · 史诗 (Lv.10 ~ Lv.12) =================
  {
    id: 'title_10',
    level: 10,
    name: '重塑新程',
    tier: 'gold',
    tierTag: '史诗',
    weight: 100,
    tagColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    borderColor: 'rgba(245, 158, 11, 0.75)',
    category: '黄金时代',
    icon: '💎',
    quote: '二十一天重塑大脑回路，你亲手为自己铸造了坚不可摧的生活秩序。',
    description: '持续坚持 21 天，打破旧心理反射依赖，建立稳固强大的全新无烟习惯。',
    conditionDesc: '持续无烟达到 21 天',
    targetType: 'days',
    targetVal: 21,
    check: (stats) => (stats.quitDays || 0) >= 21
  },
  {
    id: 'title_11',
    level: 11,
    name: '静水流深',
    tier: 'gold',
    tierTag: '史诗',
    weight: 110,
    tagColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    borderColor: 'rgba(245, 158, 11, 0.75)',
    category: '黄金时代',
    icon: '🛡️',
    quote: '整整一条真烟的距离，是你与旧我之间跨越山海的毅力丰碑。',
    description: '累计替烟 200 支，相当于少抽整整一条真烟，心境从容，静水流深。',
    conditionDesc: '累计替烟达到 200 支',
    targetType: 'subs',
    targetVal: 200,
    check: (stats) => (stats.totalSubstituted || 0) >= 200
  },
  {
    id: 'title_12',
    level: 12,
    name: '金石为开',
    tier: 'gold',
    tierTag: '史诗',
    weight: 120,
    tagColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    borderColor: 'rgba(245, 158, 11, 0.75)',
    category: '黄金时代',
    icon: '💰',
    quote: '四位数财富的积聚见证着：战胜自我不仅重获健康，亦丰盛人生。',
    description: '累计节省烟钱突破 ¥1000，少抽烟真金白银换回更丰盈美好的生活体验。',
    conditionDesc: '累计节省烟钱达到 ¥1000',
    targetType: 'money',
    targetVal: 1000,
    check: (stats) => (stats.totalSavedMoney || 0) >= 1000
  },

  // ================= 5. 绯阶 · 传说 (Lv.13 ~ Lv.14) =================
  {
    id: 'title_13',
    level: 13,
    name: '百日涅槃',
    tier: 'red',
    tierTag: '传说',
    weight: 130,
    tagColor: '#f43f5e',
    badgeBg: 'rgba(244, 63, 94, 0.2)',
    glowColor: 'rgba(244, 63, 94, 0.75)',
    borderColor: 'rgba(244, 63, 94, 0.85)',
    category: '涅槃生辉',
    icon: '🏆',
    quote: '百日无烟，脱胎换骨。那些曾以为无法挣脱的枷锁，如今轻如鸿毛。',
    description: '持续无烟坚持 100 天，意志坚若磐石，彻底告别烟瘾，迎来纯净新生。',
    conditionDesc: '持续无烟达到 100 天',
    targetType: 'days',
    targetVal: 100,
    check: (stats) => (stats.quitDays || 0) >= 100
  },
  {
    id: 'title_14',
    level: 14,
    name: '千帆历尽',
    tier: 'red',
    tierTag: '传说',
    weight: 140,
    tagColor: '#f43f5e',
    badgeBg: 'rgba(244, 63, 94, 0.2)',
    glowColor: 'rgba(244, 63, 94, 0.75)',
    borderColor: 'rgba(244, 63, 94, 0.85)',
    category: '涅槃生辉',
    icon: '⚡',
    quote: '千支替烟的克制历程，足以让你看淡生活一切繁杂浮沉。',
    description: '累计替烟 1000 支！身体全面摆脱尼古丁束缚，神清气朗，千帆历尽归于从容。',
    conditionDesc: '累计替烟达到 1000 支',
    targetType: 'subs',
    targetVal: 1000,
    check: (stats) => (stats.totalSubstituted || 0) >= 1000
  },

  // ================= 6. 神阶 · 神话 (Lv.15 ~ Lv.16) =================
  {
    id: 'title_15',
    level: 15,
    name: '心如琉璃',
    tier: 'mythic',
    tierTag: '神话',
    weight: 150,
    tagColor: '#fbbf24',
    badgeBg: 'rgba(251, 191, 36, 0.22)',
    glowColor: 'rgba(251, 191, 36, 0.85)',
    borderColor: 'rgba(251, 191, 36, 0.95)',
    category: '纯净之境',
    icon: '👑',
    quote: '半年自律不辍，心脉澄澈如琉璃，内外明澈，尘埃莫能染。',
    description: '持续无烟坚守 180 天（整整半年），心血管机能彻底焕新，成就心如琉璃境。',
    conditionDesc: '持续无烟达到 180 天',
    targetType: 'days',
    targetVal: 180,
    check: (stats) => (stats.quitDays || 0) >= 180
  },
  {
    id: 'title_16',
    level: 16,
    name: '返璞归真',
    tier: 'mythic',
    tierTag: '神话',
    weight: 160,
    tagColor: '#fbbf24',
    badgeBg: 'rgba(251, 191, 36, 0.25)',
    glowColor: 'rgba(251, 191, 36, 0.95)',
    borderColor: 'rgba(251, 191, 36, 1)',
    category: '纯净之境',
    icon: '🐉',
    quote: '天地呼吸一气流转，无挂无碍，复归于婴儿般的纯粹与安详。',
    description: '持续无烟 365 天或累计替烟 2000 支，身心彻底回归自然本质，返璞归真。',
    conditionDesc: '持续无烟 365 天 或 累计替烟 2000 支',
    targetType: 'ultimate',
    targetVal: 365,
    check: (stats) => (stats.quitDays || 0) >= 365 || (stats.totalSubstituted || 0) >= 2000
  }
];

// 为每个称号注入殿堂级高定矢量 SVG 图标
ACHIEVEMENTS.forEach(item => {
  item.iconSvg = ACHIEVEMENT_ICONS[item.id] || null;
});

/**
 * 历史旧版成就 ID 向新版 16 级连续称号平滑映射表
 */
const LEGACY_ID_MAP = {
  first_step: 'title_1',
  subs_5: 'title_2',
  clean_lungs: 'title_4',
  pack_saved: 'title_5',
  wallet_refill: 'title_6',
  days_7: 'title_7',
  pure_rebirth: 'title_9',
  days_21: 'title_10',
  subs_200: 'title_11',
  saved_1000: 'title_12',
  days_100: 'title_13',
  subs_1000: 'title_14'
};

/**
 * 规范化已解锁称号 ID 列表：
 * 映射旧 ID，并严格校验【连续性】(若中断则只保留连续前缀，杜绝跳级)
 * @param {Array<string>} rawIds 原始 ID 列表
 * @returns {Array<string>} 保证从 Lv.1 开始严格连续的已点亮 ID 列表
 */
export function normalizeUnlockedIds(rawIds = []) {
  if (!Array.isArray(rawIds)) return [];
  const mapped = rawIds.map(id => LEGACY_ID_MAP[id] || id);
  const validSet = new Set(mapped);
  const contiguous = [];

  for (let i = 0; i < ACHIEVEMENTS.length; i++) {
    const id = ACHIEVEMENTS[i].id;
    if (validSet.has(id)) {
      contiguous.push(id);
    } else {
      // 线性序列中断，不能跳跃保留
      break;
    }
  }
  return contiguous;
}

/**
 * 严格顺序点亮检测算法 (点亮只能从第一个 第二个 第三个...依次点亮)
 * 1. 每次判定必须从当前未点亮的第一个称号开始
 * 2. 只有当前置称号 (Lv. N-1) 已点亮，且达成当前称号目标，方可点亮
 * 3. 一旦某一级条件未达成，立即终止判定，后续所有称号严格保持锁定
 * 
 * @param {Object} stats 用户自律统计数据
 * @param {Array<string>} currentlyUnlockedIds 当前已解锁ID列表
 * @returns {Array<string>} 本次判定中按顺序全新点亮的称号ID列表
 */
export function checkAchievementsToUnlock(stats, currentlyUnlockedIds = []) {
  const normalized = normalizeUnlockedIds(currentlyUnlockedIds);
  const newlyUnlocked = [];
  const currentSet = new Set(normalized);

  for (let i = 0; i < ACHIEVEMENTS.length; i++) {
    const achievement = ACHIEVEMENTS[i];
    if (currentSet.has(achievement.id)) {
      // 已点亮，继续检查下一级
      continue;
    }

    // 严苛线性依赖约束：必须前置称号已点亮
    const isPrevUnlocked = (i === 0) || currentSet.has(ACHIEVEMENTS[i - 1].id);
    if (!isPrevUnlocked) {
      // 前序称号未点亮，绝对不可跨级点亮，立刻中断
      break;
    }

    // 前置已解锁，检查当前等级指标是否达成
    if (achievement.check(stats)) {
      newlyUnlocked.push(achievement.id);
      currentSet.add(achievement.id);
      // 达成后继续向下探测紧挨着的下一级称号
    } else {
      // 当前等级未达成，后续更高级称号严格不可点亮，立即中断
      break;
    }
  }

  return newlyUnlocked;
}

/**
 * 根据 ID 获取称号元数据
 */
export function getAchievementById(id) {
  const targetId = LEGACY_ID_MAP[id] || id;
  return ACHIEVEMENTS.find(item => item.id === targetId);
}

/**
 * 获取用户当前已解锁称号中最高等级的称号（按最高的带上）
 * @param {Array<string>} unlockedIds 已解锁的称号ID列表
 * @returns {string} 称号名称
 */
export function getHighestUnlockedTitle(unlockedIds = []) {
  const normalized = normalizeUnlockedIds(unlockedIds);
  if (normalized.length === 0) {
    return '无烟觉醒者';
  }
  const highestId = normalized[normalized.length - 1];
  const found = ACHIEVEMENTS.find(item => item.id === highestId);
  return found ? found.name : '无烟觉醒者';
}

/**
 * 获取用户当前生效的佩戴称号
 * @param {Array<string>} unlockedIds 已解锁称号ID列表
 * @param {string|null} customEquippedTitle 用户手动佩戴的称号
 * @returns {string} 生效称号
 */
export function getActiveUserTitle(unlockedIds = [], customEquippedTitle = null) {
  const normalized = normalizeUnlockedIds(unlockedIds);
  if (customEquippedTitle) {
    const found = ACHIEVEMENTS.find(item => item.name === customEquippedTitle && normalized.includes(item.id));
    if (found) return found.name;
  }
  return getHighestUnlockedTitle(normalized);
}

/**
 * 获取称号权重
 * @param {string} titleName 称号名称
 * @returns {number}
 */
export function getTitleWeight(titleName) {
  const found = ACHIEVEMENTS.find(item => item.name === titleName);
  return found ? (found.weight || 0) : 0;
}

/**
 * 计算单个称号的实时进度与百分比
 * @param {Object} achievement 称号配置对象
 * @param {Object} stats 用户实时数据
 */
export function getAchievementProgress(achievement, stats = {}) {
  if (!achievement) return { current: 0, target: 1, percent: 0, progressText: '0/1' };
  
  const { targetType, targetVal } = achievement;
  let current = 0;
  let target = targetVal || 1;
  let progressText = '';

  if (targetType === 'subs') {
    current = stats.totalSubstituted || 0;
    progressText = `${current} / ${target} 支`;
  } else if (targetType === 'days') {
    current = stats.quitDays || 0;
    progressText = `${current} / ${target} 天`;
  } else if (targetType === 'money') {
    current = Math.floor(stats.totalSavedMoney || 0);
    progressText = `¥${current} / ¥${target}`;
  } else if (targetType === 'ultimate') {
    // Lv.16: 持续 365 天 或 累计替烟 2000 支
    const days = stats.quitDays || 0;
    const subs = stats.totalSubstituted || 0;
    const daysRatio = days / 365;
    const subsRatio = subs / 2000;
    const bestRatio = Math.min(1, Math.max(daysRatio, subsRatio));
    return {
      current: Math.max(days, subs),
      target: 365,
      percent: Math.min(100, Math.max(0, Math.round(bestRatio * 100))),
      progressText: `${days}/365天 或 ${subs}/2000支`
    };
  } else {
    const isDone = achievement.check(stats);
    current = isDone ? 1 : 0;
    target = 1;
    progressText = isDone ? '已达成 ✓' : '未达成';
  }

  const percent = Math.min(100, Math.max(0, Math.round((current / target) * 100)));
  return {
    current,
    target,
    percent,
    progressText
  };
}

/**
 * 根据称号名称获取其专属品阶样式元数据（供排行榜、名片等渲染背景色与边框字色）
 * @param {string} titleName 称号名称
 * @returns {Object} { tier, tagColor, badgeBg, borderColor, glowColor }
 */
export function getTitleMetaByName(titleName) {
  if (!titleName) {
    return {
      tier: 'green',
      tagColor: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.14)',
      borderColor: 'rgba(16, 185, 129, 0.45)',
      glowColor: 'rgba(16, 185, 129, 0.3)'
    };
  }

  const found = ACHIEVEMENTS.find(item => item.name === titleName);
  if (found) {
    return {
      tier: found.tier,
      tagColor: found.tagColor,
      badgeBg: found.badgeBg,
      borderColor: found.borderColor,
      glowColor: found.glowColor
    };
  }

  // 针对通用/拓展称号的智能推断回退
  if (titleName.includes('尊') || titleName.includes('圣') || titleName.includes('金身')) {
    return {
      tier: 'mythic',
      tagColor: '#fbbf24',
      badgeBg: 'rgba(251, 191, 36, 0.22)',
      borderColor: 'rgba(251, 191, 36, 0.65)',
      glowColor: 'rgba(251, 191, 36, 0.4)'
    };
  }
  if (titleName.includes('封神') || titleName.includes('涅槃') || titleName.includes('火')) {
    return {
      tier: 'red',
      tagColor: '#f43f5e',
      badgeBg: 'rgba(244, 63, 94, 0.18)',
      borderColor: 'rgba(244, 63, 94, 0.55)',
      glowColor: 'rgba(244, 63, 94, 0.35)'
    };
  }
  if (titleName.includes('奇迹') || titleName.includes('蜕变') || titleName.includes('千元') || titleName.includes('金') || titleName.includes('泰斗')) {
    return {
      tier: 'gold',
      tagColor: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.18)',
      borderColor: 'rgba(245, 158, 11, 0.55)',
      glowColor: 'rgba(245, 158, 11, 0.35)'
    };
  }
  if (titleName.includes('关') || titleName.includes('爽') || titleName.includes('淬') || titleName.includes('楷模') || titleName.includes('管理')) {
    return {
      tier: 'purple',
      tagColor: '#c084fc',
      badgeBg: 'rgba(192, 132, 252, 0.16)',
      borderColor: 'rgba(192, 132, 252, 0.5)',
      glowColor: 'rgba(192, 132, 252, 0.3)'
    };
  }
  if (titleName.includes('餐') || titleName.includes('盒') || titleName.includes('生机') || titleName.includes('先锋') || titleName.includes('行者') || titleName.includes('达人') || titleName.includes('奶爸')) {
    return {
      tier: 'blue',
      tagColor: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.16)',
      borderColor: 'rgba(56, 189, 248, 0.5)',
      glowColor: 'rgba(56, 189, 248, 0.3)'
    };
  }

  return {
    tier: 'green',
    tagColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.14)',
    borderColor: 'rgba(16, 185, 129, 0.45)',
    glowColor: 'rgba(16, 185, 129, 0.3)'
  };
}

export { ACHIEVEMENT_ICONS, getAchievementIconUri };
