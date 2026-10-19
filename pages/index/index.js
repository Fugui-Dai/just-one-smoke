// pages/index/index.js
import { SmokeStateMachine } from '../../engine/smokeStateMachine.js';
import { ParticleSystem } from '../../engine/particleSystem.js';
import { canvasRenderer } from '../../engine/canvasRenderer.js';
import { ATMOSPHERE_SCENES, SCENE_CATEGORIES, getSceneById, isSceneUnlocked, sceneRenderer } from '../../engine/sceneRenderer.js';

import { audioManager } from '../../services/audioManager.js';
import { triggerHaptic } from '../../services/haptics.js';
import { storageService } from '../../services/storageService.js';
import { toast } from '../../services/toastService.js';
import { IGNITION_TOOLS, getActiveIgnitionTool, isIgnitionToolUnlocked } from '../../services/ignitionService.js';
import { vipService } from '../../services/vipService.js';
import { leaderboardService } from '../../services/leaderboardService.js';
import { detectIsIOS } from '../../utils/safeArea.js';

import {
  calculateSavings,
  calculateTarAvoided,
  calculateLifeRegained,
  calculateQuitDays
} from '../../configs/healthCalculator.js';
import { adConfig } from '../../configs/adConfig.js';
import {
  CIGARETTE_CATALOG,
  DEFAULT_CIGARETTE,
  getCigaretteById,
  isCigaretteUnlocked,
  computeCigaretteDimensions
} from '../../configs/catalog.js';
import { ACHIEVEMENTS, checkAchievementsToUnlock, getAchievementById } from '../../configs/achievements.js';
import { VIP_THEME_OPTIONS } from '../../configs/vipThemes.js';
import {
  SMOKE_EFFECTS,
  DEFAULT_SMOKE_EFFECT,
  getSmokeEffectById,
  isSmokeEffectUnlocked
} from '../../configs/smokeEffects.js';

import {
  EXTINGUISH_ICON_SVG,
  IGNITE_ICON_SVG,
  DRAW_CIG_ICON_SVG,
  INHALE_ICON_SVG,
  SMOKE_VFX_ICON_SVG,
  ASH_TAP_ICON_SVG,
  GIVE_CIG_ICON_SVG,
  STORE_SHOP_ICON_SVG,
  VAULT_GALLERY_ICON_SVG,
  LEADERBOARD_TROPHY_SVG,
  DIGITAL_TWIN_USER_SVG,
  SOUND_ON_ICON_SVG,
  SOUND_MUTE_ICON_SVG,
  SCENE_AMBIENT_ICON_SVG,
  DOCK_FLUID_SHELL_SVG,
  DOCK_AURORA_STREAM_SVG,
  DOCK_AURORA_TOP_SVG,
  DOCK_AURORA_BOTTOM_SVG,
  CYBER_GOLD_VOUCHER_SVG,
  VICTORY_MEDAL_SVG,
  ASHTRAY_BRONZE_ICON_SVG,
  BROOM_CLEAN_ICON_SVG
} from '../../utils/vectorIcons.js';
import { measureSafeAreaSync } from '../../utils/safeArea.js';
import { navigateBackWithSound } from '../../utils/navigation.js';

