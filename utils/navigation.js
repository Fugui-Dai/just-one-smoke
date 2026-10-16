// utils/navigation.js
import { audioManager } from '../services/audioManager.js';
import { triggerHaptic } from '../services/haptics.js';

/**
 * 全局统一返回导航（空间声学切换音效 + 拟真轻微触感 + 历史栈兜底）
 * @param {string|null} fallbackUrl 若页面栈深度不足时的兜底重定向路由
 */
export function navigateBackWithSound(fallbackUrl = null) {
  try {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
    } else if (fallbackUrl) {
      wx.redirectTo({ url: fallbackUrl });
    } else {
      wx.navigateBack({ delta: 1 });
    }
  } catch (e) {
    if (fallbackUrl) {
      wx.redirectTo({ url: fallbackUrl });
    }
  }
}
