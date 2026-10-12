// pages/index/index.js
import { SmokeStateMachine } from '../../utils/smokeStateMachine.js';
import { ParticleSystem } from '../../utils/particleSystem.js';
import { audioManager } from '../../utils/audioManager.js';
import { triggerHaptic } from '../../utils/haptics.js';
import { storageService } from '../../utils/storageService.js';
import { leaderboardService } from '../../utils/leaderboardService.js';
import { canvasRenderer } from '../../utils/canvasRenderer.js';
import { toast } from '../../utils/toastService.js';
import { ATMOSPHERE_SCENES, getSceneById } from '../../utils/sceneRenderer.js';
import {
  calculateSavings,
  calculateTarAvoided,
  calculateLifeRegained,
  calculateQuitDays,
  getWhoStages
} from '../../utils/healthCalculator.js';
import {
  CIGARETTE_CATALOG,
  DEFAULT_CIGARETTE,
  getCigaretteById,
  isCigaretteUnlocked
} from '../../utils/catalog.js';
import { ACHIEVEMENTS, checkAchievementsToUnlock, getAchievementById } from '../../utils/achievements.js';
import {
  IGNITION_TOOLS,
  getActiveIgnitionTool,
  getIgnitionToolById
} from '../../utils/ignitionService.js';
import {
  SMOKE_EFFECTS,
  DEFAULT_SMOKE_EFFECT,
  getSmokeEffectById,
  isSmokeEffectUnlocked
} from '../../utils/smokeEffects.js';
import { EXTINGUISH_ICON_SVG, STORE_ICON_SVG } from '../../utils/vectorIcons.js';

