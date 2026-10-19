// utils/vectorIcons.js
/**
 * 高清跨端矢量图标库 (100% 解决高版本 Emoji 在 Windows/Android 缺失无法显示的问题)
 * 纯原生 SVG Data URI 编码，全平台免字体依赖、超高清矢量渲染
 */

export function svgToUri(svgString) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString.trim());
}

// 1. 双肺呼吸系统 (真实双肺解剖气道与双肺叶 · 翡翠翠绿)
export const LUNG_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <!-- 气管主干 -->
  <path d="M 24 4 L 24 16" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
  <line x1="21" y1="8" x2="27" y2="8" stroke="#ffffff" stroke-width="1.5"/>
  <line x1="21" y1="12" x2="27" y2="12" stroke="#ffffff" stroke-width="1.5"/>
  <!-- 左右支气管 -->
  <path d="M 24 16 Q 20 20 15 24" stroke="#38bdf8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M 24 16 Q 28 20 33 24" stroke="#38bdf8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- 右肺叶 (三叶饱满轮廓) -->
  <path d="M 21 20 C 18 16 11 18 8 23 C 5 28 5 36 9 41 C 13 44 18 43 21 38 C 23 34 22 26 21 20 Z" 
        fill="#10b981" stroke="#6ee7b7" stroke-width="1.5"/>
  <!-- 左肺叶 (二叶心切迹轮廓) -->
  <path d="M 27 20 C 30 16 37 18 40 23 C 43 28 43 36 39 41 C 35 44 30 43 28 38 C 26 34 26 28 27 20 Z" 
        fill="#10b981" stroke="#6ee7b7" stroke-width="1.5"/>
  <!-- 肺内自愈微光纹理 -->
  <circle cx="14" cy="28" r="1.8" fill="#ffffff" opacity="0.9"/>
  <circle cx="16" cy="35" r="1.5" fill="#a7f3d0" opacity="0.9"/>
  <circle cx="34" cy="28" r="1.8" fill="#ffffff" opacity="0.9"/>
  <circle cx="32" cy="35" r="1.5" fill="#a7f3d0" opacity="0.9"/>
</svg>
`);

// 2. 心脏心血管系统 (真实解剖心脏、主动脉弓与冠脉 · 琥珀珊瑚红)
export const HEART_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <!-- 主动脉弓及三大分支 -->
  <path d="M 22 18 C 20 10 28 9 30 17" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
  <line x1="24" y1="11" x2="24" y2="6" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
  <line x1="28" y1="11" x2="29" y2="6" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
  <!-- 心脏肌肉本体 (真实倾角朝向左下方) -->
  <path d="M 24 18 C 18 14 12 18 14 26 C 16 33 22 41 24 43 C 26 41 34 33 36 26 C 38 18 32 14 24 18 Z" 
        fill="#ef4444" stroke="#fef08a" stroke-width="1.5"/>
  <!-- 心肌冠状动脉前降支血脉 -->
  <path d="M 22 22 Q 18 28 22 36" stroke="#fde047" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="19" cy="25" rx="2" ry="3.5" fill="#ffffff" opacity="0.5" transform="rotate(-25 19 25)"/>
</svg>
`);

// 3. 血液微循环系统 (纯净携氧血滴与微循环波纹 · 青蓝高光)
export const BLOOD_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <!-- 饱满水润血滴 -->
  <path d="M 24 6 C 24 6 12 22 12 30 C 12 37 17 42 24 42 C 31 42 36 37 36 30 C 36 22 24 6 24 6 Z" 
        fill="#06b6d4" stroke="#38bdf8" stroke-width="1.5"/>
  <!-- 水光反光弧 -->
  <path d="M 17 26 C 17 20 22 14 23 12" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.85"/>
  <circle cx="21" cy="34" r="2.2" fill="#ffffff" opacity="0.75"/>
</svg>
`);

// 4. 大脑中枢神经 (双半球脑回与自律突触 · 优雅淡紫)
export const BRAIN_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <!-- 左半球脑轮廓 -->
  <path d="M 23 8 C 16 8 10 13 10 20 C 10 25 12 28 10 32 C 8 36 12 40 16 40 C 20 40 23 37 23 35 Z" 
        fill="#8b5cf6" stroke="#c084fc" stroke-width="1.5"/>
  <!-- 右半球脑轮廓 -->
  <path d="M 25 8 C 32 8 38 13 38 20 C 38 25 36 28 38 32 C 40 36 36 40 32 40 C 28 40 25 37 25 35 Z" 
        fill="#8b5cf6" stroke="#c084fc" stroke-width="1.5"/>
  <!-- 脑回纹理 -->
  <path d="M 14 18 Q 18 22 16 26" stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.8"/>
  <path d="M 34 18 Q 30 22 32 26" stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.8"/>
  <path d="M 14 30 Q 19 32 18 36" stroke="#ddd6fe" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M 34 30 Q 29 32 30 36" stroke="#ddd6fe" stroke-width="1.2" fill="none" stroke-linecap="round"/>
</svg>
`);

// 5. 掐灭/止烟图标：清凉甘霖 · 霜华水滴 (Quenching Droplet & Calm Frost Star · 快速掐灭熄火)
export const EXTINGUISH_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#67e8f9"/>
      <stop offset="75%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#0e7490"/>
    </linearGradient>
    <linearGradient id="iceStar" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#a5f3fc"/>
    </linearGradient>
  </defs>
  <!-- 清冽水滴 / 掐灭甘霖 -->
  <path d="M 32 8 C 32 8 16 28 16 40 C 16 48.8 23.2 56 32 56 C 40.8 56 48 48.8 48 40 C 48 28 32 8 32 8 Z" fill="url(#dropGrad)"/>
  <!-- 水滴高光弧 -->
  <path d="M 23 34 C 21 38 21 44 24 48" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <circle cx="26" cy="27" r="2.5" fill="#ffffff" opacity="0.9"/>
  <!-- 冰霜四芒星 (极清凉止息) -->
  <polygon points="32,32 34,38 40,40 34,42 32,48 30,42 24,40 30,38" fill="url(#iceStar)"/>
  <circle cx="32" cy="40" r="1.5" fill="#ffffff"/>
</svg>
`);


// 5. 默认用户尊贵头像矢量 SVG (腾讯游戏级鲜艳高亮 · 八芒星耀罗盘)
export const DEFAULT_USER_AVATAR_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="100%" height="100%">
  <defs>
    <radialGradient id="flagshipSphere" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#701a75"/>
      <stop offset="55%" stop-color="#2e1065"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="flagshipCore" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
    <linearGradient id="flagshipAcc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#22d3ee"/>
    </linearGradient>
    <filter id="flagshipGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color="rgba(244, 63, 94, 0.45)"/>
    </filter>
  </defs>
  <!-- 水晶底盘 -->
  <circle cx="40" cy="40" r="39" fill="url(#flagshipSphere)"/>
  <circle cx="40" cy="40" r="38" fill="none" stroke="rgba(244, 63, 94, 0.45)" stroke-width="2.5" opacity="0.6"/>
  <!-- 双重光环 -->
  <circle cx="40" cy="40" r="35" fill="none" stroke="#38bdf8" stroke-width="1.8" opacity="0.85"/>
  <circle cx="40" cy="40" r="37.5" fill="none" stroke="url(#flagshipAcc)" stroke-width="1" opacity="0.6"/>
  <!-- 星芒粒子 -->
  <polygon points="20,18 22,22 26,23.5 22,25 20,29 18,25 14,23.5 18,22" fill="#fef08a" opacity="0.95"/>
  <polygon points="60,60 61.5,63 64.5,64.5 61.5,66 60,69 58.5,66 55.5,64.5 58.5,63" fill="url(#flagshipAcc)"/>
  <circle cx="20" cy="23.5" r="1.5" fill="#ffffff"/>
  <circle cx="60" cy="64.5" r="1.5" fill="#ffffff"/>
  <!-- 八芒王者罗盘核心 -->
  <g filter="url(#flagshipGlow)">
    <path d="M 40 13 L 44 33 L 64 37 L 45 43 L 40 64 L 35 43 L 16 37 L 36 33 Z" fill="url(#flagshipCore)"/>
    <path d="M 40 22 L 43 36 L 57 39 L 44 43 L 40 57 L 36 43 L 23 39 L 37 36 Z" fill="url(#flagshipAcc)" opacity="0.9"/>
    <circle cx="40" cy="39" r="6" fill="#ffffff"/>
    <circle cx="40" cy="39" r="3.2" fill="url(#flagshipCore)"/>
    <line x1="40" y1="8" x2="40" y2="70" stroke="url(#flagshipAcc)" stroke-width="1.2" opacity="0.65" stroke-dasharray="2,3"/>
    <line x1="9" y1="39" x2="71" y2="39" stroke="url(#flagshipAcc)" stroke-width="1.2" opacity="0.65" stroke-dasharray="2,3"/>
  </g>
  <!-- 镜面月牙高光 -->
  <path d="M 14 30 C 18 16 32 9 46 9 C 55 9 63 12 67 17 C 59 13 47 13 37 17 C 23 23 16 31 14 30 Z" fill="#ffffff" opacity="0.32"/>
  <!-- 底部边缘反光 -->
  <path d="M 18 64 C 28 70 52 70 62 64" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.25"/>
</svg>
`);

// 6. 腾讯设计级 3D 曜石黑金 VIP 皇冠徽章 (矢量极清渲染)
export const VIP_CROWN_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="vipGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff4d4"/>
      <stop offset="35%" stop-color="#f5d499"/>
      <stop offset="70%" stop-color="#d4a757"/>
      <stop offset="100%" stop-color="#9a742b"/>
    </linearGradient>
    <linearGradient id="vipHaloGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(254, 240, 138, 0.35)"/>
      <stop offset="100%" stop-color="rgba(217, 119, 6, 0.08)"/>
    </linearGradient>
  </defs>
  <!-- 底盘微光光环 -->
  <circle cx="32" cy="32" r="28" fill="url(#vipHaloGrad)" stroke="rgba(245, 212, 153, 0.45)" stroke-width="1.2"/>
  <!-- 尊贵五芒皇冠轮廓 -->
  <path d="M 16 41 L 20 25 L 27 33 L 32 19 L 37 33 L 44 25 L 48 41 Z" fill="url(#vipGoldGrad)" stroke="#785318" stroke-width="0.8"/>
  <!-- 皇冠底座金带 -->
  <rect x="16" y="41" width="32" height="5.5" rx="1.5" fill="#f5d499" stroke="#785318" stroke-width="0.8"/>
  <!-- 底座镶嵌三颗微型宝石 -->
  <circle cx="22" cy="43.8" r="1.3" fill="#ffffff"/>
  <circle cx="32" cy="43.8" r="1.5" fill="#ffffff"/>
  <circle cx="42" cy="43.8" r="1.3" fill="#ffffff"/>
  <!-- 皇冠顶部尖端珍珠高光 -->
  <circle cx="20" cy="25" r="1.8" fill="#ffffff"/>
  <circle cx="32" cy="19" r="2.2" fill="#ffffff"/>
  <circle cx="44" cy="25" r="1.8" fill="#ffffff"/>
