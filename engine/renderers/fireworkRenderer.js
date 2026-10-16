// engine/renderers/fireworkRenderer.js

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 腾讯游戏体验设计总监 / 技术美术总监 殿堂重制版
 * 【华夏盛世 · 万家璀璨烟火】(China's Golden Age · Celestial Fireworks & Lantern Symphony)
 * ═══════════════════════════════════════════════════════════════════════════
 * 纯原生 Canvas 2D 硬件光栅化 · 零外部贴图 · 零 CPU 高斯模糊 · 零 GC 内存抖动
 *
 * 腾讯总监级四重盛典创意视觉体系：
 * 1. 【第一重 · 万家祈愿 · 孔明温润天灯 (Celestial Kongming Sky Lanterns)】：
 *    - 伴随呼气升起两盏温润微晃的赤金纸红祈愿天灯，内部烛火呼吸脉冲，带着"福"、"吉"微光浮游；
 * 2. 【第二重 · 破霄龙鸣 · 螺旋金龙响尾火箭 (Spiral Dragon-Tail Comet Rockets)】：
 *    - 火箭以真实抛物加速度尖啸冲霄，身后拖曳着螺旋旋转的纯金彗星曳光尾迹与金火屑；
 * 3. 【第三重 · 高空重阶国风盛世牡丹礼花 (Imperial Peony & Strobe Flash)】：
 *    - 核心白金闪光耀斑，舒展 32 颗彩珠构成的盛世牡丹光环，外围伴随噼啪闪烁的八芒闪光星钻；
 * 4. 【第四重 · 锦冠千丝垂柳金雨 (Imperial Brocade Willow Gold Cascade)】：
 *    - 礼花盛开后，垂落 24 道随空气阻力与重力徐徐飘摇的锦冠垂丝金雨，漫天流金、普天同庆；
 * 5. 【双实例对仗共存 (Dual Show Support)】：
 *    - variant 0 (偏左)：故宫赤金丹红 + 纯白高光盛世牡丹；
 *    - variant 1 (偏右)：紫微曜紫 + 翡翠天青 + 帝金锦冠；左右呼应，盛世华章！
 * ═══════════════════════════════════════════════════════════════════════════
 */

// 微信小程序原生 Canvas 安全椭圆绘制
function safeDrawEllipse(ctx, x, y, rx, ry, rot = 0) {
  const absRx = Math.max(0.1, Math.abs(rx));
  const absRy = Math.max(0.1, Math.abs(ry));
  ctx.save();
  ctx.translate(x, y);
  if (rot !== 0) ctx.rotate(rot);
  ctx.scale(absRx, absRy);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.restore();
}

/**
 * 单个孔明祈愿天灯实体
 */
class SkyLantern {
  constructor(x, y, variant = 0, index = 0) {
    this.variant = variant;
    // 6 盏万家灯火天灯空间梯次分布：近大远小，高低错落
    const spreadOffsets = [-32, 28, -16, 18, -48, 44];
    const yOffsets = [-8, -16, -24, -32, -40, -48];
    const scales = [1.05, 0.95, 0.85, 0.78, 0.65, 0.58]; // 近大远小立体景深
    const words = (variant === 0)
      ? ['福', '安', '吉', '顺', '祥', '康']
      : ['盛', '世', '欢', '腾', '万', '家'];

    const offX = spreadOffsets[index % spreadOffsets.length];
    const offY = yOffsets[index % yOffsets.length];

    this.startX = x + offX;
    this.startY = y + offY;
    this.x = this.startX;
    this.y = this.startY;
    this.scale = scales[index % scales.length];
    this.vx = (offX < 0 ? -0.22 : 0.22) * (Math.random() * 0.4 + 0.8);
    this.vy = -(1.15 + (1.05 - this.scale) * 0.35 + Math.random() * 0.25);
    this.age = 0;
    this.maxAge = 230 + index * 10;
    this.swayPhase = Math.random() * Math.PI * 2;
    this.swaySpeed = 0.032 + Math.random() * 0.012;
    this.flickerPhase = Math.random() * Math.PI * 2;
    this.word = words[index % words.length];
    this.alpha = 0;
  }

  update(ceilingY) {
    this.age++;
    const prog = this.age / this.maxAge;

    // 空间浮游与自然随风摆动
    this.swayPhase += this.swaySpeed;
    this.flickerPhase += 0.12;
    this.x += this.vx + Math.sin(this.swayPhase) * 0.42;
    this.y += this.vy;
    this.vy = Math.max(-1.75, this.vy - 0.003);

    // 透明度包络
    if (this.age < 24) {
      this.alpha = Math.sin((this.age / 24) * (Math.PI / 2));
    } else if (prog > 0.65) {
      this.alpha = Math.max(0, 1.0 - (prog - 0.65) / 0.35);
    } else {
      this.alpha = 1.0;
    }

    if (this.y < ceilingY + 80) {
      const topFade = Math.max(0, (this.y - ceilingY) / 80);
      this.alpha *= topFade;
    }

    return (this.age < this.maxAge && this.alpha > 0.005);
  }

  render(ctx) {
    if (this.alpha <= 0.01) return;
    const a = this.alpha;
    const s = this.scale;
    const flicker = 0.88 + Math.sin(this.flickerPhase) * 0.12;

    ctx.save();
    ctx.translate(this.x, this.y);
    const tilt = Math.sin(this.swayPhase) * 0.08;
    ctx.rotate(tilt);

    const w = 18 * s;
    const h = 26 * s;

    // 1. 灯身暖光外晕 (Warm Ambient Glow)
    const glowGrad = ctx.createRadialGradient(0, -h * 0.35, 2, 0, -h * 0.35, w * 1.8);
    glowGrad.addColorStop(0, `rgba(251, 146, 60, ${a * 0.45 * flicker})`);
    glowGrad.addColorStop(0.5, `rgba(239, 68, 68, ${a * 0.20 * flicker})`);
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, -h * 0.35, w * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 2. 梯形宣纸红灯笼主体 (Crimson Rice-Paper Lantern)
    const lanternGrad = ctx.createLinearGradient(0, 0, 0, -h);
    lanternGrad.addColorStop(0, `rgba(239, 68, 68, ${a * 0.90})`);
    lanternGrad.addColorStop(0.45, `rgba(249, 115, 22, ${a * 0.95})`);
    lanternGrad.addColorStop(0.85, `rgba(254, 240, 138, ${a * 0.92})`);
    lanternGrad.addColorStop(1, `rgba(245, 158, 11, ${a * 0.90})`);

    ctx.fillStyle = lanternGrad;
    ctx.beginPath();
    // 鼓腹天灯轮廓
    ctx.moveTo(-w * 0.36, 0); // 下开口
    ctx.quadraticCurveTo(-w * 0.58, -h * 0.45, -w * 0.48, -h); // 左壁
    ctx.quadraticCurveTo(0, -h * 1.08, w * 0.48, -h); // 顶拱
    ctx.quadraticCurveTo(w * 0.58, -h * 0.45, w * 0.36, 0); // 右壁
    ctx.closePath();
    ctx.fill();

    // 3. 竹篾金框与竹箍
    ctx.strokeStyle = `rgba(251, 191, 36, ${a * 0.75})`;
    ctx.lineWidth = 1.0 * s;
    ctx.stroke();

    // 底部木托竹环
    ctx.beginPath();
    safeDrawEllipse(ctx, 0, 0, w * 0.36, 2.5 * s);
    ctx.fillStyle = `rgba(180, 83, 9, ${a * 0.9})`;
    ctx.fill();

    // 4. 灯芯核心白炽明火
    const fireGrad = ctx.createRadialGradient(0, -h * 0.22, 1, 0, -h * 0.22, 5 * s);
    fireGrad.addColorStop(0, `rgba(255, 255, 255, ${a * 0.98 * flicker})`);
    fireGrad.addColorStop(0.5, `rgba(254, 240, 138, ${a * 0.92 * flicker})`);
    fireGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.arc(0, -h * 0.22, 5 * s, 0, Math.PI * 2);
    ctx.fill();

    // 5. 灯面烫金祈愿小篆印字【福/安/吉/顺】
    ctx.font = `bold ${Math.round(10 * s)}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.88})`;
    ctx.fillText(this.word, 0, -h * 0.52);

    ctx.restore();
  }
}

/**
 * 螺旋响尾金龙火箭
 */
class SpiralCometRocket {
  constructor(x, y, targetX, targetY, variant = 0, color) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.variant = variant;
    this.color = color || '#f43f5e';
    this.age = 0;
    this.maxAge = 34 + Math.floor(Math.random() * 8); // 约 0.6 秒破空直冲九天
    this.vy = -6.8 - Math.random() * 1.4;
    this.vx = (targetX - x) / this.maxAge;
    this.spiralAngle = Math.random() * Math.PI * 2;
    this.trail = [];
    this.isDead = false;
  }

  update(emitParticleCallback) {
    this.age++;
    this.spiralAngle += 0.38;

    this.x += this.vx;
    this.y += this.vy;
    this.vy *= 0.965; // 抛物减速，达到高空顶点时炸开

    // 记录螺旋尾迹采样点
    const spiralRadius = 5.2 * (1 - this.age / this.maxAge);
    const trailX = this.x + Math.sin(this.spiralAngle) * spiralRadius;
    const trailY = this.y + 4;

    this.trail.unshift({ x: trailX, y: trailY, alpha: 1.0 });
    if (this.trail.length > 12) {
      this.trail.pop();
    }

    // 喷射金火花尾迹
    if (typeof emitParticleCallback === 'function' && this.age % 2 === 0) {
      emitParticleCallback({
        x: trailX + (Math.random() - 0.5) * 4,
        y: trailY + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.9,
        vy: 1.2 + Math.random() * 0.8,
        radius: 1.4,
        alpha: 0.95,
        baseAlpha: 0.95,
        life: 0,
        maxLife: 20,
        color: Math.random() < 0.6 ? '#fef08a' : '#fbbf24',
        isSpark: true
      });
    }

    if (this.age >= this.maxAge || this.vy > -1.2) {
      this.isDead = true;
    }

    return !this.isDead;
  }

  render(ctx) {
    if (this.isDead) return;
    ctx.save();

    // 1. 螺旋流光彗星尾迹
    for (let i = 0; i < this.trail.length; i++) {
      const pt = this.trail[i];
      const ptAlpha = (1 - i / this.trail.length) * 0.85;
      const ptR = Math.max(1, 3.2 * (1 - i / this.trail.length));
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, ptR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(254, 240, 138, ${ptAlpha})`;
      ctx.fill();
    }

    // 2. 火箭弹头白炽高光
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3.6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.x, this.y, 6.0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.55;
    ctx.fill();

    ctx.restore();
  }
}

/**
 * 盛世牡丹与锦冠垂丝金柳粒子实体
 */
class FireworkSpark {
  constructor(x, y, vx, vy, color, isWillow = false, isStrobe = false) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.isWillow = isWillow;
    this.isStrobe = isStrobe;
    this.age = 0;
    this.maxAge = isWillow ? (80 + Math.floor(Math.random() * 35)) : (52 + Math.floor(Math.random() * 22));
    this.radius = isWillow ? (1.5 + Math.random() * 1.4) : (2.2 + Math.random() * 1.8);
    this.alpha = 1.0;
    this.trail = [];
    this.shimmerPhase = Math.random() * Math.PI * 2;
  }

  update() {
    this.age++;
    const prog = this.age / this.maxAge;

    if (this.isWillow) {
      // 垂柳金雨：受重力与空气微风自然向下弯曲垂落
      this.vx *= 0.96;
      this.vy += 0.055; // 重力加速度
      this.vy *= 0.98;
    } else {
      // 牡丹花瓣星芒：径向扩散减速
      this.vx *= 0.92;
      this.vy *= 0.92;
      this.vy += 0.025;
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.isWillow && this.age % 2 === 0) {
      this.trail.unshift({ x: this.x, y: this.y });
      if (this.trail.length > 5) this.trail.pop();
    }

    // 闪光脉冲
    if (this.isStrobe) {
      this.shimmerPhase += 0.35;
      const flash = (Math.sin(this.shimmerPhase) > 0.4) ? 1.0 : 0.15;
      this.alpha = Math.max(0, (1 - prog)) * flash;
    } else if (prog > 0.45) {
      this.alpha = Math.max(0, 1 - (prog - 0.45) / 0.55);
    } else {
      this.alpha = 1.0;
    }

    return this.age < this.maxAge && this.alpha > 0.005;
  }

  render(ctx) {
    if (this.alpha <= 0.01) return;
    const a = this.alpha;

    ctx.save();
    if (this.isWillow && this.trail.length > 1) {
      // 锦冠垂丝长拖尾 (Liquid Gold Brocade)
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      for (let i = 0; i < this.trail.length; i++) {
        const pt = this.trail[i];
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.lineWidth = this.radius * 0.9;
      ctx.strokeStyle = `rgba(251, 191, 36, ${a * 0.85})`;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = a;
    ctx.fill();

    // 高光闪烁核心
    if (this.isStrobe) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * 腾讯总监设计级 · 华夏盛世 · 万家璀璨烟火主调度器 (CelebrationFireworks)
 */
export class CelebrationFireworks {
  constructor(x, y, variant = 0) {
    this.variant = variant;
    // 双实例错位：variant 0 偏左，variant 1 偏右
    this.startX = variant === 1 ? (x + 36) : (x - 36);
    this.startY = y;
    this.x = this.startX;
    this.y = y;
    this.age = 0;
    this.maxAge = 250; // 约 4.2 秒史诗级盛典生命周期
    this.alpha = 1.0;

    // 1. 六盏万家祈愿天灯 (立体景深 · 万家灯火温润升腾)
    this.lanterns = [];
    for (let i = 0; i < 6; i++) {
      this.lanterns.push(new SkyLantern(this.startX, y, variant, i));
    }

    // 2. 三枚破空响尾金龙火箭 (左中右三路阶梯梯次破空，射向高空错落位置)
    const rocketColors = (variant === 0)
      ? ['#f43f5e', '#fbbf24', '#f97316'] // 赤金正统华夏红与暖橙金
      : ['#c084fc', '#38bdf8', '#34d399']; // 紫薇帝光、天青玉色与翡翠青

    this.rockets = [
      new SpiralCometRocket(this.startX - 18, y - 8, this.startX - 36, y - 210, variant, rocketColors[0]),
      new SpiralCometRocket(this.startX, y - 18, this.startX, y - 250, variant, rocketColors[1]),
      new SpiralCometRocket(this.startX + 18, y - 12, this.startX + 36, y - 225, variant, rocketColors[2])
    ];

    // 3. 绽放的烟花彩星池 (牡丹彩环 + 垂丝金柳 + 闪光星钻)
    this.sparks = [];

    // 4. 高空闪光照亮夜空环境光衰减
    this.flashAlpha = 0;
    this.flashColor = (variant === 0) ? 'rgba(251, 146, 60, ' : 'rgba(192, 132, 252, ';
  }

  update(screenH, ceilingY, emitParticleCallback) {
    this.age++;

    // 1. 更新万家祈愿天灯
    for (let i = this.lanterns.length - 1; i >= 0; i--) {
      const lt = this.lanterns[i];
      const isAlive = lt.update(ceilingY);
      if (!isAlive) {
        this.lanterns.splice(i, 1);
      }
    }

    // 2. 更新响尾火箭并触发高空重阶绽放
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const rk = this.rockets[i];
      const isAlive = rk.update(emitParticleCallback);
      if (!isAlive) {
        // 高空到达顶点，震撼绽放！
        this._burstFirework(rk.x, rk.y, rk.color, i);
        this.rockets.splice(i, 1);
      }
    }

    // 3. 更新烟花彩星
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      const isAlive = sp.update();
      if (!isAlive) {
        this.sparks.splice(i, 1);
      }
    }

    // 4. 环境光平滑淡出
    if (this.flashAlpha > 0.01) {
      this.flashAlpha *= 0.88;
    }

    // 整体生命周期
    const hasActiveEntities = (this.lanterns.length > 0) || (this.rockets.length > 0) || (this.sparks.length > 0);
    return (this.age < this.maxAge && hasActiveEntities);
  }

  // 高空三阶国风礼花炸裂
  _burstFirework(x, y, themeColor, index) {
    this.flashAlpha = 0.42; // 点亮夜空瞬间

    const isLeft = (index === 0);
    const colorA = themeColor || '#f43f5e';
    const colorB = isLeft ? '#fbbf24' : '#38bdf8';
    const colorWhite = '#ffffff';

    // 1. 【第一阶 · 盛世牡丹光环】(双重同心牡丹花环)
    const peonyCount = 28;
    for (let i = 0; i < peonyCount; i++) {
      const rad = (i / peonyCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.12;
      const spd = 3.2 + Math.random() * 2.2;
      const c = (i % 2 === 0) ? colorA : colorWhite;
      this.sparks.push(new FireworkSpark(
        x, y,
        Math.cos(rad) * spd,
        Math.sin(rad) * spd,
        c,
        false, // 不是垂柳
        false
      ));
    }

    // 内环次级花瓣 (紧致小环)
    for (let i = 0; i < 16; i++) {
      const rad = (i / 16) * Math.PI * 2 + 0.15;
      const spd = 1.8 + Math.random() * 1.2;
      this.sparks.push(new FireworkSpark(
        x, y,
        Math.cos(rad) * spd,
        Math.sin(rad) * spd,
        colorB,
        false,
        false
      ));
    }

    // 2. 【第二阶 · 锦冠千丝垂柳金雨】(Brocade Willow - 随重力如瀑布飘落)
    const willowCount = 20;
    for (let i = 0; i < willowCount; i++) {
      const rad = Math.random() * Math.PI * 2;
      const spd = 1.2 + Math.random() * 2.4;
      this.sparks.push(new FireworkSpark(
        x + Math.cos(rad) * 4,
        y + Math.sin(rad) * 4,
        Math.cos(rad) * spd,
        Math.sin(rad) * spd * 0.6 - 0.4,
        '#fbbf24',
        true, // 是垂柳金丝
        false
      ));
    }

    // 3. 【第三阶 · 迎春霹啪闪爆星钻】(Strobe Flashes)
    const strobeCount = 14;
    for (let i = 0; i < strobeCount; i++) {
      const rad = (i / strobeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const spd = 2.6 + Math.random() * 2.8;
      this.sparks.push(new FireworkSpark(
        x, y,
        Math.cos(rad) * spd,
        Math.sin(rad) * spd,
        '#ffffff',
        false,
        true // 闪爆星钻
      ));
    }
  }

  render(ctx) {
    ctx.save();

    // 0. 高空烟花绽放瞬间全屏柔光照亮夜空 (Ambient Sky Flash)
    if (this.flashAlpha > 0.02) {
      const flashGrad = ctx.createRadialGradient(this.x, this.y - 180, 10, this.x, this.y - 180, 260);
      flashGrad.addColorStop(0, `${this.flashColor}${this.flashAlpha * 0.38})`);
      flashGrad.addColorStop(0.65, `${this.flashColor}${this.flashAlpha * 0.12})`);
      flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(this.x, this.y - 180, 260, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1. 渲染万家祈愿天灯
    for (let i = 0; i < this.lanterns.length; i++) {
      this.lanterns[i].render(ctx);
    }

    // 2. 渲染响尾螺旋火箭
    for (let i = 0; i < this.rockets.length; i++) {
      this.rockets[i].render(ctx);
    }

    // 3. 渲染礼花彩星与锦冠金雨
    for (let i = 0; i < this.sparks.length; i++) {
      this.sparks[i].render(ctx);
    }

    ctx.restore();
  }
}
