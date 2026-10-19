import { navigateBackWithSound } from '../../utils/navigation.js';
// pages/vip/vip.js
import { audioManager } from '../../services/audioManager.js';
import { triggerHaptic } from '../../services/haptics.js';
import { toast } from '../../services/toastService.js';
import { VIP_TIERS, VIP_PRIVILEGES, VIP_COMPARE_ROWS, VIP_THEME_OPTIONS, VIP_THEME_CATEGORIES, vipService } from '../../services/vipService.js';
import { measureSafeAreaSync, detectIsIOS } from '../../utils/safeArea.js';

Page({
  data: {
    statusBarHeight: 44,
    navBarHeight: 44,
    capsuleRightSpace: 96,
    isIOS: false,

    tiers: VIP_TIERS,
    lifetimeTier: VIP_TIERS.find(t => t.id === 'lifetime') || VIP_TIERS[2],
    subTiers: VIP_TIERS.filter(t => t.id !== 'lifetime'),
    themeOptions: VIP_THEME_OPTIONS,
    themeCategories: VIP_THEME_CATEGORIES,
    currentThemeCategory: 'classic',
    filteredThemeOptions: VIP_THEME_OPTIONS.filter(t => t.category === 'classic'),
    selectedTierId: 'lifetime', // 默认选中全宽至尊终身大卡
    selectedTier: VIP_TIERS.find(t => t.id === 'lifetime') || VIP_TIERS[2],
    currentTheme: 'lifetime', // 动态曜世黑金沉浸主题
    activeVipThemeId: 'lifetime',
    activeVipThemeName: '曜世黑金',

    privileges: VIP_PRIVILEGES,
    compareRows: VIP_COMPARE_ROWS,

    isAgreed: false,
    vipInfo: { isVip: false, isLifetime: false, formattedExpire: '', customTheme: '' },

    showSuccessModal: false,
    showProtocolModal: false,
    activatedTierName: ''
  },

  onLoad(options) {
    this.measureSafeArea();
    const isIOS = detectIsIOS();
    this.setData({ isIOS });
    this.refreshVipStatus();
    if (options && (options.showProtocol === 'true' || options.showProtocol === true)) {
      this.setData({ showProtocolModal: true });
    }
  },

  onShow() {
    this.refreshVipStatus();
  },

  measureSafeArea() {
    this.setData(measureSafeAreaSync());
  },

  computeFilteredThemes(themeOptions, category) {
    const cat = (!category || category === 'all') ? 'classic' : category;
    return themeOptions.filter(t => t.category === cat);
  },

  computeThemeCategories(themeOptions) {
    return VIP_THEME_CATEGORIES.map(cat => ({
      ...cat,
      count: themeOptions.filter(t => t.category === cat.id).length
    }));
  },

  buildThemeOptionsWithLock(vipInfo) {
    const isVip = !!(vipInfo && vipInfo.isVip);
    const tierId = vipInfo ? vipInfo.tierId : '';
    const isLifetime = !!(vipInfo && vipInfo.isLifetime);
    const userStats = vipService.getUserTimeStats ? vipService.getUserTimeStats() : {};

    return VIP_THEME_OPTIONS.map(opt => {
      const isAllowed = vipService.isThemeAllowed(opt.id, tierId, isLifetime, userStats);
      let requiredTierText = '';
      if (opt.minTier === 'day') requiredTierText = '日卡解锁';
      else if (opt.minTier === 'month') requiredTierText = '月卡解锁';
      else if (opt.minTier === 'lifetime') requiredTierText = '永久专属';

      return {
        ...opt,
        isLocked: !isAllowed,
        requiredTierText
      };
    });
  },

  refreshVipStatus() {
    const vipInfo = vipService.getVipInfo();
    const themeOptions = this.buildThemeOptionsWithLock(vipInfo);
    const themeCategories = this.computeThemeCategories(themeOptions);

    // 腾讯总监设计级：恢复用户上次所选分类分组（持久化记忆）
    let category = this.data.currentThemeCategory || 'classic';
    try {
      const savedCat = wx.getStorageSync('JUST_ONE_SMOKE_VIP_THEME_CAT');
      if (savedCat && savedCat !== 'all' && themeCategories.some(c => c.id === savedCat)) {
        category = savedCat;
      } else if (category === 'all' || !themeCategories.some(c => c.id === category)) {
        category = 'classic';
      }
    } catch (e) {
      if (category === 'all' || !themeCategories.some(c => c.id === category)) {
        category = 'classic';
      }
    }

    const filteredThemeOptions = this.computeFilteredThemes(themeOptions, category);

    if (vipInfo && vipInfo.isVip) {
      let savedThemeId = vipService.getSelectedThemeId ? vipService.getSelectedThemeId() : (vipInfo.customTheme || vipInfo.tierId || 'classic');
      if (!vipService.isThemeAllowed(savedThemeId, vipInfo.tierId, vipInfo.isLifetime)) {
        savedThemeId = vipInfo.tierId === 'day' ? 'day' : 'month';
        vipService.setVipTheme(savedThemeId);
      }
      const themeOpt = VIP_THEME_OPTIONS.find(o => o.id === savedThemeId) || VIP_THEME_OPTIONS[0];
      const targetTierId = themeOpt.minTier === 'lifetime' ? 'lifetime' : (themeOpt.minTier === 'day' ? 'day' : 'month');
      const matchedTier = this.data.tiers.find(t => t.id === targetTierId)
        || this.data.tiers.find(t => t.id === vipInfo.tierId)
        || this.data.tiers[0];
      this.setData({
        vipInfo,
        themeOptions,
        themeCategories,
        currentThemeCategory: category,
        filteredThemeOptions,
        selectedTierId: matchedTier.id,
        selectedTier: matchedTier,
        activeVipThemeId: savedThemeId,
        activeVipThemeName: themeOpt.name,
        currentTheme: savedThemeId
      });
    } else {
      const previewTheme = vipService.getSelectedThemeId ? vipService.getSelectedThemeId() : 'classic';
      const previewOpt = VIP_THEME_OPTIONS.find(o => o.id === previewTheme) || VIP_THEME_OPTIONS[0];
      this.setData({
        vipInfo,
        themeOptions,
        themeCategories,
        currentThemeCategory: category,
        filteredThemeOptions,
        activeVipThemeId: previewTheme,
        activeVipThemeName: previewOpt.name,
        currentTheme: previewTheme
      });
    }
  },

  onSelectThemeCategory(e) {
    const category = e.currentTarget.dataset.category || 'classic';
    if (category === this.data.currentThemeCategory) return;
    triggerHaptic('light');
    try {
      audioManager.playClick();
    } catch (err) {}

    // 记住用户当前选择的分组
    try {
      wx.setStorageSync('JUST_ONE_SMOKE_VIP_THEME_CAT', category);
    } catch (e) {}

    const filteredThemeOptions = this.computeFilteredThemes(this.data.themeOptions, category);
    this.setData({
      currentThemeCategory: category,
      filteredThemeOptions
    });
  },

  // VIP 专属：一键自由切换全站背景氛围主题（按档位鉴权：日卡/月卡/永久卡梯度解锁）
  onSelectVipTheme(e) {
    const themeId = e.currentTarget.dataset.id;
    if (!themeId) return;

    triggerHaptic('light');
    try {
      audioManager.playClick();
    } catch (err) {}

    const vipInfo = this.data.vipInfo || {};
    const userStats = vipService.getUserTimeStats ? vipService.getUserTimeStats() : {};
    const isAllowed = vipService.isThemeAllowed(themeId, vipInfo.tierId, vipInfo.isLifetime, userStats);
    const themeOpt = VIP_THEME_OPTIONS.find(o => o.id === themeId) || VIP_THEME_OPTIONS[0];

    // 如果未达到权限（既非VIP也未达时间自律条件）：
    // 联动下方推荐套餐卡片，并在当前页面实时预览该色彩，友善提示
    if (!isAllowed) {
      const targetTierId = themeOpt.minTier === 'lifetime' ? 'lifetime' : (themeOpt.minTier === 'day' ? 'day' : 'month');
      const matchedTier = this.data.tiers.find(t => t.id === targetTierId) || this.data.tiers[0];
      this.setData({
        selectedTierId: matchedTier.id,
        selectedTier: matchedTier,
        currentTheme: themeId
      });
      const daysLeft = Math.max(0, (themeOpt.unlockDays || 0) - (userStats.quitDays || 0));
      const subsLeft = Math.max(0, (themeOpt.unlockSubs || 0) - (userStats.totalSubstituted || 0));
      let progressHint = '';
      if (daysLeft > 0 && subsLeft > 0) {
        progressHint = `还需自律${daysLeft}天或替烟${subsLeft}支免费解锁`;
      } else {
        progressHint = themeOpt.unlockDesc || '达成自律条件即可免费解锁';
      }
      toast.info(`【${themeOpt.name}】${progressHint}，或开启${matchedTier.name}立即解锁`);
      return;
    }

    if (vipInfo.isVip) {
      vipService.setVipTheme(themeId, userStats);
      const updatedVipInfo = vipService.getVipInfo();
      this.setData({
        vipInfo: updatedVipInfo,
        activeVipThemeId: themeId,
        activeVipThemeName: themeOpt.name,
        currentTheme: themeId
      });
      toast.flame(`🎨 已装配【${themeOpt.name}】全站背景！`);
    } else {
      // 普通用户已达成自律条件：同样正式装配
      vipService.setVipTheme(themeId, userStats);
      this.setData({
        activeVipThemeId: themeId,
        activeVipThemeName: themeOpt.name,
        currentTheme: themeId
      });
      toast.flame(`🎉 自律成就达成！已装配【${themeOpt.name}】心境背景！`);
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

  // 立即开通 / 永久会员去品吸名烟 / iOS 免费开启自律特权
  onSubscribe() {
    if (this.data.vipInfo && this.data.vipInfo.isLifetime) {
      triggerHaptic('medium');
      this.onNavigateBack();
      return;
    }

    const tier = this.data.selectedTier;

    // iOS 虚拟支付合规隔离：跳过协议勾选与收银台，提供自律免费体验通道
    if (this.data.isIOS) {
      triggerHaptic('heavy');
      try {
        audioManager.playClick();
      } catch (e) {}

      wx.showLoading({ title: '开启专属特权…' });

      setTimeout(() => {
        wx.hideLoading();
        // 直接激活对应档位权益
        vipService.activateTier(tier.id);
        this.refreshVipStatus();

        this.setData({
          showSuccessModal: true,
          activatedTierName: tier.name
        });

        triggerHaptic('success');
        toast.flame(`【自律专享】已开启${tier.name}！`);
      }, 500);
      return;
    }

    if (!this.data.isAgreed) {
      triggerHaptic('medium');
      toast.warn('请先阅读并勾选下方《VIP会员服务协议》');
      return;
    }

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
    try {
      audioManager.playClick();
    } catch (e) {}
    this.setData({ showSuccessModal: false });
    this.refreshVipStatus();
  },

  onLifetimeBadgeTap() {
    triggerHaptic('light');
    try {
      audioManager.playClick();
    } catch (e) {}
    toast.flame('👑 您已尊享至尊终身特权，全场名烟与全套特权永久生效中！');
  },

  goToShelfAfterSuccess() {
    this.closeSuccessModal();
  },

  stayInVipAfterSuccess() {
    this.closeSuccessModal();
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
    navigateBackWithSound('/pages/index/index');
  },

  preventTouchMove() {}
});