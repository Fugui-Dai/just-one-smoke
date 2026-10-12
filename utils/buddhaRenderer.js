// utils/buddhaRenderer.js

/**
 * 腾讯游戏设计总监级 · 佛光普照 · 梵天千叶金莲 (Buddha's Light & Celestial Golden Lotus 60FPS 神品典藏版)
 * 纯原生 Canvas 2D 硬件光栅化 · 零外部贴图依赖 · 零 CPU 高斯模糊 · 零 GC 对象池复用
 *
 * 六重佛国圣境华丽视觉体系（巨幅天穹展幅，直径达 270px~340px）：
 * 1. 【第一重 · 天顶普度万丈金辉与敦煌飞天璎珞绶带】：自苍穹倾泻的暖金佛光瑞束 + 双轨S形飞天流光金霞带与璎珞宝珠；
 * 2. 【第二重 · 峨眉金顶 · 五色祥瑞圆光与十六道万丈瑞芒】：白金、赤金、绯莲、琥珀多层呼吸佛光宝轮 + 16道旋转外放金芒；
 * 3. 【第三重 · 二十四摩尼宝珠环与八字真言描金法印】：外环镶嵌24颗摩尼舍利明珠，内环流转【卍·慈·悲·喜·捨·禅·悟·觉】朱砂描金莲印；
 * 4. 【第四重 · 大日如来八正道金刚法轮】：八辐金刚宝杵法轮与莲蕾外缘，与外盘逆向庄严自转；
 * 5. 【第五重 · 步步生莲 · 三层 3D 盛放千叶宝相金莲】：外层绯金宽瓣、中层帝王金莲瓣、内层羊脂白金莲芯随升腾逐层舒展绽放；
 * 6. 【第六重 · 佛心舍利 · 3D 刀刻鎏金【卍】字佛印与莲蕊金珠】：中央宝座凝聚立体烫金万字佛印，周天飘洒金莲花瓣与菩提金雨。
 */

export class BuddhaLightAscension {
  constructor(x, y, options = {}) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.vx = options.vx || 0;
    this.vy = 1.55; // 庄严沉稳、祥和恢弘的升腾速度
    this.age = 0;
    this.maxAge = 245; // 约 4.1 秒完整佛国圣境生命周期
    this.alpha = 0;

    // 多重法轮与金莲逆向视差自转角
    this.lotusRot = 0;       // 中央千叶金莲微幅顺转
    this.dharmaRot = 0;      // 八正道法轮顺转
    this.mantraRot = 0;      // 八字真言金环逆转
    this.rayRot = 0;         // 外围十六道万丈佛光慢速顺转

    // 殿堂级巨幅基础半径：初生 96px，随升腾绽放至 136px（连同万丈佛光瑞芒总跨度达 330px+）
    this.baseR = 96;

    // 梵音八字真言配置
    this.mantras = ['卍', '慈', '悲', '喜', '捨', '禅', '悟', '觉'];

