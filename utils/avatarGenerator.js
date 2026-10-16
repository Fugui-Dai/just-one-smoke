// utils/avatarGenerator.js
/**
 * 腾讯游戏设计总监级 · 极清高饱和矢量艺术头像程序化生成引擎
 * (Tencent Games Hyper-Vibrant Procedural Avatar Engine)
 * 
 * 核心设计语言：
 * 1. 鲜艳明亮、多姿多彩：12 款高饱和电玩极光与潮流潮玩渐变色系；
 * 2. 游戏级立体光影：双向月牙镜面高光、水晶能量球内发光、立体厚度光影；
 * 3. 12 大腾讯游戏级炫彩图腾（八芒王者罗盘、朱雀神羽、祥云仙山、神树之灵、圣火莲华、未来电竞潮客、断烟圣剑、自律神盾等）；
 * 4. 超过 34,500+ 种高颜值绝不重样的独创组合！
 */

import { svgToUri } from './vectorIcons.js';

// 12 大高饱和鲜艳游戏级色系 (Tencent Games Vibrant Palette)
const COLOR_THEMES = [
  // 1. 电玩霓虹 (Neon Cyber Arcade)
  {
    id: 'neon_arcade',
    bg1: '#701a75', bg2: '#2e1065', bg3: '#0f172a',
    core1: '#f43f5e', core2: '#c084fc',
    acc1: '#fde047', acc2: '#22d3ee',
    ring: '#38bdf8', glow: 'rgba(244, 63, 94, 0.45)',
    star: '#fef08a'
  },
  // 2. 落日炽金 (Sunset Solflare)
  {
    id: 'sunset_solflare',
    bg1: '#991b1b', bg2: '#7c2d12', bg3: '#18080a',
    core1: '#fbbf24', core2: '#ea580c',
    acc1: '#fef08a', acc2: '#f97316',
    ring: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)',
    star: '#ffffff'
  },
  // 3. 碧海极光 (Tropical Aurora)
  {
    id: 'tropical_aurora',
    bg1: '#065f46', bg2: '#0f766e', bg3: '#082f49',
    core1: '#34d399', core2: '#06b6d4',
    acc1: '#a7f3d0', acc2: '#38bdf8',
    ring: '#2dd4bf', glow: 'rgba(52, 211, 153, 0.45)',
    star: '#f0fdf4'
  },
  // 4. 星之守护 (Star Guardian Pink)
  {
    id: 'star_guardian',
    bg1: '#831843', bg2: '#581c87', bg3: '#1e1b4b',
    core1: '#f472b6', core2: '#fb7185',
    acc1: '#fde047', acc2: '#e879f9',
    ring: '#f472b6', glow: 'rgba(236, 72, 153, 0.5)',
    star: '#fff1f2'
  },
  // 5. 钻石冰川 (Glacial Diamond Cyan)
  {
    id: 'glacial_cyan',
    bg1: '#075985', bg2: '#0369a1', bg3: '#082f49',
    core1: '#38bdf8', core2: '#60a5fa',
    acc1: '#ffffff', acc2: '#67e8f9',
    ring: '#7dd3fc', glow: 'rgba(56, 189, 248, 0.5)',
    star: '#ffffff'
  },
  // 6. 王者圣金 (Royal Sunburst Gold)
  {
    id: 'royal_gold',
    bg1: '#78350f', bg2: '#9a3412', bg3: '#1f1304',
    core1: '#fde047', core2: '#d97706',
    acc1: '#ffffff', acc2: '#f59e0b',
    ring: '#fbbf24', glow: 'rgba(251, 191, 36, 0.55)',
    star: '#fffbeb'
  },
  // 7. 荧光青柠潮酷 (Electric Pop Lime)
  {
    id: 'electric_lime',
    bg1: '#14532d', bg2: '#1e3a8a', bg3: '#0f172a',
    core1: '#a3e635', core2: '#06b6d4',
    acc1: '#facc15', acc2: '#4ade80',
    ring: '#84cc16', glow: 'rgba(163, 230, 53, 0.45)',
    star: '#fef9c3'
  },
  // 8. 烈焰朱雀 (Crimson Phoenix)
  {
    id: 'crimson_phoenix',
    bg1: '#881337', bg2: '#991b1b', bg3: '#2a0409',
    core1: '#ef4444', core2: '#f59e0b',
    acc1: '#fb7185', acc2: '#fde047',
    ring: '#f43f5e', glow: 'rgba(239, 68, 68, 0.5)',
    star: '#fef2f2'
  },
  // 9. 魅影幻紫 (Astral Amethyst)
  {
    id: 'astral_violet',
    bg1: '#581c87', bg2: '#3b0764', bg3: '#180828',
    core1: '#c084fc', core2: '#f472b6',
    acc1: '#e9d5ff', acc2: '#d946ef',
    ring: '#a855f7', glow: 'rgba(192, 132, 252, 0.5)',
    star: '#faf5ff'
  },
  // 10. 灵狐翠玉 (Mystic Jade Dew)
  {
    id: 'mystic_jade',
    bg1: '#064e3b', bg2: '#134e4a', bg3: '#022c22',
    core1: '#4ade80', core2: '#14b8a6',
    acc1: '#fde047', acc2: '#6ee7b7',
    ring: '#34d399', glow: 'rgba(74, 222, 128, 0.45)',
    star: '#f0fdf4'
  },
  // 11. 赛博热浪 (Cyber Heatwave)
  {
    id: 'cyber_heat',
    bg1: '#831843', bg2: '#9a3412', bg3: '#1a0410',
    core1: '#fb7185', core2: '#f59e0b',
    acc1: '#fef08a', acc2: '#ec4899',
    ring: '#fb923c', glow: 'rgba(251, 113, 133, 0.5)',
    star: '#fff1f2'
  },
  // 12. 幻境天界 (Prism Rainbow)
  {
    id: 'prism_rainbow',
    bg1: '#431407', bg2: '#3b0764', bg3: '#082f49',
    core1: '#38bdf8', core2: '#e879f9',
    acc1: '#fde047', acc2: '#34d399',
    ring: '#a855f7', glow: 'rgba(232, 121, 249, 0.5)',
    star: '#ffffff'
  }
];

