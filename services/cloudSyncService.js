// services/cloudSyncService.js
/**
 * 微信云开发双擎同步服务 (CloudBase Dual-Engine Sync Service)
 * 遵循 Local-First (本地优先) 准则：所有客户端交互 0ms 即时响应，后台异步增量落盘
 * 包含：微信永久头像上传、老用户本地历史无损合流、行为明细流水上报、递烟社交闭环与广告权益核销
 */

import { storageService } from './storageService.js';
import { vipService } from './vipService.js';

const CLOUD_ENV_ID = 'cloud1-d8gt9ep9q829b3828';
const DEBOUNCE_DELAY_MS = 2000;

class CloudSyncService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this._syncTimer = null;
    this._pendingProfileUpdates = {};
    this._pendingPublicUpdates = {};
    this._cachedOpenId = '';
  }

  /**
   * 初始化微信云开发环境
   */
  init() {
    if (this.isInitialized) return;
    try {
      if (typeof wx !== 'undefined' && wx.cloud) {
        wx.cloud.init({
          env: CLOUD_ENV_ID,
          traceUser: true
        });
        this.db = wx.cloud.database();
        this.isInitialized = true;
        console.log('[CloudSyncService] 微信云开发初始化就绪, 环境ID:', CLOUD_ENV_ID);
      } else {
        console.warn('[CloudSyncService] wx.cloud 未定义，降级至单机离线模式');
      }
    } catch (e) {
      console.warn('[CloudSyncService] 云开发初始化异常，降级运行:', e);
    }
  }

  /**
   * 检查云开发是否可用
   */
  isAvailable() {
    return this.isInitialized && this.db !== null;
  }

  /**
   * 上传微信临时头像到云存储，获取永久 fileID (彻底根治临时文件失效黑圈与破图)
   * @param {string} tempFilePath 本地临时头像路径
   * @returns {Promise<string>} 永久云存储 fileID 或原路径 (容灾)
   */
  async uploadUserAvatar(tempFilePath) {
    if (!tempFilePath || typeof tempFilePath !== 'string') return '';
    // 如果已经是云存储 fileID 或网络地址/Base64，直接复用
    if (tempFilePath.startsWith('cloud://') || tempFilePath.startsWith('http://') || tempFilePath.startsWith('https://') || tempFilePath.startsWith('data:')) {
      return tempFilePath;
    }

    if (!this.isAvailable()) {
      return tempFilePath;
    }

    try {
      let ext = '.png';
      const dotIdx = tempFilePath.lastIndexOf('.');
      if (dotIdx !== -1) {
        const potentialExt = tempFilePath.substring(dotIdx).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.webp'].includes(potentialExt)) {
          ext = potentialExt;
        }
      }
      const randStr = Math.random().toString(36).slice(2, 8);
      const cloudPath = `user-avatars/avatar_${Date.now()}_${randStr}${ext}`;

      const res = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath
      });

      if (res && res.fileID) {
        console.log('[CloudSyncService] 头像上传成功, 获得永久 fileID:', res.fileID);
        return res.fileID;
      }
    } catch (err) {
      console.warn('[CloudSyncService] uploadUserAvatar failed, fallback to local path:', err);
    }
    return tempFilePath;
  }

  /**
   * 获取或初始化用户云端档案 (首次启动自动执行本地老数据平滑合流)
   * @param {Object} localProfile 本地缓存的个人画像
   * @param {Array} localRecords 本地缓存的历史替烟流水
   */
  async getOrInitUserProfile(localProfile = {}, localRecords = []) {
    if (!this.isAvailable()) {
      return localProfile;
    }

    // 优先通过服务端 syncUserOnLaunch 云函数进行安全鉴权与合流
    if (typeof wx !== 'undefined' && wx.cloud && wx.cloud.callFunction) {
      try {
        const platform = (wx.getSystemInfoSync) ? wx.getSystemInfoSync().platform : 'devtools';
        const cloudRes = await wx.cloud.callFunction({
          name: 'syncUserOnLaunch',
          data: {
            localProfile,
            localRecords,
            clientPlatform: platform,
            localSettings: {
              selectedSceneId: storageService.getAtmosphereScene ? storageService.getAtmosphereScene() : 'obsidian'
            },
            localAchievements: {
              equippedTitleName: storageService.getEquippedTitle ? storageService.getEquippedTitle() : '破土初萌',
              unlockedAchievements: storageService.getUnlockedAchievements ? storageService.getUnlockedAchievements() : ['title_1']
            },
            localEquipment: {
              selectedCigaretteId: storageService.getSelectedCigaretteId ? storageService.getSelectedCigaretteId() : 'chaotianmen_gold',
              selectedToolId: storageService.getSelectedIgnitionTool ? storageService.getSelectedIgnitionTool() : 'flint_lighter',
              selectedSmokeEffectId: storageService.getSelectedSmokeEffectId ? storageService.getSelectedSmokeEffectId() : 'auspicious_river',
              unlockedSmokeEffects: storageService.getUnlockedSmokeEffects ? storageService.getUnlockedSmokeEffects() : ['ring_classic', 'auspicious_river'],
              packInventories: storageService.getAllPackInventories ? storageService.getAllPackInventories() : {},
              packSlots: storageService.getAllPackSlots ? storageService.getAllPackSlots() : {}
            },
            localCheckIn: {
              streakDays: storageService.getCheckInDates ? (storageService.getCheckInDates().length > 0 ? 1 : 0) : 0,
              recentCheckInDates: storageService.getCheckInDates ? storageService.getCheckInDates() : []
            },
            localFund: {
              spentSavings: storageService.getSpentSavings ? storageService.getSpentSavings() : 0
            }
          }
        });

        if (cloudRes && cloudRes.result && cloudRes.result.success && cloudRes.result.user) {
          const user = cloudRes.result.user;
          if (user._openid) this._cachedOpenId = user._openid;
          return user;
        }
      } catch (cfErr) {
        console.warn('[CloudSyncService] syncUserOnLaunch 云函数暂不可用，降级至客户端 SDK 直连模式:', cfErr);
      }
    }

    try {
      const { data } = await this.db.collection('users').where({
        _openid: '{openid}'
      }).get();

      if (Array.isArray(data) && data.length > 0) {
        // 老用户：返回云端权威档案
        const cloudUser = data[0];
        if (cloudUser._openid) {
          this._cachedOpenId = cloudUser._openid;
        }
        return cloudUser;
      }

      // 新用户（或首次联网的老用户）：执行首次平滑合流算法 (不缩水、全要素无损原则)
      const localSubs = Array.isArray(localRecords) ? localRecords.length : 0;
      const packPrice = Number(localProfile.packPrice) || 25;
      const savedMoney = Number(((localSubs * packPrice) / 20).toFixed(2));
      const platform = (typeof wx !== 'undefined' && wx.getSystemInfoSync) ? wx.getSystemInfoSync().platform : 'devtools';

      // 提取本地全部配置与状态，确保 100% 无损上云
      const localScene = (storageService && storageService.getAtmosphereScene) ? storageService.getAtmosphereScene() : 'obsidian';
      const localTool = (storageService && storageService.getSelectedIgnitionTool) ? storageService.getSelectedIgnitionTool() : 'flint_lighter';
      const localEffect = (storageService && storageService.getSelectedSmokeEffectId) ? storageService.getSelectedSmokeEffectId() : 'auspicious_river';
      const localCig = (storageService && storageService.getSelectedCigaretteId) ? storageService.getSelectedCigaretteId() : 'chaotianmen_gold';
      const localAchievements = (storageService && storageService.getUnlockedAchievements) ? storageService.getUnlockedAchievements() : ['title_1'];
      const localEquippedTitle = (storageService && storageService.getEquippedTitle) ? storageService.getEquippedTitle() : '破土初萌';
      const localPackInventories = (storageService && storageService.getAllPackInventories) ? storageService.getAllPackInventories() : {};
      const localPackSlots = (storageService && storageService.getAllPackSlots) ? storageService.getAllPackSlots() : {};
      const localCheckInDates = (storageService && storageService.getCheckInDates) ? storageService.getCheckInDates() : [];
      const localSpentSavings = (storageService && storageService.getSpentSavings) ? storageService.getSpentSavings() : 0;
      const localIgniteCount = (storageService && storageService.getIgniteCount) ? storageService.getIgniteCount() : localSubs;
      const localUnlockedEffects = (storageService && storageService.getUnlockedSmokeEffects) ? storageService.getUnlockedSmokeEffects() : ['ring_classic', 'auspicious_river'];

      const newDoc = {
        nickName: localProfile.nickName || '无烟觉醒者',
        avatarUrl: localProfile.avatarUrl || '',
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        schemaVersion: '2.0.0',
        migrationStatus: 'completed',
        clientPlatform: platform,
        smokeProfile: {
          smokeYears: Number(localProfile.smokeYears) || 5,
          cigsPerDay: Number(localProfile.cigsPerDay) || 15,
          packPrice: packPrice,
          quitStartDate: Number(localProfile.quitStartDate) || Date.now()
        },
        settings: {
          selectedSceneId: localScene,
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
          equippedTitleName: localEquippedTitle,
          unlockedAchievements: localAchievements.length > 0 ? localAchievements : ['title_1'],
          highestLevel: 1,
          meritPoints: 10
        },
        healthStats: {
          totalSubstituted: localSubs, // 继承老用户本地已抽支数
          totalSavedMoney: savedMoney,
          totalTarAvoided: Number((localSubs * 10.0).toFixed(1)),
          totalLifeRegained: localSubs * 11,
          totalIgnites: localIgniteCount,
          totalFinishedCigs: localSubs,
          fidgetCount: 0
        },
        savingsFund: {
          spentSavings: localSpentSavings
        },
        checkIn: {
          streakDays: localCheckInDates.length > 0 ? 1 : 0,
          maxStreakDays: localCheckInDates.length > 0 ? 1 : 0,
          lastCheckInDate: localCheckInDates[localCheckInDates.length - 1] || '',
          recentCheckInDates: localCheckInDates
        },
        equipment: {
          selectedCigaretteId: localCig,
          selectedToolId: localTool,
          selectedSmokeEffectId: localEffect,
          unlockedCigarettes: ['chaotianmen_gold', 'baisha_white', 'marlboro_ice'],
          unlockedSmokeEffects: localUnlockedEffects,
          packInventories: localPackInventories,
          packSlots: localPackSlots
        },
        social: {
          declaration: '纯净呼吸，从每一支赛博替烟开始。',
          likesReceived: 0,
          givenCigarettesCount: 0,
          receivedCigarettesCount: 0
        }
      };

      const addRes = await this.db.collection('users').add({ data: newDoc });
      if (addRes && addRes._id) {
        newDoc._id = addRes._id;
      }

      // 首次同时初始化/同步一份脱敏公开资料到 public_profiles (提供排行榜/社交安全读取)
      try {
        await this.syncPublicProfile({
          nickName: newDoc.nickName,
          avatarUrl: newDoc.avatarUrl,
          equippedTitleName: newDoc.achievements.equippedTitleName,
          totalSubstituted: newDoc.healthStats.totalSubstituted,
          totalSavedMoney: newDoc.healthStats.totalSavedMoney,
          streakDays: newDoc.checkIn.streakDays,
          likesReceived: 0,
          declaration: newDoc.social.declaration,
          isVip: false
        });
      } catch (pubErr) {
        console.warn('[CloudSyncService] syncPublicProfile initial error:', pubErr);
      }

      return newDoc;
    } catch (err) {
      console.warn('[CloudSyncService] getOrInitUserProfile fallback:', err);
      return localProfile;
    }
  }

  /**
   * 异步防抖提交用户公开资料 (供全网英雄榜、递烟送礼等跨用户读取)
   * @param {Object} partialPublic 公开字段 (nickName, avatarUrl, equippedTitleName, totalSubstituted, totalSavedMoney, streakDays, declaration, isVip)
   */
  async syncPublicProfile(partialPublic = {}) {
    if (!this.isAvailable() || !partialPublic || Object.keys(partialPublic).length === 0) return;

    try {
      const publicData = {
        ...partialPublic,
        updatedAt: Date.now()
      };
      // 使用 where(_openid: '{openid}') 配合安全规则更新或插入
      const { data } = await this.db.collection('public_profiles').where({
        _openid: '{openid}'
      }).get();

      if (Array.isArray(data) && data.length > 0) {
        await this.db.collection('public_profiles').doc(data[0]._id).update({
          data: publicData
        });
      } else {
        await this.db.collection('public_profiles').add({
          data: {
            ...publicData,
            createdAt: Date.now()
          }
        });
      }
    } catch (err) {
      console.warn('[CloudSyncService] syncPublicProfile error:', err);
    }
  }

  /**
   * 异步防抖提交用户画像更新 (Debounced Sync)
   * 严格安全白名单过滤：仅允许客户端修改画像基础展示与个性化偏好，绝对禁止客户端直接写 VIP 或健康大盘
   * @param {Object} partialUpdates 增量更新字段
   */
  syncUserProfile(partialUpdates = {}) {
    if (!this.isAvailable() || !partialUpdates || Object.keys(partialUpdates).length === 0) return;

    // 腾讯安全规范：客户端写入白名单 (严格杜绝篡改 vipStatus、healthStats、adStats、achievements)
    const ALLOWED_CLIENT_KEYS = [
      'nickName',
      'avatarUrl',
      'settings.selectedSceneId',
      'settings.soundMuted',
      'settings.ambientEnabled',
      'equipment.selectedCigaretteId',
      'equipment.selectedToolId',
      'equipment.selectedSmokeEffectId',
      'smokeProfile.smokeYears',
      'smokeProfile.cigsPerDay',
      'smokeProfile.packPrice',
      'social.declaration'
    ];

    const safeUpdates = {};
    for (const key of Object.keys(partialUpdates)) {
      if (ALLOWED_CLIENT_KEYS.includes(key)) {
        safeUpdates[key] = partialUpdates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return;
    }

    this._pendingProfileUpdates = {
      ...this._pendingProfileUpdates,
      ...safeUpdates,
      lastLoginAt: Date.now()
    };

    // 若包含公开展示字段，准备双写到 public_profiles (公开榜单脱敏展示)
    const publicFields = {};
    if (safeUpdates.nickName !== undefined) publicFields.nickName = safeUpdates.nickName;
    if (safeUpdates.avatarUrl !== undefined) publicFields.avatarUrl = safeUpdates.avatarUrl;
    if (safeUpdates['social.declaration'] !== undefined) publicFields.declaration = safeUpdates['social.declaration'];

    if (Object.keys(publicFields).length > 0) {
      this._pendingPublicUpdates = {
        ...this._pendingPublicUpdates,
        ...publicFields
      };
    }

    if (this._syncTimer) {
      clearTimeout(this._syncTimer);
    }

    this._syncTimer = setTimeout(async () => {
      const updates = { ...this._pendingProfileUpdates };
      const pubUpdates = { ...this._pendingPublicUpdates };
      this._pendingProfileUpdates = {};
      this._pendingPublicUpdates = {};
      try {
        await this.db.collection('users').where({
          _openid: '{openid}'
        }).update({
          data: updates
        });
        console.log('[CloudSyncService] 用户私有档案已增量同步:', Object.keys(updates));

        if (Object.keys(pubUpdates).length > 0) {
          await this.syncPublicProfile(pubUpdates);
          console.log('[CloudSyncService] 用户公开档案已双写同步:', Object.keys(pubUpdates));
        }
      } catch (e) {
        console.warn('[CloudSyncService] syncUserProfile failed:', e);
      }
    }, DEBOUNCE_DELAY_MS);
  }

  /**
   * 记录替烟行为明细流水 (抽完结算时单次触发写入)
   * @param {Object} recordData 替烟记录
   */
  async recordSmokeAction(recordData = {}) {
    if (!this.isAvailable() || !recordData) return;

    const payload = {
      idempotencyKey: recordData.id || `smoke_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      cigaretteId: recordData.cigaretteId || 'chaotianmen_gold',
      cigaretteName: recordData.cigaretteName || '',
      category: recordData.category || 'national',
      durationSeconds: Number(recordData.durationSeconds) || 0,
      inhaleCount: Number(recordData.inhaleCount) || 0,
      ashTapCount: Number(recordData.ashTapCount) || 0,
      beadPopped: !!recordData.beadPopped,
      savedMoney: Number(recordData.savedMoney) || 0,
      tarAvoided: Number(recordData.tarAvoided) || 0,
      lifeRegained: Number(recordData.lifeRegained) || 0,
      usedToolId: recordData.usedToolId || 'flint_lighter',
      usedEffectId: recordData.usedEffectId || 'auspicious_river',
      usedSceneId: recordData.usedSceneId || 'obsidian',
      timestamp: recordData.timestamp || Date.now(),
      dateKey: new Date().toISOString().slice(0, 10)
    };

    try {
      await this.db.collection('smoke_records').add({
        data: payload
      });

      // 原子累加私有大盘健康数据
      const _ = this.db.command;
      await this.db.collection('users').where({ _openid: '{openid}' }).update({
        data: {
          'healthStats.totalSubstituted': _.inc(1),
          'healthStats.totalFinishedCigs': _.inc(1),
          'healthStats.totalSavedMoney': _.inc(payload.savedMoney),
          'healthStats.totalTarAvoided': _.inc(payload.tarAvoided),
          'healthStats.totalLifeRegained': _.inc(payload.lifeRegained),
          lastLoginAt: Date.now()
        }
      });

      // 原子累加公开大盘榜单数据 (public_profiles)
      try {
        await this.db.collection('public_profiles').where({ _openid: '{openid}' }).update({
          data: {
            totalSubstituted: _.inc(1),
            totalSavedMoney: _.inc(payload.savedMoney),
            updatedAt: Date.now()
          }
        });
      } catch (pubSyncErr) {
        console.warn('[CloudSyncService] update public_profiles smoke stats fallback:', pubSyncErr);
      }
    } catch (e) {
      console.warn('[CloudSyncService] recordSmokeAction error:', e);
    }
  }

  /**
   * 社交递烟：生成送出一支烟的礼单
   */
  async sendGiftCigarette(giftData = {}) {
    if (!this.isAvailable()) return null;
    try {
      const res = await this.db.collection('social_gifts').add({
        data: {
          senderNickName: giftData.senderNickName || '老哥',
          senderAvatarUrl: giftData.senderAvatarUrl || '',
          cigaretteId: giftData.cigaretteId || 'marlboro_ice',
          cigaretteName: giftData.cigaretteName || '名烟',
          message: giftData.message || '老哥，来一根电子赛博烟！少抽实体烟，健康每一天！',
          isAccepted: false,
          acceptedAt: 0,
          meritAwarded: false,
          createdAt: Date.now()
        }
      });

      // 递烟人本地计数累加
      const _ = this.db.command;
      await this.db.collection('users').where({ _openid: '{openid}' }).update({
        data: {
          'social.givenCigarettesCount': _.inc(1)
        }
      });

      return res._id;
    } catch (e) {
      console.warn('[CloudSyncService] sendGiftCigarette error:', e);
      return null;
    }
  }

  /**
   * 社交受赠：点燃并收下敬意 (回填收烟人，核销功德)
   * 优先路由至 interactHero 云函数进行原子核销与双向计数防重
   */
  async acceptGiftCigarette(giftId, receiverInfo = {}) {
    if (!this.isAvailable() || !giftId) return;

    // 1. 优先调用 interactHero 服务端原子核销
    if (typeof wx !== 'undefined' && wx.cloud && wx.cloud.callFunction) {
      try {
        const cloudRes = await wx.cloud.callFunction({
          name: 'interactHero',
          data: {
            action: 'acceptGift',
            giftId,
            receiverNickName: receiverInfo.nickName || '烟友'
          }
        });
        if (cloudRes && cloudRes.result && cloudRes.result.success) {
          return true;
        }
      } catch (callErr) {
        console.warn('[CloudSyncService] callFunction interactHero acceptGift fallback:', callErr);
      }
    }

    // 2. 数据库安全规则下的降级更新
    try {
      await this.db.collection('social_gifts').doc(giftId).update({
        data: {
          toOpenid: '{openid}',
          receiverNickName: receiverInfo.nickName || '烟友',
          isAccepted: true,
          acceptedAt: Date.now(),
          meritAwarded: true
        }
      });

      // 收烟人社交计数累加
      const _ = this.db.command;
      await this.db.collection('users').where({ _openid: '{openid}' }).update({
        data: {
          'social.receivedCigarettesCount': _.inc(1)
        }
      });
      return true;
    } catch (e) {
      console.warn('[CloudSyncService] acceptGiftCigarette error:', e);
      return false;
    }
  }

  /**
   * 微信激励视频广告观看完成，核销 VIP 权益或单品烟盒当日畅抽
   * 遵循服务端权威原则：必须由 handleVipOrder 云函数进行安全核销与幂等校验
   * 严禁客户端私自往 ad_records 或 users.vipStatus 写入完成态
   */
  async grantAdReward(rewardType = 'unlock_vip_day', packId = '') {
    if (!this.isAvailable()) return null;
    const now = Date.now();

    try {
      // 必须通过服务端云函数 handleVipOrder 进行权益核销 (权威抗篡改，禁止客户端自发 VIP)
      if (typeof wx !== 'undefined' && wx.cloud && wx.cloud.callFunction) {
        const cloudRes = await wx.cloud.callFunction({
          name: 'handleVipOrder',
          data: {
            action: 'grantAdReward',
            rewardType,
            packId
          }
        });
        if (cloudRes && cloudRes.result && cloudRes.result.success) {
          return cloudRes.result;
        }
        return { success: false, error: (cloudRes && cloudRes.result && cloudRes.result.error) || 'GRANT_REWARD_REJECTED' };
      }

      return { success: false, error: 'CLOUD_UNAVAILABLE' };
    } catch (e) {
      console.warn('[CloudSyncService] grantAdReward error:', e);
      return null;
    }
  }

  /**
   * 获取全局单例系统配置 (审核开关、运营公告、动态广告位)
   */
  async fetchSystemConfig() {
    if (!this.isAvailable()) return null;
    try {
      const res = await this.db.collection('system_config').doc('global_runtime_config').get();
      return res.data || null;
    } catch (e) {
      // 容灾默认配置
      return {
        reviewSwitches: {
          iosReviewMode: false,
          enableVipPurchase: true,
          enableSocialGift: true,
          enableLeaderboard: true
        },
        adConfig: {
          enableRewardedAds: false, // 阶段一：0~1000 UV 默认关停，零报错
          rewardedVideoAdUnitId: '',
          adRewardVipDurationHours: 24,
          maxDailyAdWatches: 5
        }
      };
    }
  }

  /**
   * 提交意见反馈或举报作弊
   */
  async submitFeedback(feedbackData = {}) {
    if (!this.isAvailable()) return false;
    try {
      await this.db.collection('feedbacks').add({
        data: {
          type: feedbackData.type || 'suggestion',
          targetOpenid: feedbackData.targetOpenid || '',
          targetContent: feedbackData.targetContent || '',
          contact: feedbackData.contact || '',
          status: 'pending',
          createdAt: Date.now()
        }
      });
      return true;
    } catch (e) {
      console.warn('[CloudSyncService] submitFeedback error:', e);
      return false;
    }
  }

  /**
   * 拉取待领取的运营后台系统奖励 (支持后台赠送任意 VIP、烟品、特效、满盒、基金等)
   */
  async fetchPendingSystemRewards() {
    if (!this.isAvailable()) return [];
    try {
      const { data } = await this.db.collection('system_rewards')
        .where({
          toOpenid: '{openid}',
          isClaimed: false
        })
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn('[CloudSyncService] fetchPendingSystemRewards skipped:', e);
      return [];
    }
  }

  /**
   * 核销领取运营后台系统奖励
   */
  async claimSystemReward(reward) {
    if (!reward) return false;
    const rewardId = reward._id || reward.id;

    // 1. 本地落地权益
    this.applySystemReward(reward);

    // 2. 云端标记已领 (非阻塞)
    if (this.isAvailable() && rewardId) {
      try {
        await this.db.collection('system_rewards').doc(rewardId).update({
          data: {
            isClaimed: true,
            claimedAt: Date.now()
          }
        });
      } catch (e) {
        console.warn('[CloudSyncService] claimSystemReward cloud update error:', e);
      }
    }
    return true;
  }

  /**
   * 将任意商品权益应用到本地存储 (Local-First 即刻生效)
   */
  applySystemReward(reward) {
    if (!reward || !reward.rewardType) return false;
    const { rewardType, rewardValue } = reward;
    const now = Date.now();

    switch (rewardType) {
      case 'vip_days': {
        const days = Math.max(1, Number(rewardValue) || 1);
        const curVip = vipService.getVipInfo();
        const base = (curVip.isVip && !curVip.isLifetime && curVip.expireTime > now) ? curVip.expireTime : now;
        const newExpire = base + days * 24 * 3600 * 1000;
        vipService.syncFromCloud({
          tier: 'month',
          expireTime: newExpire,
          isLifetime: false,
          activeThemeId: 'month',
          activatedAt: now
        });
        break;
      }
      case 'vip_lifetime': {
        vipService.syncFromCloud({
          tier: 'lifetime',
          expireTime: now + 100 * 365 * 24 * 3600 * 1000,
          isLifetime: true,
          activeThemeId: 'lifetime',
          activatedAt: now
        });
        break;
      }
      case 'unlock_cigarette': {
        if (typeof rewardValue === 'string') {
          storageService.unlockCigarette(rewardValue);
          storageService.resetPackCount(rewardValue);
        }
        break;
      }
      case 'daily_pack_pass': {
        if (typeof rewardValue === 'string') {
          storageService.unlockCigaretteForToday(rewardValue);
          storageService.resetPackCount(rewardValue);
        }
        break;
      }
      case 'refill_pack': {
        if (typeof rewardValue === 'string' && rewardValue !== 'all') {
          storageService.resetPackCount(rewardValue);
        } else {
          const inv = storageService.getAllPackInventories();
          Object.keys(inv).forEach(cigId => storageService.resetPackCount(cigId));
        }
        break;
      }
      case 'unlock_smoke_effect': {
        if (typeof rewardValue === 'string') {
          storageService.unlockSmokeEffect(rewardValue);
        }
        break;
      }
      default:
        break;
    }
    return true;
  }
}

export const cloudSyncService = new CloudSyncService();
