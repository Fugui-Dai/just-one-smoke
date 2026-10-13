// utils/phoenixRenderer.js

/**
 * 腾讯游戏部门级 · 赤焰神凰 (Celestial Fire Phoenix 百鸟朝凤典藏版)
 * 零第三方依赖 · 纯原生 Canvas 2D 骨骼动力学与多层炽焰流光羽翼
 * 视觉特征：
 * 1. 凤首神韵：灵秀凤眼金芒、金羽凤冠（Crest Crown）、朱雀金喙与颌下赤炎；
 * 2. 炽羽双翼：四阶舒展炽金飞羽，随腾飞自如煽动（Flapping Waves），羽尖带炽焰粒子流；
 * 3. 凤尾流光霞带：三道修长飘逸的凌空凤翎霞带（三尾神凰），随气流荡漾起伏，羽梢带同心神明眼斑；
 * 4. 离火神霞光晕：沿途洒下南明离火金星与赤焰羽屑，如临仙境。
 */

export class FirePhoenix {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = -3.2; // 向上翱翔主速度

    this.age = 0;
    this.maxAge = 190;
    this.alpha = 0;
    this.scale = 0.70; // 紧凑优雅大厂手办级比例

    // 凤尾三道主翎羽骨节 (中心长尾、左凤翎、右凤翎)
    this.tailNodesCount = 20;
    this.tailNodeDist = 7.5;
    this.centerTail = [];
    this.leftTail = [];
    this.rightTail = [];

    for (let i = 0; i < this.tailNodesCount; i++) {
      this.centerTail.push({ x: x, y: y + i * this.tailNodeDist, angle: Math.PI / 2 });
      this.leftTail.push({ x: x - 6, y: y + i * this.tailNodeDist, angle: Math.PI / 2 });
      this.rightTail.push({ x: x + 6, y: y + i * this.tailNodeDist, angle: Math.PI / 2 });
    }

