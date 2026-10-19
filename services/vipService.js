// utils/vipService.js
/**
 * 腾讯游戏级 VIP 会员服务中心
 * 管理 VIP 开通状态、权益鉴权、免广告跳过与有效期
 */

const STORAGE_KEY_VIP = 'JUST_ONE_SMOKE_VIP_INFO_V1';

export const VIP_TIERS = [
  {
    id: 'day',
    name: '畅玩日卡',
    period: '24小时畅玩',
    badge: '尝鲜首选',
    price: 0.9,
    originalPrice: 3.0,
    dailyCost: '0.90',
    durationDays: 1,
    highlight: false,
    desc: '24小时免广告 · 快速体验',
    shortDesc: '24小时免广告',
    themeId: 'day',
    themeName: '翡翠晨曦',
    accentColor: '#10b981',
    heroTitle: '浮生半日 · 24小时静心沉浸',
    heroSlogan: '0门槛尝鲜体验 ｜ 免除所有激励打扰 ｜ 沉浸身心'
  },
  {
    id: 'month',
    name: '尊享月卡',
    period: '30天特权',
    badge: '超值爆款',
    price: 3.9,
    originalPrice: 35.0,
    dailyCost: '0.13',
    durationDays: 30,
    highlight: true,
    desc: '全套名烟畅吸 · 极高性价比',
    shortDesc: '30天全名烟畅吸',
    themeId: 'month',
    themeName: '极光紫晶',
    accentColor: '#a855f7',
    heroTitle: '极光沉浸 · 30夜深情陪伴',
    heroSlogan: '跳过全部激励视频 ｜ 37款名烟全图鉴免解锁 ｜ 极致性价比'
  },
  {
    id: 'lifetime',
    name: '至尊永久卡',
    period: '终身尊享',
    badge: '终身免广',
    price: 14.9,
    originalPrice: 99.0,
    dailyCost: '终身有效',
    durationDays: 36500, // 100 years
    highlight: false,
    desc: '全版本永久免广 · 专属黑金标',
    shortDesc: '全版本终身免广',
    themeId: 'lifetime',
    themeName: '曜世黑金',
    accentColor: '#fbbf24',
    heroTitle: '岁月知己 · 终身恒久相伴',
    heroSlogan: '全版本永久免广 ｜ 专属黑金雅座印记 ｜ 尊享终身礼遇'
  }
];

export const VIP_PRIVILEGES = [
  {
    id: 'no_ads',
    icon: '⚡',
    title: '全域免看广告',
    subtitle: '跳过所有激励视频与插屏，0秒极速畅玩',
    color: '#fbbf24',
    bgGradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(217, 119, 6, 0.05))'
  },
  {
    id: 'all_packs',
    icon: '📦',
    title: '全套37款名烟畅吸',
    subtitle: '全系列37款典藏名烟与艺术爆珠外观免解锁畅享',
    color: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(14, 165, 233, 0.05))'
  },
  {
    id: 'car_themes',
    icon: '🎨',
    title: '全域流光心境换肤',
    subtitle: '经典原色、灵动光影、幽山深境等20款高奢光影氛围自由切换',
    color: '#06b6d4',
    bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.18), rgba(8, 145, 178, 0.05))'
  },
  {
    id: 'unlimited_refill',
    icon: '👑',
    title: '尊享极速拆盒直通',
    subtitle: '空盒免等待即拆即品，专享自律拆盒翻倍特权',
    color: '#a855f7',
    bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(126, 34, 206, 0.05))'
  },
  {
    id: 'special_effects',
    icon: '🌌',
    title: '极光沉浸特效',
    subtitle: '尊享黑曜星空/微雨场景与定制火机焰色',
    color: '#ec4899',
    bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(190, 24, 93, 0.05))'
  },
  {
    id: 'noble_identity',
    icon: '👑',
    title: 'VIP金色铭牌',
    subtitle: '风云榜专属金色徽记与静心留名',
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(180, 83, 9, 0.05))'
  }
];

