// utils/ignitionService.js
import { storageService } from './storageService.js';

/**
 * 点火器具工坊 (The Ignition Arsenal)
 * 还原现实生活中多维点火仪式感：火柴、Zippo、雪茄防风蓝焰枪、车载电热点烟器、经典打火机
 */
export const IGNITION_TOOLS = [
  {
    id: 'flint_lighter',
    name: '经典砂轮机',
    category: 'classic',
    icon: '🔥',
    subTitle: '滚花黄铜 · 柔黄火苗',
    gestureHint: '轻触点火 · 或划动砂轮',
    flameType: 'yellow',
    badge: '便携日常',
    themeColor: '#f59e0b',
    description: '最熟悉的人间烟火气，滚花砂轮划过火石，溅起星花腾起温暖黄焰。'
  },
  {
    id: 'vintage_match',
    name: '红头木质火柴',
    category: 'vintage',
    icon: '🪵',
    subTitle: '划纸摩擦 · 磷火松木',
    gestureHint: '在擦纸轻划 · 哧啦引燃',
    flameType: 'match',
    badge: '复古情怀',
    themeColor: '#ef4444',
    description: '火柴头在红磷侧边“哧啦”一划，白烟升腾，松木梗幽幽燃烧，仪式感拉满。'
  },
  {
    id: 'blue_torch',
    name: '雪茄蓝焰喷枪',
    category: 'cigar',
    icon: '🔵',
    subTitle: '三喷强劲 · 等离子蓝焰',
    gestureHint: '按压扳机 · 呼啸喷薄',
    flameType: 'blue_torch',
    badge: '雪茄专配',
    themeColor: '#06b6d4',
    description: '纯丁烷无杂质高温防风喷枪，三束幽蓝火锥暴鸣喷薄，炭化雪茄烟脚无杂味。'
  },
  {
    id: 'car_lighter',
    name: '车载螺旋电热丝',
    category: 'auto',
    icon: '🚗',
    subTitle: '按压弹起 · 烙烫火星',
    gestureHint: '按压加热 · 通红弹起',
    flameType: 'car_coil',
    badge: '车居避难所',
    themeColor: '#f97316',
    description: '车里最熟悉的深夜解压物件，按下5秒后清脆弹起，通红螺旋电阻丝贴上烟头滋滋作响。'
  },
  {
    id: 'zippo_vintage',
    name: 'Zippo 纯铜火机',
    category: 'zippo',
    icon: '🪙',
    subTitle: '清脆开盖 · 金黄油焰',
    gestureHint: '掀盖清脆 · 搓动火石',
    flameType: 'zippo',
    badge: '硬汉经典',
    themeColor: '#fbbf24',
    description: '“叮——”一声标志性的金属铰链开盖脆鸣，拇指搓动砂轮，防风孔内跃动金色油焰。'
  }
];

export const DEFAULT_IGNITION_TOOL_ID = 'flint_lighter';

export function getIgnitionTools() {
  return IGNITION_TOOLS;
}

export function getIgnitionToolById(id) {
  return IGNITION_TOOLS.find(t => t.id === id) || IGNITION_TOOLS[0];
}

export function getActiveIgnitionTool() {
  const savedId = storageService.getSelectedIgnitionTool();
  return getIgnitionToolById(savedId);
}
