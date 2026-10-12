// pages/leaderboard/leaderboard.js
import { audioManager } from '../../utils/audioManager.js';
import { triggerHaptic } from '../../utils/haptics.js';
import { storageService } from '../../utils/storageService.js';
import { leaderboardService } from '../../utils/leaderboardService.js';
import { calculateSavings, calculateQuitDays } from '../../utils/healthCalculator.js';
import { vipService } from '../../utils/vipService.js';

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

function buildInitialLeaderboardState(category = 'substituted') {
  const safeArea = measureSafeAreaSync();
  try {
    const profile = storageService.getProfile();
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const totalSaved = calculateSavings(totalSubs, profile.packPrice);
    const quitDays = calculateQuitDays(profile.quitStartDate);

    const result = leaderboardService.getLeaderboard(category, {
      substituted: totalSubs,
      savedMoney: Math.round(totalSaved),
      days: quitDays + 1
    }, profile);

    return {
      ...safeArea,
      leaderboardCategory: category,
      leaderboardList: result.list,
      myRankInfo: result.myRankInfo,
      profile,
      totalSubstituted: totalSubs,
      totalSavedMoney: totalSaved.toFixed(2),
      quitDays
    };
  } catch (e) {
    return {
      ...safeArea,
      leaderboardCategory: category,
      leaderboardList: [],
      myRankInfo: {
        rank: 1,
        title: '无烟觉醒者',
        beatPercent: 50.0,
        substituted: 0,
        savedMoney: 0,
        days: 1
      },
      profile: {},
      totalSubstituted: 0,
      totalSavedMoney: '0.00',
      quitDays: 0
    };
  }
}

Page({
  data: buildInitialLeaderboardState('substituted'),

  onLoad() {
    this._skipFirstShowRefresh = true;
    this.refreshLeaderboard();
  },

  onShow() {
    if (this._skipFirstShowRefresh) {
      this._skipFirstShowRefresh = false;
      this.setData({ vipTheme: vipService.getVipTheme() });
      return;
    }
    this.refreshLeaderboard();
  },

  measureSafeArea() {
    const safeArea = measureSafeAreaSync();
    this.setData(safeArea);
  },

  refreshLeaderboard() {
    const profile = storageService.getProfile();
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const totalSaved = calculateSavings(totalSubs, profile.packPrice);
    const quitDays = calculateQuitDays(profile.quitStartDate);

    const result = leaderboardService.getLeaderboard(this.data.leaderboardCategory, {
      substituted: totalSubs,
      savedMoney: Math.round(totalSaved),
      days: quitDays + 1
    }, profile);

    this.setData({
      profile,
      totalSubstituted: totalSubs,
      totalSavedMoney: totalSaved.toFixed(2),
      quitDays,
      leaderboardList: result.list,
      myRankInfo: result.myRankInfo,
      vipTheme: vipService.getVipTheme()
    });
  },

  onLeaderboardCategoryChange(e) {
    const category = e.detail.category;
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.setData({ leaderboardCategory: category }, () => {
      this.refreshLeaderboard();
    });
  },

  onLeaderboardLike(e) {
    const id = e.detail.id;
    audioManager.unlockAudio();
    leaderboardService.toggleLike(id);
    audioManager.playLikeHeartSound();
    triggerHaptic('medium');
    this.refreshLeaderboard();
  },

  onNavigateBack() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    wx.navigateBack({ delta: 1 });
  }
});
