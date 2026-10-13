// utils/haptics.js

export function triggerHaptic(type = 'light') {
  try {
    if (typeof wx !== 'undefined' && wx.vibrateShort) {
      let vibrateType = 'light';
      if (type === 'heavy' || type === 'error') {
        vibrateType = 'heavy';
      } else if (type === 'medium' || type === 'success' || type === 'warning') {
        vibrateType = 'medium';
      }
      wx.vibrateShort({ type: vibrateType });
    }
  } catch {}
}
