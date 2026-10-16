// engine/renderers/fairyRenderer.js

/**
 * 腾讯游戏部门级 · 七仙降世 · 霓裳羽衣散花 (Seven Celestial Fairies 60FPS 创世典藏版)
 *
 * 腾讯设计总监级「自然飞天动力学」全新创新重塑：
 * 1. 【彻底告别僵硬转圈 · 仙鹤排云雁行阵 (V-Shaped Flowing Attendant Formation)】：
 *    - 告别机械圆圈旋转！采用中国神话正统群仙出巡「雁行双翼排云阵列」；
 *    - 绯红主仙居中前锋引路，六位仙子两翼阶梯错落伴飞，符合仙人飞天飞行的自然合理动势；
 * 2. 【如波逐浪的呼吸浮沉律动 (Sequential Wave Floating Dynamics)】：
 *    - 七位仙子各自拥有 0.3 秒轻盈浮沉相位差，主仙微抬、伴仙起伏，如漫步在虚空仙阶之上；
 * 3. 【七道飘逸流光仙绸天河 (Flowing Rainbow Silk Aurora Streamers)】：
 *    - 顺应飞行迎风气流，七道彩虹长绸在身后如波浪长缎顺滑展开，交织成壮丽微透彩霞天河；
 * 4. 【落英逐风飘散 (Wind-Blown Blossom Shower)】：
 *    - 3D 翻滚粉桃五瓣琼花与金络仙莲顺着飞行气流徐徐向后、向下飘落，符合真实空气阻力与飘逸诗意；
 * 5. 【瑶池仙乐声波与朝霞仙雾 (Celestial Harmonic Ripples & Dawn Mist)】：
 *    - 清澈空灵的同心仙乐波纹与柔光朝霞，带来顶级东方审美与情绪价值。
 */

// 1. 绘制单朵 3D 翻滚飘落的仙卉琼花/粉桃五瓣花粒子
export function drawFairyFlowerParticle(ctx, p) {
  const r = p.radius || 7.5;
  const a = p.alpha || 0.88;
  const rot = p.rotation || 0;
  const flip = Math.cos(p.flipPhase || 0); // 3D 翻转透视
  const absFlip = Math.max(0.18, Math.abs(flip));

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(rot);
  ctx.scale(absFlip, 1.0);

  if (p.isFivePetal) {
    // 娇柔粉桃五瓣琼花
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-r * 0.46, -r * 0.52, -r * 0.38, -r, 0, -r * 0.96);
      ctx.bezierCurveTo(r * 0.38, -r, r * 0.46, -r * 0.52, 0, 0);
      ctx.closePath();
      // 粉白温润渐变质感
      ctx.fillStyle = (i % 2 === 0)
        ? `rgba(244, 114, 182, ${a * 0.90})`
        : `rgba(253, 226, 236, ${a * 0.94})`;
      ctx.fill();
      ctx.restore();
    }
    // 黄金花蕊与细致花心
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.98})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.10, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(245, 158, 11, ${a * 0.95})`;
    ctx.fill();
  } else {
    // 圣洁飞天仙莲花瓣
    const len = r * 1.6;
    const w = len * 0.46;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-w, -len * 0.38, -w * 0.75, -len * 0.82, 0, -len);
    ctx.bezierCurveTo(w * 0.75, -len * 0.82, w, -len * 0.38, 0, 0);
    ctx.closePath();
    ctx.fillStyle = `rgba(251, 113, 133, ${a * 0.85})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.92})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  ctx.restore();
}

