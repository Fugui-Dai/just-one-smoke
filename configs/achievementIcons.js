// configs/achievementIcons.js
/**
 * 👑 腾讯获奖级 荣耀称号殿堂 · 16大殿堂级高定矢量图标库 (Tencent Award-Grade Hall of Fame Emblems)
 * 纯原生 SVG 矢量微雕 · 珠宝级多层渐变与金属光影 · 告别粗糙系统 Emoji
 */

import { svgToUri } from '../utils/vectorIcons.js';

export const ACHIEVEMENT_ICONS = {
  // 1. 破土初萌 (Lv.1 · 启蒙): 沃土初萌嫩芽与晨露微星
  title_1: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achSoil" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <linearGradient id="achSprout" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#a7f3d0"/>
    </linearGradient>
    <linearGradient id="achLeafR" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>
  <path d="M 14 52 C 22 47 42 47 50 52 C 45 56 19 56 14 52 Z" fill="url(#achSoil)"/>
  <ellipse cx="32" cy="51" rx="14" ry="3" fill="#78350f" opacity="0.6"/>
  <path d="M 32 50 C 31 38 30 28 27 22" fill="none" stroke="url(#achSprout)" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M 28 23 C 14 22 10 32 18 38 C 24 40 28 32 28 23 Z" fill="url(#achSprout)"/>
  <path d="M 28 23 C 20 28 17 33 21 36" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.8"/>
  <path d="M 28 22 C 34 12 48 14 46 27 C 42 34 32 29 28 22 Z" fill="url(#achLeafR)"/>
  <path d="M 28 22 C 36 18 42 21 42 26" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.8"/>
  <circle cx="43" cy="17" r="2.8" fill="#ffffff"/>
  <circle cx="43" cy="17" r="1.5" fill="#a7f3d0"/>
  <polygon points="32,7 33.5,11 37,12 33.5,13 32,17 30.5,13 27,12 30.5,11" fill="#fef08a"/>
</svg>
`),

  // 2. 第一缕风 (Lv.2 · 启蒙): 穿透胸膛的双层纯净空气流旋
  title_2: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achWind1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(16, 185, 129, 0)"/>
      <stop offset="30%" stop-color="#10b981"/>
      <stop offset="70%" stop-color="#6ee7b7"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="achWind2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(56, 189, 248, 0)"/>
      <stop offset="40%" stop-color="#34d399"/>
      <stop offset="80%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <path d="M 10 38 C 24 38 34 26 44 22 C 52 18 56 24 50 30 C 44 36 34 34 34 28 C 34 22 42 16 52 18" fill="none" stroke="url(#achWind1)" stroke-width="3.8" stroke-linecap="round"/>
  <path d="M 6 48 C 18 48 26 40 38 40 C 46 40 54 36 58 32" fill="none" stroke="url(#achWind2)" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M 16 26 C 26 26 32 18 40 16 C 46 14 50 16 52 20" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
  <circle cx="53" cy="18" r="2.2" fill="#ffffff"/>
  <circle cx="44" cy="22" r="1.6" fill="#fef08a"/>
  <circle cx="38" cy="40" r="1.4" fill="#a7f3d0"/>
  <polygon points="26,14 27.5,17 30,18 27.5,19 26,22 24.5,19 22,18 24.5,17" fill="#ffffff"/>
</svg>
`),

  // 3. 晨曦破晓 (Lv.3 · 启蒙): 跃出苍翠群山的破晓旭日与晨曦圣光
  title_3: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achSunDawn" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="achRayGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="rgba(245, 158, 11, 0)"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <linearGradient id="achMtn" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
  </defs>
  <line x1="32" y1="28" x2="32" y2="8" stroke="url(#achRayGrad)" stroke-width="3" stroke-linecap="round"/>
  <line x1="32" y1="28" x2="16" y2="14" stroke="url(#achRayGrad)" stroke-width="2.6" stroke-linecap="round"/>
  <line x1="32" y1="28" x2="48" y2="14" stroke="url(#achRayGrad)" stroke-width="2.6" stroke-linecap="round"/>
  <line x1="32" y1="28" x2="8" y2="28" stroke="url(#achRayGrad)" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="32" y1="28" x2="56" y2="28" stroke="url(#achRayGrad)" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="32" cy="28" r="14" fill="url(#achSunDawn)"/>
  <circle cx="32" cy="28" r="11" fill="#ffffff" opacity="0.6"/>
  <polygon points="6,54 26,38 46,54" fill="#047857"/>
  <polygon points="24,54 42,34 60,54" fill="url(#achMtn)"/>
  <polygon points="42,34 46,39 44,41 40,39" fill="#ffffff" opacity="0.9"/>
  <line x1="6" y1="53" x2="58" y2="53" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round"/>
</svg>
`),

  // 4. 三日生机 (Lv.4 · 进阶): 跨越峰值的苍蓝生命甘霖与环抱枝蔓
  title_4: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achOrbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#7dd3fc"/>
      <stop offset="70%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0c4a6e"/>
    </linearGradient>
    <linearGradient id="achBranchGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#a5f3fc"/>
    </linearGradient>
  </defs>
  <path d="M 12 48 C 10 32 16 18 32 14" fill="none" stroke="url(#achBranchGrad)" stroke-width="3" stroke-linecap="round"/>
  <path d="M 52 48 C 54 32 48 18 32 14" fill="none" stroke="url(#achBranchGrad)" stroke-width="3" stroke-linecap="round"/>
  <path d="M 14 36 C 6 34 8 26 16 28 C 18 33 16 36 14 36 Z" fill="#38bdf8"/>
  <path d="M 18 24 C 12 18 18 12 24 18 C 24 22 20 24 18 24 Z" fill="#7dd3fc"/>
  <path d="M 50 36 C 58 34 56 26 48 28 C 46 33 48 36 50 36 Z" fill="#38bdf8"/>
  <path d="M 46 24 C 52 18 46 12 40 18 C 40 22 44 24 46 24 Z" fill="#7dd3fc"/>
  <path d="M 32 20 C 32 20 20 34 20 42 C 20 48.6 25.4 54 32 54 C 38.6 54 44 48.6 44 42 C 44 34 32 20 32 20 Z" fill="url(#achOrbGrad)"/>
  <path d="M 25 38 C 23 42 23 46 26 49" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/>
  <circle cx="28" cy="33" r="2" fill="#ffffff"/>
  <polygon points="32,28 33.5,31 36,32 33.5,33 32,36 30.5,33 28,32 30.5,31" fill="#ffffff"/>
</svg>
`),

  // 5. 少抽整盒 (Lv.5 · 进阶): 3D立体的封锁烟盒与纯金安全锁栓
  title_5: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achPackBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="achPackLid" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <linearGradient id="achSealGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <rect x="18" y="24" width="28" height="32" rx="3" fill="url(#achPackBody)" stroke="#38bdf8" stroke-width="1.8"/>
  <rect x="17" y="14" width="30" height="12" rx="2.5" fill="url(#achPackLid)" stroke="#38bdf8" stroke-width="1.8"/>
  <line x1="18" y1="26" x2="46" y2="26" stroke="#0284c7" stroke-width="1.5"/>
  <rect x="29" y="14" width="6" height="42" fill="url(#achSealGold)"/>
  <path d="M 28 32 C 28 27 36 27 36 32 L 36 36 L 28 36 Z" fill="none" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="25" y="36" width="14" height="12" rx="2.5" fill="url(#achSealGold)" stroke="#ffffff" stroke-width="1"/>
  <circle cx="32" cy="41" r="1.8" fill="#451a03"/>
  <line x1="32" y1="41" x2="32" y2="45" stroke="#451a03" stroke-width="1.5"/>
  <polygon points="17,14 18.5,17 21,18 18.5,19 17,22 15.5,19 13,18 15.5,17" fill="#ffffff"/>
  <polygon points="47,48 48.5,50 51,51 48.5,52 47,54 45.5,52 43,51 45.5,50" fill="#38bdf8"/>
</svg>
`),

  // 6. 一顿大餐 (Lv.6 · 进阶): 盛宴金爵金杯与犒劳丰饶美馔
  title_6: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achChalice" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <ellipse cx="32" cy="52" rx="22" ry="5" fill="#0284c7" stroke="#38bdf8" stroke-width="1.8"/>
  <ellipse cx="32" cy="52" rx="18" ry="3.5" fill="#f59e0b"/>
  <path d="M 22 18 L 42 18 C 42 29 37 36 32 36 C 27 36 22 29 22 18 Z" fill="url(#achChalice)"/>
  <ellipse cx="32" cy="18" rx="10" ry="2.5" fill="#ffffff"/>
  <rect x="30" y="36" width="4" height="9" fill="url(#achChalice)"/>
  <ellipse cx="32" cy="45" rx="8" ry="2.5" fill="url(#achChalice)"/>
  <path d="M 22 20 C 14 20 14 30 22 31" fill="none" stroke="url(#achChalice)" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M 42 20 C 50 20 50 30 42 31" fill="none" stroke="url(#achChalice)" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="28" cy="14" r="3" fill="#f87171"/>
  <circle cx="34" cy="13" r="3.5" fill="#fbbf24"/>
  <circle cx="38" cy="15" r="2.8" fill="#34d399"/>
  <path d="M 27 10 C 29 7 26 4 28 2" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
  <path d="M 35 10 C 37 7 34 4 36 2" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
</svg>
`),

  // 7. 七日淬火 (Lv.7 · 稀有): 幽紫三昧灵火淬炼之剑
  title_7: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achBlade" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <linearGradient id="achFireViolet" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#6b21a8"/>
      <stop offset="40%" stop-color="#a855f7"/>
      <stop offset="75%" stop-color="#e879f9"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <path d="M 32 4 C 38 14 52 22 50 38 C 48 50 40 56 32 56 C 24 56 16 50 14 38 C 12 22 26 14 32 4 Z" fill="url(#achFireViolet)" opacity="0.4"/>
  <path d="M 32 8 L 36 18 L 36 46 L 28 46 L 28 18 Z" fill="url(#achBlade)"/>
  <line x1="32" y1="8" x2="32" y2="46" stroke="#7c3aed" stroke-width="1.2"/>
  <rect x="22" y="46" width="20" height="4" rx="2" fill="#c084fc" stroke="#ffffff" stroke-width="1"/>
  <circle cx="32" cy="48" r="2.2" fill="#ffffff"/>
  <rect x="30" y="50" width="4" height="8" fill="#475569"/>
  <circle cx="32" cy="59" r="3" fill="#c084fc"/>
  <path d="M 28 38 C 22 34 22 24 30 20 C 30 26 36 26 34 32" fill="url(#achFireViolet)"/>
  <polygon points="32,4 33.5,7 36,8 33.5,9 32,12 30.5,9 28,8 30.5,7" fill="#ffffff"/>
