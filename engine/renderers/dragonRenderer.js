// engine/renderers/dragonRenderer.js

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 腾讯游戏主美 / 体验设计总监 / 物理动力学架构师 典藏级重构
 * 【天道真龙 · 烟魄凝神】(The Ethereal Ink-Gold Celestial Dragon)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 核心升级 (32 节黄金紧凑修长比例 + 终极平滑动力学 + 3D 浮雕曜金龙鳞矩阵)：
 * 1. 【黄金紧凑身形比例 · 告别拖沓冗长】：
 *    - 骨节精简为 32 节，历史采样收紧至 i * 2.5，全身体长缩短 35% (约 260px)；
 *    - 首尾呼应紧凑，盘旋时与混沌龙珠形成黄金焦点聚合，矫健神气、蓄势待发！
 * 2. 【四足黄金对称分布】：
 *    - 前双爪紧扣节点 6、9，后双爪稳踏节点 17、20，踏八卦祥云轮，张弛有力。
 * 3. 【消灭抖动与下沉 · 严格单调连续动力学】：
 *    - 严格单调递增航迹接缝 (flightT: 0.78 -> 1.00 无缝衔接)，物理防沉锁锁定 headY 只能向上；
 *    - 终幕流线型气动阻尼衰减，蛇形波自然收紧为流线型破空金芒。
 * 4. 【叠合式 3D 浮雕曜金龙鳞矩阵】：
 *    - 紧致覆盖颈胸腰腹，随游动呈现各向异性流光反光，波光粼粼、气度威严。
 * ═══════════════════════════════════════════════════════════════════════════
 */

