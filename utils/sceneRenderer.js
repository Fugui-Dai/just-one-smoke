// utils/sceneRenderer.js

/**
 * 生活灵感沉浸场景渲染引擎 (Atmospheric Life Scenes Engine)
 * 纯原生 Canvas 2D 物理与光学渲染，100% 离线、零外部贴图依赖
 *
 * 场景包括：
 * 一、宇宙奇观系列：
 *   1. solar_system: 浩瀚太阳系 (中心恒星光冕、行星公转椭圆微轨与土星环)
 *   2. deep_cosmos: 深空宇宙 (紫蓝星云漫渺、银河尘埃、浪漫流星划过)
 *   3. lunar_planet: 荒原星球 (环形山月表剪影、地平线壮丽巨型母星升起)
 * 二、真实生活烟火系列：
 *   4. convenience_store: 便利店门口 (街角暖黄灯影、落地玻璃窗、关东煮烟火气)
 *   5. stairwell: 楼道安全通道 (防火门后摸鱼放空、绿色安全出口幽光、城市天际线)
 *   6. underground_garage: 地下车库 (熄火后静谧独处、反光地坪、属于成年人的5分钟)
 *   7. midnight_rooftop: 楼顶天台 (金属护栏剪影、俯瞰不夜城万家灯火与车水马龙)
 * 三、经典治愈与纯享系列：
 *   8. rainy_car: 雨夜车窗 (城市街灯散焦 Bokeh 光斑 + 车窗滑落雨丝)
 *   9. campfire: 森林篝火 (暗林夜幕 + 暖色呼吸余晖 + 漂浮上升的炭火星)
 *   10. midnight_balcony: 深夜阳台 (深蓝夜幕 + 远方天际线万家灯火)
 *   11. golden_amber: 赛博暖金 (静谧琥珀雅境 · 浮光星芒)
 *   12. obsidian: 极简黑曜 (专注一呼一吸 · 侘寂纯境)
 */

export const ATMOSPHERE_SCENES = [
  // 1. 宇宙奇观系列 (Cosmic Wonders)
  {
    id: 'solar_system',
    name: '浩瀚太阳系',
    subtitle: '恒星金辉普照 · 八大行星公转',
    icon: '🪐',
    soundType: 'cosmos',
    ambientDesc: '深空引力波空灵冥想',
    badge: '宇宙奇观'
  },
  {
    id: 'deep_cosmos',
    name: '深空宇宙',
    subtitle: '紫蓝星云漫渺 · 银河流星划过',
    icon: '🌌',
    soundType: 'cosmos',
    ambientDesc: '深空虚空静谧之声',
    badge: '浪漫星海'
  },
  {
    id: 'lunar_planet',
    name: '荒原星球',
    subtitle: '环形山月表 · 巨型母星升起',
    icon: '🌑',
    soundType: 'cosmos',
    ambientDesc: '异星地平线寂静微风',
    badge: '孤寂异境'
  },
  {
    id: 'ocean',
    name: '蔚蓝深海',
    subtitle: '浩瀚海平线 · 潮汐涌动与浪花',
    icon: '🌊',
    soundType: 'ocean',
    ambientDesc: '舒缓浪潮与海风微鸣',
    badge: '治愈解压'
  },

  // 2. 真实生活烟火高频吸烟场景 (Everyday Life Spots)
  {
    id: 'convenience_store',
    name: '便利店门口',
    subtitle: '街角暖黄灯影 · 关东煮烟火气',
    icon: '🏪',
    soundType: 'city',
    ambientDesc: '深夜街角温暖灯影',
    badge: '打工人避风港'
  },
  {
    id: 'stairwell',
    name: '楼道安全通道',
    subtitle: '防火门后摸鱼 · 绿光与天际线',
    icon: '🚪',
    soundType: 'echo',
    ambientDesc: '安静楼道微弱风声',
    badge: '摸鱼圣地'
  },
  {
    id: 'underground_garage',
    name: '地下车库',
    subtitle: '熄火后静谧独处 · 属于自己的5分钟',
    icon: '🅿️',
    soundType: 'garage',
    ambientDesc: '车库排风机低频沉浸音',
    badge: '独处时刻'
  },
  {
    id: 'midnight_rooftop',
    name: '楼顶天台',
    subtitle: '俯瞰万家灯火 · 晚风吹拂解千愁',
    icon: '🌃',
    soundType: 'wind',
    ambientDesc: '天台旷野徐徐晚风',
    badge: '开阔解忧'
  },

  // 3. 经典治愈与纯享系列 (Classic & Zen)
  {
    id: 'rainy_car',
    name: '雨夜车窗',
    subtitle: '成年人的私密避风港 · 细雨霓虹',
    icon: '🌧️',
    soundType: 'rain',
    ambientDesc: '沙沙窗外夜雨声',
    badge: '最治愈'
  },
  {
    id: 'campfire',
    name: '森林篝火',
    subtitle: '山野露营围炉 · 柴火微光',
    icon: '🔥',
    soundType: 'crackle',
    ambientDesc: '木柴轻柔噼啪声',
    badge: '温暖'
  },
  {
    id: 'midnight_balcony',
    name: '深夜阳台',
    subtitle: '俯瞰万家灯火 · 晚风微凉',
    icon: '🏙️',
    soundType: 'wind',
    ambientDesc: '夜幕城市晚风声',
    badge: '静心'
  },
  {
    id: 'golden_amber',
    name: '赛博暖金',
    subtitle: '静谧琥珀雅境 · 浮光星芒',
    icon: '✨',
    soundType: 'amber',
    ambientDesc: '暖金温润环境白噪音',
    badge: '实机同款'
  },
  {
    id: 'obsidian',
    name: '极简黑曜',
    subtitle: '专注一呼一吸 · 侘寂纯境',
    icon: '🖤',
    soundType: 'zen',
    ambientDesc: '侘寂静心白噪音',
    badge: '纯享'
  }
];

