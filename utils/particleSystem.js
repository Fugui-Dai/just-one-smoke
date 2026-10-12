// utils/particleSystem.js
import { GoldenDragon } from './dragonRenderer.js';
import { FirePhoenix } from './phoenixRenderer.js';
import { AuspiciousRiver } from './wordRiverRenderer.js';
import { BaguaMatrix } from './baguaRenderer.js';
import { BuddhaLightAscension } from './buddhaRenderer.js';

/**
 * 赛博拟真烟雾物理粒子引擎 (ParticleSystem)
 * 支持 15 种高保真烟雾特效：
 * 1. 经典烟圈 (Toroidal Vortex Ring)
 * 2. 袅袅青烟 (Laminar-to-Turbulent Silk Stream)
 * 3. 舒缓白雾 (Volumetric Cloud Plume)
 * 4. 紫气东来 (Oriental Auspicious Purple Swirl)
 * 5. 黑金流沙 (24K Gold Stardust & Obsidian Flakes)
 * 6. 极光星云 (Aurora Borealis & Cosmic Magenta Waves)
 * 7. 双爱心烟圈 (Concentric Cardioid Heart Rings)
 * 8. 金龙吐息 (Golden Celestial Dragon & Volumetric Auspicious Gold Clouds)
 * 9. 漫天繁星 (Galaxy Stars & Meteor Streaks)
 * 10. 盛世华彩 (Grand Fireworks & Willow Golden Rain)
 * 11. 福愿金墨 (Blessing Runes & Ancient Seals)
 * 12. 赤焰神凰 (Celestial Fire Phoenix & Feathers)
 * 13. 步步高升 (Auspicious Word River)
 * 14. 乾坤八卦 (Bagua Taichi Grand Matrix)
 * 15. 佛光普照 (Buddha's Light & Celestial Thousand-Petal Golden Lotus)
 */
function formatFillColor(color, defaultColor = '#ffffff') {
  if (!color || typeof color !== 'string') return defaultColor;
  if (color.includes('rgba')) {
    return color.endsWith(')') ? color.replace(/,\s*[\d.]+\)$/, ', 1.0)') : `${color}1.0)`;
  }
  return color;
}

// 腾讯总监美学：飘舞的 3D 宝相金莲花瓣粒子
function drawLotusPetalParticle(ctx, p) {
  const len = p.radius || 7.0;
  const w = len * 0.52;
  const a = p.alpha || 0.85;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation || 0);

  const isRose = p.color === '#fb7185';
  ctx.fillStyle = isRose
    ? `rgba(251, 113, 133, ${a * 0.88})`
    : `rgba(253, 224, 71, ${a * 0.92})`;
  ctx.beginPath();
  ctx.moveTo(0, -len);
  ctx.bezierCurveTo(w, -len * 0.35, w * 0.85, len * 0.45, 0, len);
  ctx.bezierCurveTo(-w * 0.85, len * 0.45, -w, -len * 0.35, 0, -len);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = `rgba(255, 251, 235, ${a * 0.95})`;
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.restore();
}

// 腾讯总监美学：平滑对称心形贝塞尔曲线几何路径
function drawHeartPath(ctx, scale = 1.0) {
  ctx.beginPath();
  const s = scale || 1.0;
  // 从心尖底部开始绘制
  ctx.moveTo(0, 18 * s);
  // 左侧优美弧线
  ctx.bezierCurveTo(-22 * s, 6 * s, -22 * s, -16 * s, 0, -6 * s);
  // 右侧优美弧线
  ctx.bezierCurveTo(22 * s, -16 * s, 22 * s, 6 * s, 0, 18 * s);
  ctx.closePath();
}

