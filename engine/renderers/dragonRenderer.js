// utils/dragonRenderer.js

/**
 * 腾讯游戏设计级 · 东方神游九天金龙 (Celestial Golden Dragon 戏珠典藏版)
 * 零第三方依赖 · 纯原生 Canvas 2D 骨骼逆向动力学 (IK) 与多层流体光晕
 * 视觉特征升级：
 * 1. 紧凑灵动体态：尺寸缩减 ~28%，告别过粗拥挤，身法如行云流水般轻盈矫健；
 * 2. 凌空戏龙金珠 (Celestial Flaming Pearl)：龙头前方引路腾飞的炽焰龙珠，散发耀目光晕与星火；
 * 3. 逼真东方龙容貌：
 *    - 驼头鹿角：三叉珊瑚玉角与额前炽金神印；
 *    - 龙吻尖獠：雕琢龙鼻、龙须根、上下白金微獠牙与颔下龙髯；
 *    - 飘逸双长金须：多节贝塞尔流体飘拂，迎风倒掠起伏；
 *    - 龙身金鳞与背鬃：弧形精细金鳞，背脊交错烈焰流云鳍；
 *    - 腾云划水四爪：利爪指节分明，带金爪光晕破云前行；
 *    - 凤尾炽火拖尾：羽化凤火尾扇，沿途洒落 24K 金粉星屑。
 */

export class GoldenDragon {
  constructor(x, y) {
    this.headX = x;
    this.headY = y;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = -3.4; // 向上腾飞主速度

    this.age = 0;
    this.maxAge = 195; // 约 3.2 秒完整升腾与羽化生命周期
    this.alpha = 0;
    this.scale = 0.72; // 精致比例：更紧凑灵动

    // 32 节灵巧游龙骨骼
    this.numNodes = 32;
    this.nodeDist = 6.8; // 骨节间距缩减，身形更加柔和紧实
    this.nodes = [];

    // 初始化脊柱节点沿垂直向下方排列 (更纤细优美的流线体态)
    for (let i = 0; i < this.numNodes; i++) {
      let r = 9.0;
      if (i === 0) r = 9.5; // 龙首
      else if (i <= 4) r = 9.5 + i * 0.55; // 龙颈
      else if (i <= 13) r = 12.0; // 胸腔龙躯最大饱满处
      else if (i <= 22) r = 12.0 - (i - 13) * 0.38; // 腹腰收紧
      else r = Math.max(1.8, 8.5 - (i - 22) * 0.65); // 渐细灵动龙尾

      this.nodes.push({
        x: x,
        y: y + i * this.nodeDist,
        angle: -Math.PI / 2,
        radius: r
      });
    }

    // 随机初始相位 (让每一次出龙呈现独一无二的盘旋轨迹)
    this.wavePhase = Math.random() * Math.PI * 2;
    this.lateralAmp = 2.8 + Math.random() * 0.6;

    // 3D 螺旋盘旋轨迹与身体轴向自转系统 (Helical Climb & Body Axial Roll)
    this.spiralAngle = Math.random() * Math.PI * 2;
    this.spiralSpeed = 0.055;
    this.rollAngle = 0;
    this.rollSpeed = 0.082; // 身体轴向自转速度

    // 戏龙金珠状态
    this.pearlX = x;
    this.pearlY = y - 32;
    this.pearlRot = 0;
    this.pearlOrbitAngle = Math.random() * Math.PI * 2;
  }

