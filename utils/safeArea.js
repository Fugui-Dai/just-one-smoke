// utils/safeArea.js
/**
 * 跨端安全区与微信原生胶囊按钮统一避让测量工具
 * 适配全系列 iOS / Android 异形屏与状态栏
 */
export function measureSafeAreaSync() {
  try {
    const sysInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const menuInfo = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
    const statusBarHeight = sysInfo.statusBarHeight || 44;
    let navBarHeight = 44;
    let capsuleRightSpace = 96;
    let capsuleTop = statusBarHeight + 6;

    if (menuInfo && menuInfo.top) {
      navBarHeight = (menuInfo.top - statusBarHeight) * 2 + menuInfo.height;
      capsuleRightSpace = (sysInfo.windowWidth - menuInfo.left) + 12;
      capsuleTop = menuInfo.top;
    }
    return {
      statusBarHeight,
      navBarHeight,
      capsuleRightSpace,
      capsuleTop,
      windowWidth: sysInfo.windowWidth,
      windowHeight: sysInfo.windowHeight
    };
  } catch (e) {
    return {
      statusBarHeight: 44,
      navBarHeight: 44,
      capsuleRightSpace: 100,
      capsuleTop: 50,
      windowWidth: 375,
      windowHeight: 667
    };
  }
}

/**
 * 跨端 iOS 设备精准判定
 */
export function detectIsIOS() {
  try {
    const sysInfo = wx.getSystemInfoSync ? wx.getSystemInfoSync() : {};
    const platform = (sysInfo.platform || '').toLowerCase();
    const system = (sysInfo.system || '').toLowerCase();
    return platform === 'ios' || system.includes('ios') || system.includes('iphone') || system.includes('ipad');
  } catch (e) {
    return false;
  }
}

