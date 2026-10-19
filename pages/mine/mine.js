// pages/mine/mine.js
import { audioManager } from '../../services/audioManager.js';
import { triggerHaptic } from '../../services/haptics.js';
import { toast } from '../../services/toastService.js';
import { storageService } from '../../services/storageService.js';
import { leaderboardService } from '../../services/leaderboardService.js';
import { vipService } from '../../services/vipService.js';
import {
  calculateSavings,
  calculateTarAvoided,
  calculateLifeRegained,
  calculateQuitDays,
  getWhoStages
} from '../../configs/healthCalculator.js';
import { checkAchievementsToUnlock } from '../../configs/achievements.js';
import {
  PRICE_COIN_ICON_SVG,
  CIGS_COUNT_ICON_SVG,
  YEARS_CLOCK_ICON_SVG,
  PROJECTION_SPARK_SVG
} from '../../utils/vectorIcons.js';
import { measureSafeAreaSync, detectIsIOS } from '../../utils/safeArea.js';
import { navigateBackWithSound } from '../../utils/navigation.js';

/* ==========================================================================
 * [DEV_ADMIN_TEST] 调试元数据引入 (可随时安全删除)
 * ========================================================================== */
import { CIGARETTE_CATALOG } from '../../configs/catalog.js';
import { SMOKE_EFFECTS } from '../../configs/smokeEffects.js';
import { ACHIEVEMENTS } from '../../configs/achievements.js';
import { VIP_THEME_OPTIONS, VIP_THEME_CATEGORIES, getThemeById } from '../../configs/vipThemes.js';
/* ==================== [DEV_ADMIN_TEST] 结束 ==================== */

const QUICK_PRICE_PRESETS = [
  { val: 15, label: '¥15 白沙' },
  { val: 25, label: '¥25 芙蓉王' },
  { val: 45, label: '¥45 硬中华' },
  { val: 65, label: '¥65 软中华' },
  { val: 100, label: '¥100 和天下' }
];

const QUICK_CIG_PRESETS = [
  { val: 5, label: '5支' },
  { val: 10, label: '10支(半包)' },
  { val: 15, label: '15支' },
  { val: 20, label: '20支(1包)' },
  { val: 30, label: '30支+' }
];

const QUICK_YEAR_PRESETS = [
  { val: 1, label: '1年内' },
  { val: 3, label: '3年' },
  { val: 5, label: '5年' },
  { val: 10, label: '10年' },
  { val: 20, label: '20年+' }
];


function computeProfileProjections(profile = {}) {
  const packPrice = Number(profile.packPrice) || 25;
  const cigsPerDay = Number(profile.cigsPerDay) || 15;
  const smokeYears = Number(profile.smokeYears) || 0;

  const annualMoney = Math.round((cigsPerDay / 20) * packPrice * 365);
  const annualTar = ((cigsPerDay * 10 * 365) / 1000).toFixed(1);
  const dailyMoney = ((cigsPerDay / 20) * packPrice).toFixed(1);
  const annualPacks = Math.round((cigsPerDay / 20) * 365);

  return {
    annualMoney,
    annualMoneyFormatted: annualMoney.toLocaleString('zh-CN'),
    annualTar,
    dailyMoney,
    annualPacks
  };
}


