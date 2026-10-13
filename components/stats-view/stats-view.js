// components/stats-view/stats-view.js
import { buildTrendLineChartSvg } from '../../utils/trendChartSvgBuilder.js';
import { storageService } from '../../utils/storageService.js';
import { vipService } from '../../utils/vipService.js';
import { toast } from '../../utils/toastService.js';
import {
  LUNG_ICON_SVG,
  HEART_ICON_SVG,
  BLOOD_ICON_SVG,
  BRAIN_ICON_SVG,
  DEFAULT_USER_AVATAR_SVG,
  VIP_CROWN_ICON_SVG
} from '../../utils/vectorIcons.js';
import {
  ACHIEVEMENTS,
  checkAchievementsToUnlock,
  getAchievementProgress
} from '../../utils/achievements.js';

Component({
  properties: {
    profile: {
      type: Object,
      value: {}
    },
    myRankInfo: {
      type: Object,
      value: {}
    },
    totalSubstituted: {
      type: Number,
      value: 0
    },
    totalPacksSaved: {
      type: String,
      value: '0.0'
    },
    totalSavedMoney: {
      type: String,
      value: '0.00'
    },
    totalTarAvoided: {
      type: Number,
      value: 0
    },
    totalLifeRegained: {
      type: Number,
      value: 0
    },
    lifeRegainedHours: {
      type: String,
      value: '0.0'
    },
    igniteCount: {
      type: Number,
      value: 0
    },
    totalIgnites: {
      type: Number,
      value: 0
    },
    totalFinishedCigs: {
      type: Number,
      value: 0
    },
    quitDays: {
      type: Number,
      value: 0
    },
    weeklyAvg: {
      type: String,
      value: '0.0'
    },
    todayCount: {
      type: Number,
      value: 0
    },
    dailyTrends: {
      type: Array,
      value: []
    },
    whoStages: {
      type: Array,
      value: []
    },
    topPadding: {
      type: Number,
      value: 100
    }
  },

  data: {
    activeOrgan: 'lungs',
    lungPercent: 12,
    heartPercent: 18,
    bloodPercent: 20,
    brainPercent: 15,
    organInfo: {},
    organIcons: {
      lungs: LUNG_ICON_SVG,
      heart: HEART_ICON_SVG,
      blood: BLOOD_ICON_SVG,
      brain: BRAIN_ICON_SVG
    },
    defaultAvatarSvg: DEFAULT_USER_AVATAR_SVG,
    vipCrownSvg: VIP_CROWN_ICON_SVG,
    isVip: false,
    vipInfo: { isVip: false, isLifetime: false, formattedExpire: '' },

    // 我的钱包 (1元纸币娱乐数据)
    totalSavedYuan: 0,

    // 系统统计 7天每日抽烟折线图
    lineChartSvgUri: '',
    singleStickPrice: '1.25',
    resolvedIgniteCount: 0,

    // WHO 里程碑折叠状态 (默认折叠)
    isWhoCollapsed: true,
    displayedWhoStages: [],

    // 打卡日历数据 (紧凑月历与切换)
    calendarYear: 2026,
    calendarMonth: 10,
    calendarDays: [],
    calendarStats: {
      monthPunchedCount: 1,
      totalPunchedDays: 1,
      streakDays: 1,
      punchRate: 100
    },

    // 荣耀勋章殿堂数据 (Tencent Games 曜石展柜)
    achievementsList: [],
    unlockedAchievementsCount: 0,
    achievementsCompletionRate: 0,
    showAchievementModal: false,
    selectedAchievement: null
  },

  lifetimes: {
    attached() {
      try {
        if (storageService.recordDailyCheckIn) {
          storageService.recordDailyCheckIn();
        }
      } catch (e) {}
      const now = new Date();
      this.setData({
        calendarYear: now.getFullYear(),
        calendarMonth: now.getMonth() + 1
      });
      this.refreshVipStatus();
      this._syncAllStats();
      this.updateDisplayedWhoStages();
    }
  },

  pageLifetimes: {
    show() {
      this.refreshVipStatus();
      this._syncAllStats();
    }
  },

  observers: {
    'quitDays, totalSubstituted, totalTarAvoided, totalSavedMoney, dailyTrends, igniteCount, totalIgnites': function() {
      this._syncAllStats();
    },
    'whoStages': function() {
      this.updateDisplayedWhoStages();
    }
  },

  methods: {
    refreshVipStatus() {
      try {
        const vipInfo = vipService.getVipInfo();
        const isVip = !!(vipInfo && vipInfo.isVip);
        this.setData({ vipInfo, isVip });
      } catch (e) {
        console.warn('refreshVipStatus error', e);
      }
    },

    // 综合同步刷新数据 (具备防死循环防重入保护)
    _syncAllStats() {
      if (this._isSyncing) return;
      this._isSyncing = true;
      try {
        this.updateOrganMetrics();
        this.buildCalendarData();
        this.updateLineChart();
        this.updateAchievementsData();
      } finally {
        this._isSyncing = false;
      }
    },

    // 渲染系统统计 7 天每日抽烟/替烟支数折线图与钱包倍数
    updateLineChart() {
      let dailyData = this.data.dailyTrends;
      if (!Array.isArray(dailyData) || !dailyData.length) {
        dailyData = storageService.getRecentDailyStats(7);
      }
      const lineChartSvgUri = buildTrendLineChartSvg(dailyData);
      const totalSavedYuan = Math.floor(Number(this.data.totalSavedMoney)) || 0;
      const packPrice = Number(this.data.profile && this.data.profile.packPrice) || 25;
      const singleStickPrice = (packPrice / 20).toFixed(2);
      const propIgnite = Number(this.data.igniteCount) || Number(this.data.totalIgnites) || 0;
      const resolvedIgniteCount = propIgnite > 0 ? propIgnite : (storageService.getIgniteCount ? storageService.getIgniteCount() : (Number(this.data.totalSubstituted) || 0));
      this.setData({
        lineChartSvgUri,
        totalSavedYuan,
        singleStickPrice,
        resolvedIgniteCount
      });
    },

    // 展开/折叠 WHO 里程碑
    toggleWhoCollapse() {
      const next = !this.data.isWhoCollapsed;
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (e) {}
      this.setData({
        isWhoCollapsed: next
      }, () => {
        this.updateDisplayedWhoStages();
      });
    },

    updateDisplayedWhoStages() {
      const all = this.data.whoStages || [];
      const displayed = this.data.isWhoCollapsed ? all.slice(0, 3) : all;
      this.setData({
        displayedWhoStages: displayed
      });
    },

    // 上个月打卡
    onPrevMonth() {
      let y = this.data.calendarYear;
      let m = this.data.calendarMonth - 1;
      if (m < 1) {
        m = 12;
        y--;
      }
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (e) {}
      this.buildCalendarData(y, m);
    },

    // 下个月打卡
    onNextMonth() {
      let y = this.data.calendarYear;
      let m = this.data.calendarMonth + 1;
      if (m > 12) {
        m = 1;
        y++;
      }
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (e) {}
      this.buildCalendarData(y, m);
    },

    buildCalendarData(targetYear, targetMonth) {
      const now = new Date();
      const currentYear = targetYear || this.data.calendarYear || now.getFullYear();
      const currentMonth = targetMonth || this.data.calendarMonth || (now.getMonth() + 1);
      const isCurrentRealMonth = (now.getFullYear() === currentYear && (now.getMonth() + 1) === currentMonth);
      const todayDate = isCurrentRealMonth ? now.getDate() : -1;

      const records = storageService.getRecords() || [];
      const checkInDates = (storageService.getCheckInDates && storageService.getCheckInDates()) || [];

      // 严格基于真实打卡日期与真实替烟记录构建打卡集合（含跨月/跨年全量日期键）
      const punchDaySet = new Set();
      const allPunchedDateKeySet = new Set();
      const formatYMD = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      if (Array.isArray(checkInDates)) {
        checkInDates.forEach(dateStr => {
          if (typeof dateStr === 'string') {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
              const y = parseInt(parts[0], 10);
              const m = parseInt(parts[1], 10);
              const day = parseInt(parts[2], 10);
              if (!isNaN(y) && !isNaN(m) && !isNaN(day)) {
                allPunchedDateKeySet.add(formatYMD(y, m, day));
                if (y === currentYear && m === currentMonth) {
                  punchDaySet.add(day);
                }
              }
            }
          }
        });
      }

      if (Array.isArray(records)) {
        records.forEach(r => {
          if (!r || !r.timestamp) return;
          const ts = typeof r.timestamp === 'string' ? Number(r.timestamp) || Date.parse(r.timestamp) : r.timestamp;
          const d = new Date(ts);
          if (isNaN(d.getTime())) return;
          const ry = d.getFullYear();
          const rm = d.getMonth() + 1;
          const rday = d.getDate();
          allPunchedDateKeySet.add(formatYMD(ry, rm, rday));
          if (ry === currentYear && rm === currentMonth) {
            punchDaySet.add(rday);
          }
        });
      }

      const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const firstDayWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0(周日)-6

      const calendarDays = [];
      for (let i = 0; i < firstDayWeek; i++) {
        calendarDays.push({ empty: true, key: `pad-${i}` });
      }

      let monthPunchedCount = 0;
      let firstActiveDayInMonth = totalDaysInMonth;
      for (let day = 1; day <= totalDaysInMonth; day++) {
        const isToday = (day === todayDate && isCurrentRealMonth);
        const isFuture = isCurrentRealMonth ? (day > todayDate) : (new Date(currentYear, currentMonth - 1, day) > now);
        const isPunched = punchDaySet.has(day) && !isFuture;
        if (isPunched) {
          monthPunchedCount++;
          if (day < firstActiveDayInMonth) {
            firstActiveDayInMonth = day;
          }
        }

        calendarDays.push({
          empty: false,
          day,
          key: `d-${day}`,
          isToday,
          isFuture,
          isPunched
        });
      }

      // 若用户戒烟起始日在当月或更早，结合起始日计算当月应打卡跨度
      const profile = this.data.profile || {};
      if (profile.quitStartDate) {
        const quitDate = new Date(profile.quitStartDate);
        if (!isNaN(quitDate.getTime()) && quitDate <= now) {
          if (quitDate.getFullYear() === currentYear && (quitDate.getMonth() + 1) === currentMonth) {
            firstActiveDayInMonth = Math.min(firstActiveDayInMonth, quitDate.getDate());
          } else if (quitDate < new Date(currentYear, currentMonth - 1, 1)) {
            firstActiveDayInMonth = 1;
          }
        }
      }

      const endDayForRate = isCurrentRealMonth ? todayDate : totalDaysInMonth;
      if (monthPunchedCount === 0 && isCurrentRealMonth) {
        firstActiveDayInMonth = Math.min(firstActiveDayInMonth, todayDate);
      }
      const elapsedActiveDays = Math.max(1, endDayForRate - Math.max(firstActiveDayInMonth, 1) + 1);
      const punchRate = monthPunchedCount > 0
        ? Math.min(100, Math.round((monthPunchedCount / elapsedActiveDays) * 100))
        : 0;

      // 从今日起向回按自然日跨月/跨年倒推计算真实连续打卡天数 streakDays
      let streakDays = 0;
      const cursorDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      for (let offset = 0; offset < 3650; offset++) {
        const key = formatYMD(cursorDate.getFullYear(), cursorDate.getMonth() + 1, cursorDate.getDate());
        if (allPunchedDateKeySet.has(key)) {
          streakDays++;
        } else if (offset > 0) {
          break;
        }
        cursorDate.setDate(cursorDate.getDate() - 1);
      }

      this.setData({
        calendarYear: currentYear,
        calendarMonth: currentMonth,
        calendarDays,
        calendarStats: {
          monthPunchedCount,
          totalPunchedDays: Math.max(1, monthPunchedCount, streakDays, allPunchedDateKeySet.size),
          streakDays: Math.max(1, streakDays),
          punchRate
        }
      });
    },

    updateOrganMetrics() {
      const days = Number(this.data.quitDays) || 0;
      const subs = Number(this.data.totalSubstituted) || 0;

      // 限制单日虚拟替烟对器官自愈度的最高折算上限，防止首日刷百支瞬间满级
      const cigsPerDay = (this.data.profile && this.data.profile.cigsPerDay) || 15;
      const maxEffectiveSubs = Math.max(cigsPerDay, (days + 1) * cigsPerDay);
      const effectiveSubs = Math.min(subs, maxEffectiveSubs);

      // VIP 会员尊享自愈加速增益
      const vipBoost = (this.data.isVip || (this.data.vipInfo && this.data.vipInfo.isVip)) ? 1.18 : 1.0;

      // 科学对数自愈饱和曲线 (契合 WHO 临床里程碑: 首日 12~20%, 7天 ~38-45%, 30天 ~65-72%, 100+天 ~95-99%)
      const lungPercent = Math.min(99, Math.max(12, Math.round((12 + Math.log10(1 + days * 0.8 + effectiveSubs * 0.08) * 32) * vipBoost)));
      const heartPercent = Math.min(99, Math.max(18, Math.round((18 + Math.log10(1 + days * 0.85 + effectiveSubs * 0.08) * 30) * vipBoost)));
      const bloodPercent = Math.min(100, Math.max(20, Math.round((20 + Math.log10(1 + days * 0.9 + effectiveSubs * 0.09) * 30) * vipBoost)));
      const brainPercent = Math.min(96, Math.max(15, Math.round((15 + Math.log10(1 + days * 0.8 + effectiveSubs * 0.08) * 31) * vipBoost)));

      this.setData({
        lungPercent,
        heartPercent,
        bloodPercent,
        brainPercent
      });
      this.selectOrgan(this.data.activeOrgan || 'lungs', {
        lungPercent,
        heartPercent,
        bloodPercent,
        brainPercent
      });
    },

    selectOrgan(organId, customPercents) {
      const targetOrgan = organId || this.data.activeOrgan || 'lungs';
      const percents = customPercents || {
        lungPercent: this.data.lungPercent,
        heartPercent: this.data.heartPercent,
        bloodPercent: this.data.bloodPercent,
        brainPercent: this.data.brainPercent
      };
      const tar = Number(this.data.totalTarAvoided) || 0;

      const lPct = percents.lungPercent;
      const hPct = percents.heartPercent;
      const blPct = percents.bloodPercent;
      const brPct = percents.brainPercent;

      const organDictionary = {
        lungs: {
          id: 'lungs',
          name: '双肺呼吸系统',
          icon: '🫁',
          iconUri: LUNG_ICON_SVG,
          percent: lPct,
          color: '#10b981',
          accentBg: 'rgba(16, 185, 129, 0.12)',
          stageTitle: lPct >= 70 ? '晶莹新生 · 纤毛畅通' : (lPct >= 35 ? '深层代谢 · 焦油排出' : '早期自愈 · 纤毛苏醒'),
          statusBadge: lPct >= 70 ? '深度焕新' : (lPct >= 35 ? '排毒加速中' : '初步唤醒'),
          statMetrics: [
            { label: '阻断有害焦油', val: `${tar} mg`, highlight: true },
            { label: '纤毛摆动活力', val: `${lPct}%` },
            { label: '通气阻力下降', val: `-${Math.max(2, Math.min(38, Math.round(lPct * 0.38)))}%` }
          ],
          clinicalDesc: lPct >= 70
            ? '双肺支气管纤毛麻痹状态已完全解除，左肺与右肺粘液清除系统同步恢复规律摆动。肺泡巨噬细胞正在深层分解并搬运沉着焦油颗粒，双肺气体交换通畅度显著跃升。'
            : (lPct >= 35
              ? '支气管纤毛逐步恢复规律摆动，肺泡巨噬细胞正在加速吞噬并分解沉积焦油微粒，晨起咳痰或咽部异物感逐渐减轻，气道呼吸通畅度明显提升。'
              : '停吸初期，支气管黏膜受烟碱与焦油刺激显著减弱，麻痹的呼吸纤毛开始初步苏醒微动，气道表面粘液自洁与排毒机制重新启动。')
        },
        heart: {
          id: 'heart',
          name: '心血管与脉管',
          icon: '🫀',
          iconUri: HEART_ICON_SVG,
          percent: hPct,
          color: '#f59e0b',
          accentBg: 'rgba(245, 158, 11, 0.12)',
          stageTitle: hPct >= 70 ? '负荷骤减 · 供氧充沛' : (hPct >= 35 ? '节律恢复 · 血压回稳' : '交感减负 · 心率初稳'),
          statusBadge: hPct >= 70 ? '机能充盈' : (hPct >= 35 ? '稳步回升' : '负荷缓解'),
          statMetrics: [
            { label: '静息心率回落', val: hPct >= 70 ? '-8~12 bpm' : (hPct >= 35 ? '-5~8 bpm' : '-2~4 bpm'), highlight: true },
            { label: '心肌供氧能力', val: `${hPct}%` },
            { label: '冠脉负荷下降', val: `-${Math.max(3, Math.min(42, Math.round(hPct * 0.42)))}%` }
          ],
          clinicalDesc: hPct >= 70
            ? '停吸后外周血管痉挛现象全面消除，冠状动脉血流阻力显著降低，心肌获得纯净富氧血液灌注，运动耐力与心脏负荷能力全面回升。'
            : (hPct >= 35
              ? '外周血管收缩痉挛现象明显改善，冠状动脉微循环阻力持续下降，心肌缺氧状态得到有效缓解，日常爬楼与有氧运动耐力稳步增强。'
              : '摆脱真烟尼古丁急性刺激后，交感神经兴奋度回落，外周血管收缩压力初步释放，静息心率与血压开始向健康基准线回调。')
        },
        blood: {
          id: 'blood',
          name: '血液循环网络',
          icon: '🩸',
          iconUri: BLOOD_ICON_SVG,
          percent: blPct,
          color: '#06b6d4',
          accentBg: 'rgba(6, 182, 212, 0.12)',
          stageTitle: blPct >= 70 ? '一氧化碳排空 · 高纯携氧' : (blPct >= 35 ? '代谢净化 · 血氧回归' : '毒素解离 · 血氧初升'),
          statusBadge: blPct >= 70 ? '高纯携氧' : (blPct >= 35 ? '加速净化' : '解离排空'),
          statMetrics: [
            { label: '一氧化碳排空', val: blPct >= 70 ? '100%' : (blPct >= 35 ? `${Math.min(96, Math.round(45 + blPct * 0.7))}%` : `${Math.max(24, Math.round(blPct * 1.8))}%`), highlight: true },
            { label: '血氧饱和指数', val: blPct >= 70 ? '98.8%' : (blPct >= 35 ? '97.6%' : '96.2%') },
            { label: '微循环流速', val: `+${Math.max(3, Math.min(35, Math.round(blPct * 0.35)))}%` }
          ],
          clinicalDesc: blPct >= 70
            ? '碳氧血红蛋白完全解离，血液中一氧化碳浓度已降至常人健康水平。红细胞运氧效率达峰值，末梢手脚冰凉与组织微循环缺氧症状彻底改善。'
            : (blPct >= 35
              ? '血液内残留尼古丁及代谢产物大幅排空，红细胞运氧效率稳步爬升，血液粘稠度下降，四肢末梢微循环温度与面色光泽感明显改善。'
              : '血液中残余的一氧化碳正从血红蛋白中逐步解离排出，红细胞携氧空间重新释放，全身微血管供氧效率开始初步回升。')
        },
        brain: {
          id: 'brain',
          name: '自律植物神经系统',
          icon: '🧠',
          iconUri: BRAIN_ICON_SVG,
          percent: brPct,
          color: '#8b5cf6',
          accentBg: 'rgba(139, 92, 246, 0.12)',
          stageTitle: brPct >= 70 ? '植物神经平衡 · 情绪安宁' : (brPct >= 35 ? '交感神经脱敏 · 焦躁缓解' : '受体适应 · 戒断过渡'),
          statusBadge: brPct >= 70 ? '神经舒缓' : (brPct >= 35 ? '脱敏修复' : '节律重建'),
          statMetrics: [
            { label: '自律平衡度', val: `${brPct}%`, highlight: true },
            { label: '深度睡眠改善', val: `+${Math.max(3, Math.min(40, Math.round(brPct * 0.4)))}%` },
            { label: '烟瘾焦躁消除', val: `${Math.max(12, Math.min(92, Math.round(brPct * 0.9)))}%` }
          ],
          clinicalDesc: brPct >= 70
            ? '交感神经与迷走神经受体逐步脱敏至健康基准线，天然副交感神经自律机制重建，肠胃神经痉挛消除，深睡眠脑电波显著增强。'
            : (brPct >= 35
              ? '中枢尼古丁受体敏感度逐步回落，副交感神经（迷走神经）张力稳步恢复，焦躁易怒感明显消退，夜间入睡速度与深睡眠质量显著提升。'
              : '赛博替烟呼吸节律正在安抚交感神经丛，缓解尼古丁撤退初期的烦躁与空虚感，中枢多巴胺与乙酰胆碱受体开始启动脱敏调节。')
        }
      };

      this.setData({
        activeOrgan: targetOrgan,
        organInfo: organDictionary[targetOrgan] || organDictionary.lungs
      });
    },

    onSelectOrgan(e) {
      const organ = e.currentTarget.dataset.organ;
      if (!organ) return;
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (err) {}
      this.selectOrgan(organ);
    },

    onTapPunchCard() {
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'medium' });
      } catch (err) {}
      if (storageService.recordDailyCheckIn) {
        storageService.recordDailyCheckIn();
      }
      this.buildCalendarData();
      const calStats = this.data.calendarStats || {};
      const streakDays = calStats.streakDays || 1;
      const monthPunchedCount = calStats.monthPunchedCount || 1;
      toast.success(`今日自律打卡已达成 · 连续 ${streakDays} 天（本月 ${monthPunchedCount} 天）`);
    },

    onTapCalendarDay(e) {
      const item = e.currentTarget.dataset.day;
      if (!item || item.empty) return;
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (err) {}
      const y = this.data.calendarYear;
      const m = this.data.calendarMonth;
      if (item.isFuture) {
        toast.info(`${y}年${m}月${item.day}日 · 未来自律可期`);
      } else if (item.isPunched) {
        toast.success(`${y}年${m}月${item.day}日 · 坚持无烟打卡达成 ✓`);
      } else {
        toast.info(`${y}年${m}月${item.day}日 · 保持自律节奏`);
      }
    },

    onOpenProfileModal() {
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (err) {}
      this.triggerEvent('openprofile');
    },

    onChooseAvatar(e) {
      const avatarUrl = e.detail && e.detail.avatarUrl ? e.detail.avatarUrl : '';
      if (!avatarUrl) return;
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'medium' });
      } catch (err) {}
      this.triggerEvent('updateavatar', { avatarUrl });
    },

    onNicknameChange(e) {
      const nickName = (e.detail && e.detail.value ? e.detail.value : '').trim();
      if (nickName) {
        this.triggerEvent('updatenickname', { nickName });
      }
    },

    onNicknameBlur(e) {
      const nickName = (e.detail && e.detail.value ? e.detail.value : '').trim();
      if (nickName) {
        this.triggerEvent('updatenickname', { nickName });
      }
    },

    onGoToLeaderboard() {
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (err) {}
      this.triggerEvent('toleaderboard');
      this.triggerEvent('gotoleaderboard');
    },

    onGoToVip() {
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (err) {}
      wx.navigateTo({ url: '/pages/vip/vip' });
    },

    onTapBanknote() {
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (err) {}
      const quotes = [
        '一张1元，少抽一支就多存一张！',
        '老板，来一包……不抽了，省钱！',
        '这可是凭毅力抢回来的真金白银！',
        '少抽烟多存钱，钱包鼓鼓身体棒！'
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      toast.success(randomQuote);
    },

    // 荣耀勋章成就殿堂数据刷新与进度计算 (Tencent Games 曜石展柜标准)
    updateAchievementsData() {
      try {
        let unlockedIds = storageService.getUnlockedAchievements() || [];
        const totalSubs = Number(this.data.totalSubstituted) || 0;
        const totalSaved = Number(this.data.totalSavedMoney) || 0;
        const quitDays = (Number(this.data.quitDays) || 0) + 1;
        const unlockedEffects = storageService.getUnlockedSmokeEffects() || [];
        const summonedEffects = (storageService.getSummonedSmokeEffects && storageService.getSummonedSmokeEffects()) || [];
        const allEffects = Array.from(new Set([...unlockedEffects, ...summonedEffects]));

        const statsObj = {
          totalSubstituted: totalSubs,
          totalSavedMoney: totalSaved,
          quitDays,
          unlockedEffects: allEffects,
          unlockedEffectsCount: allEffects.length,
          hasCustomEffect: allEffects.some(id => id !== 'ring_classic' && id !== 'auspicious_river'),
          hasSummonedMythic: allEffects.includes('dragon_breath') || allEffects.includes('phoenix_nirvana') || allEffects.includes('buddha_light') || allEffects.includes('bagua_taichi')
        };

        const newlyUnlocked = checkAchievementsToUnlock(statsObj, unlockedIds);
        if (Array.isArray(newlyUnlocked) && newlyUnlocked.length > 0) {
          newlyUnlocked.forEach(id => storageService.unlockAchievement(id));
          unlockedIds = Array.from(new Set([...unlockedIds, ...newlyUnlocked]));
        }

        const list = ACHIEVEMENTS.map(item => {
          const unlocked = unlockedIds.includes(item.id);
          const progress = getAchievementProgress(item, statsObj);
          return {
            ...item,
            unlocked,
            progress
          };
        });

        const unlockedCount = list.filter(a => a.unlocked).length;
        const totalCount = list.length || 16;
        const completionRate = Math.round((unlockedCount / totalCount) * 100);

        this.setData({
          achievementsList: list,
          unlockedAchievementsCount: unlockedCount,
          achievementsCompletionRate: completionRate
        });
      } catch (e) {
        console.warn('updateAchievementsData error', e);
      }
    },

    onSelectAchievement(e) {
      const item = e.currentTarget.dataset.item;
      if (!item) return;
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (err) {}
      this.setData({
        selectedAchievement: item,
        showAchievementModal: true
      });
    },

    closeAchievementModal() {
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (err) {}
      this.setData({
        showAchievementModal: false,
        selectedAchievement: null
      });
    },

    preventTouchMove() {}
  }
});
