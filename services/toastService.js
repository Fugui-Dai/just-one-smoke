// utils/toastService.js

/**
 * 调度当前活跃页面挂载的 <custom-toast id="customToast"> 组件实例
 * 替代原生生硬的 wx.showToast，呈现灵动浮空微胶囊 HUD
 */
export function showToast(options) {
  if (typeof options === 'string') {
    options = { title: options };
  }
  if (!options || !options.title) return;

  try {
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
    if (pages && pages.length) {
      const curPage = pages[pages.length - 1];
      if (curPage) {
        const toastComp = curPage.selectComponent('#customToast');
        if (toastComp && typeof toastComp.show === 'function') {
          toastComp.show(options);
          return;
        }
      }
    }
  } catch (err) {
    console.warn('showToast dispatch error:', err);
  }

  // 极特殊未挂载情况下的静默兜底
  try {
    if (typeof wx !== 'undefined' && wx.showToast) {
      wx.showToast({
        title: options.title || '',
        icon: 'none',
        duration: options.duration || 1800
      });
    }
  } catch {}
}

export const toast = {
  show: showToast,
  flame: (title, desc, duration) => showToast({ title, desc, type: 'flame', icon: '🔥', duration }),
  success: (title, desc, duration) => showToast({ title, desc, type: 'success', icon: '✨', duration }),
  bead: (title, desc, duration) => showToast({ title, desc, type: 'bead', icon: '🫧', duration }),
  warn: (title, desc, duration) => showToast({ title, desc, type: 'warn', icon: '⚠️', duration }),
  info: (title, desc, duration) => showToast({ title, desc, type: 'info', icon: '💡', duration })
};

export default toast;
