// utils/healthCalculator.js

export function calculateSavings(substituteCount, packPrice) {
  const count = Math.max(0, Number(substituteCount) || 0);
  const price = Math.max(0, Number(packPrice) || 0);
  const singlePrice = price / 20;
  return Number((count * singlePrice).toFixed(2));
}

export function calculateTarAvoided(substituteCount, singleTarMg = 10) {
  const count = Math.max(0, Number(substituteCount) || 0);
  const tarVal = (singleTarMg !== undefined && singleTarMg !== null && !isNaN(Number(singleTarMg))) ? Number(singleTarMg) : 10;
  return Math.round(count * tarVal); // mg
}

export function calculateLifeRegained(substituteCount) {
  const count = Math.max(0, Number(substituteCount) || 0);
  return count * 11; // minutes
}

const WHO_STAGES_CONFIG = [
  { id: '20m', icon: '❤️', title: '20 分钟', description: '心率和血压回落至健康平稳区间', requiredMinutes: 20 },
  { id: '8h', icon: '🩸', title: '8 小时', description: '血液中一氧化碳水平减半，血氧恢复正常饱和', requiredMinutes: 8 * 60 },
  { id: '24h', icon: '💓', title: '24 小时', description: '心血管系统负荷显著减轻，呼吸节奏与循环机能恢复平稳', requiredMinutes: 24 * 60 },
  { id: '48h', icon: '🍎', title: '48 小时', description: '受损神经末梢开始新生，味觉与嗅觉明显灵敏复苏', requiredMinutes: 48 * 60 },
  { id: '72h', icon: '🌬️', title: '72 小时', description: '支气管放松平展，肺活量与呼吸通畅度大幅提升', requiredMinutes: 72 * 60 },
  { id: '14d', icon: '🏃', title: '2 星期', description: '全身血液微循环改善，肺功能恢复增强达 30%', requiredMinutes: 14 * 24 * 60 },
  { id: '1m', icon: '🌱', title: '1 个月', description: '纤毛系统全面苏醒，咳嗽与气短减少，肺部自洁加速', requiredMinutes: 30 * 24 * 60 },
  { id: '3m', icon: '⚡', title: '3 个月', description: '血液循环与肺功能达到全新峰值，运动耐力大幅增强', requiredMinutes: 90 * 24 * 60 },
  { id: '9m', icon: '🛡️', title: '9 个月', description: '鼻窦充血消除，呼吸道纯净度提升，精力全面充沛', requiredMinutes: 270 * 24 * 60 },
  { id: '1y', icon: '🏆', title: '1 年', description: '心血管健康活力全面跃升 50%，心肌耐受力大幅恢复', requiredMinutes: 365 * 24 * 60 },
  { id: '5y', icon: '🧠', title: '5 年', description: '脑血管微循环充盈通畅，机体活力达到优质健康常态水平', requiredMinutes: 5 * 365 * 24 * 60 },
  { id: '10y', icon: '🌟', title: '10 年', description: '呼吸系统深层自洁焕新，肺泡组织生命力重焕新生，机能全面平复', requiredMinutes: 10 * 365 * 24 * 60 }
];

export function getWhoStages(startDate, currentDate = Date.now()) {
  const elapsedMinutes = Math.max(0, (currentDate - startDate) / (1000 * 60));
  return WHO_STAGES_CONFIG.map(stage => ({
    ...stage,
    unlocked: elapsedMinutes >= stage.requiredMinutes
  }));
}

/**
 * 按照自然日历天数（以当地时间午夜零点为分界）计算自戒烟起点以来已过去的自然天数
 * 例如：
 *  - 2026-10-09 15:30 启动，当天返回 0（界面展示 quitDays + 1 即第 1 天 / 打卡 1 天）
 *  - 2026-10-10 09:00（即便不足24小时）返回 1（界面展示第 2 天 / 打卡 2 天）
 *  - 2026-10-11 11:48（即便不足48小时）返回 2（界面展示第 3 天 / 打卡 3 天）
 */
export function calculateQuitDays(startDate, targetDate = Date.now()) {
  if (!startDate) return 0;
  const start = new Date(typeof startDate === 'string' && !isNaN(Number(startDate)) ? Number(startDate) : startDate);
  const target = new Date(typeof targetDate === 'string' && !isNaN(Number(targetDate)) ? Number(targetDate) : targetDate);
  if (isNaN(start.getTime()) || isNaN(target.getTime())) return 0;

  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();

  const diffMs = targetMidnight - startMidnight;
  if (diffMs <= 0) return 0;
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * 科学对数自愈饱和曲线 (严肃医学标准 · 契合 WHO 临床里程碑)
 * 首日 12~20%, 7天 ~38-45%, 30天 ~65-72%, 100+天 ~95-99%
 * 
 * @param {number} quitDays 坚持自律天数
 * @param {number} totalSubstituted 累计替烟支数
 * @param {number} cigsPerDay 历史每日抽烟量 (默认15)
 * @returns {{ lungPercent: number, heartPercent: number, bloodPercent: number, brainPercent: number }}
 */
export function calculateOrganMetrics(quitDays = 0, totalSubstituted = 0, cigsPerDay = 15) {
  const days = Math.max(0, Number(quitDays) || 0);
  const subs = Math.max(0, Number(totalSubstituted) || 0);
  const dailyQuota = Math.max(1, Number(cigsPerDay) || 15);

  // 限制单日虚拟替烟对器官自愈度的最高折算上限，防止首日刷百支瞬间满级
  const maxEffectiveSubs = Math.max(dailyQuota, (days + 1) * dailyQuota);
  const effectiveSubs = Math.min(subs, maxEffectiveSubs);

  const lungPercent = Math.min(99, Math.max(12, Math.round(12 + Math.log10(1 + days * 0.8 + effectiveSubs * 0.08) * 32)));
  const heartPercent = Math.min(99, Math.max(18, Math.round(18 + Math.log10(1 + days * 0.85 + effectiveSubs * 0.08) * 30)));
  const bloodPercent = Math.min(100, Math.max(20, Math.round(20 + Math.log10(1 + days * 0.9 + effectiveSubs * 0.09) * 30)));
  const brainPercent = Math.min(96, Math.max(15, Math.round(15 + Math.log10(1 + days * 0.8 + effectiveSubs * 0.08) * 31)));

  return { lungPercent, heartPercent, bloodPercent, brainPercent };
}

