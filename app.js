// app.js
import { storageService } from './services/storageService.js';

const appOptions = {
  onLaunch() {
    console.log('【我抽一支】无烟替瘾器小程序启动成功');
    try {
      storageService.getProfile();
    } catch (e) {
      console.warn('App onLaunch profile error', e);
    }
  },
  onShow() {
    // 每次从小程序外部进入（启动/后台切回前台）时，重置引导标记
    this.globalData.shouldShowLaunchGuide = true;
  },
  globalData: {
    appName: '我抽一支',
    version: '1.0.0',
    shouldShowLaunchGuide: true
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
