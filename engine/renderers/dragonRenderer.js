// engine/renderers/dragonRenderer.js

/**
 * 腾讯游戏部门级 · 飞龙在天 · 曜金祥云真龙 (Celestial Golden Dragon 60FPS 创世典藏版)
 *
 * 核心升级（加长龙身、双龙交织异构路径、天穹高飞与蛇形波动）：
 * 1. 【修长健美金龙加长 (46节高密度骨骼)】：
 *    - 在保持 10.5px 灵动苗条体态的基础上加长身躯至 46 节，身姿更显恢弘威武；
 *    - 尾椎自 23 节起平滑过渡收窄至 2.0px，尾端流光凤羽金扇随风摆动；
 * 2. 【继续扶摇直上天穹 (High Celestial Ascent)】：
 *    - 轨迹终点大幅抬高，且完成大S回旋后继续引吭乘风向上飞升，穿入云霄深处；
 * 3. 【双龙异构交织腾霄 (Twin Intertwining Complementary Paths)】：
 *    - 支持 variant 参数：
 *      - 龙 A（青霄左跃龙）：向左上方腾跃，再向右上方大回旋穿云，飞向左上苍穹；
 *      - 龙 B（紫穹右腾龙）：向右上方腾跃，再向左上方大回旋穿云，飞向右上苍穹；
 *      - 双龙同屏时路径对称交织，波动相位相互错开，形成「双龙戏云 · 龙腾四海」绝美奇观！
 * 4. 【顺次传递的蛇形行进波 (Propagating Wave Dynamics)】：
 *    - wavePhase 随骨节顺延流动，颈项稳健、胸腹行云如水、龙尾大弧度甩尾；
 * 5. 【清透空灵如意祥云与燃烧金鳞雨】。
 */

// 兼容多端与微信小程序的安全椭圆绘制工具，杜绝异常崩溃与矩阵泄露
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

