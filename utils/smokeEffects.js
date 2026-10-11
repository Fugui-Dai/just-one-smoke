// utils/smokeEffects.js

/**
 * 赛博烟雾特效工坊元数据与解锁配置 (Tencent Games 体验总监阶梯进阶级)
 * 进阶排序逻辑（从低级入门到终极殿堂）：
 * 1. 【原真纯享 · 极简返璞（白阶入门）】：舒缓白雾 ➔ 袅袅青烟 ➔ 经典烟圈
 * 2. 【趣味社交 · 浪漫互动（粉阶进阶）】：双爱心圈 (替烟3支)
 * 3. 【东方尊崇 · 潮流幻彩（蓝紫阶稀有）】：紫气东来 (替烟5支) ➔ 极光星云 (替烟15支)
 * 4. 【顶奢名流 · 梦幻星穹（金阶史诗）】：黑金流沙 (替烟10支) ➔ 漫天繁星 (星愿)
 * 5. 【盛世欢庆 · 东方祈福（红金阶传说）】：福愿金墨 (祈福) ➔ 盛世华彩 (烟花)
 * 6. 【殿堂至尊 · 东方神话（炽金神品典藏）】：步步高升 (天阶) ➔ 龙腾九天 (典藏) ➔ 凤舞九天 (神品)
 */