export class SevenFairies {
  constructor(x, y, variant = 0) {
    this.variant = variant;
    this.startX = x;
    this.startY = y;
    // 双仙阵左右错位伴飞：variant 0 偏左，variant 1 偏右
    this.x = variant === 1 ? (x + 28) : (x - 28);
    this.y = y;
    this.vx = variant === 1 ? 0.20 : -0.20;
    this.vy = -1.45; // 舒缓轻灵升腾，停留时间更长更唯美

    this.age = 0;
    this.maxAge = 330; // 延长至约 5.5 秒，充分享受群仙凌波漫步
    this.alpha = 0;
    this.scale = 0.88;

    // 仙乐声波涟漪集合
    this.musicRipples = [];

    // 天女散花计时
    this.flowerShedTimer = 0;

    // 七位飞天仙子配置：雁行排云阵列 (wingSide: 0 主锋, -1 左翼, 1 右翼)
    this.fairies = [
      {
        id: 0,
        wingSide: 0,
        wingOrder: 0, // 居中领仙先锋
        name: '绯红仙姿',
        title: '中天引路 · 反弹琵琶',
        pose: 'pipa',
        color: '#f43f5e',
        glowColor: 'rgba(244, 63, 94, ',
        ribbonColor: 'rgba(254, 205, 211, 0.85)',
        offsetX: 0,
        offsetY: 0,
        history: []
      },
      {
        id: 1,
        wingSide: -1,
        wingOrder: 1, // 左翼第一位 (内侧)
        name: '金华仙姿',
        title: '金华照世 · 掌托仙莲',
        pose: 'lotus',
        color: '#facc15',
        glowColor: 'rgba(250, 204, 21, ',
        ribbonColor: 'rgba(254, 240, 138, 0.85)',
        offsetX: 0,
        offsetY: 0,
        history: []
      },
      {
        id: 2,
        wingSide: -1,
        wingOrder: 2, // 左翼第二位 (中侧)
        name: '暖橙仙姿',
        title: '晚霞映月 · 翩跹摇琴',
        pose: 'lute',
        color: '#fb923c',
        glowColor: 'rgba(251, 146, 60, ',
        ribbonColor: 'rgba(254, 215, 170, 0.85)',
        offsetX: 0,
        offsetY: 0,
        history: []
      },
      {
        id: 3,
        wingSide: -1,
        wingOrder: 3, // 左翼第三位 (外侧)
        name: '翠微仙姿',
        title: '空谷幽兰 · 横吹玉笛',
        pose: 'flute',
        color: '#34d399',
        glowColor: 'rgba(52, 211, 153, ',
        ribbonColor: 'rgba(167, 243, 208, 0.85)',
        offsetX: 0,
        offsetY: 0,
        history: []
      },
      {
        id: 4,
        wingSide: 1,
        wingOrder: 1, // 右翼第一位 (内侧)
        name: '晴岚仙姿',
        title: '天青水色 · 提携花篮',
        pose: 'basket',
        color: '#22d3ee',
        glowColor: 'rgba(34, 211, 238, ',
        ribbonColor: 'rgba(207, 250, 254, 0.85)',
        offsetX: 0,
        offsetY: 0,
        history: []
      },
      {
        id: 5,
        wingSide: 1,
        wingOrder: 2, // 右翼第二位 (中侧)
        name: '云蓝仙姿',
        title: '浩瀚星汉 · 漫舞水袖',
        pose: 'ribbon_dance',
        color: '#60a5fa',
        glowColor: 'rgba(96, 165, 250, ',
        ribbonColor: 'rgba(191, 219, 254, 0.85)',
        offsetX: 0,
        offsetY: 0,
        history: []
      },
      {
        id: 6,
        wingSide: 1,
        wingOrder: 3, // 右翼第三位 (外侧)
        name: '紫霞仙姿',
        title: '紫气凌霄 · 拈花散雨',
        pose: 'scatter_flower',
        color: '#c084fc',
        glowColor: 'rgba(192, 132, 252, ',
        ribbonColor: 'rgba(233, 213, 255, 0.85)',
        offsetX: 0,
        offsetY: 0,
        history: []
      }
    ];
  }

