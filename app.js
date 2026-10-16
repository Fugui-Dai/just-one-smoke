import { storageService } from './services/storageService.js';
import { cloudSyncService } from './services/cloudSyncService.js';
import { vipService } from './services/vipService.js';

const appOptions = {
  onLaunch() {
    console.log('【我抽一支】无烟替瘾器小程序启动成功');
    if (this.globalData) {
      this.globalData.hasShownGuideInSession = false;
    }

    // 1. 初始化本地数据缓存 (0ms 极速响应)
    let localProfile = null;
    let localRecords = [];
    try {
      localProfile = storageService.getProfile();
      localRecords = storageService.getRecords();
    } catch (e) {
      console.warn('App onLaunch profile error', e);
    }

    // 2. 异步静默初始化微信云开发双擎 (Local-First 不阻塞主线程)
    try {
      cloudSyncService.init();
      if (cloudSyncService.isAvailable()) {
        cloudSyncService.getOrInitUserProfile(localProfile, localRecords).then(cloudUser => {
          if (!cloudUser) return;
          // (A) 云端最新画像静默比对更新本地缓存 (跨设备登录/换机同步)
          if (cloudUser.nickName && cloudUser.avatarUrl) {
            storageService.updateProfile({
              nickName: cloudUser.nickName,
              avatarUrl: cloudUser.avatarUrl
            });
          }
          // (B) 云端/运营后台 VIP 授权即时同步至本地 (后台改库/一键发奖即时点亮特权)
          if (cloudUser.vipStatus) {
            vipService.syncFromCloud(cloudUser.vipStatus);
          }
        }).catch(err => {
          console.warn('[App] 云端档案静默同步跳过 (离线或尚未建表):', err);
        });
      }
    } catch (eCloud) {
      console.warn('[App] 云开发静默初始化安全降级:', eCloud);
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