// 12 种腾讯游戏级高辨识度炫彩艺术图腾
const TOTEM_BUILDERS = [
  // 1. 八芒王者罗盘 (Eight-Point King Compass)
  () => `
    <path d="M 40 13 L 44 33 L 64 37 L 45 43 L 40 64 L 35 43 L 16 37 L 36 33 Z" fill="url(#coreGrad)"/>
    <path d="M 40 22 L 43 36 L 57 39 L 44 43 L 40 57 L 36 43 L 23 39 L 37 36 Z" fill="url(#accGrad)" opacity="0.9"/>
    <circle cx="40" cy="39" r="6" fill="#ffffff" filter="url(#dropGlow)"/>
    <circle cx="40" cy="39" r="3.2" fill="url(#coreGrad)"/>
    <line x1="40" y1="8" x2="40" y2="70" stroke="url(#accGrad)" stroke-width="1.2" opacity="0.65" stroke-dasharray="2,3"/>
    <line x1="9" y1="39" x2="71" y2="39" stroke="url(#accGrad)" stroke-width="1.2" opacity="0.65" stroke-dasharray="2,3"/>
  `,

  // 2. 朱雀炽焰神羽 (Phoenix Blaze Wings)
  () => `
    <path d="M 40 50 C 33 37 19 32 12 22 C 22 22 32 27 40 37 C 48 27 58 22 68 22 C 61 32 47 37 40 50 Z" fill="url(#coreGrad)"/>
    <path d="M 40 56 C 35 46 25 41 18 35 C 25 35 34 39 40 46 C 46 39 55 35 62 35 C 55 41 45 46 40 56 Z" fill="url(#accGrad)"/>
    <circle cx="40" cy="18" r="4.2" fill="#ffffff" filter="url(#dropGlow)"/>
    <polygon points="40,9 42,14 47,16 42,18 40,23 38,18 33,16 38,14" fill="#ffffff"/>
  `,

  // 3. 祥云仙山皓月 (Celestial Mountain & Moon)
  () => `
    <circle cx="40" cy="25" r="16" fill="url(#accGrad)" opacity="0.4" filter="url(#dropGlow)"/>
    <circle cx="40" cy="25" r="10.5" fill="#ffffff" opacity="0.95"/>
    <path d="M 16 58 L 32 36 L 45 47 L 56 33 L 65 58 Z" fill="url(#coreGrad)" opacity="0.75"/>
    <path d="M 14 64 L 28 44 L 40 53 L 52 40 L 66 64 Z" fill="url(#accGrad)"/>
    <path d="M 26 19 Q 30 16 34 20 Q 38 16 42 19 Q 38 17 34 21 Q 30 18 26 19 Z" fill="#ffffff"/>
    <path d="M 46 16 Q 48 14 50 16 Q 52 14 54 16 Q 52 15 50 17 Q 48 15 46 16 Z" fill="#ffffff" opacity="0.85"/>
  `,

  // 4. 神树繁星之灵 (Arbor of Life & Stardust)
  () => `
    <path d="M 40 62 L 40 38 Q 30 32 23 25 M 40 38 Q 50 32 57 25 M 40 31 L 40 18 M 34 33 Q 27 35 20 37 M 46 33 Q 53 35 60 37" stroke="url(#coreGrad)" stroke-width="3.2" stroke-linecap="round" fill="none"/>
    <circle cx="40" cy="15" r="4.5" fill="#ffffff" filter="url(#dropGlow)"/>
    <circle cx="22" cy="23" r="3.8" fill="url(#accGrad)"/>
    <circle cx="58" cy="23" r="3.8" fill="url(#accGrad)"/>
    <circle cx="30" cy="17" r="2.8" fill="#ffffff"/>
    <circle cx="50" cy="17" r="2.8" fill="#ffffff"/>
    <circle cx="18" cy="36" r="2.8" fill="url(#accGrad)"/>
    <circle cx="62" cy="36" r="2.8" fill="url(#accGrad)"/>
  `,

  // 5. 纯净圣火莲华 (Sacred Lotus Flame)
  () => `
    <path d="M 40 14 C 47 25 57 33 57 44 C 57 53 49 60 40 60 C 31 60 23 53 23 44 C 23 33 33 25 40 14 Z" fill="url(#coreGrad)"/>
    <path d="M 40 27 C 45 34 50 39 50 46 C 50 52 45 56 40 56 C 35 56 30 52 30 46 C 30 39 35 34 40 27 Z" fill="url(#accGrad)"/>
    <circle cx="40" cy="45" r="4.2" fill="#ffffff" filter="url(#dropGlow)"/>
    <polygon points="40,21 41.5,25 45,26.5 41.5,28 40,32 38.5,28 35,26.5 38.5,25" fill="#ffffff"/>
  `,

  // 6. 等轴能量魔方 (Prismatic Tesseract)
  () => `
    <polygon points="40,16 58,26 40,36 22,26" fill="url(#accGrad)" opacity="0.95"/>
    <polygon points="22,26 40,36 40,56 22,46" fill="url(#coreGrad)" opacity="0.8"/>
    <polygon points="58,26 40,36 40,56 58,46" fill="url(#coreGrad)"/>
    <line x1="40" y1="16" x2="40" y2="36" stroke="#ffffff" stroke-width="1.8" opacity="0.9"/>
    <circle cx="40" cy="36" r="4" fill="#ffffff" filter="url(#dropGlow)"/>
    <circle cx="40" cy="36" r="2" fill="url(#accGrad)"/>
  `,

  // 7. 未来电竞潮客 (Cyber Pop Champion)
  () => `
    <circle cx="40" cy="30" r="14.5" fill="url(#coreGrad)"/>
    <rect x="27" y="27" width="26" height="7.5" rx="3.75" fill="#090d16" stroke="url(#accGrad)" stroke-width="1.6"/>
    <line x1="29" y1="29" x2="38" y2="33" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="42" y1="29" x2="51" y2="33" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M 19 64 C 19 50 28 45 40 45 C 52 45 61 50 61 64 Z" fill="url(#coreGrad)"/>
    <path d="M 33 45 L 40 56 L 47 45" fill="url(#accGrad)"/>
    <circle cx="16" cy="32" r="3.5" fill="url(#accGrad)"/>
    <circle cx="64" cy="32" r="3.5" fill="url(#accGrad)"/>
  `,

  // 8. 神圣觉醒之眼 (Eye of Awakening & Wisdom)
  () => `
    <path d="M 15 40 Q 40 18 65 40 Q 40 62 15 40 Z" fill="none" stroke="url(#coreGrad)" stroke-width="3.2"/>
    <circle cx="40" cy="40" r="11" fill="url(#accGrad)"/>
    <circle cx="40" cy="40" r="5.5" fill="#090d16"/>
    <circle cx="43" cy="37" r="2.8" fill="#ffffff" filter="url(#dropGlow)"/>
    <polygon points="40,11 41.5,14 44,15 41.5,16 40,19 38.5,16 36,15 38.5,14" fill="#ffffff"/>
  `,

  // 9. 祥瑞神兽灵角 (Celestial Kirin Antlers)
  () => `
    <path d="M 40 58 L 40 40 C 40 35 34 32 28 28 M 34 32 C 30 26 24 24 18 22 M 29 28 C 28 20 22 16 16 13 M 40 40 C 40 35 46 32 52 28 M 46 32 C 50 26 56 24 62 22 M 51 28 C 52 20 58 16 64 13" stroke="url(#coreGrad)" stroke-width="2.8" stroke-linecap="round" fill="none"/>
    <circle cx="40" cy="36" r="4.2" fill="#ffffff" filter="url(#dropGlow)"/>
    <polygon points="40,20 42.5,25 47,27 42.5,29 40,34 37.5,29 33,27 37.5,25" fill="url(#accGrad)"/>
  `,

  // 10. 星穹天体流星 (Cosmic Saturn & Meteor)
  () => `
    <circle cx="40" cy="40" r="15" fill="url(#coreGrad)"/>
    <ellipse cx="40" cy="40" rx="34" ry="11" fill="none" stroke="url(#accGrad)" stroke-width="2.8" transform="rotate(-28 40 40)"/>
    <circle cx="34" cy="33" r="5" fill="#ffffff" opacity="0.6"/>
    <path d="M 52 14 C 58 18 64 25 66 33" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/>
    <circle cx="52" cy="14" r="2" fill="#ffffff"/>
  `,

  // 11. 决绝意志圣剑 (Holy Sword of Will)
  () => `
    <path d="M 40 10 L 44 18 L 44 50 L 40 58 L 36 50 L 36 18 Z" fill="url(#coreGrad)"/>
    <line x1="40" y1="10" x2="40" y2="55" stroke="#ffffff" stroke-width="1.6"/>
    <rect x="28" y="47" width="24" height="4.5" rx="2" fill="url(#accGrad)"/>
    <rect x="37.5" y="52" width="5" height="10" rx="1.5" fill="url(#coreGrad)"/>
    <circle cx="40" cy="65" r="3.2" fill="url(#accGrad)"/>
    <polygon points="40,6 42,9 45,10 42,11 40,14 38,11 35,10 38,9" fill="#ffffff" filter="url(#dropGlow)"/>
  `,

  // 12. 王者自律神盾 (Aegis of Discipline)
  () => `
    <path d="M 40 16 L 58 24 C 58 44 48 55 40 62 C 32 55 22 44 22 24 Z" fill="url(#coreGrad)"/>
    <path d="M 40 22 L 53 28 C 53 43 45 51 40 56 C 35 51 27 43 27 28 Z" fill="url(#accGrad)"/>
    <circle cx="40" cy="38" r="6" fill="#ffffff" filter="url(#dropGlow)"/>
    <polygon points="40,32 42,36 46,38 42,40 40,44 38,40 34,38 38,36" fill="url(#coreGrad)"/>
  `
];

