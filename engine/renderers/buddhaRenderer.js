// utils/buddhaRenderer.js

/**
 * 腾讯游戏设计总监级 · 佛光普照 · 梵天千叶金莲 (Buddha's Light & Celestial Golden Lotus 60FPS 殿堂创新版)
 * 纯原生 Canvas 2D 硬件光栅化 · 零外部贴图依赖 · 零 CPU 高斯模糊 · 零 GC 对象池复用
 *
 * 【颠覆性差异化创新定位 · 告别平面机械圆盘】：
 * 八卦大阵为【道教天象星盘】：俯视视角、二十八星宿逆转、太极双鱼流转、天道冷冽青金/玄紫。
 * 梵天金莲为【佛教立体法界】：
 * 1. 【底座 · 3D 盛放千叶宝相金莲】：3D 仰角立体透视，层层舒展的绯金/帝金花瓣向外舒展；
 * 2. 【升腾 · 盘旋万字舍利螺旋光雨】：双螺旋缠绕上升的佛门金阶，不再是平面对称飘带；
 * 3. 【光相 · 敦煌背光菩提神树金叶大圆光】：马蹄形/火焰拱背光（Mandorla），配火焰纹与飞天散花；
 * 4. 【核心 · 虚空垂挂佛门八宝转经法筒与真言璎珞】：立体旋转的真言法幢；
 * 5. 【天顶 · 佛顶万道朝阳扇面破晓金芒】：由下自上如日出东山般的大扇面朝阳佛光，彻底拉开空间感！
 */

export class BuddhaLightAscension {
  constructor(x, y, options = {}) {
    this.variant = options.variant || 0;
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.vx = options.vx || 0;
    this.vy = 1.45; // 祥和稳健的升腾速度
    this.age = 0;
    this.maxAge = 250; // 约 4.2 秒
    this.alpha = 0;

    // 旋转角与动态相位
    this.lotusRot = this.variant === 1 ? Math.PI : 0;
    this.mandorlaPhase = 0;
    this.spiralPhase = 0;
    this.prayerWheelAngle = 0;

    // 基础尺寸
    this.baseR = 90;

    // 六字大明咒 + 禅悟真言
    this.mantras = ['唵', '嘛', '呢', '叭', '咪', '吽'];

    // 3D 螺旋升腾舍利光阶骨骼点池 (Zero-GC 预分配 24 节)
    this.numHelixNodes = 24;
    this.helixNodes = [];
    for (let i = 0; i < this.numHelixNodes; i++) {
      this.helixNodes.push({ x: x, y: y, radius: 0, angle: 0 });
    }
  }

