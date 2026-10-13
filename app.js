// app.js
import { storageService } from './services/storageService.js';

const appOptions = {
  onLaunch() {
    console.log('【我抽一支】无烟替瘾器小程序启动成功');
    try {
      storageService.getProfile();
      storageService.recordDailyCheckIn();
    } catch (e) {
      console.warn('App onLaunch checkin error', e);
    }
  },
  onShow() {
    try {
      storageService.recordDailyCheckIn();
    } catch (e) {}
  },
  globalData: {
    appName: '我抽一支',
    version: '1.0.0'
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