    this.wingPhase = Math.random() * Math.PI * 2;
    this.driftPhase = Math.random() * Math.PI * 2;
  }

  update(screenH, ceilingY, emitParticleCallback) {
    this.age++;

    // 1. 翱翔速度与微幅横向盘旋
    this.vy = Math.max(-4.8, this.vy - 0.008);
    const lateralSway = Math.sin(this.age * 0.055 + this.driftPhase) * 2.2;
    this.x += lateralSway + this.vx;
    this.y += this.vy;

    // 2. 尾翎逆向骨骼跟随与空气波浪
    this._updateTailStreamer(this.centerTail, this.x, this.y + 14, 0, 1.0);
    this._updateTailStreamer(this.leftTail, this.x - 7, this.y + 16, -0.35, 0.85);
    this._updateTailStreamer(this.rightTail, this.x + 7, this.y + 16, 0.35, 0.85);

    // 3. 透明度与生命周期控制
    let birthFade = 1.0;
    if (this.age < 22) {
      birthFade = Math.sin((this.age / 22) * (Math.PI / 2));
    }

    let lifeFade = 1.0;
    const prog = this.age / this.maxAge;
    if (prog > 0.45) {
      lifeFade = Math.pow(Math.max(0, 1 - (prog - 0.45) / 0.55), 1.8);
    }

    let ceilingFade = 1.0;
    if (this.y < ceilingY + 100) {
      ceilingFade = Math.max(0, (this.y - ceilingY) / 100);
    }

    this.alpha = birthFade * lifeFade * ceilingFade;

    // 4. 飞行伴生火羽与离火星屑粒子
    if (typeof emitParticleCallback === 'function' && this.age % 2 === 0 && this.alpha > 0.15) {
      // 翼尖与周身离火飞屑
      emitParticleCallback({
        x: this.x + (Math.random() - 0.5) * 32,
        y: this.y + 4 + Math.random() * 24,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 0.3 + Math.random() * 1.2,
        radius: 1.2 + Math.random() * 1.8,
        alpha: this.alpha * 0.92,
        baseAlpha: 0.92,
        life: 0,
        maxLife: 42 + Math.random() * 25,
        color: Math.random() < 0.5 ? '#f97316' : (Math.random() < 0.8 ? '#fef08a' : '#ef4444'),
        isGold: true,
        shimmerPhase: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.2
      });

      // 尾翎末梢洒落金色火星
      const centerTip = this.centerTail[this.centerTail.length - 1];
      if (centerTip) {
        emitParticleCallback({
          x: centerTip.x + (Math.random() - 0.5) * 8,
          y: centerTip.y + Math.random() * 6,
          vx: (Math.random() - 0.5) * 1.0,
          vy: 0.8 + Math.random() * 1.2,
          radius: 1.0 + Math.random() * 1.4,
          alpha: this.alpha * 0.9,
          baseAlpha: 0.9,
          life: 0,
          maxLife: 35 + Math.random() * 20,
          color: '#fbbf24',
          isGold: true,
          shimmerPhase: Math.random() * Math.PI * 2,
          shimmerSpeed: 0.25
        });
      }
    }

    return (this.age < this.maxAge && this.y > ceilingY - 30 && this.alpha > 0.01);
  }

  _updateTailStreamer(nodes, rootX, rootY, angleBias, ampScale) {
    nodes[0].x = rootX;
    nodes[0].y = rootY;

    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const cur = nodes[i];

      let dx = cur.x - prev.x;
      let dy = cur.y - prev.y;
      let angle = Math.atan2(dy, dx);
      if (isNaN(angle)) angle = Math.PI / 2;

      cur.x = prev.x + Math.cos(angle) * this.tailNodeDist;
      cur.y = prev.y + Math.sin(angle) * this.tailNodeDist;
      cur.angle = angle;

      // 飘动正弦波
      const wave = Math.sin(this.age * 0.12 - i * 0.28 + angleBias) * (1.2 + i * 0.12) * ampScale;
      cur.x += wave;
    }
  }

  render(ctx) {
    if (this.alpha <= 0.01) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

    // 扇翅角度正弦波
    const flap = Math.sin(this.age * 0.20 + this.wingPhase);

    // 1. 绘制底层赤焰神霞光晕
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(249, 115, 22, ${this.alpha * 0.22})`;
    ctx.fill();

    // 1.5 绘制周身烈焰回旋涡流环 (Swirling Flame Vortex Ring)
    this._drawFlameVortex(ctx);

    // 2. 绘制双翼（展开扇动与三阶金赤飞羽）
    this._drawWings(ctx, flap);

    // 3. 绘制身躯与胸羽
    this._drawBody(ctx);

    // 4. 绘制凤首、金冠与神目
    this._drawHead(ctx);

    ctx.restore();

    // 5. 绘制三道修长流光凤翎霞带 (世界坐标系)
    this._renderTails(ctx);
  }

  _drawFlameVortex(ctx) {
    ctx.save();
    ctx.translate(0, 6);
    ctx.rotate(-0.25 + Math.sin(this.age * 0.08) * 0.06);

    // 外层炽焰光环
    ctx.beginPath();
    ctx.ellipse(0, 0, 42, 16, 0, 0, Math.PI * 2);
    ctx.lineWidth = 4.0;
    ctx.strokeStyle = `rgba(234, 88, 12, ${this.alpha * 0.45})`;
    ctx.stroke();

    // 内层金赤螺旋光刃 (带旋转动感)
    const rot = this.age * 0.16;
    ctx.beginPath();
    ctx.ellipse(0, 0, 38, 13, 0, rot, rot + Math.PI * 1.3);
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = `rgba(254, 240, 138, ${this.alpha * 0.85})`;
    ctx.stroke();

    ctx.restore();
  }

  _drawWings(ctx, flap) {
    ctx.save();
    // 左翼 (三阶羽翼分瓣)
    ctx.save();
    ctx.translate(-8, 4);
    ctx.rotate(flap * 0.32 - 0.25);

    // 一阶：外层南明深赤烈焰羽
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-28, -20, -52, -14, -60, 12);
    ctx.bezierCurveTo(-46, 22, -24, 18, 0, 6);
    ctx.closePath();
    ctx.fillStyle = `rgba(220, 38, 38, ${this.alpha * 0.88})`;
    ctx.fill();

    // 二阶：中层赤金飞羽
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-22, -14, -42, -8, -48, 10);
    ctx.bezierCurveTo(-34, 16, -18, 12, 0, 4);
    ctx.closePath();
    ctx.fillStyle = `rgba(245, 158, 11, ${this.alpha * 0.95})`;
    ctx.fill();

    // 三阶：内层白金炽火羽
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-14, -8, -28, -4, -32, 6);
    ctx.bezierCurveTo(-22, 10, -12, 8, 0, 3);
    ctx.closePath();
    ctx.fillStyle = `rgba(254, 240, 138, ${this.alpha * 0.98})`;
    ctx.fill();
    ctx.restore();

    // 右翼 (对称镜像)
    ctx.save();
    ctx.translate(8, 4);
    ctx.rotate(-flap * 0.32 + 0.25);

    // 一阶：外层南明深赤烈焰羽
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(28, -20, 52, -14, 60, 12);
    ctx.bezierCurveTo(46, 22, 24, 18, 0, 6);
    ctx.closePath();
    ctx.fillStyle = `rgba(220, 38, 38, ${this.alpha * 0.88})`;
    ctx.fill();

    // 二阶：中层赤金飞羽
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(22, -14, 42, -8, 48, 10);
    ctx.bezierCurveTo(34, 16, 18, 12, 0, 4);
    ctx.closePath();
    ctx.fillStyle = `rgba(245, 158, 11, ${this.alpha * 0.95})`;
    ctx.fill();

    // 三阶：内层白金炽火羽
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(14, -8, 28, -4, 32, 6);
    ctx.bezierCurveTo(22, 10, 12, 8, 0, 3);
    ctx.closePath();
    ctx.fillStyle = `rgba(254, 240, 138, ${this.alpha * 0.98})`;
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  _drawBody(ctx) {
    ctx.save();
    // 凤身流线水滴形
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.bezierCurveTo(9, -4, 8, 12, 0, 22);
    ctx.bezierCurveTo(-8, 12, -9, -4, 0, -10);
    ctx.closePath();

    ctx.fillStyle = `rgba(245, 158, 11, ${this.alpha * 0.95})`;
    ctx.fill();

    // 胸前纯金护心羽鳞
    ctx.beginPath();
    ctx.arc(0, 3, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(254, 240, 138, ${this.alpha * 0.98})`;
    ctx.fill();
    ctx.restore();
  }

  _drawHead(ctx) {
    ctx.save();
    ctx.translate(0, -14);

    // 凤首轮廓
    ctx.beginPath();
    ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(251, 191, 36, ${this.alpha * 0.98})`;
    ctx.fill();

    // 金喙
    ctx.beginPath();
    ctx.moveTo(0, -6.5);
    ctx.lineTo(2.5, -12);
    ctx.lineTo(-2.5, -12);
    ctx.closePath();
    ctx.fillStyle = `rgba(254, 240, 138, ${this.alpha * 0.95})`;
    ctx.fill();

    // 凤冠三道火羽 (Crest Plumes)
    ctx.beginPath();
    ctx.moveTo(-3, -4);
    ctx.bezierCurveTo(-6, -14, -10, -18, -8, -23);
    ctx.strokeStyle = `rgba(239, 68, 68, ${this.alpha * 0.9})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.bezierCurveTo(0, -16, 0, -22, 0, -26);
    ctx.strokeStyle = `rgba(251, 191, 36, ${this.alpha * 0.95})`;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(3, -4);
    ctx.bezierCurveTo(6, -14, 10, -18, 8, -23);
    ctx.strokeStyle = `rgba(239, 68, 68, ${this.alpha * 0.9})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 凤目金芒
    ctx.beginPath();
    ctx.arc(-2.2, -1.5, 1.2, 0, Math.PI * 2);
    ctx.arc(2.2, -1.5, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.fill();

    ctx.restore();
  }

  _renderTails(ctx) {
    const tails = [
      { nodes: this.centerTail, color: '#f59e0b', width: 3.2, eyeColor: '#ef4444' },
      { nodes: this.leftTail, color: '#ea580c', width: 2.2, eyeColor: '#f59e0b' },
      { nodes: this.rightTail, color: '#ea580c', width: 2.2, eyeColor: '#f59e0b' }
    ];

    for (const tail of tails) {
      const nodes = tail.nodes;
      if (!nodes || nodes.length < 3) continue;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      for (let i = 1; i < nodes.length - 1; i++) {
        const xc = (nodes[i].x + nodes[i + 1].x) / 2;
        const yc = (nodes[i].y + nodes[i + 1].y) / 2;
        ctx.quadraticCurveTo(nodes[i].x, nodes[i].y, xc, yc);
      }
      ctx.strokeStyle = tail.color;
      ctx.globalAlpha = this.alpha * 0.85;
      ctx.lineWidth = tail.width * this.scale;
      ctx.stroke();

      // 尾梢凤翎眼斑 (Peacock/Phoenix Eye Feather)
      const tipNode = nodes[nodes.length - 1];
      if (tipNode) {
        ctx.beginPath();
        ctx.arc(tipNode.x, tipNode.y, 4.5 * this.scale, 0, Math.PI * 2);
        ctx.fillStyle = tail.eyeColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(tipNode.x, tipNode.y, 2.0 * this.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