</svg>
`);

// 10. 青莲化境 · 步步生莲 翡翠宝莲高定矢量图标 (高阶东方禅意·翡翠金蕊莲花)
export const LOTUS_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="lotusPetalGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="60%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#a7f3d0"/>
    </linearGradient>
    <linearGradient id="lotusCenterGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="70%" stop-color="#6ee7b7"/>
      <stop offset="100%" stop-color="#ecfdf5"/>
    </linearGradient>
    <linearGradient id="lotusGoldGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
  </defs>
  <!-- 底座祥和甘露水波光晕 -->
  <ellipse cx="32" cy="54" rx="20" ry="3.5" fill="#047857" opacity="0.45"/>
  <path d="M 16 52 C 22 56 42 56 48 52 C 40 50 24 50 16 52 Z" fill="#059669" opacity="0.6"/>
  <!-- 后排舒展莲瓣 (左外、右外) -->
  <path d="M 32 46 C 22 44 10 38 8 28 C 14 26 24 33 32 46 Z" fill="url(#lotusPetalGrad)" opacity="0.85"/>
  <path d="M 32 46 C 42 44 54 38 56 28 C 50 26 40 33 32 46 Z" fill="url(#lotusPetalGrad)" opacity="0.85"/>
  <!-- 次外层莲瓣 (左次、右次) -->
  <path d="M 32 48 C 20 45 13 32 15 20 C 23 23 28 35 32 48 Z" fill="url(#lotusPetalGrad)"/>
  <path d="M 32 48 C 44 45 51 32 49 20 C 41 23 36 35 32 48 Z" fill="url(#lotusPetalGrad)"/>
  <!-- 中层优雅主瓣 (左中、右中) -->
  <path d="M 32 50 C 23 45 19 28 23 14 C 29 20 31 36 32 50 Z" fill="url(#lotusCenterGrad)"/>
  <path d="M 32 50 C 41 45 45 28 41 14 C 35 20 33 36 32 50 Z" fill="url(#lotusCenterGrad)"/>
  <!-- 正中亭亭玉立主花瓣 -->
  <path d="M 32 52 C 26 42 26 24 32 8 C 38 24 38 42 32 52 Z" fill="url(#lotusCenterGrad)" stroke="#6ee7b7" stroke-width="0.8"/>
  <!-- 莲心金蕊光芒 -->
  <circle cx="32" cy="38" r="3.2" fill="url(#lotusGoldGrad)"/>
  <circle cx="32" cy="38" r="1.5" fill="#ffffff" opacity="0.9"/>
  <!-- 晨露甘霖珍珠微光 -->
  <circle cx="32" cy="14" r="1.2" fill="#ffffff" opacity="0.95"/>
  <circle cx="24" cy="22" r="0.9" fill="#ffffff" opacity="0.8"/>
  <circle cx="40" cy="22" r="0.9" fill="#ffffff" opacity="0.8"/>
</svg>
`);

// 11. 偏好设置 · 单包烟价流金徽标 (¥ 专属矢量金币)
export const PRICE_COIN_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <defs>
    <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="45%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="coinInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef9c3"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="21" fill="url(#coinGrad)" stroke="#78350f" stroke-width="1.2"/>
  <circle cx="24" cy="24" r="16.5" fill="none" stroke="rgba(254, 240, 138, 0.75)" stroke-width="1.4" stroke-dasharray="3, 2"/>
  <text x="24" y="30.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" filter="drop-shadow(0px 1px 2px rgba(120,53,15,0.6))">¥</text>
</svg>
`);

// 12. 偏好设置 · 吸烟支数徽标 (斜向香烟与微光余烬)
export const CIGS_COUNT_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <defs>
    <linearGradient id="cigBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="cigFilterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="21" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1.2"/>
  <g transform="rotate(-30 24 24)">
    <rect x="9" y="21" width="20" height="6" rx="1.5" fill="url(#cigBodyGrad)"/>
    <rect x="29" y="21" width="10" height="6" rx="1.5" fill="url(#cigFilterGrad)"/>
    <!-- 余烬与微火 -->
    <path d="M 9 21 L 7.5 24 L 9 27 Z" fill="#ef4444"/>
    <circle cx="7" cy="24" r="1.2" fill="#fef08a"/>
  </g>
</svg>
`);

// 13. 偏好设置 · 既往烟龄岁月徽标 (罗盘时钟与光影时光)
export const YEARS_CLOCK_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <defs>
    <linearGradient id="clockRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="21" fill="rgba(168, 85, 247, 0.12)" stroke="rgba(192, 132, 252, 0.35)" stroke-width="1.2"/>
  <circle cx="24" cy="24" r="15" fill="none" stroke="url(#clockRingGrad)" stroke-width="2"/>
  <!-- 刻度点 -->
  <circle cx="24" cy="11.5" r="1" fill="#c084fc"/>
  <circle cx="36.5" cy="24" r="1" fill="#c084fc"/>
  <circle cx="24" cy="36.5" r="1" fill="#c084fc"/>
  <circle cx="11.5" cy="24" r="1" fill="#c084fc"/>
  <!-- 时针分针 -->
  <line x1="24" y1="15" x2="24" y2="24" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
  <line x1="24" y1="24" x2="31" y2="24" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>
  <circle cx="24" cy="24" r="2.2" fill="#fef08a"/>
</svg>
`);

// 14. 偏好设置 · 灵动星芒徽标 (四角金色璀璨星辉)
export const PROJECTION_SPARK_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <path d="M 24 4 Q 24 24 44 24 Q 24 24 24 44 Q 24 24 4 24 Q 24 24 24 4 Z" fill="#fbbf24"/>
  <circle cx="24" cy="24" r="4.5" fill="#ffffff"/>
  <circle cx="24" cy="24" r="8" fill="rgba(254, 240, 138, 0.35)"/>
</svg>
`);

// 15. 佛光普照 · 梵天千叶金莲 矢量图标 (大日佛光与黄金莲座)
export const BUDDHA_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <radialGradient id="buddhaGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="35%" stop-color="#fef08a"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309" stop-opacity="0.2"/>
    </radialGradient>
    <linearGradient id="buddhaLotusGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="60%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#fef9c3"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="28" r="24" fill="url(#buddhaGlow)"/>
  <g stroke="#fde047" stroke-width="1.2" opacity="0.85" stroke-linecap="round">
    <line x1="32" y1="4" x2="32" y2="10"/>
    <line x1="32" y1="46" x2="32" y2="52"/>
    <line x1="10" y1="28" x2="16" y2="28"/>
    <line x1="48" y1="28" x2="54" y2="28"/>
    <line x1="16" y1="12" x2="20" y2="16"/>
    <line x1="44" y1="40" x2="48" y2="44"/>
    <line x1="48" y1="12" x2="44" y2="16"/>
    <line x1="16" y1="44" x2="20" y2="40"/>
  </g>
  <path d="M 14 46 C 20 40 28 42 32 48 C 36 42 44 40 50 46 C 42 54 22 54 14 46 Z" fill="url(#buddhaLotusGrad)"/>
  <path d="M 22 44 C 26 36 32 32 32 46 C 32 32 38 36 42 44 C 36 48 28 48 22 44 Z" fill="#fef08a"/>
  <circle cx="32" cy="22" r="5" fill="#fef3c7"/>
  <path d="M 24 38 C 24 30 27 28 32 28 C 37 28 40 30 40 38 Z" fill="#fef3c7"/>
  <circle cx="32" cy="22" r="1.5" fill="#ffffff"/>
  <circle cx="32" cy="14" r="1.2" fill="#ffffff"/>
</svg>
`);

// 16. 涅槃重光 · 赤金神凤降世 矢量图标 (浴火展翼与南明离火)
export const PHOENIX_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="phxFireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#b91c1c"/>
      <stop offset="35%" stop-color="#ea580c"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <radialGradient id="phxHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(251, 146, 60, 0.45)"/>
      <stop offset="70%" stop-color="rgba(234, 88, 12, 0.15)"/>
      <stop offset="100%" stop-color="rgba(0, 0, 0, 0)"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="28" fill="url(#phxHalo)"/>
  <path d="M 32 38 C 22 36 8 26 6 12 C 16 16 26 26 32 38 Z" fill="url(#phxFireGrad)"/>
  <path d="M 32 38 C 42 36 56 26 58 12 C 48 16 38 26 32 38 Z" fill="url(#phxFireGrad)"/>
  <path d="M 32 38 C 24 34 14 20 16 8 C 24 14 28 26 32 38 Z" fill="#fde047" opacity="0.9"/>
  <path d="M 32 38 C 40 34 50 20 48 8 C 40 14 36 26 32 38 Z" fill="#fde047" opacity="0.9"/>
  <path d="M 32 46 C 30 38 30 26 32 18 C 34 26 34 38 32 46 Z" fill="#fef08a"/>
  <circle cx="32" cy="18" r="2.8" fill="#ffffff"/>
  <path d="M 32 16 L 31 10 L 32 12 L 33 10 Z" fill="#fde047"/>
  <path d="M 32 46 Q 26 56 20 60 Q 28 54 32 48" stroke="#f97316" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M 32 46 Q 38 56 44 60 Q 36 54 32 48" stroke="#f97316" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M 32 46 L 32 58" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>
  <circle cx="32" cy="18" r="1.2" fill="#b91c1c"/>
</svg>
`);

