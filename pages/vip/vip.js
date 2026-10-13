// pages/vip/vip.js
import { audioManager } from '../../utils/audioManager.js';
import { triggerHaptic } from '../../utils/haptics.js';
import { toast } from '../../utils/toastService.js';
import { VIP_TIERS, VIP_PRIVILEGES, VIP_COMPARE_ROWS, VIP_THEME_OPTIONS, vipService } from '../../utils/vipService.js';

Page({
  data: {
    statusBarHeight: 44,
    navBarHeight: 44,
    capsuleRightSpace: 96,

    tiers: VIP_TIERS,
    themeOptions: VIP_THEME_OPTIONS,
    selectedTierId: 'month', // 腾讯游戏默认选中最高转化率推荐款（月卡）
    selectedTier: VIP_TIERS[1],
    currentTheme: 'month', // 动态氛围主题：'day' (翡翠晨曦) | 'month' (极光紫晶) | 'lifetime' (曜世黑金) | 'classic' (原色深曜)
    activeVipThemeId: 'month',
    activeVipThemeName: '极光紫晶',

    privileges: VIP_PRIVILEGES,
    compareRows: VIP_COMPARE_ROWS,

    isAgreed: false,
    vipInfo: { isVip: false, isLifetime: false, formattedExpire: '', customTheme: '' },

    showSuccessModal: false,
    showProtocolModal: false,
    activatedTierName: ''
  },

  onLoad() {
    this.measureSafeArea();
    this.refreshVipStatus();
  },

  onShow() {
    this.refreshVipStatus();
  },

  measureSafeArea() {
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

      this.setData({
        statusBarHeight,
        navBarHeight,
        capsuleRightSpace
      });
    } catch (e) {
      console.warn('measureSafeArea error', e);
    }
  },

  buildThemeOptionsWithLock(vipInfo) {
    const isVip = !!(vipInfo && vipInfo.isVip);
    const tierId = vipInfo ? vipInfo.tierId : '';
    const isLifetime = !!(vipInfo && vipInfo.isLifetime);

    return VIP_THEME_OPTIONS.map(opt => {
      let isLocked = false;
      let requiredTierText = '';

      if (opt.id === 'day') {
        isLocked = !isVip; // 开通日卡/月卡/永久卡均可解锁翡翠绿
        requiredTierText = '日卡解锁';
      } else if (opt.id === 'month') {
        isLocked = !isVip || (!isLifetime && tierId !== 'month'); // 只有月卡与永久卡能选紫色
        requiredTierText = '月卡解锁';
      } else if (opt.id === 'lifetime') {
        isLocked = !isVip || (!isLifetime && tierId !== 'lifetime'); // 只有永久卡能选曜世黑金
        requiredTierText = '永久专属';
      }

      return {
        ...opt,
        isLocked,
        requiredTierText
      };
    });
  },

  refreshVipStatus() {
    const vipInfo = vipService.getVipInfo();
    const themeOptions = this.buildThemeOptionsWithLock(vipInfo);
    if (vipInfo && vipInfo.isVip) {
      let savedThemeId = vipInfo.customTheme || vipInfo.tierId || 'month';
      if (!vipService.isThemeAllowed(savedThemeId, vipInfo.tierId, vipInfo.isLifetime)) {
        savedThemeId = vipInfo.tierId === 'day' ? 'day' : 'month';
        vipService.setVipTheme(savedThemeId);
      }
      const themeOpt = VIP_THEME_OPTIONS.find(o => o.id === savedThemeId) || VIP_THEME_OPTIONS[0];
      const targetTierId = savedThemeId === 'classic' ? 'day' : savedThemeId;
      const matchedTier = this.data.tiers.find(t => t.id === targetTierId)
        || this.data.tiers.find(t => t.id === vipInfo.tierId)
        || this.data.tiers[0];
      this.setData({
        vipInfo,
        themeOptions,
        selectedTierId: matchedTier.id,
        selectedTier: matchedTier,
        activeVipThemeId: savedThemeId,
        activeVipThemeName: themeOpt.name,
        currentTheme: savedThemeId
      });
    } else {
      this.setData({ vipInfo, themeOptions });
    }
  },

  // VIP 专属：一键自由切换全站背景氛围主题（按档位鉴权：日卡选翡翠，月卡选紫+翡翠，永久卡全选）
  onSelectVipTheme(e) {
    const themeId = e.currentTarget.dataset.id;
    if (!themeId) return;

    triggerHaptic('light');
    try {
      audioManager.playClick();
    } catch (e) {}

    const vipInfo = this.data.vipInfo || {};
    const isAllowed = vipService.isThemeAllowed(themeId, vipInfo.tierId, vipInfo.isLifetime);

    const themeOpt = VIP_THEME_OPTIONS.find(o => o.id === themeId) || VIP_THEME_OPTIONS[0];
    const targetTierId = themeId === 'classic' ? 'day' : themeId;
    const matchedTier = this.data.tiers.find(t => t.id === targetTierId) || this.data.tiers[0];

    // 如果未达到权限（如日卡点紫色/金色，或月卡点金色）：
    // 自动帮用户选中下方对应套餐卡片供其升级，同时在当前页面预览该档位背景色，但不保存全站、不弹 toast
    if (!isAllowed) {
      this.setData({
        selectedTierId: matchedTier.id,
        selectedTier: matchedTier,
        currentTheme: targetTierId
      });
      return;
    }

    if (vipInfo.isVip) {
      vipService.setVipTheme(themeId);
      const updatedVipInfo = vipService.getVipInfo();
      this.setData({
        vipInfo: updatedVipInfo,
        activeVipThemeId: themeId,
        activeVipThemeName: themeOpt.name,
        currentTheme: themeId,
        selectedTierId: matchedTier.id,
        selectedTier: matchedTier
      });
    } else {
      this.setData({
        activeVipThemeId: themeId,
        activeVipThemeName: themeOpt.name,
        currentTheme: themeId,
        selectedTierId: matchedTier.id,
        selectedTier: matchedTier
      });
    }
  },

  // 选择会员套餐档位：当前 VIP 页面立即呈现对应档位专属背景颜色（日卡翡翠 / 月卡紫晶 / 永久黑金），纯页面级展示，绝对不影响全站其他页面
  onSelectTier(e) {
    const tierId = e.currentTarget.dataset.id;
    if (!tierId) return;

    if (tierId === 'lifetime') {
      triggerHaptic('heavy');
    } else if (tierId === 'month') {
      triggerHaptic('medium');
    } else {
      triggerHaptic('light');
    }
    try {
      audioManager.playClick();
    } catch (e) {}

    const selectedTier = this.data.tiers.find(t => t.id === tierId) || this.data.tiers[1];
    const themeId = selectedTier.themeId || tierId;

    // 重点：仅切换当前页面的 currentTheme，为用户在当前 VIP 页面提供沉浸的情绪价值
    // 严格不调用 vipService.setVipTheme()，保证绝对不影响首页、展柜、烟盒、我的等其他页面！
    this.setData({
      selectedTierId: tierId,
      selectedTier,
      currentTheme: themeId
    });
  },

  // 勾选用户协议
  toggleAgreement() {
    triggerHaptic('light');
    this.setData({
      isAgreed: !this.data.isAgreed
    });
  },

  // 立即开通 / 永久会员去品吸名烟
  onSubscribe() {
    if (this.data.vipInfo && this.data.vipInfo.isLifetime) {
      triggerHaptic('medium');
      this.onNavigateBack();
      return;
    }

    if (!this.data.isAgreed) {
      triggerHaptic('medium');
      toast.warn('请先阅读并勾选下方《VIP会员服务协议》');
      return;
    }

    const tier = this.data.selectedTier;
    triggerHaptic('heavy');
    try {
      audioManager.playClick();
    } catch (e) {}

    wx.showLoading({ title: '安全连接收银台…' });

    setTimeout(() => {
      wx.hideLoading();
      // 模拟微信安全支付成功并激活权益
      const result = vipService.activateTier(tier.id);
      this.refreshVipStatus();

      this.setData({
        showSuccessModal: true,
        activatedTierName: tier.name
      });

      triggerHaptic('success');
    }, 600);
  },

  closeSuccessModal() {
    triggerHaptic('light');
    this.setData({ showSuccessModal: false });
    // 立即返回展柜品吸体验 (优先 navigateBack 回展柜或主页，栈底则 reLaunch)
    this.onNavigateBack();
  },

  openProtocolModal() {
    triggerHaptic('light');
    this.setData({ showProtocolModal: true });
  },

  closeProtocolModal() {
    triggerHaptic('light');
    this.setData({ showProtocolModal: false });
  },

  confirmProtocolModal() {
    triggerHaptic('light');
    this.setData({
      isAgreed: true,
      showProtocolModal: false
    });
  },

  onNavigateBack() {
    triggerHaptic('light');
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.reLaunch({ url: '/pages/index/index' });
    }
  },

  preventTouchMove() {}
});