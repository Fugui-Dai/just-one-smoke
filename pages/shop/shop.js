// pages/shop/shop.js
import { storageService } from '../../services/storageService.js';
import { audioManager } from '../../services/audioManager.js';
import { triggerHaptic } from '../../services/haptics.js';
import { toast } from '../../services/toastService.js';
import { vipService } from '../../services/vipService.js';
import {
  CIGARETTE_CATALOG,
  DEFAULT_CIGARETTE,
  isCigaretteUnlocked
} from '../../configs/catalog.js';

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

function formatShelfFields(item) {
  const shelfTitle = item.name || '';
  const shelfSpecTag = item.id === 'pure_oxygen_zen'
    ? '0mg空气卷'
    : ((item.packTheme && item.packTheme.tar) ? item.packTheme.tar : '10mg');
  return { shelfTitle, shelfSpecTag };
}

function buildInitialCatalogList() {
  try {
    const isVip = vipService.isVip();
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const currentSelectedId = storageService.getSelectedCigaretteId();

    return CIGARETTE_CATALOG.map(item => {
      const category = resolveCigaretteCategory(item);
      const { shelfTitle, shelfSpecTag } = formatShelfFields(item);

      return {
        ...item,
        shelfTitle,
        shelfSpecTag,
        category,
        isEquipped: item.id === currentSelectedId,
        unlocked: isVip || isCigaretteUnlocked(item.id, totalSubs),
        currentStock: storageService.getPackCount(item.id, item.packCapacity || (item.isCigar ? 5 : 20))
      };
    });
  } catch (e) {
    return CIGARETTE_CATALOG.map(item => {
      const { shelfTitle, shelfSpecTag } = formatShelfFields(item);
      return {
        ...item,
        shelfTitle,
        shelfSpecTag,
        category: resolveCigaretteCategory(item),
        isEquipped: item.id === DEFAULT_CIGARETTE.id,
        unlocked: true,
        currentStock: item.packCapacity || (item.isCigar ? 5 : 20)
      };
    });
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

    // 视图模式固定为货架整柜陈列视图
    viewMode: 'shelf',
    activeFilter: 'all', // all | national | slender | imported | heritage

    // VIP 状态与主题 (Frame 0 同步读取，杜绝已开通 VIP 用户进页面闪现横幅)
    isVipUser: vipService.isVip(),
    vipTheme: vipService.getVipTheme(),

    // 解锁决策弹窗
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

  onLoad() {
    this._skipFirstShowRefresh = true;

    this.setData({
      viewMode: 'shelf',
      isVipUser: vipService.isVip(),
      vipTheme: vipService.getVipTheme(),
      enableSheen: false
    });

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
    this._isNavigatingToPack = false;
    this._lastCigaretteTapTime = 0;
    this._isNavigatingToVip = false;

    if (this._skipFirstShowRefresh) {
      this._skipFirstShowRefresh = false;
      this.setData({
        isVipUser: vipService.isVip(),
        vipTheme: vipService.getVipTheme()
      });
      return;
    }

    this.setData({
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

  onHide() {
    if (this.sheenTimer) clearTimeout(this.sheenTimer);
    this.setData({ enableSheen: false });
    this._isNavigatingToPack = false;
  },

  onUnload() {
    if (this.sheenTimer) clearTimeout(this.sheenTimer);
    this.setData({ enableSheen: false });
    this._isNavigatingToPack = false;
  },

  // 刷新所有品牌解锁状态、分类归属与余量
  refreshCatalogList() {
    const isVip = vipService.isVip();
    const records = storageService.getRecords();
    const totalSubs = records.length;
    const currentSelectedId = storageService.getSelectedCigaretteId();

    const list = CIGARETTE_CATALOG.map(item => {
      const category = resolveCigaretteCategory(item);
      const { shelfTitle, shelfSpecTag } = formatShelfFields(item);

      return {
        ...item,
        shelfTitle,
        shelfSpecTag,
        category,
        isEquipped: item.id === currentSelectedId,
        unlocked: isVip || isCigaretteUnlocked(item.id, totalSubs),
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

  // 在货架上点击某个烟盒卡片：进入新的烟盒开盒页面
  onTapShelfPack(e) {
    // 腾讯游戏防重规范：首触独占生效 (Leading-Edge Throttle Lock)
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

  onNavigateBack() {
    audioManager.unlockAudio();
    audioManager.playSwitchSound();
    wx.navigateBack({ delta: 1 });
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

    const prevId = storageService.getSelectedCigaretteId();
    storageService.setTrialCigaretteInfo({
      id: cig.id,
      prevId: prevId && prevId !== cig.id ? prevId : 'chaotianmen_gold',
      remaining: 1
    });

    toast.success(`开启【${cig.name}】1支尝鲜体验！`);

    // 导航至 3D 深度开盒页面尝鲜抽取体验（仅在实际抽出尝鲜烟支时切换装备）
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