  // 动力学更新
  update(screenH, ceilingY, emitParticleCallback) {
    this.age++;

    // 1. 龙首 3D 螺旋升腾与盘旋轨迹动力学 (True 3D Corkscrew Flight)
    this.vy = Math.max(-5.0, this.vy - 0.010);
    this.spiralAngle += this.spiralSpeed;
    this.rollAngle += this.rollSpeed;

    const spiralRadius = 26 + Math.sin(this.age * 0.035) * 8; // 动态放缩的盘旋半径
    const spiralVx = -Math.sin(this.spiralAngle) * (spiralRadius * this.spiralSpeed);
    const spiralVy = Math.cos(this.spiralAngle) * 0.55;
    const microWobbleX = Math.sin(this.age * 0.12 + this.wavePhase) * 1.2;

    this.headX += spiralVx + microWobbleX + this.vx;
    this.headY += this.vy + spiralVy;

    // 2. 脊柱多骨节逆向动力学 (IK Follow) 与 3D 轴向自转传递
    this.nodes[0].x = this.headX;
    this.nodes[0].y = this.headY;
    this.nodes[0].roll = this.rollAngle;

    for (let i = 1; i < this.numNodes; i++) {
      const prev = this.nodes[i - 1];
      const cur = this.nodes[i];

      let dx = cur.x - prev.x;
      let dy = cur.y - prev.y;
      let angle = Math.atan2(dy, dx);
      if (isNaN(angle)) angle = -Math.PI / 2;

      cur.x = prev.x + Math.cos(angle) * this.nodeDist;
      cur.y = prev.y + Math.sin(angle) * this.nodeDist;
      cur.angle = angle;

      // 叠加脊椎传播波动 (灵动S形波浪自头向尾推进)
      const travelWave = Math.sin(this.age * 0.14 - i * 0.28 + this.wavePhase) * (0.9 + i * 0.05);
      const perpAngle = angle + Math.PI / 2;
      cur.x += Math.cos(perpAngle) * travelWave;
      cur.y += Math.sin(perpAngle) * travelWave;

      // 身体轴向自转相位沿脊柱螺旋传播 (Axial Roll Wave)
      cur.roll = this.rollAngle + i * 0.26;
      cur.depthZ = Math.cos(cur.roll); // 3D 空间深度
    }

    // 3. 戏龙金珠先行引导位姿 (3D 围绕龙头盘旋戏珠)
    this.pearlOrbitAngle += 0.10;
    const headAngle = Math.atan2(this.nodes[0].y - this.nodes[1].y, this.nodes[0].x - this.nodes[1].x);
    const pearlDist = 28;
    const pearlOrbitX = Math.cos(this.pearlOrbitAngle) * 14;
    const pearlOrbitY = Math.sin(this.pearlOrbitAngle) * 8;
    this.pearlX = this.headX + Math.cos(headAngle) * pearlDist + pearlOrbitX;
    this.pearlY = this.headY + Math.sin(headAngle) * pearlDist + pearlOrbitY;
    this.pearlRot += 0.08;

    // 4. 飞行途中的龙鳞火星脱落与祥云金气吐纳
    if (typeof emitParticleCallback === 'function' && this.age % 2 === 0) {
      // 龙珠与龙吻前端洒落纯金碎屑
      emitParticleCallback({
        x: this.pearlX + (Math.random() - 0.5) * 10,
        y: this.pearlY + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.8,
        vy: Math.random() * 0.6 + 0.2,
        radius: 1.2 + Math.random() * 1.2,
        alpha: 0.95,
        maxLife: 55,
        color: '#ffffff',
        isGold: true,
        shimmerPhase: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.22
      });

      // 随机选取龙躯节点脱落金芒火星
      const dropNodeIdx = Math.floor(Math.random() * (this.numNodes - 4)) + 2;
      const targetNode = this.nodes[dropNodeIdx];
      if (targetNode) {
        emitParticleCallback({
          x: targetNode.x + (Math.random() - 0.5) * 8,
          y: targetNode.y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.8,
          vy: Math.random() * 0.6 - 0.2,
          radius: 1.1 + Math.random() * 1.1,
          alpha: 0.92,
          maxLife: 60,
          color: Math.random() < 0.6 ? '#fef08a' : '#fbbf24',
          isGold: true,
          shimmerPhase: Math.random() * Math.PI * 2,
          shimmerSpeed: 0.18
        });
      }

      // 龙尾星河解体瀑布 (Tail dissolving stardust waterfall)
      const tailIdx = this.numNodes - 1 - Math.floor(Math.random() * 5);
      const tailNode = this.nodes[tailIdx];
      if (tailNode) {
        emitParticleCallback({
          x: tailNode.x + (Math.random() - 0.5) * 10,
          y: tailNode.y + Math.random() * 6,
          vx: (Math.random() - 0.5) * 1.2,
          vy: Math.random() * 1.2 + 0.6,
          radius: 1.1 + Math.random() * 1.5,
          alpha: this.alpha * 0.92,
          baseAlpha: 0.92,
          life: 0,
          maxLife: 45 + Math.random() * 25,
          color: Math.random() < 0.55 ? '#fef08a' : (Math.random() < 0.85 ? '#fbbf24' : '#ffffff'),
          isGold: true,
          shimmerPhase: Math.random() * Math.PI * 2,
          shimmerSpeed: 0.22
        });
      }
    }

    // 5. 透明度渐变 (破雾而出 ➔ 盛世金芒 ➔ 羽化升仙)
    if (this.age < 16) {
      this.alpha = Math.sin((this.age / 16) * (Math.PI / 2));
    } else if (this.age > 130) {
      this.alpha = Math.max(0, 1.0 - (this.age - 130) / (this.maxAge - 130));
    } else {
      this.alpha = 1.0;
    }

    // 升至接近顶端安全屏障时平滑羽化消散
    if (this.headY < (ceilingY || 40) + 110) {
      const topFade = Math.max(0, (this.headY - (ceilingY || 40)) / 110);
      this.alpha *= topFade;
    }

    return this.age < this.maxAge && this.alpha > 0.005;
  }

