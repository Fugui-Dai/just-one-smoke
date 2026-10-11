// pages/vip/vip.js
import { audioManager } from '../../utils/audioManager.js';
import { triggerHaptic } from '../../utils/haptics.js';
import { toast } from '../../utils/toastService.js';
import { VIP_TIERS, VIP_PRIVILEGES, VIP_COMPARE_ROWS, vipService } from '../../utils/vipService.js';

Page({
  data: {
    statusBarHeight: 44,
    navBarHeight: 44,
    capsuleRightSpace: 96,

    tiers: VIP_TIERS,
    selectedTierId: 'month', // 腾讯游戏默认选中最高转化率推荐款（月卡）
    selectedTier: VIP_TIERS[1],
    currentTheme: 'month', // 动态氛围主题：'day' (翡翠晨曦) | 'month' (极光紫晶) | 'lifetime' (曜世黑金)

    privileges: VIP_PRIVILEGES,
    compareRows: VIP_COMPARE_ROWS,

    isAgreed: true,
    vipInfo: { isVip: false, isLifetime: false, formattedExpire: '' },

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

  refreshVipStatus() {
    const vipInfo = vipService.getVipInfo();
    this.setData({ vipInfo });
  },

  // 选择会员套餐档位（腾讯级视听与情绪场域联动）
  onSelectTier(e) {
    const tierId = e.currentTarget.dataset.id;
    if (tierId === this.data.selectedTierId) return;

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
    this.setData({
      selectedTierId: tierId,
      selectedTier,
      currentTheme: selectedTier.themeId || tierId
    });
  },

  // 勾选用户协议
  toggleAgreement() {
    triggerHaptic('light');
    this.setData({
      isAgreed: !this.data.isAgreed
    });
  },

  // 立即开通
  onSubscribe() {
    if (!this.data.isAgreed) {
      triggerHaptic('medium');
      toast.warn('请勾选同意服务协议');
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
  },

  openProtocolModal() {
    triggerHaptic('light');
    this.setData({ showProtocolModal: true });
  },

  closeProtocolModal() {
    triggerHaptic('light');
    this.setData({ showProtocolModal: false });
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