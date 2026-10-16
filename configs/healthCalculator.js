// utils/healthCalculator.js

export function calculateSavings(substituteCount, packPrice) {
  const count = Math.max(0, Number(substituteCount) || 0);
  const price = Math.max(0, Number(packPrice) || 0);
  const singlePrice = price / 20;
  return Number((count * singlePrice).toFixed(2));
}

export function calculateTarAvoided(substituteCount) {
  const count = Math.max(0, Number(substituteCount) || 0);
  return count * 10; // mg
}

export function calculateLifeRegained(substituteCount) {
  const count = Math.max(0, Number(substituteCount) || 0);
  return count * 11; // minutes
}

const WHO_STAGES_CONFIG = [
  { id: '20m', icon: '❤️', title: '20 分钟', description: '心率和血压回落至健康平稳区间', requiredMinutes: 20 },
  { id: '8h', icon: '🩸', title: '8 小时', description: '血液中一氧化碳水平减半，血氧恢复正常饱和', requiredMinutes: 8 * 60 },
  { id: '24h', icon: '💓', title: '24 小时', description: '心肌梗死突发概率开始显著下降，心血管减负', requiredMinutes: 24 * 60 },
  { id: '48h', icon: '🍎', title: '48 小时', description: '受损神经末梢开始新生，味觉与嗅觉明显灵敏复苏', requiredMinutes: 48 * 60 },
  { id: '72h', icon: '🌬️', title: '72 小时', description: '支气管放松平展，肺活量与呼吸通畅度大幅提升', requiredMinutes: 72 * 60 },
  { id: '14d', icon: '🏃', title: '2 星期', description: '全身血液微循环改善，肺功能恢复增强达 30%', requiredMinutes: 14 * 24 * 60 },
  { id: '1m', icon: '🌱', title: '1 个月', description: '纤毛系统全面苏醒，咳嗽与气短减少，肺部自洁加速', requiredMinutes: 30 * 24 * 60 },
  { id: '3m', icon: '⚡', title: '3 个月', description: '血液循环与肺功能达到全新峰值，运动耐力大幅增强', requiredMinutes: 90 * 24 * 60 },
  { id: '9m', icon: '🛡️', title: '9 个月', description: '鼻窦充血消除，呼吸道感染概率锐减，精力全面充沛', requiredMinutes: 270 * 24 * 60 },
  { id: '1y', icon: '🏆', title: '1 年', description: '冠心病突发超额风险比吸烟者降低 50%', requiredMinutes: 365 * 24 * 60 },
  { id: '5y', icon: '🧠', title: '5 年', description: '脑卒中（中风）风险降低至与非吸烟者同等健康水平', requiredMinutes: 5 * 365 * 24 * 60 },
  { id: '10y', icon: '🌟', title: '10 年', description: '肺癌死亡风险降至吸烟者一半，癌前病变细胞被健康组织替代', requiredMinutes: 10 * 365 * 24 * 60 }
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