  // 渲染金龙整躯与戏珠
  render(ctx) {
    if (this.alpha <= 0.005 || !this.nodes.length) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;

    // ==========================================
    // 0. 戏龙金珠 (Celestial Flaming Dragon Pearl - 凌空引路)
    // ==========================================
    this.renderFlamingPearl(ctx);

    // ==========================================
    // 1. 金龙外层全息流体金光气晕 (Golden Aura Envelope - 精简细腻)
    // ==========================================
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
    for (let i = 1; i < this.numNodes; i++) {
      ctx.lineTo(this.nodes[i].x, this.nodes[i].y);
    }
    ctx.lineWidth = 22; // 缩减光晕宽度，视觉更聚焦
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = `rgba(245, 158, 11, ${0.16 * this.alpha})`;
    ctx.stroke();
    ctx.restore();

    // ==========================================
    // 2. 龙躯层叠金色缎带管体 (Tapered Golden Body Segments)
    // ==========================================
    for (let i = this.numNodes - 1; i >= 1; i--) {
      const p1 = this.nodes[i - 1];
      const p2 = this.nodes[i];
      const avgR = (p1.radius + p2.radius) * 0.5;

      ctx.save();
      // 外层深金琥珀底色
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = avgR * 1.8;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.90)';
      ctx.stroke();

      // 中层帝王黄金缎体
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = avgR * 1.30;
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();

      // 脊梁高光纯金炽线 (随身体自转在圆柱体表面滑动)
      const roll1 = p1.roll || 0;
      const roll2 = p2.roll || 0;
      const rollOffset1 = Math.sin(roll1) * (avgR * 0.45);
      const rollOffset2 = Math.sin(roll2) * (avgR * 0.45);
      const p1Perp = p1.angle + Math.PI / 2;
      const p2Perp = p2.angle + Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(p1.x + Math.cos(p1Perp) * rollOffset1, p1.y + Math.sin(p1Perp) * rollOffset1);
      ctx.lineTo(p2.x + Math.cos(p2Perp) * rollOffset2, p2.y + Math.sin(p2Perp) * rollOffset2);
      ctx.lineWidth = avgR * 0.55;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();

      // 龙脊中心极细白金光刃
      ctx.beginPath();
      ctx.moveTo(p1.x + Math.cos(p1Perp) * rollOffset1, p1.y + Math.sin(p1Perp) * rollOffset1);
      ctx.lineTo(p2.x + Math.cos(p2Perp) * rollOffset2, p2.y + Math.sin(p2Perp) * rollOffset2);
      ctx.lineWidth = Math.max(0.8, avgR * 0.18);
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.restore();
    }

