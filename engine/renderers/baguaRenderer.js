// utils/baguaRenderer.js

/**
 * 腾讯游戏设计总监级 · 乾坤八卦 · 紫微天穹大阵 (Bagua Taichi Celestial Grand Matrix 60FPS 殿堂重制版)
 * 纯原生 Canvas 2D 硬件光栅化 · 零外部贴图依赖 · 零 CPU 高斯模糊 · 零 GC 对象池复用
 *
 * 五重天道神阵华丽视觉体系（巨幅天穹展幅，直径达 260px~320px）：
 * 1. 【第一重 · 鸿蒙紫金天幕与八荒天罡剑芒】：广域呼吸神晕 + 16 道八荒流光阵法剑芒 + 双轨护阵游龙气旋绶带；
 * 2. 【第二重 · 周天二十八星宿连珠星轨与六十四卦刻度】：双轨逆转紫微星盘、64 卦精密天干刻度、四象二十八星宿连珠引力弦线；
 * 3. 【第三重 · 先天乾坤八卦 3D 鎏金大爻象与玄玉神印】：双通道发光宽幅三爻金紋 + 玄玉描金八方镇阵字印（乾兑离震坤艮坎巽）；
 * 4. 【第四重 · 洛书九宫八角璇玑内阵】：内外逆向交叠旋转的八角璇玑神圣几何金阵与阵眼星钻；
 * 5. 【第五重 · 巨幅灵虚阴阳两仪琉璃太极鱼】：昆仑羊脂青玉阳鱼与紫曜玄金阴鱼互抱流转，S 极鎏金光脊与四芒星神目耀斑。
 */

export class BaguaMatrix {
  constructor(x, y, options = {}) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.vx = options.vx || 0;
    this.vy = 1.65; // 沉稳恢弘的升腾速度，让巨幅大阵从容展现每一处华丽细节
    this.age = 0;
    this.maxAge = 240; // 约 4.0 秒史诗级生命周期
    this.alpha = 0;

    // 三重天道逆向视差旋转角
    this.rot = 0;            // 中央太极两仪顺时针流转
    this.innerArrayRot = 0;  // 中层八角璇玑与八卦爻象顺转
    this.diskRot = 0;        // 外层二十八星宿与六十四卦天盘逆转

    // 殿堂级巨幅基础半径：初生 92px，随飞升恢弘舒展至 130px（主盘直径 260px，连同外围八荒剑芒总跨度超 310px！）
    this.baseR = 92;

    // 先天八卦方位定义 (1 = 阳爻实线, 0 = 阴爻断线)
    // 南乾(上), 兑(东南), 东离(右), 震(东北), 北坤(下), 艮(西北), 西坎(左), 巽(西南)
    this.trigrams = [
      { name: '乾', sub: '天', lines: [1, 1, 1], angle: -Math.PI / 2 },
      { name: '兑', sub: '泽', lines: [0, 1, 1], angle: -Math.PI / 4 },
      { name: '离', sub: '火', lines: [1, 0, 1], angle: 0 },
      { name: '震', sub: '雷', lines: [0, 0, 1], angle: Math.PI / 4 },
      { name: '坤', sub: '地', lines: [0, 0, 0], angle: Math.PI / 2 },
      { name: '艮', sub: '山', lines: [1, 0, 0], angle: (Math.PI * 3) / 4 },
      { name: '坎', sub: '水', lines: [0, 1, 0], angle: Math.PI },
      { name: '巽', sub: '风', lines: [1, 1, 0], angle: (-Math.PI * 3) / 4 }
    ];

