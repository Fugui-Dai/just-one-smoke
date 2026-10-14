// utils/vectorIcons.js
/**
 * 高清跨端矢量图标库 (100% 解决高版本 Emoji 在 Windows/Android 缺失无法显示的问题)
 * 纯原生 SVG Data URI 编码，全平台免字体依赖、超高清矢量渲染
 */

function svgToUri(svgString) {
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

// 7. 纯净精品商店图标 (去除 Emoji 自带的 "24" 字样，保留经典遮阳棚与暖光橱窗)
export const STORE_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <!-- 顶部纯净屋檐横梁 (彻底去除 24 小时字样) -->
  <rect x="10" y="10" width="44" height="7" rx="2.5" fill="#f59e0b" stroke="#b45309" stroke-width="1.2"/>
  <line x1="14" y1="13.5" x2="50" y2="13.5" stroke="#fef08a" stroke-width="1.5" stroke-linecap="round"/>

  <!-- 店铺主体墙面 -->
  <rect x="12" y="27" width="40" height="27" rx="1.5" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>

  <!-- 左侧玻璃店门 -->
  <rect x="16" y="33" width="13" height="21" rx="1" fill="#38bdf8" stroke="#0284c7" stroke-width="1.2"/>
  <line x1="22.5" y1="33" x2="22.5" y2="54" stroke="#0284c7" stroke-width="1.2"/>
  <circle cx="20" cy="44" r="1.1" fill="#fef08a"/>
  <circle cx="25" cy="44" r="1.1" fill="#fef08a"/>

  <!-- 右侧明亮展示橱窗 -->
  <rect x="33" y="33" width="15" height="14" rx="1.5" fill="#7dd3fc" stroke="#0284c7" stroke-width="1.2"/>
  <line x1="36" y1="36" x2="41" y2="44" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>
  <line x1="41" y1="36" x2="44" y2="41" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" opacity="0.75"/>

  <!-- 经典红白相间波浪遮阳棚 -->
  <path d="M 8 17 L 19 17 L 17 28 C 17 30.5 12.5 30.5 10.5 28 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1"/>
  <path d="M 19 17 L 32 17 L 32 28 C 32 30.5 25.5 30.5 24.5 28 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <path d="M 32 17 L 45 17 L 46.5 28 C 45.5 30.5 39 30.5 39 28 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1"/>
  <path d="M 45 17 L 56 17 L 53.5 28 C 51.5 30.5 47 30.5 47 28 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>

  <!-- 底部石阶基座 -->
  <rect x="8" y="54" width="48" height="4.5" rx="2" fill="#94a3b8" stroke="#475569" stroke-width="1.2"/>
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

// 3. 烟雾特效图标：袅袅仙云 · 3D环绕烟圈与璀璨星芒 (Ethereal Smoke Cloud & 3D Smoke Ring · 一眼辨识烟雾特效)
export const SMOKE_VFX_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="cloudGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="50%" stop-color="#e9d5ff"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <!-- 袅袅升腾的仙气灵动烟云团 (云雾主形，一眼辨识为烟雾) -->
  <path d="M 17 46 C 12 46 10 41 12 37 C 10 32 14 26 19 27 C 22 21 30 19 35 23 C 39 20 45 22 47 26 C 52 26 55 31 53 36 C 56 41 52 46 47 46 Z" fill="url(#cloudGrad)"/>
  <!-- 云雾内部翻滚流线 -->
  <path d="M 21 39 C 25 35 33 35 37 39 C 40 37 45 38 47 41" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>
  <!-- 3D 吐出的圆润特效烟圈 (穿云而过) -->
  <ellipse cx="28" cy="22" rx="12" ry="5.5" fill="none" stroke="#ffffff" stroke-width="2.6" transform="rotate(-15 28 22)"/>
  <!-- 魔法特效璀璨四芒星 (✦) -->
  <path d="M 48 11 Q 48 17 54 17 Q 48 17 48 23 Q 48 17 42 17 Q 48 17 48 11 Z" fill="url(#starGold)"/>
  <circle cx="48" cy="17" r="1.3" fill="#ffffff"/>
  <circle cx="15" cy="22" r="1.2" fill="#fef08a"/>
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
  </defs>
  <!-- 45度倾斜饱满香烟 (加粗加显，一目了然) -->
  <g transform="rotate(45 32 32)">
    <!-- 经典黄色过滤嘴 -->
    <rect x="13" y="26" width="14" height="12" rx="2" fill="url(#corkGrad)"/>
    <!-- 滤嘴金箍圈 -->
    <rect x="27" y="26" width="2" height="12" fill="#fef08a"/>
    <!-- 纯白卷烟纸身 -->
    <rect x="29" y="26" width="20" height="12" fill="url(#cigWhite)"/>
    <!-- 烟头炭化灰黑环 -->
    <rect x="49" y="26" width="3" height="12" fill="#475569"/>
    <!-- 红热燃烧炭火心 -->
    <rect x="52" y="26" width="2.5" height="12" rx="1" fill="#ef4444"/>
    <circle cx="53" cy="32" r="2.2" fill="#fef08a"/>
  </g>
  <!-- 抖落的 4 颗金红与烟灰颗粒 -->
  <circle cx="46" cy="41" r="2.5" fill="#f59e0b"/>
  <circle cx="53" cy="36" r="1.8" fill="#fbbf24"/>
  <circle cx="42" cy="50" r="2.2" fill="#e2e8f0"/>
  <circle cx="50" cy="48" r="1.6" fill="#ef4444"/>
  <!-- 弹抖微震光弧 -->
  <path d="M 40 18 C 45 16 50 18 53 22" fill="none" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round"/>
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

// 6. 商店图标：奢享名品店 · 经典波浪篷与展示橱窗 (Luxury Boutique Storefront · 商店百辨不误)
export const VAULT_GALLERY_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="awningRed" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <linearGradient id="awningWhite" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="storeWall" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="100%" stop-color="#fde68a"/>
    </linearGradient>
  </defs>
  <!-- 屋檐顶横梁 -->
  <rect x="10" y="13" width="44" height="5" rx="1.5" fill="#f59e0b"/>
  <line x1="13" y1="15.5" x2="51" y2="15.5" stroke="#ffffff" stroke-width="1.2"/>
  <!-- 醒目红白相间经典波浪遮阳篷 (最具辨识度的商店符号) -->
  <path d="M 10 18 L 18 18 L 16 29 C 16 31 12 31 10 29 Z" fill="url(#awningRed)"/>
  <path d="M 18 18 L 27 18 L 27 29 C 27 31 22 31 20 29 Z" fill="url(#awningWhite)"/>
  <path d="M 27 18 L 37 18 L 38 29 C 38 31 33 31 31 29 Z" fill="url(#awningRed)"/>
  <path d="M 37 18 L 46 18 L 44 29 C 44 31 41 31 39 29 Z" fill="url(#awningWhite)"/>
  <path d="M 46 18 L 54 18 L 52 29 C 52 31 48 31 46 29 Z" fill="url(#awningRed)"/>
  <!-- 店铺主体墙体 -->
  <rect x="12" y="28" width="40" height="23" rx="1.5" fill="url(#storeWall)"/>
  <!-- 左侧展示橱窗 (通透天蓝与反光) -->
  <rect x="16" y="33" width="17" height="13" rx="1.5" fill="#38bdf8"/>
  <line x1="19" y1="35" x2="27" y2="44" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/>
  <!-- 右侧金碧店门 -->
  <rect x="37" y="33" width="11" height="18" rx="1.5" fill="#f59e0b"/>
  <circle cx="39.5" cy="42" r="1.3" fill="#ffffff"/>
  <!-- 门前基座石阶 -->
  <rect x="9" y="51" width="46" height="4" rx="1.5" fill="#d97706"/>
</svg>
`);

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

// 11. 抽烟环境图标：峻岭雪山 · 晨曦红日与环山祥云 (Majestic Mountain Peaks & Rising Sun · 沉浸场景环境)
export const SCENE_AMBIENT_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="mainPeak" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#a7f3d0"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="backPeak" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <!-- 晨曦红日 / 皎月 -->
  <circle cx="45" cy="18" r="8" fill="url(#sunGrad)"/>
  <!-- 后山峻岭 -->
  <polygon points="39,23 57,49 21,49" fill="url(#backPeak)"/>
  <!-- 前景巍峨雪山主峰 -->
  <polygon points="21,18 41,49 1,49" fill="url(#mainPeak)"/>
  <!-- 银雪高光峰顶 -->
  <polygon points="21,18 27,27 23,28 20,26 16,28" fill="#ffffff"/>
  <!-- 环山流云祥雾 -->
  <path d="M 16 46 C 16 41 21 39 26 39 C 29 36 35 36 38 39 C 42 39 46 41 46 46 C 46 49 42 51 26 51 Z" fill="#ffffff" opacity="0.95"/>
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
    <!-- 深空黑曜微透底色 (暗黑奇幻质感 · 纯净深色吸光背景 · 贴合内部轮廓与右侧屏幕边缘) -->
    <linearGradient id="dockPanelBg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(18, 22, 34, 0.95)"/>
      <stop offset="40%" stop-color="rgba(14, 18, 28, 0.92)"/>
      <stop offset="100%" stop-color="rgba(8, 12, 20, 0.88)"/>
    </linearGradient>

    <!-- 古典香槟曜金流光主渐变 (自屏幕顶缘萌生 -> 弧弯明耀 -> 侧柱雅金 -> 底弯明耀 -> 柔和融隐) -->
    <linearGradient id="goldSpineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(245, 197, 120, 0.15)"/>
      <stop offset="2%" stop-color="rgba(254, 240, 199, 0.88)"/>
      <stop offset="6%" stop-color="rgba(245, 197, 120, 0.95)"/>
      <stop offset="25%" stop-color="rgba(229, 184, 105, 0.90)"/>
      <stop offset="50%" stop-color="rgba(255, 247, 218, 1.0)"/>
      <stop offset="75%" stop-color="rgba(229, 184, 105, 0.90)"/>
      <stop offset="94%" stop-color="rgba(245, 197, 120, 0.95)"/>
      <stop offset="98%" stop-color="rgba(254, 240, 199, 0.88)"/>
      <stop offset="100%" stop-color="rgba(245, 197, 120, 0.15)"/>
    </linearGradient>

    <!-- 紧凑微弱金色晕光滤镜 (超微弱弥散，绝不发胀) -->
    <filter id="goldTightGlow" x="-30%" y="-5%" width="160%" height="110%">
      <feGaussianBlur stdDeviation="0.8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 1. 精致微晕漫射层 (超轻柔暖金呼吸微晕，烘托暗夜空间层次) -->
  <path d="M 116 0 C 95 24, 75 46, 55 55 C 35 62, 12 85, 12 115 L 12 885 C 12 915, 35 938, 55 945 C 75 954, 95 976, 116 1000" 
        fill="none" stroke="url(#goldSpineGrad)" stroke-width="2.6" opacity="0.18" filter="url(#goldTightGlow)"/>

  <!-- 2. 极细古铜金立体底线 (2.0px 真实物理深度，建立纤巧金属立体感) -->
  <path d="M 116 0 C 95 24, 75 46, 55 55 C 35 62, 12 85, 12 115 L 12 885 C 12 915, 35 938, 55 945 C 75 954, 95 976, 116 1000" 
        fill="none" stroke="#785226" stroke-width="2.0" stroke-linecap="round" opacity="0.55"/>

  <!-- 3. 香槟金核心流光金属线 (1.3px 纤巧精工微雕 · 纯净极致圆润单轨 S 弯) -->
  <path d="M 116 0 C 95 24, 75 46, 55 55 C 35 62, 12 85, 12 115 L 12 885 C 12 915, 35 938, 55 945 C 75 954, 95 976, 116 1000" 
        fill="none" stroke="url(#goldSpineGrad)" stroke-width="1.3" stroke-linecap="round"/>

  <!-- 4. 镜面纯白金高光丝 (0.5px 超纤细丝光脊线) -->
  <path d="M 116 0 C 95 24, 75 46, 55 55 C 35 62, 12 85, 12 115 L 12 885 C 12 915, 35 938, 55 945 C 75 954, 95 976, 116 1000" 
        fill="none" stroke="#ffffff" stroke-width="0.5" stroke-linecap="round" opacity="0.92"/>

  <!-- 5. 顶端古典流云微雕与灵动星芒花纹装饰 (Oriental Cloud Swirl & Starlight Crest) -->
  <g>
    <!-- 顶端贴边伴行虚线微雕丝 -->
    <path d="M 106 14 C 95 28, 85 36, 75 42 C 65 47, 60 48, 55 55" fill="none" stroke="rgba(254, 240, 199, 0.45)" stroke-width="0.8" stroke-dasharray="2,3"/>
    <!-- 伴行内沿微金丝 -->
    <path d="M 116 8 C 102 30, 80 48, 60 56" fill="none" stroke="rgba(251, 191, 36, 0.65)" stroke-width="0.8"/>
    <!-- 古典流云涡轮卷纹微雕 -->
    <path d="M 88 33 C 85 30, 80 32, 82 36 C 84 39, 89 38, 90 35" fill="none" stroke="#fde047" stroke-width="1.0" stroke-linecap="round"/>
    <circle cx="82" cy="35" r="1.2" fill="#ffffff"/>
    <!-- 弧顶灵动四芒微星 -->
    <path d="M 66 50 L 68 53 L 72 53.5 L 68 54 L 66 57 L 64 54 L 60 53.5 L 64 53 Z" fill="#ffffff" opacity="0.95"/>
    <circle cx="66" cy="53.5" r="0.8" fill="#facc15"/>
    <!-- 渐近收束星尘微粒 -->
    <circle cx="98" cy="20" r="1.3" fill="#ffffff" opacity="0.85"/>
    <circle cx="108" cy="10" r="1.0" fill="#fde047" opacity="0.75"/>
  </g>

  <!-- 6. 底端古典流云微雕与灵动星芒花纹装饰 (镜像对称 Oriental Cloud Swirl) -->
  <g>
    <!-- 底端贴边伴行虚线微雕丝 -->
    <path d="M 106 986 C 95 972, 85 964, 75 958 C 65 953, 60 952, 55 945" fill="none" stroke="rgba(254, 240, 199, 0.45)" stroke-width="0.8" stroke-dasharray="2,3"/>
    <!-- 伴行内沿微金丝 -->
    <path d="M 116 992 C 102 970, 80 952, 60 944" fill="none" stroke="rgba(251, 191, 36, 0.65)" stroke-width="0.8"/>
    <!-- 古典流云涡轮卷纹微雕 -->
    <path d="M 88 967 C 85 970, 80 968, 82 964 C 84 961, 89 962, 90 965" fill="none" stroke="#fde047" stroke-width="1.0" stroke-linecap="round"/>
    <circle cx="82" cy="965" r="1.2" fill="#ffffff"/>
    <!-- 弧底灵动四芒微星 -->
    <path d="M 66 950 L 68 947 L 72 946.5 L 68 946 L 66 943 L 64 946 L 60 946.5 L 64 947 Z" fill="#ffffff" opacity="0.95"/>
    <circle cx="66" cy="946.5" r="0.8" fill="#facc15"/>
    <!-- 渐近收束星尘微粒 -->
    <circle cx="98" cy="980" r="1.3" fill="#ffffff" opacity="0.85"/>
    <circle cx="108" cy="990" r="1.0" fill="#fde047" opacity="0.75"/>
  </g>
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






