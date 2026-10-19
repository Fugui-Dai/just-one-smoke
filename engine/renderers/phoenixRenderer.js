// engine/renderers/phoenixRenderer.js

/**
 * 腾讯游戏部门级 · 涅槃重光 · 赤金神凤降世 (Celestial Fire Phoenix 60FPS 典藏史诗版)
 * 纯原生 Canvas 2D 高保真多层动力学与神明降世视觉系统
 *
 * 100% 还原参考图神明降世核心特征：
 * 1. 【巨大华丽展开的双翼 (Massive Crescent Wings)】：
 *    - 展开巨大而华丽的双翼，翼梢向上弯曲如新月烈焰弧线；
 *    - 三阶重叠飞羽结构（外层 9 支主飞羽、中层 7 支赤金次羽、内层炽火覆羽），宏大威严的慢速扇动动力学；
 * 2. 【身后悬浮的璀璨古代金色魔法阵与符文法阵 (Ancient Runic Magic Circle)】：
 *    - 多重同心神圣金环，刻有古老神秘的魔法符文与刻线；
 *    - 八角芒星几何矩阵交织，缓步旋转与脉冲能量微波；
 * 3. 【头顶神圣金色光环与太阳日冕 (Divine Solar Halo & God Rays)】：
 *    - 凤首后方悬浮耀世白金圣环，射出 8 芒太阳圣光刺，充满神明降世的神圣感；
 * 4. 【昂首向天长鸣的神鸟姿态 (Heroic Arched Neck & Open Beak)】：
 *    - 凤颈修长高昂、金喙向天啼鸣，向后扬起飘逸的烈焰凤冠神羽与纯白神性凤目；
 *    - 腹下收拢三趾纯金帝王利爪；
 * 5. 【华丽多重流光凤翎长尾 (Cascading 7-Tail Streamers)】：
 *    - 7 道长尾翎羽呈放射状孔雀弧瀑布般垂落并向上翻卷，末端带有同心赤红金瞳凤眼斑；
 * 6. 【四周直插云霄的金色通天光柱 (Volumetric Celestial Light Pillars)】：
 *    - 左右两侧纵贯天地的神圣体积光柱，伴随上升高能等离子微粒；
 * 7. 【空中飘落的燃烧赤金羽毛 (Drifting Burning Molten Feathers)】：
 *    - 伴生大片立体燃烧金羽，在空中摇曳翻滚飘落，羽梢带火星飞屑；
 * 8. 【地面古殿遗迹剪影与熊熊烈火 (Ground Ruins & Inferno Flames)】：
 *    - 地面古神殿立柱残垣剪影，翻滚着熊熊燃烧的涅槃离火与召唤阵法。
 */

