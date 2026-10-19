// services/haptics.js

/**
 * 腾讯游戏体验设计级 · 触觉动力学编排引擎 (Tactile Dynamics & Haptic Choreography)
 * 适配 iOS Taptic Engine 与 Android 线性振动马达
 * 具备纳秒级非阻塞多段力反馈编排与硬件节流保护
 */

let _activeTimers = [];

function _clearHapticTimers() {
  if (_activeTimers.length) {
    for (let i = 0; i < _activeTimers.length; i++) {
      clearTimeout(_activeTimers[i]);
    }
    _activeTimers = [];
  }
}

function _vibrateOnce(type = 'light') {
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
  } catch (e) {}
}

export function triggerHaptic(type = 'light') {
  if (!type) {
    _vibrateOnce('light');
    return;
  }

  // 1. 经典单段振动兼容 (100% 向后兼容)
  if (['light', 'medium', 'heavy', 'success', 'warning', 'error', 'selection'].includes(type)) {
    _vibrateOnce(type);
    return;
  }

  // 2. 腾讯总监级多段机械微力反馈动力学编排
  _clearHapticTimers();

  switch (type) {
    // 爆珠物理破裂：第一阶段外壳脆裂重压 -> 34ms 内部香精液滴瞬间泄压次级轻震
    case 'bead_pop':
    case 'bead_rupture': {
      _vibrateOnce('heavy');
      const t = setTimeout(() => _vibrateOnce('light'), 34);
      _activeTimers.push(t);
      break;
    }

    // 指节轻弹烟身抖灰：敲击瞬间清脆顿挫 -> 55ms 悬臂梁弹性衰减微振
    case 'ash_tap':
    case 'cantilever_tap': {
      _vibrateOnce('medium');
      const t1 = setTimeout(() => _vibrateOnce('light'), 55);
      _activeTimers.push(t1);
      break;
    }

    // Zippo 翻盖与打火：掀开纯铜顶盖 -> 75ms 齿轮火石清脆撞击
    case 'zippo_flip':
    case 'zippo_vintage': {
      _vibrateOnce('light');
      const t = setTimeout(() => _vibrateOnce('heavy'), 75);
      _activeTimers.push(t);
      break;
    }

    // 复古木质火柴：红磷划擦摩擦阻尼 -> 60ms 松木爆燃
    case 'match_strike':
    case 'vintage_match': {
      _vibrateOnce('light');
      const t1 = setTimeout(() => _vibrateOnce('medium'), 50);
      const t2 = setTimeout(() => _vibrateOnce('heavy'), 110);
      _activeTimers.push(t1, t2);
      break;
    }

    // 强劲防风三喷蓝焰喷枪：机械压电陶瓷极短高压击发咔哒 -> 40ms 等离子喷薄气流共振
    case 'torch_ignite':
    case 'blue_torch': {
      _vibrateOnce('heavy');
      const t = setTimeout(() => _vibrateOnce('light'), 45);
      _activeTimers.push(t);
      break;
    }

    // 赛博等离子双弧：高频双脉冲微震颤
    case 'plasma_arc':
    case 'plasma': {
      _vibrateOnce('light');
      const t1 = setTimeout(() => _vibrateOnce('medium'), 35);
      const t2 = setTimeout(() => _vibrateOnce('light'), 85);
      _activeTimers.push(t1, t2);
      break;
    }

    // 车载点烟器：通红发热丝弹起时的清脆弹射
    case 'car_pop':
    case 'car_lighter': {
      _vibrateOnce('heavy');
      const t = setTimeout(() => _vibrateOnce('medium'), 60);
      _activeTimers.push(t);
      break;
    }

    // 经典砂轮打火机：砂轮滚花咬合 -> 簧片回弹
    case 'flint_classic': {
      _vibrateOnce('light');
      const t = setTimeout(() => _vibrateOnce('medium'), 40);
      _activeTimers.push(t);
      break;
    }

    // 抽完战报/里程碑庆祝：三连击荣誉节奏
    case 'celebration':
    case 'victory': {
      _vibrateOnce('medium');
      const t1 = setTimeout(() => _vibrateOnce('medium'), 120);
      const t2 = setTimeout(() => _vibrateOnce('heavy'), 260);
      _activeTimers.push(t1, t2);
      break;
    }

    // 吸烟气流共振微脉冲
    case 'inhale_pulse':
    case 'resonance': {
      _vibrateOnce('light');
      break;
    }

    // 案头猫咪呼噜声微触觉共鸣：绵密轻柔微震 3 连击 (Purr Resonance)
    case 'cat_purr':
    case 'purr': {
      _vibrateOnce('light');
      const t1 = setTimeout(() => _vibrateOnce('light'), 85);
      const t2 = setTimeout(() => _vibrateOnce('light'), 175);
      _activeTimers.push(t1, t2);
      break;
    }

    // 龙猫大肚软萌弹性微振 (Totoro Soft Belly Bounce)
    case 'totoro_bounce':
    case 'totoro': {
      _vibrateOnce('medium');
      const t = setTimeout(() => _vibrateOnce('light'), 85);
      _activeTimers.push(t);
      break;
    }

    // 史努比屋顶惬意小跳跃微振 (Snoopy Playful Tap)
    case 'snoopy_tap':
    case 'snoopy': {
      _vibrateOnce('light');
      const t = setTimeout(() => _vibrateOnce('medium'), 60);
      _activeTimers.push(t);
      break;
    }

    // 温馨一家：温暖双段柔和脉冲微振 (Family Warmth Resonance)
    case 'family_warmth':
    case 'family': {
      _vibrateOnce('light');
      const t1 = setTimeout(() => _vibrateOnce('medium'), 75);
      const t2 = setTimeout(() => _vibrateOnce('light'), 160);
      _activeTimers.push(t1, t2);
      break;
    }

    default:
      _vibrateOnce(type);
  }
}

export const hapticsEngine = {
  trigger: triggerHaptic,
  ignite(toolId) {
    triggerHaptic(toolId || 'flint_classic');
  },
  beadPop() {
    triggerHaptic('bead_pop');
  },
  ashTap() {
    triggerHaptic('ash_tap');
  },
  celebration() {
    triggerHaptic('celebration');
  },
  inhalePulse() {
    triggerHaptic('inhale_pulse');
  },
  catPurr() {
    triggerHaptic('cat_purr');
  },
  totoroBounce() {
    triggerHaptic('totoro_bounce');
  },
  snoopyTap() {
    triggerHaptic('snoopy_tap');
  },
  familyWarmth() {
    triggerHaptic('family_warmth');
  }
};




