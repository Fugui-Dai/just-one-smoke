// pages/mine/mine.js
import { audioManager } from '../../utils/audioManager.js';
import { triggerHaptic } from '../../utils/haptics.js';
import { toast } from '../../utils/toastService.js';
import { storageService } from '../../utils/storageService.js';
import { leaderboardService } from '../../utils/leaderboardService.js';
import {
  calculateSavings,
  calculateTarAvoided,
  calculateLifeRegained,
  calculateQuitDays,
  getWhoStages
} from '../../utils/healthCalculator.js';

function measureSafeAreaSync() {
  try {
    const sysInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const menuInfo = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
    const statusBarHeight = sysInfo.statusBarHeight || 44;
    let navBarHeight = 44;
    let capsuleRightSpace = 96;

    if (menuInfo && menuInfo.top) {
      navBarHeight = (menuInfo.top - statusBarHeight) * 2 + menuInfo.height;
      capsuleRightSpace = (sysInfo.windowWidth - menuInfo.left) + 12;
    }
    return { statusBarHeight, navBarHeight, capsuleRightSpace };
  } catch (e) {
    return { statusBarHeight: 44, navBarHeight: 44, capsuleRightSpace: 100 };
  }
}

function computeMineStatsPayload() {
  storageService.recordDailyCheckIn();
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

  const totalIgnites = storageService.getIgniteCount();

  return {
    profile,
    myRankInfo: leaderResult.myRankInfo,
    totalSubstituted: totalSubs,
    totalPacksSaved: (totalSubs / 20).toFixed(1),
    totalSavedMoney: totalSaved.toFixed(2),
    totalTarAvoided: totalTar,
    totalLifeRegained: totalLife,
    lifeRegainedHours: (totalLife / 60).toFixed(1),
    totalIgnites,
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
  try {
    return {
      ...safeArea,
      ...computeMineStatsPayload(),
      showProfileModal: false
    };
  } catch (e) {
    return {
      ...safeArea,
      profile: {},
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
      totalIgnites: 0,
      totalFinishedCigs: 0,
      quitDays: 0,
      weeklyAvg: '0.0',
      todayCount: 0,
      dailyTrends: [],
      whoStages: [],
      showProfileModal: false,
      editProfile: {
        packPrice: 25,
        cigsPerDay: 15,
        smokeYears: 5
      }
    };
  }
}

Page({
  data: buildInitialMineState(),

  onLoad() {
    this._skipFirstShowRefresh = true;
    this.refreshAllData();
  },

  onShow() {
    if (this._skipFirstShowRefresh) {
      this._skipFirstShowRefresh = false;
      return;
    }
    this.refreshAllData();
  },

  measureSafeArea() {
    const safeArea = measureSafeAreaSync();
    this.setData(safeArea);
  },

  refreshAllData() {
    this.setData(computeMineStatsPayload());
  },

  // 微信头像选择与同步
  onUpdateAvatar(e) {
    const avatarUrl = e.detail && e.detail.avatarUrl ? e.detail.avatarUrl : '';
    if (!avatarUrl) return;
    const updated = storageService.updateProfile({ avatarUrl });
    this.setData({ profile: updated });
    this.refreshAllData();
    toast.success('头像已同步');
  },

  // 微信昵称输入与同步
  onUpdateNickname(e) {
    const nickName = (e.detail && e.detail.nickName ? e.detail.nickName : '').trim();
    if (!nickName) return;
    const updated = storageService.updateProfile({ nickName });
    this.setData({ profile: updated });
    this.refreshAllData();
    toast.success('昵称已同步');
  },

  // 跳转英雄榜
  goToLeaderboard() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    wx.navigateTo({
      url: '/pages/leaderboard/leaderboard'
    });
  },

  // 偏好设置弹窗
  openProfileModal() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    const p = storageService.getProfile();
    this.setData({
      showProfileModal: true,
      editProfile: { ...p }
    });
  },

  closeProfileModal() {
    this.setData({ showProfileModal: false });
  },

  adjustPackPrice(e) {
    const delta = Number(e.currentTarget.dataset.delta);
    const val = Math.max(1, (this.data.editProfile.packPrice || 25) + delta);
    this.setData({ 'editProfile.packPrice': val });
    triggerHaptic('light');
  },

  setQuickPrice(e) {
    const val = Number(e.currentTarget.dataset.val);
    this.setData({ 'editProfile.packPrice': val });
    triggerHaptic('light');
  },

  onInputPackPrice(e) {
    const val = Math.max(1, Number(e.detail.value) || 25);
    this.setData({ 'editProfile.packPrice': val });
  },

  adjustCigsPerDay(e) {
    const delta = Number(e.currentTarget.dataset.delta);
    const val = Math.max(1, (this.data.editProfile.cigsPerDay || 15) + delta);
    this.setData({ 'editProfile.cigsPerDay': val });
    triggerHaptic('light');
  },

  onInputCigsPerDay(e) {
    const val = Math.max(1, Number(e.detail.value) || 15);
    this.setData({ 'editProfile.cigsPerDay': val });
  },

  adjustSmokeYears(e) {
    const delta = Number(e.currentTarget.dataset.delta);
    const val = Math.max(0, (this.data.editProfile.smokeYears || 5) + delta);
    this.setData({ 'editProfile.smokeYears': val });
    triggerHaptic('light');
  },

  onInputSmokeYears(e) {
    const val = Math.max(0, Number(e.detail.value) || 0);
    this.setData({ 'editProfile.smokeYears': val });
  },

  saveProfile() {
    const updated = {
      ...this.data.profile,
      packPrice: Math.max(1, Number(this.data.editProfile.packPrice) || 25),
      cigsPerDay: Math.max(1, Number(this.data.editProfile.cigsPerDay) || 15),
      smokeYears: Math.max(0, Number(this.data.editProfile.smokeYears) || 0)
    };
    storageService.saveProfile(updated);
    this.setData({ showProfileModal: false });
    audioManager.playSwitchSound();
    triggerHaptic('medium');
    toast.success('已保存偏好');
    this.refreshAllData();
  },

  onNavigateBack() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    wx.navigateBack({ delta: 1 });
  },

  preventTouchMove() {}
});