// 绘制单片 3D 燃烧赤金羽毛粒子 (飘落于空中)
export function drawBurningFeatherParticle(ctx, p) {
  const len = p.length || 18.0;
  const w = len * 0.42;
  const a = p.alpha || 0.88;
  const rot = p.rotation || 0;
  const flip = Math.cos(p.flipPhase || 0); // 3D Y轴翻滚透视
  const absFlip = Math.max(0.18, Math.abs(flip));

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(rot);
  ctx.scale(absFlip, 1.0);

  // 1. 周身炽焰微晕
  ctx.beginPath();
  ctx.arc(0, -len * 0.4, len * 0.65, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(249, 115, 22, ${a * 0.22})`;
  ctx.fill();

  // 2. 羽片外缘 (燃烧的赤红离火羽绒)
  ctx.beginPath();
  ctx.moveTo(0, 0); // 羽轴根部
  ctx.bezierCurveTo(-w, -len * 0.35, -w * 0.9, -len * 0.78, 0, -len); // 左羽片
  ctx.bezierCurveTo(w * 0.9, -len * 0.78, w, -len * 0.35, 0, 0); // 右羽片
  ctx.closePath();
  ctx.fillStyle = `rgba(220, 38, 38, ${a * 0.88})`;
  ctx.fill();

  // 3. 羽片内芯 (赤金流光)
  ctx.beginPath();
  ctx.moveTo(0, -len * 0.1);
  ctx.bezierCurveTo(-w * 0.55, -len * 0.38, -w * 0.5, -len * 0.72, 0, -len * 0.92);
  ctx.bezierCurveTo(w * 0.5, -len * 0.72, w * 0.55, -len * 0.38, 0, -len * 0.1);
  ctx.closePath();
  ctx.fillStyle = `rgba(245, 158, 11, ${a * 0.95})`;
  ctx.fill();

  // 4. 白金炽热羽轴主干
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(0, -len * 0.95);
  ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.98})`;
  ctx.lineWidth = 1.0;
  ctx.stroke();

  // 5. 羽尖燃烧高光火花
  ctx.beginPath();
  ctx.arc(0, -len * 0.95, 1.6, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.98})`;
  ctx.fill();

  ctx.restore();
}

export class FirePhoenix {
  constructor(x, y, variant = 0) {
    this.variant = variant;
    this.startX = x;
    // 默认单凰沿香烟中轴严格居中升腾 (vx = 0)；双凰伴飞时错层对称
    this.x = variant === 1 ? (x + 30) : (variant === 2 ? (x - 30) : x);
    this.y = y;
    this.vx = variant === 1 ? 0.38 : (variant === 2 ? -0.38 : 0);
    this.vy = -2.25; // 史诗级稳健升腾翱翔速度，给用户充分欣赏视觉细节的时长

    this.age = 0;
    this.maxAge = 220; // 约 3.6 秒完整生命周期
    this.alpha = 0;
    this.scale = 0.90; // 宏大史诗比例，气吞山河

    // 身后古代魔法阵旋转与呼吸脉冲
    this.magicCircleRot = Math.random() * Math.PI;
    this.magicCircleRotSpeed = variant === 1 ? -0.007 : 0.007;

    // 扇翅与盘旋波动相位
    this.wingPhase = variant === 1 ? Math.PI : Math.random() * Math.PI * 2;
    this.driftPhase = variant === 1 ? Math.PI : 0;

    // 华丽 7 道多阶流光凤翎长尾 (中心主翎 1 道 + 内侧 2 道 + 中侧 2 道 + 外侧 2 道)
    this.tails = [
      // 0: 中心最长主凤翎
      { nodes: [], count: 24, dist: 7.0, angleBias: 0, amp: 1.15, color: '#f59e0b', eyeColor: '#ef4444', width: 3.8 },
      // 1, 2: 内侧对称凤翎
      { nodes: [], count: 21, dist: 6.8, angleBias: -0.22, amp: 1.05, color: '#ea580c', eyeColor: '#f59e0b', width: 3.2 },
      { nodes: [], count: 21, dist: 6.8, angleBias: 0.22, amp: 1.05, color: '#ea580c', eyeColor: '#f59e0b', width: 3.2 },
      // 3, 4: 中侧扬起凤翎
      { nodes: [], count: 18, dist: 6.4, angleBias: -0.48, amp: 0.95, color: '#dc2626', eyeColor: '#fbbf24', width: 2.8 },
      { nodes: [], count: 18, dist: 6.4, angleBias: 0.48, amp: 0.95, color: '#dc2626', eyeColor: '#fbbf24', width: 2.8 },
      // 5, 6: 外侧翻卷短凤翎
      { nodes: [], count: 14, dist: 6.0, angleBias: -0.75, amp: 0.85, color: '#b91c1c', eyeColor: '#fef08a', width: 2.4 },
      { nodes: [], count: 14, dist: 6.0, angleBias: 0.75, amp: 0.85, color: '#b91c1c', eyeColor: '#fef08a', width: 2.4 }
    ];

    // 初始化所有尾翎骨骼节点
    for (let t = 0; t < this.tails.length; t++) {
      const tail = this.tails[t];
      for (let i = 0; i < tail.count; i++) {
        tail.nodes.push({
          x: x + (t - 3) * 3.5,
          y: y + 16 + i * tail.dist,
          angle: Math.PI / 2
        });
      }
    }

    // 燃烧羽毛脱落计时器
    this.featherTimer = 0;
  }

  update(screenH, ceilingY, emitParticleCallback) {
    this.age++;
    const prog = this.age / this.maxAge;

    // 1. 翱翔速度与宏大横向巡游 (仿神禽空中盘旋)
    this.vy = Math.max(-3.8, this.vy - 0.005);
    const lateralSway = Math.sin(this.age * 0.045 + this.driftPhase) * 1.8;
    this.x += lateralSway + this.vx;
    this.y += this.vy;

    // 2. 身后魔法阵缓速旋转
    this.magicCircleRot += this.magicCircleRotSpeed;

    // 3. 7 道凤翎尾骨骼链逆向动力学跟随
    const rootOffsets = [
      { dx: 0, dy: 16 },
      { dx: -5, dy: 17 },
      { dx: 5, dy: 17 },
      { dx: -10, dy: 15 },
      { dx: 10, dy: 15 },
      { dx: -15, dy: 12 },
      { dx: 15, dy: 12 }
    ];
    for (let t = 0; t < this.tails.length; t++) {
      const tail = this.tails[t];
      const offset = rootOffsets[t];
      this._updateTailStreamer(tail.nodes, this.x + offset.dx, this.y + offset.dy, tail.dist, tail.angleBias, tail.amp);
    }

    // 4. 透明度包络控制：破雾初显淡入 -> 傲世翱翔高光 -> 穿云羽化淡出
    let birthFade = 1.0;
    if (this.age < 24) {
      birthFade = Math.sin((this.age / 24) * (Math.PI / 2));
    }

    let lifeFade = 1.0;
    if (prog > 0.55) {
      const fadeProg = Math.max(0, 1 - (prog - 0.55) / 0.45);
      lifeFade = Math.pow(fadeProg, 1.8);
    }

    let ceilingFade = 1.0;
    if (this.y < ceilingY + 110) {
      ceilingFade = Math.max(0, (this.y - ceilingY) / 110);
    }

    this.alpha = birthFade * lifeFade * ceilingFade;

    // 5. 飘落空中燃烧金羽与离火星屑粒子
    if (typeof emitParticleCallback === 'function' && this.alpha > 0.20) {
      this.featherTimer++;

      // 每 14 帧脱落一片在空中翻滚飘摇的 3D 燃烧大羽毛
      if (this.featherTimer % 14 === 0) {
        const side = Math.random() < 0.5 ? -1 : 1;
        const featherX = this.x + side * (32 + Math.random() * 45) * this.scale;
        const featherY = this.y - 10 + Math.random() * 40 * this.scale;
        emitParticleCallback({
          x: featherX,
          y: featherY,
          vx: side * (0.3 + Math.random() * 0.4) + (Math.random() - 0.5) * 0.3,
          vy: 0.8 + Math.random() * 0.8, // 顺应气流缓缓飘落
          length: 16.0 + Math.random() * 9.0,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
          flipPhase: Math.random() * Math.PI * 2,
          alpha: this.alpha * 0.95,
          baseAlpha: 0.95,
          life: 0,
          maxLife: 130 + Math.random() * 30,
          isBurningFeather: true
        });
      }

      // 翼尖与周身离火飞星 (高亮纯金与朱雀火星)
      if (this.age % 2 === 0) {
        emitParticleCallback({
          x: this.x + (Math.random() - 0.5) * 85 * this.scale,
          y: this.y + (Math.random() - 0.5) * 50 * this.scale,
          vx: (Math.random() - 0.5) * 1.6,
          vy: 0.5 + Math.random() * 1.5,
          radius: 1.2 + Math.random() * 1.8,
          alpha: this.alpha * 0.95,
          baseAlpha: 0.95,
          life: 0,
          maxLife: 45 + Math.random() * 25,
          color: Math.random() < 0.5 ? '#f59e0b' : (Math.random() < 0.8 ? '#fef08a' : '#ef4444'),
          isGold: true,
          shimmerPhase: Math.random() * Math.PI * 2,
          shimmerSpeed: 0.22
        });
      }
    }

    return (this.age < this.maxAge && this.y > ceilingY - 40 && this.alpha > 0.01);
  }

  _updateTailStreamer(nodes, rootX, rootY, nodeDist, angleBias, ampScale) {
    nodes[0].x = rootX;
    nodes[0].y = rootY;

    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const cur = nodes[i];

      let dx = cur.x - prev.x;
      let dy = cur.y - prev.y;
      let angle = Math.atan2(dy, dx);
      if (isNaN(angle)) angle = Math.PI / 2;

      cur.x = prev.x + Math.cos(angle) * nodeDist;
      cur.y = prev.y + Math.sin(angle) * nodeDist;
      cur.angle = angle;

      // 流体正弦波摆动（向外展开并随风飘荡）
      const wave = Math.sin(this.age * 0.10 - i * 0.22 + angleBias) * (1.6 + i * 0.18) * ampScale;
      cur.x += wave + angleBias * 0.9;
    }
  }

  render(ctx) {
    if (this.alpha <= 0.01) return;

    const s = this.scale;
    const a = this.alpha;

    // 1. 【最底层：直插云霄的金色神圣通天光柱 (Volumetric Light Pillars)】
    this._renderLightPillars(ctx, s, a);

    // 2. 【底层：地面古老神殿遗迹剪影与涅槃烈火 (Ground Altar & Ruins)】
    this._renderGroundInferno(ctx, s, a);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(s, s);

    // 扇翅角度正弦波 (慢速威严宏大扇动，大开大合)
    const flap = Math.sin(this.age * 0.12 + this.wingPhase);

    // 3. 【身后悬浮的璀璨古代金色魔法阵与符文法阵 (Ancient Magic Circle)】
    this._drawRunicMagicCircle(ctx, a);

    // 4. 【头顶神圣金色光环与太阳日冕 (Divine Solar Halo & God Rays)】
    this._drawSolarHalo(ctx, a);

    // 5. 【巨大华丽展开的双翼 (Massive Crescent Wings)】
    this._drawGrandWings(ctx, flap, a);

    // 6. 【神鸟躯体、护胸羽鳞与纯金帝王利爪 (Body, Breast & Talons)】
    this._drawBodyAndTalons(ctx, a);

    // 7. 【昂首啼鸣神凤首、烈焰神羽冠与纯白神性目 (Head & Crest)】
    this._drawHeadAndBeak(ctx, a);

    ctx.restore();

    // 8. 【世界坐标系：华丽 7 道多阶流光凤翎长尾 (7 Cascading Tail Plumes)】
    this._renderTails(ctx, s, a);
  }

  // 1. 直插云霄的金色神圣通天光柱 (左右两侧体积光)
  _renderLightPillars(ctx, s, a) {
    const pillarPositions = [-115 * s, 115 * s];
    for (const px of pillarPositions) {
      const beamX = this.x + px;
      ctx.save();
      // 光柱外层柔光
      ctx.beginPath();
      ctx.rect(beamX - 18 * s, 0, 36 * s, this.y + 160 * s);
      ctx.fillStyle = `rgba(245, 158, 11, ${a * 0.12})`;
      ctx.fill();

      // 光柱核心高亮亮轨
      ctx.beginPath();
      ctx.rect(beamX - 6 * s, 0, 12 * s, this.y + 160 * s);
      ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.25})`;
      ctx.fill();

      // 光柱中心白金细芒
      ctx.beginPath();
      ctx.rect(beamX - 1.5 * s, 0, 3 * s, this.y + 160 * s);
      ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.45})`;
      ctx.fill();

      ctx.restore();
    }
  }

  // 2. 地面古老神殿遗迹剪影与熊熊烈火
  _renderGroundInferno(ctx, s, a) {
    const groundY = this.y + 130 * s;
    ctx.save();
    ctx.translate(this.x, groundY);

    // 地面火海光晕
    ctx.beginPath();
    ctx.ellipse(0, 0, 140 * s, 26 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(234, 88, 12, ${a * 0.28})`;
    ctx.fill();

    // 地面同心金色阵法光纹
    ctx.beginPath();
    ctx.ellipse(0, 0, 105 * s, 18 * s, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(251, 191, 36, ${a * 0.65})`;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, 68 * s, 11 * s, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.85})`;
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // 古神殿遗迹立柱剪影 (左右各一座古老残柱石台)
    ctx.fillStyle = `rgba(38, 38, 38, ${a * 0.75})`;
    // 左石柱
    ctx.fillRect(-85 * s, -28 * s, 14 * s, 28 * s);
    ctx.fillRect(-90 * s, -33 * s, 24 * s, 5 * s); // 柱顶
    // 右石柱
    ctx.fillRect(71 * s, -28 * s, 14 * s, 28 * s);
    ctx.fillRect(66 * s, -33 * s, 24 * s, 5 * s); // 柱顶

    // 柱脚跳动的烈焰舌尖 (Flame Tongues)
    const flameCount = 9;
    for (let i = 0; i < flameCount; i++) {
      const fx = (i / (flameCount - 1) - 0.5) * 160 * s;
      const flameH = (12 + Math.sin(this.age * 0.25 + i * 1.5) * 7) * s;
      ctx.beginPath();
      ctx.moveTo(fx - 6 * s, 0);
      ctx.quadraticCurveTo(fx, -flameH, fx + 6 * s, 0);
      ctx.closePath();
      ctx.fillStyle = (i % 2 === 0)
        ? `rgba(239, 68, 68, ${a * 0.72})`
        : `rgba(245, 158, 11, ${a * 0.82})`;
      ctx.fill();
    }

    ctx.restore();
  }

  // 3. 身后悬浮的璀璨古代金色魔法阵与符文法阵
  _drawRunicMagicCircle(ctx, a) {
    ctx.save();
    ctx.translate(0, 10);
    ctx.rotate(this.magicCircleRot);

    // 脉冲能量波
    const pulse = 1.0 + Math.sin(this.age * 0.06) * 0.05;
    const rOuter = 76 * pulse;
    const rMid = 62 * pulse;
    const rInner = 44 * pulse;

    // 外层炽金能量光晕
    ctx.beginPath();
    ctx.arc(0, 0, rOuter * 1.08, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(245, 158, 11, ${a * 0.18})`;
    ctx.fill();

    // 外层主阵环 (双线金环)
    ctx.beginPath();
    ctx.arc(0, 0, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.92})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, rOuter - 6, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(245, 158, 11, ${a * 0.75})`;
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // 环带神秘古老符文刻印 (每 22.5 度镌刻一道古老符文几何记号)
    const runeCount = 16;
    for (let i = 0; i < runeCount; i++) {
      const ra = (i / runeCount) * Math.PI * 2;
      ctx.save();
      ctx.rotate(ra);
      ctx.translate(0, -rOuter + 3);
      ctx.beginPath();
      ctx.moveTo(-2, -2);
      ctx.lineTo(2, 2);
      ctx.moveTo(2, -2);
      ctx.lineTo(-2, 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.85})`;
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.restore();
    }

    // 中层八角芒星阵 (两个相互正交 45 度的正方形)
    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.82})`;
    ctx.lineWidth = 1.2;
    for (let sq = 0; sq < 2; sq++) {
      ctx.save();
      ctx.rotate(sq * (Math.PI / 4));
      ctx.beginPath();
      const halfSize = rMid * 0.707;
      ctx.rect(-halfSize, -halfSize, halfSize * 2, halfSize * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 内层太阳光齿轮环
    ctx.beginPath();
    ctx.arc(0, 0, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(251, 191, 36, ${a * 0.90})`;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    const teethCount = 12;
    for (let i = 0; i < teethCount; i++) {
      const ta = (i / teethCount) * Math.PI * 2;
      ctx.save();
      ctx.rotate(ta);
      ctx.beginPath();
      ctx.moveTo(0, -rInner);
      ctx.lineTo(-2.5, -rInner + 5);
      ctx.lineTo(2.5, -rInner + 5);
      ctx.closePath();
      ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.92})`;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  // 4. 头顶神圣金色光环与太阳日冕 (Divine Solar Halo & God Rays)
  _drawSolarHalo(ctx, a) {
    ctx.save();
    ctx.translate(0, -32); // 悬浮于凤首正后方

    const haloPulse = 1.0 + Math.sin(this.age * 0.08) * 0.08;
    const rHalo = 22 * haloPulse;

    // 白金日盘光核
    ctx.beginPath();
    ctx.arc(0, 0, rHalo * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(245, 158, 11, ${a * 0.35})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, rHalo, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.85})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, rHalo * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.98})`;
    ctx.fill();

    // 8 芒放射状太阳圣光刺 (Radial God Rays)
    const rayCount = 8;
    const rayRot = this.age * 0.02;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + rayRot;
      const rayLen = (i % 2 === 0 ? 38 : 26) * haloPulse;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-2.5, -rHalo * 0.8);
      ctx.lineTo(0, -rayLen);
      ctx.lineTo(2.5, -rHalo * 0.8);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.92})`;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  // 5. 巨大华丽展开的双翼 (Massive Multi-Tiered Sweeping Wings)
  _drawGrandWings(ctx, flap, a) {
    // 左翼与右翼对称镜像
    this._drawSingleWing(ctx, -1, flap, a);
    this._drawSingleWing(ctx, 1, flap, a);
  }

  _drawSingleWing(ctx, side, flap, a) {
    ctx.save();
    // 翅根连接点
    ctx.translate(side * 10, 4);
    // 扇翅旋转：优雅慢速大开大合
    ctx.rotate(side * (flap * 0.28 - 0.20));

    // === 【第 1 阶：外层 9 支主飞羽 (Primary Flight Feathers)】===
    // 巨大、刀锋向上扬起如新月烈焰弧线
    const primaryFeathers = [
      { len: 52, angle: -0.22, w: 10 },
      { len: 72, angle: -0.45, w: 12 },
      { len: 94, angle: -0.72, w: 13 },
      { len: 112, angle: -1.02, w: 14 }, // 主翼梢顶峰（极度张扬高耸）
      { len: 102, angle: -1.25, w: 13 },
      { len: 88, angle: -1.48, w: 12 },
      { len: 74, angle: -1.68, w: 11 },
      { len: 60, angle: -1.88, w: 10 },
      { len: 46, angle: -2.08, w: 9 }
    ];

    for (const f of primaryFeathers) {
      ctx.save();
      ctx.scale(side, 1.0);
      ctx.rotate(f.angle);

      // 单羽贝塞尔火焰刃形
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-f.w * 0.8, -f.len * 0.45, -f.w * 0.5, -f.len * 0.85, 0, -f.len);
      ctx.bezierCurveTo(f.w * 0.5, -f.len * 0.85, f.w * 0.8, -f.len * 0.45, 0, 0);
      ctx.closePath();

      // 底层南明深红与朱雀赤焰渐变
      ctx.fillStyle = `rgba(220, 38, 38, ${a * 0.90})`;
      ctx.fill();

      // 羽中赤金流光
      ctx.strokeStyle = `rgba(245, 158, 11, ${a * 0.95})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // 羽梢高光
      ctx.beginPath();
      ctx.moveTo(0, -f.len * 0.25);
      ctx.lineTo(0, -f.len * 0.92);
      ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.98})`;
      ctx.lineWidth = 1.0;
      ctx.stroke();

      ctx.restore();
    }

    // === 【第 2 阶：中层 7 支赤金次羽 (Secondary Feathers)】===
    const secondaryFeathers = [
      { len: 44, angle: -0.35, w: 9 },
      { len: 60, angle: -0.62, w: 10 },
      { len: 76, angle: -0.92, w: 11 },
      { len: 82, angle: -1.18, w: 11 },
      { len: 70, angle: -1.42, w: 10 },
      { len: 58, angle: -1.65, w: 9 },
      { len: 42, angle: -1.88, w: 8 }
    ];

    for (const sf of secondaryFeathers) {
      ctx.save();
      ctx.scale(side, 1.0);
      ctx.rotate(sf.angle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-sf.w * 0.7, -sf.len * 0.4, -sf.w * 0.4, -sf.len * 0.8, 0, -sf.len);
      ctx.bezierCurveTo(sf.w * 0.4, -sf.len * 0.8, sf.w * 0.7, -sf.len * 0.4, 0, 0);
      ctx.closePath();

      ctx.fillStyle = `rgba(245, 158, 11, ${a * 0.95})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.98})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();
    }

    // === 【第 3 阶：内层白金覆羽 (Covert Feathers)】===
    ctx.save();
    ctx.scale(side, 1.0);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-24, -18, -48, -22, -54, 4);
    ctx.bezierCurveTo(-38, 16, -18, 14, 0, 5);
    ctx.closePath();
    ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.98})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 255, 255, ${a * 0.98})`;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // 6. 神鸟躯体、护胸羽鳞与纯金帝王利爪
  _drawBodyAndTalons(ctx, a) {
    ctx.save();

    // 凤身流线雄浑躯干
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.bezierCurveTo(13, -10, 12, 14, 0, 26);
    ctx.bezierCurveTo(-12, 14, -13, -10, 0, -18);
    ctx.closePath();
    ctx.fillStyle = `rgba(245, 158, 11, ${a * 0.98})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.92})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 胸前纯金护心羽鳞 (3 层重叠护心龙凤鳞)
    const chestScales = [
      { y: -6, r: 7.5, color: '#f59e0b' },
      { y: 3, r: 6.2, color: '#fbbf24' },
      { y: 11, r: 4.8, color: '#fef08a' }
    ];
    for (const cs of chestScales) {
      ctx.beginPath();
      ctx.arc(0, cs.y, cs.r, 0, Math.PI * 2);
      ctx.fillStyle = cs.color;
      ctx.globalAlpha = a * 0.98;
      ctx.fill();
    }

    // 腹下收拢的纯金帝王利爪 (左右双爪)
    for (const clawSide of [-1, 1]) {
      ctx.save();
      ctx.translate(clawSide * 6.5, 22);
      ctx.scale(clawSide, 1.0);

      // 腿胫
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-2, 6);
      ctx.strokeStyle = `rgba(245, 158, 11, ${a * 0.95})`;
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // 三趾钩爪
      ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.98})`;
      ctx.lineWidth = 1.5;
      // 中趾
      ctx.beginPath();
      ctx.moveTo(-2, 6);
      ctx.quadraticCurveTo(-4, 11, -2, 13);
      ctx.stroke();
      // 外趾
      ctx.beginPath();
      ctx.moveTo(-2, 6);
      ctx.quadraticCurveTo(-7, 9, -6, 11);
      ctx.stroke();
      // 内趾
      ctx.beginPath();
      ctx.moveTo(-2, 6);
      ctx.quadraticCurveTo(0, 9, 1, 11);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  // 7. 昂首向天啼鸣神凤首、烈焰神羽冠与纯白神性目
  _drawHeadAndBeak(ctx, a) {
    ctx.save();
    ctx.translate(0, -22); // 凤首位置

    // 昂首长颈连接弧线
    ctx.beginPath();
    ctx.moveTo(-5, 8);
    ctx.quadraticCurveTo(-6, 0, -3.5, -6);
    ctx.lineTo(3.5, -6);
    ctx.quadraticCurveTo(6, 0, 5, 8);
    ctx.closePath();
    ctx.fillStyle = `rgba(245, 158, 11, ${a * 0.98})`;
    ctx.fill();

    // 凤首主体
    ctx.beginPath();
    ctx.arc(0, -8, 8.0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(251, 191, 36, ${a * 0.98})`;
    ctx.fill();

    // 昂首向天啼鸣的张开金喙 (Open Golden Beak Crying to Heaven)
    // 上喙
    ctx.beginPath();
    ctx.moveTo(-2.5, -12);
    ctx.lineTo(0, -20);
    ctx.lineTo(3.5, -13);
    ctx.closePath();
    ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.98})`;
    ctx.fill();
    // 下喙 (微张)
    ctx.beginPath();
    ctx.moveTo(-1.8, -10);
    ctx.lineTo(2.0, -15);
    ctx.lineTo(3.0, -10);
    ctx.closePath();
    ctx.fillStyle = `rgba(245, 158, 11, ${a * 0.95})`;
    ctx.fill();
    // 口中吐出的一缕白金炽炎
    ctx.beginPath();
    ctx.arc(0.5, -16, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.98})`;
    ctx.fill();

    // 向后飘扬的烈焰凤冠神羽 (5 道长短不一的华丽飞扬冠羽)
    const crestFeathers = [
      { cp1x: -4, cp1y: -18, tox: -8, toy: -30, color: '#ef4444', w: 2.2 },
      { cp1x: -1, cp1y: -22, tox: -2, toy: -35, color: '#f59e0b', w: 2.6 },
      { cp1x: 2, cp1y: -20, tox: 4, toy: -33, color: '#fef08a', w: 2.4 },
      { cp1x: 5, cp1y: -18, tox: 9, toy: -28, color: '#ef4444', w: 2.0 },
      { cp1x: -7, cp1y: -14, tox: -13, toy: -24, color: '#dc2626', w: 1.8 }
    ];

    for (const cf of crestFeathers) {
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.quadraticCurveTo(cf.cp1x, cf.cp1y, cf.tox, cf.toy);
      ctx.strokeStyle = cf.color;
      ctx.lineWidth = cf.w;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 冠羽顶端灵动白金火花
      ctx.beginPath();
      ctx.arc(cf.tox, cf.toy, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // 纯白神性凤眼与金色眼芒
    ctx.beginPath();
    ctx.arc(-3.2, -8.5, 1.5, 0, Math.PI * 2);
    ctx.arc(3.2, -8.5, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }

  // 8. 世界坐标系：华丽 7 道多阶流光凤翎长尾 (7 Cascading Tail Plumes)
  _renderTails(ctx, s, a) {
    for (const tail of this.tails) {
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
      ctx.globalAlpha = a * 0.88;
      ctx.lineWidth = tail.width * s;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 尾梢凤翎眼斑 (Peacock/Phoenix Eye Feather)
      const tipNode = nodes[nodes.length - 1];
      if (tipNode) {
        // 外圈赤红神晕
        ctx.beginPath();
        ctx.arc(tipNode.x, tipNode.y, 6.2 * s, 0, Math.PI * 2);
        ctx.fillStyle = tail.eyeColor;
        ctx.fill();

        // 中圈明耀纯金
        ctx.beginPath();
        ctx.arc(tipNode.x, tipNode.y, 3.8 * s, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        // 核心白金神目
        ctx.beginPath();
        ctx.arc(tipNode.x, tipNode.y, 1.8 * s, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      ctx.restore();
    }
  }
}