// 17. 七仙降世 · 霓裳羽衣散花 矢量图标 (瑶池飞仙、彩虹仙环与天女散花)
export const FAIRY_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <radialGradient id="fairyGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fdf2f8"/>
      <stop offset="35%" stop-color="#f472b6"/>
      <stop offset="70%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.1"/>
    </radialGradient>
    <linearGradient id="ribbonRainbow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="25%" stop-color="#fb923c"/>
      <stop offset="50%" stop-color="#facc15"/>
      <stop offset="75%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#60a5fa"/>
    </linearGradient>
  </defs>
  <!-- 柔美霞光光环 -->
  <circle cx="32" cy="32" r="28" fill="url(#fairyGlow)"/>
  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255, 255, 255, 0.6)" stroke-width="1.2" stroke-dasharray="3,2"/>
  
  <!-- 飞天流光飘带 (S形飘逸彩带) -->
  <path d="M 12 44 C 10 26 24 16 34 14 C 44 12 54 22 52 38 C 50 48 38 52 26 50 C 18 48 14 36 18 28" 
        fill="none" stroke="url(#ribbonRainbow)" stroke-width="3" stroke-linecap="round" opacity="0.95"/>
  <path d="M 16 46 C 18 32 28 22 36 20 C 44 18 50 26 48 36" 
        fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>

  <!-- 飞仙曼妙剪影 -->
  <path d="M 32 20 C 30 24 28 32 30 42 C 32 40 36 38 38 42 C 37 32 35 24 32 20 Z" fill="#ffffff" opacity="0.95"/>
  <!-- 云髻高挽 -->
  <circle cx="32" cy="18" r="3.2" fill="#27272a"/>
  <circle cx="32" cy="15" r="2" fill="#fef08a"/>
  <!-- 飞天手挽粉桃仙花 -->
  <circle cx="27" cy="24" r="2.4" fill="#f472b6"/>
  <circle cx="37" cy="26" r="2.2" fill="#fb7185"/>

  <!-- 散落的飞舞琼花瓣 -->
  <path d="M 16 18 C 14 16 14 12 18 14 C 18 18 16 18 16 18 Z" fill="#f472b6"/>
  <path d="M 46 16 C 44 14 44 10 48 12 C 48 16 46 16 46 16 Z" fill="#fb7185"/>
  <path d="M 46 48 C 44 46 44 42 48 44 C 48 48 46 48 46 48 Z" fill="#f472b6"/>
  <circle cx="22" cy="14" r="1.2" fill="#ffffff"/>
  <circle cx="42" cy="46" r="1.2" fill="#ffffff"/>
  <circle cx="32" cy="54" r="1.5" fill="#fef08a"/>
</svg>
`);

// 18. 飞龙在天 · 曜金祥云真龙 矢量图标 (曜金龙首、祥云缭绕与五爪神威)
export const DRAGON_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <radialGradient id="dragonBgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="45%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#09090b"/>
    </radialGradient>
    <linearGradient id="goldDragonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="cloudPurpleGold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c084fc" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <!-- 尊贵玄金底晕与环形金纹 -->
  <circle cx="32" cy="32" r="28" fill="url(#dragonBgGlow)"/>
  <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(250, 204, 21, 0.7)" stroke-width="1.2" stroke-dasharray="2,2"/>
  <circle cx="32" cy="32" r="25" fill="none" stroke="rgba(254, 240, 138, 0.4)" stroke-width="0.8"/>

  <!-- 底部祥云托日 -->
  <path d="M 12 48 C 16 42 24 43 28 47 C 32 42 42 42 46 47 C 50 43 56 45 54 52 C 48 56 20 56 12 48 Z" 
        fill="url(#cloudPurpleGold)"/>

  <!-- 龙身破云之姿 (S形祥云龙躯) -->
  <path d="M 20 46 C 24 38 32 36 38 30 C 44 26 48 24 46 18" 
        fill="none" stroke="url(#goldDragonGrad)" stroke-width="5" stroke-linecap="round"/>
  <!-- 背鳍锯齿 -->
  <path d="M 23 41 L 24 37 L 27 40 L 30 35 L 33 38 L 36 32 L 39 35" 
        fill="none" stroke="#fef08a" stroke-width="1.4" stroke-linecap="round"/>

  <!-- 曜金龙首 (45度侧仰昂首破云) -->
  <!-- 鹿角峥嵘 -->
  <path d="M 40 18 Q 44 10 50 8 M 45 13 Q 50 14 54 13 M 42 16 Q 44 6 48 4" 
        fill="none" stroke="#fef08a" stroke-width="2.2" stroke-linecap="round"/>
  <!-- 龙首颅骨与龙吻 -->
  <path d="M 36 22 C 38 17 44 16 48 18 C 52 20 54 24 50 26 C 45 28 40 27 36 22 Z" 
        fill="url(#goldDragonGrad)"/>
  <path d="M 48 22 C 54 21 56 25 51 27 C 46 29 44 26 48 22 Z" 
        fill="#fef08a"/>
  
  <!-- 龙目日曜金辉 -->
  <circle cx="44" cy="20" r="2.0" fill="#dc2626"/>
  <circle cx="44" cy="20" r="1.3" fill="#fef08a"/>
  <circle cx="44.4" cy="19.6" r="0.6" fill="#ffffff"/>

  <!-- 猎猎飞扬金龙须 -->
  <path d="M 52 25 Q 56 28 60 27 M 51 26 Q 54 32 58 35" 
        fill="none" stroke="#fef08a" stroke-width="1.4" stroke-linecap="round"/>

  <!-- 脑后与颈项飞扬龙鬃 -->
  <path d="M 38 18 Q 30 16 26 22 M 36 23 Q 28 22 24 28 M 34 27 Q 26 28 22 34" 
        fill="none" stroke="#f59e0b" stroke-width="2.4" stroke-linecap="round"/>

  <!-- 拨云五爪金钩 -->
  <path d="M 28 32 L 24 35 M 24 35 L 20 34 M 24 35 L 21 38 M 24 35 L 25 39" 
        fill="none" stroke="#fef08a" stroke-width="1.6" stroke-linecap="round"/>

  <!-- 龙吐祥瑞金芒星尘 -->
  <circle cx="56" cy="21" r="1.5" fill="#fef08a"/>
  <circle cx="60" cy="18" r="1.0" fill="#ffffff"/>
  <circle cx="57" cy="15" r="0.8" fill="#fef08a"/>
</svg>
`);

// // ==============================================================================
// 🏆 腾讯设计总监级高定 DOCK 栏专属纯矢量 SVG 图标库 (新一代年轻人 · 唯美先锋流光美学体系)
// ==============================================================================

// 1. 点燃图标：炽热灵焰 · 三重金红烈火 (Triple-Tongue Roaring Flame & Ember Sparks · 腾讯获奖级 1秒识别)
export const IGNITE_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="flameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="35%" stop-color="#ea580c"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <linearGradient id="flameInner" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <!-- 3-Prong 真实饱满烈焰 (经典火焰造型，一眼即认点火) -->
  <path d="M 32 6 C 36 15 48 22 48 36 C 48 48 41 57 32 57 C 23 57 16 48 16 36 C 16 25 26 18 29 13 C 28 20 34 23 35 30 C 36 28 34 22 32 6 Z" fill="url(#flameOuter)"/>
  <!-- 左侧灵火分瓣 -->
  <path d="M 22 38 C 22 28 28 22 30 16 C 24 24 20 32 24 42" fill="#f59e0b" opacity="0.6"/>
  <!-- 内核白热火心 -->
  <path d="M 32 23 C 36 30 41 34 41 41 C 41 47 37 51 32 51 C 27 51 23 47 23 41 C 23 35 27 30 32 23 Z" fill="url(#flameInner)"/>
  <!-- 顶端飞腾火星与高光钻石星 -->
  <polygon points="32,2 33.5,5 35.5,5.5 33.5,6 32,9 30.5,6 28.5,5.5 30.5,5" fill="#ffffff"/>
  <circle cx="45" cy="20" r="1.6" fill="#fef08a"/>
</svg>
`);

// 2. 猛吸/呼出图标：气动脉冲 · 旋转气旋 (Breath Pulse Spiral)
export const INHALE_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="inhaleVortex1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="inhaleVortex2" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#7dd3fc"/>
      <stop offset="60%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#bae6fd"/>
    </linearGradient>
  </defs>
  <path d="M 32 12 C 43 12 52 21 52 32 C 52 38 49 43 45 47 C 43 49 40 48 41 45 C 44 41 46 37 46 32 C 46 24 40 18 32 18 C 26 18 21 21 18 26 C 17 28 14 27 15 25 C 19 17 25 12 32 12 Z" fill="url(#inhaleVortex1)"/>
  <path d="M 32 52 C 21 52 12 43 12 32 C 12 26 15 21 19 17 C 21 15 24 16 23 19 C 20 23 18 27 18 32 C 18 40 24 46 32 46 C 38 46 43 43 46 38 C 47 36 50 37 49 39 C 45 47 39 52 32 52 Z" fill="url(#inhaleVortex2)"/>
  <circle cx="32" cy="32" r="3" fill="#ffffff"/>
</svg>
`);

// 3. 烟雾特效图标：袅袅仙云 · 3D环绕烟圈与璀璨星芒 (Ethereal Smoke Cloud & 3D Smoke Ring · 饱满视觉权重 · 一眼辨识烟雾特效)
export const SMOKE_VFX_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="cloudGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="35%" stop-color="#c084fc"/>
      <stop offset="70%" stop-color="#e9d5ff"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <!-- 底部升腾流韵烟雾 (自底部延展，消除下部空旷死区) -->
  <path d="M 24 58 C 24 53 28 50 32 47 C 36 50 40 53 40 58 Z" fill="#c084fc" opacity="0.35"/>
  <path d="M 28 57 C 28 53 32 50 34 47 C 36 50 38 53 38 57 Z" fill="#e9d5ff" opacity="0.6"/>
  <!-- 袅袅升腾的仙气灵动烟云团 (云雾主形，大幅饱满延展至 Y: 14~54，充满画面) -->
  <path d="M 14 52 C 7 52 5 44 8 38 C 5 31 11 23 18 24 C 22 15 34 13 41 18 C 47 14 56 18 57 24 C 62 26 64 34 60 41 C 63 47 58 52 51 52 Z" fill="url(#cloudGrad)"/>
  <!-- 云雾内部翻滚流线与通透层次 -->
  <path d="M 18 42 C 24 36 34 36 40 42 C 44 38 50 40 54 44" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
  <path d="M 26 31 C 32 26 40 27 45 32" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>
  <!-- 3D 吐出的圆润特效烟圈 (立体环绕烟云，醒目跃出) -->
  <ellipse cx="28" cy="20" rx="14" ry="6.2" fill="none" stroke="#ffffff" stroke-width="3" transform="rotate(-15 28 20)"/>
  <ellipse cx="28" cy="20" rx="14" ry="6.2" fill="none" stroke="#fef08a" stroke-width="1.2" transform="rotate(-15 28 20)" opacity="0.7"/>
  <!-- 魔法特效璀璨四芒星 (✦) -->
  <path d="M 50 7 Q 50 14 57 14 Q 50 14 50 21 Q 50 14 43 14 Q 50 14 50 7 Z" fill="url(#starGold)"/>
  <circle cx="50" cy="14" r="1.6" fill="#ffffff"/>
  <circle cx="12" cy="19" r="1.5" fill="#fef08a"/>
