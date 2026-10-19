// configs/smokeEffects.js
import { vipService } from '../services/vipService.js';
import { 
  EFFECT_RING_ICON_SVG, 
  EFFECT_HEART_ICON_SVG, 
  EFFECT_GOLD_ICON_SVG, 
  EFFECT_GALAXY_ICON_SVG, 
  EFFECT_BLESSING_ICON_SVG, 
  BUDDHA_ICON_SVG, 
  PHOENIX_ICON_SVG, 
  FAIRY_ICON_SVG, 
  DRAGON_ICON_SVG 
} from '../utils/vectorIcons.js';

/**
 * 赛博烟雾特效工坊元数据与解锁配置 (Tencent Games 顶级品质 · 情绪价值巅峰典藏)
 * 进阶排序逻辑（从返璞纯享到炽金神品）：
 * 1. 【原真纯享 · 极简返璞（白阶入门）】：经典空灵烟圈 (0支 · 初始默认)
 * 2. 【浪漫至死 · 甜蜜暴击（粉阶进阶）】：双心微芒 · 丘比特粉钻双心 (30支 · 约1.5包)
 * 3. 【泼天富贵 · 顶奢黑金（黑金史诗）】：金箔微雨 · 24K真金微雨流光 (80支 · 约4包)
 * 4. 【宇宙浩瀚 · 璀璨星河（星芒史诗）】：璀璨星河 · 双旋臂幽蓝星云 (180支 · 约1~2周)
 * 5. 【万福金印 · 功德护体（朱金传说）】：迎祥福印 · 烫金浮雕祈福印 (360支 · 约3周)
 * 6. 【九五之尊 · 帝王气运（神品神兽）】：金龙游云 · 曜金神龙戏珠 (800支 · 约1.5个月)
 * 7. 【青云直上 · 乘风破浪（天阶祥瑞）】：紫霄凌云 · 步步高升天河 (1200支 · 约2个月)
 * 8. 【梵天圣境 · 慈悲普度（佛瑞神品）】：佛光普照 · 梵天千叶金莲 (1800支 · 约3个月)
 * 9. 【绝境逆风 · 涅槃浴火（至臻神品）】：涅槃重光 · 赤金神凤降世 (2500支 · 约4~5个月)
 * 10.【瑶池仙境 · 天女散花（传世巅峰）】：七仙降世 · 霓裳羽衣散花 (3650支 · 满1整年年度丰碑)
 */
