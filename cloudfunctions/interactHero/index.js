// cloudfunctions/interactHero/index.js
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const _ = db.command;

/**
 * 英雄榜互动与点赞防刷云函数
 * 1. 每日去重：单人对单个英雄单日限点赞 1 次
 * 2. 原子增量：使用 db.command.inc(1) 避免并发写入丢失
 * 3. 递烟受赠功德安全结算
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  if (!openid) {
    return { success: false, error: 'NO_OPENID' };
  }

  const { action, targetOpenid, giftId } = event;

  // 1. 英雄榜点赞 (原子增量 + 主键防刷)
  if (action === 'likeHero') {
    if (!targetOpenid) return { success: false, error: 'MISSING_TARGET' };
    const todayStr = new Date().toISOString().slice(0, 10);
    const likeDocId = `like_${openid}_${targetOpenid}_${todayStr}`;

    try {
      // 检查今日是否已点赞 (写入防重记录)
      await db.collection('feedbacks').add({
        data: {
          _id: likeDocId,
          _openid: openid,
          type: 'like_action',
          targetOpenid,
          dateKey: todayStr,
          createdAt: Date.now()
        }
      });

      // 原子增加目标用户的 likesReceived (私有表 + 公开榜单表)
      await db.collection('users').where({ _openid: targetOpenid }).update({
        data: {
          'social.likesReceived': _.inc(1)
        }
      });

      try {
        await db.collection('public_profiles').where({ _openid: targetOpenid }).update({
          data: {
            likesReceived: _.inc(1),
            updatedAt: Date.now()
          }
        });
      } catch (pubErr) {}

      return { success: true, isLiked: true };
    } catch (e) {
      // 若已存在主键冲突，说明今日已点赞过
      return { success: true, isLiked: false, message: '今日已为该戒烟英雄点过赞' };
    }
  }

  // 2. 递烟礼遇核销与功德到账
  if (action === 'acceptGift') {
    if (!giftId) return { success: false, error: 'MISSING_GIFT_ID' };
    try {
      const giftRes = await db.collection('social_gifts').doc(giftId).get();
      if (giftRes && giftRes.data) {
        const gift = giftRes.data;
        if (!gift.isAccepted) {
          // 标记已点燃
          await db.collection('social_gifts').doc(giftId).update({
            data: {
              toOpenid: openid,
              isAccepted: true,
              acceptedAt: Date.now(),
              meritAwarded: true
            }
          });

          // 给送烟人增加功德 10 分
          await db.collection('users').where({ _openid: gift._openid }).update({
            data: {
              'achievements.meritPoints': _.inc(10)
            }
          });

          // 给收烟人累加收烟计数
          await db.collection('users').where({ _openid: openid }).update({
            data: {
              'social.receivedCigarettesCount': _.inc(1)
            }
          });

          return { success: true, meritAwarded: true };
        }
      }
      return { success: true, alreadyAccepted: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: 'UNKNOWN_ACTION' };
};
