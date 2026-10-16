// utils/sceneRenderer.js

/**
 * 腾讯获奖级 · 生活灵感沉浸声景与光影交互渲染引擎 (Atmospheric Life Scenes Engine V2)
 * 纯原生 Canvas 2D 物理与光学渲染，100% 离线、零外部贴图依赖，支持「吸烟火光映境」实时动态交互
 *
 * 18 大典藏级沉浸环境分为三大主题系列：
 * 一、🏙️ 人间烟火系列 (category: 'life')：
 *   1. convenience_store: 便利店门口 (24H 霓虹门头、暖黄橱窗货架、关东煮热气与湿润街角倒影)
 *   2. stairwell: 楼道安全通道 (高窗斜射丁达尔光束、微尘浮动、绿光 EXIT 与混凝泥土阶梯)
 *   3. underground_garage: 地下车库 (纵深透视灯带、黄黑警示立柱、B2 导视牌与尾灯地坪漫反射)
 *   4. midnight_rooftop: 楼顶天台 (错落摩天大楼天际线剪影、塔顶防撞红灯、万家灯火与流光车河)
 *   5. rainy_car: 雨夜车窗 (车窗 A 柱内景轮廓、仪表盘微光、散焦霓虹 Bokeh 与滑落雨滴水痕)
 *   6. whisky_bar: 微醺威士忌吧 (暗调胡桃木吧台、晶莹冰球威士忌杯、柔焦酒架金辉与复古吊灯)
 * 二、🌧️ 自然治愈系列 (category: 'nature')：
 *   7. night_fishing: 江湖夜钓 (墨蓝静水微澜、岸边芦苇摇曳、三色电子夜光浮漂顿口与流萤)
 *   8. snowy_lamp: 雪夜孤灯 (凛冬复古街灯暖黄光锥、漫天晶莹飞雪冷暖交织与积雪栏杆)
 *   9. zen_bamboo: 禅院听竹 (东方水墨月夜、翠竹枝叶随风轻摆、远山薄雾与古刹青檀香韵)
 *   10. rainy_camp: 雨夜露营 (防雨天幕斜檐、随风轻晃暖光马灯、远山云雾与热咖啡白汽)
 *   11. ocean: 蔚蓝深海 (海上升明月、神秘岛屿剪影、月光波光大道与三层涌浪飞沫)
 *   12. campfire: 森林篝火 (层叠暗夜松林剪影、交叉柴堆跳动火苗与升腾炭火星)
 *   13. sakura_night: 落樱夜庭 (东方物哀、绯月薄雾、和风悬铃纸灯、3D物理飘落樱花与水镜涟漪)
 * 三、🌌 奇幻星宇系列 (category: 'cosmos')：
 *   14. solar_system: 浩瀚太阳系 (中心恒星日冕、八大行星椭圆公转、小行星带与土星/天王星环)
 *   15. deep_cosmos: 深空宇宙 (猎户紫粉与礁湖青蓝双星云、旋涡星系与周期性浪漫流星)
 *   16. lunar_planet: 荒原星球 (环形山月表剪影、地平线壮丽巨型气态母星升起与蓝色大气弧)
 *   17. starship_bridge: 星舰舰桥 (环带巨型气态行星、钛合金装甲立柱、吸烟跃迁星流与全息战术星图)
 *   18. starlink_orbit: 星链天网 (全息 3D 星轨 · 环球赛博天网、星链列车与激光星间链路)
 *   19. obsidian: 极简黑曜 (专注一呼一吸 · 侘寂纯黑微距摄影棚背景)
 */

import { getThemeById } from '../configs/vipThemes.js';

export const SCENE_CATEGORIES = [
  { id: 'all', name: '全部', icon: '✨' },
  { id: 'life', name: '烟火', icon: '🏙️' },
  { id: 'nature', name: '自然', icon: '🌧️' },
  { id: 'cosmos', name: '星空', icon: '🌌' }
];

export const ATMOSPHERE_SCENES = [
  // ================= 1. 🏙️ 人间烟火系列 (Everyday Life & Urban Vibes) =================
  {
    id: 'convenience_store',
    name: '便利店门口',
    subtitle: '24H霓虹灯箱 · 关东煮暖雾',
    icon: '🏪',
    category: 'life',
    accentColor: '#10b981',
    soundType: 'city',
    ambientDesc: '深夜街角温暖灯影',
    badge: '打工人避风港'
  },
  {
    id: 'stairwell',
    name: '楼道安全通道',
    subtitle: '防火门后摸鱼 · 丁达尔光束',
    icon: '🚪',
    category: 'life',
    accentColor: '#34d399',
    soundType: 'echo',
    ambientDesc: '安静楼道微弱风声',
    badge: '摸鱼圣地'
  },
  {
    id: 'underground_garage',
    name: '地下车库',
    subtitle: '熄火后独处 · 属于自己的5分钟',
    icon: '🅿️',
    category: 'life',
    accentColor: '#eab308',
    soundType: 'garage',
    ambientDesc: '车库排风机低频沉浸音',
    badge: '独处时刻'
  },
  {
    id: 'midnight_rooftop',
    name: '楼顶天台',
    subtitle: '俯瞰万家灯火 · 晚风吹拂解千愁',
    icon: '🌃',
    category: 'life',
    accentColor: '#f59e0b',
    soundType: 'wind',
    ambientDesc: '天台旷野徐徐晚风',
    badge: '开阔解忧'
  },
  {
    id: 'rainy_car',
    name: '雨夜车窗',
    subtitle: '成年人的私密避风港 · 细雨霓虹',
    icon: '🌧️',
    category: 'life',
    accentColor: '#38bdf8',
    soundType: 'rain',
    ambientDesc: '沙沙窗外夜雨声',
    badge: '最治愈'
  },
  {
    id: 'whisky_bar',
    name: '微醺威士忌吧',
    subtitle: '暗调胡桃木吧台 · 冰球与琥珀液',
    icon: '🥃',
    category: 'life',
    accentColor: '#f59e0b',
    soundType: 'lounge',
    ambientDesc: '复古黑胶与微醺暖频余韵',
    badge: '高奢独酌'
  },

  // ================= 2. 🌧️ 自然治愈系列 (Nature & Zen Healing) =================
  {
    id: 'night_fishing',
    name: '江湖夜钓',
    subtitle: '静水芦苇微澜 · 夜光浮漂顿口',
    icon: '🎣',
    category: 'nature',
    accentColor: '#22c55e',
    soundType: 'fishing',
    ambientDesc: '静夜湖水微澜与空灵夜色',
    badge: '钓鱼佬狂喜'
  },
  {
    id: 'snowy_lamp',
    name: '雪夜孤灯',
    subtitle: '复古暖黄街灯 · 漫天飞雪静落',
    icon: '❄️',
    category: 'nature',
    accentColor: '#bae6fd',
    soundType: 'snow',
    ambientDesc: '凛冬落雪静谧空气声',
    badge: '极致唯美'
  },
  {
    id: 'zen_bamboo',
    name: '禅院听竹',
    subtitle: '东方水墨月夜 · 翠竹随风轻摇',
    icon: '🎋',
    category: 'nature',
    accentColor: '#4ade80',
    soundType: 'bamboo',
    ambientDesc: '竹海清风与禅院静心音',
    badge: '东方禅意'
  },
  {
    id: 'rainy_camp',
    name: '雨夜露营',
    subtitle: '天幕听雨 · 暖光马灯与远山',
    icon: '⛺',
    category: 'nature',
    accentColor: '#fbbf24',
    soundType: 'rain',
    ambientDesc: '天幕轻柔雨声与微风',
    badge: '旷野松弛'
  },
  {
    id: 'ocean',
    name: '蔚蓝深海',
    subtitle: '海上明月潮汐 · 层叠涌浪与飞沫',
    icon: '🌊',
    category: 'nature',
    accentColor: '#06b6d4',
    soundType: 'ocean',
    ambientDesc: '舒缓浪潮与海风微鸣',
    badge: '治愈解压'
  },
  {
    id: 'campfire',
    name: '森林篝火',
    subtitle: '松林夜幕围炉 · 跃动火苗与火星',
    icon: '🔥',
    category: 'nature',
    accentColor: '#f97316',
    soundType: 'crackle',
    ambientDesc: '木柴轻柔温暖呼吸声',
    badge: '温暖围炉'
  },
  {
    id: 'sakura_night',
    name: '落樱夜庭',
    subtitle: '绯月薄雾 · 3D物理落樱与水镜涟漪',
    icon: '🌸',
    category: 'nature',
    accentColor: '#f472b6',
    soundType: 'sakura',
    ambientDesc: '春夜微风抚枝与幽弦夜音',
    badge: '极致物哀'
  },

  // ================= 3. 🌌 奇幻星宇系列 (Cosmic Wonders & Pure Studio) =================
  {
    id: 'solar_system',
    name: '浩瀚太阳系',
    subtitle: '恒星金辉普照 · 八大行星公转',
    icon: '🪐',
    category: 'cosmos',
    accentColor: '#fde047',
    soundType: 'cosmos',
    ambientDesc: '深空引力波空灵冥想',
    badge: '宇宙奇观'
  },
  {
    id: 'deep_cosmos',
    name: '深空宇宙',
    subtitle: '双色星云漫渺 · 银河流星划过',
    icon: '🌌',
    category: 'cosmos',
    accentColor: '#a855f7',
    soundType: 'cosmos',
    ambientDesc: '深空虚空静谧之声',
    badge: '浪漫星海'
  },
  {
    id: 'lunar_planet',
    name: '荒原星球',
    subtitle: '环形山月表 · 巨型母星升起',
    icon: '🌑',
    category: 'cosmos',
    accentColor: '#38bdf8',
    soundType: 'cosmos',
    ambientDesc: '异星地平线寂静微风',
    badge: '孤寂异境'
  },
  {
    id: 'starship_bridge',
    name: '星港巨舰',
    subtitle: '暮色海湾 · 星舰发射与机械臂捕获回收',
    icon: '🚀',
    category: 'cosmos',
    accentColor: '#38bdf8',
    soundType: 'starship',
    ambientDesc: '猛禽低频轰鸣与筷子臂精准回收',
    badge: '马斯克星舰'
  },
  {
    id: 'starlink_orbit',
    name: '星链天网',
    subtitle: '全息3D星轨 · 环球赛博卫星阵',
    icon: '🛰️',
    category: 'cosmos',
    accentColor: '#38bdf8',
    soundType: 'cosmos',
    ambientDesc: '星轨交织与深空遥测脉冲',
    badge: '赛博星轨'
  },
  {
    id: 'obsidian',
    name: '极简黑曜',
    subtitle: '专注一呼一吸 · 侘寂纯境',
    icon: '🖤',
    category: 'cosmos',
    accentColor: '#94a3b8',
    soundType: 'zen',
    ambientDesc: '侘寂静心白噪音',
    badge: '纯享侘寂'
  }
];

export function getSceneById(id) {
  if (id === 'midnight_balcony') id = 'midnight_rooftop';
  if (id === 'golden_amber') id = 'whisky_bar';
  return ATMOSPHERE_SCENES.find(s => s.id === id) || ATMOSPHERE_SCENES[0];
}

export class SceneRenderer {
  constructor() {
    this.raindrops = [];
    this.bokehs = [];
    this.stars = [];
    this.embers = [];
    this.windows = [];
    this.buildings = [];
    this.rooftopBokehs = [];
    this.skylineBuildings = [];
    this.skylineWindows = [];
    this.nightClouds = [];
    this.goldenDust = [];
    this.solarPlanets = [];
    this.asteroids = [];
    this.steamParticles = [];
    this.oceanGlints = [];
    this.fireflies = [];
    this.snowflakes = [];
    this.bambooStalks = [];
    this.sakuraPetals = [];
    this.starshipStars = [];
    // 星舰交互状态机: 'IDLE' -> 'HOLD_MID_AIR' (长按在半空点火等待) -> 'RELEASE_ORBIT' (松手直插云霄发射出屏幕) -> 'RE_ENTRY' (反推扎入) -> 'CATCH' (筷子臂捕获)
    this.starshipState = 'IDLE';
    this.starshipStateTime = 0;
    this.lastInhaling = false;
    this.initialized = false;
  }

  init(w, h) {
    // 1. 雨夜车窗元素
    this.raindrops = [];
    for (let i = 0; i < 28; i++) {
      this.raindrops.push({
        x: Math.random() * w,
        y: Math.random() * h,
        length: 14 + Math.random() * 22,
        speed: 180 + Math.random() * 220,
        width: 1.0 + Math.random() * 1.5,
        alpha: 0.15 + Math.random() * 0.35,
        wind: 0.6 + Math.random() * 0.8
      });
    }

    this.bokehs = [
      { x: w * 0.22, y: h * 0.28, r: 42, color: 'rgba(251, 191, 36, ', speed: 0.4 },
      { x: w * 0.78, y: h * 0.22, r: 56, color: 'rgba(56, 189, 248, ', speed: 0.3 },
      { x: w * 0.15, y: h * 0.48, r: 34, color: 'rgba(244, 63, 94, ', speed: 0.5 },
      { x: w * 0.82, y: h * 0.44, r: 46, color: 'rgba(251, 146, 60, ', speed: 0.35 },
      { x: w * 0.48, y: h * 0.18, r: 38, color: 'rgba(167, 139, 250, ', speed: 0.45 },
      { x: w * 0.35, y: h * 0.52, r: 28, color: 'rgba(52, 211, 153, ', speed: 0.6 }
    ];

    // 2. 星空繁星 (通用：天台、深空、太阳系、荒原星球、夜钓)
    this.stars = [];
    for (let i = 0; i < 48; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * (h * 0.75),
        size: 0.8 + Math.random() * 1.5,
        freq: 0.6 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 3. 森林篝火余烬
    this.embers = [];
    for (let i = 0; i < 22; i++) {
      this.embers.push({
        x: w * 0.5 + (Math.random() - 0.5) * (w * 0.45),
        y: h * (0.68 + Math.random() * 0.25),
        size: 1.4 + Math.random() * 2.2,
        speedY: 25 + Math.random() * 45,
        sineFreq: 1.2 + Math.random() * 2.2,
        sineAmp: 10 + Math.random() * 15,
        phase: Math.random() * Math.PI * 2,
        life: Math.random(),
        maxLife: 2.5 + Math.random() * 2.0
      });
    }

    // 4. 赛博暖金与丁达尔光束浮尘
    this.goldenDust = [];
    for (let i = 0; i < 26; i++) {
      this.goldenDust.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.2 + Math.random() * 2.6,
        speedY: 14 + Math.random() * 26,
        freq: 1.2 + Math.random() * 2.2,
        amp: 8 + Math.random() * 16,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() < 0.4 ? '#fef08a' : (Math.random() < 0.7 ? '#fbbf24' : '#f59e0b')
      });
    }

    // 5. 太阳系八大行星公转配置 + 小行星带
    this.solarPlanets = [
      { name: '水星', rx: 28, ry: 12, speed: 1.55, r: 1.7, color: '#9ca3af', phase: 0.2 },
      { name: '金星', rx: 46, ry: 19, speed: 1.12, r: 2.6, color: '#fde047', phase: 1.4 },
      { name: '地球', rx: 68, ry: 28, speed: 0.82, r: 3.4, color: '#38bdf8', phase: 2.8, hasMoon: true },
      { name: '火星', rx: 90, ry: 37, speed: 0.62, r: 2.3, color: '#ef4444', phase: 4.1 },
      { name: '木星', rx: 124, ry: 51, speed: 0.38, r: 6.2, color: '#f59e0b', phase: 0.9, isBanded: true },
      { name: '土星', rx: 154, ry: 63, speed: 0.26, r: 4.8, color: '#fde68a', phase: 3.4, hasRing: true },
      { name: '天王星', rx: 182, ry: 74, speed: 0.18, r: 3.6, color: '#67e8f9', phase: 5.1, hasIceRing: true },
      { name: '海王星', rx: 208, ry: 85, speed: 0.13, r: 3.4, color: '#3b82f6', phase: 2.1 }
    ];
    this.asteroids = [];
    for (let i = 0; i < 28; i++) {
      this.asteroids.push({
        angle: (i / 28) * Math.PI * 2 + Math.random() * 0.2,
        rx: 105 + (Math.random() - 0.5) * 6,
        ry: 43 + (Math.random() - 0.5) * 3,
        speed: 0.45 + Math.random() * 0.08,
        size: 0.7 + Math.random() * 0.8
      });
    }

