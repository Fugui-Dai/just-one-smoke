// pages/pack/pack.js
import { storageService } from '../../utils/storageService.js';
import { audioManager } from '../../utils/audioManager.js';
import { triggerHaptic } from '../../utils/haptics.js';
import { toast } from '../../utils/toastService.js';
import { vipService } from '../../utils/vipService.js';
import { packFlightVfxRenderer } from '../../utils/canvasRenderer.js';
import {
  CIGARETTE_CATALOG,
  DEFAULT_CIGARETTE,
  getCigaretteById,
  isCigaretteUnlocked,
  computeFlightStyles
} from '../../utils/catalog.js';

function resolveCigaretteCategory(item) {
  // 1. 细支爆珠 (所有带爆珠或细支的名烟：炫赫门、贵烟跨越、利群江南韵、万宝路冰蓝、七星蓝莓双爆、宽窄五粮浓香、芙蓉王硬细支、中华双中支等)
  if (item.hasBead || item.widthType === 'slender' || ['xuanhemen_slender', 'guiyan_kuayue', 'liqun_jiangnan', 'kuanzhai_wuliang', 'furongwang_slender', 'chunghwa_double', 'marlboro_ice', 'mevius_blueberry'].includes(item.id)) {
    return 'slender';
  }
  // 2. 岁月经典 (老辈手卷旱烟、红塔山1956、白沙软白、红双喜软红、中南海8mg、高希霸雪茄、纯氧无烟)
  if (['hand_rolled_hanyan', 'hongtashan_100', 'baisha_white', 'shuangxi_classic', 'zhongnanhai_8mg', 'cohiba_siglo_vi', 'pure_oxygen_zen'].includes(item.id)) {
    return 'heritage';
  }
  // 3. 港外风尚 (南洋兄弟红双喜港版、寿百年黑俄、嘉士德卡斯特)
  if (['nanyang_shuangxi', 'sobranie_black', 'castor_vanilla'].includes(item.id)) {
    return 'imported';
  }
  // 4. 国烤名品 (默认精品国烤)
  return 'national';
}

function buildInitialCatalogList() {
  try {
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const currentSelectedId = storageService.getSelectedCigaretteId();

    return CIGARETTE_CATALOG.map(item => {
      const category = resolveCigaretteCategory(item);

      return {
        ...item,
        category,
        isEquipped: item.id === currentSelectedId,
        unlocked: isCigaretteUnlocked(item.id, totalSubs),
        currentStock: storageService.getPackCount(item.id, item.packCapacity || (item.isCigar ? 5 : 20))
      };
    });
  } catch (e) {
    return CIGARETTE_CATALOG.map(item => ({
      ...item,
      category: resolveCigaretteCategory(item),
      isEquipped: false,
      unlocked: true,
      currentStock: item.packCapacity || 20
    }));
  }
}

function measureSafeAreaSync() {
  try {
    const sysInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const menuInfo = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
    const statusBarHeight = sysInfo.statusBarHeight || 44;
    let navBarHeight = 44;
    let capsuleRightSpace = 96;

    if (menuInfo && menuInfo.top) {
      navBarHeight = (menuInfo.top - statusBarHeight) * 2 + menuInfo.height;
      capsuleRightSpace = (sysInfo.windowWidth - menuInfo.left) + 12;
    }
    return { statusBarHeight, navBarHeight, capsuleRightSpace };
  } catch (e) {
    return { statusBarHeight: 44, navBarHeight: 44, capsuleRightSpace: 100 };
  }
}

const INITIAL_SAFE_AREA = measureSafeAreaSync();
const INITIAL_CATALOG = buildInitialCatalogList();