  update(screenH, ceilingY, emitParticleCallback) {
    this.age++;
    const prog = this.age / this.maxAge;

    // =================================================================
    // 1. 群仙升腾整体流线动力学 (空中曼妙 S 型起伏飞渡)
    // =================================================================
    this.vy = Math.max(-2.9, this.vy - 0.003);
    const celestialSwayX = Math.sin(this.age * 0.035) * 1.4;
    this.x += celestialSwayX + this.vx;

    // 严密边界安全区：整体保持在舒适观赏天区
    const safeRightLimit = (this.startX || 180) + (this.variant === 1 ? 55 : -10);
    if (this.x > safeRightLimit) {
      this.x -= (this.x - safeRightLimit) * 0.08;
    }
    this.y += this.vy;

    // =================================================================
    // 2. 仙鹤排云阵列 · 动态坐标与起伏相位差 (行动自然合理)
    // =================================================================
    const s = this.scale;
    // 阵列展开呼吸：随着升腾，两翼舒展张开
    const spreadProgress = Math.min(1.0, this.age / 45);
    const wingSpacingX = (14 + spreadProgress * 6) * s; // 左右错开间距
    const wingSpacingY = (10 + spreadProgress * 5) * s; // 前后梯形错开间距

    for (let i = 0; i < this.fairies.length; i++) {
      const f = this.fairies[i];

      let baseOffsetX = 0;
      let baseOffsetY = 0;

      if (f.wingSide === 0) {
        // 领舞主仙：居中领航顶端
        baseOffsetX = 0;
        baseOffsetY = -18 * s;
      } else {
        // 两翼伴仙：阶梯式向外向后错落排开
        baseOffsetX = f.wingSide * f.wingOrder * wingSpacingX;
        baseOffsetY = (-18 + f.wingOrder * wingSpacingY) * s;
      }

      // 顺次传递的柔美仙阶波浪律动 (涟漪起伏浮沉)
      const wavePhase = this.age * 0.08 + f.wingOrder * 0.85 + (f.wingSide === -1 ? 0.35 : 0);
      const floatY = Math.sin(wavePhase) * 5.2 * s;
      const floatX = Math.cos(wavePhase * 0.7) * 2.2 * s;

      f.offsetX = baseOffsetX + floatX;
      f.offsetY = baseOffsetY + floatY;

      let currX = this.x + f.offsetX;
      let currY = this.y + f.offsetY;

      // 右翼最外侧仙女软边界约束 (严禁触碰 DOCK 栏)
      const maxFairyRight = (this.startX || 180) + 48;
      if (currX > maxFairyRight) {
        currX = maxFairyRight;
      }

      // 记录流光仙绸飞行航迹 (沿气流向后自然拖曳)
      f.history.unshift({ x: currX, y: currY });
      if (f.history.length > 14) {
        f.history.pop();
      }
    }

    // =================================================================
    // 3. 瑶池仙乐声波涟漪 (由领仙指尖定期漾开同心音律)
    // =================================================================
    if (this.age % 36 === 0 && this.alpha > 0.3) {
      this.musicRipples.push({
        x: this.x,
        y: this.y - 18 * s,
        radius: 12 * s,
        maxRadius: 105 * s,
        alpha: this.alpha * 0.8
      });
    }

    for (let i = this.musicRipples.length - 1; i >= 0; i--) {
      const rip = this.musicRipples[i];
      rip.radius += 2.0 * s;
      rip.alpha *= 0.95;
      if (rip.radius >= rip.maxRadius || rip.alpha <= 0.02) {
        this.musicRipples.splice(i, 1);
      }
    }

    // =================================================================
    // 4. 落英逐风飘散系统 (琼花顺着迎风气流向后、向下飘落)
    // =================================================================
    if (typeof emitParticleCallback === 'function' && this.alpha > 0.20) {
      this.flowerShedTimer++;

      // 每 8 帧由各仙子指尖挥洒立体翻滚仙桃琼花与仙莲
      if (this.flowerShedTimer % 8 === 0) {
        const fairyIdx = Math.floor(Math.random() * this.fairies.length);
        const f = this.fairies[fairyIdx];
        const fx = this.x + f.offsetX;
        const fy = this.y + f.offsetY;

        emitParticleCallback({
          x: fx + (Math.random() - 0.5) * 14 * s,
          y: fy + (Math.random() - 0.5) * 10 * s,
          vx: (Math.random() - 0.5) * 0.8,
          // 顺风向后向下飘落 (符合真实空气阻力)
          vy: 0.70 + Math.random() * 0.75,
          radius: 6.0 + Math.random() * 3.2,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.05,
          flipPhase: Math.random() * Math.PI * 2,
          isFivePetal: Math.random() < 0.68,
          alpha: this.alpha * 0.95,
          baseAlpha: 0.95,
          life: 0,
          maxLife: 130 + Math.random() * 30,
          isFairyFlower: true
        });
      }

      // 彩绸身后拖曳的七彩微尘
      if (this.age % 2 === 0) {
        const f = this.fairies[this.age % this.fairies.length];
        emitParticleCallback({
          x: this.x + f.offsetX + (Math.random() - 0.5) * 10 * s,
          y: this.y + f.offsetY + (Math.random() - 0.5) * 10 * s,
          vx: (Math.random() - 0.5) * 0.6,
          vy: 0.2 + Math.random() * 0.5, // 顺气流后退
          radius: 1.1 + Math.random() * 1.5,
          alpha: this.alpha * 0.9,
          baseAlpha: 0.9,
          life: 0,
          maxLife: 45 + Math.random() * 20,
          color: f.color,
          isGold: true,
          shimmerPhase: Math.random() * Math.PI * 2,
          shimmerSpeed: 0.25
        });
      }
    }

    // =================================================================
    // 5. 透明度控制 (破雾初现 -> 仙姿凌波盛放 -> 踏云羽化)
    // =================================================================
    let birthFade = 1.0;
    if (this.age < 24) {
      birthFade = Math.sin((this.age / 24) * (Math.PI / 2));
    }

    let lifeFade = 1.0;
    if (prog > 0.72) {
      const fadeProg = Math.max(0, 1 - (prog - 0.72) / 0.28);
      lifeFade = Math.pow(fadeProg, 1.8);
    }

    let ceilingFade = 1.0;
    if (this.y < ceilingY + 120) {
      ceilingFade = Math.max(0, (this.y - ceilingY) / 120);
    }

    this.alpha = birthFade * lifeFade * ceilingFade;

    return (this.age < this.maxAge && this.y > ceilingY - 60 && this.alpha > 0.01);
  }

