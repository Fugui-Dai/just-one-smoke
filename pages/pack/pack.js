// pages/pack/pack.js
import { storageService } from '../../services/storageService.js';
import { audioManager } from '../../services/audioManager.js';
import { triggerHaptic } from '../../services/haptics.js';
import { toast } from '../../services/toastService.js';
import { vipService } from '../../services/vipService.js';
import { packFlightVfxRenderer } from '../../engine/canvasRenderer.js';
import {
  DEFAULT_CIGARETTE,
  getCigaretteById,
  isCigaretteUnlocked,
  computeFlightStyles,
  PACK_DISPLAY_MODE,
  DEFAULT_PACK_CAPACITY
} from '../../configs/catalog.js';
import { measureSafeAreaSync, detectIsIOS } from '../../utils/safeArea.js';
import { navigateBackWithSound } from '../../utils/navigation.js';

function computeLidWatermark(cig, capacity) {
  if (!cig) return '★ 20 FILTER CIGARETTES ★';
  if (cig.isCigar) return '★ 5 ROBUSTO CIGARS ★';
  if (cig.isAirCig) return '★ PURE NATURE OXYGEN ★';
  if (cig.widthType === 'hand_rolled') return '★ HAND-ROLLED HERITAGE ★';
  if (cig.widthType === 'slender' || cig.hasBead) return '★ SLENDER SELECTION ★';
  return `★ ${capacity || 20} FILTER CIGARETTES ★`;
}

const INITIAL_SAFE_AREA = measureSafeAreaSync();

const VFX_TIER_OPTIONS = [
  { id: 'standard', name: '普通', fullName: '晨曦冷刃', icon: '✦', tag: '基础', color: '#e2e8f0' },
  { id: 'day', name: '日卡', fullName: '翡翠碧波', icon: '🌿', tag: '日卡', color: '#10b981' },
  { id: 'month', name: '月卡', fullName: '极光紫晶', icon: '🔮', tag: '月卡', color: '#a855f7' },
  { id: 'lifetime', name: '至尊', fullName: '曜世真龙', icon: '👑', tag: '至尊', color: '#fbbf24' }
];

