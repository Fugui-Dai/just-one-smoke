// pages/pack/pack.js
import { storageService } from '../../utils/storageService.js';
import { audioManager } from '../../utils/audioManager.js';
import { triggerHaptic } from '../../utils/haptics.js';
import { toast } from '../../utils/toastService.js';
import {
  CIGARETTE_CATALOG,
  DEFAULT_CIGARETTE,
  getCigaretteById,
  isCigaretteUnlocked
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
    packCount: 20, // 盒内剩余烟支数量
    slotArray: [], // 槽位索引数组 [0..19] 或 [0..4]

    // 3D 动画交互状态
    isLidOpen: false, // 盒盖是否翻开
    isPulling: false, // 正在抽出一支烟的动画
    isFlightVisible: false, // 抽出烟支是否悬浮在空中
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
    const count = storageService.getPackCount(curCig.id, capacity);
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const isTrial = (query && query.from === 'trial');
    const unlocked = isTrial || isCigaretteUnlocked(curCig.id, totalSubs);
    const currentSelectedId = storageService.getSelectedCigaretteId();
    const shouldOpenLid = curCig.id === currentSelectedId;

    const slotArray = [];
    for (let i = 0; i < capacity; i++) {
      slotArray.push(i);
    }

    // 单次原子化 setData 直出目标名烟 3D 状态，彻底杜绝默认烟闪屏与三次连续 setData 卡顿
    this.setData({
      viewMode: mode,
      isMuted: audioManager.isMuted(),
      enableSheen: false,
      currentCigarette: curCig,
      isCurrentUnlocked: unlocked,
      packCount: count,
      slotArray,
      isLidOpen: shouldOpenLid,
      isPulling: false,
      isFlightVisible: false,
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
    }
  },

  onShow() {
    if (this._skipFirstShowRefresh) {
      this._skipFirstShowRefresh = false;
      return;
    }
    this.setData({
      isMuted: audioManager.isMuted(),
      enableSheen: false
    });
    if (this.data.viewMode === 'shelf') {
      this.refreshCatalogList();
      if (this.sheenTimer) clearTimeout(this.sheenTimer);
      this.sheenTimer = setTimeout(() => {
        this.setData({ enableSheen: true });
      }, 3000);
    }
  },

  onHide() {
    if (this.sheenTimer) clearTimeout(this.sheenTimer);
    this.setData({ enableSheen: false });
  },

  onUnload() {
    if (this.sheenTimer) clearTimeout(this.sheenTimer);
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
    this.setData({ viewMode: mode });
  },

  toggleViewModeBtn() {
    const nextMode = this.data.viewMode === 'shelf' ? '3d_pack' : 'shelf';
    this.switchViewMode(nextMode);
  },

  // 初始化或切换当前展示的烟盒
  initCigarettePack(cig) {
    const capacity = cig.packCapacity || (cig.isCigar ? 5 : 20);
    const count = storageService.getPackCount(cig.id, capacity);
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const unlocked = isCigaretteUnlocked(cig.id, totalSubs);
    const currentSelectedId = storageService.getSelectedCigaretteId();
    // 只有当前正在抽这支烟时，进入 3D 才默认打开盒盖；未抽这支烟时默认合上，绝不先开后关
    const shouldOpenLid = cig.id === currentSelectedId;

    const slotArray = [];
    for (let i = 0; i < capacity; i++) {
      slotArray.push(i);
    }

    this.setData({
      currentCigarette: cig,
      isCurrentUnlocked: unlocked,
      packCount: count,
      slotArray,
      isLidOpen: shouldOpenLid,
      isPulling: false,
      isFlightVisible: false,
      pulledSlotIndex: -1,
      showDrawnModal: false
    });
  },

  // 在货架上点击某个烟盒卡片：直接进入 3D 预览（仅查看，若正在抽则默认开盖，否则默认合盖）
  onTapShelfPack(e) {
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
    });
    this.refreshCatalogList();
  },

  // 从货架卡片直接装配该烟
  onEquipFromShelf(e) {
    const item = e.currentTarget.dataset.item;
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

  // 点击盒内某支烟直接抽取
  onTapCigaretteSlot(e) {
    const index = Number(e.currentTarget.dataset.index);
    if (!this.data.isCurrentUnlocked) {
      triggerHaptic('medium');
      toast.warn(this.data.currentCigarette.unlockDesc);
      return;
    }
    if (this.data.packCount <= 0) {
      const curCig = this.data.currentCigarette;
      const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
      const count = storageService.resetPackCount(curCig.id, capacity);
      this.setData({ packCount: count });
      this.executePullCigarette(count - 1);
      return;
    }
    if (index >= this.data.packCount) {
      toast.info('这支已被抽走，轻触旁边的烟支');
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
    if (this.data.packCount <= 0) {
      const curCig = this.data.currentCigarette;
      const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
      const count = storageService.resetPackCount(curCig.id, capacity);
      this.setData({ packCount: count });
    }
    const targetIndex = this.data.packCount - 1;
    this.executePullCigarette(targetIndex);
  },

  // 执行核心拟真抽烟动画
  executePullCigarette(slotIndex) {
    audioManager.unlockAudio();

    if (!this.data.isLidOpen) {
      audioManager.playPackOpenSound();
      this.setData({ isLidOpen: true });
    }

    audioManager.playPullCigaretteSound();
    triggerHaptic('heavy');

    const curCig = this.data.currentCigarette;
    const remaining = storageService.decrementPackCount(curCig.id, curCig.packCapacity || 20);
    storageService.setSelectedCigaretteId(curCig.id);

    this.setData({
      isPulling: true,
      pulledSlotIndex: slotIndex,
      isFlightVisible: true,
      packCount: remaining
    });

    setTimeout(() => {
      // 0.8s 优雅飞升至顶点后，自动装配并丝滑返回首页点燃，零阻断无二次弹窗
      this.onConfirmAndSmoke();
    }, 850);
  },

  // 拆封全新一盒 (复位20支)
  onUnwrapNewPack() {
    audioManager.unlockAudio();
    audioManager.playUnwrapSound();
    triggerHaptic('heavy');

    const curCig = this.data.currentCigarette;
    const capacity = curCig.packCapacity || (curCig.isCigar ? 5 : 20);
    const count = storageService.resetPackCount(curCig.id, capacity);

    this.setData({
      packCount: count,
      isLidOpen: true,
      isPulling: false,
      isFlightVisible: false,
      pulledSlotIndex: -1
    });

    toast.success(`拆封全新一盒【${curCig.name}】`);

    this.refreshCatalogList();
  },

  // 确认并携带这支烟返回主页品吸
  onConfirmAndSmoke() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('medium');

    storageService.setSelectedCigaretteId(this.data.currentCigarette.id);
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
    this.setData({
      showDrawnModal: false,
      isFlightVisible: false,
      isPulling: false,
      pulledSlotIndex: -1
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