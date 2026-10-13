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

// 5. 掐灭图标 (真实斜压掐熄烟头 · 飞星余烬、袅袅青烟、下压动感 · 珊瑚红/琥珀金/烟青)
export const EXTINGUISH_ICON_SVG = svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <!-- 卷烟纸立体光影渐变 -->
    <linearGradient id="extCigBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <!-- 滤嘴暖金木纹质感渐变 -->
    <linearGradient id="extFilterTip" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <!-- 炽热余烬发光压灭渐变 -->
    <linearGradient id="extEmberGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="25%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <!-- 袅袅熄灭青烟渐变 -->
    <linearGradient id="extSmokeFade" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#cbd5e1" stop-opacity="0.95"/>
      <stop offset="50%" stop-color="#94a3b8" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#e2e8f0" stop-opacity="0.1"/>
    </linearGradient>
  </defs>

  <!-- 1. 烟灰缸基底 / 熄灭接触台面弧线 -->
  <path d="M 8 54 C 20 50 44 50 56 54" stroke="#475569" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.65"/>
  <path d="M 14 53 C 24 50 40 50 50 53" stroke="#f43f5e" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.5"/>

  <!-- 2. 袅袅升腾的熄灭余烟 (双缕飘逸青烟) -->
  <path d="M 23 45 C 13 36 10 26 16 18 C 21 11 17 5 11 2" 
        stroke="url(#extSmokeFade)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M 26 43 C 19 34 17 25 22 17 C 26 11 23 7 19 4" 
        stroke="#f8fafc" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.8"/>

  <!-- 3. 斜压掐灭的香烟本体 (3D圆柱立体结构，由右上角向下按压) -->
  <g transform="rotate(32 29 46)">
    <!-- 金色滤嘴段 -->
    <rect x="24" y="6" width="10" height="12" rx="2" fill="url(#extFilterTip)" stroke="#78350f" stroke-width="0.8"/>
    <line x1="24" y1="16" x2="34" y2="16" stroke="#fef08a" stroke-width="1.2" opacity="0.95"/>
    
    <!-- 纯白卷烟纸本体 -->
    <rect x="24" y="18" width="10" height="20" fill="url(#extCigBody)" stroke="#64748b" stroke-width="0.8"/>
    <line x1="25" y1="24" x2="33" y2="24" stroke="#cbd5e1" stroke-width="0.6"/>
    <line x1="25" y1="30" x2="33" y2="30" stroke="#cbd5e1" stroke-width="0.6"/>

    <!-- 炭黑渐变灰端 -->
    <rect x="23.5" y="38" width="11" height="6" rx="1.2" fill="#1e293b" stroke="#334155" stroke-width="0.6"/>
    
    <!-- 压溃按扁的炽热余烬火核 (变形掐灭) -->
    <path d="M 21.5 44 C 21.5 42.5 24 41.5 29 41.5 C 34 41.5 36.5 42.5 36.5 44 C 37 47 34.5 48.5 29 48.5 C 23.5 48.5 21 47 21.5 44 Z" 
          fill="url(#extEmberGlow)" stroke="#fbbf24" stroke-width="1"/>
  </g>

  <!-- 4. 挤压飞溅的火星微粒 (✦ 星芒与发光火屑) -->
  <!-- 左侧大星芒 -->
  <path d="M 13 40 Q 13 43 10 43 Q 13 43 13 46 Q 13 43 16 43 Q 13 43 13 40 Z" fill="#fbbf24"/>
  <!-- 右侧中星芒 -->
  <path d="M 42 45 Q 42 48 39 48 Q 42 48 42 51 Q 42 48 45 48 Q 42 48 42 45 Z" fill="#f59e0b"/>
  <!-- 细微星芒 -->
  <path d="M 36 36 Q 36 38 34 38 Q 36 38 36 40 Q 36 38 38 38 Q 36 38 36 36 Z" fill="#fef08a"/>
  <!-- 飞散火星光斑 -->
  <circle cx="10" cy="49" r="1.5" fill="#ef4444"/>
  <circle cx="19" cy="53" r="1.2" fill="#fbbf24"/>
  <circle cx="47" cy="42" r="1.2" fill="#f97316"/>
  <circle cx="49" cy="50" r="1.0" fill="#f87171"/>

  <!-- 5. 掐灭动作向下按压力道线 (清晰动作指引) -->
  <path d="M 42 16 L 36 24" stroke="#f43f5e" stroke-width="2.6" stroke-linecap="round" opacity="0.9"/>
  <path d="M 35 19 L 36 25 L 42 24" stroke="#f43f5e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
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