function computeMineStatsPayload() {
  const profile = storageService.getProfile();
  const records = storageService.getRecords();
  const totalSubs = records.length;
  const totalSaved = calculateSavings(totalSubs, profile.packPrice);
  const totalTar = calculateTarAvoided(totalSubs);
  const totalLife = calculateLifeRegained(totalSubs);
  const quitDays = calculateQuitDays(profile.quitStartDate);
  const dailyRaw = storageService.getRecentDailyStats(7);

  const counts = (Array.isArray(dailyRaw) ? dailyRaw : []).map(d => Number(d.count) || 0);
  const maxCount = Math.max(5, ...counts);
  const dailyTrends = (Array.isArray(dailyRaw) ? dailyRaw : []).map(d => ({
    ...d,
    count: Number(d.count) || 0,
    percent: (Number(d.count) || 0) > 0 ? Math.min(100, Math.round(((Number(d.count) || 0) / maxCount) * 100)) : 6
  }));

  const todayStat = dailyRaw.find(d => d.label === '今天') || dailyRaw[dailyRaw.length - 1];
  const todayCount = todayStat ? Number(todayStat.count) || 0 : 0;

  const sumDaily = dailyRaw.reduce((acc, curr) => acc + curr.count, 0);
  const weeklyAvg = dailyRaw.length ? (sumDaily / dailyRaw.length).toFixed(1) : '0.0';

  const whoStages = getWhoStages(profile.quitStartDate);

  const leaderResult = leaderboardService.getLeaderboard('substituted', {
    substituted: totalSubs,
    savedMoney: Math.round(totalSaved),
    days: quitDays + 1
  }, profile);

  const igniteCount = storageService.getIgniteCount();

  // 同步评估并解锁已达成的荣耀勋章
  try {
    const unlockedIds = storageService.getUnlockedAchievements() || [];
    const unlockedEffects = storageService.getUnlockedSmokeEffects() || [];
    const summonedEffects = storageService.getSummonedSmokeEffects() || [];
    const allEffects = Array.from(new Set([...unlockedEffects, ...summonedEffects]));
    const statsObj = {
      totalSubstituted: totalSubs,
      totalSavedMoney: totalSaved,
      quitDays: quitDays + 1,
      unlockedEffects: allEffects,
      unlockedEffectsCount: allEffects.length,
      hasCustomEffect: allEffects.some(id => id !== 'ring_classic' && id !== 'auspicious_river'),
      hasSummonedMythic: allEffects.includes('dragon_breath') || allEffects.includes('phoenix_nirvana') || allEffects.includes('buddha_light') || allEffects.includes('bagua_taichi') || allEffects.includes('auspicious_river')
    };
    const newlyUnlocked = checkAchievementsToUnlock(statsObj, unlockedIds);
    if (Array.isArray(newlyUnlocked) && newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(id => storageService.unlockAchievement(id));
    }
  } catch (err) {}

  return {
    profile,
    myRankInfo: leaderResult.myRankInfo,
    totalSubstituted: totalSubs,
    totalPacksSaved: (totalSubs / 20).toFixed(1),
    totalSavedMoney: totalSaved.toFixed(2),
    totalTarAvoided: totalTar,
    totalLifeRegained: totalLife,
    lifeRegainedHours: (totalLife / 60).toFixed(1),
    igniteCount,
    totalIgnites: igniteCount,
    totalFinishedCigs: totalSubs,
    quitDays,
    todayCount,
    dailyTrends,
    weeklyAvg,
    whoStages,
    editProfile: { ...profile }
  };
}

function buildInitialMineState() {
  const safeArea = measureSafeAreaSync();
  const staticPresets = {
    quickPricePresets: QUICK_PRICE_PRESETS,
    quickCigPresets: QUICK_CIG_PRESETS,
    quickYearPresets: QUICK_YEAR_PRESETS,
    priceCoinIcon: PRICE_COIN_ICON_SVG,
    cigsCountIcon: CIGS_COUNT_ICON_SVG,
    yearsClockIcon: YEARS_CLOCK_ICON_SVG,
    projectionSparkIcon: PROJECTION_SPARK_SVG
  };
  try {
    const payload = computeMineStatsPayload();
    return {
      ...safeArea,
      ...payload,
      ...staticPresets,
      projections: computeProfileProjections(payload.profile),
      vipTheme: vipService.getVipTheme() || 'classic',
      showProfileModal: false,
      isIOS: detectIsIOS(),
      /* ==================== [DEV_ADMIN_TEST] 初始状态 ==================== */
      showAdminTestModal: false,
      devVipActive: vipService.isVip(),
      devVipInfo: vipService.getVipInfo(),
      devCurrentPackCount: storageService.getPackCount(storageService.getSelectedCigaretteId(), 20)
      /* ==================== [DEV_ADMIN_TEST] 结束 ==================== */
    };
  } catch (e) {
    console.error('buildInitialMineState error:', e);
    let storedProfile = {};
    try {
      storedProfile = storageService.getProfile() || {};
    } catch (pe) {}
    const fallbackProfile = {
      packPrice: storedProfile.packPrice || 25,
      cigsPerDay: storedProfile.cigsPerDay || 15,
      smokeYears: storedProfile.smokeYears || 5,
      ...storedProfile
    };
    return {
      ...safeArea,
      ...staticPresets,
      projections: computeProfileProjections(fallbackProfile),
      vipTheme: 'classic',
      isIOS: false,
      profile: fallbackProfile,
      myRankInfo: {
        rank: 1,
        title: '无烟觉醒者',
        beatPercent: 50.0,
        substituted: 0,
        savedMoney: 0,
        days: 1
      },
      totalSubstituted: 0,
      totalPacksSaved: '0.0',
      totalSavedMoney: '0.00',
      totalTarAvoided: 0,
      totalLifeRegained: 0,
      lifeRegainedHours: '0.0',
      igniteCount: 0,
      totalIgnites: 0,
      totalFinishedCigs: 0,
      quitDays: 0,
      weeklyAvg: '0.0',
      todayCount: 0,
      dailyTrends: [],
      whoStages: [],
      showProfileModal: false,
      editProfile: fallbackProfile
    };
  }
}

/**
 * 微信临时头像路径转持久化用户存储路径
 * 防止临时文件被小程序系统回收清除后变成黑圈/无法加载
 */
