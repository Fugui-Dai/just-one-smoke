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
    this.initWeChatAudioOption();
  }

  initWeChatAudioOption() {
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

  // 播放本地高品质真实音效文件 (微信原生 InnerAudioContext 硬件加速播放)
  playLocalAudio(filePath, fallbackFn) {
    if (this.muted) return;
    this.initWeChatAudioOption();
    try {
      if (typeof wx !== 'undefined' && wx.createInnerAudioContext) {
        const audio = wx.createInnerAudioContext();
        audio.src = filePath;
        audio.volume = this.volume;
        audio.onError((err) => {
          console.warn('InnerAudioContext failed:', filePath, err);
          if (fallbackFn) fallbackFn.call(this);
          try { audio.destroy(); } catch (e) {}
        });
        audio.onEnded(() => {
          try { audio.destroy(); } catch (e) {}
        });
        audio.onStop(() => {
          try { audio.destroy(); } catch (e) {}
        });
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
    this.playLocalAudio('/audio/lighter.wav', () => {
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
    this.playLocalAudio('/audio/match.wav', () => {
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
    this.playLocalAudio('/audio/zippo.wav', () => {
      this.playZippoOpenSound();
      setTimeout(() => {
        this.playLighterSynth();
      }, 60);
    });
  }

  // 1.5 雪茄专配三喷高温防风蓝焰喷枪 (压电电击哒声 + 强劲暴风呼啸高压蓝锥气流)
  playTorchSound() {
    if (this.muted) return;
    this.playLocalAudio('/audio/torch.wav', () => {
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

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

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
          const popBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.008), ctx.sampleRate);
          const popData = popBuf.getChannelData(0);
          for (let i = 0; i < popData.length; i++) {
            popData[i] = (Math.random() * 2 - 1) * Math.sin((i / popData.length) * Math.PI);
          }
          const popSrc = ctx.createBufferSource();
          popSrc.buffer = popBuf;

          const popFilter = ctx.createBiquadFilter();
          popFilter.type = 'bandpass';
          popFilter.frequency.setValueAtTime(2400 + Math.random() * 3200, now);
          popFilter.Q.setValueAtTime(4.0, now);

          const popGain = ctx.createGain();
          const popVol = 0.22 + Math.random() * 0.28;
          popGain.gain.setValueAtTime(popVol, now);
          popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.008);

          popSrc.connect(popFilter);
          popFilter.connect(popGain);
          this.connectToMaster(popGain);
          popSrc.start(now);
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
          setTimeout(() => {
            try {
              src.stop();
              src.disconnect();
            } catch {}
          }, 60);
          this.burnSource = null;
          this.burnGain = null;
          this.burnFilter = null;
        } else {
          this.burnSource.stop();
          this.burnSource.disconnect();
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

      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(360, t);
      filter.frequency.exponentialRampToValueAtTime(140, t + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.38, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      src.connect(filter);
      filter.connect(gain);
      this.connectToMaster(gain);
      src.start(t);
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

  // 8. 捏爆珠真实物理破壳声 (5阶物理声学建模：滤嘴捏压摩擦 -> 明胶脆壳咔啪双裂瞬态 -> 内部高压香精爆浆 -> 残壳微碎 -> 海绵毛细吸纳微滋声)
  playPopBeadSound() {
    if (this.muted) return;
    this.playLocalAudio('/audio/bead_pop.wav', () => {
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

      // 生成 6.0 秒超长平滑声床缓冲 + 0.5 秒首尾无缝余弦交叉融接
      const loopDur = 6.0;
      const fadeSamples = Math.floor(sampleRate * 0.5);
      const bufferLength = Math.floor(sampleRate * loopDur);
      const totalGen = bufferLength + fadeSamples;
      const raw = new Float32Array(totalGen);

      let cutoffFreq = 280;
      let targetGain = 0.048;

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
        cutoffFreq = 380;
        targetGain = 0.060;
      } else if (sceneType === 'campfire') {
        // 森林篝火：温暖壁炉低频暖流 + 极偶发温润松木微暖共鸣（彻底剔除高频刺耳电流爆音）
        let b0 = 0, b1 = 0;
        for (let i = 0; i < totalGen; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.996 * b0 + white * 0.026;
          b1 = 0.988 * b1 + b0 * 0.16;
          const breath = 0.80 + 0.20 * Math.sin((i / bufferLength) * Math.PI * 2);
          raw[i] = b1 * 0.52 * breath;
        }
        cutoffFreq = 310;
        targetGain = 0.054;
      } else if (sceneType === 'midnight_balcony' || sceneType === 'midnight_rooftop' || sceneType === 'ocean') {
        // 楼顶晚风 / 蔚蓝深海：6秒一呼一吸的慢周期远方海浪潮汐与松林晚风
        let b0 = 0, b1 = 0;
        for (let i = 0; i < totalGen; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.9965 * b0 + white * 0.022;
          b1 = 0.990 * b1 + b0 * 0.15;
          const tideLFO = 0.62 + 0.38 * Math.sin((i / bufferLength) * Math.PI * 2);
          raw[i] = b1 * 0.55 * tideLFO;
        }
        cutoffFreq = 290;
        targetGain = 0.056;
      } else {
        // 极简黑曜 / 宇宙深空 / 街角便利店 / 车库 / 楼道：深宵书房级微阈丝绒空气声床（无任何正弦单音蜂鸣）
        let b0 = 0, b1 = 0;
        for (let i = 0; i < totalGen; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.997 * b0 + white * 0.018;
          b1 = 0.991 * b1 + b0 * 0.14;
          const zenBreath = 0.82 + 0.18 * Math.sin((i / bufferLength) * Math.PI * 2);
          raw[i] = b1 * 0.50 * zenBreath;
        }
        cutoffFreq = 250;
        targetGain = 0.044;
      }

      // 首尾 0.5s 余弦平滑交叉融接 (Seamless Crossfade Loop)，保证循环点 100% 连续无咔哒声
      const buffer = ctx.createBuffer(1, bufferLength, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferLength; i++) {
        if (i < fadeSamples) {
          const alpha = 0.5 * (1 - Math.cos((i / fadeSamples) * Math.PI));
          data[i] = raw[i] * alpha + raw[bufferLength + i] * (1 - alpha);
        } else {
          data[i] = raw[i];
        }
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