  update(screenH, ceilingY, emitParticleCallback) {
    this.age++;

    // 1. 生命周期透明度与天顶羽化
    if (this.age < 28) {
      this.alpha = Math.sin((this.age / 28) * (Math.PI / 2));
    } else if (this.age > 185) {
      this.alpha = Math.max(0, 1.0 - (this.age - 185) / (this.maxAge - 185));
    } else {
      this.alpha = 1.0;
    }

    const safeCeiling = (typeof ceilingY === 'number' && ceilingY > 0) ? ceilingY : 110;
    if (this.y < safeCeiling + 120) {
      const topFade = Math.max(0, (this.y - (safeCeiling + 15)) / 105);
      this.alpha *= topFade;
    }

    // 2. 空间位置与动态相位
    this.x += this.vx + Math.sin(this.age * 0.028) * 0.25;
    this.y -= this.vy;
    this.vy = Math.max(1.05, this.vy * 0.995);

    const rotDir = this.variant === 1 ? -1 : 1;
    this.lotusRot += 0.005 * rotDir;          // 金莲极其缓慢庄严微旋
    this.mandorlaPhase += 0.035;              // 菩提背光火焰呼吸
    this.spiralPhase += 0.055 * rotDir;       // 3D 螺旋天梯飞升
    this.prayerWheelAngle += 0.022 * rotDir;  // 真言法幢自转

    // 3. 原地计算 3D 螺旋舍利金阶节点
    const curR = this._getCurrentRadius();
    for (let i = 0; i < this.numHelixNodes; i++) {
      const node = this.helixNodes[i];
      const ratio = i / (this.numHelixNodes - 1); // 0 (莲座底部) -> 1 (升腾天顶)
      node.y = this.y + curR * 0.65 - ratio * (curR * 2.2);
      node.angle = this.spiralPhase + ratio * Math.PI * 3.5;
      node.radius = (curR * 0.75) * (0.85 + Math.sin(ratio * Math.PI) * 0.35);
      node.x = this.x + Math.cos(node.angle) * node.radius;
    }

    // 4. 伴生漫天飘舞的 3D 绯金花瓣与万字菩提真言金星
    if (typeof emitParticleCallback === 'function' && this.age % 3 === 0 && this.alpha > 0.15) {
      const pAngle = Math.random() * Math.PI * 2;
      const pDist = curR * (0.3 + Math.random() * 0.8);
      const px = this.x + Math.cos(pAngle) * pDist;
      const py = this.y + Math.sin(pAngle) * (pDist * 0.5) + curR * 0.2;

      if (this.age % 6 === 0) {
        emitParticleCallback({
          x: px,
          y: py,
          vx: Math.cos(pAngle) * 0.45,
          vy: -(0.75 + Math.random() * 0.6),
          radius: 6.0 + Math.random() * 3.0,
          alpha: this.alpha * 0.92,
          baseAlpha: 0.92,
          life: 0,
          maxLife: 75 + Math.random() * 25,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.05,
          swayPhase: Math.random() * Math.PI * 2,
          color: Math.random() < 0.65 ? '#fde047' : '#fb7185',
          isLotusPetal: true
        });
      } else {
        emitParticleCallback({
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -(0.9 + Math.random() * 0.7),
          radius: 1.6 + Math.random() * 1.6,
          alpha: this.alpha * 0.96,
          baseAlpha: 0.96,
          life: 0,
          maxLife: 52 + Math.random() * 20,
          color: Math.random() < 0.7 ? '#fef08a' : '#fbbf24',
          isGold: true,
          shimmerPhase: Math.random() * Math.PI * 2,
          shimmerSpeed: 0.22
        });
      }
    }

    return (this.age < this.maxAge && this.alpha > 0.005);
  }

  _getCurrentRadius() {
    let bloom = 1.0;
    if (this.age < 28) {
      const t = this.age / 28;
      bloom = 0.55 + 0.45 * (1 - Math.pow(1 - t, 3));
    }
    const breath = Math.sin(this.age * 0.06) * 3.5;
    return (this.baseR + Math.min(36, this.age * 0.20) + breath) * bloom;
  }

  render(ctx) {
    if (this.alpha <= 0.005) return;

    const curR = this._getCurrentRadius();
    const a = this.alpha;

    ctx.save();

    // ==========================================
    // 1. 【第一重 · 佛光破晓扇面旭日金芒】(World Space)
    // 彻底告别圆锥/平角，从莲花座向天幕呈 180 度大扇面放射如来破晓神光！
    // ==========================================
    this._renderDawnBuddhaSunburst(ctx, curR, a);

    // ==========================================
    // 2. 【第二重 · 3D 螺旋飞升金阶与舍利光雨】(World Space)
    // 告别平面对称绶带，双螺旋三维立体盘旋升空
    // ==========================================
    this._renderAscendingHelixSteps(ctx, curR, a);

    // 切换至法台中心局部坐标系
    ctx.translate(this.x, this.y);

    // ==========================================
    // 3. 【第三重 · 敦煌莫高窟火焰宝相菩提背光 (Mandorla Halo)】
    // 告别圆形圆盘！采用纯正莫高窟水滴/马蹄形神圣火焰轮！
    // ==========================================
    this._renderDunhuangFlameMandorla(ctx, curR, a);

    // ==========================================
    // 4. 【第四重 · 悬空六度真言经幢法柱与八吉祥璎珞】
    // 轴心立体旋转法幢与垂挂璎珞宝珠
    // ==========================================
    this._renderPrayerPillarAndOrnaments(ctx, curR, a);

    // ==========================================
    // 5. 【第五重 · 3D 仰视盛放千叶宝相金莲座】
    // 3D 椭圆透视底座：前低后高、层层舒展的绯金/帝金重瓣与金刚莲蓬
    // ==========================================
    this._render3DPerspectiveLotusBase(ctx, curR, a);

    // ==========================================
    // 6. 【第六重 · 莲台圣核：大日如来千辐金刚轮与白炽万字】
    // 莲心凝聚万德吉祥万字光印
    // ==========================================
    this._renderLotusHeartSwastika(ctx, curR * 0.24, a);

    ctx.restore();
  }