// 腾讯游戏设计级：璀璨四芒星光（钻石星愿）
function drawFourPointStar(ctx, x, y, outerR, innerR, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = (i % 2 === 0) ? outerR : innerR;
    const a = (i * Math.PI) / 4;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 腾讯总监美学：曜世 24K 暴富金币微粒 (3D 轴翻滚与微反光)
function drawGoldCoinParticle(ctx, p) {
  const r = p.radius || 6.5;
  const a = p.alpha || 0.9;
  const rot = p.rotAngle || 0;
  const flip = Math.cos(rot); // 3D Y轴翻转透视
  const absFlip = Math.max(0.18, Math.abs(flip));

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.wobbleAngle || 0);
  ctx.scale(absFlip, 1.0);

  // 1. 金光外晕 (双层轻量光栅化辉光，替代 CPU 高斯模糊)
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(251, 191, 36, ${a * 0.22})`;
  ctx.fill();

  // 2. 24K 纯金币主体
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(245, 158, 11, ${a * 0.95})`;
  ctx.fill();

  // 3. 镀金外圈边缘
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.98})`;
  ctx.stroke();

  // 4. 古钱币内嵌方孔 (招财进宝天圆地方)
  const holeSize = r * 0.42;
  ctx.fillStyle = `rgba(180, 83, 9, ${a * 0.92})`;
  ctx.fillRect(-holeSize / 2, -holeSize / 2, holeSize, holeSize);
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.85})`;
  ctx.strokeRect(-holeSize / 2, -holeSize / 2, holeSize, holeSize);

  // 5. 翻转至反光角时迸发的高光闪点
  if (Math.abs(flip) > 0.75) {
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.35, r * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.95})`;
    ctx.fill();
  }

  ctx.restore();
}

// 腾讯总监美学：丘比特爱神金箭流光轨迹 (破空穿心 · 硬件光栅化版)
function drawCupidArrow(ctx, p) {
  const len = p.length || 34;
  const a = p.alpha || 0.9;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle || -0.4);

  // 尾迹外晕流光
  ctx.beginPath();
  ctx.moveTo(-len, 0);
  ctx.lineTo(len * 0.3, 0);
  ctx.strokeStyle = `rgba(251, 113, 133, ${a * 0.35})`;
  ctx.lineWidth = 6.0;
  ctx.stroke();

  // 核心粉金箭身
  ctx.beginPath();
  ctx.moveTo(-len * 0.6, 0);
  ctx.lineTo(len * 0.4, 0);
  ctx.strokeStyle = `rgba(254, 240, 138, ${a * 0.95})`;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 爱心形金色箭头
  ctx.save();
  ctx.translate(len * 0.4, 0);
  ctx.rotate(Math.PI / 2);
  drawHeartPath(ctx, 0.28);
  ctx.fillStyle = `rgba(254, 240, 138, ${a * 0.95})`;
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

// 腾讯总监美学：古雅篆金福印/祝福符文牌 (硬件光栅化版)
function drawBlessingToken(ctx, p) {
  const w = p.width || 34;
  const h = p.height || 34;
  const r = 6;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation || 0);

  // 1. 暖金灵气外晕 (双层轻量弥散)
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.85, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha * 0.18})`;
  ctx.fill();

  // 2. 朱砂红/帝王金福牌底座 (Rounded Rect)
  ctx.beginPath();
  ctx.moveTo(-w / 2 + r, -h / 2);
  ctx.lineTo(w / 2 - r, -h / 2);
  ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  ctx.lineTo(w / 2, h / 2 - r);
  ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  ctx.lineTo(-w / 2 + r, h / 2);
  ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  ctx.lineTo(-w / 2, -h / 2 + r);
  ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  ctx.closePath();

  ctx.fillStyle = `rgba(185, 28, 28, ${p.alpha * 0.88})`;
  ctx.fill();

  // 3. 描金边框
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = `rgba(254, 240, 138, ${p.alpha * 0.95})`;
  ctx.stroke();

  // 4. 金色篆书祝福文案 (如 福、安、顺、吉、康、自在)
  ctx.fillStyle = `rgba(255, 248, 204, ${p.alpha * 0.98})`;
  const fontSize = (p.text && p.text.length > 1) ? 12 : 17;
  ctx.font = `bold ${fontSize}px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.text || '福', 0, 1);

  ctx.restore();
}

const MAX_PARTICLES = 130;
const MAX_WISPS = 60;
const MAX_STREAM_NODES = 140;

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.wispTrail = [];
    // 3D 环形涡流烟圈系统 (Toroidal Vortex Rings)
    this.smokeRings = [];
    // 3D 浪漫同心爱心涡流烟圈系统 (Heart Vortex Rings)
    this.heartRings = [];
    // 东方神游九天金龙系统 (Golden Celestial Dragons)
    this.dragons = [];
    // 东方百鸟朝凤赤焰神凰系统 (Fire Phoenixes)
    this.phoenixes = [];
    // 步步高升祥瑞字河系统 (Auspicious Word Rivers)
    this.wordRivers = [];
    this.baguaMatrices = [];
    this.buddhaLights = [];
    // 盛世华彩烟花火箭系统 (Firework Rockets)
    this.fireworkRockets = [];
    // 真实“一缕青烟”流体双缕丝带 (主青缕 + 伴生缕) - 轻柔升腾、半路自然扩散淡出，不向屏幕顶部延伸
    this.silkStreams = [
      { id: 'main', nodes: [], phase: 0, amp: 12, maxAge: 160, widthScale: 1.0 },
      { id: 'companion', nodes: [], phase: Math.PI * 0.75, amp: 9, maxAge: 150, widthScale: 0.75 }
    ];
    this.streamNodeCounter = 0;
    this.time = 0;
    this.igniteStartTime = 0;
  }

  // 重置青烟流体 (点火瞬间仅清空烟头旧节点，并开启点火渐进生长计时；绝不干涉空中正在飞行的烟雾特效)
  resetSilkStream(isIgniting = false) {
    if (this.silkStreams) {
      for (const stream of this.silkStreams) {
        stream.nodes = [];
      }
    }
    this.streamNodeCounter = 0;
    this.igniteStartTime = isIgniting ? Date.now() : 0;
  }

  // 腾讯总监设计级 · 独占特效与空间错层接力调度器 (Exclusive VFX & Spatial Succession Pipeline)
  // 彻底根治前一口神龙/神凰飞到半空突然被粗暴吃掉的糟糕体验，实现前后错层腾飞的史诗级接力
  ensureExclusiveEffect(effectId) {
    // 1. 异构大实体互斥隔离 (切换了不同特效时，清退异种实体，保证画风纯粹)
    if (effectId !== 'dragon_breath') {
      this.dragons = [];
    } else {
      // 腾讯总监设计级：严格同屏至多显示 2 条金龙 (第 1 次吸烟显示 1 条，第 2 次吸烟再显示 1 条，双龙同屏)
      // 若已有 >= 2 条，保留最新 1 条，以便吸入下一口吐出第 2 条，严格锁定最多 2 条
      if (this.dragons.length >= 2) {
        this.dragons = this.dragons.slice(-1);
      }
    }

    if (effectId !== 'phoenix_nirvana') {
      this.phoenixes = [];
    } else {
      // 腾讯总监设计级：严格同屏至多显示 2 只神凰 (第 1 次吸烟显示 1 只，第 2 次吸烟再显示 1 只，双凰同屏)
      // 若已有 >= 2 只，保留最新 1 只，以便吸入下一口吐出第 2 只，严格锁定最多 2 只
      if (this.phoenixes.length >= 2) {
        this.phoenixes = this.phoenixes.slice(-1);
      }
    }

    if (effectId !== 'auspicious_river') {
      this.wordRivers = [];
    } else {
      // 严格同屏至多显示 2 条祥瑞字河
      if (this.wordRivers.length >= 2) {
        this.wordRivers = this.wordRivers.slice(-1);
      }
    }

    if (effectId !== 'bagua_taichi') {
      this.baguaMatrices = [];
    } else {
      if (this.baguaMatrices.length >= 2) {
        this.baguaMatrices = this.baguaMatrices.slice(-1);
      }
    }

    if (effectId !== 'buddha_light') {
      this.buddhaLights = [];
    } else {
      if (this.buddhaLights.length >= 2) {
        this.buddhaLights = this.buddhaLights.slice(-1);
      }
    }

    if (effectId !== 'grand_fireworks') {
      this.fireworkRockets = [];
    } else if (this.fireworkRockets.length >= 2) {
      this.fireworkRockets = [];
    }

    if (effectId !== 'heart_double') {
      this.heartRings = [];
    } else if (this.heartRings.length >= 4) {
      this.heartRings = this.heartRings.slice(-2);
    }

    if (effectId !== 'ring_classic') {
      this.smokeRings = [];
    } else if (this.smokeRings.length >= 4) {
      this.smokeRings = this.smokeRings.slice(-2);
    }

    // 2. 存量散落粒子软削峰：保证性能充裕
    if (this.particles.length > 50) {
      this.particles = this.particles.slice(-35);
    }
  }

  // 腾讯总监设计级 · 吸气生理重置与前序烟雾自然消散 (Inhale Dissipation)
  // 用户深吸气时：净化近场烟嘴周围的滞留散烟，为下一口烟气出场让出干净视野；
  // 但天际高空正在翱翔的神龙、神凰、祥瑞字河绝不强行抹杀，让其从容完成壮美飞升！
  retireExhaleEntities(isFast = false) {
    if (isFast) {
      this.dragons = [];
      this.phoenixes = [];
      this.wordRivers = [];
      this.baguaMatrices = [];
      this.buddhaLights = [];
      this.fireworkRockets = [];
      this.heartRings = [];
      this.smokeRings = [];
      if (this.particles.length > 25) {
        this.particles = this.particles.slice(-25);
      }
      return;
    }

    // 吸气时仅对靠近烟嘴/口部下方的近场散落烟雾进行柔和衰减，天际高空神兽继续傲游
    if (this.particles && this.particles.length) {
      for (const p of this.particles) {
        // 如果粒子在烟嘴下方附近 (y > 420)，加速其消散，给下一口腾出视野
        if (p.y > 420) {
          p.alpha = (p.alpha || 0.8) * 0.45;
          p.life = Math.max(p.life || 0, (p.maxLife || 100) * 0.80);
        } else {
          // 高空烟雾仅极微弱自然衰减，保持天空壮阔飘渺
          p.alpha = (p.alpha || 0.8) * 0.88;
        }
      }
    }
  }

  // 腾讯总监设计级 · 切换特效瞬态软流转 (Effect Switching Soft-Cleansing)
  // 用户在工坊或主控Dock点击切换特效时调用：立即清除互斥大实体，瞬时清爽空气，聚焦新特效
  switchEffectGracefully(newEffectId) {
    this.dragons = [];
    this.phoenixes = [];
    this.wordRivers = [];
    this.baguaMatrices = [];
    this.buddhaLights = [];
    this.fireworkRockets = [];
    this.smokeRings = [];
    this.heartRings = [];

    // 粒子池快速净化，保留少量环境微尘
    if (this.particles && this.particles.length > 20) {
      this.particles = this.particles.slice(-16);
    }
    for (const p of this.particles) {
      p.alpha = (p.alpha || 0.6) * 0.35;
    }
  }

  getParticleCount() {
    return this.particles.length + this.wispTrail.length + (this.silkStreams ? this.silkStreams[0].nodes.length + this.silkStreams[1].nodes.length : 0);
  }

  // 内部安全推入粒子：保障总数永不超出 MAX_PARTICLES，彻底杜绝卡顿
  _pushParticle(p) {
    if (this.particles.length >= MAX_PARTICLES) {
      this.particles.shift();
    }
    p.baseAlpha = (typeof p.alpha === 'number') ? p.alpha : 0.88;
    this.particles.push(p);
  }

  _pushWisp(w) {
    if (this.wispTrail.length >= MAX_WISPS) {
      this.wispTrail.shift();
    }
    w.baseAlpha = (typeof w.alpha === 'number') ? w.alpha : 0.75;
    this.wispTrail.push(w);
  }

  // 1. 真实“一缕青烟”连续流体节点注入 (轻柔升腾、半路自然扩散淡出)
  addSilkStreamNode(tipX, tipY, color) {
    if (typeof tipX !== 'number' || isNaN(tipX) || typeof tipY !== 'number' || isNaN(tipY)) return;

    // 点火初生阶段延迟保护：前 0.35s 打火机火花与火石触碰阶段，烟头刚被引燃，留出动作窗口
    if (this.igniteStartTime > 0) {
      const elapsed = (Date.now() - this.igniteStartTime) / 1000;
      if (elapsed < 0.35) {
        return;
      }
    }

    // 节流采样：每 2 帧注入一个流体节点，垂直拉开约 2.2~2.8px 间距
    this.streamNodeCounter = (this.streamNodeCounter || 0) + 1;
    if (this.streamNodeCounter % 2 !== 0 && this.silkStreams[0].nodes.length > 0) {
      const last0 = this.silkStreams[0].nodes[this.silkStreams[0].nodes.length - 1];
      if (last0) {
        last0.x = tipX;
        last0.y = tipY;
      }
      return;
    }

    // 主青缕
    if (this.silkStreams[0].nodes.length >= MAX_STREAM_NODES) {
      this.silkStreams[0].nodes.shift();
    }
    this.silkStreams[0].nodes.push({
      x: tipX,
      y: tipY,
      baseX: tipX,
      age: 0,
      maxAge: 160,
      width: 2.0,
      phase: 0,
      color: color || 'rgba(240, 244, 250, '
    });

    // 伴生副青缕 (双缕交织袅袅升腾，半路羽化淡出，淡蓝色透亮青烟)
    if (Math.random() < 0.75) {
      if (this.silkStreams[1].nodes.length >= MAX_STREAM_NODES - 10) {
        this.silkStreams[1].nodes.shift();
      }
      this.silkStreams[1].nodes.push({
        x: tipX + 1.2,
        y: tipY - 0.5,
        baseX: tipX + 1.2,
        age: 0,
        maxAge: 150,
        width: 1.5,
        phase: Math.PI * 0.8,
        color: color ? color.replace(/[\d.]+\)$/, '0.85)') : 'rgba(186, 230, 253, '
      });
    }
  }

  // 静置阴燃时的轻柔青烟：彻底废弃离散硬质圆圈白球，只保留流体青烟 (silkStreams)
  emitIdleWisp(x, y, color) {
    // 彻底停用离散圆形气泡粒子，防止点火处冒出白色圆圈
  }

  // 2. 真实拟真呼出烟雾：嘴部喷射 -> 空气阻力减速 -> 横向翻滚大范围漫散 -> 复合多层体积膨胀 -> 柔和羽化消散
  emitExhalePlume(x, y, count = 24, color = 'rgba(240, 246, 255, ', options = {}) {
    const speedMul = options.speedMul || 1.0;
    const lateralMul = options.lateralMul || 1.0;

    for (let i = 0; i < count; i++) {
      // 1. 集中于嘴唇出口集中源点（微幅自然随机扰动，绝非生硬水平线排列）
      const mouthOffsetX = (Math.random() - 0.5) * 12;
      const mouthOffsetY = (Math.random() - 0.5) * 6;

      // 2. 真实喷射初动量与发散角：向上喷射初速度较快 (-3.0 ~ -4.8 px/frame)
      const spreadRatio = (i / (count - 1) - 0.5) * 2; // -1.0 ~ +1.0
      const ejectAngle = -Math.PI / 2 + spreadRatio * 0.38 + (Math.random() - 0.5) * 0.20;
      const ejectSpeed = (3.2 + Math.random() * 1.6) * speedMul;

      // 3. 真实流体动能横向分流：空气撞击挤压后向左右两侧浩大翻滚展开
      const sideSign = spreadRatio < 0 ? -1 : (spreadRatio > 0 ? 1 : (Math.random() < 0.5 ? -1 : 1));
      const lateralPush = spreadRatio * (2.8 + Math.random() * 1.6) * lateralMul;

      // 4. 复合层级粒子分类（主云雾核 60% + 翻滚团絮 25% + 边缘轻丝 15%）
      const pType = Math.random();
      let initRadius, maxRadius, growRate, baseAlpha, maxLife;

      if (pType < 0.60) {
        // 主云雾核：大体积、柔羽化、长寿命，形成主体漫散厚度
        initRadius = 14 + Math.random() * 8;
        maxRadius = 65 + Math.random() * 22; // 随上升膨胀到 65~87px 宽幅巨云
        growRate = 0.45 + Math.random() * 0.22;
        baseAlpha = 0.56 + Math.random() * 0.12;
        maxLife = 145 + Math.random() * 40;
      } else if (pType < 0.85) {
        // 翻滚团絮：向左右更深处漫开，形成烟团翻滚的边缘肌理
        initRadius = 10 + Math.random() * 6;
        maxRadius = 46 + Math.random() * 18;
        growRate = 0.36 + Math.random() * 0.16;
        baseAlpha = 0.45 + Math.random() * 0.10;
        maxLife = 125 + Math.random() * 35;
      } else {
        // 边缘飘逸轻缕：微细烟丝，受微弱气流牵引向四周飘忽漫散
        initRadius = 6 + Math.random() * 5;
        maxRadius = 26 + Math.random() * 10;
        growRate = 0.22 + Math.random() * 0.12;
        baseAlpha = 0.35 + Math.random() * 0.10;
        maxLife = 95 + Math.random() * 25;
      }

      this._pushParticle({
        x: x + mouthOffsetX,
        y: y + mouthOffsetY,
        vx: Math.cos(ejectAngle) * ejectSpeed + spreadRatio * 0.8,
        vy: Math.sin(ejectAngle) * ejectSpeed,
        radius: initRadius,
        maxRadius,
        growRate,
        alpha: baseAlpha,
        baseAlpha,
        life: 0,
        maxLife,
        color,
        // 流体涡流与横向大范围漫散参数
        sideSign,
        lateralPush,
        swirlPhase: Math.random() * Math.PI * 2,
        swirlSpeed: (0.025 + Math.random() * 0.035) * sideSign,
        swirlAmp: 0.65 + Math.random() * 0.85,
        ambientDrift: (Math.random() - 0.5) * 0.30,
        isExhaleCloud: true
      });
    }
  }

  // 吐出浓雾烟团 (兼容接口)
  emitSmoke(x, y, count = 16, color = 'rgba(238, 245, 255, ') {
    this.emitExhalePlume(x, y, count, color);
  }

  // 3. 经典吐烟圈：真实的流体 3D 环形涡流烟圈 (Toroidal Vortex Ring - 前锋冲出，直径优雅扩张，羽化消散)
  emitSmokeRing(x, y, color = 'rgba(238, 246, 255, ', scale = 1.0, options = {}) {
    const ring = {
      x: x + (options.offsetX || 0),
      y: y + (options.offsetY || 0),
      vx: (options.vx !== undefined) ? options.vx : ((Math.random() - 0.5) * 0.35),
      vy: (options.vy !== undefined) ? options.vy : (-2.45 * (options.speedMul || 1.0)),
      radius: (options.initialRadius || 11) * scale,
      targetMaxRadius: (options.maxRadius || 46) * scale,
      growRate: 0.26 * (options.growMul || 1.0),
      tubeThickness: 4.8 * scale,
      maxTubeThickness: 13.5 * scale,
      tubeGrowRate: 0.065,
      aspectRatio: 0.42, // 3D 俯仰透视压缩比
      tilt: (options.tilt !== undefined) ? options.tilt : ((Math.random() - 0.5) * 0.16),
      age: 0,
      maxAge: options.maxAge || 155,
      color: color,
      baseAlpha: options.baseAlpha || 0.88,
      alpha: 0
    };
    if (this.smokeRings.length >= 8) {
      this.smokeRings.shift();
    }
    this.smokeRings.push(ring);

    // 烟圈周围伴随散落的微细柔和流体烟絮 (Micro-wisp tendrils)
    const crumbCount = 6;
    for (let i = 0; i < crumbCount; i++) {
      const angle = (i / crumbCount) * Math.PI * 2;
      this._pushParticle({
        x: x + Math.cos(angle) * (ring.radius * 0.9),
        y: y + Math.sin(angle) * (ring.radius * ring.aspectRatio),
        vx: Math.cos(angle) * 0.35 + ring.vx * 0.5,
        vy: ring.vy * 0.85,
        radius: 3.5,
        maxRadius: 12,
        growRate: 0.12,
        alpha: 0,
        baseAlpha: 0.45,
        life: 0,
        maxLife: 100,
        color: color,
        isVolumetricSmoke: true
      });
    }
  }

  // 4. 点火与弹灰四溅火星 (Incandescent Ember Sparks)
  emitSparks(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      this._pushParticle({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 2,
        vx: (Math.random() - 0.5) * 3.5,
        vy: (Math.random() - 0.7) * 3.0,
        radius: Math.random() * 1.6 + 0.8,
        alpha: 1.0,
        baseAlpha: 1.0,
        life: 0,
        maxLife: 20,
        color: '#ff6600',
        isSpark: true
      });
    }
  }

  // 4.1 拟真重力下坠散落微细灰烬屑 (Falling Ash Crumbs - 纯净固体灰屑，无任何烟雾或火花)
  emitAshDrop(x, y, count = 3, spreadW = 6) {
    for (let i = 0; i < count; i++) {
      this._pushParticle({
        x: x + (Math.random() - 0.5) * spreadW,
        y: y + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 2.2 + Math.random() * 1.8, // 垂直自然重力下坠
        radius: 0.8 + Math.random() * (spreadW > 12 ? 1.4 : 0.8), // 固体碎屑随烟口尺寸自然匹配
        alpha: 0.75,
        baseAlpha: 0.75,
        life: 0,
        maxLife: 25 + Math.random() * 12,
        color: Math.random() < 0.6 ? '#27272a' : '#4b5563', // 深炭黑灰固体屑
        isAshFlake: true
      });
    }
  }

  // 4.1.5 腾讯大师级 · 优雅阻尼抖灰复合特效管线 (Master Ash-Tap VFX Pipeline)
  // 兼顾物理克制与艺术高级感：成型断裂碳灰块 + 炽热火星雨飞溅 + 灵光净化扩散微波
  emitAshTapVfx(cx, cy, ashH = 10, isHandRolled = false, accentColor = '#f59e0b') {
    const spreadW = isHandRolled ? 22 : 12;
    // 1. 成型断裂碳灰残块 (3~5块不同大小的灰块，重力加速度加速飘落，伴随轻微空中自旋翻转)
    const clumpCount = Math.max(3, Math.min(6, Math.floor(ashH / 8) + 3));
    for (let i = 0; i < clumpCount; i++) {
      const clumpW = 2.2 + Math.random() * (isHandRolled ? 3.2 : 2.5);
      const clumpH = 1.8 + Math.random() * 2.2;
      this._pushParticle({
        x: cx + (Math.random() - 0.5) * spreadW,
        y: cy - (Math.random() * Math.min(ashH, 20)),
        vx: (Math.random() - 0.5) * 1.8,
        vy: 1.5 + Math.random() * 2.5, // 初始下落速度
        gravity: 0.18, // 下落重力加速度
        w: clumpW,
        h: clumpH,
        radius: Math.max(clumpW, clumpH) * 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.18,
        alpha: 0.88,
        baseAlpha: 0.88,
        life: 0,
        maxLife: 38 + Math.random() * 20,
        color: Math.random() < 0.45 ? '#18181b' : (Math.random() < 0.5 ? '#3f3f46' : '#71717a'),
        isAshClump: true
      });
    }

    // 2. 细微碳灰尘雾碎屑 (8~12 颗微小灰屑随气流轻扬散落)
    const crumbCount = isHandRolled ? 12 : 8;
    for (let i = 0; i < crumbCount; i++) {
      this._pushParticle({
        x: cx + (Math.random() - 0.5) * (spreadW * 1.1),
        y: cy - Math.random() * Math.min(ashH, 15),
        vx: (Math.random() - 0.5) * 1.2,
        vy: 2.0 + Math.random() * 2.2,
        radius: 0.7 + Math.random() * 1.1,
        alpha: 0.75,
        baseAlpha: 0.75,
        life: 0,
        maxLife: 30 + Math.random() * 15,
        color: Math.random() < 0.5 ? '#27272a' : '#52525b',
        isAshFlake: true
      });
    }

    // 3. 弹指受力瞬间从火头迸溅出的炽热火星雨 (14~18 颗耀眼金红火星，向上抛物线飞溅后随重力下坠)
    const sparkCount = isHandRolled ? 18 : 14;
    for (let i = 0; i < sparkCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const speed = 2.4 + Math.random() * 3.6;
      this._pushParticle({
        x: cx + (Math.random() - 0.5) * 6,
        y: cy + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.14,
        radius: 1.0 + Math.random() * 1.6,
        alpha: 1.0,
        baseAlpha: 1.0,
        life: 0,
        maxLife: 26 + Math.random() * 14,
        color: Math.random() < 0.4 ? '#ffffff' : (Math.random() < 0.6 ? '#fef08a' : '#ea580c'),
        isEmberSpark: true
      });
    }

    // 4. 禅意净化灵光微波环 (1 圈通透纯净的金光微波环自火头轻柔扩散，象征杂念散尽、身心释怀)
    this._pushParticle({
      x: cx,
      y: cy,
      vx: 0,
      vy: -0.4,
      radius: 6,
      maxRadius: 36,
      growRate: 1.2,
      alpha: 0.85,
      baseAlpha: 0.85,
      life: 0,
      maxLife: 32,
      color: accentColor || '#f59e0b',
      isCleanseWave: true
    });
  }

  // 4.2 微距写实散落碎屑与自然脱落灰烬 (Flaking Ash Crumbs & Falling Specks)
  emitFlakingAsh(x, y) {
    this._pushParticle({
      x: x + (Math.random() - 0.5) * 6,
      y: y + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.7,
      vy: 0.8 + Math.random() * 1.5, // 优雅轻柔重力下坠
      radius: 0.7 + Math.random() * 1.2, // 脆弱微小颗粒
      alpha: 0.85,
      baseAlpha: 0.85,
      life: 0,
      maxLife: 35 + Math.random() * 25,
      color: Math.random() < 0.6 ? '#e5e7eb' : (Math.random() < 0.5 ? '#9ca3af' : '#4b5563'),
      isAshFlake: true
    });
  }

  // 4.3 起火处真实流体微烟羽 (Volumetric Combustion Smoke from Cherry Ember)
  emitVolumetricCombustionSmoke(emberX, emberY, color) {
    const activeCount = this.particles.filter(p => p.isVolumetricSmoke).length;
    if (activeCount > 14) return;

    const baseCol = color || (Math.random() < 0.65 ? 'rgba(240, 244, 252, ' : 'rgba(186, 230, 253, ');
    this._pushParticle({
      x: emberX + (Math.random() - 0.5) * 4,
      y: emberY - Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.95 + Math.random() * 0.65), // 缓和轻盈浮力
      radius: 2.6 + Math.random() * 2.0,
      growRate: 0.12 + Math.random() * 0.08, // 轻盈微扩，绝不形成庞大白雾团
      maxRadius: 15.0,
      swirlPhase: Math.random() * Math.PI * 2,
      swirlAmp: 0.35 + Math.random() * 0.35,
      alpha: 0.22,
      baseAlpha: 0.22,
      life: 0,
      maxLife: 60 + Math.random() * 25,
      color: baseCol,
      isVolumetricSmoke: true,
      isTipCombustion: true
    });
  }

  // 5. 袅袅丝绢柔情青烟 (Silk Pure Stream - 底部扇形向外自然舒展漫开)
  emitSilkStream(x, y, color = 'rgba(203, 213, 225, ') {
    for (let i = 0; i < 18; i++) {
      const spread = (i / 17 - 0.5) * 2;
      const angle = -Math.PI / 2 + spread * 0.70 + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 0.85 + 0.40;
      const lateralPush = spread * (1.8 + Math.random() * 0.8);
      this._pushParticle({
        x: x + spread * 28 + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed + lateralPush,
        vy: -(0.78 + Math.random() * 0.35),
        radius: 5.0 + Math.random() * 4.0,
        alpha: 0.52,
        baseAlpha: 0.52,
        life: 0,
        maxLife: 140 + Math.random() * 25,
        color,
        growRate: 0.25,
        isExhaleCloud: true
      });
    }
  }

  // 6. 舒缓白雾 (Cloud Dense)
  emitDenseCloud(x, y, color = 'rgba(241, 245, 249, ') {
    this.emitExhalePlume(x, y, 22, color);
  }

  // 7. 紫气东来 (Purple Zen) - 暮霭紫与天青祥云广角发散 (宣德炉香气舒展)
  emitPurpleZen(x, y) {
    const colors = [
      'rgba(192, 132, 252, ', // 暮霭紫
      'rgba(168, 85, 247, ', // 帝王紫
      'rgba(147, 197, 253, ', // 天青色
      'rgba(216, 180, 254, '  // 浅紫云霞
    ];
    for (let i = 0; i < 20; i++) {
      const spread = (i / 19 - 0.5) * 2;
      const c = colors[i % colors.length];
      const lateralPush = spread * (2.2 + Math.random() * 0.9);
      this._pushParticle({
        x: x + spread * 30 + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 10,
        vx: lateralPush,
        vy: -(0.82 + Math.random() * 0.35),
        radius: 7.0 + Math.random() * 7.0,
        alpha: 0.62,
        baseAlpha: 0.62,
        life: 0,
        maxLife: 140 + Math.random() * 25,
        color: c,
        growRate: 0.28,
        isZen: true
      });
    }
  }

  // 8. 曜世黑金 (Gold Stardust) - 黑曜石丝绒烟雾 + 24K 金箔漫天暴富金雨 + 3D 翻滚金币
  emitGoldStardust(x, y) {
    // 基础黑曜石烟雾：大团横向分散
    for (let i = 0; i < 14; i++) {
      const spread = (i / 13 - 0.5) * 2;
      const lateralPush = spread * (2.0 + Math.random() * 0.8);
      this._pushParticle({
        x: x + spread * 28 + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 8,
        vx: lateralPush,
        vy: -(0.80 + Math.random() * 0.35),
        radius: 8.0 + Math.random() * 7.0,
        alpha: 0.52,
        baseAlpha: 0.52,
        life: 0,
        maxLife: 140,
        color: 'rgba(38, 38, 38, ',
        growRate: 0.30,
        isObsidian: true
      });
    }
    // 24K 金箔闪粉：广角散射向四周飞溅散开
    for (let i = 0; i < 22; i++) {
      const spread = (i / 21 - 0.5) * 2;
      const rad = -Math.PI / 2 + spread * 0.9 + (Math.random() - 0.5) * 0.4;
      const spd = Math.random() * 1.6 + 0.6;
      this._pushParticle({
        x: x + spread * 32 + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(rad) * spd + spread * 1.4,
        vy: Math.sin(rad) * spd - 0.5,
        radius: 1.4 + Math.random() * 1.6,
        alpha: 0.95,
        baseAlpha: 0.95,
        life: 0,
        maxLife: 110 + Math.random() * 30,
        color: '#fbbf24',
        isGold: true,
        shimmerPhase: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.12 + Math.random() * 0.08
      });
    }
    // 腾讯总监设计级：曜世 24K 暴富金币雨 (3D 翻转物理下落)
    for (let i = 0; i < 5; i++) {
      const spread = (i / 4 - 0.5) * 2;
      this._pushParticle({
        x: x + spread * 26 + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 8,
        vx: spread * 1.3 + (Math.random() - 0.5) * 0.4,
        vy: -(1.6 + Math.random() * 0.8),
        radius: 6.2 + Math.random() * 2.2,
        alpha: 0.95,
        baseAlpha: 0.95,
        life: 0,
        maxLife: 135 + Math.random() * 25,
        rotAngle: Math.random() * Math.PI * 2,
        rotSpeed: 0.08 + Math.random() * 0.06,
        wobbleAngle: (Math.random() - 0.5) * 0.4,
        isGoldCoin: true
      });
    }
  }

  // 9. 极光星云 (Aurora Nebula) - 冰岛碧绿与星云幽粉波浪光晕横向广阔漫开
  emitAuroraNebula(x, y) {
    const nebulaColors = [
      'rgba(34, 211, 238, ', // 碧绿极光青
      'rgba(56, 189, 248, ', // 冰川冰蓝
      'rgba(244, 63, 94, ',  // 星云玫粉
      'rgba(192, 132, 252, '  // 幽光紫
    ];
    for (let i = 0; i < 20; i++) {
      const spread = (i / 19 - 0.5) * 2;
      const c = nebulaColors[i % nebulaColors.length];
      const lateralPush = spread * (2.2 + Math.random() * 0.9);
      this._pushParticle({
        x: x + spread * 32 + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 10,
        vx: lateralPush,
        vy: -(0.82 + Math.random() * 0.35),
        radius: 8.0 + Math.random() * 7.5,
        alpha: 0.60,
        baseAlpha: 0.60,
        life: 0,
        maxLife: 140 + Math.random() * 25,
        color: c,
        growRate: 0.30,
        isNebula: true,
        wavePhase: Math.random() * Math.PI * 2
      });
    }
  }

  // 10. 双爱心烟圈 (Heart Double) - 浪漫同心双心形涡流环，向前上方平滑浮游舒展并羽化消散
  emitHeartDouble(x, y, color = 'rgba(244, 114, 182, ') {
    const outerHeart = {
      x: x - 4,
      y: y,
      vx: -0.15,
      vy: -2.35,
      scale: 0.45,
      targetScale: 1.55,
      growRate: 0.012,
      tilt: -0.06,
      age: 0,
      maxAge: 160,
      color: color,
      lineWidth: 3.8,
      baseAlpha: 0.85,
      alpha: 0
    };
    const innerHeart = {
      x: x + 4,
      y: y + 8,
      vx: 0.12,
      vy: -2.15,
      scale: 0.28,
      targetScale: 1.05,
      growRate: 0.010,
      tilt: 0.05,
      age: 0,
      maxAge: 150,
      color: 'rgba(253, 232, 240, ',
      lineWidth: 2.8,
      baseAlpha: 0.90,
      alpha: 0
    };
    // 腾讯总监设计级：同屏最多保留 4 个爱心环（即最多 2 组双爱心），自然平滑更替，杜绝突兀斩断或重写闪烁
    if (!this.heartRings) this.heartRings = [];
    if (this.heartRings.length >= 4) {
      this.heartRings = this.heartRings.slice(-2);
    }
    this.heartRings.push(outerHeart, innerHeart);

    // 伴随柔美微粉爱心云雾伴生粒子
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this._pushParticle({
        x: x + Math.cos(angle) * 12,
        y: y + Math.sin(angle) * 8,
        vx: Math.cos(angle) * 0.4,
        vy: -1.6 + Math.sin(angle) * 0.3,
        radius: 3.2,
        maxRadius: 11.0,
        growRate: 0.12,
        alpha: 0,
        baseAlpha: 0.42,
        life: 0,
        maxLife: 95,
        color: color,
        isVolumetricSmoke: true
      });
    }

    // 腾讯总监设计级：丘比特爱神金箭贯穿双心
    this._pushParticle({
      x: x - 35,
      y: y + 20,
      vx: 3.4,
      vy: -2.7,
      length: 36,
      angle: -Math.PI * 0.22,
      alpha: 0.95,
      baseAlpha: 0.95,
      life: 0,
      maxLife: 75,
      isCupidArrow: true
    });

    // 浪漫粉钻晶莹微星
    for (let i = 0; i < 6; i++) {
      const rad = Math.random() * Math.PI * 2;
      this._pushParticle({
        x: x + Math.cos(rad) * 16,
        y: y + Math.sin(rad) * 12,
        vx: Math.cos(rad) * 0.7,
        vy: -1.7 + Math.sin(rad) * 0.4,
        outerRadius: 3.2,
        innerRadius: 1.0,
        radius: 3.5,
        alpha: 0.95,
        baseAlpha: 0.95,
        life: 0,
        maxLife: 95 + Math.random() * 20,
        color: '#fbcfe8',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: 0.05,
        twinklePhase: Math.random() * Math.PI * 2,
        isStar: true
      });
    }
  }

  // 11. 金龙吐息 (Dragon Breath) - 浓金祥云破雾而出，五爪金龙盘旋腾空九天
  emitDragonBreath(x, y, spawnDragon = true) {
    // 实例化东方神游九天金龙 (用户明确指定：严格最多显示 2 条双龙腾飞)
    if (spawnDragon) {
      if (this.dragons.length >= 2) {
        this.dragons = this.dragons.slice(-1);
      }
      const newDragon = new GoldenDragon(x, y);
      if (this.dragons.length === 1) {
        newDragon.vx = (this.dragons[0].vx > 0 ? -0.4 : 0.4);
      }
      this.dragons.push(newDragon);
    }

    // 伴随破雾而出的浓厚金色祥云 (Volumetric Auspicious Gold Clouds)
    const goldCloudColors = [
      'rgba(245, 158, 11, ',  // 琥珀金
      'rgba(254, 240, 138, ', // 明黄仙雾
      'rgba(251, 191, 36, ',  // 帝王金
      'rgba(217, 119, 6, '    // 沉香浓金
    ];
    for (let i = 0; i < 18; i++) {
      const spread = (i / 17 - 0.5) * 2;
      const c = goldCloudColors[i % goldCloudColors.length];
      const lateralPush = spread * (2.2 + Math.random() * 1.0);
      this._pushParticle({
        x: x + spread * 30 + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 12,
        vx: lateralPush,
        vy: -(1.1 + Math.random() * 0.6),
        radius: 9.0 + Math.random() * 8.5,
        alpha: 0.75,
        baseAlpha: 0.75,
        life: 0,
        maxLife: 135 + Math.random() * 30,
        color: c,
        growRate: 0.35,
        isVolumetricSmoke: true
      });
    }

    // 漫天飞射的 24K 纯金爆裂火屑
    for (let i = 0; i < 20; i++) {
      const rad = Math.random() * Math.PI * 2;
      const spd = Math.random() * 2.8 + 1.2;
      this._pushParticle({
        x: x + (Math.random() - 0.5) * 36,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(rad) * spd,
        vy: Math.sin(rad) * spd - 0.8,
        radius: 1.8 + Math.random() * 1.6,
        alpha: 0.98,
        baseAlpha: 0.98,
        life: 0,
        maxLife: 105,
        color: Math.random() < 0.5 ? '#ffffff' : '#fef08a',
        isGold: true,
        shimmerPhase: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.18
      });
    }
  }

  // 12. 爆珠捏爆物理拟真：明胶脆壳碎裂残片 + 一点点微小原液水滴四处分散并迅速被海绵吸收
  emitBeadPop(x, y, color = '#10b981') {
    // 1. 碎裂的明胶脆壳残渣 (6 块不同切角的微小脆壳碎片，在爆珠周围微距崩裂嵌附)
    const shardCount = 6;
    for (let i = 0; i < shardCount; i++) {
      const angle = (i / shardCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const speed = Math.random() * 0.85 + 0.35;
      this._pushParticle({
        x: x + Math.cos(angle) * 2.2,
        y: y + Math.sin(angle) * 2.2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: 2.0 + Math.random() * 1.6,
        h: 1.3 + Math.random() * 1.1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.18,
        alpha: 0.92,
        baseAlpha: 0.92,
        life: 0,
        maxLife: 38,
        color: color,
        isShellShard: true
      });
    }

    // 2. 一点点四处分散的微液滴 (6 颗极细微水珠，短距离分散后迅速被滤嘴海绵吸住收干)
    const dropCount = 6;
    for (let i = 0; i < dropCount; i++) {
      const angle = (i / dropCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
      const speed = Math.random() * 0.72 + 0.28;
      const r = 0.75 + Math.random() * 0.55;
      this._pushParticle({
        x: x + Math.cos(angle) * 1.5,
        y: y + Math.sin(angle) * 1.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: r,
        initialRadius: r,
        alpha: 0.82,
        baseAlpha: 0.82,
        life: 0,
        maxLife: 24,
        color: Math.random() < 0.35 ? '#ffffff' : color,
        isDroplet: true
      });
    }
  }

  // 13. 漫天繁星 (Galaxy Stars) - 浩瀚星河星云 + 四芒星钻流转闪烁 + 耀目流星划破长空
  emitGalaxyStars(x, y) {
    const galaxyColors = [
      'rgba(56, 189, 248, ',  // 冰晶星蓝
      'rgba(168, 85, 247, ',  // 暮霭幽紫
      'rgba(129, 140, 248, ', // 靛青星云
      'rgba(244, 114, 182, '  // 玫瑰星云
    ];
    // 浩瀚星云底色大团横向翻滚
    for (let i = 0; i < 16; i++) {
      const spread = (i / 15 - 0.5) * 2;
      const c = galaxyColors[i % galaxyColors.length];
      const lateralPush = spread * (2.2 + Math.random() * 0.9);
      this._pushParticle({
        x: x + spread * 32 + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 10,
        vx: lateralPush,
        vy: -(0.85 + Math.random() * 0.38),
        radius: 8.5 + Math.random() * 7.5,
        alpha: 0.60,
        baseAlpha: 0.60,
        life: 0,
        maxLife: 140 + Math.random() * 25,
        color: c,
        growRate: 0.30,
        isNebula: true,
        wavePhase: Math.random() * Math.PI * 2
      });
    }

    // 璀璨四芒星钻：漫天旋转跳跃闪烁
    for (let i = 0; i < 18; i++) {
      const spread = (i / 17 - 0.5) * 2;
      const rad = -Math.PI / 2 + spread * 0.85 + (Math.random() - 0.5) * 0.35;
      const spd = Math.random() * 1.8 + 0.8;
      const starColors = ['#ffffff', '#38bdf8', '#fef08a', '#c084fc'];
      this._pushParticle({
        x: x + spread * 36 + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(rad) * spd + spread * 1.2,
        vy: Math.sin(rad) * spd - 0.6,
        outerRadius: 3.5 + Math.random() * 3.2,
        innerRadius: 1.0 + Math.random() * 0.8,
        radius: 4.5,
        alpha: 0.95,
        baseAlpha: 0.95,
        life: 0,
        maxLife: 120 + Math.random() * 30,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        twinklePhase: Math.random() * Math.PI * 2,
        isStar: true
      });
    }

    // 流星划破长空 (Shooting Stars / Meteors)
    for (let i = 0; i < 3; i++) {
      const angle = -Math.PI * 0.32 + (Math.random() - 0.5) * 0.15;
      const spd = 5.2 + Math.random() * 2.2;
      this._pushParticle({
        x: x + (Math.random() - 0.5) * 40 - 20,
        y: y - 10 - i * 14,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        len: 26 + Math.random() * 20,
        alpha: 0.95,
        baseAlpha: 0.95,
        life: 0,
        maxLife: 42 + Math.random() * 15,
        color: '#e0f2fe',
        isShootingStar: true
      });
    }
  }

  // 14. 盛世华彩 (Grand Fireworks) - 金芒火箭腾空 + 高空绚烂锦簇连环炸裂 + 垂落漫天金雨
  emitGrandFireworks(x, y) {
    // 发射 2 枚腾空火箭
    const rocketColors = ['#f43f5e', '#fbbf24', '#38bdf8'];
    for (let i = 0; i < 2; i++) {
      const offsetX = (i === 0 ? -12 : 12) + (Math.random() - 0.5) * 8;
      this.fireworkRockets.push({
        x: x + offsetX,
        y: y,
        vx: (offsetX / 20) * 0.8,
        vy: -(6.2 + Math.random() * 1.5),
        age: 0,
        maxAge: 26 + Math.floor(Math.random() * 8),
        color: rocketColors[i % rocketColors.length],
        alpha: 1.0
      });
    }

    // 地面升腾气浪
    for (let i = 0; i < 12; i++) {
      const spread = (i / 11 - 0.5) * 2;
      this._pushParticle({
        x: x + spread * 20,
        y: y,
        vx: spread * 1.5,
        vy: -0.8 - Math.random() * 0.5,
        radius: 6.0 + Math.random() * 5.0,
        alpha: 0.55,
        baseAlpha: 0.55,
        life: 0,
        maxLife: 70,
        color: 'rgba(251, 113, 133, ',
        growRate: 0.25,
        isVolumetricSmoke: true
      });
    }
  }

  // 烟花高空绽放
  triggerFireworkExplosion(x, y, themeColor) {
    const burstColors = [
      '#f43f5e', '#fbbf24', '#38bdf8', '#c084fc', '#34d399', '#ffffff', '#fb923c'
    ];
    // 1. 核心环状炸裂彩星
    const numSparks = 28;
    for (let i = 0; i < numSparks; i++) {
      const angle = (i / numSparks) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      const spd = 2.4 + Math.random() * 2.8;
      const c = burstColors[Math.floor(Math.random() * burstColors.length)];
      this._pushParticle({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: 1.8 + Math.random() * 1.6,
        alpha: 1.0,
        baseAlpha: 1.0,
        life: 0,
        maxLife: 48 + Math.random() * 20,
        color: c,
        isFireworkBurst: true
      });
    }

    // 2. 垂落漫天锦簇金雨 (Willow Golden Rain)
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1.0 + Math.random() * 1.8;
      this._pushParticle({
        x: x + Math.cos(angle) * 8,
        y: y + Math.sin(angle) * 8,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd * 0.5 - 0.2,
        radius: 1.4 + Math.random() * 1.2,
        alpha: 0.95,
        baseAlpha: 0.95,
        life: 0,
        maxLife: 75 + Math.random() * 25,
        color: '#fbbf24',
        isWillowRain: true,
        shimmerPhase: Math.random() * Math.PI * 2
      });
    }
  }

  // 15.5 乾坤八卦 · 紫微天穹大阵 (Bagua Taichi Grand Matrix)
  emitBaguaTaichi(x, y, spawnMatrix = true) {
    if (spawnMatrix) {
      if (this.baguaMatrices.length >= 2) {
        this.baguaMatrices = this.baguaMatrices.slice(-1);
      }
      const newMatrix = new BaguaMatrix(x, y);
      if (this.baguaMatrices.length === 1) {
        newMatrix.vx = (this.baguaMatrices[0].vx > 0 ? -0.35 : 0.35);
      }
      this.baguaMatrices.push(newMatrix);
    }

    // 1. 广域昆仑青玉与紫微帝金祥云破雾 (横向大幅翻滚舒展，烘托巨幅天穹大阵)
    const cloudCount = spawnMatrix ? 16 : 8;
    const baguaCloudColors = [
      'rgba(56, 189, 248, ',   // 昆仑天青
      'rgba(251, 191, 36, ',   // 紫微帝金
      'rgba(168, 85, 247, ',   // 鸿蒙紫气
      'rgba(103, 232, 249, '   // 碧玉仙雾
    ];
    for (let i = 0; i < cloudCount; i++) {
      const spread = (i / (cloudCount - 1 || 1) - 0.5) * 2;
      const c = baguaCloudColors[i % baguaCloudColors.length];
      const lateralPush = spread * (2.6 + Math.random() * 1.1);
      this._pushParticle({
        x: x + spread * 42 + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 12,
        vx: lateralPush,
        vy: -(1.05 + Math.random() * 0.55),
        radius: 10.0 + Math.random() * 9.0,
        alpha: 0.68,
        baseAlpha: 0.68,
        life: 0,
        maxLife: 135 + Math.random() * 28,
        color: c,
        growRate: 0.38,
        isVolumetricSmoke: true
      });
    }

    // 2. 漫天激荡的天罡金翠星屑
    const sparkCount = spawnMatrix ? 18 : 8;
    for (let i = 0; i < sparkCount; i++) {
      const rad = Math.random() * Math.PI * 2;
      const spd = Math.random() * 2.6 + 1.0;
      this._pushParticle({
        x: x + (Math.random() - 0.5) * 52,
        y: y + (Math.random() - 0.5) * 14,
        vx: Math.cos(rad) * spd,
        vy: Math.sin(rad) * spd - 0.85,
        radius: 1.6 + Math.random() * 1.6,
        alpha: 0.96,
        baseAlpha: 0.96,
        life: 0,
        maxLife: 95 + Math.random() * 25,
        color: Math.random() < 0.55 ? '#fef08a' : '#67e8f9',
        isGold: true,
        shimmerPhase: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.20
      });
    }
  }

  // 15.8 佛光普照 · 梵天千叶金莲 (Buddha's Light & Celestial Thousand-Petal Golden Lotus)
  emitBuddhaLight(x, y, spawnBuddha = true) {
    if (spawnBuddha) {
      if (this.buddhaLights.length >= 2) {
        this.buddhaLights = this.buddhaLights.slice(-1);
      }
      const newBuddha = new BuddhaLightAscension(x, y);
      if (this.buddhaLights.length === 1) {
        newBuddha.vx = (this.buddhaLights[0].vx > 0 ? -0.32 : 0.32);
      }
      this.buddhaLights.push(newBuddha);
    }

    // 1. 广域旃檀暖金与红莲宝相祥云漫卷 (营造庄严璀璨的佛国金顶云海)
    const cloudCount = spawnBuddha ? 18 : 8;
    const buddhaCloudColors = [
      'rgba(251, 191, 36, ',   // 旃檀帝金
      'rgba(254, 240, 138, ',  // 峨眉佛光金
      'rgba(244, 63, 94, ',    // 宝相红莲霞
      'rgba(245, 158, 11, '    // 琉璃琥珀金
    ];
    for (let i = 0; i < cloudCount; i++) {
      const spread = (i / (cloudCount - 1 || 1) - 0.5) * 2;
      const c = buddhaCloudColors[i % buddhaCloudColors.length];
      const lateralPush = spread * (2.6 + Math.random() * 1.1);
      this._pushParticle({
        x: x + spread * 44 + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 12,
        vx: lateralPush,
        vy: -(1.05 + Math.random() * 0.55),
        radius: 10.5 + Math.random() * 9.0,
        alpha: 0.72,
        baseAlpha: 0.72,
        life: 0,
        maxLife: 140 + Math.random() * 30,
        color: c,
        growRate: 0.38,
        isVolumetricSmoke: true
      });
    }

    // 2. 步步生莲：随呼气凌空绽放飘舞的 3D 宝相金莲花瓣
    const petalCount = spawnBuddha ? 8 : 4;
    for (let i = 0; i < petalCount; i++) {
      const spread = (i / (petalCount - 1 || 1) - 0.5) * 2;
      this._pushParticle({
        x: x + spread * 48 + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 14,
        vx: spread * 1.2 + (Math.random() - 0.5) * 0.6,
        vy: -(1.35 + Math.random() * 0.65),
        radius: 6.2 + Math.random() * 3.2,
        alpha: 0.95,
        baseAlpha: 0.95,
        life: 0,
        maxLife: 115 + Math.random() * 30,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.06,
        swayPhase: Math.random() * Math.PI * 2,
        color: Math.random() < 0.68 ? '#fde047' : '#fb7185',
        isLotusPetal: true
      });
    }

    // 3. 漫天菩提舍利金雨星芒
    const sparkCount = spawnBuddha ? 20 : 8;
    for (let i = 0; i < sparkCount; i++) {
      const rad = Math.random() * Math.PI * 2;
      const spd = Math.random() * 2.6 + 1.0;
      this._pushParticle({
        x: x + (Math.random() - 0.5) * 54,
        y: y + (Math.random() - 0.5) * 14,
        vx: Math.cos(rad) * spd,
        vy: Math.sin(rad) * spd - 0.85,
        radius: 1.6 + Math.random() * 1.8,
        alpha: 0.98,
        baseAlpha: 0.98,
        life: 0,
        maxLife: 100 + Math.random() * 25,
        color: Math.random() < 0.65 ? '#fef08a' : '#fbbf24',
        isGold: true,
        shimmerPhase: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.20
      });
    }
  }

  // 15. 步步高升 · 祥瑞字河 (Auspicious Word River) - 纯正金红四字吉语星河螺旋腾飞 + 双轨回旋缎带 + 破晓神光 (绝无福印遮挡)
  emitAuspiciousRiver(x, y, spawnRiver = true) {
    if (spawnRiver) {
      // 腾讯总监设计级：空间错层接力，最多保留 2 条字河错层升腾，杜绝旧吉语被强行截断
      if (this.wordRivers.length >= 2) {
        this.wordRivers = this.wordRivers.slice(-1);
      }
      this.wordRivers.push(new AuspiciousRiver(x, y));
    }

    // 伴生底层清透暖金祥云微雾 (主波 8 颗，次级微波 4 颗轻柔补给，杜绝粒子堆叠)
    const count = spawnRiver ? 8 : 4;
    const auraColors = [
      'rgba(245, 158, 11, ',
      'rgba(254, 240, 138, ',
      'rgba(251, 191, 36, '
    ];
    for (let i = 0; i < count; i++) {
      const spread = (i / (count - 1 || 1) - 0.5) * 2;
      const c = auraColors[i % auraColors.length];
      this._pushParticle({
        x: x + spread * 22 + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 8,
        vx: spread * 1.2,
        vy: -(1.0 + Math.random() * 0.4),
        radius: 6.5 + Math.random() * 5.0,
        alpha: 0.50,
        baseAlpha: 0.50,
        life: 0,
        maxLife: 100 + Math.random() * 20,
        color: c,
        growRate: 0.25,
        isVolumetricSmoke: true
      });
    }

    // 伴生升腾金芒星屑 (主波 12 颗，次级微波 4 颗)
    const sparkCount = spawnRiver ? 12 : 4;
    for (let i = 0; i < sparkCount; i++) {
      const rad = Math.random() * Math.PI * 2;
      const spd = Math.random() * 1.8 + 0.6;
      this._pushParticle({
        x: x + (Math.random() - 0.5) * 26,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(rad) * spd,
        vy: Math.sin(rad) * spd - 0.8,
        radius: 1.2 + Math.random() * 1.4,
        alpha: 0.90,
        baseAlpha: 0.90,
        life: 0,
        maxLife: 85,
        color: Math.random() < 0.6 ? '#fbbf24' : '#fef08a',
        isGold: true,
        shimmerPhase: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.20
      });
    }
  }

  // 15.5 福愿金墨 · 古雅印章 (Blessing Runes) - 沉香金雾 + 凝结升腾古雅篆金福印【福/安/顺/吉/自在】+ 祈愿流光
  emitBlessingRunes(x, y) {
    // 沉香暖金烟雾
    const sandalwoodColors = [
      'rgba(245, 158, 11, ',
      'rgba(254, 240, 138, ',
      'rgba(217, 119, 6, ',
      'rgba(251, 191, 36, '
    ];
    for (let i = 0; i < 14; i++) {
      const spread = (i / 13 - 0.5) * 2;
      const c = sandalwoodColors[i % sandalwoodColors.length];
      const lateralPush = spread * (2.0 + Math.random() * 0.8);
      this._pushParticle({
        x: x + spread * 28 + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 10,
        vx: lateralPush,
        vy: -(0.9 + Math.random() * 0.4),
        radius: 8.5 + Math.random() * 7.5,
        alpha: 0.65,
        baseAlpha: 0.65,
        life: 0,
        maxLife: 135 + Math.random() * 25,
        color: c,
        growRate: 0.32,
        isVolumetricSmoke: true
      });
    }

    // 凌空凝结的古雅篆金福印 (如 福、财、暴富、顺、康、喜、大吉、发财、自在)
    const blessingWords = ['福', '财', '暴富', '顺', '康', '喜', '大吉', '发财', '自在'];
    const shuffled = [...blessingWords].sort(() => 0.5 - Math.random());
    const count = 4;
    for (let i = 0; i < count; i++) {
      const spread = (i / (count - 1) - 0.5) * 2;
      const word = shuffled[i];
      this._pushParticle({
        x: x + spread * 38 + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 14 - i * 8,
        vx: spread * 0.6 + (Math.random() - 0.5) * 0.3,
        vy: -(1.4 + Math.random() * 0.4),
        text: word,
        width: 32,
        height: 32,
        radius: 16,
        alpha: 0,
        baseAlpha: 0.95,
        life: 0,
        maxLife: 145 + Math.random() * 25,
        rotation: (Math.random() - 0.5) * 0.12,
        swayPhase: Math.random() * Math.PI * 2,
        isBlessingToken: true
      });
    }

    // 伴随漫天环绕的 24K 金印流光星屑
    for (let i = 0; i < 20; i++) {
      const rad = Math.random() * Math.PI * 2;
      const spd = Math.random() * 2.2 + 0.8;
      this._pushParticle({
        x: x + (Math.random() - 0.5) * 32,
        y: y + (Math.random() - 0.5) * 14,
        vx: Math.cos(rad) * spd,
        vy: Math.sin(rad) * spd - 0.7,
        radius: 1.5 + Math.random() * 1.5,
        alpha: 0.95,
        baseAlpha: 0.95,
        life: 0,
        maxLife: 110,
        color: Math.random() < 0.6 ? '#fbbf24' : '#fef08a',
        isGold: true,
        shimmerPhase: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.16
      });
    }
  }

  // 16. 赤焰神凰 (Phoenix Nirvana) - 赤金烈焰长鸣展翅，九天神凰翱翔，流光凤尾与炽羽
  emitPhoenixNirvana(x, y, spawnPhoenix = true) {
    // 实例化东方赤焰神凰 (用户明确指定：严格最多显示 2 只双凰展翅)
    if (spawnPhoenix) {
      if (this.phoenixes.length >= 2) {
        this.phoenixes = this.phoenixes.slice(-1);
      }
      const newPhoenix = new FirePhoenix(x, y);
      if (this.phoenixes.length === 1) {
        newPhoenix.vx = (this.phoenixes[0].vx > 0 ? -0.45 : 0.45);
      }
      this.phoenixes.push(newPhoenix);
    }

    // 伴随破空而出的赤焰神霞浓雾
    const flameColors = [
      'rgba(249, 115, 22, ', // 炽金离火
      'rgba(234, 88, 12, ',  // 朱雀赤炎
      'rgba(254, 240, 138, ', // 金羽流光
      'rgba(239, 68, 68, '   // 南明红焰
    ];
    for (let i = 0; i < 18; i++) {
      const spread = (i / 17 - 0.5) * 2;
      const c = flameColors[i % flameColors.length];
      const lateralPush = spread * (2.2 + Math.random() * 1.0);
      this._pushParticle({
        x: x + spread * 30 + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 12,
        vx: lateralPush,
        vy: -(1.1 + Math.random() * 0.6),
        radius: 9.0 + Math.random() * 8.5,
        alpha: 0.75,
        baseAlpha: 0.75,
        life: 0,
        maxLife: 135 + Math.random() * 30,
        color: c,
        growRate: 0.35,
        isVolumetricSmoke: true
      });
    }

    // 漫天飘扬的炽羽金星
    for (let i = 0; i < 20; i++) {
      const rad = Math.random() * Math.PI * 2;
      const spd = Math.random() * 2.8 + 1.2;
      this._pushParticle({
        x: x + (Math.random() - 0.5) * 36,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(rad) * spd,
        vy: Math.sin(rad) * spd - 0.8,
        radius: 1.8 + Math.random() * 1.6,
        alpha: 0.98,
        baseAlpha: 0.98,
        life: 0,
        maxLife: 105,
        color: Math.random() < 0.5 ? '#f97316' : '#fef08a',
        isGold: true,
        shimmerPhase: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.18
      });
    }
  }

  // 统一特效调度入口
  emitByEffect(effectId, x, y, baseColor) {
    switch (effectId) {
      case 'ring_classic':
        this.emitSmokeRing(x, y, baseColor || 'rgba(235, 240, 252, ');
        break;
      case 'silk_pure':
        this.emitSilkStream(x, y, baseColor || 'rgba(203, 213, 225, ');
        break;
      case 'purple_zen':
        this.emitPurpleZen(x, y);
        break;
      case 'gold_stardust':
        this.emitGoldStardust(x, y);
        break;
      case 'aurora_nebula':
        this.emitAuroraNebula(x, y);
        break;
      case 'heart_double':
        this.emitHeartDouble(x, y);
        break;
      case 'dragon_breath':
        this.emitDragonBreath(x, y);
        break;
      case 'galaxy_stars':
        this.emitGalaxyStars(x, y);
        break;
      case 'grand_fireworks':
        this.emitGrandFireworks(x, y);
        break;
      case 'auspicious_river':
        this.emitAuspiciousRiver(x, y);
        break;
      case 'bagua_taichi':
        this.emitBaguaTaichi(x, y);
        break;
      case 'buddha_light':
        this.emitBuddhaLight(x, y);
        break;
      case 'blessing_runes':
        this.emitBlessingRunes(x, y);
        break;
      case 'phoenix_nirvana':
        this.emitPhoenixNirvana(x, y);
        break;
      default:
        this.emitSmoke(x, y, 32, baseColor);
        break;
    }
  }

  update(canvasHeight) {
    this.time += 0.035;
    const ch = (typeof canvasHeight === 'number' && canvasHeight > 0) ? canvasHeight : 800;

    // 屏幕顶部绝对安全屏障：烟雾绝不触碰屏幕顶部，保留上方充足安全距离
    const ceilingY = Math.max(100, ch * 0.22);

    // 点火渐进爬升生长限制 (用户核心需求：“慢慢的上去，不要立马变成直线一条，总得有个过程”)
    let climbLimit = 180; // 稳定期最大可见爬升高度 (~180px 处完全淡化融入空气)
    let speedFactor = 1.0;

    if (this.igniteStartTime > 0) {
      const elapsed = (Date.now() - this.igniteStartTime) / 1000;
      const warmDuration = 2.4; // 点火后 2.4 秒内缓慢从烟头长高升腾
      if (elapsed < 0.35) {
        climbLimit = 0;
        speedFactor = 0.5;
      } else {
        const growProg = Math.min(1.0, (elapsed - 0.35) / warmDuration);
        // 缓动曲线模拟热气流加速升腾过程
        const easeProg = Math.pow(growProg, 1.25);
        climbLimit = Math.max(8, easeProg * 180);
        speedFactor = 0.65 + growProg * 0.35;
        if (growProg >= 1.0) {
          this.igniteStartTime = 0; // 生长阶段完毕，进入持续阴燃稳定态
        }
      }
    }

    // 1. 更新真实“一缕青烟”连续流体节点：轻柔升腾、曼妙 S 形曲线行波、半路自然扩散淡出
    if (this.silkStreams) {
      // 空间行波参数：波长 lambda1 = 60px (180px 高度内呈现 2.5~3 个优雅 S 弯曲周期), lambda2 = 34px (次级谐波扰动)
      const k1 = (Math.PI * 2) / 60;
      const k2 = (Math.PI * 2) / 34;

      for (const stream of this.silkStreams) {
        for (let i = stream.nodes.length - 1; i >= 0; i--) {
          const n = stream.nodes[i];
          n.age++;
          const p = n.age / n.maxAge;

          // 浮力上升：慢速平缓推进 (~1.15 - 1.35 px/frame * speedFactor)
          const vy = (1.15 + p * 0.20) * speedFactor;
          n.y -= vy;

          // 距离烟头燃烧端的上升垂直跨度
          const tipRefY = stream.nodes[stream.nodes.length - 1] ? stream.nodes[stream.nodes.length - 1].y : n.y;
          const distFromTip = Math.max(0, tipRefY - n.y);

          // 烟头根部锚定过渡：离开烟头前 12px 逐渐由 0 展开到满偏摆，防止脱离烟头
          const rootAnchor = Math.min(1.0, distFromTip / 12);

          // 振幅包络：随着上升，烟气受空气对流扰动，摆动幅度柔和增大 (由 3.5px 缓慢展开到 ~15px)
          const waveAmp = (3.5 + Math.min(14.0, (distFromTip / 120) * 12.0)) * stream.widthScale * rootAnchor;

          // 向上行进的空间行波 (Traveling Wave: k * dist - omega * t)：曼妙起伏的 S 形袅袅青烟，杜绝任何僵硬直线
          const wave1 = Math.sin(k1 * distFromTip - this.time * 2.2 + stream.phase) * waveAmp;
          const wave2 = Math.sin(k2 * distFromTip - this.time * 3.6 + stream.phase * 0.7) * (waveAmp * 0.32);

          n.x = n.baseX + wave1 + wave2;

          // 宽度随高度平滑展开：由烟头的 2.0px 细缕柔和扩展到顶部的羽化丝绢 (~16px)
          n.width = 2.0 + Math.min(16.0, (distFromTip / 130) * 14.0 * stream.widthScale);

          // 点火初生爬升生长锋面淡出截断 (锋面顶部 16px 柔和羽化消融，实现从无到有“慢慢长上去”的过程)
          let climbFrontFade = 1.0;
          if (distFromTip > climbLimit) {
            climbFrontFade = 0.0;
          } else if (distFromTip > climbLimit - 16) {
            climbFrontFade = Math.max(0, (climbLimit - distFromTip) / 16);
          }

          // 用户需求核心：半路自然进入淡出 (70px 处开始羽化渐隐，180px 处彻底消散融入空气)
          let midwayFade = 1.0;
          if (distFromTip > 70) {
            const fadeProg = Math.max(0, 1 - (distFromTip - 70) / 110);
            midwayFade = Math.pow(fadeProg, 1.4);
          }

          // 顶部绝对安全屏障：绝不上到屏幕顶部 (接近 ceilingY 处加速渐隐)
          let ceilingFade = 1.0;
          if (n.y < ceilingY + 80) {
            ceilingFade = Math.max(0, (n.y - ceilingY) / 80);
          }

          // 根部初生阶段平滑过渡 (前 12px)，防止烟头交界处出现生硬切口
          const birthFade = Math.min(1.0, distFromTip / 12);

          n.alpha = (stream.id === 'main' ? 0.58 : 0.38) * birthFade * midwayFade * ceilingFade * climbFrontFade;

          // 升至半路消散高度 (约 180px)、超出当前点火生长限制、触及安全天花板、寿命耗尽或透明度极低时自然移除
          if (distFromTip >= 180 || distFromTip > climbLimit || n.y <= ceilingY || n.age >= n.maxAge || n.alpha <= 0.005) {
            stream.nodes.splice(i, 1);
          }
        }
      }
    }

    // 2. 更新 3D 环形涡流烟圈 (Toroidal Smoke Rings - 优雅向前滑行、直径扩张并柔和羽化消散)
    if (this.smokeRings && this.smokeRings.length) {
      for (let i = this.smokeRings.length - 1; i >= 0; i--) {
        const r = this.smokeRings[i];
        r.age++;
        const prog = r.age / r.maxAge;

        // 速度阻尼
        r.vy *= 0.985;
        if (r.vy > -0.55) {
          r.vy = -0.55;
        }
        r.vx *= 0.98;
        r.x += r.vx;
        r.y += r.vy;

        // 环形直径平滑扩张
        if (r.radius < r.targetMaxRadius) {
          r.radius += r.growRate * (1 - prog * 0.35);
        }
        // 环管厚度扩散
        if (r.tubeThickness < r.maxTubeThickness) {
          r.tubeThickness += r.tubeGrowRate;
        }

        // 初生凝结淡入 (0 -> 15 帧: 0.0 -> 0.88)
        let birthFade = 1.0;
        if (r.age < 15) {
          birthFade = Math.sin((r.age / 15) * (Math.PI / 2));
        }

        // 中后段羽化消散 (prog > 0.52 开始柔和立方渐隐)
        let lifeFade = 1.0;
        if (prog > 0.52) {
          const fadeProg = Math.max(0, 1 - (prog - 0.52) / 0.48);
          lifeFade = Math.pow(fadeProg, 1.8);
        }

        // 顶部天花板安全距离渐隐
        let ceilingFade = 1.0;
        if (r.y < ceilingY + 110) {
          ceilingFade = Math.max(0, (r.y - ceilingY) / 110);
        }

        r.alpha = r.baseAlpha * birthFade * lifeFade * ceilingFade;

        if (r.age >= r.maxAge || r.y <= ceilingY || r.alpha <= 0.005) {
          this.smokeRings.splice(i, 1);
        }
      }
    }

    // 3. 更新 3D 浪漫同心爱心涡流烟圈 (Heart Vortex Rings)
    if (this.heartRings && this.heartRings.length) {
      for (let i = this.heartRings.length - 1; i >= 0; i--) {
        const h = this.heartRings[i];
        h.age++;
        const prog = h.age / h.maxAge;

        h.vy *= 0.985;
        if (h.vy > -0.55) {
          h.vy = -0.55;
        }
        h.vx *= 0.98;
        h.x += h.vx;
        h.y += h.vy;

        if (h.scale < h.targetScale) {
          h.scale += h.growRate * (1 - prog * 0.35);
        }
        h.lineWidth = Math.min(8.5, h.lineWidth + 0.025);

        // 初生凝结柔和淡入 (0 -> 18 帧：平滑三次缓入，无阶跃闪烁)
        let birthFade = 1.0;
        if (h.age < 18) {
          const t = h.age / 18;
          birthFade = t * t * (3 - 2 * t); // Smoothstep 曲线，切线在 0 处为 0，杜绝突兀闪动
        }

        let lifeFade = 1.0;
        if (prog > 0.52) {
          const fadeProg = Math.max(0, 1 - (prog - 0.52) / 0.48);
          lifeFade = Math.pow(fadeProg, 1.8);
        }

        let ceilingFade = 1.0;
        if (h.y < ceilingY + 110) {
          ceilingFade = Math.max(0, (h.y - ceilingY) / 110);
        }

        h.alpha = h.baseAlpha * birthFade * lifeFade * ceilingFade;

        if (h.age >= h.maxAge || h.y <= ceilingY || h.alpha <= 0.005) {
          this.heartRings.splice(i, 1);
        }
      }
    }

    // 3.5 更新神游九天金龙 (Golden Celestial Dragons)
    if (this.dragons && this.dragons.length) {
      for (let i = this.dragons.length - 1; i >= 0; i--) {
        const d = this.dragons[i];
        const isAlive = d.update(ch, ceilingY, (p) => this._pushParticle(p));
        if (!isAlive) {
          this.dragons.splice(i, 1);
        }
      }
    }

    // 3.6 更新神游九天赤焰神凰 (Fire Phoenixes)
    if (this.phoenixes && this.phoenixes.length) {
      for (let i = this.phoenixes.length - 1; i >= 0; i--) {
        const ph = this.phoenixes[i];
        const isAlive = ph.update(ch, ceilingY, (p) => this._pushParticle(p));
        if (!isAlive) {
          this.phoenixes.splice(i, 1);
        }
      }
    }

    // 3.65 更新步步高升祥瑞字河 (Auspicious Word Rivers)
    if (this.wordRivers && this.wordRivers.length) {
      for (let i = this.wordRivers.length - 1; i >= 0; i--) {
        const river = this.wordRivers[i];
        const isAlive = river.update(ch, ceilingY, (p) => this._pushParticle(p));
        if (!isAlive) {
          this.wordRivers.splice(i, 1);
        }
      }
    }

    // 3.68 更新乾坤八卦 · 紫微星盘 (Bagua Taichi Matrices)
    if (this.baguaMatrices && this.baguaMatrices.length) {
      for (let i = this.baguaMatrices.length - 1; i >= 0; i--) {
        const matrix = this.baguaMatrices[i];
        const isAlive = matrix.update(ch, ceilingY, (p) => this._pushParticle(p));
        if (!isAlive) {
          this.baguaMatrices.splice(i, 1);
        }
      }
    }

    // 3.69 更新佛光普照 · 梵天千叶金莲 (Buddha's Light & Golden Lotus)
    if (this.buddhaLights && this.buddhaLights.length) {
      for (let i = this.buddhaLights.length - 1; i >= 0; i--) {
        const buddha = this.buddhaLights[i];
        const isAlive = buddha.update(ch, ceilingY, (p) => this._pushParticle(p));
        if (!isAlive) {
          this.buddhaLights.splice(i, 1);
        }
      }
    }

    // 3.7 更新盛世华彩烟花火箭 (Firework Rockets)
    if (this.fireworkRockets && this.fireworkRockets.length) {
      for (let i = this.fireworkRockets.length - 1; i >= 0; i--) {
        const rk = this.fireworkRockets[i];
        rk.age++;
        rk.x += rk.vx;
        rk.y += rk.vy;
        rk.vy *= 0.95;

        if (rk.age % 2 === 0) {
          this._pushParticle({
            x: rk.x + (Math.random() - 0.5) * 3,
            y: rk.y + 4,
            vx: (Math.random() - 0.5) * 0.8,
            vy: 0.8 + Math.random() * 0.8,
            radius: 1.4,
            alpha: 0.85,
            baseAlpha: 0.85,
            life: 0,
            maxLife: 16,
            color: '#fef08a',
            isSpark: true
          });
        }

        if (rk.age >= rk.maxAge || rk.vy > -1.2 || rk.y <= ceilingY + 80) {
          this.triggerFireworkExplosion(rk.x, rk.y, rk.color);
          this.fireworkRockets.splice(i, 1);
        }
      }
    }

    // 4. 细烟缕：清空废弃
    this.wispTrail = [];

    // 5. 更新浓烟雾、火星与各类微粒
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;

      // 初生羽化淡入：前 8 帧平滑淡入 (从无到有自然涌现，绝不突兀蹦出)
      const birthFade = Math.min(1.0, (p.life + 1) / 8);

      // 随时间推移自然消散 (半路扩散进入淡出，寿命末期完全融入空气)
      const prog = p.life / p.maxLife;
      let lifeFade = 1.0;
      if (prog > 0.35) {
        const decay = Math.max(0, 1 - (prog - 0.35) / 0.65);
        lifeFade = Math.pow(decay, 1.6);
      }

      // 绝不上到屏幕顶部安全屏障 (接近 ceilingY 处平滑截断)
      let ceilingFade = 1.0;
      if (p.y < ceilingY + 90) {
        ceilingFade = Math.max(0, (p.y - ceilingY) / 90);
      }

      const fadeMultiplier = birthFade * lifeFade * ceilingFade;

      if (p.isExhaleCloud) {
        // 1. 空气阻力动力学（Fluid Aerodynamic Drag）：出嘴后的喷射冲力迅速被周围冷空气缓冲
        p.vy *= 0.962; // 前冲阻尼快速吸收向上冲量
        if (p.vy > -0.72) {
          p.vy = -0.72 - Math.sin(p.life * 0.035) * 0.12; // 阻尼减速后，由微弱热浮力维持轻柔慢速升腾
        }

        // 2. 动能转化横向大范围翻滚漫散（Kinetic Dispersion & Mushroom Billow）
        const dispFactor = Math.min(1.0, p.life / 28);
        p.vx += (p.lateralPush || 0) * 0.032 * (1 - dispFactor * 0.45);
        p.vx *= 0.978; // 空气横向黏滞阻尼

        // 3. 涡流翻滚与空气微扰（Curl Vortices & Micro Drift）
        p.swirlPhase = (p.swirlPhase || 0) + (p.swirlSpeed || 0.03);
        const curlX = Math.cos(p.swirlPhase) * (p.swirlAmp || 0.75);
        const curlY = Math.sin(p.swirlPhase) * ((p.swirlAmp || 0.75) * 0.35);

        // 4. 真实位移更新
        p.x += p.vx + curlX + (p.ambientDrift || 0);
        p.y += p.vy + curlY;

        // 5. 体积非线性蓬松膨胀（云雾逐渐散开且厚重蓬松）
        if (p.radius < (p.maxRadius || 65)) {
          p.radius += (p.growRate || 0.38);
        }

        // 6. 密度与透明度羽化衰减
        p.alpha = (p.baseAlpha || 0.52) * fadeMultiplier;
      } else if (p.isVolumetricSmoke) {
        // 真实起火处涌现的微距流体烟雾团：带轻柔涡流扰动，自然扩散展开
        p.swirlPhase = (p.swirlPhase || 0) + 0.04;
        const swirlOffset = Math.sin(p.swirlPhase) * (p.swirlAmp || 0.45);
        p.x += p.vx + swirlOffset;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy = Math.min(-0.75, p.vy * 0.99 - 0.008);
        p.radius = Math.min(p.maxRadius || 32, p.radius + (p.growRate || 0.22));
        p.alpha = (p.baseAlpha || 0.42) * fadeMultiplier;
      } else if (p.isSpark) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.vx *= 0.95;
        p.alpha = Math.max(0, p.alpha - 1 / p.maxLife);
      } else if (p.isAshFlake) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.vx *= 0.97;
        p.alpha = Math.max(0, p.alpha - 1 / p.maxLife);
      } else if (p.isGold) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.vx *= 0.965;
        p.shimmerPhase += p.shimmerSpeed || 0.1;
        p.alpha = (p.baseAlpha || 0.95) * fadeMultiplier;
      } else if (p.isRing) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy = Math.min(-0.80, p.vy * 0.995);
        p.radius += 0.22;
        p.alpha = (p.baseAlpha || 0.52) * fadeMultiplier;
      } else if (p.isDragon) {
        p.helixAngle += 0.05;
        p.helixRadius += 0.14;
        p.centerX += p.vx;
        p.x = p.centerX + Math.cos(p.helixAngle) * p.helixRadius;
        p.y += p.vy;
        p.vy = Math.min(-0.85, p.vy * 0.99 - 0.010);
        p.radius += (p.growRate || 0.22);
        p.alpha = (p.baseAlpha || 0.72) * fadeMultiplier;
      } else if (p.isZen) {
        p.x += p.vx + Math.sin(p.life * 0.05) * 0.65;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy = Math.min(-0.80, p.vy * 0.99 - 0.010);
        p.radius += (p.growRate || 0.28);
        p.alpha = (p.baseAlpha || 0.62) * fadeMultiplier;
      } else if (p.isNebula) {
        p.x += p.vx + Math.cos(p.life * 0.05 + p.wavePhase) * 0.65;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy = Math.min(-0.80, p.vy * 0.99 - 0.010);
        p.radius += (p.growRate || 0.28);
        p.alpha = (p.baseAlpha || 0.60) * fadeMultiplier;
      } else if (p.isHeart) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy = Math.min(-0.85, p.vy * 0.995);
        p.radius += 0.12;
        p.alpha = (p.baseAlpha || 0.72) * fadeMultiplier;
      } else if (p.isObsidian) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy = Math.min(-0.80, p.vy * 0.99 - 0.010);
        p.radius += (p.growRate || 0.30);
        p.alpha = (p.baseAlpha || 0.52) * fadeMultiplier;
      } else if (p.isStar) {
        // 四芒星微动浮空与旋转闪烁
        p.rotation += (p.rotSpeed || 0.02);
        p.twinklePhase = (p.twinklePhase || 0) + 0.12;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy = Math.min(-0.65, p.vy * 0.99 - 0.008);
        const twinkle = 0.65 + 0.35 * Math.sin(p.twinklePhase);
        p.alpha = (p.baseAlpha || 0.95) * fadeMultiplier * twinkle;
      } else if (p.isShootingStar) {
        // 流星划破长空
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = (p.baseAlpha || 0.95) * fadeMultiplier;
      } else if (p.isFireworkBurst) {
        // 烟花高空绽放彩星
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.955;
        p.vy += 0.045; // 微重力下坠
        p.alpha = (p.baseAlpha || 1.0) * fadeMultiplier;
      } else if (p.isWillowRain) {
        // 垂落金雨
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.055; // 重力下垂
        p.vx *= 0.975;
        p.shimmerPhase = (p.shimmerPhase || 0) + 0.15;
        const shimmer = 0.6 + 0.4 * Math.sin(p.shimmerPhase);
        p.alpha = (p.baseAlpha || 0.95) * fadeMultiplier * shimmer;
      } else if (p.isBlessingToken) {
        // 篆金福印温润升腾与轻微摇曳
        p.swayPhase = (p.swayPhase || 0) + 0.045;
        const sway = Math.sin(p.swayPhase) * 0.55;
        p.x += p.vx + sway;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy = Math.min(-0.85, p.vy * 0.99 - 0.006);
        p.rotation = Math.sin(p.swayPhase * 0.6) * 0.08;
        p.alpha = (p.baseAlpha || 0.95) * fadeMultiplier;
      } else if (p.isLotusPetal) {
        // 宝相金莲花瓣随风摇曳升腾
        p.swayPhase = (p.swayPhase || 0) + 0.055;
        const petalSway = Math.sin(p.swayPhase) * 0.65;
        p.x += p.vx + petalSway;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy = Math.min(-0.75, p.vy * 0.992);
        p.rotation = (p.rotation || 0) + (p.rotSpeed || 0.03);
        p.alpha = (p.baseAlpha || 0.92) * fadeMultiplier;
      } else if (p.isGoldCoin) {
        // 曜世 24K 金币受自然微重力下落与 3D 轴翻滚
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.045;
        p.vx *= 0.98;
        p.rotAngle = (p.rotAngle || 0) + (p.rotSpeed || 0.08);
        p.wobbleAngle = (p.wobbleAngle || 0) + 0.04;
        p.alpha = (p.baseAlpha || 0.95) * fadeMultiplier;
      } else if (p.isCupidArrow) {
        // 丘比特爱神金箭疾速划破长空
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.alpha = (p.baseAlpha || 0.95) * fadeMultiplier;
      } else if (p.isAshClump) {
        // 成型断裂碳灰块：自旋翻滚 + 重力加速下坠
        p.x += p.vx;
        p.y += p.vy;
        p.vy += (p.gravity || 0.18);
        p.vx *= 0.98;
        p.rotation = (p.rotation || 0) + (p.rotSpeed || 0.12);
        p.alpha = Math.max(0, (p.baseAlpha || 0.88) * (1 - p.life / p.maxLife));
      } else if (p.isEmberSpark) {
        // 炽热火星雨：抛物线初速飞溅 + 重力加速下坠，闪烁微爆
        p.x += p.vx;
        p.y += p.vy;
        p.vy += (p.gravity || 0.14);
        p.vx *= 0.97;
        p.alpha = Math.max(0, (p.baseAlpha || 1.0) * (1 - p.life / p.maxLife));
      } else if (p.isCleanseWave) {
        // 禅意净化金光微波：自火头平滑向外膨胀扩散并柔和羽化
        p.x += p.vx;
        p.y += p.vy;
        p.radius += (p.growRate || 1.2);
        p.alpha = Math.max(0, (p.baseAlpha || 0.85) * (1 - Math.pow(p.life / p.maxLife, 1.8)));
      } else if (p.isShellShard) {
        // 爆珠撕裂四分五裂胶壳残片：受瞬间破裂初速飞溅，迅速在海绵中阻尼减速微旋
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.86;
        p.vy *= 0.86;
        p.rotation = (p.rotation || 0) + (p.rotSpeed || 0.05);
        p.alpha = Math.max(0, (p.baseAlpha || 0.95) * (1 - p.life / p.maxLife));
      } else if (p.isDroplet) {
        // 拟真微晶原液水滴：向外溅射并迅速被滤嘴海绵吸收
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.radius = Math.max(0.6, (p.initialRadius || 1.3) * (1 - (p.life / p.maxLife) * 0.35));
        p.alpha = Math.max(0, (p.baseAlpha || 0.92) * (1 - p.life / p.maxLife));
      } else {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy = Math.min(-0.80, p.vy * 0.99 - 0.010);
        p.radius += (p.growRate || 0.25);
        p.alpha = (p.baseAlpha || 0.55) * fadeMultiplier;
      }

      // 半路消散、触及安全天花板或超时则自然移除
      if (p.life >= p.maxLife || p.alpha <= 0.005 || (!p.isSpark && !p.isAshFlake && p.y <= ceilingY)) {
        this.particles.splice(i, 1);
      }
    }
  }

  // 渲染真实连贯“一缕青烟”流体丝带 (由烟头自然升腾，半路羽化淡出)
  renderSilkStreams(ctx) {
    if (!this.silkStreams) return;

    // 初生生长阶段透明度软调节 (刚点燃时轻柔淡雅，随生长升腾逐渐饱满)
    let streamAlpha = 1.0;
    if (this.igniteStartTime > 0) {
      const elapsed = (Date.now() - this.igniteStartTime) / 1000;
      const growProg = Math.min(1.0, Math.max(0, (elapsed - 0.35) / 2.4));
      streamAlpha = Math.min(1.0, Math.max(0.45, 0.45 + growProg * 0.55));
    }

    for (const stream of this.silkStreams) {
      const nodes = stream.nodes;
      if (!nodes || nodes.length < 3) continue;

      const bottomY = nodes[nodes.length - 1].y; // 烟头当前燃烧端坐标 (下方)
      const topY = nodes[0].y; // 丝带上升最高点 (半路淡出最高处)
      const span = Math.max(16, bottomY - topY);

      const baseColorPrefix = (nodes[nodes.length - 1] && nodes[nodes.length - 1].color)
        ? nodes[nodes.length - 1].color
        : 'rgba(165, 205, 245, ';

      ctx.save();
      ctx.globalAlpha = streamAlpha;

      // 1. 底层：柔和弥散光晕 (Soft Cerulean Aura - 半路羽化淡出)
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      for (let i = 1; i < nodes.length - 1; i++) {
        const xc = (nodes[i].x + nodes[i + 1].x) / 2;
        const yc = (nodes[i].y + nodes[i + 1].y) / 2;
        ctx.quadraticCurveTo(nodes[i].x, nodes[i].y, xc, yc);
      }
      try {
        const auraGrad = ctx.createLinearGradient(0, bottomY, 0, bottomY - span);
        auraGrad.addColorStop(0, `${baseColorPrefix}0.0)`);
        auraGrad.addColorStop(0.12, `${baseColorPrefix}${stream.id === 'main' ? '0.24)' : '0.15)'}`);
        auraGrad.addColorStop(0.45, `${baseColorPrefix}${stream.id === 'main' ? '0.18)' : '0.11)'}`);
        auraGrad.addColorStop(0.75, `${baseColorPrefix}${stream.id === 'main' ? '0.07)' : '0.03)'}`);
        auraGrad.addColorStop(1.0, `${baseColorPrefix}0.0)`);
        ctx.strokeStyle = auraGrad;
      } catch (e) {
        ctx.strokeStyle = stream.id === 'main' ? 'rgba(165, 205, 245, 0.20)' : 'rgba(150, 195, 235, 0.12)';
      }
      ctx.lineWidth = stream.id === 'main' ? 12 : 8;
      ctx.stroke();

      // 2. 中层：丝绢流线带 (Continuous Silk Ribbon Contour - 优雅闭合曲面)
      const lefts = [];
      const rights = [];
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        let dx = 0, dy = -1;
        if (i < nodes.length - 1) {
          dx = nodes[i + 1].x - n.x;
          dy = nodes[i + 1].y - n.y;
        } else if (i > 0) {
          dx = n.x - nodes[i - 1].x;
          dy = n.y - nodes[i - 1].y;
        }
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const halfW = n.width * 0.5;

        lefts.push({ x: n.x - nx * halfW, y: n.y - ny * halfW });
        rights.push({ x: n.x + nx * halfW, y: n.y + ny * halfW });
      }

      ctx.beginPath();
      ctx.moveTo(lefts[0].x, lefts[0].y);
      for (let i = 1; i < lefts.length - 1; i++) {
        const xc = (lefts[i].x + lefts[i + 1].x) / 2;
        const yc = (lefts[i].y + lefts[i + 1].y) / 2;
        ctx.quadraticCurveTo(lefts[i].x, lefts[i].y, xc, yc);
      }
      ctx.lineTo(lefts[lefts.length - 1].x, lefts[lefts.length - 1].y);

      ctx.lineTo(rights[rights.length - 1].x, rights[rights.length - 1].y);
      for (let i = rights.length - 2; i > 0; i--) {
        const xc = (rights[i].x + rights[i - 1].x) / 2;
        const yc = (rights[i].y + rights[i - 1].y) / 2;
        ctx.quadraticCurveTo(rights[i].x, rights[i].y, xc, yc);
      }
      ctx.closePath();

      try {
        const rGrad = ctx.createLinearGradient(0, bottomY, 0, bottomY - span);
        rGrad.addColorStop(0, `${baseColorPrefix}0.0)`);
        rGrad.addColorStop(0.10, `${baseColorPrefix}0.40)`);
        rGrad.addColorStop(0.40, `${baseColorPrefix}0.30)`);
        rGrad.addColorStop(0.70, `${baseColorPrefix}0.15)`);
        rGrad.addColorStop(1.0, `${baseColorPrefix}0.0)`);
        ctx.fillStyle = rGrad;
      } catch (e) {
        ctx.fillStyle = 'rgba(160, 205, 245, 0.25)';
      }
      ctx.fill();

      // 3. 表层：灵动凝聚青丝主芯线 (Thin Luminous Filament Core - 半路自然隐没)
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      for (let i = 1; i < nodes.length - 1; i++) {
        const xc = (nodes[i].x + nodes[i + 1].x) / 2;
        const yc = (nodes[i].y + nodes[i + 1].y) / 2;
        ctx.quadraticCurveTo(nodes[i].x, nodes[i].y, xc, yc);
      }
      try {
        const filamentGrad = ctx.createLinearGradient(0, bottomY, 0, bottomY - span);
        filamentGrad.addColorStop(0, 'rgba(235, 245, 255, 0.0)');
        filamentGrad.addColorStop(0.10, stream.id === 'main' ? 'rgba(235, 245, 255, 0.75)' : 'rgba(215, 235, 255, 0.55)');
        filamentGrad.addColorStop(0.40, stream.id === 'main' ? 'rgba(220, 240, 255, 0.58)' : 'rgba(200, 225, 255, 0.40)');
        filamentGrad.addColorStop(0.70, stream.id === 'main' ? 'rgba(195, 225, 255, 0.22)' : 'rgba(180, 215, 250, 0.14)');
        filamentGrad.addColorStop(1.0, 'rgba(170, 210, 250, 0.0)');
        ctx.strokeStyle = filamentGrad;
      } catch (e) {
        ctx.strokeStyle = stream.id === 'main' ? 'rgba(215, 238, 255, 0.55)' : 'rgba(195, 225, 255, 0.38)';
      }
      ctx.lineWidth = stream.id === 'main' ? 1.6 : 1.2;
      ctx.stroke();

      ctx.restore();
    }
  }

  // 渲染真实的 3D 环形涡流烟圈 (Toroidal Vortex Rings - 优雅向前滑行、直径扩张与羽化消散)
  renderSmokeRings(ctx) {
    if (!this.smokeRings || !this.smokeRings.length) return;

    for (const r of this.smokeRings) {
      if (r.alpha <= 0.005) continue;
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.tilt);
      ctx.scale(1.0, r.aspectRatio);

      const colorPrefix = r.color || 'rgba(238, 246, 255, ';

      // 1. 外层柔和弥散气晕光环 (Dual-Pass 柔光微晕)
      ctx.beginPath();
      ctx.arc(0, 0, r.radius, 0, Math.PI * 2);
      ctx.lineWidth = r.tubeThickness * 2.2 + 8;
      ctx.strokeStyle = `${colorPrefix}${r.alpha * 0.20})`;
      ctx.stroke();

      // 2. 中层致密环形涡管核心 (Toroidal Core - 烟圈核心管体)
      ctx.beginPath();
      ctx.arc(0, 0, r.radius, 0, Math.PI * 2);
      ctx.lineWidth = r.tubeThickness;
      ctx.strokeStyle = `${colorPrefix}${r.alpha * 0.85})`;
      ctx.stroke();

      // 3. 迎风面 3D 高光微弧 (Specular Crescent Highlight)
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(2, r.radius - r.tubeThickness * 0.3), -Math.PI * 0.85, -Math.PI * 0.15);
      ctx.lineWidth = Math.max(1.2, r.tubeThickness * 0.38);
      ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.70})`;
      ctx.stroke();

      ctx.restore();
    }
  }

  // 渲染 3D 浪漫同心爱心涡流烟圈 (Heart Vortex Rings - 优雅浮游心形双环)
  renderHeartRings(ctx) {
    if (!this.heartRings || !this.heartRings.length) return;

    for (const h of this.heartRings) {
      if (h.alpha <= 0.005) continue;
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.tilt);

      const colorPrefix = h.color || 'rgba(244, 114, 182, ';

      // 1. 外层柔光爱心气晕 (Dual-Pass 柔光晕)
      drawHeartPath(ctx, h.scale);
      ctx.lineWidth = h.lineWidth * 2.5 + 8;
      ctx.strokeStyle = `${colorPrefix}${h.alpha * 0.22})`;
      ctx.stroke();

      // 2. 核心丝滑心形涡环
      drawHeartPath(ctx, h.scale);
      ctx.lineWidth = h.lineWidth;
      ctx.strokeStyle = `${colorPrefix}${h.alpha * 0.88})`;
      ctx.stroke();

      // 3. 心形双凸瓣高光光斑
      ctx.beginPath();
      ctx.arc(-11 * h.scale, -10 * h.scale, 3.2 * h.scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${h.alpha * 0.65})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(11 * h.scale, -10 * h.scale, 3.2 * h.scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${h.alpha * 0.65})`;
      ctx.fill();

      ctx.restore();
    }
  }

  render(ctx) {
    // 1. 渲染真实袅袅“一缕青烟”流体丝带 (半路羽化淡出，纯净自然)
    this.renderSilkStreams(ctx);

    // 2. 渲染 3D 环形涡流烟圈 (Toroidal Vortex Rings - 优雅向前滑行、直径扩张与羽化消散)
    this.renderSmokeRings(ctx);

    // 3. 渲染 3D 浪漫同心爱心涡流烟圈 (Heart Vortex Rings - 优雅浮游心形双环)
    this.renderHeartRings(ctx);

    // 3.5 渲染东方神游九天金龙 (Golden Celestial Dragons)
    if (this.dragons && this.dragons.length) {
      for (const d of this.dragons) {
        d.render(ctx);
      }
    }

    // 3.6 渲染东方百鸟朝凤赤焰神凰 (Fire Phoenixes)
    if (this.phoenixes && this.phoenixes.length) {
      for (const ph of this.phoenixes) {
        ph.render(ctx);
      }
    }

    // 3.65 渲染步步高升祥瑞字河 (Auspicious Word Rivers)
    if (this.wordRivers && this.wordRivers.length) {
      for (const river of this.wordRivers) {
        river.render(ctx);
      }
    }

    // 3.68 渲染乾坤八卦 · 紫微星盘 (Bagua Taichi Matrices)
    if (this.baguaMatrices && this.baguaMatrices.length) {
      for (const matrix of this.baguaMatrices) {
        matrix.render(ctx);
      }
    }

    // 3.69 渲染佛光普照 · 梵天千叶金莲 (Buddha's Light & Golden Lotus)
    if (this.buddhaLights && this.buddhaLights.length) {
      for (const buddha of this.buddhaLights) {
        buddha.render(ctx);
      }
    }

    // 3.7 渲染盛世华彩腾空火箭 (双层轻量光栅化高光)
    if (this.fireworkRockets && this.fireworkRockets.length) {
      for (const rk of this.fireworkRockets) {
        ctx.save();
        // 外层耀金光晕
        ctx.beginPath();
        ctx.arc(rk.x, rk.y, 4.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
        ctx.fill();
        // 核心亮点
        ctx.beginPath();
        ctx.arc(rk.x, rk.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = rk.color || '#fbbf24';
        ctx.fill();
        ctx.restore();
      }
    }

    // 4. 渲染大团呼出浓烟、特效微粒与火星 (彻底移除点火处离散白色圆圈)
    for (const p of this.particles) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

      const hasShadow = (p.alpha || 0.8) > 0.15;

      if (p.isVolumetricSmoke) {
        // 真实起火处涌现的高斯柔和羽化烟雾团 (无生硬边缘，层叠半透流体光影)
        try {
          const puffGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          puffGrad.addColorStop(0, `${p.color || 'rgba(240, 246, 255, '}0.8)`);
          puffGrad.addColorStop(0.4, `${p.color || 'rgba(240, 246, 255, '}0.4)`);
          puffGrad.addColorStop(0.8, `${p.color || 'rgba(240, 246, 255, '}0.1)`);
          puffGrad.addColorStop(1.0, `${p.color || 'rgba(240, 246, 255, '}0.0)`);
          ctx.fillStyle = puffGrad;
        } catch (e) {
          ctx.fillStyle = formatFillColor(p.color, 'rgba(240, 246, 255, 0.3)');
        }
        ctx.globalAlpha = Math.min(0.65, p.alpha || 0.38);
      } else if (p.isExhaleCloud) {
        // 口中吐出的真实烟雾团：4 阶高斯径向渐变，内部温润凝实，外部彻底无痕羽化消散
        try {
          const puffGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          puffGrad.addColorStop(0.0, formatFillColor(p.color, 'rgba(240, 246, 255, 0.85)'));
          puffGrad.addColorStop(0.30, formatFillColor(p.color, 'rgba(240, 246, 255, 0.55)'));
          puffGrad.addColorStop(0.68, formatFillColor(p.color, 'rgba(240, 246, 255, 0.16)'));
          puffGrad.addColorStop(1.0, formatFillColor(p.color, 'rgba(240, 246, 255, 0.0)'));
          ctx.fillStyle = puffGrad;
        } catch (e) {
          ctx.fillStyle = formatFillColor(p.color, 'rgba(240, 246, 255, 0.35)');
        }
        ctx.globalAlpha = Math.min(0.68, p.alpha || 0.52);
      } else if (p.isSpark) {
        ctx.fillStyle = p.color || '#ff7700';
        ctx.globalAlpha = p.alpha || 1.0;
      } else if (p.isEmberSpark) {
        // 抖灰迸发的高亮炽热火星
        ctx.fillStyle = p.color || '#ffffff';
        ctx.globalAlpha = p.alpha || 1.0;
      } else if (p.isAshClump) {
        // 成型断裂碳灰块：立体不规则灰白断茬
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = p.color || '#27272a';
        ctx.globalAlpha = p.alpha || 0.85;
        ctx.beginPath();
        const cw = p.w || 3;
        const ch = p.h || 2;
        ctx.moveTo(-cw * 0.5, -ch * 0.5);
        ctx.lineTo(cw * 0.55, -ch * 0.4);
        ctx.lineTo(cw * 0.45, ch * 0.55);
        ctx.lineTo(-cw * 0.5, ch * 0.4);
        ctx.closePath();
        ctx.fill();
        // 灰块上沿微白断裂茬口
        ctx.strokeStyle = `rgba(244, 244, 245, ${(p.alpha || 0.85) * 0.65})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.restore();
        ctx.restore();
        continue;
      } else if (p.isCleanseWave) {
        // 禅意净化灵光微波环 (双层轻量弥散金圈)
        ctx.save();
        // 外晕
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 1.08, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245, 158, 11, ${(p.alpha || 0.8) * 0.28})`;
        ctx.lineWidth = 3.6;
        ctx.stroke();
        // 主核
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(254, 240, 138, ${(p.alpha || 0.8) * 0.95})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
        ctx.restore();
        continue;
      } else if (p.isAshFlake) {
        ctx.fillStyle = p.color || '#6b7280';
        ctx.globalAlpha = p.alpha || 0.8;
      } else if (p.isGold) {
        // 24K 金箔闪烁
        const shimmer = 0.6 + 0.4 * Math.sin(p.shimmerPhase || 0);
        ctx.fillStyle = p.color || '#ffd700';
        
        ctx.globalAlpha = (p.alpha || 1.0) * shimmer;
      } else if (p.isHeart) {
        // 心形微光粉紫
        ctx.fillStyle = formatFillColor(p.color, 'rgba(244, 114, 182, 1.0)');
        
        ctx.globalAlpha = (p.alpha || 0.8) * 0.95;
      } else if (p.isDragon) {
        // 金龙炽火金晕
        ctx.fillStyle = formatFillColor(p.color, 'rgba(254, 240, 138, 1.0)');
        
        ctx.globalAlpha = (p.alpha || 0.8) * 0.9;
      } else if (p.isNebula) {
        // 极光星云荧光 (柔和羽化渐变)
        try {
          const nebGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          nebGrad.addColorStop(0, formatFillColor(p.color, 'rgba(56, 189, 248, 0.8)'));
          nebGrad.addColorStop(0.55, formatFillColor(p.color, 'rgba(56, 189, 248, 0.35)'));
          nebGrad.addColorStop(1.0, formatFillColor(p.color, 'rgba(56, 189, 248, 0.0)'));
          ctx.fillStyle = nebGrad;
        } catch (e) {
          ctx.fillStyle = formatFillColor(p.color, 'rgba(56, 189, 248, 0.5)');
        }
        ctx.globalAlpha = (p.alpha || 0.8) * 0.90;
      } else if (p.isZen) {
        // 紫气祥云仙气 (柔和羽化渐变)
        try {
          const zenGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          zenGrad.addColorStop(0, formatFillColor(p.color, 'rgba(192, 132, 252, 0.8)'));
          zenGrad.addColorStop(0.55, formatFillColor(p.color, 'rgba(192, 132, 252, 0.35)'));
          zenGrad.addColorStop(1.0, formatFillColor(p.color, 'rgba(192, 132, 252, 0.0)'));
          ctx.fillStyle = zenGrad;
        } catch (e) {
          ctx.fillStyle = formatFillColor(p.color, 'rgba(192, 132, 252, 0.5)');
        }
        ctx.globalAlpha = (p.alpha || 0.8) * 0.85;
      } else if (p.isObsidian) {
        // 黑曜石深色烟雾 (柔和羽化渐变)
        try {
          const obsGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          obsGrad.addColorStop(0, 'rgba(38, 38, 38, 0.7)');
          obsGrad.addColorStop(0.6, 'rgba(38, 38, 38, 0.3)');
          obsGrad.addColorStop(1.0, 'rgba(38, 38, 38, 0.0)');
          ctx.fillStyle = obsGrad;
        } catch (e) {
          ctx.fillStyle = 'rgba(38, 38, 38, 0.4)';
        }
        ctx.globalAlpha = (p.alpha || 0.7) * 0.85;
      } else if (p.isStar) {
        // 四芒璀璨钻石星钻 (纯矢量高性能绘制)
        ctx.fillStyle = p.color || '#ffffff';
        ctx.globalAlpha = p.alpha || 0.9;
        drawFourPointStar(ctx, p.x, p.y, p.outerRadius || 5, p.innerRadius || 1.5, p.rotation || 0);
        ctx.restore();
        continue;
      } else if (p.isShootingStar) {
        // 耀目流星划空
        ctx.strokeStyle = p.color || '#e0f2fe';
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = p.alpha || 0.9;
        ctx.beginPath();
        const angle = Math.atan2(p.vy, p.vx);
        const tailX = p.x - Math.cos(angle) * (p.len || 30);
        const tailY = p.y - Math.sin(angle) * (p.len || 30);
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
        continue;
      } else if (p.isBlessingToken) {
        // 古雅篆金福印
        drawBlessingToken(ctx, p);
        ctx.restore();
        continue;
      } else if (p.isLotusPetal) {
        // 飘舞的 3D 宝相金莲花瓣
        drawLotusPetalParticle(ctx, p);
        ctx.restore();
        continue;
      } else if (p.isGoldCoin) {
        // 曜世 24K 暴富金币微粒
        drawGoldCoinParticle(ctx, p);
        ctx.restore();
        continue;
      } else if (p.isCupidArrow) {
        // 丘比特爱神金箭
        drawCupidArrow(ctx, p);
        ctx.restore();
        continue;
      } else if (p.isFireworkBurst) {
        // 烟花高空绽放彩星
        ctx.fillStyle = p.color || '#fbbf24';
        ctx.shadowColor = p.color || '#fbbf24';
        ctx.globalAlpha = p.alpha || 1.0;
      } else if (p.isWillowRain) {
        // 垂落金雨
        ctx.fillStyle = p.color || '#fbbf24';
        ctx.globalAlpha = p.alpha || 0.9;
      } else if (p.isShellShard) {
        // 拟真爆珠四分五裂胶壳残片 (Shattered Gelatin Shard)
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        const sw = p.w || 3;
        const sh = p.h || 2;
        ctx.moveTo(-sw, -sh * 0.5);
        ctx.lineTo(sw * 0.7, -sh);
        ctx.lineTo(sw, sh * 0.6);
        ctx.lineTo(-sw * 0.3, sh);
        ctx.closePath();
        ctx.fillStyle = p.color || '#10b981';
        ctx.globalAlpha = p.alpha || 0.9;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + ((p.alpha || 0.9) * 0.85) + ')';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
        ctx.restore();
        continue;
      } else if (p.isDroplet) {
        // 拟真微晶原液水滴 (Glistening Liquid Droplet)
        ctx.fillStyle = p.color || '#10b981';
        ctx.globalAlpha = p.alpha || 0.88;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius || 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        continue;
      } else {
        ctx.fillStyle = formatFillColor(p.color, 'rgba(230, 238, 252, 1.0)');
        
        ctx.globalAlpha = Math.min(0.60, p.alpha || 0.6);
      }

      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * 腾讯总监设计级：环境空气流转净空 (Atmospheric Air Cleansed)
   * 当用户从二级页面（如商店、背包、我的、排行榜）返回时调用：
   * 1. 彻底消散空中冻结的历史呼出浓烟、烟圈、爱心与大颗粒，使视野瞬间重归通透高奢；
   * 2. 重置流体青烟节点，若香烟处于点燃状态，燃烧端下一帧将无缝升起崭新纯净青烟。
   */
  cleanseAir(isLit = false) {
    this.particles = [];
    this.wispTrail = [];
    this.smokeRings = [];
    this.heartRings = [];
    this.dragons = [];
    this.phoenixes = [];
    this.wordRivers = [];
    this.baguaMatrices = [];
    this.buddhaLights = [];
    this.fireworkRockets = [];
    if (this.silkStreams) {
      this.silkStreams.forEach(s => { s.nodes = []; });
    }
    this.streamNodeCounter = 0;
    this.igniteStartTime = 0;
  }

  /**
   * 腾讯总监设计级：掐灭烟头专属降解 (Extinguish Tip Smoke Only)
   * 严格按照用户需求：
   * 1. 仅清除烟头点火阴燃发烟：清空烟头流体青烟(silkStreams)、微弱火星与烟灰碎屑；
   * 2. 空中正在进行的所有专属烟雾特效（金龙、神凰、八卦、佛光、字河、烟花、烟圈、爱心、金币雨等）100% 完整保留，继续自然完成其生命周期！
   */
  extinguishTipSmoke(cx, cy) {
    // 1. 彻底切断烟头流体青烟
    if (this.silkStreams) {
      this.silkStreams.forEach(s => { s.nodes = []; });
    }
    this.wispTrail = [];

    // 2. 仅过滤清除烟头附近的点火阴燃微粒、火星和脱落灰屑，完全保留呼出的高光特效粒子
    this.particles = this.particles.filter(p => !p.isSpark && !p.isTipCombustion && !p.isAshFlake);

    // 3. 产生一缕微弱的掐灭冷灰残烟 (Sizzle Extinction Puff - 真实物理反馈)
    if (typeof cx === 'number' && typeof cy === 'number') {
      for (let i = 0; i < 4; i++) {
        this._pushParticle({
          x: cx + (Math.random() - 0.5) * 6,
          y: cy - Math.random() * 2,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(0.55 + Math.random() * 0.45),
          radius: 2.0 + Math.random() * 1.5,
          growRate: 0.08,
          maxRadius: 6.0,
          alpha: 0.35,
          baseAlpha: 0.35,
          life: 0,
          maxLife: 35 + Math.random() * 15,
          color: 'rgba(161, 161, 170, ',
          isVolumetricSmoke: true
        });
      }
    }
  }

  clear() {
    this.cleanseAir(false);
  }
}