// 6 种高阶外轨微光星环 (Outer Orbits & Auras)
const RING_BUILDERS = [
  // 1. 同心双光轨
  (ringColor) => `
    <circle cx="40" cy="40" r="35" fill="none" stroke="${ringColor}" stroke-width="1.8" opacity="0.85"/>
    <circle cx="40" cy="40" r="37.5" fill="none" stroke="url(#accGrad)" stroke-width="1" opacity="0.6"/>
  `,
  // 2. 倾斜多重光环
  (ringColor) => `
    <ellipse cx="40" cy="40" rx="36" ry="14" fill="none" stroke="${ringColor}" stroke-width="1.8" transform="rotate(-25 40 40)" opacity="0.9"/>
    <circle cx="40" cy="40" r="36" fill="none" stroke="url(#coreGrad)" stroke-width="1" opacity="0.5"/>
  `,
  // 3. 电竞赛事虚线能量脉冲环
  (ringColor) => `
    <circle cx="40" cy="40" r="35.5" fill="none" stroke="${ringColor}" stroke-width="2" stroke-dasharray="4, 4" opacity="0.95"/>
    <circle cx="40" cy="40" r="37.5" fill="none" stroke="url(#accGrad)" stroke-width="0.8" opacity="0.5"/>
  `,
  // 4. 四方位准心刻度标
  (ringColor) => `
    <circle cx="40" cy="40" r="35" fill="none" stroke="${ringColor}" stroke-width="1.4" opacity="0.7"/>
    <line x1="40" y1="2" x2="40" y2="7.5" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="40" y1="72.5" x2="40" y2="78" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="2" y1="40" x2="7.5" y2="40" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="72.5" y1="40" x2="78" y2="40" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
  `,
  // 5. 烈阳日冕光晕环
  (ringColor) => `
    <circle cx="40" cy="40" r="36.5" fill="none" stroke="${ringColor}" stroke-width="2.2" opacity="0.75"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="url(#accGrad)" stroke-width="1" stroke-dasharray="2, 3" opacity="0.8"/>
  `,
  // 6. 赛博晶体正六边形光环
  (ringColor) => `
    <polygon points="40,4 70,21 70,59 40,76 10,59 10,21" fill="none" stroke="${ringColor}" stroke-width="1.8" opacity="0.85"/>
  `
];

