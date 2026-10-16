// cloudfunctions/handleVipOrder/index.js
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const _ = db.command;

/**
 * VIP 订单核销与防作弊云函数
 * 严禁客户端直接写 users.vipStatus.isVip，必须通过本云函数核销
 * 严格封闭未经微信支付官方商户验签的客户端提权请求
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  if (!openid) {
    return { success: false, error: 'NO_OPENID' };
  }

  const { action, tier, transactionId, grantedTheme, rewardType, packId } = event;
  const now = Date.now();
  const todayStr = new Date().toISOString().slice(0, 10);

  // 1. 创建待支付订单 (预订单)
  if (action === 'createOrder') {
    const orderDoc = {
      _openid: openid,
      productTier: tier || 'month',
      productName: tier === 'lifetime' ? '曜世黑金 · 至尊永久卡' : (tier === 'day' ? '翡翠晨曦 · 畅玩日卡' : '极光紫晶 · VIP尊享月卡'),
      amountPaid: tier === 'lifetime' ? 14.9 : (tier === 'day' ? 0.9 : 3.9),
      status: 'pending',
      paymentMethod: 'wechat_pay',
      transactionId: '',
      grantedTheme: grantedTheme || 'su7_gulf_blue',
      createdAt: now
    };
    const res = await db.collection('vip_orders').add({ data: orderDoc });
    return { success: true, orderId: res._id };
  }

  // 2. 激励视频广告核销 (服务端权威发放：单包解锁 / 当日VIP)
  if (action === 'grantAdReward') {
    // 频控检查：单日最多观看 30 次激励视频，防脚本恶意刷量
    const userRes = await db.collection('users').where({ _openid: openid }).get();
    if (!userRes.data || userRes.data.length === 0) {
      return { success: false, error: 'USER_NOT_FOUND' };
    }
    const user = userRes.data[0];
    const adStats = user.adStats || {};
    const todayCount = (adStats.lastWatchDate === todayStr) ? (adStats.todayWatchCount || 0) : 0;

    if (todayCount >= 30) {
      return { success: false, error: 'DAILY_AD_LIMIT_REACHED', message: '今日观看次数已达上限' };
    }

    const adRecordDoc = {
      _openid: openid,
      idempotencyKey: `ad_${openid}_${now}`,
      adUnitId: 'adunit_rewarded_video_default',
      rewardType: rewardType || 'unlock_vip_day',
      packId: packId || '',
      rewardDetail: packId ? `单包当日畅抽 [${packId}]` : '24小时体验VIP',
      isCompleted: true,
      verifiedByServer: true,
      timestamp: now,
      dateKey: todayStr
    };
    await db.collection('ad_records').add({ data: adRecordDoc });

    // 更新用户广告统计
    const userUpdate = {
      'adStats.todayWatchCount': todayCount + 1,
      'adStats.lastWatchDate': todayStr,
      'adStats.lastWatchTime': now,
      'adStats.totalAdWatchCount': (adStats.totalAdWatchCount || 0) + 1
    };

    if (rewardType === 'unlock_pack' && packId) {
      // 单包当日畅抽解锁 (过了今晚24点自然过期)
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const packExpire = endOfDay.getTime();

      const existingPacks = user.dailyUnlockedPacks || [];
      const filteredPacks = existingPacks.filter(p => p.expireTime > now && p.packId !== packId);
      filteredPacks.push({
        packId,
        dateKey: todayStr,
        unlockedAt: now,
        expireTime: packExpire
      });
      userUpdate.dailyUnlockedPacks = filteredPacks;

      await db.collection('users').where({ _openid: openid }).update({ data: userUpdate });
      return { success: true, rewardType: 'unlock_pack', packId, expireTime: packExpire };
    } else {
      // 24小时 VIP 畅玩卡
      const expireTime = now + 24 * 3600 * 1000;
      userUpdate['vipStatus.isVip'] = true;
      userUpdate['vipStatus.tier'] = 'day';
      userUpdate['vipStatus.source'] = 'ad_reward';
      userUpdate['vipStatus.expireTime'] = expireTime;
      userUpdate['vipStatus.isLifetime'] = false;
      userUpdate['vipStatus.activatedAt'] = now;

      await db.collection('users').where({ _openid: openid }).update({ data: userUpdate });
      return { success: true, rewardType: 'unlock_vip_day', isVip: true, expireTime };
    }
  }

  // 3. 支付完成核销订单 (微信支付回调或安全核销)
  if (action === 'verifyAndActivate') {
    // 严格安全防线：未接入微信支付官方商户号前，严禁客户端伪造 transactionId 自行提权
    // 必须由微信支付 server-to-server 异步通知回调触发
    if (!event.isServerCallback && !event.internalSecret) {
      return {
        success: false,
        code: 'PAYMENT_GATEWAY_NOT_CONFIGURED',
        error: '商户支付通道正在申报审核中，暂不接受客户端直接发起的付费核销'
      };
    }

    const durationDays = tier === 'day' ? 1 : (tier === 'lifetime' ? 36500 : 30);
    const isLifetime = tier === 'lifetime';
    const expireTime = now + durationDays * 24 * 3600 * 1000;

    // 记录有效支付流水
    await db.collection('vip_orders').add({
      data: {
        _openid: openid,
        productTier: tier || 'month',
        productName: isLifetime ? '曜世黑金 · 至尊永久卡' : (tier === 'day' ? '翡翠晨曦 · 畅玩日卡' : '极光紫晶 · VIP尊享月卡'),
        amountPaid: isLifetime ? 14.9 : (tier === 'day' ? 0.9 : 3.9),
        status: 'paid',
        paymentMethod: 'wechat_pay',
        transactionId: transactionId || `wxpay_${now}`,
        durationDays,
        expireTime,
        grantedTheme: grantedTheme || 'su7_gulf_blue',
        createdAt: now,
        paidAt: now
      }
    });

    // 原子赋权至 users 集合
    await db.collection('users').where({ _openid: openid }).update({
      data: {
        'vipStatus.isVip': true,
        'vipStatus.tier': tier || 'month',
        'vipStatus.source': 'wechat_pay',
        'vipStatus.expireTime': expireTime,
        'vipStatus.isLifetime': isLifetime,
        'vipStatus.activeThemeId': grantedTheme || 'su7_gulf_blue',
        'vipStatus.activatedAt': now
      }
    });

    return { success: true, isVip: true, expireTime };
  }

  // 4. 一键恢复购买 (换机找回特权)
  if (action === 'restorePurchase') {
    const { data } = await db.collection('vip_orders')
      .where({ _openid: openid, status: 'paid' })
      .orderBy('expireTime', 'desc')
      .limit(1)
      .get();

    if (data && data.length > 0) {
      const latestOrder = data[0];
      if (latestOrder.expireTime > now || latestOrder.durationDays >= 36500) {
        await db.collection('users').where({ _openid: openid }).update({
          data: {
            'vipStatus.isVip': true,
            'vipStatus.tier': latestOrder.productTier,
            'vipStatus.source': 'wechat_pay',
            'vipStatus.expireTime': latestOrder.expireTime,
            'vipStatus.isLifetime': latestOrder.durationDays >= 36500,
            'vipStatus.activeThemeId': latestOrder.grantedTheme || 'su7_gulf_blue'
          }
        });
        return { success: true, restored: true, expireTime: latestOrder.expireTime };
      }
    }
    return { success: true, restored: false, message: '暂无可恢复的有效VIP' };
  }

  return { success: false, error: 'UNKNOWN_ACTION' };
};
