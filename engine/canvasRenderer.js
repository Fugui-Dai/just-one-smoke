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
    sceneRenderer.render(ctx, w, h, sceneType || 'rainy_car', delta, this.time, vipTheme, emberIntensity);

    const p = fsm ? fsm.getProgress() : 1.0;
    const progress = (typeof p === 'number' && !isNaN(p)) ? p : 1.0;
    const ashRatio = fsm ? (typeof fsm.getAshRatio === 'function' ? fsm.getAshRatio() : ((fsm.getAshLength() || 0) / 260)) : 0;

    const curCig = currentCigarette || {};

    // ==========================================
    // 0.5 腾讯大师级 · 指节轻弹烟身物理阻尼微动效 (Elastic Damped Ash-Tap Kinematics)
    // 模拟食指轻弹滤嘴侧面的自然物理响应：侧向微移 + 极微小俯仰角度倾斜，呈现高质量弹簧正弦衰减
    // ==========================================
    let tapShakeX = 0;
    let tapShakeAngle = 0;
    if (typeof ashTapProgress === 'number' && ashTapProgress >= 0 && ashTapProgress < 1.0) {
      const tapT = ashTapProgress; // 0 ~ 1
      // 指节轻弹微振：衰减包络 e^(-5.5t) * sin(26t * PI)
      const dampEnv = Math.exp(-6.2 * tapT);
      const sineWave = Math.sin(tapT * Math.PI * 6.5);
      tapShakeX = 3.6 * dampEnv * sineWave;
      tapShakeAngle = 0.018 * dampEnv * sineWave; // ~1.0° 优雅微倾微振
    }

    // ==========================================
    const cx = w / 2;
    // 根据每款名烟真实行业毫米规格 (84mm/74mm/88mm/97mm/100mm/150mm) 动态映射高精度 Canvas 比例与滤嘴比例
    const cigDims = computeCigaretteDimensions(curCig, h);
    const maxCigH = cigDims.maxCigH;
    const cigW = cigDims.cigW;
    const topW = cigDims.topW;
    const filterRatio = cigDims.filterRatio;

    const cy = h * 0.65; // 烟嘴底部锚点
    const filterH = Math.round(maxCigH * filterRatio);
    const maxPaperH = maxCigH - filterH;
    const paperH = maxPaperH * progress;
    // 烟灰长度完全等于自上次抖灰以来的燃烧长度，真实保留不自动断落
    const curAsh = maxPaperH * Math.max(0, Math.min(1.0, ashRatio));
    const fireY = cy - paperH; // 燃烧端顶端Y坐标 (全局作用域安全可用)

    // 手卷旱烟底部锚点（烟嘴与烟身通体合一，从 fireY 一体延伸至 cy + filterH，绝无独立接缝烟嘴）
    const hanyanBottomY = cy + filterH;
    // 当前燃烧口宽度 (喇叭筒手卷旱烟沿通体一体锥度随燃烧下移平滑收窄，机制烟恒定 cigW)
    const curTopW = curCig.widthType === 'hand_rolled'
      ? (cigW + (topW - cigW) * ((hanyanBottomY - fireY) / Math.max(1, maxCigH)))
      : cigW;

    const filterBase = curCig.filterColor || '#991b1b';
    const paperBase = curCig.paperColor || '#fffdf5';
    const bandColor = curCig.bandColor || '#f59e0b';

    // 施加烟身整体受力微振动几何变换 (以滤嘴底部 cy + filterH 为旋转支点)
    ctx.save();
    if (tapShakeX !== 0 || tapShakeAngle !== 0) {
      const pivotY = cy + filterH;
      ctx.translate(cx, pivotY);
      ctx.rotate(tapShakeAngle);
      ctx.translate(-cx + tapShakeX, -pivotY);
    }

    // ==========================================
    // 2. 底部环境光遮蔽软阴影 (Soft Ambient Shadow - 完美复刻实机悬浮投影)
    // ==========================================
    ctx.save();
    const isHandRolled = curCig.widthType === 'hand_rolled';
    const shadowY = cy + filterH + (isHandRolled ? 10 : 18);
    const shadowR = isHandRolled ? cigW * 1.4 : cigW * 1.8;
    const shadowGrad = ctx.createRadialGradient(cx, shadowY, 3, cx, shadowY, shadowR);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    drawEllipse(ctx, cx, shadowY, isHandRolled ? cigW * 1.15 : cigW * 1.6, isHandRolled ? 6 : 9);
    ctx.fill();
    ctx.restore();

    // ==========================================
    // 3. 过滤嘴 / 古巴雪茄标 3D 圆柱体微距写实渐变渲染 (手卷旱烟通体一体无独立过滤嘴)
    // ==========================================
    const fGrad = ctx.createLinearGradient(cx - cigW / 2, 0, cx + cigW / 2, 0);
    fGrad.addColorStop(0, 'rgba(0, 0, 0, 0.40)');
    fGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.32)');
    fGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.06)');
    fGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');

    if (curCig.widthType !== 'hand_rolled') {
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

        // 顶端纯白接纸圈 (Tipping Paper White Collar - 1:1对标参考图实机细节)
        const collarH = 5.5;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(cx - cigW / 2, cy, cigW, collarH);
        const collarGrad = ctx.createLinearGradient(cx - cigW / 2, 0, cx + cigW / 2, 0);
        collarGrad.addColorStop(0, 'rgba(0, 0, 0, 0.28)');
        collarGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.7)');
        collarGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.15)');
        collarGrad.addColorStop(1, 'rgba(0, 0, 0, 0.32)');
        ctx.fillStyle = collarGrad;
        ctx.fillRect(cx - cigW / 2, cy, cigW, collarH);

        // 细致金/银色分隔线 (Accent Line)
        ctx.fillStyle = curCig.bandColor || 'rgba(217, 119, 6, 0.90)';
        ctx.fillRect(cx - cigW / 2, cy + collarH, cigW, 1.2);

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
    if (burntRatio > 0.01 && curCig.widthType !== 'hand_rolled') {
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
    if (curCig.widthType !== 'hand_rolled') {
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
      } else {
        // 4.2 已捏破：与“咔啪！”音效同步的拟真过程（一点点微晶原液四处分散流淌 -> 被海绵迅速吸住收干 -> 只留下淡淡印子 + 清晰的碎裂扁瘪残壳）
        if (this.beadFlowStartTime === null || this.beadFlowStartTime === undefined) {
          this.beadFlowStartTime = this.time;
        }
        const flowElapsed = Math.max(0, this.time - this.beadFlowStartTime);

        // ----------------------------------------------------
        // 阶段一 (0s ~ 0.16s)：指尖重捏瞬态脆裂爆开（壳体受力压扁、蛛网脆裂）
        // ----------------------------------------------------
        if (flowElapsed < 0.16) {
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

        // 横向极细微罗纹水印 (Laid Paper Fine Ribbing - 间距 4.2px, 1:1对标参考图真烟卷纸纹理)
        // 核心物理法则：以滤嘴接缝 cy 绝对世界坐标为固定基准向上渲染，绝不随燃烧向下位移（100% 绝对静止）
        if (!curCig.isCigar) {
          const ribStep = 4.2;
          for (let wy = cy - ribStep; wy >= cy - paperH; wy -= ribStep) {
            ctx.fillStyle = isDarkPaper ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.04)';
            ctx.fillRect(cx - cigW / 2, wy, cigW, 0.8);
            ctx.fillStyle = isDarkPaper ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.35)';
            ctx.fillRect(cx - cigW / 2, wy + 0.8, cigW, 0.6);
          }
        } else {
          // 雪茄烟叶天然斜纹叶脉 (以滤嘴接缝 cy 为静态基准向上渲染，世界坐标锁死)
          const cigarVeinStep = 14;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          for (let wy = cy - cigarVeinStep; wy >= cy - paperH; wy -= cigarVeinStep) {
            ctx.fillRect(cx - cigW / 2, wy, cigW, 1.2);
          }
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
        if (isAirCig) {
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
    const isLit = (curState !== 'UNLIT' && curState !== 'FINISHED');
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

      for (let L = startLayer; L <= endLayer; L++) {
        const curY = L * stepY;
        const layerSeed1 = ((L * 1337 + 17) % 1000) / 1000;
        const layerSeed2 = ((L * 2843 + 31) % 1000) / 1000;
        // 靠近顶部(ashTopY)完全归零阻尼，保证烟灰柱头部与烟身一样严格笔直正立
        const distFromTop = Math.max(0, curY - ashTopY);
        const topDamp = Math.min(1.0, Math.pow(distFromTop / 12.0, 1.5));
        const jitterAmp = isHandRolled ? 1.8 : 1.2;
        const leftJitter = (Math.sin(layerSeed1 * Math.PI * 2) * jitterAmp) * topDamp;
        const rightJitter = (Math.cos(layerSeed2 * Math.PI * 2) * jitterAmp) * topDamp;

        // 计算当前高度 Y 处烟身烧化前的物理基底宽度 (锥筒几何继承)
        let layerW;
        if (isHandRolled) {
          const coneRatio = Math.max(0, (hanyanBottomY - curY) / Math.max(1, maxCigH));
          const origW = cigW + (topW - cigW) * coneRatio;
          const fireDist = Math.max(0, fireY - curY);
          // 老辈旱烟散碎原叶天然蓬松：越远离火线越受热微发胀 (+6%)，而在火线处与 curTopW 严丝合缝
          const fluff = 1.0 + Math.min(0.06, fireDist / 35.0 * 0.06);
          layerW = Math.max(curTopW, origW * fluff);
        } else {
          layerW = cigW;
        }

        leftProfile.push({ x: cx - layerW / 2 + leftJitter, y: curY });
        rightProfile.push({ x: cx + layerW / 2 + rightJitter, y: curY });
      }

      // 绘制完整烟灰封闭多边形底座（顶部绝对平齐对称封顶，彻底保证正立笔挺）
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
      const maxAshW = isHandRolled ? Math.max(topW * 1.06, curTopW) : cigW;
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
      const flakesCount = isHandRolled ? 6 : 4;
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
        const curLayerW = (rightProfile[layerIdx] && leftProfile[layerIdx])
          ? (rightProfile[layerIdx].x - leftProfile[layerIdx].x)
          : (isHandRolled ? topW : cigW);
        const colW = curLayerW / flakesCount;
        const fw = colW * 0.95;
        for (let col = 0; col < flakesCount; col++) {
          const flakeSeed = ((L * 17 + col * 37 + 11) % 1000) / 1000;
          const fx = cx - curLayerW / 2 + (col + 0.5) * colW + (isTopZone ? 0 : (flakeSeed - 0.5) * (isHandRolled ? 2.8 : 2.0));
          const fy = curY + (isTopZone ? 0 : Math.sin(flakeSeed * Math.PI * 4) * 1.0);
          drawEllipse(ctx, fx, fy + 1.0, fw * 0.48, fh * 0.42);
        }
      }
      ctx.fill();

      // B. 第 2 批：按主色调分组批量填充灰白鳞片 (3~4 次 Draw Call)
      const colorGroups = isHandRolled
        ? ['#ffffff', '#e4e4e7', '#a1a1aa', '#78350f']
        : ['#ffffff', '#e4e4e7', '#a1a1aa'];
      for (let g = 0; g < colorGroups.length; g++) {
        const targetColor = colorGroups[g];
        ctx.fillStyle = targetColor;
        ctx.beginPath();
        for (let L = startLayer; L <= endLayer; L++) {
          const curY = L * stepY;
          const distToFire = fireY - curY;
          const isTopZone = (curY - ashTopY) < 6.0;
          const layerIdx = L - startLayer;
          const curLayerW = (rightProfile[layerIdx] && leftProfile[layerIdx])
            ? (rightProfile[layerIdx].x - leftProfile[layerIdx].x)
            : (isHandRolled ? topW : cigW);
          const colW = curLayerW / flakesCount;
          const fw = colW * 0.95;
          for (let col = 0; col < flakesCount; col++) {
            const flakeSeed = ((L * 17 + col * 37 + 11) % 1000) / 1000;
            let flakeColor;
            if (isHandRolled && flakeSeed < 0.16) {
              flakeColor = '#78350f';
            } else if (distToFire < 7) {
              flakeColor = (col === 1 || (isHandRolled && col === 2)) ? '#e4e4e7' : '#a1a1aa';
            } else if (col === 1 || (isHandRolled && col === 2)) {
              flakeColor = '#ffffff';
            } else if (col === 0 || col === flakesCount - 2) {
              flakeColor = '#e4e4e7';
            } else {
              flakeColor = '#a1a1aa';
            }
            if (flakeColor !== targetColor) continue;
            const fx = cx - curLayerW / 2 + (col + 0.5) * colW + (isTopZone ? 0 : (flakeSeed - 0.5) * (isHandRolled ? 2.8 : 2.0));
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
        const curLayerW = (rightProfile[layerIdx] && leftProfile[layerIdx])
          ? (rightProfile[layerIdx].x - leftProfile[layerIdx].x)
          : (isHandRolled ? topW : cigW);
        const colW = curLayerW / flakesCount;
        const rimR = colW * 0.95 * 0.36;
        for (let col = 0; col < flakesCount; col++) {
          const flakeSeed = ((L * 17 + col * 37 + 11) % 1000) / 1000;
          const fx = cx - curLayerW / 2 + (col + 0.5) * colW + (isTopZone ? 0 : (flakeSeed - 0.5) * (isHandRolled ? 2.8 : 2.0));
          const fy = curY + (isTopZone ? 0 : Math.sin(flakeSeed * Math.PI * 4) * 1.0) - 0.5;
          ctx.moveTo(fx + cosRimStart * rimR, fy + sinRimStart * rimR);
          ctx.arc(fx, fy, rimR, Math.PI * 1.1, Math.PI * 1.9);
        }
      }
      ctx.stroke();

      // -------------------------------------------------------------
      // 3. 顶端绝对水平端面与正立微弧透视火山口 (Orthogonal Upright Top Cap)
      // -------------------------------------------------------------
      const topAshW = (rightProfile[0] && leftProfile[0])
        ? (rightProfile[0].x - leftProfile[0].x)
        : (isHandRolled ? topW : cigW);
      const capH = Math.min(3.6, topAshW * 0.085);

      // 顶端微弧端面基底 (严格贴合顶部端面宽度 topAshW)
      const capGrad = ctx.createLinearGradient(cx - topAshW / 2, 0, cx + topAshW / 2, 0);
      capGrad.addColorStop(0, '#52525b');
      capGrad.addColorStop(0.20, '#f4f4f5');
      capGrad.addColorStop(0.50, '#d4d4d8');
      capGrad.addColorStop(0.80, '#a1a1aa');
      capGrad.addColorStop(1.0, '#3f3f46');
      ctx.fillStyle = capGrad;
      ctx.beginPath();
      drawEllipse(ctx, cx, ashTopY, topAshW * 0.50, capH);
      ctx.fill();

      // 顶面正中央微凹炭核与白灰边缘，正立中轴对称
      ctx.fillStyle = 'rgba(24, 24, 27, 0.75)';
      ctx.beginPath();
      drawEllipse(ctx, cx, ashTopY - 0.3, topAshW * 0.28, capH * 0.65);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      drawEllipse(ctx, cx, ashTopY - 0.4, topAshW * 0.42, capH * 0.85);
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

      // 1. 锯齿炭化焦黑破损边缘 (Scalloped Charred Black Rim - 参考图焦黑不规则撕纸边)
      ctx.save();
      ctx.beginPath();
      const activeRimW = curTopW;
      const rimSteps = 12;
      const stepW = activeRimW / rimSteps;
      const leftX = cx - activeRimW / 2;
      const rimOffsets = [0, 1.8, -0.6, 2.4, 0.8, -1.2, 1.5, 2.8, 0.4, -0.8, 1.9, 0.5, 0];
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

      // 2. 燃烧端与火星表现 (Burning Ember / Cherry)
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
        const bloomR = (curTopW * 0.95) * glowFactor;
        const bloomGrad = ctx.createRadialGradient(cx, fireY, 2, cx, fireY, bloomR);
        const coreAlpha = 0.65 + 0.27 * heat;
        const midAlpha = 0.38 + 0.27 * heat;
        bloomGrad.addColorStop(0, `rgba(255, ${Math.round(65 + 65 * heat)}, 0, ${coreAlpha.toFixed(2)})`);
        bloomGrad.addColorStop(0.35, `rgba(${Math.round(239 + 10 * heat)}, ${Math.round(68 + 47 * heat)}, ${Math.round(68 - 46 * heat)}, ${midAlpha.toFixed(2)})`);
        bloomGrad.addColorStop(0.75, 'rgba(220, 38, 38, 0.12)');
        bloomGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bloomGrad;
        ctx.beginPath();
        ctx.arc(cx, fireY, bloomR, 0, Math.PI * 2);
        ctx.fill();

        // 3. 内部通红炽热火星隙斑 (Crust Ember Hotspots - 热惯性平滑衰减)
        const spotScale = curTopW / 28;
        const hotspots = [
          { ox: -4.5 * spotScale, oy: 0.5, r: 3.2 * spotScale },
          { ox: 0.0, oy: -1.0, r: 4.2 * spotScale },
          { ox: 4.8 * spotScale, oy: 0.8, r: 3.0 * spotScale },
          { ox: -1.8 * spotScale, oy: 2.2, r: 2.6 * spotScale },
          { ox: 3.2 * spotScale, oy: 2.0, r: 2.4 * spotScale }
        ];

        for (const spot of hotspots) {
          const sx = cx + spot.ox;
          const sy = fireY + spot.oy;
          const sr = spot.r * ((0.9 + 0.15 * Math.sin(time * 0.009 + spot.ox)) + 0.45 * heat);

          const spotGrad = ctx.createRadialGradient(sx, sy, 0.5, sx, sy, sr);
          spotGrad.addColorStop(0, '#ffffff'); // 极白炽心
          spotGrad.addColorStop(0.25, heat > 0.3 ? '#ffffff' : '#fef08a'); // 亮金至极白
          spotGrad.addColorStop(0.65, '#ea580c'); // 橙红
          spotGrad.addColorStop(1.0, 'rgba(220, 38, 38, 0.1)'); // 边缘暗红
          ctx.fillStyle = spotGrad;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 纸身向下受热微光散射 (随热惯性平滑暗淡)
      const downLight = ctx.createLinearGradient(0, fireY, 0, fireY + 18);
      const downAlpha = 0.22 + 0.28 * heat;
      downLight.addColorStop(0, `rgba(255, 69, 0, ${downAlpha.toFixed(2)})`);
      downLight.addColorStop(1, 'rgba(255, 69, 0, 0)');
      ctx.fillStyle = downLight;
      ctx.fillRect(cx - curTopW / 2, fireY, curTopW, 18);

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
      this.renderIgnitionFlame(ctx, cx, fireY, ignitionTool, time, cigW);
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

  // 绘制 5 种不同点火工具的真实火焰粒子与光影
  renderIgnitionFlame(ctx, cx, fireY, tool, time, cigW) {
    ctx.save();
    const flameType = tool.flameType || 'yellow';
    const flicker = Math.sin(time * 0.035) * 3;

    if (flameType === 'match') {
      // 1. 复古红头木质火柴：倾斜木棒 + 磷红火头 + 松木橙焰
      ctx.save();
      ctx.translate(cx - 28, fireY + 22);
      ctx.rotate(-0.35);
      ctx.fillStyle = '#d4a373';
      ctx.fillRect(-2, 0, 4, 38);
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const mx = cx - 16;
      const my = fireY + 6;
      const rGrad = ctx.createRadialGradient(mx, my, 2, mx, my, 28);
      rGrad.addColorStop(0, '#ffffff');
      rGrad.addColorStop(0.25, '#fef08a');
      rGrad.addColorStop(0.6, '#f97316');
      rGrad.addColorStop(0.9, 'rgba(239, 68, 68, 0.4)');
      rGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = rGrad;
      ctx.beginPath();
      ctx.arc(mx, my, 28, 0, Math.PI * 2);
      ctx.fill();

      // 水滴形火舌
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(mx - 7, my + 8);
      ctx.quadraticCurveTo(mx - 10, my - 6, mx + flicker, my - 22);
      ctx.quadraticCurveTo(mx + 10, my - 6, mx + 7, my + 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      drawEllipse(ctx, mx + flicker * 0.3, my - 3, 3, 7);
      ctx.fill();
    } else if (flameType === 'blue_torch') {
      // 2. 雪茄三喷高温防风蓝焰：强劲幽蓝风暴等离子光锥
      const tx = cx;
      const ty = fireY + 12;

      const bGrad = ctx.createRadialGradient(tx, ty, 3, tx, ty, 42);
      bGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      bGrad.addColorStop(0.2, 'rgba(6, 182, 212, 0.85)');
      bGrad.addColorStop(0.55, 'rgba(37, 99, 235, 0.55)');
      bGrad.addColorStop(1, 'rgba(30, 58, 138, 0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(tx, ty, 42, 0, Math.PI * 2);
      ctx.fill();

      const cones = [-8, 0, 8];
      cones.forEach((offsetX) => {
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(tx + offsetX - 3, ty + 24);
        ctx.lineTo(tx + offsetX + flicker * 0.2, fireY - 4);
        ctx.lineTo(tx + offsetX + 3, ty + 24);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(tx + offsetX - 1.5, ty + 20);
        ctx.lineTo(tx + offsetX, fireY);
        ctx.lineTo(tx + offsetX + 1.5, ty + 20);
        ctx.closePath();
        ctx.fill();
      });
    } else if (flameType === 'car_coil') {
      // 3. 车载螺旋电热丝点烟器：同心圆炽红发热电阻丝烙烫
      const coilY = fireY + 10;
      const cGrad = ctx.createRadialGradient(cx, coilY, 2, cx, coilY, 36);
      cGrad.addColorStop(0, '#fffbeb');
      cGrad.addColorStop(0.3, '#f97316');
      cGrad.addColorStop(0.7, 'rgba(220, 38, 38, 0.45)');
      cGrad.addColorStop(1, 'rgba(153, 27, 27, 0)');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(cx, coilY, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let r = 2; r < 14; r += 2.5) {
        ctx.arc(cx, coilY, r, 0, Math.PI * 2);
      }
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 3 + flicker, fireY - 1, 6, 4);
    } else {
      // 4. 经典砂轮 / Zippo 温暖金色跳跃油火
      const fx = cx + flicker * 0.4;
      const fy = fireY + 4;

      const yGrad = ctx.createRadialGradient(fx, fy, 2, fx, fy, 32);
      yGrad.addColorStop(0, '#ffffff');
      yGrad.addColorStop(0.25, '#fef08a');
      yGrad.addColorStop(0.65, '#f59e0b');
      yGrad.addColorStop(0.88, 'rgba(239, 68, 68, 0.35)');
      yGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = yGrad;
      ctx.beginPath();
      ctx.arc(fx, fy, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(fx - 8, fy + 10);
      ctx.quadraticCurveTo(fx - 12, fy - 8, fx + flicker * 0.8, fy - 26);
      ctx.quadraticCurveTo(fx + 12, fy - 8, fx + 8, fy + 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      drawEllipse(ctx, fx, fy - 4, 3.5, 9);
      ctx.fill();
    }

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
    this.burstTriggered = false;
    this.initParticles();
  }

  initParticles() {
    this.stardust = [];
    for (let i = 0; i < 210; i++) {
      this.stardust.push({
        u: Math.random(),
        normalSpread: (Math.random() - 0.5) * 2.2,
        size: 1.1 + Math.random() * 3.0,
        twinkleSpeed: 6 + Math.random() * 12,
        phase: Math.random() * Math.PI * 2,
        colorType: i % 4 === 0 ? 'gold' : (i % 4 === 1 ? 'cyan' : (i % 4 === 2 ? 'magenta' : 'amber')),
        isStar: i % 5 === 0
      });
    }

    this.speedLines = [];
    for (let i = 0; i < 44; i++) {
      this.speedLines.push({
        offsetX: (Math.random() - 0.5) * 140,
        len: 65 + Math.random() * 150,
        speed: 1.5 + Math.random() * 2.0,
        phase: Math.random(),
        width: 1.4 + Math.random() * 2.6,
        color: i % 3 === 0 ? '#fde047' : (i % 3 === 1 ? '#38bdf8' : '#f472b6')
      });
    }

    this.burstParticles = [];
    for (let i = 0; i < 156; i++) {
      const angle = (i / 156) * Math.PI * 2 + (Math.random() - 0.5) * 0.05;
      const speed = 110 + Math.random() * 320;
      this.burstParticles.push({
        angle,
        speed,
        size: 1.6 + Math.random() * 3.8,
        rayLen: 42 + Math.random() * 125,
        color: i % 3 === 0 ? '#fde047' : (i % 3 === 1 ? '#38bdf8' : (i % 6 === 0 ? '#f472b6' : '#ffffff')),
        isRay: i % 2 === 0
      });
    }

    // 常驻环绕阶段的剑意流萤与尊享金莲星火
    this.ambientSparks = [];
    for (let i = 0; i < 54; i++) {
      this.ambientSparks.push({
        angle: Math.random() * Math.PI * 2,
        radiusRatio: 0.14 + Math.random() * 0.32,
        speedY: 20 + Math.random() * 36,
        orbitSpeed: (0.7 + Math.random() * 1.4) * (i % 2 === 0 ? 1 : -1),
        size: 1.3 + Math.random() * 2.8,
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
   * 采样抽取特效运动轨迹 (支持 vfx1 经典出鞘 360° / vfx2 九天游龙 720°)
   */
  sampleSCurve(u, w, h, slotOffsetX = 0, vfxType = 'vfx2') {
    const cx = w * 0.5;
    const cy = h * 0.45;
    const t = Math.max(0, Math.min(1, u));

    // 特效 1: 经典宝刀出鞘 360° 单周掠空大回环
    if (vfxType === 'vfx1') {
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
      return { x, y, tx: dx / len, ty: dy / len, nx: -dy / len, ny: dx / len };
    }

    // 特效 2: 九天游龙 720° 全屏莫比乌斯大回环
    let p0, p1, p2, p3, localT;
    if (t < 0.28) {
      localT = t / 0.28;
      p0 = { x: cx + slotOffsetX, y: cy + h * 0.09 };
      p1 = { x: cx - w * 0.18, y: cy - h * 0.34 };
      p2 = { x: cx + w * 0.26, y: cy - h * 0.32 };
      p3 = { x: cx + w * 0.33, y: cy - h * 0.14 };
    } else if (t < 0.62) {
      localT = (t - 0.28) / 0.34;
      p0 = { x: cx + w * 0.33, y: cy - h * 0.14 };
      p1 = { x: cx + w * 0.40, y: cy + h * 0.04 };
      p2 = { x: cx - w * 0.42, y: cy - h * 0.02 };
      p3 = { x: cx - w * 0.32, y: cy + h * 0.15 };
    } else if (t < 0.86) {
      localT = (t - 0.62) / 0.24;
      p0 = { x: cx - w * 0.32, y: cy + h * 0.15 };
      p1 = { x: cx - w * 0.18, y: cy + h * 0.28 };
      p2 = { x: cx + w * 0.36, y: cy + h * 0.20 };
      p3 = { x: cx + w * 0.20, y: cy - h * 0.02 };
    } else {
      localT = (t - 0.86) / 0.14;
      p0 = { x: cx + w * 0.20, y: cy - h * 0.02 };
      p1 = { x: cx + w * 0.08, y: cy - h * 0.12 };
      p2 = { x: cx - w * 0.04, y: cy - h * 0.04 };
      p3 = { x: cx, y: h * 0.43 };
    }

    const mt = 1 - localT;
    const x = mt * mt * mt * p0.x + 3 * mt * mt * localT * p1.x + 3 * mt * localT * localT * p2.x + localT * localT * localT * p3.x;
    const y = mt * mt * mt * p0.y + 3 * mt * mt * localT * p1.y + 3 * mt * localT * localT * p2.y + localT * localT * localT * p3.y;

    const dx = 3 * mt * mt * (p1.x - p0.x) + 6 * mt * localT * (p2.x - p1.x) + 3 * localT * localT * (p3.x - p2.x);
    const dy = 3 * mt * mt * (p1.y - p0.y) + 6 * mt * localT * (p2.y - p1.y) + 3 * localT * localT * (p3.y - p2.y);
    const len = Math.hypot(dx, dy) || 1;

    return {
      x,
      y,
      tx: dx / len,
      ty: dy / len,
      nx: -dy / len,
      ny: dx / len
    };
  }

  render(ctx, w, h, elapsedSec, options = {}) {
    if (!ctx || !w || !h) return;
    const cx = w * 0.5;
    const cy = h * 0.45;
    const slotOffsetX = options.slotOffsetX || 0;
    const vfxType = options.vfxType || 'vfx2';

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // =========================================================================
    // 第一幕 [0.00s ~ 0.46s 寒芒裂匣·破鞘十字斩]: 烟盒仓口爆发横贯全屏的冷冽破鞘十字刀光
    // =========================================================================
    if (elapsedSec < 0.48) {
      const slashP = Math.min(1, elapsedSec / 0.44);
      const slashAlpha = Math.sin(slashP * Math.PI);
      const sheathX = cx + slotOffsetX * 0.5;
      const sheathY = h * 0.42;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 1) 烟盒仓口三层高能剑鸣震波环
      for (let rIdx = 0; rIdx < 3; rIdx++) {
        const subP = Math.max(0, Math.min(1, (elapsedSec - rIdx * 0.05) / 0.36));
        if (subP <= 0) continue;
        const rx = 54 + subP * (w * 0.46);
        const ry = rx * 0.30;
        const a = (1 - subP) * 0.92;
        ctx.strokeStyle = rIdx === 0
          ? `rgba(253, 224, 71, ${a})`
          : (rIdx === 1 ? `rgba(56, 189, 248, ${a * 0.9})` : `rgba(244, 114, 182, ${a * 0.8})`);
        ctx.lineWidth = 3.2 * (1 - subP * 0.5);
        ctx.beginPath();
        drawEllipse(ctx, sheathX, sheathY + 18, rx, ry);
        ctx.stroke();
      }

      // 2) 破鞘双十字寒芒斩 (横跨全屏的锐利白金+电光青剑光)
      const angles = [-0.20, 0.24];
      for (let aIdx = 0; aIdx < angles.length; aIdx++) {
        ctx.save();
        ctx.translate(sheathX, sheathY);
        ctx.rotate(angles[aIdx]);
        const bladeSpan = w * ((aIdx === 0 ? 0.42 : 0.28) + slashP * 0.62);
        const bladeThick = (1 - slashP * 0.65) * (aIdx === 0 ? 15 : 9);
        const slashGrad = ctx.createLinearGradient(-bladeSpan, 0, bladeSpan, 0);
        slashGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        slashGrad.addColorStop(0.22, `rgba(56, 189, 248, ${slashAlpha * 0.88})`);
        slashGrad.addColorStop(0.44, `rgba(253, 224, 71, ${slashAlpha * 0.96})`);
        slashGrad.addColorStop(0.50, `rgba(255, 255, 255, ${slashAlpha})`);
        slashGrad.addColorStop(0.56, `rgba(253, 224, 71, ${slashAlpha * 0.96})`);
        slashGrad.addColorStop(0.78, `rgba(244, 114, 182, ${slashAlpha * 0.85})`);
        slashGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');

        ctx.fillStyle = slashGrad;
        ctx.beginPath();
        ctx.moveTo(-bladeSpan, 0);
        ctx.quadraticCurveTo(0, -bladeThick, bladeSpan, 0);
        ctx.quadraticCurveTo(0, bladeThick, -bladeSpan, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    // =========================================================================
    // 第二幕 [0.12s ~ 0.72s 拔剑冲霄]: 垂直破空剑气光柱与金青霓虹高速破风流线
    // =========================================================================
    if (elapsedSec >= 0.12 && elapsedSec < 0.72) {
      const ascendP = Math.min(1, (elapsedSec - 0.12) / 0.54);
      const ascendAlpha = Math.sin(ascendP * Math.PI);
      const beamX = cx + slotOffsetX * (1 - ascendP);
      const headY = h * 0.44 - ascendP * (h * 0.34);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const pillarGrad = ctx.createLinearGradient(beamX, headY, beamX, h * 0.76);
      pillarGrad.addColorStop(0, `rgba(255, 255, 255, ${ascendAlpha * 0.96})`);
      pillarGrad.addColorStop(0.28, `rgba(253, 224, 71, ${ascendAlpha * 0.90})`);
      pillarGrad.addColorStop(0.62, `rgba(56, 189, 248, ${ascendAlpha * 0.55})`);
      pillarGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = pillarGrad;
      ctx.fillRect(beamX - 26, headY, 52, h * 0.76 - headY);

      for (let i = 0; i < this.speedLines.length; i++) {
        const sl = this.speedLines[i];
        const lx = beamX + sl.offsetX;
        const travel = ((elapsedSec * sl.speed * 620 + sl.phase * 340) % 400);
        const ly = h * 0.74 - travel;
        if (ly < headY - 24) continue;

        const lGrad = ctx.createLinearGradient(lx, ly - sl.len, lx, ly);
        lGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        lGrad.addColorStop(0.5, sl.color);
        lGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = lGrad;
        ctx.lineWidth = sl.width;
        ctx.globalAlpha = ascendAlpha * 0.92;
        ctx.beginPath();
        ctx.moveTo(lx, ly - sl.len);
        ctx.lineTo(lx, ly);
        ctx.stroke();
      }
      ctx.restore();
    }

    // =========================================================================
    // 第三幕 [0.22s ~ 2.15s 九天游龙·720°全屏莫比乌斯星河大回环轨迹]:
    // 跟随名烟 720° 双周挽剑花大回环，拉出宽幅星河光瀑、刀锋残影切片、四股龙鳞丝带与彗星光首
    // =========================================================================
    if (elapsedSec >= 0.22 && elapsedSec < 2.25) {
      const curveHeadU = Math.min(1.0, (elapsedSec - 0.22) / 1.16);
      const ribbonFade = elapsedSec > 1.38 ? Math.max(0, 1 - (elapsedSec - 1.38) / 0.82) : 1.0;
      const steps = Math.max(10, Math.floor(curveHeadU * 110));

      if (ribbonFade > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const pts = [];
        const tailStartU = Math.max(0, curveHeadU - 0.68);
        for (let i = 0; i <= steps; i++) {
          const u = (i / 110);
          if (u < tailStartU || u > curveHeadU) continue;
          pts.push({
            u,
            ...this.sampleSCurve(u, w, h, slotOffsetX, vfxType)
          });
        }

        if (pts.length > 2) {
          // 1) 宽幅星河刀锋能量光瀑 (Wide Celestial Blade Wake)
          for (let i = 1; i < pts.length; i++) {
            const pPrev = pts[i - 1];
            const pCur = pts[i];
            const prog = i / pts.length;
            const slashWidth = (8 + Math.sin(prog * Math.PI) * 42) * prog;
            ctx.strokeStyle = i % 3 === 0
              ? `rgba(251, 191, 36, ${0.38 * prog * ribbonFade})`
              : (i % 3 === 1
                ? `rgba(56, 189, 248, ${0.34 * prog * ribbonFade})`
                : `rgba(244, 114, 182, ${0.28 * prog * ribbonFade})`);
            ctx.lineWidth = slashWidth;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(pPrev.x, pPrev.y);
            ctx.lineTo(pCur.x, pCur.y);
            ctx.stroke();
          }

          // 2) 御剑飞仙刀锋残影切片 (Afterimage Blade Echoes along Trajectory)
          for (let i = 4; i < pts.length; i += 7) {
            const pt = pts[i];
            const prog = i / pts.length;
            const bladeLen = (18 + prog * 38) * Math.sin(prog * Math.PI);
            ctx.strokeStyle = i % 2 === 0
              ? `rgba(254, 240, 138, ${0.52 * prog * ribbonFade})`
              : `rgba(125, 211, 252, ${0.48 * prog * ribbonFade})`;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(pt.x - pt.nx * bladeLen, pt.y - pt.ny * bladeLen);
            ctx.lineTo(pt.x + pt.nx * bladeLen, pt.y + pt.ny * bladeLen);
            ctx.stroke();
          }

          // 3) 四股交织九天游龙螺旋丝带 (Four-Strand Braided Dragon Ribbons)
          const strands = [
            { color: '#fde047', alpha: 0.98, amp: 15.0, freq: 20, phase: 0, widthMul: 1.45 },
            { color: '#38bdf8', alpha: 0.92, amp: 17.0, freq: 16, phase: 2.1, widthMul: 1.20 },
            { color: '#f472b6', alpha: 0.85, amp: 11.5, freq: 22, phase: 4.2, widthMul: 1.00 },
            { color: '#ffffff', alpha: 0.98, amp: 3.0, freq: 14, phase: 1.0, widthMul: 0.82 }
          ];

          for (let sIdx = 0; sIdx < strands.length; sIdx++) {
            const st = strands[sIdx];
            for (let i = 1; i < pts.length; i++) {
              const p0 = pts[i - 1];
              const p1 = pts[i];
              const prog = i / pts.length;
              const taper = Math.sin(prog * Math.PI * 0.88) * (0.38 + 0.88 * prog);

              const wave0 = Math.sin(p0.u * st.freq - elapsedSec * 14 + st.phase) * st.amp * taper;
              const wave1 = Math.sin(p1.u * st.freq - elapsedSec * 14 + st.phase) * st.amp * taper;

              ctx.strokeStyle = st.color;
              ctx.globalAlpha = st.alpha * prog * ribbonFade;
              ctx.lineWidth = Math.max(1.5, 5.8 * taper * st.widthMul);
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(p0.x + p0.nx * wave0, p0.y + p0.ny * wave0);
              ctx.lineTo(p1.x + p1.nx * wave1, p1.y + p1.ny * wave1);
              ctx.stroke();
            }
          }

          // 4) 轨迹前端高能彗星光首 (Leading Comet Nova Head)
          if (curveHeadU < 0.99) {
            const headPt = pts[pts.length - 1];
            ctx.globalAlpha = ribbonFade;
            const headGrad = ctx.createRadialGradient(headPt.x, headPt.y, 2, headPt.x, headPt.y, 46);
            headGrad.addColorStop(0, '#ffffff');
            headGrad.addColorStop(0.28, '#fde047');
            headGrad.addColorStop(0.62, 'rgba(56, 189, 248, 0.65)');
            headGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = headGrad;
            ctx.beginPath();
            ctx.arc(headPt.x, headPt.y, 46, 0, Math.PI * 2);
            ctx.fill();

            // 彗星十字锐利星芒
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(headPt.x - 28, headPt.y);
            ctx.lineTo(headPt.x + 28, headPt.y);
            ctx.moveTo(headPt.x, headPt.y - 28);
            ctx.lineTo(headPt.x, headPt.y + 28);
            ctx.stroke();
          }

          // 5) 刀锋轨迹迸射的金鳞剑芒星尘
          for (let i = 0; i < this.stardust.length; i++) {
            const sd = this.stardust[i];
            if (sd.u > curveHeadU) continue;
            const sample = this.sampleSCurve(sd.u, w, h, slotOffsetX, vfxType);
            const spreadDist = sd.normalSpread * (16 + sd.u * 42);
            const drift = Math.sin(elapsedSec * 3.6 + sd.phase) * 6;
            const sx = sample.x + sample.nx * (spreadDist + drift);
            const sy = sample.y + sample.ny * (spreadDist + drift);

            const twinkle = 0.38 + 0.62 * Math.abs(Math.sin(elapsedSec * sd.twinkleSpeed + sd.phase));
            ctx.globalAlpha = twinkle * ribbonFade;
            ctx.fillStyle = sd.colorType === 'gold'
              ? '#fde047'
              : (sd.colorType === 'cyan' ? '#38bdf8' : (sd.colorType === 'magenta' ? '#f472b6' : '#fdba74'));

            ctx.beginPath();
            ctx.arc(sx, sy, sd.size, 0, Math.PI * 2);
            ctx.fill();

            if (sd.isStar && twinkle > 0.66) {
              const r = sd.size * 3.2;
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.1;
              ctx.beginPath();
              ctx.moveTo(sx - r, sy);
              ctx.lineTo(sx + r, sy);
              ctx.moveTo(sx, sy - r);
              ctx.lineTo(sx, sy + r);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }
    }

    // =========================================================================
    // 第四幕 [1.18s ~ 常驻交互态 三龙盘柱·3D螺旋剑气环绕法阵]:
    // 名烟归宗定格后，帝王金、太虚青、紫薇霓虹三股神龙沿烟支轴线持续 3D 螺旋环绕
    // =========================================================================
    if (elapsedSec >= 1.18) {
      const auraFadeIn = Math.min(1, (elapsedSec - 1.18) / 0.36);
      const centerFocusY = h * 0.43;
      const tiltRad = 22 * Math.PI / 180; // 与定格烟支 22° 黄金倾角严丝合缝对齐
      const cosT = Math.cos(tiltRad);
      const sinT = Math.sin(tiltRad);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 1) 居中柔和帝王金+太虚青背光神环 (衬托完整烟支，绝不染色烟头)
      const pulseR = 128 + Math.sin(elapsedSec * 3.5) * 14;
      const auraGrad = ctx.createRadialGradient(cx, centerFocusY, 10, cx, centerFocusY, pulseR);
      auraGrad.addColorStop(0, `rgba(253, 224, 71, ${0.32 * auraFadeIn})`);
      auraGrad.addColorStop(0.45, `rgba(56, 189, 248, ${0.22 * auraFadeIn})`);
      auraGrad.addColorStop(0.75, `rgba(244, 114, 182, ${0.12 * auraFadeIn})`);
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, centerFocusY, pulseR, 0, Math.PI * 2);
      ctx.fill();

      // 2) 三龙盘柱 3D 螺旋环绕光带 (3D Triple-Helix Coiling Dragon Ribbons)
      const dragonConfigs = [
        { phaseOffset: 0, mainColor: '#fde047', glowColor: 'rgba(245, 158, 11, ', headColor: '#ffffff' },
        { phaseOffset: (Math.PI * 2) / 3, mainColor: '#38bdf8', glowColor: 'rgba(56, 189, 248, ', headColor: '#e0f2fe' },
        { phaseOffset: (Math.PI * 4) / 3, mainColor: '#f472b6', glowColor: 'rgba(244, 114, 182, ', headColor: '#fce7f3' }
      ];

      const helixHalfH = Math.min(148, h * 0.185);
      const helixRadiusX = Math.min(78, w * 0.20);
      const segCount = 48;

      for (let dIdx = 0; dIdx < dragonConfigs.length; dIdx++) {
        const dc = dragonConfigs[dIdx];
        let headPt = null;

        for (let s = 1; s <= segCount; s++) {
          const u0 = (s - 1) / segCount;
          const u1 = s / segCount;

          const axisY0 = (0.5 - u0) * 2 * helixHalfH;
          const axisY1 = (0.5 - u1) * 2 * helixHalfH;

          const theta0 = u0 * Math.PI * 3.8 - elapsedSec * 4.6 + dc.phaseOffset;
          const theta1 = u1 * Math.PI * 3.8 - elapsedSec * 4.6 + dc.phaseOffset;

          const env0 = Math.sin(u0 * Math.PI);
          const env1 = Math.sin(u1 * Math.PI);

          const perpX0 = Math.sin(theta0) * helixRadiusX * (0.45 + 0.55 * env0);
          const perpX1 = Math.sin(theta1) * helixRadiusX * (0.45 + 0.55 * env1);
          const depthZ0 = Math.cos(theta0);
          const depthZ1 = Math.cos(theta1);

          const sx0 = cx + perpX0 * cosT - axisY0 * sinT;
          const sy0 = centerFocusY + perpX0 * sinT + axisY0 * cosT;
          const sx1 = cx + perpX1 * cosT - axisY1 * sinT;
          const sy1 = centerFocusY + perpX1 * sinT + axisY1 * cosT;

          const depthFactor = 0.55 + 0.45 * ((depthZ0 + depthZ1) * 0.5);
          const alpha = env1 * depthFactor * auraFadeIn;

          ctx.strokeStyle = `${dc.glowColor}${alpha * 0.48})`;
          ctx.lineWidth = (3.8 + 9.0 * env1) * depthFactor;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(sx0, sy0);
          ctx.lineTo(sx1, sy1);
          ctx.stroke();

          ctx.strokeStyle = dc.mainColor;
          ctx.globalAlpha = alpha * 0.96;
          ctx.lineWidth = (1.4 + 3.4 * env1) * depthFactor;
          ctx.beginPath();
          ctx.moveTo(sx0, sy0);
          ctx.lineTo(sx1, sy1);
          ctx.stroke();

          if (s === Math.floor(segCount * 0.80)) {
            headPt = { x: sx1, y: sy1, r: 5.8 * depthFactor };
          }
        }

        if (headPt) {
          ctx.globalAlpha = auraFadeIn;
          const orbGrad = ctx.createRadialGradient(headPt.x, headPt.y, 0.5, headPt.x, headPt.y, headPt.r * 3.4);
          orbGrad.addColorStop(0, '#ffffff');
          orbGrad.addColorStop(0.35, dc.mainColor);
          orbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = orbGrad;
          ctx.beginPath();
          ctx.arc(headPt.x, headPt.y, headPt.r * 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3) 环绕烟支四周升腾的剑意流萤星火
      for (let i = 0; i < this.ambientSparks.length; i++) {
        const sp = this.ambientSparks[i];
        const curAngle = sp.angle + elapsedSec * sp.orbitSpeed;
        const r = w * sp.radiusRatio;
        const verticalCycle = ((elapsedSec * sp.speedY + i * 17) % 250) - 125;
        const px = cx + Math.cos(curAngle) * r;
        const py = centerFocusY - verticalCycle + Math.sin(curAngle) * (r * 0.35);

        const blink = 0.32 + 0.68 * Math.abs(Math.sin(elapsedSec * 4.8 + sp.phase));
        ctx.globalAlpha = blink * auraFadeIn * (1 - Math.abs(verticalCycle) / 135);
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(px, py, sp.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // =========================================================================
    // 第五幕 [1.32s ~ 2.15s 神兵归宗·定格瞬间万剑星芒超新星大爆发]
    // =========================================================================
    if (elapsedSec >= 1.32 && elapsedSec < 2.18) {
      const burstElapsed = elapsedSec - 1.32;
      const burstP = Math.min(1, burstElapsed / 0.78);
      const burstAlpha = Math.max(0, 1 - Math.pow(burstP, 1.72));
      const centerFocusY = h * 0.43;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 1) 归宗超新星闪光核
      const coreR = 60 + burstP * (w * 0.56);
      const coreGrad = ctx.createRadialGradient(cx, centerFocusY, 4, cx, centerFocusY, coreR);
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${burstAlpha * 0.95})`);
      coreGrad.addColorStop(0.26, `rgba(253, 224, 71, ${burstAlpha * 0.78})`);
      coreGrad.addColorStop(0.58, `rgba(56, 189, 248, ${burstAlpha * 0.50})`);
      coreGrad.addColorStop(0.82, `rgba(244, 114, 182, ${burstAlpha * 0.28})`);
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, centerFocusY, coreR, 0, Math.PI * 2);
      ctx.fill();

      // 2) 三层剑气冲击波光环
      for (let ringIdx = 0; ringIdx < 3; ringIdx++) {
        const rp = Math.max(0, Math.min(1, (burstElapsed - ringIdx * 0.06) / 0.58));
        if (rp <= 0) continue;
        const ringR = 42 + rp * (w * 0.50);
        ctx.strokeStyle = ringIdx === 0
          ? `rgba(253, 224, 71, ${(1 - rp) * 0.94})`
          : (ringIdx === 1 ? `rgba(56, 189, 248, ${(1 - rp) * 0.86})` : `rgba(244, 114, 182, ${(1 - rp) * 0.78})`);
        ctx.lineWidth = 3.2 * (1 - rp * 0.6);
        ctx.beginPath();
        ctx.arc(cx, centerFocusY, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3) 360° 放射状鎏金剑芒粒子束
      const easeOut = 1 - Math.pow(1 - burstP, 2.5);
      for (let i = 0; i < this.burstParticles.length; i++) {
        const bp = this.burstParticles[i];
        const dist = 24 + easeOut * bp.speed;
        const px = cx + Math.cos(bp.angle) * dist;
        const py = centerFocusY + Math.sin(bp.angle) * dist;

        ctx.globalAlpha = burstAlpha * 0.96;
        if (bp.isRay) {
          const tailDist = Math.max(14, dist - bp.rayLen * (1 - burstP * 0.35));
          const tx = cx + Math.cos(bp.angle) * tailDist;
          const ty = centerFocusY + Math.sin(bp.angle) * tailDist;
          ctx.strokeStyle = bp.color;
          ctx.lineWidth = bp.size * 0.95;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(px, py);
          ctx.stroke();
        } else {
          ctx.fillStyle = bp.color;
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


