import { storageService } from './services/storageService.js';
import { navigateBackWithSound } from './utils/navigation.js';

const appOptions = {
  navigateBackWithSound,
  onLaunch() {
    console.log('【我抽一支】无烟替瘾器小程序启动成功');
    if (this.globalData) {
      this.globalData.hasShownGuideInSession = false;
    }

    // 初始化本地数据缓存与自动签到 (0ms 极速响应，只要登录启动即自动签到)
    try {
      storageService.getProfile();
      storageService.getRecords();
      storageService.recordDailyCheckIn();
    } catch (e) {
      console.warn('App onLaunch profile error', e);
    }
  },
  onShow() {
    // 跨天或重新切回前台时，自动检测并补齐当日自动签到
    try {
      storageService.recordDailyCheckIn();
    } catch (e) {}
  },
  globalData: {
    appName: '我抽一支',
    version: '1.0.0',
    hasShownGuideInSession: false
  }
};

if (typeof App === 'function') {
  App(appOptions);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    appOptions,
    default: appOptions
  };
}
