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

