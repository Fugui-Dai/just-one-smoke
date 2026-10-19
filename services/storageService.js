// services/storageService.js
import { DEFAULT_USER_AVATAR_SVG } from '../utils/vectorIcons.js';
import { getRandomNickname } from '../utils/nicknamePool.js';
import { getRandomAvatarSvg } from '../utils/avatarGenerator.js';
import { getAchievementById, getTitleWeight } from '../configs/achievements.js';
import { vipService } from './vipService.js';

const PROFILE_KEY = 'SMOKEFREE_PROFILE';
const RECORDS_KEY = 'SMOKEFREE_RECORDS';
const SELECTED_CIGARETTE_KEY = 'SMOKEFREE_SELECTED_CIGARETTE';
const ACHIEVEMENTS_KEY = 'SMOKEFREE_UNLOCKED_ACHIEVEMENTS';
const EQUIPPED_TITLE_KEY = 'SMOKEFREE_EQUIPPED_TITLE';
const PACK_INVENTORY_KEY = 'SMOKEFREE_PACK_INVENTORY';
const PACK_SLOTS_KEY = 'SMOKEFREE_PACK_SLOTS';
const HOME_STICK_DIGESTED_KEY = 'SMOKEFREE_HOME_STICK_DIGESTED';
const CHECKIN_DATES_KEY = 'SMOKEFREE_CHECKIN_DATES';
const SPENT_SAVINGS_KEY = 'SMOKEFREE_SPENT_SAVINGS';
const TRIAL_CIGARETTE_KEY = 'SMOKEFREE_TRIAL_CIGARETTE';
const SUMMONED_EFFECTS_KEY = 'SMOKEFREE_SUMMONED_SMOKE_EFFECTS';
const LAST_DAILY_REFRESH_DATE_KEY = 'SMOKEFREE_LAST_DAILY_REFRESH_DATE';
const DAILY_FREE_UNWRAP_KEY = 'SMOKEFREE_DAILY_FREE_UNWRAP_INFO';
const MAX_DAILY_FREE_UNWRAPS = 2;
const DEFAULT_CIGARETTE_ID = 'chaotianmen_gold';

// 新增生活化物理资产与防刷键名
const UNOPENED_PACKS_KEY = 'SMOKEFREE_UNOPENED_PACKS_COUNT'; // 抽屉/库存里未拆封整包数
const DAILY_SMOKE_COUNT_KEY = 'SMOKEFREE_DAILY_SMOKE_COUNT'; // 当日已吸支数统计（40支硬顶触发饮茶润喉）
const LAST_MONOTONIC_TS_KEY = 'SMOKEFREE_LAST_MONOTONIC_TIMESTAMP'; // 单调递增时间戳（防篡改手机时间刷烟）
const ASHTRAY_BUTTS_KEY = 'SMOKEFREE_ASHTRAY_BUTTS_LIST'; // 桌面微距烟灰缸内的烟蒂沉淀数据
const ASHTRAY_ASH_KEY = 'SMOKEFREE_ASHTRAY_ASH_DATA'; // 桌面微距烟灰缸内的灰渣/炭灰沉淀数据

function getItem(key) {
  try {
    return wx.getStorageSync(key);
  } catch {
    return null;
  }
}

function setItem(key, val) {
  try {
    wx.setStorageSync(key, val);
  } catch {}
}

function removeItem(key) {
  try {
    wx.removeStorageSync(key);
  } catch {}
}

function getDailyStats(records, days = 7, refDate = new Date()) {
  const result = [];
  const map = {};

  if (Array.isArray(records)) {
    records.forEach(r => {
      if (!r || !r.timestamp) return;
      const ts = typeof r.timestamp === 'string' ? Number(r.timestamp) || Date.parse(r.timestamp) : r.timestamp;
      const d = new Date(ts);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + 1;
    });
  }

  const now = refDate instanceof Date ? refDate : new Date(refDate);
  const curY = now.getFullYear();
  const curM = now.getMonth();
  const curD = now.getDate();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(curY, curM, curD - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const label = i === 0 ? '今天' : `${month}/${day}`;
    result.push({
      dateKey: key,
      label,
      count: map[key] || 0
    });
  }
  return result;
}