</svg>
`);

// 3.1 经典空灵烟圈图标 (3D Toroidal Smoke Ring · 空灵冰蓝烟圈)
export const EFFECT_RING_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <radialGradient id="ringBgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#60a5fa"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="28" fill="url(#ringBgGlow)"/>
  <!-- 底部升腾微缕轻烟 -->
  <path d="M 30 54 Q 34 44 28 38 Q 32 34 32 30" fill="none" stroke="#93c5fd" stroke-width="2.2" stroke-linecap="round" opacity="0.6"/>
  <!-- 主 3D 俯仰透视环形涡流大烟圈 -->
  <ellipse cx="32" cy="28" rx="20" ry="9" fill="none" stroke="url(#ringGrad)" stroke-width="4.2" transform="rotate(-10 32 28)"/>
  <!-- 烟圈内圈高光弧 -->
  <ellipse cx="32" cy="28" rx="16.5" ry="6.5" fill="none" stroke="#ffffff" stroke-width="1.8" transform="rotate(-10 32 28)" opacity="0.9"/>
  <!-- 伴飞的第2枚灵动微烟圈 -->
  <ellipse cx="44" cy="16" rx="9" ry="4" fill="none" stroke="#ffffff" stroke-width="2.2" transform="rotate(12 44 16)" opacity="0.85"/>
  <!-- 璀璨晶莹小星芒 -->
  <polygon points="18,18 19.5,21 22.5,22 19.5,23 18,26 16.5,23 13.5,22 16.5,21" fill="#ffffff"/>
  <circle cx="48" cy="38" r="1.5" fill="#bae6fd"/>
</svg>
`);

// 3.2 双心微芒图标 (Concentric Double Hearts · 丘比特浪漫粉钻双心)
export const EFFECT_HEART_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <radialGradient id="heartBgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#be185d" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="heartGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#db2777"/>
    </linearGradient>
    <linearGradient id="heartGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbcfe8"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="28" fill="url(#heartBgGlow)"/>
  <!-- 主爱心轮廓 -->
  <path d="M 32 48 C 32 48 12 36 12 24 C 12 16 18 12 24 12 C 28 12 31 15 32 18 C 33 15 36 12 40 12 C 46 12 52 16 52 24 C 52 36 32 48 32 48 Z" 
        fill="none" stroke="url(#heartGrad1)" stroke-width="3.6" stroke-linejoin="round"/>
  <!-- 同心伴飞内爱心 -->
  <path d="M 32 40 C 32 40 20 31 20 23 C 20 18 24 16 27 16 C 29.5 16 31.5 18 32 20 C 32.5 18 34.5 16 37 16 C 40 16 44 18 44 23 C 44 31 32 40 32 40 Z" 
        fill="url(#heartGrad2)" opacity="0.85"/>
  <!-- 爱心高光切面 -->
  <path d="M 17 21 C 17 17 21 15 24 15" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <!-- 丘比特星尘 -->
  <polygon points="46,12 47.5,15 50.5,16 47.5,17 46,20 44.5,17 41.5,16 44.5,15" fill="#ffffff"/>
  <circle cx="16" cy="38" r="1.6" fill="#fbcfe8"/>
  <circle cx="48" cy="36" r="1.8" fill="#ffffff"/>
</svg>
`);

// 3.3 金箔微雨图标 (24K Gold Stardust & Coin Shower · 曜世黑金暴富雨)
export const EFFECT_GOLD_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <radialGradient id="goldBgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#78350f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="28" fill="url(#goldBgGlow)"/>
  <!-- 中央 3D 翻滚金币 -->
  <ellipse cx="32" cy="28" rx="14" ry="14" fill="url(#coinGrad)" stroke="#fef08a" stroke-width="1.2"/>
  <ellipse cx="32" cy="28" rx="10" ry="10" fill="none" stroke="#b45309" stroke-width="1.2"/>
  <rect x="29" y="25" width="6" height="6" fill="#fef08a" stroke="#b45309" stroke-width="0.8"/>
  <!-- 左上伴飞金币 -->
  <ellipse cx="16" cy="20" rx="7" ry="5.5" fill="url(#coinGrad)" transform="rotate(-20 16 20)"/>
  <!-- 右下坠落小金币 -->
  <ellipse cx="46" cy="40" rx="8" ry="6" fill="url(#coinGrad)" transform="rotate(25 46 40)"/>
  <!-- 漫天飘洒金条/金箔粒与金芒 -->
  <rect x="20" y="42" width="7" height="3" rx="1" fill="#fef08a" transform="rotate(35 20 42)"/>
  <rect x="42" y="16" width="6" height="2.5" rx="0.8" fill="#fef08a" transform="rotate(-15 42 16)"/>
  <polygon points="32,8 33.5,12 37.5,13.5 33.5,15 32,19 30.5,15 26.5,13.5 30.5,12" fill="#ffffff"/>
  <circle cx="14" cy="34" r="1.4" fill="#fef08a"/>
  <circle cx="48" cy="26" r="1.6" fill="#ffffff"/>
</svg>
`);

// 3.4 璀璨星河图标 (Galaxy Stars & Spiral Nebula · 深空幽蓝双旋臂星云)
export const EFFECT_GALAXY_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <radialGradient id="nebulaCore" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#67e8f9"/>
      <stop offset="70%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="spiralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
  </defs>
  <!-- 银河旋涡星云背景 -->
  <circle cx="32" cy="32" r="28" fill="url(#nebulaCore)"/>
  <!-- 双旋臂对向螺旋曲线 -->
  <path d="M 32 32 C 38 28 46 30 50 36 C 54 42 50 50 42 52 C 34 54 24 50 20 42" 
        fill="none" stroke="url(#spiralGrad)" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
  <path d="M 32 32 C 26 36 18 34 14 28 C 10 22 14 14 22 12 C 30 10 40 14 44 22" 
        fill="none" stroke="url(#spiralGrad)" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
  <!-- 星核高亮八芒星 (✦) -->
  <polygon points="32,18 34,28 44,30 34,32 32,42 30,32 20,30 30,28" fill="#ffffff"/>
  <circle cx="32" cy="30" r="3" fill="#ffffff"/>
  <!-- 伴星与闪烁微星 -->
  <circle cx="48" cy="20" r="1.8" fill="#67e8f9"/>
  <circle cx="16" cy="44" r="1.6" fill="#c084fc"/>
  <circle cx="22" cy="22" r="1.3" fill="#ffffff"/>
  <circle cx="42" cy="46" r="1.3" fill="#fef08a"/>
</svg>
`);

// 3.5 迎祥福印图标 (Imperial Golden Seal & Blessing Rune · 迎祥纳福宝印)
export const EFFECT_BLESSING_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <radialGradient id="sealBgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#dc2626" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#7f1d1d" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="50%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <linearGradient id="goldFont" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="28" fill="url(#sealBgGlow)"/>
  <!-- 朱砂红底印章主体 -->
  <rect x="14" y="14" width="36" height="36" rx="6" fill="url(#sealGrad)" stroke="#fef08a" stroke-width="2.4"/>
  <!-- 烫金内边框回纹 -->
  <rect x="18" y="18" width="28" height="28" rx="3" fill="none" stroke="#fef08a" stroke-width="1.2" opacity="0.85"/>
  <!-- 印文：传统大篆“福”字立体造型 -->
  <!-- 左示字旁 -->
  <line x1="24" y1="23" x2="28" y2="23" stroke="url(#goldFont)" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="26" y1="23" x2="26" y2="39" stroke="url(#goldFont)" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="23" y1="29" x2="26" y2="33" stroke="url(#goldFont)" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="29" y1="30" x2="26" y2="35" stroke="url(#goldFont)" stroke-width="1.8" stroke-linecap="round"/>
  <!-- 右侧一、口、田 -->
  <line x1="32" y1="23" x2="40" y2="23" stroke="url(#goldFont)" stroke-width="2" stroke-linecap="round"/>
  <rect x="33" y="26" width="6" height="4.5" rx="0.5" fill="none" stroke="url(#goldFont)" stroke-width="1.6"/>
  <rect x="32" y="32" width="8" height="8" rx="0.5" fill="none" stroke="url(#goldFont)" stroke-width="1.8"/>
  <line x1="36" y1="32" x2="36" y2="40" stroke="url(#goldFont)" stroke-width="1.4"/>
  <line x1="32" y1="36" x2="40" y2="36" stroke="url(#goldFont)" stroke-width="1.4"/>
  <!-- 四角祥云小金钻 -->
  <circle cx="18" cy="18" r="1.2" fill="#fef08a"/>
  <circle cx="46" cy="18" r="1.2" fill="#fef08a"/>
  <circle cx="18" cy="46" r="1.2" fill="#fef08a"/>
  <circle cx="46" cy="46" r="1.2" fill="#fef08a"/>
  <!-- 宝印祥瑞金芒 -->
  <polygon points="32,6 33.5,9.5 37,10.5 33.5,11.5 32,15 30.5,11.5 27,10.5 30.5,9.5" fill="#fef08a"/>
</svg>
`);

// 4. 抖灰图标：经典香烟 · 弹落火红余烬 (Bold 45° Cigarette & Falling Ash Flakes · 抖灰动作 1秒即认)
export const ASH_TAP_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="corkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="70%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="cigWhite" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="ashEmber" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="50%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>
  </defs>
  <!-- 45度倾斜饱满香烟 (加粗加显，一目了然) -->
  <g transform="rotate(38 30 28)">
    <!-- 经典黄色过滤嘴 -->
    <rect x="8" y="24" width="16" height="14" rx="2" fill="url(#corkGrad)"/>
    <!-- 滤嘴金箍圈 -->
    <rect x="24" y="24" width="2.5" height="14" fill="#fef08a"/>
    <!-- 纯白卷烟纸身 -->
    <rect x="26.5" y="24" width="22" height="14" fill="url(#cigWhite)"/>
    <!-- 烟头炭化灰黑环 -->
    <rect x="48.5" y="24" width="3.5" height="14" fill="#334155"/>
    <!-- 红热燃烧炭火心 -->
    <rect x="52" y="24" width="3.5" height="14" rx="1" fill="url(#ashEmber)"/>
    <circle cx="53.5" cy="31" r="2.5" fill="#fef08a"/>
    <circle cx="53.5" cy="31" r="1.2" fill="#ffffff"/>
  </g>
  <!-- 弹落的立体炭火灰烬颗粒 (大颗粒 + 明暗层次，一秒认出弹灰) -->
  <circle cx="48" cy="42" r="3" fill="#f59e0b"/>
  <circle cx="48" cy="42" r="1.2" fill="#fef08a"/>
  <circle cx="56" cy="37" r="2.2" fill="#ef4444"/>
  <circle cx="44" cy="52" r="2.6" fill="#e2e8f0"/>
  <circle cx="53" cy="49" r="1.8" fill="#fbbf24"/>
  <!-- 弹指微振冲击波弧线 (代表弹指轻敲手势) -->
  <path d="M 12 16 C 18 12 25 14 28 18" fill="none" stroke="#fef08a" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M 8 20 C 13 17 19 18 21 21" fill="none" stroke="#f59e0b" stroke-width="1.6" stroke-linecap="round"/>
