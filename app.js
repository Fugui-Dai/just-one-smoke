import { storageService } from './services/storageService.js';

const appOptions = {
  onLaunch() {
    console.log('【我抽一支】无烟替瘾器小程序启动成功');
    if (this.globalData) {
      this.globalData.hasShownGuideInSession = false;
    }

    // 初始化本地数据缓存 (0ms 极速响应)
    try {
      storageService.getProfile();
      storageService.getRecords();
    } catch (e) {
      console.warn('App onLaunch profile error', e);
    }
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