// 1. 绘制单片 3D 燃烧曜金龙鳞粒子
export function drawDragonScaleParticle(ctx, p) {
  const len = p.length || 14.0;
  const w = len * 0.70;
  const a = p.alpha || 0.90;
  const rot = p.rotation || 0;
  const flip = Math.cos(p.flipPhase || 0);
  const absFlip = Math.max(0.18, Math.abs(flip));

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(rot);
  ctx.scale(absFlip, 1.0);

  // 周身金焰微晕
  ctx.beginPath();
  ctx.arc(0, 0, len * 0.70, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(245, 158, 11, ${a * 0.25})`;
  ctx.fill();

  // 盾形金叶鳞片
  ctx.beginPath();
  ctx.moveTo(0, -len * 0.58);
  ctx.quadraticCurveTo(w * 0.82, -len * 0.35, w * 0.68, len * 0.22);
  ctx.quadraticCurveTo(w * 0.35, len * 0.65, 0, len * 0.60);
  ctx.quadraticCurveTo(-w * 0.35, len * 0.65, -w * 0.7, len * 0.22);
  ctx.quadraticCurveTo(-w * 0.82, -len * 0.35, 0, -len * 0.58);
  ctx.closePath();
  ctx.fillStyle = `rgba(234, 88, 12, ${a * 0.85})`;
  ctx.fill();

  // 鳞芯纯金高光
  ctx.beginPath();
  ctx.moveTo(0, -len * 0.42);
  ctx.quadraticCurveTo(w * 0.55, -len * 0.25, w * 0.44, len * 0.15);
  ctx.quadraticCurveTo(w * 0.2, len * 0.46, 0, len * 0.44);
  ctx.quadraticCurveTo(-w * 0.2, len * 0.46, -w * 0.44, len * 0.15);
  ctx.quadraticCurveTo(-w * 0.55, -len * 0.25, 0, -len * 0.42);
  ctx.closePath();
  ctx.fillStyle = `rgba(250, 204, 21, ${a * 0.96})`;
  ctx.fill();

  // 鳞脊白金亮线
  ctx.beginPath();
  ctx.moveTo(0, -len * 0.38);
  ctx.lineTo(0, len * 0.38);
  ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.98})`;
  ctx.lineWidth = 1.1;
  ctx.stroke();

  ctx.restore();
}

export class GoldenDragon {
  constructor(x, y, variant = 0) {
    this.startX = x;
    this.startY = y;
    this.variant = variant; // 0: 左盘龙, 1: 右翔龙 (双龙交织异构路径)

    // 初始位置与三段式三次贝塞尔航迹设计
    if (this.variant === 0) {
      // 龙A (左回旋主龙): 先向左上方腾跃，再向右上方回折，冲入左上苍穹
      this.headX = x - 30;
      this.headY = y;
      this.bezierP0 = { x: this.headX, y: this.headY + 15 };
      this.bezierP1 = { x: this.headX - 70, y: this.headY - 110 };
      this.bezierP2 = { x: this.headX + 48, y: this.headY - 240 };
      this.bezierP3 = { x: this.headX - 25, y: this.headY - 390 };
      this.phaseOffset = 0;
      this.goldHue = 'rgba(245, 158, 11, ';
      this.goldMain = 'rgba(245, 158, 11, ';
      this.goldGlow = 'rgba(251, 191, 36, ';
      this.goldLight = 'rgba(254, 240, 138, ';
    } else {
      // 龙B (右回旋双龙伴飞): 先向右上方腾跃，再向左上方回折，冲入右上苍穹 (交织穿梭！)
      this.headX = x + 24;
      this.headY = y;
      this.bezierP0 = { x: this.headX, y: this.headY + 15 };
      this.bezierP1 = { x: this.headX + 68, y: this.headY - 105 };
      this.bezierP2 = { x: this.headX - 45, y: this.headY - 235 };
      this.bezierP3 = { x: this.headX + 28, y: this.headY - 390 };
      this.phaseOffset = Math.PI * 0.85; // 错开波动相位，双龙灵动互补
      this.goldHue = 'rgba(234, 88, 12, ';
      this.goldMain = 'rgba(234, 88, 12, ';
      this.goldGlow = 'rgba(249, 115, 22, ';
      this.goldLight = 'rgba(253, 224, 71, ';
    }

    this.x = this.headX;
    this.y = this.headY;
    this.climbSpeed = 1.0;

    this.age = 0;
    this.maxAge = 295; // 延长生命周期，留足吐息后扶摇直上苍穹的充足观赏时间
    this.alpha = 0;
    this.scale = 0.94;

    // 吐息与天穹腾飞控制参数
    this.flightProgress = 0.0;
    this.mouthOpen = 0.0; // 0.0: 闭合, 1.0: 霸气大张
    this.isBreathing = false;
    this.breathIntensity = 0.0;
    this.breathStart = this.variant === 0 ? 85 : 90;
    this.breathDuration = 30; // 0.5 秒持续时间 (60 FPS 下正好 30 帧)
    this.breathEnd = this.breathStart + this.breathDuration;

    // 46 节修长骨骼节点 (在修长 10.5px 基础上加长节数，体态更为壮丽)
    this.numNodes = 46;
    this.nodes = [];

    // 精细修长体态设计 (项细、身长、腹挺、尾若凤羽)
    for (let i = 0; i < this.numNodes; i++) {
      let r = 8.5;
      if (i === 0) r = 11.5; // 龙首
      else if (i <= 4) r = 8.5 + i * 0.35; // 龙颈纤巧修长
      else if (i <= 22) r = 10.5; // 胸腹最饱满处 (加长节数，线条流畅)
      else if (i <= 35) r = 10.5 - (i - 22) * 0.45; // 渐细后腰
      else r = Math.max(2.0, 4.6 - (i - 35) * 0.26); // 极细灵动龙尾

      this.nodes.push({
        x: this.headX,
        y: this.headY + i * 7.0,
        angle: -Math.PI / 2,
        radius: r,
        roll: i * 0.28
      });
    }

    // 历史航迹采样池 (扩展至 300 点，满足 46 节骨骼平滑跟随)
    this.historyTrack = [];
    for (let i = 0; i < 300; i++) {
      this.historyTrack.push({
        x: this.headX,
        y: this.headY + i * 3.5,
        angle: -Math.PI / 2
      });
    }

    // 龙吐紫金瑞气光痕
    this.breathBursts = [];

    // 龙鳞脱落与闪烁
    this.scaleShedTimer = 0;

    // 清透如意祥云团
    this.clouds = [
      { rx: this.variant === 0 ? -42 : 42, ry: -25, r: 28, col: 'rgba(254, 240, 138, 0.40)' },
      { rx: this.variant === 0 ? 35 : -35, ry: 45, r: 32, col: 'rgba(251, 146, 60, 0.35)' },
      { rx: -20, ry: 95, r: 36, col: 'rgba(233, 213, 255, 0.35)' }
    ];
  }

  // 采样三次贝塞尔曲线航迹点与切线
  _sampleCubicBezier(t) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    const p0 = this.bezierP0;
    const p1 = this.bezierP1;
    const p2 = this.bezierP2;
    const p3 = this.bezierP3;

    const x = mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x;
    const y = mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y;

    const dx = 3 * mt2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t2 * (p3.x - p2.x);
    const dy = 3 * mt2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t2 * (p3.y - p2.y);
    const angle = Math.atan2(dy, dx);

    return { x, y, angle };
  }

  update(screenH, ceilingY, emitParticleCallback) {
    this.age++;
    const prog = this.age / this.maxAge;

    // =================================================================
    // 1. 五阶段轨迹与张嘴吐息状态机 (飞跃 -> 张嘴聚能 -> 0.5秒宏大吐息 -> 闭嘴 -> 扶摇直上苍穹)
    // =================================================================
    const bStart = this.breathStart;
    const bEnd = this.breathEnd;

    if (this.age < bStart - 10) {
      // 阶段 1：向吐息蓄力点凌空腾跃 (飞跃前 70% 弧线)
      this.flightProgress = Math.min(0.70, (this.age / (bStart - 10)) * 0.70);
      this.mouthOpen = 0.0;
      this.isBreathing = false;
      this.breathIntensity = 0.0;
    } else if (this.age < bStart) {
      // 阶段 2：减速进入昂首悬停蓄能姿态，龙口大开！(mouthOpen: 0 -> 1)
      const openProg = (this.age - (bStart - 10)) / 10;
      this.mouthOpen = Math.min(1.0, Math.max(0.0, openProg));
      this.breathIntensity = this.mouthOpen * 0.35;
      this.isBreathing = false;
      this.flightProgress += 0.0006; // 悬停微漂移
    } else if (this.age < bEnd) {
      // 阶段 3：【核心需求：长大嘴巴，吐息大一点，持续 0.5 秒 (整整 30 帧)】
      this.mouthOpen = 1.0;
      this.isBreathing = true;
      this.breathIntensity = 1.0;
      this.flightProgress += 0.0008; // 悬停昂首蓄能怒啸
    } else if (this.age < bEnd + 10) {
      // 阶段 4：吐息结束，龙吻平滑闭合
      const closeProg = 1.0 - (this.age - bEnd) / 10;
      this.mouthOpen = Math.max(0.0, closeProg);
      this.isBreathing = false;
      this.breathIntensity = this.mouthOpen * 0.35;
      this.flightProgress += 0.005;
    } else {
      // 阶段 5：【核心需求：然后在往上 (昂首破云，扶摇加速直冲天霄！)】
      this.mouthOpen = 0.0;
      this.isBreathing = false;
      this.breathIntensity = 0.0;

      if (this.flightProgress < 1.0) {
        this.flightProgress = Math.min(1.0, this.flightProgress + 0.022);
      }
    }

    // 计算龙首当前位置与朝向切线
    let currentAngle;
    if (this.flightProgress < 1.0) {
      const easeT = this.flightProgress * this.flightProgress * (3 - 2 * this.flightProgress);
      const trackPoint = this._sampleCubicBezier(easeT);
      this.headX = trackPoint.x;
      this.headY = trackPoint.y;
      currentAngle = trackPoint.angle;
    } else {
      // 完成贝塞尔弧线后，引吭加速垂直冲入苍穹深处 (然后在往上)
      this.climbSpeed = Math.min(3.8, this.climbSpeed + 0.048);
      this.headY -= this.climbSpeed;
      this.headX += Math.sin(this.age * 0.045 + this.phaseOffset) * 1.8;
      const vx = Math.cos(this.age * 0.045 + this.phaseOffset) * 1.8;
      const vy = -this.climbSpeed;
      currentAngle = Math.atan2(vy, vx);
    }

    // 记录航迹点
    this.historyTrack.unshift({
      x: this.headX,
      y: this.headY,
      angle: currentAngle
    });
    if (this.historyTrack.length > 300) {
      this.historyTrack.pop();
    }

    // =================================================================
    // 2. 真正的蛇形行进波与摆动物理学 (Snake Wave Propagation)
    // =================================================================
    // 龙首骨节：由航迹切线微幅轻摇引领方向，吐息时叠加威严震颤
    const breathTremor = this.isBreathing ? Math.sin(this.age * 1.6) * 0.035 : 0;
    this.nodes[0].x = this.headX;
    this.nodes[0].y = this.headY;
    this.nodes[0].angle = currentAngle + breathTremor;

    // 龙身 1 ~ 45 节沿航迹回溯取点，并叠加顺次传递的行进波
    for (let i = 1; i < this.numNodes; i++) {
      const cur = this.nodes[i];
      const trackIdx = Math.min(this.historyTrack.length - 1, Math.round(i * 4.2));
      const tp = this.historyTrack[trackIdx];

      if (tp) {
        // 波动相位顺次传递，并在双龙间错位相位
        const wavePhase = this.age * 0.18 - i * 0.32 + this.phaseOffset;
        const normIdx = i / (this.numNodes - 1);
        const amp = (1.5 + normIdx * 11.5) * this.scale;
        const lateralDist = Math.sin(wavePhase) * amp;

        // 法线方向位移 (垂直于航迹切线)
        const perpAngle = tp.angle + Math.PI / 2;
        const targetX = tp.x + Math.cos(perpAngle) * lateralDist;
        const targetY = tp.y + Math.sin(perpAngle) * lateralDist;

        // 柔和弹性平滑跟随
        cur.x += (targetX - cur.x) * 0.45;
        cur.y += (targetY - cur.y) * 0.45;
        cur.angle = tp.angle;
      }

      cur.roll = i * 0.26 + this.age * 0.04;
    }

    // =================================================================
    // 3. 龙吐紫金瑞气光痕
    // =================================================================
    if (this.age >= 45 && this.age <= 210 && this.alpha > 0.3) {
      if (this.age % 22 === 0) {
        const mouthAngle = this.nodes[0].angle;
        this.breathBursts.push({
          x: this.headX + Math.cos(mouthAngle) * 16 * this.scale,
          y: this.headY + Math.sin(mouthAngle) * 16 * this.scale,
          angle: mouthAngle,
          radius: 8 * this.scale,
          maxRadius: 85 * this.scale,
          alpha: this.alpha * 0.85
        });
      }
    }

    for (let i = this.breathBursts.length - 1; i >= 0; i--) {
      const b = this.breathBursts[i];
      b.radius += 2.4 * this.scale;
      b.alpha *= 0.94;
      if (b.radius >= b.maxRadius || b.alpha <= 0.02) {
        this.breathBursts.splice(i, 1);
      }
    }

    // =================================================================
    // 4. 透明度包络控制 (优雅破雾 -> 龙腾九天冲霄 -> 穿云羽化)
    // =================================================================
    let birthFade = 1.0;
    if (this.age < 22) {
      birthFade = Math.sin((this.age / 22) * (Math.PI / 2));
    }

    let lifeFade = 1.0;
    if (prog > 0.75) {
      const fadeProg = Math.max(0, 1 - (prog - 0.75) / 0.25);
      lifeFade = Math.pow(fadeProg, 1.8);
    }

    let ceilingFade = 1.0;
    if (this.headY < ceilingY + 80) {
      ceilingFade = Math.max(0, (this.headY - ceilingY) / 80);
    }

    this.alpha = birthFade * lifeFade * ceilingFade;

    // =================================================================
    // 5. 飘散的 3D 燃烧曜金龙鳞与万丈金雨星尘 + 吐息高速烈焰喷射
    // =================================================================
    if (typeof emitParticleCallback === 'function' && this.alpha > 0.20) {
      // 吐息期间从龙口高频喷发超音速曜金烈焰粒子与破空鳞片
      if (this.isBreathing) {
        const mouthAngle = this.nodes[0].angle;
        const mouthWorldX = this.headX + Math.cos(mouthAngle) * 16 * this.scale;
        const mouthWorldY = this.headY + Math.sin(mouthAngle) * 16 * this.scale;

        for (let k = 0; k < 3; k++) {
          const spreadAngle = mouthAngle + (Math.random() - 0.5) * 0.36;
          const speed = (9.0 + Math.random() * 6.5) * this.scale;
          emitParticleCallback({
            x: mouthWorldX + (Math.random() - 0.5) * 6 * this.scale,
            y: mouthWorldY + (Math.random() - 0.5) * 6 * this.scale,
            vx: Math.cos(spreadAngle) * speed,
            vy: Math.sin(spreadAngle) * speed,
            radius: 1.8 + Math.random() * 2.2,
            alpha: this.alpha * 0.95,
            baseAlpha: 0.95,
            life: 0,
            maxLife: 22 + Math.random() * 14,
            color: Math.random() > 0.35 ? '#ffffff' : '#fef08a',
            isGold: true,
            shimmerPhase: Math.random() * Math.PI * 2,
            shimmerSpeed: 0.35
          });
        }

        if (this.age % 4 === 0) {
          const spreadAngle = mouthAngle + (Math.random() - 0.5) * 0.25;
          const speed = (7.5 + Math.random() * 4.5) * this.scale;
          emitParticleCallback({
            x: mouthWorldX,
            y: mouthWorldY,
            vx: Math.cos(spreadAngle) * speed,
            vy: Math.sin(spreadAngle) * speed,
            length: 13.0 + Math.random() * 5.0,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.08,
            flipPhase: Math.random() * Math.PI * 2,
            alpha: this.alpha * 0.95,
            baseAlpha: 0.95,
            life: 0,
            maxLife: 45 + Math.random() * 20,
            isDragonScale: true
          });
        }
      }

      this.scaleShedTimer++;

      if (this.scaleShedTimer % 8 === 0) {
        const shedIdx = Math.floor(Math.random() * (this.numNodes - 8)) + 3;
        const sn = this.nodes[shedIdx];
        if (sn) {
          emitParticleCallback({
            x: sn.x + (Math.random() - 0.5) * 14 * this.scale,
            y: sn.y + (Math.random() - 0.5) * 12 * this.scale,
            vx: (Math.random() - 0.5) * 0.75,
            vy: 0.6 + Math.random() * 0.7,
            length: 12.0 + Math.random() * 5.0,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.05,
            flipPhase: Math.random() * Math.PI * 2,
            alpha: this.alpha * 0.95,
            baseAlpha: 0.95,
            life: 0,
            maxLife: 130 + Math.random() * 30,
            isDragonScale: true
          });
        }
      }

      if (this.age % 2 === 0) {
        const randomNode = this.nodes[Math.floor(Math.random() * this.numNodes)];
        if (randomNode) {
          emitParticleCallback({
            x: randomNode.x + (Math.random() - 0.5) * 16 * this.scale,
            y: randomNode.y + (Math.random() - 0.5) * 14 * this.scale,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -(0.2 + Math.random() * 0.5),
            radius: 1.1 + Math.random() * 1.5,
            alpha: this.alpha * 0.90,
            baseAlpha: 0.90,
            life: 0,
            maxLife: 48 + Math.random() * 22,
            color: this.variant === 0 ? '#fef08a' : '#fb923c',
            isGold: true,
            shimmerPhase: Math.random() * Math.PI * 2,
            shimmerSpeed: 0.22
          });
        }
      }
    }

    return (this.age < this.maxAge && this.headY > ceilingY - 60 && this.alpha > 0.01);
  }

  render(ctx) {
    if (this.alpha <= 0.01 || !this.nodes.length) return;

    const s = this.scale;
    const a = this.alpha;

    // 1. 【背景清透如意祥云】
    this._renderTranslucentClouds(ctx, s, a);

    // 2. 【龙吐九霄瑞气光痕】
    this._renderBreathBursts(ctx, s, a);

    // 3. 【修长金身外层流光神辉】
    this._renderSlenderDragonAura(ctx, s, a);

    // 4. 【46 节修长健美金龙躯体与白金横腹甲】
    this._renderSlenderDragonBody(ctx, s, a);

    // 5. 【流线型纤细烈焰龙鬃与背脊金鳍】
    this._renderFineDorsalFlames(ctx, s, a);

    // 6. 【苍劲五爪金钩】
    this._renderImperialClaws(ctx, s, a);

    // 7. 【英武修长侧面龙首】
    this._renderNobleSlenderHead(ctx, s, a);
  }

  // 1. 清透如意祥云
  _renderTranslucentClouds(ctx, s, a) {
    ctx.save();
    for (const c of this.clouds) {
      const cx = this.headX + c.rx * s;
      const cy = this.headY + c.ry * s;

      ctx.beginPath();
      ctx.arc(cx, cy, c.r * s, 0, Math.PI * 2);
      ctx.fillStyle = `${c.col.replace(/[\d.]+\)$/, `${a * 0.28})`)}`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx - 3 * s, cy - 2 * s, c.r * 0.65 * s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.35})`;
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. 龙吐瑞气
  _renderBreathBursts(ctx, s, a) {
    if (!this.breathBursts.length) return;
    ctx.save();
    for (const b of this.breathBursts) {
      const bAlpha = b.alpha * a;
      if (bAlpha <= 0.01) continue;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.angle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, b.radius, -0.42, 0.42);
      ctx.closePath();
      ctx.fillStyle = `rgba(254, 240, 138, ${bAlpha * 0.32})`;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, b.radius * 0.6, -0.25, 0.25);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${bAlpha * 0.50})`;
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  // 3. 修长金身外层流光神辉 (神圣曜金霞光)
  _renderSlenderDragonAura(ctx, s, a) {
    if (this.nodes.length < 2) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
    for (let i = 1; i < this.numNodes; i++) {
      ctx.lineTo(this.nodes[i].x, this.nodes[i].y);
    }
    ctx.lineWidth = 26 * s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = `${this.goldGlow}${a * 0.18})`;
    ctx.stroke();

    ctx.lineWidth = 14 * s;
    ctx.strokeStyle = `${this.goldLight}${a * 0.28})`;
    ctx.stroke();
    ctx.restore();
  }

  // 4. 曜金真龙游龙金身与灵动凤羽尾扇 (去除杂乱分段，呈现如丝绢划水般流畅金身)
  _renderSlenderDragonBody(ctx, s, a) {
    if (this.nodes.length < 2) return;
    ctx.save();

    // 1. 底层厚重 24K 曜金主身段 (沿骨骼平滑圆润连贯推进，体态修长健美)
    for (let i = this.numNodes - 1; i >= 1; i--) {
      const p1 = this.nodes[i - 1];
      const p2 = this.nodes[i];
      const avgR = (p1.radius + p2.radius) * 0.5 * s;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = avgR * 1.6;
      ctx.lineCap = 'round';
      ctx.strokeStyle = `${this.goldMain}${a * 0.95})`;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = avgR * 1.15;
      ctx.strokeStyle = `${this.goldGlow}${a * 0.98})`;
      ctx.stroke();
    }

    // 2. 龙腹温润白金横甲纹理 (每隔数节柔和衬映，无杂乱锯齿与蜈蚣腿感)
    for (let i = 3; i < this.numNodes - 5; i += 3) {
      const n = this.nodes[i];
      if (!n) continue;
      const bellyW = n.radius * 0.95 * s;
      const perpAngle = n.angle + Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(n.x - Math.cos(perpAngle) * bellyW * 0.45, n.y - Math.sin(perpAngle) * bellyW * 0.45);
      ctx.lineTo(n.x + Math.cos(perpAngle) * bellyW * 0.45, n.y + Math.sin(perpAngle) * bellyW * 0.45);
      ctx.lineWidth = 1.6 * s;
      ctx.lineCap = 'round';
      ctx.strokeStyle = `${this.goldLight}${a * 0.70})`;
      ctx.stroke();
    }

    // 3. 贯穿背脊的高光白金流光刃 (连贯一气呵成的神龙光脊)
    ctx.beginPath();
    ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
    for (let i = 1; i < this.numNodes; i++) {
      ctx.lineTo(this.nodes[i].x, this.nodes[i].y);
    }
    ctx.lineWidth = 1.8 * s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.95})`;
    ctx.stroke();

    // 4. 灵动龙尾流光凤羽尾扇 (尾尖飘逸大金扇，神龙摆尾)
    const tailTip = this.nodes[this.numNodes - 1];
    const tailPrev = this.nodes[this.numNodes - 2];
    if (tailTip && tailPrev) {
      const tailAngle = Math.atan2(tailTip.y - tailPrev.y, tailTip.x - tailPrev.x);
      ctx.save();
      ctx.translate(tailTip.x, tailTip.y);
      ctx.rotate(tailAngle);

      const plumes = [-0.38, -0.18, 0, 0.18, 0.38];
      for (let pIdx = 0; pIdx < plumes.length; pIdx++) {
        const tf = plumes[pIdx];
        const flutter = Math.sin(this.age * 0.22 + pIdx * 0.8 + this.phaseOffset) * 0.18;
        const pLen = (18 + Math.abs(2 - pIdx) * 6) * s;

        ctx.save();
        ctx.rotate(tf + flutter);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(pLen * 0.5, -3 * s, pLen, 0);
        ctx.quadraticCurveTo(pLen * 0.5, 3 * s, 0, 0);
        ctx.closePath();
        ctx.fillStyle = (pIdx % 2 === 0)
          ? `${this.goldGlow}${a * 0.92})`
          : `${this.goldLight}${a * 0.96})`;
        ctx.fill();
        ctx.lineWidth = 1.0 * s;
        ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.92})`;
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // 5. 飘渺烈焰背鬃 (如丝绢流云般沿背脊自然翻腾，彻底剔除僵硬刺状结构)
  _renderFineDorsalFlames(ctx, s, a) {
    ctx.save();
    // 沿龙颈与背脊关键部位渲染柔和翻腾的烈焰丝带
    const maneNodes = [2, 4, 6, 8, 12, 16, 20, 24];
    for (let idx = 0; idx < maneNodes.length; idx++) {
      const nodeIdx = maneNodes[idx];
      const node = this.nodes[nodeIdx];
      if (!node) continue;

      const wave = Math.sin(this.age * 0.20 + idx * 0.75 + this.phaseOffset) * 4.5 * s;
      const maneLen = (12 + (8 - idx) * 0.8) * s;
      const dorsalAngle = node.angle - Math.PI / 2; // 指向背侧

      ctx.save();
      ctx.translate(node.x, node.y);
      ctx.rotate(dorsalAngle);

      // 飘逸丝滑金焰火舌
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(maneLen * 0.4, -4 * s + wave, maneLen, wave);
      ctx.quadraticCurveTo(maneLen * 0.6, 3 * s + wave * 0.5, 0, 0);
      ctx.closePath();
      ctx.fillStyle = (idx % 2 === 0)
        ? `${this.goldLight}${a * 0.75})`
        : `${this.goldGlow}${a * 0.65})`;
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  // 6. 威严四足五爪金钩 (前双爪与后双爪，各踏祥云，张扬有力)
  _renderImperialClaws(ctx, s, a) {
    const clawConfigs = [
      { nodeIdx: 8, side: -1, isFront: true },  // 前左爪
      { nodeIdx: 12, side: 1, isFront: true },  // 前右爪
      { nodeIdx: 24, side: -1, isFront: false }, // 后左爪
      { nodeIdx: 28, side: 1, isFront: false }  // 后右爪
    ];

    for (const c of clawConfigs) {
      const node = this.nodes[c.nodeIdx];
      if (!node) continue;

      const clawAngle = node.angle + c.side * (c.isFront ? 1.15 : 1.35);
      const armLen = 18 * s;

      ctx.save();
      ctx.translate(node.x, node.y);
      ctx.rotate(clawAngle);

      // 爪底小团腾云
      ctx.beginPath();
      ctx.arc(armLen * 0.8, 0, 7 * s, 0, Math.PI * 2);
      ctx.fillStyle = `${this.goldLight}${a * 0.35})`;
      ctx.fill();

      // 遒劲龙臂上臂
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(armLen * 0.55, -2.5 * s);
      ctx.lineWidth = 3.6 * s;
      ctx.lineCap = 'round';
      ctx.strokeStyle = `${this.goldMain}${a * 0.95})`;
      ctx.stroke();

      // 遒劲龙臂前臂
      ctx.beginPath();
      ctx.moveTo(armLen * 0.55, -2.5 * s);
      ctx.lineTo(armLen, 2 * s);
      ctx.lineWidth = 2.6 * s;
      ctx.lineCap = 'round';
      ctx.strokeStyle = `${this.goldGlow}${a * 0.98})`;
      ctx.stroke();

      // 锐利五爪金钩
      const talons = [-0.55, -0.28, 0, 0.28, 0.55];
      for (const t of talons) {
        ctx.save();
        ctx.translate(armLen, 2 * s);
        ctx.rotate(t);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(4.5 * s, 1.5 * s, 8.0 * s, 4.5 * s);
        ctx.lineWidth = 1.3 * s;
        ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.98})`;
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  // 7. 英武修长侧面龙首与霸气张嘴大招
  _renderNobleSlenderHead(ctx, s, a) {
    const head = this.nodes[0];
    if (!head) return;

    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(head.angle);

    // 下颌下落位移 (长大嘴巴：mouthOpen 0.0 -> 1.0 时下颌向下张开)
    const jawDrop = this.mouthOpen * 14.5 * s;

    // A. 巍峨珊瑚双鹿角
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(-3 * s, side * 6 * s);
      ctx.rotate(side * 0.32);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-8 * s, side * 7 * s, -18 * s, side * 15 * s, -28 * s, side * 22 * s);
      ctx.lineWidth = 3.2 * s;
      ctx.strokeStyle = `${this.goldLight}${a * 0.98})`;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-8 * s, side * 7 * s);
      ctx.quadraticCurveTo(-15 * s, side * 3 * s, -22 * s, side * 6 * s);
      ctx.lineWidth = 2.0 * s;
      ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.98})`;
      ctx.stroke();
      ctx.restore();
    }

    // B. 脑后飘逸飞扬流金龙鬃
    const maneLines = [-12, -7, -2, 3, 8];
    for (let i = 0; i < maneLines.length; i++) {
      const my = maneLines[i] * s;
      const wave = Math.sin(this.age * 0.24 + i + this.phaseOffset) * 3.5 * s;
      ctx.beginPath();
      ctx.moveTo(-6 * s, my);
      ctx.bezierCurveTo(-15 * s, my - 6 * s, -24 * s, my + wave, -32 * s, my - 10 * s + wave);
      ctx.lineWidth = 2.6 * s;
      ctx.strokeStyle = (i % 2 === 0)
        ? `${this.goldGlow}${a * 0.95})`
        : `${this.goldLight}${a * 0.98})`;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // C. 【核心需求：吐息大一点，持续0.5秒】宏大曜金龙息暴风 (在龙嘴张开时喷薄而出)
    if (this.mouthOpen > 0.05 || this.breathIntensity > 0) {
      this._renderMassiveDragonBreath(ctx, s, a, jawDrop);
    }

    // D. 口腔与深喉聚能烈焰 (张嘴时显现赤金烈喉)
    if (this.mouthOpen > 0.04) {
      ctx.beginPath();
      ctx.moveTo(17 * s, -0.5 * s);
      ctx.quadraticCurveTo(6 * s, 1 * s, -4 * s, 2 * s);
      ctx.quadraticCurveTo(5 * s, 1.5 * s + jawDrop * 0.5, 17 * s, 0.5 * s + jawDrop);
      ctx.closePath();
      ctx.fillStyle = `rgba(153, 27, 27, ${a * 0.95})`; // 深赤红口腔底色
      ctx.fill();

      // 咽喉深处凝聚的炽热曜白金耀斑
      const throatFlare = Math.min(1.0, this.mouthOpen * 1.2);
      ctx.beginPath();
      ctx.arc(2 * s, 1.5 * s + jawDrop * 0.4, (4 + throatFlare * 5) * s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${a * throatFlare * 0.98})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(2 * s, 1.5 * s + jawDrop * 0.4, (7 + throatFlare * 7) * s, 0, Math.PI * 2);
      ctx.fillStyle = `${this.goldLight}${a * throatFlare * 0.65})`;
      ctx.fill();
    }

    // E. 尊贵修长龙首上颅与上吻
    ctx.beginPath();
    ctx.moveTo(18 * s, -2 * s); // 上吻尖
    ctx.quadraticCurveTo(12 * s, -10 * s, -6 * s, -9 * s); // 额头
    ctx.quadraticCurveTo(-14 * s, -5 * s, -13 * s, 2 * s); // 枕部
    ctx.lineTo(-4 * s, 2 * s); // 颅底/下颌关节
    ctx.quadraticCurveTo(6 * s, 1 * s, 17 * s, -0.5 * s); // 上颚线
    ctx.closePath();
    ctx.fillStyle = `${this.goldMain}${a * 0.98})`;
    ctx.fill();
    ctx.strokeStyle = `${this.goldLight}${a * 0.96})`;
    ctx.lineWidth = 1.4 * s;
    ctx.stroke();

    // 隆起鼻梁 (使用安全无崩绘制)
    safeDrawEllipse(ctx, 13 * s, -3.5 * s, 5.0 * s, 3.0 * s, 0.15);
    ctx.fillStyle = `${this.goldGlow}${a * 0.98})`;
    ctx.fill();

    // F. 【核心需求：长大嘴巴】刚劲下颌骨 (张合铰链跟随 jawDrop 下落)
    ctx.beginPath();
    ctx.moveTo(-4 * s, 2 * s); // 关节
    ctx.quadraticCurveTo(4 * s, 5 * s + jawDrop * 0.6, 17 * s, 1.5 * s + jawDrop); // 下颌底线
    ctx.lineTo(17 * s, 0.5 * s + jawDrop); // 下唇尖
    ctx.quadraticCurveTo(5 * s, 1.5 * s + jawDrop * 0.5, -4 * s, 2 * s); // 下颚内缘
    ctx.closePath();
    ctx.fillStyle = `${this.goldMain}${a * 0.98})`;
    ctx.fill();
    ctx.strokeStyle = `${this.goldLight}${a * 0.96})`;
    ctx.lineWidth = 1.3 * s;
    ctx.stroke();

    // G. 上下排森然锋利白金龙牙
    // 上排利齿 (向下)
    ctx.beginPath();
    ctx.moveTo(15 * s, 0);
    ctx.lineTo(13.5 * s, 6.2 * s);
    ctx.lineTo(12 * s, 0);
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.98})`;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10.5 * s, 0.5 * s);
    ctx.lineTo(9.5 * s, 4.6 * s);
    ctx.lineTo(8.5 * s, 0.5 * s);
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.95})`;
    ctx.fill();

    // 下排利齿 (向上刺出，跟随下颌张合)
    ctx.beginPath();
    ctx.moveTo(14.5 * s, 1.5 * s + jawDrop);
    ctx.lineTo(13.2 * s, -4.0 * s + jawDrop * 0.7);
    ctx.lineTo(12.0 * s, 1.5 * s + jawDrop);
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.98})`;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10.0 * s, 2.0 * s + jawDrop);
    ctx.lineTo(9.0 * s, -2.2 * s + jawDrop * 0.7);
    ctx.lineTo(8.0 * s, 2.0 * s + jawDrop);
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.95})`;
    ctx.fill();

    // H. 龙目日曜金辉 (安全椭圆绘制)
    safeDrawEllipse(ctx, 2 * s, -4 * s, 4.4 * s, 2.8 * s, -0.15);
    ctx.fillStyle = `rgba(220, 38, 38, ${a * 0.92})`;
    ctx.fill();

    safeDrawEllipse(ctx, 2 * s, -4 * s, 3.2 * s, 2.0 * s, -0.15);
    ctx.fillStyle = `${this.goldLight}${a * 0.98})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(2.5 * s, -4.5 * s, 1.0 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // I. 迎风猎猎飞扬的两道长龙须与下颌金髯 (金髯跟随下颌张合)
    const wave1 = Math.sin(this.age * 0.22 + this.phaseOffset) * 6 * s;
    const wave2 = Math.cos(this.age * 0.20 + this.phaseOffset) * 5 * s;

    ctx.beginPath();
    ctx.moveTo(13 * s, -2 * s);
    ctx.bezierCurveTo(24 * s, -12 * s, 14 * s, -24 * s + wave1, 34 * s + wave1, -32 * s);
    ctx.lineWidth = 1.8 * s;
    ctx.strokeStyle = `${this.goldLight}${a * 0.98})`;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(11 * s, 2 * s);
    ctx.bezierCurveTo(20 * s, 12 * s, 10 * s, 22 * s + wave2, 30 * s + wave2, 30 * s);
    ctx.lineWidth = 1.5 * s;
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.95})`;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(5 * s, 6 * s + jawDrop * 0.7);
    ctx.bezierCurveTo(2 * s, 14 * s + jawDrop, -3 * s, 18 * s + jawDrop, -6 * s + wave1 * 0.4, 24 * s + jawDrop);
    ctx.lineWidth = 1.6 * s;
    ctx.strokeStyle = `${this.goldGlow}${a * 0.95})`;
    ctx.stroke();

    ctx.restore();
  }

  // 8. 【核心需求：吐息大一点，持续0.5秒】宏大曜金龙息暴风 (100% 崩溃防护与震撼等离子光柱)
  _renderMassiveDragonBreath(ctx, s, a, jawDrop) {
    const bInt = this.breathIntensity;
    if (bInt <= 0.02) return;

    const startX = 14 * s;
    const startY = 1.5 * s + jawDrop * 0.45;

    // 宏大吐息尺度：长度 195 ~ 235px，外围扩散宽度 92 ~ 118px
    const breathLen = (195 + Math.sin(this.age * 0.7) * 22) * s * bInt;
    const spreadW = (92 + Math.sin(this.age * 0.9) * 14) * s * bInt;

    ctx.save();

    // 1. 外层翻滚日冕龙焰气浪 (Outer Solar Flare Plume)
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      startX + breathLen * 0.42,
      startY - spreadW * 0.38 + Math.sin(this.age * 0.8) * 9 * s,
      startX + breathLen,
      startY - spreadW * 0.50
    );
    // 龙焰前锋舌状卷曲
    ctx.quadraticCurveTo(
      startX + breathLen + 22 * s,
      startY + Math.sin(this.age * 1.1) * 6 * s,
      startX + breathLen,
      startY + spreadW * 0.50
    );
    ctx.quadraticCurveTo(
      startX + breathLen * 0.42,
      startY + spreadW * 0.38 + Math.cos(this.age * 0.8) * 9 * s,
      startX,
      startY
    );
    ctx.closePath();
    ctx.fillStyle = `rgba(234, 88, 12, ${a * bInt * 0.45})`;
    ctx.fill();

    // 2. 中层纯正曜金烈焰狂涛 (Mid 24K Gold Flame Torrent)
    ctx.beginPath();
    ctx.moveTo(startX + 2 * s, startY);
    ctx.quadraticCurveTo(
      startX + breathLen * 0.45,
      startY - spreadW * 0.25 + Math.cos(this.age * 0.9) * 6 * s,
      startX + breathLen * 0.88,
      startY - spreadW * 0.32
    );
    ctx.quadraticCurveTo(
      startX + breathLen * 0.95,
      startY,
      startX + breathLen * 0.88,
      startY + spreadW * 0.32
    );
    ctx.quadraticCurveTo(
      startX + breathLen * 0.45,
      startY + spreadW * 0.25 + Math.sin(this.age * 0.9) * 6 * s,
      startX + 2 * s,
      startY
    );
    ctx.closePath();
    ctx.fillStyle = `${this.goldGlow}${a * bInt * 0.72})`;
    ctx.fill();

    // 3. 内核耀世白金等离子烈光柱 (Hyper-bright White-Hot Plasma Core Beam)
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + breathLen * 0.82, startY);
    ctx.lineWidth = (13 + Math.sin(this.age * 1.3) * 3.5) * s * bInt;
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * bInt * 0.96})`;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 极细白金色贯穿主轴
    ctx.beginPath();
    ctx.moveTo(startX - 2 * s, startY);
    ctx.lineTo(startX + breathLen * 0.92, startY);
    ctx.lineWidth = 5 * s * bInt;
    ctx.strokeStyle = `${this.goldLight}${a * bInt * 0.98})`;
    ctx.stroke();

    // 4. 音爆激波震环 / 烈焰马赫环 (Mach Shockwave Rings - 100% 安全缩放绘制，彻底避免 native 异常)
    const ringRatios = [0.24, 0.48, 0.72];
    for (let i = 0; i < ringRatios.length; i++) {
      const rRatio = ringRatios[i];
      const ringX = startX + breathLen * rRatio;
      const ringH = (18 + rRatio * 42) * s * bInt;
      const ringPulse = Math.sin(this.age * 1.4 + i * 2.0) * 3 * s;
      const safeRy = Math.max(1, (ringH + ringPulse) * 0.5);

      safeDrawEllipse(ctx, ringX, startY, 4.5 * s, safeRy);
      ctx.lineWidth = 2.2 * s;
      ctx.strokeStyle = `rgba(255, 255, 255, ${a * bInt * 0.92})`;
      ctx.stroke();

      safeDrawEllipse(ctx, ringX, startY, 7.5 * s, safeRy * 1.5);
      ctx.lineWidth = 1.2 * s;
      ctx.strokeStyle = `${this.goldGlow}${a * bInt * 0.65})`;
      ctx.stroke();
    }

    // 5. 龙吻烈火爆轰光晕 (Muzzle Blast Corona)
    const blastPulse = Math.sin(this.age * 1.5) * 5 * s;
    ctx.beginPath();
    ctx.arc(startX, startY, (24 * s + blastPulse) * bInt, 0, Math.PI * 2);
    ctx.fillStyle = `${this.goldLight}${a * bInt * 0.65})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(startX, startY, (12 * s + blastPulse * 0.5) * bInt, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${a * bInt * 0.98})`;
    ctx.fill();

    ctx.restore();
  }
}