function persistAvatarFile(tempPath) {
  if (!tempPath || typeof tempPath !== 'string') return '';
  // 如果是网络图片、Base64 或内联 SVG，直接使用
  if (tempPath.startsWith('data:') || tempPath.startsWith('https://')) {
    return tempPath;
  }
  // http://tmp/ 是微信客户端/开发者的临时路径，需要保存；如果已经是永久用户目录则直接返回
  if (wx.env && wx.env.USER_DATA_PATH && tempPath.startsWith(wx.env.USER_DATA_PATH)) {
    return tempPath;
  }

  try {
    if (wx.getFileSystemManager && wx.env && wx.env.USER_DATA_PATH) {
      const fs = wx.getFileSystemManager();
      let ext = '.png';
      const dotIdx = tempPath.lastIndexOf('.');
      if (dotIdx !== -1) {
        const potentialExt = tempPath.substring(dotIdx).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(potentialExt)) {
          ext = potentialExt;
        }
      }
      const targetPath = `${wx.env.USER_DATA_PATH}/user_avatar_${Date.now()}${ext}`;

      // 清理旧的历史头像文件，防止占用存储
      try {
        const dirFiles = fs.readdirSync(wx.env.USER_DATA_PATH);
        if (Array.isArray(dirFiles)) {
          dirFiles.forEach(f => {
            if (f.startsWith('user_avatar_')) {
              try { fs.unlinkSync(`${wx.env.USER_DATA_PATH}/${f}`); } catch (e) {}
            }
          });
        }
      } catch (e) {}

      // 优先同步移动/保存临时文件
      try {
        fs.saveFileSync(tempPath, targetPath);
        return targetPath;
      } catch (eSave) {
        try {
          fs.copyFileSync(tempPath, targetPath);
          return targetPath;
        } catch (eCopy) {
          console.warn('saveFileSync / copyFileSync failed, fallback to tempPath', eCopy);
        }
      }
    }
  } catch (err) {
    console.warn('persistAvatarFile error:', err);
  }
  return tempPath;
}