    // 6. 便利店热气浮尘
    this.steamParticles = [];
    for (let i = 0; i < 14; i++) {
      this.steamParticles.push({
        x: w * (0.25 + Math.random() * 0.5),
        y: h * (0.42 + Math.random() * 0.22),
        r: 6 + Math.random() * 12,
        speedY: 12 + Math.random() * 18,
        alpha: 0.12 + Math.random() * 0.16,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 7. 楼顶天台：写实都会天际线建筑群、万家暖窗与电影级散焦灯海
    this.skylineBuildings = [
      { x: w * 0.00, w: w * 0.16, topY: h * 0.58, type: 'flat', crownGlow: false },
      { x: w * 0.13, w: w * 0.15, topY: h * 0.50, type: 'slanted', crownGlow: true },   // 斜切顶大厦 (如环球金融中心)
      { x: w * 0.25, w: w * 0.13, topY: h * 0.56, type: 'flat', crownGlow: false },
      { x: w * 0.36, w: w * 0.17, topY: h * 0.44, type: 'spire', crownGlow: true },     // 标志性地标尖塔 (如金茂/台北101)
      { x: w * 0.51, w: w * 0.15, topY: h * 0.52, type: 'stepback', crownGlow: true },  // 装饰艺术风格阶梯退台顶
      { x: w * 0.64, w: w * 0.16, topY: h * 0.47, type: 'slanted', crownGlow: true },   // 切角冠顶大厦
      { x: w * 0.78, w: w * 0.22, topY: h * 0.56, type: 'flat', crownGlow: false }
    ];

    this.skylineWindows = [];
    this.skylineBuildings.forEach((b) => {
      const winCount = 14 + Math.floor(Math.random() * 10);
      for (let i = 0; i < winCount; i++) {
        const wx = b.x + 6 + Math.random() * (b.w - 14);
        const wy = b.topY + 14 + Math.random() * (h * 0.72 - b.topY - 18);
        if (wy < h * 0.72) {
          this.skylineWindows.push({
            x: wx,
            y: wy,
            w: 2.2 + Math.random() * 2.2,
            h: 3.5 + Math.random() * 2.5,
            color: Math.random() < 0.65 ? '#fef08a' : (Math.random() < 0.85 ? '#fde68a' : '#e0f2fe'),
            alpha: 0.14 + Math.random() * 0.26
          });
        }
      }
    });

    this.rooftopBokehs = [];
    const bokehColors = [
      'rgba(253, 230, 138, ',  // 香槟暖金
      'rgba(254, 240, 138, ',  // 柔和鹅黄
      'rgba(245, 158, 11, ',   // 琥珀微芒
      'rgba(186, 230, 253, ',  // 冰川冷白
      'rgba(224, 242, 254, '   // 珍珠柔白
    ];
    for (let i = 0; i < 32; i++) {
      this.rooftopBokehs.push({
        x: Math.random() * w,
        y: h * (0.64 + Math.random() * 0.14),
        r: 3.0 + Math.random() * 9.0,
        alpha: 0.08 + Math.random() * 0.16,
        colorPrefix: bokehColors[Math.floor(Math.random() * bokehColors.length)]
      });
    }

    // 深空柔和夜云淡影 (超缓漂浮，增添现实开阔感)
    this.nightClouds = [
      { x: w * 0.15, y: h * 0.18, rx: w * 0.35, ry: 24, speed: 0.6 },
      { x: w * 0.70, y: h * 0.28, rx: w * 0.40, ry: 28, speed: 0.4 }
    ];

    // 8. 蔚蓝海洋水面波光与浮波烁光
    this.oceanGlints = [];
    for (let i = 0; i < 36; i++) {
      this.oceanGlints.push({
        x: Math.random() * w,
        y: h * (0.40 + Math.random() * 0.50),
        w: 8 + Math.random() * 20,
        speed: 0.8 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() < 0.65 ? '#67e8f9' : (Math.random() < 0.85 ? '#ffffff' : '#38bdf8')
      });
    }

    // 9. 江湖夜钓萤火虫微光
    this.fireflies = [];
    for (let i = 0; i < 14; i++) {
      this.fireflies.push({
        x: Math.random() * w,
        y: h * (0.25 + Math.random() * 0.55),
        r: 1.3 + Math.random() * 1.5,
        speedX: (Math.random() - 0.5) * 18,
        speedY: (Math.random() - 0.5) * 10,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 10. 雪夜孤灯晶莹雪花
    this.snowflakes = [];
    for (let i = 0; i < 42; i++) {
      this.snowflakes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.0 + Math.random() * 2.4,
        speedY: 22 + Math.random() * 36,
        swayAmp: 8 + Math.random() * 14,
        swayFreq: 0.8 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.35 + Math.random() * 0.55
      });
    }

    // 11. 禅院听竹翠竹竿配置
    this.bambooStalks = [
      { x: w * 0.08, width: 6.5, swayFactor: 1.0, alpha: 0.92, side: 'left' },
      { x: w * 0.15, width: 4.5, swayFactor: 1.25, alpha: 0.65, side: 'left' },
      { x: w * 0.21, width: 3.2, swayFactor: 0.85, alpha: 0.42, side: 'left' },
      { x: w * 0.88, width: 7.0, swayFactor: 0.95, alpha: 0.92, side: 'right' },
      { x: w * 0.81, width: 4.8, swayFactor: 1.15, alpha: 0.68, side: 'right' }
    ];

    // 12. 落樱夜庭 3D 物理景深落樱花瓣粒子
    this.sakuraPetals = [];
    for (let i = 0; i < 38; i++) {
      this.sakuraPetals.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 7.0 + Math.random() * 8.5,
        speedY: 26 + Math.random() * 34,
        speedX: 8 + Math.random() * 16,
        swayAmp: 10 + Math.random() * 18,
        swayFreq: 0.9 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: 0.7 + Math.random() * 1.5,
        flipSpeed: 1.1 + Math.random() * 2.2,
        depth: 0.45 + Math.random() * 0.55,
        color: Math.random() < 0.35 ? '#fbcfe8' : (Math.random() < 0.7 ? '#f472b6' : '#fdf2f8')
      });
    }

    // 13. 星舰舰桥深空繁星
    this.starshipStars = [];
    for (let i = 0; i < 56; i++) {
      this.starshipStars.push({
        x: Math.random() * w,
        y: Math.random() * (h * 0.85),
        size: 0.8 + Math.random() * 1.6,
        freq: 0.6 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 14. 星链天网 (Starlink Constellation) 3D 地球、16 轨道面与卫星群
    this.starlinkSatellites = [];
    const NUM_PLANES = 16;
    const SATS_PER_PLANE = 14;
    for (let p = 0; p < NUM_PLANES; p++) {
      const inclination = (p % 2 === 0 ? 53 : 70) * (Math.PI / 180);
      const raan = p * (Math.PI / (NUM_PLANES / 2));
      const baseSpeed = 0.36 + (p % 4) * 0.02;
      for (let s = 0; s < SATS_PER_PLANE; s++) {
        this.starlinkSatellites.push({
          plane: p,
          inclination,
          raan,
          phase: (s / SATS_PER_PLANE) * Math.PI * 2 + (p * 0.18),
          speed: baseSpeed,
          size: 1.2 + (Math.random() < 0.25 ? 1.0 : 0.3),
          color: Math.random() < 0.8 ? '#ffffff' : '#7dd3fc',
          flarePhase: Math.random() * Math.PI * 2
        });
      }
    }

    // 星链列车 (Starlink Train) - 20 颗紧密发射成一列的高亮卫星
    this.starlinkTrain = [];
    for (let i = 0; i < 20; i++) {
      this.starlinkTrain.push({
        offset: i * 0.025,
        size: 2.2,
        speed: 0.44
      });
    }

    // 3D 地球全息大陆板块点阵与夜景城市群 (涵盖欧亚大陆、北美、南美、非洲、大洋洲)
    this.starlinkContinents = [
      { lat: 35, lon: 110, isCity: true },
      { lat: 31, lon: 121, isCity: true },
      { lat: 39, lon: 116, isCity: true },
      { lat: 23, lon: 113, isCity: true },
      { lat: 36, lon: 139, isCity: true },
      { lat: 51, lon: 0, isCity: true },
      { lat: 48, lon: 2, isCity: true },
      { lat: 52, lon: 13, isCity: true },
      { lat: 28, lon: 77, isCity: true },
      { lat: 13, lon: 100, isCity: true },
      { lat: 55, lon: 37, isCity: true },
      { lat: 60, lon: 105, isCity: false },
      { lat: 45, lon: 90, isCity: false },
      { lat: 25, lon: 85, isCity: false },
      { lat: 10, lon: 105, isCity: false },
      { lat: 40, lon: -74, isCity: true },
      { lat: 34, lon: -118, isCity: true },
      { lat: 41, lon: -87, isCity: true },
      { lat: 37, lon: -122, isCity: true },
      { lat: 29, lon: -95, isCity: true },
      { lat: 45, lon: -100, isCity: false },
      { lat: 55, lon: -115, isCity: false },
      { lat: 20, lon: -100, isCity: true },
      { lat: -23, lon: -46, isCity: true },
      { lat: -34, lon: -58, isCity: true },
      { lat: -12, lon: -77, isCity: false },
      { lat: -5, lon: -60, isCity: false },
      { lat: 30, lon: 31, isCity: true },
      { lat: -26, lon: 28, isCity: true },
      { lat: 6, lon: 3, isCity: true },
      { lat: 0, lon: 25, isCity: false },
      { lat: 15, lon: 20, isCity: false },
      { lat: -33, lon: 151, isCity: true },
      { lat: -37, lon: 144, isCity: true },
      { lat: -25, lon: 135, isCity: false }
    ];

    this.initialized = true;
    this.lastW = w;
    this.lastH = h;
  }

  render(ctx, w, h, sceneType, dt, totalTime, vipTheme = '', emberIntensity = 0) {
    if (!this.initialized || this.lastW !== w || this.lastH !== h) {
      this.init(w, h);
    }

    ctx.save();

    switch (sceneType) {
      case 'solar_system':
        this.renderSolarSystem(ctx, w, h, dt, totalTime);
        break;
      case 'deep_cosmos':
        this.renderDeepCosmos(ctx, w, h, dt, totalTime);
        break;
      case 'lunar_planet':
        this.renderLunarPlanet(ctx, w, h, dt, totalTime);
        break;
      case 'ocean':
        this.renderOcean(ctx, w, h, dt, totalTime);
        break;
      case 'convenience_store':
        this.renderConvenienceStore(ctx, w, h, dt, totalTime);
        break;
      case 'stairwell':
        this.renderStairwell(ctx, w, h, dt, totalTime);
        break;
      case 'underground_garage':
        this.renderUndergroundGarage(ctx, w, h, dt, totalTime);
        break;
      case 'midnight_rooftop':
      case 'midnight_balcony':
        this.renderMidnightRooftop(ctx, w, h, dt, totalTime);
        break;
      case 'whisky_bar':
      case 'golden_amber':
        this.renderWhiskyBar(ctx, w, h, dt, totalTime);
        break;
      case 'night_fishing':
        this.renderNightFishing(ctx, w, h, dt, totalTime);
        break;
      case 'snowy_lamp':
        this.renderSnowyLamp(ctx, w, h, dt, totalTime);
        break;
      case 'zen_bamboo':
        this.renderZenBamboo(ctx, w, h, dt, totalTime);
        break;
      case 'rainy_car':
        this.renderRainyCar(ctx, w, h, dt, totalTime);
        break;
      case 'rainy_camp':
        this.renderRainyCamp(ctx, w, h, dt, totalTime);
        break;
      case 'campfire':
        this.renderCampfire(ctx, w, h, dt, totalTime);
        break;
      case 'sakura_night':
        this.renderSakuraNight(ctx, w, h, dt, totalTime, emberIntensity);
        break;
      case 'starship_launch':
      case 'starship_bridge':
        this.renderStarshipLaunch(ctx, w, h, dt, totalTime, emberIntensity);
        break;
      case 'starlink_orbit':
        this.renderStarlinkOrbit(ctx, w, h, dt, totalTime, emberIntensity);
        break;
      case 'obsidian':
      default:
        this.renderObsidian(ctx, w, h);
        break;
    }

    // 腾讯总监创新：「火光映境」——当香烟点燃或深吸时，烟头橙红火光实时照亮周围环境前景
    if (emberIntensity > 0.05) {
      this.renderEmberEnvironmentReflection(ctx, w, h, sceneType, totalTime, emberIntensity);
    }

    if (vipTheme) {
      this.renderVipAmbientOverlay(ctx, w, h, dt, totalTime, vipTheme);
    }

    ctx.restore();
  }

  // 1. 浩瀚太阳系：中心恒星光冕、八大行星椭圆公转、小行星带与双星环
  // ==========================================
  renderSolarSystem(ctx, w, h, dt, t) {
    const bgGrad = ctx.createRadialGradient(w / 2, h * 0.25, 10, w / 2, h * 0.35, w * 0.95);
    bgGrad.addColorStop(0, '#070c1e');
    bgGrad.addColorStop(0.5, '#02040a');
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    this.renderStarfield(ctx, t, 0.50);

    const sunX = w / 2;
    const sunY = h * 0.25;

    // 1.1 中心恒星太阳光冕与金色日珥辐射光辉
    const pulse = 1.0 + 0.08 * Math.sin(t * 1.6);
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 3, sunX, sunY, 54 * pulse);
    sunGlow.addColorStop(0, '#fffbeb');
    sunGlow.addColorStop(0.22, 'rgba(253, 224, 71, 0.92)');
    sunGlow.addColorStop(0.52, 'rgba(245, 158, 11, 0.38)');
    sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 54 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 11.5, 0, Math.PI * 2);
    ctx.fill();

    // 1.2 火星与木星之间的小行星带微粒 (Asteroid Belt)
    ctx.fillStyle = 'rgba(148, 163, 184, 0.42)';
    for (let i = 0; i < this.asteroids.length; i++) {
      const ast = this.asteroids[i];
      const aAngle = t * ast.speed * 0.35 + ast.angle;
      const ax = sunX + Math.cos(aAngle) * ast.rx;
      const ay = sunY + Math.sin(aAngle) * ast.ry;
      ctx.beginPath();
      ctx.arc(ax, ay, ast.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1.3 八大行星公转轨道虚线与星体细节
    this.solarPlanets.forEach((p) => {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 0.75;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      if (typeof ctx.ellipse === 'function') {
        ctx.ellipse(sunX, sunY, p.rx, p.ry, 0, 0, Math.PI * 2);
      } else {
        ctx.arc(sunX, sunY, (p.rx + p.ry) / 2, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.restore();

      const angle = t * p.speed * 0.4 + p.phase;
      const px = sunX + Math.cos(angle) * p.rx;
      const py = sunY + Math.sin(angle) * p.ry;

      ctx.save();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();

      // 木星赤道云带条纹
      if (p.isBanded) {
        ctx.strokeStyle = 'rgba(180, 83, 9, 0.65)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px - p.r * 0.85, py - 1.2);
        ctx.lineTo(px + p.r * 0.85, py - 1.2);
        ctx.moveTo(px - p.r * 0.85, py + 1.4);
        ctx.lineTo(px + p.r * 0.85, py + 1.4);
        ctx.stroke();
      }

      // 地球伴随月球
      if (p.hasMoon) {
        const mAngle = t * 2.8;
        const mx = px + Math.cos(mAngle) * 7.2;
        const my = py + Math.sin(mAngle) * 7.2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mx, my, 1.0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 土星壮丽双层倾斜光环
      if (p.hasRing) {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.78)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        if (typeof ctx.ellipse === 'function') {
          ctx.ellipse(px, py, 10.5, 3.6, -0.32, 0, Math.PI * 2);
        } else {
          ctx.arc(px, py, 9, 0, Math.PI * 2);
        }
        ctx.stroke();
      }

      // 天王星冰晶竖向倾斜环
      if (p.hasIceRing) {
        ctx.strokeStyle = 'rgba(165, 243, 252, 0.55)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        if (typeof ctx.ellipse === 'function') {
          ctx.ellipse(px, py, 7.2, 2.4, 0.85, 0, Math.PI * 2);
        } else {
          ctx.arc(px, py, 6.5, 0, Math.PI * 2);
        }
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  // ==========================================
  // 2. 深空宇宙：紫红与青蓝星云漫渺、银河流星划过
  // ==========================================
  renderDeepCosmos(ctx, w, h, dt, t) {
    // 深邃星际太空底色
    ctx.fillStyle = '#020307';
    ctx.fillRect(0, 0, w, h);

    // 2.1 弥漫星云 1：猎户紫粉色柔光气体云 (Magenta Nebula)
    const n1X = w * 0.32 + Math.sin(t * 0.2) * 15;
    const n1Y = h * 0.30 + Math.cos(t * 0.15) * 10;
    const neb1 = ctx.createRadialGradient(n1X, n1Y, 10, n1X, n1Y, w * 0.58);
    neb1.addColorStop(0, 'rgba(168, 85, 247, 0.24)');
    neb1.addColorStop(0.45, 'rgba(217, 70, 239, 0.12)');
    neb1.addColorStop(0.8, 'rgba(126, 34, 206, 0.04)');
    neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neb1;
    ctx.beginPath();
    ctx.arc(n1X, n1Y, w * 0.58, 0, Math.PI * 2);
    ctx.fill();

    // 2.2 弥漫星云 2：礁湖深青色微光星云 (Cyan Nebula)
    const n2X = w * 0.72 + Math.cos(t * 0.25) * 12;
    const n2Y = h * 0.22 + Math.sin(t * 0.18) * 8;
    const neb2 = ctx.createRadialGradient(n2X, n2Y, 10, n2X, n2Y, w * 0.52);
    neb2.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
    neb2.addColorStop(0.5, 'rgba(14, 116, 144, 0.10)');
    neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neb2;
    ctx.beginPath();
    ctx.arc(n2X, n2Y, w * 0.52, 0, Math.PI * 2);
    ctx.fill();

    // 2.3 远景旋涡星系 (Spiral Galaxy)
    ctx.save();
    const gx = w * 0.82;
    const gy = h * 0.14;
    const gGrad = ctx.createRadialGradient(gx, gy, 1, gx, gy, 28);
    gGrad.addColorStop(0, '#ffffff');
    gGrad.addColorStop(0.35, 'rgba(192, 132, 252, 0.6)');
    gGrad.addColorStop(0.7, 'rgba(99, 102, 241, 0.2)');
    gGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gGrad;
    ctx.beginPath();
    if (typeof ctx.ellipse === 'function') {
      ctx.ellipse(gx, gy, 28, 12, 0.45, 0, Math.PI * 2);
    } else {
      ctx.arc(gx, gy, 22, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();

    // 2.4 繁星漫布
    this.renderStarfield(ctx, t, 0.75);

    // 2.5 周期性划过深空的优美流星
    const meteorCycle = (t * 0.35) % 6.0;
    if (meteorCycle < 0.9) {
      const prog = meteorCycle / 0.9;
      const startX = w * 0.85 - prog * (w * 0.7);
      const startY = h * 0.08 + prog * (h * 0.38);
      const len = 38 * (1 - Math.abs(prog - 0.5) * 1.5);
      const alpha = Math.sin(prog * Math.PI) * 0.85;

      const mGrad = ctx.createLinearGradient(startX, startY, startX + len * 0.8, startY - len * 0.5);
      mGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      mGrad.addColorStop(0.4, `rgba(167, 139, 250, ${alpha * 0.6})`);
      mGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.strokeStyle = mGrad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + len * 0.8, startY - len * 0.5);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ==========================================
  // 3. 荒原星球：月表环形山与地平线升起的巨型母星
  // ==========================================
  renderLunarPlanet(ctx, w, h, dt, t) {
    // 无大气太空深黑
    ctx.fillStyle = '#010204';
    ctx.fillRect(0, 0, w, h);

    // 空中锐利璀璨星芒
    this.renderStarfield(ctx, t, 0.65);

    // 3.1 地平线升起的巨型母星 (Gas Giant Planet)
    const px = w * 0.72;
    const py = h * 0.32;
    const pr = 62;

    const pGrad = ctx.createRadialGradient(px - 14, py - 14, 4, px, py, pr);
    pGrad.addColorStop(0, '#7dd3fc');
    pGrad.addColorStop(0.35, '#0284c7');
    pGrad.addColorStop(0.75, '#075985');
    pGrad.addColorStop(1, '#031726');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();

    // 母星大气发光外边缘弧 (Atmospheric Blue Rim Glow)
    const rimGrad = ctx.createRadialGradient(px, py, pr * 0.85, px, py, pr * 1.15);
    rimGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    rimGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.5)');
    rimGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(px, py, pr * 1.15, 0, Math.PI * 2);
    ctx.fill();

    // 3.2 荒原星球月海与环形山地平线剪影 (Lunar Horizon)
    const horizonY = h * 0.64;
    ctx.save();
    ctx.fillStyle = '#060911';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.bezierCurveTo(w * 0.2, horizonY - 14, w * 0.4, horizonY + 10, w * 0.65, horizonY - 8);
    ctx.bezierCurveTo(w * 0.8, horizonY - 20, w * 0.92, horizonY + 6, w, horizonY - 4);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 环形山地平线冰冷微光边缘
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.bezierCurveTo(w * 0.2, horizonY - 14, w * 0.4, horizonY + 10, w * 0.65, horizonY - 8);
    ctx.bezierCurveTo(w * 0.8, horizonY - 20, w * 0.92, horizonY + 6, w, horizonY - 4);
    ctx.stroke();

    // 月表低洼暗坑剪影
    ctx.fillStyle = 'rgba(2, 4, 8, 0.7)';
    ctx.beginPath();
    if (typeof ctx.ellipse === 'function') {
      ctx.ellipse(w * 0.32, h * 0.76, 34, 8, -0.08, 0, Math.PI * 2);
      ctx.ellipse(w * 0.76, h * 0.84, 46, 10, 0.05, 0, Math.PI * 2);
    } else {
      ctx.arc(w * 0.32, h * 0.76, 20, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }

  // ==========================================
  // 4. 便利店门口：24H霓虹灯箱、暖黄橱窗货架、关东煮暖雾与湿润街角倒影
  // ==========================================
  renderConvenienceStore(ctx, w, h, dt, t) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#060812');
    skyGrad.addColorStop(0.35, '#0a0e1c');
    skyGrad.addColorStop(0.7, '#070a14');
    skyGrad.addColorStop(1, '#03050a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 4.1 24H便利店顶部发光灯箱招牌与经典三色装饰条
    const signY = h * 0.11;
    const signH = 48;

    // 灯箱外壳
    const signGrad = ctx.createLinearGradient(0, signY, 0, signY + signH);
    signGrad.addColorStop(0, '#044e3b');
    signGrad.addColorStop(0.5, '#059669');
    signGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = signGrad;
    ctx.fillRect(0, signY, w, signH);

    // 经典便利店三色彩带条纹 (橙白绿)
    ctx.fillStyle = '#ef4444'; ctx.fillRect(0, signY + signH - 10, w, 3.5);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, signY + signH - 6.5, w, 2.5);
    ctx.fillStyle = '#f97316'; ctx.fillRect(0, signY + signH - 4, w, 4);

    // 招牌发光文字 "24H MART · 深夜便利店"
    ctx.save();
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(52, 211, 153, 0.85)';
    ctx.shadowBlur = 8;
    ctx.fillText('24H  MART · 深夜避风港', w * 0.5, signY + 24);
    ctx.restore();

    // 4.2 落地大玻璃窗透出的温馨暖黄大环境光与橱窗内景剪影
    const winY = signY + signH;
    const winH = h * 0.48;
    const winGrad = ctx.createLinearGradient(0, winY, 0, winY + winH);
    winGrad.addColorStop(0, 'rgba(251, 191, 36, 0.42)');
    winGrad.addColorStop(0.55, 'rgba(245, 158, 11, 0.22)');
    winGrad.addColorStop(1, 'rgba(180, 83, 9, 0.06)');
    ctx.fillStyle = winGrad;
    ctx.fillRect(0, winY, w, winH);

    // 橱窗内部剪影：饮料冷柜竖向灯带 + 关东煮保温台
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.fillRect(w * 0.08, winY + 40, w * 0.22, winH - 40); // 饮料冰柜轮廓
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)'; // 冰柜冷白灯条
    ctx.fillRect(w * 0.10, winY + 50, 2, winH - 60);
    ctx.fillRect(w * 0.18, winY + 50, 2, winH - 60);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.fillRect(w * 0.68, winY + 60, w * 0.26, winH - 60); // 暖食货架轮廓

    // 玻璃窗格金属反光竖框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(w * 0.32, winY); ctx.lineTo(w * 0.32, winY + winH);
    ctx.moveTo(w * 0.68, winY); ctx.lineTo(w * 0.68, winY + winH);
    ctx.stroke();

    // 4.3 关东煮热气升腾白雾
    this.steamParticles.forEach((sp) => {
      sp.y -= sp.speedY * dt;
      if (sp.y < winY + 16) {
        sp.y = winY + winH - 24;
        sp.x = w * (0.35 + Math.random() * 0.3);
      }
      const alpha = Math.sin(t * 1.5 + sp.phase) * sp.alpha;
      ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0.04, alpha)})`;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4.4 门前湿润沥青地面的暖光与霓虹倒影
    const groundY = winY + winH;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
    groundGrad.addColorStop(0, 'rgba(245, 158, 11, 0.32)');
    groundGrad.addColorStop(0.3, 'rgba(16, 185, 129, 0.16)');
    groundGrad.addColorStop(0.65, 'rgba(180, 83, 9, 0.08)');
    groundGrad.addColorStop(1, '#04060b');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, w, h - groundY);
  }

  // ==========================================
  // 5. 楼道安全通道：防火门后摸鱼、高窗斜射丁达尔光束与混凝土台阶
  // ==========================================
  renderStairwell(ctx, w, h, dt, t) {
    const wallGrad = ctx.createLinearGradient(0, 0, w, h);
    wallGrad.addColorStop(0, '#0a0e18');
    wallGrad.addColorStop(0.5, '#070a12');
    wallGrad.addColorStop(1, '#030509');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, w, h);

    // 5.1 楼梯间高窗透出的深蓝城市夜景
    const winX = w * 0.10;
    const winY = h * 0.12;
    const winW = 58;
    const winH = 125;

    const outGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
    outGrad.addColorStop(0, '#0b1328');
    outGrad.addColorStop(0.6, '#0284c7');
    outGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = outGrad;
    ctx.fillRect(winX, winY, winW, winH);

    // 窗外远景摩天大楼微光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(winX + 12, winY + 65, 3.5, 4.5);
    ctx.fillRect(winX + 24, winY + 46, 3.5, 4.5);
    ctx.fillRect(winX + 38, winY + 80, 3.5, 4.5);

    ctx.strokeStyle = '#020408';
    ctx.lineWidth = 4;
    ctx.strokeRect(winX, winY, winW, winH);

    // 5.2 丁达尔神圣光束 (Tyndall God Rays)：从高窗斜射至地面的微尘暖光
    ctx.save();
    const rayGrad = ctx.createLinearGradient(winX + winW / 2, winY + winH / 2, w * 0.85, h * 0.82);
    rayGrad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
    rayGrad.addColorStop(0.4, 'rgba(224, 242, 254, 0.08)');
    rayGrad.addColorStop(1, 'rgba(224, 242, 254, 0)');
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(winX, winY + winH);
    ctx.lineTo(winX + winW, winY);
    ctx.lineTo(w * 0.92, h * 0.72);
    ctx.lineTo(w * 0.45, h * 0.88);
    ctx.closePath();
    ctx.fill();

    // 光束中漂浮的细微尘埃
    for (let i = 0; i < 12; i++) {
      const dust = this.goldenDust[i];
      if (dust) {
        const dx = winX + winW + (dust.x % (w * 0.65));
        const dy = winY + 20 + (dust.y % (h * 0.65));
        const alpha = 0.15 + 0.25 * Math.sin(t * 1.8 + dust.phase);
        ctx.fillStyle = `rgba(224, 242, 254, ${alpha})`;
        ctx.beginPath();
        ctx.arc(dx, dy, dust.r * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // 5.3 经典「安全出口 EXIT」绿色荧光灯箱与微光漫射
    const exitX = w * 0.68;
    const exitY = h * 0.16;
    const exitW = 56;
    const exitH = 28;

    const greenGlow = ctx.createRadialGradient(exitX + exitW / 2, exitY + exitH / 2, 6, exitX + exitW / 2, exitY + exitH / 2, 75);
    greenGlow.addColorStop(0, 'rgba(16, 185, 129, 0.38)');
    greenGlow.addColorStop(0.6, 'rgba(5, 150, 105, 0.12)');
    greenGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = greenGlow;
    ctx.beginPath();
    ctx.arc(exitX + exitW / 2, exitY + exitH / 2, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#064e3b';
    ctx.fillRect(exitX, exitY, exitW, exitH);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(exitX, exitY, exitW, exitH);

    ctx.font = 'bold 8.5px sans-serif';
    ctx.fillStyle = '#6ee7b7';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT ➔', exitX + exitW / 2, exitY + 18);

    // 5.4 楼道混凝土台阶阶梯轮廓
    ctx.fillStyle = '#05070c';
    ctx.beginPath();
    ctx.moveTo(w * 0.0, h * 0.88);
    ctx.lineTo(w * 0.25, h * 0.88);
    ctx.lineTo(w * 0.25, h * 0.80);
    ctx.lineTo(w * 0.55, h * 0.80);
    ctx.lineTo(w * 0.55, h * 0.72);
    ctx.lineTo(w * 0.85, h * 0.72);
    ctx.lineTo(w * 0.85, h * 0.64);
    ctx.lineTo(w * 1.0, h * 0.64);
    ctx.lineTo(w * 1.0, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 5.5 不锈钢扶手斜向几何光影
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.32)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.82);
    ctx.lineTo(w * 0.95, h * 0.56);
    ctx.stroke();
  }

  // ==========================================
  // 6. 地下车库：熄火后独处5分钟、纵深透视日光灯、B2导视与车尾灯反射
  // ==========================================
  renderUndergroundGarage(ctx, w, h, dt, t) {
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, w, h);

    // 6.1 顶部透视日光灯带 (纵深延伸感)
    for (let i = 0; i < 4; i++) {
      const ly = h * (0.08 + i * 0.09);
      const lw = w * (0.35 + i * 0.16);
      const lx = (w - lw) / 2;

      ctx.fillStyle = 'rgba(224, 242, 254, 0.32)';
      ctx.fillRect(lx, ly, lw, 2.5);

      const lGrad = ctx.createRadialGradient(w / 2, ly, 1, w / 2, ly, lw * 0.45);
      lGrad.addColorStop(0, 'rgba(186, 230, 253, 0.18)');
      lGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lGrad;
      ctx.fillRect(0, ly - 8, w, 20);
    }

    // 6.2 承重柱与黄黑警示反光带 (左右双立柱构造纵深空间)
    const pilW = 54;
    ctx.fillStyle = '#080c16';
    ctx.fillRect(0, 0, pilW, h); // 左柱
    ctx.fillRect(w - pilW * 0.7, 0, pilW * 0.7, h); // 右柱

    const stripeY = h * 0.38;
    for (let sy = stripeY; sy < stripeY + 68; sy += 13) {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(0, sy); ctx.lineTo(pilW, sy - 9); ctx.lineTo(pilW, sy); ctx.lineTo(0, sy + 9);
      ctx.fill();
    }

    // 6.3 吊顶绿色发光导视灯牌 [P] B2 · 私人车位
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(w * 0.42, h * 0.18, 64, 18);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.0;
    ctx.strokeRect(w * 0.42, h * 0.18, 64, 18);
    ctx.font = 'bold 8px sans-serif';
    ctx.fillStyle = '#6ee7b7';
    ctx.textAlign = 'center';
    ctx.fillText('🅿️ B2 · 独处时刻', w * 0.42 + 32, h * 0.18 + 12);

    // 6.4 绿色环氧树脂地坪镜面微反射与黄色车位标线
    const floorY = h * 0.54;
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
    floorGrad.addColorStop(0, 'rgba(6, 78, 59, 0.38)');
    floorGrad.addColorStop(0.35, 'rgba(4, 47, 46, 0.18)');
    floorGrad.addColorStop(1, '#03060a');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, w, h - floorY);

    // 车位透视黄色标线
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.32)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(w * 0.28, floorY + 10); ctx.lineTo(w * 0.15, h);
    ctx.moveTo(w * 0.72, floorY + 10); ctx.lineTo(w * 0.85, h);
    ctx.stroke();

    // 6.5 爱车熄火余晖：车尾灯暗红倒影 + 日行灯白亮微光
    const taillightGlow = ctx.createRadialGradient(w * 0.72, floorY + 28, 2, w * 0.72, floorY + 28, 48);
    taillightGlow.addColorStop(0, 'rgba(239, 68, 68, 0.42)');
    taillightGlow.addColorStop(0.6, 'rgba(185, 28, 28, 0.14)');
    taillightGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = taillightGlow;
    ctx.beginPath();
    ctx.arc(w * 0.72, floorY + 28, 48, 0, Math.PI * 2);
    ctx.fill();
  }

  // ==========================================
  // 7. 楼顶天台：现实高奢天台 · 都会天际线剪影、万家暖光与全景玻璃露台
  // ==========================================
  renderMidnightRooftop(ctx, w, h, dt, t) {
    // 7.0 现实中的深宵天幕：从天顶绀蓝渐变至都会低空幽蓝
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#02040b');
    skyGrad.addColorStop(0.42, '#060d1f');
    skyGrad.addColorStop(0.70, '#0a162e');
    skyGrad.addColorStop(1, '#040711');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 7.1 夜空深邃弦月与微尘星光 (清冷高雅，恒定静止)
    const moonX = w * 0.82;
    const moonY = h * 0.13;
    const moonR = 11;
    ctx.save();
    const moonHalo = ctx.createRadialGradient(moonX, moonY, 2, moonX, moonY, 34);
    moonHalo.addColorStop(0, 'rgba(224, 242, 254, 0.14)');
    moonHalo.addColorStop(0.6, 'rgba(56, 189, 248, 0.03)');
    moonHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonHalo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(240, 249, 255, 0.72)';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#060d1f';
    ctx.beginPath();
    ctx.arc(moonX + 4.0, moonY - 2.2, moonR * 0.94, 0, Math.PI * 2);
    ctx.fill();

    // 深空静谧微星
    ctx.fillStyle = 'rgba(224, 242, 254, 0.22)';
    this.stars.slice(0, 26).forEach((s) => {
      if (s.y < h * 0.40) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 深空若隐若现的夜云淡影 (缓释现实开阔感)
    if (this.nightClouds && this.nightClouds.length) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.20)';
      this.nightClouds.forEach(c => {
        const cx = (c.x + Math.sin(t * 0.04 + c.y) * 12) % (w + 100);
        ctx.beginPath();
        if (typeof ctx.ellipse === 'function') {
          ctx.ellipse(cx, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
        } else {
          ctx.arc(cx, c.y, c.ry, 0, Math.PI * 2);
        }
        ctx.fill();
      });
    }
    ctx.restore();

    // 7.2 都会地平线微光天幕 (Urban Skyglow · 现实大城市特有的暖光光雾)
    const skyglowGrad = ctx.createLinearGradient(0, h * 0.48, 0, h * 0.74);
    skyglowGrad.addColorStop(0, 'rgba(10, 22, 44, 0)');
    skyglowGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.05)');
    skyglowGrad.addColorStop(0.85, 'rgba(56, 189, 248, 0.06)');
    skyglowGrad.addColorStop(1, 'rgba(8, 16, 32, 0.28)');
    ctx.fillStyle = skyglowGrad;
    ctx.fillRect(0, h * 0.48, w, h * 0.26);

    // 7.3 写实都会天际线建筑群 (真实建筑切角/退台轮廓，融入光雾，绝无生硬大黑块)
    ctx.save();
    ctx.fillStyle = 'rgba(7, 13, 26, 0.78)';
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.26)';
    ctx.lineWidth = 1.0;
    if (this.skylineBuildings && this.skylineBuildings.length) {
      this.skylineBuildings.forEach((b) => {
        ctx.beginPath();
        if (b.type === 'slanted') {
          // 斜切顶大厦 (如环球金融中心/花旗大厦)
          ctx.moveTo(b.x, h * 0.74);
          ctx.lineTo(b.x, b.topY + 12);
          ctx.lineTo(b.x + b.w * 0.8, b.topY);
          ctx.lineTo(b.x + b.w, b.topY + 6);
          ctx.lineTo(b.x + b.w, h * 0.74);
          ctx.closePath();
          ctx.fill();
          // 顶冠切角高光线
          ctx.beginPath();
          ctx.moveTo(b.x, b.topY + 12);
          ctx.lineTo(b.x + b.w * 0.8, b.topY);
          ctx.lineTo(b.x + b.w, b.topY + 6);
          ctx.stroke();
        } else if (b.type === 'spire') {
          // 标志性地标尖塔 (阶梯收分 + 挺拔天线与冷白信标)
          const midX = b.x + b.w / 2;
          ctx.moveTo(b.x, h * 0.74);
          ctx.lineTo(b.x, b.topY + 16);
          ctx.lineTo(b.x + b.w * 0.2, b.topY + 8);
          ctx.lineTo(b.x + b.w * 0.35, b.topY + 8);
          ctx.lineTo(midX, b.topY);
          ctx.lineTo(b.x + b.w * 0.65, b.topY + 8);
          ctx.lineTo(b.x + b.w * 0.8, b.topY + 8);
          ctx.lineTo(b.x + b.w, b.topY + 16);
          ctx.lineTo(b.x + b.w, h * 0.74);
          ctx.closePath();
          ctx.fill();
          // 塔尖冷白静止标点
          ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
          ctx.beginPath();
          ctx.arc(midX, b.topY, 1.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(7, 13, 26, 0.78)';
        } else if (b.type === 'stepback') {
          // 阶梯退台顶大厦 (帝国大厦/经典ArtDeco)
          ctx.moveTo(b.x, h * 0.74);
          ctx.lineTo(b.x, b.topY + 14);
          ctx.lineTo(b.x + b.w * 0.18, b.topY + 14);
          ctx.lineTo(b.x + b.w * 0.18, b.topY + 6);
          ctx.lineTo(b.x + b.w * 0.32, b.topY + 6);
          ctx.lineTo(b.x + b.w * 0.32, b.topY);
          ctx.lineTo(b.x + b.w * 0.68, b.topY);
          ctx.lineTo(b.x + b.w * 0.68, b.topY + 6);
          ctx.lineTo(b.x + b.w * 0.82, b.topY + 6);
          ctx.lineTo(b.x + b.w * 0.82, b.topY + 14);
          ctx.lineTo(b.x + b.w, b.topY + 14);
          ctx.lineTo(b.x + b.w, h * 0.74);
          ctx.closePath();
          ctx.fill();
        } else {
          // 极简现代平顶写字楼
          ctx.fillRect(b.x, b.topY, b.w, h * 0.74 - b.topY);
          // 顶楼冠部灯带
          ctx.strokeRect(b.x + 2, b.topY + 2, b.w - 4, 1.5);
        }
      });
    }
    ctx.restore();

    // 7.4 错落有致的万家灯火 (自然离散的香槟暖金与珍珠白窗光)
    ctx.save();
    if (this.skylineWindows && this.skylineWindows.length) {
      this.skylineWindows.forEach((w) => {
        ctx.fillStyle = w.color;
        ctx.globalAlpha = w.alpha;
        ctx.fillRect(w.x, w.y, w.w, w.h);
      });
    }
    ctx.restore();

    // 7.5 远景地平线大光圈电影散焦光斑 (散落的都会灯海星火)
    ctx.save();
    if (this.rooftopBokehs && this.rooftopBokehs.length) {
      this.rooftopBokehs.forEach((b) => {
        ctx.fillStyle = `${b.colorPrefix}${b.alpha})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();

    // 7.6 远景地面蜿蜒高架微光流 (香槟金车流长河)
    const trafficY = h * 0.73;
    ctx.save();
    const trafficGrad = ctx.createLinearGradient(0, trafficY, w, trafficY + 6);
    trafficGrad.addColorStop(0, 'rgba(252, 211, 77, 0.12)');
    trafficGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.18)');
    trafficGrad.addColorStop(1, 'rgba(252, 211, 77, 0.12)');
    ctx.strokeStyle = trafficGrad;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, trafficY + 2);
    ctx.quadraticCurveTo(w * 0.48, trafficY - 4, w, trafficY + 4);
    ctx.stroke();
    ctx.restore();

    // 7.7 现实前景：高奢天台全景极简玻璃护栏与露台空间 (身临其境的真实站立透视)
    const railY = h * 0.72; // 扶手高度 (约手肘靠扶处)
    const deckY = h * 0.78; // 露台地面高度

    ctx.save();
    // 露台深色微晶岩板地面 (从deckY向下铺展，带极微弱透视缝)
    const deckGrad = ctx.createLinearGradient(0, deckY, 0, h);
    deckGrad.addColorStop(0, '#0a0f1d');
    deckGrad.addColorStop(0.3, '#070a14');
    deckGrad.addColorStop(1.0, '#03050a');
    ctx.fillStyle = deckGrad;
    ctx.fillRect(0, deckY, w, h - deckY);

    // 露台地坪透视缝线 (从远处向近处微弱放射)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1.0;
    for (let lx = w * 0.15; lx < w; lx += w * 0.28) {
      ctx.beginPath();
      ctx.moveTo(lx, deckY);
      ctx.lineTo(lx + (lx - w / 2) * 0.35, h);
      ctx.stroke();
    }

    // 露台地脚嵌入式线性暖光 (沿护栏底座洗亮地面，现实高奢露台标志性细节)
    const footlight = ctx.createLinearGradient(0, deckY, 0, deckY + 36);
    footlight.addColorStop(0, 'rgba(251, 191, 36, 0.18)');
    footlight.addColorStop(0.5, 'rgba(245, 158, 11, 0.05)');
    footlight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = footlight;
    ctx.fillRect(0, deckY, w, 36);

    // 全景超白夹胶钢化玻璃护栏 (从railY至deckY，半透明若隐若现)
    const glassGrad = ctx.createLinearGradient(0, railY, 0, deckY);
    glassGrad.addColorStop(0, 'rgba(56, 189, 248, 0.045)');
    glassGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.02)');
    glassGrad.addColorStop(1, 'rgba(224, 242, 254, 0.05)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(0, railY, w, deckY - railY);

    // 玻璃立面垂直拼缝 (每块玻璃面板之间极细垂直分割线)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
    ctx.lineWidth = 1.0;
    for (let gx = w * 0.32; gx < w; gx += w * 0.33) {
      ctx.beginPath();
      ctx.moveTo(gx, railY + 2);
      ctx.lineTo(gx, deckY);
      ctx.stroke();

      // 护栏底部不锈钢固定点位夹具 (Spigots)
      ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
      ctx.fillRect(gx - 3.5, deckY - 6, 7, 6);
    }

    // 极简钛黑金属扶手 (顶部细窄金属梁)
    ctx.fillStyle = '#0a0d16';
    ctx.fillRect(0, railY, w, 3.5);

    // 扶手顶边月华银丝反光 (拉丝金属高光)
    ctx.fillStyle = 'rgba(224, 242, 254, 0.38)';
    ctx.fillRect(0, railY, w, 1.2);
    ctx.restore();
  }

  // ==========================================
  // 8. 微醺威士忌吧：暗调胡桃木吧台、晶莹冰球威士忌杯、柔焦酒架金辉与复古吊灯 (全新高奢)
  // ==========================================
  renderWhiskyBar(ctx, w, h, dt, t) {
    const bgGrad = ctx.createRadialGradient(w / 2, h * 0.28, 20, w / 2, h * 0.36, w * 0.95);
    bgGrad.addColorStop(0, '#1c1007');
    bgGrad.addColorStop(0.45, '#120904');
    bgGrad.addColorStop(1, '#050201');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 8.1 顶部复古黄铜吊灯与暖黄钨丝光晕
    const lampX = w * 0.5;
    const lampY = h * 0.10;
    const lampGlow = ctx.createRadialGradient(lampX, lampY + 15, 4, lampX, lampY + 15, 120);
    lampGlow.addColorStop(0, 'rgba(251, 191, 36, 0.40)');
    lampGlow.addColorStop(0.35, 'rgba(217, 119, 6, 0.16)');
    lampGlow.addColorStop(0.75, 'rgba(180, 83, 9, 0.04)');
    lampGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lampGlow;
    ctx.beginPath();
    ctx.arc(lampX, lampY + 15, 120, 0, Math.PI * 2);
    ctx.fill();

    // 吊灯挂绳与金属罩
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(lampX, 0); ctx.lineTo(lampX, lampY);
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(lampX, lampY + 4, 16, Math.PI, 0);
    ctx.fill();

    // 8.2 远景酒架柔焦酒瓶琥珀色金辉 Bokeh
    for (let i = 0; i < 8; i++) {
      const bx = w * 0.15 + (i * 38) % (w * 0.7);
      const by = h * 0.24 + ((i * 22) % 60);
      const bRad = 16 + (i % 3) * 6;
      const bGrad = ctx.createRadialGradient(bx, by, 2, bx, by, bRad);
      bGrad.addColorStop(0, 'rgba(245, 158, 11, 0.26)');
      bGrad.addColorStop(0.6, 'rgba(217, 119, 6, 0.08)');
      bGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(bx, by, bRad, 0, Math.PI * 2);
      ctx.fill();
    }

    // 8.3 空中漂浮的暖金威士忌微粒
    this.goldenDust.forEach(d => {
      d.y -= d.speedY * dt;
      if (d.y < 0) d.y = h;
      const alpha = 0.25 + 0.25 * Math.sin(t * 1.5 + d.phase);
      ctx.fillStyle = d.color;
      ctx.globalAlpha = Math.max(0.08, Math.min(0.75, alpha));
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // 8.4 暗调胡桃木高奢吧台台面
    const barY = h * 0.72;
    const barGrad = ctx.createLinearGradient(0, barY, 0, h);
    barGrad.addColorStop(0, '#2d180c');
    barGrad.addColorStop(0.2, '#1b0e06');
    barGrad.addColorStop(1, '#090402');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, barY, w, h - barY);

    // 吧台边缘黄铜收边线条
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, barY); ctx.lineTo(w, barY);
    ctx.stroke();

    // 8.5 右侧经典重质水晶岩石杯 (Old Fashioned Rocks Glass) 与大冰球
    const glassX = w * 0.82;
    const glassY = barY - 4;
    const gw = 44;
    const gh = 52;

    // 杯中琥珀色单麦威士忌酒液
    ctx.fillStyle = 'rgba(217, 119, 6, 0.72)';
    ctx.fillRect(glassX - gw / 2 + 3, glassY - gh * 0.55, gw - 6, gh * 0.55);

    // 半透明透亮大冰球 (Ice Sphere)
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(glassX, glassY - gh * 0.35, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // 水晶厚底杯杯壁轮廓与高光
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(glassX - gw / 2, glassY - gh, gw, gh);
  }

  // ==========================================
  // 9. 江湖夜钓：墨蓝静水微澜、岸边芦苇摇曳、三色电子夜光浮漂顿口与流萤 (钓鱼佬极度共鸣)
  // ==========================================
  renderNightFishing(ctx, w, h, dt, t) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#02050e');
    skyGrad.addColorStop(0.38, '#040d1e');
    skyGrad.addColorStop(0.72, '#020914');
    skyGrad.addColorStop(1, '#01040a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    this.renderStarfield(ctx, t, 0.50);

    // 9.1 水平线与远景山峦雾霭
    const waterY = h * 0.52;
    ctx.fillStyle = 'rgba(3, 14, 28, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, waterY);
    ctx.quadraticCurveTo(w * 0.35, waterY - 18, w * 0.7, waterY);
    ctx.lineTo(w, waterY - 8);
    ctx.lineTo(w, waterY);
    ctx.lineTo(0, waterY);
    ctx.closePath();
    ctx.fill();

    // 9.2 深邃水面与多层微澜水波
    const waterGrad = ctx.createLinearGradient(0, waterY, 0, h);
    waterGrad.addColorStop(0, '#031427');
    waterGrad.addColorStop(0.4, '#020d1a');
    waterGrad.addColorStop(1, '#00050c');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterY, w, h - waterY);

    // 水面微弱月夜波光
    for (let i = 0; i < 4; i++) {
      const wy = waterY + 28 + i * 42;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(w * 0.1, wy);
      ctx.quadraticCurveTo(w * 0.5, wy + Math.sin(t * 1.5 + i) * 3, w * 0.9, wy);
      ctx.stroke();
    }

    // 9.3 电子夜光浮漂 (Electronic Lighted Fishing Float) —— 钓鱼佬之魂
    // 浮漂水下微动与真实“下顿/吃口”动画
    const floatX = w * 0.68;
    const floatBaseY = h * 0.62;
    // 每隔 4.5 秒模拟一次逼真的“下顿黑漂”
    const biteCycle = (t * 0.4) % 4.5;
    const dip = (biteCycle > 2.8 && biteCycle < 3.3) ? Math.sin((biteCycle - 2.8) / 0.5 * Math.PI) * 7.5 : 0;
    const floatY = floatBaseY + Math.sin(t * 1.2) * 2.2 + dip;

    // 浮漂三色高亮发光目数（由上至下：红目、黄目、绿目）
    const segH = 7;
    // 漂尖红目
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(floatX - 1.8, floatY - 24, 3.6, segH);
    // 漂身黄目
    ctx.fillStyle = '#fde047';
    ctx.fillRect(floatX - 1.8, floatY - 16, 3.6, segH);
    // 漂身荧光绿目
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(floatX - 1.8, floatY - 8, 3.6, segH);

    // 浮漂绿色强荧光大光晕 (夜光漂核心视觉)
    const floatGlow = ctx.createRadialGradient(floatX, floatY - 14, 2, floatX, floatY - 14, 38);
    floatGlow.addColorStop(0, 'rgba(34, 197, 94, 0.45)');
    floatGlow.addColorStop(0.5, 'rgba(34, 197, 94, 0.15)');
    floatGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = floatGlow;
    ctx.beginPath();
    ctx.arc(floatX, floatY - 14, 38, 0, Math.PI * 2);
    ctx.fill();

    // 浮漂入水处同心涟漪波纹
    const ripR = 10 + (Math.sin(t * 2.5) * 4);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.38)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    if (typeof ctx.ellipse === 'function') {
      ctx.ellipse(floatX, floatY, ripR, ripR * 0.35, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(floatX, floatY, ripR, 0, Math.PI * 2);
    }
    ctx.stroke();

    // 浮漂在水中的翠绿长倒影
    const reflGrad = ctx.createLinearGradient(floatX, floatY, floatX, floatY + 36);
    reflGrad.addColorStop(0, 'rgba(34, 197, 94, 0.38)');
    reflGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
    ctx.fillStyle = reflGrad;
    ctx.fillRect(floatX - 2.5, floatY, 5, 36);

    // 9.4 岸边芦苇随风轻摆剪影 (左侧近景)
    ctx.save();
    ctx.strokeStyle = '#050a12';
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 7; i++) {
      const rx = 14 + i * 14;
      const rSway = Math.sin(t * 1.6 + i * 0.5) * 8;
      ctx.beginPath();
      ctx.moveTo(rx, h);
      ctx.quadraticCurveTo(rx + rSway * 0.5, h * 0.72, rx + rSway, h * 0.58);
      ctx.stroke();
    }
    ctx.restore();

    // 9.5 夜空与水面飞舞的绿色流萤
    this.fireflies.forEach(f => {
      f.x += f.speedX * dt;
      f.y += f.speedY * dt;
      if (f.x < 0) f.x = w;
      if (f.x > w) f.x = 0;
      if (f.y < h * 0.25) f.y = h * 0.8;
      if (f.y > h * 0.85) f.y = h * 0.3;

      const alpha = 0.25 + 0.45 * Math.sin(t * 2.8 + f.phase);
      if (alpha > 0.05) {
        ctx.fillStyle = `rgba(134, 239, 172, ${alpha})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // ==========================================
  // 10. 雪夜孤灯：凛冬复古街灯暖黄光锥、漫天晶莹飞雪冷暖交织与积雪栏杆
  // ==========================================
  renderSnowyLamp(ctx, w, h, dt, t) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#030712');
    skyGrad.addColorStop(0.45, '#081024');
    skyGrad.addColorStop(0.8, '#050a17');
    skyGrad.addColorStop(1, '#020409');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 10.1 右上角复古铸铁街灯与金黄钨丝灯罩
    const lampX = w * 0.78;
    const lampY = h * 0.16;

    // 灯杆横梁
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w, lampY - 14);
    ctx.lineTo(lampX, lampY - 14);
    ctx.lineTo(lampX, lampY);
    ctx.stroke();

    // 街灯斜照向下投射的柔美温暖锥形大光斑 (Volumetric Streetlamp Cone)
    ctx.save();
    const coneGrad = ctx.createRadialGradient(lampX, lampY + 10, 8, lampX - w * 0.25, h * 0.65, w * 0.85);
    coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.48)');
    coneGrad.addColorStop(0.25, 'rgba(251, 191, 36, 0.26)');
    coneGrad.addColorStop(0.65, 'rgba(245, 158, 11, 0.08)');
    coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(lampX - 10, lampY + 10);
    ctx.lineTo(lampX + 10, lampY + 10);
    ctx.lineTo(w * 0.7, h * 0.85);
    ctx.lineTo(w * 0.05, h * 0.85);
    ctx.closePath();
    ctx.fill();

    // 街灯核心灯泡
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(lampX, lampY + 6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 10.2 漫天晶莹飞雪：穿过暖光锥时呈现金白，背景中呈现清冷冰蓝
    this.snowflakes.forEach(s => {
      s.y += s.speedY * dt;
      s.x += Math.sin(t * s.swayFreq + s.phase) * (s.swayAmp * dt);
      if (s.y > h) {
        s.y = -6;
        s.x = Math.random() * w;
      }

      // 判断是否在路灯光锥附近
      const distToLight = Math.hypot(s.x - lampX, s.y - lampY);
      const inBeam = distToLight < 160;

      ctx.save();
      ctx.fillStyle = inBeam ? `rgba(254, 240, 138, ${s.alpha * 1.3})` : `rgba(224, 242, 254, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 10.3 底部栏杆与白色积雪
    const railY = h * 0.76;
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, railY, w, 6);
    // 栏杆上方积雪堆
    ctx.fillStyle = 'rgba(241, 245, 249, 0.88)';
    ctx.beginPath();
    ctx.moveTo(0, railY);
    for (let x = 0; x <= w; x += 20) {
      ctx.lineTo(x, railY - 3 - Math.sin(x * 0.08) * 2);
    }
    ctx.lineTo(w, railY);
    ctx.closePath();
    ctx.fill();
  }

  // ==========================================
  // 11. 禅院听竹：东方水墨月夜、翠竹随风轻摇、远山薄雾与古刹青檀香韵 (神兽/国风绝配)
  // ==========================================
  renderZenBamboo(ctx, w, h, dt, t) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#04080a');
    skyGrad.addColorStop(0.42, '#071618');
    skyGrad.addColorStop(0.78, '#030c0e');
    skyGrad.addColorStop(1, '#010506');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 11.1 东方明月与朦胧月晕 (Pale Luminous Zen Moon)
    const moonX = w * 0.35;
    const moonY = h * 0.18;

    const mHalo = ctx.createRadialGradient(moonX, moonY, 8, moonX, moonY, 58);
    mHalo.addColorStop(0, 'rgba(220, 252, 231, 0.28)');
    mHalo.addColorStop(0.5, 'rgba(187, 247, 208, 0.08)');
    mHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = mHalo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 58, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f0fdf4';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 11, 0, Math.PI * 2);
    ctx.fill();

    // 11.2 水墨远山与薄雾剪影
    ctx.fillStyle = 'rgba(4, 20, 22, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.58);
    ctx.quadraticCurveTo(w * 0.3, h * 0.48, w * 0.65, h * 0.55);
    ctx.quadraticCurveTo(w * 0.85, h * 0.59, w, h * 0.52);
    ctx.lineTo(w, h * 0.72);
    ctx.lineTo(0, h * 0.72);
    ctx.closePath();
    ctx.fill();

    // 11.3 翠竹枝竿随风轻摇 (Swaying Ink Bamboo Stalks & Leaves)
    this.bambooStalks.forEach(stalk => {
      const windSway = Math.sin(t * 1.4) * (14 * stalk.swayFactor);
      ctx.save();
      ctx.strokeStyle = `rgba(34, 197, 94, ${stalk.alpha * 0.75})`;
      ctx.lineWidth = stalk.width;
      ctx.beginPath();
      ctx.moveTo(stalk.x, h);
      ctx.quadraticCurveTo(stalk.x + windSway * 0.4, h * 0.5, stalk.x + windSway, h * 0.08);
      ctx.stroke();

      // 竹节节环与细长竹叶簇 (Bamboo Joints & Foliage)
      for (let j = 0; j < 5; j++) {
        const jy = h * 0.22 + j * (h * 0.14);
        const jx = stalk.x + windSway * (1 - (jy / h));
        // 节环
        ctx.fillStyle = `rgba(16, 185, 129, ${stalk.alpha * 0.9})`;
        ctx.fillRect(jx - stalk.width * 0.7, jy - 1.5, stalk.width * 1.4, 3);

        // 竹叶簇斜向飘逸
        const leafDir = stalk.side === 'left' ? 1 : -1;
        ctx.fillStyle = `rgba(74, 222, 128, ${stalk.alpha * 0.65})`;
        ctx.beginPath();
        ctx.moveTo(jx, jy);
        ctx.quadraticCurveTo(jx + leafDir * 28 + windSway * 0.3, jy - 6, jx + leafDir * 42, jy + 8);
        ctx.quadraticCurveTo(jx + leafDir * 22, jy + 4, jx, jy);
        ctx.fill();
      }
      ctx.restore();
    });

    // 11.4 升腾青檀香雾 (Pale Gold Incense Vapor)
    for (let i = 0; i < 3; i++) {
      const pProg = ((t * 0.35 + i * 0.33) % 1.0);
      const py = h * 0.82 - pProg * 65;
      const px = w * 0.5 + Math.sin(t * 1.8 + i * 2) * 8;
      const pAlpha = Math.sin(pProg * Math.PI) * 0.16;
      ctx.fillStyle = `rgba(254, 240, 138, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(px, py, 4 + pProg * 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ==========================================
  // 通用繁星漫布绘制辅助函数
  // ==========================================
  renderStarfield(ctx, t, maxAlpha = 0.8) {
    this.stars.forEach((star) => {
      const alpha = 0.2 + (maxAlpha - 0.2) * Math.sin(t * star.freq + star.phase);
      if (alpha > 0.05) {
        ctx.fillStyle = `rgba(224, 242, 254, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // ==========================================
  // 12. 雨夜车窗：A柱内景轮廓、仪表盘氛围微光、散焦霓虹与雨丝水痕
  // ==========================================
  renderRainyCar(ctx, w, h, dt, t) {
    const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
    baseGrad.addColorStop(0, '#070912');
    baseGrad.addColorStop(0.5, '#05070d');
    baseGrad.addColorStop(1, '#020306');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, w, h);

    // 城市散焦霓虹光斑
    this.bokehs.forEach((b, i) => {
      const offsetX = Math.sin(t * b.speed + i) * 12;
      const offsetY = Math.cos(t * (b.speed * 0.8) + i) * 8;
      const bx = b.x + offsetX;
      const by = b.y + offsetY;
      const pulseR = b.r + Math.sin(t * 1.2 + i) * 3;

      const grad = ctx.createRadialGradient(bx, by, 2, bx, by, pulseR);
      grad.addColorStop(0, `${b.color}0.28)`);
      grad.addColorStop(0.5, `${b.color}0.11)`);
      grad.addColorStop(1, `${b.color}0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx, by, pulseR, 0, Math.PI * 2);
      ctx.fill();
    });

    // 窗外斜织滑落雨线
    ctx.lineWidth = 1.2;
    this.raindrops.forEach((drop) => {
      drop.y += drop.speed * dt;
      drop.x += drop.wind * (drop.speed * 0.15) * dt;

      if (drop.y > h + drop.length) {
        drop.y = -drop.length - Math.random() * 40;
        drop.x = Math.random() * w;
        drop.speed = 180 + Math.random() * 220;
      }

      ctx.strokeStyle = `rgba(186, 230, 253, ${drop.alpha * 0.7})`;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x + drop.wind * 4, drop.y + drop.length);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${drop.alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(drop.x + drop.wind * 4, drop.y + drop.length, drop.width * 0.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // 车内 A 柱轮廓与顶部遮光横条
    ctx.fillStyle = '#030508';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(24, 0); ctx.lineTo(0, h * 0.65);
    ctx.closePath();
    ctx.fill();

    // 底部仪表盘氛围灯微光线
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.86); ctx.lineTo(w, h * 0.86);
    ctx.stroke();
  }

  // ==========================================
  // 13. 森林篝火：松林夜幕围炉、交叉柴堆跃动火苗与升腾火星
  // ==========================================
  renderCampfire(ctx, w, h, dt, t) {
    const forestGrad = ctx.createLinearGradient(0, 0, 0, h);
    forestGrad.addColorStop(0, '#040b08');
    forestGrad.addColorStop(0.5, '#020705');
    forestGrad.addColorStop(1, '#010403');
    ctx.fillStyle = forestGrad;
    ctx.fillRect(0, 0, w, h);

    // 远景松树剪影
    ctx.fillStyle = '#020905';
    for (let i = 0; i < 9; i++) {
      const tx = i * (w * 0.13);
      const th = 85 + (i % 3) * 22;
      ctx.beginPath();
      ctx.moveTo(tx, h * 0.62);
      ctx.lineTo(tx + 22, h * 0.62 - th);
      ctx.lineTo(tx + 44, h * 0.62);
      ctx.closePath();
      ctx.fill();
    }

    // 篝火温暖呼吸红光圈
    const firePulse = Math.sin(t * 3.5) * 10;
    const fireGlowR = w * 0.50 + firePulse;
    const fireGrad = ctx.createRadialGradient(w / 2, h * 0.74, 10, w / 2, h * 0.74, fireGlowR);
    fireGrad.addColorStop(0, 'rgba(245, 158, 11, 0.36)');
    fireGrad.addColorStop(0.4, 'rgba(220, 38, 38, 0.20)');
    fireGrad.addColorStop(0.75, 'rgba(180, 83, 9, 0.08)');
    fireGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.74, fireGlowR, 0, Math.PI * 2);
    ctx.fill();

    // 底部交叉木柴堆剪影
    ctx.strokeStyle = '#291307';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(w * 0.38, h * 0.78); ctx.lineTo(w * 0.62, h * 0.75);
    ctx.moveTo(w * 0.62, h * 0.78); ctx.lineTo(w * 0.38, h * 0.75);
    ctx.stroke();

    // 跳动的篝火火焰核心 (Dancing Flame Core)
    const flameH = 26 + Math.sin(t * 7.5) * 6;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(w * 0.44, h * 0.76);
    ctx.quadraticCurveTo(w * 0.5 + Math.sin(t * 9) * 4, h * 0.76 - flameH, w * 0.56, h * 0.76);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.75, 7, 0, Math.PI * 2);
    ctx.fill();

    // 升腾炭火星
    this.embers.forEach((ember) => {
      ember.life += dt;
      ember.y -= ember.speedY * dt;
      ember.x += Math.sin(t * ember.sineFreq + ember.phase) * (ember.sineAmp * dt * 2);

      if (ember.life >= ember.maxLife || ember.y < h * 0.15) {
        ember.life = 0;
        ember.y = h * (0.72 + Math.random() * 0.15);
        ember.x = w * 0.5 + (Math.random() - 0.5) * (w * 0.35);
        ember.speedY = 25 + Math.random() * 45;
      }

      const progress = ember.life / ember.maxLife;
      const alpha = Math.sin(progress * Math.PI) * 0.85;

      ctx.save();
      ctx.fillStyle = progress < 0.6 ? '#fef08a' : '#f97316';
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      ctx.arc(ember.x, ember.y, ember.size * (1 - progress * 0.4), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ==========================================
  // 14. 独创「火光映境」实时环境光联动 (Ember Reactive Lighting)
  // 当用户在黑暗环境中点火或深吸一口时，烟头橙红火光实时照亮周围前景结构，松手后柔和冷却暗下
  // ==========================================
  renderEmberEnvironmentReflection(ctx, w, h, sceneType, t, emberIntensity) {
    if (emberIntensity <= 0.05) return;
    ctx.save();

    const pulse = 1.0 + 0.14 * Math.sin(t * 5.0);
    const alpha = Math.min(0.65, emberIntensity * pulse * 0.42);

    // 烟头火光大范围球形环境光照辐射 (Radial Ambient Ember Spill)
    const emberGrad = ctx.createRadialGradient(w * 0.5, h * 0.56, 15, w * 0.5, h * 0.56, w * 0.68);
    emberGrad.addColorStop(0, `rgba(239, 68, 68, ${alpha * 0.45})`);
    emberGrad.addColorStop(0.35, `rgba(249, 115, 22, ${alpha * 0.28})`);
    emberGrad.addColorStop(0.75, `rgba(217, 119, 6, ${alpha * 0.08})`);
    emberGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = emberGrad;
    ctx.fillRect(0, 0, w, h);

    // 针对不同场景的前景结构进行专属暖火高光勾勒
    if (sceneType === 'rainy_car') {
      // 照亮车窗玻璃边缘与 A 柱高光
      ctx.strokeStyle = `rgba(249, 115, 22, ${alpha * 0.85})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.86); ctx.lineTo(w, h * 0.86); // 仪表台暖光
      ctx.stroke();
    } else if (sceneType === 'stairwell') {
      // 照亮楼梯间不锈钢扶手
      ctx.strokeStyle = `rgba(249, 115, 22, ${alpha * 0.75})`;
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(w * 0.05, h * 0.82); ctx.lineTo(w * 0.95, h * 0.56);
      ctx.stroke();
    } else if (sceneType === 'midnight_rooftop') {
      // 照亮天台极简金属扶手与玻璃护栏上沿
      ctx.strokeStyle = `rgba(249, 115, 22, ${alpha * 0.68})`;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.72); ctx.lineTo(w, h * 0.72);
      ctx.stroke();
    } else if (sceneType === 'whisky_bar') {
      // 照亮胡桃木吧台与水晶酒杯边缘
      ctx.strokeStyle = `rgba(251, 146, 60, ${alpha * 0.92})`;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.72); ctx.lineTo(w, h * 0.72);
      ctx.stroke();
    } else if (sceneType === 'sakura_night') {
      // 照亮庭院木质回廊水镜边缘与飞掠近处樱花
      ctx.strokeStyle = `rgba(244, 114, 182, ${alpha * 0.75})`;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.84); ctx.lineTo(w, h * 0.84);
      ctx.stroke();
    } else if (sceneType === 'starship_bridge') {
      // 照亮钛合金舷窗装甲边缘与全息控制台
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.85})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.88); ctx.lineTo(w, h * 0.88);
      ctx.stroke();
    } else if (sceneType === 'starlink_orbit') {
      // 照亮地球南极边缘与近地轨道卫星太阳翼反光
      ctx.strokeStyle = `rgba(249, 115, 22, ${alpha * 0.85})`;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.31, Math.min(w * 0.34, 136), Math.PI * 0.25, Math.PI * 0.75);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ==========================================
  // 15. 极简黑曜：极致写实纯黑微距摄影背景 (Solid Pitch-Black Studio Background)
  // ==========================================
  renderObsidian(ctx, w, h) {
    // 腾讯总监设计级：透明纯黑通透画布 (清空像素，让底层 .app-container 的高奢深曜/速7/驭7尊享车色天幕无界自然透出)
    ctx.clearRect(0, 0, w, h);
  }

  // ==========================================
  // 13. 蔚蓝深海：浩瀚夜海平线、明月当空与层叠潮汐浪涌
  // ==========================================
  renderOcean(ctx, w, h, dt, t) {
    const horizonY = h * 0.38;

    // 1. 夜空深邃海洋蓝黑渐变
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#010614');
    skyGrad.addColorStop(0.4, '#03162e');
    skyGrad.addColorStop(0.8, '#04274c');
    skyGrad.addColorStop(1.0, '#0c446c');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY + 2);

    // 2. 海洋夜空繁星
    this.renderStarfield(ctx, t, 0.45);

    // 3. 皎洁明月与柔光月晕 (Luminous Moonlight)
    const moonX = w * 0.74;
    const moonY = h * 0.16;

    // 广域深蓝柔光晕
    const outerHalo = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 65);
    outerHalo.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
    outerHalo.addColorStop(0.5, 'rgba(14, 116, 144, 0.08)');
    outerHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = outerHalo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 65, 0, Math.PI * 2);
    ctx.fill();

    // 近心明月微光晕
    const innerHalo = ctx.createRadialGradient(moonX, moonY, 4, moonX, moonY, 24);
    innerHalo.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    innerHalo.addColorStop(0.4, 'rgba(224, 242, 254, 0.45)');
    innerHalo.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = innerHalo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 24, 0, Math.PI * 2);
    ctx.fill();

    // 明月本体
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 9.5, 0, Math.PI * 2);
    ctx.fill();

    // 月表浅浅环形山阴影 (Lunar Maria)
    ctx.fillStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.beginPath();
    ctx.arc(moonX - 2.5, moonY - 1.5, 3.2, 0, Math.PI * 2);
    ctx.arc(moonX + 2.0, moonY + 2.5, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // 4. 远景海平线神秘岛屿剪影
    ctx.fillStyle = '#021224';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(w * 0.22, horizonY);
    ctx.quadraticCurveTo(w * 0.32, horizonY - 14, w * 0.45, horizonY);
    ctx.lineTo(w * 0.52, horizonY);
    ctx.quadraticCurveTo(w * 0.60, horizonY - 8, w * 0.68, horizonY);
    ctx.lineTo(w, horizonY);
    ctx.lineTo(w, horizonY + 2);
    ctx.lineTo(0, horizonY + 2);
    ctx.closePath();
    ctx.fill();

    // 5. 海洋水体基底渐变 (深海深邃纯净蓝黑)
    const oceanGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    oceanGrad.addColorStop(0, '#03233f');
    oceanGrad.addColorStop(0.3, '#02182d');
    oceanGrad.addColorStop(0.65, '#011022');
    oceanGrad.addColorStop(1.0, '#000814');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // 6. 海面月光反射大道 (Moonlight Glitter Path on Ocean)
    const glitterGrad = ctx.createLinearGradient(moonX, horizonY, moonX, h);
    glitterGrad.addColorStop(0, 'rgba(224, 242, 254, 0.45)');
    glitterGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.25)');
    glitterGrad.addColorStop(0.7, 'rgba(6, 182, 212, 0.12)');
    glitterGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glitterGrad;
    ctx.beginPath();
    ctx.moveTo(moonX - 12, horizonY);
    ctx.lineTo(moonX + 12, horizonY);
    ctx.lineTo(moonX + 65, h);
    ctx.lineTo(moonX - 65, h);
    ctx.closePath();
    ctx.fill();

    // 7. 多层动态起伏潮汐波浪 (Organic Ocean Wave Swells)
    // 7.1 远海微澜 (Far Swell)
    ctx.save();
    ctx.fillStyle = 'rgba(3, 40, 72, 0.75)';
    ctx.beginPath();
    ctx.moveTo(0, horizonY + 18);
    for (let x = 0; x <= w; x += 15) {
      const wy = horizonY + 18 + Math.sin(x * 0.025 + t * 0.8) * 3.5 + Math.cos(x * 0.015 - t * 0.5) * 2;
      ctx.lineTo(x, wy);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 远海微光浪线
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 15) {
      const wy = horizonY + 18 + Math.sin(x * 0.025 + t * 0.8) * 3.5 + Math.cos(x * 0.015 - t * 0.5) * 2;
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
    ctx.restore();

    // 7.2 中景涌浪 (Mid Wave Swell)
    ctx.save();
    ctx.fillStyle = 'rgba(2, 25, 48, 0.82)';
    ctx.beginPath();
    const midBaseY = horizonY + 65;
    ctx.moveTo(0, midBaseY);
    for (let x = 0; x <= w; x += 18) {
      const wy = midBaseY + Math.sin(x * 0.018 - t * 1.1) * 7.5 + Math.cos(x * 0.035 + t * 0.7) * 3.5;
      ctx.lineTo(x, wy);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 中景碧蓝浪脊高光
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.48)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 18) {
      const wy = midBaseY + Math.sin(x * 0.018 - t * 1.1) * 7.5 + Math.cos(x * 0.035 + t * 0.7) * 3.5;
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
    ctx.restore();

    // 7.3 前景潮涌大浪与浪花泡沫 (Near Cresting Waves & Sea Foam)
    ctx.save();
    const nearBaseY = h * 0.65;
    const waveGrad = ctx.createLinearGradient(0, nearBaseY - 15, 0, h);
    waveGrad.addColorStop(0, 'rgba(2, 18, 38, 0.88)');
    waveGrad.addColorStop(1, 'rgba(0, 8, 20, 0.98)');
    ctx.fillStyle = waveGrad;
    ctx.beginPath();
    ctx.moveTo(0, nearBaseY);
    for (let x = 0; x <= w; x += 20) {
      const wy = nearBaseY + Math.sin(x * 0.014 + t * 1.3) * 11 + Math.cos(x * 0.028 - t * 0.9) * 4.5;
      ctx.lineTo(x, wy);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 前景白色透亮浪沫光弧 (Cresting Sea Foam Arcs)
    ctx.strokeStyle = 'rgba(240, 253, 250, 0.75)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let x = 0; x <= w; x += 15) {
      const wy = nearBaseY + Math.sin(x * 0.014 + t * 1.3) * 11 + Math.cos(x * 0.028 - t * 0.9) * 4.5;
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();

    // 浪花细微飞沫光点 (Drifting Spray Droplets)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < 14; i++) {
      const sx = ((i * 28 + t * 35) % (w + 40)) - 20;
      const sy = nearBaseY + Math.sin(sx * 0.014 + t * 1.3) * 11 - 2.5 - Math.sin(t * 2 + i) * 3;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 8. 海面水光粼粼动态烁纹 (Shimmering Water Glints)
    ctx.save();
    const glints = this.oceanGlints || [];
    glints.forEach(g => {
      const gx = (g.x + Math.sin(t * g.speed + g.phase) * 14 + w) % w;
      const alpha = 0.25 + 0.45 * Math.sin(t * 2.2 + g.phase);
      if (alpha > 0.05) {
        ctx.strokeStyle = `rgba(165, 243, 252, ${alpha})`;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(gx - g.w / 2, g.y);
        ctx.lineTo(gx + g.w / 2, g.y);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  // ==========================================
  // 14. 雨夜露营：旷野天幕听雨 · 暖光马灯与墨青远山 (Rainy Camp Under Tarp)
  // ==========================================
  renderRainyCamp(ctx, w, h, dt, t) {
    // 1. 苍茫墨青雨夜天幕背景
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#040914');
    skyGrad.addColorStop(0.4, '#071220');
    skyGrad.addColorStop(0.75, '#050c18');
    skyGrad.addColorStop(1.0, '#03070d');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. 远山剪影 (Far Mountain Silhouettes)
    ctx.save();
    const mtnGrad1 = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.65);
    mtnGrad1.addColorStop(0, 'rgba(8, 20, 36, 0.7)');
    mtnGrad1.addColorStop(1, 'rgba(4, 10, 20, 0.9)');
    ctx.fillStyle = mtnGrad1;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.52);
    ctx.quadraticCurveTo(w * 0.3, h * 0.42, w * 0.65, h * 0.48);
    ctx.quadraticCurveTo(w * 0.85, h * 0.52, w, h * 0.45);
    ctx.lineTo(w, h * 0.75);
    ctx.lineTo(0, h * 0.75);
    ctx.closePath();
    ctx.fill();

    // 山间雾霭层 (Mountain Fog Layer)
    const fogGrad = ctx.createLinearGradient(0, h * 0.46, 0, h * 0.58);
    fogGrad.addColorStop(0, 'rgba(30, 58, 88, 0)');
    fogGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.08)');
    fogGrad.addColorStop(1, 'rgba(30, 58, 88, 0)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, h * 0.46, w, h * 0.12);
    ctx.restore();

    // 3. 斜织细雨 (Diagonal Rain Streamers)
    ctx.save();
    ctx.lineWidth = 1.1;
    this.raindrops.forEach((drop) => {
      drop.y += drop.speed * dt * 0.85;
      drop.x += (drop.wind * (drop.speed * 0.18) - 15) * dt;

      if (drop.y > h + drop.length) {
        drop.y = -drop.length - Math.random() * 30;
        drop.x = Math.random() * (w + 100);
      }

      ctx.strokeStyle = `rgba(186, 230, 253, ${drop.alpha * 0.45})`;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - 6, drop.y + drop.length);
      ctx.stroke();
    });
    ctx.restore();

    // 4. 露营防雨天幕三角斜檐 (Camp Shelter Tarp Canopy)
    ctx.save();
    ctx.fillStyle = '#060a12';
    ctx.beginPath();
    ctx.moveTo(-20, -10);
    ctx.lineTo(w * 0.52, h * 0.18);
    ctx.lineTo(w + 20, -10);
    ctx.lineTo(w + 20, -20);
    ctx.lineTo(-20, -20);
    ctx.closePath();
    ctx.fill();

    // 天幕深黑边框压条
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 天幕挂绳 (Tarp Suspension Cord)
    const lanternSway = Math.sin(t * 1.6) * 3.5;
    const ropeTopX = w * 0.52;
    const ropeTopY = h * 0.18;
    const lanternX = ropeTopX + lanternSway;
    const lanternY = ropeTopY + 44;

    ctx.strokeStyle = 'rgba(100, 116, 139, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(ropeTopX, ropeTopY);
    ctx.lineTo(lanternX, lanternY);
    ctx.stroke();

    // 5. 暖黄钨丝复古马灯 (Vintage Amber Camp Lantern)
    const glowPulse = Math.sin(t * 3.0) * 6;
    const glowR = 110 + glowPulse;
    const glowGrad = ctx.createRadialGradient(lanternX, lanternY + 12, 4, lanternX, lanternY + 12, glowR);
    glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.38)');
    glowGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.16)');
    glowGrad.addColorStop(0.7, 'rgba(217, 119, 6, 0.05)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(lanternX, lanternY + 12, glowR, 0, Math.PI * 2);
    ctx.fill();

    // 马灯金属顶盖
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(lanternX, lanternY + 2, 9, Math.PI, 0);
    ctx.fill();

    // 马灯玻璃灯罩
    ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.beginPath();
    ctx.rect(lanternX - 6, lanternY + 2, 12, 16);
    ctx.fill();

    // 核心钨丝亮点
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(lanternX, lanternY + 10, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 马灯底座
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.rect(lanternX - 8, lanternY + 18, 16, 4);
    ctx.fill();

    // 6. 热咖啡丝缕升腾白汽 (Steaming Coffee Thermos Mug on Side)
    const mugX = w * 0.82;
    const mugY = h * 0.74;
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.rect(mugX - 8, mugY, 16, 22);
    ctx.fill();

    for (let i = 0; i < 3; i++) {
      const steamProg = ((t * 0.5 + i * 0.33) % 1.0);
      const sy = mugY - steamProg * 36;
      const sx = mugX + Math.sin(t * 2.2 + i * 1.8) * 3;
      const sAlpha = Math.sin(steamProg * Math.PI) * 0.20;
      ctx.fillStyle = `rgba(255, 255, 255, ${sAlpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5 + steamProg * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ==========================================
  // 15. VIP 尊享三阶极光天幕与浮光星尘叠加层 (Tencent V10 Prestige Ambient Aura)
  // ==========================================
  renderVipAmbientOverlay(ctx, w, h, dt, t, vipTheme) {
    ctx.save();
    const pulse = 0.85 + 0.15 * Math.sin(t * 1.4);

    let topColor0 = 'rgba(168, 85, 247, 0.22)';
    let topColor1 = 'rgba(124, 58, 237, 0.08)';
    let centerColor0 = 'rgba(192, 132, 252, 0.11)';
    let sparkRgb = '233, 213, 255';

    const themeOpt = getThemeById(vipTheme);
    if (themeOpt) {
      if (themeOpt.orb1) topColor0 = themeOpt.orb1;
      if (themeOpt.orb2) {
        topColor1 = themeOpt.orb2;
        centerColor0 = themeOpt.orb2;
      }
      if (themeOpt.spark) {
        const hex = themeOpt.spark.replace('#', '');
        if (hex.length === 6) {
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          sparkRgb = `${r}, ${g}, ${b}`;
        }
      }
    } else if (vipTheme === 'day' || vipTheme === 'emerald') {
      topColor0 = 'rgba(16, 185, 129, 0.22)';
      topColor1 = 'rgba(5, 150, 105, 0.08)';
      centerColor0 = 'rgba(52, 211, 153, 0.10)';
      sparkRgb = '167, 243, 208';
    } else if (vipTheme === 'lifetime' || vipTheme === 'glacier') {
      topColor0 = 'rgba(251, 191, 36, 0.25)';
      topColor1 = 'rgba(180, 83, 9, 0.09)';
      centerColor0 = 'rgba(253, 224, 71, 0.12)';
      sparkRgb = '254, 240, 138';
    }

    // 1. 天顶流光极光穹顶呼吸光冕
    const crownGrad = ctx.createRadialGradient(w * 0.5, h * 0.06, 8, w * 0.5, h * 0.12, w * 0.88 * pulse);
    crownGrad.addColorStop(0, topColor0);
    crownGrad.addColorStop(0.48, topColor1);
    crownGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = crownGrad;
    ctx.fillRect(0, 0, w, h * 0.65);

    // 2. 烟支舞台背光尊享柔晕
    const stageGrad = ctx.createRadialGradient(w * 0.5, h * 0.46, 12, w * 0.5, h * 0.46, w * 0.58);
    stageGrad.addColorStop(0, centerColor0);
    stageGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = stageGrad;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.46, w * 0.58, 0, Math.PI * 2);
    ctx.fill();

    // 3. 尊享浮光星尘微粒（复用 goldenDust 轨迹参数，零内存分配）
    const dustList = this.goldenDust || [];
    const count = Math.min(18, dustList.length);
    for (let i = 0; i < count; i++) {
      const d = dustList[i];
      const dy = (d.y - t * (10 + (i % 5) * 3) + h * 100) % h;
      const dx = (d.x + Math.sin(t * 0.9 + d.phase) * 14 + w) % w;
      const alpha = (0.18 + 0.28 * Math.sin(t * 1.8 + d.phase)) * (dy < h * 0.78 ? 1 : 0.4);
      if (alpha > 0.04) {
        ctx.fillStyle = `rgba(${sparkRgb}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(dx, dy, d.r * 0.95, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // ==========================================
  // 16. 落樱夜庭：东方物哀美学 · 绯月薄雾、古雅檐廊、和风纸灯、水镜涟漪与3D物理落樱
  // ==========================================
  renderSakuraNight(ctx, w, h, dt, t, emberIntensity = 0) {
    // 16.1 深邃春夜星空渐变 (Deep Indigo-Plum Night Sky)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#060614');
    skyGrad.addColorStop(0.38, '#130a28');
    skyGrad.addColorStop(0.72, '#1e0c32');
    skyGrad.addColorStop(1, '#090412');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 16.2 绯月与浪漫月晕 (Crimson Sakura Moon & Soft Corona)
    const moonX = w * 0.78;
    const moonY = h * 0.16;

    // 外层漫射绯月光晕
    const moonHalo = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 82);
    moonHalo.addColorStop(0, 'rgba(253, 242, 248, 0.32)');
    moonHalo.addColorStop(0.35, 'rgba(244, 114, 182, 0.18)');
    moonHalo.addColorStop(0.75, 'rgba(168, 85, 247, 0.05)');
    moonHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonHalo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 82, 0, Math.PI * 2);
    ctx.fill();

    // 绯月本体
    ctx.fillStyle = '#fff1f2';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 15, 0, Math.PI * 2);
    ctx.fill();

    // 16.3 远山与夜樱林海雾霭 (Misty Mountain Silhouettes & Cherry Canopy)
    ctx.fillStyle = 'rgba(22, 11, 42, 0.82)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.52);
    ctx.quadraticCurveTo(w * 0.28, h * 0.45, w * 0.58, h * 0.50);
    ctx.quadraticCurveTo(w * 0.82, h * 0.54, w, h * 0.48);
    ctx.lineTo(w, h * 0.75);
    ctx.lineTo(0, h * 0.75);
    ctx.closePath();
    ctx.fill();

    // 远方朦胧夜樱花团雾气 (Soft Sakura Clouds)
    for (let c = 0; c < 4; c++) {
      const cx = w * (0.15 + c * 0.26);
      const cy = h * (0.47 + (c % 2) * 0.04);
      const cGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 38);
      cGrad.addColorStop(0, 'rgba(244, 114, 182, 0.14)');
      cGrad.addColorStop(0.6, 'rgba(190, 24, 93, 0.06)');
      cGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.fill();
    }

    // 16.4 左上方和风古雅木檐与立柱 (Japanese Traditional Eaves & Pillar)
    ctx.save();
    // 左侧木柱
    ctx.fillStyle = '#080310';
    ctx.fillRect(0, 0, w * 0.05, h * 0.84);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(w * 0.05, 0); ctx.lineTo(w * 0.05, h * 0.84);
    ctx.stroke();

    // 上方优美飞檐
    ctx.fillStyle = '#0a0414';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w * 0.42, 0);
    ctx.quadraticCurveTo(w * 0.28, h * 0.08, 0, h * 0.13);
    ctx.closePath();
    ctx.fill();

    // 檐下微雕木梁线
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.22)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.125);
    ctx.quadraticCurveTo(w * 0.27, h * 0.076, w * 0.41, 0);
    ctx.stroke();

    // 悬挂和风纸提灯 (Suspended Paper Lantern with Warm Amber Spill)
    const lanternX = w * 0.22;
    const lanternCordTopY = h * 0.07;
    const lanternY = h * 0.18;
    const sway = Math.sin(t * 1.2) * 3;

    // 吊绳
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.7)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(lanternX, lanternCordTopY);
    ctx.lineTo(lanternX + sway, lanternY - 14);
    ctx.stroke();

    // 提灯暖光外晕
    const lanternGlow = ctx.createRadialGradient(lanternX + sway, lanternY, 3, lanternX + sway, lanternY, 48);
    lanternGlow.addColorStop(0, 'rgba(251, 191, 36, 0.38)');
    lanternGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
    lanternGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lanternGlow;
    ctx.beginPath();
    ctx.arc(lanternX + sway, lanternY, 48, 0, Math.PI * 2);
    ctx.fill();

    // 提灯纸本体 (红木顶座 + 暖黄纸身)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(lanternX + sway - 8, lanternY - 15, 16, 3);
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(lanternX + sway, lanternY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(lanternX + sway - 6, lanternY + 8, 12, 2.5);
    ctx.restore();

    // 16.5 底部水镜微澜倒影与木质回廊 (Pond Water Mirror & Ripples)
    const pondY = h * 0.84;
    const pondGrad = ctx.createLinearGradient(0, pondY, 0, h);
    pondGrad.addColorStop(0, 'rgba(10, 4, 20, 0.85)');
    pondGrad.addColorStop(1, '#040208');
    ctx.fillStyle = pondGrad;
    ctx.fillRect(0, pondY, w, h - pondY);

    // 水面月影倒映
    const moonReflectGrad = ctx.createRadialGradient(moonX, pondY + (h - pondY) * 0.4, 2, moonX, pondY + (h - pondY) * 0.4, 32);
    moonReflectGrad.addColorStop(0, 'rgba(244, 114, 182, 0.22)');
    moonReflectGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonReflectGrad;
    ctx.beginPath();
    ctx.arc(moonX, pondY + (h - pondY) * 0.4, 32, 0, Math.PI * 2);
    ctx.fill();

    // 微弱水面涟漪
    for (let r = 0; r < 2; r++) {
      const ripProg = (t * 0.35 + r * 0.5) % 1.0;
      const ripAlpha = (1 - ripProg) * 0.25;
      const ripW = 20 + ripProg * 50;
      const ripH = 4 + ripProg * 8;
      ctx.strokeStyle = `rgba(244, 114, 182, ${ripAlpha})`;
      ctx.lineWidth = 1.0;
      ctx.save();
      ctx.translate(w * 0.45 + r * 60, pondY + 24 + r * 16);
      ctx.scale(1, ripH / ripW);
      ctx.beginPath();
      ctx.arc(0, 0, ripW, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 16.6 3D 物理景深落樱粒子系统 (3D Depth-Sorted Sakura Petals)
    const petals = this.sakuraPetals || [];
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      // 物理位移与微风扰动
      p.y += p.speedY * dt;
      p.x += (p.speedX + Math.sin(t * p.swayFreq + p.phase) * p.swayAmp) * dt;

      // 边界循环重置
      if (p.y > h + 15) {
        p.y = -15;
        p.x = Math.random() * w;
      }
      if (p.x > w + 20) p.x = -20;
      if (p.x < -20) p.x = w + 20;

      // 3D 空间翻滚模拟 (3D Tumble)
      const flipScale = Math.cos(t * p.flipSpeed + p.phase);
      const absFlip = Math.abs(flipScale);
      if (absFlip < 0.08) continue; // 侧面极薄不可见

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot + t * p.rotSpeed);
      ctx.scale(p.depth, p.depth * flipScale);

      // 靠近烟头火光时的映红光效联动 (Ember SSS Illumination)
      const distToEmber = Math.hypot(p.x - w * 0.5, p.y - h * 0.56);
      let petalFill = p.color;
      if (emberIntensity > 0.1 && distToEmber < 140) {
        const warmFactor = (1 - distToEmber / 140) * emberIntensity;
        petalFill = warmFactor > 0.4 ? '#fca5a5' : '#fbcfe8';
      }

      // 精致落樱花瓣双贝塞尔曲线几何轮廓 (True Sakura Petal with Notch)
      const sz = p.size;
      ctx.fillStyle = petalFill;
      ctx.globalAlpha = p.depth * 0.88;
      ctx.beginPath();
      ctx.moveTo(0, -sz);
      ctx.bezierCurveTo(sz * 0.85, -sz * 0.8, sz * 0.95, sz * 0.35, 0, sz);
      ctx.bezierCurveTo(-sz * 0.95, sz * 0.35, -sz * 0.85, -sz * 0.8, 0, -sz);
      ctx.fill();

      // 花瓣中心微细叶脉反光
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -sz * 0.65);
      ctx.lineTo(0, sz * 0.5);
      ctx.stroke();

      ctx.restore();
    }
  }

