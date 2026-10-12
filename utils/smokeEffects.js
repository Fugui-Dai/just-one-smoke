// utils/smokeEffects.js

/**
 * 赛博烟雾特效工坊元数据与解锁配置 (Tencent Games 顶级品质 · 情绪价值巅峰典藏)
 * 进阶排序逻辑（从返璞纯享到炽金神品）：
 * 1. 【原真纯享 · 极简返璞（白阶入门）】：经典空灵烟圈 (唯一的极简大师白雾)
 * 2. 【浪漫至死 · 甜蜜暴击（粉阶进阶）】：一见倾心 · 丘比特星钻双心
 * 3. 【尊贵鸿运 · 帝王天青（紫阶稀有）】：紫气东来 · 宣德九龙盘香
 * 4. 【空灵治愈 · 梦幻星幕（蓝阶稀有）】：极光星海 · 冰岛幻彩星穹
 * 5. 【泼天富贵 · 顶奢黑金（黑金史诗）】：曜世黑金 · 24K暴富金雨 (情绪价值巅峰)
 * 6. 【宇宙浩瀚 · 许愿流星（星芒史诗）】：星穹浩瀚 · 璀璨流星银河
 * 7. 【万福金印 · 功德护体（朱金传说）】：金玉满堂 · 迎祥纳福宝印
 * 8. 【华夏欢庆 · 终极盛典（赤炎传说）】：华夏盛世 · 万家璀璨烟火
 * 9. 【青云直上 · 乘风破浪（天阶祥瑞）】：紫霄凌云 · 步步高升天河
 * 10.【道韵化境 · 掌控乾坤（神品玄道）】：乾坤八卦 · 紫微天穹大阵
 * 11.【梵天圣境 · 慈悲普度（神品佛瑞）】：佛光普照 · 梵天千叶金莲
 * 12.【九五之尊 · 帝王气运（至臻神品）】：真龙降世 · 曜金神龙戏珠
 * 13.【绝境逆风 · 涅槃浴火（至臻神品）】：涅槃重光 · 赤金神凤降世
 */