export const SMOKE_EFFECTS = [
  // ================= 1. 基础纯享 · 原真素雅（入门白阶） =================
  {
    id: 'cloud_dense',
    name: '舒缓白雾',
    shortName: '舒缓白雾',
    icon: '☁️',
    category: '基础纯享',
    categoryTag: '纯享',
    tagColor: '#94a3b8',
    badgeBg: 'rgba(148, 163, 184, 0.15)',
    badgeBorder: 'rgba(148, 163, 184, 0.35)',
    price: 0,
    priceDisplay: '免费初始',
    requiredCount: 0,
    requiredSavings: 0,
    description: '大团柔和纯净烟雾，悠然漫卷慢速升腾至屏幕顶部',
    themeColor: '#e2e8f0',
    glowColor: 'rgba(255, 255, 255, 0.4)',
    accentBorder: 'rgba(255, 255, 255, 0.3)',
    renderType: 'cloud'
  },
  {
    id: 'silk_pure',
    name: '袅袅青烟',
    shortName: '袅袅青烟',
    icon: '💨',
    category: '基础纯享',
    categoryTag: '纯享',
    tagColor: '#94a3b8',
    badgeBg: 'rgba(148, 163, 184, 0.15)',
    badgeBorder: 'rgba(148, 163, 184, 0.35)',
    price: 0,
    priceDisplay: '免费初始',
    requiredCount: 0,
    requiredSavings: 0,
    description: '纤细柔和丝绢烟缕，受虚拟气流自然摇曳慢速升腾至顶部',
    themeColor: '#cbd5e1',
    glowColor: 'rgba(203, 213, 225, 0.35)',
    accentBorder: 'rgba(203, 213, 225, 0.3)',
    renderType: 'silk'
  },
  {
    id: 'ring_classic',
    name: '经典烟圈',
    shortName: '经典烟圈',
    icon: '⭕',
    category: '基础纯享',
    categoryTag: '经典',
    tagColor: '#60a5fa',
    badgeBg: 'rgba(96, 165, 250, 0.15)',
    badgeBorder: 'rgba(96, 165, 250, 0.35)',
    price: 0,
    priceDisplay: '免费初始',
    requiredCount: 0,
    requiredSavings: 0,
    description: '3D 拟天空灵吐烟圈，向前上方优雅滑行扩张，如梦似幻柔和散开',
    themeColor: '#93c5fd',
    glowColor: 'rgba(147, 197, 253, 0.45)',
    accentBorder: 'rgba(147, 197, 253, 0.4)',
    renderType: 'ring'
  },

  // ================= 2. 趣味社交 · 浪漫互动（进阶粉阶） =================
  {
    id: 'heart_double',
    name: '双爱心圈',
    shortName: '双爱心圈',
    icon: '💖',
    category: '浪漫社交',
    categoryTag: '社交',
    tagColor: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.18)',
    badgeBorder: 'rgba(236, 72, 153, 0.45)',
    price: 6,
    priceDisplay: '¥6 / 替烟3支',
    requiredCount: 3,
    requiredSavings: 3.75,
    description: '呼气自动喷吐一大一小互相嵌套的心形同心旋转烟圈',
    themeColor: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.7)',
    accentBorder: '#ec4899',
    renderType: 'heart_double'
  },

  // ================= 3. 东方尊崇 · 潮流幻彩（稀有蓝紫阶） =================
  {
    id: 'purple_zen',
    name: '紫气东来',
    shortName: '紫气东来',
    icon: '🟣',
    category: '东方尊崇',
    categoryTag: '尊享',
    tagColor: '#a855f7',
    badgeBg: 'rgba(168, 85, 247, 0.18)',
    badgeBorder: 'rgba(168, 85, 247, 0.45)',
    price: 12,
    priceDisplay: '¥12 / 替烟5支',
    requiredCount: 5,
    requiredSavings: 6.25,
    description: '暮霭紫与帝王青双色渐变，宣德炉同款卷曲祥云形态',
    themeColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.65)',
    accentBorder: '#a855f7',
    renderType: 'purple_zen'
  },
  {
    id: 'aurora_nebula',
    name: '极光星云',
    shortName: '极光星云',
    icon: '🌌',
    category: '赛博幻彩',
    categoryTag: '潮玩',
    tagColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.18)',
    badgeBorder: 'rgba(56, 189, 248, 0.45)',
    price: 18,
    priceDisplay: '¥18 / 替烟15支',
    requiredCount: 15,
    requiredSavings: 18.75,
    description: '冰岛极光碧绿与幽深星云粉紫交融，自带微光拖尾光晕',
    themeColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.7)',
    accentBorder: '#38bdf8',
    renderType: 'aurora_nebula'
  },

  // ================= 4. 顶奢名流 · 梦幻星穹（史诗金阶） =================
  {
    id: 'gold_stardust',
    name: '黑金流沙',
    shortName: '黑金流沙',
    icon: '✨',
    category: '顶奢名流',
    categoryTag: '顶奢',
    tagColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    badgeBorder: 'rgba(245, 158, 11, 0.45)',
    price: 28,
    priceDisplay: '¥28 / 替烟10支',
    requiredCount: 10,
    requiredSavings: 12.5,
    description: '深黑曜石烟雾中包裹 24K 金箔碎粒微光，随烟气闪耀下落',
    themeColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.75)',
    accentBorder: '#f59e0b',
    renderType: 'gold_stardust'
  },
  {
    id: 'galaxy_stars',
    name: '漫天繁星',
    shortName: '漫天繁星',
    icon: '⭐',
    category: '梦幻星穹',
    categoryTag: '星愿',
    tagColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.18)',
    badgeBorder: 'rgba(56, 189, 248, 0.45)',
    price: 0,
    priceDisplay: '免费尊享',
    requiredCount: 0,
    requiredSavings: 0,
    description: '四芒璀璨星钻晶莹跃动，伴随流星掠影划破长空，如置身浩瀚星海',
    themeColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.75)',
    accentBorder: '#38bdf8',
    renderType: 'galaxy_stars'
  },

  // ================= 5. 盛世欢庆 · 东方祈福（传说红金阶） =================
  {
    id: 'blessing_runes',
    name: '福愿金墨',
    shortName: '福愿金墨',
    icon: '🧧',
    category: '东方祈愿',
    categoryTag: '祈福',
    tagColor: '#eab308',
    badgeBg: 'rgba(234, 179, 8, 0.18)',
    badgeBorder: 'rgba(234, 179, 8, 0.45)',
    price: 0,
    priceDisplay: '免费尊享',
    requiredCount: 0,
    requiredSavings: 0,
    description: '沉香暖金烟雾袅袅升腾，凝结升腾【福】【安】【顺】【吉】【自在】古雅篆金福印与祈愿流光',
    themeColor: '#fef08a',
    glowColor: 'rgba(254, 240, 138, 0.85)',
    accentBorder: '#eab308',
    renderType: 'blessing_runes'
  },
  {
    id: 'grand_fireworks',
    name: '盛世华彩',
    shortName: '盛世华彩',
    icon: '🎆',
    category: '欢庆典藏',
    categoryTag: '烟花',
    tagColor: '#f43f5e',
    badgeBg: 'rgba(244, 63, 94, 0.18)',
    badgeBorder: 'rgba(244, 63, 94, 0.45)',
    price: 0,
    priceDisplay: '免费尊享',
    requiredCount: 0,
    requiredSavings: 0,
    description: '呼气金芒火箭破空升腾，凌空绽放盛世五彩锦簇烟花，垂落漫天金雨',
    themeColor: '#fb7185',
    glowColor: 'rgba(251, 113, 133, 0.75)',
    accentBorder: '#f43f5e',
    renderType: 'grand_fireworks'
  },

  // ================= 6. 殿堂至尊 · 东方神话（炽金神品 · 典藏） =================
  {
    id: 'auspicious_river',
    name: '步步高升',
    shortName: '步步高升',
    icon: '✨',
    category: '东方祥瑞',
    categoryTag: '天阶',
    tagColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    badgeBorder: 'rgba(245, 158, 11, 0.45)',
    price: 0,
    priceDisplay: '免费尊享',
    requiredCount: 0,
    requiredSavings: 0,
    description: '金红祥瑞四字吉语星河螺旋腾空而起，双轨流光缎带环绕，破晓金光直冲云霄',
    themeColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.85)',
    accentBorder: '#f59e0b',
    renderType: 'auspicious_river'
  },
  {
    id: 'dragon_breath',
    name: '龙腾九天',
    shortName: '龙腾九天',
    icon: '🐉',
    category: '帝王典藏',
    categoryTag: '典藏',
    tagColor: '#eab308',
    badgeBg: 'rgba(234, 179, 8, 0.18)',
    badgeBorder: 'rgba(234, 179, 8, 0.45)',
    price: 0,
    priceDisplay: '免费尊享',
    requiredCount: 0,
    requiredSavings: 0,
    description: '浓金祥云破雾而出，五爪神龙破空盘旋，金光星尘螺旋缎带缠绕游动，散落万千龙鳞瀑布',
    themeColor: '#fef08a',
    glowColor: 'rgba(254, 240, 138, 0.85)',
    accentBorder: '#eab308',
    renderType: 'dragon_breath'
  },
  {
    id: 'phoenix_nirvana',
    name: '凤舞九天',
    shortName: '凤舞九天',
    icon: '凤',
    iconImage: '/images/icons/phoenix.png',
    category: '帝王典藏',
    categoryTag: '神品',
    tagColor: '#f97316',
    badgeBg: 'rgba(249, 115, 22, 0.18)',
    badgeBorder: 'rgba(249, 115, 22, 0.45)',
    price: 0,
    priceDisplay: '免费尊享',
    requiredCount: 0,
    requiredSavings: 0,
    description: '赤金神火百鸟之王展翼回旋，周身环绕烈焰回旋光环，流光尾翎洒下南明离火星尘',
    themeColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.85)',
    accentBorder: '#f97316',
    renderType: 'phoenix_nirvana'
  }
];

export const DEFAULT_SMOKE_EFFECT = SMOKE_EFFECTS.find(e => e.id === 'auspicious_river') || SMOKE_EFFECTS[0];

export function getSmokeEffectById(id) {
  if (!id) return DEFAULT_SMOKE_EFFECT;
  return SMOKE_EFFECTS.find(e => e.id === id) || DEFAULT_SMOKE_EFFECT;
}

export function isSmokeEffectUnlocked(id, totalSubstituted = 0, unlockedList = []) {
  if (Array.isArray(unlockedList) && unlockedList.includes(id)) return true;
  const effect = getSmokeEffectById(id);
  if (!effect) return false;
  // 基础款与免费尊享款初始默认解锁
  if (effect.price === 0 || effect.requiredCount === 0) return true;
  // 达成累计替烟数量即可自动免费获得
  return totalSubstituted >= effect.requiredCount;
}
