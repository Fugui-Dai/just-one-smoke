// pages/shop/shop.js
import { storageService } from '../../utils/storageService.js';
import { audioManager } from '../../utils/audioManager.js';
import { triggerHaptic } from '../../utils/haptics.js';
import { toast } from '../../utils/toastService.js';
import { vipService } from '../../utils/vipService.js';
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
    packCount: 20, // 盒内剩余烟支数量
    slotArray: [], // 槽位索引数组 [0..19] 或 [0..4]

    // 3D 动画交互状态
    isLidOpen: false, // 盒盖是否翻开
    isPulling: false, // 正在抽出一支烟的动画
    isFlightVisible: false, // 抽出烟支是否悬浮在空中
    pulledSlotIndex: -1, // 被抽出的烟支槽位

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

    // 如果通过参数指定直接进入 3D 抽烟视图
    const mode = (query && query.mode === '3d') ? '3d_pack' : 'shelf';

    this.setData({
      viewMode: mode,
      isMuted: audioManager.isMuted(),
      isVipUser: vipService.isVip(),
      enableSheen: false
    });

    this.initCigarettePack(curCig);
    this.refreshCatalogList();
  },

  onReady() {
    // 腾讯游戏商城设计规范：进店先保持静帧陈列，让视线从容聚焦商品细节，静置后再开启低频流光
    if (this.sheenTimer) clearTimeout(this.sheenTimer);
    this.sheenTimer = setTimeout(() => {
      this.setData({ enableSheen: true });
    }, 2600);
  },

  onShow() {
    if (this._skipFirstShowRefresh) {
      this._skipFirstShowRefresh = false;
      return;
    }
    this.setData({
      isMuted: audioManager.isMuted(),
      isVipUser: vipService.isVip(),
      enableSheen: false
    });
    this.refreshCatalogList();
    if (this.sheenTimer) clearTimeout(this.sheenTimer);
    // 从 3D 页面返回时重置静置冷却期，杜绝返回瞬间立刻扫光晃眼
    this.sheenTimer = setTimeout(() => {
      this.setData({ enableSheen: true });
    }, 3000);
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
    // 只有当前正在抽这支烟时，进入 3D 才默认打开盒盖；未抽这支烟时默认合上
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

  // 在货架上点击某个烟盒卡片：进入新的烟盒开盒页面 (仅做 3D 展台预览，若正在抽则默认开盖，否则合盖)
  onTapShelfPack(e) {
    const item = e.currentTarget.dataset.item;
    audioManager.unlockAudio();

    if (!item.unlocked) {
      this.openUnlockDialog(item);
      return;
    }

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
      url: `/pages/pack/pack?id=${item.id}&from=shop`
    });
  },

  // 从货架卡片直接装配该烟
  onEquipFromShelf(e) {
    const item = e.currentTarget.dataset.item;
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
    const item = e.currentTarget.dataset.item;
    audioManager.unlockAudio();

    if (!item.unlocked) {
      this.openUnlockDialog(item);
      return;
    }

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
      url: `/pages/pack/pack?id=${item.id}&from=shop`
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
    wx.navigateBack({
      delta: 1
    });
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
    this.setData({
      showUnlockDialog: false
    });
  },

  onGoToVipFromDialog() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('medium');
    this.setData({
      showUnlockDialog: false
    });
    wx.navigateTo({
      url: '/pages/vip/vip'
    });
  },

  onTrialSmokeFromDialog() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('heavy');

    const cig = this.data.dialogCigarette;
    if (!cig) {
      this.setData({ showUnlockDialog: false });
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
      url: `/pages/pack/pack?id=${cig.id}&from=trial`
    });
  },

  onTapVipBanner() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    triggerHaptic('light');
    wx.navigateTo({
      url: '/pages/vip/vip'
    });
  },

  preventTouchMove() {}
});