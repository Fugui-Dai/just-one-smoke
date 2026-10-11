// utils/smokeStateMachine.js

export class SmokeStateMachine {
  constructor() {
    this.state = 'UNLIT';
    this.cigaretteProgress = 1.0; // 1.0 满长，0.0 燃尽
    this.lastTapProgress = 1.0;   // 上次抖灰时的烟支燃烧进度
    this.ashRatio = 0.0;          // 烟灰占一整根烟的比例 (0.0 ~ 1.0)
    this.inhaleCount = 0;
  }

  getState() {
    return this.state;
  }

  getProgress() {
    return (typeof this.cigaretteProgress === 'number' && !isNaN(this.cigaretteProgress)) ? this.cigaretteProgress : 1.0;
  }

  // 获取当前烟灰占一整根烟的比例 (0.0 ~ 1.0，用于圆圈进度条展示)
  getAshRatio() {
    return (typeof this.ashRatio === 'number' && !isNaN(this.ashRatio)) ? this.ashRatio : 0;
  }

  // 获取当前烟灰物理像素长度 (用于画布真实物理渲染)
  getAshLength() {
    return this.getAshRatio() * 260;
  }

  getInhaleCount() {
    return this.inhaleCount;
  }

  light() {
    if (this.state === 'UNLIT') {
      this.state = 'IDLE_BURNING';
      return true;
    }
    return false;
  }

  // 掐灭香烟：当前若处于燃烧/吸烟状态，立即掐灭回归未点燃状态
  extinguish() {
    if (this.state !== 'UNLIT' && this.state !== 'FINISHED') {
      this.state = 'UNLIT';
      return true;
    }
    return false;
  }

  startInhale() {
    if (this.state === 'IDLE_BURNING' || this.state === 'EXHALING') {
      this.state = 'INHALING';
      this.inhaleCount++;
      return true;
    }
    return false;
  }

  stopInhale() {
    if (this.state === 'INHALING') {
      this.state = 'EXHALING';
      return true;
    }
    return false;
  }

  finishExhale() {
    if (this.state === 'EXHALING') {
      this.state = 'IDLE_BURNING';
      return true;
    }
    return false;
  }

  // 手动抖灰：只有用户主动点击抖灰时，烟灰才抖落
  tapAsh() {
    if (this.ashRatio > 0.001) {
      this.lastTapProgress = this.cigaretteProgress;
      this.ashRatio = 0.0;
      return true;
    }
    return false;
  }

  burn(deltaSec, isInhaling, isCigar = false) {
    if (this.state === 'UNLIT' || this.state === 'FINISHED') return { ashDropped: false };

    const dt = (typeof deltaSec === 'number' && !isNaN(deltaSec) && deltaSec > 0) ? deltaSec : 0.016;

    // 吸烟时消耗速率加快（约 16-18 秒深吸燃尽）；不吸烟时极慢自然阴燃（普通烟约 5.5 分钟燃尽，雪茄约 9.2 分钟）
    let burnRate;
    if (isInhaling) {
      burnRate = isCigar ? 0.045 : 0.060;
    } else {
      burnRate = isCigar ? 0.0018 : 0.0030;
    }
    this.cigaretteProgress = Math.max(0, this.cigaretteProgress - burnRate * dt);

    // 烟灰不自动掉落，始终保留并累积，等于自上次抖灰以来的燃烧消耗量
    // 一整根烟整体的灰刚好就是一整个圆圈 (1.0)
    this.ashRatio = Math.min(1.0, Math.max(0, this.lastTapProgress - this.cigaretteProgress));

    if (isNaN(this.cigaretteProgress)) {
      this.cigaretteProgress = 1.0;
    }
    if (isNaN(this.ashRatio)) {
      this.ashRatio = 0.0;
    }

    // 燃尽判定：完全烧尽至滤嘴金圈处 (0% 进度) 才判定抽完，杜绝 5% 提前结算
    if (this.cigaretteProgress <= 0.001) {
      this.cigaretteProgress = 0.0;
      this.state = 'FINISHED';
    }

    // 烟灰不再自动掉落，始终保留
    return { ashDropped: false };
  }

  reset() {
    this.state = 'UNLIT';
    this.cigaretteProgress = 1.0;
    this.lastTapProgress = 1.0;
    this.ashRatio = 0.0;
    this.inhaleCount = 0;
  }
}
