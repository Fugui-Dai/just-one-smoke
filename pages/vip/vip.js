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
    themeOptions: VIP_THEME_OPTIONS,
    themeCategories: VIP_THEME_CATEGORIES,
    currentThemeCategory: 'all',
    filteredThemeOptions: VIP_THEME_OPTIONS,
    selectedTierId: 'month', // 腾讯游戏默认选中最高转化率推荐款（月卡）
    selectedTier: VIP_TIERS[1],
    currentTheme: 'month', // 动态氛围主题
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
    const isIOS = detectIsIOS();
    this.setData({ isIOS });
    this.refreshVipStatus();
  },

  onShow() {
    this.refreshVipStatus();
  },

  measureSafeArea() {
    this.setData(measureSafeAreaSync());
  },

  computeFilteredThemes(themeOptions, category) {
    if (!category || category === 'all') return themeOptions;
    return themeOptions.filter(t => t.category === category);
  },

  computeThemeCategories(themeOptions) {
    return VIP_THEME_CATEGORIES.map(cat => {
      const count = cat.id === 'all'
        ? themeOptions.length
        : themeOptions.filter(t => t.category === cat.id).length;
      return { ...cat, count };
    });
  },

  buildThemeOptionsWithLock(vipInfo) {
    const isVip = !!(vipInfo && vipInfo.isVip);
    const tierId = vipInfo ? vipInfo.tierId : '';
    const isLifetime = !!(vipInfo && vipInfo.isLifetime);
    const TIER_LEVELS = { '': 0, 'day': 1, 'month': 2, 'lifetime': 3 };
    const userLevel = isLifetime || tierId === 'lifetime' ? 3 : (TIER_LEVELS[tierId] || (isVip ? 1 : 0));

    return VIP_THEME_OPTIONS.map(opt => {
      const requiredLevel = TIER_LEVELS[opt.minTier || 'month'] || 2;
      const isLocked = !isVip || (userLevel < requiredLevel);
      let requiredTierText = '';
      if (opt.minTier === 'day') requiredTierText = '日卡解锁';
      else if (opt.minTier === 'month') requiredTierText = '月卡解锁';
      else if (opt.minTier === 'lifetime') requiredTierText = '永久专属';

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
    const themeCategories = this.computeThemeCategories(themeOptions);

    // 腾讯总监设计级：恢复用户上次所选分类分组（持久化记忆）
    let category = this.data.currentThemeCategory || 'all';
    try {
      const savedCat = wx.getStorageSync('JUST_ONE_SMOKE_VIP_THEME_CAT');
      if (savedCat && themeCategories.some(c => c.id === savedCat)) {
        category = savedCat;
      }
    } catch (e) {}

    const filteredThemeOptions = this.computeFilteredThemes(themeOptions, category);

    if (vipInfo && vipInfo.isVip) {
      let savedThemeId = vipInfo.customTheme || vipInfo.tierId || 'month';
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
      let previewTheme = 'month';
      try {
        const storedPreview = wx.getStorageSync('JUST_ONE_SMOKE_PREVIEW_THEME');
        if (storedPreview) previewTheme = storedPreview;
      } catch (e) {}
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
    const category = e.currentTarget.dataset.category || 'all';
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
    const isAllowed = vipService.isThemeAllowed(themeId, vipInfo.tierId, vipInfo.isLifetime);
    const themeOpt = VIP_THEME_OPTIONS.find(o => o.id === themeId) || VIP_THEME_OPTIONS[0];

    // 如果未达到权限（如日卡点月卡色，或月卡点永久色）：
    // 联动下方推荐套餐卡片，并在当前页面实时预览该车身色彩，友善提示
    if (!isAllowed) {
      const targetTierId = themeOpt.minTier === 'lifetime' ? 'lifetime' : (themeOpt.minTier === 'day' ? 'day' : 'month');
      const matchedTier = this.data.tiers.find(t => t.id === targetTierId) || this.data.tiers[0];
      this.setData({
        selectedTierId: matchedTier.id,
        selectedTier: matchedTier,
        currentTheme: themeId
      });
      toast.info(this.data.isIOS ? `【${themeOpt.name}】需开启${matchedTier.name}解锁` : `【${themeOpt.name}】需开通${matchedTier.name}解锁`);
      return;
    }

    if (vipInfo.isVip) {
      vipService.setVipTheme(themeId);
      const updatedVipInfo = vipService.getVipInfo();
      this.setData({
        vipInfo: updatedVipInfo,
        activeVipThemeId: themeId,
        activeVipThemeName: themeOpt.name,
        currentTheme: themeId
      });
    } else {
      // 腾讯总监设计级：非 VIP 用户体验点击时，同样写入预览主题，在返回首页时能够即时体验
      vipService.setVipTheme(themeId);
      this.setData({
        activeVipThemeId: themeId,
        activeVipThemeName: themeOpt.name,
        currentTheme: themeId
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
    navigateBackWithSound('/pages/index/index');
  },

  preventTouchMove() {}
});