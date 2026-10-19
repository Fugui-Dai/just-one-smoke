// configs/adConfig.js
/**
 * 流量主广告动态特性开关 (Feature Toggle)
 * 微信官方规定：小程序独立访客 (UV) 满 500 后方可开通流量主。
 * 
 * 1. 冷启动期 (UV < 500): IS_AD_ENABLED = false
 *    全屏零广告字样，零外部网络拉取异常，采用“掌柜特赠 / 翻抽屉 / 顺气吐纳”生活化人情味闭环。
 * 
 * 2. 商业变现期 (UV >= 500): 后台开通流量主后，填入 REWARDED_AD_UNIT_ID，IS_AD_ENABLED 置为 true
 *    开启单支高档雪茄品吸卡（24h 时效）与赛博烟雾特效体验卡。
 */
export const adConfig = {
  // 冷启动阶段保持 false，达标后一键切为 true
  IS_AD_ENABLED: false,

  // 微信公众平台后台申请的激励视频广告位 ID
  REWARDED_AD_UNIT_ID: '',

  // 每日激励视频观看硬顶次数 (守住健康控烟防刷底线)
  MAX_DAILY_REWARDED_AD_VIEWS: 2
};

export default adConfig;
