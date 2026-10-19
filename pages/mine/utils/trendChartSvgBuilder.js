// utils/trendChartSvgBuilder.js
/**
 * 7天每日抽烟/替烟支数趋势高清矢量折线图生成器 (SVG Data URI)
 * 100% 适配微信小程序全端 Retina 视网膜高清屏
 */

export function buildTrendLineChartSvg(dailyList = []) {
  const width = 640;
  const height = 220;
  const padL = 50;
  const padR = 50;
  const padT = 38;
  const padB = 44;

  const cw = width - padL - padR;
  const ch = height - padT - padB;

  const data = dailyList && dailyList.length ? dailyList : [
    { label: '6天前', count: 0 },
    { label: '5天前', count: 0 },
    { label: '4天前', count: 0 },
    { label: '3天前', count: 0 },
    { label: '2天前', count: 0 },
    { label: '昨天', count: 0 },
    { label: '今天', count: 0 }
  ];

  const vals = data.map(d => {
    if (d.count !== undefined) return Number(d.count) || 0;
    if (d.val !== undefined) return Number(d.val) || 0;
    if (d.value !== undefined) return Number(d.value) || 0;
    return Number(d.cumulative) || 0;
  });
  const maxVal = Math.max(5, ...vals);
  const minVal = 0;

  const count = data.length;
  const points = data.map((d, i) => {
    const val = (d.count !== undefined)
      ? (Number(d.count) || 0)
      : (d.val !== undefined ? (Number(d.val) || 0) : (d.value !== undefined ? (Number(d.value) || 0) : (Number(d.cumulative) || 0)));
    const x = padL + (i / Math.max(1, count - 1)) * cw;
    const norm = (val - minVal) / (maxVal - minVal || 1);
    const y = padT + (1 - norm) * ch;
    const isToday = i === count - 1 || d.label === '今天';
    return { x: Math.round(x), y: Math.round(y), val, label: d.label, isToday };
  });

  // 生成折线与填充路径
  let pathD = '';
  let areaD = '';
  points.forEach((pt, idx) => {
    if (idx === 0) {
      pathD += `M ${pt.x} ${pt.y}`;
      areaD += `M ${pt.x} ${padT + ch} L ${pt.x} ${pt.y}`;
    } else {
      pathD += ` L ${pt.x} ${pt.y}`;
      areaD += ` L ${pt.x} ${pt.y}`;
    }
  });
  const lastPt = points[points.length - 1];
  areaD += ` L ${lastPt.x} ${padT + ch} Z`;

  // 网格刻度线
  const gridY1 = Math.round(padT);
  const gridY2 = Math.round(padT + ch * 0.5);
  const gridY3 = Math.round(padT + ch);

function escapeXml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

  let dotsSvg = '';
  points.forEach(pt => {
    const textY = Math.max(20, pt.y - 10);
    const safeVal = escapeXml(pt.val);
    const safeLabel = escapeXml(pt.label);
    dotsSvg += `
      <!-- 数据圆点与外发光环 -->
      <circle cx="${pt.x}" cy="${pt.y}" r="${pt.isToday ? 6 : 4.5}" fill="#131826" stroke="#10b981" stroke-width="${pt.isToday ? 3 : 2.5}" />
      <circle cx="${pt.x}" cy="${pt.y}" r="${pt.isToday ? 3 : 2}" fill="#34d399" />
      ${pt.isToday ? `<circle cx="${pt.x}" cy="${pt.y}" r="11" fill="none" stroke="#34d399" stroke-width="1.8" stroke-dasharray="3,3" opacity="0.9" />` : ''}
      
      <!-- 顶部数值标签 -->
      <text x="${pt.x}" y="${textY}" fill="${pt.isToday ? '#34d399' : '#f8fafc'}" font-size="${pt.isToday ? 15 : 13}" font-weight="${pt.isToday ? 800 : 700}" text-anchor="middle" font-family="-apple-system, system-ui, sans-serif">${safeVal}</text>
      
      <!-- 底部日期标签 -->
      <text x="${pt.x}" y="${height - 14}" fill="${pt.isToday ? '#34d399' : '#94a3b8'}" font-size="13" font-weight="${pt.isToday ? '700' : '500'}" text-anchor="middle" font-family="-apple-system, system-ui, sans-serif">${safeLabel}</text>
    `;
  });

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="auto">
    <defs>
      <linearGradient id="trendLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#10b981" />
        <stop offset="100%" stop-color="#06b6d4" />
      </linearGradient>
      <linearGradient id="trendAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.30" />
        <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.01" />
      </linearGradient>
    </defs>

    <!-- 背景参考虚线 -->
    <line x1="${padL}" y1="${gridY1}" x2="${width - padR}" y2="${gridY1}" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="3,3" />
    <line x1="${padL}" y1="${gridY2}" x2="${width - padR}" y2="${gridY2}" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="3,3" />
    <line x1="${padL}" y1="${gridY3}" x2="${width - padR}" y2="${gridY3}" stroke="rgba(255,255,255,0.12)" stroke-width="1" />

    <!-- 刻度提示 -->
    <text x="${padL - 10}" y="${gridY1 + 4}" fill="#64748b" font-size="11" text-anchor="end" font-family="sans-serif">${maxVal}</text>
    <text x="${padL - 10}" y="${gridY2 + 4}" fill="#64748b" font-size="11" text-anchor="end" font-family="sans-serif">${Math.round(maxVal / 2)}</text>
    <text x="${padL - 10}" y="${gridY3 + 4}" fill="#64748b" font-size="11" text-anchor="end" font-family="sans-serif">0</text>

    <!-- 渐变面积填充 -->
    <path d="${areaD}" fill="url(#trendAreaGrad)" />

    <!-- 趋势折线主体 -->
    <path d="${pathD}" fill="none" stroke="url(#trendLineGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

    ${dotsSvg}
  </svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);
}
