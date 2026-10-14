// configs/smokeEffects.js
import { vipService } from '../services/vipService.js';
import { LOTUS_ICON_SVG, BUDDHA_ICON_SVG, PHOENIX_ICON_SVG, FAIRY_ICON_SVG, DRAGON_ICON_SVG } from '../utils/vectorIcons.js';

/**
 * 赛博烟雾特效工坊元数据与解锁配置 (Tencent Games 顶级品质 · 情绪价值巅峰典藏)
 * 进阶排序逻辑（从返璞纯享到炽金神品）：
 * 1. 【原真纯享 · 极简返璞（白阶入门）】：经典空灵烟圈 (唯一的极简大师白雾)
 * 2. 【浪漫至死 · 甜蜜暴击（粉阶进阶）】：一见倾心 · 丘比特星钻双心
 * 3. 【东方禅意 · 宁心静气（翡翠青莲）】：青莲化境 · 步步生莲
 * 4. 【泼天富贵 · 顶奢黑金（黑金史诗）】：曜世黑金 · 24K暴富金雨 (情绪价值巅峰)
 * 5. 【宇宙浩瀚 · 许愿流星（星芒史诗）】：星穹浩瀚 · 璀璨流星银河
 * 6. 【万福金印 · 功德护体（朱金传说）】：金玉满堂 · 迎祥纳福宝印
 * 7. 【华夏欢庆 · 终极盛典（赤炎传说）】：华夏盛世 · 万家璀璨烟火
 * 8. 【青云直上 · 乘风破浪（天阶祥瑞）】：紫霄凌云 · 步步高升天河
 * 9. 【道韵化境 · 掌控乾坤（神品玄道）】：乾坤八卦 · 紫微天穹大阵
 * 10.【梵天圣境 · 慈悲普度（神品佛瑞）】：佛光普照 · 梵天千叶金莲
 * 11.【九五之尊 · 帝王气运（至臻神品）】：真龙降世 · 曜金神龙戏珠
 * 12.【绝境逆风 · 涅槃浴火（至臻神品）】：涅槃重光 · 赤金神凤降世
 * 13.【瑶池仙境 · 天女散花（传世神品）】：七仙降世 · 霓裳羽衣散花
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

  // ================= 3. 东方禅意 · 宁心静气（翡翠青莲） =================
  {
    id: 'lotus_zen',
    name: '青莲化境 · 步步生莲',
    shortName: '步步生莲',
    icon: '莲',
    iconImage: LOTUS_ICON_SVG,
    category: '东方禅意',
    categoryTag: '心静如水',
    tagColor: '#34d399',
    badgeBg: 'rgba(52, 211, 153, 0.18)',
    badgeBorder: 'rgba(16, 185, 129, 0.45)',
    price: 8,
    priceDisplay: '替烟6支解锁',
    requiredCount: 6,
    requiredSavings: 7.5,
    description: '凝脂青碧宝莲破晓初绽，九瓣祥和花瓣自云烟中层层舒展，晨露甘霖与温润金蕊微光流转，烦恼随烟尽散',
    themeColor: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.85)',
    accentBorder: '#10b981',
    renderType: 'lotus_zen'
  },

  // ================= 4. 泼天富贵 · 顶奢黑金（黑金史诗） =================
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
    price: 15,
    priceDisplay: '替烟12支解锁',
    requiredCount: 12,
    requiredSavings: 15.0,
    description: '黑曜石丝绒烟雾席卷苍穹，核心瞬间爆发 24K 纯金箔与元宝金币流光暴风雨，金光万丈财运亨通',
    themeColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.85)',
    accentBorder: '#f59e0b',
    renderType: 'gold_stardust'
  },

  // ================= 5. 宇宙浩瀚 · 许愿流星（星芒史诗） =================
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
    price: 25,
    priceDisplay: '替烟20支解锁',
    requiredCount: 20,
    requiredSavings: 25.0,
    description: '白金彗星破空划出破晓尾迹，二十四颗八芒钻星凌空点亮，深邃星河伴随呼吸星尘恒久流淌',
    themeColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.80)',
    accentBorder: '#38bdf8',
    renderType: 'galaxy_stars'
  },

  // ================= 6. 万福金印 · 功德护体（朱金传说） =================
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
    price: 38,
    priceDisplay: '替烟30支解锁',
    requiredCount: 30,
    requiredSavings: 37.5,
    description: '沉香暖金凝结为立体浮雕烫金吉印【福·财·顺·康·暴富·喜】，金丝如意璎珞与护身光环护佑周全',
    themeColor: '#fef08a',
    glowColor: 'rgba(254, 240, 138, 0.88)',
    accentBorder: '#eab308',
    renderType: 'blessing_runes'
  },

  // ================= 7. 华夏欢庆 · 终极盛典（赤炎传说） =================
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
    price: 56,
    priceDisplay: '替烟45支解锁',
    requiredCount: 45,
    requiredSavings: 56.25,
    description: '金芒火箭尖啸腾空直冲九霄，凌空绽放三级五彩牡丹锦簇，千丝垂杨金雨倾泻长夜',
    themeColor: '#fb7185',
    glowColor: 'rgba(251, 113, 133, 0.85)',
    accentBorder: '#f43f5e',
    renderType: 'grand_fireworks'
  },

  // ================= 8. 青云直上 · 乘风破浪（天阶祥瑞） =================
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
    price: 75,
    priceDisplay: '替烟60支解锁',
    requiredCount: 60,
    requiredSavings: 75.0,
    description: '赤金与炽炎双螺旋天河直上九霄，步步高升·大吉大利金字凌空盘旋，破晓金光直透云海',
    themeColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.88)',
    accentBorder: '#f59e0b',
    renderType: 'auspicious_river'
  },

  // ================= 9. 道韵化境 · 掌控乾坤（神品玄道） =================
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
    price: 100,
    priceDisplay: '替烟80支解锁',
    requiredCount: 80,
    requiredSavings: 100.0,
    description: '320px 巨幅紫微天穹大阵恢弘铺展，昆仑玉与紫曜双鱼流转，八荒剑芒、六十四卦与二十八星宿激荡苍穹',
    themeColor: '#67e8f9',
    glowColor: 'rgba(103, 232, 249, 0.88)',
    accentBorder: '#38bdf8',
    renderType: 'bagua_taichi'
  },

  // ================= 10. 梵天圣境 · 慈悲普度（神品佛瑞） =================
  {
    id: 'buddha_light',
    name: '佛光普照 · 梵天千叶金莲',
    shortName: '佛光金莲',
    icon: '佛',
    iconImage: BUDDHA_ICON_SVG,
    category: '梵天圣境',
    categoryTag: '万丈光芒',
    tagColor: '#fde047',
    badgeBg: 'rgba(253, 224, 71, 0.20)',
    badgeBorder: 'rgba(251, 191, 36, 0.55)',
    price: 125,
    priceDisplay: '替烟100支解锁',
    requiredCount: 100,
    requiredSavings: 125.0,
    description: '峨眉金顶五色佛光与十六道万丈日光破晓普照，三层千叶宝相金莲步步盛开，梵音真言与八宝金轮普度众生',
    themeColor: '#fde047',
    glowColor: 'rgba(253, 224, 71, 0.92)',
    accentBorder: '#f59e0b',
    renderType: 'buddha_light'
  },

  // ================= 11. 九五之尊 · 帝王气运（至臻神品） =================
  {
    id: 'dragon_breath',
    name: '飞龙在天 · 曜金祥云真龙',
    shortName: '曜金真龙',
    icon: '龙',
    iconImage: DRAGON_ICON_SVG,
    category: '帝王九五',
    categoryTag: '飞龙在天',
    tagColor: '#fef08a',
    badgeBg: 'rgba(254, 240, 138, 0.20)',
    badgeBorder: 'rgba(234, 179, 8, 0.50)',
    price: 160,
    priceDisplay: '替烟130支解锁',
    requiredCount: 130,
    requiredSavings: 162.5,
    description: '纯正五爪曜金真龙昂首破云冲霄，万重祥云缭绕龙身，龙吐九霄瑞气与漫天龙鳞金雨',
    themeColor: '#fef08a',
    glowColor: 'rgba(254, 240, 138, 0.88)',
    accentBorder: '#eab308',
    renderType: 'dragon_breath'
  },

  // ================= 12. 绝境逆风 · 涅槃浴火（至臻神品） =================
  {
    id: 'phoenix_nirvana',
    name: '涅槃重光 · 赤金神凤降世',
    shortName: '赤金神凤',
    icon: '凤',
    iconImage: PHOENIX_ICON_SVG,
    category: '涅槃重生',
    categoryTag: '百鸟朝凤',
    tagColor: '#fb923c',
    badgeBg: 'rgba(251, 146, 60, 0.20)',
    badgeBorder: 'rgba(249, 115, 22, 0.50)',
    price: 200,
    priceDisplay: '替烟160支解锁',
    requiredCount: 160,
    requiredSavings: 200.0,
    description: '百鸟之王赤金神凰浴火展翼，烈焰回旋天际，流光凤羽洒下南明离火星尘',
    themeColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.88)',
    accentBorder: '#f97316',
    renderType: 'phoenix_nirvana'
  },

  // ================= 13. 瑶池仙境 · 天女散花（传世神品） =================
  {
    id: 'seven_fairies',
    name: '七仙降世 · 霓裳羽衣散花',
    shortName: '七仙羽衣',
    icon: '仙',
    iconImage: FAIRY_ICON_SVG,
    category: '瑶池仙境',
    categoryTag: '霓裳羽衣',
    tagColor: '#f472b6',
    badgeBg: 'rgba(244, 114, 182, 0.20)',
    badgeBorder: 'rgba(236, 72, 153, 0.50)',
    price: 250,
    priceDisplay: '替烟200支解锁',
    requiredCount: 200,
    requiredSavings: 250.0,
    description: '七彩飞天彩带在云雾中曼妙起舞，瑶池仙乐涟漪荡漾，天女散花漫天琼花与仙桃纷飞飘落',
    themeColor: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.90)',
    accentBorder: '#ec4899',
    renderType: 'seven_fairies'
  }
];

export const DEFAULT_SMOKE_EFFECT = SMOKE_EFFECTS.find(e => e.id === 'ring_classic') || SMOKE_EFFECTS[0];

export function getSmokeEffectById(id) {
  if (!id) return DEFAULT_SMOKE_EFFECT;
  return SMOKE_EFFECTS.find(e => e.id === id) || DEFAULT_SMOKE_EFFECT;
}

export function isSmokeEffectUnlocked(id, totalSubstituted = 0, unlockedList = []) {
  try {
    if (vipService && vipService.isVip()) return true;
  } catch (e) {}
  if (Array.isArray(unlockedList) && unlockedList.includes(id)) return true;
  const effect = getSmokeEffectById(id);
  if (!effect) return false;
  // 基础款与免费尊享款初始默认解锁
  if (effect.price === 0 || effect.requiredCount === 0) return true;
  // 达成累计替烟数量即可自动免费获得
  return totalSubstituted >= effect.requiredCount;
}