export const VIP_COMPARE_ROWS = [
  { feature: '激励视频广告', freeText: '需看视频或按需解锁', vipText: '⚡ 0秒免广直通' },
  { feature: '全域心境换肤', freeText: '替烟里程碑逐步解锁', vipText: '🎨 20款高奢流光即刻畅享' },
  { feature: '37款名烟图鉴', freeText: '随自律坚持逐步点亮', vipText: '🌟 全系列37款即刻开抽' },
  { feature: '专属特效/天幕', freeText: '积累替烟支数免费解锁', vipText: '🌌 全套灵动天幕粒子即享' },
  { feature: '拆盒补烟特权', freeText: '基础限额与抽屉应急', vipText: '👑 尊享拆盒直通（配额翻倍）' },
  { feature: '尊崇身份外显', freeText: '自律行者铭牌', vipText: '👑 荣耀VIP流光铭牌' }
];

function formatVipExpireDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

import { VIP_THEME_OPTIONS, VIP_THEME_CATEGORIES, getThemeById } from '../configs/vipThemes.js';
export { VIP_THEME_OPTIONS, VIP_THEME_CATEGORIES, getThemeById };

function generateVipSignature(tierId, expireTime, activatedAt) {
  const salt = 'SMOKE_FREE_VIP_SALT_2026_@TENCENT_SEC';
  const str = `${tierId}#${expireTime}#${activatedAt}#${salt}`;
  let hash1 = 5381;
  let hash2 = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) + ch;
    hash1 |= 0;
    hash2 = ((hash2 << 7) - hash2) + ch;
    hash2 |= 0;
  }
  return `V1_${Math.abs(hash1).toString(36)}_${Math.abs(hash2).toString(36)}`;
}

