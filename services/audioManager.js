// utils/audioManager.js

class AudioManager {
  constructor() {
    this.ctx = null;
    this.burnSource = null;
    this.burnGain = null;
    this.burnFilter = null;
    this.crackleTimer = null;
    this.masterGain = null;
    this.muted = false;
    this.volume = 0.95;
    this.ambientEnabled = true;
    this.ambientSource = null;
    this.ambientGain = null;
    this.ambientType = null;
    this._sharedNoiseBuffer = null;
    this._ambientBuffers = {};
    this._audioOptionInitialized = false;
    this._localAudioPool = {};
    this.initWeChatAudioOption();
  }

  initWeChatAudioOption() {
    if (this._audioOptionInitialized) return;
    this._audioOptionInitialized = true;
    try {
      if (typeof wx !== 'undefined' && wx.setInnerAudioOption) {
        wx.setInnerAudioOption({
          obeyMuteSwitch: false, // 突破 iOS 静音开关，确保点烟打火机音效清晰传出
          speakerOn: true
        });
      }
    } catch (e) {
      console.warn('initWeChatAudioOption error:', e);
    }
  }

  _getSharedNoiseBuffer(ctx) {
    if (!ctx) return null;
    if (!this._sharedNoiseBuffer) {
      const sampleRate = (ctx.sampleRate && ctx.sampleRate > 0) ? ctx.sampleRate : 44100;
      const bufferSize = sampleRate * 2;
      const buf = ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this._sharedNoiseBuffer = buf;
    }
    return this._sharedNoiseBuffer;
  }

  _createAudioInstance(filePath, fallbackFn) {
    const audio = wx.createInnerAudioContext();
    audio.src = filePath;
    audio.onError((err) => {
      console.warn('InnerAudioContext failed:', filePath, err);
      try { audio.destroy(); } catch (e) {}
      if (fallbackFn) fallbackFn.call(this);
    });
    return audio;
  }

  // 播放本地高品质真实音效文件 (微信原生 InnerAudioContext 硬件加速播放 · 3路复用池轮转保障高速连击零卡顿零丢音)
  playLocalAudio(filePath, fallbackFn) {
    if (this.muted) return;
    this.initWeChatAudioOption();
    try {
      if (typeof wx !== 'undefined' && wx.createInnerAudioContext) {
        if (!this._localAudioPool) this._localAudioPool = {};
        let pool = this._localAudioPool[filePath];
        if (!pool) {
          pool = {
            index: 0,
            instances: [
              this._createAudioInstance(filePath, fallbackFn),
              this._createAudioInstance(filePath, fallbackFn),
              this._createAudioInstance(filePath, fallbackFn)
            ]
          };
          this._localAudioPool[filePath] = pool;
        }
        const audio = pool.instances[pool.index];
        pool.index = (pool.index + 1) % pool.instances.length;
        audio.volume = this.volume;
        try {
          audio.stop();
        } catch (e) {}
        audio.play();
        return;
      }
    } catch (e) {
      console.warn('playLocalAudio exception:', e);
    }
    if (fallbackFn) {
      fallbackFn.call(this);
    }
  }

  getContext() {
    if (!this.ctx) {
      try {
        if (typeof wx !== 'undefined' && wx.createWebAudioContext) {
          this.ctx = wx.createWebAudioContext();
        } else if (typeof AudioContext !== 'undefined') {
          this.ctx = new AudioContext();
        }
        if (this.ctx) {
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        }
      } catch (e) {
        console.warn('WebAudioContext 初始化提示:', e);
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && this.ctx.resume) {
      this.ctx.resume();
    }
    return this.ctx;
  }

  unlockAudio() {
    this.initWeChatAudioOption();
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended' && ctx.resume) {
      ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
    if (muted) {
      this.stopBurnSound();
    }
  }

  isMuted() {
    return this.muted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && !this.muted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  getVolume() {
    return this.volume;
  }

  connectToMaster(node) {
    if (this.masterGain) {
      node.connect(this.masterGain);
    } else if (this.ctx) {
      node.connect(this.ctx.destination);
    }
  }

  // 1. 打火机全套音效（砂轮摩擦嚓声 + 簧片金属嗒声 + 丁烷燃气膨胀呼声 + 烟丝初燃微弱滋滋声）
  playLighterSound() {
    if (this.muted) return;
    this.playLocalAudio('/audio/lighter.mp3', () => {
      this.playLighterSynth();
    });
  }

  playLighterSynth() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 1.1 砂轮摩擦砂石高频沙沙声
      const scratchBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
      const scratchData = scratchBuf.getChannelData(0);
      for (let i = 0; i < scratchData.length; i++) {
        scratchData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (scratchData.length * 0.4));
      }
      const scratchSrc = ctx.createBufferSource();
      scratchSrc.buffer = scratchBuf;

      const scratchFilter = ctx.createBiquadFilter();
      scratchFilter.type = 'highpass';
      scratchFilter.frequency.setValueAtTime(2800, t);

      const scratchGain = ctx.createGain();
      scratchGain.gain.setValueAtTime(0.45, t);
      scratchGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

      scratchSrc.connect(scratchFilter);
      scratchFilter.connect(scratchGain);
      this.connectToMaster(scratchGain);
      scratchSrc.start(t);

      // 1.2 机械簧片冲击金属咔嗒声
      const clickOsc = ctx.createOscillator();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(1600, t + 0.01);
      clickOsc.frequency.exponentialRampToValueAtTime(240, t + 0.05);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.001, t);
      clickGain.gain.setValueAtTime(0.55, t + 0.01);
      clickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

      clickOsc.connect(clickGain);
      this.connectToMaster(clickGain);
      clickOsc.start(t + 0.01);
      clickOsc.stop(t + 0.06);

