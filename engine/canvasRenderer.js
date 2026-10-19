// engine/canvasRenderer.js
import { sceneRenderer } from './sceneRenderer.js';
import { computeCigaretteDimensions } from '../configs/catalog.js';

/**
 * 工业级 3D 香烟与雪茄 Canvas 2D 渲染引擎
 * 适配真实品牌尺寸 (软中华/炫赫门细支/高希霸古巴大号雪茄)
 * 支持 3D 圆柱体光影着色、手卷雪茄烟叶纹理、烫金雪茄标、发光爆珠晶体、锯齿炭化火心与丝滑袅袅青烟
 */

function hexToRgba(hex, alpha = 1.0) {
  if (!hex || typeof hex !== 'string') return `rgba(16, 185, 129, ${alpha})`;
  if (hex.startsWith('rgba')) {
    return hex.endsWith(')') ? hex.replace(/,\s*[\d.]+\)$/, `, ${alpha})`) : `${hex}${alpha})`;
  }
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(16, 185, 129, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawEllipse(ctx, x, y, rx, ry) {
  ctx.moveTo(x + rx, y);
  if (typeof ctx.ellipse === 'function') {
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  } else {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(rx, ry);
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.restore();
  }
}

function drawRect(ctx, x, y, w, h) {
  if (typeof ctx.rect === 'function') {
    ctx.rect(x, y, w, h);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
  }
}

function drawRoundRect(ctx, x, y, w, h, r = 6) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

export class CanvasRenderer {
  constructor() {
    this.time = 0;
    this.beadFlowStartTime = null;
    this.emberHeat = 0.0; // 仿生物理热惯性：0.0 静置阴燃 -> 1.0 猛吸炽热
  }

  resetBeadFlow() {
    this.beadFlowStartTime = this.time;
  }

  render(ctx, options) {
    const {
      w,
      h,
      dt,
      fsm,
      particles,
      currentCigarette,
      isBeadPopped,
      breathingMode,
      breathingPhase,
      screenFogAlpha,
      sceneType,
      isSparking,
      sparkStartTime,
      sparkDuration,
      ignitionTool,
      vipTheme,
      ashTapProgress // 0.0 ~ 1.0 抖灰阻尼弹性微振动画进度
    } = options;

    const delta = dt || 0.016;
    this.time += delta;
    const time = this.time * 1000;

    const curState = fsm ? fsm.getState() : 'UNLIT';
    const isInhaling = curState === 'INHALING';

    // 仿生物理热惯性 (Thermal Inertia & Cooling Curve):
    // 吸入时火头供氧充足快速升温 (~0.16s 充盈)；松开吸烟后，余温遵循牛顿冷却定律平滑指数衰减 (~0.38s 渐冷至阴燃基线)
    const targetHeat = isInhaling ? 1.0 : 0.0;
    if (typeof this.emberHeat !== 'number') this.emberHeat = 0.0;
    if (targetHeat > this.emberHeat) {
      this.emberHeat += (targetHeat - this.emberHeat) * Math.min(1.0, delta * 8.5);
    } else {
      this.emberHeat += (targetHeat - this.emberHeat) * Math.min(1.0, delta * 3.8);
    }

    const isLit = curState !== 'UNLIT' && curState !== 'FINISHED';
    const emberIntensity = isLit ? (0.22 + this.emberHeat * 0.78) : 0;

    // ==========================================
    // 0. 绘制沉浸生活场景背景 (雨夜车窗 / 威士忌吧 / 江湖夜钓 / 禅院听竹 / 浩瀚星宇，支持火光映境联动)
    // ==========================================
    try {
      sceneRenderer.render(ctx, w, h, sceneType || 'rainy_car', delta, this.time, vipTheme, emberIntensity);
    } catch (sceneErr) {
      console.error('[canvasRenderer] sceneRenderer render error:', sceneErr);
    }

    const p = fsm ? fsm.getProgress() : 1.0;
    const progress = (typeof p === 'number' && !isNaN(p)) ? p : 1.0;
    const ashRatio = fsm ? (typeof fsm.getAshRatio === 'function' ? fsm.getAshRatio() : ((fsm.getAshLength() || 0) / 260)) : 0;

    const curCig = currentCigarette || {};

    // ==========================================
    // 0.5 腾讯大师级 · 指节轻弹烟身物理阻尼微动效 (Elastic Damped Ash-Tap Kinematics)
    // 模拟食指轻弹滤嘴侧面的自然物理响应：侧向微移 + 极微小俯仰角度倾斜，呈现高质量弹簧正弦衰减
    // ==========================================
    // ==========================================
    // 0.5 腾讯大师级 · 弹性悬臂梁二阶阻尼抖灰微动效与吸烟气流动压动力学
    // 模拟烟身作为悬臂梁在手指轻弹滤嘴侧面时的阻尼谐振响应 (Cantilever Beam 1st Mode Vibration)
    // 烟嘴端锚定微动，燃烧端与烟灰尖端振幅随梁长二次方放大；吸烟时伴随微弱吸入气流动压微沉
    // ==========================================
    let tapShakeX = 0;
    let tapShakeAngle = 0;
    if (typeof ashTapProgress === 'number' && ashTapProgress >= 0 && ashTapProgress < 1.0) {
      const tapT = ashTapProgress; // 0 ~ 1
      // 真实二阶欠阻尼弹簧包络：e^(-6.8t) * sin(24t * PI)
      const dampEnv = Math.exp(-6.8 * tapT);
      const sineWave = Math.sin(tapT * Math.PI * 6.8);
      tapShakeX = 4.2 * dampEnv * sineWave;
      tapShakeAngle = 0.022 * dampEnv * sineWave; // ~1.25° 优雅弹性悬臂回弹
    }

    // 保持烟支平稳从容质感，消除高频微颤抖动
    const microTremorX = 0;
    const microTremorAngle = 0;

    // 锁定烟嘴锚点高度，确保抽完或吸气松开时绝对不出现上下位移
    const inhaleSuctionY = 0;

    // ==========================================
    const cx = w / 2;
    // 根据每款名烟真实行业毫米规格 (84mm/74mm/88mm/97mm/100mm/150mm) 动态映射高精度 Canvas 比例与滤嘴比例
    const cigDims = computeCigaretteDimensions(curCig, h);
    const maxCigH = cigDims.maxCigH;
    const cigW = cigDims.cigW;
    const topW = cigDims.topW;
    const filterRatio = cigDims.filterRatio;

    const cy = h * 0.65; // 烟嘴底部锚点绝对锁定恒定坐标，杜绝任何轻微上移或沉降
    const filterH = Math.round(maxCigH * filterRatio);
    const maxPaperH = maxCigH - filterH;
    const paperH = maxPaperH * progress;
    // 烟灰长度完全等于自上次抖灰以来的燃烧长度，真实保留不自动断落
    const curAsh = maxPaperH * Math.max(0, Math.min(1.0, ashRatio));
    const fireY = cy - paperH; // 燃烧端顶端Y坐标 (全局作用域安全可用)

    // 手卷旱烟底部锚点（烟嘴与烟身通体合一，从 fireY 一体延伸至 cy + filterH，绝无独立接缝烟嘴）
    const hanyanBottomY = cy + filterH;
    // 当前燃烧口宽度 (喇叭筒手卷旱烟沿通体一体锥度随燃烧下移平滑收窄，机制烟恒定 cigW)
    let curTopW = cigW;
    if (curCig.widthType === 'hand_rolled') {
      curTopW = cigW + (topW - cigW) * ((hanyanBottomY - fireY) / Math.max(1, maxCigH));
    } else if (curCig.id === 'eiffel_tower') {
      // 埃菲尔铁塔从塔尖向底座逐渐变宽 (塔尖 ~10px -> 第一平台 ~34px)
      curTopW = topW + (cigW - topW) * (1.0 - progress);
    } else if (curCig.id === 'pyramid_giza') {
      // 吉萨金字塔从金尖 (topW ~8px) 扩大至底座 (cigW ~36px)
      curTopW = topW + (cigW - topW) * (1.0 - progress);
    } else if (curCig.id === 'oriental_pearl') {
      // 东方明珠天线针尖向中下段扩张
      curTopW = topW + (cigW - topW) * (1.0 - progress) * 0.7;
    }

    const filterBase = curCig.filterColor || '#991b1b';
    const paperBase = curCig.paperColor || '#fffdf5';
    const bandColor = curCig.bandColor || '#f59e0b';

    // 施加烟身整体受力微振动几何变换 (以滤嘴底部 cy + filterH 为旋转支点)
    ctx.save();
    const finalShakeX = tapShakeX + microTremorX;
    // 比萨斜塔专属 3.15° (~0.055 rad) 物理倾斜力学设计
    const pisaLeanAngle = curCig.id === 'pisa_leaning' ? -0.055 : 0;
    const finalShakeAngle = tapShakeAngle + microTremorAngle + pisaLeanAngle;
    if (finalShakeX !== 0 || finalShakeAngle !== 0) {
      const pivotY = cy + filterH;
      ctx.translate(cx, pivotY);
      ctx.rotate(finalShakeAngle);
      ctx.translate(-cx + finalShakeX, -pivotY);
    }

    // ==========================================
    // 2. 底部环境光遮蔽软阴影 (Soft Ambient Shadow - 完美复刻实机悬浮投影)
    // ==========================================
    ctx.save();
    const isHandRolled = curCig.widthType === 'hand_rolled';
    const isEiffel = curCig.id === 'eiffel_tower';
    const shadowY = cy + filterH + (isHandRolled ? 10 : (isEiffel ? 14 : 18));
    const shadowR = isHandRolled ? cigW * 1.4 : (isEiffel ? cigW * 1.9 : cigW * 1.8);
    const shadowGrad = ctx.createRadialGradient(cx, shadowY, 3, cx, shadowY, shadowR);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    drawEllipse(ctx, cx, shadowY, isHandRolled ? cigW * 1.15 : (isEiffel ? cigW * 1.7 : cigW * 1.6), isHandRolled ? 6 : 9);
    ctx.fill();
    ctx.restore();

    // ==========================================
    // 3. 过滤嘴 / 名筑底座 / 古巴雪茄标 3D 微距写实渲染
    // ==========================================
    if (curCig.id === 'eiffel_tower') {
      // -------------------------------------------------------------
      // 🏛️ 埃菲尔铁塔专属 3D 拱门底座 (Eiffel Tower Grand Arch Base & Pedestals)
      // -------------------------------------------------------------
      ctx.save();
      const baseTopW = cigW * 0.92; // 1层平台底宽 ~31px
      const baseBotW = cigW * 1.38; // 落地柱脚外展宽 ~47px
      const baseH = filterH;
      const legThickness = 9.5;

      // 绘制左腿、右腿与中央双曲大拱门外轮廓
      ctx.beginPath();
      ctx.moveTo(cx - baseTopW / 2, cy);
      ctx.lineTo(cx - baseBotW / 2, cy + baseH);
      ctx.lineTo(cx - baseBotW / 2 + legThickness, cy + baseH);
      ctx.lineTo(cx - baseBotW / 2 + legThickness + 2, cy + baseH * 0.85);
      ctx.bezierCurveTo(
        cx - baseTopW * 0.28, cy + baseH * 0.28,
        cx + baseTopW * 0.28, cy + baseH * 0.28,
        cx + baseBotW / 2 - legThickness - 2, cy + baseH * 0.85
      );
      ctx.lineTo(cx + baseBotW / 2 - legThickness, cy + baseH);
      ctx.lineTo(cx + baseBotW / 2, cy + baseH);
      ctx.lineTo(cx + baseTopW / 2, cy);
      ctx.closePath();

      // 3D 铁塔古铜金属渐变
      const archGrad = ctx.createLinearGradient(cx - baseBotW / 2, 0, cx + baseBotW / 2, 0);
      archGrad.addColorStop(0, '#1c160e');
      archGrad.addColorStop(0.18, '#634b1c');
      archGrad.addColorStop(0.35, '#c5a059');
      archGrad.addColorStop(0.50, '#fef08a');
      archGrad.addColorStop(0.68, '#b48a3c');
      archGrad.addColorStop(0.85, '#634b1c');
      archGrad.addColorStop(1.0, '#1c160e');
      ctx.fillStyle = archGrad;
      ctx.fill();

      // 拱门大圆弧加强筋 (Arch Flange)
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx - baseBotW / 2 + legThickness + 1, cy + baseH * 0.88);
      ctx.bezierCurveTo(
        cx - baseTopW * 0.28, cy + baseH * 0.28,
        cx + baseTopW * 0.28, cy + baseH * 0.28,
        cx + baseBotW / 2 - legThickness - 1, cy + baseH * 0.88
      );
      ctx.stroke();

      // 柱腿内的 X-桁架钢构
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
      ctx.lineWidth = 0.9;
      // 左腿交叉梁
      ctx.beginPath();
      ctx.moveTo(cx - baseTopW / 2, cy + 4);
      ctx.lineTo(cx - baseBotW / 2 + legThickness, cy + baseH * 0.5);
      ctx.moveTo(cx - baseTopW / 2 + legThickness * 0.8, cy + 4);
      ctx.lineTo(cx - baseBotW / 2, cy + baseH * 0.5);
      ctx.stroke();
      // 右腿交叉梁
      ctx.beginPath();
      ctx.moveTo(cx + baseTopW / 2, cy + 4);
      ctx.lineTo(cx + baseBotW / 2 - legThickness, cy + baseH * 0.5);
      ctx.moveTo(cx + baseTopW / 2 - legThickness * 0.8, cy + 4);
      ctx.lineTo(cx + baseBotW / 2, cy + baseH * 0.5);
      ctx.stroke();

      // 1层平台 (Premier étage) 金色主平台梁
      const p1H = 9.0;
      const p1W = baseTopW + 4;
      ctx.fillStyle = '#b48a3c';
      ctx.fillRect(cx - p1W / 2, cy - 2, p1W, p1H);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx - p1W / 2, cy - 2, p1W, 1.8);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(cx - p1W / 2, cy + p1H - 3, p1W, 1.2);

      // 平台中央烫金“PARIS 1889”铭文
      ctx.font = 'bold 7px sans-serif';
      ctx.fillStyle = '#1e1b4b';
      ctx.textAlign = 'center';
      ctx.fillText('PARIS 1889', cx, cy + 5.5);

      // 左右基座支承墩石 (Masonry Pedestal Feet)
      ctx.fillStyle = '#64748b';
      ctx.fillRect(cx - baseBotW / 2 - 1.5, cy + baseH - 4.5, legThickness + 3, 5);
      ctx.fillRect(cx + baseBotW / 2 - legThickness - 1.5, cy + baseH - 4.5, legThickness + 3, 5);

      ctx.restore();
    } else if (curCig.id === 'pisa_leaning') {
      // -------------------------------------------------------------
      // 🏛️ 比萨斜塔专属底座 (Pisa Romanesque Blind Arcade Base)
      // -------------------------------------------------------------
      ctx.save();
      const pisaW = cigW;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(cx - pisaW / 2, cy, pisaW, filterH);
      const pfGrad = ctx.createLinearGradient(cx - pisaW / 2, 0, cx + pisaW / 2, 0);
      pfGrad.addColorStop(0, 'rgba(0, 0, 0, 0.40)');
      pfGrad.addColorStop(0.22, 'rgba(255, 255, 255, 0.55)');
      pfGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.12)');
      pfGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      ctx.fillStyle = pfGrad;
      ctx.fillRect(cx - pisaW / 2, cy, pisaW, filterH);

      // 底层盲拱券 (Blind Arcades)
      const numBlind = 5;
      const bGap = pisaW / numBlind;
      for (let bi = 0; bi < numBlind; bi++) {
        const bx = cx - pisaW / 2 + bi * bGap + bGap * 0.5;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.beginPath();
        ctx.arc(bx, cy + 10, bGap * 0.32, Math.PI, 0);
        ctx.lineTo(bx + bGap * 0.32, cy + filterH - 4);
        ctx.lineTo(bx - bGap * 0.32, cy + filterH - 4);
        ctx.closePath();
        ctx.fill();
      }
      // 顶部大理石飞檐与托斯卡纳绿金饰带
      ctx.fillStyle = '#059669';
      ctx.fillRect(cx - pisaW / 2, cy, pisaW, 3.5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(cx - pisaW / 2, cy + 3.5, pisaW, 1.2);
      ctx.restore();
    } else if (curCig.id === 'pyramid_giza') {
      // -------------------------------------------------------------
      // 🏛️ 吉萨金字塔专属巨石基座 (Giza Megalithic Foundation)
      // -------------------------------------------------------------
      ctx.save();
      const pyrBaseW = cigW * 1.05;
      ctx.fillStyle = '#18181b';
      ctx.fillRect(cx - pyrBaseW / 2, cy, pyrBaseW, filterH);
      // 金色阶梯线与荷鲁斯之眼底纹
      ctx.fillStyle = '#d97706';
      ctx.fillRect(cx - pyrBaseW / 2, cy, pyrBaseW, 3.0);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(cx - pyrBaseW / 2, cy + 3.0, pyrBaseW, 1.5);
      // 象形文字金字金纹
      ctx.font = 'bold 7.5px sans-serif';
      ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
      ctx.textAlign = 'center';
      ctx.fillText('GIZA BC2560', cx, cy + 18);
      ctx.restore();
    } else if (curCig.id === 'oriental_pearl') {
      // -------------------------------------------------------------
      // 🏛️ 东方明珠专属下球体与三斜撑底座 (Oriental Pearl Lower Sphere & Tripod)
      // -------------------------------------------------------------
      ctx.save();
      const pW = cigW;
      // 下球体 (Lower Sphere 50m)
      const s1R = 12.0;
      const s1Y = cy + filterH * 0.42;
      const s1Grad = ctx.createRadialGradient(cx - 3, s1Y - 3, 1, cx, s1Y, s1R);
      s1Grad.addColorStop(0, '#ffffff');
      s1Grad.addColorStop(0.35, '#fb7185');
      s1Grad.addColorStop(0.72, '#be185d');
      s1Grad.addColorStop(1.0, '#700730');
      ctx.fillStyle = s1Grad;
      ctx.beginPath();
      ctx.arc(cx, s1Y, s1R, 0, Math.PI * 2);
      ctx.fill();

      // 三根外斜撑巨柱
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(cx - 4, s1Y + s1R * 0.7);
      ctx.lineTo(cx - pW * 0.65, cy + filterH);
      ctx.moveTo(cx + 4, s1Y + s1R * 0.7);
      ctx.lineTo(cx + pW * 0.65, cy + filterH);
      ctx.stroke();

      // 顶部钛金箍圈
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(cx - pW / 2, cy, pW, 3.0);
      ctx.restore();
    } else if (curCig.widthType !== 'hand_rolled') {
      const fGrad = ctx.createLinearGradient(cx - cigW / 2, 0, cx + cigW / 2, 0);
      fGrad.addColorStop(0, 'rgba(0, 0, 0, 0.40)');
      fGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.32)');
      fGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.06)');
      fGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');

      // 工业过滤嘴 / 古巴雪茄标 3D 圆柱体微距写实渐变渲染
      ctx.fillStyle = filterBase;
      ctx.fillRect(cx - cigW / 2, cy, cigW, filterH);
      ctx.fillStyle = fGrad;
      ctx.fillRect(cx - cigW / 2, cy, cigW, filterH);

      const lowerFilterColor = String(filterBase).toLowerCase();
      const isLightPearlFilter = lowerFilterColor === '#f1f5f9' || lowerFilterColor === '#f8fafc' || lowerFilterColor === '#ffffff';
      const isDarkModernFilter = lowerFilterColor === '#18181b' || lowerFilterColor === '#09090b' || lowerFilterColor === '#0f766e' || lowerFilterColor === '#1e1b4b';
      const isClassicCorkFilter = !isLightPearlFilter && !isDarkModernFilter && (
        curCig.filterStyle === 'classic_cork' ||
        ['#d97706', '#b45309', '#e5a93c', '#c87d55', '#78350f', '#ca8a04', '#f59e0b'].includes(lowerFilterColor)
      );

      // 金箍 / 雪茄专属标识圈 / 经典软木斑点
      if (curCig.isCigar) {
        // 高希霸/大卫杜夫雪茄标：宽版烫金多节点渐变
        const cigarBandGrad = ctx.createLinearGradient(cx - cigW / 2, 0, cx + cigW / 2, 0);
        cigarBandGrad.addColorStop(0, '#f59e0b');
        cigarBandGrad.addColorStop(0.25, '#ffffff');
        cigarBandGrad.addColorStop(0.65, '#d97706');
        cigarBandGrad.addColorStop(1, '#fef08a');
        ctx.fillStyle = cigarBandGrad;
        ctx.fillRect(cx - cigW / 2, cy + 6, cigW, 10);

        // 古巴哈瓦那黑黄微缩方格印花
        ctx.fillStyle = '#09090b';
        for (let bx = cx - cigW / 2 + 2; bx < cx + cigW / 2 - 2; bx += 6) {
          ctx.fillRect(bx, cy + 8, 3, 5);
        }
      } else {
        // 仅在经典软木/棕红/琥珀金烟嘴上绘制软木斑点；纯白珠光嘴与现代黑曜/时尚彩嘴保持丝绸哑光或微孔透气肌理，绝不混入木屑斑点
        ctx.save();
        ctx.beginPath();
        drawRect(ctx, cx - cigW / 2, cy, cigW, filterH);
        ctx.clip();

        if (isClassicCorkFilter) {
          // 1) 浅金色软木木质微纤维斑点 (Light Golden Cork Spots)
          ctx.fillStyle = 'rgba(254, 240, 138, 0.32)';
          for (let sy = cy + 6; sy < cy + filterH - 4; sy += 5.2) {
            const rx = ((sy * 19 + 7) % Math.floor(cigW - 4)) + 2;
            const rw = 1.8 + ((sy * 7) % 3) * 0.5;
            const rh = 1.0 + ((sy * 11) % 2) * 0.6;
            ctx.fillRect(cx - cigW / 2 + rx, sy, rw, rh);
          }

          // 2) 深琥珀褐色天然软木凹点与木屑 (Dark Amber Organic Cork Flecks)
          ctx.fillStyle = 'rgba(92, 38, 10, 0.38)';
          for (let sy = cy + 8; sy < cy + filterH - 6; sy += 6.8) {
            const rx = ((sy * 29 + 17) % Math.floor(cigW - 5)) + 2.5;
            const rw = 1.4 + ((sy * 13) % 2) * 0.5;
            const rh = 1.2 + ((sy * 5) % 2) * 0.5;
            ctx.fillRect(cx - cigW / 2 + rx, sy, rw, rh);
          }
        } else {
          // 现代细支/时尚彩嘴/爆珠专属激光打孔透气环与丝缎微光泽 (Laser Micro-Perforation & Pearl Silk Sheen)
          const perfY = cy + 11.5;
          ctx.fillStyle = isLightPearlFilter ? 'rgba(148, 163, 184, 0.45)' : 'rgba(255, 255, 255, 0.25)';
          for (let px = cx - cigW / 2 + 2.5; px < cx + cigW / 2 - 2; px += 2.8) {
            ctx.fillRect(px, perfY, 1.0, 1.0);
          }
          if (!isLightPearlFilter && !isDarkModernFilter) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            for (let sy = cy + 8; sy < cy + filterH - 6; sy += 7.5) {
              const rx = ((sy * 17 + 5) % Math.floor(cigW - 5)) + 2.5;
              ctx.fillRect(cx - cigW / 2 + rx, sy, 1.2, 0.8);
            }
          }
        }
        ctx.restore();

        // 过滤嘴与烟身交界处精细饰线/金箍 (Accent Band Line - 腾讯主美级：各向异性烫金流光与微浮雕槽线)
        const bandH = 2.4;
        const bandY = cy;
        const bandX0 = cx - cigW / 2;
        const bandX1 = cx + cigW / 2;

        // 1. 各向异性金属烫金渐变 (Anisotropic Gold Foil Specularity)
        const bandShineGrad = ctx.createLinearGradient(bandX0, 0, bandX1, 0);
        bandShineGrad.addColorStop(0, '#78350f');
        bandShineGrad.addColorStop(0.18, '#d97706');
        bandShineGrad.addColorStop(0.32, '#fef08a');
        bandShineGrad.addColorStop(0.48, '#ffffff'); // 镜面极亮高光
        bandShineGrad.addColorStop(0.62, '#f59e0b');
        bandShineGrad.addColorStop(0.82, '#b45309');
        bandShineGrad.addColorStop(1.0, '#451a03');
        ctx.fillStyle = bandShineGrad;
        ctx.fillRect(bandX0, bandY, cigW, bandH);

        // 2. 金属高光质感 (固定优雅金属镜面质感，杜绝流光移动干扰)
        const staticGleamX = bandX0 + cigW * 0.42;
        const staticGleamW = cigW * 0.28;
        const gleamGrad = ctx.createLinearGradient(staticGleamX - staticGleamW, 0, staticGleamX + staticGleamW, 0);
        gleamGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gleamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
        gleamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gleamGrad;
        ctx.fillRect(bandX0, bandY, cigW, bandH);

        // 3. 上下双微浮雕槽线 (Embossed Micro-Grooves)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
        ctx.fillRect(bandX0, bandY, cigW, 0.5);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
        ctx.fillRect(bandX0, bandY + bandH - 0.5, cigW, 0.5);

        // 过滤嘴上的烫金英文字体与金色微颗粒 (实机同款: CHAOTIANMEN / CHUNGHWA)
        ctx.save();
        if (!isLightPearlFilter) {
          ctx.fillStyle = 'rgba(255, 235, 150, 0.18)';
          for (let fy = cy + 14; fy < cy + filterH - 8; fy += 8) {
            ctx.fillRect(cx - cigW / 2 + 4 + ((fy * 3) % (cigW - 8)), fy, 1.4, 1.4);
          }
        }
        // 竖向品牌字 (自动剔除括号与空格，完整保留文字，有爆珠时避开爆珠区域)
        const rawFilterBrand = curCig.filterBrandText || (curCig.brand ? curCig.brand.toUpperCase() : 'CHAOTIANMEN');
        const filterBrand = String(rawFilterBrand).replace(/[()（）\s]/g, '');
        const useGoldFilterText = isDarkModernFilter || ['#3b0764', '#581c87', '#1e3a8a', '#9f1239', '#db2777', '#831843', '#7f1d1d'].includes(lowerFilterColor);
        ctx.font = 'bold 7px sans-serif';
        ctx.fillStyle = isLightPearlFilter
          ? 'rgba(71, 85, 105, 0.72)'
          : (useGoldFilterText ? 'rgba(253, 224, 71, 0.88)' : 'rgba(100, 40, 10, 0.75)');
        ctx.textAlign = 'center';
        const maxL = Math.min(filterBrand.length, Math.floor((filterH - 22) / 7.5));
        const beadCenterY = cy + filterH * 0.52;
        for (let li = 0; li < maxL; li++) {
          const textY = cy + 20 + li * 7.5;
          if (curCig.hasBead && Math.abs(textY - beadCenterY) < 15) continue;
          ctx.fillText(filterBrand[li], cx, textY);
        }
        ctx.restore();
      }
    }

    // ==========================================
    // 3.1 烟嘴物理焦油沉淀与浸润 (根据燃烧进度动态呈现)
    // ==========================================
    // 烟支原始长度为 maxPaperH，当前燃烧后剩余长度为 paperH = maxPaperH * progress
    // 已燃烧消耗比例 (0.0: 未点燃/满长 -> 1.0: 已抽完/吸尽)
    const burntRatio = Math.max(0, Math.min(1.0, 1.0 - progress));

    // 1) 烟嘴柱体物理焦油浸润染色 (普通机制烟，随烟支长度变短逐渐焦黄暗化)
    const isLandmarkFilter = ['eiffel_tower', 'pisa_leaning', 'pyramid_giza', 'oriental_pearl'].includes(curCig.id);
    if (burntRatio > 0.01 && curCig.widthType !== 'hand_rolled' && !isLandmarkFilter) {
      ctx.save();
      const stainAlpha = Math.min(0.85, burntRatio * 0.9);
      const nicStainGrad = ctx.createLinearGradient(0, cy, 0, cy + filterH);
      nicStainGrad.addColorStop(0, `rgba(180, 83, 9, ${stainAlpha * 0.45})`);
      nicStainGrad.addColorStop(0.35, `rgba(217, 119, 6, ${stainAlpha * 0.6})`);
      nicStainGrad.addColorStop(0.75, `rgba(146, 64, 14, ${stainAlpha * 0.8})`);
      nicStainGrad.addColorStop(1.0, `rgba(69, 26, 3, ${stainAlpha * 0.92})`);
      ctx.fillStyle = nicStainGrad;
      ctx.fillRect(cx - cigW / 2, cy, cigW, filterH);

      // 纵向海绵纤维焦油微细纹理
      ctx.fillStyle = `rgba(120, 53, 15, ${stainAlpha * 0.38})`;
      for (let fx = cx - cigW / 2 + 3; fx < cx + cigW / 2 - 2; fx += 5) {
        ctx.fillRect(fx, cy + filterH * (1 - burntRatio * 0.85), 1.2, filterH * burntRatio * 0.85);
      }
      ctx.restore();
    }

    // 2) 烟嘴底端 3D 吸嘴切面与焦油凝聚环 (普通机制烟与雪茄)
    if (curCig.widthType !== 'hand_rolled' && !isLandmarkFilter) {
      ctx.save();
      const mouthY = cy + filterH;
      const mouthGrad = ctx.createRadialGradient(cx, mouthY, 2, cx, mouthY, cigW / 2);
      if (burntRatio > 0.02) {
        // 随着抽吸深度加深，吸嘴内部滤芯凝聚深褐色焦油环
        mouthGrad.addColorStop(0, `rgba(69, 26, 3, ${Math.min(0.95, 0.4 + burntRatio * 0.55)})`);
        mouthGrad.addColorStop(0.65, `rgba(146, 64, 14, ${Math.min(0.85, 0.3 + burntRatio * 0.5)})`);
        mouthGrad.addColorStop(1.0, `rgba(180, 83, 9, 0.6)`);
      } else {
        // 崭新纯净滤嘴切面
        mouthGrad.addColorStop(0, '#f8fafc');
        mouthGrad.addColorStop(0.7, '#e2e8f0');
        mouthGrad.addColorStop(1.0, '#cbd5e1');
      }
      ctx.fillStyle = mouthGrad;
      ctx.beginPath();
      drawEllipse(ctx, cx, mouthY, cigW / 2, 3.5);
      ctx.fill();

      // 3D 边缘高光微弧
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      drawEllipse(ctx, cx, mouthY, cigW / 2, 3.5);
      ctx.stroke();
      ctx.restore();
    }



    // ==========================================
    // 4. 爆珠专属拟真晶体 (Crushable Flavor Bead - 高反差独立宝石级渲染，绝不染花烟嘴底色)
    // ==========================================
    if (curCig.hasBead) {
      const beadY = cy + filterH * 0.52;
      const beadColor = curCig.beadColor || '#10b981';
      const beadR = curCig.widthType === 'slender' ? 5.2 : 6.2;

      ctx.save();
      // 严格裁剪在过滤嘴柱体内部，杜绝大范围光晕把整个细支烟嘴染成爆珠同色
      ctx.beginPath();
      drawRect(ctx, cx - cigW / 2, cy, cigW, filterH);
      ctx.clip();

      // 4.1 爆珠独立高对比凹槽底座与烫金/银靶心环 (High-Contrast Socket & Reticle)
      const reticleR = Math.min(cigW * 0.43, beadR + 3.4);
      ctx.lineWidth = 1.0;
      if (!isBeadPopped) {
        this.beadFlowStartTime = null;
        const pulse = 0.45 + 0.35 * Math.sin(time * 0.006);

        // 独立暗色内凹底座环：将爆珠与烟嘴底色彻底隔离，一眼即辨
        const socketGrad = ctx.createRadialGradient(cx, beadY, beadR * 0.7, cx, beadY, beadR + 2.4);
        socketGrad.addColorStop(0, 'rgba(9, 13, 22, 0.85)');
        socketGrad.addColorStop(0.72, 'rgba(9, 13, 22, 0.58)');
        socketGrad.addColorStop(1, 'rgba(9, 13, 22, 0)');
        ctx.fillStyle = socketGrad;
        ctx.beginPath();
        ctx.arc(cx, beadY, beadR + 2.4, 0, Math.PI * 2);
        ctx.fill();

        // 紧致微距珠光内环 (半径仅 beadR * 1.32，绝不外溢染花烟嘴)
        const auraGrad = ctx.createRadialGradient(cx, beadY, beadR * 0.85, cx, beadY, beadR * 1.32);
        auraGrad.addColorStop(0, beadColor);
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.globalAlpha = 0.22 + pulse * 0.16;
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, beadY, beadR * 1.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // 实机烟嘴印刷靶心圈 (清晰纯白+烫金双层标识环)
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.65 + pulse * 0.3})`;
        ctx.setLineDash([2.2, 2.0]);
        ctx.beginPath();
        ctx.arc(cx, beadY, reticleR, 0, Math.PI * 2);
        ctx.stroke();

        // 四方十字微刻度
        ctx.setLineDash([]);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.72 + pulse * 0.25})`;
        ctx.beginPath();
        ctx.moveTo(cx, beadY - reticleR - 0.8); ctx.lineTo(cx, beadY - reticleR - 2.8);
        ctx.moveTo(cx, beadY + reticleR + 0.8); ctx.lineTo(cx, beadY + reticleR + 2.8);
        ctx.moveTo(cx - reticleR - 0.8, beadY); ctx.lineTo(cx - reticleR - 2.8, beadY);
        ctx.moveTo(cx + reticleR + 0.8, beadY); ctx.lineTo(cx + reticleR + 2.8, beadY);
        ctx.stroke();

        // 3D 珠体底部立体暗部投影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.beginPath();
        ctx.arc(cx, beadY + 0.9, beadR + 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 3D 水晶微球渐变 (偏心强光源高光 + 高饱和宝石核心)
        const beadGrad = ctx.createRadialGradient(cx - 1.8, beadY - 1.8, 0.5, cx, beadY, beadR);
        beadGrad.addColorStop(0, '#ffffff');
        beadGrad.addColorStop(0.22, '#ffffff');
        beadGrad.addColorStop(0.55, beadColor);
        beadGrad.addColorStop(0.85, beadColor);
        beadGrad.addColorStop(1, 'rgba(9, 13, 22, 0.92)');
        ctx.fillStyle = beadGrad;
        ctx.beginPath();
        ctx.arc(cx, beadY, beadR, 0, Math.PI * 2);
        ctx.fill();

        // 腾讯总监级 · 内部双折射菲涅尔焦散核心 (Internal Caustic Core)
        const causticGrad = ctx.createRadialGradient(cx + 0.6, beadY + 0.6, 0.2, cx + 0.6, beadY + 0.6, beadR * 0.58);
        causticGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        causticGrad.addColorStop(0.45, hexToRgba(beadColor, 0.88));
        causticGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = causticGrad;
        ctx.beginPath();
        ctx.arc(cx + 0.6, beadY + 0.6, beadR * 0.58, 0, Math.PI * 2);
        ctx.fill();

        // 外层高反差纯白水晶壳体环
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.lineWidth = 1.05;
        ctx.beginPath();
        ctx.arc(cx, beadY, beadR, 0, Math.PI * 2);
        ctx.stroke();

        // 顶部偏心镜面纯白高光点 (Specular Pin-point)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 1.8, beadY - 1.8, 1.45, 0, Math.PI * 2);
        ctx.fill();

        // 底部微弱次表面散射环境光弧 (Subsurface Arc)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.52)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.arc(cx, beadY, beadR - 1.2, Math.PI * 0.25, Math.PI * 0.75);
        ctx.stroke();
        this._beadSprayEmitted = false;
      } else {
        // 4.2 已捏破：与“咔啪！”音效同步的拟真过程（一点点微晶原液四处分散流淌 -> 被海绵迅速吸住收干 -> 只留下淡淡印子 + 清晰的碎裂扁瘪残壳）
        if (this.beadFlowStartTime === null || this.beadFlowStartTime === undefined) {
          this.beadFlowStartTime = this.time;
        }
        const flowElapsed = Math.max(0, this.time - this.beadFlowStartTime);

        // ----------------------------------------------------
        // 阶段一 (0s ~ 0.16s)：指尖重捏瞬态脆裂爆开（壳体受力压扁、蛛网脆裂、微米香精液滴外溅）
        // ----------------------------------------------------
        if (flowElapsed < 0.16) {
          if (!this._beadSprayEmitted && particles && typeof particles.emitBeadSpray === 'function') {
            this._beadSprayEmitted = true;
            particles.emitBeadSpray(cx, beadY, beadColor);
          }
          const crackProg = Math.min(1.0, flowElapsed / 0.16);
          const pinchFactor = Math.sin(crackProg * Math.PI * 0.5);
          const rx = beadR * (1.0 + 0.22 * pinchFactor);
          const ry = beadR * (1.0 - 0.35 * pinchFactor);

          // 底部暗部压痕投影
          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          ctx.beginPath();
          drawEllipse(ctx, cx, beadY + 1.0, rx + 0.6, ry);
          ctx.fill();

          // 压裂瞬间的胶壳与内部微光
          const beadGrad = ctx.createRadialGradient(cx, beadY, 0.2, cx, beadY, rx);
          beadGrad.addColorStop(0, '#ffffff');
          beadGrad.addColorStop(0.30, hexToRgba('#ffffff', 0.90));
          beadGrad.addColorStop(0.68, beadColor);
          beadGrad.addColorStop(1.0, hexToRgba(beadColor, 0.92));
          ctx.fillStyle = beadGrad;
          ctx.beginPath();
          drawEllipse(ctx, cx, beadY, rx, ry);
          ctx.fill();

          // 蛛网脆裂纹路
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.1;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx, beadY); ctx.lineTo(cx - rx * 0.88, beadY - ry * 0.78);
          ctx.moveTo(cx, beadY); ctx.lineTo(cx + rx * 0.92, beadY - ry * 0.72);
          ctx.moveTo(cx, beadY); ctx.lineTo(cx - rx * 0.82, beadY + ry * 0.85);
          ctx.moveTo(cx, beadY); ctx.lineTo(cx + rx * 0.86, beadY + ry * 0.82);
          ctx.moveTo(cx - rx * 0.45, beadY); ctx.lineTo(cx + rx * 0.45, beadY);
          ctx.stroke();
        }
        // ----------------------------------------------------
        // 阶段二 (0.16s+)：一点点原液向四处分散微流 -> 迅速被烟嘴内部海绵吸住收干 -> 只留下淡淡印子 + 真实碎裂爆珠残壳
        // ----------------------------------------------------
        else {
          const seepElapsed = Math.max(0, flowElapsed - 0.16);
          // 1) 四处分散流动进程 (0s ~ 0.65s 快速向四周扩散一点点量)
          const rawDisperse = Math.min(1.0, seepElapsed / 0.65);
          const disperseProg = 1 - Math.pow(1 - rawDisperse, 2.4);

          // 2) 海绵吸收收干进程 (0.30s ~ 1.35s 表面游离水珠与湿光被海绵吸干，只留暗哑印子)
          const rawAbsorb = Math.min(1.0, Math.max(0, (seepElapsed - 0.28) / 1.05));
          const absorbProg = 1 - Math.pow(1 - rawAbsorb, 2.0);
          const wetGlowFactor = Math.max(0, 1.0 - absorbProg); // 表面水光随吸收归零

          // 克制精致的微距浸润范围（仅在爆珠四周散开一点点，绝不泛滥成灾）
          const maxSpreadH = Math.min(cigW * 0.36, beadR * 1.48);
          const maxSpreadV = Math.min(filterH * 0.22, beadR * 1.65);
          const curSpreadH = beadR * 0.85 + (maxSpreadH - beadR * 0.85) * disperseProg;
          const curSpreadV = beadR * 0.85 + (maxSpreadV - beadR * 0.85) * disperseProg;

          // A. 烟嘴海绵内部吸住原液后留下的永久淡淡印子 (Subtle Sponge Stain Imprint)
          // 初湧时稍明显，被海绵吸住后稳定为淡淡的哑光精油印子 (不反光、不溢水)
          const markAlpha = (0.34 - 0.12 * absorbProg) * disperseProg;
          const markGrad = ctx.createRadialGradient(cx, beadY, beadR * 0.2, cx, beadY, curSpreadV);
          markGrad.addColorStop(0, hexToRgba(beadColor, markAlpha * 1.15));
          markGrad.addColorStop(0.55, hexToRgba(beadColor, markAlpha * 0.75));
          markGrad.addColorStop(0.85, `rgba(15, 23, 42, ${markAlpha * 0.45})`);
          markGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = markGrad;
          ctx.beginPath();
          drawEllipse(ctx, cx, beadY, curSpreadH, curSpreadV);
          ctx.fill();

          // A2. 四处分散的不规则海绵吸痕边缘印记 (6 个方向分散洇开的淡淡小印迹，保留在海绵纤维里)
          const stainLobes = [
            { angle: -0.55, distH: 0.78, distV: 0.72, rx: 2.1, ry: 1.6 },
            { angle: 0.48,  distH: 0.82, distV: 0.68, rx: 2.0, ry: 1.5 },
            { angle: 1.52,  distH: 0.65, distV: 0.88, rx: 1.8, ry: 2.3 },
            { angle: -1.62, distH: 0.65, distV: 0.85, rx: 1.7, ry: 2.2 },
            { angle: 2.58,  distH: 0.80, distV: 0.74, rx: 2.1, ry: 1.5 },
            { angle: -2.45, distH: 0.76, distV: 0.75, rx: 1.9, ry: 1.6 }
          ];
          for (const lobe of stainLobes) {
            const lx = cx + Math.cos(lobe.angle) * curSpreadH * lobe.distH;
            const ly = beadY + Math.sin(lobe.angle) * curSpreadV * lobe.distV;
            ctx.fillStyle = hexToRgba(beadColor, (0.26 - 0.09 * absorbProg) * disperseProg);
            ctx.beginPath();
            drawEllipse(ctx, lx, ly, lobe.rx * disperseProg, lobe.ry * disperseProg);
            ctx.fill();
          }

          // B. 刚捏破瞬间四处分散流出的“一点点”微液滴与细微流丝（随 absorbProg 被海绵迅速吸干消失，只留印子）
          if (wetGlowFactor > 0.02) {
            const microStreams = [
              { angle: -0.45, len: 1.05, r: 1.15 },
              { angle: 0.52,  len: 1.02, r: 1.10 },
              { angle: 1.45,  len: 1.15, r: 1.20 },
              { angle: -1.55, len: 1.12, r: 1.10 },
              { angle: 2.55,  len: 0.98, r: 1.05 },
              { angle: -2.40, len: 1.04, r: 1.15 },
              { angle: 0.05,  len: 0.88, r: 0.95 },
              { angle: 3.10,  len: 0.92, r: 1.00 }
            ];
            for (const ms of microStreams) {
              const dist = (beadR * 0.45 + (curSpreadH * 0.52) * disperseProg) * ms.len;
              const mx = cx + Math.cos(ms.angle) * dist;
              const my = beadY + Math.sin(ms.angle) * dist * 1.12;
              const sx = cx + Math.cos(ms.angle) * (beadR * 0.35);
              const sy = beadY + Math.sin(ms.angle) * (beadR * 0.35);

              // 细微分散水线（向四周散流后被海绵吸干）
              ctx.strokeStyle = hexToRgba(beadColor, 0.55 * wetGlowFactor);
              ctx.lineWidth = 0.85 * wetGlowFactor;
              ctx.beginPath();
              ctx.moveTo(sx, sy);
              ctx.lineTo(mx, my);
              ctx.stroke();

              // 末端一点点微水珠（半径随海绵吸收迅速缩小至 0）
              const dropR = ms.r * (0.3 + 0.7 * wetGlowFactor);
              ctx.fillStyle = hexToRgba(beadColor, 0.78 * wetGlowFactor);
              ctx.beginPath();
              ctx.arc(mx, my, dropR, 0, Math.PI * 2);
              ctx.fill();

              // 吸收前的一丝微弱水光点
              if (wetGlowFactor > 0.35) {
                ctx.fillStyle = `rgba(255, 255, 255, ${0.75 * wetGlowFactor})`;
                ctx.beginPath();
                ctx.arc(mx - 0.25, my - 0.25, 0.45 * wetGlowFactor, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }

          // C. 爆珠爆了之后的真实碎裂样貌 (Realistic Crushed & Shattered Bead Shell)
          // 凹陷指压黑坑 + 6 块不规则碎裂透明明胶脆片 + 锯齿状白色裂口断茬
          const rBase = beadR * 0.96;

          // 1) 内部排空后的深色凹陷破洞与海绵底纹
          const cavityGrad = ctx.createRadialGradient(cx, beadY, 0.5, cx, beadY, rBase * 0.85);
          cavityGrad.addColorStop(0, 'rgba(9, 13, 22, 0.92)');
          cavityGrad.addColorStop(0.65, 'rgba(15, 23, 42, 0.75)');
          cavityGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          ctx.fillStyle = cavityGrad;
          ctx.beginPath();
          drawEllipse(ctx, cx, beadY, rBase * 0.82, rBase * 0.74);
          ctx.fill();

          // 2) 6 瓣四分五裂、错位塌陷的不规则碎壳残片 (Shattered Gelatin Shell Fragments)
          const fragments = [
            // 左上大碎瓣
            [
              { x: -rBase * 0.18, y: -rBase * 0.14 },
              { x: -rBase * 0.86, y: -rBase * 0.32 },
              { x: -rBase * 0.92, y: -rBase * 0.78 },
              { x: -rBase * 0.42, y: -rBase * 0.94 },
              { x: -rBase * 0.12, y: -rBase * 0.48 }
            ],
            // 正上尖角碎渣
            [
              { x: -rBase * 0.04, y: -rBase * 0.25 },
              { x: -rBase * 0.24, y: -rBase * 0.92 },
              { x: rBase * 0.22,  y: -rBase * 0.96 },
              { x: rBase * 0.12,  y: -rBase * 0.32 }
            ],
            // 右上外翻碎瓣
            [
              { x: rBase * 0.20,  y: -rBase * 0.16 },
              { x: rBase * 0.36,  y: -rBase * 0.84 },
              { x: rBase * 0.88,  y: -rBase * 0.72 },
              { x: rBase * 0.94,  y: -rBase * 0.22 },
              { x: rBase * 0.45,  y: -rBase * 0.08 }
            ],
            // 左下塌陷碎瓣
            [
              { x: -rBase * 0.22, y: rBase * 0.12 },
              { x: -rBase * 0.90, y: rBase * 0.18 },
              { x: -rBase * 0.82, y: rBase * 0.76 },
              { x: -rBase * 0.35, y: rBase * 0.92 },
              { x: -rBase * 0.14, y: rBase * 0.42 }
            ],
            // 正下细碎裂片
            [
              { x: -rBase * 0.06, y: rBase * 0.28 },
              { x: -rBase * 0.20, y: rBase * 0.90 },
              { x: rBase * 0.18,  y: rBase * 0.94 },
              { x: rBase * 0.08,  y: rBase * 0.34 }
            ],
            // 右下撕裂碎瓣
            [
              { x: rBase * 0.18,  y: rBase * 0.16 },
              { x: rBase * 0.48,  y: rBase * 0.12 },
              { x: rBase * 0.92,  y: rBase * 0.35 },
              { x: rBase * 0.78,  y: rBase * 0.84 },
              { x: rBase * 0.28,  y: rBase * 0.86 }
            ]
          ];

          for (let fi = 0; fi < fragments.length; fi++) {
            const frag = fragments[fi];
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(cx + frag[0].x, beadY + frag[0].y);
            for (let pi = 1; pi < frag.length; pi++) {
              ctx.lineTo(cx + frag[pi].x, beadY + frag[pi].y);
            }
            ctx.closePath();

            // 半透明瘪壳质感（边缘带颜色，内侧呈透明脆膜）
            ctx.fillStyle = hexToRgba(beadColor, fi % 2 === 0 ? 0.68 : 0.52);
            ctx.fill();

            // 脆壳撕裂白茬高光边缘 (Sharp Shattered Rim)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.86)';
            ctx.lineWidth = 0.75;
            ctx.stroke();
            ctx.restore();
          }

          // 3) 散落在破口周边的 3 颗细微明胶碎渣点 (Micro Shell Crumbs)
          const crumbs = [
            { dx: -rBase * 1.05, dy: -rBase * 0.10, r: 0.75 },
            { dx: rBase * 1.08,  dy: rBase * 0.08,  r: 0.70 },
            { dx: rBase * 0.05,  dy: -rBase * 1.06, r: 0.65 }
          ];
          for (const cb of crumbs) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
            ctx.beginPath();
            ctx.arc(cx + cb.dx, beadY + cb.dy, cb.r, 0, Math.PI * 2);
            ctx.fill();
          }

          // 4) 中央交错锯齿状脆裂白痕 (Jagged Starburst Fracture)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.lineWidth = 0.95;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          // 左上 -> 中 -> 右下锯齿裂纹
          ctx.moveTo(cx - rBase * 0.78, beadY - rBase * 0.65);
          ctx.lineTo(cx - rBase * 0.22, beadY - rBase * 0.10);
          ctx.lineTo(cx + rBase * 0.15, beadY - rBase * 0.24);
          ctx.lineTo(cx + rBase * 0.76, beadY + rBase * 0.68);
          // 右上 -> 中 -> 左下锯齿裂纹
          ctx.moveTo(cx + rBase * 0.80, beadY - rBase * 0.60);
          ctx.lineTo(cx + rBase * 0.12, beadY + rBase * 0.15);
          ctx.lineTo(cx - rBase * 0.25, beadY + rBase * 0.08);
          ctx.lineTo(cx - rBase * 0.74, beadY + rBase * 0.72);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // ==========================================
    // 5. 卷纸烟身 / 雪茄深棕烟叶 3D 圆柱体微距写实渲染
    // ==========================================
    if (paperH > 0 || curCig.widthType === 'hand_rolled') {
      if (curCig.widthType === 'hand_rolled') {
        // 老辈白纸手卷旱烟：烟嘴与烟身 100% 通体合一的大锥度白纸喇叭筒 (上端宽 curTopW @ fireY，底端宽 cigW @ hanyanBottomY)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - curTopW / 2, fireY);
        ctx.lineTo(cx + curTopW / 2, fireY);
        ctx.lineTo(cx + cigW / 2, hanyanBottomY);
        ctx.lineTo(cx - cigW / 2, hanyanBottomY);
        ctx.closePath();
        ctx.fillStyle = '#faf8f2';
        ctx.fill();

        // 3D 一体式锥面渐变立体光影 (洁白透光、微泛老纸米黄，上下通体一气呵成零接缝)
        const pGrad = ctx.createLinearGradient(cx - curTopW / 2, 0, cx + curTopW / 2, 0);
        pGrad.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
        pGrad.addColorStop(0.24, 'rgba(255, 255, 255, 0.88)');
        pGrad.addColorStop(0.54, 'rgba(255, 255, 255, 0.20)');
        pGrad.addColorStop(1, 'rgba(0, 0, 0, 0.34)');
        ctx.fillStyle = pGrad;
        ctx.fill();

        // 裁剪到通体锥筒内绘制细节纹理
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - curTopW / 2, fireY);
        ctx.lineTo(cx + curTopW / 2, fireY);
        ctx.lineTo(cx + cigW / 2, hanyanBottomY);
        ctx.lineTo(cx - cigW / 2, hanyanBottomY);
        ctx.closePath();
        ctx.clip();

        // 1) 90年代手卷旱烟最具灵魂特征：作业本微蓝横线 (Faint Notebook Ruling Lines，从底端至顶端通体贯通)
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.28)';
        ctx.lineWidth = 0.9;
        const noteStep = 22;
        for (let ny = hanyanBottomY - 12; ny >= fireY; ny -= noteStep) {
          ctx.beginPath();
          ctx.moveTo(cx - topW, ny);
          ctx.lineTo(cx + topW, ny + 2.5);
          ctx.stroke();
        }

        // 2) 手工斜向卷纸搭接缝与自然折痕 (Spiral Hand-Rolled Paper Seam & Creases，与名烟品鉴 1:1 呼应)
        ctx.strokeStyle = 'rgba(168, 162, 158, 0.48)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(cx - topW * 0.45, hanyanBottomY - maxCigH * 0.78);
        ctx.lineTo(cx + topW * 0.42, hanyanBottomY - maxCigH * 0.48);
        ctx.moveTo(cx - topW * 0.38, hanyanBottomY - maxCigH * 0.42);
        ctx.lineTo(cx + topW * 0.35, hanyanBottomY - maxCigH * 0.14);
        ctx.stroke();

        const creaseStep = 20;
        ctx.strokeStyle = 'rgba(168, 162, 158, 0.36)';
        ctx.lineWidth = 0.75;
        for (let cY = hanyanBottomY - 16; cY >= fireY; cY -= creaseStep) {
          const wAtC = cigW + (topW - cigW) * ((hanyanBottomY - cY) / Math.max(1, maxCigH));
          ctx.beginPath();
          ctx.moveTo(cx - wAtC * 0.44, cY - 3);
          ctx.lineTo(cx + wAtC * 0.12, cY + 1.5);
          ctx.lineTo(cx + wAtC * 0.44, cY - 1.5);
          ctx.stroke();
        }

        // 3) 薄白纸微透内部金黄碎烟丝的自然原叶暗影
        ctx.fillStyle = 'rgba(180, 83, 9, 0.06)';
        ctx.fill();

        // 4) 抽吸过程中底端纸口自然微熏渐染 (无独立烟嘴分界线，仅底端柔和微染)
        if (burntRatio > 0.02) {
          const tailStainGrad = ctx.createLinearGradient(0, cy + filterH * 0.2, 0, hanyanBottomY);
          tailStainGrad.addColorStop(0, 'rgba(180, 83, 9, 0)');
          tailStainGrad.addColorStop(1, `rgba(146, 64, 14, ${Math.min(0.42, burntRatio * 0.45)})`);
          ctx.fillStyle = tailStainGrad;
          ctx.fillRect(cx - topW / 2, cy + filterH * 0.2, topW, filterH * 0.8);
        }

        // 5) 竖向传统红印章 (老辈旱烟) - 置于一体式白纸喇叭筒中下段，与名烟品鉴 1:1 对齐
        ctx.font = 'bold 8.5px sans-serif';
        ctx.fillStyle = 'rgba(185, 28, 28, 0.82)';
        ctx.textAlign = 'center';
        const stampText = curCig.stampText || '老辈旱烟';
        const stampBaseY = cy - 18;
        for (let si = 0; si < stampText.length; si++) {
          ctx.fillText(stampText[si], cx, stampBaseY + si * 9.5);
        }

        ctx.restore(); // 对应 clip() 的 save

        // 底端一体式白纸卷口微弧收边
        ctx.strokeStyle = 'rgba(214, 209, 196, 0.85)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(cx - cigW / 2, hanyanBottomY);
        ctx.lineTo(cx + cigW / 2, hanyanBottomY);
        ctx.stroke();

        ctx.restore(); // 对应手卷旱烟整体的 save
      } else if (curCig.id === 'eiffel_tower') {
        // -------------------------------------------------------------
        // 🏛️ 埃菲尔铁塔专属 3D 钢构全景一根烟 (Eiffel Tower Silhouette & Lattice)
        // -------------------------------------------------------------
        const getEiffelHalfW = (y) => {
          const u = Math.max(0, Math.min(1.0, (cy - y) / Math.max(1, maxPaperH)));
          if (u >= 0.88) return 2.0; // 塔尖避雷针
          if (u >= 0.84) return 4.8; // 3层顶层观景台穹顶
          if (u >= 0.40) {
            // 2层至3层修长主塔身
            const t = (0.84 - u) / (0.84 - 0.40);
            return 4.8 + t * (8.5 - 4.8);
          }
          if (u >= 0.36) return 11.2; // 2层观景台突出平台
          // 1层至2层下段主塔身 (逐步外扩至底座平台)
          const t = (0.36 - u) / 0.36;
          return 9.0 + t * (15.5 - 9.0);
        };

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - getEiffelHalfW(fireY), fireY);
        for (let y = fireY; y <= cy; y += 3) {
          ctx.lineTo(cx - getEiffelHalfW(y), y);
        }
        ctx.lineTo(cx - getEiffelHalfW(cy), cy);
        ctx.lineTo(cx + getEiffelHalfW(cy), cy);
        for (let y = cy; y >= fireY; y -= 3) {
          ctx.lineTo(cx + getEiffelHalfW(y), y);
        }
        ctx.lineTo(cx + getEiffelHalfW(fireY), fireY);
        ctx.closePath();

        // 3D 埃菲尔铁塔青铜/香槟金高光金属渐变
        const eGrad = ctx.createLinearGradient(cx - 16, 0, cx + 16, 0);
        eGrad.addColorStop(0, '#262017');
        eGrad.addColorStop(0.18, '#785c2c');
        eGrad.addColorStop(0.36, '#c5a059');
        eGrad.addColorStop(0.50, '#fef08a');
        eGrad.addColorStop(0.68, '#b48a3c');
        eGrad.addColorStop(0.85, '#543e18');
        eGrad.addColorStop(1.0, '#1c160e');
        ctx.fillStyle = eGrad;
        ctx.fill();

        ctx.save();
        ctx.clip();

        // 1. 经典 X-桁架钢构交叉梁 (X-Bracing Trusses)
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
        ctx.lineWidth = 0.9;
        const trussStep = 13;
        for (let ly = cy - 4; ly >= fireY; ly -= trussStep) {
          const w1 = getEiffelHalfW(ly);
          const w2 = getEiffelHalfW(Math.max(fireY, ly - trussStep));
          ctx.beginPath();
          ctx.moveTo(cx - w1 * 0.88, ly);
          ctx.lineTo(cx + w2 * 0.88, Math.max(fireY, ly - trussStep));
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + w1 * 0.88, ly);
          ctx.lineTo(cx - w2 * 0.88, Math.max(fireY, ly - trussStep));
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx - w1 * 0.95, ly);
          ctx.lineTo(cx + w1 * 0.95, ly);
          ctx.stroke();
        }

        // 2. 中央电梯轨道立柱 (Central Lift Tracks)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, fireY);
        ctx.stroke();

        // 3. 2层主观景台 (Deuxième étage) 金色护栏与走廊
        const deck2Y = cy - maxPaperH * 0.385;
        if (fireY < deck2Y) {
          const d2w = getEiffelHalfW(deck2Y);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(cx - d2w, deck2Y - 1.5, d2w * 2, 3.0);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
          ctx.fillRect(cx - d2w, deck2Y + 1.5, d2w * 2, 1.2);
        }

        // 4. 3层顶层观景台 (Sommet) 穹顶走廊
        const deck3Y = cy - maxPaperH * 0.86;
        if (fireY < deck3Y) {
          const d3w = getEiffelHalfW(deck3Y);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(cx - d3w, deck3Y - 1.2, d3w * 2, 2.4);
        }

        // 5. 铁塔夜景闪烁星芒节点 (Paris Golden Sparkles)
        const sparkleTime = this.time * 4.0;
        for (let sy = cy - 8; sy >= fireY; sy -= 18) {
          const sw = getEiffelHalfW(sy);
          const blink1 = 0.4 + 0.6 * Math.sin(sparkleTime + sy * 0.5);
          const blink2 = 0.4 + 0.6 * Math.cos(sparkleTime + sy * 0.7);
          ctx.fillStyle = `rgba(255, 255, 255, ${blink1.toFixed(2)})`;
          ctx.fillRect(cx - sw * 0.85 - 0.7, sy - 0.7, 1.4, 1.4);
          ctx.fillStyle = `rgba(254, 240, 138, ${blink2.toFixed(2)})`;
          ctx.fillRect(cx + sw * 0.85 - 0.7, sy - 0.7, 1.4, 1.4);
        }

        // 6. 吸烟升温向下热漫射 (GI Thermal Downward Bleed)
        if (isLit && emberIntensity > 0 && paperH > 2) {
          const bleedH = Math.min(paperH, 32);
          const bleedGrad = ctx.createLinearGradient(0, fireY, 0, fireY + bleedH);
          bleedGrad.addColorStop(0, `rgba(255, 140, 20, ${(0.42 * emberIntensity).toFixed(2)})`);
          bleedGrad.addColorStop(0.4, `rgba(249, 115, 22, ${(0.22 * emberIntensity).toFixed(2)})`);
          bleedGrad.addColorStop(1.0, 'rgba(249, 115, 22, 0)');
          ctx.fillStyle = bleedGrad;
          ctx.fillRect(cx - 20, fireY, 40, bleedH);
        }

        ctx.restore(); // clip
        ctx.restore(); // main
      } else if (curCig.id === 'pisa_leaning') {
        // -------------------------------------------------------------
        // 🏛️ 比萨斜塔专属 3D 罗马柱廊白大理石回廊 (Pisa Leaning Tower Colonnades)
        // -------------------------------------------------------------
        ctx.save();
        const pisaW = cigW;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(cx - pisaW / 2, fireY, pisaW, paperH);

        const pisaGrad = ctx.createLinearGradient(cx - pisaW / 2, 0, cx + pisaW / 2, 0);
        pisaGrad.addColorStop(0, 'rgba(0, 0, 0, 0.32)');
        pisaGrad.addColorStop(0.22, 'rgba(255, 255, 255, 0.65)');
        pisaGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.15)');
        pisaGrad.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
        ctx.fillStyle = pisaGrad;
        ctx.fillRect(cx - pisaW / 2, fireY, pisaW, paperH);

        ctx.save();
        ctx.beginPath();
        drawRect(ctx, cx - pisaW / 2, fireY, pisaW, paperH);
        ctx.clip();

        const tierH = maxPaperH / 7.2;
        const colCount = 6;
        const colGap = pisaW / colCount;

        for (let ty = cy; ty >= fireY - tierH; ty -= tierH) {
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(cx - pisaW / 2, ty - 2.5, pisaW, 2.5);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
          ctx.fillRect(cx - pisaW / 2, ty, pisaW, 1.2);
          
          for (let ci = 0; ci < colCount; ci++) {
            const colX = cx - pisaW / 2 + ci * colGap + colGap * 0.5;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.58)';
            ctx.beginPath();
            ctx.arc(colX, ty - tierH + 5, colGap * 0.32, Math.PI, 0);
            ctx.lineTo(colX + colGap * 0.32, ty - 2.5);
            ctx.lineTo(colX - colGap * 0.32, ty - 2.5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(colX - colGap * 0.44, ty - tierH + 4, 1.6, tierH - 6.5);
          }
        }

        const bellY = cy - maxPaperH * 0.90;
        if (fireY <= bellY) {
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(cx - pisaW * 0.38, bellY - 8, pisaW * 0.76, 8);
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.arc(cx, bellY - 3, 2.5, Math.PI, 0);
          ctx.fill();
        }

        ctx.restore(); // clip
        ctx.restore(); // main
      } else if (curCig.id === 'pyramid_giza') {
        // -------------------------------------------------------------
        // 🏛️ 吉萨金字塔专属 3D 曜金阶梯金字塔 (Great Pyramid of Giza)
        // -------------------------------------------------------------
        ctx.save();
        const getPyrHalfW = (y) => {
          const norm = Math.max(0, Math.min(1.0, (cy - y) / Math.max(1, maxPaperH)));
          return 18.0 - norm * 15.5;
        };

        ctx.beginPath();
        ctx.moveTo(cx - getPyrHalfW(fireY), fireY);
        for (let y = fireY; y <= cy; y += 3) {
          ctx.lineTo(cx - getPyrHalfW(y), y);
        }
        ctx.lineTo(cx - getPyrHalfW(cy), cy);
        ctx.lineTo(cx + getPyrHalfW(cy), cy);
        for (let y = cy; y >= fireY; y -= 3) {
          ctx.lineTo(cx + getPyrHalfW(y), y);
        }
        ctx.lineTo(cx + getPyrHalfW(fireY), fireY);
        ctx.closePath();

        const pyrGrad = ctx.createLinearGradient(cx - 18, 0, cx + 18, 0);
        pyrGrad.addColorStop(0, '#78350f');
        pyrGrad.addColorStop(0.35, '#f59e0b');
        pyrGrad.addColorStop(0.50, '#fef08a');
        pyrGrad.addColorStop(0.68, '#d97706');
        pyrGrad.addColorStop(1.0, '#451a03');
        ctx.fillStyle = pyrGrad;
        ctx.fill();

        ctx.save();
        ctx.clip();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.lineWidth = 0.9;
        const blockStep = 7.5;
        for (let by = cy - 4; by >= fireY; by -= blockStep) {
          const bw = getPyrHalfW(by);
          ctx.beginPath();
          ctx.moveTo(cx - bw, by);
          ctx.lineTo(cx + bw, by);
          ctx.stroke();

          const stagger = (Math.floor(by / blockStep) % 2) * 5.0;
          for (let bx = cx - bw + 3 + stagger; bx < cx + bw - 2; bx += 9) {
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx, by - blockStep);
            ctx.stroke();
          }
        }

        const capstoneY = cy - maxPaperH * 0.82;
        if (fireY < capstoneY) {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.moveTo(cx, cy - maxPaperH);
          ctx.lineTo(cx - getPyrHalfW(capstoneY), capstoneY);
          ctx.lineTo(cx + getPyrHalfW(capstoneY), capstoneY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }

        const eyeY = cy - maxPaperH * 0.45;
        if (fireY < eyeY - 10) {
          ctx.save();
          ctx.strokeStyle = '#fef08a';
          ctx.fillStyle = '#fef08a';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.arc(cx, eyeY, 4.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, eyeY, 2.0, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 0.8;
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            ctx.moveTo(cx + Math.cos(a) * 5.5, eyeY + Math.sin(a) * 5.5);
            ctx.lineTo(cx + Math.cos(a) * 8.5, eyeY + Math.sin(a) * 8.5);
          }
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore(); // clip
        ctx.restore(); // main
      } else if (curCig.id === 'oriental_pearl') {
        // -------------------------------------------------------------
        // 🏛️ 东方明珠专属 3D 太空舱双球天际线一根烟 (Shanghai Oriental Pearl Tower)
        // -------------------------------------------------------------
        ctx.save();
        const getPearlHalfW = (y) => {
          const norm = Math.max(0, Math.min(1.0, (cy - y) / Math.max(1, maxPaperH)));
          if (norm > 0.86) return 2.0;
          if (norm > 0.80) return 4.5;
          if (norm > 0.48) return 5.5;
          if (norm > 0.38) return 9.5;
          return 6.5;
        };

        ctx.beginPath();
        ctx.moveTo(cx - getPearlHalfW(fireY), fireY);
        for (let y = fireY; y <= cy; y += 3) {
          ctx.lineTo(cx - getPearlHalfW(y), y);
        }
        ctx.lineTo(cx - getPearlHalfW(cy), cy);
        ctx.lineTo(cx + getPearlHalfW(cy), cy);
        for (let y = cy; y >= fireY; y -= 3) {
          ctx.lineTo(cx + getPearlHalfW(y), y);
        }
        ctx.lineTo(cx + getPearlHalfW(fireY), fireY);
        ctx.closePath();

        const pearlGrad = ctx.createLinearGradient(cx - 10, 0, cx + 10, 0);
        pearlGrad.addColorStop(0, '#1e293b');
        pearlGrad.addColorStop(0.25, '#94a3b8');
        pearlGrad.addColorStop(0.50, '#f8fafc');
        pearlGrad.addColorStop(0.75, '#64748b');
        pearlGrad.addColorStop(1.0, '#0f172a');
        ctx.fillStyle = pearlGrad;
        ctx.fill();

        ctx.save();
        ctx.clip();

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - 3.5, cy); ctx.lineTo(cx - 3.5, fireY);
        ctx.moveTo(cx, cy); ctx.lineTo(cx, fireY);
        ctx.moveTo(cx + 3.5, cy); ctx.lineTo(cx + 3.5, fireY);
        ctx.stroke();

        const sphere2Y = cy - maxPaperH * 0.43;
        if (fireY < sphere2Y) {
          const s2R = 9.5;
          const sGrad = ctx.createRadialGradient(cx - 2, sphere2Y - 2, 1, cx, sphere2Y, s2R);
          sGrad.addColorStop(0, '#ffffff');
          sGrad.addColorStop(0.3, '#fb7185');
          sGrad.addColorStop(0.7, '#e11d48');
          sGrad.addColorStop(1.0, '#881337');
          ctx.fillStyle = sGrad;
          ctx.beginPath();
          ctx.arc(cx, sphere2Y, s2R, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(cx - s2R + 1, sphere2Y - 1, (s2R - 1) * 2, 2.0);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          drawEllipse(ctx, cx, sphere2Y, s2R + 1.5, 3.0);
          ctx.stroke();
        }

        const sphere3Y = cy - maxPaperH * 0.82;
        if (fireY < sphere3Y) {
          const s3R = 4.8;
          const s3Grad = ctx.createRadialGradient(cx - 1, sphere3Y - 1, 0.5, cx, sphere3Y, s3R);
          s3Grad.addColorStop(0, '#ffffff');
          s3Grad.addColorStop(0.4, '#f43f5e');
          s3Grad.addColorStop(1.0, '#9f1239');
          ctx.fillStyle = s3Grad;
          ctx.beginPath();
          ctx.arc(cx, sphere3Y, s3R, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore(); // clip
        ctx.restore(); // main
      } else {
        const isDarkPaper = !curCig.isCigar && curCig.paperColor && ['#18181b', '#09090b', '#1e1b4b', '#111827'].includes(curCig.paperColor);
        ctx.fillStyle = curCig.isCigar ? '#382218' : (curCig.paperColor || '#fcfbf7');
        ctx.fillRect(cx - cigW / 2, cy - paperH, cigW, paperH);

        const pGrad = ctx.createLinearGradient(cx - cigW / 2, 0, cx + cigW / 2, 0);
        if (curCig.isCigar) {
          // 雪茄厚重油润烟叶质感
          pGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
          pGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.22)');
          pGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.1)');
          pGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
        } else if (isDarkPaper) {
          // 黑俄寿百年等曜石黑高定卷纸 3D 丝光圆柱光影
          pGrad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
          pGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.16)');
          pGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.15)');
          pGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        } else {
          // 卷纸白润透亮立体微距光影
          pGrad.addColorStop(0, 'rgba(0, 0, 0, 0.26)');
          pGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.72)');
          pGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.12)');
          pGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
        }
        ctx.fillStyle = pGrad;
        ctx.fillRect(cx - cigW / 2, cy - paperH, cigW, paperH);

        // 横向极细微罗纹水印 (Laid Paper Fine Ribbing - 间距 3.6px, 1:1对标参考图真烟卷纸纹理)
        // 核心物理法则：以滤嘴接缝 cy 绝对世界坐标为固定基准向上渲染，绝不随燃烧向下位移（100% 绝对静止）
        if (!curCig.isCigar) {
          const ribStep = 3.6;
          for (let wy = cy - ribStep; wy >= cy - paperH; wy -= ribStep) {
            ctx.fillStyle = isDarkPaper ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.045)';
            ctx.fillRect(cx - cigW / 2, wy, cigW, 0.8);
            ctx.fillStyle = isDarkPaper ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.45)';
            ctx.fillRect(cx - cigW / 2 + 1, wy + 0.8, cigW - 2, 0.5);
          }

          // 腾讯总监设计级 · 卷烟纸透光与内部金黄烟丝次表面剪影 (Subsurface Tobacco Silhouette)
          if (!isDarkPaper && paperH > 10) {
            ctx.save();
            ctx.beginPath();
            drawRect(ctx, cx - cigW / 2 + 1.5, cy - paperH, cigW - 3.0, paperH);
            ctx.clip();
            ctx.fillStyle = 'rgba(180, 83, 9, 0.055)';
            const shredStep = 8.5;
            for (let sy = cy - shredStep; sy >= cy - paperH + 4; sy -= shredStep) {
              const shredX = cx - cigW / 2 + 2 + (((sy * 31 + 7) % 1000) / 1000) * (cigW - 6);
              const shredW = 1.6 + (((sy * 17) % 10) / 10) * 1.8;
              const shredH = 1.2 + (((sy * 23) % 10) / 10) * 1.5;
              ctx.fillRect(shredX, sy, shredW, shredH);
            }
            ctx.restore();
          }

          // 腾讯总监设计级 · 3D 微距菲涅尔圆柱边缘轮廓光 (Bilateral Rim Light)
          // 左侧漫射反光轮廓光 + 右侧环境暗边缘遮蔽，彻底立体化
          ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
          ctx.fillRect(cx - cigW / 2, cy - paperH, 0.7, paperH);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
          ctx.fillRect(cx + cigW / 2 - 0.7, cy - paperH, 0.7, paperH);

          // 腾讯总监设计级 · 燃烧端向下全局光漫射反弹 (GI Thermal Downward Bleed)
          // 吸烟升温时，炽热红外光子穿透纸质向下延展 28px 暖金光晕
          if (isLit && emberIntensity > 0 && paperH > 2) {
            const bleedH = Math.min(paperH, 28);
            const bleedGrad = ctx.createLinearGradient(0, fireY, 0, fireY + bleedH);
            bleedGrad.addColorStop(0, `rgba(255, 140, 20, ${(0.38 * emberIntensity).toFixed(2)})`);
            bleedGrad.addColorStop(0.35, `rgba(249, 115, 22, ${(0.18 * emberIntensity).toFixed(2)})`);
            bleedGrad.addColorStop(1.0, 'rgba(249, 115, 22, 0)');
            ctx.fillStyle = bleedGrad;
            ctx.fillRect(cx - cigW / 2, fireY, cigW, bleedH);
          }
        } else {
          // 腾讯总监级 · 古巴手卷雪茄螺旋斜向包叶接缝 (Spiral Leaf Wrapper Seams)
          // 模拟大师级手卷对角线 26° 螺旋搭接与立体微阴影
          ctx.save();
          ctx.beginPath();
          drawRect(ctx, cx - cigW / 2, cy - paperH, cigW, paperH);
          ctx.clip();
          
          const cigarVeinStep = 22;
          const slantAngleOffset = cigW * 0.45;
          for (let wy = cy; wy >= cy - paperH - cigarVeinStep; wy -= cigarVeinStep) {
            // 斜向搭接缝暗阴影
            ctx.strokeStyle = 'rgba(18, 9, 4, 0.52)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(cx - cigW / 2 - 2, wy + slantAngleOffset);
            ctx.lineTo(cx + cigW / 2 + 2, wy - slantAngleOffset);
            ctx.stroke();

            // 搭接边缘油性高光微芒 (Silky Leaf Sheen Rim)
            ctx.strokeStyle = 'rgba(254, 240, 138, 0.18)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(cx - cigW / 2 - 2, wy + slantAngleOffset + 1.2);
            ctx.lineTo(cx + cigW / 2 + 2, wy - slantAngleOffset + 1.2);
            ctx.stroke();
          }
          ctx.restore();
        }

        // 品牌竖向烫印与高定IP微雕徽印 (实机同款: 潮天门 / 中華 / 牛来 / 迪迦奥特曼)
        // 核心物理法则：严格裁剪在剩余未燃卷纸 [cy - paperH, cy] 内，火线烧到哪就逐像素平滑烧蚀到哪，绝不提前整段隐藏！
        if (!curCig.isCigar) {
          ctx.save();
          ctx.beginPath();
          drawRect(ctx, cx - cigW / 2, cy - paperH, cigW, paperH);
          ctx.clip();

          const rawStampText = curCig.stampText || (curCig.name ? curCig.name.split('·')[0] : '潮天门');
          const stampText = String(rawStampText).replace(/[()（）\s]/g, '');
          const stepY = stampText.length >= 5 ? 9.5 : 11;
          ctx.font = stampText.length >= 5 ? 'bold 8.5px sans-serif' : 'bold 9.5px sans-serif';
          ctx.fillStyle = curCig.stampColor || 'rgba(185, 28, 28, 0.72)';
          ctx.textAlign = 'center';
          const stampBaseY = Math.min(cy - 36, cy - 8 - (stampText.length - 1) * stepY);
          for (let si = 0; si < stampText.length; si++) {
            const charY = stampBaseY + si * stepY;
            ctx.fillText(stampText[si], cx, charY);
          }

          // 【牛来】专属烟身金牛萌犊微雕图腾
          if (curCig.id === 'niulai_cinema') {
            const bullY = stampBaseY - 16;
            // 黄金弯角
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx - 4.5, bullY - 2, 3.5, Math.PI * 0.75, Math.PI * 1.85);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx + 4.5, bullY - 2, 3.5, Math.PI * 1.15, Math.PI * 0.25);
            ctx.stroke();
            // 金牛小脸与粉金鼻吻
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(cx, bullY, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fde68a';
            ctx.beginPath();
            ctx.arc(cx, bullY + 1.6, 2.4, 0, Math.PI * 2);
            ctx.fill();
            // 炯炯有神的大眼睛
            ctx.fillStyle = '#18181b';
            ctx.beginPath();
            ctx.arc(cx - 1.6, bullY - 0.8, 0.85, 0, Math.PI * 2);
            ctx.arc(cx + 1.6, bullY - 0.8, 0.85, 0, Math.PI * 2);
            ctx.fill();
          }

          // 【迪加·凹凸曼】专属烟身动画光之英雄微雕图腾
          if (curCig.id === 'ultraman_tiga' && (stampBaseY - 24) > (cy - paperH + 6)) {
            const tigaY = stampBaseY - 17;
            // 黄金V型胸甲护翼
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx - 6.5, tigaY + 1.5);
            ctx.lineTo(cx, tigaY + 5.5);
            ctx.lineTo(cx + 6.5, tigaY + 1.5);
            ctx.stroke();
            // 钛银头盔轮廓
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(cx, tigaY - 2.5, 4.2, 0, Math.PI * 2);
            ctx.fill();
            // 发光鹅黄双目
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(cx - 1.8, tigaY - 2.5, 1.1, 0, Math.PI * 2);
            ctx.arc(cx + 1.8, tigaY - 2.5, 1.1, 0, Math.PI * 2);
            ctx.fill();
            // 额头光之水晶与胸口冰蓝彩色能量灯
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(cx, tigaY - 5.5, 0.9, 0, Math.PI * 2);
            ctx.arc(cx, tigaY + 3.5, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // 【倾城一笑·开心果】与【心动女神·白月光】专属烟身甜心皇冠/爱心微雕图腾
          if ((curCig.id === 'gf_happy_smile' || curCig.id === 'gf_moonlight_muse') && (stampBaseY - 22) > (cy - paperH + 6)) {
            const heartY = stampBaseY - 15;
            // 俏皮小金皇冠
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(cx - 4.5, heartY - 3.5);
            ctx.lineTo(cx - 5.2, heartY - 7.5);
            ctx.lineTo(cx - 2.0, heartY - 5.2);
            ctx.lineTo(cx, heartY - 8.5);
            ctx.lineTo(cx + 2.0, heartY - 5.2);
            ctx.lineTo(cx + 5.2, heartY - 7.5);
            ctx.lineTo(cx + 4.5, heartY - 3.5);
            ctx.closePath();
            ctx.fill();
            // 浪漫红粉双圆心
            ctx.fillStyle = curCig.id === 'gf_happy_smile' ? '#e11d48' : '#db2777';
            ctx.beginPath();
            ctx.arc(cx - 2.2, heartY - 0.5, 2.5, 0, Math.PI * 2);
            ctx.arc(cx + 2.2, heartY - 0.5, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(cx - 4.5, heartY + 0.4);
            ctx.lineTo(cx, heartY + 5.2);
            ctx.lineTo(cx + 4.5, heartY + 0.4);
            ctx.closePath();
            ctx.fill();
          }

          ctx.restore();
        }
      }

      // 崭新未点燃状态下的真实烟丝切口端 (实机同款: Shredded Tobacco Cut)
      // 仅当整根烟全新未燃 (满长且无烟灰) 时呈现纯净烟丝切口
      if (curState === 'UNLIT' && progress >= 0.999 && curAsh <= 0.01) {
        const topY = cy - paperH;
        const isAirCig = !!(curCig.id === 'pure_oxygen_zen' || curCig.isAirCig);
        if (curCig.id === 'eiffel_tower') {
          // 埃菲尔铁塔塔尖信标与避雷针
          ctx.save();
          const tipY = fireY;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx, tipY - 4, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(cx, tipY - 4);
          ctx.lineTo(cx, tipY - 9);
          ctx.stroke();
          ctx.restore();
        } else if (curCig.id === 'pyramid_giza') {
          // 吉萨金字塔纯金尖顶
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx, fireY - 1, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (curCig.id === 'oriental_pearl') {
          // 东方明珠发射天线顶
          ctx.save();
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(cx, fireY);
          ctx.lineTo(cx, fireY - 8);
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx, fireY - 8, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (isAirCig) {
          // 纯空气烟卷：100% 中空纯净无烟丝！展示纯白纸管口壁与通透纯氧空腔
          ctx.save();
          const wAtTop = curTopW;
          const innerW = wAtTop - 3.2;
          const capH = 3.8;
          const innerCapH = capH * 0.72;

          // 1. 中空内腔：深邃纯净通透底 (零棕褐烟丝，呈现微透纯氧深色空腔)
          const hollowGrad = ctx.createRadialGradient(cx, topY, 1, cx, topY, innerW / 2);
          hollowGrad.addColorStop(0, '#040814');
          hollowGrad.addColorStop(0.7, '#071224');
          hollowGrad.addColorStop(1.0, 'rgba(56, 189, 248, 0.28)');
          ctx.fillStyle = hollowGrad;
          ctx.beginPath();
          drawEllipse(ctx, cx, topY, innerW / 2, innerCapH);
          ctx.fill();

          // 2. 纯白纸管壁环形截面 (Pure White Paper Wall Rim)
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          drawEllipse(ctx, cx, topY, (wAtTop - 1.6) / 2, capH * 0.92);
          ctx.stroke();

          // 纸管内缘细微深度阴影
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          drawEllipse(ctx, cx, topY, innerW / 2, innerCapH);
          ctx.stroke();

          ctx.restore();
        } else if (curCig.widthType === 'hand_rolled') {
          // 老辈白纸手卷旱烟：大口径平整紧实烟丝核与微卷原叶切口 (零外溢出、平整规整)
          ctx.save();
          const wAtTop = curTopW;
          const capH = 3.8;
          const innerW = wAtTop - 2.4;
          const innerCapH = capH * 0.85;

          // 喇叭口内部深焦黄烟丝腔底
          const cutGrad = ctx.createRadialGradient(cx, topY, 1, cx, topY, innerW / 2);
          cutGrad.addColorStop(0, '#451a03');
          cutGrad.addColorStop(0.65, '#78350f');
          cutGrad.addColorStop(1.0, '#291004');
          ctx.fillStyle = cutGrad;
          ctx.beginPath();
          drawEllipse(ctx, cx, topY, innerW / 2, innerCapH);
          ctx.fill();

          // 紧凑内嵌碎烟丝肌理 (完全控制在喇叭口边缘内，绝不外凸冒出)
          ctx.fillStyle = '#b45309';
          for (let i = 0; i < 9; i++) {
            const angle = (i / 9) * Math.PI * 2;
            const dist = (i % 2 === 0 ? 0.35 : 0.68) * (innerW / 2);
            ctx.fillRect(cx + Math.cos(angle) * dist - 1.0, topY + Math.sin(angle) * (innerCapH * 0.7) - 0.7, 2.0, 1.4);
          }

          // 纯白手卷纸切口边缘
          ctx.strokeStyle = '#fcfbf7';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          drawEllipse(ctx, cx, topY, (wAtTop - 1.2) / 2, capH);
          ctx.stroke();

          ctx.restore();
        } else {
          // 机制卷烟 (经典品牌如 朝天门、中华、白沙、利群、芙蓉王等)：
          // 工业机制精密平切口，烟丝 100% 紧密齐平于纸管内部，外围包裹纯白平整切口纸圈，零外露、零突刺
          ctx.save();
          const wAtTop = curTopW;
          const capH = 3.5;
          const innerW = wAtTop - 2.0;
          const innerCapH = capH * 0.85;

          // 1. 紧密填充的醇化金黄/琥珀切面烟丝核 (Strictly Inset Flush Tobacco Core)
          const cutGrad = ctx.createRadialGradient(cx, topY, 1, cx, topY, innerW / 2);
          cutGrad.addColorStop(0, '#5c2c16');
          cutGrad.addColorStop(0.5, '#78350f');
          cutGrad.addColorStop(0.85, '#92400e');
          cutGrad.addColorStop(1.0, '#3f1a04');
          ctx.fillStyle = cutGrad;
          ctx.beginPath();
          drawEllipse(ctx, cx, topY, innerW / 2, innerCapH);
          ctx.fill();

          // 2. 紧密压制烟丝颗粒与天然叶脉微肌理 (完全内聚于切面椭圆内，杜绝任何外凸外溢)
          ctx.fillStyle = '#b45309';
          const dotCount = 8;
          for (let i = 0; i < dotCount; i++) {
            const angle = (i / dotCount) * Math.PI * 2;
            const dist = (i % 2 === 0 ? 0.35 : 0.65) * (innerW / 2);
            const dotX = cx + Math.cos(angle) * dist;
            const dotY = topY + Math.sin(angle) * (innerCapH * 0.75);
            ctx.fillRect(dotX - 0.9, dotY - 0.7, 1.8, 1.4);
          }

          // 3. 极细微高档金色烟丝微斑
          ctx.fillStyle = '#d97706';
          ctx.fillRect(cx - 2.2, topY - 0.5, 1.5, 1.0);
          ctx.fillRect(cx + 2.8, topY + 0.3, 1.3, 1.0);

          // 4. 纸管内壁极细阴影圈 (Paper Inner Shadow)
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.40)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          drawEllipse(ctx, cx, topY, innerW / 2, innerCapH);
          ctx.stroke();

          // 5. 卷烟纸切口纯净圆环白边 (Crisp Pure White Paper Wall Rim)
          // 彻底对齐工业机制真烟：切口平整平齐，纸壁洁白规整，无任何突兀杂乱烟丝溢出
          ctx.strokeStyle = curCig.isCigar ? '#573022' : '#fcfbf7';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          drawEllipse(ctx, cx, topY, (wAtTop - 1.2) / 2, capH);
          ctx.stroke();

          ctx.restore();
        }
      }

      // 掐灭后且已无烟灰时的真实炭化顶端 (Extinguished Charred Tip)
      if (curState === 'UNLIT' && progress < 0.999 && curAsh <= 0.01) {
        const isAirCig = !!(curCig.id === 'pure_oxygen_zen' || curCig.isAirCig);
        if (isAirCig) {
          // 纯空气卷掐灭：中空纸管口的炭黑收口环
          ctx.save();
          const topY = fireY;
          const wAtTop = curTopW;
          const innerW = wAtTop - 3.2;
          ctx.fillStyle = '#03060f';
          ctx.beginPath();
          drawEllipse(ctx, cx, topY, innerW / 2, 2.8);
          ctx.fill();
          ctx.strokeStyle = '#18181b';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          drawEllipse(ctx, cx, topY, (wAtTop - 1.6) / 2, 3.4);
          ctx.stroke();
          ctx.restore();
        } else {
          const charGrad = ctx.createLinearGradient(0, fireY - 2, 0, fireY + 4);
          charGrad.addColorStop(0, '#09090b');
          charGrad.addColorStop(0.4, '#451a03');
          charGrad.addColorStop(0.8, '#78350f');
          charGrad.addColorStop(1, 'rgba(120, 53, 15, 0)');
          ctx.fillStyle = charGrad;
          ctx.fillRect(cx - curTopW / 2 - 1, fireY - 1, curTopW + 2, 5);
        }
      }
    }

    // ==========================================
    // 6. 极致写实微距灰白蓬松烟灰柱 (原地燃烧成灰·世界坐标固化·绝不拉伸)
    // ==========================================
    const isAirCig = !!(curCig.id === 'pure_oxygen_zen' || curCig.isAirCig);
    // 真实可见烟灰高度：纯空气烟卷内部无烟丝，燃烧只烧纸不积灰，绝对无堆积烟灰柱！
    const displayAshH = isAirCig ? 0 : curAsh;

    if (displayAshH >= 2) {
      const ashTopY = fireY - displayAshH;
      ctx.save();

      // -------------------------------------------------------------
      // 1. 世界坐标固化外轮廓 (World-Space Fixed Silhouette)
      // 以固定步长 (stepY = 4px) 沿绝对 Y 坐标遍历，已烧成的上段灰世界坐标永久锁定，
      // 火线向下移动时新灰仅在 fireY 原地诞生，彻底杜绝整体拉伸感！
      // 关键物理法则：机制烟为标准柱宽；手卷旱烟为大锥度喇叭形，烟灰严格继承原高度处的锥度，
      // 且散碎烟叶在燃烧后呈天然微外胀蓬松质感，绝不出现烟身体积大而烟灰细小的断层违和！
      // -------------------------------------------------------------
      const stepY = 4.0;
      const startLayer = Math.floor(ashTopY / stepY);
      const endLayer = Math.ceil(fireY / stepY);
      const leftProfile = [];
      const rightProfile = [];
      const isHandRolled = curCig.widthType === 'hand_rolled';

      const maxSagX = (displayAshH >= 12 && ashRatio > 0.12)
        ? (Math.min(3.2, displayAshH * 0.055) * ((curCig.id || 'c').charCodeAt(0) % 2 === 0 ? 1 : -1))
        : 0;

      for (let L = startLayer; L <= endLayer; L++) {
        const curY = L * stepY;
        const layerSeed1 = ((L * 1337 + 17) % 1000) / 1000;
        const layerSeed2 = ((L * 2843 + 31) % 1000) / 1000;
        // 靠近顶部(ashTopY)阻尼平滑，保证烟灰柱头部与烟身一样微弧
        const distFromTop = Math.max(0, curY - ashTopY);
        const topDamp = Math.min(1.0, Math.pow(distFromTop / 12.0, 1.5));

        // 腾讯总监级 · 悬臂梁重力弯曲微挠度 (Cantilever Gravity Sagging)
        // 根部 fireY 坚挺固定，上段随高度平方递增微弯，呈现真实刚体受力张力
        const fireDist = Math.max(0, fireY - curY);
        const normDist = fireDist / Math.max(1, displayAshH);
        const sagFactor = Math.pow(normDist, 2.0);
        const curSagX = sagFactor * maxSagX;

        // 计算当前高度 Y 处烟身烧化前的物理基底宽度 (名筑/锥筒/机制烟几何精确继承)
        let layerW;
        if (isHandRolled) {
          const coneRatio = Math.max(0, (hanyanBottomY - curY) / Math.max(1, maxCigH));
          const origW = cigW + (topW - cigW) * coneRatio;
          const fluff = 1.0 + Math.min(0.06, fireDist / 35.0 * 0.06);
          layerW = Math.max(curTopW, origW * fluff);
        } else if (curCig.id === 'eiffel_tower') {
          // 埃菲尔铁塔通天钢构烟灰：物理自适应高度截面！彻底告别烟灰过粗
          // 塔尖避雷针针尖 (4px) -> 3层穹顶 (9.6px) -> 2至3层修长身 (10~17px) -> 2层平台 (22px) -> 1至2层下身 (18~31px)
          const u = Math.max(0, Math.min(1.0, (cy - curY) / Math.max(1, maxPaperH)));
          let halfW;
          if (u >= 0.88) {
            halfW = 2.0; // 塔尖避雷针
          } else if (u >= 0.84) {
            halfW = 4.8; // 3层顶层观景台穹顶
          } else if (u >= 0.40) {
            const t = (0.84 - u) / (0.84 - 0.40);
            halfW = 4.8 + t * (8.5 - 4.8);
          } else if (u >= 0.36) {
            halfW = 11.2; // 2层观景台突出平台
          } else {
            const t = (0.36 - u) / 0.36;
            halfW = 9.0 + t * (15.5 - 9.0);
          }
          const fluff = 1.0 + Math.min(0.05, fireDist / 30.0 * 0.05);
          layerW = halfW * 2 * fluff;
        } else if (curCig.id === 'pyramid_giza') {
          const u = Math.max(0, Math.min(1.0, (cy - curY) / Math.max(1, maxPaperH)));
          layerW = (topW + (cigW - topW) * (1.0 - u)) * 1.03;
        } else if (curCig.id === 'oriental_pearl') {
          const u = Math.max(0, Math.min(1.0, (cy - curY) / Math.max(1, maxPaperH)));
          layerW = (topW + (cigW - topW) * (1.0 - u) * 0.72) * 1.03;
        } else {
          layerW = cigW;
        }

        const jitterAmp = isHandRolled ? 1.8 : (curCig.id === 'eiffel_tower' ? Math.min(0.85, layerW * 0.1) : 1.2);
        const leftJitter = (Math.sin(layerSeed1 * Math.PI * 2) * jitterAmp) * topDamp;
        const rightJitter = (Math.cos(layerSeed2 * Math.PI * 2) * jitterAmp) * topDamp;

        leftProfile.push({ x: cx - layerW / 2 + leftJitter + curSagX, y: curY });
        rightProfile.push({ x: cx + layerW / 2 + rightJitter + curSagX, y: curY });
      }

      // 绘制完整烟灰封闭多边形底座（顶部平齐封顶）
      ctx.beginPath();
      ctx.moveTo(leftProfile[0].x, ashTopY);
      ctx.lineTo(rightProfile[0].x, ashTopY);
      for (let i = 1; i < rightProfile.length; i++) {
        ctx.lineTo(rightProfile[i].x, rightProfile[i].y);
      }
      ctx.lineTo(leftProfile[leftProfile.length - 1].x, leftProfile[leftProfile.length - 1].y);
      for (let i = leftProfile.length - 2; i >= 1; i--) {
        ctx.lineTo(leftProfile[i].x, leftProfile[i].y);
      }
      ctx.closePath();

      // 3D 灰白圆柱/锥体微距光影底色 (自适应最大灰柱宽度，完美覆盖左暗、20%高光白、50%灰白、右暗)
      const maxAshW = isHandRolled
        ? Math.max(topW * 1.06, curTopW)
        : (curCig.id === 'eiffel_tower' ? Math.max(curTopW * 1.08, 12) : cigW);
      const ashBaseGrad = ctx.createLinearGradient(cx - maxAshW / 2, 0, cx + maxAshW / 2, 0);
      ashBaseGrad.addColorStop(0, '#52525b');
      ashBaseGrad.addColorStop(0.20, '#ffffff');
      ashBaseGrad.addColorStop(0.50, '#e4e4e7');
      ashBaseGrad.addColorStop(0.78, '#a1a1aa');
      ashBaseGrad.addColorStop(1.0, '#3f3f46');
      ctx.fillStyle = ashBaseGrad;
      ctx.fill();

      // -------------------------------------------------------------
      // 2. 多层重叠有机鳞片集群 (Organic Flake Clusters - 批量合批极速渲染)
      // -------------------------------------------------------------
      const flakesCount = isHandRolled ? 6 : (curCig.id === 'eiffel_tower' ? Math.max(2, Math.min(4, Math.floor(curTopW / 6.0))) : 4);
      const fh = stepY * 1.25;
      const cosRimStart = Math.cos(Math.PI * 1.1);
      const sinRimStart = Math.sin(Math.PI * 1.1);

      // A. 第 1 批：所有鳞片下缘深色孔隙阴影 (1 次 Draw Call)
      ctx.fillStyle = 'rgba(24, 24, 27, 0.68)';
      ctx.beginPath();
      for (let L = startLayer; L <= endLayer; L++) {
        const curY = L * stepY;
        const isTopZone = (curY - ashTopY) < 6.0;
        const layerIdx = L - startLayer;
        const curLeftX = leftProfile[layerIdx] ? leftProfile[layerIdx].x : (cx - (isHandRolled ? topW : cigW) / 2);
        const curRightX = rightProfile[layerIdx] ? rightProfile[layerIdx].x : (cx + (isHandRolled ? topW : cigW) / 2);
        const curLayerW = curRightX - curLeftX;
        const colW = curLayerW / flakesCount;
        const fw = colW * 0.95;
        for (let col = 0; col < flakesCount; col++) {
          const flakeSeed = ((L * 17 + col * 37 + 11) % 1000) / 1000;
          const fx = curLeftX + (col + 0.5) * colW + (isTopZone ? 0 : (flakeSeed - 0.5) * (isHandRolled ? 2.8 : 2.0));
          const fy = curY + (isTopZone ? 0 : Math.sin(flakeSeed * Math.PI * 4) * 1.0);
          drawEllipse(ctx, fx, fy + 1.0, fw * 0.48, fh * 0.42);
        }
      }
      ctx.fill();

      // B. 第 2 批：按主色调分组批量填充灰白鳞片 (3 次 Draw Call，消除不自然的杂色斑块)
      const colorGroups = ['#ffffff', '#e4e4e7', '#a1a1aa'];
      for (let g = 0; g < colorGroups.length; g++) {
        const targetColor = colorGroups[g];
        ctx.fillStyle = targetColor;
        ctx.beginPath();
        for (let L = startLayer; L <= endLayer; L++) {
          const curY = L * stepY;
          const distToFire = fireY - curY;
          const isTopZone = (curY - ashTopY) < 6.0;
          const layerIdx = L - startLayer;
          const curLeftX = leftProfile[layerIdx] ? leftProfile[layerIdx].x : (cx - (isHandRolled ? topW : cigW) / 2);
          const curRightX = rightProfile[layerIdx] ? rightProfile[layerIdx].x : (cx + (isHandRolled ? topW : cigW) / 2);
          const curLayerW = curRightX - curLeftX;
          const colW = curLayerW / flakesCount;
          const fw = colW * 0.95;
          for (let col = 0; col < flakesCount; col++) {
            const flakeSeed = ((L * 17 + col * 37 + 11) % 1000) / 1000;
            let flakeColor;
            if (distToFire < 7) {
              flakeColor = (col === 1 || (isHandRolled && (col === 2 || col === 3))) ? '#e4e4e7' : '#a1a1aa';
            } else if (col === 1 || (isHandRolled && (col === 2 || col === 3))) {
              flakeColor = '#ffffff';
            } else if (col === 0 || col === flakesCount - 2) {
              flakeColor = '#e4e4e7';
            } else {
              flakeColor = '#a1a1aa';
            }
            if (flakeColor !== targetColor) continue;
            const fx = curLeftX + (col + 0.5) * colW + (isTopZone ? 0 : (flakeSeed - 0.5) * (isHandRolled ? 2.8 : 2.0));
            const fy = curY + (isTopZone ? 0 : Math.sin(flakeSeed * Math.PI * 4) * 1.0);
            drawEllipse(ctx, fx, fy, fw * 0.46, fh * 0.38);
          }
        }
        ctx.fill();
      }

      // C. 第 3 批：所有鳞片上沿极细纯白翻卷边缘 (1 次 Draw Call)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let L = startLayer; L <= endLayer; L++) {
        const curY = L * stepY;
        const isTopZone = (curY - ashTopY) < 6.0;
        const layerIdx = L - startLayer;
        const curLeftX = leftProfile[layerIdx] ? leftProfile[layerIdx].x : (cx - (isHandRolled ? topW : cigW) / 2);
        const curRightX = rightProfile[layerIdx] ? rightProfile[layerIdx].x : (cx + (isHandRolled ? topW : cigW) / 2);
        const curLayerW = curRightX - curLeftX;
        const colW = curLayerW / flakesCount;
        const rimR = colW * 0.95 * 0.36;
        for (let col = 0; col < flakesCount; col++) {
          const flakeSeed = ((L * 17 + col * 37 + 11) % 1000) / 1000;
          const fx = curLeftX + (col + 0.5) * colW + (isTopZone ? 0 : (flakeSeed - 0.5) * (isHandRolled ? 2.8 : 2.0));
          const fy = curY + (isTopZone ? 0 : Math.sin(flakeSeed * Math.PI * 4) * 1.0) - 0.5;
          ctx.moveTo(fx + cosRimStart * rimR, fy + sinRimStart * rimR);
          ctx.arc(fx, fy, rimR, Math.PI * 1.1, Math.PI * 1.9);
        }
      }
      ctx.stroke();

      // -------------------------------------------------------------
      // 3. 顶端绝对水平端面与正立微弧透视火山口 (Orthogonal Upright Top Cap)
      // -------------------------------------------------------------
      const topAshCX = (leftProfile[0] && rightProfile[0])
        ? (leftProfile[0].x + rightProfile[0].x) / 2
        : cx;
      const topAshCY = leftProfile[0] ? leftProfile[0].y : ashTopY;
      const topAshW = (rightProfile[0] && leftProfile[0])
        ? (rightProfile[0].x - leftProfile[0].x)
        : (isHandRolled ? topW : cigW);
      const capH = Math.min(3.6, topAshW * 0.085);

      // 顶端微弧端面基底 (严格贴合顶部端面宽度 topAshW 与偏移中心 topAshCX)
      const capGrad = ctx.createLinearGradient(topAshCX - topAshW / 2, 0, topAshCX + topAshW / 2, 0);
      capGrad.addColorStop(0, '#52525b');
      capGrad.addColorStop(0.20, '#f4f4f5');
      capGrad.addColorStop(0.50, '#d4d4d8');
      capGrad.addColorStop(0.80, '#a1a1aa');
      capGrad.addColorStop(1.0, '#3f3f46');
      ctx.fillStyle = capGrad;
      ctx.beginPath();
      drawEllipse(ctx, topAshCX, topAshCY, topAshW * 0.50, capH);
      ctx.fill();

      // 顶面正中央微凹炭核与白灰边缘
      ctx.fillStyle = 'rgba(24, 24, 27, 0.75)';
      ctx.beginPath();
      drawEllipse(ctx, topAshCX, topAshCY - 0.3, topAshW * 0.28, capH * 0.65);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      drawEllipse(ctx, topAshCX, topAshCY - 0.4, topAshW * 0.42, capH * 0.85);
      ctx.stroke();

      // -------------------------------------------------------------
      // 5. 起火接触面内部透红炽热裂隙 (Ember Glow through Basal Ash Fissures)
      // -------------------------------------------------------------
      if (isLit && displayAshH >= 4) {
        const nearFireH = Math.min(displayAshH * 0.45, 24);
        const emberCrackGrad = ctx.createLinearGradient(0, fireY - nearFireH, 0, fireY);
        emberCrackGrad.addColorStop(0, 'rgba(255, 69, 0, 0)');
        emberCrackGrad.addColorStop(0.35, 'rgba(255, 69, 0, 0.45)');
        emberCrackGrad.addColorStop(0.80, 'rgba(255, 120, 0, 0.90)');
        emberCrackGrad.addColorStop(1.0, 'rgba(255, 220, 80, 0.98)');
        ctx.fillStyle = emberCrackGrad;

        const crackScale = curTopW / 28;
        ctx.fillRect(cx - 5.0 * crackScale, fireY - nearFireH, 3.2 * crackScale, nearFireH);
        ctx.fillRect(cx - 0.5 * crackScale, fireY - nearFireH * 0.65, 2.5 * crackScale, nearFireH * 0.65);
        ctx.fillRect(cx + 3.8 * crackScale, fireY - nearFireH * 0.85, 2.8 * crackScale, nearFireH * 0.85);

        if (isHandRolled) {
          // 大喇叭口外侧延展火隙
          ctx.fillRect(cx - 10.5 * crackScale, fireY - nearFireH * 0.55, 2.6, nearFireH * 0.55);
          ctx.fillRect(cx + 9.2 * crackScale, fireY - nearFireH * 0.70, 2.8, nearFireH * 0.70);
        }
      }

      ctx.restore();
    }

    // ==========================================
    // 7. 剧烈燃烧端、锯齿炭化黑边与通红火星 (Burning Ember / Cherry)
    // ==========================================
    if (isLit) {
      const pulse = Math.sin(time * 0.007);
      // 融合热惯性：微弱正弦阴燃脉冲 + 仿生物理热惯性平滑增益 (0.0 ~ 1.0 -> glow 1.0 ~ 1.7)
      const heat = Math.max(0, Math.min(1.0, this.emberHeat || 0));
      const glowFactor = 1.0 + 0.15 * pulse + 0.55 * heat;

      // 1. 锯齿炭化焦黑破损边缘 (Scalloped Charred Black Rim - 参考图焦黑不规则撕纸边与微距碳化纤维)
      ctx.save();
      ctx.beginPath();
      const activeRimW = curTopW;
      const rimSteps = 14;
      const stepW = activeRimW / rimSteps;
      const leftX = cx - activeRimW / 2;
      const rimOffsets = [0, 1.8, -0.6, 2.4, 0.8, -1.2, 1.5, 2.8, 0.4, -0.8, 1.9, 0.5, 1.4, -0.4, 0];
      ctx.moveTo(leftX, fireY + 8);
      ctx.lineTo(leftX, fireY + rimOffsets[0]);
      for (let ri = 0; ri < rimSteps; ri++) {
        const rx = leftX + (ri + 1) * stepW;
        const ry = fireY + rimOffsets[ri + 1];
        ctx.lineTo(rx, ry);
      }
      ctx.lineTo(leftX + activeRimW, fireY + 8);
      ctx.closePath();

      const charBorderGrad = ctx.createLinearGradient(0, fireY - 3, 0, fireY + 8);
      charBorderGrad.addColorStop(0, '#0a0a0c');
      charBorderGrad.addColorStop(0.35, '#261208');
      charBorderGrad.addColorStop(0.7, '#78350f');
      charBorderGrad.addColorStop(1, 'rgba(120, 53, 15, 0)');
      ctx.fillStyle = charBorderGrad;
      ctx.fill();

      // 微距碳化纤维焦芒 (Organic Char Spurs)
      ctx.fillStyle = '#050507';
      for (let ri = 1; ri < rimSteps; ri += 2) {
        const sx = leftX + ri * stepW;
        const sy = fireY + rimOffsets[ri];
        ctx.fillRect(sx - 0.6, sy, 1.2, 1.8);
      }
      ctx.restore();

      // 4-7-8 呼吸减压光晕
      if (breathingMode && (breathingPhase === 'inhale' || breathingPhase === 'hold')) {
        const auraR = cigW * 1.4 + Math.sin(time * 0.008) * 4;
        const auraGrad = ctx.createRadialGradient(cx, fireY, 4, cx, fireY, auraR);
        auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        auraGrad.addColorStop(0.5, 'rgba(45, 212, 191, 0.18)');
        auraGrad.addColorStop(1, 'rgba(20, 184, 166, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, fireY, auraR, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. 燃烧端与普朗克黑体辐射色谱表现 (Planck Blackbody Radiation Spectrum)
      if (isAirCig) {
        // 纯空气烟卷核心灵魂设计：
        // 内部 100% 中空无烟丝！燃烧只有外面那一层白纸壁在灼烧 (Incandescent Hollow Paper Rim)！
        const activeRimW = curTopW;
        const innerW = activeRimW - 3.6;
        const capH = 3.8;
        const innerCapH = capH * 0.72;

        ctx.save();
        // 1. 中空内腔：深邃纯净通透，透出一缕纯氧微青之光，零实心红炭！
        const hollowGrad = ctx.createRadialGradient(cx, fireY, 1, cx, fireY, innerW / 2);
        hollowGrad.addColorStop(0, '#030712');
        hollowGrad.addColorStop(0.65, '#07152b');
        hollowGrad.addColorStop(1.0, 'rgba(56, 189, 248, 0.22)');
        ctx.fillStyle = hollowGrad;
        ctx.beginPath();
        drawEllipse(ctx, cx, fireY, innerW / 2, innerCapH);
        ctx.fill();

        // 2. 燃烧只有外层纸壁：薄薄一圈环形通红火圈 (Paper Rim Glow Ring - 热惯性平滑衰减)
        const rimAlpha = 0.60 + 0.30 * heat;
        ctx.strokeStyle = `rgba(255, ${Math.round(65 + 45 * heat)}, 0, ${rimAlpha.toFixed(2)})`;
        ctx.lineWidth = 2.8 * (1.0 + 0.25 * heat);
        ctx.beginPath();
        drawEllipse(ctx, cx, fireY, (activeRimW - 1.8) / 2, capH * 0.92);
        ctx.stroke();

        // 纸壁炽白高光金芯线 (Incandescent White-Gold Core on Paper Rim)
        ctx.strokeStyle = heat > 0.4 ? '#ffffff' : '#fef08a';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        drawEllipse(ctx, cx, fireY, (activeRimW - 1.8) / 2, capH * 0.92);
        ctx.stroke();

        // 沿外层纸圈圆周跳动的微小火星（只在纸缘外圈，不在内部）
        const rimSpotsCount = 6;
        for (let si = 0; si < rimSpotsCount; si++) {
          const angle = (si / rimSpotsCount) * Math.PI * 2 + (time * 0.0035);
          const rx = cx + Math.cos(angle) * (activeRimW / 2 - 1.0);
          const ry = fireY + Math.sin(angle) * (capH * 0.85);
          const rSize = (0.9 + Math.sin(time * 0.01 + si) * 0.4) * (1.0 + 0.5 * heat);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(rx, ry, rSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else {
        // 腾讯总监级 · 普朗克黑体辐射高光球晕 (Planck Blackbody Thermal Incandescence)
        // 随强对流供氧 (heat -> 1.0) 核心色温由 550°C 暗绯红骤升至 950°C 炽白光核
        const bloomR = (curTopW * 0.98) * glowFactor;
        const bloomGrad = ctx.createRadialGradient(cx, fireY, 1.5, cx, fireY, bloomR);
        const coreAlpha = 0.72 + 0.26 * heat;
        const midAlpha = 0.42 + 0.32 * heat;
        
        // 黑体阶梯：超温白炽核心 -> 高能金黄 -> 动力橙橙 -> 辐射绯红
        const rVal = 255;
        const gVal = Math.round(75 + 160 * heat); // 吸烟时涌现明亮鹅黄与纯白热能
        const bVal = Math.round(15 + 180 * Math.pow(heat, 2.2)); // 极高温核心泛白
        bloomGrad.addColorStop(0, `rgba(${rVal}, ${gVal}, ${bVal}, ${coreAlpha.toFixed(2)})`);
        bloomGrad.addColorStop(0.25, `rgba(254, 215, 170, ${(coreAlpha * 0.85).toFixed(2)})`);
        bloomGrad.addColorStop(0.55, `rgba(${Math.round(234 + 15 * heat)}, ${Math.round(88 + 40 * heat)}, 12, ${midAlpha.toFixed(2)})`);
        bloomGrad.addColorStop(0.82, 'rgba(185, 28, 28, 0.16)');
        bloomGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bloomGrad;
        ctx.beginPath();
        ctx.arc(cx, fireY, bloomR, 0, Math.PI * 2);
        ctx.fill();

        // 3. 内部通红炽热火星隙斑 (Crust Ember Hotspots - 热惯性平滑衰减)
        const spotScale = curTopW / 28;
        const hotspots = [
          { ox: -4.5 * spotScale, oy: 0.5, r: 3.2 * spotScale },
          { ox: 0.0, oy: -1.0, r: 4.4 * spotScale },
          { ox: 4.8 * spotScale, oy: 0.8, r: 3.0 * spotScale },
          { ox: -1.8 * spotScale, oy: 2.2, r: 2.8 * spotScale },
          { ox: 3.2 * spotScale, oy: 2.0, r: 2.5 * spotScale }
        ];

        for (const spot of hotspots) {
          const sx = cx + spot.ox;
          const sy = fireY + spot.oy;
          // 仿生微热裂隙高频布朗扰动 (Brownian Micro-Jitter 14~18Hz)
          const jitter = heat > 0.1 ? (Math.sin(time * 0.045 + spot.ox * 4.5) * 0.12 * heat) : 0;
          const sr = spot.r * ((0.9 + 0.15 * Math.sin(time * 0.009 + spot.ox)) + 0.55 * heat + jitter);

          const spotGrad = ctx.createRadialGradient(sx, sy, 0.4, sx, sy, sr);
          spotGrad.addColorStop(0, '#ffffff'); // 极白炽心
          spotGrad.addColorStop(0.28, heat > 0.25 ? '#ffffff' : '#fef08a'); // 亮金至极白
          spotGrad.addColorStop(0.65, '#ea580c'); // 橙红
          spotGrad.addColorStop(1.0, 'rgba(153, 27, 27, 0.12)'); // 边缘暗红
          ctx.fillStyle = spotGrad;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }

        // 腾讯总监设计级 · 表面冷凝微距多孔灰壳 (Oxide Ash Lattice Film)
        // 吸气停歇后，外界冷空气切断热源，火头表面最外层瞬态结成薄薄一层灰白冷凝炭壳，内部依旧深红阴燃
        if (!isInhaling && isLit && heat < 0.85) {
          const coolRatio = Math.max(0, 1.0 - heat);
          ctx.save();
          ctx.fillStyle = `rgba(161, 161, 170, ${(0.42 * coolRatio).toFixed(2)})`;
          for (let ci = 0; ci < 7; ci++) {
            const ca = (ci / 7) * Math.PI * 2;
            const cr = (curTopW * 0.28) * (0.4 + 0.6 * ((ci * 37) % 10) / 10);
            ctx.beginPath();
            ctx.arc(cx + Math.cos(ca) * cr, fireY + Math.sin(ca) * (cr * 0.45), 1.2 + ((ci * 13) % 4) * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // ==========================================
      // 腾讯总监级 · 未燃卷纸真实热解微焦圈 (Pyrolysis Scorching Heat Ring)
      // 0.8px ~ 2.0px 紧贴炭化锯齿边界的高温炙热微焦痕，深吸升温时隐现暗金微芒
      // ==========================================
      const scorchH = 1.6 + 1.2 * heat;
      const scorchGrad = ctx.createLinearGradient(0, fireY, 0, fireY + scorchH);
      scorchGrad.addColorStop(0, '#1c0f06');
      scorchGrad.addColorStop(0.32, '#78350f');
      scorchGrad.addColorStop(0.68, '#b45309');
      scorchGrad.addColorStop(1.0, 'rgba(180, 83, 9, 0)');
      ctx.fillStyle = scorchGrad;
      ctx.fillRect(cx - curTopW / 2, fireY, curTopW, scorchH);

      // ==========================================
      // 腾讯总监级 · 烟纸次表面散射透光带 (Subsurface Scattering SSS Paper Ember Bleed)
      // 燃烧端向下方未燃纸质内部透光扩散，呈现纤维红润透光与微焦过渡
      // ==========================================
      const sssDepth = Math.min(24, Math.max(12, curTopW * 0.52 * (0.85 + 0.65 * heat)));
      const sssLight = ctx.createLinearGradient(0, fireY, 0, fireY + sssDepth);
      const sssAlpha = 0.35 + 0.45 * heat;
      sssLight.addColorStop(0, `rgba(255, 180, 80, ${(sssAlpha * 0.95).toFixed(2)})`);
      sssLight.addColorStop(0.25, `rgba(249, 115, 22, ${(sssAlpha * 0.75).toFixed(2)})`);
      sssLight.addColorStop(0.60, `rgba(220, 38, 38, ${(sssAlpha * 0.40).toFixed(2)})`);
      sssLight.addColorStop(0.85, `rgba(180, 83, 9, ${(sssAlpha * 0.15).toFixed(2)})`);
      sssLight.addColorStop(1.0, 'rgba(180, 83, 9, 0)');
      ctx.fillStyle = sssLight;
      ctx.fillRect(cx - curTopW / 2, fireY, curTopW, sssDepth);

      // 微距焦化渐变细线 (0.5px Charring Boundary)
      ctx.strokeStyle = `rgba(120, 53, 15, ${Math.min(0.8, 0.4 + 0.4 * heat)})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx - curTopW / 2 + 1, fireY + 1.2);
      ctx.lineTo(cx + curTopW / 2 - 1, fireY + 1.2);
      ctx.stroke();

      // 4. 自然脱落飘散的细小灰烬微粒 (Flaking Ash Specks - 纯空气卷无烟灰不散落)
      if (!isAirCig && displayAshH > 2 && typeof particles.emitFlakingAsh === 'function') {
        const flakeChance = isInhaling ? 0.25 : 0.10;
        if (Math.random() < flakeChance) {
          particles.emitFlakingAsh(cx + (Math.random() - 0.5) * (curTopW * 0.9), fireY - displayAshH * Math.random());
        }
      }

      // 烟起火的地方：确定真实烟雾颜色 (淡白灰与淡蓝色缕空青烟)
      let activeSmokeColor = curCig.smokeColor || 'rgba(240, 244, 252, ';
      if (curCig.hasBead && isBeadPopped) {
        if (curCig.beadColor === '#f97316' || curCig.beadColor === '#f59e0b') {
          activeSmokeColor = 'rgba(254, 215, 170, '; // 陈皮暖香 / 五粮国酒金波
        } else if (curCig.beadColor === '#10b981') {
          activeSmokeColor = 'rgba(167, 243, 208, '; // 龙井桂花淡翠
        } else if (curCig.beadColor === '#06b6d4' || curCig.beadColor === '#38bdf8') {
          activeSmokeColor = 'rgba(186, 230, 253, '; // 极境冰蓝薄荷
        } else if (curCig.beadColor === '#fbbf24') {
          activeSmokeColor = 'rgba(254, 240, 138, '; // 芙蓉王金韵本香金
        } else if (curCig.beadColor === '#f43f5e' || curCig.beadColor === '#ef4444') {
          activeSmokeColor = 'rgba(254, 205, 211, '; // 中华国梅幽红 / 朱砂国红
        } else if (curCig.beadColor === '#fb7185') {
          activeSmokeColor = 'rgba(253, 164, 175, '; // 玫瑰蜜桃绯粉
        } else if (curCig.beadColor === '#f472b6') {
          activeSmokeColor = 'rgba(249, 168, 212, '; // 樱花甜润粉霞
        } else if (curCig.beadColor === '#a855f7') {
          activeSmokeColor = 'rgba(233, 213, 255, '; // 七星蓝莓幻紫
        }
      }

      if (isInhaling) {
        // 吸烟时长按深吸：火星爆燃，适度升腾微烟
        if (Math.random() < 0.28 && typeof particles.emitVolumetricCombustionSmoke === 'function') {
          particles.emitVolumetricCombustionSmoke(cx, fireY, activeSmokeColor);
        }
        if (Math.random() < 0.35) {
          particles.emitSparks(cx + (Math.random() - 0.5) * (curTopW * 0.7), fireY, 2);
        }
      } else {
        // 静置时轻柔空灵微烟，优雅升腾，绝不过度弥漫遮挡视线
        if (typeof particles.emitVolumetricCombustionSmoke === 'function') {
          if (Math.random() < 0.10) {
            particles.emitVolumetricCombustionSmoke(cx - curTopW * 0.2, fireY, activeSmokeColor);
          }
          if (Math.random() < 0.10) {
            particles.emitVolumetricCombustionSmoke(cx + curTopW * 0.2, fireY, activeSmokeColor);
          }
        }
      }

        particles.addSilkStreamNode(cx, fireY - 4, activeSmokeColor);

        // 静置阴燃时，烟丝微粒偶尔迸发自然微弱火星
        if (Math.random() < 0.04) {
          particles.emitSparks(cx + (Math.random() - 0.5) * (curTopW * 0.5), fireY, 1);
        }
      }

    // ==========================================
    // 7.5 点火器具高保真火焰视觉 (Dynamic Ignition Flame)
    // ==========================================
    if (isSparking && ignitionTool) {
      this.renderIgnitionFlame(ctx, cx, fireY, ignitionTool, time, cigW, sparkStartTime, sparkDuration);
    }

    // 闭合烟身受力轻弹微振动几何变换 (对应 line 152 的 ctx.save)
    ctx.restore();

    // 更新并渲染物理粒子系统 (烟雾贯穿延伸至屏幕上边)
    if (particles && typeof particles.update === 'function') {
      particles.update(h);
      if (typeof particles.render === 'function') {
        particles.render(ctx);
      }
    }
  }

  // 绘制 5 种不同点火工具的真实火焰粒子与光影 (腾讯 AAA 级：三段式运动学入场/燃烧/撤出 + 拟真火焰物理 + 赛博双弧)
  renderIgnitionFlame(ctx, cx, fireY, tool, time, cigW, sparkStartTime, sparkDuration) {
    ctx.save();
    const flameType = tool.flameType || 'yellow';
    const flicker = Math.sin(time * 0.038) * 3.2;

    // 1. 三段式动力学时间轴 (Kinematic Timeline: Ingress -> Sustained Burn -> Egress)
    const duration = sparkDuration || 1200;
    const elapsed = sparkStartTime ? Math.max(0, Date.now() - sparkStartTime) : 400;
    const p = Math.min(1.0, elapsed / duration);

    let toolOffsetX = 0;
    let toolOffsetY = 0;
    let toolAlpha = 1.0;
    let flameScale = 1.0;

    if (p < 0.28) {
      // 阶段一：平滑斜向滑入并伴随轻微弹性减速 (Ease-out Cubic Ingress)
      const tIn = p / 0.28;
      const easeIn = 1.0 - Math.pow(1.0 - tIn, 3);
      toolOffsetX = (1.0 - easeIn) * -42;
      toolOffsetY = (1.0 - easeIn) * 54;
      toolAlpha = Math.min(1.0, tIn * 1.6);
      flameScale = 0.35 + easeIn * 0.65;
    } else if (p > 0.80) {
      // 阶段三：点燃完成后优雅斜向回撤淡出 (Smooth Egress & Retreat)
      const tOut = (p - 0.80) / 0.20;
      const easeOut = tOut * tOut;
      toolOffsetX = easeOut * -34;
      toolOffsetY = easeOut * 46;
      toolAlpha = Math.max(0, 1.0 - easeOut);
      flameScale = Math.max(0.08, 1.0 - tOut * 0.88);
    } else {
      // 阶段二：持续燃烧点火，伴随极微弱生理持握浮动 (Sustained Natural Hover)
      toolOffsetX = Math.sin(time * 0.04) * 0.8;
      toolOffsetY = Math.cos(time * 0.045) * 0.6;
      toolAlpha = 1.0;
      flameScale = 1.0 + Math.sin(time * 0.08) * 0.05;
    }

    // 2. 烟头接触面炽烈红热光晕 (Ember Thermal Bloom)
    const flareIntensity = p < 0.28 ? (p / 0.28) : (p > 0.80 ? (1.0 - (p - 0.80) / 0.20 * 0.35) : 1.0);
    const flareR = Math.max(cigW * 0.95, 22) * flareIntensity;
    if (flareR > 2) {
      const flareGrad = ctx.createRadialGradient(cx, fireY, 2, cx, fireY, flareR);
      flareGrad.addColorStop(0, '#ffffff');
      flareGrad.addColorStop(0.25, '#fef08a');
      flareGrad.addColorStop(0.60, '#f97316');
      flareGrad.addColorStop(0.85, 'rgba(239, 68, 68, 0.45)');
      flareGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(cx, fireY, flareR, 0, Math.PI * 2);
      ctx.fill();

      // 瞬态焦化炽白亮点
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 2.5 + flicker * 0.25, fireY, 2.8, 0, Math.PI * 2);
      ctx.arc(cx + 3.2 - flicker * 0.2, fireY - 0.8, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. 各器具高保真矢量机身与火焰物理渲染
    ctx.save();
    ctx.globalAlpha = toolAlpha;

    if (flameType === 'match') {
      // ----------------------------------------------------
      // 1. 复古火柴 (Vintage Birch Matchstick)
      // ----------------------------------------------------
      const mx = cx - 16 + toolOffsetX;
      const my = fireY + 6 + toolOffsetY;

      // 倾斜白桦木火柴梗
      ctx.save();
      ctx.translate(mx - 8, my + 14);
      ctx.rotate(-0.48);
      // 木梗渐变
      const woodGrad = ctx.createLinearGradient(-3, 0, 3, 0);
      woodGrad.addColorStop(0, '#e5c396');
      woodGrad.addColorStop(0.6, '#deb887');
      woodGrad.addColorStop(1, '#b8860b');
      ctx.fillStyle = woodGrad;
      ctx.fillRect(-2.5, 0, 5, 48);
      // 磷红碳化火柴头
      const headGrad = ctx.createLinearGradient(0, -6, 0, 4);
      headGrad.addColorStop(0, '#991b1b');
      headGrad.addColorStop(0.7, '#b91c1c');
      headGrad.addColorStop(1, '#450a0a');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      drawEllipse(ctx, 0, 0, 4.5, 6.5);
      ctx.fill();
      ctx.restore();

      // 火柴柔和烛光光晕
      const mHalo = ctx.createRadialGradient(mx, my, 2, mx, my, 32 * flameScale);
      mHalo.addColorStop(0, '#ffffff');
      mHalo.addColorStop(0.2, '#fef08a');
      mHalo.addColorStop(0.55, '#f59e0b');
      mHalo.addColorStop(0.85, 'rgba(239, 68, 68, 0.35)');
      mHalo.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = mHalo;
      ctx.beginPath();
      ctx.arc(mx, my, 32 * flameScale, 0, Math.PI * 2);
      ctx.fill();

      // 蓝紫色微弱内焰根部 (Oxygen-rich blue flame base)
      ctx.fillStyle = 'rgba(37, 99, 235, 0.65)';
      ctx.beginPath();
      ctx.moveTo(mx - 5 * flameScale, my + 6);
      ctx.quadraticCurveTo(mx, my + 9, mx + 5 * flameScale, my + 6);
      ctx.quadraticCurveTo(mx, my - 2, mx - 5 * flameScale, my + 6);
      ctx.fill();

      // 温暖橙黄跳跃主火舌
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(mx - 7 * flameScale, my + 6);
      ctx.quadraticCurveTo(mx - 11 * flameScale, my - 8 * flameScale, mx + flicker * 0.8, my - 24 * flameScale);
      ctx.quadraticCurveTo(mx + 11 * flameScale, my - 8 * flameScale, mx + 7 * flameScale, my + 6);
      ctx.closePath();
      ctx.fill();

      // 白炽金光内芯
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      drawEllipse(ctx, mx + flicker * 0.3, my - 4 * flameScale, 3.2 * flameScale, 8 * flameScale);
      ctx.fill();

    } else if (flameType === 'zippo') {
      // ----------------------------------------------------
      // 2. 经典 Zippo 纯铜打火机 (Iconic Brass Zippo)
      // ----------------------------------------------------
      const zx = cx - 24 + toolOffsetX;
      const zy = fireY + 18 + toolOffsetY;

      ctx.save();
      ctx.translate(zx, zy);
      ctx.rotate(-0.16);

      // Zippo 银亮防风烟囱罩 (Stainless Steel Chimney with Air Holes)
      const chimGrad = ctx.createLinearGradient(-8, 0, 8, 0);
      chimGrad.addColorStop(0, '#94a3b8');
      chimGrad.addColorStop(0.4, '#f1f5f9');
      chimGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = chimGrad;
      ctx.fillRect(-8, -14, 16, 14);

      // 烟囱防风通风圆孔 (8 Holes)
      ctx.fillStyle = '#1e293b';
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.beginPath();
          ctx.arc(-5 + c * 5, -11 + r * 5.5, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 掀开的纯铜机盖 (Opened 42-degree Brass Lid)
      ctx.save();
      ctx.translate(-8, 0);
      ctx.rotate(-0.75);
      const lidGrad = ctx.createLinearGradient(-18, 0, 0, 0);
      lidGrad.addColorStop(0, '#b45309');
      lidGrad.addColorStop(0.5, '#fde047');
      lidGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = lidGrad;
      ctx.fillRect(-18, -4, 20, 8);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-18, -4, 20, 8);
      ctx.restore();

      // 纯铜下机身 (Brushed Brass Lower Body)
      const bodyGrad = ctx.createLinearGradient(-10, 0, 10, 0);
      bodyGrad.addColorStop(0, '#92400e');
      bodyGrad.addColorStop(0.3, '#f59e0b');
      bodyGrad.addColorStop(0.7, '#fde047');
      bodyGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = bodyGrad;
      ctx.fillRect(-10, 0, 20, 28);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.0;
      ctx.strokeRect(-10, 0, 20, 28);

      // 铰链铆钉圆点
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(-8.5, 1, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Zippo 雄浑金黄油焰与气流扰动
      const fx = cx - 4 + toolOffsetX * 0.5 + flicker * 0.4;
      const fy = fireY + 4 + toolOffsetY * 0.4;

      const zHalo = ctx.createRadialGradient(fx, fy, 2, fx, fy, 44 * flameScale);
      zHalo.addColorStop(0, '#ffffff');
      zHalo.addColorStop(0.22, '#fef08a');
      zHalo.addColorStop(0.55, '#f59e0b');
      zHalo.addColorStop(0.85, 'rgba(217, 119, 6, 0.45)');
      zHalo.addColorStop(1, 'rgba(180, 83, 9, 0)');
      ctx.fillStyle = zHalo;
      ctx.beginPath();
      ctx.arc(fx, fy, 44 * flameScale, 0, Math.PI * 2);
      ctx.fill();

      // 蓝色油芯底座微焰
      ctx.fillStyle = 'rgba(29, 78, 216, 0.7)';
      ctx.beginPath();
      drawEllipse(ctx, fx, fy + 7 * flameScale, 6 * flameScale, 3 * flameScale);
      ctx.fill();

      // 金色饱满跃动火舌
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(fx - 10 * flameScale, fy + 6 * flameScale);
      ctx.quadraticCurveTo(fx - 15 * flameScale, fy - 12 * flameScale, fx + flicker * 0.9, fy - 32 * flameScale);
      ctx.quadraticCurveTo(fx + 15 * flameScale, fy - 12 * flameScale, fx + 10 * flameScale, fy + 6 * flameScale);
      ctx.closePath();
      ctx.fill();

      // 亮白油焰中心
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      drawEllipse(ctx, fx + flicker * 0.2, fy - 6 * flameScale, 4.5 * flameScale, 12 * flameScale);
      ctx.fill();

    } else if (flameType === 'blue_torch') {
      // ----------------------------------------------------
      // 3. 雪茄三喷蓝焰喷枪 (Triple Jet Supersonic Blue Torch)
      // ----------------------------------------------------
      const bx = cx + toolOffsetX;
      const by = fireY + 16 + toolOffsetY;

      // 战术枪灰喷枪机头
      const gunGrad = ctx.createLinearGradient(bx - 14, 0, bx + 14, 0);
      gunGrad.addColorStop(0, '#0f172a');
      gunGrad.addColorStop(0.5, '#334155');
      gunGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = gunGrad;
      ctx.fillRect(bx - 14, by + 12, 28, 24);
      // 科技青蓝阳极氧化装饰圈
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(bx - 14, by + 10, 28, 2.5);
      // 3 个精密陶瓷喷火嘴
      ctx.fillStyle = '#64748b';
      [-8, 0, 8].forEach(offX => {
        ctx.fillRect(bx + offX - 2.5, by + 6, 5, 4);
      });

      // 超高温等离子外发光风暴
      const bHalo = ctx.createRadialGradient(bx, by, 3, bx, by, 46 * flameScale);
      bHalo.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      bHalo.addColorStop(0.2, 'rgba(6, 182, 212, 0.85)');
      bHalo.addColorStop(0.55, 'rgba(37, 99, 235, 0.5)');
      bHalo.addColorStop(1, 'rgba(30, 58, 138, 0)');
      ctx.fillStyle = bHalo;
      ctx.beginPath();
      ctx.arc(bx, by, 46 * flameScale, 0, Math.PI * 2);
      ctx.fill();

      // 三束超音速刚性蓝焰火锥
      const jetAngles = [-0.12, 0, 0.12];
      [-8, 0, 8].forEach((offX, idx) => {
        const targetX = cx + (offX * 0.4);
        const targetY = fireY - 4;
        const nozzleX = bx + offX;
        const nozzleY = by + 6;

        // 外层幽蓝等离子锥
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(nozzleX - 3.5 * flameScale, nozzleY);
        ctx.lineTo(targetX + flicker * 0.15, targetY);
        ctx.lineTo(nozzleX + 3.5 * flameScale, nozzleY);
        ctx.closePath();
        ctx.fill();

        // 内层激光白炽蓝心
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(nozzleX - 1.8 * flameScale, nozzleY);
        ctx.lineTo(targetX, targetY + 2);
        ctx.lineTo(nozzleX + 1.8 * flameScale, nozzleY);
        ctx.closePath();
        ctx.fill();

        // 超音速马赫激波环 (Mach shock diamond)
        if (idx === 1) {
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          drawEllipse(ctx, bx, by - 4, 3 * flameScale, 1.2 * flameScale);
          ctx.stroke();
        }
      });

    } else if (flameType === 'plasma_arc') {
      // ----------------------------------------------------
      // 4. 赛博等离子双弧 (Cyber High-Frequency Dual Plasma Arc)
      // ----------------------------------------------------
      const px = cx + toolOffsetX;
      const py = fireY + 14 + toolOffsetY;

      // 航空钛金暗灰机身
      const tiGrad = ctx.createLinearGradient(px - 15, 0, px + 15, 0);
      tiGrad.addColorStop(0, '#0f172a');
      tiGrad.addColorStop(0.4, '#1e1b4b');
      tiGrad.addColorStop(0.8, '#334155');
      tiGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = tiGrad;
      ctx.fillRect(px - 14, py + 12, 28, 24);
      // 机身极客发光能量线
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(px - 14, py + 10, 28, 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px - 4, py + 20, 8, 2);

      // 4 枚陶瓷绝缘放电电极柱
      const posts = [
        { x: px - 8, y: py + 4 },
        { x: px + 8, y: py + 4 },
        { x: px - 8, y: py - 4 },
        { x: px + 8, y: py - 4 }
      ];
      ctx.fillStyle = '#94a3b8';
      posts.forEach(pt => {
        ctx.fillRect(pt.x - 1.5, pt.y, 3, 4);
      });

      // 等离子电离紫青辐射光晕
      const pHalo = ctx.createRadialGradient(px, py, 2, px, py, 38 * flameScale);
      pHalo.addColorStop(0, '#ffffff');
      pHalo.addColorStop(0.25, '#c084fc');
      pHalo.addColorStop(0.65, 'rgba(124, 58, 237, 0.45)');
      pHalo.addColorStop(1, 'rgba(88, 28, 135, 0)');
      ctx.fillStyle = pHalo;
      ctx.beginPath();
      ctx.arc(px, py, 38 * flameScale, 0, Math.PI * 2);
      ctx.fill();

      // 交叉高能等离子双弧 (X型高频电浆放电电弧，带微频抖动)
      const jitterA = Math.sin(time * 0.09) * 2.2;
      const jitterB = Math.cos(time * 0.08) * 2.2;

      // 电弧 1: 左下到右上
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.4 * flameScale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(posts[0].x, posts[0].y);
      ctx.quadraticCurveTo(px + jitterA, py - 1, posts[3].x, posts[3].y);
      ctx.stroke();

      // 电弧 2: 右下到左上
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.4 * flameScale;
      ctx.beginPath();
      ctx.moveTo(posts[1].x, posts[1].y);
      ctx.quadraticCurveTo(px + jitterB, py - 1, posts[2].x, posts[2].y);
      ctx.stroke();

      // 交叉核心白炽等离子爆破斑点
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px + (jitterA + jitterB) * 0.2, py - 1, 3.2 * flameScale, 0, Math.PI * 2);
      ctx.fill();

      // 触及烟头的微电弧放电丝
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(px, py - 2);
      ctx.lineTo(cx + jitterA * 0.5, fireY);
      ctx.stroke();

    } else {
      // ----------------------------------------------------
      // 5. 经典便携砂轮打火机 (Classic Flint Wheel Lighter)
      // ----------------------------------------------------
      const lx = cx - 18 + toolOffsetX;
      const ly = fireY + 18 + toolOffsetY;

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(-0.14);

      // 黄铜滚花砂轮与防风口 (Knurled Wheel & Windshield)
      const whGrad = ctx.createLinearGradient(-7, 0, 7, 0);
      whGrad.addColorStop(0, '#64748b');
      whGrad.addColorStop(0.5, '#cbd5e1');
      whGrad.addColorStop(1, '#475569');
      ctx.fillStyle = whGrad;
      ctx.fillRect(-7, -10, 14, 10);

      // 砂轮滚花咬合纹路
      ctx.fillStyle = '#334155';
      for (let i = -5; i <= 5; i += 2) {
        ctx.fillRect(i, -9, 1, 8);
      }

      // 打火机便携机身 (Classic Ergonomic Amber Body)
      const fBodyGrad = ctx.createLinearGradient(-8, 0, 8, 0);
      fBodyGrad.addColorStop(0, '#b45309');
      fBodyGrad.addColorStop(0.4, '#f59e0b');
      fBodyGrad.addColorStop(0.8, '#d97706');
      fBodyGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = fBodyGrad;
      ctx.fillRect(-8, 0, 16, 26);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-8, 0, 16, 26);
      ctx.restore();

      // 温馨柔黄自然火苗
      const fx = cx - 2 + toolOffsetX * 0.4 + flicker * 0.35;
      const fy = fireY + 4 + toolOffsetY * 0.4;

      const yHalo = ctx.createRadialGradient(fx, fy, 2, fx, fy, 36 * flameScale);
      yHalo.addColorStop(0, '#ffffff');
      yHalo.addColorStop(0.24, '#fef08a');
      yHalo.addColorStop(0.62, '#f59e0b');
      yHalo.addColorStop(0.88, 'rgba(239, 68, 68, 0.35)');
      yHalo.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = yHalo;
      ctx.beginPath();
      ctx.arc(fx, fy, 36 * flameScale, 0, Math.PI * 2);
      ctx.fill();

      // 双贝塞尔波浪摇曳火舌
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(fx - 8 * flameScale, fy + 8 * flameScale);
      ctx.quadraticCurveTo(fx - 13 * flameScale, fy - 10 * flameScale, fx + flicker * 0.8, fy - 28 * flameScale);
      ctx.quadraticCurveTo(fx + 13 * flameScale, fy - 10 * flameScale, fx + 8 * flameScale, fy + 8 * flameScale);
      ctx.closePath();
      ctx.fill();

      // 白炽金光内焰芯
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      drawEllipse(ctx, fx + flicker * 0.2, fy - 5 * flameScale, 3.8 * flameScale, 10 * flameScale);
      ctx.fill();
    }

    ctx.restore();
    ctx.restore();
  }
}

/**
 * 腾讯游戏天美/北极光典藏神话级 · 【九天游龙 · 御剑惊鸿 720° 无尽星河大回环】全屏 60fps 特效渲染引擎
 * 核心视觉叙事：
 * 1. [0.00s ~ 0.45s 寒芒裂匣·破鞘十字斩]: 烟盒仓口爆发冷冽白金+剑气青+帝王紫金十字破鞘刀芒与三层剑鸣震波环
 * 2. [0.16s ~ 1.62s 九天游龙·720°全屏莫比乌斯星河大回环]:
 *    拔剑冲霄 -> 右上九天揽月回旋 -> 极速横劈贴镜掠至左下 -> 右下盘龙逆升 -> 720°双周挽剑花归宗定格
 *    全程搭载：高能彗星光首 (Comet Flare Head) + 刀锋残影切片 (Afterimage Ghosts) + 四股交织游龙丝带 + 漫天十字星芒雨
 * 3. [1.28s ~ 常驻交互态 三龙盘柱·3D螺旋剑气法阵]:
 *    名烟归宗瞬间触发超新星全屏闪光与双层音爆环，随后三股神龙灵气沿 22° 黄金轴线呈 3D 螺旋持续盘旋守护，配尊贵金币流萤
 */
export class PackFlightVfxRenderer {
  constructor() {
    this.stardust = [];
    this.burstParticles = [];
    this.speedLines = [];
    this.ambientSparks = [];
    this.scratchPts = [];
    for (let i = 0; i < 150; i++) {
      this.scratchPts.push({ u: 0, x: 0, y: 0, tx: 0, ty: 0, nx: 0, ny: 0 });
    }
    this.scratchSample = { u: 0, x: 0, y: 0, tx: 0, ty: 0, nx: 0, ny: 0 };
    this.burstTriggered = false;
    this.initParticles();
  }

  initParticles() {
    // 1. 通用星尘对象池 (64 颗)
    this.stardust = [];
    for (let i = 0; i < 64; i++) {
      this.stardust.push({
        u: Math.random(),
        normalSpread: (Math.random() - 0.5) * 2.2,
        size: 1.1 + Math.random() * 2.8,
        twinkleSpeed: 5 + Math.random() * 10,
        phase: Math.random() * Math.PI * 2,
        colorType: i % 4 === 0 ? 'gold' : (i % 4 === 1 ? 'cyan' : (i % 4 === 2 ? 'magenta' : 'amber')),
        isStar: i % 5 === 0
      });
    }

    // 2. 拔升速度线 (24 条)
    this.speedLines = [];
    for (let i = 0; i < 24; i++) {
      this.speedLines.push({
        offsetX: (Math.random() - 0.5) * 130,
        len: 55 + Math.random() * 120,
        speed: 1.5 + Math.random() * 2.0,
        phase: Math.random(),
        width: 1.4 + Math.random() * 2.4,
        color: i % 3 === 0 ? '#fde047' : (i % 3 === 1 ? '#38bdf8' : '#f472b6')
      });
    }

    // 3. 归宗定格超新星爆发粒子 (64 颗)
    this.burstParticles = [];
    for (let i = 0; i < 64; i++) {
      const angle = (i / 64) * Math.PI * 2 + (Math.random() - 0.5) * 0.05;
      const speed = 110 + Math.random() * 280;
      this.burstParticles.push({
        angle,
        speed,
        size: 1.5 + Math.random() * 3.2,
        rayLen: 36 + Math.random() * 100,
        color: i % 3 === 0 ? '#fde047' : (i % 3 === 1 ? '#38bdf8' : (i % 6 === 0 ? '#f472b6' : '#ffffff')),
        isRay: i % 2 === 0
      });
    }

    // 4. 常驻常驻流萤与星火 (32 颗)
    this.ambientSparks = [];
    for (let i = 0; i < 32; i++) {
      this.ambientSparks.push({
        angle: Math.random() * Math.PI * 2,
        radiusRatio: 0.14 + Math.random() * 0.32,
        speedY: 20 + Math.random() * 36,
        orbitSpeed: (0.7 + Math.random() * 1.4) * (i % 2 === 0 ? 1 : -1),
        size: 1.3 + Math.random() * 2.6,
        phase: Math.random() * Math.PI * 2,
        color: i % 4 === 0 ? '#fde047' : (i % 4 === 1 ? '#38bdf8' : (i % 4 === 2 ? '#f472b6' : '#fb923c'))
      });
    }

    this.burstTriggered = false;
  }

  reset() {
    this.initParticles();
  }

  /**
   * 采样经典出鞘掠空大回环运动轨迹 (复用预分配对象，杜绝 GC)
   */
  sampleSCurve(u, w, h, slotOffsetX = 0, out = null) {
    const cx = w * 0.5;
    const cy = h * 0.45;
    const t = Math.max(0, Math.min(1, u));

    let p0, p1, p2, p3, localT;
    if (t < 0.32) {
      localT = t / 0.32;
      p0 = { x: cx + slotOffsetX, y: cy + h * 0.08 };
      p1 = { x: cx + slotOffsetX * 0.5, y: cy - h * 0.28 };
      p2 = { x: cx + w * 0.18, y: cy - h * 0.30 };
      p3 = { x: cx + w * 0.28, y: cy - h * 0.14 };
    } else if (t < 0.72) {
      localT = (t - 0.32) / 0.40;
      p0 = { x: cx + w * 0.28, y: cy - h * 0.14 };
      p1 = { x: cx + w * 0.38, y: cy + h * 0.06 };
      p2 = { x: cx - w * 0.05, y: cy + h * 0.24 };
      p3 = { x: cx - w * 0.28, y: cy + h * 0.10 };
    } else {
      localT = (t - 0.72) / 0.28;
      p0 = { x: cx - w * 0.28, y: cy + h * 0.10 };
      p1 = { x: cx - w * 0.38, y: cy - h * 0.08 };
      p2 = { x: cx - w * 0.12, y: cy - h * 0.10 };
      p3 = { x: cx, y: h * 0.43 };
    }
    const mt = 1 - localT;
    const x = mt * mt * mt * p0.x + 3 * mt * mt * localT * p1.x + 3 * mt * localT * localT * p2.x + localT * localT * localT * p3.x;
    const y = mt * mt * mt * p0.y + 3 * mt * mt * localT * p1.y + 3 * mt * localT * localT * p2.y + localT * localT * localT * p3.y;
    const dx = 3 * mt * mt * (p1.x - p0.x) + 6 * mt * localT * (p2.x - p1.x) + 3 * localT * localT * (p3.x - p2.x);
    const dy = 3 * mt * mt * (p1.y - p0.y) + 6 * mt * localT * (p2.y - p1.y) + 3 * localT * localT * (p3.y - p2.y);
    const len = Math.hypot(dx, dy) || 1;

    if (out) {
      out.x = x;
      out.y = y;
      out.tx = dx / len;
      out.ty = dy / len;
      out.nx = -dy / len;
      out.ny = dx / len;
      out.u = u;
      return out;
    }
    return { x, y, tx: dx / len, ty: dy / len, nx: -dy / len, ny: dx / len, u };
  }

  /**
   * 主渲染入口：按特效档位严格分发
   */
  render(ctx, w, h, elapsedSec, options = {}) {
    if (!ctx || !w || !h) return;
    const tier = options.vfxTier || 'lifetime';
    ctx.clearRect(0, 0, w, h);

    if (tier === 'standard') {
      this.renderStandard(ctx, w, h, elapsedSec, options);
    } else if (tier === 'day') {
      this.renderDay(ctx, w, h, elapsedSec, options);
    } else if (tier === 'month') {
      this.renderMonth(ctx, w, h, elapsedSec, options);
    } else {
      this.renderLifetime(ctx, w, h, elapsedSec, options);
    }
  }

  // ===========================================================================
  // 1. 普通档位特效 【晨曦微尘 · 纯净冷刃】(标准克制、白金冷芒、高雅自然)
  // ===========================================================================
  renderStandard(ctx, w, h, elapsedSec, options = {}) {
    const cx = w * 0.5;
    const cy = h * 0.45;
    const slotOffsetX = options.slotOffsetX || 0;

    ctx.save();

    // 第一幕 [0.00s ~ 0.44s 银白冷刃破鞘]
    if (elapsedSec < 0.44) {
      const p = Math.min(1, elapsedSec / 0.40);
      const alpha = Math.sin(p * Math.PI);
      const sx = cx + slotOffsetX * 0.5;
      const sy = h * 0.42;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 单层柔白震波环
      const rx = 36 + p * (w * 0.32);
      ctx.strokeStyle = `rgba(241, 245, 249, ${alpha * 0.75})`;
      ctx.lineWidth = 2.0 * (1 - p * 0.5);
      ctx.beginPath();
      drawEllipse(ctx, sx, sy + 16, rx, rx * 0.28);
      ctx.stroke();

      // 单道横贯纯白冷光斩
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-0.16);
      const bladeSpan = w * (0.36 + p * 0.48);
      const slashGrad = ctx.createLinearGradient(-bladeSpan, 0, bladeSpan, 0);
      slashGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      slashGrad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.92})`);
      slashGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = slashGrad;
      ctx.beginPath();
      ctx.moveTo(-bladeSpan, 0);
      ctx.quadraticCurveTo(0, -6 * (1 - p * 0.6), bladeSpan, 0);
      ctx.quadraticCurveTo(0, 6 * (1 - p * 0.6), -bladeSpan, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    // 第二幕 [0.12s ~ 0.68s 银白拔升光轴]
    if (elapsedSec >= 0.12 && elapsedSec < 0.68) {
      const p = Math.min(1, (elapsedSec - 0.12) / 0.52);
      const alpha = Math.sin(p * Math.PI);
      const beamX = cx + slotOffsetX * (1 - p);
      const headY = h * 0.44 - p * (h * 0.30);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const beamGrad = ctx.createLinearGradient(beamX, headY, beamX, h * 0.72);
      beamGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.85})`);
      beamGrad.addColorStop(0.4, `rgba(226, 232, 240, ${alpha * 0.45})`);
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(beamX - 16, headY, 32, h * 0.72 - headY);

      // 8 条纯白速度流线
      for (let i = 0; i < 8; i++) {
        const sl = this.speedLines[i];
        const lx = beamX + sl.offsetX * 0.55;
        const travel = ((elapsedSec * sl.speed * 500 + sl.phase * 300) % 360);
        const ly = h * 0.72 - travel;
        if (ly < headY) continue;
        ctx.strokeStyle = `rgba(248, 250, 252, ${alpha * 0.75})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(lx, ly - sl.len * 0.6);
        ctx.lineTo(lx, ly);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 第三幕 [0.22s ~ 2.10s 纯白银河光带]
    if (elapsedSec >= 0.22 && elapsedSec < 2.15) {
      const curveHeadU = Math.min(1.0, (elapsedSec - 0.22) / 1.12);
      const ribbonFade = elapsedSec > 1.35 ? Math.max(0, 1 - (elapsedSec - 1.35) / 0.75) : 1.0;
      const count = Math.min(90, Math.max(8, Math.floor(curveHeadU * 90)));

      if (ribbonFade > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const tailU = Math.max(0, curveHeadU - 0.60);
        let ptCount = 0;
        for (let i = 0; i <= count; i++) {
          const u = i / 90;
          if (u < tailU || u > curveHeadU) continue;
          this.sampleSCurve(u, w, h, slotOffsetX, this.scratchPts[ptCount]);
          ptCount++;
        }

        if (ptCount > 2) {
          // 主流光带
          ctx.strokeStyle = `rgba(241, 245, 249, ${0.40 * ribbonFade})`;
          ctx.lineWidth = 14;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(this.scratchPts[0].x, this.scratchPts[0].y);
          for (let i = 1; i < ptCount; i++) {
            ctx.lineTo(this.scratchPts[i].x, this.scratchPts[i].y);
          }
          ctx.stroke();

          // 白金核心细线
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.90 * ribbonFade})`;
          ctx.lineWidth = 2.4;
          ctx.stroke();

          // 彗星光首
          if (curveHeadU < 0.99 && ptCount > 0) {
            const headPt = this.scratchPts[ptCount - 1];
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(headPt.x, headPt.y, 6.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // 16 颗精致微尘
          for (let i = 0; i < 16; i++) {
            const sd = this.stardust[i];
            if (sd.u > curveHeadU) continue;
            const p = this.sampleSCurve(sd.u, w, h, slotOffsetX, this.scratchSample);
            const drift = Math.sin(elapsedSec * 3 + sd.phase) * 5;
            const sx = p.x + p.nx * (sd.normalSpread * 18 + drift);
            const sy = p.y + p.ny * (sd.normalSpread * 18 + drift);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.75 * ribbonFade) + ')';
            ctx.beginPath();
            ctx.arc(sx, sy, sd.size * 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }
    }

    // 第四幕 [1.18s ~ 常驻 柔和月华微光晕]
    if (elapsedSec >= 1.18) {
      const fadeIn = Math.min(1, (elapsedSec - 1.18) / 0.35);
      const centerFocusY = h * 0.43;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const auraR = 120 + Math.sin(elapsedSec * 2.8) * 10;
      const auraGrad = ctx.createRadialGradient(cx, centerFocusY, 8, cx, centerFocusY, auraR);
      auraGrad.addColorStop(0, `rgba(255, 255, 255, ${0.28 * fadeIn})`);
      auraGrad.addColorStop(0.5, `rgba(226, 232, 240, ${0.14 * fadeIn})`);
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, centerFocusY, auraR, 0, Math.PI * 2);
      ctx.fill();

      // 12 颗安静漂浮的白银星尘
      for (let i = 0; i < 12; i++) {
        const sp = this.ambientSparks[i];
        const angle = sp.angle + elapsedSec * sp.orbitSpeed * 0.6;
        const r = w * sp.radiusRatio * 0.85;
        const py = centerFocusY + Math.sin(angle) * (r * 0.3) + (((elapsedSec * 16 + i * 18) % 160) - 80);
        const px = cx + Math.cos(angle) * r;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.65 * fadeIn})`;
        ctx.beginPath();
        ctx.arc(px, py, sp.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 第五幕 [1.32s ~ 2.05s 清爽单圈星芒]
    if (elapsedSec >= 1.32 && elapsedSec < 2.05) {
      const p = Math.min(1, (elapsedSec - 1.32) / 0.68);
      const alpha = Math.max(0, 1 - p * p);
      const centerFocusY = h * 0.43;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const ringR = 30 + p * (w * 0.38);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.82})`;
      ctx.lineWidth = 2.0 * (1 - p * 0.5);
      ctx.beginPath();
      ctx.arc(cx, centerFocusY, ringR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // ===========================================================================
  // 2. 日卡专属特效 【翡翠破晓 · 碧波生机】(冷翠绿、晨露水波、逆向双气旋上升流)
  // ===========================================================================
  renderDay(ctx, w, h, elapsedSec, options = {}) {
    const cx = w * 0.5;
    const cy = h * 0.45;
    const slotOffsetX = options.slotOffsetX || 0;

    ctx.save();

    // 第一幕 [0.00s ~ 0.46s 翡翠双层水漾涟漪波纹与青芒斩]
    if (elapsedSec < 0.46) {
      const p = Math.min(1, elapsedSec / 0.42);
      const alpha = Math.sin(p * Math.PI);
      const sx = cx + slotOffsetX * 0.5;
      const sy = h * 0.42;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 水光涟漪波 (双圈同心椭圆)
      for (let r = 0; r < 2; r++) {
        const subP = Math.max(0, Math.min(1, (elapsedSec - r * 0.08) / 0.34));
        if (subP <= 0) continue;
        const rx = 44 + subP * (w * 0.40);
        ctx.strokeStyle = r === 0 ? `rgba(16, 185, 129, ${(1 - subP) * 0.90})` : `rgba(52, 211, 153, ${(1 - subP) * 0.70})`;
        ctx.lineWidth = 2.6 * (1 - subP * 0.5);
        ctx.beginPath();
        drawEllipse(ctx, sx, sy + 16, rx, rx * 0.32);
        ctx.stroke();
      }

      // 嫩竹青芒叶形刀光
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-0.18);
      const span = w * (0.38 + p * 0.52);
      const grad = ctx.createLinearGradient(-span, 0, span, 0);
      grad.addColorStop(0, 'rgba(16, 185, 129, 0)');
      grad.addColorStop(0.3, `rgba(16, 185, 129, ${alpha * 0.85})`);
      grad.addColorStop(0.5, `rgba(209, 250, 229, ${alpha * 0.95})`);
      grad.addColorStop(0.7, `rgba(56, 189, 248, ${alpha * 0.75})`);
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-span, 0);
      ctx.quadraticCurveTo(0, -10 * (1 - p * 0.6), span, 0);
      ctx.quadraticCurveTo(0, 10 * (1 - p * 0.6), -span, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    // 第二幕 [0.12s ~ 0.70s 双股青藤升腾气旋与露珠光子]
    if (elapsedSec >= 0.12 && elapsedSec < 0.70) {
      const p = Math.min(1, (elapsedSec - 0.12) / 0.54);
      const alpha = Math.sin(p * Math.PI);
      const beamX = cx + slotOffsetX * (1 - p);
      const headY = h * 0.44 - p * (h * 0.32);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 翡翠拔升光轴
      const pillarGrad = ctx.createLinearGradient(beamX, headY, beamX, h * 0.74);
      pillarGrad.addColorStop(0, `rgba(209, 250, 229, ${alpha * 0.92})`);
      pillarGrad.addColorStop(0.35, `rgba(16, 185, 129, ${alpha * 0.75})`);
      pillarGrad.addColorStop(0.75, `rgba(56, 189, 248, ${alpha * 0.40})`);
      pillarGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = pillarGrad;
      ctx.fillRect(beamX - 22, headY, 44, h * 0.74 - headY);

      // 向上穿梭的碧绿露珠光子
      for (let i = 0; i < 14; i++) {
        const sl = this.speedLines[i];
        const lx = beamX + Math.sin(elapsedSec * 12 + i) * 24;
        const travel = ((elapsedSec * sl.speed * 580 + sl.phase * 320) % 380);
        const ly = h * 0.74 - travel;
        if (ly < headY) continue;
        ctx.fillStyle = i % 2 === 0 ? '#34d399' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(lx, ly, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 第三幕 [0.22s ~ 2.15s 碧波流光双生星带]
    if (elapsedSec >= 0.22 && elapsedSec < 2.20) {
      const curveHeadU = Math.min(1.0, (elapsedSec - 0.22) / 1.14);
      const ribbonFade = elapsedSec > 1.36 ? Math.max(0, 1 - (elapsedSec - 1.36) / 0.80) : 1.0;
      const count = Math.min(95, Math.max(8, Math.floor(curveHeadU * 95)));

      if (ribbonFade > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const tailU = Math.max(0, curveHeadU - 0.65);
        let ptCount = 0;
        for (let i = 0; i <= count; i++) {
          const u = i / 95;
          if (u < tailU || u > curveHeadU) continue;
          this.sampleSCurve(u, w, h, slotOffsetX, this.scratchPts[ptCount]);
          ptCount++;
        }

        if (ptCount > 2) {
          // 翡翠水波外光瀑
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.32 * ribbonFade})`;
          ctx.lineWidth = 24;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(this.scratchPts[0].x, this.scratchPts[0].y);
          for (let i = 1; i < ptCount; i++) {
            ctx.lineTo(this.scratchPts[i].x, this.scratchPts[i].y);
          }
          ctx.stroke();

          // 冰蓝水波内线
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.45 * ribbonFade})`;
          ctx.lineWidth = 12;
          ctx.stroke();

          // 双股螺旋水草流光
          const emeraldStrand = '#6ee7b7';
          const cyanStrand = '#38bdf8';
          for (let sIdx = 0; sIdx < 2; sIdx++) {
            const isEm = sIdx === 0;
            ctx.strokeStyle = isEm ? emeraldStrand : cyanStrand;
            ctx.lineWidth = 3.6;
            ctx.beginPath();
            let started = false;
            for (let i = 0; i < ptCount; i++) {
              const p = this.scratchPts[i];
              const prog = i / ptCount;
              const wave = Math.sin(p.u * 18 - elapsedSec * 14 + (isEm ? 0 : Math.PI)) * 12.0 * Math.sin(prog * Math.PI);
              const wx = p.x + p.nx * wave;
              const wy = p.y + p.ny * wave;
              if (!started) { ctx.moveTo(wx, wy); started = true; } else { ctx.lineTo(wx, wy); }
            }
            ctx.stroke();
          }

          // 彗星露珠光首
          if (curveHeadU < 0.99 && ptCount > 0) {
            const headPt = this.scratchPts[ptCount - 1];
            const dewGrad = ctx.createRadialGradient(headPt.x, headPt.y, 1, headPt.x, headPt.y, 36);
            dewGrad.addColorStop(0, '#ffffff');
            dewGrad.addColorStop(0.3, '#6ee7b7');
            dewGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.6)');
            dewGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = dewGrad;
            ctx.beginPath();
            ctx.arc(headPt.x, headPt.y, 36, 0, Math.PI * 2);
            ctx.fill();
          }

          // 24 颗水露灵花微粒
          for (let i = 0; i < 24; i++) {
            const sd = this.stardust[i];
            if (sd.u > curveHeadU) continue;
            const p = this.sampleSCurve(sd.u, w, h, slotOffsetX, this.scratchSample);
            const drift = Math.sin(elapsedSec * 4 + sd.phase) * 6;
            const sx = p.x + p.nx * (sd.normalSpread * 22 + drift);
            const sy = p.y + p.ny * (sd.normalSpread * 22 + drift);
            ctx.fillStyle = i % 2 === 0 ? '#a7f3d0' : '#7dd3fc';
            ctx.globalAlpha = 0.85 * ribbonFade;
            ctx.beginPath();
            ctx.arc(sx, sy, sd.size * 1.1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }
    }

    // 第四幕 [1.18s ~ 常驻 碧波生莲守护微澜]
    if (elapsedSec >= 1.18) {
      const fadeIn = Math.min(1, (elapsedSec - 1.18) / 0.36);
      const centerFocusY = h * 0.43;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const pulseR = 135 + Math.sin(elapsedSec * 3.2) * 14;
      const lotusGrad = ctx.createRadialGradient(cx, centerFocusY, 10, cx, centerFocusY, pulseR);
      lotusGrad.addColorStop(0, `rgba(167, 243, 208, ${0.35 * fadeIn})`);
      lotusGrad.addColorStop(0.4, `rgba(16, 185, 129, ${0.24 * fadeIn})`);
      lotusGrad.addColorStop(0.8, `rgba(56, 189, 248, ${0.12 * fadeIn})`);
      lotusGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lotusGrad;
      ctx.beginPath();
      ctx.arc(cx, centerFocusY, pulseR, 0, Math.PI * 2);
      ctx.fill();

      // 双股旋转微风青藤光带
      for (let arm = 0; arm < 2; arm++) {
        const offsetAng = arm * Math.PI;
        ctx.strokeStyle = arm === 0 ? 'rgba(52, 211, 153, 0.65)' : 'rgba(56, 189, 248, 0.55)';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        for (let a = 0; a <= 28; a++) {
          const theta = (a / 28) * Math.PI * 2.2 + elapsedSec * 2.5 + offsetAng;
          const rad = 45 + a * 2.4;
          const px = cx + Math.cos(theta) * rad;
          const py = centerFocusY + Math.sin(theta) * (rad * 0.4);
          if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // 18 颗露珠流萤
      for (let i = 0; i < 18; i++) {
        const sp = this.ambientSparks[i];
        const angle = sp.angle + elapsedSec * sp.orbitSpeed * 0.8;
        const r = w * sp.radiusRatio * 0.95;
        const py = centerFocusY + Math.sin(angle) * (r * 0.35) + (((elapsedSec * 22 + i * 20) % 200) - 100);
        const px = cx + Math.cos(angle) * r;
        ctx.fillStyle = i % 2 === 0 ? '#34d399' : '#38bdf8';
        ctx.globalAlpha = (0.5 + 0.5 * Math.sin(elapsedSec * 5 + sp.phase)) * fadeIn;
        ctx.beginPath();
        ctx.arc(px, py, sp.size * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 第五幕 [1.32s ~ 2.15s 晨露水月碎星大爆发]
    if (elapsedSec >= 1.32 && elapsedSec < 2.15) {
      const p = Math.min(1, (elapsedSec - 1.32) / 0.72);
      const alpha = Math.max(0, 1 - p * p);
      const centerFocusY = h * 0.43;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let r = 0; r < 2; r++) {
        const rp = Math.max(0, Math.min(1, (elapsedSec - 1.32 - r * 0.08) / 0.60));
        if (rp <= 0) continue;
        const ringR = 36 + rp * (w * 0.45);
        ctx.strokeStyle = r === 0 ? `rgba(52, 211, 153, ${(1 - rp) * 0.92})` : `rgba(56, 189, 248, ${(1 - rp) * 0.75})`;
        ctx.lineWidth = 2.8 * (1 - rp * 0.6);
        ctx.beginPath();
        ctx.arc(cx, centerFocusY, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // ===========================================================================
  // 3. 月卡专属特效 【极光紫晶 · 量子星冕】(深空紫薇、洛伦兹电浆微电弧、35°双星环进动)
  // ===========================================================================
  renderMonth(ctx, w, h, elapsedSec, options = {}) {
    const cx = w * 0.5;
    const cy = h * 0.45;
    const slotOffsetX = options.slotOffsetX || 0;

    ctx.save();

    // 第一幕 [0.00s ~ 0.46s 极光紫晶电浆双十字斩]
    if (elapsedSec < 0.46) {
      const p = Math.min(1, elapsedSec / 0.42);
      const alpha = Math.sin(p * Math.PI);
      const sx = cx + slotOffsetX * 0.5;
      const sy = h * 0.42;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 紫晶高能磁力环
      for (let r = 0; r < 3; r++) {
        const subP = Math.max(0, Math.min(1, (elapsedSec - r * 0.05) / 0.35));
        if (subP <= 0) continue;
        const rx = 48 + subP * (w * 0.44);
        ctx.strokeStyle = r === 0
          ? `rgba(168, 85, 247, ${(1 - subP) * 0.92})`
          : (r === 1 ? `rgba(244, 114, 182, ${(1 - subP) * 0.85})` : `rgba(56, 189, 248, ${(1 - subP) * 0.75})`);
        ctx.lineWidth = 3.0 * (1 - subP * 0.5);
        ctx.beginPath();
        drawEllipse(ctx, sx, sy + 16, rx, rx * 0.30);
        ctx.stroke();
      }

      // 双十字紫晶电浆破鞘斩
      const angles = [-0.22, 0.25];
      for (let a = 0; a < angles.length; a++) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angles[a]);
        const span = w * ((a === 0 ? 0.40 : 0.26) + p * 0.58);
        const grad = ctx.createLinearGradient(-span, 0, span, 0);
        grad.addColorStop(0, 'rgba(168, 85, 247, 0)');
        grad.addColorStop(0.3, `rgba(168, 85, 247, ${alpha * 0.90})`);
        grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.98})`);
        grad.addColorStop(0.7, `rgba(244, 114, 182, ${alpha * 0.88})`);
        grad.addColorStop(1, 'rgba(244, 114, 182, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-span, 0);
        ctx.quadraticCurveTo(0, -12 * (1 - p * 0.65), span, 0);
        ctx.quadraticCurveTo(0, 12 * (1 - p * 0.65), -span, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    // 第二幕 [0.12s ~ 0.70s 量子电浆喷射光柱]
    if (elapsedSec >= 0.12 && elapsedSec < 0.70) {
      const p = Math.min(1, (elapsedSec - 0.12) / 0.54);
      const alpha = Math.sin(p * Math.PI);
      const beamX = cx + slotOffsetX * (1 - p);
      const headY = h * 0.44 - p * (h * 0.33);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const pillarGrad = ctx.createLinearGradient(beamX, headY, beamX, h * 0.75);
      pillarGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
      pillarGrad.addColorStop(0.3, `rgba(168, 85, 247, ${alpha * 0.88})`);
      pillarGrad.addColorStop(0.7, `rgba(244, 114, 182, ${alpha * 0.55})`);
      pillarGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = pillarGrad;
      ctx.fillRect(beamX - 25, headY, 50, h * 0.75 - headY);

      // 18 条紫晶电弧流线
      for (let i = 0; i < 18; i++) {
        const sl = this.speedLines[i];
        const lx = beamX + sl.offsetX * 0.85;
        const travel = ((elapsedSec * sl.speed * 600 + sl.phase * 330) % 390);
        const ly = h * 0.75 - travel;
        if (ly < headY) continue;
        ctx.strokeStyle = i % 2 === 0 ? '#c084fc' : '#f472b6';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(lx, ly - sl.len);
        ctx.lineTo(lx, ly);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 第三幕 [0.22s ~ 2.20s 深空极光紫薇大回环]
    if (elapsedSec >= 0.22 && elapsedSec < 2.22) {
      const curveHeadU = Math.min(1.0, (elapsedSec - 0.22) / 1.15);
      const ribbonFade = elapsedSec > 1.37 ? Math.max(0, 1 - (elapsedSec - 1.37) / 0.82) : 1.0;
      const count = Math.min(100, Math.max(8, Math.floor(curveHeadU * 100)));

      if (ribbonFade > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const tailU = Math.max(0, curveHeadU - 0.66);
        let ptCount = 0;
        for (let i = 0; i <= count; i++) {
          const u = i / 100;
          if (u < tailU || u > curveHeadU) continue;
          this.sampleSCurve(u, w, h, slotOffsetX, this.scratchPts[ptCount]);
          ptCount++;
        }

        if (ptCount > 2) {
          // 紫晶极光外道光瀑
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.34 * ribbonFade})`;
          ctx.lineWidth = 28;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(this.scratchPts[0].x, this.scratchPts[0].y);
          for (let i = 1; i < ptCount; i++) {
            ctx.lineTo(this.scratchPts[i].x, this.scratchPts[i].y);
          }
          ctx.stroke();

          // 霓虹粉内道
          ctx.strokeStyle = `rgba(244, 114, 182, ${0.42 * ribbonFade})`;
          ctx.lineWidth = 14;
          ctx.stroke();

          // 三股交织量子丝带 (紫晶、霓虹粉、电光青)
          const strands = [
            { col: '#c084fc', amp: 14, freq: 16, phase: 0, w: 4.5 },
            { col: '#f472b6', amp: 16, freq: 14, phase: 2.1, w: 3.8 },
            { col: '#38bdf8', amp: 11, freq: 18, phase: 4.2, w: 3.2 }
          ];
          for (let sIdx = 0; sIdx < strands.length; sIdx++) {
            const st = strands[sIdx];
            ctx.strokeStyle = st.col;
            ctx.lineWidth = st.w;
            ctx.beginPath();
            let started = false;
            for (let i = 0; i < ptCount; i++) {
              const p = this.scratchPts[i];
              const prog = i / ptCount;
              const wave = Math.sin(p.u * st.freq - elapsedSec * 15 + st.phase) * st.amp * Math.sin(prog * Math.PI);
              const wx = p.x + p.nx * wave;
              const wy = p.y + p.ny * wave;
              if (!started) { ctx.moveTo(wx, wy); started = true; } else { ctx.lineTo(wx, wy); }
            }
            ctx.stroke();
          }

          // 多面棱镜彗星光首
          if (curveHeadU < 0.99 && ptCount > 0) {
            const headPt = this.scratchPts[ptCount - 1];
            const novaGrad = ctx.createRadialGradient(headPt.x, headPt.y, 2, headPt.x, headPt.y, 48);
            novaGrad.addColorStop(0, '#ffffff');
            novaGrad.addColorStop(0.3, '#f472b6');
            novaGrad.addColorStop(0.65, 'rgba(168, 85, 247, 0.7)');
            novaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = novaGrad;
            ctx.beginPath();
            ctx.arc(headPt.x, headPt.y, 48, 0, Math.PI * 2);
            ctx.fill();

            // 十字棱镜光刃
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.moveTo(headPt.x - 28, headPt.y); ctx.lineTo(headPt.x + 28, headPt.y);
            ctx.moveTo(headPt.x, headPt.y - 28); ctx.lineTo(headPt.x, headPt.y + 28);
            ctx.stroke();
          }

          // 32 颗量子跃迁星尘
          for (let i = 0; i < 32; i++) {
            const sd = this.stardust[i];
            if (sd.u > curveHeadU) continue;
            const p = this.sampleSCurve(sd.u, w, h, slotOffsetX, this.scratchSample);
            const sx = p.x + p.nx * (sd.normalSpread * 26);
            const sy = p.y + p.ny * (sd.normalSpread * 26);
            ctx.fillStyle = i % 3 === 0 ? '#f5d0fe' : (i % 3 === 1 ? '#c084fc' : '#38bdf8');
            ctx.globalAlpha = 0.90 * ribbonFade;
            ctx.beginPath();
            ctx.arc(sx, sy, sd.size * 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }
    }

    // 第四幕 [1.18s ~ 常驻 35°双量子星环进动矩阵]
    if (elapsedSec >= 1.18) {
      const fadeIn = Math.min(1, (elapsedSec - 1.18) / 0.36);
      const centerFocusY = h * 0.43;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 紫晶天幕辐射光晕
      const pulseR = 145 + Math.sin(elapsedSec * 3.4) * 15;
      const auraGrad = ctx.createRadialGradient(cx, centerFocusY, 12, cx, centerFocusY, pulseR);
      auraGrad.addColorStop(0, `rgba(245, 208, 254, ${0.40 * fadeIn})`);
      auraGrad.addColorStop(0.4, `rgba(168, 85, 247, ${0.26 * fadeIn})`);
      auraGrad.addColorStop(0.75, `rgba(244, 114, 182, ${0.14 * fadeIn})`);
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, centerFocusY, pulseR, 0, Math.PI * 2);
      ctx.fill();

      // 双量子进动椭圆星环 (35° 黄金倾角)
      for (let ring = 0; ring < 2; ring++) {
        ctx.save();
        ctx.translate(cx, centerFocusY);
        ctx.rotate((ring === 0 ? 0.35 : -0.35) + Math.sin(elapsedSec * 1.5) * 0.08);
        ctx.strokeStyle = ring === 0 ? 'rgba(192, 132, 252, 0.75)' : 'rgba(244, 114, 182, 0.65)';
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        drawEllipse(ctx, 0, 0, 85, 34);
        ctx.stroke();

        // 星环上的轨道卫星光点
        const orbitTheta = elapsedSec * (ring === 0 ? 3.2 : -2.8);
        const satX = Math.cos(orbitTheta) * 85;
        const satY = Math.sin(orbitTheta) * 34;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(satX, satY, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 22 颗紫晶浮游流萤
      for (let i = 0; i < 22; i++) {
        const sp = this.ambientSparks[i];
        const angle = sp.angle + elapsedSec * sp.orbitSpeed;
        const r = w * sp.radiusRatio * 1.05;
        const py = centerFocusY + Math.sin(angle) * (r * 0.32) + (((elapsedSec * 24 + i * 16) % 220) - 110);
        const px = cx + Math.cos(angle) * r;
        ctx.fillStyle = i % 2 === 0 ? '#c084fc' : '#f472b6';
        ctx.globalAlpha = (0.45 + 0.55 * Math.sin(elapsedSec * 4.6 + sp.phase)) * fadeIn;
        ctx.beginPath();
        ctx.arc(px, py, sp.size * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 第五幕 [1.32s ~ 2.18s 紫晶超新星离子爆裂]
    if (elapsedSec >= 1.32 && elapsedSec < 2.18) {
      const p = Math.min(1, (elapsedSec - 1.32) / 0.76);
      const alpha = Math.max(0, 1 - Math.pow(p, 1.6));
      const centerFocusY = h * 0.43;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let r = 0; r < 3; r++) {
        const rp = Math.max(0, Math.min(1, (elapsedSec - 1.32 - r * 0.06) / 0.56));
        if (rp <= 0) continue;
        const ringR = 38 + rp * (w * 0.48);
        ctx.strokeStyle = r === 0 ? `rgba(168, 85, 247, ${(1 - rp) * 0.94})` : `rgba(244, 114, 182, ${(1 - rp) * 0.85})`;
        ctx.lineWidth = 3.2 * (1 - rp * 0.6);
        ctx.beginPath();
        ctx.arc(cx, centerFocusY, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // ===========================================================================
  // ===========================================================================
  // 4. 至尊永久特效 【紫薇曜金 · 终极帝星】(升华月卡高级感 · 曜金深空紫薇 · 三维三阶多重进动星环 & 双向流星)
  // ===========================================================================
  renderLifetime(ctx, w, h, elapsedSec, options = {}) {
    const cx = w * 0.5;
    const cy = h * 0.45;
    const slotOffsetX = options.slotOffsetX || 0;

    ctx.save();

    // 第一幕 [0.00s ~ 0.48s 紫薇破晓 · 曜金双极裂匣斩]
    if (elapsedSec < 0.48) {
      const p = Math.min(1, elapsedSec / 0.44);
      const alpha = Math.sin(p * Math.PI);
      const sx = cx + slotOffsetX * 0.5;
      const sy = h * 0.42;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 双极交错弧光斩 (帝曜纯金 + 紫薇晶芒)
      for (let sIdx = 0; sIdx < 2; sIdx++) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate((sIdx === 0 ? -0.28 : 0.28) + (sIdx === 0 ? p * 0.12 : -p * 0.12));
        const span = w * (0.38 + p * 0.60);
        const grad = ctx.createLinearGradient(-span, 0, span, 0);
        if (sIdx === 0) {
          // 曜金光刃
          grad.addColorStop(0, 'rgba(253, 224, 71, 0)');
          grad.addColorStop(0.3, `rgba(245, 158, 11, ${alpha * 0.85})`);
          grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha})`);
          grad.addColorStop(0.7, `rgba(253, 224, 71, ${alpha * 0.9})`);
          grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
        } else {
          // 紫薇星刃
          grad.addColorStop(0, 'rgba(192, 132, 252, 0)');
          grad.addColorStop(0.3, `rgba(168, 85, 247, ${alpha * 0.90})`);
          grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha})`);
          grad.addColorStop(0.7, `rgba(56, 189, 248, ${alpha * 0.85})`);
          grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-span, 0);
        ctx.quadraticCurveTo(0, -13 * (1 - p * 0.6), span, 0);
        ctx.quadraticCurveTo(0, 13 * (1 - p * 0.6), -span, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 帝星引力扩散涟漪
      for (let r = 0; r < 2; r++) {
        const rp = Math.max(0, Math.min(1, (elapsedSec - r * 0.08) / 0.36));
        if (rp <= 0) continue;
        const rx = 48 + rp * (w * 0.44);
        ctx.strokeStyle = r === 0 ? `rgba(254, 240, 138, ${(1 - rp) * 0.95})` : `rgba(192, 132, 252, ${(1 - rp) * 0.88})`;
        ctx.lineWidth = 2.8 * (1 - rp * 0.5);
        ctx.beginPath();
        drawEllipse(ctx, sx, sy + 16, rx, rx * 0.30);
        ctx.stroke();
      }

      ctx.restore();
    }

    // 第二幕 [0.12s ~ 0.72s 帝星冲霄 · 双色极光天柱]
    if (elapsedSec >= 0.12 && elapsedSec < 0.72) {
      const p = Math.min(1, (elapsedSec - 0.12) / 0.54);
      const alpha = Math.sin(p * Math.PI);
      const beamX = cx + slotOffsetX * (1 - p);
      const headY = h * 0.44 - p * (h * 0.34);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const pillarGrad = ctx.createLinearGradient(beamX, headY, beamX, h * 0.76);
      pillarGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.98})`);
      pillarGrad.addColorStop(0.28, `rgba(254, 240, 138, ${alpha * 0.90})`);
      pillarGrad.addColorStop(0.55, `rgba(168, 85, 247, ${alpha * 0.75})`);
      pillarGrad.addColorStop(0.85, `rgba(56, 189, 248, ${alpha * 0.40})`);
      pillarGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = pillarGrad;
      ctx.fillRect(beamX - 28, headY, 56, h * 0.76 - headY);

      // 紫薇金芒加速线
      for (let i = 0; i < 20; i++) {
        const sl = this.speedLines[i];
        const lx = beamX + sl.offsetX * 0.88;
        const travel = ((elapsedSec * sl.speed * 620 + sl.phase * 340) % 400);
        const ly = h * 0.75 - travel;
        if (ly < headY - 20) continue;
        ctx.strokeStyle = i % 3 === 0 ? '#ffffff' : (i % 3 === 1 ? '#fde047' : '#c084fc');
        ctx.lineWidth = sl.width * 1.15;
        ctx.globalAlpha = alpha * 0.92;
        ctx.beginPath();
        ctx.moveTo(lx, ly - sl.len);
        ctx.lineTo(lx, ly);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 第三幕 [0.22s ~ 2.25s 紫薇曜金莫比乌斯星河大回环]
    if (elapsedSec >= 0.22 && elapsedSec < 2.25) {
      const curveHeadU = Math.min(1.0, (elapsedSec - 0.22) / 1.16);
      const ribbonFade = elapsedSec > 1.38 ? Math.max(0, 1 - (elapsedSec - 1.38) / 0.82) : 1.0;
      const count = Math.min(54, Math.max(8, Math.floor(curveHeadU * 54)));

      if (ribbonFade > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const tailStartU = Math.max(0, curveHeadU - 0.68);
        let ptCount = 0;
        for (let i = 0; i <= count; i++) {
          const u = i / 54;
          if (u < tailStartU || u > curveHeadU) continue;
          this.sampleSCurve(u, w, h, slotOffsetX, this.scratchPts[ptCount]);
          ptCount++;
        }

        if (ptCount > 2) {
          // 紫薇深空外道天幕
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.36 * ribbonFade})`;
          ctx.lineWidth = 32;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(this.scratchPts[0].x, this.scratchPts[0].y);
          for (let i = 1; i < ptCount; i++) {
            ctx.lineTo(this.scratchPts[i].x, this.scratchPts[i].y);
          }
          ctx.stroke();

          // 曜金内道
          ctx.strokeStyle = `rgba(253, 224, 71, ${0.45 * ribbonFade})`;
          ctx.lineWidth = 16;
          ctx.stroke();

          // 四股交织量子丝带 (纯白、曜金、紫薇、电光青)
          const strands = [
            { col: '#ffffff', amp: 15.0, freq: 16, phase: 0, w: 4.2 },
            { col: '#fef08a', amp: 18.0, freq: 14, phase: 1.8, w: 4.5 },
            { col: '#c084fc', amp: 16.0, freq: 17, phase: 3.5, w: 3.8 },
            { col: '#38bdf8', amp: 12.0, freq: 15, phase: 5.2, w: 3.0 }
          ];
          for (let sIdx = 0; sIdx < strands.length; sIdx++) {
            const st = strands[sIdx];
            ctx.strokeStyle = st.col;
            ctx.globalAlpha = ribbonFade;
            ctx.lineWidth = st.w;
            ctx.beginPath();
            let started = false;
            for (let i = 0; i < ptCount; i++) {
              const p = this.scratchPts[i];
              const prog = i / ptCount;
              const wave = Math.sin(p.u * st.freq - elapsedSec * 15 + st.phase) * st.amp * Math.sin(prog * Math.PI);
              const wx = p.x + p.nx * wave;
              const wy = p.y + p.ny * wave;
              if (!started) { ctx.moveTo(wx, wy); started = true; } else { ctx.lineTo(wx, wy); }
            }
            ctx.stroke();
          }

          // 帝星耀核彗星光首 (双层八角星芒)
          if (curveHeadU < 0.99 && ptCount > 0) {
            const headPt = this.scratchPts[ptCount - 1];
            ctx.globalAlpha = ribbonFade;
            const headGrad = ctx.createRadialGradient(headPt.x, headPt.y, 2, headPt.x, headPt.y, 52);
            headGrad.addColorStop(0, '#ffffff');
            headGrad.addColorStop(0.28, '#fef08a');
            headGrad.addColorStop(0.60, 'rgba(192, 132, 252, 0.75)');
            headGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = headGrad;
            ctx.beginPath();
            ctx.arc(headPt.x, headPt.y, 52, 0, Math.PI * 2);
            ctx.fill();

            // 双层八角棱镜星芒
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(headPt.x - 34, headPt.y); ctx.lineTo(headPt.x + 34, headPt.y);
            ctx.moveTo(headPt.x, headPt.y - 34); ctx.lineTo(headPt.x, headPt.y + 34);
            ctx.stroke();

            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            const dLen = 22;
            ctx.moveTo(headPt.x - dLen, headPt.y - dLen); ctx.lineTo(headPt.x + dLen, headPt.y + dLen);
            ctx.moveTo(headPt.x - dLen, headPt.y + dLen); ctx.lineTo(headPt.x + dLen, headPt.y - dLen);
            ctx.stroke();
          }

          // 36 颗曜金紫薇星尘
          for (let i = 0; i < 36; i++) {
            const sd = this.stardust[i];
            if (sd.u > curveHeadU) continue;
            const sample = this.sampleSCurve(sd.u, w, h, slotOffsetX, this.scratchSample);
            const drift = Math.sin(elapsedSec * 3.6 + sd.phase) * 5;
            const sx = sample.x + sample.nx * (sd.normalSpread * 26 + drift);
            const sy = sample.y + sample.ny * (sd.normalSpread * 26 + drift);
            ctx.fillStyle = i % 3 === 0 ? '#ffffff' : (i % 3 === 1 ? '#fef08a' : '#c084fc');
            ctx.globalAlpha = 0.92 * ribbonFade;
            ctx.beginPath();
            ctx.arc(sx, sy, sd.size * 1.25, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }
    }

    // =========================================================================
    // 第四幕 [1.18s ~ 常驻核心：【紫薇曜金 · 三维三阶多重进动星环 & 双向流星】]
    // =========================================================================
    // 视觉核心：融合月卡广受好评的 3D 星环美感，升华至至尊帝王级！
    // 1. 紫薇帝星深空呼吸辐射光冕 (金紫双色光晕深邃脉动)
    // 2. 三阶进动天体星环 (42° 曜金主环 + -38° 紫薇主环 + 8° 天赤道星辉微环)
    // 3. 星环双向对冲流星伴星 (带拖尾微光彗尾，不再是死板小圆点，而是活的轨道流星)
    // 4. 32 颗紫薇曜金浮游星萤 (呼吸明灭闪烁，空气层次感拉满)
    // 5. 周期性帝星引力微澜
    if (elapsedSec >= 1.18) {
      const fadeIn = Math.min(1, (elapsedSec - 1.18) / 0.36);
      const centerFocusY = h * 0.43;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 1. 紫薇帝星深空呼吸辐射光冕 (柔和深邃，绝不喧宾夺主，烟身清晰尊贵)
      const pulseR = 160 + Math.sin(elapsedSec * 2.8) * 16;
      const auraGrad = ctx.createRadialGradient(cx, centerFocusY, 14, cx, centerFocusY, pulseR);
      auraGrad.addColorStop(0, `rgba(255, 255, 255, ${0.35 * fadeIn})`);
      auraGrad.addColorStop(0.25, `rgba(254, 240, 138, ${0.28 * fadeIn})`);
      auraGrad.addColorStop(0.55, `rgba(168, 85, 247, ${0.18 * fadeIn})`);
      auraGrad.addColorStop(0.82, `rgba(126, 34, 206, ${0.08 * fadeIn})`);
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, centerFocusY, pulseR, 0, Math.PI * 2);
      ctx.fill();

      // 2. 三阶三维多重进动星环
      const ringsConfig = [
        {
          // 一阶：42° 曜金主星环 (顺时针进动，顺行流星)
          baseAngle: 0.42,
          wobbleFreq: 1.2,
          wobbleAmp: 0.07,
          rx: 96,
          ry: 36,
          strokeCol: 'rgba(254, 240, 138, 0.85)',
          glowCol: 'rgba(245, 158, 11, 0.35)',
          glowWidth: 9,
          strokeWidth: 3.2,
          cometSpeed: 2.8,
          cometCol: '#ffffff',
          cometGlow: '#fef08a',
          cometR: 4.8
        },
        {
          // 二阶：-38° 紫薇主星环 (逆时针进动，逆行流星)
          baseAngle: -0.38,
          wobbleFreq: 1.4,
          wobbleAmp: 0.08,
          rx: 118,
          ry: 42,
          strokeCol: 'rgba(192, 132, 252, 0.80)',
          glowCol: 'rgba(168, 85, 247, 0.30)',
          glowWidth: 10,
          strokeWidth: 3.0,
          cometSpeed: -2.4,
          cometCol: '#ffffff',
          cometGlow: '#c084fc',
          cometR: 4.5
        },
        {
          // 三阶：8° 赤道微星环 (微倾角，轻盈外环，两极平衡)
          baseAngle: 0.08,
          wobbleFreq: 0.8,
          wobbleAmp: 0.04,
          rx: 142,
          ry: 48,
          strokeCol: 'rgba(56, 189, 248, 0.55)',
          glowCol: 'rgba(56, 189, 248, 0.18)',
          glowWidth: 6,
          strokeWidth: 1.8,
          cometSpeed: 1.6,
          cometCol: '#e0f2fe',
          cometGlow: '#38bdf8',
          cometR: 3.8
        }
      ];

      for (let rIdx = 0; rIdx < ringsConfig.length; rIdx++) {
        const rc = ringsConfig[rIdx];
        ctx.save();
        ctx.translate(cx, centerFocusY);
        const rotAngle = rc.baseAngle + Math.sin(elapsedSec * rc.wobbleFreq + rIdx * 1.5) * rc.wobbleAmp;
        ctx.rotate(rotAngle);

        // 环体柔光外晕
        ctx.strokeStyle = rc.glowCol;
        ctx.lineWidth = rc.glowWidth;
        ctx.beginPath();
        drawEllipse(ctx, 0, 0, rc.rx, rc.ry);
        ctx.stroke();

        // 环体锐利本体光丝
        ctx.strokeStyle = rc.strokeCol;
        ctx.lineWidth = rc.strokeWidth;
        ctx.stroke();

        // 轨道上的流星伴星（带有 5 节平滑彗星流光拖尾）
        const cometTheta = elapsedSec * rc.cometSpeed + rIdx * 2.2;
        const trailSteps = 5;
        for (let t = trailSteps; t >= 0; t--) {
          const stepTheta = cometTheta - (t * 0.04 * (rc.cometSpeed > 0 ? 1 : -1));
          const sx = Math.cos(stepTheta) * rc.rx;
          const sy = Math.sin(stepTheta) * rc.ry;
          const stepAlpha = (1.0 - (t / (trailSteps + 1)) * 0.82) * fadeIn;
          const stepR = (t === 0 ? rc.cometR : rc.cometR * (0.8 - t * 0.12));

          if (t === 0) {
            // 流星核与星芒
            const cGrad = ctx.createRadialGradient(sx, sy, 1, sx, sy, rc.cometR * 2.6);
            cGrad.addColorStop(0, '#ffffff');
            cGrad.addColorStop(0.4, rc.cometGlow);
            cGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = cGrad;
            ctx.beginPath();
            ctx.arc(sx, sy, rc.cometR * 2.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = rc.cometCol;
            ctx.beginPath();
            ctx.arc(sx, sy, rc.cometR, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // 彗尾粒子
            ctx.fillStyle = rc.cometGlow;
            ctx.globalAlpha = stepAlpha * 0.65;
            ctx.beginPath();
            ctx.arc(sx, sy, stepR, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }

      // 3. 周期性帝星引力微澜 (向外扩散的优雅金紫光环)
      for (let wIdx = 0; wIdx < 2; wIdx++) {
        const waveT = ((elapsedSec * 0.55 + wIdx * 0.50) % 1.0);
        const waveR = 50 + waveT * 125;
        const waveAlpha = (1 - waveT) * 0.40 * fadeIn;
        ctx.strokeStyle = wIdx % 2 === 0 ? `rgba(254, 240, 138, ${waveAlpha})` : `rgba(192, 132, 252, ${waveAlpha})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        drawEllipse(ctx, cx, centerFocusY, waveR, waveR * 0.35);
        ctx.stroke();
      }

      // 4. 32 颗紫薇曜金浮游星萤 (如细碎钻石与曜金粉尘在空间中呼吸微闪)
      for (let i = 0; i < this.ambientSparks.length; i++) {
        const sp = this.ambientSparks[i];
        const curAngle = sp.angle + elapsedSec * sp.orbitSpeed * 0.75;
        const r = w * sp.radiusRatio * 1.12;
        const verticalCycle = ((elapsedSec * (sp.speedY * 0.7) + i * 16) % 220) - 110;
        const px = cx + Math.cos(curAngle) * r;
        const py = centerFocusY - verticalCycle + Math.sin(curAngle) * (r * 0.30);

        ctx.globalAlpha = (0.42 + 0.58 * Math.sin(elapsedSec * 4.5 + sp.phase)) * fadeIn;
        ctx.fillStyle = i % 4 === 0 ? '#ffffff' : (i % 4 === 1 ? '#fef08a' : (i % 4 === 2 ? '#c084fc' : '#38bdf8'));
        ctx.beginPath();
        ctx.arc(px, py, sp.size * 1.22, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 第五幕 [1.32s ~ 2.18s 紫薇曜金超新星全屏音爆大爆发]
    if (elapsedSec >= 1.32 && elapsedSec < 2.18) {
      const burstElapsed = elapsedSec - 1.32;
      const burstP = Math.min(1, burstElapsed / 0.78);
      const burstAlpha = Math.max(0, 1 - Math.pow(burstP, 1.72));
      const centerFocusY = h * 0.43;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 闪光耀斑核
      const coreR = 68 + burstP * (w * 0.60);
      const coreGrad = ctx.createRadialGradient(cx, centerFocusY, 4, cx, centerFocusY, coreR);
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${burstAlpha * 0.98})`);
      coreGrad.addColorStop(0.28, `rgba(253, 224, 71, ${burstAlpha * 0.88})`);
      coreGrad.addColorStop(0.62, `rgba(192, 132, 252, ${burstAlpha * 0.65})`);
      coreGrad.addColorStop(0.85, `rgba(56, 189, 248, ${burstAlpha * 0.35})`);
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, centerFocusY, coreR, 0, Math.PI * 2);
      ctx.fill();

      // 三层帝星冲击波环 (金、紫、青)
      for (let ringIdx = 0; ringIdx < 3; ringIdx++) {
        const rp = Math.max(0, Math.min(1, (burstElapsed - ringIdx * 0.07) / 0.58));
        if (rp <= 0) continue;
        const ringR = 42 + rp * (w * 0.52);
        const col = ringIdx === 0
          ? `rgba(253, 224, 71, ${(1 - rp) * 0.95})`
          : (ringIdx === 1
            ? `rgba(192, 132, 252, ${(1 - rp) * 0.90})`
            : `rgba(56, 189, 248, ${(1 - rp) * 0.80})`);
        ctx.strokeStyle = col;
        ctx.lineWidth = 3.2 * (1 - rp * 0.6);
        ctx.beginPath();
        ctx.arc(cx, centerFocusY, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 360° 放射状金色与紫薇剑芒粒子
      const easeOut = 1 - Math.pow(1 - burstP, 2.5);
      for (let i = 0; i < this.burstParticles.length; i++) {
        const bp = this.burstParticles[i];
        const dist = 24 + easeOut * bp.speed;
        const px = cx + Math.cos(bp.angle) * dist;
        const py = centerFocusY + Math.sin(bp.angle) * dist;

        ctx.globalAlpha = burstAlpha * 0.98;
        if (bp.isRay) {
          const tailDist = Math.max(14, dist - bp.rayLen * (1 - burstP * 0.35));
          const tx = cx + Math.cos(bp.angle) * tailDist;
          const ty = centerFocusY + Math.sin(bp.angle) * tailDist;
          ctx.strokeStyle = i % 2 === 0 ? '#fde047' : '#c084fc';
          ctx.lineWidth = bp.size * 1.1;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(px, py);
          ctx.stroke();
        } else {
          ctx.fillStyle = i % 2 === 0 ? '#fde047' : '#c084fc';
          ctx.beginPath();
          ctx.arc(px, py, bp.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    ctx.restore();
  }
}

export const canvasRenderer = new CanvasRenderer();
export const packFlightVfxRenderer = new PackFlightVfxRenderer();