    // 敦煌飞天双轨璎珞金绶带骨骼池 (Zero-GC 预分配 22 节)
    this.numRibbonNodes = 22;
    this.ribbonNodes = [];
    for (let i = 0; i < this.numRibbonNodes; i++) {
      this.ribbonNodes.push({ x: x, y: y, offsetA: 0, offsetB: 0 });
    }
  }

  update(screenH, ceilingY, emitParticleCallback) {
    this.age++;

    // 1. 生命周期透明度包络 (柔和破雾显圣 -> 万丈金辉 -> 顶空涅槃羽化)
    if (this.age < 26) {
      this.alpha = Math.sin((this.age / 26) * (Math.PI / 2));
    } else if (this.age > 178) {
      this.alpha = Math.max(0, 1.0 - (this.age - 178) / (this.maxAge - 178));
    } else {
      this.alpha = 1.0;
    }

    // 接近顶部安全屏障时平滑羽化
    const safeCeiling = (typeof ceilingY === 'number' && ceilingY > 0) ? ceilingY : 110;
    if (this.y < safeCeiling + 120) {
      const topFade = Math.max(0, (this.y - (safeCeiling + 15)) / 105);
      this.alpha *= topFade;
    }

    // 2. 空间升腾与多层法轮视差旋转
    this.x += this.vx + Math.sin(this.age * 0.032) * 0.30;
    this.y -= this.vy;
    this.vy = Math.max(1.10, this.vy * 0.996);

    this.lotusRot += 0.006;    // 宝相金莲庄严微转
    this.dharmaRot += 0.018;   // 八正道法轮顺转
    this.mantraRot -= 0.010;   // 真言金咒环逆转
    this.rayRot += 0.005;      // 万丈佛光瑞芒慢转

    // 3. 原地更新敦煌飞天双轨璎珞金绶带
    const curR = this._getCurrentRadius();
    for (let i = 0; i < this.numRibbonNodes; i++) {
      const node = this.ribbonNodes[i];
      const ratio = i / (this.numRibbonNodes - 1);
      node.y = this.y - curR * 0.50 + ratio * (curR * 2.05);
      const wavePhase = this.age * 0.075 - i * 0.30;
      const envWidth = Math.sin(ratio * Math.PI) * (curR * 1.12);
      node.x = this.x;
      node.offsetA = Math.sin(wavePhase) * envWidth;
      node.offsetB = -Math.sin(wavePhase) * envWidth;
    }

    // 4. 伴生漫天飘舞金莲花瓣与菩提舍利金雨 (每 3 帧释放花瓣与舍利金星)
    if (typeof emitParticleCallback === 'function' && this.age % 3 === 0 && this.alpha > 0.15) {
      const pAngle = Math.random() * Math.PI * 2;
      const pDist = curR * (0.35 + Math.random() * 0.85);
      const px = this.x + Math.cos(pAngle) * pDist;
      const py = this.y + Math.sin(pAngle) * (pDist * 0.65);

      if (this.age % 6 === 0) {
        // 飘舞的 3D 宝相金莲花瓣粒子
        emitParticleCallback({
          x: px,
          y: py,
          vx: Math.cos(pAngle) * (0.4 + Math.random() * 0.5),
          vy: -(0.85 + Math.random() * 0.65),
          radius: 5.5 + Math.random() * 3.0,
          alpha: this.alpha * 0.92,
          baseAlpha: 0.92,
          life: 0,
          maxLife: 68 + Math.random() * 28,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.06,
          swayPhase: Math.random() * Math.PI * 2,
          color: Math.random() < 0.65 ? '#fde047' : '#fb7185',
          isLotusPetal: true
        });
      } else {
        // 菩提舍利纯金星芒
        emitParticleCallback({
          x: px,
          y: py,
          vx: Math.cos(pAngle) * 0.5,
          vy: -(0.7 + Math.random() * 0.7),
          radius: 1.5 + Math.random() * 1.8,
          alpha: this.alpha * 0.95,
          baseAlpha: 0.95,
          life: 0,
          maxLife: 48 + Math.random() * 22,
          color: Math.random() < 0.7 ? '#fef08a' : '#fbbf24',
          isGold: true,
          shimmerPhase: Math.random() * Math.PI * 2,
          shimmerSpeed: 0.20
        });
      }
    }

    return (this.age < this.maxAge && this.alpha > 0.005);
  }

  _getCurrentRadius() {
    // 步步生莲绽放缓动：前 28 帧从 0.58 倍盛大舒展至 1.0 倍，随后持续呼吸扩张至 136px
    let bloom = 1.0;
    if (this.age < 28) {
      const t = this.age / 28;
      bloom = 0.58 + 0.42 * (1 - Math.pow(1 - t, 3));
    }
    const breath = Math.sin(this.age * 0.065) * 4.0;
    return (this.baseR + Math.min(40, this.age * 0.24) + breath) * bloom;
  }

  render(ctx) {
    if (this.alpha <= 0.005) return;

    const curR = this._getCurrentRadius();
    const a = this.alpha;

    ctx.save();

    // ==========================================
    // 1. 第一重：天顶普度万丈佛光柱 & 敦煌飞天双轨璎珞金绶带 (World Space)
    // ==========================================
    this._renderZenithBuddhaCanopy(ctx, curR, a);
    this._renderApsaraRibbons(ctx, curR, a);

    // 切换至佛光坛城中心局部坐标系
    ctx.translate(this.x, this.y);

    // ==========================================
    // 2. 第二重：峨眉金顶 · 五色祥瑞圆光与十六道万丈佛光瑞芒
    // ==========================================
    this._renderFiveColorAureole(ctx, curR, a);
    this._renderSixteenDharmaRays(ctx, curR, a);

    // ==========================================
    // 3. 第三重：二十四摩尼宝珠外环 & 八字真言描金莲印环
    // ==========================================
    ctx.save();
    ctx.rotate(this.mantraRot);
    this._renderManiJewelRing(ctx, curR, a);
    this._renderEightMantraMedallions(ctx, curR * 0.77, a);
    ctx.restore();

    // ==========================================
    // 4. 第四重：大日如来八正道金刚法轮 (Eight-Spoke Dharmachakra)
    // ==========================================
    ctx.save();
    ctx.rotate(this.dharmaRot);
    this._renderEightSpokeDharmaWheel(ctx, curR * 0.58, a);
    ctx.restore();

    // ==========================================
    // 5. 第五重：步步生莲 · 三层 3D 盛放千叶宝相金莲座
    // ==========================================
    ctx.save();
    ctx.rotate(this.lotusRot);
    this._renderThousandPetalGoldenLotus(ctx, curR * 0.46, a);
    ctx.restore();

    // ==========================================
    // 6. 第六重：佛心舍利 · 3D 刀刻鎏金【卍】字佛印与莲蕊宝珠
    // ==========================================
    this._renderSacredSwastikaCore(ctx, curR * 0.20, a);

    ctx.restore();
  }

  // 1.1 天顶普度万丈金辉瑞束 (Top Zenith Golden Canopy Beams)
  _renderZenithBuddhaCanopy(ctx, curR, a) {
    if (a < 0.18) return;
    ctx.save();
    const beamA = Math.min(0.28, a * 0.28);
    try {
      const topY = Math.max(0, this.y - curR * 1.75);
      const grad = ctx.createLinearGradient(this.x, topY, this.x, this.y + curR * 0.95);
      grad.addColorStop(0, `rgba(254, 240, 138, ${beamA * 1.45})`);
      grad.addColorStop(0.42, `rgba(245, 158, 11, ${beamA * 0.90})`);
      grad.addColorStop(0.78, `rgba(225, 29, 72, ${beamA * 0.35})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;

      // 宏大宝盖扇形金辉锥
      ctx.beginPath();
      ctx.moveTo(this.x - curR * 0.55, topY);
      ctx.lineTo(this.x + curR * 0.55, topY);
      ctx.lineTo(this.x + curR * 1.48, this.y + curR * 0.95);
      ctx.lineTo(this.x - curR * 1.48, this.y + curR * 0.95);
      ctx.closePath();
      ctx.fill();
    } catch (e) {}
    ctx.restore();
  }

  // 1.2 敦煌飞天双轨璎珞金绶带 (Apsara Flowing Golden Ribbons & Pearl Beads)
  _renderApsaraRibbons(ctx, curR, a) {
    const nodes = this.ribbonNodes;
    if (!nodes || nodes.length < 3) return;

    ctx.save();
    // 飞天左绶带：24K 帝王纯金霞带
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      const px = p.x + p.offsetA;
      if (i === 0) ctx.moveTo(px, p.y);
      else ctx.lineTo(px, p.y);
    }
    ctx.lineWidth = 7.5;
    ctx.strokeStyle = `rgba(245, 158, 11, ${a * 0.25})`;
    ctx.stroke();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.85})`;
    ctx.stroke();

    // 飞天右绶带：绯红金莲霞带
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      const px = p.x + p.offsetB;
      if (i === 0) ctx.moveTo(px, p.y);
      else ctx.lineTo(px, p.y);
    }
    ctx.lineWidth = 7.5;
    ctx.strokeStyle = `rgba(244, 63, 94, ${a * 0.24})`;
    ctx.stroke();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = `rgba(253, 224, 71, ${a * 0.82})`;
    ctx.stroke();

    // 绶带沿途镶嵌璎珞舍利金珠
    ctx.fillStyle = `rgba(255, 251, 235, ${a * 0.90})`;
    for (let i = 2; i < nodes.length - 2; i += 4) {
      const p = nodes[i];
      ctx.beginPath();
      ctx.arc(p.x + p.offsetA, p.y, 2.2, 0, Math.PI * 2);
      ctx.arc(p.x + p.offsetB, p.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 2.1 峨眉金顶 · 五色祥瑞圆光 (Five-Colored Sacred Buddha Aureole)
  _renderFiveColorAureole(ctx, curR, a) {
    const outerR = curR * 1.62;
    const haloGrad = ctx.createRadialGradient(0, 0, curR * 0.08, 0, 0, outerR);
    haloGrad.addColorStop(0, `rgba(255, 251, 235, ${a * 0.52})`);     // 佛心白炽金光
    haloGrad.addColorStop(0.24, `rgba(253, 224, 71, ${a * 0.42})`);   // 帝王明黄佛晕
    haloGrad.addColorStop(0.48, `rgba(245, 158, 11, ${a * 0.30})`);   // 旃檀琥珀金光
    haloGrad.addColorStop(0.70, `rgba(244, 63, 94, ${a * 0.18})`);    // 红莲宝相霞光
    haloGrad.addColorStop(0.86, `rgba(168, 85, 247, ${a * 0.10})`);   // 紫金瑞气外晕
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, outerR, 0, Math.PI * 2);
    ctx.fill();

    // 佛光七彩祥瑞日冕内环 (Sacred Corona Rainbow Ring)
    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.40})`;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, curR * 1.05, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 2.2 十六道万丈佛光瑞芒 (16 Volumetric Dharma Light Rays)
  _renderSixteenDharmaRays(ctx, curR, a) {
    ctx.save();
    ctx.rotate(this.rayRot);

    const numRays = 16;
    for (let i = 0; i < numRays; i++) {
      const isMajor = i % 2 === 0;
      const angle = (i * Math.PI * 2) / numRays;
      const pulse = Math.sin(this.age * 0.11 + i * 0.9) * (isMajor ? 9 : 5);
      const innerR = curR * 0.92;
      const outerR = curR * (isMajor ? 1.34 : 1.18) + pulse;
      const halfW = isMajor ? 6.8 : 3.6;

      ctx.save();
      ctx.rotate(angle);

      // 佛光外层琥珀柔光扇叶
      ctx.fillStyle = isMajor
        ? `rgba(245, 158, 11, ${a * 0.36})`
        : `rgba(251, 113, 133, ${a * 0.28})`;
      ctx.beginPath();
      ctx.moveTo(0, -outerR - 4);
      ctx.lineTo(halfW * 1.45, -innerR);
      ctx.lineTo(-halfW * 1.45, -innerR);
      ctx.closePath();
      ctx.fill();

      // 佛光核心纯金锐芒
      ctx.fillStyle = isMajor
        ? `rgba(254, 240, 138, ${a * 0.94})`
        : `rgba(253, 224, 71, ${a * 0.82})`;
      ctx.beginPath();
      ctx.moveTo(0, -outerR);
      ctx.lineTo(halfW * 0.55, -innerR);
      ctx.lineTo(0, -innerR + 5);
      ctx.lineTo(-halfW * 0.55, -innerR);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  // 3.1 二十四摩尼宝珠连环与宝相莲瓣边饰 (24 Mani Jewels & Filigree Rim)
  _renderManiJewelRing(ctx, curR, a) {
    const ringR = curR * 0.94;

    // 暗金檀香底衬圆环
    ctx.strokeStyle = `rgba(120, 53, 15, ${a * 0.52})`;
    ctx.lineWidth = curR * 0.13;
    ctx.beginPath();
    ctx.arc(0, 0, ringR * 0.94, 0, Math.PI * 2);
    ctx.stroke();

    // 外圈双通道 24K 纯金宝轮环
    ctx.strokeStyle = `rgba(245, 158, 11, ${a * 0.38})`;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.95})`;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.stroke();

    // 内圈赤金细弦环
    ctx.strokeStyle = `rgba(251, 191, 36, ${a * 0.75})`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, 0, ringR * 0.88, 0, Math.PI * 2);
    ctx.stroke();

    // 24 颗摩尼舍利宝珠与莲拱花边
    const numJewels = 24;
    for (let j = 0; j < numJewels; j++) {
      const ja = (j / numJewels) * Math.PI * 2;
      const jx = Math.cos(ja) * (ringR * 0.94);
      const jy = Math.sin(ja) * (ringR * 0.94);

      if (j % 3 === 0) {
        // 八大主摩尼宝珠：四角星芒金钻
        this._renderDharmaStar(ctx, jx, jy, 5.2, a, '#fef08a');
      } else {
        // 舍利金珠
        ctx.fillStyle = j % 2 === 0
          ? `rgba(254, 240, 138, ${a * 0.92})`
          : `rgba(251, 113, 133, ${a * 0.88})`;
        ctx.beginPath();
        ctx.arc(jx, jy, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 3.2 八字真言描金莲印环 (【卍 · 慈 · 悲 · 喜 · 捨 · 禅 · 悟 · 觉】)
  _renderEightMantraMedallions(ctx, mantraR, a) {
    const count = this.mantras.length;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count - Math.PI / 2;
      const mx = Math.cos(angle) * mantraR;
      const my = Math.sin(angle) * mantraR;

      ctx.save();
      ctx.translate(mx, my);
      // 保持真言文字始终正立庄严（抵消外环旋转角）
      ctx.rotate(-this.mantraRot);

      const discR = 11.5;

      // 1. 外围金光晕圈
      ctx.fillStyle = `rgba(245, 158, 11, ${a * 0.32})`;
      ctx.beginPath();
      ctx.arc(0, 0, discR + 3.2, 0, Math.PI * 2);
      ctx.fill();

      // 2. 朱砂红莲描金圆印底座
      ctx.fillStyle = i === 0
        ? `rgba(180, 83, 9, ${a * 0.95})`
        : `rgba(153, 27, 27, ${a * 0.92})`;
      ctx.beginPath();
      ctx.arc(0, 0, discR, 0, Math.PI * 2);
      ctx.fill();

      // 3. 24K 纯金双层描边
      ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.96})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // 4. 立体烫金真言字
      ctx.font = 'bold 12px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(120, 53, 15, ${a * 0.90})`;
      ctx.fillText(this.mantras[i], 0.8, 1.2);
      ctx.fillStyle = `rgba(255, 251, 235, ${a * 0.98})`;
      ctx.fillText(this.mantras[i], 0, 0.5);

      ctx.restore();
    }
  }

  // 4. 大日如来八正道金刚法轮 (Eight-Spoke Golden Dharmachakra)
  _renderEightSpokeDharmaWheel(ctx, wheelR, a) {
    ctx.save();

    // 法轮外圈双通道金环
    ctx.strokeStyle = `rgba(245, 158, 11, ${a * 0.36})`;
    ctx.lineWidth = 5.0;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.92})`;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
    ctx.stroke();

    // 八根金刚宝杵辐条 (8 Vajra Spokes)
    for (let s = 0; s < 8; s++) {
      ctx.save();
      ctx.rotate((s * Math.PI) / 4);

      // 金刚杵菱形辐条
      ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.88})`;
      ctx.beginPath();
      ctx.moveTo(0, -wheelR * 0.32);
      ctx.lineTo(3.2, -wheelR * 0.68);
      ctx.lineTo(0, -wheelR * 1.06);
      ctx.lineTo(-3.2, -wheelR * 0.68);
      ctx.closePath();
      ctx.fill();

      // 轮缘外侧宝珠尖顶
      ctx.fillStyle = `rgba(251, 191, 36, ${a * 0.95})`;
      ctx.beginPath();
      ctx.arc(0, -wheelR * 1.06, 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  // 5. 步步生莲 · 三层 3D 盛放千叶宝相金莲座 (Blooming 3-Tier 3D Golden Lotus)
  _renderThousandPetalGoldenLotus(ctx, lotusR, a) {
    // 随升腾动态舒展的莲瓣盛开系数 (0.85 -> 1.08)
    const bloomOpen = 0.88 + Math.min(0.20, this.age * 0.0015) + Math.sin(this.age * 0.08) * 0.03;

    // ----------------------------------------------------
    // 第一层（外层）：12 瓣绯金宝相大莲瓣 (Rose-Amber & Gold Outer Petals)
    // ----------------------------------------------------
    const outerCount = 12;
    const outerLen = lotusR * 1.12 * bloomOpen;
    const outerW = lotusR * 0.38;
    for (let i = 0; i < outerCount; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / outerCount);
      this._drawSingleLotusPetal(
        ctx,
        outerLen,
        outerW,
        `rgba(244, 63, 94, ${a * 0.52})`,
        `rgba(245, 158, 11, ${a * 0.88})`,
        `rgba(254, 240, 138, ${a * 0.92})`
      );
      ctx.restore();
    }

    // ----------------------------------------------------
    // 第二层（中层）：12 瓣交错 24K 帝王纯金莲瓣 (Imperial Gold Middle Petals)
    // ----------------------------------------------------
    const midCount = 12;
    const midLen = lotusR * 0.88 * bloomOpen;
    const midW = lotusR * 0.32;
    for (let i = 0; i < midCount; i++) {
      ctx.save();
      ctx.rotate(((i + 0.5) * Math.PI * 2) / midCount);
      this._drawSingleLotusPetal(
        ctx,
        midLen,
        midW,
        `rgba(217, 119, 6, ${a * 0.85})`,
        `rgba(251, 191, 36, ${a * 0.95})`,
        `rgba(255, 251, 235, ${a * 0.96})`
      );
      ctx.restore();
    }

    // ----------------------------------------------------
    // 第三层（内层）：8 瓣羊脂白金护心莲瓣 (White-Gold Inner Sacred Petals)
    // ----------------------------------------------------
    const innerCount = 8;
    const innerLen = lotusR * 0.64;
    const innerW = lotusR * 0.25;
    for (let i = 0; i < innerCount; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / innerCount);
      this._drawSingleLotusPetal(
        ctx,
        innerLen,
        innerW,
        `rgba(251, 191, 36, ${a * 0.92})`,
        `rgba(254, 240, 138, ${a * 0.98})`,
        `rgba(255, 255, 255, ${a * 0.98})`
      );
      ctx.restore();
    }
  }

  // 绘制单瓣 3D 宝相花立体金莲瓣 (含渐变瓣肉、描金叶脉与尖端佛光)
  _drawSingleLotusPetal(ctx, len, width, baseCol, tipCol, rimCol) {
    const grad = ctx.createLinearGradient(0, 0, 0, -len);
    grad.addColorStop(0, baseCol);
    grad.addColorStop(1, tipCol);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-width, -len * 0.32, -width * 0.82, -len * 0.78, 0, -len);
    ctx.bezierCurveTo(width * 0.82, -len * 0.78, width, -len * 0.32, 0, 0);
    ctx.closePath();
    ctx.fill();

    // 24K 金丝瓣缘轮廓线
    ctx.strokeStyle = rimCol;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 中央神圣金脉中轴线
    ctx.strokeStyle = rimCol;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, -len * 0.15);
    ctx.lineTo(0, -len * 0.88);
    ctx.stroke();
  }

  // 6. 佛心舍利 · 金莲蓬宝座与 3D 刀刻鎏金【卍】字佛印
  _renderSacredSwastikaCore(ctx, coreR, a) {
    ctx.save();

    // 6.1 金莲蓬外围炽白佛光晕
    const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, coreR * 1.45);
    coreGrad.addColorStop(0, `rgba(255, 255, 255, ${a * 0.98})`);
    coreGrad.addColorStop(0.55, `rgba(253, 224, 71, ${a * 0.92})`);
    coreGrad.addColorStop(1, `rgba(217, 119, 6, ${a * 0.85})`);

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, coreR, 0, Math.PI * 2);
    ctx.fill();

    // 6.2 莲蓬边缘 24K 纯金镶边与 8 颗莲蕊舍利金珠
    ctx.strokeStyle = `rgba(255, 251, 235, ${a * 0.96})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    const stamenR = coreR * 1.18;
    ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.95})`;
    for (let i = 0; i < 8; i++) {
      const sa = (i * Math.PI) / 4 + this.age * 0.02;
      ctx.beginPath();
      ctx.arc(Math.cos(sa) * stamenR, Math.sin(sa) * stamenR, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6.3 中央 3D 立体刀刻鎏金【卍】字万德佛印
    const pulseScale = 1.0 + Math.sin(this.age * 0.12) * 0.06;
    ctx.scale(pulseScale, pulseScale);
    ctx.font = '900 22px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 底层深赤金浮雕阴影
    ctx.fillStyle = `rgba(146, 64, 14, ${a * 0.95})`;
    ctx.fillText('卍', 1.2, 1.6);

    // 顶层纯白炽金佛印主字
    ctx.fillStyle = `rgba(120, 53, 15, ${a * 0.95})`;
    ctx.fillText('卍', 0.6, 0.8);
    ctx.fillStyle = `rgba(255, 251, 235, ${a * 1.0})`;
    ctx.fillText('卍', 0, 0);

    ctx.restore();
  }

  // 绘制璀璨四芒佛光宝星
  _renderDharmaStar(ctx, x, y, size, alpha, colorHex = '#fef08a') {
    ctx.save();
    ctx.fillStyle = colorHex === '#fb7185'
      ? `rgba(251, 113, 133, ${alpha * 0.95})`
      : `rgba(254, 240, 138, ${alpha * 0.96})`;

    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.34, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.34, y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x, y + size * 0.34);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y - size * 0.34);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