export const storageService = {
  getProfile() {
    const raw = getItem(PROFILE_KEY);
    const defaultData = {
      nickName: '',
      avatarUrl: DEFAULT_USER_AVATAR_SVG,
      cigsPerDay: 15,
      packPrice: 25,
      smokeYears: 5,
      quitStartDate: Date.now()
    };
    if (!raw) {
      const initialNickname = getRandomNickname();
      const initialAvatar = getRandomAvatarSvg();
      const initialData = {
        ...defaultData,
        nickName: initialNickname,
        avatarUrl: initialAvatar
      };
      this.saveProfile(initialData);
      return initialData;
    }
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      let nickName = (parsed && parsed.nickName) ? parsed.nickName : '';
      let shouldResave = false;
      if (!nickName || nickName === '微信烟友') {
        nickName = getRandomNickname();
        parsed.nickName = nickName;
        shouldResave = true;
      }
      let avatarUrl = (parsed && parsed.avatarUrl) ? parsed.avatarUrl : '';
      const isLegacyAvatar = !avatarUrl || 
        avatarUrl.includes('avatarFigureGrad') || 
        avatarUrl.includes('avatarBgGrad') || 
        avatarUrl.includes('flagshipBg') ||
        avatarUrl.includes('avatarBg') ||
        avatarUrl.includes('C%2018%2064%20C%2018%2049');
      if (isLegacyAvatar) {
        avatarUrl = getRandomAvatarSvg();
        parsed.avatarUrl = avatarUrl;
        shouldResave = true;
      }
      if (shouldResave) {
        this.saveProfile(parsed);
      }
      return {
        ...defaultData,
        ...parsed,
        nickName,
        avatarUrl
      };
    } catch {
      const fallbackNickname = getRandomNickname();
      const fallbackAvatar = getRandomAvatarSvg();
      return {
        ...defaultData,
        nickName: fallbackNickname,
        avatarUrl: fallbackAvatar
      };
    }
  },

  saveProfile(profile) {
    setItem(PROFILE_KEY, profile);
  },

  updateProfile(partial) {
    const current = this.getProfile();
    const updated = { ...current, ...partial };
    this.saveProfile(updated);
    return updated;
  },

  getRecords() {
    const raw = getItem(RECORDS_KEY);
    if (!raw) return [];
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return [];
    }
  },

  getTotalSubstituteCount() {
    const raw = getItem('SMOKEFREE_TOTAL_SUBS_COUNT');
    if (raw !== null && raw !== undefined && !isNaN(Number(raw))) {
      return Math.max(0, Number(raw));
    }
    const currentRecords = this.getRecords();
    const count = currentRecords.length;
    setItem('SMOKEFREE_TOTAL_SUBS_COUNT', count);
    return count;
  },

  addRecord(record) {
    const records = this.getRecords();
    records.push(record);
    // 工业级上限控制：本地明细保留最新 1000 条，杜绝超出微信 10MB 存储上限导致崩溃
    if (records.length > 1000) {
      records.splice(0, records.length - 1000);
    }
    setItem(RECORDS_KEY, records);
    const prevTotal = this.getTotalSubstituteCount();
    setItem('SMOKEFREE_TOTAL_SUBS_COUNT', prevTotal + 1);
  },

  getCheckInDates() {
    const raw = getItem(CHECKIN_DATES_KEY);
    if (!raw) return [];
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
    } catch {
      return [];
    }
  },

  hasCheckedInToday(dateObj = new Date()) {
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    if (isNaN(d.getTime())) return false;
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dates = this.getCheckInDates();
    return Array.isArray(dates) && dates.includes(dateStr);
  },

  recordDailyCheckIn(dateObj = new Date()) {
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    if (isNaN(d.getTime())) return this.getCheckInDates();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dates = this.getCheckInDates();
    if (!dates.includes(dateStr)) {
      dates.push(dateStr);
      setItem(CHECKIN_DATES_KEY, dates);
    }
    return dates;
  },

  getRecentDailyStats(days = 7) {
    return getDailyStats(this.getRecords(), days);
  },

  getIgniteCount() {
    const raw = getItem('SMOKEFREE_IGNITE_COUNT');
    if (raw !== null && raw !== undefined && raw !== '') {
      return Math.max(0, Number(raw) || 0);
    }
    const initial = this.getRecords().length;
    setItem('SMOKEFREE_IGNITE_COUNT', initial);
    return initial;
  },

  incrementIgniteCount() {
    const cur = this.getIgniteCount();
    setItem('SMOKEFREE_IGNITE_COUNT', cur + 1);
    return cur + 1;
  },

  // ==========================================
  // 替烟基金消费账本 (Spent Savings Ledger)
  // ==========================================
  getSpentSavings() {
    const raw = getItem(SPENT_SAVINGS_KEY);
    return Math.max(0, Number(raw) || 0);
  },

  addSpentSavings(amount) {
    const addVal = Math.max(0, Number(amount) || 0);
    const next = Number((this.getSpentSavings() + addVal).toFixed(2));
    setItem(SPENT_SAVINGS_KEY, next);
    return next;
  },

  // ==========================================
  // 尝鲜试抽 1 支临时凭证管理 (1-Stick Trial Pass)
  // ==========================================
  getTrialCigaretteInfo() {
    const raw = getItem(TRIAL_CIGARETTE_KEY);
    if (!raw) return null;
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return null;
    }
  },

  setTrialCigaretteInfo(info) {
    if (!info || !info.id) {
      removeItem(TRIAL_CIGARETTE_KEY);
      return null;
    }
    setItem(TRIAL_CIGARETTE_KEY, info);
    return info;
  },

  clearTrialCigaretteInfo() {
    removeItem(TRIAL_CIGARETTE_KEY);
  },

  // ==========================================
  // 单品烟盒看广告当日免费畅抽通行证 (Daily Cigarette Pass)
  // 过了午夜 12 点自动重置，静默生效，无需烦扰提示用户
  // ==========================================
  getDailyUnlockedCigarettes() {
    const raw = getItem('SMOKEFREE_DAILY_UNLOCKED_CIGARETTES');
    const todayKey = new Date().toISOString().slice(0, 10);
    if (!raw) return { dateKey: todayKey, ids: [] };
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!parsed || parsed.dateKey !== todayKey || !Array.isArray(parsed.ids)) {
        return { dateKey: todayKey, ids: [] };
      }
      return parsed;
    } catch {
      return { dateKey: todayKey, ids: [] };
    }
  },

  isCigaretteUnlockedToday(cigaretteId) {
    if (!cigaretteId) return false;
    const passes = this.getDailyUnlockedCigarettes();
    return Array.isArray(passes.ids) && passes.ids.includes(cigaretteId);
  },

  unlockCigaretteForToday(cigaretteId) {
    if (!cigaretteId) return [];
    const todayKey = new Date().toISOString().slice(0, 10);
    const passes = this.getDailyUnlockedCigarettes();
    const idSet = new Set(Array.isArray(passes.ids) ? passes.ids : []);
    idSet.add(cigaretteId);
    const updated = {
      dateKey: todayKey,
      ids: Array.from(idSet)
    };
    setItem('SMOKEFREE_DAILY_UNLOCKED_CIGARETTES', updated);
    return updated.ids;
  },

  // ==========================================
  // 运营后台赠送 / 永久解锁名烟 (Custom Unlocked Cigarettes)
  // ==========================================
  getCustomUnlockedCigarettes() {
    const raw = getItem('SMOKEFREE_CUSTOM_UNLOCKED_CIGARETTES');
    if (!raw) return [];
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
    } catch {
      return [];
    }
  },

  unlockCigarette(cigaretteId) {
    if (!cigaretteId) return [];
    const list = this.getCustomUnlockedCigarettes();
    if (!list.includes(cigaretteId)) {
      list.push(cigaretteId);
      setItem('SMOKEFREE_CUSTOM_UNLOCKED_CIGARETTES', list);
    }
    return list;
  },

  getSelectedCigaretteId() {
    return getItem(SELECTED_CIGARETTE_KEY) || DEFAULT_CIGARETTE_ID;
  },

  setSelectedCigaretteId(id) {
    setItem(SELECTED_CIGARETTE_KEY, id);
  },

  getUnlockedAchievements() {
    const raw = getItem(ACHIEVEMENTS_KEY);
    if (!raw) return [];
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return [];
    }
  },

  saveUnlockedAchievements(ids) {
    setItem(ACHIEVEMENTS_KEY, ids);
  },

  unlockAchievement(id) {
    const current = this.getUnlockedAchievements();
    if (!current.includes(id)) {
      current.push(id);
      this.saveUnlockedAchievements(current);
      // 自动佩戴检测：若新解锁成就拥有更高品阶权重，自动装备最高称号
      try {
        const ach = getAchievementById(id);
        if (ach) {
          const currentEquipped = this.getEquippedTitle();
          if (!currentEquipped || ach.weight > getTitleWeight(currentEquipped)) {
            this.setEquippedTitle(ach.name);
          }
        }
      } catch (err) {}
    }
  },

  getEquippedTitle() {
    const title = getItem(EQUIPPED_TITLE_KEY);
    return typeof title === 'string' ? title : '';
  },

  setEquippedTitle(title) {
    if (title) {
      setItem(EQUIPPED_TITLE_KEY, title);
    } else {
      removeItem(EQUIPPED_TITLE_KEY);
    }
  },

  // ==========================================
  // 烟盒库存余量与独立槽位状态管理 (Pack Inventory & Per-Slot States)
  // ==========================================
  getAllPackInventories() {
    const raw = getItem(PACK_INVENTORY_KEY);
    if (!raw) return {};
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return {};
    }
  },

  getAllPackSlots() {
    const raw = getItem(PACK_SLOTS_KEY);
    if (!raw) return {};
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return {};
    }
  },

  getPackCount(cigaretteId, defaultCapacity = 20) {
    const inv = this.getAllPackInventories();
    if (inv[cigaretteId] !== undefined) {
      return inv[cigaretteId];
    }
    // 默认初始整盒未拆前或已拆满盒
    return defaultCapacity;
  },

  setPackCount(cigaretteId, count) {
    const inv = this.getAllPackInventories();
    inv[cigaretteId] = Math.max(0, count);
    setItem(PACK_INVENTORY_KEY, inv);
    return inv[cigaretteId];
  },

  getPackSlots(cigaretteId, defaultCapacity = 20) {
    const cap = Math.max(1, Number(defaultCapacity) || 20);
    const allSlots = this.getAllPackSlots();
    const savedCount = Math.min(cap, Math.max(0, this.getPackCount(cigaretteId, cap)));

    if (Array.isArray(allSlots[cigaretteId]) && allSlots[cigaretteId].length === cap) {
      const slots = allSlots[cigaretteId].map(Boolean);
      let activeCount = slots.filter(Boolean).length;
      if (activeCount === savedCount) {
        return slots;
      }
      // 若外部通过 setPackCount 修改了余量，同步修正槽位数组并保留已有空槽位置
      if (activeCount > savedCount) {
        for (let i = cap - 1; i >= 0 && activeCount > savedCount; i--) {
          if (slots[i]) {
            slots[i] = false;
            activeCount--;
          }
        }
      } else if (activeCount < savedCount) {
        for (let i = 0; i < cap && activeCount < savedCount; i++) {
          if (!slots[i]) {
            slots[i] = true;
            activeCount++;
          }
        }
      }
      allSlots[cigaretteId] = slots;
      setItem(PACK_SLOTS_KEY, allSlots);
      return slots;
    }

    const initialSlots = [];
    for (let i = 0; i < cap; i++) {
      initialSlots.push(i < savedCount);
    }
    allSlots[cigaretteId] = initialSlots;
    setItem(PACK_SLOTS_KEY, allSlots);
    return initialSlots;
  },

  setPackSlots(cigaretteId, slots) {
    const allSlots = this.getAllPackSlots();
    const normalized = Array.isArray(slots) ? slots.map(Boolean) : [];
    allSlots[cigaretteId] = normalized;
    setItem(PACK_SLOTS_KEY, allSlots);
    const remaining = normalized.filter(Boolean).length;
    this.setPackCount(cigaretteId, remaining);
    return { slots: normalized, remaining };
  },

  consumePackSlot(cigaretteId, slotIndex = -1, defaultCapacity = 20) {
    const cap = Math.max(1, Number(defaultCapacity) || 20);
    const slots = [...this.getPackSlots(cigaretteId, cap)];
    let consumedIndex = -1;

    if (typeof slotIndex === 'number' && slotIndex >= 0 && slotIndex < cap && slots[slotIndex]) {
      slots[slotIndex] = false;
      consumedIndex = slotIndex;
    } else {
      // 未指定槽位或该槽已空时，优先从前排 (10..19) 或首个有烟槽位取出一支
      for (let i = cap - 1; i >= 0; i--) {
        if (slots[i]) {
          slots[i] = false;
          consumedIndex = i;
          break;
        }
      }
    }

    const { remaining } = this.setPackSlots(cigaretteId, slots);
    return {
      slots,
      remaining,
      consumedIndex
    };
  },

  resetPackCount(cigaretteId, capacity = 20) {
    const cap = Math.max(1, Number(capacity) || 20);
    const fullSlots = [];
    for (let i = 0; i < cap; i++) {
      fullSlots.push(true);
    }
    const allSlots = this.getAllPackSlots();
    allSlots[cigaretteId] = fullSlots;
    setItem(PACK_SLOTS_KEY, allSlots);
    return this.setPackCount(cigaretteId, cap);
  },

  // ==========================================
  // 全站香烟资产闭环：现实物理资产永续 + 晨间投递信箱（上限1包防通胀）
  // ==========================================
  getTodayDateKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  /** 校验本地时间单调递增，防止改手机时钟狂刷烟 */
  validateMonotonicTimestamp() {
    const now = Date.now();
    const lastTs = Number(getItem(LAST_MONOTONIC_TS_KEY)) || 0;
    if (now < lastTs - 60000) {
      // 时间异常回退超过 1 分钟，静默判定为异常
      return false;
    }
    setItem(LAST_MONOTONIC_TS_KEY, now);
    return true;
  },

  /** 获取未拆封整包库存数 */
  getUnopenedPacksCount() {
    const val = getItem(UNOPENED_PACKS_KEY);
    return typeof val === 'number' ? Math.max(0, val) : 1; // 首次默认赠送 1 包备用
  },

  setUnopenedPacksCount(count) {
    const normalized = Math.max(0, Math.floor(count));
    setItem(UNOPENED_PACKS_KEY, normalized);
    return normalized;
  },

  addUnopenedPack(increment = 1) {
    const current = this.getUnopenedPacksCount();
    return this.setUnopenedPacksCount(current + increment);
  },


  /** 当日吸食支数管理（单日 40 支硬顶） */
  getDailySmokedCount() {
    const today = this.getTodayDateKey();
    const record = getItem(DAILY_SMOKE_COUNT_KEY);
    if (!record || record.date !== today) {
      return 0;
    }
    return Number(record.count) || 0;
  },

  incrementDailySmokedCount() {
    return this.addDailySmokedCount(1);
  },

  addDailySmokedCount(delta = 1) {
    const today = this.getTodayDateKey();
    let record = getItem(DAILY_SMOKE_COUNT_KEY);
    if (!record || record.date !== today) {
      record = { date: today, count: 0 };
    }
    record.count = Math.max(0, (Number(record.count) || 0) + Number(delta));
    setItem(DAILY_SMOKE_COUNT_KEY, record);
    return record.count;
  },

  /** 烟灰缸烟蒂微距沉淀数据 */
  getAshtrayButts() {
    const raw = getItem(ASHTRAY_BUTTS_KEY);
    if (!raw) return [];
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
    } catch {
      return [];
    }
  },

  addAshtrayButt(buttData) {
    const butts = this.getAshtrayButts();
    // 现实生活真实写照：抽多少就沉淀多少，忠实记录用户一整天的真实替烟足迹
    // 采用软上限 100 支（整整 5 整包容量），日常抽吸无论抽多少支均 100% 实打实沉淀在缸内
    const SOFT_MAX_BUTTS = 100;
    if (butts.length >= SOFT_MAX_BUTTS) {
      butts.shift();
    }
    butts.push({
      id: Date.now(),
      timestamp: Date.now(),
      angle: (Math.random() * 360).toFixed(1),
      tarLevel: (Math.random() * 0.4 + 0.6).toFixed(2), // 焦油着色深度
      ...buttData
    });
    setItem(ASHTRAY_BUTTS_KEY, butts);
    return butts;
  },

  clearAshtray() {
    setItem(ASHTRAY_BUTTS_KEY, []);
    setItem(ASHTRAY_ASH_KEY, { count: 0, level: 0, flakes: [] });
    return { butts: [], ash: { count: 0, level: 0, flakes: [] } };
  },

  /** 烟灰缸灰渣/炭灰微距沉淀数据 */
  getAshtrayAsh() {
    const raw = getItem(ASHTRAY_ASH_KEY);
    if (!raw) return { count: 0, level: 0, flakes: [] };
    try {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return {
        count: Number(data.count) || 0,
        level: Math.max(0, Number(data.level) || 0),
        flakes: Array.isArray(data.flakes) ? data.flakes : []
      };
    } catch {
      return { count: 0, level: 0, flakes: [] };
    }
  },

  addAshtrayAsh(ashAmount = 1) {
    const data = this.getAshtrayAsh();
    data.count += ashAmount;
    // 现实生活真实物理写照：有多少沉淀多少，无人工 100% 假上限
    data.level = (data.level || 0) + ashAmount * 12;

    // 生成自然散落的微距灰渣粒子 (支持大容量 60 处沉淀，真实覆盖整座烟缸)
    const newFlakes = [];
    const numFlakes = Math.floor(Math.random() * 2) + 2; // 2 ~ 3 处小灰片
    for (let i = 0; i < numFlakes; i++) {
      // 在半径 22rpx 的缸底自然随机散布 (铜托盘半径 36rpx，余量安全)
      const r = Math.random() * 22;
      const theta = Math.random() * 2 * Math.PI;
      const x = Math.round(36 + r * Math.cos(theta));
      const y = Math.round(36 + r * Math.sin(theta));
      const size = (Math.random() * 3.5 + 3).toFixed(1); // 3 ~ 6.5rpx
      const opacity = (Math.random() * 0.35 + 0.55).toFixed(2);
      const rot = Math.round(Math.random() * 360);
      const isCharcoal = Math.random() > 0.45;
      newFlakes.push({
        id: Date.now() + Math.random(),
        x,
        y,
        size,
        opacity,
        rot,
        color: isCharcoal ? '#262626' : '#71717a'
      });
    }

    const mergedFlakes = [...data.flakes, ...newFlakes];
    const SOFT_MAX_FLAKES = 100; // 真实铺满整缸散碎余灰，同时确保微信小程序渲染帧率平滑
    if (mergedFlakes.length > SOFT_MAX_FLAKES) {
      mergedFlakes.splice(0, mergedFlakes.length - SOFT_MAX_FLAKES);
    }
    data.flakes = mergedFlakes;
    setItem(ASHTRAY_ASH_KEY, data);
    return data;
  },

  /** 
   * 每日 00:00 跨天物理资产法则：
   * 1. 绝对不抹平、不重置现有烟盒剩余支数（昨天剩 8 支，今天依然是 8 支，自律资产永久保留）；
   * 2. 每日清晨在信箱投递 1 包新烟（若未登录不累积，上限 1 包防膨胀）；
   * 3. 统计跨天数据，重置单日吸食硬顶与拆盒限次。
   */
  checkDailyRefresh(currentCigaretteId, defaultCapacity = 20) {
    if (!this.validateMonotonicTimestamp()) {
      return { refreshed: false, reason: 'invalid_clock' };
    }

    const today = this.getTodayDateKey();
    const lastDate = getItem(LAST_DAILY_REFRESH_DATE_KEY);

    if (lastDate !== today) {
      setItem(LAST_DAILY_REFRESH_DATE_KEY, today);
      setItem(DAILY_SMOKE_COUNT_KEY, { date: today, count: 0 });

      // 现实生活晨间闭环：新的一天开始，烟灰缸晨间自动清洗一空，迎接全新一天的清爽自律
      this.clearAshtray();

      // 自律日历点亮心灯，静默完成每日签到记录
      this.recordDailyCheckIn(new Date());

      // 注意：这里绝对不再调用 this.resetPackCount 强制把烟盒装满！
      // 真实保留当前盒内剩余，让用户切身感受到自律资产的珍贵！

      return { 
        refreshed: true, 
        date: today,
        retainedSticks: this.getPackCount(currentCigaretteId || this.getSelectedCigaretteId(), defaultCapacity)
      };
    }

    return { refreshed: false, date: today };
  },

  /** 获取今日剩余免费拆盒次数（每日上限 2 次，VIP 终身无限） */
  getDailyFreeUnwrapQuota() {
    const today = this.getTodayDateKey();
    let data = getItem(DAILY_FREE_UNWRAP_KEY);
    if (!data || data.date !== today) {
      data = { date: today, usedCount: 0 };
      setItem(DAILY_FREE_UNWRAP_KEY, data);
    }
    const isVip = vipService.isVip();
    const used = Number(data.usedCount) || 0;
    const remaining = Math.max(0, MAX_DAILY_FREE_UNWRAPS - used);
    return {
      isVip,
      maxFree: MAX_DAILY_FREE_UNWRAPS,
      usedCount: used,
      remainingFree: remaining,
      canFreeUnwrap: isVip || (remaining > 0)
    };
  },

  /** 检查是否允许拆新盒 */
  canUnwrapNewPack(cigaretteId) {
    const quota = this.getDailyFreeUnwrapQuota();
    if (quota.isVip) {
      return { allowed: true, isVip: true, reason: 'vip_unlimited', remainingFree: 999 };
    }
    // 普通用户优先看库存是否有未拆整包
    const unopenedCount = this.getUnopenedPacksCount();
    if (unopenedCount > 0) {
      return { allowed: true, isVip: false, reason: 'inventory_pack', remainingPacks: unopenedCount };
    }
    if (quota.remainingFree > 0) {
      return { allowed: true, isVip: false, reason: 'free_quota', remainingFree: quota.remainingFree };
    }
    return { allowed: false, isVip: false, reason: 'quota_exhausted', remainingFree: 0 };
  },

  /** 执行拆封全新一盒（优先消耗未拆库存整包，并满载槽位） */
  executeUnwrapNewPack(cigaretteId, capacity = 20) {
    const check = this.canUnwrapNewPack(cigaretteId);
    if (!check.allowed) {
      return { success: false, ...check };
    }

    if (!check.isVip) {
      const unopened = this.getUnopenedPacksCount();
      if (unopened > 0) {
        // 优先消耗抽屉里的未拆库存整包
        this.setUnopenedPacksCount(unopened - 1);
      } else {
        const today = this.getTodayDateKey();
        let data = getItem(DAILY_FREE_UNWRAP_KEY);
        if (!data || data.date !== today) {
          data = { date: today, usedCount: 0 };
        }
        data.usedCount = (Number(data.usedCount) || 0) + 1;
        setItem(DAILY_FREE_UNWRAP_KEY, data);
      }
    }

    // 真正执行满载复位
    const count = this.resetPackCount(cigaretteId, capacity);
    const slots = this.getPackSlots(cigaretteId, capacity);
    const latestQuota = this.getDailyFreeUnwrapQuota();

    return {
      success: true,
      count,
      slots,
      isVip: check.isVip,
      remainingUnopenedPacks: this.getUnopenedPacksCount(),
      remainingFree: latestQuota.remainingFree
    };
  },

  isHomeStickDigested() {
    return !!getItem(HOME_STICK_DIGESTED_KEY);
  },

  setHomeStickDigested(digested) {
    if (digested) {
      setItem(HOME_STICK_DIGESTED_KEY, true);
    } else {
      removeItem(HOME_STICK_DIGESTED_KEY);
    }
  },

  // ==========================================
  // 生活沉浸场景与环境音偏好
  // ==========================================
  getAtmosphereScene() {
    return getItem('SMOKEFREE_ATMOSPHERE_SCENE') || 'obsidian';
  },

  setAtmosphereScene(sceneId) {
    setItem('SMOKEFREE_ATMOSPHERE_SCENE', sceneId);
  },

  getAmbientSoundEnabled() {
    const val = getItem('SMOKEFREE_AMBIENT_SOUND_ENABLED');
    return val === null ? true : !!val;
  },

  setAmbientSoundEnabled(enabled) {
    setItem('SMOKEFREE_AMBIENT_SOUND_ENABLED', enabled);
  },

  // ==========================================
  // 点火器具工坊偏好
  // ==========================================
  getSelectedIgnitionTool() {
    return getItem('SMOKEFREE_IGNITION_TOOL') || 'flint_lighter';
  },

  setSelectedIgnitionTool(toolId) {
    setItem('SMOKEFREE_IGNITION_TOOL', toolId);
  },

  // ==========================================
  // 烟雾特效工坊偏好与解锁 (Smoke Effects)
  // ==========================================
  getSelectedSmokeEffectId() {
    const id = getItem('SMOKEFREE_SELECTED_SMOKE_EFFECT');
    if (!id || id === 'cloud_dense' || id === 'silk_pure' || id === 'purple_zen' || id === 'aurora_nebula' || id === 'lotus_zen') return 'auspicious_river';
    return id;
  },

  setSelectedSmokeEffectId(effectId) {
    setItem('SMOKEFREE_SELECTED_SMOKE_EFFECT', effectId);
    if (effectId && effectId !== 'ring_classic') {
      this.recordSmokeEffectSummoned(effectId);
    }
  },

  getSummonedSmokeEffects() {
    const raw = getItem(SUMMONED_EFFECTS_KEY);
    if (!raw) return [];
    try {
      return typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
    } catch {
      return [];
    }
  },

  recordSmokeEffectSummoned(effectId) {
    if (!effectId) return [];
    const list = this.getSummonedSmokeEffects();
    if (Array.isArray(list) && !list.includes(effectId)) {
      list.push(effectId);
      setItem(SUMMONED_EFFECTS_KEY, list);
    }
    return list;
  },

  getUnlockedSmokeEffects() {
    const raw = getItem('SMOKEFREE_UNLOCKED_SMOKE_EFFECTS');
    const defaultList = ['ring_classic', 'auspicious_river'];
    if (!raw) return defaultList;
    try {
      let list = defaultList;
      if (typeof raw === 'string') {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      } else if (Array.isArray(raw)) {
        list = raw;
      }
      return list.filter(id => id !== 'cloud_dense' && id !== 'silk_pure' && id !== 'lotus_zen');
    } catch {
      return defaultList;
    }
  },

  unlockSmokeEffect(effectId) {
    const list = this.getUnlockedSmokeEffects();
    if (Array.isArray(list) && !list.includes(effectId)) {
      list.push(effectId);
      setItem('SMOKEFREE_UNLOCKED_SMOKE_EFFECTS', list);
    }
    this.recordSmokeEffectSummoned(effectId);
    return list;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    storageService,
    getDailyStats,
    default: storageService
  };
}