export const SMOKE_EFFECTS = [
  // ================= 1. 原真纯享 · 极简返璞（白阶入门 · 0支） =================
  {
    id: 'ring_classic',
    name: '经典烟圈',
    shortName: '经典烟圈',
    icon: '⭕',
    iconImage: EFFECT_RING_ICON_SVG,
    category: '经典白雾',
    categoryTag: '经典',
    tagColor: '#94a3b8',
    badgeBg: 'rgba(148, 163, 184, 0.15)',
    badgeBorder: 'rgba(148, 163, 184, 0.35)',
    price: 0,
    priceDisplay: '免费初始',
    requiredCount: 0,
    requiredSavings: 0,
    description: '3D 拟天空灵吐烟圈，向前上方优雅滑行扩张，柔和散开，回归最真实的呼吸感',
    themeColor: '#93c5fd',
    glowColor: 'rgba(147, 197, 253, 0.45)',
    accentBorder: 'rgba(147, 197, 253, 0.4)',
    renderType: 'ring'
  },

  // ================= 2. 浪漫至死 · 甜蜜暴击（粉阶进阶 · 30支） =================
  {
    id: 'heart_double',
    name: '双心微芒',
    shortName: '双心微芒',
    icon: '💖',
    iconImage: EFFECT_HEART_ICON_SVG,
    category: '浪漫温情',
    categoryTag: '温情',
    tagColor: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.18)',
    badgeBorder: 'rgba(236, 72, 153, 0.45)',
    price: 6,
    priceDisplay: '替烟30支解锁',
    requiredCount: 30,
    requiredSavings: 37.5,
    description: '轻柔粉钻双心相拥升腾，垂落点点微芒星尘，浪漫细腻',
    themeColor: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.75)',
    accentBorder: '#ec4899',
    renderType: 'heart_double'
  },

  // ================= 3. 泼天富贵 · 顶奢黑金（黑金史诗 · 80支） =================
  {
    id: 'gold_stardust',
    name: '金箔微雨',
    shortName: '金箔微雨',
    icon: '✨',
    iconImage: EFFECT_GOLD_ICON_SVG,
    category: '典雅黑金',
    categoryTag: '金辉',
    tagColor: '#fbbf24',
    badgeBg: 'rgba(251, 191, 36, 0.22)',
    badgeBorder: 'rgba(245, 158, 11, 0.55)',
    price: 15,
    priceDisplay: '替烟80支解锁',
    requiredCount: 80,
    requiredSavings: 100.0,
    description: '暗黑丝绒烟雾升腾，核心绽放细腻真金流光，如微雨般静谧飘落',
    themeColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.85)',
    accentBorder: '#f59e0b',
    renderType: 'gold_stardust'
  },

  // ================= 4. 宇宙浩瀚 · 璀璨星河（星芒史诗 · 180支） =================
  {
    id: 'galaxy_stars',
    name: '璀璨星河',
    shortName: '璀璨星河',
    icon: '⭐',
    iconImage: EFFECT_GALAXY_ICON_SVG,
    category: '深空星辰',
    categoryTag: '星河',
    tagColor: '#67e8f9',
    badgeBg: 'rgba(103, 232, 249, 0.18)',
    badgeBorder: 'rgba(56, 189, 248, 0.45)',
    price: 38,
    priceDisplay: '替烟180支解锁',
    requiredCount: 180,
    requiredSavings: 225.0,
    description: '双旋臂幽蓝星云缓旋升腾，点点微星凌空点亮，深邃宁静',
    themeColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.80)',
    accentBorder: '#38bdf8',
    renderType: 'galaxy_stars'
  },

  // ================= 5. 万福金印 · 功德护体（朱金传说 · 360支） =================
  {
    id: 'blessing_runes',
    name: '迎祥福印',
    shortName: '迎祥福印',
    icon: '🧧',
    iconImage: EFFECT_BLESSING_ICON_SVG,
    category: '吉庆祥瑞',
    categoryTag: '福印',
    tagColor: '#fde047',
    badgeBg: 'rgba(253, 224, 71, 0.18)',
    badgeBorder: 'rgba(234, 179, 8, 0.45)',
    price: 75,
    priceDisplay: '替烟360支解锁',
    requiredCount: 360,
    requiredSavings: 450.0,
    description: '沉香暖金凝结为浮雕烫金吉印【福·财·顺·康·喜】，每次吐雾皆是舒心祈福',
    themeColor: '#fef08a',
    glowColor: 'rgba(254, 240, 138, 0.88)',
    accentBorder: '#eab308',
    renderType: 'blessing_runes'
  },

  // ================= 6. 九五之尊 · 帝王气运（神品神兽 · 800支） =================
  {
    id: 'dragon_breath',
    name: '金龙游云',
    shortName: '金龙游云',
    icon: '龙',
    iconImage: DRAGON_ICON_SVG,
    category: '东方祥瑞',
    categoryTag: '真龙',
    tagColor: '#fef08a',
    badgeBg: 'rgba(254, 240, 138, 0.20)',
    badgeBorder: 'rgba(234, 179, 8, 0.50)',
    price: 125,
    priceDisplay: '替烟800支解锁',
    requiredCount: 800,
    requiredSavings: 1000.0,
    description: '曜金真龙破云游动，祥云缭绕，见证百支克制与自律成就',
    themeColor: '#fef08a',
    glowColor: 'rgba(254, 240, 138, 0.88)',
    accentBorder: '#eab308',
    renderType: 'dragon_breath'
  },

  // ================= 7. 青云直上 · 乘风破浪（天阶祥瑞 · 1200支） =================
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
    price: 150,
    priceDisplay: '替烟1200支解锁',
    requiredCount: 1200,
    requiredSavings: 1500.0,
    description: '赤金与炽炎双螺旋天河直上九霄，步步高升·大吉大利金字凌空盘旋，破晓金光直透云海',
    themeColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.88)',
    accentBorder: '#f59e0b',
    renderType: 'auspicious_river'
  },

  // ================= 8. 梵天圣境 · 慈悲普度（佛瑞神品 · 1800支） =================
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
    price: 180,
    priceDisplay: '替烟1800支解锁',
    requiredCount: 1800,
    requiredSavings: 2250.0,
    description: '莫高窟火焰水滴菩提背光与180度破晓晨曦佛光漫照，3D盛放千叶宝相金莲座、盘旋舍利天梯普度万灵',
    themeColor: '#fde047',
    glowColor: 'rgba(253, 224, 71, 0.92)',
    accentBorder: '#f59e0b',
    renderType: 'buddha_light'
  },

  // ================= 9. 绝境逆风 · 涅槃浴火（至臻神品 · 2500支） =================
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
    price: 220,
    priceDisplay: '替烟2500支解锁',
    requiredCount: 2500,
    requiredSavings: 3125.0,
    description: '百鸟之王赤金神凰浴火展翼，烈焰回旋天际，流光凤羽洒下南明离火星尘',
    themeColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.88)',
    accentBorder: '#f97316',
    renderType: 'phoenix_nirvana'
  },

  // ================= 10. 瑶池仙境 · 天女散花（传世巅峰 · 3650支） =================
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
    priceDisplay: '替烟3650支解锁',
    requiredCount: 3650,
    requiredSavings: 4562.5,
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
  // 优雅降级兼容已精简下架的特效，无缝平滑回退
  if (id === 'bagua_taichi') id = 'buddha_light';
  if (id === 'grand_fireworks') id = 'gold_stardust';
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
