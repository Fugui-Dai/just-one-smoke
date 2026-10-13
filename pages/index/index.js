// pages/index/index.js
import { SmokeStateMachine } from '../../utils/smokeStateMachine.js';
import { ParticleSystem } from '../../utils/particleSystem.js';
import { audioManager } from '../../utils/audioManager.js';
import { triggerHaptic } from '../../utils/haptics.js';
import { storageService } from '../../utils/storageService.js';
import { canvasRenderer } from '../../utils/canvasRenderer.js';
import { toast } from '../../utils/toastService.js';
import { ATMOSPHERE_SCENES, SCENE_CATEGORIES, getSceneById } from '../../utils/sceneRenderer.js';
import {
  calculateSavings,
  calculateTarAvoided,
  calculateLifeRegained,
  calculateQuitDays
} from '../../utils/healthCalculator.js';
import {
  CIGARETTE_CATALOG,
  DEFAULT_CIGARETTE,
  getCigaretteById,
  isCigaretteUnlocked,
  computeCigaretteDimensions
} from '../../utils/catalog.js';
import { checkAchievementsToUnlock, getAchievementById } from '../../utils/achievements.js';
import {
  IGNITION_TOOLS,
  getActiveIgnitionTool
} from '../../utils/ignitionService.js';
import {
  SMOKE_EFFECTS,
  DEFAULT_SMOKE_EFFECT,
  getSmokeEffectById,
  isSmokeEffectUnlocked
} from '../../utils/smokeEffects.js';
import { EXTINGUISH_ICON_SVG, STORE_ICON_SVG } from '../../utils/vectorIcons.js';
import { vipService } from '../../utils/vipService.js';

