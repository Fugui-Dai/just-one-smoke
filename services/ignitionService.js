// utils/ignitionService.js
import { storageService } from './storageService.js';
import { vipService } from './vipService.js';
import {
  TOOL_FLINT_LIGHTER_SVG,
  TOOL_VINTAGE_MATCH_SVG,
  TOOL_BLUE_TORCH_SVG,
  TOOL_PLASMA_ARC_SVG,
  TOOL_ZIPPO_VINTAGE_SVG
} from '../utils/vectorIcons.js';

/**
 * 点火器具工坊 (The Ignition Arsenal)
 * 还原现实生活中多维点火仪式感：火柴、Zippo、雪茄防风蓝焰枪、赛博等离子双弧、经典砂轮打火机
 * 阶梯替烟解锁机制：普通用户达成自律目标即可长线解锁全套器具；VIP 会员享免门槛畅享特权
 */
export const IGNITION_TOOLS = [
  {
    id: 'flint_lighter',
    name: '经典砂轮',
    category: 'classic',
    icon: '🔥',
    iconImage: TOOL_FLINT_LIGHTER_SVG,
    subTitle: '滚花黄铜 · 柔黄火苗',
    moodTag: '烟火 · 人间',
    moodQuote: '把心头的烦恼磨碎，化作前行的星火。',
    craftMaterial: '滚花黄铜 · 1200℃柔焰',
    gestureHint: '轻触点火 · 或划动砂轮',
    fidgetHint: '搓动砂轮 · 溅落星火',
    fidgetAction: 'spin',
    flameType: 'yellow',
    badge: '便携日常',
    themeColor: '#f59e0b',
    buttonGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    requiredCount: 0,
    unlockDesc: '初始默认开放',
    description: '最熟悉的人间烟火气，滚花砂轮划过火石，溅起星花腾起温暖黄焰。'
  },
  {
    id: 'vintage_match',
    name: '复古火柴',
    category: 'vintage',
    icon: '🪵',
    iconImage: TOOL_VINTAGE_MATCH_SVG,
    subTitle: '划纸摩擦 · 磷火松木',
    moodTag: '静心 · 独处',
    moodQuote: '慢下来，擦亮一瓣微光，敬生活的细碎美好。',
    craftMaterial: '长白山白桦 · 松香微光',
    gestureHint: '在擦纸轻划 · 哧啦引燃',
    fidgetHint: '横划火柴 · 哧啦引燃',
    fidgetAction: 'swipe',
    flameType: 'match',
    badge: '复古情怀',
    themeColor: '#ef4444',
    buttonGradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    requiredCount: 20,
    unlockDesc: '累计替烟 20 支解锁',
    description: '火柴头在红磷侧边“哧啦”一划，白烟升腾，松木梗幽幽燃烧，仪式感拉满。'
  },
  {
    id: 'zippo_vintage',
    name: '经典Zippo',
    category: 'zippo',
    icon: '🪙',
    iconImage: TOOL_ZIPPO_VINTAGE_SVG,
    subTitle: '清脆开盖 · 金黄油焰',
    moodTag: '从容 · 释怀',
    moodQuote: '听一声清脆金石，过往随风，唯留此刻从容。',
    craftMaterial: '加厚纯铜 · 经典油芯',
    gestureHint: '掀盖清脆 · 搓动火石',
    fidgetHint: '上滑掀盖 · 搓动点火',
    fidgetAction: 'flip',
    flameType: 'zippo',
    badge: '硬汉经典',
    themeColor: '#fbbf24',
    buttonGradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    requiredCount: 100,
    unlockDesc: '累计替烟 100 支解锁',
    description: '“叮——”一声标志性的金属铰链开盖脆鸣，拇指搓动砂轮，防风孔内跃动金色油焰。'
  },
  {
    id: 'plasma_arc',
    name: '赛博双弧',
    category: 'cyber',
    icon: '⚡',
    iconImage: TOOL_PLASMA_ARC_SVG,
    subTitle: '钛金机身 · 交叉等离子弧',
    moodTag: '极客 · 突破',
    moodQuote: '在跃动的电弧中，告别旧瘾，重构纯净自我。',
    craftMaterial: '航空钛金 · 20000Hz高频电浆',
    gestureHint: '轻触点火 · 交叉电浆',
    fidgetHint: '轻触点火 · 交叉电浆',
    fidgetAction: 'press',
    flameType: 'plasma_arc',
    badge: '极客科技',
    themeColor: '#a855f7',
    buttonGradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    requiredCount: 300,
    unlockDesc: '累计替烟 300 支解锁',
    description: '无明火纯净等离子双弧，航空钛合金枪灰机身，按下开关紫青高能电弧交叉轰鸣，纯净瞬间引燃。'
  },
  {
    id: 'blue_torch',
    name: '蓝焰喷枪',
    category: 'cigar',
    icon: '🔵',
    iconImage: TOOL_BLUE_TORCH_SVG,
    subTitle: '三喷强劲 · 等离子蓝焰',
    moodTag: '专注 · 突破',
    moodQuote: '击穿所有焦虑杂念，专注此刻的高能心流。',
    craftMaterial: 'TC4战术合金 · 1800℃蓝焰',
    gestureHint: '按压扳机 · 呼啸喷薄',
    fidgetHint: '长按扳机 · 喷薄蓝焰',
    fidgetAction: 'hold',
    flameType: 'blue_torch',
    badge: '雪茄专配',
    themeColor: '#06b6d4',
    buttonGradient: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
    requiredCount: 600,
    unlockDesc: '累计替烟 600 支解锁',
    description: '纯丁烷无杂质高温防风喷枪，三束幽蓝火锥暴鸣喷薄，炭化雪茄烟脚无杂味。'
  }
];

export function getIgnitionToolById(id) {
  return IGNITION_TOOLS.find(t => t.id === id) || IGNITION_TOOLS[0];
}

export function isIgnitionToolUnlocked(toolId, totalSubstituted = 0) {
  try {
    if (vipService && vipService.isVip && vipService.isVip()) return true;
  } catch (e) {}
  const tool = getIgnitionToolById(toolId);
  if (!tool) return true;
  if (!tool.requiredCount || tool.requiredCount === 0) return true;
  return totalSubstituted >= tool.requiredCount;
}

export function getActiveIgnitionTool() {
  const savedId = storageService.getSelectedIgnitionTool();
  return getIgnitionToolById(savedId);
}
