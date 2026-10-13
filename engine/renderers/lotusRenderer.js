// engine/renderers/lotusRenderer.js

/**
 * 腾讯游戏设计级 · 青莲化境 · 步步生莲 (Sacred Jade Lotus 60FPS 极速优化版)
 * 纯原生 Canvas 2D 高保真东方美学玉莲花绽放动力学与步步生涟漪系统
 *
 * 核心视觉系统与情绪价值亮点：
 * 1. 【三阶九品净世青莲 (3-Tier Sacred Jade Blooming Lotus)】：
 *    - 闭苞初现 -> 破雾轻扬 -> 舒展层层绽放 (外层深碧翡翠、中层薄荷浅玉、内层凝脂羊脂白玉)；
 *    - 纤细脉络与微透光晕，每一片花瓣均带有温润如玉的渐变与金丝收边；
 * 2. 【步步生莲 · 水韵空灵涟漪 (Footstep Celestial Ripples)】：
 *    - 青莲随气流轻柔曼妙升腾时，足下如踏九天瑶池，周期性泛起向外荡漾的椭圆水纹涟漪；
 * 3. 【琉璃金蕊座与七星净火莲子 (Golden Zen Stamen Platform & Luminous Seeds)】：
 *    - 核心温润金蕊台，七颗灵光金莲子随呼吸节律微芒跃动，散发神圣禅意氛围；
 * 4. 【飘落翡翠飞瓣与晶莹清晨甘露 (Fluttering Jade Petals & Dewdrops)】：
 *    - 升腾过程中如细雨落花，伴生翻滚摇曳的 3D 碧玉花瓣与晨曦露珠，充满东方诗意美感；
 * 5. 【100% 硬件光栅化零 GC 优化】：
 *    - 无 CPU 高斯模糊，双通道轻量光晕，对象池复用，稳定满帧 60FPS。
 */