</svg>
`),

  // 8. 身轻气爽 (Lv.8 · 稀有): 纯净飞升的天使仙羽与通透气旋
  title_8: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achFeather" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#f3e8ff"/>
      <stop offset="70%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
    <linearGradient id="achZephyr" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(192, 132, 252, 0)"/>
      <stop offset="50%" stop-color="#e9d5ff"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <path d="M 12 50 C 22 56 46 54 52 42 C 56 32 46 22 36 22" fill="none" stroke="url(#achZephyr)" stroke-width="2.2" stroke-linecap="round"/>
  <g transform="rotate(-30 32 32)">
    <path d="M 32 8 C 32 24 32 42 32 58" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M 32 10 C 22 14 18 26 20 40 C 22 46 30 50 32 54 C 31 46 30 34 32 10 Z" fill="url(#achFeather)"/>
    <path d="M 32 10 C 42 14 46 26 44 40 C 42 46 34 50 32 54 C 33 46 34 34 32 10 Z" fill="url(#achFeather)"/>
    <path d="M 23 28 L 31 32 M 22 36 L 31 40 M 41 28 L 33 32 M 42 36 L 33 40" stroke="#ffffff" stroke-width="1.2" opacity="0.75"/>
  </g>
  <circle cx="48" cy="14" r="2" fill="#ffffff"/>
  <circle cx="16" cy="22" r="1.5" fill="#fef08a"/>
  <polygon points="52,26 53.5,29 56,30 53.5,31 52,34 50.5,31 48,30 50.5,29" fill="#e9d5ff"/>
</svg>
`),

  // 9. 五盒大关 (Lv.9 · 稀有): 圣殿八角金星战功勋章与贵族双尾绶带
  title_9: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achMedGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="achRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="50%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#6b21a8"/>
    </linearGradient>
  </defs>
  <polygon points="26,38 20,58 26,54 32,58 32,38" fill="url(#achRibbon)"/>
  <polygon points="32,38 32,58 38,54 44,58 38,38" fill="url(#achRibbon)"/>
  <line x1="26" y1="38" x2="26" y2="54" stroke="#fef08a" stroke-width="1.2"/>
  <line x1="38" y1="38" x2="38" y2="54" stroke="#fef08a" stroke-width="1.2"/>
  <rect x="18" y="10" width="28" height="28" rx="2" fill="url(#achMedGold)"/>
  <rect x="18" y="10" width="28" height="28" rx="2" fill="url(#achMedGold)" transform="rotate(45 32 24)"/>
  <circle cx="32" cy="24" r="11" fill="#4c1d95" stroke="#ffffff" stroke-width="1.5"/>
  <polygon points="32,16 34,21 39,21 35,24 36.5,29 32,26 27.5,29 29,24 25,21 30,21" fill="#fef08a"/>
  <circle cx="32" cy="24" r="2.2" fill="#ffffff"/>
  <rect x="27" y="6" width="10" height="4" rx="2" fill="#f59e0b"/>
