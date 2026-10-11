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
import { ACHIEVEMENTS, getAchievementProgress } from '../../utils/achievements.js';

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
    lungPercent: 45,
    heartPercent: 78,
    bloodPercent: 82,
    brainPercent: 55,
    organInfo: {},
    organIcons: {
      lungs: LUNG_ICON_SVG,
      heart: HEART_ICON_SVG,
      blood: BLOOD_ICON_SVG,
      brain: BRAIN_ICON_SVG
    },
    defaultAvatarSvg: DEFAULT_USER_AVATAR_SVG,
    vipCrownSvg: VIP_CROWN_ICON_SVG,
    vipInfo: { isVip: false, isLifetime: false, formattedExpire: '' },

    // 我的钱包 (1元纸币娱乐数据)
    totalSavedYuan: 0,

    // 系统统计 7天每日抽烟折线图
    lineChartSvgUri: '',

    // WHO 里程碑折叠状态 (默认折叠)
    isWhoCollapsed: true,
    displayedWhoStages: [],

    // 打卡日历数据 (紧凑月历与切换)
    calendarYear: 2026,
    calendarMonth: 10,
    calendarDays: [],
    calendarStats: {
      monthPunchedCount: 0,
      totalPunchedDays: 1,
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
        calendarMonth: now.getMonth() + 1,
        selectedCalendarDay: now.getDate()
      });
      this.refreshVipStatus();
      this._syncAllStats();
      this.updateDisplayedWhoStages();
    }
  },

  pageLifetimes: {
    show() {
      this.refreshVipStatus();
    }
  },

  observers: {
    'quitDays, totalSubstituted, totalTarAvoided, totalSavedMoney, dailyTrends': function() {
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
        this.setData({ vipInfo });
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
      this.setData({
        lineChartSvgUri,
        totalSavedYuan,
        singleStickPrice
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

      const records = storageService.getRecords();
      const daysSinceQuit = Number(this.data.quitDays) || 0;

      // 打卡日期的集合
      const punchDaySet = new Set();
      if (Array.isArray(records)) {
        records.forEach(r => {
          if (!r || !r.timestamp) return;
          const d = new Date(r.timestamp);
          if (d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth) {
            punchDaySet.add(d.getDate());
          }
        });
      }

      // 显式打卡记录日期
      const checkInDates = (storageService.getCheckInDates && storageService.getCheckInDates()) || [];
      if (Array.isArray(checkInDates)) {
        checkInDates.forEach(dateStr => {
          if (typeof dateStr === 'string') {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
              const y = parseInt(parts[0], 10);
              const m = parseInt(parts[1], 10);
              const day = parseInt(parts[2], 10);
              if (y === currentYear && m === currentMonth) {
                punchDaySet.add(day);
              }
            }
          }
        });
      }

      // 戒烟以来的所有自然日历天均算作无烟打卡日（按自然日构建，彻底杜绝毫秒/小时偏差）
      for (let i = 0; i <= daysSinceQuit; i++) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        if (d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth) {
          punchDaySet.add(d.getDate());
        }
      }
      // 今天始终亮起打卡徽章
      if (isCurrentRealMonth && todayDate > 0) {
        punchDaySet.add(todayDate);
      }

      const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const firstDayWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0(周日)-6

      const calendarDays = [];
      for (let i = 0; i < firstDayWeek; i++) {
        calendarDays.push({ empty: true, key: `pad-${i}` });
      }

      let monthPunchedCount = 0;
      for (let day = 1; day <= totalDaysInMonth; day++) {
        const isToday = (day === todayDate && isCurrentRealMonth);
        const isFuture = isCurrentRealMonth ? (day > todayDate) : (new Date(currentYear, currentMonth - 1, day) > now);
        const isPunched = punchDaySet.has(day) && !isFuture;
        if (isPunched) monthPunchedCount++;

        calendarDays.push({
          empty: false,
          day,
          key: `d-${day}`,
          isToday,
          isFuture,
          isPunched
        });
      }

      const baseDenominator = isCurrentRealMonth ? Math.max(1, todayDate) : totalDaysInMonth;
      const punchRate = Math.min(100, Math.round((monthPunchedCount / baseDenominator) * 100));

      this.setData({
        calendarYear: currentYear,
        calendarMonth: currentMonth,
        calendarDays,
        calendarStats: {
          monthPunchedCount,
          totalPunchedDays: Math.max(
            monthPunchedCount,
            daysSinceQuit + 1,
            Array.isArray(checkInDates) ? checkInDates.length : 0
          ),
          punchRate
        }
      });
    },

    updateOrganMetrics() {
      const days = Number(this.data.quitDays) || 0;
      const subs = Number(this.data.totalSubstituted) || 0;
      const tar = Number(this.data.totalTarAvoided) || 0;

      // 1. 肺部自愈度
      const lungPercent = Math.min(99, Math.max(16, Math.round(18 + days * 2.6 + subs * 0.45)));
      // 2. 心血管自愈度
      const heartPercent = Math.min(99, Math.max(38, Math.round(42 + days * 3.2 + subs * 0.5)));
      // 3. 血液循环系统
      const bloodPercent = Math.min(100, Math.max(45, Math.round(52 + days * 3.5 + subs * 0.55)));
      // 4. 神经中枢与自律神经
      const brainPercent = Math.min(96, Math.max(22, Math.round(25 + days * 2.8 + subs * 0.38)));

      const activeOrgan = this.data.activeOrgan || 'lungs';
      const organDictionary = {
        lungs: {
          id: 'lungs',
          name: '双肺呼吸系统',
          icon: '🫁',
          iconUri: LUNG_ICON_SVG,
          percent: lungPercent,
          color: '#10b981',
          accentBg: 'rgba(16, 185, 129, 0.12)',
          stageTitle: lungPercent >= 75 ? '晶莹新生 · 纤毛畅通' : (lungPercent >= 45 ? '深层代谢 · 焦油排出' : '早期自愈 · 纤毛苏醒'),
          statusBadge: '自愈加速中',
          statMetrics: [
            { label: '阻断有害焦油', val: `${tar} mg`, highlight: true },
            { label: '纤毛摆动活力', val: `${lungPercent}%` },
            { label: '通气阻力下降', val: `-${Math.min(38, Math.round(lungPercent * 0.38))}%` }
          ],
          clinicalDesc: '双肺支气管纤毛麻痹状态已完全解除，左肺与右肺粘液清除系统同步恢复规律摆动。肺泡巨噬细胞正在深层分解并搬运沉着焦油颗粒，双肺气体交换通畅度显著跃升。'
        },
        heart: {
          id: 'heart',
          name: '心血管与脉管',
          icon: '🫀',
          iconUri: HEART_ICON_SVG,
          percent: heartPercent,
          color: '#f59e0b',
          accentBg: 'rgba(245, 158, 11, 0.12)',
          stageTitle: heartPercent >= 80 ? '负荷骤减 · 供氧充沛' : '节律恢复 · 血压回稳',
          statusBadge: '机能充盈',
          statMetrics: [
            { label: '静息心率回落', val: '-8~12 bpm', highlight: true },
            { label: '心肌供氧能力', val: `${heartPercent}%` },
            { label: '冠脉负荷下降', val: `-${Math.min(42, Math.round(heartPercent * 0.42))}%` }
          ],
          clinicalDesc: '停吸后外周血管痉挛现象迅速消除，冠状动脉血流阻力显著降低，心肌获得纯净富氧血液灌注，运动耐力与心脏负荷能力全面回升。'
        },
        blood: {
          id: 'blood',
          name: '血液循环网络',
          icon: '🩸',
          iconUri: BLOOD_ICON_SVG,
          percent: bloodPercent,
          color: '#06b6d4',
          accentBg: 'rgba(6, 182, 212, 0.12)',
          stageTitle: bloodPercent >= 85 ? '一氧化碳排空 · 高纯携氧' : '代谢净化 · 血氧回归',
          statusBadge: '高纯携氧',
          statMetrics: [
            { label: '一氧化碳排空', val: days >= 1 || subs >= 5 ? '100%' : '88%', highlight: true },
            { label: '血氧饱和指数', val: '98.5%' },
            { label: '微循环流速', val: `+${Math.min(35, Math.round(bloodPercent * 0.35))}%` }
          ],
          clinicalDesc: '碳氧血红蛋白完全解离，血液中一氧化碳浓度已降至常人健康水平。红细胞运氧效率达峰值，末梢手脚冰凉与组织微循环缺氧症状彻底改善。'
        },
        brain: {
          id: 'brain',
          name: '中枢多巴胺神经',
          icon: '🧠',
          iconUri: BRAIN_ICON_SVG,
          percent: brainPercent,
          color: '#8b5cf6',
          accentBg: 'rgba(139, 92, 246, 0.12)',
          stageTitle: brainPercent >= 70 ? '受体自主平衡 · 情绪自律' : '多巴胺重塑 · 焦虑退散',
          statusBadge: '神经脱敏',
          statMetrics: [
            { label: '受体脱敏率', val: `${brainPercent}%`, highlight: true },
            { label: '深度睡眠改善', val: `+${Math.min(40, Math.round(brainPercent * 0.4))}%` },
            { label: '心理依赖消除', val: `${Math.min(90, Math.round(brainPercent * 0.9))}%` }
          ],
          clinicalDesc: '大脑乙酰胆碱尼古丁受体密度逐步下调至健康基准线，天然多巴胺分泌自律机制重建，告别烟瘾焦虑与心烦意乱，深睡眠脑电波显著增强。'
        }
      };

      this.setData({
        lungPercent,
        heartPercent,
        bloodPercent,
        brainPercent,
        organInfo: organDictionary[activeOrgan] || organDictionary.lungs
      });
    },

    onSelectOrgan(e) {
      const organ = e.currentTarget.dataset.organ;
      if (!organ) return;
      try {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
      } catch (err) {}
      this.setData({ activeOrgan: organ }, () => {
        this.updateOrganMetrics();
      });
    },

    onOpenProfileModal() {
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
        const unlockedIds = storageService.getUnlockedAchievements() || [];
        const totalSubs = Number(this.data.totalSubstituted) || 0;
        const totalSaved = Number(this.data.totalSavedMoney) || 0;
        const quitDays = (Number(this.data.quitDays) || 0) + 1;
        const unlockedEffects = storageService.getUnlockedSmokeEffects() || [];

        const stats = {
          totalSubstituted: totalSubs,
          totalSavedMoney: totalSaved,
          quitDays,
          unlockedEffects,
          unlockedEffectsCount: unlockedEffects.length,
          hasCustomEffect: unlockedEffects.some(id => !['cloud_dense', 'silk_pure', 'ring_classic'].includes(id)),
          hasSummonedMythic: unlockedEffects.includes('dragon_breath') || unlockedEffects.includes('phoenix_nirvana')
        };

        const list = ACHIEVEMENTS.map(item => {
          const unlocked = unlockedIds.includes(item.id);
          const progress = getAchievementProgress(item, stats);
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
