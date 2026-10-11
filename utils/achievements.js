// utils/achievements.js

/**
 * 赛博替烟 · 荣耀勋章殿堂全量元数据配置 (Tencent Games 体验总监阶梯进阶级)
 * 五阶流光品阶体系：
 * - 青阶 · 启蒙 (Tier 1): 基础入门，轻量正向反馈
 * - 蓝阶 · 进阶 (Tier 2): 早期关键坚持与少抽整包
 * - 紫阶 · 稀有 (Tier 3): 代谢排空与习惯初步建立
 * - 金阶 · 史诗 (Tier 4): 21天习惯闭环与少抽整条
 * - 神阶 · 传说 (Tier 5): 百日重生与龙凤呈祥神品殿堂
 */
export const ACHIEVEMENTS = [
  // ================= 1. 意志纪元 · 坚持勋章 (时间与戒断周期) =================
  {
    id: 'first_step',
    name: '破土初萌',
    tier: 'green',
    tierTag: '启蒙',
    tagColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.14)',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    category: '意志纪元',
    icon: '🌱',
    description: '成功完成第 1 次拟真替烟，迈出摆脱烟瘾的第一步',
    conditionDesc: '累计替烟达到 1 支',
    targetType: 'subs',
    targetVal: 1,
    check: (stats) => (stats.totalSubstituted || 0) >= 1
  },
  {
    id: 'clean_lungs',
    name: '三日生机',
    tier: 'blue',
    tierTag: '进阶',
    tagColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    borderColor: 'rgba(56, 189, 248, 0.55)',
    category: '意志纪元',
    icon: '🌿',
    description: '持续无烟坚持 3 天，成功跨越尼古丁戒断生理峰值期',
    conditionDesc: '持续无烟达到 3 天',
    targetType: 'days',
    targetVal: 3,
    check: (stats) => (stats.quitDays || 0) >= 3
  },
  {
    id: 'days_7',
    name: '七日淬炼',
    tier: 'purple',
    tierTag: '稀有',
    tagColor: '#c084fc',
    badgeBg: 'rgba(192, 132, 252, 0.16)',
    glowColor: 'rgba(192, 132, 252, 0.55)',
    borderColor: 'rgba(192, 132, 252, 0.65)',
    category: '意志纪元',
    icon: '👑',
    description: '持续无烟坚持 7 天，体内一氧化碳与尼古丁代谢基本排空',
    conditionDesc: '持续无烟达到 7 天',
    targetType: 'days',
    targetVal: 7,
    check: (stats) => (stats.quitDays || 0) >= 7
  },
  {
    id: 'days_21',
    name: '三周蜕变',
    tier: 'gold',
    tierTag: '史诗',
    tagColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    borderColor: 'rgba(245, 158, 11, 0.75)',
    category: '意志纪元',
    icon: '💎',
    description: '持续坚持 21 天，打破旧心理依赖，形成全新无烟习惯回路',
    conditionDesc: '持续无烟达到 21 天',
    targetType: 'days',
    targetVal: 21,
    check: (stats) => (stats.quitDays || 0) >= 21
  },
  {
    id: 'days_100',
    name: '百日涅槃',
    tier: 'red',
    tierTag: '传说',
    tagColor: '#f43f5e',
    badgeBg: 'rgba(244, 63, 94, 0.18)',
    glowColor: 'rgba(244, 63, 94, 0.75)',
    borderColor: 'rgba(244, 63, 94, 0.85)',
    category: '意志纪元',
    icon: '🏆',
    description: '持续无烟坚持 100 天，意志如磐石，重获纯净新生与充沛活力',
    conditionDesc: '持续无烟达到 100 天',
    targetType: 'days',
    targetVal: 100,
    check: (stats) => (stats.quitDays || 0) >= 100
  },

  // ================= 2. 克制之道 · 替烟大师 (替烟支数维度) =================
  {
    id: 'subs_5',
    name: '第一缕风',
    tier: 'green',
    tierTag: '启蒙',
    tagColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.14)',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    category: '克制之道',
    icon: '💨',
    description: '累计替烟 5 支，熟练掌握赛博替代与心理脱瘾技巧',
    conditionDesc: '累计替烟达到 5 支',
    targetType: 'subs',
    targetVal: 5,
    check: (stats) => (stats.totalSubstituted || 0) >= 5
  },
  {
    id: 'pack_saved',
    name: '省下一包',
    tier: 'blue',
    tierTag: '进阶',
    tagColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    borderColor: 'rgba(56, 189, 248, 0.55)',
    category: '克制之道',
    icon: '📦',
    description: '累计替烟 20 支，实打实少抽一整包真烟，焦油避开超 200mg',
    conditionDesc: '累计替烟达到 20 支',
    targetType: 'subs',
    targetVal: 20,
    check: (stats) => (stats.totalSubstituted || 0) >= 20
  },
  {
    id: 'pure_rebirth',
    name: '五盒大关',
    tier: 'purple',
    tierTag: '稀有',
    tagColor: '#c084fc',
    badgeBg: 'rgba(192, 132, 252, 0.16)',
    glowColor: 'rgba(192, 132, 252, 0.55)',
    borderColor: 'rgba(192, 132, 252, 0.65)',
    category: '克制之道',
    icon: '🎖️',
    description: '累计替烟 100 支（整整 5 包），肺部纤毛重拾强劲排毒自愈力',
    conditionDesc: '累计替烟达到 100 支',
    targetType: 'subs',
    targetVal: 100,
    check: (stats) => (stats.totalSubstituted || 0) >= 100 || (stats.quitDays || 0) >= 7
  },
  {
    id: 'subs_200',
    name: '整条奇迹',
    tier: 'gold',
    tierTag: '史诗',
    tagColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    borderColor: 'rgba(245, 158, 11, 0.75)',
    category: '克制之道',
    icon: '🛡️',
    description: '累计替烟 200 支，相当于少抽整整一条真烟，肺活量大幅回升',
    conditionDesc: '累计替烟达到 200 支',
    targetType: 'subs',
    targetVal: 200,
    check: (stats) => (stats.totalSubstituted || 0) >= 200
  },
  {
    id: 'subs_1000',
    name: '千支封神',
    tier: 'red',
    tierTag: '传说',
    tagColor: '#f43f5e',
    badgeBg: 'rgba(244, 63, 94, 0.18)',
    glowColor: 'rgba(244, 63, 94, 0.75)',
    borderColor: 'rgba(244, 63, 94, 0.85)',
    category: '克制之道',
    icon: '🐉',
    description: '累计替烟 1000 支，登峰造极！身体全面摆脱尼古丁束缚',
    conditionDesc: '累计替烟达到 1000 支',
    targetType: 'subs',
    targetVal: 1000,
    check: (stats) => (stats.totalSubstituted || 0) >= 1000
  },

  // ================= 3. 自律金库 · 省钱达人 (经济与基金维度) =================
  {
    id: 'saved_30',
    name: '一杯咖啡',
    tier: 'green',
    tierTag: '启蒙',
    tagColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.14)',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    category: '自律金库',
    icon: '☕',
    description: '累计节省烟资超 ¥30，用省下的钱买一杯香醇热咖啡犒劳自己',
    conditionDesc: '累计节省烟钱达到 ¥30',
    targetType: 'money',
    targetVal: 30,
    check: (stats) => (stats.totalSavedMoney || 0) >= 30
  },
  {
    id: 'wallet_refill',
    name: '一顿大餐',
    tier: 'blue',
    tierTag: '进阶',
    tagColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    borderColor: 'rgba(56, 189, 248, 0.55)',
    category: '自律金库',
    icon: '🍱',
    description: '累计节省烟钱超 ¥100，健康与财富同时回血，省钱实感飙升',
    conditionDesc: '累计节省烟钱达到 ¥100',
    targetType: 'money',
    targetVal: 100,
    check: (stats) => (stats.totalSavedMoney || 0) >= 100
  },
  {
    id: 'saved_500',
    name: '自律小金',
    tier: 'purple',
    tierTag: '稀有',
    tagColor: '#c084fc',
    badgeBg: 'rgba(192, 132, 252, 0.16)',
    glowColor: 'rgba(192, 132, 252, 0.55)',
    borderColor: 'rgba(192, 132, 252, 0.65)',
    category: '自律金库',
    icon: '💰',
    description: '累计节省烟资达 ¥500，自律存钱罐大丰收，轻松兑换全场尊享特效',
    conditionDesc: '累计节省烟钱达到 ¥500',
    targetType: 'money',
    targetVal: 500,
    check: (stats) => (stats.totalSavedMoney || 0) >= 500
  },
  {
    id: 'saved_1000',
    name: '千元逆袭',
    tier: 'gold',
    tierTag: '史诗',
    tagColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    borderColor: 'rgba(245, 158, 11, 0.75)',
    category: '自律金库',
    icon: '📱',
    description: '累计节省烟钱突破 ¥1000，少抽烟真正省出了一台大件新数码',
    conditionDesc: '累计节省烟钱达到 ¥1000',
    targetType: 'money',
    targetVal: 1000,
    check: (stats) => (stats.totalSavedMoney || 0) >= 1000
  },

  // ================= 4. 赛博玩家 · 妙趣探索 (工坊与玩法彩蛋) =================
  {
    id: 'vfx_explorer',
    name: '灵烟初探',
    tier: 'blue',
    tierTag: '进阶',
    tagColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    borderColor: 'rgba(56, 189, 248, 0.55)',
    category: '赛博玩家',
    icon: '✨',
    description: '探索特效工坊，成功装配任意一款高阶赛博烟雾特效',
    conditionDesc: '装配任意 1 款高阶特效',
    targetType: 'vfx',
    targetVal: 1,
    check: (stats) => (stats.unlockedEffectsCount && stats.unlockedEffectsCount > 3) || !!stats.hasCustomEffect
  },
  {
    id: 'dragon_caller',
    name: '龙凤呈祥',
    tier: 'red',
    tierTag: '传说',
    tagColor: '#f43f5e',
    badgeBg: 'rgba(244, 63, 94, 0.18)',
    glowColor: 'rgba(244, 63, 94, 0.75)',
    borderColor: 'rgba(244, 63, 94, 0.85)',
    category: '赛博玩家',
    icon: '🔥',
    description: '登峰造极，在主页成功召唤盘旋神龙腾空或南明离火神凰展翅',
    conditionDesc: '体验或装配龙腾九天或凤舞九天',
    targetType: 'mythic_vfx',
    targetVal: 1,
    check: (stats) => !!stats.hasSummonedMythic || (Array.isArray(stats.unlockedEffects) && (stats.unlockedEffects.includes('dragon_breath') || stats.unlockedEffects.includes('phoenix_nirvana')))
  }
];

export function checkAchievementsToUnlock(stats, currentlyUnlockedIds = []) {
  const newlyUnlocked = [];
  for (const achievement of ACHIEVEMENTS) {
    if (!currentlyUnlockedIds.includes(achievement.id) && achievement.check(stats)) {
      newlyUnlocked.push(achievement.id);
    }
  }
  return newlyUnlocked;
}

export function getAchievementById(id) {
  return ACHIEVEMENTS.find(item => item.id === id);
}

/**
 * 计算单个成就的实时进度与百分比
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
  } else {
    // 玩法交互类
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