</svg>
`),

  // 10. 三周蜕变 (Lv.10 · 史诗): 八面晶钻中展翅重生的黄金幻蝶
  title_10: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achDiaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#fef08a"/>
      <stop offset="80%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>
  <polygon points="32,6 48,16 54,34 44,52 32,58 20,52 10,34 16,16" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" stroke-width="1.5"/>
  <path d="M 32 30 C 26 20 12 16 12 28 C 12 36 22 38 32 34 Z" fill="url(#achDiaGrad)"/>
  <path d="M 28 29 C 20 22 17 26 18 32" stroke="#ffffff" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M 32 30 C 38 20 52 16 52 28 C 52 36 42 38 32 34 Z" fill="url(#achDiaGrad)"/>
  <path d="M 36 29 C 44 22 47 26 46 32" stroke="#ffffff" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M 32 34 C 24 36 16 42 22 50 C 28 54 32 42 32 34 Z" fill="url(#achDiaGrad)"/>
  <path d="M 32 34 C 40 36 48 42 42 50 C 36 54 32 42 32 34 Z" fill="url(#achDiaGrad)"/>
  <line x1="32" y1="24" x2="32" y2="44" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M 32 24 C 30 18 24 16 22 18" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 32 24 C 34 18 40 16 42 18" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-linecap="round"/>
  <polygon points="32,6 33.5,10 37,11 33.5,12 32,15 30.5,12 27,11 30.5,10" fill="#ffffff"/>
</svg>
`),

  // 11. 整条奇迹 (Lv.11 · 史诗): 圣堂骑士金冠十字坚毅战盾
  title_11: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achShieldGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="65%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="achCrossPlat" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>
  <line x1="10" y1="10" x2="54" y2="54" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
  <polygon points="10,10 14,8 16,14" fill="#fef08a"/>
  <line x1="54" y1="10" x2="10" y2="54" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
  <polygon points="54,10 50,8 48,14" fill="#fef08a"/>
  <path d="M 32 10 C 46 10 52 14 52 28 C 52 44 40 54 32 58 C 24 54 12 44 12 28 C 12 14 18 10 32 10 Z" fill="url(#achShieldGold)" stroke="#fef08a" stroke-width="2"/>
  <path d="M 32 14 C 43 14 48 18 48 29 C 48 41 38 49 32 53 C 26 49 16 41 16 29 C 16 18 21 14 32 14 Z" fill="#78350f" opacity="0.65"/>
  <polygon points="30,18 34,18 34,26 42,26 42,30 34,30 34,44 30,44 30,30 22,30 22,26 30,26" fill="url(#achCrossPlat)"/>
  <circle cx="32" cy="28" r="2.8" fill="#ffffff"/>
  <circle cx="20" cy="18" r="1.5" fill="#fef08a"/>
  <circle cx="44" cy="18" r="1.5" fill="#fef08a"/>