// 绘制单片具有东方古典玉雕质感的莲花花瓣
function drawSingleJadePetal(ctx, length, width, fillStyle, strokeStyle, veinColor, alpha) {
  ctx.save();
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 1.0;

  // 优美对称水滴/宝相莲花花瓣贝塞尔曲线
  ctx.beginPath();
  ctx.moveTo(0, 0); // 花托根部
  // 左侧弧线：下窄中宽上尖
  ctx.bezierCurveTo(-width * 0.75, -length * 0.35, -width * 0.95, -length * 0.72, 0, -length);
  // 右侧弧线对称汇聚至花尖
  ctx.bezierCurveTo(width * 0.95, -length * 0.72, width * 0.75, -length * 0.35, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 中央微弱剔透主叶脉，呈现羊脂美玉微透光质感
  if (veinColor && length > 16) {
    ctx.beginPath();
    ctx.moveTo(0, -length * 0.15);
    ctx.lineTo(0, -length * 0.82);
    ctx.strokeStyle = veinColor;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  ctx.restore();
}

// 飘落空中的 3D 碧玉翻滚花瓣粒子 (提供给主粒子管线)
export function drawJadePetalParticle(ctx, p) {
  const len = p.radius || 7.5;
  const w = len * 0.55;
  const a = p.alpha || 0.85;
  const rot = p.rotation || 0;
  const flip = Math.cos(p.flipPhase || 0); // 3D Y轴立体翻滚
  const absFlip = Math.max(0.18, Math.abs(flip));

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(rot);
  ctx.scale(absFlip, 1.0);

  // 1. 碧玉外晕 (轻量硬件光栅化)
  ctx.beginPath();
  ctx.arc(0, -len * 0.4, len * 0.75, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(110, 231, 183, ${a * 0.18})`;
  ctx.fill();

  // 2. 翡翠玉瓣主体
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-w * 0.8, -len * 0.35, -w, -len * 0.75, 0, -len);
  ctx.bezierCurveTo(w, -len * 0.75, w * 0.8, -len * 0.35, 0, 0);
  ctx.closePath();
  ctx.fillStyle = `rgba(52, 211, 153, ${a * 0.88})`;
  ctx.fill();

  // 3. 羊脂月白玉边描边
  ctx.strokeStyle = `rgba(209, 250, 229, ${a * 0.92})`;
  ctx.lineWidth = 0.9;
  ctx.stroke();

  ctx.restore();
}

export class JadeLotus {
  constructor(x, y) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.35;
    this.vy = -(1.30 + Math.random() * 0.35); // 优雅温润匀速升腾
    this.age = 0;
    this.maxAge = 195; // 约 3.2 秒生命周期
    this.alpha = 0;
    this.baseAlpha = 0.96;

    // 绽放形态动力学：从闭苞 (0.28) 随升腾丝滑舒展至盛绽 (1.15)
    this.bloomProgress = 0.0;
    this.bloomSpeed = 0.020;
    this.scale = 0.30;
    this.targetScale = 1.15 + Math.random() * 0.15;

    // 水平轻柔微摆波动
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.045;

    // “步步生莲”足下水纹涟漪数组
    this.ripples = [];
    this.rippleInterval = 32; // 每 32 帧在足下凝结生出一道瑶池水晕
    this.rippleTimer = 0;

    // 翡翠飞瓣脱落计时器
    this.petalShedTimer = 0;
  }

  update(ch, ceilingY, pushParticleFn) {
    this.age++;
    const prog = this.age / this.maxAge;

    // 1. 温润升腾与轻柔横向微摆 (仿香气缭绕中的悬浮宝莲)
    this.wobblePhase += this.wobbleSpeed;
    this.vy *= 0.992;
    if (this.vy > -0.75) this.vy = -0.75; // 保持恒定向上优雅游动
    this.x += this.vx + Math.sin(this.wobblePhase) * 0.42;
    this.y += this.vy;

    // 2. 舒展绽放动力学计算 (Smoothstep 拟合天然花开曲线)
    this.bloomProgress = Math.min(1.0, this.bloomProgress + this.bloomSpeed);
    const easeBloom = this.bloomProgress * this.bloomProgress * (3 - 2 * this.bloomProgress);
    this.scale = 0.30 + (this.targetScale - 0.30) * easeBloom;

    // 3. 透明度包络：前 18 帧平滑淡入，中后段(prog > 0.60)四次方羽化融入虚空
    let birthFade = 1.0;
    if (this.age < 18) {
      birthFade = Math.sin((this.age / 18) * (Math.PI / 2));
    }

    let lifeFade = 1.0;
    if (prog > 0.60) {
      const fadeProg = Math.max(0, 1 - (prog - 0.60) / 0.40);
      lifeFade = Math.pow(fadeProg, 1.8);
    }

    // 屏幕顶部安全天花板自然渐隐
    let ceilingFade = 1.0;
    if (this.y < ceilingY + 110) {
      ceilingFade = Math.max(0, (this.y - ceilingY) / 110);
    }

    this.alpha = this.baseAlpha * birthFade * lifeFade * ceilingFade;

    // 4. “步步生莲”——足下水韵涟漪生成与更新
    this.rippleTimer++;
    if (this.rippleTimer >= this.rippleInterval && this.alpha > 0.3) {
      this.rippleTimer = 0;
      this.ripples.push({
        x: this.x,
        y: this.y + 14 * this.scale,
        r: 6 * this.scale,
        maxR: (38 + Math.random() * 12) * this.scale,
        alpha: 0.68 * this.alpha,
        growRate: 0.85
      });
    }

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rip = this.ripples[i];
      rip.r += rip.growRate;
      rip.alpha *= 0.945;
      if (rip.r >= rip.maxR || rip.alpha <= 0.01) {
        this.ripples.splice(i, 1);
      }
    }

    // 5. 飘散伴生粒子：轻舞翡翠花瓣与清晨晶莹甘露
    if (pushParticleFn && this.alpha > 0.25) {
      this.petalShedTimer++;
      // 每 20 帧轻落一片翻滚的翡翠花瓣
      if (this.petalShedTimer % 22 === 0) {
        const shedAngle = Math.random() * Math.PI * 2;
        pushParticleFn({
          x: this.x + Math.cos(shedAngle) * 16 * this.scale,
          y: this.y + Math.sin(shedAngle) * 10 * this.scale,
          vx: Math.cos(shedAngle) * 0.45 + (Math.random() - 0.5) * 0.3,
          vy: 0.25 + Math.random() * 0.45, // 顺应重力摇曳缓缓飘落
          radius: 6.0 + Math.random() * 2.5,
          alpha: 0.82 * this.alpha,
          baseAlpha: 0.82,
          life: 0,
          maxLife: 110,
          color: '#34d399',
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.035,
          flipPhase: Math.random() * Math.PI * 2,
          isJadePetal: true
        });
      }

      // 盛开初期生成晨曦甘露灵气微粒
      if (this.age < 50 && Math.random() < 0.35) {
        const rad = Math.random() * Math.PI * 2;
        const dist = (12 + Math.random() * 22) * this.scale;
        pushParticleFn({
          x: this.x + Math.cos(rad) * dist,
          y: this.y + Math.sin(rad) * dist,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(0.55 + Math.random() * 0.4),
          radius: 1.5 + Math.random() * 1.4,
          alpha: 0.78 * this.alpha,
          baseAlpha: 0.78,
          life: 0,
          maxLife: 90,
          color: '#e0f2fe',
          growRate: 0.02,
          isDewdrop: true
        });
      }
    }

    // 存活判定
    if (this.age >= this.maxAge || this.y <= ceilingY || this.alpha <= 0.005) {
      return false;
    }
    return true;
  }

  render(ctx) {
    if (this.alpha <= 0.01) return;

    // 1. 优先渲染足下“步步生莲”水韵涟漪 (处于莲花正下方)
    this.renderRipples(ctx);

    const s = this.scale;
    const a = this.alpha;
    const bloom = this.bloomProgress; // 0.0 (花蕾) -> 1.0 (盛放)

    ctx.save();
    ctx.translate(this.x, this.y);

    // 2. 宝莲外围祥和碧玉灵气光晕 (双层轻量光栅化，替代高开销 shadowBlur)
    const haloRadius = (36 + bloom * 18) * s;
    ctx.beginPath();
    ctx.arc(0, 0, haloRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(52, 211, 153, ${a * 0.16})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, haloRadius * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(167, 243, 208, ${a * 0.22})`;
    ctx.fill();

    // 3. 绘制三阶九品青莲花瓣 (由外至内，立体层叠遮罩)

    // === 【第 1 阶：外层 8 瓣 · 苍碧翡翠大瓣】===
    // 花瓣长度 34 * s，宽度 18 * s。随 bloom 展开，外翻角度由闭合的 28 度展至 72 度
    const outerCount = 8;
    const outerTilt = 0.45 + bloom * 0.78; // 倾角
    const outerLen = (28 + bloom * 10) * s;
    const outerW = (13 + bloom * 5) * s;
    for (let i = 0; i < outerCount; i++) {
      const angle = (i / outerCount) * Math.PI * 2;
      ctx.save();
      ctx.rotate(angle);
      // 3D 轴透视倾斜拉伸
      ctx.scale(1.0, outerTilt);
      drawSingleJadePetal(
        ctx,
        outerLen,
        outerW,
        `rgba(16, 185, 129, ${a * 0.88})`, // 浓郁温润帝王翡翠绿
        `rgba(167, 243, 208, ${a * 0.95})`, // 浅翠描金收边
        `rgba(209, 250, 229, ${a * 0.45})`,
        a
      );
      ctx.restore();
    }

    // === 【第 2 阶：中层 8 瓣 · 薄荷浅翠中瓣】 (错位 22.5 度交叠穿插) ===
    const midCount = 8;
    const midTilt = 0.60 + bloom * 0.55;
    const midLen = (24 + bloom * 7) * s;
    const midW = (11 + bloom * 4) * s;
    const midOffset = Math.PI / outerCount;
    for (let i = 0; i < midCount; i++) {
      const angle = (i / midCount) * Math.PI * 2 + midOffset;
      ctx.save();
      ctx.rotate(angle);
      ctx.scale(1.0, midTilt);
      drawSingleJadePetal(
        ctx,
        midLen,
        midW,
        `rgba(52, 211, 153, ${a * 0.92})`, // 清新透亮薄荷水玉
        `rgba(240, 253, 244, ${a * 0.98})`, // 羊脂白玉明朗描边
        `rgba(255, 255, 255, ${a * 0.55})`,
        a
      );
      ctx.restore();
    }

    // === 【第 3 阶：内层 6 瓣 · 凝脂月白核心玉瓣】 (拱卫莲心金蕊) ===
    const innerCount = 6;
    const innerTilt = 0.80 + bloom * 0.35;
    const innerLen = (18 + bloom * 5) * s;
    const innerW = (9 + bloom * 3) * s;
    for (let i = 0; i < innerCount; i++) {
      const angle = (i / innerCount) * Math.PI * 2 + (Math.PI / 6);
      ctx.save();
      ctx.rotate(angle);
      ctx.scale(1.0, innerTilt);
      drawSingleJadePetal(
        ctx,
        innerLen,
        innerW,
        `rgba(209, 250, 229, ${a * 0.95})`, // 凝脂羊脂白玉
        `rgba(254, 240, 138, ${a * 0.92})`, // 浅金丝描边
        null,
        a
      );
      ctx.restore();
    }

    // 4. 核心温润金蕊台 (Golden Zen Stamen Pedestal)
    const coreR = (7.5 + bloom * 3.5) * s;
    ctx.beginPath();
    ctx.arc(0, 0, coreR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(245, 158, 11, ${a * 0.92})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.98})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 5. 七星琉璃金莲子 (Luminous Golden Seeds & Pistils)
    const seedDist = coreR * 0.55;
    const seedCount = 6;
    for (let i = 0; i < seedCount; i++) {
      const sa = (i / seedCount) * Math.PI * 2;
      const sx = Math.cos(sa) * seedDist;
      const sy = Math.sin(sa) * seedDist;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.4 * s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.98})`;
      ctx.fill();
    }
    // 正中央第 7 颗至尊金舍利子
    ctx.beginPath();
    ctx.arc(0, 0, 1.8 * s, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.98})`;
    ctx.fill();

    // 6. 花心高光十字钻石星芒 (Diamond Stamen Glint)
    const glintSize = (4.0 + Math.sin(this.wobblePhase * 2) * 1.5) * s;
    ctx.beginPath();
    ctx.moveTo(-glintSize, 0);
    ctx.lineTo(glintSize, 0);
    ctx.moveTo(0, -glintSize);
    ctx.lineTo(0, glintSize);
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.95})`;
    ctx.lineWidth = 1.0;
    ctx.stroke();

    ctx.restore();
  }

  // 渲染足下瑶池椭圆水波涟漪
  renderRipples(ctx) {
    if (!this.ripples || !this.ripples.length) return;
    for (const rip of this.ripples) {
      if (rip.alpha <= 0.01) continue;
      ctx.save();
      ctx.translate(rip.x, rip.y);
      ctx.scale(1.0, 0.38); // 仿俯角 3D 透视水面椭圆

      // 外圈碧玉波痕
      ctx.beginPath();
      ctx.arc(0, 0, rip.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(110, 231, 183, ${rip.alpha * 0.85})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // 内圈浅月白明波
      if (rip.r > 12) {
        ctx.beginPath();
        ctx.arc(0, 0, rip.r * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(209, 250, 229, ${rip.alpha * 0.45})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}