</svg>
`);

// 5. 递烟图标：温情敬烟 · 掌心托递整支香烟 (Caring Hand Offering Cigarette · 极具亲和力社交手势)
export const GIVE_CIG_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="handGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#ccfbf1"/>
      <stop offset="100%" stop-color="#2dd4bf"/>
    </linearGradient>
    <linearGradient id="cigCig" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="28%" stop-color="#d97706"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="34%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <!-- 优雅托递手势 (手腕自左下延展，手心托举) -->
  <path d="M 10 47 C 15 44 21 40 27 38 C 32 37 36 38 38 41 C 35 44 30 47 24 49 C 18 51 13 53 10 54 Z" fill="url(#handGrad)"/>
  <path d="M 27 38 C 31 34 37 29 42 28 C 44 28 45 30 43 32 C 39 35 34 38 30 40 Z" fill="url(#handGrad)"/>
  <!-- 递出的整支香烟 (清晰横卧向前递出) -->
  <g transform="rotate(-15 36 26)">
    <rect x="17" y="22" width="32" height="8" rx="2" fill="url(#cigCig)"/>
    <rect x="26.5" y="22" width="1.8" height="8" fill="#fef08a"/>
    <!-- 烟头微光 -->
    <circle cx="50" cy="26" r="1.8" fill="#fef08a"/>
    <circle cx="50" cy="26" r="1" fill="#ef4444"/>
  </g>
  <!-- 递烟社交分享传递光弧 -->
  <line x1="51" y1="14" x2="56" y2="11" stroke="#fef08a" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="53" y1="23" x2="59" y2="23" stroke="#fef08a" stroke-width="2.2" stroke-linecap="round"/>
</svg>
`);

// 6. 商店图标：奢享精品店铺 · 经典双色遮阳雨篷与暖光橱窗 (Luxury Boutique Storefront · 商店百辨不误)
export const STORE_SHOP_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <!-- 奢华金渐变 -->
    <linearGradient id="shopGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="35%" stop-color="#fde68a"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <!-- 雨篷深红条纹 -->
    <linearGradient id="awningRed" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <!-- 雨篷金色条纹 -->
    <linearGradient id="awningGold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <!-- 店铺建筑墙体 -->
    <linearGradient id="shopWall" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <!-- 橱窗暖光 -->
    <linearGradient id="windowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="60%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <!-- 玻璃门光泽 -->
    <linearGradient id="doorGlass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.9"/>
    </linearGradient>
  </defs>

  <!-- 1. 顶部招牌与星芒 -->
  <polygon points="32,4 33.5,8 37.5,9.5 33.5,11 32,15 30.5,11 26.5,9.5 30.5,8" fill="#fef08a"/>
  <circle cx="32" cy="9.5" r="1.5" fill="#ffffff"/>

  <!-- 2. 店铺墙体主体 -->
  <rect x="13" y="27" width="38" height="28" rx="2" fill="url(#shopWall)" stroke="url(#shopGold)" stroke-width="1.2"/>

  <!-- 3. 橱窗展示区 (左侧大型暖光展示窗) -->
  <rect x="17" y="32" width="17" height="17" rx="2.5" fill="url(#windowGlow)" stroke="#fef08a" stroke-width="0.8"/>
  <!-- 橱窗内展架与展品微影 -->
  <line x1="17" y1="42" x2="34" y2="42" stroke="#b45309" stroke-width="1" stroke-opacity="0.6"/>
  <rect x="20" y="36" width="4.5" height="6" rx="1" fill="#b91c1c" stroke="#fef08a" stroke-width="0.6"/>
  <rect x="26.5" y="35" width="4.5" height="7" rx="1" fill="#d97706" stroke="#fef08a" stroke-width="0.6"/>

  <!-- 4. 商店玻璃进门 (右侧经典双开店门) -->
  <rect x="37" y="32" width="11" height="23" rx="1.5" fill="url(#doorGlass)" stroke="url(#shopGold)" stroke-width="0.8"/>
  <line x1="42.5" y1="32" x2="42.5" y2="55" stroke="url(#shopGold)" stroke-width="0.7"/>
  <!-- 门把手 -->
  <circle cx="41.2" cy="44" r="1.1" fill="#fef08a"/>
  <circle cx="43.8" cy="44" r="1.1" fill="#fef08a"/>

  <!-- 5. 经典双色波浪遮阳雨篷 (The Boutique Striped Awning) -->
  <!-- 条纹1 (左深红) -->
  <path d="M 12 15 L 20 15 L 18.5 28 C 16.5 29 12 29 10.5 28 Z" fill="url(#awningRed)"/>
  <!-- 条纹2 (金) -->
  <path d="M 20 15 L 28 15 L 27.5 28 C 25.5 29 20.5 29 18.5 28 Z" fill="url(#awningGold)"/>
  <!-- 条纹3 (中深红) -->
  <path d="M 28 15 L 36 15 L 36.5 28 C 34.5 29 29.5 29 27.5 28 Z" fill="url(#awningRed)"/>
  <!-- 条纹4 (金) -->
  <path d="M 36 15 L 44 15 L 45.5 28 C 43.5 29 38.5 29 36.5 28 Z" fill="url(#awningGold)"/>
  <!-- 条纹5 (右深红) -->
  <path d="M 44 15 L 52 15 L 53.5 28 C 52 29 47.5 29 45.5 28 Z" fill="url(#awningRed)"/>

  <!-- 篷顶金属边梁 -->
  <rect x="11" y="14" width="42" height="2.5" rx="1" fill="url(#shopGold)"/>
  <!-- 篷沿波浪花边装饰线 -->
  <path d="M 10.5 28 Q 14.5 31 18.5 28 Q 23 31 27.5 28 Q 32 31 36.5 28 Q 41 31 45.5 28 Q 49.5 31 53.5 28" 
        fill="none" stroke="url(#shopGold)" stroke-width="1.2" stroke-linecap="round"/>

  <!-- 6. 店铺门口大理石台阶 -->
  <rect x="9" y="55" width="46" height="4.5" rx="1.5" fill="url(#shopGold)" stroke="#78350f" stroke-width="0.8"/>
  <line x1="10" y1="56.2" x2="54" y2="56.2" stroke="#ffffff" stroke-width="0.8" opacity="0.6"/>

  <!-- 7. 右上角璀璨闪烁高光星 -->
  <polygon points="52,10 53.2,13.5 56.5,14 53.2,14.5 52,18 50.8,14.5 47.5,14 50.8,13.5" fill="#fef08a"/>
</svg>
`);

export const VAULT_GALLERY_ICON_SVG = STORE_SHOP_ICON_SVG;

// 7. 排行榜图标：冠军金杯 · 荣耀之巅奖杯 (Golden Champion Trophy Cup · 绝顶胜者榜首)
export const LEADERBOARD_TROPHY_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="tropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="65%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="basePlinth" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="50%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <!-- 冠军奖杯主杯体 (大形饱满，极其醒目) -->
  <path d="M 19 14 L 45 14 C 45 28 39 37 32 37 C 25 37 19 28 19 14 Z" fill="url(#tropGrad)"/>
  <ellipse cx="32" cy="14" rx="13" ry="3.2" fill="#ffffff" opacity="0.95"/>
  <!-- 双耳把手 (粗壮有力) -->
  <path d="M 19 16 C 9 16 9 29 19 31" fill="none" stroke="url(#tropGrad)" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M 45 16 C 55 16 55 29 45 31" fill="none" stroke="url(#tropGrad)" stroke-width="3.5" stroke-linecap="round"/>
  <!-- 杯座立柱 -->
  <rect x="29.5" y="37" width="5" height="8" fill="url(#tropGrad)"/>
  <!-- 稳固底座 -->
  <rect x="22" y="45" width="20" height="3.5" rx="1" fill="#d97706"/>
  <rect x="17" y="48.5" width="30" height="5.5" rx="1.5" fill="url(#basePlinth)"/>
  <!-- 杯心冠军星 ★ -->
  <polygon points="32,20 33.5,24 38,24 34.5,26.8 35.8,31 32,28.2 28.2,31 29.5,26.8 26,24 30.5,24" fill="#ffffff"/>
  <!-- 巅峰八芒荣耀星芒 -->
  <polygon points="32,5 33.2,8.5 36.5,9 33.2,9.8 32,13 30.8,9.8 27.5,9 30.8,8.5" fill="#ffffff"/>
</svg>
`);

// 8. 我的/个人中心图标：尊贵金冠 · 典雅贵族头像 (Noble Avatar Silhouette & Crown Halo · 个人中心秒识)
export const DIGITAL_TWIN_USER_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="userGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <!-- 纯正大头像头部圆形 (饱满纯净) -->
  <circle cx="32" cy="20" r="10" fill="url(#userGrad)"/>
  <ellipse cx="28.5" cy="17" rx="3.8" ry="2.5" fill="#ffffff" opacity="0.85"/>
  <!-- 雄浑挺拔的双肩胸像轮廓 -->
  <path d="M 15 50 C 15 37 23 33 32 33 C 41 33 49 37 49 50 C 44 52.5 38 53.5 32 53.5 C 26 53.5 20 52.5 15 50 Z" fill="url(#userGrad)"/>
  <!-- 领带 / V领尊荣切线 -->
  <path d="M 27 34 L 32 43 L 37 34" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
  <!-- 尊崇荣耀星冠小光弧 -->
  <path d="M 22 11 C 28 7 36 7 42 11" fill="none" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="32" cy="6" r="1.8" fill="#ffffff"/>
</svg>
`);

// ==============================================================================
// 🔊 极简高奢控制台图标 (Console Audio & Ambience Icons) · 融入 Dock 栏
// ==============================================================================

// 9. 音效开启图标：立体金声 · 黄金喇叭双重声波 (3D Golden Loudspeaker Horn & Crisp Acoustic Wave)
export const SOUND_ON_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="spkBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#fef08a"/>
      <stop offset="75%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="spkWave" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <!-- 喇叭矩形后腔 -->
  <rect x="10" y="23" width="12" height="18" rx="3" fill="url(#spkBody)"/>
  <!-- 喇叭口锥体 -->
  <path d="M 22 23 L 37 13 C 39.5 11.5 42 13 42 16 L 42 48 C 42 51 39.5 52.5 37 51 L 22 41 Z" fill="url(#spkBody)"/>
  <line x1="22" y1="23" x2="38" y2="13" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
  <!-- 声波 1 (近) -->
  <path d="M 47 21 C 51.5 26.5 51.5 37.5 47 43" fill="none" stroke="url(#spkWave)" stroke-width="3.5" stroke-linecap="round"/>
  <!-- 声波 2 (远) -->
  <path d="M 54 14 C 61 22 61 42 54 50" fill="none" stroke="url(#spkWave)" stroke-width="3" stroke-linecap="round"/>
  <circle cx="28" cy="27" r="1.8" fill="#ffffff"/>
</svg>
`);

