// pages/mine/mine.js
import { audioManager } from '../../services/audioManager.js';
import { triggerHaptic } from '../../services/haptics.js';
import { toast } from '../../services/toastService.js';
import { storageService } from '../../services/storageService.js';
import { cloudSyncService } from '../../services/cloudSyncService.js';
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
import { measureSafeAreaSync } from '../../utils/safeArea.js';
import { navigateBackWithSound } from '../../utils/navigation.js';

const QUICK_PRICE_PRESETS = [
  { val: 15, label: '¥15 白沙' },
  { val: 18, label: '¥18 炫赫' },
  { val: 25, label: '¥25 芙蓉' },
  { val: 26, label: '¥26 江南' },
  { val: 65, label: '¥65 中华' },
  { val: 100, label: '¥100' }
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
      hasSummonedMythic: allEffects.includes('dragon_breath') || allEffects.includes('phoenix_nirvana') || allEffects.includes('lotus_zen') || allEffects.includes('buddha_light') || allEffects.includes('bagua_taichi') || allEffects.includes('auspicious_river')
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
      vipTheme: vipService.getVipTheme(),
      showProfileModal: false
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
      vipTheme: '',
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
    this.measureSafeArea();
    this.refreshAllData();
  },

  onShow() {
    this._isNavigating = false;
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
      this.setData({
        ...safeArea,
        ...computeMineStatsPayload(),
        vipTheme: vipService.getVipTheme()
      });
    } catch (e) {
      console.error('refreshAllData error:', e);
    }
  },

  // 微信头像选择与持久化同步 (本地即刻预览 + 微信云存储永久 fileID 异步换绑)
  onUpdateAvatar(e) {
    try {
      const avatarUrl = e.detail && e.detail.avatarUrl ? e.detail.avatarUrl : '';
      if (!avatarUrl) {
        const updated = storageService.updateProfile({ avatarUrl: '' });
        this.setData({ profile: updated });
        this.refreshAllData();
        cloudSyncService.syncUserProfile({ avatarUrl: '' });
        return;
      }
      // 1. 本地即时保存与秒级渲染 (0ms 无白屏)
      const savedPath = persistAvatarFile(avatarUrl);
      const updated = storageService.updateProfile({ avatarUrl: savedPath });
      this.setData({ profile: updated });
      this.refreshAllData();

      // 2. 异步上传至微信云存储获取永久 fileID (彻底根治临时文件失效黑圈与破图)
      cloudSyncService.uploadUserAvatar(avatarUrl).then(fileID => {
        if (fileID && fileID.startsWith('cloud://')) {
          storageService.updateProfile({ avatarUrl: fileID });
          cloudSyncService.syncUserProfile({ avatarUrl: fileID });
        }
      }).catch(err => {
        console.warn('[Mine] 云端头像同步跳过 (离线或尚未建表):', err);
      });
    } catch (err) {
      console.error('onUpdateAvatar error:', err);
    }
  },

  // 微信昵称输入与同步
  onUpdateNickname(e) {
    try {
      const nickName = (e.detail && e.detail.nickName ? e.detail.nickName : '').trim();
      if (!nickName) return;
      const updated = storageService.updateProfile({ nickName });
      this.setData({ profile: updated });
      this.refreshAllData();

      // 异步防抖提交至云端
      cloudSyncService.syncUserProfile({ nickName });
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
    const val = Math.min(2000, Math.max(5, cur + delta));
    this.updateEditProfile({ packPrice: val });
    triggerHaptic('light');
  },

  setQuickPrice(e) {
    const val = Number(e.currentTarget.dataset.val);
    const clamped = Math.min(2000, Math.max(5, val));
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
    const val = Math.min(2000, Math.max(0, num));
    this.updateEditProfile({ packPrice: val });
  },

  onBlurPackPrice(e) {
    let num = parseInt(e.detail.value, 10);
    if (isNaN(num) || num < 5) {
      num = (num > 0 && num < 5) ? 5 : 25;
    } else if (num > 2000) {
      num = 2000;
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
    if (packPrice > 2000) packPrice = 2000;

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
    // 异步同步到云端
    cloudSyncService.syncUserProfile({
      smokeProfile: {
        packPrice,
        cigsPerDay,
        smokeYears
      }
    });
    this.setData({ showProfileModal: false });
    audioManager.playSwitchSound();
    triggerHaptic('medium');
    toast.success('已保存偏好设置');
    this.refreshAllData();
  },

  onNavigateBack() {
    navigateBackWithSound();
  },

  preventTouchMove() {}
});
