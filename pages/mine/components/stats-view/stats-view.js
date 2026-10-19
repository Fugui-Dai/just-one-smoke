// pages/mine/components/stats-view/stats-view.js
import { buildTrendLineChartSvg } from '../../utils/trendChartSvgBuilder.js';
import { storageService } from '../../../../services/storageService.js';
import { vipService } from '../../../../services/vipService.js';
import { toast } from '../../../../services/toastService.js';
import { audioManager } from '../../../../services/audioManager.js';
import { triggerHaptic } from '../../../../services/haptics.js';
import {
  LUNG_ICON_SVG,
  HEART_ICON_SVG,
  BLOOD_ICON_SVG,
  BRAIN_ICON_SVG,
  DEFAULT_USER_AVATAR_SVG,
  CYBER_GOLD_VOUCHER_SVG,
  HUD_LEAD_CURVES
} from '../../../../utils/vectorIcons.js';
import {
  ACHIEVEMENTS,
  checkAchievementsToUnlock,
  getAchievementProgress,
  getHighestUnlockedTitle,
  getActiveUserTitle,
  normalizeUnlockedIds
} from '../../../../configs/achievements.js';
import { detectIsIOS } from '../../../../utils/safeArea.js';
import { VIP_THEME_CATEGORIES, VIP_THEME_OPTIONS, getThemeById } from '../../../../configs/vipThemes.js';
import { calculateOrganMetrics } from '../../../../configs/healthCalculator.js';

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
    },
    vipTheme: {
      type: String,
      value: '',
      observer() {
        this.refreshVipStatus();
      }
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
    leadCurveUris: HUD_LEAD_CURVES,
    defaultAvatarSvg: DEFAULT_USER_AVATAR_SVG,
    goldVoucherSvgUri: CYBER_GOLD_VOUCHER_SVG,
    isIOS: detectIsIOS(),
    isVip: false,
    vipInfo: { isVip: false, isLifetime: false, formattedExpire: '' },

    // 我的钱包 (自律金券储备数据)
    totalSavedYuan: 0,

    // 系统统计 7天每日抽烟折线图
    lineChartSvgUri: '',
    singleStickPrice: '1.25',
    resolvedIgniteCount: 0,

    // WHO 里程碑折叠状态 (默认折叠)
    isWhoCollapsed: true,
    displayedWhoStages: [],

    // 打卡签到与日历数据 (真实主动盖印自律状态与历史战报)
    isTodayPunched: false,
    isStamping: false,
    isNextMonthDisabled: true,
    calendarYear: 2026,
    calendarMonth: 10,
    calendarDays: [],
    showDayDetailModal: false,
    selectedCalendarDay: null,
    calendarStats: {
      monthPunchedCount: 0,
      totalPunchedDays: 0,
      streakDays: 0,
      punchRate: 0
    },

    // 荣耀称号殿堂数据 (Tencent Games 曜石展柜)
    achievementsList: [],
    unlockedAchievementsCount: 0,
    achievementsCompletionRate: 0,
    equippedTitle: '无烟觉醒者',
    showAchievementModal: false,
    selectedAchievement: null,

    // 用户服务协议与隐私条款弹窗 (就地查看，不跳转VIP)
    showProtocolModal: false,
    protocolType: 'user', // 'user' | 'privacy'

    // 全域流光心境换肤 (Mine 专属轻量装扮中心 · 页面内嵌伸缩折叠)
    isWardrobeExpanded: true,
    themeCategories: VIP_THEME_CATEGORIES,
    currentThemeCategory: 'classic',
    filteredThemeOptions: VIP_THEME_OPTIONS.filter(t => t.category === 'classic'),
    activeVipThemeId: 'classic',
    previewVipThemeId: '',
    activeThemeObj: VIP_THEME_OPTIONS[0]
  },

  lifetimes: {
    attached() {
      const now = new Date();
      // 只要打开页面/登录即自动签到打卡
      try {
        storageService.recordDailyCheckIn();
      } catch (e) {}
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
      this._isNavigating = false;
      try {
        storageService.recordDailyCheckIn();
      } catch (e) {}
      this.refreshVipStatus();
      this._syncAllStats();
    }
  },

  observers: {
    'profile, quitDays, totalSubstituted, totalTarAvoided, totalSavedMoney, dailyTrends, igniteCount, totalIgnites': function() {
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
        const userStats = {
          quitDays: this.data.quitDays,
          totalSubstituted: this.data.totalSubstituted
        };
        const curThemeId = vipService.getSelectedThemeId ? vipService.getSelectedThemeId(userStats) : (vipService.getVipTheme(userStats) || 'classic');
        const activeThemeObj = getThemeById(curThemeId) || VIP_THEME_OPTIONS[0];

        const allThemes = VIP_THEME_OPTIONS.map(opt => ({
          ...opt,
          isLocked: !vipService.isThemeAllowed(opt.id, vipInfo.tierId, vipInfo.isLifetime, userStats)
        }));

        const themeCategories = VIP_THEME_CATEGORIES.map(cat => ({
          ...cat,
          count: allThemes.filter(t => t.category === cat.id).length
        }));

        let category = this.data.currentThemeCategory || 'classic';
        try {
          const savedCat = wx.getStorageSync('JUST_ONE_SMOKE_VIP_THEME_CAT');
          if (savedCat && savedCat !== 'all' && themeCategories.some(c => c.id === savedCat)) {
            category = savedCat;
          } else if (category === 'all' || !themeCategories.some(c => c.id === category)) {
            category = 'classic';
          }
        } catch (e) {
          if (category === 'all' || !themeCategories.some(c => c.id === category)) {
            category = 'classic';
          }
        }

        const filteredThemeOptions = allThemes.filter(t => t.category === category);

        this.setData({ 
          vipInfo, 
          isVip,
          currentThemeCategory: category,
          activeVipThemeId: curThemeId,
          activeThemeObj,
          themeOptions: allThemes,
          themeCategories,
          filteredThemeOptions
        });
      } catch (e) {
        console.warn('refreshVipStatus error', e);
      }
    },

    // 伸缩折叠换肤卡片展开/收起
    onToggleWardrobeExpand() {
      try { triggerHaptic('light'); } catch (e) {}
      try { audioManager.playClick(); } catch (e) {}
      const next = !this.data.isWardrobeExpanded;
      this.setData({ isWardrobeExpanded: next });
    },

    // 分类筛选切换
    onSelectThemeCategory(e) {
      const category = e.currentTarget.dataset.category || 'classic';
      if (!category) return;
      try { triggerHaptic('selection'); } catch (err) {}
      try { audioManager.playClick(); } catch (err) {}

      try {
        wx.setStorageSync('JUST_ONE_SMOKE_VIP_THEME_CAT', category);
      } catch (err) {}

      const allThemes = this.data.themeOptions || VIP_THEME_OPTIONS;
      const filteredThemeOptions = allThemes.filter(t => t.category === category);

      this.setData({
        currentThemeCategory: category,
        filteredThemeOptions
      });
    },

    // 选中流光主题：已解锁正式换肤，未开通/未解锁仅作为实时预览
    onSelectVipTheme(e) {
      const themeId = e.currentTarget.dataset.id;
      if (!themeId) return;

      try { triggerHaptic('light'); } catch (err) {}
      try { audioManager.playClick(); } catch (err) {}

      const vipInfo = this.data.vipInfo || {};
      const userStats = {
        quitDays: this.data.quitDays,
        totalSubstituted: this.data.totalSubstituted
      };
      const isAllowed = vipService.isThemeAllowed(themeId, vipInfo.tierId, vipInfo.isLifetime, userStats);
      const themeOpt = getThemeById(themeId) || VIP_THEME_OPTIONS[0];

      if (!isAllowed) {
        // 未解锁：仅实时预览当前页面光影，绝不持久化保存
        this.setData({
          previewVipThemeId: themeId,
          activeThemeObj: themeOpt
        });

        // 联动当前页面背景实时预览
        this.triggerEvent('themepreview', { themeId, isPreview: true });

        const daysLeft = Math.max(0, (themeOpt.unlockDays || 0) - (userStats.quitDays || 0));
        const subsLeft = Math.max(0, (themeOpt.unlockSubs || 0) - (userStats.totalSubstituted || 0));
        let progressHint = '';
        if (daysLeft > 0 && subsLeft > 0) {
          progressHint = `还需自律 ${daysLeft} 天或替烟 ${subsLeft} 支免费解锁`;
        } else if (daysLeft > 0) {
          progressHint = `还需自律 ${daysLeft} 天免费解锁`;
        } else if (subsLeft > 0) {
          progressHint = `还需替烟 ${subsLeft} 支免费解锁`;
        } else {
          progressHint = themeOpt.unlockDesc || '达成自律条件即可免费解锁';
        }

        const isIOS = this.data.isIOS;
        const vipHint = isIOS ? '开启VIP亦可秒解' : '开通VIP亦可秒解';
        toast.info(`✨ 正在预览【${themeOpt.name}】（${progressHint} · ${vipHint}）`);
        return;
      }

      // 已解锁（自律时间达成 / VIP特权 / 经典原色）：正式装配并持久化
      vipService.setVipTheme(themeId, userStats);

      this.setData({
        activeVipThemeId: themeId,
        previewVipThemeId: '',
        activeThemeObj: themeOpt
      });

      // 通知父级页面立即联动全景背景光效并保存装配
      this.triggerEvent('themechange', { themeId });

      toast.flame(`🎨 已换上【${themeOpt.name}】流光心境！`);
    },

    // 退出预览，恢复正式装配的主题
    onResetThemePreview() {
      const userStats = {
        quitDays: this.data.quitDays,
        totalSubstituted: this.data.totalSubstituted
      };
      const realThemeId = vipService.getSelectedThemeId ? vipService.getSelectedThemeId(userStats) : 'classic';
      const realThemeObj = getThemeById(realThemeId) || VIP_THEME_OPTIONS[0];
      this.setData({
        previewVipThemeId: '',
        activeVipThemeId: realThemeId,
        activeThemeObj: realThemeObj
      });
      this.triggerEvent('themechange', { themeId: realThemeId });
      toast.info(`已恢复当前正式装配：【${realThemeObj.name}】`);
    },

    preventBubble() {},
    preventTouchMove() {},

    // 综合同步刷新数据 (具备防死循环防重入保护)
    _syncAllStats() {
      if (this._isSyncing) return;
      this._isSyncing = true;
      try {
        this.updateOrganMetrics();
        this.buildCalendarData();
        this.updateLineChart();
        this.updateAchievementsData();
        this.refreshVipStatus();
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
      const now = new Date();
      if (y < now.getFullYear() - 5) {
        return;
      }
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (e) {}
      this.buildCalendarData(y, m);
    },

    // 下个月打卡 (带大厂自然月边界拦截，禁止翻向未来)
    onNextMonth() {
      const now = new Date();
      const currentYear = this.data.calendarYear;
      const currentMonth = this.data.calendarMonth;
      if (currentYear > now.getFullYear() || (currentYear === now.getFullYear() && currentMonth >= (now.getMonth() + 1))) {
        try {
          if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
        } catch (e) {}
        return;
      }
      let y = currentYear;
      let m = currentMonth + 1;
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

      const dayRecordCountMap = {};
      if (Array.isArray(records)) {
        records.forEach(r => {
          if (!r || !r.timestamp) return;
          const ts = typeof r.timestamp === 'string' ? Number(r.timestamp) || Date.parse(r.timestamp) : r.timestamp;
          const d = new Date(ts);
          if (isNaN(d.getTime())) return;
          const ry = d.getFullYear();
          const rm = d.getMonth() + 1;
          const rday = d.getDate();
          const k = formatYMD(ry, rm, rday);
          allPunchedDateKeySet.add(k);
          dayRecordCountMap[k] = (dayRecordCountMap[k] || 0) + 1;
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

        const dateKey = formatYMD(currentYear, currentMonth, day);
        const count = dayRecordCountMap[dateKey] || 0;

        calendarDays.push({
          empty: false,
          day,
          key: `d-${day}`,
          isToday,
          isFuture,
          isPunched,
          year: currentYear,
          month: currentMonth,
          dateKey,
          count
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

      // 真实判断今日是否已盖印打卡
      const todayKey = formatYMD(now.getFullYear(), now.getMonth() + 1, now.getDate());
      const isTodayPunched = allPunchedDateKeySet.has(todayKey);

      // 计算真实连续打卡天数 streakDays：
      // 1. 若今日已打卡，从今日开始向回倒推连续打卡天数
      // 2. 若今日尚未打卡，从昨日开始向回倒推连续打卡天数（保留昨日积累的连签，等待今日续签）
      let streakDays = 0;
      const startCursor = isTodayPunched
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

      for (let offset = 0; offset < 3650; offset++) {
        const key = formatYMD(startCursor.getFullYear(), startCursor.getMonth() + 1, startCursor.getDate());
        if (allPunchedDateKeySet.has(key)) {
          streakDays++;
        } else {
          break;
        }
        startCursor.setDate(startCursor.getDate() - 1);
      }

      const totalPunchedDays = allPunchedDateKeySet.size;
      const isNextMonthDisabled = (currentYear > now.getFullYear()) || (currentYear === now.getFullYear() && currentMonth >= (now.getMonth() + 1));

      this.setData({
        isTodayPunched,
        isNextMonthDisabled,
        calendarYear: currentYear,
        calendarMonth: currentMonth,
        calendarDays,
        calendarStats: {
          monthPunchedCount,
          totalPunchedDays,
          streakDays,
          punchRate
        }
      });
    },

    updateOrganMetrics() {
      const days = Number(this.data.quitDays) || 0;
      const subs = Number(this.data.totalSubstituted) || 0;
      const cigsPerDay = (this.data.profile && this.data.profile.cigsPerDay) || 15;

      const { lungPercent, heartPercent, bloodPercent, brainPercent } = calculateOrganMetrics(days, subs, cigsPerDay);

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
          name: '双肺呼吸与咽喉粘膜',
          icon: '🫁',
          iconUri: LUNG_ICON_SVG,
          percent: lPct,
          color: '#10b981',
          accentBg: 'rgba(16, 185, 129, 0.12)',
          stageTitle: lPct >= 70 ? '晶莹新生 · 纤毛畅通' : (lPct >= 35 ? '深层代谢 · 焦油排出' : '早期自愈 · 纤毛苏醒'),
          statusBadge: lPct >= 70 ? '深度焕新' : (lPct >= 35 ? '排毒加速中' : '初步唤醒'),
          statMetrics: [
            { label: '阻断有害焦油', val: `${tar} mg`, highlight: true },
            { label: '咽部充血水肿', val: lPct >= 70 ? '完全消退' : (lPct >= 35 ? '-68% 吸收' : '充血减轻') },
            { label: '气道纤毛活力', val: `${lPct}%` }
          ],
          clinicalDesc: lPct >= 70
            ? '口腔与咽喉粘膜红肿彻底消除，声带水肿完全吸收，晨起咳痰与咽干异物感全面消失。双肺支气管纤毛麻痹状态解除并规律律动，肺泡巨噬细胞高效代谢清除沉积焦油，通气阻力下降，气体交换显著跃升。'
            : (lPct >= 35
              ? '咽喉黏膜充血水肿明显消退，舌苔味觉与嗅觉受体敏感度大幅复苏。支气管纤毛逐步恢复节律摆动，加速吞噬并排空焦油微粒，晨起气道清澈，呼吸轻盈舒畅。'
              : '停吸初期，口腔与咽部粘膜脱离高温焦油直接灼伤，表层水肿开始吸收；呼吸道纤毛系统苏醒微动，自洁排毒机制重新运转。')
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
          name: '血液微循环系统',
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
          name: '脑神经与自主神经轴',
          icon: '🧠',
          iconUri: BRAIN_ICON_SVG,
          percent: brPct,
          color: '#8b5cf6',
          accentBg: 'rgba(139, 92, 246, 0.12)',
          stageTitle: brPct >= 70 ? '神经受体稳态 · 情绪安宁' : (brPct >= 35 ? '中枢受体脱敏 · 焦躁缓解' : '受体适应 · 戒断过渡'),
          statusBadge: brPct >= 70 ? '稳态平衡' : (brPct >= 35 ? '脱敏修复' : '节律重建'),
          statMetrics: [
            { label: '神经受体脱敏', val: `${brPct}%`, highlight: true },
            { label: '迷走交感平衡', val: brPct >= 70 ? '高度平稳' : (brPct >= 35 ? '平稳恢复' : '交感初降') },
            { label: '深度睡眠改善', val: `+${Math.max(3, Math.min(40, Math.round(brPct * 0.4)))}%` }
          ],
          clinicalDesc: brPct >= 70
            ? '大脑中枢多巴胺与尼古丁受体完全适应健康生理节律，迷走神经-腹部植物神经轴恢复良性负反馈，焦虑与易怒神经回路切断，深睡眠慢波脑电显著恢复。'
            : (brPct >= 35
              ? '中枢胆碱受体敏感度稳步回落，迷走神经（副交感）张力恢复，胃肠神经肌肉痉挛消退，入睡速度与睡眠深度明显增强。'
              : '中枢神经脱离尼古丁急速刺激，自律神经系统启动自我稳态调节，缓解初期的生理撤退性焦躁与空虚感。')
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
      const isAlreadyPunched = this.data.isTodayPunched;
      const calStats = this.data.calendarStats || {};

      if (isAlreadyPunched) {
        try {
          if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
        } catch (err) {}
        try {
          audioManager.playClick();
        } catch (e) {}
        toast.info(`今日自律已点亮入册 ✓ 连续坚持 ${calStats.streakDays || 1} 天，保持纯净呼吸！`);
        return;
      }

      // 未打卡 -> 触发点亮心灯仪式感 (Haptic + Zen Illumination Animation + Sound + Flame Toast)
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'medium' });
      } catch (err) {}
      try {
        audioManager.playClick();
      } catch (e) {}

      this.setData({ isStamping: true });
      if (this._stampTimer) clearTimeout(this._stampTimer);
      this._stampTimer = setTimeout(() => {
        this.setData({ isStamping: false });
      }, 500);

      storageService.recordDailyCheckIn();
      this.buildCalendarData();
      const updatedStats = this.data.calendarStats || {};
      toast.flame(`自律觉醒！今日自律已点亮入册 ✓ 连续坚持 ${updatedStats.streakDays || 1} 天！`);
    },

    onTapCalendarDay(e) {
      const item = e.currentTarget.dataset.day;
      if (!item || item.empty) return;
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (err) {}
      try {
        audioManager.playClick();
      } catch (e) {}

      const profile = this.data.profile || {};
      const packPrice = Number(profile.packPrice) || 25;
      const singlePrice = packPrice / 20;
      const count = item.count || (item.isPunched ? 1 : 0);
      const savedMoney = (count * singlePrice).toFixed(2);
      const tarAvoided = count * 10;
      const lifeRegained = count * 11;

      let statusTag = '未打卡';
      let statusEmoji = '🌱';
      let headline = '保持自律初心';
      let quote = '少抽一支真烟，肺部就多一次清澈自愈的机会。';

      if (item.isFuture) {
        statusTag = '未来可期';
        statusEmoji = '⏳';
        headline = '待解锁的纯净之日';
        quote = '每一个明天的纯净呼吸，都取决于今天脚踏实地的自律。';
      } else if (item.isToday) {
        if (item.isPunched) {
          statusTag = '今日已打卡';
          statusEmoji = '🎖️';
          headline = '今日自律觉醒 · 成果达成';
          quote = '今日已成功完成自律打卡，每一次对真烟的拒绝，都是对健康最深刻的尊重！';
        } else {
          statusTag = '今日待盖印';
          statusEmoji = '✦';
          headline = '今日自律印章等待盖下';
          quote = '今天也是值得骄傲的一天，轻触下方一键敲章，点亮今日自律徽记！';
        }
      } else if (item.isPunched) {
        statusTag = '自律已达成';
        statusEmoji = '🏆';
        headline = '历史自律徽记 · 功德圆满';
        quote = '该日坚决战胜烟瘾心魔，每一分钟延展的健康时光都是您生命的无价资产！';
      } else {
        statusTag = '该日未记录';
        statusEmoji = '☕';
        headline = '过往已成序章';
        quote = '断签不必自责，自律是一生的修行而非机械的连击。今日随时可以深呼吸，为生命重新盖下觉醒印章！';
      }

      this.setData({
        showDayDetailModal: true,
        selectedCalendarDay: {
          ...item,
          formattedDate: `${item.year || this.data.calendarYear}年${item.month || this.data.calendarMonth}月${item.day}日`,
          count,
          savedMoney,
          tarAvoided,
          lifeRegained,
          statusTag,
          statusEmoji,
          headline,
          quote
        }
      });
    },

    closeDayDetailModal() {
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (err) {}
      this.setData({ showDayDetailModal: false });
    },

    onQuickPunchFromModal() {
      this.closeDayDetailModal();
      this.onTapPunchCard();
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

    onAvatarError(e) {
      console.warn('Avatar image failed to load, falling back to default vector SVG', e);
      this.setData({ 'profile.avatarUrl': '' });
      this.triggerEvent('updateavatar', { avatarUrl: '' });
    },

    onNicknameChange(e) {
      const raw = (e.detail && e.detail.value ? e.detail.value : '');
      const nickName = raw.replace(/[\r\n\t]/g, '').trim().slice(0, 16);
      if (nickName) {
        this.triggerEvent('updatenickname', { nickName });
      }
    },

    onNicknameBlur(e) {
      const raw = (e.detail && e.detail.value ? e.detail.value : '');
      const nickName = raw.replace(/[\r\n\t]/g, '').trim().slice(0, 16);
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
      if (this._isNavigating) return;
      this._isNavigating = true;
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (err) {}
      wx.navigateTo({
        url: '/pages/vip/vip',
        fail: () => {
          this._isNavigating = false;
        },
        complete: () => {
          setTimeout(() => {
            this._isNavigating = false;
          }, 500);
        }
      });
    },

    onTapBanknote() {
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (err) {}
      const quotes = [
        '一张1元，少抽一支就多存一张！',
        '老板，来一包……不抽了，省钱！',
        '这可是凭毅力积攒下的真金白银！',
        '少抽烟多存钱，钱包鼓鼓身体棒！'
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      toast.success(randomQuote);
    },

    // 荣耀称号殿堂数据刷新与严格顺序逐级点亮计算 (从低到高排列，按最高点亮称号自动佩戴)
    updateAchievementsData() {
      try {
        const rawUnlocked = storageService.getUnlockedAchievements() || [];
        let unlockedIds = normalizeUnlockedIds(rawUnlocked);

        const totalSubs = Number(this.data.totalSubstituted) || 0;
        const totalSaved = Number(this.data.totalSavedMoney) || 0;
        const quitDays = (Number(this.data.quitDays) || 0) + 1;

        const statsObj = {
          totalSubstituted: totalSubs,
          totalSavedMoney: totalSaved,
          quitDays
        };

        const newlyUnlocked = checkAchievementsToUnlock(statsObj, unlockedIds);
        if (Array.isArray(newlyUnlocked) && newlyUnlocked.length > 0) {
          newlyUnlocked.forEach(id => storageService.unlockAchievement(id));
          unlockedIds = normalizeUnlockedIds([...unlockedIds, ...newlyUnlocked]);
        }

        // 获取当前已点亮中最高等级的称号
        const highestTitle = getHighestUnlockedTitle(unlockedIds);
        let equippedTitle = storageService.getEquippedTitle();

        // 核心规则：若未设置佩戴，或当前佩戴的称号不在已点亮列表中，或刚刚点亮了新的更高称号 -> 自动按最高佩戴
        const isCurrentEquippedValid = unlockedIds.some(id => {
          const a = ACHIEVEMENTS.find(item => item.id === id);
          return a && a.name === equippedTitle;
        });

        if (!equippedTitle || !isCurrentEquippedValid || (newlyUnlocked && newlyUnlocked.length > 0)) {
          equippedTitle = highestTitle;
          storageService.setEquippedTitle(highestTitle);
        }

        // 从低到高 (Lv.1 -> Lv.16) 映射称号列表，计算 isNext, prevName, level, isEquipped
        const list = ACHIEVEMENTS.map((item, index) => {
          const unlocked = unlockedIds.includes(item.id);
          const isEquipped = item.name === equippedTitle;
          const progress = getAchievementProgress(item, statsObj);
          
          // 线性序列：第一个未点亮的即为当前待点亮目标 (isNext)
          const isNext = !unlocked && (index === 0 || unlockedIds.includes(ACHIEVEMENTS[index - 1].id));
          const prevItem = index > 0 ? ACHIEVEMENTS[index - 1] : null;

          return {
            ...item,
            level: index + 1,
            unlocked,
            isNext,
            isLocked: !unlocked && !isNext,
            isEquipped,
            progress,
            prevName: prevItem ? prevItem.name : ''
          };
        });

        const unlockedCount = list.filter(a => a.unlocked).length;
        const totalCount = list.length || 16;
        const completionRate = Math.round((unlockedCount / totalCount) * 100);

        this.setData({
          achievementsList: list,
          unlockedAchievementsCount: unlockedCount,
          achievementsCompletionRate: completionRate,
          equippedTitle: equippedTitle || '无烟觉醒者'
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
      const equippedTitle = storageService.getEquippedTitle() || this.data.equippedTitle;
      const fullItem = {
        ...item,
        isEquipped: item.name === equippedTitle
      };
      this.setData({
        selectedAchievement: fullItem,
        showAchievementModal: true
      });
    },

    onEquipTitle(e) {
      const title = e.currentTarget.dataset.title;
      if (!title) return;
      storageService.setEquippedTitle(title);
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'heavy' });
      } catch (err) {}
      audioManager.unlockAudio();
      audioManager.playSwitchSound();
      audioManager.playZenChimeSound(880);
      toast.flame(`👑 佩戴成功！称号【${title}】已同步全场与英雄榜！`);
      this.setData({
        showAchievementModal: false,
        selectedAchievement: null
      });
      this.updateAchievementsData();
      this.triggerEvent('titlechange', { title });
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

    preventBubble() {},

    preventTouchMove() {},

    onGoToVip() {
      if (this._isNavigating) return;
      this._isNavigating = true;
      audioManager.playSwitchSound();
      wx.navigateTo({
        url: '/pages/vip/vip',
        complete: () => {
          setTimeout(() => {
            this._isNavigating = false;
          }, 800);
        }
      });
    },

    /* ==========================================================================
     * 微信审核合规协议与隐私政策查看通道
     * ========================================================================== */
    onOpenUserAgreement() {
      triggerHaptic('light');
      this.setData({
        showProtocolModal: true,
        protocolType: 'user'
      });
    },

    onOpenPrivacyPolicy() {
      triggerHaptic('light');
      this.setData({
        showProtocolModal: true,
        protocolType: 'privacy'
      });
    },

    closeProtocolModal() {
      triggerHaptic('light');
      this.setData({
        showProtocolModal: false
      });
    },

    onOpenPlatformDisclaimer() {
      wx.showModal({
        title: '版权与免责合规声明',
        content: '1. 本小程序为数字化行为替代减压工具，不具有任何医疗诊断与处方功能。\n2. 全站所有拟态名烟视觉均属数字化原创艺术致敬与防伪辨识，不销售任何真实烟草制品。\n3. 用户本地打卡数据均存储于用户终端设备，严格遵守隐私保护法规。',
        showCancel: false,
        confirmText: '我已了解',
        confirmColor: '#10b981'
      });
    },

    /* ==========================================================================
     * [DEV_ADMIN_TEST] 管理员测试模式快速入口 (点击即开/关 · 联动首页DOCK栏)
     * ========================================================================== */
    onTapCopyright() {
      // 生产环境 (release) 严格封禁测试入口，防止普通用户触发提权后门
      try {
        const accountInfo = wx.getAccountInfoSync ? wx.getAccountInfoSync() : null;
        const envVersion = (accountInfo && accountInfo.miniProgram) ? accountInfo.miniProgram.envVersion : 'release';
        if (envVersion === 'release') {
          return;
        }
      } catch (e) {}

      // 仅限开发与体验版：需在 3 秒内连续点击 7 次才可唤起，彻底杜绝误触
      const now = Date.now();
      if (!this._copyrightTapCount || (now - (this._lastCopyrightTapTime || 0) > 3000)) {
        this._copyrightTapCount = 1;
      } else {
        this._copyrightTapCount++;
      }
      this._lastCopyrightTapTime = now;

      if (this._copyrightTapCount < 7) {
        return;
      }
      this._copyrightTapCount = 0;

      const isAlreadyUnlocked = !!wx.getStorageSync('__DEV_ADMIN_MODE__');
      if (isAlreadyUnlocked) {
        wx.removeStorageSync('__DEV_ADMIN_MODE__');
        try { if (wx.vibrateShort) wx.vibrateShort({ type: 'medium' }); } catch (e) {}
        toast.info('🛠️ 测试模式已关闭，首页DOCK按钮已隐藏');
      } else {
        wx.setStorageSync('__DEV_ADMIN_MODE__', true);
        try { if (wx.vibrateShort) wx.vibrateShort({ type: 'heavy' }); } catch (e) {}
        toast.success('🛠️ 测试模式已开启，首页DOCK栏已就绪测试按钮');
        this.triggerEvent('openadmintest');
      }
    }
    /* ==================== [DEV_ADMIN_TEST] 结束 ==================== */
  }
});