// 10. 静音图标：静音喇叭 · 鲜明静音叉号 (Muted Speaker & Coral Red Cross · 静音一目了然)
export const SOUND_MUTE_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="muteBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="50%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
    <linearGradient id="muteSlash" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fca5a5"/>
      <stop offset="50%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
  </defs>
  <!-- 喇叭矩形后腔 -->
  <rect x="10" y="23" width="12" height="18" rx="3" fill="url(#muteBody)"/>
  <!-- 喇叭口锥体 -->
  <path d="M 22 23 L 37 13 C 39.5 11.5 42 13 42 16 L 42 48 C 42 51 39.5 52.5 37 51 L 22 41 Z" fill="url(#muteBody)"/>
  <line x1="22" y1="23" x2="38" y2="13" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>
  <!-- 静音 X 符号 -->
  <line x1="47" y1="26" x2="57" y2="38" stroke="url(#muteSlash)" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="57" y1="26" x2="47" y2="38" stroke="url(#muteSlash)" stroke-width="3.5" stroke-linecap="round"/>
</svg>
`);

// 11. 抽烟环境图标：天地穹顶 · 日月同辉与极光山峦 (Celestial Atmosphere World & Mountain Peaks · 环境场景一眼秒识)
export const SCENE_AMBIENT_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="mainPeak" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#6ee7b7"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="backPeak" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
    <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#67e8f9"/>
      <stop offset="50%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
  </defs>
  <!-- 宏伟时空天球外环轨道 (宇宙穹顶感，代表时空与环境) -->
  <ellipse cx="32" cy="32" rx="27" ry="12" fill="none" stroke="url(#orbitGrad)" stroke-width="1.4" opacity="0.75" transform="rotate(-25 32 32)"/>
  <circle cx="10" cy="21" r="1.5" fill="#67e8f9"/>
  <!-- 晨曦红日与皎月金辉 -->
  <circle cx="44" cy="18" r="7.5" fill="url(#sunGrad)"/>
  <ellipse cx="46" cy="16" rx="3.5" ry="3.5" fill="#ffffff" opacity="0.6"/>
  <!-- 后山峻岭 -->
  <polygon points="38,22 56,48 20,48" fill="url(#backPeak)"/>
  <!-- 前景巍峨雪山主峰 -->
  <polygon points="21,17 42,48 1,48" fill="url(#mainPeak)"/>
  <!-- 银雪高光峰顶 -->
  <polygon points="21,17 27,27 23,28 20,26 16,28" fill="#ffffff"/>
  <!-- 环山流云祥雾 -->
  <path d="M 14 46 C 14 41 19 39 25 39 C 29 36 35 36 39 39 C 43 39 48 41 48 46 C 48 49 43 51 25 51 Z" fill="#ffffff" opacity="0.9"/>
  <circle cx="53" cy="40" r="1.2" fill="#ffffff"/>
</svg>
`);

// ==============================================================================
// 👑 腾讯获奖级 暗黑奇幻游戏 UI 异形侧边栏外框 (Tencent Award-Grade Dark Fantasy Dock Frame)
// 极细香槟流金微雕边框 (Razor-Slim Luxury Gold Edge · 纤巧精工 · 告别粗重与双重杂线)
// 优雅连续 S 形圆润曲线 · 加长严密包裹全部 9 枚功能按钮
// ==============================================================================
export const DOCK_FLUID_SHELL_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116 1000" preserveAspectRatio="none" width="100%" height="100%">
  <defs>
    <!-- 纯正香槟金统一金属微光渐变 (去除顶部和底部的透明衰减，全段亮度与色调饱满一致) -->
    <linearGradient id="goldSpineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="15%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="85%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>

    <!-- 柔和微晕滤镜 -->
    <filter id="goldTightGlow" x="-20%" y="-2%" width="140%" height="104%">
      <feGaussianBlur stdDeviation="1" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 1. 极致精雕超细香槟金轮廓线 (0.75px 极清细线 · 无杂质发胀 · 纯净通透) -->
  <path d="M 116 0.8 L 70 0.8 Q 12 0.8, 12 85 L 12 915 Q 12 999.2, 70 999.2 L 116 999.2" 
        fill="none" stroke="url(#goldSpineGrad)" stroke-width="0.75" stroke-linecap="round"/>

  <!-- 2. 超细镜面流光丝 (0.25px 极微白金高光，提升精工金属质感) -->
  <path d="M 116 0.8 L 70 0.8 Q 12 0.8, 12 85 L 12 915 Q 12 999.2, 70 999.2 L 116 999.2" 
        fill="none" stroke="#ffffff" stroke-width="0.25" stroke-linecap="round" opacity="0.80"/>
</svg>


`);

// ==============================================================================
// 🌌 一体化贯通式极光星轨流线 (Aurora Stream Rail) · 单条矢量线连续贯通 · 零接缝 · 柔和弯入贴边消散
// ==============================================================================
export const DOCK_AURORA_STREAM_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 1000" preserveAspectRatio="none" width="100%" height="100%">
  <defs>
    <!-- 背景底色渐变 (高奢暗夜黑曜石半透琉璃质感 · 晶莹半透 · 优雅贴边过渡) -->
    <linearGradient id="dockBodyBgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(12, 18, 34, 0.65)"/>
      <stop offset="60%" stop-color="rgba(15, 23, 42, 0.52)"/>
      <stop offset="100%" stop-color="rgba(8, 12, 22, 0.40)"/>
    </linearGradient>

    <!-- 全长极光星轨主色渐变 (10% 舒展流线光羽 -> 天青 -> 幻境靛蓝 -> 幽境幻紫 -> 曜金微耀 -> 幽境幻紫 -> 幻境靛蓝 -> 天青 -> 底端10%光羽) -->
    <linearGradient id="dockStreamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <!-- 顶端微弧消散光羽 (10% 舒展渐变消散 · 贴边优雅平滑消散) -->
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0)"/>
      <stop offset="2%" stop-color="rgba(255, 255, 255, 0.45)"/>
      <stop offset="5%" stop-color="rgba(224, 242, 254, 0.70)"/>
      <stop offset="8%" stop-color="rgba(129, 140, 248, 0.85)"/>
      <stop offset="10%" stop-color="rgba(56, 189, 248, 0.85)"/>
      
      <!-- 中段 Dock 贯通流光 (天青 -> 幻境靛蓝 -> 幽境幻紫 -> 曜金微耀 -> 幽境幻紫 -> 幻境靛蓝 -> 天青) -->
      <stop offset="25%" stop-color="rgba(129, 140, 248, 0.85)"/>
      <stop offset="38%" stop-color="rgba(192, 132, 252, 0.85)"/>
      <stop offset="50%" stop-color="rgba(251, 191, 36, 0.90)"/>
      <stop offset="62%" stop-color="rgba(192, 132, 252, 0.85)"/>
      <stop offset="75%" stop-color="rgba(129, 140, 248, 0.85)"/>
      <stop offset="90%" stop-color="rgba(56, 189, 248, 0.85)"/>

      <!-- 底端微弧消散光羽 (天青极光 -> 幽紫靛蓝 -> 贴边纤细星尘光羽 10% 舒展渐隐) -->
      <stop offset="92%" stop-color="rgba(129, 140, 248, 0.85)"/>
      <stop offset="95%" stop-color="rgba(224, 242, 254, 0.70)"/>
      <stop offset="98%" stop-color="rgba(255, 255, 255, 0.45)"/>
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0)"/>
    </linearGradient>

    <!-- 极光柔和漫射滤镜 -->
    <filter id="dockStreamGlow" x="-30%" y="-10%" width="160%" height="120%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- 0. 极光流线内侧半透底色实体 (零方角 · 零分层 · 100% 严密贴合极光轨线与屏幕右边缘) -->
  <path d="M 100 0 C 65 15, 1.5 50, 1.5 100 L 1.5 900 C 1.5 950, 65 985, 100 1000 L 100 1000 L 100 0 Z" 
        fill="url(#dockBodyBgGrad)"/>

  <!-- 1. 极光漫射外晕层 (全长单条矢量路径连续贯通 · 柔和呼吸微晕) -->
  <path d="M 100 0 C 65 15, 1.5 50, 1.5 100 L 1.5 900 C 1.5 950, 65 985, 100 1000" 
        stroke="url(#dockStreamGrad)" stroke-width="2.8" fill="none" opacity="0.30" filter="url(#dockStreamGlow)"/>

  <!-- 2. 极光星轨主光束 (1.2px 纤细高奢流线 · 纯净流光 · 零接缝) -->
  <path d="M 100 0 C 65 15, 1.5 50, 1.5 100 L 1.5 900 C 1.5 950, 65 985, 100 1000" 
        stroke="url(#dockStreamGrad)" stroke-width="1.2" fill="none" stroke-linecap="round"/>

  <!-- 3. 顶端与底端消散处的纤细星尘光羽粒子 -->
  <circle cx="99.5" cy="3" r="1.2" fill="#ffffff" opacity="0.65"/>
  <circle cx="95" cy="9" r="0.8" fill="#38bdf8" opacity="0.55"/>
  <circle cx="95" cy="991" r="0.8" fill="#38bdf8" opacity="0.55"/>
  <circle cx="99.5" cy="997" r="1.2" fill="#ffffff" opacity="0.65"/>
</svg>
`);

// 顶端流线极光光羽 (向上延伸贴边 · 角度平缓收窄凝聚成羽消散 · 零直角)
export const DOCK_AURORA_TOP_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 160" width="100%" height="100%">
  <defs>
    <!-- 极光星轨主光束渐变 (衔接处极光天青 -> 幻境靛蓝 -> 幽境幻紫 -> 星尘天青白消散) -->
    <linearGradient id="topBeamGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(56, 189, 248, 0.85)"/>
      <stop offset="28%" stop-color="rgba(129, 140, 248, 0.85)"/>
      <stop offset="58%" stop-color="rgba(192, 132, 252, 0.80)"/>
      <stop offset="82%" stop-color="rgba(224, 242, 254, 0.60)"/>
      <stop offset="96%" stop-color="rgba(255, 255, 255, 0.35)"/>
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0)"/>
    </linearGradient>

    <filter id="topGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- 1. 极光漫射外晕层 (柔和微晕) -->
  <path d="M 0 160 C 0 95, 96 30, 100 0" 
        stroke="url(#topBeamGrad)" stroke-width="2.5" fill="none" opacity="0.25" filter="url(#topGlow)"/>

  <!-- 2. 极光星轨主光束 (1.2px 纤细流线 · 纯净流光) -->
  <path d="M 0 160 C 0 95, 96 30, 100 0" 
        stroke="url(#topBeamGrad)" stroke-width="1.2" fill="none" stroke-linecap="round"/>

  <!-- 3. 顶端消散处的纤细星尘光羽 -->
  <circle cx="99.5" cy="5" r="1.2" fill="#ffffff" opacity="0.65"/>
  <circle cx="99.8" cy="14" r="0.8" fill="#38bdf8" opacity="0.5"/>
