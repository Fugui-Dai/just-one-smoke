// pages/leaderboard/leaderboard.js
import { audioManager } from '../../services/audioManager.js';
import { triggerHaptic } from '../../services/haptics.js';
import { storageService } from '../../services/storageService.js';
import { leaderboardService } from '../../services/leaderboardService.js';
import { calculateSavings, calculateQuitDays } from '../../configs/healthCalculator.js';
import { vipService } from '../../services/vipService.js';
import { measureSafeAreaSync } from '../../utils/safeArea.js';
import { navigateBackWithSound } from '../../utils/navigation.js';

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
      isVip: vipService.isVip(),
      vipTheme: vipService.getVipTheme(),
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
      isVip: false,
      vipTheme: '',
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
      this.setData({
        isVip: vipService.isVip(),
        vipTheme: vipService.getVipTheme()
      });
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
      isVip: vipService.isVip(),
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
    const res = leaderboardService.toggleLike(id);
    if (res && res.isLiked) {
      audioManager.playLikeHeartSound();
      triggerHaptic('medium');
    } else {
      triggerHaptic('light');
    }
    this.refreshLeaderboard();
  },

  onNavigateBack() {
    navigateBackWithSound();
  }
});