// 微信小程序原生 Canvas 安全绘制工具 (防止 native 矩阵溢出与参数异常)
export function safeDrawEllipse(ctx, x, y, rx, ry, rot = 0) {
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

// 单片 3D 燃烧曜金龙鳞粒子绘制 (提供外部粒子系统使用)
export function drawDragonScaleParticle(ctx, p) {
  const len = p.length || 14.0;
  const w = len * 0.70;
  const a = p.alpha || 0.90;
  const rot = p.rotation || 0;
  const flip = Math.cos(p.flipPhase || 0);
  const absFlip = Math.max(0.12, Math.abs(flip));

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(rot);
  ctx.scale(absFlip, 1.0);

  // 1. 周身金焰微晕
  ctx.beginPath();
  ctx.arc(0, 0, len * 0.75, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(245, 158, 11, ${a * 0.20})`;
  ctx.fill();

  // 2. 玄金外甲
  ctx.beginPath();
  ctx.moveTo(0, -len * 0.6);
  ctx.quadraticCurveTo(w * 0.82, -len * 0.3, w * 0.65, len * 0.25);
  ctx.quadraticCurveTo(w * 0.3, len * 0.65, 0, len * 0.6);
  ctx.quadraticCurveTo(-w * 0.3, len * 0.65, -w * 0.65, len * 0.25);
  ctx.quadraticCurveTo(-w * 0.82, -len * 0.3, 0, -len * 0.6);
  ctx.closePath();
  ctx.fillStyle = `rgba(217, 119, 6, ${a * 0.88})`;
  ctx.fill();

  // 3. 鳞芯纯金高光
  ctx.beginPath();
  ctx.moveTo(0, -len * 0.45);
  ctx.quadraticCurveTo(w * 0.48, -len * 0.2, w * 0.38, len * 0.18);
  ctx.quadraticCurveTo(w * 0.18, len * 0.48, 0, len * 0.45);
  ctx.quadraticCurveTo(-w * 0.18, len * 0.48, -w * 0.38, len * 0.18);
  ctx.quadraticCurveTo(-w * 0.48, -len * 0.2, 0, -len * 0.45);
  ctx.closePath();
  ctx.fillStyle = `rgba(253, 224, 71, ${a * 0.98})`;
  ctx.fill();

  // 4. 纯白炽脊刃
  ctx.beginPath();
  ctx.moveTo(0, -len * 0.4);
  ctx.lineTo(0, len * 0.4);
  ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.98})`;
  ctx.lineWidth = 1.1;
  ctx.stroke();

  ctx.restore();
}

/**
 * 混沌龙珠实体 (Cosmic Chaos Pearl)
 */
class ChaosPearl {
  constructor(x, y, variant = 0) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.variant = variant;
    this.radius = 9.2;
    this.orbitAngle = variant === 0 ? 0 : Math.PI;
    this.orbitSpeed = variant === 0 ? 0.048 : -0.045;
    this.pulsePhase = 0;
    this.accretionAngle = 0;
    this.alpha = 0;
  }

  update(headX, headY, headAngle, scale, parentAlpha) {
    this.pulsePhase += 0.09;
    this.accretionAngle += 0.045;
    this.orbitAngle += this.orbitSpeed;

    const forwardDist = 44.0 * scale;
    const perpOffset = Math.sin(this.orbitAngle) * 18.0 * scale;
    const normAngle = headAngle + Math.PI / 2;

    this.targetX = headX + Math.cos(headAngle) * forwardDist + Math.cos(normAngle) * perpOffset;
    this.targetY = headY + Math.sin(headAngle) * forwardDist + Math.sin(normAngle) * perpOffset;

    this.x += (this.targetX - this.x) * 0.24;
    this.y += (this.targetY - this.y) * 0.24;
    this.alpha = Math.min(1.0, parentAlpha * 1.15);
  }

  render(ctx, scale) {
    if (this.alpha <= 0.01) return;
    const s = scale;
    const a = this.alpha;
    const pulse = (1.0 + Math.sin(this.pulsePhase) * 0.14) * s;
    const r = this.radius * pulse;

    ctx.save();
    ctx.translate(this.x, this.y);

    const coronaGrad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 3.8);
    coronaGrad.addColorStop(0, `rgba(255, 255, 255, ${a * 0.98})`);
    coronaGrad.addColorStop(0.22, `rgba(254, 240, 138, ${a * 0.85})`);
    coronaGrad.addColorStop(0.55, `rgba(245, 158, 11, ${a * 0.40})`);
    coronaGrad.addColorStop(0.85, `rgba(168, 85, 247, ${a * 0.18})`);
    coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(0, 0, r * 3.8, 0, Math.PI * 2);
    ctx.fillStyle = coronaGrad;
    ctx.fill();

    ctx.save();
    ctx.rotate(this.accretionAngle);
    safeDrawEllipse(ctx, 0, 0, r * 2.4, r * 0.78, 0.4);
    ctx.lineWidth = 1.5 * s;
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.92})`;
    ctx.stroke();

    safeDrawEllipse(ctx, 0, 0, r * 2.1, r * 0.68, -0.4);
    ctx.lineWidth = 1.0 * s;
    ctx.strokeStyle = `rgba(251, 191, 36, ${a * 0.75})`;
    ctx.stroke();

    for (const ang of [0, Math.PI]) {
      const px = Math.cos(ang) * r * 2.3;
      const py = Math.sin(ang) * r * 0.78;
      ctx.beginPath();
      ctx.arc(px, py, 1.8 * s, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    ctx.restore();

    const coreGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, '#fef08a');
    coreGrad.addColorStop(0.8, '#f59e0b');
    coreGrad.addColorStop(1, '#b45309');

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-r * 0.38, -r * 0.38, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.fill();

    ctx.restore();
  }
}

/**
 * 东方游丝龙须动力学光带
 */
class DragonWhiskerField {
  constructor(side = 1) {
    this.side = side;
    this.numSegs = 7;
    this.points = [];
    for (let i = 0; i < this.numSegs; i++) {
      this.points.push({ x: 0, y: 0, vx: 0, vy: 0 });
    }
  }

  update(rootX, rootY, rootAngle, scale, age, phaseOffset, waveDamping = 1.0) {
    this.points[0].x = rootX;
    this.points[0].y = rootY;
    const segLen = 8.0 * scale;

    for (let i = 1; i < this.numSegs; i++) {
      const prev = this.points[i - 1];
      const cur = this.points[i];

      const wave = Math.sin(age * 0.22 - i * 0.55 + phaseOffset + this.side) * 2.4 * scale * waveDamping;
      const spreadAngle = rootAngle + this.side * (0.32 + i * 0.08) + wave * 0.16;

      const tx = prev.x + Math.cos(spreadAngle) * segLen;
      const ty = prev.y + Math.sin(spreadAngle) * segLen;

      cur.x += (tx - cur.x) * 0.42;
      cur.y += (ty - cur.y) * 0.42;
    }
  }

  render(ctx, scale, alpha, goldLight) {
    if (alpha <= 0.01) return;
    const s = scale;
    const a = alpha;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);

    for (let i = 1; i < this.numSegs; i++) {
      const prev = this.points[i - 1];
      const cur = this.points[i];
      const midX = (prev.x + cur.x) * 0.5;
      const midY = (prev.y + cur.y) * 0.5;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }

    ctx.lineWidth = (this.side === 1 ? 1.6 : 1.3) * s;
    ctx.lineCap = 'round';
    ctx.strokeStyle = `${goldLight}${a * 0.95})`;
    ctx.stroke();

    const tip = this.points[this.numSegs - 1];
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 1.6 * s, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.98})`;
    ctx.fill();

    ctx.restore();
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 【天道真龙 · 烟魄凝神】核心渲染引擎 (GoldenDragon)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export class GoldenDragon {
  constructor(startX, startY, variant = 0) {
    this.startX = startX;
    this.startY = startY;
    this.variant = variant;

    this.headX = startX + (variant === 0 ? -24 : 24);
    this.headY = startY;
    this.prevHeadY = undefined;
    this.lastHeadAngle = -Math.PI / 2;
    this.age = 0;
    this.maxAge = 310;
    this.scale = 0.95;
    this.alpha = 0;

    if (variant === 0) {
      this.phaseOffset = 0;
      this.goldMain = 'rgba(245, 158, 11, ';  // 24K 曜金
      this.goldDark = 'rgba(180, 83, 9, ';    // 深金暗部修容
      this.goldGlow = 'rgba(251, 191, 36, ';  // 帝王明黄
      this.goldLight = 'rgba(254, 240, 138, '; // 白炽日光金
      this.mistColor = 'rgba(168, 85, 247, '; // 紫霄仙霞
    } else {
      this.phaseOffset = Math.PI * 0.88;
      this.goldMain = 'rgba(234, 88, 12, ';   // 赤焰龙金
      this.goldDark = 'rgba(154, 52, 18, ';   // 暗红金修容
      this.goldGlow = 'rgba(249, 115, 22, ';  // 琉璃曜橙
      this.goldLight = 'rgba(253, 224, 71, '; // 纯阳曦金
      this.mistColor = 'rgba(56, 189, 248, '; // 青霜仙霞
    }

    this.stage = 1;
    this.mouthOpen = 0.0;
    this.breathIntensity = 0.0;
    this.eyeGlow = 0.0;
    this.dissolutionProg = 0.0;
    this.waveDamping = 1.0;

    this.flightT = 0.0;
    this.extraClimbY = 0.0;
    this.climbSpeed = 1.2;

    this.pearl = new ChaosPearl(this.headX, this.headY - 36, variant);

    this.whiskers = [
      new DragonWhiskerField(-1),
      new DragonWhiskerField(1),
      new DragonWhiskerField(-1.3),
      new DragonWhiskerField(1.3)
    ];

    // =========================================================================
    // 【32 节黄金紧凑修长比例】：精干矫健、首尾呼应、绝不拖沓冗长
    // =========================================================================
    this.numNodes = 32;
    this.nodes = [];

    for (let i = 0; i < this.numNodes; i++) {
      let r = 5.2;
      if (i === 0) r = 9.5; // 龙首干练威严
      else if (i <= 4) r = 5.2 + i * 0.45; // 龙颈修长秀逸 (5.2 ~ 7.0)
      else if (i <= 14) r = 7.5; // 胸腹饱满处紧绷健硕 (全直径 15px)
      else if (i <= 23) r = 7.5 - (i - 14) * 0.42; // 渐细后腰 (7.5 -> 3.7)
      else r = Math.max(1.5, 3.7 - (i - 23) * 0.25); // 极细灵动龙尾尖 (3.7 -> 1.7)

      this.nodes.push({
        x: this.headX,
        y: this.headY + i * 5.2,
        angle: -Math.PI / 2,
        radius: r,
        visualRadius: r * this.scale,
        depthZ: 0,
        roll: i * 0.28,
        leftPoint: { x: this.headX, y: this.headY },
        rightPoint: { x: this.headX, y: this.headY }
      });
    }

    this.historyTrack = [];
    for (let i = 0; i < 260; i++) {
      this.historyTrack.push({
        x: this.headX,
        y: this.headY + i * 3.5,
        angle: -Math.PI / 2
      });
    }
  }

  // C² 全程平滑无拐点空间航迹
  _calculateSpaceFlight(t, extraClimbY = 0) {
    const clampedT = Math.min(1.0, t);
    const lateralDamp = Math.max(0.12, 1.0 - clampedT * 0.45);
    const ampX = (this.variant === 0 ? -100 : 100) * this.scale * lateralDamp;

    const x = this.startX + Math.sin(clampedT * Math.PI * 1.5) * ampX;
    const baseY = this.startY - Math.pow(clampedT, 0.88) * 430 * this.scale;
    const y = baseY - extraClimbY;

    const dt = 0.008;
    const nextClampedT = Math.min(1.0, t + dt);
    const nextX = this.startX + Math.sin(nextClampedT * Math.PI * 1.5) * ampX;
    const nextBaseY = this.startY - Math.pow(nextClampedT, 0.88) * 430 * this.scale;
    const nextY = nextBaseY - (extraClimbY + (this.stage === 4 ? this.climbSpeed * 0.8 : 0));
    const angle = Math.atan2(nextY - y, nextX - x);

    return { x, y, angle };
  }

  update(screenH, ceilingY, emitParticleCallback) {
    this.age++;
    const prog = this.age / this.maxAge;

    // 1. 四幕式叙事节奏与严格单调连续航迹解算
    if (this.age < 35) {
      this.stage = 1;
      this.eyeGlow = Math.min(1.0, this.age / 25);
      this.flightT = (this.age / 35) * 0.12;
      this.mouthOpen = 0.0;
      this.breathIntensity = 0.0;
      this.waveDamping = 1.0;
    } else if (this.age < 115) {
      this.stage = 2;
      this.eyeGlow = 1.0;
      const stageProg = (this.age - 35) / 80;
      this.flightT = 0.12 + stageProg * 0.58;
      this.mouthOpen = 0.0;
      this.breathIntensity = 0.0;
      this.waveDamping = 1.0;
    } else if (this.age < 165) {
      this.stage = 3;
      const breathProg = (this.age - 115) / 50;
      this.mouthOpen = Math.sin(breathProg * Math.PI);
      this.breathIntensity = this.mouthOpen;
      this.flightT = 0.70 + breathProg * 0.08;
      this.waveDamping = 1.0;
    } else {
      this.stage = 4;
      this.mouthOpen = 0.0;
      this.breathIntensity = 0.0;
      const stageProg = (this.age - 165) / (this.maxAge - 165);
      this.dissolutionProg = stageProg;
      this.flightT = Math.min(1.0, 0.78 + stageProg * 0.22);

      this.climbSpeed = Math.min(4.8, this.climbSpeed + 0.035);
      this.extraClimbY += this.climbSpeed;

      this.waveDamping = Math.max(0.05, Math.pow(1.0 - stageProg, 1.8));
    }

    // 2. 空间位置与物理单调上升保护锁
    const flightPos = this._calculateSpaceFlight(this.flightT, this.extraClimbY);
    this.headX = flightPos.x;

    if (this.prevHeadY !== undefined && this.age > 1) {
      this.headY = Math.min(this.prevHeadY, flightPos.y);
    } else {
      this.headY = flightPos.y;
    }
    this.prevHeadY = this.headY;

    let targetAngle = flightPos.angle;
    if (this.stage === 4) {
      const upProg = Math.min(1.0, this.dissolutionProg * 2.0);
      const verticalUp = -Math.PI / 2;
      targetAngle = targetAngle * (1.0 - upProg * 0.6) + verticalUp * (upProg * 0.6);
    }
    const currentAngle = targetAngle;
    this.lastHeadAngle = currentAngle;

    this.historyTrack.unshift({ x: this.headX, y: this.headY, angle: currentAngle });
    if (this.historyTrack.length > 260) this.historyTrack.pop();

    this.pearl.update(this.headX, this.headY, currentAngle, this.scale, this.alpha);

    // =========================================================================
    // 3. 32 节 Verlet 骨骼动力学 (采样紧凑 i * 2.5)
    // =========================================================================
    const breathTremor = this.stage === 3 ? Math.sin(this.age * 1.8) * 0.045 : 0;
    this.nodes[0].x = this.headX;
    this.nodes[0].y = this.headY;
    this.nodes[0].angle = currentAngle + breathTremor;
    this.nodes[0].visualRadius = this.nodes[0].radius * this.scale;

    for (let i = 1; i < this.numNodes; i++) {
      const cur = this.nodes[i];
      // 紧凑航迹采样：i * 2.5 (取代旧版膨胀的 i * 3.8)
      const trackIdx = Math.min(this.historyTrack.length - 1, Math.round(i * 2.5));
      const tp = this.historyTrack[trackIdx];
      if (tp) {
        const wavePhase = this.age * 0.22 - i * 0.35 + this.phaseOffset;
        const amp = (1.2 + (i / this.numNodes) * 8.5) * this.scale * this.waveDamping;
        const lateralDist = Math.sin(wavePhase) * amp;

        const perpAngle = tp.angle + Math.PI / 2;
        const tx = tp.x + Math.cos(perpAngle) * lateralDist;
        const ty = tp.y + Math.sin(perpAngle) * lateralDist;

        cur.x += (tx - cur.x) * 0.48;
        cur.y += (ty - cur.y) * 0.48;
      }
      cur.visualRadius = cur.radius * this.scale;
      cur.roll = i * 0.28 + this.age * 0.05;
    }

    // 4. 严格正交法线 + 尾端跨节点低通滤波
    const nLen = this.numNodes;
    for (let i = 0; i < nLen; i++) {
      const cur = this.nodes[i];
      let segAngle;
      if (i === 0) {
        const next = this.nodes[1];
        segAngle = Math.atan2(cur.y - next.y, cur.x - next.x);
      } else if (i >= nLen - 4) {
        const anchor = this.nodes[nLen - 5] || this.nodes[i - 1];
        segAngle = Math.atan2(anchor.y - cur.y, anchor.x - cur.x);
      } else {
        const prev = this.nodes[i - 1];
        const next = this.nodes[i + 1];
        segAngle = Math.atan2(prev.y - next.y, prev.x - next.x);
      }
      cur.angle = segAngle;

      const normAngle = segAngle + Math.PI / 2;
      const halfW = cur.visualRadius;
      cur.leftPoint = {
        x: cur.x + Math.cos(normAngle) * halfW,
        y: cur.y + Math.sin(normAngle) * halfW
      };
      cur.rightPoint = {
        x: cur.x - Math.cos(normAngle) * halfW,
        y: cur.y - Math.sin(normAngle) * halfW
      };
    }

    for (const w of this.whiskers) {
      w.update(this.headX, this.headY, currentAngle, this.scale, this.age, this.phaseOffset, this.waveDamping);
    }

    let birthFade = 1.0;
    if (this.age < 25) {
      birthFade = Math.sin((this.age / 25) * (Math.PI / 2));
    }
    let deathFade = 1.0;
    if (prog > 0.78) {
      deathFade = Math.max(0, 1.0 - (prog - 0.78) / 0.22);
    }
    let ceilingFade = 1.0;
    if (this.headY < ceilingY + 80) {
      ceilingFade = Math.max(0, (this.headY - ceilingY) / 80);
    }

    this.alpha = birthFade * deathFade * ceilingFade;

    // 粒子联动
    if (typeof emitParticleCallback === 'function' && this.alpha > 0.2) {
      if (this.stage === 3 && this.mouthOpen > 0.15) {
        const mouthAngle = this.nodes[0].angle;
        const mouthX = this.headX + Math.cos(mouthAngle) * 18 * this.scale;
        const mouthY = this.headY + Math.sin(mouthAngle) * 18 * this.scale;

        for (let k = 0; k < 3; k++) {
          const spAngle = mouthAngle + (Math.random() - 0.5) * 0.40;
          const spSpeed = (8.5 + Math.random() * 6.5) * this.scale;
          emitParticleCallback({
            x: mouthX + (Math.random() - 0.5) * 6 * this.scale,
            y: mouthY + (Math.random() - 0.5) * 6 * this.scale,
            vx: Math.cos(spAngle) * spSpeed,
            vy: Math.sin(spAngle) * spSpeed,
            radius: 2.0 + Math.random() * 2.2,
            alpha: this.alpha * 0.98,
            baseAlpha: 0.98,
            life: 0,
            maxLife: 26 + Math.random() * 14,
            color: Math.random() > 0.35 ? '#ffffff' : '#fef08a',
            isGold: true,
            shimmerPhase: Math.random() * Math.PI * 2,
            shimmerSpeed: 0.4
          });
        }
      }

      if (this.age % 6 === 0) {
        const shedIdx = Math.floor(Math.random() * (this.numNodes - 6)) + 3;
        const sn = this.nodes[shedIdx];
        if (sn) {
          emitParticleCallback({
            x: sn.x + (Math.random() - 0.5) * 12 * this.scale,
            y: sn.y + (Math.random() - 0.5) * 10 * this.scale,
            vx: (Math.random() - 0.5) * 0.7,
            vy: 0.7 + Math.random() * 0.7,
            length: 12.0 + Math.random() * 5.0,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.06,
            flipPhase: Math.random() * Math.PI * 2,
            alpha: this.alpha * 0.95,
            baseAlpha: 0.95,
            life: 0,
            maxLife: 130 + Math.random() * 30,
            isDragonScale: true
          });
        }
      }

      // 腾讯总监设计级：飞升羽化消散阶段（prog > 0.75），龙身化作轻盈金青流烟弥散长空，形散神凝
      if (prog > 0.75 && this.age % 2 === 0) {
        const randNodeIdx = Math.floor(Math.random() * this.nodes.length);
        const rn = this.nodes[randNodeIdx];
        if (rn) {
          emitParticleCallback({
            x: rn.x + (Math.random() - 0.5) * 14 * this.scale,
            y: rn.y + (Math.random() - 0.5) * 14 * this.scale,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -0.4 - Math.random() * 0.6,
            radius: 4.5 + Math.random() * 5.5,
            alpha: this.alpha * 0.7,
            baseAlpha: 0.7,
            life: 0,
            maxLife: 60 + Math.random() * 25,
            color: Math.random() > 0.5 ? 'rgba(254, 240, 138, ' : 'rgba(217, 119, 6, ',
            growRate: 0.2,
            isVolumetricSmoke: true
          });
        }
      }
    }

    return this.age < this.maxAge && this.alpha > 0.01;
  }

  render(ctx) {
    if (this.alpha <= 0.01) return;
    const s = this.scale;
    const a = this.alpha;

    this._renderGenesisVortex(ctx, s, a);
    this._renderCinematicVignette(ctx, s, a);
    this.pearl.render(ctx, s);
    this._renderSmogVeil(ctx, s, a);
    this._renderContinuousImperialBody(ctx, s, a);
    this._renderEmbossedDragonScales(ctx, s, a);
    this._renderSolarSpinalPulse(ctx, s, a);
    this._renderPhoenixTail(ctx, s, a);
    this._renderImperialTalons(ctx, s, a);
    this._renderImperialVisage(ctx, s, a);

    for (const w of this.whiskers) {
      w.render(ctx, s, a, this.goldLight);
    }

    this._renderCosmicStarBreath(ctx, s, a);
  }

  _renderGenesisVortex(ctx, s, a) {
    if (this.age > 45) return;
    const portal = this.historyTrack[this.historyTrack.length - 1] || { x: this.headX, y: this.headY };
    let vortexAlpha = this.age < 15 ? this.age / 15 : Math.max(0, 1.0 - (this.age - 15) / 30);
    const finalA = a * vortexAlpha;
    if (finalA <= 0.01) return;

    ctx.save();
    ctx.translate(portal.x, portal.y);
    const spin = this.age * 0.05;
    ctx.rotate(spin);

    const grad = ctx.createRadialGradient(0, 0, 4 * s, 0, 0, 42 * s);
    grad.addColorStop(0, `${this.goldLight}${finalA * 0.75})`);
    grad.addColorStop(0.4, `${this.goldGlow}${finalA * 0.35})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(0, 0, 42 * s, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    safeDrawEllipse(ctx, 0, 0, 32 * s, 12 * s, spin);
    ctx.lineWidth = 1.2 * s;
    ctx.strokeStyle = `rgba(255, 255, 255, ${finalA * 0.90})`;
    ctx.stroke();

    ctx.restore();
  }

  _renderCinematicVignette(ctx, s, a) {
    if (this.breathIntensity <= 0.05) return;
    const head = this.nodes[0];
    if (!head) return;

    ctx.save();
    const vRadius = 240 * s;
    const vigGrad = ctx.createRadialGradient(head.x, head.y, 35 * s, head.x, head.y, vRadius);
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(0.6, 'rgba(15, 23, 42, 0)');
    vigGrad.addColorStop(1, `rgba(10, 14, 26, ${a * this.breathIntensity * 0.40})`);

    ctx.beginPath();
    ctx.arc(head.x, head.y, vRadius, 0, Math.PI * 2);
    ctx.fillStyle = vigGrad;
    ctx.fill();
    ctx.restore();
  }

  _renderSmogVeil(ctx, s, a) {
    if (this.nodes.length < 3) return;
    ctx.save();

    for (let i = 2; i < this.numNodes - 3; i += 2) {
      const n = this.nodes[i];
      if (!n) continue;
      const r = n.visualRadius * 1.9;

      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `${this.mistColor}${a * 0.08})`;
      ctx.fill();
    }

    ctx.restore();
  }

  _renderContinuousImperialBody(ctx, s, a) {
    if (this.nodes.length < 3) return;
    ctx.save();

    const nLen = this.numNodes;

    ctx.beginPath();
    ctx.moveTo(this.nodes[0].leftPoint.x, this.nodes[0].leftPoint.y);

    for (let i = 1; i < nLen; i++) {
      const prev = this.nodes[i - 1].leftPoint;
      const cur = this.nodes[i].leftPoint;
      ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + cur.x) * 0.5, (prev.y + cur.y) * 0.5);
    }
    const lastLeft = this.nodes[nLen - 1].leftPoint;
    ctx.lineTo(lastLeft.x, lastLeft.y);

    const tailTip = this.nodes[nLen - 1];
    ctx.lineTo(tailTip.x, tailTip.y);

    const lastRight = this.nodes[nLen - 1].rightPoint;
    ctx.lineTo(lastRight.x, lastRight.y);
    for (let i = nLen - 2; i >= 0; i--) {
      const next = this.nodes[i + 1].rightPoint;
      const cur = this.nodes[i].rightPoint;
      ctx.quadraticCurveTo(next.x, next.y, (next.x + cur.x) * 0.5, (next.y + cur.y) * 0.5);
    }
    ctx.lineTo(this.nodes[0].rightPoint.x, this.nodes[0].rightPoint.y);
    ctx.closePath();

    ctx.fillStyle = `${this.goldDark}${a * 0.96})`;
    ctx.fill();

    ctx.lineWidth = 1.3 * s;
    ctx.strokeStyle = `${this.goldGlow}${a * 0.98})`;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
    for (let i = 1; i < nLen; i++) {
      const prev = this.nodes[i - 1];
      const cur = this.nodes[i];
      ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + cur.x) * 0.5, (prev.y + cur.y) * 0.5);
    }
    ctx.lineWidth = 6.2 * s;
    ctx.lineCap = 'round';
    ctx.strokeStyle = `${this.goldMain}${a * 0.92})`;
    ctx.stroke();

    ctx.lineWidth = 3.6 * s;
    ctx.strokeStyle = `${this.goldLight}${a * 0.95})`;
    ctx.stroke();

    // 月牙微拱立体腹甲
    for (let i = 2; i < nLen - 3; i += 2) {
      const n = this.nodes[i];
      if (!n) continue;
      const bw = n.visualRadius * 0.88;
      const norm = n.angle + Math.PI / 2;

      const p1x = n.x - Math.cos(norm) * bw * 0.45;
      const p1y = n.y - Math.sin(norm) * bw * 0.45;
      const p2x = n.x + Math.cos(norm) * bw * 0.45;
      const p2y = n.y + Math.sin(norm) * bw * 0.45;

      const archDist = bw * 0.24;
      const archX = n.x - Math.cos(n.angle) * archDist;
      const archY = n.y - Math.sin(n.angle) * archDist;

      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.quadraticCurveTo(archX, archY, p2x, p2y);
      ctx.lineWidth = 1.6 * s;
      ctx.lineCap = 'round';
      ctx.strokeStyle = `${this.goldLight}${a * 0.85})`;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(archX, archY, 1.0 * s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.95})`;
      ctx.fill();
    }

    ctx.restore();
  }

  _renderEmbossedDragonScales(ctx, s, a) {
    if (this.nodes.length < 8) return;
    ctx.save();

    // 覆盖节点 2 ~ 25，密集致密
    for (let i = 2; i < this.numNodes - 6; i += 2) {
      const n = this.nodes[i];
      if (!n) continue;

      const halfW = n.visualRadius;
      const norm = n.angle + Math.PI / 2;
      const backwardAngle = n.angle + Math.PI;

      const offsets = [-0.42, 0, 0.42];
      for (let c = 0; c < offsets.length; c++) {
        const off = offsets[c];
        const scX = n.x + Math.cos(norm) * halfW * off;
        const scY = n.y + Math.sin(norm) * halfW * off;

        const shimmerPhase = this.age * 0.24 - i * 0.42 + c * 0.85;
        const shimmer = Math.sin(shimmerPhase);
        const scLen = (3.8 + (c === 1 ? 0.8 : 0)) * s;
        const scW = scLen * 0.72;

        ctx.save();
        ctx.translate(scX, scY);
        ctx.rotate(backwardAngle);

        ctx.beginPath();
        ctx.moveTo(0, -scLen * 0.5);
        ctx.quadraticCurveTo(scW * 0.75, -scLen * 0.2, scW * 0.5, scLen * 0.4);
        ctx.lineTo(0, scLen * 0.6);
        ctx.lineTo(-scW * 0.5, scLen * 0.4);
        ctx.quadraticCurveTo(-scW * 0.75, -scLen * 0.2, 0, -scLen * 0.5);
        ctx.closePath();

        const scaleAlpha = a * (0.80 + shimmer * 0.18);
        ctx.fillStyle = c === 1
          ? `${this.goldLight}${scaleAlpha * 0.90})`
          : `${this.goldGlow}${scaleAlpha * 0.75})`;
        ctx.fill();

        if (shimmer > 0.4) {
          const sparkA = (shimmer - 0.4) / 0.6;
          ctx.beginPath();
          ctx.moveTo(0, -scLen * 0.3);
          ctx.lineTo(0, scLen * 0.4);
          ctx.lineWidth = 0.8 * s;
          ctx.strokeStyle = `rgba(255, 255, 255, ${a * sparkA * 0.92})`;
          ctx.stroke();
        }

        ctx.restore();
      }
    }

    ctx.restore();
  }

  _renderSolarSpinalPulse(ctx, s, a) {
    if (this.nodes.length < 3) return;
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
    for (let i = 1; i < this.numNodes; i++) {
      const prev = this.nodes[i - 1];
      const cur = this.nodes[i];
      ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + cur.x) * 0.5, (prev.y + cur.y) * 0.5);
    }
    ctx.lineWidth = 1.5 * s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.98})`;
    ctx.stroke();

    for (let i = 2; i < this.numNodes - 3; i += 3) {
      const pulseWave = Math.sin(this.age * 0.28 - i * 0.38 + this.phaseOffset);
      if (pulseWave > 0.55) {
        const pn = this.nodes[i];
        const pAlpha = (pulseWave - 0.55) / 0.45;
        ctx.beginPath();
        ctx.arc(pn.x, pn.y, 2.2 * s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${a * pAlpha * 0.98})`;
        ctx.fill();
      }
    }

    ctx.restore();
  }

  _renderPhoenixTail(ctx, s, a) {
    const nLen = this.numNodes;
    const tip = this.nodes[nLen - 1];
    if (!tip) return;

    const anchor = this.nodes[nLen - 4] || this.nodes[nLen - 2];
    const tailAngle = Math.atan2(tip.y - anchor.y, tip.x - anchor.x);

    ctx.save();
    ctx.translate(tip.x, tip.y);
    ctx.rotate(tailAngle);

    const plumes = [-0.5, -0.35, -0.2, -0.07, 0.07, 0.2, 0.35, 0.5];
    for (let pIdx = 0; pIdx < plumes.length; pIdx++) {
      const ang = plumes[pIdx];
      const flutter = Math.sin(this.age * 0.24 + pIdx * 0.75 + this.phaseOffset) * 0.20 * this.waveDamping;
      const pLen = (18 + (4 - Math.abs(3.5 - pIdx)) * 5.0) * s;

      ctx.save();
      ctx.rotate(ang + flutter);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(pLen * 0.5, -2.6 * s, pLen, 0);
      ctx.quadraticCurveTo(pLen * 0.5, 2.6 * s, 0, 0);
      ctx.closePath();
      ctx.fillStyle = pIdx % 2 === 0 ? `${this.goldGlow}${a * 0.92})` : `${this.goldLight}${a * 0.98})`;
      ctx.fill();

      ctx.lineWidth = 0.9 * s;
      ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.95})`;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // 四足黄金紧凑分布：前双爪 (6, 9)，后双爪 (17, 20)
  _renderImperialTalons(ctx, s, a) {
    const clawSlots = [
      { nodeIdx: 6, side: -1, isFront: true },
      { nodeIdx: 9, side: 1, isFront: true },
      { nodeIdx: 17, side: -1, isFront: false },
      { nodeIdx: 20, side: 1, isFront: false }
    ];

    for (const c of clawSlots) {
      const node = this.nodes[c.nodeIdx];
      if (!node) continue;

      const clawAngle = node.angle + c.side * (c.isFront ? 1.18 : 1.35);
      const armLen = 16 * s;

      ctx.save();
      ctx.translate(node.x, node.y);
      ctx.rotate(clawAngle);

      const spin = this.age * 0.045 + c.nodeIdx;
      ctx.save();
      ctx.translate(armLen * 0.9, 0);
      ctx.rotate(spin);
      ctx.beginPath();
      ctx.arc(0, 0, 7.5 * s, 0, Math.PI * 2);
      ctx.fillStyle = `${this.goldLight}${a * 0.35})`;
      ctx.fill();

      for (let cr = 0; cr < 3; cr++) {
        const ca = (cr / 3) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(ca) * 3.8 * s, Math.sin(ca) * 3.8 * s, 3.2 * s, 0, Math.PI * 2);
        ctx.fillStyle = `${this.goldGlow}${a * 0.30})`;
        ctx.fill();
      }
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(armLen * 0.55, -2.0 * s);
      ctx.lineWidth = 3.0 * s;
      ctx.lineCap = 'round';
      ctx.strokeStyle = `${this.goldMain}${a * 0.95})`;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(armLen * 0.55, -2.0 * s);
      ctx.lineTo(armLen, 1.8 * s);
      ctx.lineWidth = 2.2 * s;
      ctx.lineCap = 'round';
      ctx.strokeStyle = `${this.goldGlow}${a * 0.98})`;
      ctx.stroke();

      const talons = [-0.55, -0.28, 0, 0.28, 0.55];
      for (const t of talons) {
        ctx.save();
        ctx.translate(armLen, 1.8 * s);
        ctx.rotate(t);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(3.8 * s, 1.2 * s, 7.2 * s, 3.8 * s);
        ctx.lineWidth = 1.2 * s;
        ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.98})`;
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }
  }

  _renderImperialVisage(ctx, s, a) {
    const head = this.nodes[0];
    if (!head) return;

    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(head.angle);

    const jawDrop = this.mouthOpen * 13.0 * s;

    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(-2 * s, side * 5 * s);
      ctx.rotate(side * 0.32);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-6 * s, side * 6 * s, -15 * s, side * 13 * s, -24 * s, side * 19 * s);
      ctx.lineWidth = 2.8 * s;
      ctx.strokeStyle = `${this.goldLight}${a * 0.98})`;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-6 * s, side * 6 * s);
      ctx.quadraticCurveTo(-12 * s, side * 3 * s, -18 * s, side * 5 * s);
      ctx.lineWidth = 1.8 * s;
      ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.98})`;
      ctx.stroke();
      ctx.restore();
    }

    const maneLines = [-10, -6, -2, 2, 6];
    for (let i = 0; i < maneLines.length; i++) {
      const my = maneLines[i] * s;
      const wave = Math.sin(this.age * 0.24 + i + this.phaseOffset) * 3.0 * s * this.waveDamping;
      ctx.beginPath();
      ctx.moveTo(-5 * s, my);
      ctx.bezierCurveTo(-12 * s, my - 5 * s, -20 * s, my + wave, -27 * s, my - 8 * s + wave);
      ctx.lineWidth = 2.2 * s;
      ctx.strokeStyle = i % 2 === 0 ? `${this.goldGlow}${a * 0.95})` : `${this.goldLight}${a * 0.98})`;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    if (this.mouthOpen > 0.04) {
      ctx.beginPath();
      ctx.moveTo(15 * s, -0.5 * s);
      ctx.quadraticCurveTo(5 * s, 1 * s, -3 * s, 2 * s);
      ctx.quadraticCurveTo(4 * s, 1.5 * s + jawDrop * 0.5, 15 * s, 0.5 * s + jawDrop);
      ctx.closePath();
      ctx.fillStyle = `rgba(180, 83, 9, ${a * 0.95})`;
      ctx.fill();

      const throatFlare = Math.min(1.0, this.mouthOpen * 1.2);
      ctx.beginPath();
      ctx.arc(2 * s, 1.5 * s + jawDrop * 0.4, (4 + throatFlare * 5) * s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${a * throatFlare * 0.98})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(16 * s, -2 * s);
    ctx.quadraticCurveTo(10 * s, -8 * s, -5 * s, -7 * s);
    ctx.quadraticCurveTo(-12 * s, -4 * s, -11 * s, 2 * s);
    ctx.lineTo(-3 * s, 2 * s);
    ctx.quadraticCurveTo(5 * s, 1 * s, 15 * s, -0.5 * s);
    ctx.closePath();
    ctx.fillStyle = `${this.goldMain}${a * 0.98})`;
    ctx.fill();
    ctx.strokeStyle = `${this.goldLight}${a * 0.96})`;
    ctx.lineWidth = 1.3 * s;
    ctx.stroke();

    safeDrawEllipse(ctx, 11 * s, -3.0 * s, 4.2 * s, 2.5 * s, 0.15);
    ctx.fillStyle = `${this.goldGlow}${a * 0.98})`;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(3 * s, -6 * s);
    ctx.lineTo(7 * s, -10 * s);
    ctx.lineTo(5 * s, -5 * s);
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.95})`;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-3 * s, 2 * s);
    ctx.quadraticCurveTo(3 * s, 4 * s + jawDrop * 0.6, 15 * s, 1.2 * s + jawDrop);
    ctx.lineTo(15 * s, 0.5 * s + jawDrop);
    ctx.quadraticCurveTo(4 * s, 1.5 * s + jawDrop * 0.5, -3 * s, 2 * s);
    ctx.closePath();
    ctx.fillStyle = `${this.goldMain}${a * 0.98})`;
    ctx.fill();
    ctx.strokeStyle = `${this.goldLight}${a * 0.96})`;
    ctx.lineWidth = 1.2 * s;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(13 * s, 0);
    ctx.lineTo(11.8 * s, 5.0 * s);
    ctx.lineTo(10.5 * s, 0);
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.98})`;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(12.5 * s, 1.2 * s + jawDrop);
    ctx.lineTo(11.5 * s, -3.2 * s + jawDrop * 0.7);
    ctx.lineTo(10.5 * s, 1.2 * s + jawDrop);
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.98})`;
    ctx.fill();

    const eg = this.eyeGlow;
    safeDrawEllipse(ctx, 2 * s, -3.5 * s, 3.8 * s, 2.4 * s, -0.15);
    ctx.fillStyle = `rgba(220, 38, 38, ${a * 0.92 * eg})`;
    ctx.fill();

    safeDrawEllipse(ctx, 2 * s, -3.5 * s, 2.8 * s, 1.8 * s, -0.15);
    ctx.fillStyle = `${this.goldLight}${a * 0.98 * eg})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(2.5 * s, -3.8 * s, 1.0 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }

  _renderCosmicStarBreath(ctx, s, a) {
    const bInt = this.breathIntensity;
    if (bInt <= 0.02) return;

    const head = this.nodes[0];
    if (!head) return;

    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(head.angle);

    const startX = 13 * s;
    const startY = 1.5 * s + this.mouthOpen * 6.5 * s;
    const breathLen = (200 + Math.sin(this.age * 0.7) * 22) * s * bInt;
    const spreadW = (85 + Math.sin(this.age * 0.9) * 14) * s * bInt;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + breathLen * 0.42, startY - spreadW * 0.38, startX + breathLen, startY - spreadW * 0.48);
    ctx.quadraticCurveTo(startX + breathLen + 18 * s, startY, startX + breathLen, startY + spreadW * 0.48);
    ctx.quadraticCurveTo(startX + breathLen * 0.42, startY + spreadW * 0.38, startX, startY);
    ctx.closePath();
    ctx.fillStyle = `rgba(234, 88, 12, ${a * bInt * 0.40})`;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(startX + 2 * s, startY);
    ctx.quadraticCurveTo(startX + breathLen * 0.45, startY - spreadW * 0.24, startX + breathLen * 0.88, startY - spreadW * 0.30);
    ctx.quadraticCurveTo(startX + breathLen * 0.96, startY, startX + breathLen * 0.88, startY + spreadW * 0.30);
    ctx.quadraticCurveTo(startX + breathLen * 0.45, startY + spreadW * 0.24, startX + 2 * s, startY);
    ctx.closePath();
    ctx.fillStyle = `${this.goldGlow}${a * bInt * 0.72})`;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + breathLen * 0.38, startY - spreadW * 0.10, startX + breathLen * 0.78, startY);
    ctx.quadraticCurveTo(startX + breathLen * 0.38, startY + spreadW * 0.10, startX, startY);
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 255, 255, ${a * bInt * 0.92})`;
    ctx.fill();

    const steps = [0.28, 0.52, 0.75];
    for (let r = 0; r < steps.length; r++) {
      const rx = startX + breathLen * steps[r];
      const ry = startY + Math.sin(this.age * 1.2 + r * 1.8) * 7 * s;
      const rSize = (9 + r * 5) * s * bInt;
      ctx.beginPath();
      ctx.arc(rx, ry, rSize, 0, Math.PI * 2);
      ctx.fillStyle = `${this.goldLight}${a * bInt * 0.35})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(rx, ry, rSize * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${a * bInt * 0.78})`;
      ctx.fill();
    }

    ctx.restore();
  }
}