      // 1.3 丁烷燃气点燃膨胀呼声
      const flameBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.26), ctx.sampleRate);
      const flameData = flameBuf.getChannelData(0);
      for (let i = 0; i < flameData.length; i++) {
        flameData[i] = (Math.random() * 2 - 1);
      }
      const flameSrc = ctx.createBufferSource();
      flameSrc.buffer = flameBuf;

      const flameFilter = ctx.createBiquadFilter();
      flameFilter.type = 'lowpass';
      flameFilter.frequency.setValueAtTime(480, t + 0.02);
      flameFilter.frequency.linearRampToValueAtTime(180, t + 0.26);

      const flameGain = ctx.createGain();
      flameGain.gain.setValueAtTime(0.001, t);
      flameGain.gain.setValueAtTime(0.5, t + 0.06);
      flameGain.gain.exponentialRampToValueAtTime(0.01, t + 0.26);

      flameSrc.connect(flameFilter);
      flameFilter.connect(flameGain);
      this.connectToMaster(flameGain);
      flameSrc.start(t + 0.02);
    } catch (e) {
      console.warn('播放打火机音效失败:', e);
    }
  }

  // 1.2 红头木质火柴划燃音效 (红磷砂纸摩擦哧啦声 + 硫磺爆燃噗嗤声 + 干燥松木轻微哔剥)
  playMatchStrikeSound() {
    if (this.muted) return;
    this.playLocalAudio('/audio/match.mp3', () => {
      this.playMatchSynth();
    });
  }

  playMatchSynth() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 摩擦沙沙哧啦声
      const rubBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
      const rubData = rubBuf.getChannelData(0);
      for (let i = 0; i < rubData.length; i++) {
        rubData[i] = (Math.random() * 2 - 1) * Math.sin((i / rubData.length) * Math.PI);
      }
      const rubSrc = ctx.createBufferSource();
      rubSrc.buffer = rubBuf;
      const rubFilter = ctx.createBiquadFilter();
      rubFilter.type = 'bandpass';
      rubFilter.frequency.setValueAtTime(1600, t);
      rubFilter.frequency.linearRampToValueAtTime(3200, t + 0.1);
      rubFilter.Q.setValueAtTime(3.0, t);
      const rubGain = ctx.createGain();
      rubGain.gain.setValueAtTime(0.01, t);
      rubGain.gain.linearRampToValueAtTime(0.55, t + 0.05);
      rubGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

      rubSrc.connect(rubFilter);
      rubFilter.connect(rubGain);
      this.connectToMaster(rubGain);
      rubSrc.start(t);

      // 磷火爆燃“噗嗤”膨胀声
      const flareBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.28), ctx.sampleRate);
      const flareData = flareBuf.getChannelData(0);
      for (let i = 0; i < flareData.length; i++) {
        flareData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (flareData.length * 0.35));
      }
      const flareSrc = ctx.createBufferSource();
      flareSrc.buffer = flareBuf;
      const flareFilter = ctx.createBiquadFilter();
      flareFilter.type = 'lowpass';
      flareFilter.frequency.setValueAtTime(650, t + 0.07);
      flareFilter.frequency.exponentialRampToValueAtTime(220, t + 0.28);
      const flareGain = ctx.createGain();
      flareGain.gain.setValueAtTime(0.01, t);
      flareGain.gain.setValueAtTime(0.65, t + 0.08);
      flareGain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

      flareSrc.connect(flareFilter);
      flareFilter.connect(flareGain);
      this.connectToMaster(flareGain);
      flareSrc.start(t + 0.07);
    } catch (e) {
      console.warn('播放火柴音效失败:', e);
    }
  }

  // 1.3 Zippo 金属翻盖“叮——”的一声开盖鸣响
  playZippoOpenSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 标志性金属簧片泛音
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const g1 = ctx.createGain();
      const g2 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(3280, t);
      osc1.frequency.exponentialRampToValueAtTime(3120, t + 0.35);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1640, t);
      osc2.frequency.exponentialRampToValueAtTime(1580, t + 0.25);

      g1.gain.setValueAtTime(0.48, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      g2.gain.setValueAtTime(0.32, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc1.connect(g1);
      osc2.connect(g2);
      this.connectToMaster(g1);
      this.connectToMaster(g2);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.48);
      osc2.stop(t + 0.32);
    } catch (e) {
      console.warn('播放Zippo开盖音效失败:', e);
    }
  }

  // 1.4 Zippo 砂轮打火 (粗犷火石摩擦 + 饱满棉芯燃油蓬勃火苗)
  playZippoStrikeSound() {
    if (this.muted) return;
    this.playLocalAudio('/audio/zippo.mp3', () => {
      this.playZippoOpenSound();
      setTimeout(() => {
        this.playLighterSynth();
      }, 60);
    });
  }

  // 1.5 雪茄专配三喷高温防风蓝焰喷枪 (压电电击哒声 + 强劲暴风呼啸高压蓝锥气流)
  playTorchSound() {
    if (this.muted) return;
    this.playLocalAudio('/audio/torch.mp3', () => {
      this.playTorchSynth();
    });
  }

  playTorchSynth() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 电子点火器“咔哒”瞬间脉冲
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(80, t);
      clickOsc.frequency.exponentialRampToValueAtTime(1800, t + 0.02);
      clickGain.gain.setValueAtTime(0.6, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      clickOsc.connect(clickGain);
      this.connectToMaster(clickGain);
      clickOsc.start(t);
      clickOsc.stop(t + 0.035);

      // 高速丁烷气流喷薄“呼啸暴风”声
      const jetBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.32), ctx.sampleRate);
      const jetData = jetBuf.getChannelData(0);
      for (let i = 0; i < jetData.length; i++) {
        jetData[i] = (Math.random() * 2 - 1) * (0.8 + 0.2 * Math.sin(i * 0.01));
      }
      const jetSrc = ctx.createBufferSource();
      jetSrc.buffer = jetBuf;

      const jetFilter = ctx.createBiquadFilter();
      jetFilter.type = 'bandpass';
      jetFilter.frequency.setValueAtTime(1450, t);
      jetFilter.Q.setValueAtTime(1.2, t);

      const jetGain = ctx.createGain();
      jetGain.gain.setValueAtTime(0.01, t);
      jetGain.gain.linearRampToValueAtTime(0.7, t + 0.04);
      jetGain.gain.exponentialRampToValueAtTime(0.01, t + 0.32);

      jetSrc.connect(jetFilter);
      jetFilter.connect(jetGain);
      this.connectToMaster(jetGain);
      jetSrc.start(t + 0.01);
    } catch (e) {
      console.warn('播放蓝焰喷枪音效失败:', e);
    }
  }

  // 1.6 车载螺旋电热丝点烟器 (金属弹起清脆啪嗒声 + 烙烫烟草滋滋作响)
  playCarLighterPopSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 强力弹簧弹起咔嗒碰撞
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.06);
      g.gain.setValueAtTime(0.55, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      osc.connect(g);
      this.connectToMaster(g);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {
      console.warn('播放车载点烟器弹起音效失败:', e);
    }
  }

  // 1.7 电热丝接触烟丝烙烫焦化滋滋声
  playSizzleSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      const sizzleBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.22), ctx.sampleRate);
      const sizzleData = sizzleBuf.getChannelData(0);
      for (let i = 0; i < sizzleData.length; i++) {
        sizzleData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sizzleData.length * 0.4));
      }
      const sizzleSrc = ctx.createBufferSource();
      sizzleSrc.buffer = sizzleBuf;
      const sizzleFilter = ctx.createBiquadFilter();
      sizzleFilter.type = 'highpass';
      sizzleFilter.frequency.setValueAtTime(3200, t);
      const sizzleGain = ctx.createGain();
      sizzleGain.gain.setValueAtTime(0.6, t);
      sizzleGain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

      sizzleSrc.connect(sizzleFilter);
      sizzleFilter.connect(sizzleGain);
      this.connectToMaster(sizzleGain);
      sizzleSrc.start(t);
    } catch (e) {
      console.warn('播放烙烫滋滋声失败:', e);
    }
  }

  // 1.8 赛博等离子双弧高能放电与蜂鸣声 (Plasma Arc Zap & Hum)
  playPlasmaArcSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 1. 电弧初击穿脉冲噼啪 (Transient Zap Click)
      const zapBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate);
      const zapData = zapBuf.getChannelData(0);
      for (let i = 0; i < zapData.length; i++) {
        zapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (zapData.length * 0.25));
      }
      const zapSrc = ctx.createBufferSource();
      zapSrc.buffer = zapBuf;
      const zapFilter = ctx.createBiquadFilter();
      zapFilter.type = 'bandpass';
      zapFilter.frequency.setValueAtTime(4500, t);
      zapFilter.Q.setValueAtTime(2.0, t);
      const zapGain = ctx.createGain();
      zapGain.gain.setValueAtTime(0.45, t);
      zapGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      zapSrc.connect(zapFilter);
      zapFilter.connect(zapGain);
      this.connectToMaster(zapGain);
      zapSrc.start(t);

      // 2. 双载波高频等离子蜂鸣谐波 (Dual carrier high-frequency buzz with organic detuning)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(1920, t);
      osc2.frequency.setValueAtTime(2400, t);

      // 120Hz 调制嗡鸣
      const modOsc = ctx.createOscillator();
      modOsc.frequency.setValueAtTime(120, t);
      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(0.3, t);
      modOsc.connect(modGain.gain);

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.001, t);
      mainGain.gain.linearRampToValueAtTime(0.25, t + 0.03);
      mainGain.gain.setValueAtTime(0.22, t + 0.25);
      mainGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      const bpFilter = ctx.createBiquadFilter();
      bpFilter.type = 'bandpass';
      bpFilter.frequency.setValueAtTime(2100, t);
      bpFilter.Q.setValueAtTime(3.5, t);

      osc1.connect(bpFilter);
      osc2.connect(bpFilter);
      bpFilter.connect(mainGain);
      this.connectToMaster(mainGain);

      osc1.start(t);
      osc2.start(t);
      modOsc.start(t);
      osc1.stop(t + 0.4);
      osc2.stop(t + 0.4);
      modOsc.stop(t + 0.4);
    } catch (e) {
      console.warn('播放等离子双弧音效失败:', e);
    }
  }

  // 统一点火工具分发器
  playIgnitionSoundByTool(toolId) {
    if (this.muted) return;
    switch (toolId) {
      case 'vintage_match':
        this.playMatchStrikeSound();
        break;
      case 'zippo_vintage':
        this.playZippoStrikeSound();
        break;
      case 'blue_torch':
        this.playTorchSound();
        break;
      case 'plasma_arc':
        this.playPlasmaArcSound();
        break;
      case 'car_lighter':
        this.playSizzleSound();
        break;
      case 'flint_lighter':
      default:
        this.playLighterSound();
        break;
    }
  }

  // 2. 深吸气流与烟丝微火星“噼啪/滋滋”爆裂 ASMR 声
  startBurnSound() {
    if (this.muted || this.burnSource) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      const noiseBuffer = this._getSharedNoiseBuffer(ctx);
      if (!noiseBuffer) return;

      this.burnSource = ctx.createBufferSource();
      this.burnSource.buffer = noiseBuffer;
      this.burnSource.loop = true;

      this.burnFilter = ctx.createBiquadFilter();
      this.burnFilter.type = 'bandpass';
      this.burnFilter.frequency.setValueAtTime(1100, t);
      this.burnFilter.Q.setValueAtTime(1.8, t);

      this.burnGain = ctx.createGain();
      this.burnGain.gain.setValueAtTime(0.001, t);
      this.burnGain.gain.linearRampToValueAtTime(0.38, t + 0.08);

      this.burnSource.connect(this.burnFilter);
      this.burnFilter.connect(this.burnGain);
      this.connectToMaster(this.burnGain);
      this.burnSource.start(t);

      // 智能伴吸侧链闪避 (Smart Sidechain Ducking)：吸烟时自动轻柔压低环境声床，让烟丝燃烧微爆声纯净凸显
      if (this.ambientGain && this.ctx && this.ambientBaseGain) {
        try {
          this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, t);
          this.ambientGain.gain.linearRampToValueAtTime(this.ambientBaseGain * 0.42, t + 0.15);
        } catch {}
      }

      // 烟丝微火星随机爆裂脉冲
      const triggerCrackle = () => {
        if (!this.burnSource || this.muted) return;
        try {
          const now = ctx.currentTime;
          const sharedBuf = this._getSharedNoiseBuffer(ctx);
          if (!sharedBuf) return;
          const popSrc = ctx.createBufferSource();
          popSrc.buffer = sharedBuf;

          const popFilter = ctx.createBiquadFilter();
          popFilter.type = 'bandpass';
          popFilter.frequency.setValueAtTime(2400 + Math.random() * 3200, now);
          popFilter.Q.setValueAtTime(4.0, now);

          const cGain = ctx.createGain();
          const popVol = 0.22 + Math.random() * 0.28;
          cGain.gain.setValueAtTime(popVol, now);
          cGain.gain.exponentialRampToValueAtTime(0.01, now + 0.008);

          popSrc.connect(popFilter);
          popFilter.connect(cGain);
          this.connectToMaster(cGain);
          const randomOffset = Math.random() * 1.95;
          popSrc.start(now, randomOffset, 0.008);
          setTimeout(() => {
            try { popSrc.disconnect(); } catch {}
            try { popFilter.disconnect(); } catch {}
            try { cGain.disconnect(); } catch {}
          }, 25);
        } catch {}

        if (this.burnSource) {
          const nextInterval = 35 + Math.random() * 60;
          this.crackleTimer = setTimeout(triggerCrackle, nextInterval);
        }
      };

      triggerCrackle();
    } catch (e) {
      console.warn('播放燃烧声失败:', e);
    }
  }

  stopBurnSound() {
    if (this.crackleTimer) {
      clearTimeout(this.crackleTimer);
      this.crackleTimer = null;
    }
    // 恢复环境声床温润呼吸音量
    if (this.ambientGain && this.ctx && this.ambientBaseGain) {
      try {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
        this.ambientGain.gain.linearRampToValueAtTime(this.ambientBaseGain, now + 0.65);
      } catch {}
    }
    if (this.burnSource) {
      try {
        if (this.ctx && this.burnGain) {
          const now = this.ctx.currentTime;
          this.burnGain.gain.linearRampToValueAtTime(0.001, now + 0.05);
          const src = this.burnSource;
          const filter = this.burnFilter;
          const gain = this.burnGain;
          setTimeout(() => {
            try {
              src.stop();
              src.disconnect();
            } catch {}
            if (filter) {
              try { filter.disconnect(); } catch {}
            }
            if (gain) {
              try { gain.disconnect(); } catch {}
            }
          }, 60);
          this.burnSource = null;
          this.burnGain = null;
          this.burnFilter = null;
        } else {
          this.burnSource.stop();
          this.burnSource.disconnect();
          if (this.burnFilter) {
            try { this.burnFilter.disconnect(); } catch {}
          }
          if (this.burnGain) {
            try { this.burnGain.disconnect(); } catch {}
          }
          this.burnSource = null;
          this.burnGain = null;
          this.burnFilter = null;
        }
      } catch {
        this.burnSource = null;
        this.burnGain = null;
        this.burnFilter = null;
      }
    }
  }

  stopInhaleSound() {
    this.stopBurnSound();
  }

  stopExhaleSound() {}

  // 3. 吐烟呼气微风声
  playExhaleSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      const duration = 1.3;

      const buf = this._getSharedNoiseBuffer(ctx);
      if (!buf) return;
      const src = ctx.createBufferSource();
      src.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(360, t);
      filter.frequency.exponentialRampToValueAtTime(140, t + duration);

      const exhaleGain = ctx.createGain();
      exhaleGain.gain.setValueAtTime(0.001, t);
      exhaleGain.gain.linearRampToValueAtTime(0.38, t + 0.15);
      exhaleGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      src.connect(filter);
      filter.connect(exhaleGain);
      this.connectToMaster(exhaleGain);
      src.start(t, 0, duration);
      setTimeout(() => {
        try { src.disconnect(); } catch {}
        try { filter.disconnect(); } catch {}
        try { exhaleGain.disconnect(); } catch {}
      }, Math.ceil(duration * 1000) + 60);
    } catch (e) {
      console.warn('播放呼气音失败:', e);
    }
  }

  // 4. 弹烟灰敲击声
  playAshTapSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.07);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.42, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

      osc.connect(gain);
      this.connectToMaster(gain);
      osc.start(t);
      osc.stop(t + 0.07);
    } catch {}
  }

  // 4.1 烟灰缸清空 ASMR 扫灰与微铜回响声
  playAshtraySweepSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 柔和清风白噪微拂
      const bufferSize = Math.floor(ctx.sampleRate * 0.25);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(600, t + 0.22);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.32, t);
      nGain.gain.exponentialRampToValueAtTime(0.005, t + 0.25);

      noise.connect(filter);
      filter.connect(nGain);
      this.connectToMaster(nGain);
      noise.start(t);

      // 紫铜底托余音泛音 (880Hz -> 528Hz 极弱微鸣)
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(528, t + 0.35);

      const oGain = ctx.createGain();
      oGain.gain.setValueAtTime(0.001, t);
      oGain.gain.linearRampToValueAtTime(0.10, t + 0.08);
      oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(oGain);
      this.connectToMaster(oGain);
      osc.start(t + 0.08);
      osc.stop(t + 0.38);
    } catch {}
  }

  // 5. 4-7-8 呼吸减压正念磬音
  playZenChimeSound(freq = 528) {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      const duration = 2.4;

      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.01, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.32, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.001, t);
      gain2.gain.linearRampToValueAtTime(0.12, t + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.7);

      osc1.connect(gain);
      osc2.connect(gain2);
      gain2.connect(gain);
      this.connectToMaster(gain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + duration);
      osc2.stop(t + duration);
    } catch {}
  }

  // 6. 替烟达成庆祝和弦
  playSuccessSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const noteTime = t + idx * 0.09;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.35, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

        osc.connect(gain);
        this.connectToMaster(gain);
        osc.start(noteTime);
        osc.stop(noteTime + 0.45);
      });
    } catch {}
  }

  // 7. UI 轻触与切换音
  playSwitchSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(980, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.035);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.035);

      osc.connect(gain);
      this.connectToMaster(gain);
      osc.start(t);
      osc.stop(t + 0.035);
    } catch {}
  }

  playClick() {
    this.playSwitchSound();
  }

  // 星链卫星测控连线与应答脉冲音 (高频纯净太空遥测双音: 1046Hz -> 1318Hz 晶振微鸣)
  playSatellitePingSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046, t);
      osc.frequency.setValueAtTime(1318, t + 0.04);
      osc.frequency.exponentialRampToValueAtTime(1568, t + 0.09);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      this.connectToMaster(gain);
      osc.start(t);
      osc.stop(t + 0.16);
    } catch {}
  }

  // 8. 捏爆珠真实物理破壳声 (5阶物理声学建模：滤嘴捏压摩擦 -> 明胶脆壳咔啪双裂瞬态 -> 内部高压香精爆浆 -> 残壳微碎 -> 海绵毛细吸纳微滋声)
  playPopBeadSound() {
    if (this.muted) return;
    this.playLocalAudio('/audio/bead_pop.mp3', () => {
      this.playPopBeadSynth();
    });
  }

  playPopBeadSynth() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 8.1 指尖捏压醋酸纤维海绵烟嘴的紧实微摩擦 (0 ~ 32ms)
      const squeezeBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.032), ctx.sampleRate);
      const squeezeData = squeezeBuf.getChannelData(0);
      for (let i = 0; i < squeezeData.length; i++) {
        squeezeData[i] = (Math.random() * 2 - 1) * Math.sin((i / squeezeData.length) * Math.PI);
      }
      const squeezeSrc = ctx.createBufferSource();
      squeezeSrc.buffer = squeezeBuf;
      const squeezeFilter = ctx.createBiquadFilter();
      squeezeFilter.type = 'bandpass';
      squeezeFilter.frequency.setValueAtTime(1650, t);
      squeezeFilter.Q.setValueAtTime(1.8, t);
      const squeezeGain = ctx.createGain();
      squeezeGain.gain.setValueAtTime(0.22, t);
      squeezeGain.gain.exponentialRampToValueAtTime(0.01, t + 0.032);
      squeezeSrc.connect(squeezeFilter);
      squeezeFilter.connect(squeezeGain);
      this.connectToMaster(squeezeGain);
      squeezeSrc.start(t);

      // 8.2 外层硬脆明胶珠壳崩裂“咔-啪！”双瞬态脉冲 (30ms 初裂 + 38ms 主爆破)
      const snapBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.045), ctx.sampleRate);
      const snapData = snapBuf.getChannelData(0);
      for (let i = 0; i < snapData.length; i++) {
        const dtSec = i / ctx.sampleRate;
        const env1 = dtSec < 0.008 ? Math.exp(-dtSec / 0.0018) * 0.75 : 0;
        const env2 = dtSec >= 0.007 ? Math.exp(-(dtSec - 0.007) / 0.0028) * 1.0 : 0;
        snapData[i] = (Math.random() * 2 - 1) * (env1 + env2);
      }
      const snapNoise = ctx.createBufferSource();
      snapNoise.buffer = snapBuf;
      const snapFilter = ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(3600, t + 0.028);
      snapFilter.Q.setValueAtTime(2.6, t + 0.028);
      const snapNoiseGain = ctx.createGain();
      snapNoiseGain.gain.setValueAtTime(0.92, t + 0.028);
      snapNoiseGain.gain.exponentialRampToValueAtTime(0.005, t + 0.072);
      snapNoise.connect(snapFilter);
      snapFilter.connect(snapNoiseGain);
      this.connectToMaster(snapNoiseGain);
      snapNoise.start(t + 0.028);

      // 脆壳高频弹性断裂音体 (2400Hz -> 320Hz 极速俯冲)
      const oscSnap = ctx.createOscillator();
      oscSnap.type = 'triangle';
      oscSnap.frequency.setValueAtTime(2400, t + 0.035);
      oscSnap.frequency.exponentialRampToValueAtTime(320, t + 0.056);
      const gainSnap = ctx.createGain();
      gainSnap.gain.setValueAtTime(0.85, t + 0.035);
      gainSnap.gain.exponentialRampToValueAtTime(0.001, t + 0.058);
      oscSnap.connect(gainSnap);
      this.connectToMaster(gainSnap);
      oscSnap.start(t + 0.035);
      oscSnap.stop(t + 0.058);

      // 8.3 指腹发力低频敦实震感与内部精油爆浆“啵”声共鸣 (40ms ~ 105ms)
      const oscJuice = ctx.createOscillator();
      oscJuice.type = 'sine';
      oscJuice.frequency.setValueAtTime(880, t + 0.040);
      oscJuice.frequency.exponentialRampToValueAtTime(165, t + 0.098);
      const gainJuice = ctx.createGain();
      gainJuice.gain.setValueAtTime(0.68, t + 0.040);
      gainJuice.gain.exponentialRampToValueAtTime(0.001, t + 0.102);
      oscJuice.connect(gainJuice);
      this.connectToMaster(gainJuice);
      oscJuice.start(t + 0.040);
      oscJuice.stop(t + 0.102);

      // 8.4 香精原液顺海绵微孔毛细渗透的微弱湿润“滋——”尾韵 (55ms ~ 240ms)
      const fizzBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.18), ctx.sampleRate);
      const fizzData = fizzBuf.getChannelData(0);
      for (let i = 0; i < fizzData.length; i++) {
        const p = i / fizzData.length;
        fizzData[i] = (Math.random() * 2 - 1) * Math.sin(Math.min(1, p * 6) * Math.PI * 0.5) * Math.exp(-p * 3.2);
      }
      const fizzSrc = ctx.createBufferSource();
      fizzSrc.buffer = fizzBuf;
      const fizzFilter = ctx.createBiquadFilter();
      fizzFilter.type = 'highpass';
      fizzFilter.frequency.setValueAtTime(3800, t + 0.055);
      const fizzGain = ctx.createGain();
      fizzGain.gain.setValueAtTime(0.24, t + 0.055);
      fizzGain.gain.exponentialRampToValueAtTime(0.001, t + 0.235);
      fizzSrc.connect(fizzFilter);
      fizzFilter.connect(fizzGain);
      this.connectToMaster(fizzGain);
      fizzSrc.start(t + 0.055);
    } catch {}
  }

  // 9. 榜单点赞清风音 (Heart Like Chime)
  playLikeHeartSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, t); // G5
      osc.frequency.exponentialRampToValueAtTime(1174.66, t + 0.09); // D6

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      this.connectToMaster(gain);
      osc.start(t);
      osc.stop(t + 0.16);
    } catch {}
  }

  // 10. 翻开烟盒清脆开合声 (Flip-Top Open Box Sound)
  playPackOpenSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 盒盖硬纸翻折清脆咔嗒声 (Cardboard Flap Snap)
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.05);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      this.connectToMaster(gain);
      osc.start(t);
      osc.stop(t + 0.05);

      // 内衬锡箔纸微沙声
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, t + 0.015);
      filter.Q.value = 2.0;

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.25, t + 0.015);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);

      noise.connect(filter);
      filter.connect(nGain);
      this.connectToMaster(nGain);
      noise.start(t + 0.015);
    } catch {}
  }

  // 11. 盖上烟盒合拢嗒声 (Snap Shut Box Sound)
  playPackCloseSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.04);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.38, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      this.connectToMaster(gain);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch {}
  }

  // 12. 腾讯武侠/国潮神话级 · 【宝刀出鞘·龙吟剑鸣】全流程视听交响
  playPullCigaretteSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // [第一幕 0.00s~0.35s 寒芒破鞘]：清脆冷冽的金属刀锋出鞘“铮——！”泛音共鸣 + 刀鞘摩擦声
      const bladeFreqs = [2349.32, 3520.0, 4978.03]; // D7, A7, D#8 寒铁剑鸣高频泛音簇
      bladeFreqs.forEach((bf, bIdx) => {
        const bOsc = ctx.createOscillator();
        bOsc.type = bIdx === 0 ? 'triangle' : 'sine';
        bOsc.frequency.setValueAtTime(bf * 0.92, t);
        bOsc.frequency.exponentialRampToValueAtTime(bf * 1.04, t + 0.06);
        bOsc.frequency.exponentialRampToValueAtTime(bf, t + 0.34);

        const bGain = ctx.createGain();
        bGain.gain.setValueAtTime(0.001, t);
        bGain.gain.linearRampToValueAtTime(0.18 / (bIdx + 1), t + 0.015);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);

        bOsc.connect(bGain);
        this.connectToMaster(bGain);
        bOsc.start(t);
        bOsc.stop(t + 0.38);
      });

      // 刀锋滑出剑鞘的高频金属丝滑摩擦包络
      const scrapeLen = Math.floor(ctx.sampleRate * 0.18);
      const scrapeBuf = ctx.createBuffer(1, scrapeLen, ctx.sampleRate);
      const scrapeData = scrapeBuf.getChannelData(0);
      for (let i = 0; i < scrapeLen; i++) {
        const p = i / scrapeLen;
        scrapeData[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI) * Math.exp(-p * 1.8);
      }
      const scrapeSrc = ctx.createBufferSource();
      scrapeSrc.buffer = scrapeBuf;
      const scrapeFilter = ctx.createBiquadFilter();
      scrapeFilter.type = 'bandpass';
      scrapeFilter.frequency.setValueAtTime(3400, t);
      scrapeFilter.frequency.exponentialRampToValueAtTime(6200, t + 0.16);
      scrapeFilter.Q.value = 3.5;
      const scrapeGain = ctx.createGain();
      scrapeGain.gain.setValueAtTime(0.28, t);
      scrapeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      scrapeSrc.connect(scrapeFilter);
      scrapeFilter.connect(scrapeGain);
      this.connectToMaster(scrapeGain);
      scrapeSrc.start(t);

      // [第二幕 0.18s~0.62s 拔剑冲霄]：凌厉破空剑气音障呼啸 (Sword-Qi Sonic Whoosh)
      const whooshLen = Math.floor(ctx.sampleRate * 0.44);
      const whooshBuf = ctx.createBuffer(1, whooshLen, ctx.sampleRate);
      const whooshData = whooshBuf.getChannelData(0);
      for (let i = 0; i < whooshLen; i++) {
        const p = i / whooshLen;
        whooshData[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI) * (0.75 + 0.25 * Math.sin(i * 0.05));
      }
      const whooshSrc = ctx.createBufferSource();
      whooshSrc.buffer = whooshBuf;

      const whooshFilter = ctx.createBiquadFilter();
      whooshFilter.type = 'bandpass';
      whooshFilter.frequency.setValueAtTime(720, t + 0.18);
      whooshFilter.frequency.exponentialRampToValueAtTime(3400, t + 0.54);
      whooshFilter.Q.value = 2.0;

      const whooshGain = ctx.createGain();
      whooshGain.gain.setValueAtTime(0.001, t + 0.18);
      whooshGain.gain.linearRampToValueAtTime(0.26, t + 0.30);
      whooshGain.gain.exponentialRampToValueAtTime(0.001, t + 0.62);

      whooshSrc.connect(whooshFilter);
      whooshFilter.connect(whooshGain);
      this.connectToMaster(whooshGain);
      whooshSrc.start(t + 0.18);

      // [第三幕 0.44s~1.26s 游龙挽剑花]：东方五声宫商仙侠剑意泛音流
      const ribbonNotes = [587.33, 659.25, 783.99, 880.0, 1174.66, 1318.51, 1567.98, 2349.32];
      ribbonNotes.forEach((freq, idx) => {
        const noteT = t + 0.44 + idx * 0.095;
        const nOsc = ctx.createOscillator();
        nOsc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        nOsc.frequency.setValueAtTime(freq, noteT);
        nOsc.frequency.exponentialRampToValueAtTime(freq * 1.012, noteT + 0.30);

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.001, noteT);
        nGain.gain.linearRampToValueAtTime(0.14 - idx * 0.008, noteT + 0.02);
        nGain.gain.exponentialRampToValueAtTime(0.001, noteT + 0.36);

        nOsc.connect(nGain);
        this.connectToMaster(nGain);
        nOsc.start(noteT);
        nOsc.stop(noteT + 0.38);
      });

      // [第四幕 1.24s~2.05s 神兵归宗定格]：低频龙吟震地重音 + 剑归天枢璀璨泛音和弦
      const impactT = t + 1.24;
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(145, impactT);
      subOsc.frequency.exponentialRampToValueAtTime(44, impactT + 0.42);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.001, impactT);
      subGain.gain.linearRampToValueAtTime(0.36, impactT + 0.02);
      subGain.gain.exponentialRampToValueAtTime(0.001, impactT + 0.45);

      subOsc.connect(subGain);
      this.connectToMaster(subGain);
      subOsc.start(impactT);
      subOsc.stop(impactT + 0.46);

      const finaleChord = [1174.66, 1760.0, 2349.32, 2637.02, 3520.0];
      finaleChord.forEach((freq, idx) => {
        const cStart = impactT + idx * 0.016;
        const cOsc = ctx.createOscillator();
        cOsc.type = 'sine';
        cOsc.frequency.setValueAtTime(freq, cStart);

        const cGain = ctx.createGain();
        cGain.gain.setValueAtTime(0.001, cStart);
        cGain.gain.linearRampToValueAtTime(0.15 - idx * 0.016, cStart + 0.025);
        cGain.gain.exponentialRampToValueAtTime(0.001, cStart + 0.68);

        cOsc.connect(cGain);
        this.connectToMaster(cGain);
        cOsc.start(cStart);
        cOsc.stop(cStart + 0.70);
      });
    } catch {}
  }

  // 13. 拆封撕开外包装玻璃纸解压声 (Tear Cellophane / Unwrap New Pack Sound)
  playUnwrapSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // ASMR 玻璃纸连续脆爽摩擦撕拉
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.28), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const env = Math.sin((i / data.length) * Math.PI);
        const rand = (Math.random() * 2 - 1) * (Math.random() > 0.6 ? 1.4 : 0.4);
        data[i] = rand * env;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3600, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      noise.connect(filter);
      filter.connect(gain);
      this.connectToMaster(gain);
      noise.start(t);
    } catch {}
  }

  // ==========================================
  // 14. 腾讯白噪音大师级 · 沉浸自然呼吸声床引擎 (Master Velvet Ambient Soundscape Engine)
  // 核心声学准则：
  // 1) 摒弃刺耳高频白噪 (White Noise) 与恼人正弦单音蜂鸣 (Sine Hum)，全系采用双阶布朗/丝绒暖粉积分滤波 (-12dB/Octave)；
  // 2) 6.0 秒超长无缝余弦交叉淡化缓冲 (Seamless Cosine Crossfade Loop)，彻底根除 3 秒硬切循环接缝；
  // 3) 契合人体静息副交感神经节律的 6 秒慢呼吸包络 (10次/分自然微风起伏) + -26dB 微阈丝绒增益 (0.042~0.064) + 2.0s 柔滑渐入；
  // 4) 配合吸烟动作智能侧链闪避 (Sidechain Ducking)，润物无声，久听不累。
  // ==========================================
  startAmbientSound(sceneType) {
    if (this.muted || this.ambientEnabled === false || !sceneType) {
      this.stopAmbientSound(true);
      return;
    }
    if (this.ambientType === sceneType && this.ambientSource) {
      return; // 已经在播放该环境音
    }
    this.stopAmbientSound(true);

    try {
      this.initWeChatAudioOption();
      this.unlockAudio();
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended' && ctx.resume) {
        ctx.resume();
      }
      const t = ctx.currentTime;
      const sampleRate = (ctx && ctx.sampleRate && ctx.sampleRate > 0) ? ctx.sampleRate : 44100;

      let cutoffFreq = 240;
      let targetGain = 0.044;
      if (sceneType === 'rainy_car' || sceneType === 'rainy_camp') {
        cutoffFreq = 380;
        targetGain = 0.060;
      } else if (sceneType === 'campfire' || sceneType === 'whisky_bar') {
        cutoffFreq = 320;
        targetGain = 0.054;
      } else if (sceneType === 'midnight_balcony' || sceneType === 'midnight_rooftop' || sceneType === 'ocean' || sceneType === 'zen_bamboo') {
        cutoffFreq = 290;
        targetGain = 0.056;
      } else if (sceneType === 'night_fishing' || sceneType === 'snowy_lamp') {
        cutoffFreq = 260;
        targetGain = 0.048;
      } else if (sceneType === 'underground_garage' || sceneType === 'stairwell' || sceneType === 'convenience_store') {
        cutoffFreq = 220;
        targetGain = 0.046;
      } else if (sceneType === 'solar_system' || sceneType === 'deep_cosmos' || sceneType === 'lunar_planet' || sceneType === 'starship_bridge' || sceneType === 'starlink_orbit') {
        cutoffFreq = sceneType === 'starlink_orbit' ? 260 : (sceneType === 'starship_bridge' ? 190 : 240);
        targetGain = 0.048;
      } else if (sceneType === 'sakura_night') {
        cutoffFreq = 280;
        targetGain = 0.052;
      } else if (sceneType === 'cat_companion') {
        cutoffFreq = 340;
        targetGain = 0.058;
      } else if (sceneType === 'totoro_rain' || sceneType === 'moonlit_dance') {
        cutoffFreq = 360;
        targetGain = 0.058;
      } else if (sceneType === 'snoopy_stargazing' || sceneType === 'jazz_sway') {
        cutoffFreq = 310;
        targetGain = 0.052;
      } else if (sceneType === 'cozy_family') {
        cutoffFreq = 330;
        targetGain = 0.056;
      }

      if (!this._ambientBuffers) {
        this._ambientBuffers = {};
      }
      let buffer = this._ambientBuffers[sceneType];
      if (!buffer) {
        // 生成 6.0 秒超长平滑声床缓冲 + 0.5 秒首尾无缝余弦交叉融接
        const loopDur = 6.0;
        const fadeSamples = Math.floor(sampleRate * 0.5);
        const bufferLength = Math.floor(sampleRate * loopDur);
        const totalGen = bufferLength + fadeSamples;
        const raw = new Float32Array(totalGen);

        if (sceneType === 'rainy_car' || sceneType === 'rainy_camp') {
          // 隔窗微雨 / 天幕细雨：豪车双层夹胶玻璃外的温润绵密细雨，滤除一切刺耳高频沙沙声
          let b0 = 0, b1 = 0;
          for (let i = 0; i < totalGen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.994 * b0 + white * 0.032;
            b1 = 0.982 * b1 + b0 * 0.18;
            const breath = 0.78 + 0.22 * Math.sin((i / bufferLength) * Math.PI * 2);
            raw[i] = b1 * 0.48 * breath;
          }
        } else if (sceneType === 'campfire' || sceneType === 'whisky_bar') {
          // 森林篝火 / 威士忌酒吧：温暖壁炉低频暖流 + 柔暖黑胶松弛余韵
          let b0 = 0, b1 = 0;
          for (let i = 0; i < totalGen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.996 * b0 + white * 0.026;
            b1 = 0.988 * b1 + b0 * 0.16;
            const breath = 0.80 + 0.20 * Math.sin((i / bufferLength) * Math.PI * 2);
            raw[i] = b1 * 0.52 * breath;
          }
        } else if (sceneType === 'totoro_rain' || sceneType === 'moonlit_dance') {
          // 雨夜龙猫：幽深森林细雨沙沙声 + 荷叶雨滴清润微鸣 (Forest Rain Bed with Leaf Droplet Harmonics)
          let b0 = 0, b1 = 0;
          for (let i = 0; i < totalGen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.9950 * b0 + white * 0.028;
            b1 = 0.9850 * b1 + b0 * 0.17;
            const forestBreeze = 0.72 + 0.28 * Math.sin((i / bufferLength) * Math.PI * 2);
            // 荷叶水滴清脆泛音 (680Hz / 840Hz 晶莹露水滴落共鸣)
            const leafDrop = 0.024 * Math.sin((i / sampleRate) * 2 * Math.PI * 680.0) * Math.exp(-((i % (sampleRate * 2.2)) / (sampleRate * 0.35))) +
                             0.016 * Math.sin((i / sampleRate) * 2 * Math.PI * 840.0) * Math.exp(-(((i + sampleRate * 1.1) % (sampleRate * 2.2)) / (sampleRate * 0.35)));
            raw[i] = (b1 * 0.48 + leafDrop) * forestBreeze;
          }
        } else if (sceneType === 'snoopy_stargazing' || sceneType === 'jazz_sway') {
          // 史努比星空：宁静夏夜微风 + 复古留声机黑胶微弱温暖底噪 + 432Hz 疗愈星空和弦
          let b0 = 0, b1 = 0;
          for (let i = 0; i < totalGen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.9962 * b0 + white * 0.024;
            b1 = 0.9885 * b1 + b0 * 0.16;
            const nightBreeze = 0.75 + 0.25 * Math.sin((i / bufferLength) * Math.PI * 2);
            // 432Hz 治愈大提琴温厚泛音
            const starChime = 0.035 * Math.sin((i / sampleRate) * 2 * Math.PI * 432.0) * (0.8 + 0.2 * Math.sin((i / bufferLength) * Math.PI * 4));
            raw[i] = (b1 * 0.50 + starChime) * nightBreeze;
          }
        } else if (sceneType === 'cat_companion') {
          // 暖阁喵眠：案头温润猫咪呼噜呼噜声 (26Hz 基频与 52Hz 次泛音呼吸起伏调制) + 暖木书房静谧微风
          let b0 = 0, b1 = 0;
          for (let i = 0; i < totalGen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.9965 * b0 + white * 0.022;
            b1 = 0.9890 * b1 + b0 * 0.16;
            // 猫咪 3.8 秒一吸一呼的深度呼噜声调制 (Purr LFO)
            const purrLFO = 0.62 + 0.38 * Math.sin((i / bufferLength) * Math.PI * 2 * (loopDur / 3.8));
            // 26Hz 喉头颤音基频与 52Hz 温暖泛音
            const purrTone = (0.052 * Math.sin((i / sampleRate) * 2 * Math.PI * 26.0) +
                              0.032 * Math.sin((i / sampleRate) * 2 * Math.PI * 52.0)) * purrLFO;
            raw[i] = (b1 * 0.46 + purrTone);
          }
        } else if (sceneType === 'cozy_family') {
          // 温馨小家：壁炉柴火噼啪微响 + 528Hz 治愈心率泛音 + 窗外微弱夜风
          let b0 = 0, b1 = 0;
          for (let i = 0; i < totalGen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.9965 * b0 + white * 0.024;
            b1 = 0.9880 * b1 + b0 * 0.16;
            // 壁炉慢呼吸火光
            const hearthBreath = 0.78 + 0.22 * Math.sin((i / bufferLength) * Math.PI * 2 * 1.5);
            // 偶发木柴微弱爆裂噼啪火星声 (Wood Crackle Sparks)
            const crackle = (Math.random() < 0.0008) ? (Math.random() * 0.18 - 0.09) : 0;
            // 528Hz 疗愈泛音
            const hearthChime = 0.028 * Math.sin((i / sampleRate) * 2 * Math.PI * 528.0) * (0.8 + 0.2 * Math.sin((i / bufferLength) * Math.PI * 2));
            raw[i] = (b1 * 0.48 + crackle + hearthChime) * hearthBreath;
          }
        } else if (sceneType === 'sakura_night') {
          // 落樱夜庭：春夜微风拂落樱花瓣 + 极轻柔空灵夜音
          let b0 = 0, b1 = 0;
          for (let i = 0; i < totalGen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.9962 * b0 + white * 0.023;
            b1 = 0.989 * b1 + b0 * 0.16;
            const sakuraBreeze = 0.65 + 0.35 * Math.sin((i / bufferLength) * Math.PI * 2);
            // 极微弱檐下空灵微音 (980Hz 微和弦)
            const chime = 0.035 * Math.sin((i / sampleRate) * 2 * Math.PI * 987.77) * Math.exp(-((i % (sampleRate * 2)) / (sampleRate * 0.4)));
            raw[i] = (b1 * 0.52 + chime) * sakuraBreeze;
          }
        } else if (sceneType === 'starship_bridge' || sceneType === 'starship_launch') {
          // 星港巨舰：海湾远距离火箭猛禽低频轰鸣 (42Hz 超重低音次声波共振) + 远处海湾潮汐微风
          let b0 = 0, b1 = 0;
          for (let i = 0; i < totalGen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.9972 * b0 + white * 0.022;
            b1 = 0.9910 * b1 + b0 * 0.16;
            // 42Hz 与 84Hz 猛禽火箭推进剂燃烧震撼次重低音
            const rocketRumble = 0.16 * Math.sin((i / sampleRate) * 2 * Math.PI * 42.0) +
                                 0.08 * Math.sin((i / sampleRate) * 2 * Math.PI * 84.0);
            // 墨西哥湾慢潮汐海风流动
            const gulfSurf = 0.78 + 0.22 * Math.sin((i / bufferLength) * Math.PI * 2);
            raw[i] = (b1 * 0.44 + rocketRumble) * gulfSurf;
          }
        } else if (sceneType === 'midnight_balcony' || sceneType === 'midnight_rooftop' || sceneType === 'ocean' || sceneType === 'zen_bamboo') {
          // 楼顶晚风 / 蔚蓝深海 / 禅院竹海：6秒一呼一吸的慢周期远方潮汐、晚风与竹浪清风
          let b0 = 0, b1 = 0;
          for (let i = 0; i < totalGen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.9965 * b0 + white * 0.022;
            b1 = 0.990 * b1 + b0 * 0.15;
            const tideLFO = 0.62 + 0.38 * Math.sin((i / bufferLength) * Math.PI * 2);
            raw[i] = b1 * 0.55 * tideLFO;
          }
        } else if (sceneType === 'night_fishing' || sceneType === 'snowy_lamp') {
          // 江湖夜钓 / 雪夜孤灯：夜钓湖面极微弱水声波澜 + 凛冬落雪空灵静谧声
          let b0 = 0, b1 = 0;
          for (let i = 0; i < totalGen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.9972 * b0 + white * 0.020;
            b1 = 0.9915 * b1 + b0 * 0.14;
            const nightBreath = 0.70 + 0.30 * Math.sin((i / bufferLength) * Math.PI * 2);
            raw[i] = b1 * 0.50 * nightBreath;
          }
        } else if (sceneType === 'underground_garage' || sceneType === 'stairwell' || sceneType === 'convenience_store') {
          // 地下车库 / 楼道 / 便利店街角：深夜空间混响与低频通风机暖音
          let b0 = 0, b1 = 0;
          for (let i = 0; i < totalGen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.9975 * b0 + white * 0.016;
            b1 = 0.9920 * b1 + b0 * 0.13;
            const roomDrone = 0.84 + 0.16 * Math.sin((i / bufferLength) * Math.PI * 2 * 0.5);
            raw[i] = b1 * 0.48 * roomDrone;
          }
        } else if (sceneType === 'solar_system' || sceneType === 'deep_cosmos' || sceneType === 'lunar_planet' || sceneType === 'starlink_orbit') {
          // 浩瀚太阳系 / 深空宇宙 / 荒原星球 / 星链天网：深空引力波空灵双耳谐波冥想音 + 星链近地轨道微弱脉冲
          let b0 = 0, b1 = 0;
          for (let i = 0; i < totalGen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.9968 * b0 + white * 0.019;
            b1 = 0.9905 * b1 + b0 * 0.15;
            const cosmosSine = sceneType === 'starlink_orbit'
              ? (0.10 * Math.sin((i / sampleRate) * 2 * Math.PI * 114) + 0.02 * Math.sin((i / sampleRate) * 2 * Math.PI * 880) * (Math.sin((i / sampleRate) * Math.PI * 2 * 0.5) > 0.88 ? 1 : 0))
              : (0.12 * Math.sin((i / sampleRate) * 2 * Math.PI * 108));
            const deepWave = 0.75 + 0.25 * Math.sin((i / bufferLength) * Math.PI * 2);
            raw[i] = (b1 * 0.42 + cosmosSine) * deepWave;
          }
        } else {
          // 极简黑曜：侘寂纯黑微阈丝绒声床
          let b0 = 0, b1 = 0;
          for (let i = 0; i < totalGen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.997 * b0 + white * 0.018;
            b1 = 0.991 * b1 + b0 * 0.14;
            const zenBreath = 0.82 + 0.18 * Math.sin((i / bufferLength) * Math.PI * 2);
            raw[i] = b1 * 0.50 * zenBreath;
          }
        }

        // 首尾 0.5s 余弦平滑交叉融接 (Seamless Crossfade Loop)，保证循环点 100% 连续无咔哒声
        buffer = ctx.createBuffer(1, bufferLength, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferLength; i++) {
          if (i < fadeSamples) {
            const alpha = 0.5 * (1 - Math.cos((i / fadeSamples) * Math.PI));
            data[i] = raw[i] * alpha + raw[bufferLength + i] * (1 - alpha);
          } else {
            data[i] = raw[i];
          }
        }
        this._ambientBuffers[sceneType] = buffer;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      // 高通滤除 85Hz 以下手机扬声器浑浊低频共振，低通保留丝绒暖感
      const hpFilter = ctx.createBiquadFilter();
      hpFilter.type = 'highpass';
      hpFilter.frequency.setValueAtTime(85, t);

      const lpFilter = ctx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.setValueAtTime(cutoffFreq, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(targetGain, t + 2.0);

      source.connect(hpFilter);
      hpFilter.connect(lpFilter);
      lpFilter.connect(gain);
      this.connectToMaster(gain);
      source.start(t);

      this.ambientSource = source;
      this.ambientGain = gain;
      this.ambientBaseGain = targetGain;
      this.ambientType = sceneType;
    } catch {}
  }

  stopAmbientSound(immediate = false) {
    if (this.ambientStopTimer) {
      clearTimeout(this.ambientStopTimer);
      this.ambientStopTimer = null;
    }
    const oldSource = this.ambientSource;
    const oldGain = this.ambientGain;
    this.ambientSource = null;
    this.ambientGain = null;
    this.ambientBaseGain = 0;
    this.ambientType = null;

    if (!oldSource) return;

    if (immediate) {
      try {
        oldSource.stop();
        oldSource.disconnect();
      } catch {}
      if (oldGain) {
        try { oldGain.disconnect(); } catch {}
      }
    } else {
      if (oldGain && this.ctx) {
        try {
          const t = this.ctx.currentTime;
          oldGain.gain.setValueAtTime(oldGain.gain.value, t);
          oldGain.gain.linearRampToValueAtTime(0.0001, t + 0.45);
        } catch {}
      }
      this.ambientStopTimer = setTimeout(() => {
        try {
          oldSource.stop();
          oldSource.disconnect();
        } catch {}
        if (oldGain) {
          try { oldGain.disconnect(); } catch {}
        }
        this.ambientStopTimer = null;
      }, 480);
    }
  }

  setAmbientEnabled(enabled, currentScene) {
    this.ambientEnabled = enabled;
    if (enabled && currentScene) {
      this.startAmbientSound(currentScene);
    } else {
      this.stopAmbientSound(true);
    }
  }

  isAmbientEnabled() {
    return this.ambientEnabled !== false;
  }
}

export const audioManager = new AudioManager();

