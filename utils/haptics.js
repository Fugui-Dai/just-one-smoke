// utils/haptics.js

export function triggerHaptic(type = 'light') {
  try {
    if (typeof wx !== 'undefined' && wx.vibrateShort) {
      wx.vibrateShort({
        type: type === 'heavy' ? 'heavy' : type === 'medium' ? 'medium' : 'light'
      });
    }
  } catch {}
}