  render(ctx) {
    if (this.alpha <= 0.01) return;

    const s = this.scale;
    const a = this.alpha;

    // 1. 【瑶池朝霞仙雾柔光 (Dawn Pastel Mist)】
    this._renderDawnClouds(ctx, s, a);

    // 2. 【瑶池仙乐声波涟漪 (Celestial Music Ripples)】
    this._renderMusicRipples(ctx, s, a);

    // 3. 【七彩飞天流光仙绸天河 (Flowing Rainbow Silk Aurora)】
    this._renderSilkStreamers(ctx, s, a);

    // 4. 【雁行群仙圣光神姿 (The Seven Fairies Attendant Formation)】
    this._renderFeitianSpirits(ctx, s, a);
  }

  // 1. 瑶池朝霞仙雾
  _renderDawnClouds(ctx, s, a) {
    ctx.save();
    const cloudY = this.y + 35 * s;

    // 底层淡紫霞雾
    ctx.beginPath();
    ctx.ellipse(this.x, cloudY, 130 * s, 32 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(244, 114, 182, ${a * 0.16})`;
    ctx.fill();

    // 中层柔光云气
    const puffs = [
      { dx: -55, dy: 6, rx: 45, ry: 16, col: 'rgba(192, 132, 252, ' },
      { dx: 0, dy: 4, rx: 60, ry: 20, col: 'rgba(254, 240, 138, ' },
      { dx: 55, dy: 6, rx: 45, ry: 16, col: 'rgba(56, 189, 248, ' }
    ];

    for (const p of puffs) {
      ctx.beginPath();
      ctx.ellipse(this.x + p.dx * s, cloudY + p.dy * s, p.rx * s, p.ry * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = `${p.col}${a * 0.14})`;
      ctx.fill();
    }

    ctx.restore();
  }

  // 2. 瑶池仙乐声波涟漪
  _renderMusicRipples(ctx, s, a) {
    if (!this.musicRipples.length) return;

    ctx.save();
    for (const rip of this.musicRipples) {
      const ripAlpha = rip.alpha * a;
      if (ripAlpha <= 0.01) continue;

      ctx.beginPath();
      ctx.ellipse(rip.x, rip.y, rip.radius, rip.radius * 0.50, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(254, 240, 138, ${ripAlpha * 0.72})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(rip.x, rip.y, rip.radius * 0.82, rip.radius * 0.42, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(244, 114, 182, ${ripAlpha * 0.45})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3. 七彩飞天流光仙绸天河 (随飞行气流向后自然伸展)
  _renderSilkStreamers(ctx, s, a) {
    ctx.save();
    for (const f of this.fairies) {
      if (!f.history || f.history.length < 3) continue;

      ctx.beginPath();
      ctx.moveTo(f.history[0].x, f.history[0].y);

      for (let j = 1; j < f.history.length - 1; j++) {
        const xc = (f.history[j].x + f.history[j + 1].x) / 2;
        const yc = (f.history[j].y + f.history[j + 1].y) / 2;
        ctx.quadraticCurveTo(f.history[j].x, f.history[j].y, xc, yc);
      }
      const lastP = f.history[f.history.length - 1];
      ctx.lineTo(lastP.x, lastP.y);

      // 外层专属彩霞柔光
      ctx.strokeStyle = `${f.glowColor}${a * 0.60})`;
      ctx.lineWidth = 3.8 * s;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // 核心月白丝绸高光
      ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.80})`;
      ctx.lineWidth = 1.3 * s;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 4. 雁行群仙圣光神姿 (从后至前自然绘制)
  _renderFeitianSpirits(ctx, s, a) {
    // 依 Y 轴深度从后往前排序，领舞仙子居前
    const sorted = [...this.fairies].sort((a1, b1) => a1.offsetY - b1.offsetY);

    for (const f of sorted) {
      const fx = this.x + f.offsetX;
      const fy = this.y + f.offsetY;
      this._drawSingleFeitianSpirit(ctx, f, fx, fy, s, a);
    }
  }

