// cloudfunctions/syncUserOnLaunch/index.js
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

/**
 * 用户冷启动鉴权与数据合流云函数
 * 1. 自动提取微信官方 openid，实现零感知免密建档
 * 2. 老用户静默拉取并更新 lastLoginAt
 * 3. 首次上云时执行本地历史替烟数与成就平滑合流 (不缩水原则)
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  if (!openid) {
    return { success: false, error: 'NO_OPENID' };
  }

  const { localProfile, localRecords } = event;

  try {
    const { data } = await db.collection('users').where({ _openid: openid }).get();
    if (data && data.length > 0) {
      // 老用户更新最近活跃时间
      await db.collection('users').doc(data[0]._id).update({
        data: { lastLoginAt: Date.now() }
      });
      return { success: true, isNew: false, user: data[0] };
    }

    // 新用户或者老用户初次上云合流
    const localSubs = Array.isArray(localRecords) ? localRecords.length : 0;
    const packPrice = Number(localProfile && localProfile.packPrice) || 25;
    const savedMoney = Number(((localSubs * packPrice) / 20).toFixed(2));

    const newDoc = {
      _openid: openid,
      nickName: (localProfile && localProfile.nickName) || '无烟觉醒者',
      avatarUrl: (localProfile && localProfile.avatarUrl) || '',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      schemaVersion: '2.0.0',
      migrationStatus: 'completed',
      migrationSnapshot: {
        totalImported: localSubs,
        migratedAt: Date.now()
      },
      dailyUnlockedPacks: [],
      clientPlatform: event.clientPlatform || 'devtools',
      smokeProfile: {
        smokeYears: Number(localProfile && localProfile.smokeYears) || 5,
        cigsPerDay: Number(localProfile && localProfile.cigsPerDay) || 15,
        packPrice: packPrice,
        quitStartDate: Number(localProfile && localProfile.quitStartDate) || Date.now()
      },
      settings: {
        selectedSceneId: (event.localSettings && event.localSettings.selectedSceneId) || 'obsidian',
        soundMuted: false,
        ambientEnabled: true
      },
      vipStatus: {
        isVip: false,
        tier: 'none',
        source: 'none',
        expireTime: 0,
        isLifetime: false,
        activeThemeId: 'classic'
      },
      adStats: {
        todayWatchCount: 0,
        lastWatchDate: '',
        lastWatchTime: 0,
        totalAdWatchCount: 0
      },
      achievements: {
        equippedTitle: 'title_1',
        equippedTitleName: (event.localAchievements && event.localAchievements.equippedTitleName) || '破土初萌',
        unlockedAchievements: (event.localAchievements && event.localAchievements.unlockedAchievements) || ['title_1'],
        highestLevel: 1,
        meritPoints: 10
      },
      healthStats: {
        totalSubstituted: localSubs,
        totalSavedMoney: savedMoney,
        totalTarAvoided: Number((localSubs * 10.0).toFixed(1)),
        totalLifeRegained: localSubs * 11,
        totalIgnites: (event.localHealth && event.localHealth.totalIgnites) || localSubs,
        totalFinishedCigs: localSubs,
        fidgetCount: 0
      },
      savingsFund: {
        spentSavings: (event.localFund && event.localFund.spentSavings) || 0
      },
      checkIn: {
        streakDays: (event.localCheckIn && event.localCheckIn.streakDays) || (localSubs > 0 ? 1 : 0),
        maxStreakDays: (event.localCheckIn && event.localCheckIn.maxStreakDays) || (localSubs > 0 ? 1 : 0),
        lastCheckInDate: (event.localCheckIn && event.localCheckIn.lastCheckInDate) || '',
        recentCheckInDates: (event.localCheckIn && event.localCheckIn.recentCheckInDates) || []
      },
      equipment: {
        selectedCigaretteId: (event.localEquipment && event.localEquipment.selectedCigaretteId) || 'chaotianmen_gold',
        selectedToolId: (event.localEquipment && event.localEquipment.selectedToolId) || 'flint_lighter',
        selectedSmokeEffectId: (event.localEquipment && event.localEquipment.selectedSmokeEffectId) || 'auspicious_river',
        unlockedCigarettes: ['chaotianmen_gold', 'baisha_white', 'marlboro_ice'],
        unlockedSmokeEffects: (event.localEquipment && event.localEquipment.unlockedSmokeEffects) || ['ring_classic', 'auspicious_river'],
        packInventories: (event.localEquipment && event.localEquipment.packInventories) || {},
        packSlots: (event.localEquipment && event.localEquipment.packSlots) || {}
      },
      social: {
        declaration: '纯净呼吸，从每一支赛博替烟开始。',
        likesReceived: 0,
        givenCigarettesCount: 0,
        receivedCigarettesCount: 0
      }
    };

    const addRes = await db.collection('users').add({ data: newDoc });
    newDoc._id = addRes._id;

    // 同步初始化脱敏公开资料到 public_profiles
    try {
      await db.collection('public_profiles').add({
        data: {
          _openid: openid,
          nickName: newDoc.nickName,
          avatarUrl: newDoc.avatarUrl,
          equippedTitleName: newDoc.achievements.equippedTitleName,
          totalSubstituted: newDoc.healthStats.totalSubstituted,
          totalSavedMoney: newDoc.healthStats.totalSavedMoney,
          streakDays: newDoc.checkIn.streakDays,
          likesReceived: 0,
          declaration: newDoc.social.declaration,
          isVip: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      });
    } catch (pubErr) {
      console.warn('public_profiles init warning:', pubErr);
    }

    return { success: true, isNew: true, user: newDoc };
  } catch (err) {
    console.error('syncUserOnLaunch error:', err);
    return { success: false, error: err.message };
  }
};
