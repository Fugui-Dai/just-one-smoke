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

  // 8. 捏爆珠清脆破壳与多汁微爆喷音 (Tactile Snap & Juicy Liquid Pop)
  playPopBeadSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 1. 外层明胶脆壳破裂脆响 (Gelatin Snap Click - 0~22ms 高频脆裂断奏)
      const oscSnap = ctx.createOscillator();
      oscSnap.type = 'triangle';
      oscSnap.frequency.setValueAtTime(3200, t);
      oscSnap.frequency.exponentialRampToValueAtTime(1050, t + 0.022);

      const gainSnap = ctx.createGain();
      gainSnap.gain.setValueAtTime(0.65, t);
      gainSnap.gain.exponentialRampToValueAtTime(0.001, t + 0.022);

      oscSnap.connect(gainSnap);
      this.connectToMaster(gainSnap);
      oscSnap.start(t);
      oscSnap.stop(t + 0.022);

      // 2. 内部精油微正压喷涌与空腔爆鸣 (Juicy Liquid Pop / Squish Discharge - 6~55ms 丰盈共鸣)
      const oscJuice = ctx.createOscillator();
      oscJuice.type = 'sine';
      oscJuice.frequency.setValueAtTime(920, t + 0.006);
      oscJuice.frequency.exponentialRampToValueAtTime(240, t + 0.055);

      const gainJuice = ctx.createGain();
      gainJuice.gain.setValueAtTime(0.48, t + 0.006);
      gainJuice.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

      oscJuice.connect(gainJuice);
      this.connectToMaster(gainJuice);
      oscJuice.start(t + 0.006);
      oscJuice.stop(t + 0.055);

      // 3. 海绵微孔纤维吸纳湿润微回响 (Capillary Absorption Wet Tail - 20~85ms 湿润尾韵)
      const oscAbsorb = ctx.createOscillator();
      oscAbsorb.type = 'sine';
      oscAbsorb.frequency.setValueAtTime(460, t + 0.02);
      oscAbsorb.frequency.exponentialRampToValueAtTime(160, t + 0.085);

      const gainAbsorb = ctx.createGain();
      gainAbsorb.gain.setValueAtTime(0.22, t + 0.02);
      gainAbsorb.gain.exponentialRampToValueAtTime(0.001, t + 0.085);

      oscAbsorb.connect(gainAbsorb);
      this.connectToMaster(gainAbsorb);
      oscAbsorb.start(t + 0.02);
      oscAbsorb.stop(t + 0.085);
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

  // 12. 抽出一支烟的纸质摩擦声 (Pull Out Cigarette Slide Sound)
  playPullCigaretteSound() {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 紧密纸张抽出滑音
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(980, t + 0.12);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      this.connectToMaster(gain);
      osc.start(t);
      osc.stop(t + 0.14);

      // 纸身微摩擦白噪
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, t);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.18, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      noise.connect(filter);
      filter.connect(nGain);
      this.connectToMaster(nGain);
      noise.start(t);
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
  // 14. 沉浸生活场景环境白噪音 (Ambient Life Sound Engine)
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

      // 生成长白噪音缓冲 (3秒平滑循环)
      const bufferLength = Math.floor(sampleRate * 3.0);
      const buffer = ctx.createBuffer(1, bufferLength, sampleRate);
      const data = buffer.getChannelData(0);

      if (sceneType === 'rainy_car') {
        // 雨夜车窗：柔和粉红/低通沙沙细雨声
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferLength; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2) * 0.22;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.38, t);

        source.connect(filter);
        filter.connect(gain);
        this.connectToMaster(gain);
        source.start(t);

        this.ambientSource = source;
        this.ambientGain = gain;
        this.ambientType = sceneType;
      } else if (sceneType === 'campfire') {
        // 森林篝火：低频温暖余音 + 柴火轻微摩擦
        for (let i = 0; i < bufferLength; i++) {
          data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.985 ? 0.9 : 0.12);
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(750, t);
        filter.Q.value = 1.2;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.35, t);

        source.connect(filter);
        filter.connect(gain);
        this.connectToMaster(gain);
        source.start(t);

        this.ambientSource = source;
        this.ambientGain = gain;
        this.ambientType = sceneType;
      } else if (sceneType === 'midnight_balcony' || sceneType === 'midnight_rooftop') {
        // 深夜阳台与楼顶天台：极低频夜风微风吹拂空气感
        let lastOut = 0.0;
        for (let i = 0; i < bufferLength; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 1.6;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(480, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.32, t);

        source.connect(filter);
        filter.connect(gain);
        this.connectToMaster(gain);
        source.start(t);

        this.ambientSource = source;
        this.ambientGain = gain;
        this.ambientType = sceneType;
      } else if (sceneType === 'solar_system' || sceneType === 'deep_cosmos' || sceneType === 'lunar_planet') {
        // 宇宙与星球奇观：深空引力波空灵冥想低频共振
        for (let i = 0; i < bufferLength; i++) {
          const s = Math.sin((i / sampleRate) * Math.PI * 2 * 68) * 0.4 +
                    Math.sin((i / sampleRate) * Math.PI * 2 * 136) * 0.2;
          const noise = (Math.random() * 2 - 1) * 0.06;
          data[i] = s + noise;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.30, t);

        source.connect(filter);
        filter.connect(gain);
        this.connectToMaster(gain);
        source.start(t);

        this.ambientSource = source;
        this.ambientGain = gain;
        this.ambientType = sceneType;
      } else if (sceneType === 'convenience_store' || sceneType === 'stairwell' || sceneType === 'underground_garage') {
        // 真实生活高频场景：静谧室内通风/街角微暖低噪
        let b0 = 0;
        for (let i = 0; i < bufferLength; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.992 * b0 + white * 0.08;
          data[i] = b0 * 0.26;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(360, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.30, t);

        source.connect(filter);
        filter.connect(gain);
        this.connectToMaster(gain);
        source.start(t);

        this.ambientSource = source;
        this.ambientGain = gain;
        this.ambientType = sceneType;
      } else if (sceneType === 'ocean') {
        // 蔚蓝海洋：舒缓潮汐浪涌与轻柔海风白噪音
        let b0 = 0, b1 = 0;
        for (let i = 0; i < bufferLength; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.993 * b0 + white * 0.055;
          b1 = 0.985 * b1 + white * 0.040;
          // 潮汐波浪慢周期起伏调制
          const waveLFO = 0.5 + 0.5 * Math.sin((i / ctx.sampleRate) * Math.PI * 0.45);
          data[i] = (b0 * 0.65 + b1 * 0.35) * (0.35 + 0.65 * waveLFO);
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.32, t + 0.8);

        source.connect(filter);
        filter.connect(gain);
        this.connectToMaster(gain);
        source.start(t);

        this.ambientSource = source;
        this.ambientGain = gain;
        this.ambientType = sceneType;
      } else if (sceneType === 'golden_amber') {
        // 赛博暖金：柔和温润琥珀共鸣白噪音
        let b0 = 0;
        for (let i = 0; i < bufferLength; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.990 * b0 + white * 0.06;
          data[i] = b0 * 0.40 + Math.sin((i / ctx.sampleRate) * Math.PI * 2 * 216) * 0.025;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.32, t + 0.8);

        source.connect(filter);
        filter.connect(gain);
        this.connectToMaster(gain);
        source.start(t);

        this.ambientSource = source;
        this.ambientGain = gain;
        this.ambientType = sceneType;
      } else {
        // 极简黑曜 (默认) 或通用场景：432Hz 侘寂静心微柔禅境白噪音 (柔和低频空气感)
        let b0 = 0;
        for (let i = 0; i < bufferLength; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.994 * b0 + white * 0.05;
          data[i] = b0 * 0.38 + Math.sin((i / ctx.sampleRate) * Math.PI * 2 * 432) * 0.02;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(360, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.32, t + 0.8);

        source.connect(filter);
        filter.connect(gain);
        this.connectToMaster(gain);
        source.start(t);

        this.ambientSource = source;
        this.ambientGain = gain;
        this.ambientType = sceneType;
      }
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
          oldGain.gain.linearRampToValueAtTime(0.001, t + 0.3);
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
      }, 350);
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