Page({
  data: {
    // 导航与屏幕尺寸适配
    statusBarHeight: INITIAL_SAFE_AREA.statusBarHeight,
    navBarHeight: INITIAL_SAFE_AREA.navBarHeight,
    capsuleRightSpace: INITIAL_SAFE_AREA.capsuleRightSpace,

    isMuted: false,

    // 视图模式：'shelf' (货架整柜陈列视图) | '3d_pack' (单盒 3D 深度开盒抽烟视图)
    viewMode: '3d_pack',
    activeFilter: 'all', // all | national | slender | imported | heritage

    // 当前选中的名烟与烟盒
    currentCigarette: DEFAULT_CIGARETTE,
    isCurrentUnlocked: true,
    packCapacity: 20, // 盒内总容量 (20支 / 雪茄5支)
    packCount: 20, // 盒内剩余烟支数量
    slotArray: [], // 槽位索引数组 [0..19] 或 [0..4]
    slotStates: [], // 每个槽位是否有烟状态数组 [true, false, ...]
    flightStyles: computeFlightStyles(DEFAULT_CIGARETTE),

    // 3D 动画交互状态
    isLidOpen: true, // 盒盖默认状态
    isPulling: false, // 正在抽出一支烟的动画
    isSlotEjected: false, // 烟支是否已拔出槽位进入空中轨迹
    slotOffsetX: 0, // 选中烟支相对于烟盒中心的水平偏移 (rpx)
    vfxStageLabel: '01 [竖壳静置]', // 分镜阶段 HUD 标签
    isFlightVisible: false, // 抽出烟支是否悬浮在空中
    isFlightActive: false, // SSR 华丽特效激活态
    pulledSlotIndex: -1, // 被抽出的烟支槽位

    // 弹窗
    showDrawnModal: false,

    // 页面扫光动效控制：进页面完成前不加载扫光动画，等平稳进入后再启动
    enableSheen: false,

    // 货架陈列列表与筛选列表
    catalogList: INITIAL_CATALOG,
    filteredCatalogList: INITIAL_CATALOG
  },

  onLoad(query) {
    this._skipFirstShowRefresh = true;

    const targetId = (query && query.id) ? query.id : storageService.getSelectedCigaretteId();
    const curCig = getCigaretteById(targetId) || DEFAULT_CIGARETTE;

    // 默认进入 3D 抽烟开盒视图
    const mode = (query && query.mode === 'shelf') ? 'shelf' : '3d_pack';
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    // 读取真实剩余槽位状态与剩余数量（绝不强制重置未抽完的烟盒，保留被抽走后的空槽位置）
    const slotStates = storageService.getPackSlots(curCig.id, capacity);
    const count = slotStates.filter(Boolean).length;

    const records = storageService.getRecords();
    const totalSubs = records.length;
    const isTrial = (query && query.from === 'trial');
    const unlocked = isTrial || isCigaretteUnlocked(curCig.id, totalSubs);
    const currentSelectedId = storageService.getSelectedCigaretteId();
    // 只有当前正在抽的烟才默认打开烟盖，其他的烟默认闭合烟盖
    const shouldOpenLid = Boolean(unlocked && (curCig.id === currentSelectedId));
    const flightStyles = computeFlightStyles(curCig);

    const slotArray = [];
    for (let i = 0; i < capacity; i++) {
      slotArray.push(i);
    }

    // 单次原子化 setData 直出目标名烟 3D 状态，包含完整 flightStyles 与独立槽位状态
    this.setData({
      viewMode: mode,
      isMuted: audioManager.isMuted(),
      enableSheen: false,
      vipTheme: vipService.getVipTheme(),
      currentCigarette: curCig,
      isCurrentUnlocked: unlocked,
      packCapacity: capacity,
      packCount: count,
      slotArray,
      slotStates,
      flightStyles,
      isLidOpen: shouldOpenLid,
      isPulling: false,
      isSlotEjected: false,
      slotOffsetX: 0,
      vfxStageLabel: '01 [竖壳静置]',
      isFlightVisible: false,
      isFlightActive: false,
      pulledSlotIndex: -1,
      showDrawnModal: false
    });

    if (mode === 'shelf') {
      this.refreshCatalogList();
    }
  },

  onReady() {
    if (this.sheenTimer) clearTimeout(this.sheenTimer);
    if (this.data.viewMode === 'shelf') {
      this.sheenTimer = setTimeout(() => {
        this.setData({ enableSheen: true });
      }, 2600);
    } else {
      this.initFlightCanvas();
    }
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
          { slotOffsetX: pxOffset }
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
    if (this._skipFirstShowRefresh) {
      this._skipFirstShowRefresh = false;
      this.setData({
        vipTheme: vipService.getVipTheme()
      });
      return;
    }
    const curCig = this.data.currentCigarette || DEFAULT_CIGARETTE;
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    const slotStates = storageService.getPackSlots(curCig.id, capacity);
    const count = slotStates.filter(Boolean).length;
    this.setData({
      isMuted: audioManager.isMuted(),
      vipTheme: vipService.getVipTheme(),
      enableSheen: false,
      packCapacity: capacity,
      packCount: count,
      slotStates
    });
    if (this.data.viewMode === 'shelf') {
      this.refreshCatalogList();
      if (this.sheenTimer) clearTimeout(this.sheenTimer);
      this.sheenTimer = setTimeout(() => {
        this.setData({ enableSheen: true });
      }, 3000);
    }
  },

  clearPullTimers() {
    if (this._pullTimer1) { clearTimeout(this._pullTimer1); this._pullTimer1 = null; }
    if (this._pullTimer2) { clearTimeout(this._pullTimer2); this._pullTimer2 = null; }
    if (this._pullTimer3) { clearTimeout(this._pullTimer3); this._pullTimer3 = null; }
    if (this._pullTimer4) { clearTimeout(this._pullTimer4); this._pullTimer4 = null; }
    if (this._pullTimer5) { clearTimeout(this._pullTimer5); this._pullTimer5 = null; }
    this.stopFlightVfxLoop();
  },

  onHide() {
    if (this.sheenTimer) clearTimeout(this.sheenTimer);
    this.clearPullTimers();
    this.setData({ enableSheen: false });
  },

  onUnload() {
    if (this.sheenTimer) clearTimeout(this.sheenTimer);
    this.clearPullTimers();
    this.setData({ enableSheen: false });
  },

  measureSafeArea() {
    this.setData(measureSafeAreaSync());
  },

  // 刷新所有品牌解锁状态、分类归属与余量
  refreshCatalogList() {
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const currentSelectedId = storageService.getSelectedCigaretteId();

    const list = CIGARETTE_CATALOG.map(item => {
      const category = resolveCigaretteCategory(item);

      return {
        ...item,
        category,
        isEquipped: item.id === currentSelectedId,
        unlocked: isCigaretteUnlocked(item.id, totalSubs),
        currentStock: storageService.getPackCount(item.id, item.packCapacity || (item.isCigar ? 5 : 20))
      };
    });

    let filtered = list;
    if (this.data.activeFilter !== 'all') {
      filtered = list.filter(item => item.category === this.data.activeFilter);
    }

    this.setData({
      catalogList: list,
      filteredCatalogList: filtered
    });
  },

  // 切换货架分类筛选
  onSelectFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    if (filter === this.data.activeFilter) return;

    audioManager.playSwitchSound();
    triggerHaptic('light');

    let filtered = this.data.catalogList;
    if (filter !== 'all') {
      filtered = this.data.catalogList.filter(item => item.category === filter);
    }

    this.setData({
      activeFilter: filter,
      filteredCatalogList: filtered
    });
  },

  // 切换视图模式 (货架陈列 vs 3D 深度开盒)
  switchViewMode(mode) {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('medium');
    this.setData({ viewMode: mode }, () => {
      if (mode === '3d_pack') {
        this.initFlightCanvas();
      }
    });
  },

  toggleViewModeBtn() {
    const nextMode = this.data.viewMode === 'shelf' ? '3d_pack' : 'shelf';
    this.switchViewMode(nextMode);
  },

  // 初始化或切换当前展示的烟盒
  initCigarettePack(cig) {
    const capacity = cig.packCapacity || (cig.isCigar ? 5 : 20);
    const slotStates = storageService.getPackSlots(cig.id, capacity);
    const count = slotStates.filter(Boolean).length;
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const unlocked = isCigaretteUnlocked(cig.id, totalSubs);
    const currentSelectedId = storageService.getSelectedCigaretteId();
    // 只有当前正在抽的烟才默认打开烟盖，其他的烟默认闭合烟盖
    const shouldOpenLid = Boolean(unlocked && (cig.id === currentSelectedId));

    const slotArray = [];
    for (let i = 0; i < capacity; i++) {
      slotArray.push(i);
    }

    const flightStyles = computeFlightStyles(cig);

    this.setData({
      currentCigarette: cig,
      isCurrentUnlocked: unlocked,
      packCapacity: capacity,
      packCount: count,
      slotArray,
      slotStates,
      flightStyles,
      isLidOpen: shouldOpenLid,
      isPulling: false,
      isFlightVisible: false,
      isFlightActive: false,
      pulledSlotIndex: -1,
      isSlotEjected: false,
      slotOffsetX: 0,
      vfxStageLabel: '01 [竖壳静置] · 轻触烟支唤起星河',
      showDrawnModal: false
    });
  },

  // 在货架上点击某个烟盒卡片：直接进入 3D 预览
  onTapShelfPack(e) {
    const now = Date.now();
    if (this._lastShelfTapTime && (now - this._lastShelfTapTime < 800)) {
      return;
    }
    this._lastShelfTapTime = now;

    const item = e.currentTarget.dataset.item;
    if (!item) return;
    audioManager.unlockAudio();

    if (!item.unlocked) {
      triggerHaptic('medium');
      toast.warn(item.unlockDesc);
      return;
    }

    const isCurrent = item.id === storageService.getSelectedCigaretteId();
    if (isCurrent) {
      audioManager.playPackOpenSound();
    } else {
      audioManager.playSwitchSound();
    }
    triggerHaptic('medium');

    this.initCigarettePack(item);
    this.setData({
      viewMode: '3d_pack'
    }, () => {
      this.initFlightCanvas();
    });
    this.refreshCatalogList();
  },

  // 从货架卡片直接装配该烟
  onEquipFromShelf(e) {
    const now = Date.now();
    if (this._lastShelfTapTime && (now - this._lastShelfTapTime < 800)) {
      return;
    }
    this._lastShelfTapTime = now;

    const item = e.currentTarget.dataset.item;
    if (!item) return;
    audioManager.unlockAudio();

    if (!item.unlocked) {
      triggerHaptic('medium');
      toast.warn(item.unlockDesc);
      return;
    }

    storageService.setSelectedCigaretteId(item.id);
    audioManager.playSwitchSound();
    triggerHaptic('heavy');

    this.initCigarettePack(item);
    this.refreshCatalogList();

    toast.success(`已成功装配【${item.name}】`);
  },

  // 从货架直接进入该烟的 3D 拟真展台
  onInspect3DFromShelf(e) {
    const item = e.currentTarget.dataset.item;
    audioManager.unlockAudio();

    if (!item.unlocked) {
      triggerHaptic('medium');
      toast.warn(item.unlockDesc);
      return;
    }

    const isCurrent = item.id === storageService.getSelectedCigaretteId();
    if (isCurrent) {
      audioManager.playPackOpenSound();
    } else {
      audioManager.playSwitchSound();
    }
    triggerHaptic('medium');

    this.initCigarettePack(item);
    this.setData({
      viewMode: '3d_pack'
    }, () => {
      this.initFlightCanvas();
    });
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

  // 点击盒内某支烟直接抽取（点到谁谁就出来，然后该位置空着）
  onTapCigaretteSlot(e) {
    const index = Number(e.currentTarget.dataset.index);
    if (!this.data.isCurrentUnlocked) {
      triggerHaptic('medium');
      toast.warn(this.data.currentCigarette.unlockDesc);
      return;
    }
    const curCig = this.data.currentCigarette;
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : 20);

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

    // 若点击的位置已经是空槽，提示该位置烟支已取出，绝不误抽其他槽位
    if (Array.isArray(this.data.slotStates) && !this.data.slotStates[index]) {
      triggerHaptic('light');
      toast.info('该位置烟支已取出，请点选其他烟支');
      return;
    }

    this.executePullCigarette(index);
  },

  // 点击下方大按钮“抽出一支”
  onTriggerPullCigarette() {
    if (!this.data.isCurrentUnlocked) {
      triggerHaptic('medium');
      toast.warn(this.data.currentCigarette.unlockDesc);
      return;
    }
    const curCig = this.data.currentCigarette;
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
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
    if (this.data.isPulling) return;
    audioManager.unlockAudio();
    this.clearPullTimers();

    if (!this.data.isLidOpen) {
      audioManager.playPackOpenSound();
      this.setData({ isLidOpen: true });
    }

    audioManager.playPullCigaretteSound();
    triggerHaptic('heavy');

    const curCig = this.data.currentCigarette;
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    // 持久化当前槽位被抽空，并扣减盒内剩余数量
    const { slots: updatedSlots, remaining, consumedIndex } = storageService.consumePackSlot(curCig.id, slotIndex, capacity);
    const activeSlot = consumedIndex >= 0 ? consumedIndex : slotIndex;
    const flightStyles = computeFlightStyles(curCig);
    storageService.setSelectedCigaretteId(curCig.id);
    storageService.setHomeStickDigested(true);

    this._pendingPackCount = remaining;
    this._pendingSlotStates = updatedSlots;
    this._canTapToConfirm = false;

    // 计算被点击槽位的水平偏移（用于从对应槽位垂直拔出并衔接 S 弧线起点）
    const isCigar = !!curCig.isCigar;
    const col = isCigar ? (activeSlot % 5) : (activeSlot % 10);
    const rowShift = isCigar ? 0 : (activeSlot < 10 ? 4 : -4);
    const slotOffsetX = isCigar
      ? Math.round((col - 2) * 32)
      : Math.round((col - 4.5) * 28 + rowShift);

    // 阶段 02 [点击触发] (0.00s ~ 0.24s)：盒底全息波纹 + 被点击的那支烟发光垂直拔升出仓
    this.setData({
      isPulling: true,
      pulledSlotIndex: activeSlot,
      isSlotEjected: false,
      slotOffsetX,
      vfxStageLabel: '',
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

    // 阶段 06 [屏幕呈现] (1.48s 起常驻定格)：未点燃东方流云金纹烟支 28° 悬停定格 + 等待用户点击屏幕跳转
    this._pullTimer4 = setTimeout(() => {
      triggerHaptic('heavy');
      this.setData({
        slotStates: updatedSlots,
        packCount: remaining
      });
    }, 1480);
  },

  // 用户在名烟呈现界面点击屏幕任意位置后，才执行跳转回首页品吸
  onTapAwakenOverlay() {
    if (!this.data.isFlightVisible || !this._canTapToConfirm) return;
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
    audioManager.unlockAudio();
    audioManager.playUnwrapSound();
    triggerHaptic('heavy');
    this.clearPullTimers();

    const curCig = this.data.currentCigarette;
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    const count = storageService.resetPackCount(curCig.id, capacity);
    const slotStates = storageService.getPackSlots(curCig.id, capacity);

    this.setData({
      packCapacity: capacity,
      packCount: count,
      slotStates,
      isLidOpen: true,
      isPulling: false,
      isFlightVisible: false,
      isFlightActive: false,
      pulledSlotIndex: -1,
      isSlotEjected: false,
      vfxStageLabel: '01 [竖壳静置] · 轻触烟支唤起星河'
    });

    toast.success(`拆封全新一盒【${curCig.name}】`);

    this.refreshCatalogList();
  },

  // 确认并携带这支烟返回主页品吸（烟进入首页代表盒内已消化该支烟，但首页处于未点燃待抽状态，不代表抽完）
  onConfirmAndSmoke() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('medium');

    storageService.setSelectedCigaretteId(this.data.currentCigarette.id);
    storageService.setHomeStickDigested(true);
    try {
      wx.setStorageSync('SMOKEFREE_NEEDS_RESTART', true);
    } catch (e) {}

    const pages = getCurrentPages();
    const indexPageIndex = pages.findIndex(p => p.route === 'pages/index/index');
    if (indexPageIndex !== -1) {
      const delta = pages.length - 1 - indexPageIndex;
      wx.navigateBack({ delta });
    } else {
      wx.reLaunch({ url: '/pages/index/index' });
    }
  },

  closeDrawnModal() {
    this.clearPullTimers();
    this.setData({
      showDrawnModal: false,
      isFlightVisible: false,
      isFlightActive: false,
      isPulling: false,
      pulledSlotIndex: -1,
      isSlotEjected: false
    });
  },

  onNavigateBack() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
    } else {
      wx.redirectTo({ url: '/pages/shop/shop' });
    }
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

  preventTouchMove() {}
});