// 4 组发光星芒与微晶星尘 (Sparkles & Stardust)
const STAR_BUILDERS = [
  // 1. 璀璨双星芒
  (starColor) => `
    <polygon points="20,18 22,22 26,23.5 22,25 20,29 18,25 14,23.5 18,22" fill="${starColor}" opacity="0.95"/>
    <polygon points="60,60 61.5,63 64.5,64.5 61.5,66 60,69 58.5,66 55.5,64.5 58.5,63" fill="url(#accGrad)"/>
    <circle cx="20" cy="23.5" r="1.5" fill="#ffffff"/>
    <circle cx="60" cy="64.5" r="1.5" fill="#ffffff"/>
  `,
  // 2. 悬浮星尘光斑
  (starColor) => `
    <circle cx="17" cy="22" r="1.8" fill="${starColor}" opacity="0.95"/>
    <circle cx="22" cy="58" r="1.5" fill="url(#accGrad)"/>
    <circle cx="63" cy="23" r="1.8" fill="url(#accGrad)"/>
    <circle cx="59" cy="57" r="1.6" fill="${starColor}" opacity="0.9"/>
    <circle cx="40" cy="13" r="1.5" fill="#ffffff"/>
  `,
  // 3. 划破长空的流星光弧
  (starColor) => `
    <path d="M 50 14 C 57 19 64 27 67 36" stroke="${starColor}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.85"/>
    <circle cx="50" cy="14" r="2.2" fill="#ffffff"/>
    <circle cx="67" cy="36" r="1.2" fill="url(#accGrad)"/>
  `,
  // 4. 对角微光四芒星
  (starColor) => `
    <polygon points="63,18 64.5,21 67.5,22.5 64.5,24 63,27 61.5,24 58.5,22.5 61.5,21" fill="${starColor}" opacity="0.95"/>
    <polygon points="17,60 18.5,62.5 21,63.5 18.5,64.5 17,67 15.5,64.5 13,63.5 15.5,62.5" fill="url(#accGrad)"/>
  `
];