  // ==========================================
  // 17. 星港巨舰：海湾远眺观礼台 · 马斯克星舰 (Starship + Super Heavy) 发射与机械臂捕获回收全流程
  // ==========================================
  renderStarshipLaunch(ctx, w, h, dt, t, emberIntensity = 0) {
    // 17.1 墨西哥湾暮色深空渐变 (Gulf Coast Twilight Sky)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    skyGrad.addColorStop(0, '#030611');
    skyGrad.addColorStop(0.5, '#08112b');
    skyGrad.addColorStop(0.85, '#132147');
    skyGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.65);

    // 17.2 繁星微光闪烁
    for (let i = 0; i < 45; i++) {
      const sx = (Math.sin(i * 99 + 1) * 0.5 + 0.5) * w;
      const sy = (Math.cos(i * 33 + 2) * 0.5 + 0.5) * (h * 0.52);
      const salpha = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * (1.2 + (i % 5) * 0.4) + i));
      ctx.fillStyle = `rgba(224, 242, 254, ${salpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3 === 0) ? 1.4 : 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 17.3 对岸平缓地平线与星港工业剪影 (Starbase Horizon)
    const coastY = h * 0.62;
    ctx.fillStyle = '#0a0f1d';
    ctx.beginPath();
    ctx.moveTo(0, coastY + 4);
    ctx.lineTo(w * 0.4, coastY + 1);
    ctx.lineTo(w * 0.62, coastY);
    ctx.lineTo(w, coastY + 2);
    ctx.lineTo(w, h * 0.68);
    ctx.lineTo(0, h * 0.68);
    ctx.closePath();
    ctx.fill();

    // 远方星港基地微弱暖黄与幽蓝工程灯光带 (Industrial Lights)
    for (let i = 0; i < 16; i++) {
      const lx = w * 0.45 + i * (w * 0.035);
      const ly = coastY + Math.sin(i * 1.5) * 2;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(251, 191, 36, 0.75)';
      ctx.beginPath();
      ctx.arc(lx, ly, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 17.4 海湾水面 (Gulf Water Bay)
    const waterGrad = ctx.createLinearGradient(0, coastY, 0, h);
    waterGrad.addColorStop(0, '#040817');
    waterGrad.addColorStop(0.35, '#070f26');
    waterGrad.addColorStop(0.7, '#0b142d');
    waterGrad.addColorStop(1, '#02040a');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, coastY, w, h - coastY);

    // 17.5 发射台与塔架基准
    const padX = w * 0.72;
    const padY = coastY;
    const towerHeight = 145;
    const towerWidth = 14;

    // =========================================================================
    // 🛸 腾讯总监级星舰动力学：单击正常平滑起飞 · 长按半空登台悬停 · 松手全推力破穹
    // =========================================================================
    const isTouching = emberIntensity > 0.42; // 长按吸烟/触控判定
    const midAirHoverDist = 145; // 半空悬停高度 (发射台机械捕获塔架上方)

    if (typeof this.starshipAlt !== 'number') this.starshipAlt = 0;
    if (typeof this.starshipReleaseAlt !== 'number') this.starshipReleaseAlt = 0;

    // 状态流转与动力学更新
    if (this.starshipState === 'IDLE') {
      this.starshipAlt = 0;
      if (isTouching) {
        // 用户按下手指：进入起飞/蓄力爬升状态
        this.starshipState = 'HOLD_MID_AIR';
        this.starshipStateTime = 0;
      }
    } else if (this.starshipState === 'HOLD_MID_AIR') {
      this.starshipStateTime += dt;
      if (!isTouching) {
        // 用户松开手指：无缝捕获当前高度，立即切换至轨道冲刺状态！
        this.starshipReleaseAlt = this.starshipAlt;
        this.starshipState = 'RELEASE_ORBIT';
        this.starshipStateTime = 0;
      }
    } else if (this.starshipState === 'RELEASE_ORBIT') {
      this.starshipStateTime += dt;
      // 升空发射到完全飞出屏幕并完成外太空热分离后，转入反推返航
      const startAlt = this.starshipReleaseAlt || 0;
      const climbDuration = 2.0 + (1.0 - Math.min(1.0, startAlt / midAirHoverDist)) * 1.5;
      if (this.starshipStateTime > (climbDuration + 2.8)) {
        this.starshipState = 'RE_ENTRY';
        this.starshipStateTime = 0;
      }
    } else if (this.starshipState === 'RE_ENTRY') {
      this.starshipStateTime += dt;
      // 破空扎入返航 + 悬停持续 6.0 秒后转入筷子臂抓捕
      if (this.starshipStateTime > 6.0) {
        this.starshipState = 'CATCH';
        this.starshipStateTime = 0;
      }
    } else if (this.starshipState === 'CATCH') {
      this.starshipStateTime += dt;
      // 抓捕锁定展示 3.5 秒后回归发射台待机
      if (this.starshipStateTime > 3.5) {
        this.starshipState = 'IDLE';
        this.starshipStateTime = 0;
        this.starshipAlt = 0;
      }
    }

    let boosterX = padX;
    let boosterY = padY - 22;
    let boosterAngle = 0;
    let boosterFlame = 0;
    let boosterVapor = false;

    let shipX = padX;
    let shipY = padY - 22;
    let shipVisible = true;
    let shipFlame = 0;

    let chopstickClamped = 0;
    let missionPhaseName = '';

    if (this.starshipState === 'IDLE') {
      // 待机状态：低温液氧排气，筷子臂微张
      boosterVapor = true;
      chopstickClamped = 0.2;
      this.starshipAlt = 0;
      boosterY = padY - 22;
      shipY = boosterY;
      missionPhaseName = 'T-00:03 · 发射就绪 (单击起飞 / 长按半空登台)';
    } else if (this.starshipState === 'HOLD_MID_AIR') {
      // 按住屏幕阶段：
      // 从发射台平滑点火爬升至半空 (1.3s)，若继续按住，则稳稳悬停在半空登台！
      const riseProgress = Math.min(1.0, this.starshipStateTime / 1.3);
      this.starshipAlt = Math.sin(riseProgress * Math.PI * 0.5) * midAirHoverDist;
      chopstickClamped = 0.0;

      if (riseProgress >= 1.0) {
        // 已到达半空：稳定悬停登台，伴随真实猛禽微气动震颤
        const hoverWobble = Math.sin(t * 7.5) * 2.2;
        boosterY = (padY - 22) - this.starshipAlt + hoverWobble;
        shipY = boosterY;
        boosterFlame = 0.95 + Math.sin(t * 15) * 0.15;
        missionPhaseName = 'RAPTOR HOVER // 半空悬停登台 · 松手破穹起飞！';
      } else {
        // 正在从地面爬升向半空
        boosterY = (padY - 22) - this.starshipAlt;
        shipY = boosterY;
        boosterFlame = 1.15 + Math.sin(t * 15) * 0.15;
        missionPhaseName = 'LIFTOFF // 点火升空爬升中...';
      }
    } else if (this.starshipState === 'RELEASE_ORBIT') {
      // 释放发射阶段：
      // 从用户松手时的绝对真实高度 (startAlt) 连续无跳帧加速，直接穿透天顶冲入深空！
      const launchT = this.starshipStateTime;
      const startAlt = this.starshipReleaseAlt || 0;
      const totalExitDist = (padY - 22 - startAlt) - (-280); // 飞出屏幕顶端外 280px
      const climbDuration = 2.0 + (1.0 - Math.min(1.0, startAlt / midAirHoverDist)) * 1.5;
      chopstickClamped = 0.0;

      if (launchT < climbDuration) {
        // 连续动力学：launchT = 0 时 climb = 0，与松手前一帧位置绝对零像素偏差！
        const prog = Math.min(1.0, launchT / climbDuration);
        const climb = Math.pow(prog, 1.65) * totalExitDist;
        this.starshipAlt = startAlt + climb;
        boosterY = (padY - 22) - this.starshipAlt;
        shipY = boosterY;
        boosterFlame = 1.38; // 满功率大尾焰
        missionPhaseName = startAlt < 25 
          ? 'NORMAL LIFTOFF // 正常起飞直插云霄！' 
          : 'RAPTOR FULL POWER // 全功率冲破天顶！';
      } else {
        // 高空热分离！二级星舰拖着幽蓝焰尾从左上掠过深空轨道
        const stageT = launchT - climbDuration;
        const prog = Math.min(1.0, stageT / 2.8);
        shipY = -120 - prog * 260;
        shipX = padX - 80 - prog * 200;
        shipFlame = 1.25;

        boosterY = -350; // 助推器已在屏幕极高空之外
        boosterAngle = Math.PI * 0.15;
        boosterFlame = 0.35;
        missionPhaseName = 'HOT STAGING // 二级星舰飞入外太空轨道';
      }
    } else if (this.starshipState === 'RE_ENTRY') {
      // 助推器反推返航：从天际极高空垂直扎入视野，减速悬停对准发射台塔架
      const returnT = this.starshipStateTime;
      shipVisible = false;

      if (returnT < 3.5) {
        // 从 -220px 天顶破空扎入，降至距地面 150px
        const prog = returnT / 3.5;
        boosterX = (padX + 25) * (1 - prog) + padX * prog;
        boosterY = -220 + Math.pow(prog, 1.25) * (padY - 22 - 150 - (-220));
        boosterFlame = 0.75 + Math.sin(t * 14) * 0.2;
        chopstickClamped = 0.0;
        missionPhaseName = 'BOOSTBACK // 助推器破空扎入返航';
      } else {
        // 最终悬停点火，减速对准筷子臂
        const prog = (returnT - 3.5) / 2.5;
        boosterX = padX;
        boosterY = (padY - 22 - 150) + Math.sin(prog * Math.PI * 0.5) * (150 - 15);
        boosterFlame = 0.9 * (1.0 - prog * 0.85);
        chopstickClamped = prog * 0.7; // 筷子臂准备迎合
        missionPhaseName = 'LANDING BURN // 悬停对准机械臂';
      }
    } else if (this.starshipState === 'CATCH') {
      // 机械塔架筷子臂霸气合拢抓捕！
      shipVisible = false;
      boosterX = padX;
      boosterY = padY - 37;
      boosterFlame = 0;
      chopstickClamped = 1.0;
      missionPhaseName = 'MECHAZILLA CATCH // 筷子臂神级抓捕成功！';
    }

    // 17.5.1 发射台机械臂捕获塔 Mechazilla (高耸钢铁深灰桁架)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(padX - 22, padY - towerHeight, towerWidth, towerHeight);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.0;
    for (let s = 0; s < 10; s++) {
      const sy = padY - towerHeight + s * 14.5;
      ctx.beginPath();
      ctx.moveTo(padX - 22, sy);
      ctx.lineTo(padX - 22 + towerWidth, sy + 14.5);
      ctx.moveTo(padX - 22 + towerWidth, sy);
      ctx.lineTo(padX - 22, sy + 14.5);
      ctx.stroke();
    }

    // 机械捕获筷子臂 (Chopsticks): 随状态动态张开与夹紧
    const chopstickY = padY - towerHeight * 0.58;
    const armLen = 22;
    const openAngle = (1.0 - chopstickClamped) * 0.35;
    ctx.save();
    ctx.strokeStyle = chopstickClamped > 0.8 ? '#38bdf8' : '#94a3b8';
    ctx.lineWidth = 2.8;
    // 上筷子臂
    ctx.beginPath();
    ctx.moveTo(padX - 22 + towerWidth, chopstickY);
    ctx.lineTo(padX + armLen * 0.6, chopstickY - openAngle * 12);
    ctx.stroke();
    // 下筷子臂（双臂夹持）
    ctx.beginPath();
    ctx.moveTo(padX - 22 + towerWidth, chopstickY + 5);
    ctx.lineTo(padX + armLen * 0.6, chopstickY + 5 + openAngle * 12);
    ctx.stroke();
    ctx.restore();

    // 塔顶航空警示红灯闪烁 (Flashing Red Beacon)
    const beaconBlink = Math.sin(t * 3.5) > 0 ? 1 : 0.2;
    ctx.fillStyle = `rgba(239, 68, 68, ${beaconBlink})`;
    ctx.beginPath();
    ctx.arc(padX - 15, padY - towerHeight - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 探照灯由下而上照亮镜面箭体 (Ground Spotlights)
    ctx.save();
    const spotGrad = ctx.createRadialGradient(padX - 35, padY, 4, padX - 10, padY - 60, 90);
    spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    spotGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.12)');
    spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.moveTo(padX - 35, padY);
    ctx.lineTo(padX - 5, padY - 140);
    ctx.lineTo(padX + 25, padY - 140);
    ctx.lineTo(padX + 5, padY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 17.5.2 猛禽发动机炽烈尾焰与排气水浪 (Exhaust Plume & Deluge Cloud)
    const isLifting = boosterFlame > 0.1 || emberIntensity > 0.08;
    if (isLifting) {
      const flameLen = (35 + Math.random() * 12) * (boosterFlame + emberIntensity * 0.5);
      const flameW = 11 + Math.random() * 3;

      ctx.save();
      ctx.translate(boosterX, boosterY);
      ctx.rotate(boosterAngle);

      const flameGrad = ctx.createLinearGradient(0, 0, 0, flameLen);
      flameGrad.addColorStop(0, '#ffffff'); // 喉部极白
      flameGrad.addColorStop(0.18, 'rgba(56, 189, 248, 0.95)'); // 甲烷幽蓝
      flameGrad.addColorStop(0.45, 'rgba(251, 146, 60, 0.95)'); // 膨胀炽橙
      flameGrad.addColorStop(0.85, 'rgba(239, 68, 68, 0.7)'); // 尾翼暗红
      flameGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(-flameW * 0.5, 0);
      ctx.quadraticCurveTo(-flameW * 0.8, flameLen * 0.5, 0, flameLen);
      ctx.quadraticCurveTo(flameW * 0.8, flameLen * 0.5, flameW * 0.5, 0);
      ctx.closePath();
      ctx.fill();

      // 马赫环节点 (Shock Diamonds)
      ctx.fillStyle = '#ffffff';
      for (let d = 1; d <= 3; d++) {
        ctx.beginPath();
        ctx.arc(0, d * (flameLen * 0.22), 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 发射台排山倒海的水蒸气巨云 (Deluge Steam Cloud)
      if (boosterY > padY - 120) {
        ctx.save();
        for (let c = 0; c < 8; c++) {
          const puffX = padX + (c - 3.5) * 16 + Math.sin(t * 4 + c) * 4;
          const puffY = padY - (Math.abs(c - 3.5) * 4) + Math.cos(t * 3 + c) * 3;
          const puffR = 14 + (c % 3) * 6;
          const puffGrad = ctx.createRadialGradient(puffX, puffY, 3, puffX, puffY, puffR);
          puffGrad.addColorStop(0, 'rgba(255, 237, 213, 0.75)');
          puffGrad.addColorStop(0.4, 'rgba(254, 215, 170, 0.45)');
          puffGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = puffGrad;
          ctx.beginPath();
          ctx.arc(puffX, puffY, puffR, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 强光照亮海面与夜空 (Sea Deluge Reflection)
      const seaGlow = ctx.createRadialGradient(boosterX, padY + 12, 5, boosterX, padY + 25, 140);
      seaGlow.addColorStop(0, 'rgba(251, 146, 60, 0.65)');
      seaGlow.addColorStop(0.5, 'rgba(234, 88, 12, 0.25)');
      seaGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = seaGlow;
      ctx.beginPath();
      ctx.arc(boosterX, padY + 25, 140, 0, Math.PI * 2);
      ctx.fill();
    } else if (boosterVapor) {
      // 待机状态：低温液氧排放白色冷蒸汽云
      ctx.save();
      for (let v = 0; v < 4; v++) {
        const vy = padY - 35 - v * 18;
        const vx = padX - 8 - Math.sin(t * 1.5 + v) * 12;
        const vr = 6 + v * 4;
        ctx.fillStyle = `rgba(224, 242, 254, ${0.28 - v * 0.05})`;
        ctx.beginPath();
        ctx.arc(vx, vy, vr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 17.5.3 助推器箭体渲染 (Super Heavy Booster)
    const rocketW = 12;
    const boosterH = 68;

    ctx.save();
    ctx.translate(boosterX, boosterY);
    ctx.rotate(boosterAngle);

    // 一级助推器: 304L 不锈钢圆柱
    const boosterGrad = ctx.createLinearGradient(-rocketW * 0.5, 0, rocketW * 0.5, 0);
    boosterGrad.addColorStop(0, '#64748b');
    boosterGrad.addColorStop(0.35, '#f8fafc');
    boosterGrad.addColorStop(0.75, '#cbd5e1');
    boosterGrad.addColorStop(1, '#475569');
    ctx.fillStyle = boosterGrad;
    ctx.fillRect(-rocketW * 0.5, -boosterH, rocketW, boosterH);

    // 栅格舵 (Grid Fins) - 在回收俯冲时更明显展开
    ctx.fillStyle = '#0f172a';
    const finSpread = (this.starshipState === 'RE_ENTRY') ? 5 : 3;
    ctx.fillRect(-rocketW * 0.5 - finSpread, -boosterH + 2, finSpread, 5);
    ctx.fillRect(rocketW * 0.5, -boosterH + 2, finSpread, 5);

    // 级间段分离环 (Interstage Ring)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-rocketW * 0.5, -boosterH - 4, rocketW, 4);

    // 筷子臂捕获销钉 (Hardpoints)
    if (chopstickClamped > 0.8) {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(-rocketW * 0.5 - 1, -boosterH + 12, 1.8, 0, Math.PI * 2);
      ctx.arc(rocketW * 0.5 + 1, -boosterH + 12, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 17.5.4 二级星舰 Upper Stage (在发射前或发射后热分离阶段独立飞行)
    if (shipVisible) {
      const shipH = 46;
      ctx.save();
      ctx.translate(shipX, shipY);

      // 热分离阶段：二级猛禽真空版点火冲向外层空间
      if (shipFlame > 0.1) {
        const sFlameLen = 28 + Math.random() * 8;
        const sFlameGrad = ctx.createLinearGradient(0, -boosterH - 4, 0, -boosterH - 4 + sFlameLen);
        sFlameGrad.addColorStop(0, '#ffffff');
        sFlameGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.95)');
        sFlameGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sFlameGrad;
        ctx.beginPath();
        ctx.moveTo(-rocketW * 0.4, -boosterH - 4);
        ctx.lineTo(0, -boosterH - 4 + sFlameLen);
        ctx.lineTo(rocketW * 0.4, -boosterH - 4);
        ctx.fill();
      }

      const shipGrad = ctx.createLinearGradient(-rocketW * 0.5, 0, rocketW * 0.5, 0);
      shipGrad.addColorStop(0, '#94a3b8');
      shipGrad.addColorStop(0.35, '#ffffff');
      shipGrad.addColorStop(0.8, '#cbd5e1');
      shipGrad.addColorStop(1, '#64748b');

      // 星舰圆柱段
      ctx.fillStyle = shipGrad;
      ctx.fillRect(-rocketW * 0.5, -boosterH - shipH + 16, rocketW, shipH - 16);

      // 星舰鼻锥气动弧线
      ctx.beginPath();
      ctx.moveTo(-rocketW * 0.5, -boosterH - shipH + 16);
      ctx.quadraticCurveTo(-rocketW * 0.45, -boosterH - shipH + 4, 0, -boosterH - shipH);
      ctx.quadraticCurveTo(rocketW * 0.45, -boosterH - shipH + 4, rocketW * 0.5, -boosterH - shipH + 16);
      ctx.closePath();
      ctx.fill();

      // 前置俯冲翼 (Forward Aero Flaps)
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(-rocketW * 0.5, -boosterH - shipH + 8);
      ctx.lineTo(-rocketW * 0.5 - 4, -boosterH - shipH + 13);
      ctx.lineTo(-rocketW * 0.5, -boosterH - shipH + 15);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(rocketW * 0.5, -boosterH - shipH + 8);
      ctx.lineTo(rocketW * 0.5 + 4, -boosterH - shipH + 13);
      ctx.lineTo(rocketW * 0.5, -boosterH - shipH + 15);
      ctx.closePath();
      ctx.fill();

      // 后部主翼 (Aft Body Flaps)
      ctx.beginPath();
      ctx.moveTo(-rocketW * 0.5, -boosterH - 14);
      ctx.lineTo(-rocketW * 0.5 - 5, -boosterH - 4);
      ctx.lineTo(-rocketW * 0.5, -boosterH - 4);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(rocketW * 0.5, -boosterH - 14);
      ctx.lineTo(rocketW * 0.5 + 5, -boosterH - 4);
      ctx.lineTo(rocketW * 0.5, -boosterH - 4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // 17.6 海面微澜与发射台倒影 (Water Surface Waves & Glimmer)
    for (let rw = 0; rw < 6; rw++) {
      const wy = coastY + 18 + rw * 24;
      const wWidth = 40 + rw * 18;
      const wAlpha = (0.35 - rw * 0.04) * (isLifting ? 1.5 : 0.8);
      const waveGrad = ctx.createLinearGradient(padX - wWidth, wy, padX + wWidth, wy);
      waveGrad.addColorStop(0, 'rgba(0,0,0,0)');
      waveGrad.addColorStop(0.5, isLifting ? `rgba(251, 146, 60, ${wAlpha})` : `rgba(186, 230, 253, ${wAlpha})`);
      waveGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = waveGrad;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(padX - wWidth + Math.sin(t * 1.5 + rw) * 8, wy);
      ctx.lineTo(padX + wWidth + Math.sin(t * 1.5 + rw) * 8, wy);
      ctx.stroke();
    }

    // 17.7 近景海湾观景台与极细金属栏杆剪影 (Foreground Coastal Viewing Balcony)
    const railY = h * 0.88;
    ctx.fillStyle = '#03050c';
    ctx.fillRect(0, railY, w, h - railY);

    ctx.strokeStyle = isLifting ? 'rgba(251, 146, 60, 0.45)' : 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, railY);
    ctx.lineTo(w, railY);
    ctx.stroke();

    for (let r = 0; r < 7; r++) {
      const rx = (r / 6) * w;
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(rx, railY);
      ctx.lineTo(rx, h);
      ctx.stroke();
    }

    // 17.8 航天遥测 HUD 微胶囊铭牌 (顶部半透明极细工业仪表)
    if (missionPhaseName) {
      ctx.save();
      const hudY = h * 0.12;
      ctx.font = '10px -apple-system, monospace';
      const textMetrics = ctx.measureText(missionPhaseName);
      const textW = textMetrics.width || 180;
      const pillW = textW + 28;
      const pillH = 22;
      const pillX = w * 0.5 - pillW * 0.5;

      // 磨砂半透明胶囊底
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.beginPath();
      ctx.arc(pillX + pillH * 0.5, hudY, pillH * 0.5, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(pillX + pillW - pillH * 0.5, hudY, pillH * 0.5, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();

      // 微光外边框
      ctx.strokeStyle = isLifting ? 'rgba(251, 146, 60, 0.45)' : 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // 发光状态脉冲圆点
      const dotColor = isLifting ? '#f97316' : '#38bdf8';
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(pillX + 12, hudY, 3, 0, Math.PI * 2);
      ctx.fill();

      // 遥测阶段文字
      ctx.fillStyle = isLifting ? '#fed7aa' : '#bae6fd';
      ctx.textBaseline = 'middle';
      ctx.fillText(missionPhaseName, pillX + 20, hudY);
      ctx.restore();
    }
  }

  // ==========================================
  // 19. 星链天网：全息 3D 星轨 · 环球赛博卫星阵 (Starlink Constellation)
  // ==========================================
  renderStarlinkOrbit(ctx, w, h, dt, t, emberIntensity = 0) {
    const cx = w * 0.5;
    const cy = h * 0.31;
    const globeR = Math.min(w * 0.34, 136);
    const orbitR = globeR * 1.18;
    const earthTilt = 0.36; // 轴倾角约 21 度
    const earthRot = t * 0.08; // 自转角速度

    // 吸烟超频状态联动：长按深吸时卫星加速与激光网密度提升
    const isOverdrive = emberIntensity > 0.05;
    const speedMult = 1.0 + (isOverdrive ? 1.4 : 0);

    // 19.1 深空星际微光渐变
    const spaceGrad = ctx.createRadialGradient(cx, cy, globeR * 0.5, cx, cy, w * 1.1);
    spaceGrad.addColorStop(0, '#040b1e');
    spaceGrad.addColorStop(0.45, '#02050e');
    spaceGrad.addColorStop(1, '#000104');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, w, h);

    // 19.2 深空繁星
    this.renderStarfield(ctx, t, 0.45);

    // 19.3 地球高空大气层瑞利散射辉光 (Rayleigh Atmosphere Halo)
    const atmoGrad = ctx.createRadialGradient(cx, cy, globeR * 0.90, cx, cy, globeR * 1.30);
    atmoGrad.addColorStop(0, 'rgba(56, 189, 248, 0.42)');
    atmoGrad.addColorStop(0.35, 'rgba(14, 165, 233, 0.18)');
    atmoGrad.addColorStop(0.70, 'rgba(3, 105, 161, 0.05)');
    atmoGrad.addColorStop(1.0, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = atmoGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, globeR * 1.30, 0, Math.PI * 2);
    ctx.fill();

    // 19.4 3D 地球球体与向阳面/背阳面日照渐变
    // 太阳光位于左上方 (angle -45°)
    const oceanGrad = ctx.createRadialGradient(
      cx - globeR * 0.38, cy - globeR * 0.38, globeR * 0.06,
      cx, cy, globeR
    );
    oceanGrad.addColorStop(0, '#1d4ed8');      // 蔚蓝向阳深海
    oceanGrad.addColorStop(0.25, '#1e3a8a');
    oceanGrad.addColorStop(0.55, '#0f172a');   // 晨昏明暗交界线
    oceanGrad.addColorStop(0.85, '#050914');   // 深黑夜半球
    oceanGrad.addColorStop(1.0, '#020308');
    ctx.fillStyle = oceanGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, globeR, 0, Math.PI * 2);
    ctx.fill();

    // 19.5 3D 投影转换函数
    const project3D = (latDeg, lonDeg, altRadius = globeR) => {
      const phi = latDeg * (Math.PI / 180);
      const lam = (lonDeg + (earthRot * 180 / Math.PI)) * (Math.PI / 180);
      const x0 = Math.cos(phi) * Math.sin(lam);
      const y0 = -Math.sin(phi);
      const z0 = Math.cos(phi) * Math.cos(lam);
      // 轴倾斜变换
      const x1 = x0;
      const y1 = y0 * Math.cos(earthTilt) - z0 * Math.sin(earthTilt);
      const z1 = y0 * Math.sin(earthTilt) + z0 * Math.cos(earthTilt);
      // 太阳朝向点积 [-0.55, -0.55, 0.62]
      const sunDot = x1 * (-0.55) + y1 * (-0.55) + z1 * 0.62;
      return {
        sx: cx + x1 * altRadius,
        sy: cy + y1 * altRadius,
        z: z1,
        isFront: z1 > 0,
        isDay: sunDot > 0
      };
    };

    // 19.6 3D 全息经纬度网络 (Lat/Lon Grid)
    ctx.save();
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    // 纬线圈 (赤道与南北纬30°/60°)
    const lats = [-60, -30, 0, 30, 60];
    for (let l = 0; l < lats.length; l++) {
      ctx.beginPath();
      let started = false;
      for (let lon = 0; lon <= 360; lon += 15) {
        const pt = project3D(lats[l], lon, globeR);
        if (pt.isFront) {
          if (!started) {
            ctx.moveTo(pt.sx, pt.sy);
            started = true;
          } else {
            ctx.lineTo(pt.sx, pt.sy);
          }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    }
    // 经线圈 (每隔 45 度)
    for (let lon = 0; lon < 360; lon += 45) {
      ctx.beginPath();
      let started = false;
      for (let lat = -80; lat <= 80; lat += 10) {
        const pt = project3D(lat, lon, globeR);
        if (pt.isFront) {
          if (!started) {
            ctx.moveTo(pt.sx, pt.sy);
            started = true;
          } else {
            ctx.lineTo(pt.sx, pt.sy);
          }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    }
    ctx.restore();

    // 19.7 大陆板块节点与夜半球璀璨万家灯火 (Satellitemap / NASA Earth at Night)
    for (let i = 0; i < this.starlinkContinents.length; i++) {
      const node = this.starlinkContinents[i];
      const p = project3D(node.lat, node.lon, globeR);
      if (p.isFront) {
        if (p.isDay) {
          // 向阳面：赛博全息翠青雷达大陆点
          ctx.fillStyle = 'rgba(34, 211, 238, 0.42)';
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, node.isCity ? 2.2 : 1.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 背阳面：真实暖金城市灯火微光 (密集夜景)
          const cityAlpha = 0.55 + 0.35 * Math.sin(t * 2.5 + i);
          ctx.fillStyle = `rgba(253, 224, 71, ${cityAlpha})`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, node.isCity ? 2.0 : 1.2, 0, Math.PI * 2);
          ctx.fill();

          // 核心都市暖晕
          if (node.isCity) {
            ctx.fillStyle = `rgba(245, 158, 11, ${cityAlpha * 0.35})`;
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, 3.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // 19.8 星链 16 大轨道平面倾角虚线圈 (Orbital Shells: 53° & 70°)
    ctx.save();
    ctx.lineWidth = 0.65;
    ctx.setLineDash([2, 5]);
    const NUM_PLANES = 16;
    for (let pl = 0; pl < NUM_PLANES; pl++) {
      const inclination = (pl % 2 === 0 ? 53 : 70) * (Math.PI / 180);
      const raan = pl * (Math.PI / (NUM_PLANES / 2));
      ctx.strokeStyle = pl % 2 === 0 ? 'rgba(56, 189, 248, 0.11)' : 'rgba(125, 211, 252, 0.08)';
      ctx.beginPath();
      let started = false;
      for (let u = 0; u <= Math.PI * 2; u += 0.14) {
        const xo = orbitR * Math.cos(u);
        const yo = orbitR * Math.sin(u);
        const x1 = xo;
        const y1 = yo * Math.cos(inclination);
        const z1 = yo * Math.sin(inclination);
        const x2 = x1 * Math.cos(raan) + z1 * Math.sin(raan);
        const y2 = y1;
        const z2 = -x1 * Math.sin(raan) + z1 * Math.cos(raan);
        const sx = cx + x2;
        const sy = cy + (y2 * Math.cos(earthTilt) - z2 * Math.sin(earthTilt));
        const z3d = y2 * Math.sin(earthTilt) + z2 * Math.cos(earthTilt);
        const d2d = Math.hypot(sx - cx, sy - cy);
        if (!(z3d < 0 && d2d < globeR)) {
          if (!started) {
            ctx.moveTo(sx, sy);
            started = true;
          } else {
            ctx.lineTo(sx, sy);
          }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    // 19.9 220+ 活跃星链卫星群实时运行 (60FPS 运动与太阳翼闪光)
    const visibleSats = [];

    for (let i = 0; i < this.starlinkSatellites.length; i++) {
      const sat = this.starlinkSatellites[i];
      const u = sat.phase + sat.speed * speedMult * t;
      const xo = orbitR * Math.cos(u);
      const yo = orbitR * Math.sin(u);
      const x1 = xo;
      const y1 = yo * Math.cos(sat.inclination);
      const z1 = yo * Math.sin(sat.inclination);
      const x2 = x1 * Math.cos(sat.raan) + z1 * Math.sin(sat.raan);
      const y2 = y1;
      const z2 = -x1 * Math.sin(sat.raan) + z1 * Math.cos(sat.raan);
      const sx = cx + x2;
      const sy = cy + (y2 * Math.cos(earthTilt) - z2 * Math.sin(earthTilt));
      const z3d = y2 * Math.sin(earthTilt) + z2 * Math.cos(earthTilt);
      const d2d = Math.hypot(sx - cx, sy - cy);

      // 遮挡剔除 (Occlusion culling)
      if (z3d < 0 && d2d < globeR) {
        continue;
      }

      const alpha = z3d >= 0 ? 0.95 : 0.35;
      ctx.fillStyle = sat.color === '#ffffff' ? `rgba(255, 255, 255, ${alpha})` : `rgba(125, 211, 252, ${alpha})`;
      ctx.fillRect(sx - sat.size * 0.5, sy - sat.size * 0.5, sat.size, sat.size);

      // 记录前视卫星用于激光链路
      if (z3d > globeR * 0.15 && visibleSats.length < 36) {
        visibleSats.push({ sx, sy });
      }

      // 太阳翼反光爆发 (Solar Flare Glint)
      const flare = Math.sin(t * 3.2 + sat.flarePhase);
      if (flare > 0.96 && z3d > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(sx - 3, sy); ctx.lineTo(sx + 3, sy);
        ctx.moveTo(sx, sy - 3); ctx.lineTo(sx, sy + 3);
        ctx.stroke();
      }
    }

    // 19.10 激光星间链路微网 (ISL Laser Mesh)
    if (visibleSats.length >= 6) {
      ctx.save();
      ctx.lineWidth = isOverdrive ? 1.0 : 0.6;
      const laserCount = isOverdrive ? Math.min(14, visibleSats.length - 1) : Math.min(8, Math.floor(visibleSats.length / 2));
      for (let k = 0; k < laserCount; k++) {
        const s1 = visibleSats[k];
        const s2 = visibleSats[(k + 3) % visibleSats.length];
        const dist = Math.hypot(s1.sx - s2.sx, s1.sy - s2.sy);
        if (dist > 18 && dist < (isOverdrive ? 95 : 65)) {
          const lAlpha = isOverdrive 
            ? (0.55 + 0.40 * Math.sin(t * 7.5 + k)) 
            : (0.35 + 0.30 * Math.sin(t * 4.5 + k));
          ctx.strokeStyle = k % 2 === 0 ? `rgba(52, 211, 153, ${lAlpha})` : `rgba(56, 189, 248, ${lAlpha})`;
          ctx.beginPath();
          ctx.moveTo(s1.sx, s1.sy);
          ctx.lineTo(s2.sx, s2.sy);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // 19.11 标志性“星链列车” (The Starlink Train - 20颗列阵飞越地平线)
    ctx.save();
    const trainSpeed = 0.44 * speedMult;
    const trainU0 = (t * trainSpeed) % (Math.PI * 2);
    const trainInc = 53 * (Math.PI / 180);
    const trainRaan = 0.85;
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    let lastTrainX = null;
    let lastTrainY = null;

    for (let ti = 0; ti < this.starlinkTrain.length; ti++) {
      const item = this.starlinkTrain[ti];
      const tu = trainU0 - item.offset;
      const xo = orbitR * Math.cos(tu);
      const yo = orbitR * Math.sin(tu);
      const x1 = xo;
      const y1 = yo * Math.cos(trainInc);
      const z1 = yo * Math.sin(trainInc);
      const x2 = x1 * Math.cos(trainRaan) + z1 * Math.sin(trainRaan);
      const y2 = y1;
      const z2 = -x1 * Math.sin(trainRaan) + z1 * Math.cos(trainRaan);
      const sx = cx + x2;
      const sy = cy + (y2 * Math.cos(earthTilt) - z2 * Math.sin(earthTilt));
      const z3d = y2 * Math.sin(earthTilt) + z2 * Math.cos(earthTilt);
      const d2d = Math.hypot(sx - cx, sy - cy);

      if (z3d < 0 && d2d < globeR) continue;

      // 卫星列车激光光缆虚线连接
      if (lastTrainX !== null) {
        ctx.beginPath();
        ctx.moveTo(lastTrainX, lastTrainY);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
      lastTrainX = sx;
      lastTrainY = sy;

      // 星体高亮
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, item.size, 0, Math.PI * 2);
      ctx.fill();

      // 星链列车光芒微晕
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.beginPath();
      ctx.arc(sx, sy, item.size + 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 19.12 SpaceX / Starlink 航天遥测 HUD 微胶囊
    ctx.save();
    const hudY = h * 0.12;
    const hudText = isOverdrive 
      ? '⚡ STARLINK // ULTRA-BURST BANDWIDTH MODE [OVERDRIVE]' 
      : '🛰️ STARLINK MESH · 550KM LEO ｜ ACTIVE: 6,280 [ISL LIVE]';
    ctx.font = '10px -apple-system, monospace';
    const textMetrics = ctx.measureText(hudText);
    const textW = textMetrics.width || 240;
    const pillW = textW + 28;
    const pillH = 22;
    const pillX = w * 0.5 - pillW * 0.5;

    // 半透明磨砂胶囊底板
    ctx.fillStyle = 'rgba(8, 14, 28, 0.65)';
    ctx.beginPath();
    ctx.arc(pillX + pillH * 0.5, hudY, pillH * 0.5, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(pillX + pillW - pillH * 0.5, hudY, pillH * 0.5, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();

    // 边框微光
    ctx.strokeStyle = isOverdrive ? 'rgba(52, 211, 153, 0.55)' : 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // 遥测指示灯脉冲
    const pulseAlpha = 0.5 + 0.5 * Math.sin(t * (isOverdrive ? 8.0 : 4.0));
    ctx.fillStyle = isOverdrive ? `rgba(52, 211, 153, ${pulseAlpha})` : `rgba(56, 189, 248, ${pulseAlpha})`;
    ctx.beginPath();
    ctx.arc(pillX + 12, hudY, 3, 0, Math.PI * 2);
    ctx.fill();

    // 遥测文字
    ctx.fillStyle = isOverdrive ? '#a7f3d0' : '#bae6fd';
    ctx.textBaseline = 'middle';
    ctx.fillText(hudText, pillX + 20, hudY);
    ctx.restore();
  }
}

export const sceneRenderer = new SceneRenderer();