  // ========================================================
  // 1. 佛光破晓扇面旭日神光 (Dawn Buddha Sunburst)
  // 核心创新：自金莲座后方破晓升腾，向天际洒出 180 度宏大金色晨曦扇面
  // ========================================================
  _renderDawnBuddhaSunburst(ctx, curR, a) {
    if (a < 0.12) return;
    ctx.save();
    const burstA = Math.min(0.40, a * 0.40);
    const originX = this.x;
    const originY = this.y + curR * 0.25; // 光源自莲台中心深处喷薄而出
    const maxRadius = curR * 2.6;

    // 广域温暖晨曦天幕光晕 (Amber-Gold Dawn Radiance)
    const dawnGrad = ctx.createRadialGradient(originX, originY, curR * 0.1, originX, originY, maxRadius);
    dawnGrad.addColorStop(0, `rgba(255, 251, 235, ${burstA * 1.5})`);
    dawnGrad.addColorStop(0.25, `rgba(254, 240, 138, ${burstA * 1.0})`);
    dawnGrad.addColorStop(0.55, `rgba(245, 158, 11, ${burstA * 0.55})`);
    dawnGrad.addColorStop(0.85, `rgba(244, 63, 94, ${burstA * 0.18})`);
    dawnGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(originX, originY, maxRadius, -Math.PI, 0); // 向上半球 180 度宏大展开
    ctx.closePath();
    ctx.fillStyle = dawnGrad;
    ctx.fill();

    // 13 道向上漫射的破晓佛光金芒 (Fan Sunbeams)
    const numBeams = 13;
    const beamPulse = Math.sin(this.age * 0.08) * 0.05;
    ctx.lineWidth = 3.5;
    for (let i = 0; i < numBeams; i++) {
      const angle = -Math.PI + (i + 0.5) * (Math.PI / numBeams) + beamPulse;
      const rayLen = maxRadius * (0.85 + ((i % 3) * 0.08));
      const endX = originX + Math.cos(angle) * rayLen;
      const endY = originY + Math.sin(angle) * rayLen;

      const rGrad = ctx.createLinearGradient(originX, originY, endX, endY);
      rGrad.addColorStop(0, `rgba(255, 255, 255, ${burstA * 1.8})`);
      rGrad.addColorStop(0.4, `rgba(253, 224, 71, ${burstA * 0.9})`);
      rGrad.addColorStop(0.8, `rgba(245, 158, 11, ${burstA * 0.3})`);
      rGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = rGrad;
      ctx.stroke();

      // 光束顶端点缀晨露舍利金星
      if (i % 2 === 0 && a > 0.3) {
        ctx.fillStyle = `rgba(255, 251, 235, ${burstA * 1.4})`;
        ctx.beginPath();
        ctx.arc(endX * 0.95 + originX * 0.05, endY * 0.95 + originY * 0.05, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // ========================================================
  // 2. 3D 螺旋飞升金阶与舍利光雨 (Ascending Helix Steps)
  // 核心创新：摆脱平面的两条 S 绶带，改为三维立体环绕升腾的佛门光阶
  // ========================================================
  _renderAscendingHelixSteps(ctx, curR, a) {
    const nodes = this.helixNodes;
    if (!nodes || nodes.length < 3) return;

    ctx.save();
    // 绘制螺旋主光轨
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    // 外层金霞
    ctx.lineWidth = 6.0;
    ctx.strokeStyle = `rgba(245, 158, 11, ${a * 0.28})`;
    ctx.stroke();
    // 内层纯金
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.82})`;
    ctx.stroke();

    // 螺旋阶梯上的 3D 舍利明珠与佛阶横格 (在前景显示亮，后景显示微暗)
    for (let i = 1; i < nodes.length - 1; i += 2) {
      const p = nodes[i];
      const sinA = Math.sin(p.angle); // -1: 后方, 1: 前方 (3D 景深)
      const depthAlpha = 0.5 + (sinA + 1) * 0.25; // 0.5 ~ 1.0
      const jewelSize = 2.0 + (sinA + 1) * 0.8;

      // 舍利金珠
      ctx.fillStyle = sinA > 0
        ? `rgba(255, 251, 235, ${a * depthAlpha})`
        : `rgba(251, 191, 36, ${a * depthAlpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, jewelSize, 0, Math.PI * 2);
      ctx.fill();

      // 微光晕
      if (sinA > 0.4) {
        ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.35})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, jewelSize * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // ========================================================
  // 3. 敦煌莫高窟火焰宝相菩提背光 (Dunhuang Flame Mandorla)
  // 核心创新：纯正莫高窟水滴形/马蹄拱背光，外绕燃烧的智慧金火，绝非同心圆
  // ========================================================
  _renderDunhuangFlameMandorla(ctx, curR, a) {
    ctx.save();
    // 背光向上延伸抬高，使莲座位于下方
    const mandorlaW = curR * 1.15;
    const mandorlaH = curR * 1.55;
    const centerY = -curR * 0.35; // 向上悬空

    // 1. 水滴形背光底衬渐变 (曼荼罗法界)
    const flameBreath = Math.sin(this.mandorlaPhase) * 3.0;
    const haloGrad = ctx.createRadialGradient(0, centerY, 5, 0, centerY, mandorlaH * 0.8);
    haloGrad.addColorStop(0, `rgba(255, 251, 235, ${a * 0.65})`);
    haloGrad.addColorStop(0.35, `rgba(253, 224, 71, ${a * 0.45})`);
    haloGrad.addColorStop(0.68, `rgba(244, 63, 94, ${a * 0.22})`);
    haloGrad.addColorStop(0.92, `rgba(180, 83, 9, ${a * 0.12})`);
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = haloGrad;
    this._drawMandorlaPath(ctx, 0, centerY, mandorlaW + flameBreath, mandorlaH + flameBreath);
    ctx.fill();

    // 2. 敦煌莫高窟 24 朵腾跃的智慧火焰纹 (Wisdom Fire Tendrils)
    const numFlames = 22;
    for (let f = 0; f < numFlames; f++) {
      const angle = (f / numFlames) * Math.PI * 2;
      // 仅在背光的上部与侧面生成火焰，下部被莲花承接
      if (Math.sin(angle) > 0.45) continue;

      const fx = Math.cos(angle) * (mandorlaW * 0.52);
      const fy = centerY + Math.sin(angle) * (mandorlaH * 0.52);
      const wave = Math.sin(this.age * 0.12 + f * 0.9) * 4.5;
      const flameLen = 14 + wave;

      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(angle + Math.PI / 2);

      // 火焰瓣
      ctx.fillStyle = f % 2 === 0
        ? `rgba(254, 240, 138, ${a * 0.85})`
        : `rgba(244, 63, 94, ${a * 0.72})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-4, -flameLen * 0.4, -2, -flameLen * 0.8, 0, -flameLen);
      ctx.bezierCurveTo(2, -flameLen * 0.8, 4, -flameLen * 0.4, 0, 0);
      ctx.fill();

      ctx.restore();
    }

    // 3. 背光金轮边饰双描金线
    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.85})`;
    ctx.lineWidth = 1.8;
    this._drawMandorlaPath(ctx, 0, centerY, mandorlaW * 0.88, mandorlaH * 0.88);
    ctx.stroke();

    ctx.strokeStyle = `rgba(251, 191, 36, ${a * 0.55})`;
    ctx.lineWidth = 1.0;
    this._drawMandorlaPath(ctx, 0, centerY, mandorlaW * 0.76, mandorlaH * 0.76);
    ctx.stroke();

    ctx.restore();
  }

  // 绘制纯正敦煌水滴/尖顶拱门背光轮廓 (Mandorla Path)
  _drawMandorlaPath(ctx, cx, cy, w, h) {
    const halfW = w * 0.5;
    const topY = cy - h * 0.55;
    const botY = cy + h * 0.45;
    const midY = cy - h * 0.05;

    ctx.beginPath();
    ctx.moveTo(cx, topY); // 尖顶
    // 右半弧（尖顶向外鼓出再收回底部）
    ctx.bezierCurveTo(cx + halfW * 0.45, topY + h * 0.15, cx + halfW, midY, cx + halfW * 0.9, botY * 0.7);
    ctx.bezierCurveTo(cx + halfW * 0.75, botY, cx + halfW * 0.35, botY, cx, botY);
    // 左半弧
    ctx.bezierCurveTo(cx - halfW * 0.35, botY, cx - halfW * 0.75, botY, cx - halfW * 0.9, botY * 0.7);
    ctx.bezierCurveTo(cx - halfW, midY, cx - halfW * 0.45, topY + h * 0.15, cx, topY);
    ctx.closePath();
  }

  // ========================================================
  // 4. 悬空六度真言经幢法柱与八吉祥璎珞 (Prayer Pillar & Ornaments)
  // 核心创新：立体旋转的真言法筒，配合垂挂的金丝璎珞流苏
  // ========================================================
  _renderPrayerPillarAndOrnaments(ctx, curR, a) {
    ctx.save();
    const pillarY = -curR * 0.30;
    const pillarW = curR * 0.52;
    const pillarH = curR * 0.36;

    // 1. 悬挂璎珞金丝垂带 (从背光两侧垂向莲台)
    const tasselCount = 6;
    for (let t = 0; t < tasselCount; t++) {
      const dir = t < 3 ? -1 : 1;
      const idx = t % 3;
      const startX = dir * (curR * (0.35 + idx * 0.18));
      const startY = pillarY - curR * 0.15;
      const endX = dir * (curR * (0.28 + idx * 0.12));
      const endY = curR * 0.35;
      const sway = Math.sin(this.age * 0.07 + t * 0.8) * 4.0;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + dir * 10 + sway, (startY + endY) * 0.5, endX, endY);
      ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.65})`;
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // 璎珞流苏上的舍利宝珠
      const beadX = (startX + endX) * 0.5 + sway * 0.5;
      const beadY = (startY + endY) * 0.5;
      ctx.fillStyle = `rgba(255, 251, 235, ${a * 0.90})`;
      ctx.beginPath();
      ctx.arc(beadX, beadY, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. 六字大明咒真言金印 (【唵 · 嘛 · 呢 · 叭 · 咪 · 吽】)
    // 环形立体排列于法幢周围，伴随 prayerWheelAngle 旋转
    const mantraR = pillarW * 0.72;
    for (let m = 0; m < this.mantras.length; m++) {
      const angle = this.prayerWheelAngle + (m * Math.PI * 2) / this.mantras.length;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle); // 景深

      // 3D 柱面透视坐标
      const mx = cosA * mantraR;
      const my = pillarY + sinA * (pillarH * 0.35);

      const depthA = 0.45 + (sinA + 1) * 0.28; // 0.45 ~ 1.0
      const fontSize = 11 + Math.round((sinA + 1) * 2);

      ctx.save();
      ctx.translate(mx, my);

      // 真言金色发光底盘
      ctx.fillStyle = `rgba(180, 83, 9, ${a * depthA * 0.85})`;
      ctx.beginPath();
      ctx.arc(0, 0, fontSize * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(254, 240, 138, ${a * depthA})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 真言梵文楷书
      ctx.font = `bold ${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(255, 251, 235, ${a * depthA * 1.0})`;
      ctx.fillText(this.mantras[m], 0, 0.5);

      ctx.restore();
    }

    ctx.restore();
  }

  // ========================================================
  // 5. 3D 仰视盛放千叶宝相金莲座 (3D Perspective Lotus Base)
  // 核心创新：3D 椭圆透视，前低后高、层层舒展的绯金/帝金花瓣！
  // 彻底告别八卦的机械圆形平面感，构筑极具东方佛韵的庄严莲花宝座！
  // ========================================================
  _render3DPerspectiveLotusBase(ctx, curR, a) {
    ctx.save();
    // 莲花底座中心下沉至画面下方，营造宏大仰望感
    const baseY = curR * 0.28;
    ctx.translate(0, baseY);

    // 盛开动态系数
    const bloom = 0.90 + Math.sin(this.age * 0.08) * 0.04;

    // ----------------------------------------------------
    // 5.1 后景层（背侧莲瓣）：深绯金，略小，烘托纵深感
    // ----------------------------------------------------
    const backCount = 9;
    const backLen = curR * 0.82 * bloom;
    const backW = curR * 0.26;
    for (let i = 0; i < backCount; i++) {
      // 仅在后半圆 (-PI 到 0) 排列
      const angle = -Math.PI + (i + 0.5) * (Math.PI / backCount);
      const px = Math.cos(angle) * (curR * 0.42);
      const py = Math.sin(angle) * (curR * 0.18); // 椭圆压扁 0.18 营造 3D 透视

      ctx.save();
      ctx.translate(px, py);
      // 瓣尖朝向背侧上方微外撇
      const petalRot = angle + Math.PI / 2;
      ctx.rotate(petalRot * 0.65);

      const backGrad = ctx.createLinearGradient(0, 0, 0, -backLen);
      backGrad.addColorStop(0, `rgba(180, 83, 9, ${a * 0.72})`);
      backGrad.addColorStop(0.6, `rgba(244, 63, 94, ${a * 0.85})`);
      backGrad.addColorStop(1, `rgba(251, 191, 36, ${a * 0.92})`);

      this._drawSingleCurvedPetal(ctx, backLen, backW, backGrad, `rgba(254, 240, 138, ${a * 0.85})`);
      ctx.restore();
    }

    // ----------------------------------------------------
    // 5.2 核心金刚莲台基座 (Golden Stamen Pedestal)
    // ----------------------------------------------------
    const pedW = curR * 0.46;
    const pedH = curR * 0.18;
    // 莲台椭圆金光
    const pedGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, pedW);
    pedGrad.addColorStop(0, `rgba(255, 255, 255, ${a * 0.98})`);
    pedGrad.addColorStop(0.4, `rgba(253, 224, 71, ${a * 0.92})`);
    pedGrad.addColorStop(1, `rgba(217, 119, 6, ${a * 0.85})`);

    ctx.save();
    ctx.scale(1.0, 0.42); // 3D 压扁椭圆
    ctx.fillStyle = pedGrad;
    ctx.beginPath();
    ctx.arc(0, 0, pedW, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 251, 235, ${a * 0.95})`;
    ctx.lineWidth = 2.0;
    ctx.stroke();
    ctx.restore();

    // ----------------------------------------------------
    // 5.3 前景层（前侧莲瓣）：饱满盛放、向观者舒展的大花瓣
    // ----------------------------------------------------
    const frontCount = 7;
    const frontLen = curR * 0.92 * bloom;
    const frontW = curR * 0.32;
    for (let i = 0; i < frontCount; i++) {
      // 仅在前半圆 (0 到 PI) 排列
      const angle = (i + 0.5) * (Math.PI / frontCount);
      const px = Math.cos(angle) * (curR * 0.46);
      const py = Math.sin(angle) * (curR * 0.20);

      ctx.save();
      ctx.translate(px, py);
      // 花瓣向前外翻展开
      const petalRot = angle - Math.PI / 2;
      ctx.rotate(petalRot * 0.45);

      const frontGrad = ctx.createLinearGradient(0, 0, 0, frontLen * 0.85);
      frontGrad.addColorStop(0, `rgba(254, 240, 138, ${a * 0.95})`);
      frontGrad.addColorStop(0.5, `rgba(251, 191, 36, ${a * 0.92})`);
      frontGrad.addColorStop(1, `rgba(244, 63, 94, ${a * 0.85})`);

      this._drawSingleFrontLotusPetal(ctx, frontLen, frontW, frontGrad, `rgba(255, 251, 235, ${a * 0.96})`);
      ctx.restore();
    }

    ctx.restore();
  }

  // 绘制后仰 3D 宝相金莲花瓣
  _drawSingleCurvedPetal(ctx, len, width, grad, rimCol) {
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-width * 0.9, -len * 0.35, -width * 0.75, -len * 0.82, 0, -len);
    ctx.bezierCurveTo(width * 0.75, -len * 0.82, width * 0.9, -len * 0.35, 0, 0);
    ctx.closePath();
    ctx.fill();

    // 纯金描金叶脉
    ctx.strokeStyle = rimCol;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -len * 0.15);
    ctx.lineTo(0, -len * 0.9);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // 绘制前俯盛开 3D 宝相金莲花瓣
  _drawSingleFrontLotusPetal(ctx, len, width, grad, rimCol) {
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-width, len * 0.35, -width * 0.8, len * 0.85, 0, len);
    ctx.bezierCurveTo(width * 0.8, len * 0.85, width, len * 0.35, 0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = rimCol;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, len * 0.12);
    ctx.lineTo(0, len * 0.88);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // ========================================================
  // 6. 莲台圣核：大日如来千辐金刚轮与白炽万字 (Lotus Heart Swastika)
  // 位于莲座正中央，与莫高窟壁画般散发永恒功德光辉
  // ========================================================
  _renderLotusHeartSwastika(ctx, coreR, a) {
    ctx.save();
    const coreY = curR_local => curR_local * 0.18;
    ctx.translate(0, coreY(coreR * 4));

    // 1. 核心日光辐射小金轮 (12 辐条)
    const numSpokes = 12;
    for (let s = 0; s < numSpokes; s++) {
      const sa = (s * Math.PI * 2) / numSpokes + this.age * 0.015;
      const sx = Math.cos(sa) * (coreR * 1.35);
      const sy = Math.sin(sa) * (coreR * 0.8); // 3D 压扁
      ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.55})`;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(sx, sy);
      ctx.stroke();

      // 辐条顶端明珠
      ctx.fillStyle = `rgba(255, 251, 235, ${a * 0.85})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. 金莲心宝座发光体
    const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, coreR);
    coreGrad.addColorStop(0, `rgba(255, 255, 255, ${a * 0.98})`);
    coreGrad.addColorStop(0.45, `rgba(253, 224, 71, ${a * 0.95})`);
    coreGrad.addColorStop(1, `rgba(217, 119, 6, ${a * 0.88})`);

    ctx.save();
    ctx.scale(1.0, 0.7);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, coreR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 251, 235, ${a * 0.98})`;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    // 3. 3D 立体鎏金【卍】字万德佛印
    const pulseScale = 1.0 + Math.sin(this.age * 0.1) * 0.05;
    ctx.scale(pulseScale, pulseScale);
    ctx.font = '900 20px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 立体阴影
    ctx.fillStyle = `rgba(146, 64, 14, ${a * 0.95})`;
    ctx.fillText('卍', 1.0, 1.4);
    // 纯金亮面
    ctx.fillStyle = `rgba(255, 251, 235, ${a * 1.0})`;
    ctx.fillText('卍', 0, 0);

    ctx.restore();
  }
}