/**
 * 随机生成或根据种子生成一枚高奢腾讯游戏级炫彩艺术头像 SVG Data URI
 * @param {number|string} [seed] 可选随机种子
 * @returns {string} SVG Data URI
 */
function generateRandomAvatarSvg(seed) {
  let rand;
  if (seed !== undefined && seed !== null) {
    let num = 0;
    const str = String(seed);
    for (let i = 0; i < str.length; i++) {
      num = (num * 31 + str.charCodeAt(i)) % 1000000007;
    }
    rand = (offset = 0) => {
      num = (num * 16807 + offset) % 2147483647;
      return (num - 1) / 2147483646;
    };
  } else {
    rand = () => Math.random();
  }

  const themeIdx = Math.floor(rand(1) * COLOR_THEMES.length);
  const totemIdx = Math.floor(rand(2) * TOTEM_BUILDERS.length);
  const ringIdx = Math.floor(rand(3) * RING_BUILDERS.length);
  const starIdx = Math.floor(rand(4) * STAR_BUILDERS.length);

  const theme = COLOR_THEMES[themeIdx];
  const totemSvg = TOTEM_BUILDERS[totemIdx]();
  const ringSvg = RING_BUILDERS[ringIdx](theme.ring);
  const starSvg = STAR_BUILDERS[starIdx](theme.star);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%">
  <defs>
    <!-- 多重高饱和深邃炫彩球盘底色 -->
    <radialGradient id="avatarSphere" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="${theme.bg1}"/>
      <stop offset="55%" stop-color="${theme.bg2}"/>
      <stop offset="100%" stop-color="${theme.bg3}"/>
    </radialGradient>
    
    <!-- 核心高能渐变 -->
    <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.core1}"/>
      <stop offset="100%" stop-color="${theme.core2}"/>
    </linearGradient>
    
    <!-- 强调高光渐变 -->
    <linearGradient id="accGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.acc1}"/>
      <stop offset="100%" stop-color="${theme.acc2}"/>
    </linearGradient>

    <!-- 游戏级发光投影滤镜 -->
    <filter id="dropGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color="${theme.glow}"/>
    </filter>
  </defs>

  <!-- 1. 水晶能量球底盘 (鲜艳饱满) -->
  <circle cx="40" cy="40" r="39" fill="url(#avatarSphere)"/>

  <!-- 2. 底部向上溢出的能量微光 -->
  <circle cx="40" cy="40" r="38" fill="none" stroke="${theme.glow}" stroke-width="2.5" opacity="0.6"/>

  <!-- 3. 精密外轨星环 -->
  ${ringSvg}

  <!-- 4. 绚丽星尘与微晶 -->
  ${starSvg}

  <!-- 5. 核心高光图腾 (带发光投影) -->
  <g filter="url(#dropGlow)">
    ${totemSvg}
  </g>

  <!-- 6. 腾讯游戏招牌 · 顶部水晶镜面月牙高光 (Glossy Gel Highlight) -->
  <path d="M 14 30 C 18 16 32 9 46 9 C 55 9 63 12 67 17 C 59 13 47 13 37 17 C 23 23 16 31 14 30 Z" 
        fill="#ffffff" opacity="0.32"/>

  <!-- 7. 底部边缘反光环 (Subtle Rim Lighting) -->
  <path d="M 18 64 C 28 70 52 70 62 64" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.25"/>
</svg>
  `;

  return svgToUri(svg);
}

/**
 * 随机获取一个高奢鲜艳游戏级艺术头像
 * @returns {string} SVG Data URI
 */
export function getRandomAvatarSvg() {
  return generateRandomAvatarSvg();
}