Page({
  data: {
    isVipUser: false,
    vipTheme: '',
    isDevAdminMode: false,
    showAdminTestModal: false,
    devVipActive: false,
    devVipInfo: null,
    victoryMedalSvgUri: VICTORY_MEDAL_SVG,
    goldVoucherSvgUri: CYBER_GOLD_VOUCHER_SVG,
    dockFluidShellUri: DOCK_FLUID_SHELL_SVG,
    dockAuroraStreamUri: DOCK_AURORA_STREAM_SVG,
    dockAuroraTopUri: DOCK_AURORA_TOP_SVG,
    dockAuroraBottomUri: DOCK_AURORA_BOTTOM_SVG,
    soundOnIconUri: SOUND_ON_ICON_SVG,
    soundMuteIconUri: SOUND_MUTE_ICON_SVG,
    sceneAmbientIconUri: SCENE_AMBIENT_ICON_SVG,
    extinguishIconUri: EXTINGUISH_ICON_SVG,
    igniteIconUri: IGNITE_ICON_SVG,
    drawCigIconUri: DRAW_CIG_ICON_SVG,
    inhaleIconUri: INHALE_ICON_SVG,
    smokeVfxIconUri: SMOKE_VFX_ICON_SVG,
    ashTapIconUri: ASH_TAP_ICON_SVG,
    giveCigIconUri: GIVE_CIG_ICON_SVG,
    storeIconUri: STORE_SHOP_ICON_SVG,
    leaderboardIconUri: LEADERBOARD_TROPHY_SVG,
    myProfileIconUri: DIGITAL_TWIN_USER_SVG,
    // 导航与屏幕尺寸适配
    statusBarHeight: 44,
    navBarHeight: 44,
    capsuleRightSpace: 100,
    capsuleTop: 50,
    windowWidth: 375,
    windowHeight: 812,

    currentCigarette: DEFAULT_CIGARETTE,
    simulatorState: 'UNLIT', // UNLIT | IDLE_BURNING | INHALING | EXHALING | FINISHED
    isMuted: false,
    ashLength: 0,
    ashProgress: 0,
    ashPercent: 0,
    ashDeg: 0,
    ashProgressStyle: 'background: rgba(255, 255, 255, 0.14);',
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
    shareProgressDeg: 360, // 递烟进度环角度 (预计算防除零/越界)
    smokeEffectType: DEFAULT_SMOKE_EFFECT.id,
    smokeEffectsList: SMOKE_EFFECTS,
    currentSmokeEffect: DEFAULT_SMOKE_EFFECT,
    activeScrollEffectId: '', // 尊享展厅快速定位正在使用的特效卡片
    showSmokeEffectDrawer: false, // 烟雾特工坊 · 尊享展厅
    showSmokeEffectGuide: false, // 💡 首次进入呼吸气泡长按引导 (烟雾特效)
    isGuideFading: false,
    showSceneGuide: false, // 💡 首次进入呼吸气泡长按引导 (抽烟环境)
    isSceneGuideFading: false,
    isBeadPopped: false, // 爆珠是否已捏碎

    // 点火器具工坊
    currentIgnitionTool: IGNITION_TOOLS[0],
    previewIgnitionTool: IGNITION_TOOLS[0],   // 抽屉内预览器具（点小 chip 切换，未必是已装配的）
    activeToolIndex: 0,                       // 3D 画廊 Swiper 当前索引
    isPreviewTesting: false,                  // 正在试火交互动画中
    isZippoLidOpen: false,                    // Zippo 翻盖开合态
    isFidgetActive: false,                    // 持续性手势点火中（如喷枪长按）
    justEquippedAnim: false,                  // 装配成功瞬间微光波纹
    fidgetCount: 0,                           // 掌心累计解压把玩次数（情绪价值勋章）
    ignitionToolsList: IGNITION_TOOLS,        // 器具列表（用于抽屉渲染）
    showIgnitionToolDrawer: false,            // 器具选择抽屉
    showIgniteGuide: false,                   // 💡 长按点燃引导气泡
    isIgniteGuideFading: false,               // 引导气泡渐隐动画标记

    // 统计看板核心数据
    profile: {},
    totalSubstituted: 0,
    totalSavedMoney: '0.00',
    singleStickSavedPrice: '1.25',
    quitDays: 0,

    // 弹窗状态
    isAdEnabled: adConfig.IS_AD_ENABLED,
    showRewardModal: false,
    showGiftModal: false,
    giftCigarette: null,
    giftSenderName: '老哥',

    // 禅意心流 HUD & 桌面小抽屉 & 饮茶润喉
    showZenHud: false,
    zenHudText: '',
    showTeaModal: false,
    teaBadgeText: '',
    teaDescriptionText: '',
    showDeskDrawerModal: false,
    unopenedPacksCount: 1,


    // 🌿 4-7-8 顺顺气静心吐纳空间
    showBreathingSpaceModal: false,
    breathingCompleted: false,
    breathingCycle: 1,
    breathingPhase: 'INHALE', // 'INHALE' | 'HOLD' | 'EXHALE'
    breathingPhaseLabel: '深吸气',
    breathingCountdown: 4,
    breathingGuideQuote: '慢吸气 · 气沉丹田，引清凉入肺腑',

    ashtrayButts: [],
    ashtrayAshFlakes: [],
    ashtrayAshLevel: 0,
    ashtrayAshCount: 0,
    ashtrayBronzeIcon: ASHTRAY_BRONZE_ICON_SVG,
    broomCleanIcon: BROOM_CLEAN_ICON_SVG,
    showAshtrayModal: false,
    showMoodModal: false,
    currentMoodText: '',
    customMoodInput: '',
    isMoodDissolving: false,
    moodPresets: ['琐事心烦', '身心疲惫', '夜深难眠', '放空片刻', '微醺独处', '焦虑紧绷'],
    showAshtraySmoke: false,

    // 结算数据
    lastReward: {
      savedMoney: '1.25',
      tarAvoided: 10,
      lifeRegained: 11,
      inhaleCount: 0,
      durationSeconds: 0
    },
    rewardPunchline: '指间清风过，心头杂念消。'
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
    this._zenHudTimer = null;
    this._isCarLighterHeating = false;
    this._suppressNextTapUntil = 0;

    // 动态精确测算胶囊按钮与安全状态栏
    this.measureSafeArea();

    // 只要登录进入首页即自动签到打卡
    try {
      storageService.recordDailyCheckIn();
    } catch (e) {}

    const savedCigId = storageService.getSelectedCigaretteId();
    let curCig = getCigaretteById(savedCigId) || DEFAULT_CIGARETTE;
    let isReceivedGift = false;
    let giftSender = '老哥';

    // 承接好友递烟礼遇链路 (大厂标准：受赠单支专属品鉴，绝不凭空给整盒，保护名烟珍贵感)
    if (options && options.from === 'give_smoke' && options.cigId) {
      const giftCig = getCigaretteById(options.cigId);
      if (giftCig) {
        curCig = giftCig;
        try {
          giftSender = options.senderName ? decodeURIComponent(options.senderName).replace(/[\r\n\t]/g, '').trim().slice(0, 16) : '老哥';
          if (!giftSender) giftSender = '老哥';
        } catch {
          giftSender = '老哥';
        }
        storageService.setSelectedCigaretteId(giftCig.id);
        // 单支专属品鉴：仅将主吸食位设为 1 支待抽，绝不无脑重置满盒 20 支
        storageService.setHomeStickDigested(true);
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
      smokeEffectType: curSmokeEffect.id,
      ashtrayButts: storageService.getAshtrayButts(),
      ashtrayAshFlakes: (storageService.getAshtrayAsh() || {}).flakes || [],
      ashtrayAshLevel: (storageService.getAshtrayAsh() || {}).level || 0,
      ashtrayAshCount: (storageService.getAshtrayAsh() || {}).count || 0
    });

    this._skipFirstShowRefresh = true;
    this.refreshAllData();
  },

  onShow() {
    this._isNavigating = false;
    // 页面唤醒时同步最新装配的名烟与音效状态
    const savedCigId = storageService.getSelectedCigaretteId();
    const curCig = getCigaretteById(savedCigId) || DEFAULT_CIGARETTE;

    // 每日 00:00 跨天物理法则：保留盒内剩余，晨间新包自动静默入库（零弹窗打扰，自动接收）
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    storageService.checkDailyRefresh(curCig.id, capacity);
    if (storageService.hasPendingMailboxDelivery()) {
      storageService.claimMailboxDelivery();
    }
    const unopenedPacks = storageService.getUnopenedPacksCount();

    const isDifferentCig = this.data.currentCigarette && this.data.currentCigarette.id !== curCig.id;
    let needsRestart = false;
    try {
      needsRestart = !!wx.getStorageSync('SMOKEFREE_NEEDS_RESTART');
      if (needsRestart) wx.removeStorageSync('SMOKEFREE_NEEDS_RESTART');
    } catch (e) {}

    const packRemaining = storageService.getPackCount(curCig.id, curCig.packCapacity || (curCig.isCigar ? 5 : 20));

    const ashtrayButts = storageService.getAshtrayButts();
    const ashtrayAsh = storageService.getAshtrayAsh() || { flakes: [], level: 0, count: 0 };

    if (isDifferentCig || needsRestart) {
      this.setData({
        currentCigarette: curCig,
        currentPackRemaining: packRemaining,
        unopenedPacksCount: unopenedPacks,
        ashtrayButts,
        ashtrayAshFlakes: ashtrayAsh.flakes || [],
        ashtrayAshLevel: ashtrayAsh.level || 0,
        ashtrayAshCount: ashtrayAsh.count || 0,
        shareProgressDeg: this._calcShareProgressDeg(packRemaining, curCig),
        isBeadPopped: false
      });
      // 换烟或抽出新烟：旧烟舍弃，重置为全新未点燃的烟
      if (this.fsm) {
        this.restartCigarette();
      }
    } else {
      this.setData({
        currentPackRemaining: packRemaining,
        unopenedPacksCount: unopenedPacks,
        ashtrayButts,
        ashtrayAshFlakes: ashtrayAsh.flakes || [],
        ashtrayAshLevel: ashtrayAsh.level || 0,
        ashtrayAshCount: ashtrayAsh.count || 0,
        shareProgressDeg: this._calcShareProgressDeg(packRemaining, curCig)
      });
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

    let isDevAdminMode = !!wx.getStorageSync('__DEV_ADMIN_MODE__');
    if (isDevAdminMode) {
      try {
        const accountInfo = wx.getAccountInfoSync ? wx.getAccountInfoSync() : null;
        const envVersion = (accountInfo && accountInfo.miniProgram) ? accountInfo.miniProgram.envVersion : 'release';
        if (envVersion === 'release') {
          isDevAdminMode = false;
          wx.removeStorageSync('__DEV_ADMIN_MODE__');
        }
      } catch (e) {}
    }
    const isVipUser = vipService.isVip();
    const vipTheme = vipService.getVipTheme();
    const devVipInfo = vipService.getVipInfo();
    // 跨天或重新进入首页前台，自动补齐当日签到
    try {
      storageService.recordDailyCheckIn();
    } catch (e) {}
    const totalSubs = storageService.getRecords().length;
    if (this._skipFirstShowRefresh) {
      this._skipFirstShowRefresh = false;
      this.setData({ isVipUser, vipTheme, isDevAdminMode, devVipActive: isVipUser, devVipInfo, totalSubstituted: totalSubs });
    } else {
      const updatePayload = {
        isMuted: audioManager.isMuted(),
        isVipUser,
        vipTheme,
        isDevAdminMode,
        devVipActive: isVipUser,
        devVipInfo,
        totalSubstituted: totalSubs
      };
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
      this.setData(updatePayload);
      audioManager.startAmbientSound(this.data.currentScene);
      this.refreshAllData();
    }

    if (this.canvas && !this.isLoopRunning) {
      this.startRenderLoop();
    }
    const app = typeof getApp === 'function' ? getApp() : null;
    const isShownInSession = (app && app.globalData && app.globalData.hasShownGuideInSession) || this._hasShownGuideInSession;
    
    // 【气泡提示频率控制】生命周期最多总共提示2次，2次之后永久不再显示
    let guideShownCount = 0;
    try {
      guideShownCount = Number(wx.getStorageSync('SMOKEFREE_GUIDE_SHOWN_COUNT') || 0);
    } catch (e) {}

    const canShowGuide = !isShownInSession && guideShownCount < 2;

    if (canShowGuide) {
      if (app && app.globalData) {
        app.globalData.hasShownGuideInSession = true;
      }
      this._hasShownGuideInSession = true;

      // 累计提示次数写入本地持久化存储
      try {
        wx.setStorageSync('SMOKEFREE_GUIDE_SHOWN_COUNT', guideShownCount + 1);
      } catch (e) {}

      this.checkSmokeGuide();
      this.checkSceneGuide();
      this.checkIgniteGuide();  // 💡 点燃引导（长按换器具）
    } else {
      // 已经达到2次上限，或本次启动会话已提示过：坚决不再提示长按，并强制清理隐藏气泡
      this._clearGuideTimers();
      this.setData({
        showSmokeEffectGuide: false,
        showSceneGuide: false,
        showIgniteGuide: false,      // 点燃引导同步清除
        isGuideFading: false,
        isSceneGuideFading: false,
        isIgniteGuideFading: false
      });
    }

    /* ==================== [DEV_ADMIN_TEST] 调试指令检测 (可随时安全删除) ==================== */
    this._checkDevAdminPendingAction();
    /* ==================== [DEV_ADMIN_TEST] 结束 ==================== */
  },

  /* ==========================================================================
   * [DEV_ADMIN_TEST] 调试仿真指令检测与应用 (可整块安全删除)
   * ========================================================================== */
  _checkDevAdminPendingAction() {
    try {
      const devAction = wx.getStorageSync('__DEV_PENDING_ACTION__');
      if (!devAction) return;
      wx.removeStorageSync('__DEV_PENDING_ACTION__');

      if (devAction.type === 'SET_PROGRESS') {
        if (this.fsm) {
          this.fsm.state = devAction.state || 'IDLE_BURNING';
          const p = typeof devAction.progress === 'number' ? devAction.progress : 0.10;
          this.fsm.cigaretteProgress = p;
          this.fsm.lastTapProgress = 1.0;
          this.fsm.ashRatio = typeof devAction.ashRatio === 'number' ? devAction.ashRatio : (1.0 - p);
          const isLit = this.fsm.state !== 'UNLIT' && this.fsm.state !== 'FINISHED';
          this.setData({
            isLit,
            simulatorState: this.fsm.state,
            cigaretteProgress: this.fsm.cigaretteProgress,
            ashRatio: this.fsm.ashRatio,
            isBeadPopped: devAction.isBeadPopped !== undefined ? devAction.isBeadPopped : this.data.isBeadPopped
          });
          if (devAction.msg) {
            toast.flame(devAction.msg);
          }
        }
      } else if (devAction.type === 'POP_BEAD') {
        this.popBead();
      } else if (devAction.type === 'RESET_BEAD') {
        this.setData({ isBeadPopped: false });
        if (devAction.msg) toast.info(devAction.msg);
      } else if (devAction.type === 'FINISH_SMOKE') {
        if (this.fsm) {
          this.fsm.state = 'FINISHED';
          this.fsm.cigaretteProgress = 0.0;
          this.fsm.ashRatio = 0.0;
          this.handleSmokingFinished();
        }
      } else if (devAction.type === 'TAP_ASH') {
        if (this.fsm) {
          this.fsm.ashRatio = 0.0;
          this.ashTapStartTime = Date.now();
          triggerHaptic('light');
          this.setData({ ashRatio: 0.0 });
          if (devAction.msg) toast.info(devAction.msg);
        }
      }
    } catch (e) {
      console.warn('[DEV_ADMIN_TEST] check error', e);
    }
  },

  openAdminTest() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('medium');
    const isVip = vipService.isVip();
    const vipInfo = vipService.getVipInfo();
    const curCigId = this.data.currentCigarette ? this.data.currentCigarette.id : DEFAULT_CIGARETTE.id;
    const curCount = storageService.getPackCount(curCigId, 20);
    const profile = storageService.getProfile();
    const records = storageService.getRecords();
    const quitDays = calculateQuitDays(profile.quitStartDate);
    const dailySmoked = storageService.getDailySmokedCount();
    this.setData({
      showAdminTestModal: true,
      devVipActive: isVip,
      devVipInfo: vipInfo,
      currentPackRemaining: curCount,
      devQuitDays: quitDays,
      devTotalSubs: records.length,
      devDailySmokedCount: dailySmoked
    });
  },

  closeAdminTest() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.setData({ showAdminTestModal: false });
  },

  devSetSmokeProgress90() {
    triggerHaptic('heavy');
    if (this.fsm) {
      this.fsm.state = 'IDLE_BURNING';
      this.fsm.cigaretteProgress = 0.10;
      this.fsm.lastTapProgress = 1.0; // 维持自上次未弹灰以来的燃烧差值，确保后续帧不被归零
      this.fsm.ashRatio = 0.90;
      const ashDeg = Math.round(0.90 * 360);
      const midDeg = Math.round(ashDeg * 0.45);
      const ashProgressStyle = `background: conic-gradient(#fbbf24 0deg, #f59e0b ${midDeg}deg, #ef4444 ${ashDeg}deg, rgba(255, 255, 255, 0.14) ${ashDeg}deg 360deg);`;
      this.setData({
        isLit: true,
        simulatorState: 'IDLE_BURNING',
        cigaretteProgress: 0.10,
        ashRatio: 0.90,
        ashDeg,
        ashProgressStyle
      });
      toast.flame('🔥 进度已设为 90% (保留90%厚灰柱，请在桌面轻触弹灰)！');
    }
  },

  devSetSmokeProgress50() {
    triggerHaptic('medium');
    if (this.fsm) {
      this.fsm.state = 'IDLE_BURNING';
      this.fsm.cigaretteProgress = 0.50;
      this.fsm.lastTapProgress = 1.0;
      this.fsm.ashRatio = 0.50;
      const ashDeg = Math.round(0.50 * 360);
      const midDeg = Math.round(ashDeg * 0.6);
      const ashProgressStyle = `background: conic-gradient(#fbbf24 0deg, #f59e0b ${midDeg}deg, #f97316 ${ashDeg}deg, rgba(255, 255, 255, 0.14) ${ashDeg}deg 360deg);`;
      this.setData({
        isLit: true,
        simulatorState: 'IDLE_BURNING',
        cigaretteProgress: 0.50,
        ashRatio: 0.50,
        ashDeg,
        ashProgressStyle
      });
      toast.flame('🔥 进度已设为 50% (保留50%中段灰，可自行弹灰)！');
    }
  },

  devSetSmokeProgress10() {
    triggerHaptic('light');
    if (this.fsm) {
      this.fsm.state = 'IDLE_BURNING';
      this.fsm.cigaretteProgress = 0.90;
      this.fsm.lastTapProgress = 1.0;
      this.fsm.ashRatio = 0.10;
      const ashDeg = Math.round(0.10 * 360);
      const midDeg = Math.round(ashDeg * 0.6);
      const ashProgressStyle = `background: conic-gradient(#fbbf24 0deg, #f59e0b ${midDeg}deg, #f97316 ${ashDeg}deg, rgba(255, 255, 255, 0.14) ${ashDeg}deg 360deg);`;
      this.setData({
        isLit: true,
        simulatorState: 'IDLE_BURNING',
        cigaretteProgress: 0.90,
        ashRatio: 0.10,
        ashDeg,
        ashProgressStyle
      });
      toast.flame('🔥 进度已设为 10% (刚抽两口，保留10%轻灰)！');
    }
  },

  devSetSmokeAsh100() {
    triggerHaptic('heavy');
    if (this.fsm) {
      this.fsm.ashRatio = 1.0;
      this.fsm.lastTapProgress = Math.min(1.0, this.fsm.cigaretteProgress + 1.0);
      const ashDeg = 360;
      const ashProgressStyle = `background: conic-gradient(#fbbf24 0deg, #f59e0b 160deg, #ef4444 360deg);`;
      this.setData({
        ashRatio: 1.0,
        ashDeg,
        ashProgressStyle
      });
      toast.flame('💨 烟灰已拉满 100% (满灰危悬，请立即弹灰)！');
    }
  },

  devInhaleOnce() {
    triggerHaptic('heavy');
    if (this.fsm) {
      if (this.data.simulatorState === 'UNLIT' || this.data.simulatorState === 'FINISHED') {
        this.triggerIgnite();
      }
      this.fsm.startInhale();
      this.setData({ simulatorState: 'INHALING' });
      toast.flame('💨 沉浸深吸中... (凝聚呼吸暗角)');
      setTimeout(() => {
        if (this.fsm && this.fsm.state === 'INHALING') {
          this.fsm.stopInhale();
          this.setData({ simulatorState: 'EXHALING' });
          setTimeout(() => {
            if (this.fsm && this.fsm.state === 'EXHALING') {
              this.fsm.finishExhale();
              this.setData({ simulatorState: 'IDLE_BURNING' });
            }
          }, 1800);
        }
      }, 2000);
    }
  },

  devResetFullSmoke() {
    triggerHaptic('medium');
    if (this.fsm) {
      this.restartCigarette();
      toast.success('✨ 烟支已恢复 100% 全新满长！');
    }
  },

  devIgniteNow() {
    triggerHaptic('heavy');
    if (this.data.simulatorState === 'UNLIT' || this.data.simulatorState === 'FINISHED') {
      this.triggerIgnite();
      toast.flame('🔥 烟支已点燃！');
    } else {
      toast.info('烟支已处于点燃状态');
    }
  },

  devExtinguishNow() {
    triggerHaptic('medium');
    this.extinguishCigarette();
    toast.info('💨 烟支已掐灭！');
  },

  devTapAshNow() {
    triggerHaptic('light');
    this.manualTapAsh();
    toast.info('💨 烟灰已弹落清空！');
  },

  devToggleBead() {
    triggerHaptic('heavy');
    if (this.data.isBeadPopped) {
      this.setData({ isBeadPopped: false });
      toast.info('🔮 爆珠已复原！');
    } else {
      this.popBead();
      toast.flame('🔮 爆珠已捏破！');
    }
  },

  devFinishSmokeNow() {
    triggerHaptic('heavy');
    if (this.fsm) {
      this.fsm.state = 'FINISHED';
      this.fsm.cigaretteProgress = 0.0;
      this.fsm.ashRatio = 0.0;
      this.handleSmokingFinished();
      this.setData({ showAdminTestModal: false });
    }
  },

  devRefillCurrentPack() {
    triggerHaptic('medium');
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    storageService.setPackCount(curCig.id, capacity);
    this.setData({
      currentPackRemaining: capacity,
      shareProgressDeg: 360
    });
    toast.success(`📦 当前【${curCig.name}】烟盒已补满（${capacity}支）！`);
  },

  devRefillAllPacks() {
    triggerHaptic('heavy');
    CIGARETTE_CATALOG.forEach(c => {
      const cap = c.packCapacity || (c.isCigar ? 5 : 20);
      storageService.setPackCount(c.id, cap);
    });
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    this.setData({
      currentPackRemaining: capacity,
      shareProgressDeg: 360
    });
    toast.success('📦 全馆 37 款名烟烟盒已全部补满！');
  },

  devSetCurrentPack0() {
    triggerHaptic('light');
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    storageService.setPackCount(curCig.id, 0);
    this.setData({
      currentPackRemaining: 0,
      shareProgressDeg: 0
    });
    toast.info('📦 当前烟盒已清空（0支，可测试抽空提示）');
  },

  devActivateVipLifetime() {
    triggerHaptic('heavy');
    vipService.activateTier('lifetime');
    const isVip = vipService.isVip();
    const vipInfo = vipService.getVipInfo();
    const vipTheme = vipService.getVipTheme();
    this.setData({
      isVipUser: isVip,
      vipTheme,
      devVipActive: isVip,
      devVipInfo: vipInfo
    });
    toast.flame('👑 已激活【至尊永久卡】终身免广与黑金荣耀！');
  },

  devActivateVipMonth() {
    triggerHaptic('heavy');
    vipService.activateTier('month');
    const isVip = vipService.isVip();
    const vipInfo = vipService.getVipInfo();
    const vipTheme = vipService.getVipTheme();
    this.setData({
      isVipUser: isVip,
      vipTheme,
      devVipActive: isVip,
      devVipInfo: vipInfo
    });
    toast.success('👑 已激活【30天月卡】特权！');
  },

  devActivateVipDay() {
    triggerHaptic('medium');
    vipService.activateTier('day');
    const isVip = vipService.isVip();
    const vipInfo = vipService.getVipInfo();
    const vipTheme = vipService.getVipTheme();
    this.setData({
      isVipUser: isVip,
      vipTheme,
      devVipActive: isVip,
      devVipInfo: vipInfo
    });
    toast.flame('✨ 已激活【24小时畅玩日卡】！');
  },

  devExpireVipNow() {
    triggerHaptic('medium');
    const expiredData = {
      isVip: false,
      tierId: 'month',
      tierName: '尊享月卡',
      customTheme: 'month',
      activatedAt: Date.now() - 31 * 86400000,
      expireTime: Date.now() - 1000,
      isLifetime: false
    };
    try {
      wx.setStorageSync('JUST_ONE_SMOKE_VIP_INFO_V1', expiredData);
    } catch (err) {}
    const isVip = vipService.isVip();
    const vipInfo = vipService.getVipInfo();
    this.setData({
      isVipUser: isVip,
      vipTheme: '',
      devVipActive: isVip,
      devVipInfo: vipInfo
    });
    toast.info('⚠️ VIP 状态已模拟设置为【刚过期1秒】！');
  },

  devClearVip() {
    triggerHaptic('medium');
    vipService.clearVip();
    const isVip = vipService.isVip();
    const vipInfo = vipService.getVipInfo();
    const vipTheme = vipService.getVipTheme();
    this.setData({
      isVipUser: isVip,
      vipTheme,
      devVipActive: isVip,
      devVipInfo: vipInfo
    });
    toast.info('👑 已恢复非VIP普通用户状态');
  },

  // 打卡天数与时间测试
  devAddQuitDays(e) {
    const days = Number(e.currentTarget.dataset.days) || 1;
    triggerHaptic('medium');
    const p = storageService.getProfile();
    const curStart = p.quitStartDate ? new Date(p.quitStartDate).getTime() : Date.now();
    const newStart = curStart - days * 86400000;
    storageService.updateProfile({ quitStartDate: newStart });
    this.refreshAllData();
    const profile = storageService.getProfile();
    const quitDays = calculateQuitDays(profile.quitStartDate);
    this.setData({
      devQuitDays: quitDays
    });
    toast.success(`📅 打卡天数已 +${days} 天（当前第 ${quitDays + 1} 天）！`);
  },

  devSetQuitDays(e) {
    const days = Number(e.currentTarget.dataset.days) || 1;
    triggerHaptic('medium');
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const newStart = midnight - Math.max(0, days - 1) * 86400000;
    storageService.updateProfile({ quitStartDate: newStart });
    this.refreshAllData();
    const profile = storageService.getProfile();
    const quitDays = calculateQuitDays(profile.quitStartDate);
    this.setData({
      devQuitDays: quitDays
    });
    toast.success(`📅 打卡已重设为第 ${days} 天！`);
  },

  // 替烟记录与健康图表
  devAddRecords(e) {
    const count = Number(e.currentTarget.dataset.count) || 1;
    triggerHaptic('medium');
    const curCigId = this.data.currentCigarette ? this.data.currentCigarette.id : DEFAULT_CIGARETTE.id;
    for (let i = 0; i < count; i++) {
      storageService.addRecord({
        id: `sub_dev_${Date.now()}_${i}`,
        timestamp: Date.now() - i * 60000,
        cigaretteId: curCigId,
        durationSeconds: 180,
        inhaleCount: 12
      });
    }
    this.refreshAllData();
    this._checkAndUnlockAchievements();
    const records = storageService.getRecords();
    this.setData({ devTotalSubs: records.length });
    toast.success(`📊 替烟记录已累加 +${count} 支（累计 ${records.length} 支）！`);
  },

  devSetTotalRecords(e) {
    const target = Number(e.currentTarget.dataset.count) || 60;
    triggerHaptic('heavy');
    const curCigId = this.data.currentCigarette ? this.data.currentCigarette.id : DEFAULT_CIGARETTE.id;
    const records = [];
    const now = Date.now();
    for (let i = 0; i < target; i++) {
      const offsetMs = Math.floor((i / target) * 7 * 86400000);
      records.push({
        id: `sub_dev_batch_${now}_${i}`,
        timestamp: now - offsetMs,
        cigaretteId: curCigId,
        durationSeconds: 180,
        inhaleCount: 12
      });
    }
    try {
      wx.setStorageSync('SMOKEFREE_RECORDS', records);
    } catch (err) {}
    this.refreshAllData();
    this._checkAndUnlockAchievements();
    this.setData({ devTotalSubs: target });
    toast.flame(`📊 累计替烟已重设为 ${target} 支！`);
  },

  devFill7DaysTrends() {
    triggerHaptic('heavy');
    const curCigId = this.data.currentCigarette ? this.data.currentCigarette.id : DEFAULT_CIGARETTE.id;
    const records = [];
    const now = new Date();
    for (let day = 6; day >= 0; day--) {
      const targetDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 12, 0, 0);
      const countForDay = Math.floor(Math.random() * 9) + 8;
      for (let k = 0; k < countForDay; k++) {
        records.push({
          id: `sub_dev_trend_${targetDay.getTime()}_${k}`,
          timestamp: targetDay.getTime() + k * 1800000,
          cigaretteId: curCigId,
          durationSeconds: 180,
          inhaleCount: 12
        });
      }
    }
    try {
      wx.setStorageSync('SMOKEFREE_RECORDS', records);
    } catch (err) {}
    this.refreshAllData();
    this._checkAndUnlockAchievements();
    const allRecords = storageService.getRecords();
    this.setData({ devTotalSubs: allRecords.length });
    toast.flame('✨ 已填充近 7 天真实替烟趋势与折线图！');
  },

  devClearRecords() {
    triggerHaptic('medium');
    try {
      wx.setStorageSync('SMOKEFREE_RECORDS', []);
    } catch (err) {}
    this.refreshAllData();
    this.setData({ devTotalSubs: 0 });
    toast.info('📊 已清空全部替烟历史（0支）！');
  },

  devSetCurrentPackCount(e) {
    const count = Number(e.currentTarget.dataset.count) || 0;
    triggerHaptic('medium');
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    storageService.setPackCount(curCig.id, count);
    const deg = this._calcShareProgressDeg(count, curCig);
    this.setData({
      currentPackRemaining: count,
      shareProgressDeg: deg
    });
    toast.info(`📦 当前【${curCig.name}】余量已设为 ${count} 支！`);
  },

  devUnlockAllCigarettes() {
    triggerHaptic('heavy');
    const allIds = CIGARETTE_CATALOG.map(c => c.id);
    storageService.setUnlockedCigarettes(allIds);
    toast.success('🌟 全馆 37 款名烟与雪茄已全部解锁！');
  },

  devLockAllCigarettes() {
    triggerHaptic('medium');
    try {
      wx.setStorageSync('SMOKEFREE_CUSTOM_UNLOCKED_CIGARETTES', []);
    } catch (err) {}
    toast.info('🔒 已锁定全部名烟，仅保留默认款！');
  },

  devUnlockAllSmokeEffects() {
    triggerHaptic('heavy');
    const allIds = SMOKE_EFFECTS.map(s => s.id);
    storageService.setUnlockedSmokeEffects(allIds);
    toast.success('🌟 全套 6 款殿堂级烟雾特效已全部解锁！');
  },

  devLockAllSmokeEffects() {
    triggerHaptic('medium');
    try {
      wx.setStorageSync('SMOKEFREE_SUMMONED_SMOKE_EFFECTS', []);
    } catch (err) {}
    toast.info('🔒 已重置烟雾特效，仅保留经典空灵烟圈！');
  },

  devUnlockAllAchievements() {
    triggerHaptic('heavy');
    if (Array.isArray(ACHIEVEMENTS)) {
      const allAchIds = ACHIEVEMENTS.map(a => a.id);
      storageService.saveUnlockedAchievements(allAchIds);
      storageService.setEquippedTitle('无烟圣尊');
    }
    this.refreshAllData();
    toast.flame('👑 全部 16 阶成就已点亮！已佩戴最高称号【无烟圣尊】！');
  },

  devShowDataSnapshot() {
    triggerHaptic('light');
    const p = storageService.getProfile();
    const records = storageService.getRecords();
    const vip = vipService.getVipInfo();
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const packCount = storageService.getPackCount(curCig.id, 20);
    const snap = {
      戒烟天数: calculateQuitDays(p.quitStartDate),
      累计替烟: records.length,
      VIP状态: vip.isVip ? (vip.isLifetime ? '至尊永久' : vip.tierName) : '非VIP',
      当前装配烟: curCig.name,
      当前盒余量: `${packCount}支`,
      烟价基准: `¥${p.packPrice}/盒`,
      日均抽吸: `${p.cigsPerDay}支`
    };
    wx.showModal({
      title: '当前本地业务数据快照',
      content: JSON.stringify(snap, null, 2),
      showCancel: false,
      confirmText: '已知晓'
    });
  },

  devResetAllStorage() {
    wx.showModal({
      title: '⚠️ 恢复出厂设置确认',
      content: '此操作将清空所有本地测试缓存（打卡、替烟、VIP、烟盒等），恢复至全新安装状态。确定继续吗？',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
          } catch (e) {}
          toast.info('已清空所有本地数据，正在重载...');
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/index/index' });
          }, 600);
        }
      }
    });
  },

  /* ==================== [DEV_ADMIN_TEST] 快捷长按唤醒 ==================== */
  devQuickUnlockAdmin() {
    // 生产环境 (release) 严格封禁测试入口，彻底防范审核与线上风险
    try {
      const accountInfo = wx.getAccountInfoSync ? wx.getAccountInfoSync() : null;
      const envVersion = (accountInfo && accountInfo.miniProgram) ? accountInfo.miniProgram.envVersion : 'release';
      if (envVersion === 'release') {
        return;
      }
    } catch (e) {}

    triggerHaptic('celebration');
    wx.setStorageSync('__DEV_ADMIN_MODE__', true);
    this.setData({ isDevAdminMode: true });
    toast.flame('🛠️ 管理员极速测试已唤醒！');
    this.openAdminTest();
  },

  /* ==================== 🍂 1. 心绪便笺 · 随烟散尽与赛博贤者时刻 ==================== */
  devSetMoodNote(e) {
    const mood = (e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.mood) || '身心疲惫';
    triggerHaptic('light');
    this.setData({
      currentMoodText: mood,
      showMoodModal: false
    });
    toast.flame(`【${mood}】已入笺 · 吸烟时随青烟散尽`);
  },

  devTestMoodDissolveAndFinish() {
    triggerHaptic('heavy');
    const mood = this.data.currentMoodText || '烦恼琐事';
    this.setData({
      currentMoodText: mood,
      isMoodDissolving: true,
      showAdminTestModal: false
    });
    toast.flame(`【${mood}】随青烟消散升华中...`);
    setTimeout(() => {
      if (this.fsm) {
        this.fsm.state = 'FINISHED';
        this.fsm.cigaretteProgress = 0.0;
        this.fsm.ashRatio = 0.0;
        this.handleSmokingFinished();
      }
    }, 1200);
  },

  devClearMoodNote() {
    triggerHaptic('light');
    this.setData({
      currentMoodText: '',
      isMoodDissolving: false,
      showMoodModal: false
    });
    toast.info('心绪笺已重归纯净');
  },

  /* ==================== 🍵 2. 桌面微距烟灰缸与物理沉淀留存 ==================== */
  devFillAshtrayWithButts() {
    triggerHaptic('heavy');
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const mockButts = [
      { id: `b_dev_${Date.now()}_1`, filterColor: curCig.filterColor || '#ca8a04', extinguishedAt: Date.now() - 3600000 },
      { id: `b_dev_${Date.now()}_2`, filterColor: '#1e293b', extinguishedAt: Date.now() - 2400000 },
      { id: `b_dev_${Date.now()}_3`, filterColor: '#e0e7ff', extinguishedAt: Date.now() - 1800000 },
      { id: `b_dev_${Date.now()}_4`, filterColor: '#f59e0b', extinguishedAt: Date.now() - 900000 },
      { id: `b_dev_${Date.now()}_5`, filterColor: curCig.filterColor || '#ca8a04', extinguishedAt: Date.now() }
    ];
    try {
      wx.setStorageSync('SMOKEFREE_ASHTRAY_BUTTS_LIST', mockButts);
    } catch (e) {}

    const mockFlakes = [
      { id: 'f1', x: 28, y: 32, size: 10, opacity: 0.75, rot: 42, color: '#475569' },
      { id: 'f2', x: 55, y: 40, size: 14, opacity: 0.85, rot: 115, color: '#334155' },
      { id: 'f3', x: 72, y: 60, size: 8, opacity: 0.65, rot: 75, color: '#64748b' },
      { id: 'f4', x: 38, y: 70, size: 12, opacity: 0.8, rot: 190, color: '#1e293b' },
      { id: 'f5', x: 62, y: 25, size: 9, opacity: 0.7, rot: 250, color: '#475569' }
    ];
    const mockAsh = { count: 8, level: 85, flakes: mockFlakes };
    try {
      wx.setStorageSync('SMOKEFREE_ASHTRAY_ASH_DATA', mockAsh);
    } catch (e) {}

    this.setData({
      ashtrayButts: mockButts,
      ashtrayAshFlakes: mockFlakes,
      ashtrayAshLevel: 85,
      showAshtraySmoke: true
    });
    toast.flame('🍵 烟灰缸已沉淀 5 根烟蒂 + 85% 积灰 + 余温青烟！');
  },

  devAddAshtrayButt1() {
    triggerHaptic('light');
    const colors = ['#ca8a04', '#9333ea', '#d97706', '#dc2626', '#2563eb', '#16a34a', '#e0e7ff', '#f59e0b'];
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const updatedButts = storageService.addAshtrayButt({
      cigaretteId: curCig.id || 'default',
      cigaretteName: curCig.name || '经典香烟',
      filterColor: color,
      paperColor: '#fffdf5',
      savedMoney: '1.25',
      timestamp: Date.now()
    });
    this.setData({
      ashtrayButts: updatedButts,
      showAshtraySmoke: true
    });
    toast.flame(`🍵 缸内烟蒂 +1 (现存 ${updatedButts.length} 支)！`);
  },

  devAddAshtrayButt10() {
    triggerHaptic('medium');
    const colors = ['#ca8a04', '#9333ea', '#d97706', '#dc2626', '#2563eb', '#16a34a', '#e0e7ff', '#f59e0b'];
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    let updatedButts = this.data.ashtrayButts || [];
    const now = Date.now();
    for (let i = 0; i < 10; i++) {
      updatedButts = storageService.addAshtrayButt({
        cigaretteId: curCig.id || 'default',
        cigaretteName: curCig.name || '经典香烟',
        filterColor: colors[(updatedButts.length + i) % colors.length],
        paperColor: '#fffdf5',
        savedMoney: '1.25',
        timestamp: now + i * 10
      });
    }
    this.setData({
      ashtrayButts: updatedButts,
      showAshtraySmoke: true
    });
    toast.flame(`🍵 缸内烟蒂 +10 (现存 ${updatedButts.length} 支，层叠可见)！`);
  },

  devFill20Butts() {
    triggerHaptic('medium');
    const colors = ['#ca8a04', '#9333ea', '#d97706', '#dc2626', '#2563eb', '#16a34a', '#e0e7ff', '#f59e0b'];
    const mockButts = [];
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      mockButts.push({
        id: `b_dev20_${now}_${i}`,
        filterColor: colors[i % colors.length],
        extinguishedAt: now - (20 - i) * 600000
      });
    }
    try {
      wx.setStorageSync('SMOKEFREE_ASHTRAY_BUTTS_LIST', mockButts);
    } catch (e) {}

    const mockFlakes = [];
    for (let f = 0; f < 30; f++) {
      const r = Math.random() * 22;
      const theta = Math.random() * 2 * Math.PI;
      mockFlakes.push({
        id: `f_dev_${now}_${f}`,
        x: Math.round(36 + r * Math.cos(theta)),
        y: Math.round(36 + r * Math.sin(theta)),
        size: (Math.random() * 4 + 3).toFixed(1),
        opacity: (Math.random() * 0.4 + 0.55).toFixed(2),
        rot: Math.round(Math.random() * 360),
        color: Math.random() > 0.4 ? '#262626' : '#71717a'
      });
    }
    const mockAsh = { count: 20, level: 240, flakes: mockFlakes };
    try {
      wx.setStorageSync('SMOKEFREE_ASHTRAY_ASH_DATA', mockAsh);
    } catch (e) {}

    this.setData({
      ashtrayButts: mockButts,
      ashtrayAshFlakes: mockFlakes,
      ashtrayAshLevel: 240,
      ashtrayAshCount: 20,
      showAshtraySmoke: true
    });
    toast.flame('🍵 烟灰缸已沉淀整包 20 根烟蒂 + 240% 余灰！');
  },

  devFill50Butts() {
    triggerHaptic('heavy');
    const colors = ['#ca8a04', '#9333ea', '#d97706', '#dc2626', '#2563eb', '#16a34a', '#e0e7ff', '#f59e0b', '#71717a'];
    const mockButts = [];
    const now = Date.now();
    for (let i = 0; i < 50; i++) {
      mockButts.push({
        id: `b_dev50_${now}_${i}`,
        filterColor: colors[i % colors.length],
        extinguishedAt: now - (50 - i) * 300000
      });
    }
    try {
      wx.setStorageSync('SMOKEFREE_ASHTRAY_BUTTS_LIST', mockButts);
    } catch (e) {}

    const mockFlakes = [];
    for (let f = 0; f < 50; f++) {
      const r = Math.random() * 24;
      const theta = Math.random() * 2 * Math.PI;
      mockFlakes.push({
        id: `f_dev50_${now}_${f}`,
        x: Math.round(36 + r * Math.cos(theta)),
        y: Math.round(36 + r * Math.sin(theta)),
        size: (Math.random() * 4.5 + 3).toFixed(1),
        opacity: (Math.random() * 0.45 + 0.55).toFixed(2),
        rot: Math.round(Math.random() * 360),
        color: Math.random() > 0.4 ? '#262626' : '#71717a'
      });
    }
    const mockAsh = { count: 50, level: 360, flakes: mockFlakes };
    try {
      wx.setStorageSync('SMOKEFREE_ASHTRAY_ASH_DATA', mockAsh);
    } catch (e) {}

    this.setData({
      ashtrayButts: mockButts,
      ashtrayAshFlakes: mockFlakes,
      ashtrayAshLevel: 360,
      ashtrayAshCount: 50,
      showAshtraySmoke: true
    });
    toast.flame('🍵 烟灰缸已沉淀 50 根烟蒂 + 360% 厚积余灰！');
  },

  devAddAshtrayAsh1() {
    triggerHaptic('light');
    const updatedAsh = storageService.addAshtrayAsh(1);
    this.setData({
      ashtrayAshFlakes: updatedAsh.flakes || [],
      ashtrayAshLevel: updatedAsh.level || 0,
      ashtrayAshCount: updatedAsh.count || 0
    });
    toast.info(`💨 缸内烟灰 +1 (厚度 ${updatedAsh.level}% · ${updatedAsh.flakes.length}处灰屑)！`);
  },

  devAddAshtrayAsh10() {
    triggerHaptic('medium');
    const updatedAsh = storageService.addAshtrayAsh(10);
    this.setData({
      ashtrayAshFlakes: updatedAsh.flakes || [],
      ashtrayAshLevel: updatedAsh.level || 0,
      ashtrayAshCount: updatedAsh.count || 0
    });
    toast.flame(`💨 缸内烟灰 +10 (厚度 ${updatedAsh.level}% · 密集散落)！`);
  },

  devSetAshtrayAsh100() {
    triggerHaptic('medium');
    const ash = storageService.getAshtrayAsh();
    ash.level = 100;
    try {
      wx.setStorageSync('SMOKEFREE_ASHTRAY_ASH_DATA', ash);
    } catch (e) {}
    this.setData({
      ashtrayAshLevel: 100
    });
    toast.info('💨 缸内余灰厚度已设为 100%！');
  },

  devSetAshtrayAsh300() {
    triggerHaptic('heavy');
    const ash = storageService.getAshtrayAsh();
    ash.level = 300;
    try {
      wx.setStorageSync('SMOKEFREE_ASHTRAY_ASH_DATA', ash);
    } catch (e) {}
    this.setData({
      ashtrayAshLevel: 300
    });
    toast.flame('💨 缸内余灰厚度已设为 300% (极厚积存)！');
  },

  devSwitchIgnitionTool(e) {
    const toolId = e.currentTarget.dataset.tool;
    if (!toolId) return;
    storageService.setSelectedIgnitionTool(toolId);
    const activeTool = getActiveIgnitionTool();
    this.setData({ currentIgnitionTool: activeTool });
    triggerHaptic('medium');
    audioManager.playIgnitionToolSound(toolId);
    toast.flame(`🔥 已换用点火器具：【${activeTool.name}】！`);
  },

  devTriggerZenToast() {
    triggerHaptic('medium');
    this.setData({
      showZenHud: true,
      zenHudText: '今日第 3 支 · 节余 ¥3.75 · 焦油减免 30.0mg'
    });
    if (this._zenHudTimer) clearTimeout(this._zenHudTimer);
    this._zenHudTimer = setTimeout(() => {
      this.setData({ showZenHud: false });
    }, 6000);
    toast.flame('🌿 赛博灵动岛 HUD 贤者胶囊已在顶部升起！');
  },

  devTapAshIntoTray() {
    triggerHaptic('light');
    this.manualTapAsh();
    const updatedAsh = storageService.addAshtrayAsh(1);
    this.setData({
      ashtrayAshFlakes: updatedAsh.flakes || [],
      ashtrayAshLevel: updatedAsh.level || 0,
      ashtrayAshCount: updatedAsh.count || 0
    });
    toast.info(`💨 烟灰已弹落，厚度 ${updatedAsh.level}%！`);
  },

  devClearAshtrayTray() {
    triggerHaptic('medium');
    storageService.clearAshtray();
    this.setData({
      ashtrayButts: [],
      ashtrayAshFlakes: [],
      ashtrayAshLevel: 0,
      ashtrayAshCount: 0,
      showAshtraySmoke: false
    });
    toast.success('✨ 烟灰缸已倾倒刷净，桌面复原雅洁！');
  },

  devToggleAshtraySmoke() {
    triggerHaptic('light');
    const next = !this.data.showAshtraySmoke;
    this.setData({ showAshtraySmoke: next });
    toast.info(next ? '🌫️ 烟灰缸余温青烟：已开启' : '🌫️ 烟灰缸余温青烟：已平息');
  },

  /* ==================== 🗄️ 3. 空盒应急闭环与桌面抽屉 ==================== */
  devOpenDeskDrawer() {
    triggerHaptic('medium');
    this.setData({
      showDeskDrawerModal: true,
      unopenedPacksCount: storageService.getUnopenedPacksCount(),
      showAdminTestModal: false
    });
    toast.info('🗄️ 已拉出桌面应急抽屉！');
  },

  devTriggerZenBreathing() {
    triggerHaptic('light');
    this.setData({ showAdminTestModal: false });
    this.openBreathingSpace();
  },

  devAddUnopenedPack(e) {
    const delta = Number(e.currentTarget.dataset.delta) || 1;
    triggerHaptic('medium');
    if (delta > 0) {
      storageService.addUnopenedPack(delta);
    } else {
      try {
        wx.setStorageSync('SMOKEFREE_UNOPENED_PACKS_COUNT', 0);
      } catch (err) {}
    }
    const current = storageService.getUnopenedPacksCount();
    this.setData({ unopenedPacksCount: current });
    toast.info(`📦 抽屉未拆新包存量已设为：${current} 包！`);
  },

  /* ==================== 🍵 4. 40支生理阻尼 · 饮茶润喉模式 ==================== */
  devTriggerTeaModal() {
    triggerHaptic('medium');
    this.setData({
      showTeaModal: true,
      showAdminTestModal: false
    });
    toast.flame('🍵 40支生理阻尼【饮茶润喉】模态框已唤出！');
  },

  devResetTeaDamping() {
    triggerHaptic('light');
    this.setData({ showTeaModal: false });
    toast.info('🍃 饮茶润喉阻尼状态已解除');
  },

  devAddDailySmoked10() {
    triggerHaptic('heavy');
    const newCount = storageService.addDailySmokedCount(10);
    this.setData({
      devDailySmokedCount: newCount
    });
    // 如果达到或超过 40 支阈值，触发饮茶润喉阻尼
    if (newCount >= 40) {
      this.setData({ showTeaModal: true, showAdminTestModal: false });
      audioManager.playZenChimeSound(440);
      toast.flame(`⚡ 今日吸烟已累计 +10（达 ${newCount} 支，触发健康阻尼！）`);
    } else {
      toast.flame(`⚡ 今日吸烟累计 +10（当前今日共: ${newCount} 支）`);
    }
  },

  devSetDailySmoked40() {
    triggerHaptic('heavy');
    const cur = storageService.getDailySmokedCount();
    const delta = Math.max(0, 40 - cur);
    const newCount = storageService.addDailySmokedCount(delta);
    this.setData({
      devDailySmokedCount: newCount,
      showTeaModal: true,
      showAdminTestModal: false
    });
    audioManager.playZenChimeSound(440);
    toast.flame('🍵 今日吸烟已直达 40 支上限！已唤出饮茶润喉阻尼！');
  },

  devClearDailySmoked() {
    triggerHaptic('light');
    const today = storageService.getTodayDateKey();
    try {
      wx.setStorageSync('SMOKEFREE_DAILY_SMOKE_COUNT', { date: today, count: 0 });
    } catch (e) {}
    this.setData({
      devDailySmokedCount: 0,
      showTeaModal: false
    });
    toast.info('🧹 今日吸烟计数已清零 (0 支)');
  },

  /* ==================== 🌌 5. 全景心境天幕即时循环轮换 ==================== */
  devCycleVipTheme() {
    triggerHaptic('heavy');
    const themes = VIP_THEME_OPTIONS || [];
    if (!themes.length) return;
    const currentTheme = this.data.vipTheme || 'classic';
    const currentIndex = themes.findIndex(t => t.id === currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const targetTheme = themes[nextIndex];
    try {
      wx.setStorageSync('JUST_ONE_SMOKE_PREVIEW_THEME', targetTheme.id);
    } catch (e) {}
    this.setData({ vipTheme: targetTheme.id });
    toast.flame(`🌌 心境天幕切换至：【${targetTheme.name}】（${targetTheme.tag || ''}）`);
  },

  devResetClassicTheme() {
    triggerHaptic('medium');
    try {
      wx.setStorageSync('JUST_ONE_SMOKE_PREVIEW_THEME', 'classic');
    } catch (e) {}
    this.setData({ vipTheme: 'classic' });
    toast.info('🌑 已复原至【原色深曜】经典黑静谧天幕');
  },

  devSetAtmosphereScene(e) {
    const sceneId = e.currentTarget.dataset.scene;
    if (!sceneId) return;
    storageService.setAtmosphereScene(sceneId);
    const sceneInfo = getSceneById(sceneId);
    this.setData({
      currentScene: sceneId,
      currentSceneInfo: sceneInfo
    });
    audioManager.startAmbientSound(sceneId);
    triggerHaptic('heavy');
    toast.flame(`${sceneInfo.icon || '✨'} 已沉浸置身：【${sceneInfo.name}】（${sceneInfo.subtitle}）！`);
  },

  /* ==================== 🤝 6. 好友社交礼遇与单支品鉴茶歇 ==================== */
  devSimulateReceiveGift(e) {
    const cigId = (e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.cigid) || 'huanghelou_1916';
    const targetCig = getCigaretteById(cigId) || this.data.currentCigarette || DEFAULT_CIGARETTE;
    triggerHaptic('celebration');
    storageService.setSelectedCigaretteId(targetCig.id);
    this.setData({
      currentCigarette: targetCig,
      giftCigarette: targetCig,
      giftSenderName: '腾讯老友',
      showGiftModal: true,
      showAdminTestModal: false
    });
    toast.flame(`🤝 收到【腾讯老友】递来的【${targetCig.name}】礼遇品鉴单支！`);
  },

  /* ==================== 📳 7. 阶梯通感触觉与 528Hz 磬音 ==================== */
  devTestSensoryHaptics() {
    toast.flame('📳 启动阶梯触觉通感：0s点火 ➔ 0.2s负压 ➔ 2.2s炭火微震！');
    triggerHaptic('heavy');
    setTimeout(() => {
      triggerHaptic('light');
    }, 200);
    setTimeout(() => {
      triggerHaptic('medium');
      const { cx, cy } = this.getTipCoordinates();
      if (this.particles) this.particles.emitSparks(cx, cy, 12);
    }, 2200);
  },

  devPlayZenChimeSound() {
    triggerHaptic('light');
    audioManager.playZenChimeSound(528);
    toast.info('🔔 已播放 528Hz 治愈禅意磬音');
  },

  /* ==================== 📜 8. 16 阶成语境界称号逐级步进 ==================== */
  devStepTitleNext() {
    this._stepTitle(1);
  },

  devStepTitlePrev() {
    this._stepTitle(-1);
  },

  devSetTitleTier(e) {
    const targetTitle = e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.title;
    if (!targetTitle) return;
    triggerHaptic('medium');
    storageService.setEquippedTitle(targetTitle);
    this.refreshAllData();
    toast.flame(`🎖️ 境界称号已设为：【${targetTitle}】！`);
  },

  _stepTitle(dir) {
    triggerHaptic('medium');
    const titles = [
      '破土初萌', '第一缕风', '晨曦破晓', '三日生机',
      '积微成著', '日省月试', '七日淬火', '身轻气爽',
      '从容自若', '重塑新程', '静水流深', '金石为开',
      '百日涅槃', '千帆历尽', '心如琉璃', '返璞归真',
      '无烟圣尊'
    ];
    const curTitle = storageService.getEquippedTitle() || '破土初萌';
    let idx = titles.indexOf(curTitle);
    if (idx === -1) idx = 0;
    const nextIdx = (idx + dir + titles.length) % titles.length;
    const nextTitle = titles[nextIdx];
    storageService.setEquippedTitle(nextTitle);
    this.refreshAllData();
    toast.flame(`🎖️ 境界称号切换为 (Lv.${nextIdx + 1}/${titles.length})：【${nextTitle}】！`);
  },

  devLockAdminMode() {
    triggerHaptic('medium');
    try {
      wx.removeStorageSync('__DEV_ADMIN_MODE__');
    } catch (e) {}
    this.setData({
      isDevAdminMode: false,
      showAdminTestModal: false
    });
    toast.info('🔒 管理员测试模式已关闭，首页测试按钮已隐藏！');
  },
  /* ==================== [DEV_ADMIN_TEST] 结束 ==================== */

  _calcShareProgressDeg(remaining, cig) {
    const cur = (typeof remaining === 'number') ? remaining : (this.data && this.data.currentPackRemaining);
    const targetCig = cig || (this.data && this.data.currentCigarette) || DEFAULT_CIGARETTE;
    const capacity = (targetCig && (targetCig.packCapacity || (targetCig.isCigar ? 5 : 20))) || 20;
    if (capacity <= 0) return 360;
    const ratio = Math.max(0, Math.min(1, (Number(cur) || 0) / capacity));
    return Math.round(ratio * 360);
  },

  measureSafeArea() {
    this.setData(measureSafeAreaSync());
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
    if (this.smokeGuideTimer) {
      clearTimeout(this.smokeGuideTimer);
      this.smokeGuideTimer = null;
    }
    if (this._guideTimer) {
      clearTimeout(this._guideTimer);
      this._guideTimer = null;
    }
    if (this.sceneGuideDismissTimer) {
      clearTimeout(this.sceneGuideDismissTimer);
      this.sceneGuideDismissTimer = null;
    }
    if (this._sceneGuideTimer) {
      clearTimeout(this._sceneGuideTimer);
      this._sceneGuideTimer = null;
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
    if (this._zenHudTimer) {
      clearTimeout(this._zenHudTimer);
      this._zenHudTimer = null;
    }
    if (this._ashtraySmokeTimer) {
      clearTimeout(this._ashtraySmokeTimer);
      this._ashtraySmokeTimer = null;
    }
    if (this.inhalePulseTimer1) {
      clearTimeout(this.inhalePulseTimer1);
      this.inhalePulseTimer1 = null;
    }
    if (this.inhalePulseTimer2) {
      clearTimeout(this.inhalePulseTimer2);
      this.inhalePulseTimer2 = null;
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

    this._clearTransientTimers();

    this.screenFogAlpha = 0;
    this.setData({
      isSparking: false,
      isAshTapping: false,
      showSmokeEffectGuide: false,
      showSceneGuide: false,
      isGuideFading: false,
      isSceneGuideFading: false
    });

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
    if (this._breathingTimer) {
      clearInterval(this._breathingTimer);
      this._breathingTimer = null;
    }
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
    let curAsh = 0;
    let curState = this.fsm ? this.fsm.getState() : 'UNLIT';

    ctx.save();
    try {
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const isInhaling = this.fsm.getState() === 'INHALING';

      const burnRes = this.fsm.burn(dt, isInhaling, this.data.currentCigarette);
      curAsh = this.fsm.getAshLength ? this.fsm.getAshLength() : 0;
      curState = this.fsm.getState();

      // 现实物理规律：静置或吸烟时烟灰积满自重断落
      if (burnRes && burnRes.ashDropped) {
        const { cx, cy } = this.getTipCoordinates();
        const curCig = this.data.currentCigarette || {};
        const isHandRolled = curCig.widthType === 'hand_rolled';
        this.particles.emitAshDrop(cx, cy, isHandRolled ? 6 : 3, isHandRolled ? 22 : 6);
        triggerHaptic('light');
      }

      // 燃尽结算触发 (增加防重入与即时状态同步锁，彻底杜绝帧循环与异步状态迟滞导致的死循环递归)
      if (curState === 'FINISHED' && this.data.simulatorState !== 'FINISHED' && !this._isFinishingSmoke) {
        this._isFinishingSmoke = true;
        this.data.simulatorState = 'FINISHED';
        this.setData({ simulatorState: 'FINISHED' });
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
        sparkStartTime: this.sparkStartTime,
        sparkDuration: this.sparkDuration || 1200,
        ignitionTool: this.data.currentIgnitionTool,
        vipTheme: this.data.vipTheme,
        ashTapProgress
      });

      // 呼气微雾衰减
      if (this.screenFogAlpha > 0.002) {
        this.screenFogAlpha = Math.max(0, this.screenFogAlpha - dt * 0.25);
      }
    } finally {
      ctx.restore();
    }

    const curAshRatio = this.fsm.getAshRatio ? this.fsm.getAshRatio() : 0;
    const ashProgress = Number(curAshRatio.toFixed(3));
    const ashPercent = Math.round(curAshRatio * 100);
    const ashDeg = curAshRatio > 0 ? Math.max(10, Math.min(360, Math.round(curAshRatio * 360))) : 0;
    const curAshInt = Math.floor(curAsh);

    let ashProgressStyle = '';
    if (ashDeg > 0) {
      if (ashPercent >= 70) {
        const midDeg = Math.round(ashDeg * 0.45);
        ashProgressStyle = `background: conic-gradient(#fbbf24 0deg, #f59e0b ${midDeg}deg, #ef4444 ${ashDeg}deg, rgba(255, 255, 255, 0.14) ${ashDeg}deg 360deg);`;
      } else {
        const midDeg = Math.round(ashDeg * 0.6);
        ashProgressStyle = `background: conic-gradient(#fbbf24 0deg, #f59e0b ${midDeg}deg, #f97316 ${ashDeg}deg, rgba(255, 255, 255, 0.14) ${ashDeg}deg 360deg);`;
      }
    } else {
      ashProgressStyle = 'background: rgba(255, 255, 255, 0.14);';
    }

    // 工业级性能优化：状态突变（点火/掐灭/抽吸切换）或烟灰抖落立即无延迟同步；
    // 渐变烟灰环进度采用 120ms 节流 + 阈值联合控制，彻底消除 60FPS 帧循环中的桥接通信拥堵
    const nowTs = Date.now();
    const isStateChanged = curState !== this.data.simulatorState;
    const isAshDropped = curAshInt === 0 && (this.data.ashLength || 0) > 0;
    const isThrottleDue = !this._lastAshSetDataTime || (nowTs - this._lastAshSetDataTime >= 120);
    const hasSignificantAshChange = Math.abs(ashPercent - (this.data.ashPercent || 0)) >= 2;

    if (isStateChanged || isAshDropped || (isThrottleDue && hasSignificantAshChange)) {
      this._lastAshSetDataTime = nowTs;
      this.setData({
        ashLength: curAshInt,
        ashProgress: ashProgress,
        ashPercent: ashPercent,
        ashDeg: ashDeg,
        ashProgressStyle: ashProgressStyle,
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

  // 获取用户嘴部 / 过滤嘴底部呼气吐烟锚点坐标 (保留兼容接口)
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

  // 获取修长烟支当前居中锚点坐标 (特效在烟身居中绽放，完美居中)
  getCigaretteCenterCoordinates() {
    if (!this.cWidth || !this.cHeight) return { cx: 180, cy: 380, midY: 380 };
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
    const filterBottom = cy + filterH;
    // 烟身整体几何中心点 (烟头燃烧端与滤嘴底部的中点，确保特效在烟身居中显示)
    const midY = Math.round((fireY + filterBottom) / 2);
    return { cx, cy: midY, midY, fireY, filterBottom };
  },

  // 配合烟雾特效执行真实拟真吐烟流程 (支持根据吸入时长动态注入吸力强度 intensity，具备连击防卡顿节流与上一波延时清理)
  performRealisticExhale(intensity = 1.0) {
    if (!this.particles || !this.fsm) return;

    // 状态严格防护锁：掐灭、未点燃或已燃尽状态下严禁呼出任何特效
    const curState = this.fsm.getState();
    if (curState === 'EXTINGUISHED' || curState === 'UNLIT' || curState === 'FINISHED') {
      return;
    }

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

    // 烟雾特效锚点：横向严格沿香烟中轴线居中 (cx = w / 2)，纵向保持嘴部/烟嘴吐雾自然起始位 (my)
    const { mx: cx, my } = this.getMouthCoordinates();
    const currentEff = this.data.currentSmokeEffect || DEFAULT_SMOKE_EFFECT;
    const curCig = this.data.currentCigarette || {};
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

    // 独占特效调度，清除异构大实体与多余旧烟雾，杜绝多特效交叉重叠
    this.particles.ensureExclusiveEffect(effectId);

    if (effectId === 'ring_classic') {
      // 1. 经典空灵烟圈：沿香烟中轴横向严格居中发射，向前上方优雅翱翔
      this.particles.emitSmokeRing(cx, my - 20, smokeColor, 1.0 * effIntensity, { speedMul: Math.min(1.35, 0.82 + effIntensity * 0.28) });
      const timer = setTimeout(() => {
        if (!this.particles || (this.fsm && this.fsm.getState() === 'EXTINGUISHED')) return;
        this.particles.emitVolumetricCombustionSmoke(cx, my - 24, smokeColor);
      }, 190);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'gold_stardust') {
      // 2. 黑金流沙：沿香烟中轴横向严格居中喷射 24K 金币雨与黑曜石流沙
      this.particles.emitGoldStardust(cx, my - 16, true);
      const timer = setTimeout(() => {
        if (!this.particles || (this.fsm && this.fsm.getState() === 'EXTINGUISHED')) return;
        this.particles.emitGoldStardust(cx, my - 18, false);
      }, 160);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'heart_double') {
      // 3. 双爱心烟：沿香烟中轴横向严格居中升腾浪漫同心双心形涡流环
      this.particles.emitHeartDouble(cx, my - 20);
    } else if (effectId === 'dragon_breath') {
      // 4. 金龙吐息：沿香烟中轴横向严格居中盘旋腾空，浓金祥云破雾而出
      this.particles.emitDragonBreath(cx, my - 20, true);
      const timer = setTimeout(() => {
        if (!this.particles || (this.fsm && this.fsm.getState() === 'EXTINGUISHED')) return;
        this.particles.emitDragonBreath(cx, my - 30, false);
      }, 180);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'galaxy_stars') {
      // 5. 璀璨星河：沿香烟中轴横向严格居中喷射双旋臂极光星云与二十四颗八芒星钻
      this.particles.emitGalaxyStars(cx, my - 16, true);
      const timer = setTimeout(() => {
        if (!this.particles || (this.fsm && this.fsm.getState() === 'EXTINGUISHED')) return;
        this.particles.emitGalaxyStars(cx, my - 20, false);
      }, 160);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'grand_fireworks') {
      // 6. 华夏盛世烟火：沿香烟中轴横向严格居中发射
      this.particles.emitGrandFireworks(cx, my - 20, true);
      const timer = setTimeout(() => {
        if (!this.particles || (this.fsm && this.fsm.getState() === 'EXTINGUISHED')) return;
        this.particles.emitGrandFireworks(cx, my - 24, false);
      }, 180);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'auspicious_river') {
      // 7. 步步高升：沿香烟中轴横向严格居中升腾
      this.particles.emitAuspiciousRiver(cx, my - 16, true);
      const timer = setTimeout(() => {
        if (!this.particles || (this.fsm && this.fsm.getState() === 'EXTINGUISHED')) return;
        this.particles.emitAuspiciousRiver(cx, my - 20, false);
      }, 170);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'blessing_runes') {
      // 8. 福愿金墨：沿香烟中轴横向严格居中升腾古雅篆金福印
      this.particles.emitBlessingRunes(cx, my - 16, true);
      const timer = setTimeout(() => {
        if (!this.particles || (this.fsm && this.fsm.getState() === 'EXTINGUISHED')) return;
        this.particles.emitBlessingRunes(cx, my - 20, false);
      }, 170);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'phoenix_nirvana') {
      // 9. 凤舞九天：沿香烟中轴横向严格居中升腾
      this.particles.emitPhoenixNirvana(cx, my - 20, true);
      const timer = setTimeout(() => {
        if (!this.particles || (this.fsm && this.fsm.getState() === 'EXTINGUISHED')) return;
        this.particles.emitPhoenixNirvana(cx, my - 28, false);
      }, 180);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'bagua_taichi') {
      // 10. 乾坤八卦：沿香烟中轴横向严格居中展开
      this.particles.emitBaguaTaichi(cx, my - 20, true);
      const timer = setTimeout(() => {
        if (!this.particles || (this.fsm && this.fsm.getState() === 'EXTINGUISHED')) return;
        this.particles.emitBaguaTaichi(cx, my - 28, false);
      }, 180);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'buddha_light') {
      // 11. 佛光普照：沿香烟中轴横向严格居中升腾
      this.particles.emitBuddhaLight(cx, my - 20, true);
      const timer = setTimeout(() => {
        if (!this.particles || (this.fsm && this.fsm.getState() === 'EXTINGUISHED')) return;
        this.particles.emitBuddhaLight(cx, my - 28, false);
      }, 180);
      this.exhaleEffectTimers.push(timer);
    } else if (effectId === 'seven_fairies') {
      // 12. 七仙降世：沿香烟中轴横向严格居中绽放
      this.particles.emitSevenFairies(cx, my - 20, true);
      const timer = setTimeout(() => {
        if (!this.particles || (this.fsm && this.fsm.getState() === 'EXTINGUISHED')) return;
        this.particles.emitSevenFairies(cx, my - 28, false);
      }, 180);
      this.exhaleEffectTimers.push(timer);
    } else {
      // 默认兜底：沿香烟中轴横向严格居中轻柔白雾漫卷
      this.particles.emitExhalePlume(cx, my - 16, 12, smokeColor, { speedMul: 1.1, lateralMul: 1.0 });
      const timer1 = setTimeout(() => {
        if (!this.particles || (this.fsm && this.fsm.getState() === 'EXTINGUISHED')) return;
        this.particles.emitExhalePlume(cx, my - 16, 8, smokeColor, { speedMul: 0.85, lateralMul: 0.8 });
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
    // 燃尽界面触碰屏幕：若盒内有烟则顺畅取出一支新烟拿在手中；若烟盒已空则仅 Toast 提示、不跳转页面，跟递烟效果完全一致
    if (this.fsm.getState() === 'FINISHED') {
      if (this.data.showRewardModal || this._isDrawingCigarette) return;
      const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
      const maxCap = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
      const remaining = storageService.getPackCount(curCig.id, maxCap);
      if (remaining <= 0) {
        triggerHaptic('medium');
        this.handleEmptyPackForDraw(curCig, maxCap);
        return;
      }
      this.drawNewCigarette();
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

    // 暖阁喵眠 · 案头打盹橘猫直接触控抚摸反馈 (Direct Petting on Cat Loaf)
    const currentScene = this.data.currentScene || storageService.getAtmosphereScene() || 'rainy_car';
    if (currentScene === 'cat_companion' && e && e.touches && e.touches[0] && this.cWidth && this.cHeight) {
      const touch = e.touches[0];
      const tx = touch.x !== undefined ? touch.x : (touch.clientX - (this.canvasLeft || 0));
      const ty = touch.y !== undefined ? touch.y : (touch.clientY - (this.canvasTop || 0));
      const catCenterX = this.cWidth * 0.28;
      const catCenterY = this.cHeight * 0.70 - 12;
      const hitCatDist = Math.hypot(tx - catCenterX, ty - catCenterY);
      // 猫咪触摸热区判定 (椭圆半径约 52px)
      if (hitCatDist <= 52) {
        if (sceneRenderer && sceneRenderer.triggerCatPet) {
          sceneRenderer.triggerCatPet();
        }
        triggerHaptic('cat_purr');
        const catQuotes = [
          '🐱 呼噜呼噜... 橘猫舒服地眯起眼睛，蹭了蹭你的手心',
          '🐱 咪呜~ 橘猫把小下巴搭在手边，暖烘烘地陪着你',
          '🐱 呼噜... 揣着手手的小橘猫翻了个身，继续安心打盹',
          '🐱 呼噜噜~ 橘猫抖了抖小耳朵，发出满足的呼噜声'
        ];
        const randomQuote = catQuotes[Math.floor(Math.random() * catQuotes.length)];
        toast.flame(randomQuote);
        return;
      }
    }

    // 雨夜龙猫 · 森林车站大龙猫大肚皮触控弹性反馈 (Direct Petting on Totoro Belly)
    if ((currentScene === 'totoro_rain' || currentScene === 'moonlit_dance') && e && e.touches && e.touches[0] && this.cWidth && this.cHeight) {
      const touch = e.touches[0];
      const tx = touch.x !== undefined ? touch.x : (touch.clientX - (this.canvasLeft || 0));
      const ty = touch.y !== undefined ? touch.y : (touch.clientY - (this.canvasTop || 0));
      const totoroCenterX = this.cWidth * 0.33;
      const totoroCenterY = this.cHeight * 0.72 - 32;
      const hitTotoroDist = Math.hypot(tx - totoroCenterX, ty - totoroCenterY);
      // 龙猫大肚皮触摸热区判定 (椭圆半径约 58px)
      if (hitTotoroDist <= 58) {
        if (sceneRenderer && sceneRenderer.triggerTotoroBounce) {
          sceneRenderer.triggerTotoroBounce();
        }
        triggerHaptic('totoro_bounce');
        const totoroQuotes = [
          '🍃 嗷呜~ 龙猫的大肚子软绵绵地晃了晃，递给你一片遮雨的荷叶',
          '🍃 呼呼~ 龙猫眨了眨圆溜溜的大眼睛，荷叶伞上的雨滴噼啪作响',
          '🍃 身边的小煤球精灵好奇地跳了起来，围着你欢快转圈~',
          '🍃 龙猫抖了抖尖尖的长耳朵，雨夜的森林静谧又安详'
        ];
        const randomQuote = totoroQuotes[Math.floor(Math.random() * totoroQuotes.length)];
        toast.flame(randomQuote);
        return;
      }
    }

    // 史努比星空 · 红屋顶史努比与糊涂塌客触控互动 (Direct Petting on Snoopy on the Roof)
    if ((currentScene === 'snoopy_stargazing' || currentScene === 'jazz_sway') && e && e.touches && e.touches[0] && this.cWidth && this.cHeight) {
      const touch = e.touches[0];
      const tx = touch.x !== undefined ? touch.x : (touch.clientX - (this.canvasLeft || 0));
      const ty = touch.y !== undefined ? touch.y : (touch.clientY - (this.canvasTop || 0));
      const snoopyCenterX = this.cWidth * 0.32;
      const snoopyCenterY = this.cHeight * 0.72 - 32;
      const hitSnoopyDist = Math.hypot(tx - snoopyCenterX, ty - snoopyCenterY);
      // 史努比红屋顶触摸热区判定 (半径约 58px)
      if (hitSnoopyDist <= 58) {
        if (sceneRenderer && sceneRenderer.triggerSnoopyBounce) {
          sceneRenderer.triggerSnoopyBounce();
        }
        triggerHaptic('snoopy_tap');
        const snoopyQuotes = [
          '🐶 史努比在红屋顶翻了个身：趴在屋顶上，烦恼就都像星星一样小了~',
          '🐥 糊涂塌客（Woodstock）叽喳扑腾着小翅膀，蹭了蹭史努比的脚趾',
          '🐶 史努比安逸地数着星星：明天又是充满希望的一天！',
          '✨ 一颗流星悄悄划过夜空，许一个纯真温暖的心愿吧~'
        ];
        const randomQuote = snoopyQuotes[Math.floor(Math.random() * snoopyQuotes.length)];
        toast.flame(randomQuote);
        return;
      }
    }

    // 温馨小家 · 壁炉暖木小熊一家三口触控互动 (Direct Petting on Cozy Bear Family)
    if (currentScene === 'cozy_family' && e && e.touches && e.touches[0] && this.cWidth && this.cHeight) {
      const touch = e.touches[0];
      const tx = touch.x !== undefined ? touch.x : (touch.clientX - (this.canvasLeft || 0));
      const ty = touch.y !== undefined ? touch.y : (touch.clientY - (this.canvasTop || 0));
      const familyCenterX = this.cWidth * 0.32;
      const familyCenterY = this.cHeight * 0.72 - 24;
      const hitFamilyDist = Math.hypot(tx - familyCenterX, ty - familyCenterY);
      // 小熊一家触摸热区判定 (半径约 60px)
      if (hitFamilyDist <= 60) {
        if (sceneRenderer && sceneRenderer.triggerFamilyBounce) {
          sceneRenderer.triggerFamilyBounce();
        }
        triggerHaptic('family_warmth');
        const familyQuotes = [
          '🏡 家人围坐，灯火可亲。无论走多远，这里永远是你的避风港~',
          '🐻 熊爸爸轻轻拉了拉毛毯，熊妈妈温柔地抚着小熊宝，梦里都是蜜糖的香甜',
          '✨ 小熊宝在睡梦中甜甜地笑了笑，抱紧了怀里的小熊玩偶',
          '🕯️ 壁炉里的火苗噼啪作响，风雪再大，家里的暖意也融化了一切疲惫'
        ];
        const randomQuote = familyQuotes[Math.floor(Math.random() * familyQuotes.length)];
        toast.flame(randomQuote);
        return;
      }
    }

    // 未点燃时点击屏幕: 自动为用户点燃香烟，无缝开启吸烟流程
    if (this.fsm.getState() === 'UNLIT') {
      this.triggerIgnite();
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

      const inhaleUpdate = { simulatorState: this.fsm.getState() };
      if (this.data.currentMoodText) {
        inhaleUpdate.isMoodDissolving = true;
      }
      this.setData(inhaleUpdate);
      audioManager.startBurnSound();

      // 腾讯总监设计级：负压通感阶梯震动 (0.2s 负压轻吸 + 2.2s 炭火深吸峰值微震)
      if (this._negativePressureTimer) clearTimeout(this._negativePressureTimer);
      this._negativePressureTimer = setTimeout(() => {
        if (this.isHoldingInhale) triggerHaptic('light');
      }, 200);

      if (this._thermalPeakTimer) clearTimeout(this._thermalPeakTimer);
      this._thermalPeakTimer = setTimeout(() => {
        if (this.isHoldingInhale) {
          triggerHaptic('medium');
          const { cx, cy } = this.getTipCoordinates();
          if (this.particles) this.particles.emitSparks(cx, cy, 8);
        }
      }, 2200);

      if (this.hapticInterval) clearInterval(this.hapticInterval);
      this.hapticInterval = setInterval(() => {
        triggerHaptic('light');
      }, 650);
    }
  },

  // 腾讯与字节大厂级动效：手指轻划屏幕触发微风扰动烟雾 (Touch Turbulence)
  onTouchMove(e) {
    if (!e || !e.touches || !e.touches[0] || !this.particles) return;
    const touch = e.touches[0];
    this.particles.setTouchTurbulence(touch.x, touch.y, true);
  },

  // 触摸结束（呼气）
  onTouchEnd() {
    if (this.particles) {
      this.particles.setTouchTurbulence(0, 0, false);
    }
    if (this._negativePressureTimer) {
      clearTimeout(this._negativePressureTimer);
      this._negativePressureTimer = null;
    }
    if (this._thermalPeakTimer) {
      clearTimeout(this._thermalPeakTimer);
      this._thermalPeakTimer = null;
    }
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
      const endInhaleData = {};
      if (this.data.simulatorState !== nextSt) {
        endInhaleData.simulatorState = nextSt;
      }
      if (this.data.isMoodDissolving) {
        endInhaleData.isMoodDissolving = false;
      }
      if (Object.keys(endInhaleData).length > 0) {
        this.setData(endInhaleData);
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

      // 真实口部呼气吐烟动作：烟身几何中心居中向上升腾，并根据吸入时长动态注入烟雾物理初速度与体积
      this.performRealisticExhale(inhaleIntensity);
    }
  },

  // 掐灭香烟：点击掐灭立即灭掉火头，彻底清退烟雾特效与定时器，升起一缕微弱青灰余烟
  extinguishCigarette() {
    if (!this.fsm) return;
    // 抖灰过程中严格锁定，禁止掐灭，必须等抖灰完成
    if (this.data.isAshTapping) {
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
      // 彻底清理呼气吐烟定时器与特效延时，杜绝掐灭后底部或烟身突兀冒出烟雾特效
      if (this.exhaleTimer) {
        clearTimeout(this.exhaleTimer);
        this.exhaleTimer = null;
      }
      if (this.exhaleEffectTimers && this.exhaleEffectTimers.length) {
        this.exhaleEffectTimers.forEach(t => clearTimeout(t));
        this.exhaleEffectTimers = [];
      }

      this.isHoldingInhale = false;
      audioManager.stopBurnSound();
      audioManager.playSizzleSound();
      triggerHaptic('heavy');

      // 清除烟头燃烧、阴燃烟气与空中残留的大型特效实体
      if (this.particles) {
        const { cx, cy } = this.getTipCoordinates();
        if (typeof this.particles.extinguishTipSmoke === 'function') {
          this.particles.extinguishTipSmoke(cx, cy);
        } else if (this.particles.silkStreams) {
          this.particles.silkStreams.forEach(s => { s.nodes = []; });
        }
        if (typeof this.particles.retireExhaleEntities === 'function') {
          this.particles.retireExhaleEntities(true);
        }
        // 彻底清退呼气烟羽与特效粒子，杜绝掐灭后残余特效或烟雾从底部/烟身冒出
        if (this.particles.particles && this.particles.particles.length) {
          this.particles.particles = this.particles.particles.filter(p => !p.isExhalePlume && !p.goldWaveId && !p.galaxyWaveId && !p.blessingWaveId);
        }
      }

      this.setData({
        simulatorState: this.fsm.getState()
      });
    }
  },

  // 点火与掐灭核心动作 (未点燃时点燃，燃烧中点击掐灭，抽完直接点燃新一支无重置步骤)
  triggerIgnite() {
    // 微信小程序双重触发防御：长按触发后抬手产生的幽灵点击严格拦截
    if (this._suppressNextTapUntil && Date.now() < this._suppressNextTapUntil) {
      return;
    }
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
      const revRem = storageService.getPackCount(curCig.id, revCap);
      this.setData({
        currentCigarette: curCig,
        currentPackRemaining: revRem,
        shareProgressDeg: this._calcShareProgressDeg(revRem, curCig),
        isBeadPopped: false
      });
    }

    // 燃尽状态下主控按键已切换为【抽新烟】：触发抽烟逻辑（校验烟盒余量并展示全新未点燃名烟）
    if (this.data.simulatorState === 'FINISHED') {
      this.drawNewCigarette();
      return;
    }
    // 如果当前处于点燃状态，点击直接掐灭
    if (this.data.simulatorState !== 'UNLIT') {
      this.extinguishCigarette();
      return;
    }
    if (this.data.isSparking) return;

    // 单日 40 支健康硬顶阻尼与清茶润喉关怀（普通用户点火硬顶拦截；VIP 尊享吸完柔性提醒、点火畅通）
    const dailyCount = storageService.getDailySmokedCount();
    const isVip = vipService.isVip();
    if (dailyCount >= 40 && !isVip) {
      // 普通用户：严格硬顶拦截，保护身心
      triggerHaptic('medium');
      this.setData({ showTeaModal: true });
      audioManager.playZenChimeSound(440);
      return;
    }

    const tool = this.data.currentIgnitionTool;

    this.setData({ isSparking: true });
    this.sparkStartTime = Date.now();
    this.sparkDuration = 1200;
    audioManager.playIgnitionSoundByTool(tool.id);
    triggerHaptic(tool.id === 'plasma_arc' ? 'plasma_arc' : 'heavy');

    if (this.particles && this.particles.resetSilkStream) {
      this.particles.resetSilkStream(true);
    }

    const { cx, cy } = this.getTipCoordinates();
    if (tool.id === 'vintage_match') {
      // 火柴柔和微粒火星
      this.particles.emitSparks(cx, cy, 18);
    } else if (tool.id === 'blue_torch') {
      // 强劲蓝焰火枪密集穿透火星
      this.particles.emitSparks(cx, cy, 32);
    } else if (tool.id === 'plasma_arc') {
      // 等离子电离紫青高能火花
      this.particles.emitSparks(cx, cy, 26);
    } else {
      this.particles.emitSparks(cx, cy, 24);
    }

    // 烟丝瞬间点燃腾起第一缕生动轻烟
    if (typeof this.particles.emitVolumetricCombustionSmoke === 'function') {
      this.particles.emitVolumetricCombustionSmoke(cx, cy, '#ffffff');
      this.particles.emitVolumetricCombustionSmoke(cx, cy - 8, '#fef08a');
    }

    if (this._sparkResetTimer) clearTimeout(this._sparkResetTimer);
    this._sparkResetTimer = setTimeout(() => {
      this._sparkResetTimer = null;
      this.setData({ isSparking: false });
    }, 1200);

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
    triggerHaptic('bead_pop');

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
      triggerHaptic('light');
      return;
    }

    // 检查积灰量：若完全无积灰（比如刚点燃或刚拆包一支全新烟），给予指节轻弹微振，不弹出 Toast 打扰
    const curAshRatio = this.fsm ? (this.fsm.getAshRatio ? this.fsm.getAshRatio() : 0) : 0;
    if (curAshRatio <= 0.001) {
      // 真实指节轻弹轻微物理反馈
      audioManager.playAshTapSound();
      triggerHaptic('light');
      return;
    }

    const prevAshH = this.fsm ? this.fsm.getAshLength() : 0;
    const tapSuccess = this.fsm && this.fsm.tapAsh();

    if (tapSuccess) {
      // 开启抖灰互斥锁定与动效时间戳
      this.ashTapStartTime = Date.now();
      this.setData({
        isAshTapping: true,
        ashLength: 0,
        ashProgress: 0,
        ashPercent: 0,
        ashDeg: 0,
        ashProgressStyle: 'background: rgba(255, 255, 255, 0.14);'
      });

      // 双段拟真指节轻弹触感与音效反馈 (0ms 指节轻弹 + 55ms 烟身微振回弹)
      audioManager.playAshTapSound();
      triggerHaptic('ash_tap');

      // 桌面铜托盘物理沉淀：将抖落的炭灰微粒真实留存在烟灰缸内
      const updatedAsh = storageService.addAshtrayAsh(1);
      this.setData({
        ashtrayAshFlakes: updatedAsh.flakes || [],
        ashtrayAshLevel: updatedAsh.level || 0
      });

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
    const activeEffectId = this.data.smokeEffectType;
    if (activeEffectId && ['dragon_breath', 'phoenix_nirvana', 'buddha_light', 'bagua_taichi', 'seven_fairies'].includes(activeEffectId)) {
      storageService.recordSmokeEffectSummoned(activeEffectId);
    }
    const allEffects = Array.from(new Set([...unlockedEffects, ...summonedEffects, ...(activeEffectId ? [activeEffectId] : [])]));

    const newly = checkAchievementsToUnlock({
      totalSubstituted: totalSubs,
      totalSavedMoney: grossSaved,
      quitDays: quitDays + 1,
      unlockedEffects: allEffects,
      unlockedEffectsCount: allEffects.length,
      hasCustomEffect: allEffects.some(id => id !== 'ring_classic' && id !== 'auspicious_river') || (this.data.smokeEffectType !== 'ring_classic' && this.data.smokeEffectType !== 'auspicious_river'),
      hasSummonedMythic: allEffects.includes('dragon_breath') || allEffects.includes('phoenix_nirvana') || allEffects.includes('buddha_light') || allEffects.includes('bagua_taichi') || allEffects.includes('auspicious_river') || allEffects.includes('seven_fairies')
    }, storageService.getUnlockedAchievements());

    if (newly && newly.length) {
      if (!this._achToastTimers) this._achToastTimers = [];
      newly.forEach((id, idx) => {
        storageService.unlockAchievement(id);
        const ach = getAchievementById(id);
        if (ach) {
          const timer = setTimeout(() => {
            audioManager.playZenChimeSound(660);
            toast.flame(`👑 荣耀晋升！获得称号【${ach.name}】！`);
          }, 600 + idx * 1200);
          this._achToastTimers.push(timer);
        }
      });
    }
  },

  // 抽完结算
  handleSmokingFinished() {
    this._isFinishingSmoke = true;
    if (this.data.simulatorState !== 'FINISHED') {
      this.data.simulatorState = 'FINISHED';
      this.setData({ simulatorState: 'FINISHED' });
    }
    const duration = this.sessionStartTime > 0 ? Math.round((Date.now() - this.sessionStartTime) / 1000) : 0;
    const inhales = this.fsm.getInhaleCount();
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const maxCap = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    // 动态提取香烟焦油量 (如 '10mg' -> 10, '0mg' -> 0, '6mg' -> 6, 旱烟/特殊规格默认 10)
    let singleTar = 10;
    if (curCig.isAirCig) {
      singleTar = 0;
    } else if (curCig.packTheme && curCig.packTheme.tar) {
      const match = String(curCig.packTheme.tar).match(/(\d+(\.\d+)?)/);
      if (match) singleTar = parseFloat(match[1]);
    }
    const profile = storageService.getProfile();
    const saved = calculateSavings(1, profile.packPrice);
    const tar = calculateTarAvoided(1, singleTar);
    const life = calculateLifeRegained(1);

    // 若该支烟在进入首页时已从烟盒消化扣减，则抽完结算时不再重复扣减烟盒余量
    if (storageService.isHomeStickDigested()) {
      storageService.setHomeStickDigested(false);
    } else {
      storageService.consumePackSlot(curCig.id, -1, maxCap);
    }

    const recordId = `sub_${Date.now()}`;
    storageService.addRecord({
      id: recordId,
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
    triggerHaptic('celebration');

    // 实时计算排行榜排位荣誉 (打通主包真实业务调用链，消除无引用告警)
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const grossSaved = calculateSavings(totalSubs, profile.packPrice);
    const availableSaved = Math.max(0, Number((grossSaved - storageService.getSpentSavings()).toFixed(2)));
    const quitDays = calculateQuitDays(profile.quitStartDate);
    let myRankInfo = null;
    let rankFeedback = '';
    try {
      const lbData = leaderboardService.getLeaderboard('substituted', {
        substituted: totalSubs,
        savedMoney: availableSaved,
        days: quitDays
      }, profile);
      if (lbData && lbData.myRankInfo) {
        myRankInfo = lbData.myRankInfo;
        rankFeedback = `全国英雄榜第 ${myRankInfo.rank} 席 · 击败 ${myRankInfo.beatPercent}% 烟友`;
      }
    } catch (e) {
      console.warn('Leaderboard rank evaluation fallback:', e);
    }

    // 自动闭环打卡签到：完成一次替烟即刻自动盖印今日自律打卡，杜绝主页与打卡业务断层
    storageService.recordDailyCheckIn();
    const checkInDates = (storageService.getCheckInDates && storageService.getCheckInDates()) || [];
    const allPunchedDateKeySet = new Set(checkInDates);
    const formatYMD = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    records.forEach(r => {
      if (!r || !r.timestamp) return;
      const ts = typeof r.timestamp === 'string' ? Number(r.timestamp) || Date.parse(r.timestamp) : r.timestamp;
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        allPunchedDateKeySet.add(formatYMD(d.getFullYear(), d.getMonth() + 1, d.getDate()));
      }
    });

    const nowD = new Date();
    let streakDays = 0;
    const startCursor = new Date(nowD.getFullYear(), nowD.getMonth(), nowD.getDate());
    for (let offset = 0; offset < 3650; offset++) {
      const key = formatYMD(startCursor.getFullYear(), startCursor.getMonth() + 1, startCursor.getDate());
      if (allPunchedDateKeySet.has(key)) {
        streakDays++;
      } else {
        break;
      }
      startCursor.setDate(startCursor.getDate() - 1);
    }

    const PUNCHLINES = [
      '指间清风过，心头杂念消。',
      '深呼吸，这一刻的从容属于你自己。',
      '克制是一种力量，今天又踏实走过一步。',
      '烟雾散去，留下的唯有内心的清明。',
      '少抽一支真烟，肺部与身心都轻盈了许多。'
    ];
    const punchline = PUNCHLINES[Math.floor(Math.random() * PUNCHLINES.length)];

    // 记录单日吸食支数（40支硬顶阻尼）与烟灰缸沉淀
    storageService.incrementDailySmokedCount();
    const updatedButts = storageService.addAshtrayButt({
      cigaretteId: curCig.id || 'default',
      cigaretteName: curCig.name || '经典香烟',
      filterColor: curCig.filterColor || '#ca8a04',
      paperColor: curCig.paperColor || '#fffdf5',
      savedMoney: saved.toFixed(2),
      timestamp: Date.now()
    });
    // 真实生活灭烟沉淀：吸尽掐灭在烟灰缸内时，余灰与碎屑自然入缸
    const updatedAsh = storageService.addAshtrayAsh(1);

    if (this._ashtraySmokeTimer) clearTimeout(this._ashtraySmokeTimer);
    this._ashtraySmokeTimer = setTimeout(() => {
      this.setData({ showAshtraySmoke: false });
    }, 45000);

    // 腾讯总监级禅意心流（赛博贤者时刻）：赛博灵动岛轻量呈现，把留白还给用户
    const activeMood = this.data.currentMoodText;
    if (activeMood && this.particles) {
      const moodX = (this.cWidth || 375) * 0.25;
      const moodY = (this.cHeight || 667) * 0.75;
      this.particles.emitMoodNoteEmberSparks(moodX, moodY, 32);
    }
    const zenText = activeMood
      ? `今日第 ${totalSubs} 支 · 【${activeMood}】随青烟消散升华`
      : `今日第 ${totalSubs} 支 · 节余 ¥${saved.toFixed(2)} · 焦油减免 ${tar}mg`;
    this.setData({
      showRewardModal: false, // 彻底关闭生硬全屏大弹窗，保护贤者时刻
      showZenHud: true,
      zenHudText: zenText,
      rewardPunchline: punchline,
      ashtrayButts: updatedButts,
      ashtrayAshFlakes: updatedAsh.flakes || [],
      ashtrayAshLevel: updatedAsh.level || 0,
      ashtrayAshCount: updatedAsh.count || 0,
      showAshtraySmoke: true,
      currentMoodText: '',
      isMoodDissolving: false,
      lastReward: {
        savedMoney: saved.toFixed(2),
        tarAvoided: tar,
        lifeRegained: life,
        inhaleCount: inhales,
        durationSeconds: duration,
        streakDays: streakDays || 1,
        rankFeedback
      },
      myRankInfo
    });

    if (this._zenHudTimer) clearTimeout(this._zenHudTimer);
    this._zenHudTimer = setTimeout(() => {
      this._zenHudTimer = null;
      this.setData({ showZenHud: false });
    }, 4200);

    // 检查短时连抽生理阻尼与关怀：每吸完一整包（40支=第2包完、60支=第3包完、80支=第4包完...）均贴心触发饮茶关怀
    const dailyCount = storageService.getDailySmokedCount();
    const isPackBoundary = dailyCount >= 40 && (dailyCount % 20 === 0);
    if (isPackBoundary) {
      const packNum = Math.floor(dailyCount / 20);
      const isVipUser = vipService.isVip();
      const teaBadgeTag = isVipUser 
        ? `👑 VIP尊享关怀 · 今日已品吸 ${packNum} 包 (${dailyCount}支)` 
        : `🌿 今日已抽满 ${packNum} 包 (${dailyCount}支) · 请歇一歇`;
      const teaDescText = `您今天已连续抽吸第 ${packNum} 包（共 ${dailyCount} 支）。高频抽吸极易引起咽喉灼燥与神经紧绷，建议放下手机饮一杯温水，静心休憩片刻。`;
      
      this.setData({
        teaBadgeText: teaBadgeTag,
        teaDescriptionText: teaDescText
      });

      setTimeout(() => {
        this.setData({ showTeaModal: true });
        triggerHaptic('medium');
      }, 1200);
    }

    this.refreshAllData();
  },

  onTapAshtray() {
    triggerHaptic('light');
    this.setData({ showAshtrayModal: true });
  },

  closeAshtrayModal() {
    this.setData({ showAshtrayModal: false });
  },

  // 腾讯与字节大厂级体验：ASMR 清风扫灰 + 延迟洁净底座呈现，拒绝廉价0ms闪断
  clearAshtrayNow() {
    if (this.data.ashtrayButts.length === 0 && this.data.ashtrayAshLevel === 0) return;
    this.setData({ isCleaningAshtray: true });
    triggerHaptic('light');
    if (audioManager.playAshtraySweepSound) {
      audioManager.playAshtraySweepSound();
    }
    setTimeout(() => {
      triggerHaptic('medium');
      storageService.clearAshtray();
      this.setData({
        ashtrayButts: [],
        ashtrayAshFlakes: [],
        ashtrayAshLevel: 0,
        ashtrayAshCount: 0,
        showAshtraySmoke: false
      });
      setTimeout(() => {
        this.setData({
          isCleaningAshtray: false,
          showAshtrayModal: false
        });
        toast.flame('烟缸空明如洗 · 心境澄澈自律');
      }, 500);
    }, 450);
  },

  /* ==================== 🍂 心绪便笺 · 随烟散尽交互 ==================== */
  openMoodModal() {
    triggerHaptic('light');
    this.setData({ showMoodModal: true });
  },

  closeMoodModal() {
    this.setData({ showMoodModal: false });
  },

  onSelectMoodPreset(e) {
    const mood = e.currentTarget.dataset.mood;
    triggerHaptic('light');
    this.setData({
      currentMoodText: mood,
      showMoodModal: false
    });
    toast.flame(`【${mood}】已入笺 · 吸烟时随青烟散尽`);
  },

  onInputCustomMood(e) {
    this.setData({ customMoodInput: e.detail.value });
  },

  onConfirmCustomMood() {
    const text = (this.data.customMoodInput || '').trim();
    if (!text) return;
    triggerHaptic('light');
    this.setData({
      currentMoodText: text,
      customMoodInput: '',
      showMoodModal: false
    });
    toast.flame(`【${text}】已入笺 · 吸烟时随青烟散尽`);
  },

  onClearMood() {
    triggerHaptic('light');
    this.setData({
      currentMoodText: '',
      customMoodInput: '',
      showMoodModal: false
    });
    toast.info('心绪笺已重归纯净');
  },

  openRewardModal() {
    this.setData({ showZenHud: false, showRewardModal: true });
  },

  restartCigarette() {
    this._isFinishingSmoke = false;
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
      ashDeg: 0,
      ashProgressStyle: 'background: rgba(255, 255, 255, 0.14);',
      isBeadPopped: false
    });
  },

  // 关闭战报弹窗：仅关闭弹窗，保留在抽完烟的燃尽界面 (保持 FINISHED 状态与烟蒂烟灰真实物理感)
  closeRewardModal() {
    this.setData({ showRewardModal: false });
  },

  // 抽新烟专属核心动作：确保烟盒余量校验、空盒弹窗拦截保护、去商店选烟或一键拆新盒 (全局严格唯一弹窗保障)
  drawNewCigarette() {
    audioManager.unlockAudio();

    // 1. 全局互斥防重锁：杜绝触摸穿透、多次连击导致弹出多个窗口
    const now = Date.now();
    if (this._isDrawingCigarette || (this._lastDrawCigTime && now - this._lastDrawCigTime < 800)) {
      return;
    }
    this._isDrawingCigarette = true;
    this._lastDrawCigTime = now;

    // 2. 无论此前战报弹窗是否打开，立即关闭战报弹窗，确保屏幕上永远只有一个弹窗，杜绝多窗口重叠
    if (this.data.showRewardModal) {
      this.setData({ showRewardModal: false });
    }

    // 校验 1 支尝鲜试抽凭证与名烟解锁状态
    let curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const totalSubs = storageService.getRecords().length;
    const trialInfo = storageService.getTrialCigaretteInfo();
    if (!isCigaretteUnlocked(curCig.id, totalSubs) && !vipService.isVip() && (!trialInfo || trialInfo.id !== curCig.id)) {
      const revertId = (trialInfo && trialInfo.prevId) ? trialInfo.prevId : 'chaotianmen_gold';
      curCig = getCigaretteById(revertId) || DEFAULT_CIGARETTE;
      storageService.setSelectedCigaretteId(curCig.id);
      const revCap = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
      const revRem = storageService.getPackCount(curCig.id, revCap);
      this.setData({
        currentCigarette: curCig,
        currentPackRemaining: revRem,
        shareProgressDeg: this._calcShareProgressDeg(revRem, curCig),
        isBeadPopped: false
      });
    }

    const maxCap = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    const remaining = storageService.getPackCount(curCig.id, maxCap);

    // 3. 烟盒已空：触发全站统一拆新盒闭环
    if (remaining <= 0) {
      triggerHaptic('medium');
      this.handleEmptyPackForDraw(curCig, maxCap);
      setTimeout(() => {
        this._isDrawingCigarette = false;
      }, 500);
      return;
    }

    // 4. 盒内有烟：正常取出一支新烟拿在手中 (重置为 UNLIT 未点燃全新香烟)
    const { remaining: newRem } = storageService.consumePackSlot(curCig.id, -1, maxCap);
    storageService.setHomeStickDigested(true);
    audioManager.playPackOpenSound();
    triggerHaptic('medium');
    this.setData({
      currentPackRemaining: newRem,
      shareProgressDeg: this._calcShareProgressDeg(newRem, curCig)
    });
    this.restartCigarette();
    setTimeout(() => {
      this._isDrawingCigarette = false;
    }, 500);
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

    // 实时计算榜单排位 (打通主包静态依赖图谱与实时榜单排位同步)
    let myRankInfo = null;
    try {
      const lbData = leaderboardService.getLeaderboard('substituted', {
        substituted: totalSubs,
        savedMoney: availableSaved,
        days: quitDays
      }, profile);
      myRankInfo = lbData ? lbData.myRankInfo : null;
    } catch (e) {
      console.warn('Refresh leaderboard stats fallback:', e);
    }

    this.setData({
      profile,
      totalSubstituted: totalSubs,
      totalSavedMoney: availableSaved.toFixed(2),
      singleStickSavedPrice: singleStickPrice,
      quitDays,
      currentPackRemaining: packRemaining,
      shareProgressDeg: this._calcShareProgressDeg(packRemaining, this.data.currentCigarette),
      smokeEffectsList,
      myRankInfo
    });
  },

  // ================= 实机同款主控与快捷操作 =================
  switchToLeaderboard() {
    if (this._isNavigating) return;
    this._isNavigating = true;
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.stopRenderLoop();
    wx.navigateTo({
      url: '/pages/leaderboard/leaderboard',
      fail: () => {
        this._isNavigating = false;
        this.startRenderLoop();
      },
      complete: () => {
        setTimeout(() => {
          this._isNavigating = false;
        }, 500);
      }
    });
  },

  switchToStats() {
    if (this._isNavigating) return;
    this._isNavigating = true;
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.stopRenderLoop();
    wx.navigateTo({
      url: '/pages/mine/mine',
      fail: () => {
        this._isNavigating = false;
        this.startRenderLoop();
      },
      complete: () => {
        setTimeout(() => {
          this._isNavigating = false;
        }, 500);
      }
    });
  },

  onNavigateBack() {
    navigateBackWithSound();
  },

  _clearGuideTimers() {
    if (this.smokeGuideTimer) {
      clearTimeout(this.smokeGuideTimer);
      this.smokeGuideTimer = null;
    }
    if (this._guideTimer) {
      clearTimeout(this._guideTimer);
      this._guideTimer = null;
    }
    if (this.sceneGuideDismissTimer) {
      clearTimeout(this.sceneGuideDismissTimer);
      this.sceneGuideDismissTimer = null;
    }
    if (this._sceneGuideTimer) {
      clearTimeout(this._sceneGuideTimer);
      this._sceneGuideTimer = null;
    }
    // 点燃引导 timer
    if (this._igniteGuideTimer) {
      clearTimeout(this._igniteGuideTimer);
      this._igniteGuideTimer = null;
    }
    if (this.igniteGuideDismissTimer) {
      clearTimeout(this.igniteGuideDismissTimer);
      this.igniteGuideDismissTimer = null;
    }
  },

  // ================= 抽烟环境长按引导微气泡管线 (仅单次会话进入程序展示一次，3.2s后自动渐隐) =================
  checkSceneGuide() {
    try {
      if (!this.data.showSceneGuide) {
        if (this._sceneGuideTimer) clearTimeout(this._sceneGuideTimer);
        // 延迟 600ms 优雅弹出，避开主页首屏渲染争抢
        this._sceneGuideTimer = setTimeout(() => {
          this._sceneGuideTimer = null;
          this.setData({ showSceneGuide: true, isSceneGuideFading: false });
          if (this.sceneGuideDismissTimer) clearTimeout(this.sceneGuideDismissTimer);
          // 3.2 秒后优雅渐隐消失
          this.sceneGuideDismissTimer = setTimeout(() => {
            this.sceneGuideDismissTimer = null;
            this.dismissSceneGuide();
          }, 3200);
        }, 600);
      }
    } catch (e) {}
  },

  dismissSceneGuide() {
    if (this.sceneGuideDismissTimer) {
      clearTimeout(this.sceneGuideDismissTimer);
      this.sceneGuideDismissTimer = null;
    }
    if (this._sceneGuideTimer) {
      clearTimeout(this._sceneGuideTimer);
      this._sceneGuideTimer = null;
    }
    this.setData({ isSceneGuideFading: true });
    this._sceneGuideTimer = setTimeout(() => {
      this._sceneGuideTimer = null;
      this.setData({ showSceneGuide: false, isSceneGuideFading: false });
    }, 350);
  },

  onTapSceneGuideTooltip() {
    this.dismissSceneGuide();
    this.openSceneModal();
  },

  // 单击快速轮换下一个沉浸环境
  toggleScene() {
    // 微信小程序双重触发防御：长按触发后抬手产生的幽灵点击严格拦截
    if (this._suppressNextTapUntil && Date.now() < this._suppressNextTapUntil) {
      return;
    }
    audioManager.unlockAudio();
    triggerHaptic('medium');
    this.dismissSceneGuide();

    if (!ATMOSPHERE_SCENES || !ATMOSPHERE_SCENES.length) return;

    const curSceneId = this.data.currentScene || 'obsidian';
    const curIdx = ATMOSPHERE_SCENES.findIndex(s => s.id === curSceneId);
    const nextScene = ATMOSPHERE_SCENES[(curIdx + 1) % ATMOSPHERE_SCENES.length];

    storageService.setAtmosphereScene(nextScene.id);
    audioManager.playSwitchSound();

    this.setData({
      currentScene: nextScene.id,
      currentSceneInfo: nextScene
    });

    if (this.data.isAmbientEnabled) {
      audioManager.startAmbientSound(nextScene.id);
    }
  },

  // ================= 烟雾特效长按引导微气泡管线 (仅单次会话进入程序展示一次，3.2s后自动渐隐) =================
  checkSmokeGuide() {
    try {
      if (!this.data.showSmokeEffectGuide) {
        if (this._guideTimer) clearTimeout(this._guideTimer);
        // 延迟 600ms 优雅弹出，避开主页首屏渲染争抢
        this._guideTimer = setTimeout(() => {
          this._guideTimer = null;
          this.setData({ showSmokeEffectGuide: true, isGuideFading: false });
          if (this.smokeGuideTimer) clearTimeout(this.smokeGuideTimer);
          // 3.2 秒后优雅渐隐消失
          this.smokeGuideTimer = setTimeout(() => {
            this.smokeGuideTimer = null;
            this.dismissSmokeGuide();
          }, 3200);
        }, 600);
      }
    } catch (e) {}
  },

  dismissSmokeGuide() {
    if (this.smokeGuideTimer) {
      clearTimeout(this.smokeGuideTimer);
      this.smokeGuideTimer = null;
    }
    if (this._guideTimer) {
      clearTimeout(this._guideTimer);
      this._guideTimer = null;
    }
    this.setData({ isGuideFading: true });
    this._guideTimer = setTimeout(() => {
      this._guideTimer = null;
      this.setData({ showSmokeEffectGuide: false, isGuideFading: false });
    }, 350);
  },

  onTapSmokeGuideTooltip() {
    this.dismissSmokeGuide();
    this.openSmokeEffectDrawer();
  },

  // ================= 点燃按钮长按引导气泡管线 (仅单次会话显示一次，与环境/烟雾引导逻辑一致) =================
  checkIgniteGuide() {
    try {
      if (!this.data.showIgniteGuide) {
        if (this._igniteGuideTimer) clearTimeout(this._igniteGuideTimer);
        // 延迟 800ms 弹出（比环境/烟雾稍晚，三个气泡错峰出现）
        this._igniteGuideTimer = setTimeout(() => {
          this._igniteGuideTimer = null;
          this.setData({ showIgniteGuide: true, isIgniteGuideFading: false });
          if (this.igniteGuideDismissTimer) clearTimeout(this.igniteGuideDismissTimer);
          // 3.2 秒后自动渐隐消失
          this.igniteGuideDismissTimer = setTimeout(() => {
            this.igniteGuideDismissTimer = null;
            this.dismissIgniteGuide();
          }, 3200);
        }, 800);
      }
    } catch (e) {}
  },

  dismissIgniteGuide() {
    if (this.igniteGuideDismissTimer) {
      clearTimeout(this.igniteGuideDismissTimer);
      this.igniteGuideDismissTimer = null;
    }
    if (this._igniteGuideTimer) {
      clearTimeout(this._igniteGuideTimer);
      this._igniteGuideTimer = null;
    }
    this.setData({ isIgniteGuideFading: true });
    this._igniteGuideTimer = setTimeout(() => {
      this._igniteGuideTimer = null;
      this.setData({ showIgniteGuide: false, isIgniteGuideFading: false });
    }, 350);
  },

  onTapIgniteGuideTooltip() {
    this.dismissIgniteGuide();
    this.openIgnitionToolDrawer();
  },

  // ================= 点火器具工坊 · 底部抽屉 =================
  /** 长按点燃按钮：仅在 UNLIT 状态打开器具选择抽屉 */
  onIgniteLongPress() {
    this._suppressNextTapUntil = Date.now() + 500;
    if (this.data.simulatorState !== 'UNLIT') return;
    this.openIgnitionToolDrawer();
  },

  openIgnitionToolDrawer() {
    audioManager.unlockAudio();
    triggerHaptic('medium');
    this.dismissIgniteGuide();
    const curTool = this.data.currentIgnitionTool || IGNITION_TOOLS[0];
    const idx = IGNITION_TOOLS.findIndex(t => t.id === curTool.id);
    const savedFidgetCount = wx.getStorageSync('SMOKEFREE_FIDGET_COUNT') || 0;
    // 打开时将预览器具重置为当前已装配器具，开启掌心把玩仪式
    this.setData({
      showIgnitionToolDrawer: true,
      previewIgnitionTool: curTool,
      activeToolIndex: idx >= 0 ? idx : 0,
      isPreviewTesting: false,
      isZippoLidOpen: false,
      isFidgetActive: false,
      justEquippedAnim: false,
      fidgetCount: savedFidgetCount
    });
  },

  closeIgnitionToolDrawer() {
    this.setData({
      showIgnitionToolDrawer: false,
      isFidgetActive: false,
      isPreviewTesting: false
    });
  },

  /** 3D 殿堂展台：点击下方底座切换展示器具 (切换视听音效 + 震动 + 浮空呈现) */
  onSelectShowcaseTool(e) {
    const toolId = e.currentTarget.dataset.id;
    if (!toolId) return;
    const tool = IGNITION_TOOLS.find(t => t.id === toolId);
    if (!tool) return;

    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');

    this.setData({
      previewIgnitionTool: tool,
      isPreviewTesting: false,
      isZippoLidOpen: false,
      isFidgetActive: false
    });
  },

  /** 掌心 EDC：记录并持久化一次情绪解压把玩计数 */
  _recordFidgetRelief() {
    const nextCount = (this.data.fidgetCount || 0) + 1;
    this.setData({
      fidgetCount: nextCount,
      fidgetCounterBumping: true
    });
    if (this._fcpTimer) clearTimeout(this._fcpTimer);
    this._fcpTimer = setTimeout(() => {
      this._fcpTimer = null;
      this.setData({ fidgetCounterBumping: false });
    }, 280);
    try {
      wx.setStorageSync('SMOKEFREE_FIDGET_COUNT', nextCount);
    } catch (e) {}
    return nextCount;
  },

  /** 掌心 EDC：触发 Zippo 掀盖清脆金属鸣响 */
  triggerZippoFlip(isOpen) {
    audioManager.unlockAudio();
    audioManager.playZippoOpenSound();
    triggerHaptic('medium');
    this._recordFidgetRelief();
    this.setData({ isZippoLidOpen: isOpen });
  },

  /** 掌心 EDC：触发点火机械真声与视听震感 (80ms 超低延迟连击响应 + 双态交替动画) */
  triggerFidgetStrike(toolId) {
    if (this._fidgetThrottle && Date.now() - this._fidgetThrottle < 80) return;
    this._fidgetThrottle = Date.now();

    audioManager.unlockAudio();
    audioManager.playIgnitionSoundByTool(toolId);
    triggerHaptic('medium');
    this._recordFidgetRelief();

    // 双态交替切换：通过 1 和 2 强制在每次连续点击时重置 CSS @keyframes 动画
    const nextBlast = (this.data.fidgetBlastIndex === 1) ? 2 : 1;
    const nextShockwave = (this.data.shockwaveToggle === 1) ? 2 : 1;

    this.setData({
      isPreviewTesting: true,
      fidgetBlastIndex: nextBlast,
      shockwaveToggle: nextShockwave,
      fidgetSparksVisible: true
    });

    if (this._heroStageTimer) clearTimeout(this._heroStageTimer);
    this._heroStageTimer = setTimeout(() => {
      this._heroStageTimer = null;
      if (!this.data.isFidgetActive) {
        this.setData({
          isPreviewTesting: false,
          fidgetBlastIndex: 0,
          shockwaveToggle: 0,
          fidgetSparksVisible: false
        });
      }
    }, 550);
  },

  /** 掌心 EDC：触摸手势交互识别 (滑动摩擦/上滑掀盖/下压砂轮/长按蓝焰) */
  onStageTouchStart(e) {
    if (!e.touches || !e.touches[0]) return;
    this._touchStartX = e.touches[0].clientX;
    this._touchStartY = e.touches[0].clientY;
    this._touchStartTime = Date.now();
    this._hasTriggeredGesture = false;

    const tool = this.data.previewIgnitionTool || IGNITION_TOOLS[0];
    // 战术蓝焰喷枪：按住即刻喷薄
    if (tool.id === 'blue_torch') {
      audioManager.unlockAudio();
      audioManager.playTorchSound();
      triggerHaptic('heavy');
      this._recordFidgetRelief();
      this.setData({ isFidgetActive: true, isPreviewTesting: true });
    }
  },

  onStageTouchMove(e) {
    if (!e.touches || !e.touches[0] || this._hasTriggeredGesture) return;
    const curX = e.touches[0].clientX;
    const curY = e.touches[0].clientY;
    const dx = curX - this._touchStartX;
    const dy = curY - this._touchStartY;
    const tool = this.data.previewIgnitionTool || IGNITION_TOOLS[0];

    // 1. 红头火柴：横向指尖划擦 (模拟红磷擦纸摩擦)
    if (tool.id === 'vintage_match' && Math.abs(dx) > 30) {
      this._hasTriggeredGesture = true;
      this.triggerFidgetStrike('vintage_match');
      return;
    }

    // 2. Zippo：指尖上滑掀盖 (听到铛的清脆声)
    if (tool.id === 'zippo_vintage' && dy < -25 && !this.data.isZippoLidOpen) {
      this._hasTriggeredGesture = true;
      this.triggerZippoFlip(true);
      return;
    }

    // 3. 经典砂轮打火机：拇指下压滑动砂轮
    if (tool.id === 'flint_lighter' && dy > 25) {
      this._hasTriggeredGesture = true;
      this.triggerFidgetStrike('flint_lighter');
      return;
    }

    // 4. 赛博双弧：轻触或向下滑动触发高频电浆放电
    if ((tool.id === 'plasma_arc' || tool.id === 'car_lighter') && Math.abs(dy) > 20) {
      this._hasTriggeredGesture = true;
      this.triggerFidgetStrike(tool.id);
      return;
    }
  },

  onStageTouchEnd(e) {
    const tool = this.data.previewIgnitionTool || IGNITION_TOOLS[0];
    if (tool.id === 'blue_torch' && this.data.isFidgetActive) {
      this.setData({ isFidgetActive: false });
      setTimeout(() => {
        if (!this.data.isFidgetActive) {
          this.setData({ isPreviewTesting: false });
        }
      }, 350);
      return;
    }
    // 注意：轻触由 catchtap="onTapHeroStage" 统一分发，杜绝与 touchend 双重触发互相吞掉点击！
  },

  /** 掌心 EDC：轻触中央浮空机体或展台触发把玩 */
  onTapHeroStage() {
    if (this._hasTriggeredGesture) {
      this._hasTriggeredGesture = false;
      return;
    }
    const tool = this.data.previewIgnitionTool || this.data.currentIgnitionTool || IGNITION_TOOLS[0];
    if (tool.id === 'zippo_vintage') {
      if (!this.data.isZippoLidOpen) {
        // 第一击掀开盖子
        this.triggerZippoFlip(true);
      } else {
        // 盖子已开，击发打火
        this.triggerFidgetStrike('zippo_vintage');
      }
      return;
    }
    this.triggerFidgetStrike(tool.id);
  },

  /** 掌心 EDC：装配为专属伴侣 (无缝契约仪式感) */
  onConfirmEquipTool() {
    const tool = this.data.previewIgnitionTool || IGNITION_TOOLS[0];
    const totalSubs = this.data.totalSubstituted || storageService.getRecords().length || 0;
    const isUnlocked = isIgnitionToolUnlocked(tool.id, totalSubs);

    if (!isUnlocked) {
      triggerHaptic('light');
      const reqCount = tool.requiredCount || 0;
      const diff = Math.max(0, reqCount - totalSubs);
      toast.show(`🔥 累计替烟 ${reqCount} 支解锁（还差 ${diff} 支）或开通 VIP 即刻畅享`, 'info');
      return;
    }

    if (tool.id === this.data.currentIgnitionTool.id) {
      // 已经装配过了，触发一次试火增强满足感
      this.onTapHeroStage();
      return;
    }

    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    audioManager.playIgnitionSoundByTool(tool.id);
    triggerHaptic('heavy');

    storageService.setSelectedIgnitionTool
      ? storageService.setSelectedIgnitionTool(tool.id)
      : wx.setStorageSync('SMOKEFREE_IGNITION_TOOL', tool.id);

    this.setData({
      currentIgnitionTool: tool,
      isPreviewTesting: true,
      justEquippedAnim: true
    });

    if (this._equipAnimTimer) clearTimeout(this._equipAnimTimer);
    this._equipAnimTimer = setTimeout(() => {
      this._equipAnimTimer = null;
      this.setData({ justEquippedAnim: false, isPreviewTesting: false });
    }, 850);
  },

  // ================= 赛博烟雾特效工坊 (实机切换图标与氪金/免费解锁特工坊) =================
  toggleSmokeEffect() {
    // 微信小程序双重触发防御：长按触发后抬手产生的幽灵点击严格拦截
    if (this._suppressNextTapUntil && Date.now() < this._suppressNextTapUntil) {
      return;
    }
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
    if (['dragon_breath', 'phoenix_nirvana', 'buddha_light', 'bagua_taichi', 'seven_fairies'].includes(nextEffect.id)) {
      storageService.recordSmokeEffectSummoned(nextEffect.id);
    }
    this._checkAndUnlockAchievements();

    audioManager.playZenChimeSound(528);
  },

  openSmokeEffectDrawer() {
    this._suppressNextTapUntil = Date.now() + 500;
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
      toast.warn(`【${item.name}】待点亮，可使用替烟基金兑换或坚持自律解锁！`);
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
    if (['dragon_breath', 'phoenix_nirvana', 'buddha_light', 'bagua_taichi', 'seven_fairies'].includes(item.id)) {
      storageService.recordSmokeEffectSummoned(item.id);
    }
    this._checkAndUnlockAchievements();
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

    storageService.addSpentSavings(needMoney);
    storageService.unlockSmokeEffect(item.id);
    audioManager.playSuccessSound();
    triggerHaptic('heavy');
    toast.success(`🎉 成功使用替烟基金 ¥${needMoney} 零元兑换【${item.name}】！`);

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
  },

  triggerInhale() {
    audioManager.unlockAudio();
    // 抖灰过程中严格锁定，禁止猛吸，必须等抖灰完成
    if (this.data.isAshTapping) {
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

  // 递烟专属交互：点击递烟消耗一支，外层圆圈实时显示余量进度环；平时静默无弹窗干扰，仅在没有烟了时才提示
  consumeOneStickForGive() {
    const now = Date.now();
    // 防止同一次点击同时触发 bindtap 与 onShareAppMessage(button) 导致双扣，300ms 内视为同一次点击
    if (this._lastGiveConsumeTime && (now - this._lastGiveConsumeTime < 300)) {
      return this.data.currentPackRemaining;
    }
    this._lastGiveConsumeTime = now;

    const curCig = this.data.currentCigarette || CIGARETTE_CATALOG[0] || DEFAULT_CIGARETTE;
    const cap = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    const cur = storageService.getPackCount(curCig.id, cap);

    // 若当前烟盒已空（0支）：触发全站统一拆新盒递烟闭环
    if (cur <= 0) {
      triggerHaptic('medium');
      this.handleEmptyPackForGive(curCig, cap);
      return 0;
    }

    const { remaining: next } = storageService.consumePackSlot(curCig.id, -1, cap);

    this.setData({
      currentPackRemaining: next,
      shareProgressDeg: this._calcShareProgressDeg(next, curCig)
    });

    return next;
  },

  // 抽新烟空盒处理：彻底干掉 wx.showModal，唤出小抽屉手柄
  handleEmptyPackForDraw(curCig, maxCap) {
    this._isDrawingCigarette = false;
    triggerHaptic('medium');
    // 桌面滑出小抽屉手柄与提示，绝不弹原生弹窗
    this.setData({
      showDeskDrawerModal: true,
      unopenedPacksCount: storageService.getUnopenedPacksCount()
    });
  },

  // 递烟空盒处理：手中烟盒已空，体面送出茶几迎客烟，绝不擅自拆开整包把空盒刷满（恪守控烟自律）
  handleEmptyPackForGive(curCig, cap) {
    triggerHaptic('medium');
    toast.flame('🤝 手中烟盒已空，特为你备了一支【雅致迎客烟】，已随心意体面递出！');
  },

  // ================= 桌面小抽屉核心业务交互 =================
  onTapDeskDrawer() {
    triggerHaptic('light');
    this.setData({
      showDeskDrawerModal: true,
      unopenedPacksCount: storageService.getUnopenedPacksCount()
    });
  },

  closeDeskDrawerModal() {
    this.setData({ showDeskDrawerModal: false });
  },

  onTakeSingleEmergencyStick() {
    this.closeDeskDrawerModal();
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    storageService.setHomeStickDigested(true);
    audioManager.playPackOpenSound();
    triggerHaptic('medium');
    toast.success('摸出 1 支抽屉应急烟，即点即抽');
    this.restartCigarette();
  },

  /* ================= 🌿 4-7-8 静心顺顺气吐纳空间 ================= */
  openBreathingSpace() {
    this.closeDeskDrawerModal();
    audioManager.unlockAudio();
    audioManager.playZenChimeSound(528);
    triggerHaptic('light');

    if (this._breathingTimer) {
      clearInterval(this._breathingTimer);
      this._breathingTimer = null;
    }

    this.setData({
      showBreathingSpaceModal: true,
      breathingCompleted: false,
      breathingCycle: 1,
      breathingPhase: 'INHALE',
      breathingPhaseLabel: '慢吸气',
      breathingCountdown: 4,
      breathingGuideQuote: '慢吸气 · 气沉丹田，引清凉入肺腑'
    });

    this._runBreathingPhase('INHALE', 4, 1);
  },

  closeBreathingSpace() {
    if (this._breathingTimer) {
      clearInterval(this._breathingTimer);
      this._breathingTimer = null;
    }
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.setData({ showBreathingSpaceModal: false });
  },

  _runBreathingPhase(phase, duration, cycle) {
    if (this._breathingTimer) {
      clearInterval(this._breathingTimer);
      this._breathingTimer = null;
    }

    let remaining = duration;
    let label = '慢吸气';
    let quote = '慢吸气 · 气沉丹田，引清凉入肺腑';

    if (phase === 'INHALE') {
      label = '慢吸气';
      quote = '慢吸气 · 气沉丹田，引清凉入肺腑';
      triggerHaptic('light');
    } else if (phase === 'HOLD') {
      label = '静屏息';
      quote = '静屏息 · 心无杂念，安住当下心境';
    } else if (phase === 'EXHALE') {
      label = '深呼气';
      quote = '深呼气 · 释去烦热，吐出胸中积郁';
      audioManager.playZenChimeSound(528);
      triggerHaptic('medium');
    }

    this.setData({
      breathingPhase: phase,
      breathingPhaseLabel: label,
      breathingCountdown: remaining,
      breathingCycle: cycle,
      breathingGuideQuote: quote
    });

    this._breathingTimer = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        this.setData({ breathingCountdown: remaining });
      } else {
        clearInterval(this._breathingTimer);
        this._breathingTimer = null;
        this._advanceBreathingPhase(phase, cycle);
      }
    }, 1000);
  },

  _advanceBreathingPhase(currentPhase, cycle) {
    if (currentPhase === 'INHALE') {
      this._runBreathingPhase('HOLD', 7, cycle);
    } else if (currentPhase === 'HOLD') {
      this._runBreathingPhase('EXHALE', 8, cycle);
    } else if (currentPhase === 'EXHALE') {
      // 4-7-8 单次19秒完整精粹吐纳：平复副交感神经，极佳正向心流，直接圆满达成
      this._finishBreathingSuccess();
    }
  },

  finishBreathingEarly() {
    if (this._breathingTimer) {
      clearInterval(this._breathingTimer);
      this._breathingTimer = null;
    }
    this._finishBreathingSuccess();
  },

  _finishBreathingSuccess() {
    audioManager.playZenChimeSound(528);
    triggerHaptic('celebration');
    storageService.addUnopenedPack(1);
    const totalPacks = storageService.getUnopenedPacksCount();
    this.setData({
      breathingCompleted: true,
      unopenedPacksCount: totalPacks
    });
  },

  // 顺气成果自选 A: 身心已平 · 今日自律到此 (克制自律胜利)
  onBreathingChoicePeace() {
    triggerHaptic('celebration');
    this.setData({ showBreathingSpaceModal: false });
    toast.flame('🌿 心平气和 · 今日深呼吸替烟成功，自律克制胜利！');
  },

  // 顺气成果自选 B: 取单支应急品吸 (体面克制)
  onBreathingChoiceTakeSingle() {
    this.setData({ showBreathingSpaceModal: false });
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    storageService.setHomeStickDigested(true);
    audioManager.playPackOpenSound();
    triggerHaptic('medium');
    toast.success('摸出 1 支备用好烟，慢吸品味');
    this.restartCigarette();
  },

  // VIP 专属特权：无限开箱拆新盒直通
  onVipDirectUnwrapNewPack() {
    this.closeDeskDrawerModal();
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const maxCap = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    audioManager.playUnwrapSound();
    triggerHaptic('heavy');
    storageService.setPackCount(curCig.id, maxCap);
    storageService.consumePackSlot(curCig.id, -1, maxCap);
    storageService.setHomeStickDigested(true);
    this.setData({
      currentPackRemaining: maxCap - 1,
      shareProgressDeg: this._calcShareProgressDeg(maxCap - 1, curCig)
    });
    this.restartCigarette();
    toast.flame(`👑 尊享黑金私藏特权 · 撕开金拉线开新盒！取出【${curCig.name}】！`);
  },

  onUnwrapNewPackFromDrawer() {
    this.closeDeskDrawerModal();
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const maxCap = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    this.executeUnwrapPackInScene(curCig, maxCap);
  },

  executeUnwrapPackInScene(curCig, maxCap) {
    const res = storageService.executeUnwrapNewPack(curCig.id, maxCap);
    if (!res.success) {
      toast.warn('今日拆包配额已用完，不如顺顺气或明天再抽');
      return;
    }
    const { remaining: newRem } = storageService.consumePackSlot(curCig.id, -1, maxCap);
    storageService.setHomeStickDigested(true);
    audioManager.playUnwrapSound();
    triggerHaptic('heavy');
    this.setData({
      currentPackRemaining: newRem,
      unopenedPacksCount: storageService.getUnopenedPacksCount(),
      shareProgressDeg: this._calcShareProgressDeg(newRem, curCig)
    });
    this.restartCigarette();
    toast.success(`📦 撕开金拉线，已取出一支【${curCig.name}】！`);
  },

  closeTeaModal() {
    this.setData({ showTeaModal: false });
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
    if (this.data.simulatorState !== 'UNLIT') {
      this.restartCigarette();
    }
    this.triggerIgnite();
  },

  // 选烟与拟真开盒页面跳转 (3D 翻盖烟盒与抽烟仪式感)
  openCigarettePicker() {
    if (this._isNavigating) return;
    this._isNavigating = true;
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this.stopRenderLoop();
    wx.navigateTo({
      url: '/pages/shop/shop',
      fail: () => {
        this._isNavigating = false;
        this.startRenderLoop();
      },
      complete: () => {
        setTimeout(() => {
          this._isNavigating = false;
        }, 500);
      }
    });
  },

  // ================= 沉浸生活场景氛围切换 =================
  openSceneModal() {
    this._suppressNextTapUntil = Date.now() + 500;
    this.dismissSceneGuide();
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
    const totalSubs = this.data.totalSubstituted || storageService.getRecords().length || 0;
    const isUnlocked = isSceneUnlocked(sceneId, totalSubs);

    if (!isUnlocked) {
      triggerHaptic('light');
      const reqCount = sceneInfo.requiredCount || 0;
      const diff = Math.max(0, reqCount - totalSubs);
      toast.show(`🌿 累计替烟 ${reqCount} 支解锁（还差 ${diff} 支）或开通 VIP 即刻畅享`, 'info');
      return;
    }

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
  },

  toggleAmbientSound() {
    audioManager.unlockAudio();
    const nextState = !this.data.isAmbientEnabled;
    storageService.setAmbientSoundEnabled(nextState);
    audioManager.setAmbientEnabled(nextState, this.data.currentScene);
    triggerHaptic('light');
    this.setData({ isAmbientEnabled: nextState });
  },

  stopBubble() {},
  preventTouchMove() {}
});
