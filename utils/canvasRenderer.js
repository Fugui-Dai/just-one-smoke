// utils/canvasRenderer.js
import { sceneRenderer } from './sceneRenderer.js';

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
      ignitionTool
    } = options;

    const delta = dt || 0.016;
    this.time += delta;
    const time = this.time * 1000;

    // ==========================================
    // 0. 绘制沉浸生活场景背景 (雨夜车窗 / 深夜阳台 / 森林篝火 / 极简黑曜)
    // ==========================================
    sceneRenderer.render(ctx, w, h, sceneType || 'rainy_car', delta, this.time);

    const curState = fsm ? fsm.getState() : 'UNLIT';
    const isInhaling = curState === 'INHALING';
    const p = fsm ? fsm.getProgress() : 1.0;
    const progress = (typeof p === 'number' && !isNaN(p)) ? p : 1.0;
    const ashRatio = fsm ? (typeof fsm.getAshRatio === 'function' ? fsm.getAshRatio() : ((fsm.getAshLength() || 0) / 260)) : 0;

    const curCig = currentCigarette || {};

    // ==========================================
    const cx = w / 2;
    let maxCigH = Math.min(360, h * 0.54);
    let cigW = 28; // 标准支 (如中华、芙蓉王)
    let topW = 28; // 顶端燃烧口宽度 (喇叭筒支持锥度)
    let filterRatio = 0.23;

    if (curCig.isCigar || curCig.widthType === 'cigar') {
      // 古巴大号雪茄 (如高希霸)：粗犷厚实
      cigW = 42;
      topW = 42;
      maxCigH = Math.min(340, h * 0.50);
      filterRatio = 0.28;
    } else if (curCig.widthType === 'slender') {
      // 细支烟 (如南京·炫赫门、利群·江南韵)：纤长秀雅
      cigW = 20;
      topW = 20;
      maxCigH = Math.min(375, h * 0.56);
      filterRatio = 0.25;
    } else if (curCig.widthType === 'hand_rolled') {
      // 老辈白纸手卷旱烟：经典大喇叭筒锥度 (前粗后细：底端咬嘴 20px，顶端火口 29px，极短手捏纯白纸卷段)
      cigW = 20;
      topW = 29;
      maxCigH = Math.min(355, h * 0.53);
      filterRatio = 0.10;
    }

    const cy = h * 0.65; // 烟嘴底部锚点
    const filterH = Math.round(maxCigH * filterRatio);
    const maxPaperH = maxCigH - filterH;
    const paperH = maxPaperH * progress;
    // 烟灰长度完全等于自上次抖灰以来的燃烧长度，真实保留不自动断落
    const curAsh = maxPaperH * Math.max(0, Math.min(1.0, ashRatio));
    const fireY = cy - paperH; // 燃烧端顶端Y坐标 (全局作用域安全可用)

    const filterBase = curCig.filterColor || '#991b1b';
    const paperBase = curCig.paperColor || '#fffdf5';
    const bandColor = curCig.bandColor || '#f59e0b';

    // ==========================================
    // 2. 底部环境光遮蔽软阴影 (Soft Ambient Shadow - 完美复刻实机悬浮投影)
    // ==========================================
    ctx.save();
    const shadowGrad = ctx.createRadialGradient(cx, cy + filterH + 18, 5, cx, cy + filterH + 18, cigW * 1.8);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
    shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    drawEllipse(ctx, cx, cy + filterH + 18, cigW * 1.6, 9);
    ctx.fill();
    ctx.restore();

    // ==========================================
    // 3. 过滤嘴 / 古巴雪茄标 3D 圆柱体微距写实渐变渲染
    // ==========================================
    const fGrad = ctx.createLinearGradient(cx - cigW / 2, 0, cx + cigW / 2, 0);
    fGrad.addColorStop(0, 'rgba(0, 0, 0, 0.40)');
    fGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.32)');
    fGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.06)');
    fGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');

    // 过滤嘴底色与立体着色
    ctx.fillStyle = filterBase;
    ctx.fillRect(cx - cigW / 2, cy, cigW, filterH);
    ctx.fillStyle = fGrad;
    ctx.fillRect(cx - cigW / 2, cy, cigW, filterH);

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
    } else if (curCig.widthType === 'hand_rolled') {
      // 老辈白纸卷旱烟：手工纯白纸咬嘴段，纯净质朴无软木斑点
      ctx.save();
      ctx.fillStyle = 'rgba(120, 53, 15, 0.18)';
      for (let sy = cy + 4; sy < cy + filterH; sy += 3.5) {
        const rx = ((sy * 13) % Math.floor(cigW - 4)) + 2;
        ctx.fillRect(cx - cigW / 2 + rx, sy, 1.2, 1.0);
      }
      ctx.restore();
    } else {
      // 经典橙黄软木微距自然斑点 (Cork Speckle Flecks - 1:1 对标参考图软木微距细节)
      ctx.save();
      ctx.beginPath();
      drawRect(ctx, cx - cigW / 2, cy, cigW, filterH);
      ctx.clip();

      // 1) 浅金色软木木质微纤维斑点 (Light Golden Cork Spots)
      ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
      for (let sy = cy + 6; sy < cy + filterH - 4; sy += 5.2) {
        const rx = ((sy * 19 + 7) % Math.floor(cigW - 4)) + 2;
        const rw = 1.8 + ((sy * 7) % 3) * 0.5;
        const rh = 1.0 + ((sy * 11) % 2) * 0.6;
        ctx.fillRect(cx - cigW / 2 + rx, sy, rw, rh);
      }

      // 2) 深琥珀褐色天然软木凹点与木屑 (Dark Amber Organic Cork Flecks)
      ctx.fillStyle = 'rgba(92, 38, 10, 0.42)';
      for (let sy = cy + 8; sy < cy + filterH - 6; sy += 6.8) {
        const rx = ((sy * 29 + 17) % Math.floor(cigW - 5)) + 2.5;
        const rw = 1.4 + ((sy * 13) % 2) * 0.5;
        const rh = 1.2 + ((sy * 5) % 2) * 0.5;
        ctx.fillRect(cx - cigW / 2 + rx, sy, rw, rh);
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

      // 细致金/铜色分隔线 (Accent Line)
      ctx.fillStyle = 'rgba(217, 119, 6, 0.85)';
      ctx.fillRect(cx - cigW / 2, cy + collarH, cigW, 0.9);

      // 过滤嘴上的烫金英文字体与金色微颗粒 (实机同款: CHAOTIANMEN / CHUNGHWA)
      ctx.save();
      // 金色微颗粒质感
      ctx.fillStyle = 'rgba(255, 235, 150, 0.25)';
      for (let fy = cy + 14; fy < cy + filterH - 8; fy += 8) {
        ctx.fillRect(cx - cigW / 2 + 4 + ((fy * 3) % (cigW - 8)), fy, 1.6, 1.6);
      }
      // 竖向金色品牌英文字 (有爆珠时避开爆珠区域)
      const filterBrand = curCig.filterBrandText || (curCig.brand ? curCig.brand.toUpperCase() : 'CHAOTIANMEN');
      ctx.font = 'bold 7px sans-serif';
      ctx.fillStyle = 'rgba(100, 40, 10, 0.75)';
      ctx.textAlign = 'center';
      const maxL = Math.min(filterBrand.length, Math.floor((filterH - 22) / 7.5));
      const beadCenterY = cy + filterH * 0.52;
      for (let li = 0; li < maxL; li++) {
        const textY = cy + 20 + li * 7.5;
        if (curCig.hasBead && Math.abs(textY - beadCenterY) < 14) continue;
        ctx.fillText(filterBrand[li], cx, textY);
      }
      ctx.restore();
    }

    // ==========================================
    // 3.1 烟嘴物理焦油沉淀与浸润 (根据燃烧进度动态呈现)
    // ==========================================
    // 烟支原始长度为 maxPaperH，当前燃烧后剩余长度为 paperH = maxPaperH * progress
    // 已燃烧消耗比例 (0.0: 未点燃/满长 -> 1.0: 已抽完/吸尽)
    const burntRatio = Math.max(0, Math.min(1.0, 1.0 - progress));

    // 1) 烟嘴柱体物理焦油浸润染色 (随烟支长度变短逐渐焦黄暗化)
    if (burntRatio > 0.01) {
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

    // 2) 烟嘴底端 3D 吸嘴切面与焦油凝聚环
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



    // ==========================================
    // 4. 爆珠专属拟真晶体 (Crushable Flavor Bead)
    // ==========================================
    if (curCig.hasBead) {
      const beadY = cy + filterH * 0.52;
      const beadColor = curCig.beadColor || '#10b981';
      const beadR = curCig.widthType === 'slender' ? 5.4 : 6.2;

      ctx.save();

      // 4.1 爆珠靶心瞄准环与十字定位标刻 (Cigarette Filter Reticle)
      const reticleR = beadR + 5.2;
      ctx.lineWidth = 1.0;
      if (!isBeadPopped) {
        this.beadFlowStartTime = null;
        // 未捏破：微呼吸瞄准圈 (提示触碰)
        const pulse = 0.45 + 0.35 * Math.sin(time * 0.006);
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulse * 0.75})`;
        ctx.setLineDash([2.5, 2.5]);
        ctx.beginPath();
        ctx.arc(cx, beadY, reticleR, 0, Math.PI * 2);
        ctx.stroke();

        // 四方十字微刻度
        ctx.setLineDash([]);
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulse * 0.85})`;
        ctx.beginPath();
        // 上下左右定位刻度线
        ctx.moveTo(cx, beadY - reticleR - 1); ctx.lineTo(cx, beadY - reticleR - 3.5);
        ctx.moveTo(cx, beadY + reticleR + 1); ctx.lineTo(cx, beadY + reticleR + 3.5);
        ctx.moveTo(cx - reticleR - 1, beadY); ctx.lineTo(cx - reticleR - 3.5, beadY);
        ctx.moveTo(cx + reticleR + 1, beadY); ctx.lineTo(cx + reticleR + 3.5, beadY);
        ctx.stroke();

        // 柔和外呼吸光晕圈 (Ambient Aura)
        const auraGrad = ctx.createRadialGradient(cx, beadY, beadR * 0.8, cx, beadY, beadR * 2.8);
        auraGrad.addColorStop(0, beadColor);
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.globalAlpha = 0.35 + pulse * 0.35;
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, beadY, beadR * 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // 3D 珠体底部暗部投影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(cx, beadY + 0.8, beadR, 0, Math.PI * 2);
        ctx.fill();

        // 3D 水晶微球渐变 (偏心强光源高光)
        const beadGrad = ctx.createRadialGradient(cx - 1.8, beadY - 1.8, 0.5, cx, beadY, beadR);
        beadGrad.addColorStop(0, '#ffffff');
        beadGrad.addColorStop(0.2, '#ffffff');
        beadGrad.addColorStop(0.55, beadColor);
        beadGrad.addColorStop(0.85, beadColor);
        beadGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
        ctx.fillStyle = beadGrad;
        ctx.beginPath();
        ctx.arc(cx, beadY, beadR, 0, Math.PI * 2);
        ctx.fill();

        // 外层水晶壳体微光边缘
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(cx, beadY, beadR, 0, Math.PI * 2);
        ctx.stroke();

        // 顶部偏心镜面纯白高光点 (Specular Pin-point)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 1.8, beadY - 1.8, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // 底部微弱次表面散射环境光弧 (Subsurface Arc)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(cx, beadY, beadR - 1.2, Math.PI * 0.25, Math.PI * 0.75);
        ctx.stroke();
      } else {
        // 4.2 已捏破：真实四阶段物理过程（爆珠受压要碎 -> 裂口涌水流出 -> 慢慢毛细渗透 -> 仅渗一小点停止）
        if (this.beadFlowStartTime === null || this.beadFlowStartTime === undefined) {
          this.beadFlowStartTime = this.time;
        }
        const flowElapsed = Math.max(0, this.time - this.beadFlowStartTime);

        ctx.save();
        // 严格限定在烟嘴滤嘴柱体几何范围内，确保水液自然浸润在烟嘴海绵内部
        ctx.beginPath();
        drawRect(ctx, cx - cigW / 2, cy, cigW, filterH);
        ctx.clip();

        // ----------------------------------------------------
        // 阶段一 (0s ~ 0.42s)：爆珠要碎了（受压机械形变、冰裂蛛网纹爬满外壳、内部水液聚光）
        // ----------------------------------------------------
        if (flowElapsed < 0.42) {
          const crackProg = Math.min(1.0, flowElapsed / 0.40);
          // 指尖受力弹性形变：横向微鼓，纵向受压微扁
          const pinchFactor = Math.sin(crackProg * Math.PI * 0.5);
          const rx = beadR * (1.0 + 0.16 * pinchFactor);
          const ry = beadR * (1.0 - 0.22 * pinchFactor);

          // 底部暗部投影随形变调整
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          drawEllipse(ctx, cx, beadY + 1.0, rx, ry * 0.95);
          ctx.fill();

          // 内部精油受压聚光 (内部液体被挤压，核心极高亮微光)
          const beadGrad = ctx.createRadialGradient(cx - 1.2, beadY - 1.2, 0.3, cx, beadY, rx);
          beadGrad.addColorStop(0, '#ffffff');
          beadGrad.addColorStop(0.25, hexToRgba('#ffffff', 0.95));
          beadGrad.addColorStop(0.55, beadColor);
          beadGrad.addColorStop(0.85, hexToRgba(beadColor, 0.9));
          beadGrad.addColorStop(1, 'rgba(15, 23, 42, 0.88)');
          ctx.fillStyle = beadGrad;
          ctx.beginPath();
          drawEllipse(ctx, cx, beadY, rx, ry);
          ctx.fill();

          // 外层壳体高张力微光轮廓
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.75 + 0.25 * pinchFactor})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          drawEllipse(ctx, cx, beadY, rx, ry);
          ctx.stroke();

          // 表面碎裂纹理：逼真冰裂蛛网纹由中心向外迅速蔓延（爆珠要碎了）
          if (crackProg > 0.12) {
            const crackAlpha = Math.min(1.0, (crackProg - 0.12) / 0.28);
            ctx.strokeStyle = `rgba(255, 255, 255, ${crackAlpha * 0.95})`;
            ctx.lineWidth = 0.85;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // 主撕裂纹理
            ctx.beginPath();
            ctx.moveTo(cx - rx * 0.65, beadY - ry * 0.45);
            ctx.lineTo(cx - rx * 0.20, beadY - ry * 0.15);
            ctx.lineTo(cx + rx * 0.15, beadY + ry * 0.10);
            ctx.lineTo(cx + rx * 0.65, beadY + ry * 0.48);
            ctx.stroke();

            // 上分叉微裂纹
            if (crackProg > 0.28) {
              ctx.beginPath();
              ctx.moveTo(cx - rx * 0.20, beadY - ry * 0.15);
              ctx.lineTo(cx - rx * 0.05, beadY - ry * 0.65);
              ctx.stroke();
            }

            // 下破口受力支裂纹 (即将破口的位置)
            if (crackProg > 0.45) {
              ctx.beginPath();
              ctx.moveTo(cx + rx * 0.15, beadY + ry * 0.10);
              ctx.lineTo(cx + rx * 0.32, beadY + ry * 0.72);
              ctx.stroke();
            }

            // 破口应力微光亮点
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx + rx * 0.15, beadY + ry * 0.10, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }

          // 偏心高光
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.beginPath();
          ctx.arc(cx - 1.5, beadY - 1.2, 1.1, 0, Math.PI * 2);
          ctx.fill();
        } 
        // ----------------------------------------------------
        // 阶段二、三、四 (0.42s ~ 2.45s+)：水流出烟嘴、慢慢渗、渗到了一点点就停止
        // ----------------------------------------------------
        else {
          const seepElapsed = Math.max(0, flowElapsed - 0.42);
          // 慢速毛细渗透总耗时约 2.0 秒，达到上限后永久停止 (渗到了一点点就停止)
          const rawSeep = Math.min(1.0, seepElapsed / 2.0);
          // 真实的流体毛细吸收阻尼曲线 (先自破口快速泄出，随后在海绵纤维阻力下平缓减速直至完全停止)
          const seepProg = 1 - Math.pow(1 - rawSeep, 2.8);

          // 极克制的真实微量渗透范围：仅在爆珠周围稍大一小圈即停止
          // 横向扩散半径：由基底 beadR (~6px) 慢慢渗到 ~8.8px (仅多出 2.8px)
          const curSpreadH = beadR * (1.0 + 0.46 * seepProg);
          // 纵向顺纤维浸润半径：由基底 beadR (~6px) 慢慢渗到 ~10.6px (仅多出 4.6px)
          const curSpreadV = beadR * (1.0 + 0.74 * seepProg);

          // A. 真实微湿润深色海绵水渍圈 (Subtle Wet Fiber Stain)
          const stainAlpha = 0.28 * seepProg;
          const darkStainGrad = ctx.createRadialGradient(cx, beadY, beadR * 0.3, cx, beadY, curSpreadV);
          darkStainGrad.addColorStop(0, `rgba(0, 0, 0, ${stainAlpha})`);
          darkStainGrad.addColorStop(0.65, `rgba(0, 0, 0, ${stainAlpha * 0.45})`);
          darkStainGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = darkStainGrad;
          ctx.beginPath();
          drawEllipse(ctx, cx, beadY, curSpreadH, curSpreadV);
          ctx.fill();

          // B. 极克制半透明香精原液轻透色晕 (Soft Essence Flavor Hue)
          const oilGrad = ctx.createRadialGradient(cx, beadY, 1, cx, beadY, curSpreadV);
          oilGrad.addColorStop(0, hexToRgba(beadColor, 0.52 * seepProg));
          oilGrad.addColorStop(0.48, hexToRgba(beadColor, 0.25 * seepProg));
          oilGrad.addColorStop(0.85, hexToRgba(beadColor, 0.06 * seepProg));
          oilGrad.addColorStop(1.0, hexToRgba(beadColor, 0.0));
          ctx.fillStyle = oilGrad;
          ctx.beginPath();
          drawEllipse(ctx, cx, beadY, curSpreadH, curSpreadV);
          ctx.fill();

          // C. 破口初涌水液微流 (里面的水流出到烟嘴里)
          // 在 0.42s ~ 1.15s 期间，清晰可见从破损口涌出、流向烟嘴纤维的晶莹水液流
          if (seepElapsed < 0.75) {
            const emergeProg = seepElapsed / 0.75;
            const emergeAlpha = Math.sin(emergeProg * Math.PI) * 0.85;
            const fluidX = cx + 1.2;
            const fluidY = beadY + 1.4 + 2.2 * emergeProg;
            ctx.fillStyle = `rgba(255, 255, 255, ${emergeAlpha * 0.85})`;
            ctx.beginPath();
            ctx.arc(fluidX, fluidY, 1.2 * (1 - emergeProg * 0.35), 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = `rgba(255, 255, 255, ${emergeAlpha * 0.6})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(cx + 0.4, beadY + 0.6);
            ctx.lineTo(fluidX, fluidY);
            ctx.stroke();
          }

          // D. 海绵纤维毛细微孔自然渗线 (慢慢渗，顺纤维毛细浸透)
          if (seepProg > 0.08) {
            const capillaryOffsets = [-2.8, -1.2, 0.5, 1.9, 2.8];
            ctx.lineWidth = 0.75;
            for (let ci = 0; ci < capillaryOffsets.length; ci++) {
              const ox = cx + capillaryOffsets[ci];
              const cLen = (beadR * (0.8 + 0.46 * seepProg)) * (ci % 2 === 0 ? 1 : 0.86);
              const veinGrad = ctx.createLinearGradient(ox, beadY - cLen, ox, beadY + cLen);
              veinGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
              veinGrad.addColorStop(0.3, hexToRgba(beadColor, 0.32 * seepProg));
              veinGrad.addColorStop(0.7, hexToRgba(beadColor, 0.32 * seepProg));
              veinGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
              ctx.strokeStyle = veinGrad;
              ctx.beginPath();
              ctx.moveTo(ox, beadY - cLen * 0.9);
              ctx.lineTo(ox, beadY + cLen);
              ctx.stroke();
            }
          }

          // E. 捏瘪微扁的真实爆珠胶囊残壳与破口裂纹 (Collapsed Ruptured Shell)
          const collapseRate = Math.min(1.0, seepElapsed / 0.6);
          const collapsedRx = beadR * (0.82 - 0.12 * collapseRate);
          const collapsedRy = beadR * (0.64 - 0.10 * collapseRate);

          const shellGrad = ctx.createRadialGradient(cx - 1, beadY - 1, 0.5, cx, beadY, collapsedRx);
          shellGrad.addColorStop(0, hexToRgba(beadColor, 0.85));
          shellGrad.addColorStop(0.7, hexToRgba(beadColor, 0.68));
          shellGrad.addColorStop(1.0, 'rgba(15, 23, 42, 0.8)');
          ctx.fillStyle = shellGrad;
          ctx.beginPath();
          drawEllipse(ctx, cx, beadY, collapsedRx, collapsedRy);
          ctx.fill();

          // 破开撕裂纹 (清晰永久可见的破口裂纹)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(cx - 2.4, beadY - 1.1);
          ctx.lineTo(cx + 0.3, beadY + 0.2);
          ctx.lineTo(cx + 2.4, beadY + 1.4);
          ctx.stroke();

          // 中心残留的原液水光微反光
          ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
          ctx.beginPath();
          ctx.arc(cx - 0.9, beadY - 0.6, 0.85, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
      ctx.restore();
    }

    // ==========================================
    // 5. 卷纸烟身 / 雪茄深棕烟叶 3D 圆柱体微距写实渲染
    // ==========================================
    if (paperH > 0) {
      const curTopW = curCig.widthType === 'hand_rolled' 
        ? (cigW + (topW - cigW) * (paperH / maxPaperH)) 
        : cigW;

      if (curCig.widthType === 'hand_rolled') {
        // 老辈白纸手卷旱烟：大喇叭筒锥形纸身 (上端宽 curTopW，下端宽 cigW)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - curTopW / 2, cy - paperH);
        ctx.lineTo(cx + curTopW / 2, cy - paperH);
        ctx.lineTo(cx + cigW / 2, cy);
        ctx.lineTo(cx - cigW / 2, cy);
        ctx.closePath();
        ctx.fillStyle = '#faf8f2';
        ctx.fill();

        // 3D 锥面渐变光影
        const pGrad = ctx.createLinearGradient(cx - curTopW / 2, 0, cx + curTopW / 2, 0);
        pGrad.addColorStop(0, 'rgba(0, 0, 0, 0.28)');
        pGrad.addColorStop(0.22, 'rgba(255, 255, 255, 0.78)');
        pGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.12)');
        pGrad.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
        ctx.fillStyle = pGrad;
        ctx.fill();

        // 薄白纸手工斜向接缝线与天然纸张微褶 (以底端咬嘴 cy 向上绝对固定模数渲染，世界坐标100%静止锁死)
        ctx.strokeStyle = 'rgba(180, 175, 168, 0.55)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        const seamStep = 34;
        for (let seamY = cy - seamStep; seamY >= cy - paperH; seamY -= seamStep) {
          const wAtSeam = cigW + (topW - cigW) * ((cy - seamY) / Math.max(1, maxPaperH));
          ctx.moveTo(cx - wAtSeam / 2, seamY - 12);
          ctx.lineTo(cx + wAtSeam / 2, seamY + 10);
        }
        ctx.stroke();

        // 薄白纸微透天然黄烟丝暗影
        ctx.fillStyle = 'rgba(180, 83, 9, 0.05)';
        ctx.fill();
        ctx.restore();

        // 竖向传统红印章 (老辈旱烟)
        if (paperH > 40) {
          ctx.save();
          ctx.font = 'bold 9px sans-serif';
          ctx.fillStyle = 'rgba(185, 28, 28, 0.82)';
          ctx.textAlign = 'center';
          const stampText = '老辈旱烟';
          const stampBaseY = cy - 36;
          for (let si = 0; si < stampText.length; si++) {
            ctx.fillText(stampText[si], cx, stampBaseY + si * 10.5);
          }
          ctx.restore();
        }
      } else {
        ctx.fillStyle = curCig.isCigar ? '#382218' : '#fcfbf7';
        ctx.fillRect(cx - cigW / 2, cy - paperH, cigW, paperH);

        const pGrad = ctx.createLinearGradient(cx - cigW / 2, 0, cx + cigW / 2, 0);
        if (curCig.isCigar) {
          // 雪茄厚重油润烟叶质感
          pGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
          pGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.22)');
          pGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.1)');
          pGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
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
            ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
            ctx.fillRect(cx - cigW / 2, wy, cigW, 0.8);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
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

        // 品牌红色竖向烫印 (实机同款: 潮天门 / 中華)
        if (paperH > 40 && !curCig.isCigar) {
          ctx.save();
          ctx.font = 'bold 9.5px sans-serif';
          ctx.fillStyle = curCig.stampColor || 'rgba(185, 28, 28, 0.72)';
          ctx.textAlign = 'center';
          const stampText = curCig.stampText || (curCig.name ? curCig.name.split('·')[0] : '潮天门');
          const stampBaseY = cy - 38;
          for (let si = 0; si < stampText.length; si++) {
            ctx.fillText(stampText[si], cx, stampBaseY + si * 11);
          }
          ctx.restore();
        }
      }

      // 崭新未点燃状态下的真实烟丝切口端 (实机同款: Shredded Tobacco Cut)
      // 仅当整根烟全新未燃 (满长且无烟灰) 时呈现纯净烟丝切口
      if (curState === 'UNLIT' && progress >= 0.999 && curAsh <= 0.01) {
        const topY = cy - paperH;
        if (curCig.widthType === 'hand_rolled') {
          // 老辈白纸手卷旱烟：顶端外露散乱金黄原叶碎烟丝 (Loose Amber/Brown Tobacco Shreds)
          ctx.save();
          const wAtTop = curTopW;
          
          // 喇叭口内部深焦黄烟丝腔底
          const cutGrad = ctx.createRadialGradient(cx, topY, 1, cx, topY, wAtTop / 2);
          cutGrad.addColorStop(0, '#451a03');
          cutGrad.addColorStop(0.7, '#78350f');
          cutGrad.addColorStop(1.0, '#291004');
          ctx.fillStyle = cutGrad;
          ctx.beginPath();
          drawEllipse(ctx, cx, topY, wAtTop / 2, 3.5);
          ctx.fill();

          // 真实手工外溢碎烟丝条（长短不一、天然卷曲）
          const tobaccoFronds = [
            { dx: -10, len: 7.5, curve: -3.0, color: '#d97706', width: 2.2 },
            { dx: -7, len: 11.5, curve: -1.5, color: '#b45309', width: 2.5 },
            { dx: -3.5, len: 6.5, curve: 1.5, color: '#78350f', width: 1.8 },
            { dx: 0, len: 12.0, curve: -0.5, color: '#f59e0b', width: 2.4 },
            { dx: 3.5, len: 9.0, curve: 2.0, color: '#92400e', width: 2.0 },
            { dx: 7, len: 12.5, curve: 1.5, color: '#d97706', width: 2.6 },
            { dx: 10, len: 7.5, curve: 3.5, color: '#78350f', width: 1.9 },
            { dx: -8.5, len: 5.0, curve: -2.0, color: '#f59e0b', width: 1.5 },
            { dx: 5.0, len: 5.5, curve: 2.0, color: '#b45309', width: 1.6 }
          ];

          ctx.lineCap = 'round';
          for (let f of tobaccoFronds) {
            ctx.strokeStyle = f.color;
            ctx.lineWidth = f.width;
            ctx.beginPath();
            ctx.moveTo(cx + f.dx, topY);
            ctx.quadraticCurveTo(cx + f.dx + f.curve, topY - f.len * 0.6, cx + f.dx + f.curve * 1.3, topY - f.len);
            ctx.stroke();
          }

          // 碎烟丝细小高光颗粒
          ctx.fillStyle = '#fef08a';
          for (let f of tobaccoFronds) {
            ctx.fillRect(cx + f.dx + f.curve * 0.8, topY - f.len * 0.4, 1.2, 1.2);
          }
          ctx.restore();
        } else {
          const cutGrad = ctx.createLinearGradient(cx - cigW / 2, 0, cx + cigW / 2, 0);
          cutGrad.addColorStop(0, '#5c2c16');
          cutGrad.addColorStop(0.3, '#78350f');
          cutGrad.addColorStop(0.7, '#451a03');
          cutGrad.addColorStop(1, '#291004');
          ctx.fillStyle = cutGrad;
          ctx.fillRect(cx - cigW / 2, topY - 4, cigW, 5);

          // 烟丝交织颗粒碎屑
          ctx.fillStyle = '#b45309';
          for (let tx = cx - cigW / 2 + 2; tx < cx + cigW / 2 - 2; tx += 4) {
            const th = 2 + (tx % 3);
            ctx.fillRect(tx, topY - 5 + (tx % 2), 2.2, th);
          }
        }
      }

      // 掐灭后且已无烟灰时的真实炭化顶端 (Extinguished Charred Tip)
      if (curState === 'UNLIT' && progress < 0.999 && curAsh <= 0.01) {
        const charGrad = ctx.createLinearGradient(0, fireY - 2, 0, fireY + 4);
        charGrad.addColorStop(0, '#09090b');
        charGrad.addColorStop(0.4, '#451a03');
        charGrad.addColorStop(0.8, '#78350f');
        charGrad.addColorStop(1, 'rgba(120, 53, 15, 0)');
        ctx.fillStyle = charGrad;
        ctx.fillRect(cx - curTopW / 2 - 1, fireY - 1, curTopW + 2, 5);
      }
    }

    // ==========================================
    // 6. 极致写实微距灰白蓬松烟灰柱 (原地燃烧成灰·世界坐标固化·绝不拉伸)
    // ==========================================
    const isLit = (curState !== 'UNLIT' && curState !== 'FINISHED');
    // 真实可见烟灰高度：严格等于燃烧转化的实际烟灰长度，原地成灰，绝对保证 ashTopY 恒定不沉
    const displayAshH = curAsh;

    if (displayAshH >= 2) {
      const ashTopY = fireY - displayAshH;
      ctx.save();

      // -------------------------------------------------------------
      // 1. 世界坐标固化外轮廓 (World-Space Fixed Silhouette)
      // 以固定步长 (stepY = 4px) 沿绝对 Y 坐标遍历，已烧成的上段灰世界坐标永久锁定，
      // 火线向下移动时新灰仅在 fireY 原地诞生，彻底杜绝整体拉伸感！
      // -------------------------------------------------------------
      const stepY = 4.0;
      const startLayer = Math.floor(ashTopY / stepY);
      const endLayer = Math.ceil(fireY / stepY);
      const leftProfile = [];
      const rightProfile = [];

      for (let L = startLayer; L <= endLayer; L++) {
        const curY = L * stepY;
        const layerSeed1 = ((L * 1337 + 17) % 1000) / 1000;
        const layerSeed2 = ((L * 2843 + 31) % 1000) / 1000;
        // 靠近顶部(ashTopY)完全归零阻尼，保证烟灰柱头部与烟身一样严格笔直正立
        const distFromTop = Math.max(0, curY - ashTopY);
        const topDamp = Math.min(1.0, Math.pow(distFromTop / 12.0, 1.5));
        const leftJitter = (Math.sin(layerSeed1 * Math.PI * 2) * 1.2) * topDamp;
        const rightJitter = (Math.cos(layerSeed2 * Math.PI * 2) * 1.2) * topDamp;

        leftProfile.push({ x: cx - cigW / 2 + leftJitter, y: curY });
        rightProfile.push({ x: cx + cigW / 2 + rightJitter, y: curY });
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

      // 3D 灰白圆柱微距光影底色 (严格对齐卷烟圆柱体光影高光带：左暗、20%高光白、50%灰白、右暗)
      const ashBaseGrad = ctx.createLinearGradient(cx - cigW / 2, 0, cx + cigW / 2, 0);
      ashBaseGrad.addColorStop(0, '#52525b');
      ashBaseGrad.addColorStop(0.20, '#ffffff');
      ashBaseGrad.addColorStop(0.50, '#e4e4e7');
      ashBaseGrad.addColorStop(0.78, '#a1a1aa');
      ashBaseGrad.addColorStop(1.0, '#3f3f46');
      ctx.fillStyle = ashBaseGrad;
      ctx.fill();

      // -------------------------------------------------------------
      // 2. 多层重叠有机鳞片集群 (Organic Flake Clusters - 世界绝对坐标固化)
      // -------------------------------------------------------------
      for (let L = startLayer; L <= endLayer; L++) {
        const curY = L * stepY;
        const distToFire = fireY - curY; // 距离火线的垂直距离

        // 顶层 6px 内鳞片不向外溢出，保持头部柱体端正
        const isTopZone = (curY - ashTopY) < 6.0;
        const flakesCount = 4;
        const colW = cigW / flakesCount;

        for (let col = 0; col < flakesCount; col++) {
          const flakeSeed = ((L * 17 + col * 37 + 11) % 1000) / 1000;
          const fx = cx - cigW / 2 + (col + 0.5) * colW + (isTopZone ? 0 : (flakeSeed - 0.5) * 2.0);
          const fy = curY + (isTopZone ? 0 : Math.sin(flakeSeed * Math.PI * 4) * 1.0);
          const fw = colW * 0.95;
          const fh = stepY * 1.25;

          // A. 鳞片下缘深色孔隙阴影
          ctx.fillStyle = (distToFire < 8) ? 'rgba(15, 23, 42, 0.9)' : 'rgba(24, 24, 27, 0.65)';
          ctx.beginPath();
          drawEllipse(ctx, fx, fy + 1.0, fw * 0.48, fh * 0.42);
          ctx.fill();

          // B. 灰白鳞片色彩
          let flakeColor;
          if (col === 1) {
            flakeColor = '#ffffff'; // 高光带
          } else if (col === 0) {
            flakeColor = '#d4d4d8';
          } else if (col === 2) {
            flakeColor = '#e4e4e7';
          } else {
            flakeColor = '#a1a1aa';
          }

          if (distToFire < 7) {
            flakeColor = (col === 1) ? '#e4e4e7' : '#71717a';
          }

          ctx.fillStyle = flakeColor;
          ctx.beginPath();
          drawEllipse(ctx, fx, fy, fw * 0.46, fh * 0.38);
          ctx.fill();

          // C. 鳞片上沿极细纯白翻卷边缘
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(fx, fy - 0.5, fw * 0.36, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();

          // D. 噪点
          if (flakeSeed > 0.5) {
            ctx.fillStyle = (flakeSeed > 0.75) ? '#ffffff' : '#27272a';
            ctx.fillRect(fx + (flakeSeed - 0.5) * 3, fy - 0.6, 1.2, 1.2);
          }
        }
      }

      // -------------------------------------------------------------
      // 3. 顶端绝对水平端面与正立微弧透视火山口 (Orthogonal Upright Top Cap)
      // 彻底消除任何阶梯凸块，采用真烟微距端面透视椭圆，平稳正立绝无倾斜
      // -------------------------------------------------------------
      const capH = Math.min(2.5, cigW * 0.08);
      // 顶端微弧端面基底
      const capGrad = ctx.createLinearGradient(cx - cigW / 2, 0, cx + cigW / 2, 0);
      capGrad.addColorStop(0, '#52525b');
      capGrad.addColorStop(0.20, '#f4f4f5');
      capGrad.addColorStop(0.50, '#d4d4d8');
      capGrad.addColorStop(0.80, '#a1a1aa');
      capGrad.addColorStop(1.0, '#3f3f46');
      ctx.fillStyle = capGrad;
      ctx.beginPath();
      drawEllipse(ctx, cx, ashTopY, cigW * 0.50, capH);
      ctx.fill();

      // 顶面正中央微凹炭核与白灰边缘，正立中轴对称
      ctx.fillStyle = 'rgba(24, 24, 27, 0.75)';
      ctx.beginPath();
      drawEllipse(ctx, cx, ashTopY - 0.3, cigW * 0.28, capH * 0.65);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      drawEllipse(ctx, cx, ashTopY - 0.4, cigW * 0.42, capH * 0.85);
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
        ctx.fillRect(cx - 5.0, fireY - nearFireH, 3.2, nearFireH);
        ctx.fillRect(cx - 0.5, fireY - nearFireH * 0.65, 2.5, nearFireH * 0.65);
        ctx.fillRect(cx + 3.8, fireY - nearFireH * 0.85, 2.8, nearFireH * 0.85);
      }

      ctx.restore();
    }

    // ==========================================
    // 7. 剧烈燃烧端、锯齿炭化黑边与通红火星 (Burning Ember / Cherry)
    // ==========================================
    if (isLit) {
      const pulse = Math.sin(time * 0.007);
      const glowFactor = isInhaling ? 1.7 : (1.0 + 0.15 * pulse);

      // 1. 锯齿炭化焦黑破损边缘 (Scalloped Charred Black Rim - 参考图焦黑不规则纸边)
      ctx.save();
      ctx.beginPath();
      const rimSteps = 12;
      const stepW = cigW / rimSteps;
      const leftX = cx - cigW / 2;
      const rimOffsets = [0, 1.8, -0.6, 2.4, 0.8, -1.2, 1.5, 2.8, 0.4, -0.8, 1.9, 0.5, 0];
      ctx.moveTo(leftX, fireY + 8);
      ctx.lineTo(leftX, fireY + rimOffsets[0]);
      for (let ri = 0; ri < rimSteps; ri++) {
        const rx = leftX + (ri + 1) * stepW;
        const ry = fireY + rimOffsets[ri + 1];
        ctx.lineTo(rx, ry);
      }
      ctx.lineTo(leftX + cigW, fireY + 8);
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

      // 2. 炽热火星核心辐射与热浪光晕 (Thermal Glow Bloom)
      const bloomR = (cigW * 0.95) * glowFactor;
      const bloomGrad = ctx.createRadialGradient(cx, fireY, 2, cx, fireY, bloomR);
      bloomGrad.addColorStop(0, isInhaling ? 'rgba(255, 130, 0, 0.92)' : 'rgba(255, 65, 0, 0.65)');
      bloomGrad.addColorStop(0.35, isInhaling ? 'rgba(249, 115, 22, 0.65)' : 'rgba(239, 68, 68, 0.38)');
      bloomGrad.addColorStop(0.75, 'rgba(220, 38, 38, 0.12)');
      bloomGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bloomGrad;
      ctx.beginPath();
      ctx.arc(cx, fireY, bloomR, 0, Math.PI * 2);
      ctx.fill();

      // 3. 内部通红炽热火星隙斑 (Crust Ember Hotspots - 1:1对标参考图透红火星)
      const hotspots = [
        { ox: -4.5, oy: 0.5, r: 3.2 },
        { ox: 0.0, oy: -1.0, r: 4.2 },
        { ox: 4.8, oy: 0.8, r: 3.0 },
        { ox: -1.8, oy: 2.2, r: 2.6 },
        { ox: 3.2, oy: 2.0, r: 2.4 }
      ];

      for (const spot of hotspots) {
        const sx = cx + spot.ox;
        const sy = fireY + spot.oy;
        const sr = spot.r * (isInhaling ? 1.4 : (0.9 + 0.15 * Math.sin(time * 0.009 + spot.ox)));

        const spotGrad = ctx.createRadialGradient(sx, sy, 0.5, sx, sy, sr);
        spotGrad.addColorStop(0, '#ffffff'); // 极白炽心
        spotGrad.addColorStop(0.25, '#fef08a'); // 亮金
        spotGrad.addColorStop(0.65, '#ea580c'); // 橙红
        spotGrad.addColorStop(1.0, 'rgba(220, 38, 38, 0.1)'); // 边缘暗红
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 纸身向下受热微光散射
      const downLight = ctx.createLinearGradient(0, fireY, 0, fireY + 18);
      downLight.addColorStop(0, isInhaling ? 'rgba(255, 69, 0, 0.5)' : 'rgba(255, 69, 0, 0.22)');
      downLight.addColorStop(1, 'rgba(255, 69, 0, 0)');
      ctx.fillStyle = downLight;
      ctx.fillRect(cx - cigW / 2, fireY, cigW, 18);

      // 4. 自然脱落飘散的细小灰烬微粒 (Flaking Ash Specks)
      if (displayAshH > 2 && typeof particles.emitFlakingAsh === 'function') {
        const flakeChance = isInhaling ? 0.25 : 0.10;
        if (Math.random() < flakeChance) {
          particles.emitFlakingAsh(cx + (Math.random() - 0.5) * (cigW * 0.9), fireY - displayAshH * Math.random());
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
        } else if (curCig.beadColor === '#f43f5e') {
          activeSmokeColor = 'rgba(254, 205, 211, '; // 中华国梅幽红
        } else if (curCig.beadColor === '#a855f7') {
          activeSmokeColor = 'rgba(233, 213, 255, '; // 七星蓝莓幻紫
        }
      }

      if (isInhaling) {
        // 吸烟时长按深吸：火星爆燃，烟雾在起火火环处剧烈产生并向四周流窜
        if (Math.random() < 0.65 && typeof particles.emitVolumetricCombustionSmoke === 'function') {
          particles.emitVolumetricCombustionSmoke(cx - cigW * 0.35, fireY, activeSmokeColor);
          particles.emitVolumetricCombustionSmoke(cx + cigW * 0.32, fireY, activeSmokeColor);
        }
        if (Math.random() < 0.45) {
          particles.emitSparks(cx + (Math.random() - 0.5) * (cigW * 0.7), fireY, 2);
        }
      } else {
        // 核心：烟起火的地方 (fireY 燃烧线左右及中心) 真实涌出变幻多姿的流体烟雾！
        if (typeof particles.emitVolumetricCombustionSmoke === 'function') {
          // 起火处左侧红星起烟
          if (Math.random() < 0.48) {
            particles.emitVolumetricCombustionSmoke(cx - cigW * 0.36, fireY, activeSmokeColor);
          }
          // 起火处右侧红星起烟
          if (Math.random() < 0.48) {
            particles.emitVolumetricCombustionSmoke(cx + cigW * 0.32, fireY, activeSmokeColor);
          }
          // 起火处中心翻滚烟气
          if (Math.random() < 0.38) {
            particles.emitVolumetricCombustionSmoke(cx, fireY - 1, activeSmokeColor);
          }
        }

        // 核心双缕流体青烟丝绢 (自燃烧端火口自然升腾扩散，不受弹灰高度突变影响)
        particles.addSilkStreamNode(cx, fireY - 4, activeSmokeColor);

        // 静置阴燃时，烟丝微粒偶尔迸发自然微弱火星
        if (Math.random() < 0.04) {
          particles.emitSparks(cx + (Math.random() - 0.5) * (cigW * 0.5), fireY, 1);
        }
      }
    }

    // ==========================================
    // 7.5 点火器具高保真火焰视觉 (Dynamic Ignition Flame)
    // ==========================================
    if (isSparking && ignitionTool) {
      this.renderIgnitionFlame(ctx, cx, fireY, ignitionTool, time, cigW);
    }

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

export const canvasRenderer = new CanvasRenderer();