export const vipService = {
  getVipInfo() {
    try {
      const data = wx.getStorageSync(STORAGE_KEY_VIP);
      if (!data || typeof data !== 'object') {
        return { isVip: false, expireTime: 0, tierId: '', isLifetime: false, customTheme: '' };
      }
      const now = Date.now();
      const isLifetime = data.tierId === 'lifetime';

      // 防篡改签名鉴权校验
      const expectedSig = generateVipSignature(data.tierId, data.expireTime, data.activatedAt);
      const isSignatureValid = data.sig && data.sig === expectedSig;

      // 兼容历史老版本升级：若无签名但数据结构完整，补全签名；若签名存在但不匹配，判定为非法篡改
      if (data.sig && !isSignatureValid) {
        console.warn('[vipService] 检测到本地 VIP 数据被非法篡改，已阻断越权！');
        return { isVip: false, expireTime: 0, tierId: '', isLifetime: false, customTheme: '' };
      }
      if (!data.sig && (data.isVip || isLifetime)) {
        // 自动补签防老用户丢失合法权益
        data.sig = expectedSig;
        try { wx.setStorageSync(STORAGE_KEY_VIP, data); } catch (e) {}
      }

      const isVip = isLifetime || (data.expireTime > now);
      return {
        isVip,
        expireTime: data.expireTime,
        tierId: data.tierId,
        isLifetime,
        customTheme: data.customTheme || data.tierId || 'month',
        formattedExpire: isLifetime ? '终身尊享永久' : (data.expireTime ? formatVipExpireDate(data.expireTime) : '')
      };
    } catch (e) {
      return { isVip: false, expireTime: 0, tierId: '', isLifetime: false, customTheme: '' };
    }
  },

  isVip() {
    return this.getVipInfo().isVip;
  },

  isVipActive() {
    return this.isVip();
  },

  // 获取当前用户的自律天数与替烟进度
  getUserTimeStats() {
    let quitDays = 0;
    let totalSubstituted = 0;
    try {
      const records = wx.getStorageSync('JUST_ONE_SMOKE_RECORDS_V1') || [];
      totalSubstituted = Array.isArray(records) ? records.length : 0;
    } catch (e) {}

    try {
      const profile = wx.getStorageSync('JUST_ONE_SMOKE_USER_PROFILE') || {};
      if (profile && profile.quitStartDate) {
        const start = new Date(profile.quitStartDate);
        const now = new Date();
        const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
        const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const diffMs = nowMidnight - startMidnight;
        quitDays = diffMs > 0 ? Math.round(diffMs / 86400000) : 0;
      }
    } catch (e) {}

    return { quitDays, totalSubstituted };
  },

  isThemeAllowed(themeId, currentTierId, isLifetime, userStats) {
    if (!themeId || themeId === 'classic') return true;
    const theme = getThemeById(themeId);
    if (!theme) return false;

    // 1. VIP 尊享特权：根据档位免时长要求，直接直通解锁
    const TIER_LEVELS = { '': 0, 'day': 1, 'month': 2, 'lifetime': 3 };
    const userLevel = isLifetime || currentTierId === 'lifetime' ? 3 : (TIER_LEVELS[currentTierId] || 0);
    const requiredLevel = TIER_LEVELS[theme.minTier || 'month'] || 2;
    if (userLevel >= requiredLevel) {
      return true;
    }

    // 2. 普通用户花时间成长体系（自律天数 / 累计替烟支数满足其一即免费获取）
    let stats = userStats;
    if (!stats || (stats.quitDays === undefined && stats.days === undefined)) {
      stats = this.getUserTimeStats();
    }
    const days = Number(stats.quitDays !== undefined ? stats.quitDays : stats.days) || 0;
    const subs = Number(stats.totalSubstituted !== undefined ? stats.totalSubstituted : stats.subs) || 0;

    if (theme.unlockDays !== undefined && theme.unlockDays > 0 && days >= theme.unlockDays) {
      return true;
    }
    if (theme.unlockSubs !== undefined && theme.unlockSubs > 0 && subs >= theme.unlockSubs) {
      return true;
    }

    return false;
  },

  // 获取用户当前选中的主题 ID (始终返回有效的主题 ID 字符串，默认 'classic')
  getSelectedThemeId(userStats) {
    const info = this.getVipInfo();
    const tierId = info ? info.tierId : '';
    const isLifetime = !!(info && info.isLifetime);

    // 优先读取用户已持久化保存的主题（必须校验已解锁权限）
    try {
      const last = wx.getStorageSync('JUST_ONE_SMOKE_LAST_SELECTED_THEME');
      if (last && this.isThemeAllowed(last, tierId, isLifetime, userStats)) {
        return last;
      }
    } catch (e) {}

    // VIP 用户专属自定义装配主题
    if (info && info.customTheme && this.isThemeAllowed(info.customTheme, tierId, isLifetime, userStats)) {
      return info.customTheme;
    }
    // VIP 套餐默认对应的主题
    if (info && info.tierId && this.isThemeAllowed(info.tierId, tierId, isLifetime, userStats)) {
      return info.tierId;
    }

    // 默认所有人通用的经典原色
    return 'classic';
  },

  getVipTheme(userStats) {
    const selected = this.getSelectedThemeId(userStats);
    if (!selected || selected === 'classic') {
      return ''; // 经典黑使用默认纯黑背景
    }
    return selected;
  },

  setVipTheme(themeId, userStats) {
    if (!themeId) return false;
    const info = this.getVipInfo();
    const tierId = info ? info.tierId : '';
    const isLifetime = !!(info && info.isLifetime);

    // 校验色彩权限：如果未开通 VIP 且未达成自律时间条件，严禁持久化保存为正式装配（只能临时预览）
    if (!this.isThemeAllowed(themeId, tierId, isLifetime, userStats)) {
      return false;
    }

    try {
      // 永久持久化记录选中的有效已解锁颜色
      wx.setStorageSync('JUST_ONE_SMOKE_LAST_SELECTED_THEME', themeId);

      if (info && info.isVip) {
        const data = wx.getStorageSync(STORAGE_KEY_VIP) || {};
        data.customTheme = themeId;
        wx.setStorageSync(STORAGE_KEY_VIP, data);
      }
      return true;
    } catch (e) {
      console.error('Set VIP theme error', e);
      return false;
    }
  },

  activateTier(tierId) {
    const tier = VIP_TIERS.find(t => t.id === tierId) || VIP_TIERS[1];
    const current = this.getVipInfo();
    const now = Date.now();
    let baseTime = (current.isVip && !current.isLifetime && current.expireTime > now) ? current.expireTime : now;
    
    let expireTime = baseTime + tier.durationDays * 24 * 60 * 60 * 1000;
    if (tier.id === 'lifetime') {
      expireTime = now + 100 * 365 * 24 * 60 * 60 * 1000;
    }

    const vipData = {
      isVip: true,
      tierId: tier.id,
      tierName: tier.name,
      customTheme: tier.id,
      activatedAt: now,
      expireTime,
      isLifetime: tier.id === 'lifetime',
      sig: generateVipSignature(tier.id, expireTime, now)
    };

    try {
      wx.setStorageSync(STORAGE_KEY_VIP, vipData);
    } catch (e) {
      console.error('Save VIP error', e);
    }

    return vipData;
  }
};
