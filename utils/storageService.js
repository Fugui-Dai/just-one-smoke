// utils/storageService.js
import { DEFAULT_USER_AVATAR_SVG } from './vectorIcons.js';
import { getRandomNickname } from './nicknamePool.js';
import { getRandomAvatarSvg } from './avatarGenerator.js';

const PROFILE_KEY = 'SMOKEFREE_PROFILE';
const RECORDS_KEY = 'SMOKEFREE_RECORDS';
const SELECTED_CIGARETTE_KEY = 'SMOKEFREE_SELECTED_CIGARETTE';
const ACHIEVEMENTS_KEY = 'SMOKEFREE_UNLOCKED_ACHIEVEMENTS';
const PACK_INVENTORY_KEY = 'SMOKEFREE_PACK_INVENTORY';
const PACK_SLOTS_KEY = 'SMOKEFREE_PACK_SLOTS';
const HOME_STICK_DIGESTED_KEY = 'SMOKEFREE_HOME_STICK_DIGESTED';
const CHECKIN_DATES_KEY = 'SMOKEFREE_CHECKIN_DATES';
const DEFAULT_CIGARETTE_ID = 'chaotianmen_gold';

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

export function getDailyStats(records, days = 7, refDate = new Date()) {
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

export function getDailyCumulativeStats(records, days = 7, refDate = new Date()) {
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

  const startDay = new Date(curY, curM, curD - (days - 1));
  startDay.setHours(0, 0, 0, 0);

  let runningCumulative = Array.isArray(records)
    ? records.filter(r => r && r.timestamp && Number(r.timestamp) < startDay.getTime()).length
    : 0;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(curY, curM, curD - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const label = i === 0 ? '今天' : `${month}/${day}`;
    const dayCount = map[key] || 0;
    runningCumulative += dayCount;

    result.push({
      dateKey: key,
      label,
      count: dayCount,
      cumulative: runningCumulative
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

  addRecord(record) {
    const records = this.getRecords();
    records.push(record);
    setItem(RECORDS_KEY, records);
  },

  clearRecords() {
    removeItem(RECORDS_KEY);
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

  getRecentDailyCumulativeStats(days = 7) {
    return getDailyCumulativeStats(this.getRecords(), days);
  },

  getIgniteCount() {
    const raw = getItem('SMOKEFREE_IGNITE_COUNT');
    if (raw !== null && raw !== undefined) {
      return Number(raw) || 0;
    }
    const len = this.getRecords().length;
    return len > 0 ? len * 2 : 0;
  },

  incrementIgniteCount() {
    const cur = this.getIgniteCount();
    setItem('SMOKEFREE_IGNITE_COUNT', cur + 1);
    return cur + 1;
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

  decrementPackCount(cigaretteId, defaultCapacity = 20) {
    const res = this.consumePackSlot(cigaretteId, -1, defaultCapacity);
    return res.remaining;
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
    if (!id || id === 'cloud_dense' || id === 'silk_pure') return 'auspicious_river';
    return id;
  },

  setSelectedSmokeEffectId(effectId) {
    setItem('SMOKEFREE_SELECTED_SMOKE_EFFECT', effectId);
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
      return list.filter(id => id !== 'cloud_dense' && id !== 'silk_pure');
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
    return list;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    storageService,
    getDailyStats,
    getDailyCumulativeStats,
    default: storageService
  };
}