</svg>
`);

// 底端流线极光光羽 (向下延伸贴边 · 角度平缓收窄凝聚成羽消散 · 零直角)
export const DOCK_AURORA_BOTTOM_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 160" width="100%" height="100%">
  <defs>
    <!-- 极光星轨主光束渐变 (衔接处极光天青 -> 幻境靛蓝 -> 幽境幻紫 -> 星尘天青白消散) -->
    <linearGradient id="bottomBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(56, 189, 248, 0.85)"/>
      <stop offset="28%" stop-color="rgba(129, 140, 248, 0.85)"/>
      <stop offset="58%" stop-color="rgba(192, 132, 252, 0.80)"/>
      <stop offset="82%" stop-color="rgba(224, 242, 254, 0.60)"/>
      <stop offset="96%" stop-color="rgba(255, 255, 255, 0.35)"/>
      <stop offset="100%" stop-color="rgba(255, 255, 255, 0)"/>
    </linearGradient>

    <filter id="bottomGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- 1. 极光漫射外晕层 (柔和微晕) -->
  <path d="M 0 0 C 0 65, 96 130, 100 160" 
        stroke="url(#bottomBeamGrad)" stroke-width="2.5" fill="none" opacity="0.25" filter="url(#bottomGlow)"/>

  <!-- 2. 极光星轨主光束 (1.2px 纤细流线 · 纯净流光) -->
  <path d="M 0 0 C 0 65, 96 130, 100 160" 
        stroke="url(#bottomBeamGrad)" stroke-width="1.2" fill="none" stroke-linecap="round"/>

  <!-- 3. 底端消散处的纤细星尘光羽 -->
  <circle cx="99.5" cy="155" r="1.2" fill="#ffffff" opacity="0.65"/>
  <circle cx="99.8" cy="146" r="0.8" fill="#38bdf8" opacity="0.5"/>
</svg>
`);

// 46. 赛博自律储备金券 · 24K黑金典藏版 (替换原搞笑狗头纸币，符合大厂获奖级轻奢质感)
// 采用高清原生资产路径，完美规避小程序对富文本复杂 SVG Data URI 的解析缺陷，全端 100% 满帧渲染
export const CYBER_GOLD_VOUCHER_SVG = '/images/cyber_gold_voucher.png';

// 47. 抽新烟/续一支图标：自烟盒向上抽出一支崭新名烟 · 曜金星芒与提取动势 (Draw New Cigarette)
export const DRAW_CIG_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="drawCigBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="drawCigFilter" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="drawGoldArrow" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
  </defs>
  <!-- 烟盒轮廓微光托底 -->
  <rect x="18" y="34" width="28" height="24" rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(245,158,11,0.35)" stroke-width="1.2"/>
  <!-- 向上抽出的崭新直立香烟 (倾斜12度向上拔出动态) -->
  <g transform="rotate(-12 32 32)">
    <!-- 烟支白杆 -->
    <rect x="29" y="8" width="6" height="28" rx="1.5" fill="url(#drawCigBody)"/>
    <!-- 过滤嘴黄嘴 -->
    <rect x="29" y="36" width="6" height="14" rx="1.5" fill="url(#drawCigFilter)"/>
    <!-- 金色钢印圆环 -->
    <line x1="29" y1="36" x2="35" y2="36" stroke="#fbbf24" stroke-width="1"/>
  </g>
  <!-- 向上提取动势微光箭头 -->
  <path d="M 44 20 L 48 15 L 52 20" fill="none" stroke="url(#drawGoldArrow)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="48" y1="15" x2="48" y2="28" stroke="url(#drawGoldArrow)" stroke-width="2" stroke-linecap="round"/>
  <!-- 闪耀新烟微星芒 -->
  <polygon points="20,14 21.5,17 24.5,18 21.5,19 20,22 18.5,19 15.5,18 18.5,17" fill="#fbbf24"/>
</svg>
`);

// ==============================================================================
// 🔥 点火器具工坊 5 款专属纯高清矢量 SVG 图标 (100% 免字体/跨端零缺失渲染)
// ==============================================================================

// 1. 经典砂轮机 (滚花砂轮 + 防风罩 + 跃动火苗)
export const TOOL_FLINT_LIGHTER_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <!-- 火苗外焰 -->
  <path d="M 32 6 Q 38 16 35 24 Q 40 20 38 14 Q 42 22 36 28 C 30 34 26 28 26 22 Q 26 12 32 6 Z" fill="#ff7700"/>
  <!-- 火苗内焰 (金黄) -->
  <path d="M 32 14 Q 35 20 33 26 C 29 28 28 24 29 20 Q 30 15 32 14 Z" fill="#ffea00"/>
  <!-- 砂轮与防风金属罩 -->
  <rect x="22" y="27" width="20" height="9" rx="3" fill="#94a3b8" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="28" y1="29" x2="28" y2="34" stroke="#475569" stroke-width="1.5"/>
  <line x1="32" y1="29" x2="32" y2="34" stroke="#475569" stroke-width="1.5"/>
  <line x1="36" y1="29" x2="36" y2="34" stroke="#475569" stroke-width="1.5"/>
  <!-- 滚花砂轮圆轮 -->
  <circle cx="40" cy="31" r="5" fill="#64748b" stroke="#e2e8f0" stroke-width="1.5"/>
  <!-- 机身 (黄铜质感) -->
  <rect x="22" y="36" width="20" height="23" rx="4" fill="#d97706" stroke="#fbbf24" stroke-width="2"/>
  <line x1="26" y1="39" x2="26" y2="56" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round"/>
</svg>
`);

// 2. 红头木质火柴 (白烟 + 红磷火柴头 + 纹理木杆)
export const TOOL_VINTAGE_MATCH_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <!-- 燃烧火苗与微烟 -->
  <path d="M 44 8 C 50 14 47 22 41 24 C 37 25 36 21 39 18 C 36 18 35 14 38 11 Q 41 7 44 8 Z" fill="#ef4444"/>
  <path d="M 42 12 Q 45 16 41 20 C 39 20 38 18 40 15 Z" fill="#fbbf24"/>
  <!-- 红磷火柴头 (椭圆) -->
  <ellipse cx="37" cy="27" rx="5.5" ry="7.5" transform="rotate(-35 37 27)" fill="#b91c1c" stroke="#dc2626" stroke-width="1.5"/>
  <!-- 木质火柴棒斜插 -->
  <line x1="34" y1="31" x2="16" y2="55" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
  <line x1="32" y1="33" x2="18" y2="52" stroke="#fef3c7" stroke-width="1.5" stroke-linecap="round"/>
</svg>
`);

// 3. 雪茄蓝焰喷枪 (三束等离子蓝焰火锥 + 战术喷口)
export const TOOL_BLUE_TORCH_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <!-- 核心强劲蓝焰 (等离子青蓝) -->
  <path d="M 32 5 Q 35 15 34 23 Q 32 24 30 23 Q 29 15 32 5 Z" fill="#38bdf8"/>
  <path d="M 26 10 Q 28 17 29 23 Q 27 24 25 22 Q 24 16 26 10 Z" fill="#06b6d4" opacity="0.9"/>
  <path d="M 38 10 Q 40 16 39 22 Q 37 24 35 23 Q 36 17 38 10 Z" fill="#06b6d4" opacity="0.9"/>
  <path d="M 32 9 Q 34 16 33 21 Q 32 22 31 21 Q 30 16 32 9 Z" fill="#ffffff"/>
  <!-- 喷嘴基座 -->
  <rect x="23" y="24" width="18" height="7" rx="2" fill="#334155" stroke="#06b6d4" stroke-width="1.5"/>
  <circle cx="27" cy="27" r="1.5" fill="#06b6d4"/>
  <circle cx="32" cy="27" r="1.5" fill="#06b6d4"/>
  <circle cx="37" cy="27" r="1.5" fill="#06b6d4"/>
  <!-- 喷枪握把机体 -->
  <rect x="24" y="31" width="16" height="27" rx="4" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
  <rect x="27" y="35" width="10" height="18" rx="2" fill="#1e293b"/>
  <!-- 点火按压板 -->
  <rect x="18" y="34" width="6" height="12" rx="2" fill="#0284c7"/>
</svg>
`);

// 4. 赛博等离子双弧打火机 (航天钛金机身 + 4枚陶瓷电极柱 + 交叉高能紫青双弧)
export const TOOL_PLASMA_ARC_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="plasmaBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <radialGradient id="plasmaHaloGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#c084fc"/>
      <stop offset="70%" stop-color="#7c3aed" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- 高能电离背景光晕 -->
  <circle cx="32" cy="18" r="16" fill="url(#plasmaHaloGrad)"/>
  <!-- 4枚高压绝缘陶瓷电极柱 -->
  <rect x="21" y="20" width="4" height="8" rx="1.5" fill="#94a3b8" stroke="#475569" stroke-width="0.8"/>
  <circle cx="23" cy="21" r="1.2" fill="#e2e8f0"/>
  <rect x="39" y="20" width="4" height="8" rx="1.5" fill="#94a3b8" stroke="#475569" stroke-width="0.8"/>
  <circle cx="41" cy="21" r="1.2" fill="#e2e8f0"/>
  <rect x="21" y="10" width="4" height="8" rx="1.5" fill="#94a3b8" stroke="#475569" stroke-width="0.8"/>
  <circle cx="23" cy="15" r="1.2" fill="#e2e8f0"/>
  <rect x="39" y="10" width="4" height="8" rx="1.5" fill="#94a3b8" stroke="#475569" stroke-width="0.8"/>
  <circle cx="41" cy="15" r="1.2" fill="#e2e8f0"/>
  <!-- 交叉高能等离子双弧 (X型电离电浆) -->
  <path d="M 23 21 Q 28 16 32 17 Q 36 18 41 15" fill="none" stroke="#c084fc" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M 23 15 Q 28 18 32 17 Q 36 16 41 21" fill="none" stroke="#38bdf8" stroke-width="2.4" stroke-linecap="round"/>
  <!-- 交叉核心超高能白炽光斑 -->
  <circle cx="32" cy="17" r="2.8" fill="#ffffff"/>
  <circle cx="32" cy="17" r="4.8" fill="none" stroke="#e0e7ff" stroke-width="0.8" opacity="0.85"/>
  <!-- 航天钛金长方形机身 -->
  <rect x="19" y="27" width="26" height="31" rx="4" fill="url(#plasmaBodyGrad)" stroke="#a855f7" stroke-width="1.8"/>
  <!-- 机身极客发光电量指示柱 -->
  <rect x="29" y="33" width="6" height="2" rx="1" fill="#38bdf8"/>
  <rect x="29" y="37" width="6" height="2" rx="1" fill="#a855f7"/>
  <rect x="29" y="41" width="6" height="2" rx="1" fill="#a855f7"/>
  <rect x="29" y="45" width="6" height="2" rx="1" fill="#475569"/>
  <!-- 触摸点火微动按键 -->
  <circle cx="32" cy="52" r="2.2" fill="none" stroke="#a855f7" stroke-width="1"/>
  <circle cx="32" cy="52" r="1" fill="#c084fc"/>