export const SMOKE_EFFECTS = [
  // ================= 1. 原真纯享 · 极简返璞（白阶入门） =================
  {
    id: 'ring_classic',
    name: '经典空灵烟圈',
    shortName: '经典烟圈',
    icon: '⭕',
    category: '原真纯享',
    categoryTag: '经典白雾',
    tagColor: '#94a3b8',
    badgeBg: 'rgba(148, 163, 184, 0.15)',
    badgeBorder: 'rgba(148, 163, 184, 0.35)',
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

  // ================= 2. 浪漫至死 · 甜蜜暴击（粉阶进阶） =================
  {
    id: 'heart_double',
    name: '一见倾心 · 丘比特星钻双心',
    shortName: '星钻双心',
    icon: '💖',
    category: '浪漫挚爱',
    categoryTag: '表白神器',
    tagColor: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.18)',
    badgeBorder: 'rgba(236, 72, 153, 0.45)',
    price: 6,
    priceDisplay: '¥6 / 替烟3支',
    requiredCount: 3,
    requiredSavings: 3.75,
    description: '金粉丘比特爱神之箭破空贯穿，同心粉钻与玫瑰金双心旋转相拥，漫天垂落粉晶星屑与甜蜜微光',
    themeColor: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.75)',
    accentBorder: '#ec4899',
    renderType: 'heart_double'
  },

  // ================= 3. 尊贵鸿运 · 帝王天青（紫阶稀有） =================
  {
    id: 'purple_zen',
    name: '紫气东来 · 宣德九龙盘香',
    shortName: '紫气东来',
    icon: '🟣',
    category: '东方至尊',
    categoryTag: '鸿运当头',
    tagColor: '#c084fc',
    badgeBg: 'rgba(192, 132, 252, 0.18)',
    badgeBorder: 'rgba(168, 85, 247, 0.45)',
    price: 12,
    priceDisplay: '¥12 / 替烟5支',
    requiredCount: 5,
    requiredSavings: 6.25,
    description: '宣德御炉同款帝王紫与秘色天青双龙盘旋，祥云回纹若隐若现，烫金沉香云雾直贯青云',
    themeColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.75)',
    accentBorder: '#a855f7',
    renderType: 'purple_zen'
  },

  // ================= 4. 空灵治愈 · 梦幻星幕（蓝阶稀有） =================
  {
    id: 'aurora_nebula',
    name: '极光星海 · 冰岛幻彩星穹',
    shortName: '极光星海',
    icon: '🌌',
    category: '赛博幻境',
    categoryTag: '空灵治愈',
    tagColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.18)',
    badgeBorder: 'rgba(56, 189, 248, 0.45)',
    price: 18,
    priceDisplay: '¥18 / 替烟15支',
    requiredCount: 15,
    requiredSavings: 18.75,
    description: '北纬66度翡翠极光与深空冰蓝丝缎光幕交融翻滚，星云深处脉冲星钻明灭呼吸，如置身幻彩星海',
    themeColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.75)',
    accentBorder: '#38bdf8',
    renderType: 'aurora_nebula'
  },

  // ================= 5. 泼天富贵 · 顶奢黑金（黑金史诗） =================
  {
    id: 'gold_stardust',
    name: '曜世黑金 · 24K暴富金雨',
    shortName: '暴富金雨',
    icon: '✨',
    category: '顶奢名流',
    categoryTag: '泼天富贵',
    tagColor: '#fbbf24',
    badgeBg: 'rgba(251, 191, 36, 0.22)',
    badgeBorder: 'rgba(245, 158, 11, 0.55)',
    price: 28,
    priceDisplay: '¥28 / 替烟10支',
    requiredCount: 10,
    requiredSavings: 12.5,
    description: '黑曜石丝绒烟雾席卷苍穹，核心瞬间爆发 24K 纯金箔与元宝金币流光暴风雨，金光万丈财运亨通',
    themeColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.85)',
    accentBorder: '#f59e0b',
    renderType: 'gold_stardust'
  },

  // ================= 6. 宇宙浩瀚 · 许愿流星（星芒史诗） =================
  {
    id: 'galaxy_stars',
    name: '星穹浩瀚 · 璀璨流星银河',
    shortName: '星穹流星',
    icon: '⭐',
    category: '宇宙典藏',
    categoryTag: '许愿成真',
    tagColor: '#67e8f9',
    badgeBg: 'rgba(103, 232, 249, 0.18)',
    badgeBorder: 'rgba(56, 189, 248, 0.45)',
    price: 0,
    priceDisplay: '免费尊享',
    requiredCount: 0,
    requiredSavings: 0,
    description: '白金彗星破空划出破晓尾迹，二十四颗八芒钻星凌空点亮，深邃星河伴随呼吸星尘恒久流淌',
    themeColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.80)',
    accentBorder: '#38bdf8',
    renderType: 'galaxy_stars'
  },

  // ================= 7. 万福金印 · 功德护体（朱金传说） =================
  {
    id: 'blessing_runes',
    name: '金玉满堂 · 迎祥纳福宝印',
    shortName: '迎祥纳福',
    icon: '🧧',
    category: '盛世万福',
    categoryTag: '功德福报',
    tagColor: '#fde047',
    badgeBg: 'rgba(253, 224, 71, 0.18)',
    badgeBorder: 'rgba(234, 179, 8, 0.45)',
    price: 0,
    priceDisplay: '免费尊享',
    requiredCount: 0,
    requiredSavings: 0,
    description: '沉香暖金凝结为立体浮雕烫金吉印【福·财·顺·康·暴富·喜】，金丝如意璎珞与护身光环护佑周全',
    themeColor: '#fef08a',
    glowColor: 'rgba(254, 240, 138, 0.88)',
    accentBorder: '#eab308',
    renderType: 'blessing_runes'
  },

  // ================= 8. 华夏欢庆 · 终极盛典（赤炎传说） =================
  {
    id: 'grand_fireworks',
    name: '华夏盛世 · 万家璀璨烟火',
    shortName: '万家烟火',
    icon: '🎆',
    category: '欢庆典藏',
    categoryTag: '普天同庆',
    tagColor: '#fb7185',
    badgeBg: 'rgba(251, 113, 133, 0.18)',
    badgeBorder: 'rgba(244, 63, 94, 0.45)',
    price: 0,
    priceDisplay: '免费尊享',
    requiredCount: 0,
    requiredSavings: 0,
    description: '金芒火箭尖啸腾空直冲九霄，凌空绽放三级五彩牡丹锦簇，千丝垂杨金雨倾泻长夜',
    themeColor: '#fb7185',
    glowColor: 'rgba(251, 113, 133, 0.85)',
    accentBorder: '#f43f5e',
    renderType: 'grand_fireworks'
  },

  // ================= 9. 青云直上 · 乘风破浪（天阶祥瑞） =================
  {
    id: 'auspicious_river',
    name: '紫霄凌云 · 步步高升天河',
    shortName: '步步高升',
    icon: '✨',
    category: '东方祥瑞',
    categoryTag: '青云直上',
    tagColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    badgeBorder: 'rgba(245, 158, 11, 0.45)',
    price: 0,
    priceDisplay: '免费尊享',
    requiredCount: 0,
    requiredSavings: 0,
    description: '赤金与炽炎双螺旋天河直上九霄，步步高升·大吉大利金字凌空盘旋，破晓金光直透云海',
    themeColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.88)',
    accentBorder: '#f59e0b',
    renderType: 'auspicious_river'
  },

  // ================= 10. 道韵化境 · 掌控乾坤（神品玄道） =================
  {
    id: 'bagua_taichi',
    name: '乾坤八卦 · 紫微天穹大阵',
    shortName: '紫微八卦',
    icon: '☯️',
    category: '玄道至尊',
    categoryTag: '镇煞化境',
    tagColor: '#67e8f9',
    badgeBg: 'rgba(103, 232, 249, 0.18)',
    badgeBorder: 'rgba(56, 189, 248, 0.50)',
    price: 0,
    priceDisplay: '免费尊享',
    requiredCount: 0,
    requiredSavings: 0,
    description: '320px 巨幅紫微天穹大阵恢弘铺展，昆仑玉与紫曜双鱼流转，八荒剑芒、六十四卦与二十八星宿激荡苍穹',
    themeColor: '#67e8f9',
    glowColor: 'rgba(103, 232, 249, 0.88)',
    accentBorder: '#38bdf8',
    renderType: 'bagua_taichi'
  },

  // ================= 11. 梵天圣境 · 慈悲普度（神品佛瑞） =================
  {
    id: 'buddha_light',
    name: '佛光普照 · 梵天千叶金莲',
    shortName: '佛光金莲',
    icon: '佛',
    iconImage: '/images/icons/buddha.png',
    category: '梵天圣境',
    categoryTag: '万丈光芒',
    tagColor: '#fde047',
    badgeBg: 'rgba(253, 224, 71, 0.20)',
    badgeBorder: 'rgba(251, 191, 36, 0.55)',
    price: 0,
    priceDisplay: '免费尊享',
    requiredCount: 0,
    requiredSavings: 0,
    description: '峨眉金顶五色佛光与十六道万丈日光破晓普照，三层千叶宝相金莲步步盛开，梵音真言与八宝金轮普度众生',
    themeColor: '#fde047',
    glowColor: 'rgba(253, 224, 71, 0.92)',
    accentBorder: '#f59e0b',
    renderType: 'buddha_light'
  },

  // ================= 12. 九五之尊 · 帝王气运（至臻神品） =================
  {
    id: 'dragon_breath',
    name: '真龙降世 · 曜金神龙戏珠',
    shortName: '曜金神龙',
    icon: '🐉',
    category: '帝王九五',
    categoryTag: '神威降临',
    tagColor: '#fef08a',
    badgeBg: 'rgba(254, 240, 138, 0.20)',
    badgeBorder: 'rgba(234, 179, 8, 0.50)',
    price: 0,
    priceDisplay: '免费尊享',
    requiredCount: 0,
    requiredSavings: 0,
    description: '纯正五爪赤金神龙破雾盘旋，赤金火珠领衔升腾，万道龙鳞金光与祥云漫天激荡',
    themeColor: '#fef08a',
    glowColor: 'rgba(254, 240, 138, 0.88)',
    accentBorder: '#eab308',
    renderType: 'dragon_breath'
  },

  // ================= 13. 绝境逆风 · 涅槃浴火（至臻神品） =================
  {
    id: 'phoenix_nirvana',
    name: '涅槃重光 · 赤金神凤降世',
    shortName: '赤金神凤',
    icon: '凤',
    iconImage: '/images/icons/phoenix.png',
    category: '涅槃重生',
    categoryTag: '百鸟朝凤',
    tagColor: '#fb923c',
    badgeBg: 'rgba(251, 146, 60, 0.20)',
    badgeBorder: 'rgba(249, 115, 22, 0.50)',
    price: 0,
    priceDisplay: '免费尊享',
    requiredCount: 0,
    requiredSavings: 0,
    description: '百鸟之王赤金神凰浴火展翼，烈焰回旋天际，流光凤羽洒下南明离火星尘',
    themeColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.88)',
    accentBorder: '#f97316',
    renderType: 'phoenix_nirvana'
  }
];

export const DEFAULT_SMOKE_EFFECT = SMOKE_EFFECTS.find(e => e.id === 'ring_classic') || SMOKE_EFFECTS[0];

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

export function getAllSmokeEffects() {
  return SMOKE_EFFECTS;
}