Page({
  data: {
    extinguishIconUri: EXTINGUISH_ICON_SVG,
    storeIconUri: STORE_ICON_SVG,
    // 导航与屏幕尺寸适配
    statusBarHeight: 44,
    navBarHeight: 44,
    capsuleRightSpace: 100,
    capsuleTop: 50,
    windowWidth: 375,
    windowHeight: 812,

    currentTab: 'simulator', // simulator | leaderboard | stats
    currentCigarette: DEFAULT_CIGARETTE,
    simulatorState: 'UNLIT', // UNLIT | IDLE_BURNING | INHALING | EXHALING | FINISHED
    smokeRingMode: false,
    breathingMode: false,
    breathingPhase: 'none', // none | inhale | hold | exhale
    inhaleElapsedDisplay: '0.0',
    isMuted: false,
    ashLength: 0,
    ashProgress: 0,
    ashPercent: 0,
    isExhalingPrompt: false,
    isSparking: false,
    showDockMenu: false, // 右侧Dock菜单展开状态

    // 沉浸生活场景氛围 (默认微距纯黑摄影极简黑曜)
    currentScene: 'obsidian',
    currentSceneInfo: getSceneById('obsidian'),
    atmosphereScenes: ATMOSPHERE_SCENES,
    isAmbientEnabled: true,
    showSceneModal: false,

    // 创新互动与状态参数
    currentPackRemaining: 20, // 烟盒余量
    smokeEffectType: 'auspicious_river',
    smokeEffectsList: SMOKE_EFFECTS,
    currentSmokeEffect: DEFAULT_SMOKE_EFFECT,
    showSmokeEffectDrawer: false, // 烟雾特工坊 · 尊享展厅
    showSmokeEffectGuide: false, // 💡 首次进入呼吸气泡长按引导
    isGuideFading: false,
    isTrialActive: false, // 30秒尊享免费试抽
    trialSecondsLeft: 0,
    showSkillModal: false, // ⊙ 特殊技能面板
    showTipModal: false, // (?) 赛博替烟原理弹窗
    isBeadPopped: false, // 爆珠是否已捏碎
    sosActive: false, // 3分钟烟瘾急救模式
    sosSeconds: 180,
    sosTimerDisplay: '03:00',

    // 点火器具工坊 (火柴 / Zippo / 雪茄蓝焰 / 车载电热丝 / 经典打火机)
    ignitionTools: IGNITION_TOOLS,
    currentIgnitionTool: IGNITION_TOOLS[0],
    isCarLighterHeating: false,
    isZippoOpen: false,

    // 英雄排行榜数据
    leaderboardCategory: 'substituted', // substituted | saved | days
    leaderboardList: [],
    myRankInfo: {
      rank: 1,
      title: '无烟觉醒者',
      beatPercent: 50.0,
      substituted: 0,
      savedMoney: 0,
      days: 1
    },

    // 统计看板数据
    profile: {},
    totalSubstituted: 0,
    totalPacksSaved: '0.0',
    totalSavedMoney: '0.00',
    singleStickSavedPrice: '1.25',
    totalTarAvoided: 0,
    totalLifeRegained: 0,
    lifeRegainedHours: '0.0',
    quitDays: 0,
    weeklyAvg: '0.0',
    dailyTrends: [],
    whoStages: [],

    // 图鉴与成就
    catalogList: [],
    achievementsList: [],
    unlockedAchievementsCount: 0,

    // 弹窗状态
    showRewardModal: false,
    showProfileModal: false,
    showPicker: false,
    showGiftModal: false,
    giftCigarette: null,
    giftSenderName: '老哥',

    // 结算数据
    lastReward: {
      savedMoney: '1.25',
      tarAvoided: 10,
      lifeRegained: 11,
      inhaleCount: 0,
      durationSeconds: 0
    },
    rewardPunchline: '尼古丁骂骂咧咧地退出了群聊！',

    // 个人设置编辑数据
    editProfile: {
      packPrice: 25,
      cigsPerDay: 15,
      smokeYears: 5
    }
  },

  onLoad(options) {
    // 开启微信原生分享与朋友圈转发
    if (typeof wx !== 'undefined' && wx.showShareMenu) {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }

    this.fsm = new SmokeStateMachine();
    this.particles = new ParticleSystem();
    this.isHoldingInhale = false;
    this.inhaleStartTime = 0;
    this.sessionStartTime = 0;
    this.hapticInterval = null;
    this.exhaleTimer = null;
    this.sosTimer = null;
    this.screenFogAlpha = 0;
    this.animId = 0;
    this.lastTime = 0;
    this.lastExhaleTime = 0;
    this.exhaleEffectTimers = [];

    // 动态精确测算胶囊按钮与安全状态栏
    this.measureSafeArea();

    const savedCigId = storageService.getSelectedCigaretteId();
    let curCig = getCigaretteById(savedCigId) || DEFAULT_CIGARETTE;
    let isReceivedGift = false;
    let giftSender = '老哥';

    // 承接好友递烟礼遇链路
    if (options && options.from === 'give_smoke' && options.cigId) {
      const giftCig = getCigaretteById(options.cigId);
      if (giftCig) {
        curCig = giftCig;
        isReceivedGift = true;
        giftSender = options.senderName ? decodeURIComponent(options.senderName) : '老哥';
        storageService.setSelectedCigaretteId(giftCig.id);
        triggerHaptic('medium');
      }
    }

    const savedScene = storageService.getAtmosphereScene();
    const isAmbient = storageService.getAmbientSoundEnabled();
    audioManager.setAmbientEnabled(isAmbient, savedScene);
    audioManager.startAmbientSound(savedScene);

    const activeTool = getActiveIgnitionTool();
    const savedEffectId = storageService.getSelectedSmokeEffectId();
    const curSmokeEffect = getSmokeEffectById(savedEffectId) || DEFAULT_SMOKE_EFFECT;

    this.setData({
      currentCigarette: curCig,
      showGiftModal: isReceivedGift,
      giftCigarette: isReceivedGift ? curCig : null,
      giftSenderName: giftSender,
      isMuted: audioManager.isMuted(),
      isBeadPopped: false,
      currentScene: savedScene,
      currentSceneInfo: getSceneById(savedScene),
      isAmbientEnabled: isAmbient,
      currentIgnitionTool: activeTool,
      currentSmokeEffect: curSmokeEffect,
      smokeEffectType: curSmokeEffect.id
    });

    this._skipFirstShowRefresh = true;
    try {
      storageService.recordDailyCheckIn();
    } catch (e) {}
    this.refreshAllData();
  },

  onShow() {
    try {
      storageService.recordDailyCheckIn();
    } catch (e) {}
    // 页面唤醒时同步最新装配的名烟与音效状态
    const savedCigId = storageService.getSelectedCigaretteId();
    const curCig = getCigaretteById(savedCigId) || DEFAULT_CIGARETTE;

    const isDifferentCig = this.data.currentCigarette && this.data.currentCigarette.id !== curCig.id;
    let needsRestart = false;
    try {
      needsRestart = !!wx.getStorageSync('SMOKEFREE_NEEDS_RESTART');
      if (needsRestart) wx.removeStorageSync('SMOKEFREE_NEEDS_RESTART');
    } catch (e) {}

    if (isDifferentCig || needsRestart) {
      const packRemaining = storageService.getPackCount(curCig.id, curCig.packCapacity || (curCig.isCigar ? 5 : 20));
      this.setData({
        currentCigarette: curCig,
        currentPackRemaining: packRemaining,
        isBeadPopped: false
      });
      // 换烟或抽出新烟：旧烟舍弃，重置为全新未点燃的烟
      if (this.fsm) {
        this.restartCigarette();
      }
    } else {
      // 腾讯总监设计级：时空流转与环境空气净空 (Atmospheric Air Cleansed & Living Ember)
      // 用户离开页面去商店（离开超过 400ms）后返回：
      // 1. 空中漂浮的旧呼出浓烟团、烟圈等自然扩散消解于空气中，视野重归通透高奢；
      // 2. 香烟进度、状态（LIT）、烟灰 100% 保持，燃烧端下一帧即刻升起崭新轻柔青烟！
      const elapsedSinceHide = this.hideTimestamp > 0 ? (Date.now() - this.hideTimestamp) : 0;
      this.hideTimestamp = 0;
      if (elapsedSinceHide >= 400 && this.particles) {
        const isLit = this.fsm ? (this.fsm.getState() === 'LIT') : false;
        this.particles.cleanseAir(isLit);
        this.screenFogAlpha = 0;
      }
    }

    if (this._skipFirstShowRefresh) {
      this._skipFirstShowRefresh = false;
    } else {
      this.setData({
        isMuted: audioManager.isMuted()
      });
      audioManager.startAmbientSound(this.data.currentScene);
      this.refreshAllData();
    }

    if (this.canvas && !this.isLoopRunning) {
      this.startRenderLoop();
    }
    this.checkSmokeGuide();
  },

  measureSafeArea() {
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

      this.setData({
        statusBarHeight,
        navBarHeight,
        capsuleRightSpace,
        capsuleTop,
        windowWidth: sysInfo.windowWidth,
        windowHeight: sysInfo.windowHeight
      });
    } catch (e) {
      console.warn('measureSafeArea error', e);
    }
  },

  onReady() {
    this.initCanvas();
  },

  onHide() {
    this.stopRenderLoop();
    this.hideTimestamp = Date.now();

    // 释放吸烟与呼气动作，杜绝切屏返回后吸烟状态卡死
    if (this.isHoldingInhale || (this.fsm && this.fsm.getState() === 'INHALING')) {
      this.isHoldingInhale = false;
      if (this.fsm && this.fsm.getState() === 'INHALING') {
        this.fsm.stopInhale();
        this.setData({ simulatorState: this.fsm.getState() });
      }
    }

    if (this.autoInhaleTimer) {
      clearTimeout(this.autoInhaleTimer);
      this.autoInhaleTimer = null;
    }
    if (this.hapticInterval) {
      clearInterval(this.hapticInterval);
      this.hapticInterval = null;
    }
    if (this.exhaleTimer) {
      clearTimeout(this.exhaleTimer);
      this.exhaleTimer = null;
    }
    if (this.exhaleEffectTimers && this.exhaleEffectTimers.length) {
      this.exhaleEffectTimers.forEach(t => clearTimeout(t));
      this.exhaleEffectTimers = [];
    }

    if (this.smokeGuideTimer) {
      clearTimeout(this.smokeGuideTimer);
      this.smokeGuideTimer = null;
    }

    this.screenFogAlpha = 0;
    this.setData({
      isExhalingPrompt: false,
      breathingPhase: 'none'
    });

    audioManager.stopBurnSound();
    audioManager.stopInhaleSound();
    audioManager.stopExhaleSound();
  },

  onUnload() {
    this.destroyEngine();
  },

  destroyEngine() {
    this.stopRenderLoop();
    if (this.smokeGuideTimer) {
      clearTimeout(this.smokeGuideTimer);
      this.smokeGuideTimer = null;
    }
    if (this.autoInhaleTimer) {
      clearTimeout(this.autoInhaleTimer);
      this.autoInhaleTimer = null;
    }
    if (this.hapticInterval) {
      clearInterval(this.hapticInterval);
      this.hapticInterval = null;
    }
    if (this.exhaleTimer) {
      clearTimeout(this.exhaleTimer);
      this.exhaleTimer = null;
    }
    if (this.sosTimer) {
      clearInterval(this.sosTimer);
      this.sosTimer = null;
    }
    audioManager.stopBurnSound();
    audioManager.stopAmbientSound();
  },

  initCanvas() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#smokeCanvas')
      .fields({ node: true, size: true, rect: true })
      .exec((res) => {
        console.log('[Canvas初始化] 查询结果:', res);

        if (!res || !res[0] || !res[0].node) {
          console.error('[Canvas初始化] 失败: 未找到Canvas节点');
          toast.warn('Canvas初始化异常');
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const sysInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
        const dpr = sysInfo.pixelRatio || 2;

        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;

        this.canvas = canvas;
        this.ctx = ctx;
        this.dpr = dpr;
        this.cWidth = res[0].width;
        this.cHeight = res[0].height;
        this.canvasLeft = res[0].left || 0;
        this.canvasTop = res[0].top || 0;

        console.log('[Canvas初始化] 成功:', {
          width: canvas.width,
          height: canvas.height,
          dpr: dpr,
          logicWidth: this.cWidth,
          logicHeight: this.cHeight
        });

        this.startRenderLoop();
      });
  },

  startRenderLoop() {
    if (!this.canvas || this.isLoopRunning) return;
    this.isLoopRunning = true;
    this.lastTime = 0;
    const render = (time) => {
      if (!this.isLoopRunning) return;
      try {
        this.renderFrame(time);
      } catch (err) {
        console.error('[Render Loop Error]', err);
      }
      if (this.canvas && this.isLoopRunning) {
        this.animId = this.canvas.requestAnimationFrame(render);
      }
    };
    this.animId = this.canvas.requestAnimationFrame(render);
  },

  stopRenderLoop() {
    this.isLoopRunning = false;
    if (this.canvas && this.animId) {
      try {
        this.canvas.cancelAnimationFrame(this.animId);
      } catch (e) {}
      this.animId = 0;
    }
  },

  renderFrame(time) {
    if (!this.ctx || !this.canvas || !this.fsm || !this.particles) return;
    const now = (typeof time === 'number' && !isNaN(time) && time > 0) ? time : Date.now();
    if (!this.lastTime) this.lastTime = now;
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (isNaN(dt) || dt <= 0 || dt > 0.1) {
      dt = 0.016;
    }

    const ctx = this.ctx;
    const dpr = this.dpr || 2;
    const w = this.cWidth;
    const h = this.cHeight;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const isInhaling = this.fsm.getState() === 'INHALING';

    // 4-7-8 呼吸减压计时逻辑
    if (isInhaling) {
      const elapsed = Math.max(0, (Date.now() - this.inhaleStartTime) / 1000);
      if (this.data.breathingMode) {
        if (elapsed < 4.0) {
          if (this.data.breathingPhase !== 'inhale') {
            this.setData({ breathingPhase: 'inhale' });
          }
        } else {
          if (this.data.breathingPhase !== 'hold') {
            audioManager.playZenChimeSound(528);
            this.setData({ breathingPhase: 'hold' });
          }
        }
        this.setData({ inhaleElapsedDisplay: elapsed.toFixed(1) });
      }
    }

    const isCigar = !!(this.data.currentCigarette && (this.data.currentCigarette.isCigar || this.data.currentCigarette.widthType === 'cigar'));
    const burnRes = this.fsm.burn(dt, isInhaling, isCigar);
    const curAsh = this.fsm.getAshLength();
    const curState = this.fsm.getState();

    // 现实物理规律：静置或吸烟时烟灰积满自重断落
    if (burnRes && burnRes.ashDropped) {
      const { cx, cy } = this.getTipCoordinates();
      this.particles.emitAshDrop(cx, cy);
      triggerHaptic('light');
    }

    // 燃尽结算触发
    if (curState === 'FINISHED' && this.data.simulatorState !== 'FINISHED') {
      if (this.isHoldingInhale) {
        this.isHoldingInhale = false;
        if (this.hapticInterval) clearInterval(this.hapticInterval);
        audioManager.stopBurnSound();
      }
      this.handleSmokingFinished();
    }

    // 调用高保真 3D Canvas 渲染引擎
    canvasRenderer.render(ctx, {
      w,
      h,
      dt,
      fsm: this.fsm,
      particles: this.particles,
      currentCigarette: this.data.currentCigarette,
      isBeadPopped: this.data.isBeadPopped,
      breathingMode: this.data.breathingMode,
      breathingPhase: this.data.breathingPhase,
      screenFogAlpha: this.screenFogAlpha,
      sceneType: this.data.currentScene,
      isSparking: this.data.isSparking,
      ignitionTool: this.data.currentIgnitionTool
    });

    // 呼气微雾衰减
    if (this.screenFogAlpha > 0.002) {
      this.screenFogAlpha = Math.max(0, this.screenFogAlpha - dt * 0.25);
    }

    ctx.restore();

    const curAshRatio = this.fsm.getAshRatio ? this.fsm.getAshRatio() : 0;
    const ashProgress = Number(curAshRatio.toFixed(3));
    const ashPercent = Math.round(curAshRatio * 100);
    const curAshInt = Math.floor(curAsh);

    if (ashPercent !== this.data.ashPercent || curAshInt !== this.data.ashLength || curState !== this.data.simulatorState) {
      this.setData({
        ashLength: curAshInt,
        ashProgress: ashProgress,
        ashPercent: ashPercent,
        simulatorState: curState
      });
    }
  },

  // 获取修长烟支当前燃烧端顶点坐标
  getTipCoordinates() {
    if (!this.cWidth || !this.cHeight) return { cx: 180, cy: 300 };
    const cx = this.cWidth / 2;
    const cy = this.cHeight * 0.65;
    const curCig = this.data.currentCigarette || {};
    let maxCigH = Math.min(360, this.cHeight * 0.54);
    let filterRatio = 0.23;

    if (curCig.isCigar || curCig.widthType === 'cigar') {
      maxCigH = Math.min(340, this.cHeight * 0.50);
      filterRatio = 0.28;
    } else if (curCig.widthType === 'slender') {
      maxCigH = Math.min(375, this.cHeight * 0.56);
      filterRatio = 0.25;
    }

    const filterH = Math.round(maxCigH * filterRatio);
    const maxPaperH = maxCigH - filterH;
    const p = this.fsm ? this.fsm.getProgress() : 1.0;
    const progress = (typeof p === 'number' && !isNaN(p)) ? p : 1.0;
    const paperH = maxPaperH * progress;
    const fireY = cy - paperH;
    return { cx, cy: fireY };
  },

  // 获取用户嘴部 / 过滤嘴底部呼气吐烟锚点坐标 (真实口部吐雾源头)
  getMouthCoordinates() {
    if (!this.cWidth || !this.cHeight) return { mx: 180, my: 480 };
    const mx = this.cWidth / 2;
    const cy = this.cHeight * 0.65;
    const curCig = this.data.currentCigarette || {};
    let maxCigH = Math.min(360, this.cHeight * 0.54);
    let filterRatio = 0.23;

    if (curCig.isCigar || curCig.widthType === 'cigar') {
      maxCigH = Math.min(340, this.cHeight * 0.50);
      filterRatio = 0.28;
    } else if (curCig.widthType === 'slender') {
      maxCigH = Math.min(375, this.cHeight * 0.56);
      filterRatio = 0.25;
    }

    const filterH = Math.round(maxCigH * filterRatio);
    // 嘴部位于过滤嘴下沿稍偏下方 (烟嘴入嘴处)
    const my = cy + filterH + 12;
    return { mx, my };
  },

  // 配合烟雾特效执行真实拟真吐烟流程 (具备连击防卡顿节流与上一波延时清理)
  performRealisticExhale() {
    if (!this.particles) return;

    // 1. 疯点限流保护：350ms 内连续点击合并节流，杜绝海量并发定时器导致界面卡死
    const now = Date.now();
    if (this.lastExhaleTime && (now - this.lastExhaleTime < 350)) {
      return;
    }
    this.lastExhaleTime = now;

    // 2. 清理上一波残留的未发射定时器，彻底防止快速点击定时器堆叠
    if (this.exhaleEffectTimers && this.exhaleEffectTimers.length) {
      this.exhaleEffectTimers.forEach(t => clearTimeout(t));
    }
    this.exhaleEffectTimers = [];

    const { mx, my } = this.getMouthCoordinates();
    const currentEff = this.data.currentSmokeEffect || DEFAULT_SMOKE_EFFECT;
    const curCig = this.data.currentCigarette;
    let smokeColor = curCig.smokeColor || 'rgba(238, 246, 255, ';
    if (curCig.hasBead && this.data.isBeadPopped) {
      if (curCig.beadColor === '#f97316' || curCig.beadColor === '#f59e0b') {
        smokeColor = 'rgba(254, 215, 170, '; // 陈皮暖香金 / 五粮国酒金波
      } else if (curCig.beadColor === '#10b981') {
        smokeColor = 'rgba(167, 243, 208, '; // 龙井桂花淡翠绿
      } else if (curCig.beadColor === '#06b6d4' || curCig.beadColor === '#38bdf8') {
        smokeColor = 'rgba(165, 243, 252, '; // 极境冰蓝薄荷 / 炫赫门甜润冰晶
      } else if (curCig.beadColor === '#fbbf24') {
        smokeColor = 'rgba(254, 240, 138, '; // 芙蓉王金韵本香金
      } else if (curCig.beadColor === '#f43f5e') {
        smokeColor = 'rgba(254, 205, 211, '; // 中华国梅幽红
      } else if (curCig.beadColor === '#a855f7') {
        smokeColor = 'rgba(233, 213, 255, '; // 七星蓝莓幻紫
      }
    }

    const effectId = currentEff.id;

    // 腾讯总监设计级：独占特效调度，清除异构大实体与多余旧烟雾，杜绝多特效交叉重叠
    this.particles.ensureExclusiveEffect(effectId);

    if (effectId === 'ring_classic') {
      // 1. 经典吐烟圈：第一圈领航冲出，第二圈追逐相伴，3D 俯仰透视环形涡流向前优雅滑行扩张并柔和羽化消散
      this.particles.emitSmokeRing(mx, my - 20, smokeColor, 1.0);
      const timer = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitSmokeRing(mx, my - 24, smokeColor, 0.75, { speedMul: 0.85, offsetX: 6 });
      }, 190);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'cloud_dense') {
      // 2. 舒缓浓白云雾：多波次连贯大团云雾漫卷翻滚，轻柔升腾
      this.particles.emitDenseCloud(mx, my - 16, smokeColor);
      const timer1 = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitDenseCloud(mx, my - 20, smokeColor);
      }, 140);
      this.exhaleEffectTimers.push(timer1);
    } else if (effectId === 'silk_pure') {
      // 3. 袅袅青烟：两波纯净青蓝色丝绢轻雾，优雅舒展升腾
      this.particles.emitSilkStream(mx, my - 18, smokeColor);
      const timer = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitSilkStream(mx, my - 24, smokeColor);
      }, 180);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'purple_zen') {
      // 3. 紫气东来：暮霭紫与天青祥云，双波次左右舒展翻滚散开
      this.particles.emitPurpleZen(mx, my - 16);
      const timer = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitPurpleZen(mx, my - 18);
      }, 160);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'gold_stardust') {
      // 4. 黑金流沙：黑曜石深色烟雾基底与24K金箔大范围闪烁飞溅
      this.particles.emitGoldStardust(mx, my - 16);
      const timer = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitGoldStardust(mx, my - 18);
      }, 160);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'aurora_nebula') {
      // 5. 极光星云：冰川碧绿与星云幽粉宽幅波浪扩散
      this.particles.emitAuroraNebula(mx, my - 16);
      const timer = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitAuroraNebula(mx, my - 18);
      }, 160);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'heart_double') {
      // 6. 双爱心烟：浪漫同心双心形涡流环，平滑浮游舒展并柔美羽化（单次自然喷发，杜绝二次重写闪动）
      this.particles.emitHeartDouble(mx, my - 20);
    } else if (effectId === 'dragon_breath') {
      // 7. 金龙吐息：浓金祥云破雾而出，神龙腾云驾雾盘旋九天
      this.particles.emitDragonBreath(mx, my - 20, true);
      const timer = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitDragonBreath(mx, my - 30, false);
      }, 180);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'galaxy_stars') {
      // 8. 漫天繁星：璀璨四芒星钻流转跳跃，伴随流星划破星穹
      this.particles.emitGalaxyStars(mx, my - 16);
      const timer = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitGalaxyStars(mx, my - 20);
      }, 160);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'grand_fireworks') {
      // 9. 盛世华彩：金芒火箭破空腾飞，高空炸裂盛世锦簇烟花与垂落金雨
      this.particles.emitGrandFireworks(mx, my - 20);
      const timer = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitGrandFireworks(mx, my - 24);
      }, 180);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'auspicious_river') {
      // 10. 步步高升：金红祥瑞四字吉语星河螺旋腾空而起，双轨流光缎带与破晓金光 (纯净字河，无福印遮挡)
      this.particles.emitAuspiciousRiver(mx, my - 16, true);
      const timer = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitAuspiciousRiver(mx, my - 20, false);
      }, 170);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'blessing_runes') {
      // 10.5 福愿金墨：沉香暖金烟雾袅袅升腾，凝结升腾古雅篆金福印【福/安/顺/吉/自在】与祈愿流光
      this.particles.emitBlessingRunes(mx, my - 16);
      const timer = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitBlessingRunes(mx, my - 20);
      }, 170);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'phoenix_nirvana') {
      // 11. 凤舞九天：赤金南明离火长鸣，百鸟朝凤九天神凰振翅翱翔，周身烈焰漩涡环绕
      this.particles.emitPhoenixNirvana(mx, my - 20, true);
      const timer = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitPhoenixNirvana(mx, my - 28, false);
      }, 180);
      this.exhaleEffectTimers.push(timer);
    } else {
      // 默认兜底：拟真浓白烟雾三波次大范围翻滚漫散
      this.particles.emitExhalePlume(mx, my - 16, 24, smokeColor, { speedMul: 1.25, lateralMul: 1.2 });
      const timer1 = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitExhalePlume(mx, my - 16, 18, smokeColor, { speedMul: 0.95, lateralMul: 1.0 });
      }, 130);
      const timer2 = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitExhalePlume(mx, my - 16, 14, smokeColor, { speedMul: 0.70, lateralMul: 0.8 });
      }, 260);
      this.exhaleEffectTimers.push(timer1, timer2);
    }
  },

  // 触摸开始（吸气 / 轻捏过滤嘴爆珠）
  onTouchStart(e) {
    audioManager.unlockAudio();
    if (this.fsm.getState() === 'FINISHED') {
      this.restartCigarette();
      this.triggerIgnite();
      return;
    }

    // 爆珠直接触控判定 (Direct Touch Hit-Testing on Filter Bead)
    const curCig = this.data.currentCigarette;
    if (curCig && curCig.hasBead && e && e.touches && e.touches[0] && this.cWidth && this.cHeight) {
      const touch = e.touches[0];
      const cx = this.cWidth / 2;
      const cy = this.cHeight * 0.65;
      const maxCigH = curCig.widthType === 'slender' ? Math.min(375, this.cHeight * 0.56) : (curCig.isCigar ? Math.min(340, this.cHeight * 0.50) : Math.min(360, this.cHeight * 0.54));
      const filterRatio = curCig.widthType === 'slender' ? 0.25 : (curCig.isCigar ? 0.28 : 0.23);
      const filterH = Math.round(maxCigH * filterRatio);
      const beadY = cy + filterH * 0.52;

      const tx = touch.x !== undefined ? touch.x : (touch.clientX - (this.canvasLeft || 0));
      const ty = touch.y !== undefined ? touch.y : (touch.clientY - (this.canvasTop || 0));

      const hitDist = Math.hypot(tx - cx, ty - beadY);
      if (hitDist <= 46) {
        if (!this.data.isBeadPopped) {
          this.popBead();
        } else {
          triggerHaptic('light');
        }
        return;
      }
    }

    // 未点燃时点击屏幕: 自动为用户点燃香烟，无缝开启吸烟流程
    if (this.fsm.getState() === 'UNLIT') {
      this.triggerIgnite();
      toast.flame('已为您点燃香烟', '沉浸呼吸 · 舒缓身心');
      return;
    }

    if (this.exhaleTimer) {
      clearTimeout(this.exhaleTimer);
      this.exhaleTimer = null;
    }
    this.setData({ isExhalingPrompt: false });

    if (this.fsm.startInhale()) {
      this.isHoldingInhale = true;
      this.inhaleStartTime = Date.now();

      // 清理上一波残留的延时发射器，杜绝吸气中途延迟吐烟
      if (this.exhaleEffectTimers && this.exhaleEffectTimers.length) {
        this.exhaleEffectTimers.forEach(t => clearTimeout(t));
        this.exhaleEffectTimers = [];
      }
      // 腾讯总监设计级：吸气时自然消散空中残留的历史呼出特效，清空舞台准备下一口
      if (this.particles) {
        this.particles.retireExhaleEntities(false);
      }

      if (this.data.breathingMode) {
        this.setData({ breathingPhase: 'inhale' });
        audioManager.playZenChimeSound(432);
      }
      this.setData({ simulatorState: this.fsm.getState() });
      audioManager.startBurnSound();
      triggerHaptic('light');

      if (this.hapticInterval) clearInterval(this.hapticInterval);
      this.hapticInterval = setInterval(() => {
        triggerHaptic('light');
      }, 700);
    }
  },

  // 触摸结束（呼气）
  onTouchEnd() {
    if (this.autoInhaleTimer) {
      clearTimeout(this.autoInhaleTimer);
      this.autoInhaleTimer = null;
    }

    if (!this.isHoldingInhale) return;
    this.isHoldingInhale = false;

    if (this.hapticInterval) {
      clearInterval(this.hapticInterval);
      this.hapticInterval = null;
    }
    audioManager.stopBurnSound();

    if (this.fsm.getState() === 'INHALING') {
      this.fsm.stopInhale();
      const nextSt = this.fsm.getState();
      if (this.data.simulatorState !== nextSt) {
        this.setData({ simulatorState: nextSt });
      }
      audioManager.playExhaleSound();
      triggerHaptic('medium');

      if (this.data.breathingMode) {
        this.setData({ breathingPhase: 'exhale' });
        audioManager.playZenChimeSound(396);
        if (this.exhaleTimer) clearTimeout(this.exhaleTimer);
        this.exhaleTimer = setTimeout(() => {
          this.exhaleTimer = null;
          if (this.fsm.finishExhale()) {
            this.setData({ simulatorState: this.fsm.getState() });
          }
          if (this.data.breathingPhase === 'exhale') {
            this.setData({ breathingPhase: 'none' });
          }
        }, 4500);
      } else {
        this.setData({ isExhalingPrompt: true });
        if (this.exhaleTimer) clearTimeout(this.exhaleTimer);
        this.exhaleTimer = setTimeout(() => {
          this.exhaleTimer = null;
          if (this.fsm.finishExhale()) {
            this.setData({
              isExhalingPrompt: false,
              simulatorState: this.fsm.getState()
            });
          } else {
            this.setData({ isExhalingPrompt: false });
          }
        }, 2500);
      }

      // 真实口部呼气吐烟动作：从嘴部向上喷涌大团浓白烟气，并强力激发现装配的专属烟雾特效
      this.performRealisticExhale();
    }
  },

  // 切换点火器具
  onSelectIgnitionTool(e) {
    const toolId = e.currentTarget.dataset.id;
    if (!toolId || toolId === this.data.currentIgnitionTool.id) return;

    const tool = getIgnitionToolById(toolId);
    storageService.setSelectedIgnitionTool(toolId);
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');

    this.setData({
      currentIgnitionTool: tool,
      isZippoOpen: false,
      isCarLighterHeating: false
    });

    toast.flame(`换用【${tool.name}】`);
  },

  onIgniteTouchStart(e) {
    audioManager.unlockAudio();
    const tool = this.data.currentIgnitionTool;
    if (tool.id === 'zippo_vintage' && !this.data.isZippoOpen) {
      audioManager.playZippoOpenSound();
      triggerHaptic('medium');
      this.setData({ isZippoOpen: true });
    }
  },

  onIgniteTouchEnd() {},

  // 掐灭香烟：点击掐灭立即灭掉火头，升起一缕微弱青灰余烟
  extinguishCigarette() {
    if (!this.fsm) return;
    if (this.fsm.extinguish()) {
      if (this.autoInhaleTimer) {
        clearTimeout(this.autoInhaleTimer);
        this.autoInhaleTimer = null;
      }
      if (this.hapticInterval) {
        clearInterval(this.hapticInterval);
        this.hapticInterval = null;
      }
      this.isHoldingInhale = false;
      audioManager.stopBurnSound();
      audioManager.playSizzleSound();
      triggerHaptic('heavy');

      // 腾讯设计级 方案 A：彻底切断烟雾发射并清理空气，火头瞬间暗化为焦黑炭头，瞬间回归静谧
      if (this.particles && this.particles.clear) {
        this.particles.clear();
      }

      this.setData({
        simulatorState: this.fsm.getState(),
        breathingPhase: 'none',
        isExhalingPrompt: false
      });
      toast.info('已掐灭香烟');
    }
  },

  // 点火与掐灭核心动作 (未点燃时点燃，燃烧中点击掐灭，抽完直接点燃新一支无重置步骤)
  triggerIgnite() {
    audioManager.unlockAudio();
    if (this.data.simulatorState === 'FINISHED') {
      this.restartCigarette();
    }
    // 如果当前处于点燃状态，点击直接掐灭
    if (this.data.simulatorState !== 'UNLIT') {
      this.extinguishCigarette();
      return;
    }
    if (this.data.isSparking) return;

    const tool = this.data.currentIgnitionTool;

    // 车载点烟器专属：按下加热 1s 后通红弹起点燃
    if (tool.id === 'car_lighter' && !this.data.isCarLighterHeating) {
      this.setData({ isCarLighterHeating: true });
      triggerHaptic('medium');
      setTimeout(() => {
        audioManager.playCarLighterPopSound();
        triggerHaptic('heavy');
        this.setData({
          isCarLighterHeating: false,
          isSparking: true
        });
        audioManager.playSizzleSound();
        const { cx, cy } = this.getTipCoordinates();
        this.particles.emitSparks(cx, cy, 14);

        if (this.particles && this.particles.resetSilkStream) {
          this.particles.resetSilkStream(true);
        }

        if (this.fsm.light()) {
          this.sessionStartTime = Date.now();
          this.setData({ simulatorState: this.fsm.getState() });
        }

        setTimeout(() => {
          this.setData({ isSparking: false });
        }, 600);
      }, 1000);
      return;
    }

    this.setData({ isSparking: true });
    audioManager.playIgnitionSoundByTool(tool.id);
    triggerHaptic('heavy');

    if (this.particles && this.particles.resetSilkStream) {
      this.particles.resetSilkStream(true);
    }

    const { cx, cy } = this.getTipCoordinates();
    if (tool.id === 'vintage_match') {
      // 火柴特有的柔和微粒火星
      this.particles.emitSparks(cx, cy, 14);
    } else if (tool.id === 'blue_torch') {
      // 强劲蓝焰火枪密集火星
      this.particles.emitSparks(cx, cy, 26);
    } else {
      this.particles.emitSparks(cx, cy, 18);
    }

    setTimeout(() => {
      this.setData({ isSparking: false });
    }, 550);

    if (this.fsm.light()) {
      storageService.incrementIgniteCount();
      this.sessionStartTime = Date.now();
      this.setData({ simulatorState: this.fsm.getState() });
    }
  },

  onLighterTouchStart(e) {
    this.onIgniteTouchStart(e);
  },

  onLighterTouchEnd() {
    this.onIgniteTouchEnd();
  },

  // 捏爆珠专属交互：清脆爆破音效、强震动、真香原液像水一样注入并浸透烟嘴
  popBead() {
    audioManager.unlockAudio();
    const curCig = this.data.currentCigarette;
    if (!curCig || !curCig.hasBead) return;

    if (this.data.isBeadPopped) {
      triggerHaptic('light');
      return;
    }

    audioManager.playPopBeadSound();
    triggerHaptic('heavy');
    // 双段触感拟真：0ms 外壳脆裂重震 + 32ms 内部精油泄压喷薄次级轻震
    setTimeout(() => {
      triggerHaptic('light');
    }, 32);

    const beadColor = curCig.beadColor || '#10b981';
    if (this.cWidth && this.cHeight && this.particles) {
      const cx = this.cWidth / 2;
      const cy = this.cHeight * 0.65;
      const maxCigH = curCig.widthType === 'slender' ? Math.min(375, this.cHeight * 0.56) : (curCig.isCigar ? Math.min(340, this.cHeight * 0.50) : Math.min(360, this.cHeight * 0.54));
      const filterRatio = curCig.widthType === 'slender' ? 0.25 : (curCig.isCigar ? 0.28 : 0.23);
      const filterH = Math.round(maxCigH * filterRatio);
      const beadY = cy + filterH * 0.52;
      this.particles.emitBeadPop(cx, beadY, beadColor);
    }

    this.setData({ isBeadPopped: true });
  },

  // 3分钟烟瘾急救冲浪模式
  toggleSosMode() {
    audioManager.unlockAudio();
    const next = !this.data.sosActive;
    if (next) {
      audioManager.playZenChimeSound(528);
      triggerHaptic('medium');
      this.setData({
        sosActive: true,
        sosSeconds: 180,
        sosTimerDisplay: '03:00'
      });
      if (this.sosTimer) clearInterval(this.sosTimer);
      this.sosTimer = setInterval(() => {
        let sec = this.data.sosSeconds - 1;
        if (sec <= 0) {
          clearInterval(this.sosTimer);
          this.sosTimer = null;
          audioManager.playSuccessSound();
          triggerHaptic('heavy');
          this.setData({
            sosActive: false,
            sosSeconds: 180,
            sosTimerDisplay: '03:00'
          });
          wx.showModal({
            title: '🎉 冲动冲浪成功！',
            content: '你成功抵御了最危险的3分钟烟瘾冲动期！多巴胺渴求已回落。',
            showCancel: false
          });
        } else {
          const m = String(Math.floor(sec / 60)).padStart(2, '0');
          const s = String(sec % 60).padStart(2, '0');
          this.setData({
            sosSeconds: sec,
            sosTimerDisplay: `${m}:${s}`
          });
        }
      }, 1000);
    } else {
      if (this.sosTimer) {
        clearInterval(this.sosTimer);
        this.sosTimer = null;
      }
      this.setData({
        sosActive: false,
        sosSeconds: 180,
        sosTimerDisplay: '03:00'
      });
      triggerHaptic('light');
    }
  },

  // 手动弹烟灰 (纯净拟真视听与触感，无任何多余弹窗提示)
  manualTapAsh() {
    audioManager.unlockAudio();
    if (this.fsm && this.fsm.tapAsh()) {
      audioManager.playAshTapSound();
      triggerHaptic('medium');
      const { cx, cy } = this.getTipCoordinates();
      // 真实抖落极微量细小灰屑，彻底消除任何火星或大团烟雾感
      this.particles.emitAshDrop(cx, cy, 3);
      this.setData({
        ashLength: 0,
        ashProgress: 0,
        ashPercent: 0
      });
    } else {
      triggerHaptic('light');
    }
  },

  // 抽完结算
  handleSmokingFinished() {
    const duration = this.sessionStartTime > 0 ? Math.round((Date.now() - this.sessionStartTime) / 1000) : 0;
    const inhales = this.fsm.getInhaleCount();
    const profile = storageService.getProfile();
    const saved = calculateSavings(1, profile.packPrice);
    const tar = calculateTarAvoided(1);
    const life = calculateLifeRegained(1);

    // 真实消耗：扣减当前名烟的烟盒剩余数量
    storageService.decrementPackCount(this.data.currentCigarette.id, this.data.currentCigarette.packCapacity || 20);

    storageService.addRecord({
      id: `sub_${Date.now()}`,
      timestamp: Date.now(),
      cigaretteId: this.data.currentCigarette.id,
      durationSeconds: duration,
      inhaleCount: inhales
    });

    // 荣耀成就判定与实时 HUD 广播 (Tencent Games 即时多巴胺激励)
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const totalSaved = calculateSavings(totalSubs, profile.packPrice);
    const quitDays = calculateQuitDays(profile.quitStartDate);
    const unlockedEffects = storageService.getUnlockedSmokeEffects() || [];

    const newly = checkAchievementsToUnlock({
      totalSubstituted: totalSubs,
      totalSavedMoney: totalSaved,
      quitDays: quitDays + 1,
      unlockedEffects,
      unlockedEffectsCount: unlockedEffects.length,
      hasCustomEffect: unlockedEffects.some(id => !['cloud_dense', 'silk_pure', 'ring_classic'].includes(id)),
      hasSummonedMythic: unlockedEffects.includes('dragon_breath') || unlockedEffects.includes('phoenix_nirvana')
    }, storageService.getUnlockedAchievements());

    if (newly && newly.length) {
      newly.forEach((id, idx) => {
        storageService.unlockAchievement(id);
        const ach = getAchievementById(id);
        if (ach) {
          setTimeout(() => {
            audioManager.playZenChimeSound(660);
            toast.flame(`🏆 荣耀解锁！获得【${ach.name}】勋章！`);
          }, 600 + idx * 1200);
        }
      });
    }

    audioManager.playSuccessSound();
    triggerHaptic('heavy');

    const PUNCHLINES = [
      '尼古丁骂骂咧咧地退出了群聊！',
      '你的双肺正在后台给你疯狂点赞 👍',
      '真香！又省下一支，钱包君露出了微笑 😎',
      '战胜心魔 +1！今天也是意志力爆棚的大佬！',
      '这一支没抽，身体细胞正在全力加速自愈 ✨'
    ];
    const punchline = PUNCHLINES[Math.floor(Math.random() * PUNCHLINES.length)];

    this.setData({
      showRewardModal: true,
      rewardPunchline: punchline,
      lastReward: {
        savedMoney: saved.toFixed(2),
        tarAvoided: tar,
        lifeRegained: life,
        inhaleCount: inhales,
        durationSeconds: duration
      }
    });

    this.refreshAllData();
  },

  restartCigarette() {
    if (this.autoInhaleTimer) {
      clearTimeout(this.autoInhaleTimer);
      this.autoInhaleTimer = null;
    }
    if (this.exhaleTimer) {
      clearTimeout(this.exhaleTimer);
      this.exhaleTimer = null;
    }
    this.setData({ showRewardModal: false });
    this.fsm.reset();
    this.particles.clear();
    this.sessionStartTime = 0;
    this.setData({
      simulatorState: 'UNLIT',
      ashLength: 0,
      ashProgress: 0,
      ashPercent: 0,
      breathingPhase: 'none',
      isBeadPopped: false
    });
  },

  closeRewardModal() {
    this.setData({ showRewardModal: false });
    this.restartCigarette();
  },

  // 模式切换
  toggleBreathingMode() {
    audioManager.unlockAudio();
    const next = !this.data.breathingMode;
    this.setData({
      breathingMode: next,
      breathingPhase: 'none'
    });
    if (next) {
      audioManager.playZenChimeSound(528);
      triggerHaptic('medium');
    } else {
      audioManager.playSwitchSound();
      triggerHaptic('light');
    }
  },

  toggleSmokeRingMode() {
    audioManager.unlockAudio();
    const next = !this.data.smokeRingMode;
    this.setData({ smokeRingMode: next });
    audioManager.playSwitchSound();
    triggerHaptic('light');
  },

  toggleMute() {
    audioManager.unlockAudio();
    const next = !audioManager.isMuted();
    audioManager.setMuted(next);
    this.setData({ isMuted: next });
    if (!next) {
      audioManager.playSwitchSound();
    }
  },

  // Tab 切换 (3个Tab: simulator | leaderboard | stats)
  switchTab(e) {
    audioManager.unlockAudio();
    const tab = e.currentTarget.dataset.tab;
    if (this.data.currentTab !== tab) {
      audioManager.playSwitchSound();
      triggerHaptic('light');
      this.setData({ currentTab: tab });
      this.refreshAllData();
    }
  },

  // 排行榜分类切换事件 (由 leaderboard-view 触发)
  onLeaderboardCategoryChange(e) {
    const category = e.detail.category;
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.setData({ leaderboardCategory: category });
    this.refreshLeaderboard();
  },

  // 排行榜点赞事件 (由 leaderboard-view 触发)
  onLeaderboardLike(e) {
    const id = e.detail.id;
    audioManager.unlockAudio();
    leaderboardService.toggleLike(id);
    audioManager.playLikeHeartSound();
    triggerHaptic('medium');
    this.refreshLeaderboard();
  },

  // 刷新排行榜
  refreshLeaderboard() {
    const profile = storageService.getProfile();
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const totalSaved = calculateSavings(totalSubs, profile.packPrice);
    const quitDays = calculateQuitDays(profile.quitStartDate);

    const result = leaderboardService.getLeaderboard(this.data.leaderboardCategory, {
      substituted: totalSubs,
      savedMoney: Math.round(totalSaved),
      days: quitDays + 1
    }, profile);

    this.setData({
      leaderboardList: result.list,
      myRankInfo: result.myRankInfo
    });
  },

  // 数据刷新
  refreshAllData() {
    const profile = storageService.getProfile();
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const totalSaved = calculateSavings(totalSubs, profile.packPrice);
    const totalTar = calculateTarAvoided(totalSubs);
    const totalLife = calculateLifeRegained(totalSubs);
    const quitDays = calculateQuitDays(profile.quitStartDate);
    const dailyRaw = storageService.getRecentDailyStats(7);

    const maxCount = Math.max(...dailyRaw.map(d => d.count), 5);
    const dailyTrends = dailyRaw.map(d => ({
      ...d,
      percent: d.count > 0 ? Math.min(100, Math.round((d.count / maxCount) * 100)) : 6
    }));

    const sumDaily = dailyRaw.reduce((acc, curr) => acc + curr.count, 0);
    const weeklyAvg = dailyRaw.length ? (sumDaily / dailyRaw.length).toFixed(1) : '0.0';

    const todayStat = dailyRaw.find(d => d.label === '今天') || dailyRaw[dailyRaw.length - 1];
    const todayCount = todayStat ? Number(todayStat.count) || 0 : 0;
    const todaySavedMoney = calculateSavings(todayCount, profile.packPrice).toFixed(2);

    const whoStages = getWhoStages(profile.quitStartDate);

    // 图鉴列表状态
    const catalogList = CIGARETTE_CATALOG.map(c => ({
      ...c,
      unlocked: isCigaretteUnlocked(c.id, totalSubs),
      currentStock: storageService.getPackCount(c.id, c.packCapacity || (c.isCigar ? 5 : 20))
    }));

    // 成就列表状态
    const unlockedAchievements = storageService.getUnlockedAchievements();
    const achievementsList = ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: unlockedAchievements.includes(a.id)
    }));

    const packRemaining = storageService.getPackCount(this.data.currentCigarette.id, this.data.currentCigarette.packCapacity || 20);

    // 烟雾特效解锁与替烟兑换状态 (腾讯总监级四字名美学规范)
    const unlockedEffects = storageService.getUnlockedSmokeEffects();
    const smokeEffectsList = SMOKE_EFFECTS.map(effect => {
      const isUnlocked = isSmokeEffectUnlocked(effect.id, totalSubs, unlockedEffects);
      const canBuyWithSavings = !isUnlocked && totalSaved >= (effect.requiredSavings || effect.price);
      const name4 = (effect.name || '').slice(0, 4);
      return {
        ...effect,
        name: name4,
        shortName: (effect.shortName || name4).slice(0, 4),
        unlocked: isUnlocked,
        canBuyWithSavings
      };
    });

    const singleStickPrice = (profile.packPrice ? profile.packPrice / 20 : 1.25).toFixed(2);

    this.setData({
      profile,
      todayCount,
      todaySavedMoney,
      totalSubstituted: totalSubs,
      totalPacksSaved: (totalSubs / 20).toFixed(1),
      totalSavedMoney: totalSaved.toFixed(2),
      singleStickSavedPrice: singleStickPrice,
      totalTarAvoided: totalTar,
      totalLifeRegained: totalLife,
      lifeRegainedHours: (totalLife / 60).toFixed(1),
      quitDays,
      dailyTrends,
      weeklyAvg,
      whoStages,
      catalogList,
      achievementsList,
      unlockedAchievementsCount: unlockedAchievements.length,
      editProfile: { ...profile },
      currentPackRemaining: packRemaining,
      smokeEffectsList
    });

    this.refreshLeaderboard();
  },

  // ================= 实机同款主控与快捷操作 =================
  openSkillModal() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.setData({ showSkillModal: true });
  },

  closeSkillModal() {
    this.setData({ showSkillModal: false });
  },

  openTipModal() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.setData({ showTipModal: true });
  },

  closeTipModal() {
    this.setData({ showTipModal: false });
  },

  switchToLeaderboard() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.stopRenderLoop();
    wx.navigateTo({
      url: '/pages/leaderboard/leaderboard',
      fail: () => {
        this.startRenderLoop();
      }
    });
  },

  switchToStats() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.stopRenderLoop();
    wx.navigateTo({
      url: '/pages/mine/mine',
      fail: () => {
        this.startRenderLoop();
      }
    });
  },

  // 切换Dock菜单展开/收起
  toggleDockMenu() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.setData({
      showDockMenu: !this.data.showDockMenu
    });
  },

  backToSimulator() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.setData({ currentTab: 'simulator' });
  },

  // ================= 烟雾特效新手长按引导微气泡管线 (Tencent UX Tooltip Pipeline) =================
  checkSmokeGuide() {
    try {
      const seen = wx.getStorageSync('SMOKE_EFFECT_GUIDE_SEEN');
      if (!seen && !this.data.showSmokeEffectGuide) {
        // 延迟 800ms 优雅弹出，避开主页首屏渲染争抢
        setTimeout(() => {
          this.setData({ showSmokeEffectGuide: true, isGuideFading: false });
          if (this.smokeGuideTimer) clearTimeout(this.smokeGuideTimer);
          // 3.8 秒后优雅渐隐消失
          this.smokeGuideTimer = setTimeout(() => {
            this.dismissSmokeGuide();
          }, 3800);
        }, 800);
      }
    } catch (e) {}
  },

  dismissSmokeGuide() {
    if (!this.data.showSmokeEffectGuide) return;
    if (this.smokeGuideTimer) {
      clearTimeout(this.smokeGuideTimer);
      this.smokeGuideTimer = null;
    }
    this.setData({ isGuideFading: true });
    try {
      wx.setStorageSync('SMOKE_EFFECT_GUIDE_SEEN', true);
    } catch (e) {}
    setTimeout(() => {
      this.setData({ showSmokeEffectGuide: false, isGuideFading: false });
    }, 400);
  },

  onTapSmokeGuideTooltip() {
    this.dismissSmokeGuide();
    this.openSmokeEffectDrawer();
  },

  // ================= 赛博烟雾特效工坊 (实机切换图标与氪金/免费解锁特工坊) =================
  toggleSmokeEffect() {
    audioManager.unlockAudio();
    triggerHaptic('medium');
    this.dismissSmokeGuide();

    const totalSubs = this.data.totalSubstituted || 0;
    const unlockedList = storageService.getUnlockedSmokeEffects();
    // 找出所有已解锁特效 (包含免费初始款与达成替烟奖励款)
    const unlockedEffects = SMOKE_EFFECTS.filter(e => isSmokeEffectUnlocked(e.id, totalSubs, unlockedList));
    if (!unlockedEffects.length) return;

    // 轮询下一个已解锁的特效
    const currentId = this.data.currentSmokeEffect ? this.data.currentSmokeEffect.id : 'ring_classic';
    const curIdx = unlockedEffects.findIndex(e => e.id === currentId);
    const nextEffect = unlockedEffects[(curIdx + 1) % unlockedEffects.length];

    // 清理前置延时定时器，杜绝跨特效杂糅
    if (this.exhaleEffectTimers && this.exhaleEffectTimers.length) {
      this.exhaleEffectTimers.forEach(t => clearTimeout(t));
      this.exhaleEffectTimers = [];
    }

    // 腾讯总监设计级：瞬态软流转，清退异构大实体，聚焦新特效
    if (this.particles) {
      this.particles.switchEffectGracefully(nextEffect.id);
    }

    this.setData({
      currentSmokeEffect: nextEffect,
      smokeEffectType: nextEffect.id,
      smokeRingMode: nextEffect.id === 'ring_classic'
    });
    storageService.setSelectedSmokeEffectId(nextEffect.id);

    audioManager.playZenChimeSound(528);
    toast.info(`已切换【${nextEffect.name}】(长按选特效)`);
  },

  openSmokeEffectDrawer() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.dismissSmokeGuide();
    this.refreshAllData();
    this.setData({ showSmokeEffectDrawer: true });
  },

  closeSmokeEffectDrawer() {
    this.setData({ showSmokeEffectDrawer: false });
  },

  onSelectSmokeEffect(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;

    const totalSubs = this.data.totalSubstituted || 0;
    const unlockedList = storageService.getUnlockedSmokeEffects();
    const isUnlocked = isSmokeEffectUnlocked(item.id, totalSubs, unlockedList);

    if (!isUnlocked) {
      triggerHaptic('medium');
      wx.showModal({
        title: `🔒 【${item.name}】尊享特效未解锁`,
        content: `该特效解锁条件：\n1. 累计替烟满 ${item.requiredCount} 支（当前已替 ${totalSubs} 支）\n2. 或通过替烟省下的烟资零元兑换（需 ¥${item.requiredSavings || item.price}）\n\n您可以先点击【30秒免费试抽】沉浸体验！`,
        confirmText: '30s试抽',
        cancelText: '知道了',
        success: (res) => {
          if (res.confirm) {
            this.startTrialSmokeEffect(item);
          }
        }
      });
      return;
    }

    // 清理前置延时定时器，杜绝跨特效杂糅
    if (this.exhaleEffectTimers && this.exhaleEffectTimers.length) {
      this.exhaleEffectTimers.forEach(t => clearTimeout(t));
      this.exhaleEffectTimers = [];
    }

    // 腾讯总监设计级：瞬态软流转，清退异构大实体，聚焦新特效
    if (this.particles) {
      this.particles.switchEffectGracefully(item.id);
    }

    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.setData({
      currentSmokeEffect: item,
      smokeEffectType: item.id,
      smokeRingMode: item.id === 'ring_classic',
      showSmokeEffectDrawer: false
    });
    storageService.setSelectedSmokeEffectId(item.id);

    toast.success(`已装配【${item.name}】`);
  },

  startTrialSmokeEffect(itemOrEvent) {
    const item = itemOrEvent.currentTarget ? itemOrEvent.currentTarget.dataset.item : itemOrEvent;
    if (!item) return;

    if (this.trialInterval) clearInterval(this.trialInterval);
    const originalEffect = this.data.currentSmokeEffect;

    // 清理前置延时定时器，杜绝跨特效杂糅
    if (this.exhaleEffectTimers && this.exhaleEffectTimers.length) {
      this.exhaleEffectTimers.forEach(t => clearTimeout(t));
      this.exhaleEffectTimers = [];
    }

    // 腾讯总监设计级：瞬态软流转，清退异构大实体，聚焦新特效
    if (this.particles) {
      this.particles.switchEffectGracefully(item.id);
    }

    audioManager.playZenChimeSound(528);
    triggerHaptic('heavy');

    this.setData({
      currentSmokeEffect: item,
      smokeEffectType: item.id,
      smokeRingMode: item.id === 'ring_classic',
      isTrialActive: true,
      trialSecondsLeft: 30,
      showSmokeEffectDrawer: false
    });

    toast.flame(`开启【${item.name}】30秒尊享试抽`);

    this.trialInterval = setInterval(() => {
      const left = this.data.trialSecondsLeft - 1;
      if (left <= 0) {
        clearInterval(this.trialInterval);
        this.trialInterval = null;
        this.setData({
          isTrialActive: false,
          trialSecondsLeft: 0,
          currentSmokeEffect: originalEffect,
          smokeEffectType: originalEffect.id,
          smokeRingMode: originalEffect.id === 'ring_classic'
        });
        toast.info('30秒尊享试抽已结束，已切回原特效');
      } else {
        this.setData({ trialSecondsLeft: left });
      }
    }, 1000);
  },

  onUnlockSmokeEffectWithSavings(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;

    const totalSubs = this.data.totalSubstituted || 0;
    const profile = storageService.getProfile();
    const totalSaved = calculateSavings(totalSubs, profile.packPrice);
    const needMoney = item.requiredSavings || item.price;

    if (totalSaved < needMoney) {
      triggerHaptic('medium');
      toast.warn(`替烟基金不足！已攒 ¥${totalSaved.toFixed(2)} / 需 ¥${needMoney}`);
      return;
    }

    wx.showModal({
      title: `💎 替烟基金零元购兑换`,
      content: `您已通过不抽真烟累计节省 ¥${totalSaved.toFixed(2)}！\n确定使用替烟基金兑换尊享【${item.name}】(${item.priceDisplay})？\n（健康替烟，零元尊享！）`,
      confirmText: '立即兑换',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          storageService.unlockSmokeEffect(item.id);
          audioManager.playSuccessSound();
          triggerHaptic('heavy');

          if (this.exhaleEffectTimers && this.exhaleEffectTimers.length) {
            this.exhaleEffectTimers.forEach(t => clearTimeout(t));
            this.exhaleEffectTimers = [];
          }
          if (this.particles) {
            this.particles.switchEffectGracefully(item.id);
          }

          this.setData({
            currentSmokeEffect: item,
            smokeEffectType: item.id,
            smokeRingMode: item.id === 'ring_classic'
          });
          storageService.setSelectedSmokeEffectId(item.id);
          this.refreshAllData();

          toast.success(`成功兑换并装配【${item.name}】！`);
        }
      }
    });
  },

  triggerInhale() {
    audioManager.unlockAudio();
    if (this.data.simulatorState === 'UNLIT') {
      this.triggerIgnite();
      return;
    }
    if (this.data.simulatorState === 'FINISHED') {
      this.restartCigarette();
      this.triggerIgnite();
      return;
    }

    // 若当前正在吸气中，再次轻触“呼出”按钮直接吐烟呼气
    if (this.fsm.getState() === 'INHALING') {
      if (this.autoInhaleTimer) {
        clearTimeout(this.autoInhaleTimer);
        this.autoInhaleTimer = null;
      }
      this.onTouchEnd();
      return;
    }

    if (this.autoInhaleTimer) {
      clearTimeout(this.autoInhaleTimer);
      this.autoInhaleTimer = null;
    }

    this.onTouchStart();
    const duration = 4000; // 模拟深吸气 4 秒
    this.autoInhaleTimer = setTimeout(() => {
      this.autoInhaleTimer = null;
      if (this.fsm.getState() === 'INHALING') {
        this.onTouchEnd();
      }
    }, duration);
  },

  // 递烟专属交互：点击递出一支，扣减烟盒余量，外层圆圈显示进度条并提示
  giveCigarette() {
    audioManager.unlockAudio();
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const cur = this.data.currentPackRemaining;
    if (cur <= 0) {
      audioManager.playSwitchSound();
      triggerHaptic('heavy');
      toast.warn('烟盒已空', '去商店拆新盒');
      return;
    }

    const next = cur - 1;
    this.setData({ currentPackRemaining: next });
    storageService.setPackCount(curCig.id, next);

    audioManager.playSwitchSound();
    triggerHaptic('medium');
    if (next === 0) {
      toast.warn('🤝 递出最后一支！', '整盒已空，去商店拆新盒补满吧～');
    } else {
      toast.success('🤝 已递出 1 支【' + curCig.name + '】', `盒内剩余 ${next} 支 · 功德+1`);
    }
  },

  onShareAppMessage(options) {
    audioManager.playSwitchSound();
    triggerHaptic('light');

    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const profile = this.data.profile || {};
    const senderName = profile.nickname || '老哥';
    const isPackEmpty = this.data.currentPackRemaining <= 0;

    let title = isPackEmpty 
      ? `💨 老哥，我这盒【${curCig.name}】抽空了！递你一缕赛博仙气，健康替烟！`
      : `🤝 递你一支【${curCig.name}】！赛博替烟，少抽真烟多活好多年！`;
    if (!isPackEmpty) {
      if (curCig.brand === '中华' || curCig.id.includes('chunghwa')) {
        title = `🤝 老哥，递你一支软中华！赛博替烟，有面更有健康！`;
      } else if (curCig.brand === '黄鹤楼' || curCig.id.includes('huanghelou')) {
        title = `🤝 递你一支黄鹤楼！赛博替烟，登高望远，清肺自愈！`;
      } else if (curCig.category === '雪茄' || curCig.id.includes('cohiba')) {
        title = `🥂 递你一支古巴雪茄！赛博顶奢品吸，免除焦油侵害！`;
      }
    }

    return {
      title,
      path: `/pages/index/index?from=give_smoke&cigId=${curCig.id}&senderName=${encodeURIComponent(senderName)}`,
      imageUrl: curCig.packImage || '/images/packs/baisha.png'
    };
  },

  onShareTimeline() {
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    return {
      title: `🤝【我抽一支】我刚给好友递了一支【${curCig.name}】，赛博替烟，少吸焦油清肺自愈！`,
      query: `from=timeline&cigId=${curCig.id}`,
      imageUrl: curCig.packImage || '/images/packs/baisha.png'
    };
  },

  // 好友递烟受赠弹窗控制
  closeGiftModal() {
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.setData({ showGiftModal: false });
  },

  acceptGiftAndIgnite() {
    audioManager.unlockAudio();
    this.closeGiftModal();
    const cigName = this.data.giftCigarette?.name || this.data.currentCigarette?.name || '名烟';
    toast.flame('🔥 点燃【' + cigName + '】', '收下老哥敬意，替烟健康+1！');
    if (this.data.simulatorState !== 'UNLIT') {
      this.restartCigarette();
    }
    this.triggerIgnite();
  },

  // 选烟与拟真开盒页面跳转 (3D 翻盖烟盒与抽烟仪式感)
  openCigarettePicker() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.stopRenderLoop();
    wx.navigateTo({
      url: '/pages/shop/shop',
      fail: () => {
        this.startRenderLoop();
      }
    });
  },

  openPackPage() {
    this.openCigarettePicker();
  },

  closePicker() {
    this.setData({ showPicker: false });
  },

  onSelectPickerCigarette(e) {
    const item = e.currentTarget.dataset.item;
    if (!item.unlocked) {
      triggerHaptic('medium');
      toast.warn(item.unlockDesc);
      return;
    }
    audioManager.playSwitchSound();
    triggerHaptic('light');
    const packRemaining = storageService.getPackCount(item.id, item.packCapacity || (item.isCigar ? 5 : 20));
    this.setData({
      currentCigarette: item,
      currentPackRemaining: packRemaining,
      showPicker: false,
      isBeadPopped: false
    });
    storageService.setSelectedCigaretteId(item.id);
    this.refreshUserData();
    // 换烟：旧烟舍弃，重置为全新未点燃的烟
    if (this.fsm) {
      this.restartCigarette();
    }
  },

  onSelectCatalogItem(e) {
    this.onSelectPickerCigarette(e);
  },

  // 个人设置弹窗
  openProfileModal() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    const p = storageService.getProfile();
    this.setData({
      showProfileModal: true,
      editProfile: { ...p }
    });
  },

  closeProfileModal() {
    this.setData({ showProfileModal: false });
  },

  adjustPackPrice(e) {
    const delta = Number(e.currentTarget.dataset.delta);
    const val = Math.max(1, (this.data.editProfile.packPrice || 25) + delta);
    this.setData({ 'editProfile.packPrice': val });
    triggerHaptic('light');
  },

  setQuickPrice(e) {
    const val = Number(e.currentTarget.dataset.val);
    this.setData({ 'editProfile.packPrice': val });
    triggerHaptic('light');
  },

  onInputPackPrice(e) {
    const val = Math.max(1, Number(e.detail.value) || 25);
    this.setData({ 'editProfile.packPrice': val });
  },

  adjustCigsPerDay(e) {
    const delta = Number(e.currentTarget.dataset.delta);
    const val = Math.max(1, (this.data.editProfile.cigsPerDay || 15) + delta);
    this.setData({ 'editProfile.cigsPerDay': val });
    triggerHaptic('light');
  },

  onInputCigsPerDay(e) {
    const val = Math.max(1, Number(e.detail.value) || 15);
    this.setData({ 'editProfile.cigsPerDay': val });
  },

  adjustSmokeYears(e) {
    const delta = Number(e.currentTarget.dataset.delta);
    const val = Math.max(0, (this.data.editProfile.smokeYears || 5) + delta);
    this.setData({ 'editProfile.smokeYears': val });
    triggerHaptic('light');
  },

  onInputSmokeYears(e) {
    const val = Math.max(0, Number(e.detail.value) || 0);
    this.setData({ 'editProfile.smokeYears': val });
  },

  saveProfile() {
    const updated = {
      ...this.data.profile,
      packPrice: Math.max(1, Number(this.data.editProfile.packPrice) || 25),
      cigsPerDay: Math.max(1, Number(this.data.editProfile.cigsPerDay) || 15),
      smokeYears: Math.max(0, Number(this.data.editProfile.smokeYears) || 0)
    };
    storageService.saveProfile(updated);
    this.setData({ showProfileModal: false });
    audioManager.playSwitchSound();
    triggerHaptic('medium');
    toast.success('已保存偏好');
    this.refreshAllData();
  },

  onUpdateAvatar(e) {
    const avatarUrl = e.detail && e.detail.avatarUrl ? e.detail.avatarUrl : '';
    if (!avatarUrl) return;
    const updated = storageService.updateProfile({ avatarUrl });
    this.setData({ profile: updated });
    this.refreshLeaderboard();
    toast.success('头像已同步');
  },

  onUpdateNickname(e) {
    const nickName = (e.detail && e.detail.nickName ? e.detail.nickName : '').trim();
    if (!nickName) return;
    const updated = storageService.updateProfile({ nickName });
    this.setData({ profile: updated });
    this.refreshLeaderboard();
  },

  // ================= 沉浸生活场景氛围切换 =================
  openSceneModal() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.setData({ showSceneModal: true });
  },

  closeSceneModal() {
    this.setData({ showSceneModal: false });
  },

  onSelectAtmosphereScene(e) {
    const sceneId = e.currentTarget.dataset.id;
    if (!sceneId || sceneId === this.data.currentScene) {
      this.closeSceneModal();
      return;
    }
    const sceneInfo = getSceneById(sceneId);
    storageService.setAtmosphereScene(sceneId);
    audioManager.playSwitchSound();
    triggerHaptic('medium');

    this.setData({
      currentScene: sceneId,
      currentSceneInfo: sceneInfo,
      showSceneModal: false
    });

    if (this.data.isAmbientEnabled) {
      audioManager.startAmbientSound(sceneId);
    }

    toast.info(`已置身【${sceneInfo.name}】`);
  },

  toggleAmbientSound() {
    audioManager.unlockAudio();
    const nextState = !this.data.isAmbientEnabled;
    storageService.setAmbientSoundEnabled(nextState);
    audioManager.setAmbientEnabled(nextState, this.data.currentScene);
    triggerHaptic('light');
    this.setData({ isAmbientEnabled: nextState });

    if (nextState) {
      toast.info('已开启场景白噪音');
    } else {
      toast.info('已静音场景白噪音');
    }
  },

  stopBubble() {},
  preventTouchMove() {}
});