</svg>
`);

// 向后兼容保留
export const TOOL_CAR_LIGHTER_SVG = TOOL_PLASMA_ARC_SVG;

// 5. Zippo 纯铜打火机 (标志性掀盖 45度角 + 防风烟囱气孔 + 金黄油焰)
export const TOOL_ZIPPO_VINTAGE_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <!-- 金黄火苗 -->
  <path d="M 32 6 Q 37 14 34 22 C 30 25 27 22 28 17 Q 29 11 32 6 Z" fill="#fbbf24"/>
  <path d="M 32 12 Q 34 16 33 21 C 31 22 29 20 30 17 Z" fill="#ffffff"/>
  <!-- 防风孔金属烟囱 (带圆孔) -->
  <rect x="26" y="21" width="12" height="11" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
  <circle cx="29" cy="25" r="1" fill="#475569"/>
  <circle cx="35" cy="25" r="1" fill="#475569"/>
  <circle cx="32" cy="28" r="1" fill="#475569"/>
  <!-- 掀开的上盖 (45度倾斜) -->
  <path d="M 23 32 L 13 18 L 22 12 L 29 27 Z" fill="#b45309" stroke="#fde047" stroke-width="1.8"/>
  <circle cx="23" cy="32" r="1.8" fill="#fde047"/>
  <!-- 纯铜长方体下机身 -->
  <rect x="23" y="32" width="22" height="26" rx="3" fill="#d97706" stroke="#fde047" stroke-width="2"/>
  <!-- 机身经典铜丝拉丝纹 -->
  <line x1="27" y1="36" x2="27" y2="54" stroke="#b45309" stroke-width="1.5"/>
  <line x1="41" y1="36" x2="41" y2="54" stroke="#fef08a" stroke-width="1.5"/>
</svg>
`);

// 6. 胜利结算荣誉勋章 (腾讯游戏级 24K 曜金勋章 + 八芒光芒 + 浮雕微光五角星)
export const VICTORY_MEDAL_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <radialGradient id="vMedalGold" cx="35%" cy="28%" r="65%">
      <stop offset="0%" stop-color="#fff7c0"/>
      <stop offset="35%" stop-color="#fbbf24"/>
      <stop offset="75%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </radialGradient>
    <radialGradient id="vMedalCore" cx="45%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </radialGradient>
  </defs>
  <!-- 耀世八角星芒光环 -->
  <g fill="#fbbf24" opacity="0.85" transform="translate(50,50)">
    <rect x="-3" y="-48" width="6" height="16" rx="3"/>
    <rect x="-3" y="-48" width="6" height="16" rx="3" transform="rotate(45)"/>
    <rect x="-3" y="-48" width="6" height="16" rx="3" transform="rotate(90)"/>
    <rect x="-3" y="-48" width="6" height="16" rx="3" transform="rotate(135)"/>
    <rect x="-3" y="-48" width="6" height="16" rx="3" transform="rotate(180)"/>
    <rect x="-3" y="-48" width="6" height="16" rx="3" transform="rotate(225)"/>
    <rect x="-3" y="-48" width="6" height="16" rx="3" transform="rotate(270)"/>
    <rect x="-3" y="-48" width="6" height="16" rx="3" transform="rotate(315)"/>
  </g>
  <!-- 外曜金圆徽外盘 -->
  <circle cx="50" cy="50" r="37" fill="url(#vMedalGold)" stroke="#fef08a" stroke-width="2"/>
  <circle cx="50" cy="50" r="33" fill="none" stroke="#78350f" stroke-width="1" opacity="0.45"/>
  <!-- 内嵌核心宝玉圆盘 -->
  <circle cx="50" cy="50" r="28" fill="url(#vMedalCore)" stroke="#fef08a" stroke-width="1.5"/>
  <!-- 立体浮雕金星 -->
  <polygon points="50,26 55.5,39 69,40 58.5,49 62.5,63 50,54 37.5,63 41.5,49 31,40 44.5,39" fill="#451a03" opacity="0.8"/>
  <polygon points="50,28 54.5,39 66,40 57,48 60.5,60 50,52 39.5,60 43,48 34,40 45.5,39" fill="#fef08a"/>
  <!-- 高光弧线光影 -->
  <ellipse cx="44" cy="38" rx="12" ry="7" fill="#ffffff" opacity="0.32" transform="rotate(-25,44,38)"/>
</svg>
`);

// ============================================================================
// 17. 👑 人体自愈数字孪生体 · 4大靶器官平滑全息三次贝塞尔流线 (Smooth Cubic Bézier Splines)
// 告别呆板机械90°直角，仿生生物神经与血管流动弧度，腾讯大厂级全息微光矢量渲染
// ============================================================================
export const HUD_LEAD_CURVES = {
  // 左上：双肺与咽喉 (宽66rpx, 高92rpx · 自左向右下自然俯冲弧线)
  lungs: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 92" width="100%" height="100%">
  <defs>
    <linearGradient id="gLung" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#38bdf8" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#7dd3fc" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <!-- 光晕底层 -->
  <path d="M 0 2 C 36 2, 64 42, 64 90" fill="none" stroke="#38bdf8" stroke-width="5" stroke-opacity="0.22" stroke-linecap="round"/>
  <!-- 核心高精贝塞尔流线 -->
  <path d="M 0 2 C 36 2, 64 42, 64 90" fill="none" stroke="url(#gLung)" stroke-width="2.5" stroke-linecap="round"/>
</svg>
`),

  // 右上：心血管系统 (宽106rpx, 高112rpx · 自右向左下向心汇流弧线)
  heart: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 106 112" width="100%" height="100%">
  <defs>
    <linearGradient id="gHeart" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#f59e0b" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#fde047" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <!-- 光晕底层 -->
  <path d="M 106 2 C 55 2, 2 52, 2 110" fill="none" stroke="#f59e0b" stroke-width="5" stroke-opacity="0.22" stroke-linecap="round"/>
  <!-- 核心高精贝塞尔流线 -->
  <path d="M 106 2 C 55 2, 2 52, 2 110" fill="none" stroke="url(#gHeart)" stroke-width="2.5" stroke-linecap="round"/>
</svg>
`),

  // 左下：脑-肠自主神经轴 (宽108rpx, 高165rpx · 自左向右上神经冲动上升弧线)
  brain: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 165" width="100%" height="100%">
  <defs>
    <linearGradient id="gBrain" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c084fc" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#c084fc" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#e9d5ff" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <!-- 光晕底层 -->
  <path d="M 0 163 C 60 163, 106 95, 106 2" fill="none" stroke="#c084fc" stroke-width="5" stroke-opacity="0.22" stroke-linecap="round"/>
  <!-- 核心高精贝塞尔流线 -->
  <path d="M 0 163 C 60 163, 106 95, 106 2" fill="none" stroke="url(#gBrain)" stroke-width="2.5" stroke-linecap="round"/>
</svg>
`),

  // 右下：血液微循环 (宽60rpx, 高52rpx · 自右向左上向心分支弧线)
  blood: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 52" width="100%" height="100%">
  <defs>
    <linearGradient id="gBlood" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#34d399" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#a7f3d0" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <!-- 光晕底层 -->
  <path d="M 60 50 C 26 50, 2 28, 2 2" fill="none" stroke="#34d399" stroke-width="5" stroke-opacity="0.22" stroke-linecap="round"/>
  <!-- 核心高精贝塞尔流线 -->
  <path d="M 60 50 C 26 50, 2 28, 2 2" fill="none" stroke="url(#gBlood)" stroke-width="2.5" stroke-linecap="round"/>
</svg>
`)
};

// ============================================================================
// 18. 🪙 紫铜托盘/烟灰缸 高清跨端矢量图标 (全平台免 Emoji 缺失问题)
// ============================================================================
export const ASHTRAY_BRONZE_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <defs>
    <radialGradient id="ashtrayRimGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="25%" stop-color="#d97706"/>
      <stop offset="70%" stop-color="#78350f"/>
      <stop offset="100%" stop-color="#451a03"/>
    </radialGradient>
    <radialGradient id="ashtrayBedGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#262626"/>
      <stop offset="70%" stop-color="#171717"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </radialGradient>
  </defs>
  <!-- 外盘紫铜金属底圈 -->
  <circle cx="24" cy="24" r="22" fill="url(#ashtrayRimGrad)" stroke="#fef08a" stroke-width="1.5"/>
  <circle cx="24" cy="24" r="19" fill="none" stroke="#f59e0b" stroke-width="0.8" stroke-dasharray="2 1.5" opacity="0.6"/>
  <!-- 内部凹槽 -->
  <circle cx="24" cy="24" r="16" fill="url(#ashtrayBedGrad)" stroke="#78350f" stroke-width="1"/>
  <!-- 搁烟金属凹槽 (左右上三向) -->
  <rect x="2" y="22" width="8" height="4" rx="2" fill="#d97706"/>
  <rect x="38" y="22" width="8" height="4" rx="2" fill="#d97706"/>
  <rect x="22" y="2" width="4" height="8" rx="2" fill="#d97706"/>
  <!-- 底部微距暖金星点 -->
  <circle cx="20" cy="22" r="1.5" fill="#ca8a04"/>
  <circle cx="27" cy="25" r="1.2" fill="#991b1b"/>
  <circle cx="23" cy="28" r="1.8" fill="#e5e7eb" opacity="0.8"/>
</svg>
`);

// 扫帚/拂尘清洗图标
export const BROOM_CLEAN_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100%" height="100%">
  <!-- 斜向木质柄 -->
  <line x1="38" y1="10" x2="22" y2="26" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
  <circle cx="39" cy="9" r="2.5" fill="#f59e0b"/>
  <!-- 扎绳接箍 -->
  <rect x="18" y="24" width="8" height="4" rx="1.5" fill="#d97706" transform="rotate(-45 22 26)"/>
  <!-- 棕刷毛 / 拂尘 (金黄渐变) -->
  <path d="M 20 28 L 8 40 C 7 42 10 44 14 42 L 24 32 Z" fill="#fde047" stroke="#ca8a04" stroke-width="1"/>
  <!-- 刷毛丝纹 -->
  <line x1="16" y1="31" x2="9" y2="40" stroke="#b45309" stroke-width="1"/>
  <line x1="19" y1="33" x2="12" y2="42" stroke="#b45309" stroke-width="1"/>
  <!-- 扬起的微尘光星 -->
  <circle cx="10" cy="26" r="1.5" fill="#fef08a" opacity="0.85"/>
  <circle cx="6" cy="32" r="1.2" fill="#ffffff" opacity="0.9"/>
  <circle cx="16" cy="20" r="1.2" fill="#fef08a" opacity="0.7"/>
</svg>
`);


