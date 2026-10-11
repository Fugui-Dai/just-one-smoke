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
    heroTitle: '灵动轻盈 · 24小时极速解压',
    heroSlogan: '0门槛尝鲜体验 ｜ 免除所有激励广告 ｜ 轻松畅享'
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
    heroSlogan: '跳过全部激励视频 ｜ 25款名烟全图鉴免解锁 ｜ 极致性价比'
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
    heroTitle: '曜世帝王 · 终身一劳永逸',
    heroSlogan: '全版本永久免广 ｜ 尊崇黑金荣耀标识 ｜ 专属至高特权'
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
    title: '全套名烟畅吸',
    subtitle: '软中华/炫赫门/高希霸雪茄全图鉴免解锁',
    color: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(14, 165, 233, 0.05))'
  },
  {
    id: 'unlimited_refill',
    icon: '♾️',
    title: '无限极速补满',
    subtitle: '空盒随时一键拆封复位，无支数限制',
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
    title: '贵族金冠铭牌',
    subtitle: '英雄榜专属金冠标识与尊崇高光展示',
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(180, 83, 9, 0.05))'
  },
  {
    id: 'double_heal',
    icon: '✨',
    title: '双倍自愈收益',
    subtitle: '戒烟打卡与健康成就点数获取加速 100%',
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(4, 120, 87, 0.05))'
  }
];

export const VIP_COMPARE_ROWS = [
  { feature: '激励视频广告', freeText: '需看30秒视频', vipText: '⚡ 0秒免广直通' },
  { feature: '名烟展柜全解锁', freeText: '需逐一积累解锁', vipText: '🌟 全系列立即开抽' },
  { feature: '烟盒补充次数', freeText: '单日有限限额', vipText: '♾️ 无限次即拆即满' },
  { feature: '尊贵身份外显', freeText: '普通烟民标识', vipText: '👑 荣耀VIP流光铭牌' }
];

function formatVipExpireDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export const vipService = {
  getVipInfo() {
    try {
      const data = wx.getStorageSync(STORAGE_KEY_VIP);
      if (!data) {
        return { isVip: false, expireTime: 0, tierId: '', isLifetime: false };
      }
      const now = Date.now();
      const isLifetime = data.tierId === 'lifetime';
      const isVip = isLifetime || (data.expireTime > now);
      return {
        isVip,
        expireTime: data.expireTime,
        tierId: data.tierId,
        isLifetime,
        formattedExpire: isLifetime ? '终身尊享永久' : (data.expireTime ? formatVipExpireDate(data.expireTime) : '')
      };
    } catch (e) {
      return { isVip: false, expireTime: 0, tierId: '', isLifetime: false };
    }
  },

  isVip() {
    return this.getVipInfo().isVip;
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
      activatedAt: now,
      expireTime,
      isLifetime: tier.id === 'lifetime'
    };

    try {
      wx.setStorageSync(STORAGE_KEY_VIP, vipData);
    } catch (e) {
      console.error('Save VIP error', e);
    }

    return vipData;
  }
};