Page({
  data: {
    isVipUser: false,
    vipTheme: '',
    extinguishIconUri: EXTINGUISH_ICON_SVG,
    storeIconUri: STORE_ICON_SVG,
    // 导航与屏幕尺寸适配
    statusBarHeight: 44,
    navBarHeight: 44,
    capsuleRightSpace: 100,
    capsuleTop: 50,
    windowWidth: 375,
    windowHeight: 812,

    currentTab: 'simulator',
    currentCigarette: DEFAULT_CIGARETTE,
    simulatorState: 'UNLIT', // UNLIT | IDLE_BURNING | INHALING | EXHALING | FINISHED
    isMuted: false,
    ashLength: 0,
    ashProgress: 0,
    ashPercent: 0,
    isSparking: false,
    isAshTapping: false, // 抖灰物理阻尼与特效执行中锁定状态

    // 沉浸生活场景氛围 (默认微距纯黑摄影极简黑曜)
    currentScene: 'obsidian',
    currentSceneInfo: getSceneById('obsidian'),
    atmosphereScenes: ATMOSPHERE_SCENES,
    filteredAtmosphereScenes: ATMOSPHERE_SCENES,
    sceneCategories: SCENE_CATEGORIES,
    activeSceneCategory: 'all',
    activeScrollSceneId: '',
    isAmbientEnabled: true,
    showSceneModal: false,

    // 创新互动与状态参数
    currentPackRemaining: 20, // 烟盒余量
    smokeEffectType: DEFAULT_SMOKE_EFFECT.id,
    smokeEffectsList: SMOKE_EFFECTS,
    currentSmokeEffect: DEFAULT_SMOKE_EFFECT,
    activeScrollEffectId: '', // 尊享展厅快速定位正在使用的特效卡片
    showSmokeEffectDrawer: false, // 烟雾特工坊 · 尊享展厅
    showSmokeEffectGuide: false, // 💡 首次进入呼吸气泡长按引导
    isGuideFading: false,
    isTrialActive: false, // 30秒尊享免费试抽
    trialSecondsLeft: 0,
    isBeadPopped: false, // 爆珠是否已捏碎

    // 点火器具工坊
    currentIgnitionTool: IGNITION_TOOLS[0],

    // 统计看板核心数据
    profile: {},
    totalSubstituted: 0,
    totalSavedMoney: '0.00',
    singleStickSavedPrice: '1.25',
    quitDays: 0,

    // 弹窗状态
    showRewardModal: false,
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
    rewardPunchline: '尼古丁骂骂咧咧地退出了群聊！'
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
    this.screenFogAlpha = 0;
    this.animId = 0;
    this.lastTime = 0;
    this.lastExhaleTime = 0;
    this.exhaleEffectTimers = [];
    this._achToastTimers = [];
    this._carLighterTimer = null;
    this._sparkResetTimer = null;
    this._guideTimer = null;
    this._isCarLighterHeating = false;

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
    const isEffUnlockedOnLoad = isSmokeEffectUnlocked(
      savedEffectId,
      storageService.getRecords().length,
      storageService.getUnlockedSmokeEffects()
    );
    const curSmokeEffect = isEffUnlockedOnLoad
      ? (getSmokeEffectById(savedEffectId) || DEFAULT_SMOKE_EFFECT)
      : DEFAULT_SMOKE_EFFECT;

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
      // 2. 香烟进度、状态、烟灰 100% 保持，燃烧端下一帧即刻升起崭新轻柔青烟！
      const elapsedSinceHide = this.hideTimestamp > 0 ? (Date.now() - this.hideTimestamp) : 0;
      this.hideTimestamp = 0;
      if (elapsedSinceHide >= 400 && this.particles) {
        const curState = this.fsm ? this.fsm.getState() : 'UNLIT';
        const isLit = curState !== 'UNLIT' && curState !== 'FINISHED';
        this.particles.cleanseAir(isLit);
        this.screenFogAlpha = 0;
      }
    }

    const isVipUser = vipService.isVip();
    const vipTheme = vipService.getVipTheme();
    if (this._skipFirstShowRefresh) {
      this._skipFirstShowRefresh = false;
      this.setData({ isVipUser, vipTheme });
    } else {
      const updatePayload = {
        isMuted: audioManager.isMuted(),
        isVipUser,
        vipTheme
      };
      if (!this.data.isTrialActive) {
        const savedEffId = storageService.getSelectedSmokeEffectId();
        const isEffUnlocked = isSmokeEffectUnlocked(
          savedEffId,
          storageService.getRecords().length,
          storageService.getUnlockedSmokeEffects()
        );
        const activeEffect = isEffUnlocked
          ? (getSmokeEffectById(savedEffId) || DEFAULT_SMOKE_EFFECT)
          : DEFAULT_SMOKE_EFFECT;
        updatePayload.currentSmokeEffect = activeEffect;
        updatePayload.smokeEffectType = activeEffect.id;
      }
      this.setData(updatePayload);
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

  _clearTransientTimers() {
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
    if (this.trialInterval) {
      clearInterval(this.trialInterval);
      this.trialInterval = null;
    }
    if (this.smokeGuideTimer) {
      clearTimeout(this.smokeGuideTimer);
      this.smokeGuideTimer = null;
    }
    if (this._guideTimer) {
      clearTimeout(this._guideTimer);
      this._guideTimer = null;
    }
    if (this._carLighterTimer) {
      clearTimeout(this._carLighterTimer);
      this._carLighterTimer = null;
    }
    if (this._sparkResetTimer) {
      clearTimeout(this._sparkResetTimer);
      this._sparkResetTimer = null;
    }
    if (this._achToastTimers && this._achToastTimers.length) {
      this._achToastTimers.forEach(t => clearTimeout(t));
      this._achToastTimers = [];
    }
    if (this.ashTapLockTimer) {
      clearTimeout(this.ashTapLockTimer);
      this.ashTapLockTimer = null;
    }
    this._isCarLighterHeating = false;
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

    const wasTrial = this.data.isTrialActive;
    const savedEffect = getSmokeEffectById(storageService.getSelectedSmokeEffectId()) || DEFAULT_SMOKE_EFFECT;
    this._clearTransientTimers();

    this.screenFogAlpha = 0;
    const resetPatch = {
      isSparking: false,
      isAshTapping: false
    };
    if (wasTrial) {
      resetPatch.isTrialActive = false;
      resetPatch.trialSecondsLeft = 0;
      resetPatch.currentSmokeEffect = savedEffect;
      resetPatch.smokeEffectType = savedEffect.id;
    }
    this.setData(resetPatch);

    audioManager.stopBurnSound();
    audioManager.stopInhaleSound();
    audioManager.stopExhaleSound();
    audioManager.stopAmbientSound();
  },

  onUnload() {
    this.destroyEngine();
  },

  destroyEngine() {
    this.stopRenderLoop();
    this._clearTransientTimers();
    audioManager.stopBurnSound();
    audioManager.stopInhaleSound();
    audioManager.stopExhaleSound();
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

    const burnRes = this.fsm.burn(dt, isInhaling, this.data.currentCigarette);
    const curAsh = this.fsm.getAshLength();
    const curState = this.fsm.getState();

    // 现实物理规律：静置或吸烟时烟灰积满自重断落
    if (burnRes && burnRes.ashDropped) {
      const { cx, cy } = this.getTipCoordinates();
      const curCig = this.data.currentCigarette || {};
      const isHandRolled = curCig.widthType === 'hand_rolled';
      this.particles.emitAshDrop(cx, cy, isHandRolled ? 6 : 3, isHandRolled ? 22 : 6);
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

    // 抖灰轻弹阻尼微动效进度 (0.0 ~ 1.0, 持续约 400ms)
    let ashTapProgress = 1.0;
    if (this.ashTapStartTime > 0) {
      const elapsed = Date.now() - this.ashTapStartTime;
      ashTapProgress = Math.min(1.0, elapsed / 400);
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
      breathingMode: false,
      breathingPhase: 'none',
      screenFogAlpha: this.screenFogAlpha,
      sceneType: this.data.currentScene,
      isSparking: this.data.isSparking,
      ignitionTool: this.data.currentIgnitionTool,
      vipTheme: this.data.vipTheme,
      ashTapProgress
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

    if (ashPercent !== this.data.ashPercent || curState !== this.data.simulatorState) {
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
    const dims = computeCigaretteDimensions(curCig, this.cHeight);
    const maxCigH = dims.maxCigH;
    const filterH = Math.round(maxCigH * dims.filterRatio);
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
    const dims = computeCigaretteDimensions(curCig, this.cHeight);
    const filterH = Math.round(dims.maxCigH * dims.filterRatio);
    // 嘴部位于过滤嘴下沿稍偏下方 (烟嘴入嘴处)
    const my = cy + filterH + 12;
    return { mx, my };
  },

  // 配合烟雾特效执行真实拟真吐烟流程 (支持根据吸入时长动态注入吸力强度 intensity，具备连击防卡顿节流与上一波延时清理)
  performRealisticExhale(intensity = 1.0) {
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
      } else if (curCig.beadColor === '#f43f5e' || curCig.beadColor === '#ef4444') {
        smokeColor = 'rgba(254, 205, 211, '; // 中华国梅幽红 / 五粮国窖丹红
      } else if (curCig.beadColor === '#fb7185') {
        smokeColor = 'rgba(253, 164, 175, '; // 蜜桃白茶仙女粉
      } else if (curCig.beadColor === '#f472b6') {
        smokeColor = 'rgba(249, 168, 212, '; // 玫瑰荔枝冰酿粉
      } else if (curCig.beadColor === '#a855f7') {
        smokeColor = 'rgba(233, 213, 255, '; // 七星蓝莓幻紫
      }
    }

    const isAirCig = Boolean(curCig.id === 'pure_oxygen_zen' || curCig.isAirCig);
    if (isAirCig) {
      smokeColor = 'rgba(224, 242, 254, '; // 纯氧自然极清微光
    }

    const effIntensity = Math.min(1.55, Math.max(0.75, intensity || 1.0));
    const effectId = currentEff.id;
    storageService.recordSmokeEffectSummoned(effectId);

    // 腾讯总监设计级：独占特效调度，清除异构大实体与多余旧烟雾，杜绝多特效交叉重叠
    this.particles.ensureExclusiveEffect(effectId);

    if (effectId === 'ring_classic') {
      // 1. 经典空灵烟圈：第一圈领航冲出，第二圈追逐相伴，3D 俯仰透视环形涡流向前优雅滑行扩张并柔和羽化消散 (随吸力动态调节初速度与尺寸)
      this.particles.emitSmokeRing(mx, my - 20, smokeColor, 1.0 * effIntensity, { speedMul: Math.min(1.35, 0.82 + effIntensity * 0.28) });
      const timer = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitSmokeRing(mx, my - 24, smokeColor, 0.75 * effIntensity, { speedMul: 0.85 * effIntensity, offsetX: 6 });
      }, 190);
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
    } else if (effectId === 'bagua_taichi') {
      // 12. 乾坤八卦 · 紫微天穹大阵：巨幅太极八卦大阵恢弘展开，阴阳两仪灵气双鱼流转，八荒天罡剑芒与二十八星宿连珠漫空激荡
      this.particles.emitBaguaTaichi(mx, my - 20, true);
      const timer = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitBaguaTaichi(mx, my - 28, false);
      }, 180);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'buddha_light') {
      // 13. 佛光普照 · 梵天千叶金莲：峨眉金顶五色祥瑞圆光与十六道万丈佛光普照苍穹，三层宝相金莲盛放，真言梵音流转，漫天飘洒金莲花瓣与菩提舍利金雨
      this.particles.emitBuddhaLight(mx, my - 20, true);
      const timer = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitBuddhaLight(mx, my - 28, false);
      }, 180);
      this.exhaleEffectTimers.push(timer);
    } else {
      // 默认兜底：舒缓轻柔纯净白雾漫卷，绝不过度弥漫遮挡视线
      this.particles.emitExhalePlume(mx, my - 16, 12, smokeColor, { speedMul: 1.1, lateralMul: 1.0 });
      const timer1 = setTimeout(() => {
        if (!this.particles) return;
        this.particles.emitExhalePlume(mx, my - 16, 8, smokeColor, { speedMul: 0.85, lateralMul: 0.8 });
      }, 140);
      this.exhaleEffectTimers.push(timer1);
    }
  },

  // 触摸开始（吸气 / 轻捏过滤嘴爆珠）
  onTouchStart(e) {
    audioManager.unlockAudio();
    // 抖灰过程中严格锁定，禁止吸气，等待抖灰动效与特效完成
    if (this.data.isAshTapping) {
      return;
    }
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
      const dims = computeCigaretteDimensions(curCig, this.cHeight);
      const filterH = Math.round(dims.maxCigH * dims.filterRatio);
      const beadY = cy + filterH * 0.52;

      const tx = touch.x !== undefined ? touch.x : (touch.clientX - (this.canvasLeft || 0));
      const ty = touch.y !== undefined ? touch.y : (touch.clientY - (this.canvasTop || 0));

      const hitDist = Math.hypot(tx - cx, ty - beadY);
      // 腾讯拟真触控级：仅当爆珠未捏爆 (!this.data.isBeadPopped) 且触碰爆珠微距圆圈内 (半径 <= 18px) 时执行捏爆；爆珠爆了之后再次点击爆珠位置，直接穿透进入吸烟流程
      if (hitDist <= 18 && !this.data.isBeadPopped) {
        this.popBead();
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
      const inhaleDurationSec = this.inhaleStartTime ? Math.max(0.2, (Date.now() - this.inhaleStartTime) / 1000) : 0.8;
      // 腾讯总监级手感：根据真实深吸时长计算吸力强度 (0.75x ~ 1.55x 动态增益)
      const inhaleIntensity = Math.min(1.55, Math.max(0.75, 0.75 + Math.min(2.5, inhaleDurationSec) * 0.32));

      this.fsm.stopInhale();
      const nextSt = this.fsm.getState();
      if (this.data.simulatorState !== nextSt) {
        this.setData({ simulatorState: nextSt });
      }
      audioManager.playExhaleSound();
      triggerHaptic(inhaleDurationSec > 1.2 ? 'heavy' : 'medium');

      if (this.exhaleTimer) clearTimeout(this.exhaleTimer);
      this.exhaleTimer = setTimeout(() => {
        this.exhaleTimer = null;
        if (this.fsm.finishExhale()) {
          this.setData({
            simulatorState: this.fsm.getState()
          });
        }
      }, 2500);

      // 真实口部呼气吐烟动作：从嘴部向上喷涌浓白烟气，并根据吸入时长动态注入烟雾物理初速度与体积
      this.performRealisticExhale(inhaleIntensity);
    }
  },

  // 掐灭香烟：点击掐灭立即灭掉火头，升起一缕微弱青灰余烟
  extinguishCigarette() {
    if (!this.fsm) return;
    // 抖灰过程中严格锁定，禁止掐灭，必须等抖灰完成
    if (this.data.isAshTapping) {
      toast.info('正在抖灰中，请稍候');
      triggerHaptic('light');
      return;
    }
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

      // 腾讯设计级：只清除烟头点火阴燃烟气与火星，空中呼出的专属烟雾特效 100% 完整保留继续升腾
      if (this.particles) {
        const { cx, cy } = this.getTipCoordinates();
        if (typeof this.particles.extinguishTipSmoke === 'function') {
          this.particles.extinguishTipSmoke(cx, cy);
        } else if (this.particles.silkStreams) {
          this.particles.silkStreams.forEach(s => { s.nodes = []; });
        }
      }

      this.setData({
        simulatorState: this.fsm.getState()
      });
      toast.info('已掐灭香烟');
    }
  },

  // 点火与掐灭核心动作 (未点燃时点燃，燃烧中点击掐灭，抽完直接点燃新一支无重置步骤)
  triggerIgnite() {
    audioManager.unlockAudio();

    // 校验 1 支尝鲜试抽凭证与名烟解锁状态，防止未解锁名烟无限白嫖连抽
    let curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const totalSubs = storageService.getRecords().length;
    const trialInfo = storageService.getTrialCigaretteInfo();
    if (!isCigaretteUnlocked(curCig.id, totalSubs) && !vipService.isVip() && (!trialInfo || trialInfo.id !== curCig.id)) {
      const revertId = (trialInfo && trialInfo.prevId) ? trialInfo.prevId : 'chaotianmen_gold';
      curCig = getCigaretteById(revertId) || DEFAULT_CIGARETTE;
      storageService.setSelectedCigaretteId(curCig.id);
      const revCap = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
      this.setData({
        currentCigarette: curCig,
        currentPackRemaining: storageService.getPackCount(curCig.id, revCap),
        isBeadPopped: false
      });
    }

    if (this.data.simulatorState === 'FINISHED') {
      const cap = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
      if (storageService.getPackCount(curCig.id, cap) <= 0) {
        storageService.resetPackCount(curCig.id, cap);
      }
      const { remaining } = storageService.consumePackSlot(curCig.id, -1, cap);
      storageService.setHomeStickDigested(true);
      this.setData({ currentPackRemaining: remaining });
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
    if (tool.id === 'car_lighter' && !this._isCarLighterHeating) {
      this._isCarLighterHeating = true;
      triggerHaptic('medium');
      if (this._carLighterTimer) clearTimeout(this._carLighterTimer);
      this._carLighterTimer = setTimeout(() => {
        this._carLighterTimer = null;
        this._isCarLighterHeating = false;
        audioManager.playCarLighterPopSound();
        triggerHaptic('heavy');
        this.setData({ isSparking: true });
        audioManager.playSizzleSound();
        const { cx, cy } = this.getTipCoordinates();
        this.particles.emitSparks(cx, cy, 14);

        if (this.particles && this.particles.resetSilkStream) {
          this.particles.resetSilkStream(true);
        }

        if (this.fsm.light()) {
          storageService.incrementIgniteCount();
          this.sessionStartTime = Date.now();
          this.setData({ simulatorState: this.fsm.getState() });
        }

        if (this._sparkResetTimer) clearTimeout(this._sparkResetTimer);
        this._sparkResetTimer = setTimeout(() => {
          this._sparkResetTimer = null;
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

    if (this._sparkResetTimer) clearTimeout(this._sparkResetTimer);
    this._sparkResetTimer = setTimeout(() => {
      this._sparkResetTimer = null;
      this.setData({ isSparking: false });
    }, 550);

    if (this.fsm.light()) {
      storageService.incrementIgniteCount();
      this.sessionStartTime = Date.now();
      this.setData({ simulatorState: this.fsm.getState() });
    }
  },

  // 捏爆珠专属交互：清脆爆破音效、双段拟真震动、真香原液像水一样注入并浸透烟嘴
  popBead() {
    audioManager.unlockAudio();
    const curCig = this.data.currentCigarette;
    if (!curCig || !curCig.hasBead) return;

    // 严禁重复捏爆：每根烟爆珠仅能捏爆一次，模拟真实爆珠物理不可逆特性！
    if (this.data.isBeadPopped) {
      triggerHaptic('light');
      return;
    }

    // 触发高拟真“咔啪！”胶壳脆裂声与双段物理震感反馈
    audioManager.playPopBeadSound();
    triggerHaptic('heavy');
    // 双段触感拟真：0ms 外壳脆裂重震 + 32ms 内部精油泄压喷薄次级轻震
    setTimeout(() => {
      triggerHaptic('light');
    }, 32);

    if (canvasRenderer && typeof canvasRenderer.resetBeadFlow === 'function') {
      canvasRenderer.resetBeadFlow();
    }

    const beadColor = curCig.beadColor || '#10b981';
    if (this.cWidth && this.cHeight && this.particles) {
      const cx = this.cWidth / 2;
      const cy = this.cHeight * 0.65;
      const dims = computeCigaretteDimensions(curCig, this.cHeight);
      const filterH = Math.round(dims.maxCigH * dims.filterRatio);
      const beadY = cy + filterH * 0.52;
      this.particles.emitBeadPop(cx, beadY, beadColor);
    }

    this.setData({ isBeadPopped: true });
    toast.success(`咔啪！已捏爆【${curCig.beadName || '爆珠'}】`, '真香原液已浸润滤芯');
  },

  // 手动弹烟灰 (腾讯总监设计级：物理阻尼弹性轻弹微振、复合断裂火星光波特效、全局互斥锁定)
  manualTapAsh() {
    audioManager.unlockAudio();
    // 1. 全局互斥状态机检查：抖灰过程中严格防重连击
    if (this.data.isAshTapping) {
      return;
    }

    const curCig = this.data.currentCigarette || {};
    if (curCig.id === 'pure_oxygen_zen' || curCig.isAirCig) {
      toast.info('纯空气卷无烟丝与烟灰，无需弹灰');
      triggerHaptic('light');
      return;
    }

    const curState = this.fsm ? this.fsm.getState() : 'UNLIT';
    if (curState === 'UNLIT') {
      toast.info('香烟尚未点燃，暂无烟灰');
      triggerHaptic('light');
      return;
    }
    if (curState === 'FINISHED') {
      toast.info('本支已燃尽，点击可开启下一支');
      triggerHaptic('light');
      return;
    }

    // 2. 状态机尝试抖灰并重置烟灰长度
    const prevAshH = this.fsm ? this.fsm.getAshLength() : 0;
    const tapSuccess = this.fsm && this.fsm.tapAsh();

    if (tapSuccess) {
      // 开启抖灰互斥锁定与动效时间戳
      this.ashTapStartTime = Date.now();
      this.setData({
        isAshTapping: true,
        ashLength: 0,
        ashProgress: 0,
        ashPercent: 0
      });

      // 双段拟真指节轻弹触感与音效反馈 (0ms 指节轻弹 + 70ms 烟身微振回弹)
      audioManager.playAshTapSound();
      triggerHaptic('medium');
      setTimeout(() => {
        triggerHaptic('light');
      }, 70);

      // 触发高品质复合烟灰掉落与断裂特效
      if (this.particles) {
        const { cx, cy } = this.getTipCoordinates();
        const isHandRolled = curCig.widthType === 'hand_rolled';
        const accentColor = curCig.bandColor || '#f59e0b';
        const ashDropLen = Math.max(12, prevAshH);

        // 创新复合特效：断裂立体灰块 + 空中散屑 + 抛物线金红火星雨 + 禅意净化金色光环
        this.particles.emitAshTapVfx(cx, cy, ashDropLen, isHandRolled, accentColor);
      }

      // 650ms 动效与特效落地周期后解除互斥锁定
      if (this.ashTapLockTimer) clearTimeout(this.ashTapLockTimer);
      this.ashTapLockTimer = setTimeout(() => {
        this.ashTapLockTimer = null;
        this.ashTapStartTime = 0;
        this.setData({ isAshTapping: false });
      }, 650);
    } else {
      triggerHaptic('light');
    }
  },

  _checkAndUnlockAchievements() {
    const profile = storageService.getProfile();
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const grossSaved = calculateSavings(totalSubs, profile.packPrice);
    const quitDays = calculateQuitDays(profile.quitStartDate);
    const unlockedEffects = storageService.getUnlockedSmokeEffects() || [];
    const summonedEffects = storageService.getSummonedSmokeEffects() || [];
    const allEffects = Array.from(new Set([...unlockedEffects, ...summonedEffects]));

    const newly = checkAchievementsToUnlock({
      totalSubstituted: totalSubs,
      totalSavedMoney: grossSaved,
      quitDays: quitDays + 1,
      unlockedEffects: allEffects,
      unlockedEffectsCount: unlockedEffects.length,
      hasCustomEffect: allEffects.some(id => id !== 'ring_classic' && id !== 'auspicious_river') || (this.data.smokeEffectType !== 'ring_classic' && this.data.smokeEffectType !== 'auspicious_river'),
      hasSummonedMythic: allEffects.includes('dragon_breath') || allEffects.includes('phoenix_nirvana') || allEffects.includes('buddha_light') || allEffects.includes('bagua_taichi')
    }, storageService.getUnlockedAchievements());

    if (newly && newly.length) {
      if (!this._achToastTimers) this._achToastTimers = [];
      newly.forEach((id, idx) => {
        storageService.unlockAchievement(id);
        const ach = getAchievementById(id);
        if (ach) {
          const timer = setTimeout(() => {
            audioManager.playZenChimeSound(660);
            toast.flame(`🏆 荣耀解锁！获得【${ach.name}】勋章！`);
          }, 600 + idx * 1200);
          this._achToastTimers.push(timer);
        }
      });
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
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const maxCap = curCig.packCapacity || (curCig.isCigar ? 5 : 20);

    // 若该支烟在进入首页时已从烟盒消化扣减，则抽完结算时不再重复扣减烟盒余量
    if (storageService.isHomeStickDigested()) {
      storageService.setHomeStickDigested(false);
    } else {
      storageService.consumePackSlot(curCig.id, -1, maxCap);
    }

    storageService.addRecord({
      id: `sub_${Date.now()}`,
      timestamp: Date.now(),
      cigaretteId: curCig.id,
      durationSeconds: duration,
      inhaleCount: inhales
    });

    // 若当前抽完的是 1 支尝鲜试抽名烟，抽完即销毁试抽凭证并切回原装配名烟
    const trialInfo = storageService.getTrialCigaretteInfo();
    if (trialInfo && trialInfo.id === curCig.id) {
      storageService.clearTrialCigaretteInfo();
      const revertId = trialInfo.prevId || 'chaotianmen_gold';
      storageService.setSelectedCigaretteId(revertId);
      const revertedCig = getCigaretteById(revertId) || DEFAULT_CIGARETTE;
      this.setData({
        currentCigarette: revertedCig,
        isBeadPopped: false
      });
    }

    // 荣耀成就判定与实时 HUD 广播 (Tencent Games 即时多巴胺激励)
    this._checkAndUnlockAchievements();

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
      isBeadPopped: false
    });
  },

  closeRewardModal() {
    this.setData({ showRewardModal: false });
    this.restartCigarette();
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

  // 数据刷新 (腾讯级性能瘦身：仅维护首页 WXML 真正需要的烟盒库存、可用替烟基金与特效解锁列表)
  refreshAllData() {
    const profile = storageService.getProfile();
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const grossSaved = calculateSavings(totalSubs, profile.packPrice);
    const availableSaved = Math.max(0, Number((grossSaved - storageService.getSpentSavings()).toFixed(2)));
    const quitDays = calculateQuitDays(profile.quitStartDate);

    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const maxCap = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    const packRemaining = storageService.getPackCount(curCig.id, maxCap);

    // 烟雾特效解锁与替烟兑换状态
    const unlockedEffects = storageService.getUnlockedSmokeEffects();
    const smokeEffectsList = SMOKE_EFFECTS.map(effect => {
      const isUnlocked = isSmokeEffectUnlocked(effect.id, totalSubs, unlockedEffects);
      const canBuyWithSavings = !isUnlocked && availableSaved >= (effect.requiredSavings || effect.price);
      return {
        ...effect,
        unlocked: isUnlocked,
        canBuyWithSavings
      };
    });

    const singleStickPrice = (profile.packPrice ? profile.packPrice / 20 : 1.25).toFixed(2);

    this.setData({
      profile,
      totalSubstituted: totalSubs,
      totalSavedMoney: availableSaved.toFixed(2),
      singleStickSavedPrice: singleStickPrice,
      quitDays,
      currentPackRemaining: packRemaining,
      smokeEffectsList
    });
  },

  // ================= 实机同款主控与快捷操作 =================
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

  // ================= 烟雾特效新手长按引导微气泡管线 (Tencent UX Tooltip Pipeline) =================
  checkSmokeGuide() {
    try {
      const seen = wx.getStorageSync('SMOKE_EFFECT_GUIDE_SEEN');
      if (!seen && !this.data.showSmokeEffectGuide) {
        if (this._guideTimer) clearTimeout(this._guideTimer);
        // 延迟 800ms 优雅弹出，避开主页首屏渲染争抢
        this._guideTimer = setTimeout(() => {
          this._guideTimer = null;
          this.setData({ showSmokeEffectGuide: true, isGuideFading: false });
          if (this.smokeGuideTimer) clearTimeout(this.smokeGuideTimer);
          // 3.8 秒后优雅渐隐消失
          this.smokeGuideTimer = setTimeout(() => {
            this.smokeGuideTimer = null;
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
    if (this._guideTimer) {
      clearTimeout(this._guideTimer);
      this._guideTimer = null;
    }
    this.setData({ isGuideFading: true });
    try {
      wx.setStorageSync('SMOKE_EFFECT_GUIDE_SEEN', true);
    } catch (e) {}
    this._guideTimer = setTimeout(() => {
      this._guideTimer = null;
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
      smokeEffectType: nextEffect.id
    });
    storageService.setSelectedSmokeEffectId(nextEffect.id);
    this._checkAndUnlockAchievements();

    audioManager.playZenChimeSound(528);
  },

  openSmokeEffectDrawer() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.dismissSmokeGuide();
    this.refreshAllData();
    const curId = (this.data.currentSmokeEffect && this.data.currentSmokeEffect.id) 
      ? this.data.currentSmokeEffect.id 
      : 'ring_classic';
    // 腾讯体验设计级：同步绑定初始项，零延迟、零滑动过程，展厅开启即精准呈现在当前装配特效位置
    this.setData({ 
      showSmokeEffectDrawer: true,
      activeScrollEffectId: `effect_card_${curId}`
    });
  },

  closeSmokeEffectDrawer() {
    this.setData({ 
      showSmokeEffectDrawer: false,
      activeScrollEffectId: ''
    });
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
      showSmokeEffectDrawer: false
    });
    storageService.setSelectedSmokeEffectId(item.id);
    this._checkAndUnlockAchievements();
  },

  startTrialSmokeEffect(itemOrEvent) {
    const item = itemOrEvent.currentTarget ? itemOrEvent.currentTarget.dataset.item : itemOrEvent;
    if (!item) return;

    if (this.trialInterval) clearInterval(this.trialInterval);
    const originalEffect = getSmokeEffectById(storageService.getSelectedSmokeEffectId()) || DEFAULT_SMOKE_EFFECT;

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
          smokeEffectType: originalEffect.id
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
    const grossSaved = calculateSavings(totalSubs, profile.packPrice);
    const availableSaved = Math.max(0, Number((grossSaved - storageService.getSpentSavings()).toFixed(2)));
    const needMoney = item.requiredSavings || item.price;

    if (availableSaved < needMoney) {
      triggerHaptic('medium');
      toast.warn(`替烟基金不足！可用 ¥${availableSaved.toFixed(2)} / 需 ¥${needMoney}`);
      return;
    }

    wx.showModal({
      title: `💎 替烟基金零元购兑换`,
      content: `您当前可用替烟基金 ¥${availableSaved.toFixed(2)}！\n确定使用替烟基金 ¥${needMoney} 兑换尊享【${item.name}】(${item.priceDisplay})？\n（健康替烟，零元尊享！）`,
      confirmText: '立即兑换',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          storageService.addSpentSavings(needMoney);
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
            smokeEffectType: item.id
          });
          storageService.setSelectedSmokeEffectId(item.id);
          this.refreshAllData();
          this._checkAndUnlockAchievements();

          toast.success(`成功兑换并装配【${item.name}】！`);
        }
      }
    });
  },

  triggerInhale() {
    audioManager.unlockAudio();
    // 抖灰过程中严格锁定，禁止猛吸，必须等抖灰完成
    if (this.data.isAshTapping) {
      toast.info('正在抖灰中，请稍候');
      triggerHaptic('light');
      return;
    }
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

  // 递烟专属交互：只要点了递烟就会消耗一支，扣减烟盒槽位与余量，外层圆圈实时显示进度条并提示
  consumeOneStickForGive() {
    const now = Date.now();
    // 防止同一次点击同时触发 bindtap 与 onShareAppMessage(button) 导致双扣，300ms 内视为同一次点击
    if (this._lastGiveConsumeTime && (now - this._lastGiveConsumeTime < 300)) {
      return this.data.currentPackRemaining;
    }
    this._lastGiveConsumeTime = now;

    const curCig = this.data.currentCigarette || CIGARETTE_CATALOG[0] || DEFAULT_CIGARETTE;
    const cap = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    let cur = storageService.getPackCount(curCig.id, cap);

    // 若当前烟盒已空（0支），自动拆封全新一盒并立即消耗递出一支，确保“只要点了就会消耗一支”
    let autoUnwrapped = false;
    if (cur <= 0) {
      storageService.resetPackCount(curCig.id, cap);
      autoUnwrapped = true;
    }

    const { remaining: next } = storageService.consumePackSlot(curCig.id, -1, cap);

    this.setData({
      currentPackRemaining: next
    });

    if (autoUnwrapped) {
      toast.info(`已拆新盒并递出一支（余 ${next}/${cap}）`);
    } else if (next === 0) {
      toast.warn('🤝 递出最后一支！', '整盒已空，下次点击将自动拆新盒');
    } else {
      toast.info(`🤝 已递出一支【${curCig.name}】（余 ${next}/${cap}）`);
    }
    return next;
  },

  giveCigarette() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('medium');
    this.consumeOneStickForGive();
  },

  onShareAppMessage(options) {
    audioManager.playSwitchSound();
    triggerHaptic('light');

    // 兜底保障：若通过分享按钮触发且 bindtap 尚未执行，同样确保消耗一支
    if (options && options.from === 'button') {
      this.consumeOneStickForGive();
    }

    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const profile = this.data.profile || {};
    const senderName = profile.nickname || profile.nickName || '老哥';

    let title = `🤝 递你一支【${curCig.name}】！赛博替烟，少抽真烟多活好多年！`;
    if (curCig.brand === '中华' || curCig.id.includes('chunghwa')) {
      title = `🤝 老哥，递你一支软中华！赛博替烟，有面更有健康！`;
    } else if (curCig.brand === '黄鹤楼' || curCig.id.includes('huanghelou')) {
      title = `🤝 递你一支黄鹤楼！赛博替烟，登高望远，清肺自愈！`;
    } else if (curCig.category === '雪茄' || curCig.id.includes('cohiba')) {
      title = `🥂 递你一支古巴雪茄！赛博顶奢品吸，免除焦油侵害！`;
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

  // ================= 沉浸生活场景氛围切换 =================
  openSceneModal() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    const curScene = this.data.currentScene || 'obsidian';
    let list = ATMOSPHERE_SCENES;
    if (this.data.activeSceneCategory && this.data.activeSceneCategory !== 'all') {
      list = ATMOSPHERE_SCENES.filter(s => s.category === this.data.activeSceneCategory);
    }
    this.setData({
      showSceneModal: true,
      filteredAtmosphereScenes: list,
      activeScrollSceneId: `scene_card_${curScene}`
    });
  },

  onSelectSceneCategory(e) {
    const catId = e.currentTarget.dataset.id || 'all';
    if (catId === this.data.activeSceneCategory) return;
    audioManager.playSwitchSound();
    triggerHaptic('light');
    let list = ATMOSPHERE_SCENES;
    if (catId !== 'all') {
      list = ATMOSPHERE_SCENES.filter(s => s.category === catId);
    }
    this.setData({
      activeSceneCategory: catId,
      filteredAtmosphereScenes: list
    });
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