  // 绘制单体敦煌飞天仙姿
  _drawSingleFeitianSpirit(ctx, f, x, y, s, a) {
    ctx.save();
    ctx.translate(x, y);

    // A. 灵光神圣仙环
    ctx.beginPath();
    ctx.arc(0, -9 * s, 13 * s, 0, Math.PI * 2);
    ctx.fillStyle = `${f.glowColor}${a * 0.22})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -9 * s, 10 * s, 0, Math.PI * 2);
    ctx.strokeStyle = `${f.glowColor}${a * 0.82})`;
    ctx.lineWidth = 1.1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -9 * s, 7.5 * s, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.90})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // B. 飞天凌空披帛 (双拱流水线)
    ctx.beginPath();
    ctx.moveTo(-15 * s, 8 * s);
    ctx.bezierCurveTo(-20 * s, -12 * s, -10 * s, -22 * s, 0, -18 * s);
    ctx.bezierCurveTo(10 * s, -22 * s, 20 * s, -12 * s, 15 * s, 8 * s);
    ctx.strokeStyle = f.ribbonColor;
    ctx.lineWidth = 2.0 * s;
    ctx.lineCap = 'round';
    ctx.stroke();

    // C. 飞天轻盈曼妙身段本体 (半透明纯净圣光玉体)
    ctx.beginPath();
    ctx.moveTo(0, -11 * s);
    ctx.bezierCurveTo(3.5 * s, -4 * s, 4.5 * s, 4 * s, 2 * s, 11 * s);
    ctx.bezierCurveTo(5 * s, 18 * s, 9 * s, 24 * s, 7 * s, 28 * s);
    ctx.bezierCurveTo(2 * s, 26 * s, -2.5 * s, 22 * s, -5 * s, 26 * s);
    ctx.bezierCurveTo(-3.5 * s, 18 * s, -2.5 * s, 11 * s, -2 * s, 4 * s);
    ctx.bezierCurveTo(-3.5 * s, -4 * s, -1.8 * s, -7 * s, 0, -11 * s);
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.95})`;
    ctx.fill();