export function getSceneById(id) {
  return ATMOSPHERE_SCENES.find(s => s.id === id) || ATMOSPHERE_SCENES[0];
}

export class SceneRenderer {
  constructor() {
    this.raindrops = [];
    this.bokehs = [];
    this.stars = [];
    this.embers = [];
    this.windows = [];
    this.goldenDust = [];
    this.solarPlanets = [];
    this.steamParticles = [];
    this.oceanGlints = [];
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

    // 2. 星空繁星 (通用：阳台、深空、太阳系、荒原星球)
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

    // 4. 赛博暖金浮尘
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

    // 5. 太阳系行星公转配置
    this.solarPlanets = [
      { name: '水星', rx: 38, ry: 16, speed: 1.40, r: 1.8, color: '#9ca3af', phase: 0 },
      { name: '金星', rx: 65, ry: 27, speed: 0.98, r: 2.8, color: '#fde047', phase: 1.2 },
      { name: '地球', rx: 98, ry: 40, speed: 0.70, r: 3.6, color: '#38bdf8', phase: 2.8, hasMoon: true },
      { name: '火星', rx: 135, ry: 55, speed: 0.52, r: 2.4, color: '#ef4444', phase: 4.1 },
      { name: '木星', rx: 178, ry: 72, speed: 0.32, r: 6.8, color: '#f59e0b', phase: 0.9, isBanded: true },
      { name: '土星', rx: 224, ry: 90, speed: 0.20, r: 5.2, color: '#cbd5e1', phase: 3.4, hasRing: true }
    ];

    // 6. 便利店热气浮尘
    this.steamParticles = [];
    for (let i = 0; i < 12; i++) {
      this.steamParticles.push({
        x: w * (0.35 + Math.random() * 0.3),
        y: h * (0.45 + Math.random() * 0.2),
        r: 6 + Math.random() * 12,
        speedY: 12 + Math.random() * 18,
        alpha: 0.12 + Math.random() * 0.16,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 7. 远景楼宇灯火
    this.windows = [];
    for (let i = 0; i < 36; i++) {
      this.windows.push({
        x: w * 0.08 + Math.random() * (w * 0.84),
        y: h * (0.48 + Math.random() * 0.16),
        w: 3 + Math.random() * 4,
        h: 4 + Math.random() * 6,
        color: Math.random() < 0.65 ? '#fef08a' : (Math.random() < 0.85 ? '#38bdf8' : '#f97316'),
        alpha: 0.35 + Math.random() * 0.55,
        blinkSpeed: 0.4 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2
      });
    }

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

    this.initialized = true;
  }

  render(ctx, w, h, sceneType, dt, totalTime) {
    if (!this.initialized) {
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
        this.renderMidnightRooftop(ctx, w, h, dt, totalTime);
        break;
      case 'golden_amber':
        this.renderGoldenAmber(ctx, w, h, dt, totalTime);
        break;
      case 'rainy_car':
        this.renderRainyCar(ctx, w, h, dt, totalTime);
        break;
      case 'midnight_balcony':
        this.renderMidnightBalcony(ctx, w, h, dt, totalTime);
        break;
      case 'campfire':
        this.renderCampfire(ctx, w, h, dt, totalTime);
        break;
      case 'obsidian':
      default:
        this.renderObsidian(ctx, w, h);
        break;
    }

    ctx.restore();
  }

  // 1. 浩瀚太阳系：中心恒星光冕、行星公转微轨与土星环
  // ==========================================
  renderSolarSystem(ctx, w, h, dt, t) {
    // 深空纯净黑色底色
    const bgGrad = ctx.createRadialGradient(w / 2, h * 0.26, 10, w / 2, h * 0.35, w * 0.95);
    bgGrad.addColorStop(0, '#060a18');
    bgGrad.addColorStop(0.5, '#020409');
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 恒星背景繁星
    this.renderStarfield(ctx, t, 0.45);

    const sunX = w / 2;
    const sunY = h * 0.24;

    // 1.1 中心恒星太阳光冕与金色辐射光辉
    const pulse = 1.0 + 0.08 * Math.sin(t * 1.6);
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 3, sunX, sunY, 48 * pulse);
    sunGlow.addColorStop(0, '#fffbeb');
    sunGlow.addColorStop(0.25, 'rgba(253, 224, 71, 0.9)');
    sunGlow.addColorStop(0.55, 'rgba(245, 158, 11, 0.35)');
    sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 48 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // 太阳本体高亮圆球
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 11, 0, Math.PI * 2);
    ctx.fill();

    // 1.2 行星公转轨道虚线与真实运转行星
    this.solarPlanets.forEach((p) => {
      // 轨道椭圆虚线
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      if (typeof ctx.ellipse === 'function') {
        ctx.ellipse(sunX, sunY, p.rx, p.ry, 0, 0, Math.PI * 2);
      } else {
        ctx.arc(sunX, sunY, (p.rx + p.ry) / 2, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.restore();

      // 行星当前坐标计算
      const angle = t * p.speed * 0.4 + p.phase;
      const px = sunX + Math.cos(angle) * p.rx;
      const py = sunY + Math.sin(angle) * p.ry;

      // 行星本体
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();

      // 特殊星体细节：地球伴随月球
      if (p.hasMoon) {
        const mAngle = t * 2.8;
        const mx = px + Math.cos(mAngle) * 7.5;
        const my = py + Math.sin(mAngle) * 7.5;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mx, my, 1.0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 特殊星体细节：土星壮丽倾斜光环
      if (p.hasRing) {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        if (typeof ctx.ellipse === 'function') {
          ctx.ellipse(px, py, 11, 3.8, -0.32, 0, Math.PI * 2);
        } else {
          ctx.arc(px, py, 10, 0, Math.PI * 2);
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
  // 4. 便利店门口：街角暖黄灯影、落地玻璃窗与关东煮烟火气
  // ==========================================
  renderConvenienceStore(ctx, w, h, dt, t) {
    // 深夜街角清冷底色
    ctx.fillStyle = '#070a12';
    ctx.fillRect(0, 0, w, h);

    // 4.1 便利店顶部经典发光灯箱招牌 (Storefront Signboard)
    const signH = 46;
    const signGrad = ctx.createLinearGradient(0, h * 0.12, 0, h * 0.12 + signH);
    signGrad.addColorStop(0, '#047857'); // 经典便利绿
    signGrad.addColorStop(0.5, '#059669');
    signGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = signGrad;
    ctx.fillRect(0, h * 0.12, w, signH);

    // 招牌暖橙装饰彩带
    ctx.fillStyle = '#f97316';
    ctx.fillRect(0, h * 0.12 + signH - 8, w, 6);

    // 4.2 落地大玻璃窗透出的温馨暖黄大环境光 (Interior Warm Ambiance)
    const winY = h * 0.12 + signH;
    const winH = h * 0.50;
    const winGrad = ctx.createLinearGradient(0, winY, 0, winY + winH);
    winGrad.addColorStop(0, 'rgba(251, 191, 36, 0.38)');
    winGrad.addColorStop(0.55, 'rgba(245, 158, 11, 0.22)');
    winGrad.addColorStop(1, 'rgba(180, 83, 9, 0.05)');
    ctx.fillStyle = winGrad;
    ctx.fillRect(0, winY, w, winH);

    // 玻璃窗格金属反光竖框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.33, winY); ctx.lineTo(w * 0.33, winY + winH);
    ctx.moveTo(w * 0.67, winY); ctx.lineTo(w * 0.67, winY + winH);
    ctx.stroke();

    // 4.3 热气与关东煮飘渺微雾 (Warm Steam Floating)
    this.steamParticles.forEach((sp) => {
      sp.y -= sp.speedY * dt;
      if (sp.y < winY + 20) {
        sp.y = winY + winH - 20;
        sp.x = w * (0.25 + Math.random() * 0.5);
      }
      const alpha = Math.sin(t * 1.5 + sp.phase) * sp.alpha;
      ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0.04, alpha)})`;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4.4 门前湿润沥青地面的暖光倒影 (Pavement Wet Light Reflections)
    const groundY = winY + winH;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
    groundGrad.addColorStop(0, 'rgba(245, 158, 11, 0.28)');
    groundGrad.addColorStop(0.35, 'rgba(180, 83, 9, 0.12)');
    groundGrad.addColorStop(1, '#05070c');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, w, h - groundY);
  }

  // ==========================================
  // 5. 楼道安全通道：防火门后放空、绿色安全出口幽光与天际线
  // ==========================================
  renderStairwell(ctx, w, h, dt, t) {
    // 清水混泥土深邃暗角
    const wallGrad = ctx.createLinearGradient(0, 0, w, h);
    wallGrad.addColorStop(0, '#0b0f17');
    wallGrad.addColorStop(0.5, '#070a10');
    wallGrad.addColorStop(1, '#030508');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, w, h);

    // 5.1 楼梯间高窗外透入的深蓝城市天际线 (High Stairwell Window)
    const winX = w * 0.12;
    const winY = h * 0.14;
    const winW = 54;
    const winH = 120;

    const outGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
    outGrad.addColorStop(0, '#0f172a');
    outGrad.addColorStop(0.6, '#0284c7');
    outGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = outGrad;
    ctx.fillRect(winX, winY, winW, winH);

    // 窗外远景摩天大楼微光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(winX + 12, winY + 65, 3, 4);
    ctx.fillRect(winX + 22, winY + 48, 3, 4);
    ctx.fillRect(winX + 36, winY + 78, 3, 4);

    // 窗框阴影
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.lineWidth = 4;
    ctx.strokeRect(winX, winY, winW, winH);

    // 5.2 经典「安全出口 EXIT」绿色荧光灯箱与微光漫射 (Green Exit Sign)
    const exitX = w * 0.68;
    const exitY = h * 0.16;
    const exitW = 52;
    const exitH = 26;

    // 绿光大漫反射晕染
    const greenGlow = ctx.createRadialGradient(exitX + exitW / 2, exitY + exitH / 2, 8, exitX + exitW / 2, exitY + exitH / 2, 75);
    greenGlow.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    greenGlow.addColorStop(0.6, 'rgba(5, 150, 105, 0.12)');
    greenGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = greenGlow;
    ctx.beginPath();
    ctx.arc(exitX + exitW / 2, exitY + exitH / 2, 75, 0, Math.PI * 2);
    ctx.fill();

    // 灯箱外壳
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(exitX, exitY, exitW, exitH);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(exitX, exitY, exitW, exitH);

    // 小绿人与 EXIT 字样
    ctx.font = 'bold 8px sans-serif';
    ctx.fillStyle = '#6ee7b7';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT ➔', exitX + exitW / 2, exitY + 16);

    // 5.3 楼梯不锈钢扶手斜向几何光影 (Stair Handrail)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.78);
    ctx.lineTo(w * 0.95, h * 0.52);
    ctx.stroke();
  }

  // ==========================================
  // 6. 地下车库：熄火后静谧独处、反光地坪、属于成年人的5分钟
  // ==========================================
  renderUndergroundGarage(ctx, w, h, dt, t) {
    // 幽静地下车库冷灰底色
    ctx.fillStyle = '#06080e';
    ctx.fillRect(0, 0, w, h);

    // 6.1 顶部透视日光灯管微光带 (Ceiling Fluorescent Strip Lights)
    for (let i = 0; i < 3; i++) {
      const ly = h * (0.10 + i * 0.08);
      const lw = w * (0.4 + i * 0.15);
      const lx = (w - lw) / 2;

      ctx.fillStyle = 'rgba(224, 242, 254, 0.25)';
      ctx.fillRect(lx, ly, lw, 2.5);

      const lGrad = ctx.createRadialGradient(w / 2, ly, 1, w / 2, ly, lw * 0.45);
      lGrad.addColorStop(0, 'rgba(186, 230, 253, 0.16)');
      lGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lGrad;
      ctx.fillRect(0, ly - 8, w, 18);
    }

    // 6.2 左侧承重柱与黄黑警示斑马线 (Structural Pillar)
    const pilW = 56;
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, pilW, h);

    // 柱子上的黄黑警示条
    const stripeY = h * 0.42;
    for (let sy = stripeY; sy < stripeY + 60; sy += 12) {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(0, sy); ctx.lineTo(pilW, sy - 8); ctx.lineTo(pilW, sy); ctx.lineTo(0, sy + 8);
      ctx.fill();
    }

    // 6.3 绿色环氧树脂地坪镜面微反射 (Glossy Epoxy Floor)
    const floorY = h * 0.56;
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
    floorGrad.addColorStop(0, 'rgba(6, 78, 59, 0.35)');
    floorGrad.addColorStop(0.35, 'rgba(4, 47, 46, 0.18)');
    floorGrad.addColorStop(1, '#03070b');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, w, h - floorY);

    // 车尾灯暗红倒影 (远处爱车熄火余晖)
    const taillightGlow = ctx.createRadialGradient(w * 0.72, floorY + 24, 2, w * 0.72, floorY + 24, 42);
    taillightGlow.addColorStop(0, 'rgba(239, 68, 68, 0.38)');
    taillightGlow.addColorStop(0.6, 'rgba(185, 28, 28, 0.12)');
    taillightGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = taillightGlow;
    ctx.beginPath();
    ctx.arc(w * 0.72, floorY + 24, 42, 0, Math.PI * 2);
    ctx.fill();
  }

  // ==========================================
  // 7. 楼顶天台：金属护栏剪影、俯瞰不夜城万家灯火与车水马龙
  // ==========================================
  renderMidnightRooftop(ctx, w, h, dt, t) {
    // 广阔无垠的夜空渐变
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#060914');
    skyGrad.addColorStop(0.45, '#0b1328');
    skyGrad.addColorStop(0.75, '#1e1b4b');
    skyGrad.addColorStop(1, '#05070d');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 夜空繁星
    this.renderStarfield(ctx, t, 0.55);

    // 7.1 远方城市天际线万家灯火与摩天大楼剪影
    this.windows.forEach((win) => {
      const blink = 0.6 + 0.4 * Math.sin(t * win.blinkSpeed + win.phase);
      ctx.fillStyle = win.color;
      ctx.globalAlpha = win.alpha * blink;
      ctx.fillRect(win.x, win.y, win.w, win.h);
    });
    ctx.globalAlpha = 1.0;

    // 7.2 远景地面车流金色与红色光之长河 (Flowing City Traffic)
    const trafficY = h * 0.65;
    ctx.save();
    const trafficGrad = ctx.createLinearGradient(0, trafficY, w, trafficY + 12);
    trafficGrad.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
    trafficGrad.addColorStop(0.5, 'rgba(244, 63, 94, 0.35)');
    trafficGrad.addColorStop(1, 'rgba(251, 146, 60, 0.35)');
    ctx.strokeStyle = trafficGrad;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, trafficY + 8);
    ctx.quadraticCurveTo(w * 0.5, trafficY - 4, w, trafficY + 16);
    ctx.stroke();
    ctx.restore();

    // 7.3 天台黑色金属防护栏杆剪影 (Foreground Railing)
    ctx.fillStyle = '#060810';
    ctx.fillRect(0, h * 0.70, w, 7); // 主扶手横梁
    ctx.fillRect(0, h * 0.82, w, 5); // 下横梁
    for (let rx = 16; rx < w; rx += 28) {
      ctx.fillRect(rx, h * 0.70, 3.5, h * 0.30); // 坚固竖栏杆
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
  // 8. 赛博暖金：静谧琥珀雅境与浮光星芒 (实机同款)
  // ==========================================
  renderGoldenAmber(ctx, w, h, dt, t) {
    const grad = ctx.createRadialGradient(w / 2, h * 0.42, 25, w / 2, h * 0.46, w * 0.95);
    grad.addColorStop(0, '#38250f');
    grad.addColorStop(0.35, '#221609');
    grad.addColorStop(0.7, '#130c04');
    grad.addColorStop(1, '#070401');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    this.goldenDust.forEach(d => {
      d.y -= d.speedY * dt;
      d.x += Math.sin(t * d.freq + d.phase) * (d.amp * dt);
      if (d.y < 0) {
        d.y = h;
        d.x = Math.random() * w;
      }
      const alpha = 0.25 + Math.sin(t * 1.5 + d.phase) * 0.2;
      ctx.save();
      ctx.fillStyle = d.color;
      ctx.globalAlpha = Math.max(0.08, Math.min(0.75, alpha));
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ==========================================
  // 9. 雨夜车窗：Bokeh 光晕与车窗滑落雨丝
  // ==========================================
  renderRainyCar(ctx, w, h, dt, t) {
    const baseGrad = ctx.createLinearGradient(0, 0, 0, h);
    baseGrad.addColorStop(0, '#0a0d14');
    baseGrad.addColorStop(0.5, '#07090f');
    baseGrad.addColorStop(1, '#040508');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, w, h);

    this.bokehs.forEach((b, i) => {
      const offsetX = Math.sin(t * b.speed + i) * 12;
      const offsetY = Math.cos(t * (b.speed * 0.8) + i) * 8;
      const bx = b.x + offsetX;
      const by = b.y + offsetY;
      const pulseR = b.r + Math.sin(t * 1.2 + i) * 3;

      const grad = ctx.createRadialGradient(bx, by, 2, bx, by, pulseR);
      grad.addColorStop(0, `${b.color}0.25)`);
      grad.addColorStop(0.5, `${b.color}0.10)`);
      grad.addColorStop(1, `${b.color}0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx, by, pulseR, 0, Math.PI * 2);
      ctx.fill();
    });

    const vignette = ctx.createRadialGradient(w / 2, h * 0.55, w * 0.3, w / 2, h * 0.55, w * 0.95);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.7, 'rgba(4, 6, 10, 0.45)');
    vignette.addColorStop(1, 'rgba(2, 3, 6, 0.85)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = 1.2;
    this.raindrops.forEach((drop) => {
      drop.y += drop.speed * dt;
      drop.x += drop.wind * (drop.speed * 0.15) * dt;

      if (drop.y > h + drop.length) {
        drop.y = -drop.length - Math.random() * 40;
        drop.x = Math.random() * w;
        drop.speed = 180 + Math.random() * 220;
      }

      const grad = ctx.createLinearGradient(drop.x, drop.y, drop.x + drop.wind * 4, drop.y + drop.length);
      grad.addColorStop(0, `rgba(224, 242, 254, 0)`);
      grad.addColorStop(0.6, `rgba(186, 230, 253, ${drop.alpha * 0.6})`);
      grad.addColorStop(1, `rgba(240, 249, 255, ${drop.alpha})`);

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x + drop.wind * 4, drop.y + drop.length);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${drop.alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(drop.x + drop.wind * 4, drop.y + drop.length, drop.width * 0.8, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ==========================================
  // 10. 深夜阳台：城市天际线与夜空繁星
  // ==========================================
  renderMidnightBalcony(ctx, w, h, dt, t) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#0b1120');
    skyGrad.addColorStop(0.45, '#070d18');
    skyGrad.addColorStop(0.75, '#04070e');
    skyGrad.addColorStop(1, '#020408');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    this.renderStarfield(ctx, t, 0.7);

    const horizonGrad = ctx.createLinearGradient(0, h * 0.45, 0, h * 0.65);
    horizonGrad.addColorStop(0, 'rgba(14, 116, 144, 0)');
    horizonGrad.addColorStop(1, 'rgba(14, 116, 144, 0.12)');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, h * 0.45, w, h * 0.2);

    this.windows.forEach((win) => {
      const blink = 0.6 + 0.4 * Math.sin(t * win.blinkSpeed + win.phase);
      ctx.fillStyle = win.color;
      ctx.globalAlpha = win.alpha * blink;
      ctx.fillRect(win.x, win.y, win.w, win.h);
    });
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = 'rgba(5, 7, 12, 0.88)';
    ctx.fillRect(0, h * 0.66, w, 8);
    for (let rx = 18; rx < w; rx += 42) {
      ctx.fillRect(rx, h * 0.66, 4, h * 0.34);
    }
  }

  // ==========================================
  // 11. 森林篝火：山野暗林与跳动炭火星
  // ==========================================
  renderCampfire(ctx, w, h, dt, t) {
    const forestGrad = ctx.createLinearGradient(0, 0, 0, h);
    forestGrad.addColorStop(0, '#040b08');
    forestGrad.addColorStop(0.5, '#020705');
    forestGrad.addColorStop(1, '#010403');
    ctx.fillStyle = forestGrad;
    ctx.fillRect(0, 0, w, h);

    const firePulse = Math.sin(t * 3.5) * 8;
    const fireGlowR = w * 0.48 + firePulse;
    const fireGrad = ctx.createRadialGradient(w / 2, h * 0.72, 10, w / 2, h * 0.72, fireGlowR);
    fireGrad.addColorStop(0, 'rgba(245, 158, 11, 0.32)');
    fireGrad.addColorStop(0.4, 'rgba(220, 38, 38, 0.18)');
    fireGrad.addColorStop(0.75, 'rgba(180, 83, 9, 0.08)');
    fireGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.72, fireGlowR, 0, Math.PI * 2);
    ctx.fill();

    this.embers.forEach((ember) => {
      ember.life += dt;
      ember.y -= ember.speedY * dt;
      ember.x += Math.sin(t * ember.sineFreq + ember.phase) * (ember.sineAmp * dt * 2);

      if (ember.life >= ember.maxLife || ember.y < h * 0.15) {
        ember.life = 0;
        ember.y = h * (0.68 + Math.random() * 0.25);
        ember.x = w * 0.5 + (Math.random() - 0.5) * (w * 0.45);
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
  // 12. 极简黑曜：极致写实纯黑微距摄影背景 (Solid Pitch-Black Studio Background)
  // ==========================================
  renderObsidian(ctx, w, h) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
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
}

export const sceneRenderer = new SceneRenderer();