Page({
  data: buildInitialMineState(),

  onLoad() {
    this._skipFirstShowRefresh = true;
    try {
      storageService.recordDailyCheckIn();
    } catch (e) {}
    this.measureSafeArea();
    this.refreshAllData();
  },

  onShow() {
    this._isNavigating = false;
    try {
      storageService.recordDailyCheckIn();
    } catch (e) {}
    this.measureSafeArea();
    if (this._skipFirstShowRefresh) {
      this._skipFirstShowRefresh = false;
      this.setData({ vipTheme: vipService.getVipTheme() });
      return;
    }
    this.refreshAllData();
  },

  measureSafeArea() {
    const safeArea = measureSafeAreaSync();
    this.setData(safeArea);
  },

  refreshAllData() {
    try {
      const safeArea = measureSafeAreaSync();
      const vipInfo = vipService.getVipInfo();
      const curCigId = storageService.getSelectedCigaretteId();
      const curPackCount = storageService.getPackCount(curCigId, 20);
      this.setData({
        ...safeArea,
        ...computeMineStatsPayload(),
        vipTheme: vipService.getVipTheme() || 'classic',
        isVip: !!(vipInfo && vipInfo.isVip),
        vipInfo,
        activeVipThemeId: vipService.getVipTheme() || 'classic',
        activeThemeObj: getThemeById(vipService.getVipTheme()) || VIP_THEME_OPTIONS[0],
        /* ==================== [DEV_ADMIN_TEST] 动态状态同步 ==================== */
        devVipActive: vipInfo.isVip,
        devVipInfo: vipInfo,
        devCurrentPackCount: curPackCount
        /* ==================== [DEV_ADMIN_TEST] 结束 ==================== */
      });
    } catch (e) {
      console.error('refreshAllData error:', e);
    }
  },

  // 微信头像选择与持久化同步
  onUpdateAvatar(e) {
    try {
      const avatarUrl = e.detail && e.detail.avatarUrl ? e.detail.avatarUrl : '';
      if (!avatarUrl) {
        const updated = storageService.updateProfile({ avatarUrl: '' });
        this.setData({ profile: updated });
        this.refreshAllData();
        return;
      }
      // 本地即时保存与秒级渲染 (0ms 无白屏)
      const savedPath = persistAvatarFile(avatarUrl);
      const updated = storageService.updateProfile({ avatarUrl: savedPath });
      this.setData({ profile: updated });
      this.refreshAllData();
    } catch (err) {
      console.error('onUpdateAvatar error:', err);
    }
  },

  // 微信昵称输入与同步
  onUpdateNickname(e) {
    try {
      const raw = (e.detail && e.detail.nickName ? e.detail.nickName : '');
      const sanitized = raw.replace(/[\r\n\t]/g, '').trim().slice(0, 16);
      if (!sanitized) return;
      const updated = storageService.updateProfile({ nickName: sanitized });
      this.setData({ profile: updated });
      this.refreshAllData();
    } catch (err) {
      console.error('onUpdateNickname error:', err);
    }
  },

  onTitleChange(e) {
    try {
      this.refreshAllData();
    } catch (err) {
      console.warn('onTitleChange error:', err);
    }
  },

  // 跳转英雄榜
  goToLeaderboard() {
    if (this._isNavigating) return;
    this._isNavigating = true;
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    wx.navigateTo({
      url: '/pages/leaderboard/leaderboard',
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

  // 响应 stats-view 内换肤即时切换全站主题
  onVipThemeChange(e) {
    const themeId = (e.detail && e.detail.themeId) || vipService.getVipTheme();
    if (themeId) {
      this.setData({ vipTheme: themeId });
    }
  },

  // 响应未解锁主题临时预览当前页面光影
  onVipThemePreview(e) {
    const themeId = e.detail && e.detail.themeId;
    if (themeId) {
      this.setData({ vipTheme: themeId });
    }
  },

  // 偏好设置弹窗
  openProfileModal() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    const p = storageService.getProfile();
    const editProfile = {
      packPrice: p.packPrice || 25,
      cigsPerDay: p.cigsPerDay || 15,
      smokeYears: p.smokeYears !== undefined ? p.smokeYears : 5
    };
    this.setData({
      showProfileModal: true,
      editProfile,
      projections: computeProfileProjections(editProfile)
    });
  },

  closeProfileModal() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.setData({ showProfileModal: false });
  },

  updateEditProfile(partial) {
    const updated = {
      ...this.data.editProfile,
      ...partial
    };
    const projections = computeProfileProjections(updated);
    this.setData({
      editProfile: updated,
      projections
    });
  },

  adjustPackPrice(e) {
    const delta = Number(e.currentTarget.dataset.delta);
    const cur = Number(this.data.editProfile.packPrice) || 25;
    const val = Math.min(100, Math.max(5, cur + delta));
    this.updateEditProfile({ packPrice: val });
    triggerHaptic('light');
  },

  setQuickPrice(e) {
    const val = Number(e.currentTarget.dataset.val);
    const clamped = Math.min(100, Math.max(5, val));
    this.updateEditProfile({ packPrice: clamped });
    triggerHaptic('light');
  },

  onInputPackPrice(e) {
    const raw = e.detail.value;
    if (raw === '') {
      this.updateEditProfile({ packPrice: '' });
      return;
    }
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;
    const val = Math.min(100, Math.max(0, num));
    this.updateEditProfile({ packPrice: val });
  },

  onBlurPackPrice(e) {
    let num = parseInt(e.detail.value, 10);
    if (isNaN(num) || num < 5) {
      num = (num > 0 && num < 5) ? 5 : 25;
    } else if (num > 100) {
      num = 100;
    }
    this.updateEditProfile({ packPrice: num });
  },

  adjustCigsPerDay(e) {
    const delta = Number(e.currentTarget.dataset.delta);
    const cur = Number(this.data.editProfile.cigsPerDay) || 15;
    const val = Math.min(100, Math.max(1, cur + delta));
    this.updateEditProfile({ cigsPerDay: val });
    triggerHaptic('light');
  },

  setQuickCigs(e) {
    const val = Number(e.currentTarget.dataset.val);
    const clamped = Math.min(100, Math.max(1, val));
    this.updateEditProfile({ cigsPerDay: clamped });
    triggerHaptic('light');
  },

  onInputCigsPerDay(e) {
    const raw = e.detail.value;
    if (raw === '') {
      this.updateEditProfile({ cigsPerDay: '' });
      return;
    }
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;
    const val = Math.min(100, Math.max(0, num));
    this.updateEditProfile({ cigsPerDay: val });
  },

  onBlurCigsPerDay(e) {
    let num = parseInt(e.detail.value, 10);
    if (isNaN(num) || num < 1) {
      num = 15;
    } else if (num > 100) {
      num = 100;
    }
    this.updateEditProfile({ cigsPerDay: num });
  },

  adjustSmokeYears(e) {
    const delta = Number(e.currentTarget.dataset.delta);
    const cur = Number(this.data.editProfile.smokeYears) || 0;
    const val = Math.min(70, Math.max(0, cur + delta));
    this.updateEditProfile({ smokeYears: val });
    triggerHaptic('light');
  },

  setQuickYears(e) {
    const val = Number(e.currentTarget.dataset.val);
    const clamped = Math.min(70, Math.max(0, val));
    this.updateEditProfile({ smokeYears: clamped });
    triggerHaptic('light');
  },

  onInputSmokeYears(e) {
    const raw = e.detail.value;
    if (raw === '') {
      this.updateEditProfile({ smokeYears: '' });
      return;
    }
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;
    const val = Math.min(70, Math.max(0, num));
    this.updateEditProfile({ smokeYears: val });
  },

  onBlurSmokeYears(e) {
    let num = parseInt(e.detail.value, 10);
    if (isNaN(num) || num < 0) {
      num = 5;
    } else if (num > 70) {
      num = 70;
    }
    this.updateEditProfile({ smokeYears: num });
  },

  saveProfile() {
    let packPrice = Number(this.data.editProfile.packPrice);
    if (isNaN(packPrice) || packPrice < 5) packPrice = 25;
    if (packPrice > 100) packPrice = 100;

    let cigsPerDay = Number(this.data.editProfile.cigsPerDay);
    if (isNaN(cigsPerDay) || cigsPerDay < 1) cigsPerDay = 15;
    if (cigsPerDay > 100) cigsPerDay = 100;

    let smokeYears = Number(this.data.editProfile.smokeYears);
    if (isNaN(smokeYears) || smokeYears < 0) smokeYears = 5;
    if (smokeYears > 70) smokeYears = 70;

    const updated = {
      ...this.data.profile,
      packPrice,
      cigsPerDay,
      smokeYears
    };
    storageService.saveProfile(updated);
    this.setData({ showProfileModal: false });
    audioManager.playSwitchSound();
    triggerHaptic('medium');
    toast.success('已保存偏好设置');
    this.refreshAllData();
  },

  onNavigateBack() {
    navigateBackWithSound();
  },

  preventTouchMove() {},

  /* ==========================================================================
   * [DEV_ADMIN_TEST] 管理员极速测试控制台业务逻辑 (可整块安全删除)
   * ========================================================================== */
  preventBubble() {},

  onOpenAdminTest() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('medium');
    const vipInfo = vipService.getVipInfo();
    const curCigId = storageService.getSelectedCigaretteId();
    const curPackCount = storageService.getPackCount(curCigId, 20);
    const dailySmoked = storageService.getDailySmokedCount();
    this.setData({
      showAdminTestModal: true,
      devVipActive: vipInfo.isVip,
      devVipInfo: vipInfo,
      devCurrentPackCount: curPackCount,
      devDailySmokedCount: dailySmoked
    });
  },

  onCloseAdminTest() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.setData({ showAdminTestModal: false });
  },

  // 1. 首页吸烟仿真与燃烧进度 (关键要求)
  devSetSmokeProgress90() {
    triggerHaptic('heavy');
    wx.setStorageSync('__DEV_PENDING_ACTION__', {
      type: 'SET_PROGRESS',
      progress: 0.10, // 燃烧还剩10%，即吸了90%
      ashRatio: 0.90, // 烟灰90%厚灰
      state: 'IDLE_BURNING',
      msg: '🔥 首页烟支已设为90%燃烧进度 (含90%厚灰待弹)'
    });
    toast.flame('🔥 已注入仿真：烟支已设为90%燃烧进度，返回首页查看！');
  },

  devSetSmokeProgress50() {
    triggerHaptic('medium');
    wx.setStorageSync('__DEV_PENDING_ACTION__', {
      type: 'SET_PROGRESS',
      progress: 0.50,
      ashRatio: 0.50,
      state: 'IDLE_BURNING',
      msg: '🔥 首页烟支已设为50%燃烧中段'
    });
    toast.flame('🔥 已注入：烟支燃烧进度 50%，返回首页查看！');
  },

  devSetSmokeProgress10() {
    triggerHaptic('light');
    wx.setStorageSync('__DEV_PENDING_ACTION__', {
      type: 'SET_PROGRESS',
      progress: 0.90,
      ashRatio: 0.10,
      state: 'IDLE_BURNING',
      msg: '🔥 首页烟支刚吸两口 (10%)'
    });
    toast.flame('🔥 已注入：烟支燃烧进度 10%，返回首页查看！');
  },

  devResetFullSmoke() {
    triggerHaptic('medium');
    wx.setStorageSync('__DEV_PENDING_ACTION__', {
      type: 'SET_PROGRESS',
      progress: 1.0,
      ashRatio: 0.0,
      state: 'UNLIT',
      msg: '✨ 首页烟支已恢复100%满长未点燃'
    });
    toast.success('✨ 已重置：首页烟支恢复100%全新未燃！');
  },

  devIgniteNow() {
    triggerHaptic('heavy');
    wx.setStorageSync('__DEV_PENDING_ACTION__', {
      type: 'SET_PROGRESS',
      progress: 1.0,
      ashRatio: 0.05,
      state: 'IDLE_BURNING',
      msg: '🔥 首页烟支已点燃！'
    });
    toast.flame('🔥 已点燃首页香烟，进入自燃状态！');
  },

  devExtinguishNow() {
    triggerHaptic('medium');
    wx.setStorageSync('__DEV_PENDING_ACTION__', {
      type: 'SET_PROGRESS',
      progress: 1.0,
      ashRatio: 0.0,
      state: 'UNLIT',
      msg: '💨 首页烟支已掐灭'
    });
    toast.info('💨 已掐灭首页香烟，回归未点燃！');
  },

  devTapAshNow() {
    triggerHaptic('light');
    wx.setStorageSync('__DEV_PENDING_ACTION__', {
      type: 'TAP_ASH',
      msg: '💨 首页烟灰已弹落清空！'
    });
    toast.info('💨 已执行弹灰指令，返回首页可见飘散动效！');
  },

  devToggleBead() {
    triggerHaptic('heavy');
    const isPopped = wx.getStorageSync('__DEV_BEAD_POPPED__') || false;
    const nextState = !isPopped;
    wx.setStorageSync('__DEV_BEAD_POPPED__', nextState);
    wx.setStorageSync('__DEV_PENDING_ACTION__', {
      type: nextState ? 'POP_BEAD' : 'RESET_BEAD',
      msg: nextState ? '🔮 爆珠已捏破！' : '🔮 爆珠已复原'
    });
    toast.flame(nextState ? '🔮 爆珠已捏破，返回首页查看晶体液滴！' : '🔮 爆珠已复原！');
  },

  devFinishSmokeNow() {
    triggerHaptic('heavy');
    // 1. 本地直接增加一条替烟记录
    const curCigId = storageService.getSelectedCigaretteId();
    storageService.addRecord({
      timestamp: Date.now(),
      cigaretteId: curCigId
    });
    // 2. 扣除当前烟盒库存 1 支
    const curCount = storageService.getPackCount(curCigId, 20);
    if (curCount > 0) {
      storageService.setPackCount(curCigId, curCount - 1);
    }
    // 3. 注入首页抽完指令
    wx.setStorageSync('__DEV_PENDING_ACTION__', {
      type: 'FINISH_SMOKE',
      msg: '🏁 烟支抽尽结算完成！'
    });
    this.refreshAllData();
    toast.flame('⚡ 已模拟抽完吸尽：+1支替烟记录，已自动保存！');
  },

  // 2. 打卡天数与时间跨度测试 (关键要求)
  devAddQuitDays(e) {
    const days = Number(e.currentTarget.dataset.days) || 1;
    triggerHaptic('medium');
    const p = storageService.getProfile();
    const curStart = p.quitStartDate ? new Date(p.quitStartDate).getTime() : Date.now();
    const newStart = curStart - days * 86400000;
    storageService.updateProfile({ quitStartDate: newStart });
    this.refreshAllData();
    toast.success(`📅 打卡天数已 +${days} 天！`);
  },

  devSetQuitDays(e) {
    const days = Number(e.currentTarget.dataset.days) || 1;
    triggerHaptic('medium');
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const newStart = midnight - Math.max(0, days - 1) * 86400000;
    storageService.updateProfile({ quitStartDate: newStart });
    this.refreshAllData();
    toast.success(`📅 打卡已设为第 ${days} 天！`);
  },

  // 3. VIP 状态与特权测试 (关键要求)
  devActivateVipLifetime() {
    triggerHaptic('heavy');
    vipService.activateTier('lifetime');
    this.refreshAllData();
    toast.flame('👑 已激活【至尊永久卡】终身免广与黑金荣耀！');
  },

  devActivateVipMonth() {
    triggerHaptic('heavy');
    vipService.activateTier('month');
    this.refreshAllData();
    toast.flame('💎 已激活【30天尊享月卡】特权！');
  },

  devActivateVipDay() {
    triggerHaptic('medium');
    vipService.activateTier('day');
    this.refreshAllData();
    toast.flame('✨ 已激活【24小时畅玩日卡】！');
  },

  devExpireVipNow() {
    triggerHaptic('medium');
    const expiredData = {
      isVip: false,
      tierId: 'month',
      tierName: '尊享月卡',
      customTheme: 'month',
      activatedAt: Date.now() - 31 * 86400000,
      expireTime: Date.now() - 1000,
      isLifetime: false
    };
    try {
      wx.setStorageSync('JUST_ONE_SMOKE_VIP_INFO_V1', expiredData);
    } catch (err) {}
    this.refreshAllData();
    toast.info('⚠️ VIP 状态已模拟设置为【刚过期1秒】！');
  },

  devClearVip() {
    triggerHaptic('medium');
    try {
      wx.removeStorageSync('JUST_ONE_SMOKE_VIP_INFO_V1');
      wx.removeStorageSync('JUST_ONE_SMOKE_PREVIEW_THEME');
    } catch (err) {}
    this.refreshAllData();
    toast.info('已清除 VIP 缓存，恢复纯净普通用户！');
  },

  // 4. 替烟支数与 7 日自律数据 (关键要求)
  devAddRecords(e) {
    const count = Number(e.currentTarget.dataset.count) || 1;
    triggerHaptic('medium');
    const curCigId = storageService.getSelectedCigaretteId();
    for (let i = 0; i < count; i++) {
      storageService.addRecord({
        timestamp: Date.now() - i * 60000,
        cigaretteId: curCigId
      });
    }
    this.refreshAllData();
    toast.success(`📊 替烟记录已累加 +${count} 支！`);
  },

  devSetTotalRecords(e) {
    const target = Number(e.currentTarget.dataset.count) || 60;
    triggerHaptic('heavy');
    const curCigId = storageService.getSelectedCigaretteId();
    const records = [];
    const now = Date.now();
    for (let i = 0; i < target; i++) {
      const offsetMs = Math.floor((i / target) * 7 * 86400000);
      records.push({
        timestamp: now - offsetMs,
        cigaretteId: curCigId
      });
    }
    try {
      wx.setStorageSync('SMOKEFREE_RECORDS', records);
    } catch (err) {}
    this.refreshAllData();
    toast.flame(`📊 累计替烟已设为 ${target} 支！`);
  },

  devFill7DaysTrends() {
    triggerHaptic('heavy');
    const curCigId = storageService.getSelectedCigaretteId();
    const records = [];
    const now = new Date();
    for (let day = 6; day >= 0; day--) {
      const targetDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 12, 0, 0);
      const countForDay = Math.floor(Math.random() * 9) + 8;
      for (let k = 0; k < countForDay; k++) {
        records.push({
          timestamp: targetDay.getTime() + k * 1800000,
          cigaretteId: curCigId
        });
      }
    }
    try {
      wx.setStorageSync('SMOKEFREE_RECORDS', records);
    } catch (err) {}
    this.refreshAllData();
    toast.flame('✨ 已填充近 7 天完整替烟数据，折线图与柱状图已点亮！');
  },

  devClearRecords() {
    triggerHaptic('medium');
    try {
      wx.setStorageSync('SMOKEFREE_RECORDS', []);
    } catch (err) {}
    this.refreshAllData();
    toast.info('已清空全部替烟记录 (0支)！');
  },

  devAddDailySmoked10() {
    triggerHaptic('heavy');
    const newCount = storageService.addDailySmokedCount(10);
    this.setData({
      devDailySmokedCount: newCount
    });
    this.refreshAllData();
    toast.flame(`⚡ 今日吸烟累计 +10（当前今日共: ${newCount} 支）`);
  },

  devSetDailySmoked40() {
    triggerHaptic('heavy');
    const cur = storageService.getDailySmokedCount();
    const delta = Math.max(0, 40 - cur);
    const newCount = storageService.addDailySmokedCount(delta);
    this.setData({
      devDailySmokedCount: newCount
    });
    this.refreshAllData();
    toast.flame('🍵 今日吸烟已直达 40 支生理阻尼上限！');
  },

  devClearDailySmoked() {
    triggerHaptic('light');
    const today = storageService.getTodayDateKey();
    try {
      wx.setStorageSync('SMOKEFREE_DAILY_SMOKE_COUNT', { date: today, count: 0 });
    } catch (e) {}
    this.setData({
      devDailySmokedCount: 0
    });
    this.refreshAllData();
    toast.info('🧹 今日吸烟计数已清零 (0 支)');
  },

  // 5. 烟盒库存与陈列
  devSetCurrentPackCount(e) {
    const count = Number(e.currentTarget.dataset.count) || 0;
    triggerHaptic('medium');
    const curCigId = storageService.getSelectedCigaretteId();
    storageService.setPackCount(curCigId, count);
    this.refreshAllData();
    toast.info(`当前烟盒余量已设为 ${count} 支！`);
  },

  devRefillCurrentPack() {
    triggerHaptic('medium');
    const curCigId = storageService.getSelectedCigaretteId();
    storageService.setPackCount(curCigId, 20);
    this.refreshAllData();
    toast.success('当前烟盒已补满 (满盒)！');
  },

  devRefillAllPacks() {
    triggerHaptic('heavy');
    if (Array.isArray(CIGARETTE_CATALOG)) {
      CIGARETTE_CATALOG.forEach(c => {
        storageService.setPackCount(c.id, c.packCapacity || 20);
      });
    }
    this.refreshAllData();
    toast.flame('📦 全部 37 款名烟展柜库存已 100% 补满！');
  },

  // 6. 展柜与特效全解锁
  devUnlockAllCigarettes() {
    triggerHaptic('heavy');
    if (Array.isArray(CIGARETTE_CATALOG)) {
      const allIds = CIGARETTE_CATALOG.map(c => c.id);
      try {
        wx.setStorageSync('SMOKEFREE_CUSTOM_UNLOCKED_CIGARETTES', allIds);
      } catch (err) {}
    }
    this.refreshAllData();
    toast.flame('🌟 全部 37 款名烟与雪茄已永久全量解锁！');
  },

  devLockAllCigarettes() {
    triggerHaptic('medium');
    try {
      wx.setStorageSync('SMOKEFREE_CUSTOM_UNLOCKED_CIGARETTES', []);
    } catch (err) {}
    this.refreshAllData();
    toast.info('已锁定全部名烟，仅保留默认款！');
  },

  devUnlockAllSmokeEffects() {
    triggerHaptic('heavy');
    if (Array.isArray(SMOKE_EFFECTS)) {
      const allEffIds = SMOKE_EFFECTS.map(e => e.id);
      try {
        wx.setStorageSync('SMOKEFREE_SUMMONED_SMOKE_EFFECTS', allEffIds);
      } catch (err) {}
    }
    this.refreshAllData();
    toast.flame('🌌 全部 12 款 60FPS 烟雾粒子特效已全量解锁！');
  },

  devLockAllSmokeEffects() {
    triggerHaptic('medium');
    try {
      wx.setStorageSync('SMOKEFREE_SUMMONED_SMOKE_EFFECTS', []);
    } catch (err) {}
    this.refreshAllData();
    toast.info('已重置烟雾特效，仅保留经典空灵烟圈！');
  },

  devUnlockAllAchievements() {
    triggerHaptic('heavy');
    if (Array.isArray(ACHIEVEMENTS)) {
      const allAchIds = ACHIEVEMENTS.map(a => a.id);
      storageService.saveUnlockedAchievements(allAchIds);
      storageService.setEquippedTitle('无烟圣尊');
    }
    this.refreshAllData();
    toast.flame('👑 全部 16 阶成就已点亮！已佩戴最高称号【无烟圣尊】！');
  },

  /* 快速测试：16 阶成语境界称号逐级步进 */
  devStepTitleNext() {
    this._stepTitle(1);
  },

  devStepTitlePrev() {
    this._stepTitle(-1);
  },

  devSetTitleTier(e) {
    const targetTitle = e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.title;
    if (!targetTitle) return;
    triggerHaptic('medium');
    storageService.setEquippedTitle(targetTitle);
    this.refreshAllData();
    toast.flame(`🎖️ 境界称号已设为：【${targetTitle}】！`);
  },

  _stepTitle(dir) {
    triggerHaptic('medium');
    const titles = [
      '破土初萌', '第一缕风', '晨曦破晓', '三日生机',
      '积微成著', '日省月试', '七日淬火', '身轻气爽',
      '从容自若', '重塑新程', '静水流深', '金石为开',
      '百日涅槃', '千帆历尽', '心如琉璃', '返璞归真',
      '无烟圣尊'
    ];
    const curTitle = storageService.getEquippedTitle() || '破土初萌';
    let idx = titles.indexOf(curTitle);
    if (idx === -1) idx = 0;
    const nextIdx = (idx + dir + titles.length) % titles.length;
    const nextTitle = titles[nextIdx];
    storageService.setEquippedTitle(nextTitle);
    this.refreshAllData();
    toast.flame(`🎖️ 境界称号切换为 (Lv.${nextIdx + 1}/${titles.length})：【${nextTitle}】！`);
  },

  /* 快速测试：心境天幕即时循环轮换 */
  devCycleVipTheme() {
    triggerHaptic('heavy');
    const themes = VIP_THEME_OPTIONS || [];
    if (!themes.length) return;
    const currentTheme = this.data.vipTheme || 'classic';
    const currentIndex = themes.findIndex(t => t.id === currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const targetTheme = themes[nextIndex];
    try {
      wx.setStorageSync('JUST_ONE_SMOKE_PREVIEW_THEME', targetTheme.id);
    } catch (e) {}
    this.setData({ vipTheme: targetTheme.id });
    toast.flame(`🌌 心境天幕切换至：【${targetTheme.name}】（${targetTheme.tag || ''}）`);
  },

  // 7. 调试设置与系统维护
  devShowDataSnapshot() {
    triggerHaptic('light');
    const p = storageService.getProfile();
    const records = storageService.getRecords();
    const vip = vipService.getVipInfo();
    const curCigId = storageService.getSelectedCigaretteId();
    const packCount = storageService.getPackCount(curCigId, 20);
    const snap = {
      quitDays: calculateQuitDays(p.quitStartDate),
      totalSubstituted: records.length,
      isVip: vip.isVip,
      vipTier: vip.tierId,
      currentCigaretteId: curCigId,
      currentPackCount: packCount,
      packPrice: p.packPrice,
      cigsPerDay: p.cigsPerDay
    };
    wx.showModal({
      title: '当前本地数据快照',
      content: JSON.stringify(snap, null, 2),
      showCancel: false,
      confirmText: '已知晓'
    });
  },

  devResetAllStorage() {
    wx.showModal({
      title: '⚠️ 恢复出厂设置确认',
      content: '此操作将清空所有本地测试缓存，恢复至全新安装状态。确定继续吗？',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
          } catch (e) {}
          toast.info('已清空所有本地数据，正在重载...');
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/index/index' });
          }, 600);
        }
      }
    });
  },

  devLockAdminMode() {
    triggerHaptic('medium');
    try {
      wx.removeStorageSync('__DEV_ADMIN_MODE__');
    } catch (e) {}
    this.setData({ showAdminTestModal: false });
    toast.info('🔒 管理员模式已锁定，下次需重新点击 10 次版权文案唤醒');
  }
  /* ==================== [DEV_ADMIN_TEST] 结束 ==================== */
});