    ctx.strokeStyle = `${f.glowColor}${a * 0.72})`;
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // D. 云髻与金步摇微光
    ctx.beginPath();
    ctx.ellipse(0, -13 * s, 2.0 * s, 3.0 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.98})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -16 * s, 1.2 * s, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.98})`;
    ctx.fill();

    // E. 飞天本命仙姿法器
    this._drawFeitianPoseRelic(ctx, f.pose, s, a);

    ctx.restore();
  }

  // 绘制仙女特有的飞天本命姿态
  _drawFeitianPoseRelic(ctx, pose, s, a) {
    ctx.save();

    if (pose === 'pipa') {
      // 经典反弹琵琶
      ctx.translate(4.5 * s, -3.5 * s);
      ctx.rotate(-0.52);
      ctx.beginPath();
      ctx.ellipse(0, 3.8 * s, 3.0 * s, 5.5 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.95})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(245, 158, 11, ${a * 0.9})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -2 * s);
      ctx.lineTo(0, -8 * s);
      ctx.strokeStyle = `rgba(245, 158, 11, ${a * 0.95})`;
      ctx.lineWidth = 1.1 * s;
      ctx.stroke();
    } else if (pose === 'lotus') {
      // 掌心托宝相金莲
      ctx.translate(5.5 * s, -5 * s);
      ctx.beginPath();
      ctx.arc(0, 0, 3.4 * s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.95})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 5.0 * s, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(253, 224, 71, ${a * 0.72})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    } else if (pose === 'flute') {
      // 横吹碧玉长笛
      ctx.translate(1 * s, -6 * s);
      ctx.rotate(0.30);
      ctx.beginPath();
      ctx.moveTo(-8 * s, 0);
      ctx.lineTo(8 * s, 0);
      ctx.strokeStyle = `rgba(167, 243, 208, ${a * 0.95})`;
      ctx.lineWidth = 1.3 * s;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8 * s, 0);
      ctx.lineTo(11 * s, 2.5 * s);
      ctx.strokeStyle = `rgba(244, 63, 94, ${a * 0.9})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    } else if (pose === 'lute') {
      // 抱金阮
      ctx.translate(3.5 * s, -2.5 * s);
      ctx.beginPath();
      ctx.arc(0, 1.8 * s, 3.6 * s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(254, 215, 170, ${a * 0.95})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(249, 115, 22, ${a * 0.9})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -2 * s);
      ctx.lineTo(0, -6 * s);
      ctx.strokeStyle = `rgba(249, 115, 22, ${a * 0.9})`;
      ctx.lineWidth = 1.0 * s;
      ctx.stroke();
    } else if (pose === 'basket') {
      // 挽花篮
      ctx.translate(5.5 * s, 2 * s);
      ctx.beginPath();
      ctx.arc(0, 0, 2.8 * s, 0, Math.PI);
      ctx.fillStyle = `rgba(207, 250, 254, ${a * 0.95})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -1.8 * s, 2.4 * s, Math.PI, 0);
      ctx.strokeStyle = `rgba(34, 211, 238, ${a * 0.9})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    } else if (pose === 'ribbon_dance') {
      // 舞双水袖
      ctx.beginPath();
      ctx.moveTo(-3.5 * s, -1.8 * s);
      ctx.quadraticCurveTo(-10 * s, 2 * s, -14 * s, 12 * s);
      ctx.moveTo(3.5 * s, -1.8 * s);
      ctx.quadraticCurveTo(10 * s, 2 * s, 14 * s, 12 * s);
      ctx.strokeStyle = `rgba(191, 219, 254, ${a * 0.95})`;
      ctx.lineWidth = 1.1 * s;
      ctx.stroke();
    } else if (pose === 'scatter_flower') {
      // 拈花散雨
      ctx.beginPath();
      ctx.arc(6 * s, -7 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244, 114, 182, ${a * 0.98})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(8.5 * s, -4.5 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(253, 224, 71, ${a * 0.95})`;
      ctx.fill();
    }

    ctx.restore();
  }
}