</svg>
`),

  // 12. 千元逆袭 (Lv.12 · 史诗): 满溢金币与财富圣光的宝藏宝箱
  title_12: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achChestWood" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <linearGradient id="achCoinGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <polygon points="32,6 36,24 28,24" fill="#fef08a" opacity="0.8"/>
  <polygon points="32,2 34,8 39,9 34,10 32,15 30,10 25,9 30,8" fill="#ffffff"/>
  <path d="M 12 32 L 52 32 L 48 54 L 16 54 Z" fill="url(#achChestWood)" stroke="#f59e0b" stroke-width="2"/>
  <rect x="14" y="32" width="36" height="4" fill="#f59e0b"/>
  <path d="M 12 32 C 12 22 22 18 32 18 C 42 18 52 22 52 32 L 48 24 C 48 16 40 12 32 12 C 24 12 16 16 16 24 Z" fill="url(#achCoinGold)"/>
  <ellipse cx="24" cy="30" rx="6" ry="3.5" fill="url(#achCoinGold)"/>
  <ellipse cx="40" cy="30" rx="6" ry="3.5" fill="url(#achCoinGold)"/>
  <ellipse cx="32" cy="27" rx="7" ry="4" fill="url(#achCoinGold)"/>
  <circle cx="32" cy="27" r="2.5" fill="#ffffff"/>
  <ellipse cx="28" cy="33" rx="5" ry="3" fill="#fef08a"/>
  <ellipse cx="36" cy="33" rx="5" ry="3" fill="#fef08a"/>
  <rect x="29" y="32" width="6" height="8" rx="1.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="32" cy="36" r="1.2" fill="#78350f"/>
  <circle cx="18" cy="18" r="2.2" fill="#fef08a"/>
  <circle cx="46" cy="18" r="2.2" fill="#fef08a"/>
</svg>
`),

  // 13. 百日涅槃 (Lv.13 · 传说): 浴火腾空的离火朱雀/神话凤凰烈羽
  title_13: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achPhxFlame" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#991b1b"/>
      <stop offset="35%" stop-color="#ef4444"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <linearGradient id="achPhxWhite" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="60%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <path d="M 32 38 C 24 34 10 24 8 12 C 14 18 18 24 24 24 C 18 16 16 8 22 6 C 24 14 28 20 32 26 Z" fill="url(#achPhxFlame)"/>
  <path d="M 32 38 C 40 34 54 24 56 12 C 50 18 46 24 40 24 C 46 16 48 8 42 6 C 40 14 36 20 32 26 Z" fill="url(#achPhxFlame)"/>
  <path d="M 32 24 C 30 18 31 12 32 10 C 33 12 34 18 32 24 Z" fill="url(#achPhxWhite)"/>
  <polygon points="32,6 33.5,9 35,9.5 33.5,10 32,12 30.5,10 29,9.5 30.5,9" fill="#ffffff"/>
  <path d="M 32 24 C 29 28 28 34 32 40 C 36 34 35 28 32 24 Z" fill="url(#achPhxWhite)"/>
  <path d="M 32 40 C 28 46 20 50 22 58 C 26 52 30 48 32 44" fill="none" stroke="url(#achPhxFlame)" stroke-width="3" stroke-linecap="round"/>
  <path d="M 32 40 C 32 48 32 54 32 60" fill="none" stroke="#fef08a" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M 32 40 C 36 46 44 50 42 58 C 38 52 34 48 32 44" fill="none" stroke="url(#achPhxFlame)" stroke-width="3" stroke-linecap="round"/>
</svg>
`),

  // 14. 千支封神 (Lv.14 · 传说): 劈裂虚空的九天雷神之锤与破魔金雷
  title_14: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achHammerHead" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fca5a5"/>
      <stop offset="70%" stop-color="#e11d48"/>
      <stop offset="100%" stop-color="#881337"/>
    </linearGradient>
    <linearGradient id="achThunderBolt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="28" r="22" fill="none" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6"/>
  <polygon points="36,4 20,28 32,28 24,56 46,24 34,24" fill="url(#achThunderBolt)" stroke="#ffffff" stroke-width="1.2"/>
  <g transform="rotate(35 32 30)">
    <rect x="30" y="24" width="4" height="26" rx="2" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
    <rect x="20" y="14" width="24" height="15" rx="3" fill="url(#achHammerHead)" stroke="#fef08a" stroke-width="2"/>
    <line x1="22" y1="16" x2="42" y2="16" stroke="#ffffff" stroke-width="1.5"/>
    <polygon points="32,17 30,22 33,22 31,26 34,21 31.5,21" fill="#ffffff"/>
  </g>
  <circle cx="16" cy="18" r="2" fill="#ffffff"/>
  <circle cx="48" cy="46" r="2" fill="#fef08a"/>
</svg>
`),

  // 15. 金身不灭 (Lv.15 · 神话): 太阳神圣法环与至尊太阳金王冠
  title_15: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achSunCrown" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="65%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <radialGradient id="achSunHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#fef08a"/>
      <stop offset="80%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="rgba(245, 158, 11, 0)"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="30" r="22" fill="url(#achSunHalo)" opacity="0.35"/>
  <circle cx="32" cy="30" r="19" fill="none" stroke="url(#achSunCrown)" stroke-width="1.8" stroke-dasharray="2,3"/>
  <path d="M 32 6 L 32 10 M 32 50 L 32 54 M 8 30 L 12 30 M 52 30 L 56 30 M 16 14 L 19 17 M 45 43 L 48 46 M 48 14 L 45 17 M 16 46 L 19 43" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M 16 42 L 20 22 L 27 34 L 32 14 L 37 34 L 44 22 L 48 42 Z" fill="url(#achSunCrown)" stroke="#ffffff" stroke-width="1.2"/>
  <rect x="14" y="42" width="36" height="7" rx="2.5" fill="url(#achSunCrown)"/>
  <line x1="16" y1="44" x2="48" y2="44" stroke="#ffffff" stroke-width="1.2"/>
  <circle cx="32" cy="45.5" r="2" fill="#ffffff"/>
  <circle cx="22" cy="45.5" r="1.5" fill="#f43f5e"/>
  <circle cx="42" cy="45.5" r="1.5" fill="#f43f5e"/>
  <polygon points="32,8 33.5,12 37,13 33.5,14 32,18 30.5,14 27,13 30.5,12" fill="#ffffff"/>
  <circle cx="20" cy="22" r="1.8" fill="#ffffff"/>
  <circle cx="44" cy="22" r="1.8" fill="#ffffff"/>
</svg>
`),

  // 16. 无烟圣尊 (Lv.16 · 神话): 盘旋九霄的至尊金龙龙首与纯净圣尊龙珠
  title_16: svgToUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="achDragonGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="65%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <radialGradient id="achPearlGlow" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#a5f3fc"/>
      <stop offset="85%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </radialGradient>
  </defs>
  <path d="M 12 48 C 8 36 14 24 24 20 C 34 16 46 18 52 28 C 56 36 52 46 42 50 C 32 54 22 52 16 46" fill="none" stroke="url(#achDragonGold)" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M 20 20 L 22 15 M 28 17 L 31 12 M 38 18 L 42 14 M 48 22 L 53 19" stroke="#fef08a" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M 24 26 C 24 16 32 10 38 14 C 44 18 42 26 34 28 Z" fill="url(#achDragonGold)"/>
  <path d="M 34 12 C 34 6 39 4 41 2 M 37 7 L 41 9" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
  <path d="M 28 14 C 26 8 22 6 20 4 M 25 9 L 21 11" fill="none" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>
  <circle cx="34" cy="18" r="2.2" fill="#ffffff"/>
  <circle cx="34" cy="18" r="1.2" fill="#dc2626"/>
  <path d="M 36 24 C 42 25 48 23 54 26" fill="none" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M 32 26 C 30 32 24 35 18 36" fill="none" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="34" cy="38" r="8.5" fill="url(#achPearlGlow)" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="31" cy="35" r="2.5" fill="#ffffff" opacity="0.9"/>
  <polygon points="34,28 35.5,31 38,32 35.5,33 34,36 32.5,33 30,32 32.5,31" fill="#ffffff"/>
</svg>
`)
};

export function getAchievementIconUri(id) {
  return ACHIEVEMENT_ICONS[id] || null;
}
