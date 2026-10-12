// pages/shop/shop.js
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
      isEquipped: item.id === DEFAULT_CIGARETTE.id,
      unlocked: true,
      currentStock: item.packCapacity || (item.isCigar ? 5 : 20)
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
    // 导航与屏幕尺寸适配 (Frame 0 同步就绪)
    statusBarHeight: INITIAL_SAFE_AREA.statusBarHeight,
    navBarHeight: INITIAL_SAFE_AREA.navBarHeight,
    capsuleRightSpace: INITIAL_SAFE_AREA.capsuleRightSpace,

    isMuted: false,

    // 视图模式：'shelf' (货架整柜陈列视图) | '3d_pack' (单盒 3D 深度开盒抽烟视图)
    viewMode: 'shelf',
    activeFilter: 'all', // all | national | slender | cigar

    // 当前选中的名烟与烟盒
    currentCigarette: DEFAULT_CIGARETTE,
    isCurrentUnlocked: true,
    packCapacity: 20, // 盒内总容量
    packCount: 20, // 盒内剩余烟支数量
    slotArray: [], // 槽位索引数组 [0..19] 或 [0..4]
    slotStates: [], // 每个槽位是否有烟状态数组 [true, false, ...]
    flightStyles: computeFlightStyles(DEFAULT_CIGARETTE),

    // 3D 动画交互状态 (6 阶段腾讯 CG 级分镜)
    isLidOpen: false, // 盒盖是否翻开（默认严格关闭，仅当前使用烟开盖）
    isPulling: false, // 正在抽出一支烟的动画
    isFlightVisible: false, // 抽出烟支是否悬浮在空中
    isFlightActive: false, // SSR 华丽特效激活态
    pulledSlotIndex: -1, // 被抽出的烟支槽位
    pullVfxType: 'vfx2', // 当前出烟演出特效 ('vfx1': 经典出鞘 360° | 'vfx2': 九天游龙 720°)
    isSlotEjected: false, // 盒内烟支是否已完成拔升出仓并交接给全屏S弧线
    slotOffsetX: 0, // 被点击槽位相对烟盒中心的水平偏移 (rpx)
    vfxStageLabel: '01 [竖壳静置]', // 当前赛博分镜阶段标签

    // VIP 状态
    isVipUser: false,

    // 弹窗
    showDrawnModal: false,
    showUnlockDialog: false,
    dialogCigarette: null,
    dialogTotalSubs: 0,
    dialogNeededCount: 0,
    dialogRemainingCount: 0,
    dialogProgressPercent: 0,

    // 页面扫光动效控制：进页面完成前不加载扫光动画，等平稳进入后再启动
    enableSheen: false,

    // 货架陈列列表与筛选列表 (同步首屏即刻就绪，彻底杜绝进入黑屏白屏等待)
    catalogList: INITIAL_CATALOG,
    filteredCatalogList: INITIAL_CATALOG
  },

  onLoad(query) {
    this._skipFirstShowRefresh = true;

    const savedCigId = storageService.getSelectedCigaretteId();
    const curCig = getCigaretteById(savedCigId) || DEFAULT_CIGARETTE;
    const initialVfxType = storageService.getPullVfxType ? storageService.getPullVfxType() : 'vfx2';

    // 如果通过参数指定直接进入 3D 抽烟视图
    const mode = (query && query.mode === '3d') ? '3d_pack' : 'shelf';

    this.setData({
      viewMode: mode,
      pullVfxType: initialVfxType,
      isMuted: audioManager.isMuted(),
      isVipUser: vipService.isVip(),
      vipTheme: vipService.getVipTheme(),
      enableSheen: false
    });

    this.initCigarettePack(curCig);
    this.refreshCatalogList();
  },

  onReady() {
    if (this.data.viewMode === '3d_pack') {
      this.initFlightCanvas();
    }
    // 腾讯游戏商城设计规范：进店先保持静帧陈列，让视线从容聚焦商品细节，静置后再开启低频流光
    if (this.sheenTimer) clearTimeout(this.sheenTimer);
    this.sheenTimer = setTimeout(() => {
      this.setData({ enableSheen: true });
    }, 2600);
  },

  initFlightCanvas(onInitialized) {
    try {
      const query = wx.createSelectorQuery().in(this);
      query.select('#packFlightCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0] || !res[0].node) {
            if (typeof onInitialized === 'function') onInitialized(false);
            return;
          }
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          const sysInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
          const dpr = Math.min(sysInfo.pixelRatio || 2, 2.5);
          const width = res[0].width || sysInfo.windowWidth || 375;
          const height = res[0].height || sysInfo.windowHeight || 812;

          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);

          this._flightCanvas = canvas;
          this._flightCtx = ctx;
          this._flightCanvasW = width;
          this._flightCanvasH = height;
          if (typeof onInitialized === 'function') onInitialized(true);
        });
    } catch (e) {
      if (typeof onInitialized === 'function') onInitialized(false);
    }
  },

  // 切换抽烟特效 (特效1: 经典出鞘 360° | 特效2: 九天游龙 720°)
  onSwitchPullVfx(e) {
    const vfx = e.currentTarget.dataset.vfx;
    if (!vfx || vfx === this.data.pullVfxType) return;
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('medium');
    const savedType = storageService.setPullVfxType(vfx);
    this.setData({
      pullVfxType: savedType
    });
    const label = savedType === 'vfx1' ? '特效1：经典出鞘 360°' : '特效2：九天游龙 720°';
    toast.info(`已切换至【${label}】`);
  },

  startFlightVfxLoop(slotOffsetX = 0) {
    this.stopFlightVfxLoop();
    packFlightVfxRenderer.reset();
    this._flightStartTime = Date.now();
    const pxOffset = (slotOffsetX || 0) * 0.5;
    const vfxType = this.data.pullVfxType || 'vfx2';

    const step = () => {
      if (!this._flightStartTime) return;
      const elapsedSec = (Date.now() - this._flightStartTime) / 1000;
      if (this._flightCtx && this._flightCanvasW && this._flightCanvasH) {
        packFlightVfxRenderer.render(
          this._flightCtx,
          this._flightCanvasW,
          this._flightCanvasH,
          elapsedSec,
          { slotOffsetX: pxOffset, vfxType }
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
    this._isNavigatingToPack = false;
    this._lastCigaretteTapTime = 0;
    this._isPullingInProgress = false;
    this._isNavigatingBack = false;
    this._isNavigatingToVip = false;

    if (this._skipFirstShowRefresh) {
      this._skipFirstShowRefresh = false;
      this.setData({
        vipTheme: vipService.getVipTheme()
      });
      return;
    }
    this.setData({
      isMuted: audioManager.isMuted(),
      isVipUser: vipService.isVip(),
      vipTheme: vipService.getVipTheme(),
      enableSheen: false
    });
    this.refreshCatalogList();
    if (this.sheenTimer) clearTimeout(this.sheenTimer);
    // 从 3D 页面返回时重置静置冷却期，杜绝返回瞬间立刻扫光晃眼
    this.sheenTimer = setTimeout(() => {
      this.setData({ enableSheen: true });
    }, 3000);
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
    this._isNavigatingToPack = false;
    this._isPullingInProgress = false;
  },

  onUnload() {
    if (this.sheenTimer) clearTimeout(this.sheenTimer);
    this.clearPullTimers();
    this.setData({ enableSheen: false });
    this._isNavigatingToPack = false;
    this._isPullingInProgress = false;
  },

  measureSafeArea() {
    this.setData(measureSafeAreaSync());
  },

  // 刷新所有品牌解锁状态、分类归属与余量
  refreshCatalogList() {
    const isVip = vipService.isVip();
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
      isVipUser: isVip,
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
  initCigarettePack(cig, targetViewMode, callback) {
    const capacity = cig.packCapacity || (cig.isCigar ? 5 : 20);
    const slotStates = storageService.getPackSlots(cig.id, capacity);
    const count = slotStates.filter(Boolean).length;
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const unlocked = isCigaretteUnlocked(cig.id, totalSubs);
    const currentSelectedId = storageService.getSelectedCigaretteId();
    // 只有当前正在抽的烟才默认打开烟盖，其他的烟默认严格闭合烟盖
    const shouldOpenLid = Boolean(unlocked && (cig.id === currentSelectedId));

    const slotArray = [];
    for (let i = 0; i < capacity; i++) {
      slotArray.push(i);
    }

    const flightStyles = computeFlightStyles(cig);

    const updatePayload = {
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
    };

    if (targetViewMode) {
      updatePayload.viewMode = targetViewMode;
    }

    this.setData(updatePayload, () => {
      if (typeof callback === 'function') {
        callback();
      }
    });
  },

  // 在货架上点击某个烟盒卡片：进入新的烟盒开盒页面 (仅做 3D 展台预览，若正在抽则默认开盖，否则合盖)
  onTapShelfPack(e) {
    // 腾讯游戏防重规范：首触独占生效 (Leading-Edge Throttle Lock)
    // 快速重复点击同一个烟或不同的烟时，只按第一下算数，其余快速点击全部静默丢弃
    const now = Date.now();
    if (this._isNavigatingToPack || (this._lastCigaretteTapTime && (now - this._lastCigaretteTapTime < 800))) {
      return;
    }
    this._lastCigaretteTapTime = now;

    const item = e.currentTarget.dataset.item;
    if (!item) return;

    audioManager.unlockAudio();

    if (!item.unlocked) {
      this.openUnlockDialog(item);
      return;
    }

    this._isNavigatingToPack = true;

    const isCurrent = item.id === storageService.getSelectedCigaretteId();
    if (isCurrent) {
      audioManager.playPackOpenSound();
    } else {
      audioManager.playSwitchSound();
    }
    triggerHaptic('medium');

    if (this.sheenTimer) {
      clearTimeout(this.sheenTimer);
      this.sheenTimer = null;
    }
    if (this.data.enableSheen) {
      this.setData({ enableSheen: false });
    }

    wx.navigateTo({
      url: `/pages/pack/pack?id=${item.id}&from=shop`,
      fail: () => {
        this._isNavigatingToPack = false;
      },
      complete: () => {
        setTimeout(() => {
          this._isNavigatingToPack = false;
        }, 600);
      }
    });
  },

  // 从货架卡片直接装配该烟
  onEquipFromShelf(e) {
    const now = Date.now();
    if (this._isNavigatingToPack || (this._lastCigaretteTapTime && (now - this._lastCigaretteTapTime < 800))) {
      return;
    }
    this._lastCigaretteTapTime = now;

    const item = e.currentTarget.dataset.item;
    if (!item) return;
    audioManager.unlockAudio();

    if (!item.unlocked) {
      this.openUnlockDialog(item);
      return;
    }

    storageService.setSelectedCigaretteId(item.id);
    audioManager.playSwitchSound();
    triggerHaptic('heavy');

    this.initCigarettePack(item);
    this.refreshCatalogList();

    toast.success(`已成功装配【${item.name}】`);
  },

  // 从货架直接进入该烟的开盒页面
  onInspect3DFromShelf(e) {
    const now = Date.now();
    if (this._isNavigatingToPack || (this._lastCigaretteTapTime && (now - this._lastCigaretteTapTime < 800))) {
      return;
    }
    this._lastCigaretteTapTime = now;

    const item = e.currentTarget.dataset.item;
    if (!item) return;
    audioManager.unlockAudio();

    if (!item.unlocked) {
      this.openUnlockDialog(item);
      return;
    }

    this._isNavigatingToPack = true;

    const isCurrent = item.id === storageService.getSelectedCigaretteId();
    if (isCurrent) {
      audioManager.playPackOpenSound();
    } else {
      audioManager.playSwitchSound();
    }
    triggerHaptic('medium');

    if (this.sheenTimer) {
      clearTimeout(this.sheenTimer);
      this.sheenTimer = null;
    }
    if (this.data.enableSheen) {
      this.setData({ enableSheen: false });
    }

    wx.navigateTo({
      url: `/pages/pack/pack?id=${item.id}&from=shop`,
      fail: () => {
        this._isNavigatingToPack = false;
      },
      complete: () => {
        setTimeout(() => {
          this._isNavigatingToPack = false;
        }, 600);
      }
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
    if (this._isPullingInProgress || this.data.isPulling) return;
    this._isPullingInProgress = true;
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
    const { slots: updatedSlots, remaining, consumedIndex } = storageService.consumePackSlot(curCig.id, slotIndex, capacity);
    const activeSlot = consumedIndex >= 0 ? consumedIndex : slotIndex;
    const flightStyles = computeFlightStyles(curCig);
    storageService.setSelectedCigaretteId(curCig.id);
    storageService.setHomeStickDigested(true);

    this._pendingPackCount = remaining;
    this._pendingSlotStates = updatedSlots;
    this._canTapToConfirm = false;

    const isCigar = !!curCig.isCigar;
    const col = isCigar ? (activeSlot % 5) : (activeSlot % 10);
    const rowShift = isCigar ? 0 : (activeSlot < 10 ? 4 : -4);
    const slotOffsetX = isCigar
      ? Math.round((col - 2) * 32)
      : Math.round((col - 4.5) * 28 + rowShift);

    // 阶段 02 [点击触发] (0.00s ~ 0.24s)
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

    this.startFlightVfxLoop(slotOffsetX);

    // 阶段 03 [拔升腾空] (0.24s ~ 0.58s)
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

    // 阶段 04 [破空盘旋] (0.58s ~ 1.12s)
    this._pullTimer2 = setTimeout(() => {
      triggerHaptic('light');
    }, 580);

    // 阶段 05 [弧线放大] (1.12s ~ 1.48s)
    this._pullTimer3 = setTimeout(() => {
      triggerHaptic('medium');
    }, 1120);

    // 阶段 06 [屏幕呈现] (特效1: 1.28s定格, 特效2: 1.48s定格，等待用户点击屏幕跳转)
    const settleDelay = this.data.pullVfxType === 'vfx1' ? 1280 : 1480;
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

  // 拆封全新一盒 (复位20支)
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

  // 确认并携带这支烟返回主页品吸
  onConfirmAndSmoke() {
    if (this._isNavigatingBack) return;
    this._isNavigatingBack = true;
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
    this._isPullingInProgress = false;
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
    if (this.data.viewMode === '3d_pack') {
      this.setData({ viewMode: 'shelf' });
      return;
    }
    wx.navigateBack({ delta: 1 });
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

  // 开启双路径解锁决策弹窗 (Tencent Games Conversion Modal)
  openUnlockDialog(item) {
    if (this.data.showUnlockDialog) return;
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('medium');

    const records = storageService.getRecords();
    const totalSubs = records.length;
    const needed = item.requiredCount || 0;
    const remaining = Math.max(0, needed - totalSubs);
    const progressPercent = needed > 0 ? Math.min(100, Math.round((totalSubs / needed) * 100)) : 100;

    this.setData({
      showUnlockDialog: true,
      dialogCigarette: item,
      dialogTotalSubs: totalSubs,
      dialogNeededCount: needed,
      dialogRemainingCount: remaining,
      dialogProgressPercent: progressPercent
    });
  },

  closeUnlockDialog() {
    audioManager.playSwitchSound();
    triggerHaptic('light');
    this._isNavigatingToPack = false;
    this._lastCigaretteTapTime = 0;
    this.setData({
      showUnlockDialog: false
    });
  },

  onGoToVipFromDialog() {
    if (this._isNavigatingToVip) return;
    this._isNavigatingToVip = true;
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('medium');
    this.setData({
      showUnlockDialog: false
    });
    wx.navigateTo({
      url: '/pages/vip/vip',
      fail: () => {
        this._isNavigatingToVip = false;
      },
      complete: () => {
        setTimeout(() => {
          this._isNavigatingToVip = false;
        }, 600);
      }
    });
  },

  onTrialSmokeFromDialog() {
    if (this._isNavigatingToPack) return;
    this._isNavigatingToPack = true;
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('heavy');

    const cig = this.data.dialogCigarette;
    if (!cig) {
      this.setData({ showUnlockDialog: false });
      this._isNavigatingToPack = false;
      return;
    }

    this.setData({ showUnlockDialog: false });

    // 装备该烟为当前使用烟支，并设置重启标记
    storageService.setSelectedCigaretteId(cig.id);
    try {
      wx.setStorageSync('SMOKEFREE_NEEDS_RESTART', true);
    } catch (e) {}

    toast.success(`已装配【${cig.name}】尝鲜品吸！`);

    // 导航至 3D 深度开盒页面尝鲜抽取体验
    wx.navigateTo({
      url: `/pages/pack/pack?id=${cig.id}&from=trial`,
      fail: () => {
        this._isNavigatingToPack = false;
      },
      complete: () => {
        setTimeout(() => {
          this._isNavigatingToPack = false;
        }, 600);
      }
    });
  },

  onTapVipBanner() {
    if (this._isNavigatingToVip) return;
    this._isNavigatingToVip = true;
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    wx.navigateTo({
      url: '/pages/vip/vip',
      fail: () => {
        this._isNavigatingToVip = false;
      },
      complete: () => {
        setTimeout(() => {
          this._isNavigatingToVip = false;
        }, 600);
      }
    });
  },

  preventTouchMove() {}
});