    // ==========================================
    // 3. 金龙璀璨弧形龙鳞纹理 (Golden Scale Textures)
    // ==========================================
    for (let i = 2; i < this.numNodes - 3; i += 2) {
      const node = this.nodes[i];
      const scaleW = node.radius * 0.78;

      ctx.save();
      ctx.translate(node.x, node.y);
      ctx.rotate(node.angle + Math.PI / 2);
      ctx.beginPath();
      ctx.arc(0, 0, scaleW, -0.65, 0.65);
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.72)';
      ctx.stroke();
      ctx.restore();
    }

    // ==========================================
    // 4. 背脊炽火龙鳍 (Dorsal Flame Fins - 随身体自转 360° 翻滚回旋)
    // ==========================================
    for (let i = 2; i < this.numNodes - 4; i += 3) {
      const node = this.nodes[i];
      const finFlutter = Math.sin(this.age * 0.25 + i * 0.4) * 2.2;
      const rollPhase = node.roll || (this.rollAngle + i * 0.26);
      const rollSide = Math.sin(rollPhase); // 侧向翻转分量 (-1 ~ +1)
      const rollDepth = Math.cos(rollPhase); // 空间深度分量 (+1 前景, -1 后景)

      // 鳍的角度随身体自转在脊背两侧自如切换，产生逼真3D翻滚感
      const finAngle = node.angle + Math.PI / 2 + rollSide * (Math.PI * 0.48);
      const finLen = (node.radius * 1.35 + finFlutter) * (0.65 + Math.abs(rollSide) * 0.45);

      ctx.save();
      ctx.translate(node.x, node.y);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        Math.cos(finAngle) * finLen * 0.6,
        Math.sin(finAngle) * finLen * 0.6,
        Math.cos(finAngle) * finLen,
        Math.sin(finAngle) * finLen
      );
      ctx.lineTo(Math.cos(finAngle - 0.25) * (finLen * 0.38), Math.sin(finAngle - 0.25) * (finLen * 0.38));
      ctx.closePath();
      // 在前景侧为纯金高光，在后景侧为深琥珀色
      ctx.fillStyle = rollDepth > 0 ? '#fef08a' : '#d97706';
      ctx.fill();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = rollDepth > 0 ? '#ffffff' : '#f59e0b';
      ctx.stroke();
      ctx.restore();
    }

    // ==========================================
    // 4.5 环绕金龙躯干的 3D 螺旋星尘缎带 (Corkscrew Orbiting Stardust Ribbon)
    // ==========================================
    this.renderCorkscrewStardustRibbon(ctx);

    // ==========================================
    // 5. 四足金龙利爪 (Four Divine Claws - 腾云划动)
    // ==========================================
    this.renderClaw(ctx, this.nodes[7], -1, 0.70); // 左前爪
    this.renderClaw(ctx, this.nodes[7], 1, 0.70);  // 右前爪
    this.renderClaw(ctx, this.nodes[18], -1, 0.62); // 左后爪
    this.renderClaw(ctx, this.nodes[18], 1, 0.62);  // 右后爪

    // ==========================================
    // 6. 凤羽炽火龙尾 (Blazing Dragon Tail Tuft)
    // ==========================================
    const tailNode = this.nodes[this.numNodes - 1];
    const tailPrev = this.nodes[this.numNodes - 2];
    const tailAngle = Math.atan2(tailNode.y - tailPrev.y, tailNode.x - tailPrev.x);

    ctx.save();
    ctx.translate(tailNode.x, tailNode.y);
    ctx.rotate(tailAngle);

    const plumes = [-0.42, -0.14, 0.14, 0.42];
    for (let k = 0; k < plumes.length; k++) {
      const pAngle = plumes[k];
      const plumeWiggle = Math.sin(this.age * 0.25 + k * 0.6) * 4.5;
      const plumeLen = 18 + Math.abs(pAngle) * 6 + plumeWiggle;

      ctx.save();
      ctx.rotate(pAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(plumeLen * 0.4, -3, plumeLen * 0.75, 3, plumeLen, 0);
      ctx.bezierCurveTo(plumeLen * 0.65, 4.5, plumeLen * 0.3, 2, 0, 0);
      ctx.fillStyle = k % 2 === 0 ? '#f59e0b' : '#fef08a';
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // ==========================================
    // 7. 威严游龙首级 (The Majestic Dragon Head - 带 3D 自转侧倾角)
    // ==========================================
    const headNode = this.nodes[0];
    const neckNode = this.nodes[1];
    const headAngleDirect = Math.atan2(headNode.y - neckNode.y, headNode.x - neckNode.x) + Math.PI / 2;
    const headBank = Math.sin(this.rollAngle) * 0.28; // 龙首自转侧倾角

    ctx.save();
    ctx.translate(headNode.x, headNode.y);
    ctx.rotate(headAngleDirect + headBank * 0.25);
    ctx.scale(1.0 - Math.abs(headBank) * 0.12, 1.0); // 3D 侧视轻微透视形变

    // 7.1 分叉珊瑚金角 (Branching Golden Antlers)
    this.renderAntler(ctx, -1); // 左角
    this.renderAntler(ctx, 1);  // 右角

    // 7.2 龙首面部轮廓与龙吻 (Dragon Snout, Jaws & Fangs)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-8, -1);
    ctx.quadraticCurveTo(-10, -11, -5, -16); // 左腮至吻部
    ctx.lineTo(5, -16); // 龙吻前端
    ctx.quadraticCurveTo(10, -11, 8, -1);   // 右吻至右腮
    ctx.quadraticCurveTo(0, 3, -8, -1);     // 龙颔底部
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // 龙鼻孔微孔与呼吸流光
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(-2.5, -14, 1.0, 0.6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(2.5, -14, 1.0, 0.6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 上下微露白金龙牙 (Fangs)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-4, -15); ctx.lineTo(-3, -11); ctx.lineTo(-2, -15); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, -15); ctx.lineTo(3, -11); ctx.lineTo(4, -15); ctx.fill();

    // 额心炽焰神符
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(-2.2, -8);
    ctx.lineTo(0, -3);
    ctx.lineTo(2.2, -8);
    ctx.closePath();
    ctx.fillStyle = '#fef08a';
    ctx.fill();

    // 颔下龙髯 (Chin Beard)
    ctx.beginPath();
    ctx.moveTo(-3, 2);
    ctx.quadraticCurveTo(0, 10 + Math.sin(this.age * 0.2) * 2, 3, 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
    ctx.restore();

    // 7.3 金光龙目火瞳 (Piercing Golden Eyes)
    ctx.save();
    // 左目
    ctx.beginPath();
    ctx.ellipse(-4.5, -9.5, 2.6, 1.4, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-4.5, -9.5, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = '#78350f';
    ctx.fill();

    // 右目
    ctx.beginPath();
    ctx.ellipse(4.5, -9.5, 2.6, 1.4, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4.5, -9.5, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = '#78350f';
    ctx.fill();
    ctx.restore();

    // 7.4 飘逸双长金须 (Long Fluid Golden Whiskers)
    this.renderWhisker(ctx, -1);
    this.renderWhisker(ctx, 1);

    ctx.restore(); // 恢复龙首坐标系

    ctx.restore(); // 恢复全图上下文
  }

  // 绘制凌空戏龙金珠 (Celestial Flaming Dragon Pearl)
  renderFlamingPearl(ctx) {
    ctx.save();
    ctx.translate(this.pearlX, this.pearlY);
    ctx.rotate(this.pearlRot);

    // 1. 外层 4 瓣旋转炽焰流火 (Solar Prominence Flares)
    for (let f = 0; f < 4; f++) {
      ctx.save();
      ctx.rotate((f * Math.PI) / 2);
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.quadraticCurveTo(4, -12, 1, -18);
      ctx.quadraticCurveTo(-1, -12, 0, -6);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.65)';
      ctx.fill();
      ctx.restore();
    }

    // 2. 核心炽金明珠光球
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 5.0, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();

    // 3. 珠心纯白耀斑晶体
    ctx.beginPath();
    ctx.arc(-1.5, -1.5, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 4. 四芒星光芒 (Cross Diamond Flare)
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(0, 10);
    ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.stroke();

    ctx.restore();
  }

  // 绘制单只金爪 (随身体自转立体划动)
  renderClaw(ctx, node, side, scale) {
    if (!node) return;
    const rollPhase = (node.roll || 0) + (side > 0 ? 0 : Math.PI);
    const rollAngleOffset = Math.sin(rollPhase) * 0.32;
    const clawAngle = node.angle + (side * Math.PI * 0.42) + rollAngleOffset;
    const strokeWiggle = Math.sin(this.age * 0.22 + side) * 0.25;
    const finalAngle = clawAngle + strokeWiggle;
    const armLen = 13 * scale * (0.8 + Math.abs(Math.cos(rollPhase)) * 0.28);

    ctx.save();
    ctx.translate(node.x, node.y);
    ctx.rotate(finalAngle);

    // 上臂
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(armLen * 0.6, 0);
    ctx.lineWidth = 2.8 * scale;
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    // 前臂
    ctx.beginPath();
    ctx.moveTo(armLen * 0.6, 0);
    ctx.lineTo(armLen, 1.5 * scale);
    ctx.lineWidth = 2.2 * scale;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // 3 趾弯钩金鹰利爪
    const talons = [-0.35, 0, 0.35];
    for (const t of talons) {
      ctx.save();
      ctx.translate(armLen, 1.5 * scale);
      ctx.rotate(t);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(3 * scale, 1 * scale, 5.5 * scale, 3 * scale);
      ctx.lineWidth = 1.1 * scale;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // 绘制单侧分叉金角
  renderAntler(ctx, side) {
    ctx.save();
    ctx.translate(side * 4, 1);
    ctx.rotate(side * 0.42);

    // 主角干
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(side * 5, 8, side * 8, 16, side * 11, 22);
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // 次角分叉 (Coral tine)
    ctx.beginPath();
    ctx.moveTo(side * 5, 9);
    ctx.quadraticCurveTo(side * 9, 11, side * 12, 14);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();
  }

  // 绘制单侧飘逸龙须
  renderWhisker(ctx, side) {
    const wave = Math.sin(this.age * 0.18 + side * 1.2) * 6;
    const wave2 = Math.cos(this.age * 0.14) * 4.5;

    ctx.save();
    ctx.translate(side * 4, -14); // 须根位于龙吻鼻翼两侧

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      side * 11, -5 + wave2,
      side * 18, 14 + wave,
      side * 22 + wave, 42
    );
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // 细尖微须
    ctx.beginPath();
    ctx.moveTo(side * 16, 26 + wave * 0.5);
    ctx.quadraticCurveTo(side * 20, 36, side * 22 + wave, 42);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.restore();
  }

  // 环绕金龙躯干的 3D 螺旋星尘缎带 (Corkscrew Orbiting Stardust Ribbon)
  renderCorkscrewStardustRibbon(ctx) {
    if (!this.nodes || this.nodes.length < 5) return;
    ctx.save();

    const spiralPoints = [];
    for (let i = 0; i < this.numNodes; i++) {
      const node = this.nodes[i];
      const spineAngle = node.angle;
      const perpAngle = spineAngle + Math.PI / 2;

      // 沿龙身行进的螺旋相位 (与身体自转角动量深度耦合)
      const phase = (this.rollAngle || 0) * 2.0 + i * 0.42;
      const radius = node.radius + 9.5;

      const normalOffset = Math.sin(phase) * radius;
      const depthZ = Math.cos(phase); // 3D 深度：>0 在龙身前方，<0 在龙身后方

      const px = node.x + Math.cos(perpAngle) * normalOffset;
      const py = node.y + Math.sin(perpAngle) * normalOffset;

      spiralPoints.push({ x: px, y: py, z: depthZ, i: i });
    }

    // 绘制螺旋缎带流光
    ctx.beginPath();
    ctx.moveTo(spiralPoints[0].x, spiralPoints[0].y);
    for (let i = 1; i < spiralPoints.length - 1; i++) {
      const xc = (spiralPoints[i].x + spiralPoints[i + 1].x) / 2;
      const yc = (spiralPoints[i].y + spiralPoints[i + 1].y) / 2;
      ctx.quadraticCurveTo(spiralPoints[i].x, spiralPoints[i].y, xc, yc);
    }
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = `rgba(254, 240, 138, ${this.alpha * 0.85})`;
    ctx.stroke();

    // 在螺旋波峰节点点缀闪烁的四芒星钻
    for (let i = 2; i < spiralPoints.length - 2; i += 3) {
      const sp = spiralPoints[i];
      if (sp.z > 0.25) { // 仅在龙身前方波峰闪耀，产生极强3D立体空间感
        const starSize = 2.4 + Math.sin(this.age * 0.2 + i) * 1.0;
        ctx.save();
        ctx.translate(sp.x, sp.y);
        ctx.beginPath();
        ctx.arc(0, 0, starSize, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }
}