    // 护阵双轨游龙气旋骨骼节点池 (Zero-GC 预分配 20 节)
    this.numRibbonNodes = 20;
    this.ribbonNodes = [];
    for (let i = 0; i < this.numRibbonNodes; i++) {
      this.ribbonNodes.push({ x: x, y: y, offsetA: 0, offsetB: 0 });
    }
  }

  update(screenH, ceilingY, emitParticleCallback) {
    this.age++;

    // 1. 生命周期透明度与顶空羽化包络
    if (this.age < 24) {
      this.alpha = Math.sin((this.age / 24) * (Math.PI / 2));
    } else if (this.age > 175) {
      this.alpha = Math.max(0, 1.0 - (this.age - 175) / (this.maxAge - 175));
    } else {
      this.alpha = 1.0;
    }

    // 接近顶部安全屏障时平滑羽化，绝不生硬撞顶
    const safeCeiling = (typeof ceilingY === 'number' && ceilingY > 0) ? ceilingY : 110;
    if (this.y < safeCeiling + 115) {
      const topFade = Math.max(0, (this.y - (safeCeiling + 15)) / 100);
      this.alpha *= topFade;
    }

    // 2. 空间升腾与三重天体视差自转
    this.x += this.vx + Math.sin(this.age * 0.035) * 0.35;
    this.y -= this.vy;
    this.vy = Math.max(1.15, this.vy * 0.996); // 升至高空微幅放缓，呈现悬停天穹之威仪

    this.rot += 0.022;           // 太极两仪顺时针运转
    this.innerArrayRot -= 0.012; // 璇玑内阵逆时针运转
    this.diskRot += 0.008;       // 周天星宿外盘慢速顺转

    // 3. 原地更新双轨游龙气旋骨骼点 (连接呼气源与升腾大阵的广域流光绶带)
    const curR = this._getCurrentRadius();
    for (let i = 0; i < this.numRibbonNodes; i++) {
      const node = this.ribbonNodes[i];
      const ratio = i / (this.numRibbonNodes - 1); // 0(阵心上方) -> 1(下方拖尾)
      node.y = this.y - curR * 0.55 + ratio * (curR * 1.95);
      const wavePhase = this.age * 0.08 - i * 0.32;
      const envWidth = Math.sin(ratio * Math.PI) * (curR * 1.08);
      node.x = this.x;
      node.offsetA = Math.sin(wavePhase) * envWidth;
      node.offsetB = -Math.sin(wavePhase) * envWidth;
    }

    // 4. 广域伴生天罡星火与八卦流光符尘喷涌 (每 3 帧环绕巨幅阵盘外围洒下星钻与金翠灵火)
    if (typeof emitParticleCallback === 'function' && this.age % 3 === 0 && this.alpha > 0.15) {
      for (let k = 0; k < 2; k++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pDist = curR * (0.45 + Math.random() * 0.78);
        const randType = Math.random();
        const isGold = randType < 0.55;
        const isPurple = randType >= 0.82;
        emitParticleCallback({
          x: this.x + Math.cos(pAngle) * pDist,
          y: this.y + Math.sin(pAngle) * (pDist * 0.68),
          vx: Math.cos(pAngle) * (0.45 + Math.random() * 0.55),
          vy: -0.75 - Math.random() * 0.75,
          radius: 1.5 + Math.random() * 1.8,
          alpha: this.alpha * 0.88,
          baseAlpha: 0.88,
          life: 0,
          maxLife: 45 + Math.random() * 25,
          color: isGold ? '#fef08a' : (isPurple ? '#d8b4fe' : '#67e8f9'),
          isGold: true,
          shimmerPhase: Math.random() * Math.PI * 2,
          shimmerSpeed: 0.22
        });
      }
    }

    // 5. 腾讯总监设计级：大阵终幕羽化散化青烟（age > 170），阵法化作层叠紫微云烟融入天幕
    if (typeof emitParticleCallback === 'function' && this.age > 170 && this.age % 2 === 0) {
      const pAngle = Math.random() * Math.PI * 2;
      const pDist = curR * (0.6 + Math.random() * 0.4);
      emitParticleCallback({
        x: this.x + Math.cos(pAngle) * pDist,
        y: this.y + Math.sin(pAngle) * (pDist * 0.68),
        vx: Math.cos(pAngle) * 0.5,
        vy: -0.5 - Math.random() * 0.5,
        radius: 6.0 + Math.random() * 6.0,
        alpha: this.alpha * 0.6,
        baseAlpha: 0.6,
        life: 0,
        maxLife: 60 + Math.random() * 20,
        color: Math.random() > 0.5 ? 'rgba(103, 232, 249, ' : 'rgba(216, 180, 254, ',
        growRate: 0.25,
        isVolumetricSmoke: true
      });
    }

    return (this.age < this.maxAge && this.alpha > 0.005);
  }

  _getCurrentRadius() {
    // 初生破雾展开缓动 (前 26 帧从 0.62 倍恢弘扩张至 1.0 倍，随后持续呼吸放大至 130px)
    let unfold = 1.0;
    if (this.age < 26) {
      const t = this.age / 26;
      unfold = 0.62 + 0.38 * (1 - Math.pow(1 - t, 3));
    }
    const breath = Math.sin(this.age * 0.07) * 3.5;
    return (this.baseR + Math.min(38, this.age * 0.22) + breath) * unfold;
  }

  render(ctx) {
    if (this.alpha <= 0.005) return;

    const curR = this._getCurrentRadius();
    const a = this.alpha;

    ctx.save();

    // ==========================================
    // 0. 护阵双轨游龙气旋绶带 & 天顶紫微神光束 (World Space)
    // ==========================================
    this._renderCelestialSunbeams(ctx, curR, a);
    this._renderAscendingQiRibbons(ctx, curR, a);

    // 切换至大阵中心局部坐标系
    ctx.translate(this.x, this.y);

    // ==========================================
    // 1. 鸿蒙紫金广域天幕神晕 & 八荒天罡流光剑芒 (Outer Radius ~ 1.55 * curR)
    // ==========================================
    this._renderCosmicAmbientHalo(ctx, curR, a);
    this._renderCompassSwordRays(ctx, curR, a);

    // ==========================================
    // 2. 外层：周天二十八星宿连珠天盘与六十四卦刻度 (Astrolabe Ring)
    // ==========================================
    ctx.save();
    ctx.rotate(this.diskRot);
    this._renderOuterAstrolabe(ctx, curR, a);
    ctx.restore();

    // ==========================================
    // 3. 中外层：先天乾坤八卦 3D 烫金大爻象与玄玉镇阵神印 (Eight Trigrams & Seals)
    // ==========================================
    ctx.save();
    ctx.rotate(this.innerArrayRot);
    this._renderEightTrigramsRing(ctx, curR, a);

    // ==========================================
    // 4. 中内层：洛书九宫八角璇玑神圣几何金阵 (Octagram Xuanji Array)
    // ==========================================
    this._renderOctagramXuanjiArray(ctx, curR * 0.56, a);
    ctx.restore();

    // ==========================================
    // 5. 核心层：巨幅灵虚阴阳两仪琉璃太极鱼 (Luminous Glazed Taiji Core)
    // ==========================================
    ctx.save();
    ctx.rotate(this.rot);
    this._renderTaijiCore(ctx, curR * 0.43, a);
    ctx.restore();

    ctx.restore();
  }

  // 0.1 紫微天顶神光束 (Top Celestial God-Rays)
  _renderCelestialSunbeams(ctx, curR, a) {
    if (a < 0.2) return;
    ctx.save();
    const beamA = Math.min(0.24, a * 0.24);
    try {
      const topY = Math.max(0, this.y - curR * 1.65);
      const grad = ctx.createLinearGradient(this.x, topY, this.x, this.y + curR * 0.8);
      grad.addColorStop(0, `rgba(103, 232, 249, ${beamA * 1.3})`);
      grad.addColorStop(0.45, `rgba(251, 191, 36, ${beamA * 0.85})`);
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(this.x - curR * 0.45, topY);
      ctx.lineTo(this.x + curR * 0.45, topY);
      ctx.lineTo(this.x + curR * 1.35, this.y + curR * 0.8);
      ctx.lineTo(this.x - curR * 1.35, this.y + curR * 0.8);
      ctx.closePath();
      ctx.fill();
    } catch (e) {}
    ctx.restore();
  }

  // 0.2 护阵双轨游龙气旋绶带 (青龙碧玉气旋 + 金乌赤金气旋)
  _renderAscendingQiRibbons(ctx, curR, a) {
    const nodes = this.ribbonNodes;
    if (!nodes || nodes.length < 3) return;

    ctx.save();
    // 阳轨：纯金天罡流光带
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      const px = p.x + p.offsetA;
      if (i === 0) ctx.moveTo(px, p.y);
      else ctx.lineTo(px, p.y);
    }
    ctx.lineWidth = 7.0;
    ctx.strokeStyle = `rgba(245, 158, 11, ${a * 0.22})`;
    ctx.stroke();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.78})`;
    ctx.stroke();

    // 阴轨：昆仑青碧流光带
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      const px = p.x + p.offsetB;
      if (i === 0) ctx.moveTo(px, p.y);
      else ctx.lineTo(px, p.y);
    }
    ctx.lineWidth = 7.0;
    ctx.strokeStyle = `rgba(56, 189, 248, ${a * 0.22})`;
    ctx.stroke();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = `rgba(165, 243, 252, ${a * 0.78})`;
    ctx.stroke();

    ctx.restore();
  }

  // 1.1 鸿蒙紫金广域天幕神晕
  _renderCosmicAmbientHalo(ctx, curR, a) {
    const outerHaloR = curR * 1.58;
    const haloGrad = ctx.createRadialGradient(0, 0, curR * 0.12, 0, 0, outerHaloR);
    haloGrad.addColorStop(0, `rgba(254, 240, 138, ${a * 0.36})`);
    haloGrad.addColorStop(0.28, `rgba(56, 189, 248, ${a * 0.30})`);
    haloGrad.addColorStop(0.58, `rgba(168, 85, 247, ${a * 0.20})`);
    haloGrad.addColorStop(0.82, `rgba(245, 158, 11, ${a * 0.10})`);
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, outerHaloR, 0, Math.PI * 2);
    ctx.fill();
  }

  // 1.2 八荒天罡流光剑芒 (16 道呼吸伸缩的阵法外放神芒，大幅扩张视觉疆域)
  _renderCompassSwordRays(ctx, curR, a) {
    ctx.save();
    ctx.rotate(-this.diskRot * 0.6); // 缓慢逆向呼吸旋转

    const numRays = 16;
    for (let i = 0; i < numRays; i++) {
      const isMajor = i % 2 === 0; // 8 道主天罡剑芒 + 8 道副星芒
      const angle = (i * Math.PI * 2) / numRays;
      const pulse = Math.sin(this.age * 0.12 + i * 0.8) * (isMajor ? 7 : 4);
      const innerR = curR * 0.98;
      const outerR = curR * (isMajor ? 1.26 : 1.13) + pulse;
      const halfW = isMajor ? 5.2 : 2.6;

      ctx.save();
      ctx.rotate(angle);

      // 剑芒外层柔光晕
      ctx.fillStyle = isMajor
        ? `rgba(251, 191, 36, ${a * 0.35})`
        : `rgba(56, 189, 248, ${a * 0.28})`;
      ctx.beginPath();
      ctx.moveTo(0, -outerR - 3);
      ctx.lineTo(halfW * 1.4, -innerR);
      ctx.lineTo(-halfW * 1.4, -innerR);
      ctx.closePath();
      ctx.fill();

      // 剑芒锐利流光晶核
      ctx.fillStyle = isMajor
        ? `rgba(254, 240, 138, ${a * 0.92})`
        : `rgba(165, 243, 252, ${a * 0.82})`;
      ctx.beginPath();
      ctx.moveTo(0, -outerR);
      ctx.lineTo(halfW * 0.55, -innerR);
      ctx.lineTo(0, -innerR + 4);
      ctx.lineTo(-halfW * 0.55, -innerR);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  // 2. 周天二十八星宿天盘与六十四卦天道刻度
  _renderOuterAstrolabe(ctx, curR, a) {
    // 2.1 星盘玄玉半透环形底衬 (提升镂空刻度与星宿的对比度与高级感)
    ctx.strokeStyle = `rgba(15, 23, 42, ${a * 0.55})`;
    ctx.lineWidth = curR * 0.14;
    ctx.beginPath();
    ctx.arc(0, 0, curR * 0.93, 0, Math.PI * 2);
    ctx.stroke();

    // 2.2 外周天鎏金主环 (Dual-Pass Glow)
    ctx.strokeStyle = `rgba(245, 158, 11, ${a * 0.32})`;
    ctx.lineWidth = 5.0;
    ctx.beginPath();
    ctx.arc(0, 0, curR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.92})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, curR, 0, Math.PI * 2);
    ctx.stroke();

    // 2.3 内周天青玉星轨环
    ctx.strokeStyle = `rgba(56, 189, 248, ${a * 0.72})`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, 0, curR * 0.86, 0, Math.PI * 2);
    ctx.stroke();

    // 2.4 六十四卦周天精密刻度线 (64 Hexagram Degree Ticks)
    const numTicks = 64;
    for (let t = 0; t < numTicks; t++) {
      const ta = (t / numTicks) * Math.PI * 2;
      const isOctant = t % 8 === 0;
      const r1 = curR * (isOctant ? 0.85 : 0.955);
      const r2 = curR * 0.995;
      ctx.strokeStyle = isOctant
        ? `rgba(254, 240, 138, ${a * 0.90})`
        : `rgba(103, 232, 249, ${a * 0.42})`;
      ctx.lineWidth = isOctant ? 1.6 : 0.8;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ta) * r1, Math.sin(ta) * r1);
      ctx.lineTo(Math.cos(ta) * r2, Math.sin(ta) * r2);
      ctx.stroke();
    }

    // 2.5 二十八星宿连珠星轨弦线与星钻 (28 Mansions Connected Constellations)
    const numStars = 28;
    const starOrbitR = curR * 0.925;

    // 先绘制四象七宿连珠引力金青弦线
    ctx.strokeStyle = `rgba(103, 232, 249, ${a * 0.48})`;
    ctx.lineWidth = 1.0;
    for (let q = 0; q < 4; q++) {
      ctx.beginPath();
      for (let s = 0; s < 6; s++) {
        const idx = q * 7 + s;
        const sa = (idx / numStars) * Math.PI * 2;
        const radiusOffset = (s % 2 === 0) ? starOrbitR * 1.015 : starOrbitR * 0.975;
        const sx = Math.cos(sa) * radiusOffset;
        const sy = Math.sin(sa) * radiusOffset;
        if (s === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // 绘制 28 颗星宿星钻与明珠
    for (let s = 0; s < numStars; s++) {
      const sa = (s / numStars) * Math.PI * 2;
      const isLocalEven = (s % 7) % 2 === 0;
      const rPos = isLocalEven ? starOrbitR * 1.015 : starOrbitR * 0.975;
      const sx = Math.cos(sa) * rPos;
      const sy = Math.sin(sa) * rPos;
      const isCardinal = s % 7 === 0;

      if (isCardinal) {
        // 四象主宿镇星：璀璨大四芒星钻
        this._renderStarDiamond(ctx, sx, sy, 5.6, a, '#fef08a');
      } else if (s % 2 === 0) {
        // 金宿明珠
        ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.92})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 青宿微晶
        ctx.fillStyle = `rgba(103, 232, 249, ${a * 0.88})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 3. 先天乾坤八卦 3D 烫金大爻象与玄玉镇阵神印
  _renderEightTrigramsRing(ctx, curR, a) {
    const trigramR = curR * 0.70;
    const sealR = curR * 0.81;

    for (let i = 0; i < this.trigrams.length; i++) {
      const tri = this.trigrams[i];
      ctx.save();
      ctx.rotate(tri.angle + Math.PI / 2); // 使局部 -Y 轴指向卦位方向
      this._renderSingleTrigramAndSeal(ctx, trigramR, sealR, tri.lines, tri.name, a);
      ctx.restore();
    }
  }

  _renderSingleTrigramAndSeal(ctx, trigramR, sealR, lines, name, a) {
    // 1. 绘制玄玉描金卦名镇阵圆印 (位于爻象外侧 sealR 处)
    const badgeRadius = 9.5;
    const badgeY = -sealR;

    // 玄黑紫玉底盘
    ctx.fillStyle = `rgba(15, 23, 42, ${a * 0.90})`;
    ctx.beginPath();
    ctx.arc(0, badgeY, badgeRadius, 0, Math.PI * 2);
    ctx.fill();

    // 24K 描金圆印外圈
    ctx.strokeStyle = `rgba(251, 191, 36, ${a * 0.88})`;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // 卦名烫金篆楷字
    ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.98})`;
    ctx.font = 'bold 11px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 0, badgeY + 0.5);

    // 2. 绘制宽幅 3D 发光八卦三爻 (位于 trigramR 处)
    const lineWidth = 26;
    const lineGap = 5.0;

    for (let i = 0; i < 3; i++) {
      const ly = -trigramR + (i - 1) * lineGap;
      const isYang = lines[i] === 1;

      if (isYang) {
        // Pass 1: 琥珀金宽幅外晕
        ctx.strokeStyle = `rgba(245, 158, 11, ${a * 0.38})`;
        ctx.lineWidth = 5.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-lineWidth / 2, ly);
        ctx.lineTo(lineWidth / 2, ly);
        ctx.stroke();

        // Pass 2: 24K 亮金高光主爻
        ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.96})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-lineWidth / 2, ly);
        ctx.lineTo(lineWidth / 2, ly);
        ctx.stroke();
      } else {
        // 阴爻断线两截
        const gapW = 5.6;
        const segW = (lineWidth - gapW) / 2;

        // Pass 1: 青玉金外晕
        ctx.strokeStyle = `rgba(56, 189, 248, ${a * 0.36})`;
        ctx.lineWidth = 5.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-lineWidth / 2, ly);
        ctx.lineTo(-lineWidth / 2 + segW, ly);
        ctx.moveTo(lineWidth / 2 - segW, ly);
        ctx.lineTo(lineWidth / 2, ly);
        ctx.stroke();

        // Pass 2: 亮金翠玉主爻
        ctx.strokeStyle = `rgba(224, 242, 254, ${a * 0.95})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-lineWidth / 2, ly);
        ctx.lineTo(-lineWidth / 2 + segW, ly);
        ctx.moveTo(lineWidth / 2 - segW, ly);
        ctx.lineTo(lineWidth / 2, ly);
        ctx.stroke();
      }
    }
  }

  // 4. 洛书九宫八角璇玑神圣几何金阵 (Interlocking Octagram Sacred Geometry)
  _renderOctagramXuanjiArray(ctx, octR, a) {
    ctx.save();
    // 璇玑内护环
    ctx.strokeStyle = `rgba(251, 191, 36, ${a * 0.55})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, octR, 0, Math.PI * 2);
    ctx.stroke();

    // 两个交错 45 度正方形组成八角璇玑镇魔阵
    for (let sq = 0; sq < 2; sq++) {
      ctx.save();
      ctx.rotate((sq * Math.PI) / 4);
      const halfSide = octR * Math.SQRT1_2;

      // 外发光描边
      ctx.strokeStyle = sq === 0
        ? `rgba(245, 158, 11, ${a * 0.28})`
        : `rgba(56, 189, 248, ${a * 0.28})`;
      ctx.lineWidth = 4.2;
      ctx.strokeRect(-halfSide, -halfSide, halfSide * 2, halfSide * 2);

      // 核心金青细线
      ctx.strokeStyle = sq === 0
        ? `rgba(254, 240, 138, ${a * 0.82})`
        : `rgba(125, 211, 252, ${a * 0.82})`;
      ctx.lineWidth = 1.3;
      ctx.strokeRect(-halfSide, -halfSide, halfSide * 2, halfSide * 2);

      // 四个阵角镶嵌微晶金珠
      const corners = [
        [-halfSide, -halfSide],
        [halfSide, -halfSide],
        [halfSide, halfSide],
        [-halfSide, halfSide]
      ];
      ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.95})`;
      for (let c = 0; c < 4; c++) {
        ctx.beginPath();
        ctx.arc(corners[c][0], corners[c][1], 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  // 5. 中央巨幅灵虚阴阳两仪琉璃太极鱼
  _renderTaijiCore(ctx, r, a) {
    // 5.1 太极外缘三重金翠护环
    ctx.strokeStyle = `rgba(245, 158, 11, ${a * 0.38})`;
    ctx.lineWidth = 6.0;
    ctx.beginPath();
    ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.96})`;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // 5.2 阳仪半圆 (昆仑羊脂白玉与天青琉璃渐变)
    const yangGrad = ctx.createRadialGradient(r * 0.35, -r * 0.35, 2, 0, 0, r);
    yangGrad.addColorStop(0, `rgba(255, 255, 255, ${a * 0.98})`);
    yangGrad.addColorStop(0.55, `rgba(224, 242, 254, ${a * 0.94})`);
    yangGrad.addColorStop(1.0, `rgba(103, 232, 249, ${a * 0.90})`);

    ctx.fillStyle = yangGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // 5.3 阴仪半圆 (紫曜玄金深邃星空墨玉渐变)
    const yinGrad = ctx.createRadialGradient(-r * 0.35, r * 0.35, 2, 0, 0, r);
    yinGrad.addColorStop(0, `rgba(59, 7, 100, ${a * 0.98})`);
    yinGrad.addColorStop(0.55, `rgba(15, 23, 42, ${a * 0.96})`);
    yinGrad.addColorStop(1.0, `rgba(2, 6, 23, ${a * 0.95})`);

    ctx.fillStyle = yinGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI / 2, -Math.PI / 2);
    ctx.fill();

    // 5.4 上小半圆 (阳抱阴：昆仑玉鱼首)
    ctx.fillStyle = yangGrad;
    ctx.beginPath();
    ctx.arc(0, -r / 2, r / 2, Math.PI / 2, -Math.PI / 2);
    ctx.fill();

    // 5.5 下小半圆 (阴抱阳：紫曜玄鱼首)
    ctx.fillStyle = yinGrad;
    ctx.beginPath();
    ctx.arc(0, r / 2, r / 2, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // 5.6 核心 S 极能量鎏金光脊 (Dual-Pass Luminous Gold S-Spine)
    ctx.strokeStyle = `rgba(245, 158, 11, ${a * 0.42})`;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, -r / 2, r / 2, Math.PI / 2, -Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, r / 2, r / 2, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.95})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -r / 2, r / 2, Math.PI / 2, -Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, r / 2, r / 2, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // 5.7 两仪四芒星钻神目 (鱼眼：双层同心金环 + 四芒星钻核心)
    const eyeR = r * 0.18;

    // 阳中之阴鱼眼 (上方：紫曜核心 + 24K 金环 + 紫金星钻)
    ctx.fillStyle = `rgba(15, 23, 42, ${a * 0.98})`;
    ctx.beginPath();
    ctx.arc(0, -r / 2, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(251, 191, 36, ${a * 0.95})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    this._renderStarDiamond(ctx, 0, -r / 2, eyeR * 0.78, a, '#fef08a');

    // 阴中之阳鱼眼 (下方：羊脂白玉核心 + 青金光环 + 冰蓝星钻)
    ctx.fillStyle = `rgba(240, 253, 250, ${a * 0.98})`;
    ctx.beginPath();
    ctx.arc(0, r / 2, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(56, 189, 248, ${a * 0.95})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    this._renderStarDiamond(ctx, 0, r / 2, eyeR * 0.78, a, '#38bdf8');
  }

  // 绘制璀璨四芒星晶
  _renderStarDiamond(ctx, x, y, size, alpha, colorHex = '#fef08a') {
    ctx.save();
    ctx.fillStyle = colorHex === '#38bdf8'
      ? `rgba(56, 189, 248, ${alpha * 0.96})`
      : `rgba(254, 240, 138, ${alpha * 0.96})`;

    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.32, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.32, y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x, y + size * 0.32);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y - size * 0.32);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