Page({
  data: {
    // 导航与屏幕尺寸适配
    statusBarHeight: INITIAL_SAFE_AREA.statusBarHeight,
    navBarHeight: INITIAL_SAFE_AREA.navBarHeight,
    capsuleRightSpace: INITIAL_SAFE_AREA.capsuleRightSpace,

    vipTheme: '',

    // 品鉴特效阶梯选项 (普通 · 日卡 · 月卡 · 至尊)
    vfxTierOptions: VFX_TIER_OPTIONS,
    currentVfxTier: 'lifetime', // 默认至尊真龙体验，支持点击即时切换

    // 烟盒陈列模式 ('row6': 6支宽幕轻奢单排 | 'matrix20': 经典20支双排矩阵)
    packLayoutMode: PACK_DISPLAY_MODE,

    // 当前选中的名烟与烟盒
    currentCigarette: DEFAULT_CIGARETTE,
    isCurrentUnlocked: true,
    isTrialMode: false,
    packWatermarkText: '★ 20 FILTER CIGARETTES ★',
    packCapacity: DEFAULT_PACK_CAPACITY, // 盒内总容量 (6支品鉴装 / 20支标准装 / 雪茄5支)
    packCount: DEFAULT_PACK_CAPACITY, // 盒内剩余烟支数量
    slotArray: [], // 槽位索引数组 [0..5] 或 [0..19] 或 [0..4]
    slotStates: [], // 每个槽位是否有烟状态数组 [true, false, ...]
    flightStyles: computeFlightStyles(DEFAULT_CIGARETTE),

    // 3D 动画交互状态
    isLidOpen: false, // 盒盖默认状态（默认严格闭合，绝不多余动作）
    isPulling: false, // 正在抽出一支烟的动画
    isSlotEjected: false, // 烟支是否已拔出槽位进入空中轨迹
    slotOffsetX: 0, // 选中烟支相对于烟盒中心的水平偏移 (rpx)
    isFlightVisible: false, // 抽出烟支是否悬浮在空中
    isFlightActive: false, // SSR 华丽特效激活态
    pulledSlotIndex: -1 // 被抽出的烟支槽位
  },

  onLoad(query) {
    this._skipFirstShowRefresh = true;

    const targetId = (query && query.id) ? query.id : storageService.getSelectedCigaretteId();
    const curCig = getCigaretteById(targetId) || DEFAULT_CIGARETTE;

    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : DEFAULT_PACK_CAPACITY);
    // 读取真实剩余槽位状态与剩余数量（绝不强制重置未抽完的烟盒，保留被抽走后的空槽位置）
    const slotStates = storageService.getPackSlots(curCig.id, capacity);
    const count = slotStates.filter(Boolean).length;

    const records = storageService.getRecords();
    const totalSubs = records.length;
    const actuallyUnlocked = vipService.isVip() || isCigaretteUnlocked(curCig.id, totalSubs);
    const isTrialQuery = !!(query && query.from === 'trial');
    this._fromTrial = isTrialQuery && !actuallyUnlocked;
    this._trialPullUsed = false;

    const existingTrialInfo = storageService.getTrialCigaretteInfo();
    const currentSelectedId = storageService.getSelectedCigaretteId();
    this._trialPrevId = (existingTrialInfo && existingTrialInfo.prevId && existingTrialInfo.prevId !== curCig.id)
      ? existingTrialInfo.prevId
      : (currentSelectedId && currentSelectedId !== curCig.id ? currentSelectedId : 'chaotianmen_gold');

    const unlocked = actuallyUnlocked || this._fromTrial;
    const flightStyles = computeFlightStyles(curCig);

    const slotArray = [];
    for (let i = 0; i < capacity; i++) {
      slotArray.push(i);
    }

    const vipInfo = vipService.getVipInfo();
    const defaultTier = vipInfo.isVip ? (vipInfo.tierId || 'lifetime') : 'lifetime';

    // 单次原子化 setData 直出目标名烟 3D 状态，包含完整 flightStyles 与独立槽位状态
    this.setData({
      vipTheme: vipService.getVipTheme(),
      vfxTierOptions: VFX_TIER_OPTIONS,
      currentVfxTier: defaultTier,
      packLayoutMode: PACK_DISPLAY_MODE,
      currentCigarette: curCig,
      isCurrentUnlocked: unlocked,
      isTrialMode: this._fromTrial,
      packWatermarkText: computeLidWatermark(curCig, capacity),
      packCapacity: capacity,
      packCount: count,
      slotArray,
      slotStates,
      flightStyles,
      isLidOpen: false,
      isPulling: false,
      isSlotEjected: false,
      slotOffsetX: 0,
      isFlightVisible: false,
      isFlightActive: false,
      pulledSlotIndex: -1
    });
  },

  onReady() {
    this.initFlightCanvas();
  },

  initFlightCanvas(cb) {
    if (this._flightCtx && this._flightCanvasW && this._flightCanvasH) {
      if (typeof cb === 'function') cb();
      return;
    }
    try {
      const query = wx.createSelectorQuery ? wx.createSelectorQuery().in(this) : null;
      if (!query) return;
      query.select('#packFlightCanvas').fields({ node: true, size: true }).exec(res => {
        if (!res || !res[0] || !res[0].node) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const sysInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
        const dpr = Math.min(2.5, (sysInfo && sysInfo.pixelRatio) || 2);
        const w = res[0].width || (sysInfo && sysInfo.windowWidth) || 375;
        const h = res[0].height || (sysInfo && sysInfo.windowHeight) || 812;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
        this._flightCanvas = canvas;
        this._flightCtx = ctx;
        this._flightCanvasW = w;
        this._flightCanvasH = h;
        if (typeof cb === 'function') cb();
      });
    } catch (e) {}
  },

  startFlightVfxLoop(slotOffsetX = 0) {
    this.stopFlightVfxLoop();
    packFlightVfxRenderer.reset();
    this._flightStartTime = Date.now();
    const pxOffset = (slotOffsetX || 0) * 0.5;

    const step = () => {
      if (!this._flightStartTime) return;
      const elapsedSec = (Date.now() - this._flightStartTime) / 1000;
      if (this._flightCtx && this._flightCanvasW && this._flightCanvasH) {
        packFlightVfxRenderer.render(
          this._flightCtx,
          this._flightCanvasW,
          this._flightCanvasH,
          elapsedSec,
          { slotOffsetX: pxOffset, vfxTier: this.data.currentVfxTier || 'lifetime' }
        );
      }
      if (this._flightStartTime) {
        if (this._flightCanvas && typeof this._flightCanvas.requestAnimationFrame === 'function') {
          this._flightRafId = this._flightCanvas.requestAnimationFrame(step);
        } else {
          this._flightRafTimer = setTimeout(step, 16);
        }
      }
    };

    if (this._flightCtx) {
      step();
    } else {
      this.initFlightCanvas(() => {
        step();
      });
    }
  },

  stopFlightVfxLoop() {
    this._flightStartTime = 0;
    if (this._flightRafId && this._flightCanvas && typeof this._flightCanvas.cancelAnimationFrame === 'function') {
      try { this._flightCanvas.cancelAnimationFrame(this._flightRafId); } catch (e) {}
    }
    this._flightRafId = null;
    if (this._flightRafTimer) {
      clearTimeout(this._flightRafTimer);
      this._flightRafTimer = null;
    }
    if (this._flightCtx && this._flightCanvasW && this._flightCanvasH) {
      try {
        this._flightCtx.clearRect(0, 0, this._flightCanvasW, this._flightCanvasH);
      } catch (e) {}
    }
  },

  onShow() {
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const totalSubs = storageService.getRecords().length;
    const actuallyUnlocked = vipService.isVip() || isCigaretteUnlocked(curCig.id, totalSubs);
    if (actuallyUnlocked && this._fromTrial) {
      this._fromTrial = false;
      storageService.clearTrialCigaretteInfo();
    }
    const unlocked = !!(actuallyUnlocked || this._fromTrial);

    if (this._skipFirstShowRefresh) {
      this._skipFirstShowRefresh = false;
      this.setData({
        vipTheme: vipService.getVipTheme(),
        isCurrentUnlocked: unlocked,
        isTrialMode: !!this._fromTrial
      });
      return;
    }
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : DEFAULT_PACK_CAPACITY);
    const slotStates = storageService.getPackSlots(curCig.id, capacity);
    const count = slotStates.filter(Boolean).length;
    this.setData({
      vipTheme: vipService.getVipTheme(),
      packLayoutMode: PACK_DISPLAY_MODE,
      isCurrentUnlocked: unlocked,
      isTrialMode: !!this._fromTrial,
      packWatermarkText: computeLidWatermark(curCig, capacity),
      packCapacity: capacity,
      packCount: count,
      slotStates
    });
  },

  clearPullTimers() {
    this._isPullingInProgress = false;
    if (this._lidOpenDelayTimer) { clearTimeout(this._lidOpenDelayTimer); this._lidOpenDelayTimer = null; }
    if (this._pullTimer1) { clearTimeout(this._pullTimer1); this._pullTimer1 = null; }
    if (this._pullTimer2) { clearTimeout(this._pullTimer2); this._pullTimer2 = null; }
    if (this._pullTimer3) { clearTimeout(this._pullTimer3); this._pullTimer3 = null; }
    if (this._pullTimer4) { clearTimeout(this._pullTimer4); this._pullTimer4 = null; }
    if (this._pullTimer5) { clearTimeout(this._pullTimer5); this._pullTimer5 = null; }
    this.stopFlightVfxLoop();
  },

  onHide() {
    this.clearPullTimers();
  },

  onUnload() {
    this._isPullingInProgress = false;
    this._isNavigatingBack = false;
    this.clearPullTimers();
  },

  // 翻开 / 合上烟盒盖
  togglePackLid() {
    audioManager.unlockAudio();
    const next = !this.data.isLidOpen;
    if (next) {
      audioManager.playPackOpenSound();
      triggerHaptic('medium');
    } else {
      audioManager.playPackCloseSound();
      triggerHaptic('light');
    }
    this.setData({ isLidOpen: next });
  },

  // 切换品鉴特效档位 (普通 · 日卡 · 月卡 · 至尊)
  onSelectVfxTier(e) {
    const tier = e.currentTarget.dataset.tier;
    if (!tier || tier === this.data.currentVfxTier) return;
    audioManager.playSwitchSound();
    const hapticMap = { standard: 'light', day: 'medium', month: 'medium', lifetime: 'heavy' };
    triggerHaptic(hapticMap[tier] || 'medium');
    this.setData({ currentVfxTier: tier });
  },

  // 点击盒内某支烟直接抽取（点到谁谁就出来，然后该位置空着）
  onTapCigaretteSlot(e) {
    const index = Number(e.currentTarget.dataset.index);
    if (!this.data.isCurrentUnlocked) {
      triggerHaptic('medium');
      toast.warn(this.data.currentCigarette.unlockDesc);
      return;
    }
    if (this._fromTrial && this._trialPullUsed) {
      triggerHaptic('medium');
      toast.warn(detectIsIOS() ? '单支尝鲜仅限抽取 1 支，自律解锁或升级特权可畅享' : '单支尝鲜仅限抽取 1 支，解锁或开通 VIP 可无限畅享');
      return;
    }
    const curCig = this.data.currentCigarette;
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : DEFAULT_PACK_CAPACITY);

    // 若整盒已全部取空，自动拆封全新一盒并抽取所点位置
    if (this.data.packCount <= 0) {
      const count = storageService.resetPackCount(curCig.id, capacity);
      const freshSlots = storageService.getPackSlots(curCig.id, capacity);
      this.setData({
        packCount: count,
        slotStates: freshSlots
      });
      this.executePullCigarette(index);
      return;
    }

    // 若点击的位置已经是空槽，轻微物理顿挫反馈，绝不误抽其他槽位
    if (Array.isArray(this.data.slotStates) && !this.data.slotStates[index]) {
      triggerHaptic('light');
      return;
    }

    this.executePullCigarette(index);
  },

  // 点击下方大按钮“抽出一支”
  onTriggerPullCigarette() {
    if (!this.data.isCurrentUnlocked) {
      triggerHaptic('medium');
      audioManager.playSwitchSound();
      const isIOS = detectIsIOS();
      wx.showModal({
        title: '🔒 名烟待解锁',
        content: `【${this.data.currentCigarette.name}】尚未解锁（${this.data.currentCigarette.unlockDesc}）。是否前往替烟展柜挑选已解锁名烟或${isIOS ? '了解特权专区' : '开通VIP'}直通畅享？`,
        confirmText: '去展柜',
        cancelText: isIOS ? '特权专区' : '开通VIP',
        confirmColor: '#f59e0b',
        cancelColor: '#38bdf8',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/shop/shop' });
          } else if (res.cancel) {
            wx.navigateTo({ url: '/pages/vip/vip' });
          }
        }
      });
      return;
    }
    if (this._fromTrial && this._trialPullUsed) {
      triggerHaptic('medium');
      toast.warn(detectIsIOS() ? '单支尝鲜仅限抽取 1 支，自律解锁或升级特权可畅享' : '单支尝鲜仅限抽取 1 支，解锁或开通 VIP 可无限畅享');
      return;
    }
    const curCig = this.data.currentCigarette;
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : DEFAULT_PACK_CAPACITY);
    let slots = Array.isArray(this.data.slotStates) && this.data.slotStates.length === capacity
      ? this.data.slotStates
      : storageService.getPackSlots(curCig.id, capacity);

    if (this.data.packCount <= 0 || !slots.some(Boolean)) {
      const count = storageService.resetPackCount(curCig.id, capacity);
      slots = storageService.getPackSlots(curCig.id, capacity);
      this.setData({
        packCount: count,
        slotStates: slots
      });
    }

    // 优先从第二排（前排 10..19）或剩余有烟槽位中取出一支
    let targetIndex = -1;
    for (let i = capacity - 1; i >= 0; i--) {
      if (slots[i]) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex === -1) targetIndex = 0;
    this.executePullCigarette(targetIndex);
  },

  // 执行腾讯 CG / UE5 级 6 阶段星河 S 弧线抽烟觉醒演出，点到谁谁就出来，原位置留空
  executePullCigarette(slotIndex) {
    if (this._isPullingInProgress || this._isNavigatingBack || this.data.isPulling) return;
    this._isPullingInProgress = true;
    audioManager.unlockAudio();
    this.clearPullTimers();
    this._isPullingInProgress = true;

    // 若当前烟盒盖未打开，先执行丝滑开盖物理翻转与拟真声振反馈，240ms 盖子掀起后再进入抽烟出鞘动效，彻底杜绝帧冲突卡顿
    if (!this.data.isLidOpen) {
      audioManager.playPackOpenSound();
      triggerHaptic('medium');
      this.setData({ isLidOpen: true });
      this._lidOpenDelayTimer = setTimeout(() => {
        this._lidOpenDelayTimer = null;
        this._startPullSequence(slotIndex);
      }, 240);
      return;
    }

    this._startPullSequence(slotIndex);
  },

  _startPullSequence(slotIndex) {
    audioManager.playPullCigaretteSound();
    const tier = this.data.currentVfxTier || 'lifetime';
    const pullHapticMap = { standard: 'light', day: 'medium', month: 'medium', lifetime: 'heavy' };
    triggerHaptic(pullHapticMap[tier] || 'heavy');

    const curCig = this.data.currentCigarette;
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : DEFAULT_PACK_CAPACITY);
    // 持久化当前槽位被抽空，并扣减盒内剩余数量
    const { slots: updatedSlots, remaining, consumedIndex } = storageService.consumePackSlot(curCig.id, slotIndex, capacity);
    const activeSlot = consumedIndex >= 0 ? consumedIndex : slotIndex;
    const flightStyles = computeFlightStyles(curCig);
    storageService.setSelectedCigaretteId(curCig.id);
    storageService.setHomeStickDigested(true);

    if (this._fromTrial) {
      this._trialPullUsed = true;
      storageService.setTrialCigaretteInfo({
        id: curCig.id,
        prevId: this._trialPrevId || 'chaotianmen_gold',
        remaining: 1
      });
    }

    this._pendingPackCount = remaining;
    this._pendingSlotStates = updatedSlots;
    this._canTapToConfirm = false;

    // 计算被点击槽位的水平偏移（用于从对应槽位垂直拔出并衔接 S 弧线起点）
    const isCigar = !!curCig.isCigar;
    let slotOffsetX = 0;
    if (isCigar) {
      const col = activeSlot % 5;
      slotOffsetX = Math.round((col - 2) * 32);
    } else if (this.data.packLayoutMode === 'row6') {
      // 6 支宽幕单排：0..5 对应 6 列，中心对称点为 2.5
      const col = activeSlot % 6;
      slotOffsetX = Math.round((col - 2.5) * 52);
    } else {
      // 原 20 支双排矩阵 (保留代码备用)
      const col = activeSlot % 10;
      const rowShift = activeSlot < 10 ? 4 : -4;
      slotOffsetX = Math.round((col - 4.5) * 28 + rowShift);
    }

    // 阶段 02 [点击触发] (0.00s ~ 0.24s)：盒底全息波纹 + 被点击的那支烟发光垂直拔升出仓
    this.setData({
      isPulling: true,
      pulledSlotIndex: activeSlot,
      isSlotEjected: false,
      slotOffsetX,
      flightStyles,
      isFlightVisible: true,
      isFlightActive: false
    });

    // 启动 60fps Canvas 2D 星河 S 弧线丝带 + 璀璨星尘粒子引擎
    this.startFlightVfxLoop(slotOffsetX);

    // 阶段 03 [拔升腾空] (0.24s ~ 0.58s)：被点烟支拔出槽位，该位置立即变为空槽留空，剩余数量同步更新
    this._pullTimer1 = setTimeout(() => {
      this._canTapToConfirm = true;
      triggerHaptic('medium');
      this.setData({
        isSlotEjected: true,
        isFlightActive: true,
        slotStates: updatedSlots,
        packCount: remaining
      });
    }, 240);

    // 阶段 04 [破空盘旋] (0.58s ~ 1.12s)：2D/3D 三阶贝塞尔 S 弧线大回环 + 蓝紫金交织星河丝带
    this._pullTimer2 = setTimeout(() => {
      triggerHaptic('light');
    }, 580);

    // 阶段 05 [弧线放大] (1.12s ~ 1.48s)：近景大透视螺旋掠镜推进
    this._pullTimer3 = setTimeout(() => {
      triggerHaptic('medium');
    }, 1120);

    // 阶段 06 [屏幕呈现]：未点燃东方流云金纹烟支 22° 悬停定格 (1.28s 定格)
    const settleDelay = 1280;
    this._pullTimer4 = setTimeout(() => {
      triggerHaptic('heavy');
      this.setData({
        slotStates: updatedSlots,
        packCount: remaining
      });
    }, settleDelay);
  },

  // 用户在名烟呈现界面点击屏幕任意位置后，才执行跳转回首页品吸
  onTapAwakenOverlay() {
    if (!this.data.isFlightVisible || !this._canTapToConfirm || this._isNavigatingBack) return;
    this._isNavigatingBack = true;
    this._canTapToConfirm = false;
    this.clearPullTimers();
    if (typeof this._pendingPackCount === 'number') {
      this.setData({
        packCount: this._pendingPackCount,
        slotStates: this._pendingSlotStates || this.data.slotStates
      });
    }
    this.onConfirmAndSmoke();
  },

  // 拆封全新一盒 (复位20支与全部槽位)
  onUnwrapNewPack() {
    if (this._fromTrial) {
      triggerHaptic('medium');
      toast.warn(detectIsIOS() ? '尝鲜模式仅限品吸 1 支，自律解锁或升级特权可无限拆包' : '尝鲜模式仅限品吸 1 支，解锁或开通 VIP 可无限拆包');
      return;
    }
    audioManager.unlockAudio();
    audioManager.playUnwrapSound();
    triggerHaptic('heavy');
    this.clearPullTimers();

    const curCig = this.data.currentCigarette;
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : DEFAULT_PACK_CAPACITY);
    const count = storageService.resetPackCount(curCig.id, capacity);
    const slotStates = storageService.getPackSlots(curCig.id, capacity);

    this.setData({
      packLayoutMode: PACK_DISPLAY_MODE,
      packCapacity: capacity,
      packCount: count,
      slotStates,
      isLidOpen: true,
      isPulling: false,
      isFlightVisible: false,
      isFlightActive: false,
      pulledSlotIndex: -1,
      isSlotEjected: false
    });
  },

  // 确认并携带这支烟返回主页品吸（烟进入首页代表盒内已消化该支烟，但首页处于未点燃待抽状态，不代表抽完）
  onConfirmAndSmoke() {
    if (this._isNavigatingBackConfirmed) return;
    this._isNavigatingBackConfirmed = true;
    this._isNavigatingBack = true;
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('medium');

    const curCig = this.data.currentCigarette;
    storageService.setSelectedCigaretteId(curCig.id);
    storageService.setHomeStickDigested(true);
    if (this._fromTrial) {
      storageService.setTrialCigaretteInfo({
        id: curCig.id,
        prevId: this._trialPrevId || 'chaotianmen_gold',
        remaining: 1
      });
    }
    try {
      wx.setStorageSync('SMOKEFREE_NEEDS_RESTART', true);
    } catch (e) {}

    const pages = getCurrentPages();
    const indexPageIndex = pages.findIndex(p => {
      const route = (p.route || p.__route__ || '').replace(/^\//, '');
      return route === 'pages/index/index';
    });
    if (indexPageIndex !== -1) {
      const delta = pages.length - 1 - indexPageIndex;
      if (delta > 0) {
        wx.navigateBack({ delta });
      }
    } else {
      if (pages.length > 1) {
        wx.navigateBack({ delta: pages.length - 1 });
      } else {
        wx.redirectTo({ url: '/pages/index/index' });
      }
    }
  },

  onNavigateBack() {
    if (this._isNavigatingBack) return;
    this._isNavigatingBack = true;
    navigateBackWithSound('/pages/shop/shop');
  },

  preventTouchMove() {}
});