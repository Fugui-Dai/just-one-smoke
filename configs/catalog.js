// configs/catalog.js
import { vipService } from '../services/vipService.js';
import { storageService } from '../services/storageService.js';

export const CIGARETTE_CATALOG = [
  // ==================== 价格从低到高梯度排序 (0元 ~ 680元) ====================

  // 1. [¥0] 纯净自然·终极空气卷 (无烟境界)
  {
    id: 'pure_oxygen_zen',
    isAirCig: true,
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm纯净嘴',
    slogan: '告别焦油毒素，拥抱大自然纯净呼吸',
    name: '纯净自然·终极空气卷',
    brand: 'Zen 无烟境界',
    stampText: '纯净自然',
    filterBrandText: 'ZEN无烟境界',
    description: '告别一切焦油与尼古丁，拥抱大自然最纯净清冽的呼吸空气',
    filterColor: '#38bdf8',
    paperColor: '#ffffff',
    bandColor: '#34d399',
    smokeColor: 'rgba(224, 242, 254, ',
    widthType: 'standard',
    price: 0,
    packImage: '/images/packs/pure_zen.png',
    requiredCount: 60,
    unlockDesc: '累计替烟 60 支解锁',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #0284c7 0%, #0ea5e9 40%, #10b981 100%)',
      lidGradient: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
      foilColor: '#67e8f9',
      logoText: 'ZEN',
      subText: 'PURE OXYGEN · 无烟之境',
      accentColor: '#ffffff',
      sealText: '100% 纯净氧舱',
      warningText: '终极无焦油新生 · 拥抱自然肺呼吸',
      tar: '0mg',
      nicotine: '0mg',
      co: '0mg',
      patternType: 'pure_zen',
      sealColor: '#10b981'
    }
  },

  // 2. [¥2] 老辈·白纸手卷旱烟 (岁月记忆)
  {
    id: 'hand_rolled_hanyan',
    lengthMm: 62,
    filterMm: 14,
    diameterMm: 5.5,
    specDesc: '62mm 经典短款手卷 · 一体式白纸喇叭筒 · 黄金原叶烟丝',
    topDiameterMm: 12.0,
    slogan: '一捧黄烟丝，一张白纸卷，岁月生香',
    name: '老辈·白纸手卷旱烟',
    brand: '老辈手卷 (Hand-Rolled)',
    description: '90年代老一辈亲手用薄白纸紧紧搓卷的黄碎烟丝，短款经典通体一体式大锥度白纸喇叭筒，无独立过滤嘴，满载岁月记忆',
    filterColor: '#faf8f2', // 纯白纸卷端，无海绵滤嘴
    paperColor: '#faf8f2',  // 天然透光薄白纸
    bandColor: 'transparent',   // 无现代工业金圈
    stampText: '老辈旱烟',
    filterBrandText: '',
    smokeColor: 'rgba(235, 230, 220, ',
    widthType: 'hand_rolled',
    price: 2,
    packImage: '/images/packs/hand_rolled_hanyan.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 岁月手卷',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #f5f0e6 0%, #ebe2d3 55%, #dfd3bf 100%)',
      lidGradient: 'linear-gradient(180deg, #ebe2d3 0%, #dfd3bf 100%)',
      foilColor: '#c4b59f',
      logoText: '老辈旱烟',
      subText: '白纸手卷 · 传统喇叭筒',
      accentColor: '#8c531b',
      sealText: '纯手工原叶',
      warningText: '一捧黄烟丝 · 一张薄白纸 · 慢吸一段往昔光阴',
      tar: '纯原叶',
      nicotine: '天然本草',
      co: '草本烟香',
      patternType: 'hand_rolled',
      sealColor: '#b91c1c'
    }
  },

  // 3. [¥10] 白沙·软白经典
  {
    id: 'baisha_white',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm白沙嘴',
    slogan: '鹤舞白沙，我心飞翔',
    name: '白沙·软白经典',
    brand: '白沙 (Baisha)',
    description: '“鹤舞白沙，我心飞翔”，国民老牌大众口粮，双鹤展翅，烟气清香甘润纯正',
    filterColor: '#d99b26',
    paperColor: '#fffdf5',
    bandColor: '#2563eb',
    stampText: '白沙',
    filterBrandText: 'BAISHA',
    smokeColor: 'rgba(220, 226, 235, ',
    widthType: 'standard',
    price: 10,
    packImage: '/images/packs/baisha.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 飞翔白沙',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 55%, #e2e8f0 100%)',
      lidGradient: 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)',
      foilColor: '#e2e8f0',
      logoText: '白沙',
      subText: 'BAISHA · 软白',
      accentColor: '#2563eb',
      sealText: '双鹤吉祥',
      warningText: '我心飞翔 愿您呼吸如鹤轻盈',
      tar: '11mg',
      nicotine: '1.0mg',
      co: '12mg',
      patternType: 'crane_pair',
      sealColor: '#2563eb'
    }
  },

  // 4. [¥11] 红塔山·经典1956
  {
    id: 'hongtashan_100',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm经典黄嘴',
    slogan: '山高人为峰，红塔见英雄',
    name: '红塔山·经典1956',
    brand: '红塔山 (Hongtashan)',
    description: '“山高人为峰”，玉溪红塔山一代国民传奇记忆，原汁原味自然醇化烤烟香',
    filterColor: '#ca8a04',
    paperColor: '#fffdf5',
    bandColor: '#dc2626',
    stampText: '紅塔山',
    filterBrandText: 'HONGTASHAN',
    smokeColor: 'rgba(228, 226, 220, ',
    widthType: 'standard',
    price: 11,
    packImage: '/images/packs/hongtashan.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 红塔经典',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
      lidGradient: 'linear-gradient(180deg, #fffdf5 0%, #f8fafc 100%)',
      foilColor: '#dc2626',
      logoText: '红塔山',
      subText: 'HONGTASHAN · 1956',
      accentColor: '#dc2626',
      sealText: '经典传奇',
      warningText: '山高人为峰 愿您重回健康巅峰',
      tar: '11mg',
      nicotine: '1.0mg',
      co: '11mg',
      patternType: 'tower_badge',
      sealColor: '#dc2626'
    }
  },

  // 5. [¥11] 红双喜·经典软红
  {
    id: 'shuangxi_classic',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm金黄嘴',
    slogan: '好事成双，红双喜临门',
    name: '红双喜·经典软红',
    brand: '红双喜 (Shuangxi)',
    description: '百年喜庆经典，醇正老广浓郁香气，红金吉庆包装，带来好运双喜',
    filterColor: '#eab308',
    paperColor: '#fffdf5',
    bandColor: '#b91c1c',
    stampText: '雙喜',
    filterBrandText: 'SHUANGXI',
    smokeColor: 'rgba(235, 225, 215, ',
    widthType: 'standard',
    price: 11,
    packImage: '/images/packs/shuangxi.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 百年双喜',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #be123c 0%, #9f1239 100%)',
      lidGradient: 'linear-gradient(180deg, #e11d48 0%, #be123c 100%)',
      foilColor: '#fbbf24',
      logoText: '紅雙喜',
      subText: 'SHUANGXI · 百年好合',
      accentColor: '#fbbf24',
      sealText: '百年囍庆',
      warningText: '吉祥红双喜 功德无量愿您安康',
      tar: '11mg',
      nicotine: '1.0mg',
      co: '12mg',
      patternType: 'double_happiness',
      sealColor: '#fbbf24'
    }
  },

  // 6. [¥12] 中南海·经典8mg
  {
    id: 'zhongnanhai_8mg',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm纯白滤嘴',
    slogan: '科技混合型低焦，清爽纯净回甘',
    name: '中南海·经典8mg',
    brand: '中南海 (Zhongnanhai)',
    description: '国内混合型低焦开创者，纯白盒身配简约蓝红速度线，纳米复合过滤，口感极为清纯',
    filterColor: '#f8fafc',
    paperColor: '#ffffff',
    bandColor: '#2563eb',
    stampText: '8mg',
    filterBrandText: 'LIGHTS',
    smokeColor: 'rgba(230, 235, 245, ',
    widthType: 'standard',
    price: 12,
    packImage: '/images/packs/zhongnanhai.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 低焦先驱',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
      lidGradient: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      foilColor: '#38bdf8',
      logoText: '中南海',
      subText: 'ZHONGNANHAI · 8mg',
      accentColor: '#2563eb',
      sealText: '低焦纯爽',
      warningText: '混合清甜 轻盈微风护佑呼吸',
      tar: '8mg',
      nicotine: '0.8mg',
      co: '10mg',
      patternType: 'minimal_white',
      sealColor: '#2563eb'
    }
  },

  // 7. [¥12] 南京·特醇红南京
  {
    id: 'nanjing_red',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm红南京金嘴',
    slogan: '江南佳丽地，金陵帝王州',
    name: '南京·特醇经典 (红南京)',
    brand: '南京 (Nanjing)',
    description: '“红南京”，老南京烟民不灭的情怀，辟邪神兽金标，沉稳醇厚的经典本香',
    filterColor: '#d97706',
    paperColor: '#fffdf5',
    bandColor: '#881337',
    stampText: '南京',
    filterBrandText: 'NANJING',
    smokeColor: 'rgba(235, 225, 220, ',
    widthType: 'standard',
    price: 12,
    packImage: '/images/packs/hong_nanjing.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 经典红南京',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #881337 0%, #701a28 100%)',
      lidGradient: 'linear-gradient(180deg, #9f1239 0%, #881337 100%)',
      foilColor: '#fbbf24',
      logoText: '南 京',
      subText: 'NANJING · 特醇经典',
      accentColor: '#fbbf24',
      sealText: '辟邪金标',
      warningText: '金陵古韵 伴君戒瘾常乐',
      tar: '11mg',
      nicotine: '1.1mg',
      co: '11mg',
      patternType: 'nanjing_bixie',
      sealColor: '#fbbf24'
    }
  },

  // 8. [¥15] 朝天门·金樽经典
  {
    id: 'chaotianmen_gold',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm金樽嘴',
    slogan: '巴渝两江汇，金樽朝天门',
    name: '朝天门·金樽经典',
    brand: '朝天门 (Chaotianmen)',
    description: '巴渝经典之作，两江环抱朝天门，浓郁山城烤烟香，回甘悠长甘甜',
    filterColor: '#d97706',
    paperColor: '#fffdf5',
    bandColor: '#b45309',
    stampText: '朝天門',
    filterBrandText: 'GOLDEN',
    smokeColor: 'rgba(235, 228, 218, ',
    widthType: 'standard',
    price: 15,
    packImage: '/images/packs/chaotianmen.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 实机同款',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #d97706 0%, #92400e 100%)',
      lidGradient: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
      foilColor: '#fef08a',
      logoText: '朝天門',
      subText: 'CHAOTIANMEN · 金樽',
      accentColor: '#fef08a',
      sealText: '两江灵韵',
      warningText: '江水东逝 放下香烟拥抱朝阳',
      tar: '10mg',
      nicotine: '1.0mg',
      co: '11mg',
      patternType: 'chaotianmen_crest',
      sealColor: '#fef08a'
    }
  },

  // 9. [¥15] 南洋兄弟·红双喜 (港版经典)
  {
    id: 'nanyang_shuangxi',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm港版金嘴',
    slogan: '南洋百年匠心，香港经典铁罐韵味',
    name: '南洋兄弟·红双喜 (港版)',
    brand: '南洋兄弟 (Nanyang)',
    description: '传承香港南洋兄弟烟草百年制烟工艺，经典复古暗红铁盒风范，烟气醇和悠长，老港风情浓郁',
    filterColor: '#ca8a04',
    paperColor: '#fffdf5',
    bandColor: '#881337',
    stampText: '南洋',
    filterBrandText: 'NANYANG',
    smokeColor: 'rgba(230, 225, 215, ',
    widthType: 'standard',
    price: 15,
    packImage: '/images/packs/nanyang_shuangxi.png',
    requiredCount: 1,
    unlockDesc: '累计替烟 1 支解锁 · 港式经典',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #881337 0%, #4c0519 100%)',
      lidGradient: 'linear-gradient(180deg, #9f1239 0%, #881337 100%)',
      foilColor: '#fbbf24',
      logoText: '南洋雙喜',
      subText: 'HONG KONG · 百年南洋',
      accentColor: '#fbbf24',
      sealText: '港版典藏',
      warningText: '香港南洋百年工藝 · 經典港式烤香',
      tar: '11mg',
      nicotine: '1.1mg',
      co: '12mg',
      patternType: 'nanyang_crest',
      sealColor: '#fbbf24'
    }
  },

  // 10. [¥16] 利群·新版经典
  {
    id: 'liqun_classic',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm利群琥珀嘴',
    slogan: '永远的利群，永远的醇香',
    name: '利群·新版经典',
    brand: '利群 (Liqun)',
    description: '“利群”，当代年轻人口粮硬通货，经典红灰三段色块，口感纯正浓郁，劲头充沛',
    filterColor: '#b45309',
    paperColor: '#fffdf5',
    bandColor: '#b91c1c',
    stampText: '利群',
    filterBrandText: 'LIQUN',
    smokeColor: 'rgba(225, 228, 235, ',
    widthType: 'standard',
    price: 16,
    packImage: '/images/packs/liqun.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 国民口粮',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #b91c1c 0%, #991b1b 36%, #94a3b8 36.5%, #cbd5e1 100%)',
      lidGradient: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)',
      foilColor: '#e2e8f0',
      logoText: '利 群',
      subText: 'LIQUN · 新版经典',
      accentColor: '#fbbf24',
      sealText: '红灰三段',
      warningText: '浙江经典 愿您胸怀开阔怡然自得',
      tar: '11mg',
      nicotine: '1.0mg',
      co: '11mg',
      patternType: 'liqun_tricolor',
      sealColor: '#fbbf24'
    }
  },

  // 11. [¥18] 南京·炫赫门
  {
    id: 'xuanhemen_slender',
    lengthMm: 97,
    filterMm: 30,
    diameterMm: 5.4,
    specDesc: '97mm 优雅细支 · 30mm甜润长滤嘴',
    slogan: '抽烟只抽炫赫门，一生只爱一个人',
    name: '南京·炫赫门',
    brand: '南京 (Nanjing)',
    description: '“抽烟只抽炫赫门”，当代年轻群体细支断层顶流，青黛幽蓝龙纹，微甜滤嘴甘润爽滑',
    filterColor: '#0f766e',
    paperColor: '#ffffff',
    bandColor: '#f59e0b',
    stampText: '炫赫門',
    filterBrandText: 'XUANHEMEN',
    smokeColor: 'rgba(215, 240, 245, ',
    widthType: 'slender',
    hasBead: true,
    beadName: '金陵朱砂甜润爆珠',
    beadColor: '#f43f5e',
    price: 18,
    packImage: '/images/packs/xuanhemen.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 细支传奇',
    packCapacity: 20,
    packType: 'slender',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #0f766e 0%, #0c4a6e 100%)',
      lidGradient: 'linear-gradient(180deg, #14b8a6 0%, #0f766e 100%)',
      foilColor: '#fef08a',
      logoText: '炫赫門',
      subText: 'NANJING · 细支传奇',
      accentColor: '#38bdf8',
      sealText: '甜润细支',
      warningText: '一生所爱 愿您的肺部如沐春风',
      tar: '8mg',
      nicotine: '0.8mg',
      co: '7mg',
      patternType: 'dragon',
      sealColor: '#f59e0b'
    }
  },

  // 12. [¥19] 黄鹤楼·软蓝经典
  {
    id: 'huanghelou_ruanlan',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm深蓝雅嘴',
    slogan: '昔人已乘黄鹤去，此地空余黄鹤楼',
    name: '黄鹤楼·软蓝经典',
    brand: '黄鹤楼 (Huanghelou)',
    description: '软蓝黄鹤楼，华中烤烟典范，经典雅香型，烟丝金黄油润，抽吸柔和细腻不呛喉',
    filterColor: '#1e3a8a',
    paperColor: '#fffdf5',
    bandColor: '#fbbf24',
    stampText: '黄鹤楼',
    filterBrandText: 'HHL',
    smokeColor: 'rgba(224, 231, 255, ',
    widthType: 'standard',
    price: 19,
    packImage: '/images/packs/ruanlan.png',
    requiredCount: 1,
    unlockDesc: '累计替烟 1 支解锁',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)',
      lidGradient: 'linear-gradient(180deg, #2563eb 0%, #1e3a8a 100%)',
      foilColor: '#fbbf24',
      logoText: '黄鹤楼',
      subText: 'HUANGHELOU · 软蓝',
      accentColor: '#fbbf24',
      sealText: '南楼古韵',
      warningText: '仙鹤乘风 愿您呼吸如云海般开阔',
      tar: '11mg',
      nicotine: '1.0mg',
      co: '11mg',
      patternType: 'yellow_crane',
      sealColor: '#fbbf24'
    }
  },

  // 13. [¥23] 玉溪·经典软玉溪
  {
    id: 'yuxi_soft',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm清香金嘴',
    slogan: '上善若水，德行天下',
    name: '玉溪·经典软玉溪',
    brand: '玉溪 (Yuxi)',
    description: '“上善若水”，云产烟之王，清香纯正饱满，回甜舒适生津，几十年不变的高口碑品质',
    filterColor: '#e11d48',
    paperColor: '#fffdf5',
    bandColor: '#fbbf24',
    stampText: '玉溪',
    filterBrandText: 'YUXI',
    smokeColor: 'rgba(235, 226, 220, ',
    widthType: 'standard',
    price: 23,
    packImage: '/images/packs/yuxi_soft.png',
    requiredCount: 1,
    unlockDesc: '累计替烟 1 支解锁',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%)',
      lidGradient: 'linear-gradient(180deg, #ffe4e6 0%, #fecdd3 100%)',
      foilColor: '#fbbf24',
      logoText: '玉 溪',
      subText: 'YUXI · 软包经典',
      accentColor: '#e11d48',
      sealText: '云烟之乡',
      warningText: '上善若水 净心自愈生生不息',
      tar: '11mg',
      nicotine: '1.0mg',
      co: '11mg',
      patternType: 'yuxi_pattern',
      sealColor: '#e11d48'
    }
  },

  // 14. [¥23] 贵烟·跨越
  {
    id: 'guiyan_kuayue',
    lengthMm: 100,
    filterMm: 32,
    diameterMm: 5.4,
    specDesc: '100mm 纤长细支 · 32mm陈皮爆珠长嘴',
    slogan: '一缕陈皮香，跨越黑夜与黎明',
    name: '贵烟·跨越',
    brand: '贵烟 (Guiyan)',
    description: '当代年轻人果香爆珠新宠，纯黑星空格调，捏破自然柑橘陈皮爆珠，清爽温润化痰润喉',
    filterColor: '#18181b',
    paperColor: '#ffffff',
    bandColor: '#f59e0b',
    stampText: '跨越',
    filterBrandText: 'GUIYAN',
    smokeColor: 'rgba(254, 240, 138, ',
    widthType: 'slender',
    hasBead: true,
    beadName: '十年新会陈皮爆珠',
    beadColor: '#f97316',
    price: 23,
    packImage: '/images/packs/guiyan.png',
    requiredCount: 2,
    unlockDesc: '累计替烟 2 支解锁',
    packCapacity: 20,
    packType: 'slender',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #09090b 0%, #18181b 100%)',
      lidGradient: 'linear-gradient(180deg, #18181b 0%, #27272a 100%)',
      foilColor: '#f59e0b',
      logoText: '貴 煙',
      subText: 'GUIYAN · 跨越细支',
      accentColor: '#f59e0b',
      sealText: '贵烟跨越',
      warningText: '柑香润肺 愿您跨越烟瘾拥抱健康',
      tar: '7mg',
      nicotine: '0.7mg',
      co: '5mg',
      patternType: 'orange_dots',
      sealColor: '#f59e0b'
    }
  },

  // 15. [¥25] 芙蓉王·硬黄经典
  {
    id: 'furongwang_gold',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm王牌金嘴',
    slogan: '华夏名烟，王道之选',
    name: '芙蓉王·硬黄经典',
    brand: '芙蓉王 (Furongwang)',
    description: '“华夏名烟，王者风范”，商务与老牌烟民硬通货，金砂纸张与宝蓝盾牌王冠，劲道醇厚回味绵长',
    filterColor: '#ca8a04',
    paperColor: '#fffdf5',
    bandColor: '#1e3a8a',
    stampText: '芙蓉王',
    filterBrandText: 'ROYAL',
    smokeColor: 'rgba(228, 226, 215, ',
    widthType: 'standard',
    price: 25,
    packImage: '/images/packs/furongwang.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 国民硬通货',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
      lidGradient: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
      foilColor: '#fbbf24',
      logoText: '芙蓉王',
      subText: 'FURONGWANG · 硬黄',
      accentColor: '#1e3a8a',
      sealText: '王者风范',
      warningText: '王道自律 戒除烟草彰显真英雄气概',
      tar: '11mg',
      nicotine: '1.2mg',
      co: '11mg',
      patternType: 'crown_badge',
      sealColor: '#1e3a8a'
    }
  },

  // 16. [¥26] 芙蓉王·硬细支
  {
    id: 'furongwang_slender',
    lengthMm: 97,
    filterMm: 30,
    diameterMm: 5.4,
    specDesc: '97mm 优雅细支 · 30mm金线长滤嘴',
    slogan: '王者风范，纤细生香',
    name: '芙蓉王·硬细支',
    brand: '芙蓉王 (Furongwang)',
    description: '芙蓉王王道气质与现代纤细优雅的融合，香槟金挺拔盒身，纯正香气丝滑细腻',
    filterColor: '#d97706',
    paperColor: '#ffffff',
    bandColor: '#1e3a8a',
    stampText: '芙蓉王',
    filterBrandText: 'ROYAL',
    smokeColor: 'rgba(230, 235, 245, ',
    widthType: 'slender',
    hasBead: true,
    beadName: '皇家蓝晶本香爆珠',
    beadColor: '#38bdf8',
    price: 26,
    packImage: '/images/packs/furongwang_slender.png',
    requiredCount: 2,
    unlockDesc: '累计替烟 2 支解锁',
    packCapacity: 20,
    packType: 'slender',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #fef08a 0%, #ca8a04 100%)',
      lidGradient: 'linear-gradient(180deg, #fef9c3 0%, #fef08a 100%)',
      foilColor: '#fef08a',
      logoText: '芙蓉王',
      subText: 'FURONGWANG · 细支',
      accentColor: '#1e3a8a',
      sealText: '纤细王者',
      warningText: '王者自省 戒除烟瘾更显沉稳坚毅',
      tar: '8mg',
      nicotine: '0.8mg',
      co: '7mg',
      patternType: 'crown_badge',
      sealColor: '#1e3a8a'
    }
  },

  // 17. [¥26] 利群·江南韵 (爆珠)
  {
    id: 'liqun_jiangnan',
    lengthMm: 97,
    filterMm: 30,
    diameterMm: 5.4,
    specDesc: '97mm 优雅细支 · 30mm桂花茶香长嘴',
    slogan: '烟雨江南，龙井茶香一缕清',
    name: '利群·江南韵 (茶香爆)',
    brand: '利群 (Liqun)',
    description: '年轻人极爱的高颜值水墨风雅之作，黑白青砖意境，捏破西湖龙井茶香爆珠，茶香与本香妙境交融',
    filterColor: '#18181b',
    paperColor: '#ffffff',
    bandColor: '#10b981',
    stampText: '江南韵',
    filterBrandText: 'TEA',
    smokeColor: 'rgba(209, 250, 229, ',
    widthType: 'slender',
    hasBead: true,
    beadName: '西湖龙井茶香爆珠',
    beadColor: '#10b981',
    price: 26,
    packImage: '/images/packs/jiangnan.png',
    requiredCount: 3,
    unlockDesc: '累计替烟 3 支解锁',
    packCapacity: 20,
    packType: 'slender',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #18181b 0%, #27272a 45%, #f4f4f5 45.5%, #ffffff 100%)',
      lidGradient: 'linear-gradient(180deg, #27272a 0%, #18181b 100%)',
      foilColor: '#10b981',
      logoText: '江南韻',
      subText: 'LIQUN · 龙井茶爆',
      accentColor: '#10b981',
      sealText: '茶韵入烟',
      warningText: '淡茶怡情 清心解瘾伴君行',
      tar: '8mg',
      nicotine: '0.8mg',
      co: '6mg',
      patternType: 'ink_lotus',
      sealColor: '#10b981'
    }
  },

  // 18. [¥28] 万宝路·深海冰蓝
  {
    id: 'marlboro_ice',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm极冰爆珠嘴',
    slogan: '极地深寒，双重极速冰川爆裂',
    name: '万宝路·深海冰蓝',
    brand: '万宝路 (Marlboro)',
    description: '年轻潮玩与夜店首选，碳黑磨砂配深海蓝 V 槽，双重强效薄荷晶球捏碎后如深海冰暴呼啸',
    filterColor: '#09090b',
    paperColor: '#ffffff',
    bandColor: '#06b6d4',
    stampText: 'ICE BLAST',
    filterBrandText: 'MARLBORO',
    smokeColor: 'rgba(207, 250, 254, ',
    widthType: 'standard',
    hasBead: true,
    beadName: '深海极地薄荷爆珠',
    beadColor: '#38bdf8',
    price: 28,
    packImage: '/images/packs/marlboro.png',
    requiredCount: 4,
    unlockDesc: '累计替烟 4 支解锁',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #09090b 0%, #0c4a6e 60%, #0891b2 100%)',
      lidGradient: 'linear-gradient(180deg, #09090b 0%, #164e63 100%)',
      foilColor: '#22d3ee',
      logoText: 'Marlboro',
      subText: 'ICE BLAST · 深海冰蓝',
      accentColor: '#06b6d4',
      sealText: '极寒冰爆',
      warningText: '极冰清爽 驱散心烦意乱回归澄澈',
      tar: '8mg',
      nicotine: '0.6mg',
      co: '9mg',
      patternType: 'ice_polygon',
      sealColor: '#06b6d4'
    }
  },

  // 19. [¥28] 七星·蓝莓双爆珠 (港免爆款)
  {
    id: 'mevius_blueberry',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm纯白蓝莓双爆嘴',
    slogan: '深邃极光蓝，果香晶球双爆裂',
    name: '七星·蓝莓双爆珠 (港免)',
    brand: '七星 (Mevius)',
    description: '港澳免税店超高人气爆款，深邃星光包装，纯白滤嘴内嵌深海薄荷与饱满蓝莓果香双晶球，击喉感清甜凛冽',
    filterColor: '#f1f5f9',
    paperColor: '#ffffff',
    bandColor: '#a855f7',
    stampText: 'OPTION',
    filterBrandText: 'MEVIUS',
    smokeColor: 'rgba(243, 232, 255, ',
    widthType: 'standard',
    hasBead: true,
    beadName: '港免蓝莓晶球爆珠',
    beadColor: '#a855f7',
    price: 28,
    packImage: '/images/packs/mevius_blueberry.png',
    requiredCount: 3,
    unlockDesc: '累计替烟 3 支解锁 · 港免爆款',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
      lidGradient: 'linear-gradient(180deg, #2e1065 0%, #1e1b4b 100%)',
      foilColor: '#c084fc',
      logoText: 'MEVIUS',
      subText: 'OPTION · 蓝莓双爆',
      accentColor: '#a855f7',
      sealText: '双爆晶球',
      warningText: '港免人气果香 · 极速双爆晶球捏破',
      tar: '8mg',
      nicotine: '0.7mg',
      co: '8mg',
      patternType: 'blueberry_star',
      sealColor: '#a855f7'
    }
  },

  // 20. [¥30] 嘉士德·卡斯特 5 号 (港澳奶香)
  {
    id: 'castor_vanilla',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm奶香香草嘴',
    slogan: '烘焙香草甜，温柔治愈港澳慢时光',
    name: '嘉士德·卡斯特 5 号',
    brand: '嘉士德 (Castor)',
    description: '港澳年轻人极力推崇的香草奶香典范，米黄亚光磨砂，特调烘焙香草焦糖微甜，顺滑绵柔不留宿味',
    filterColor: '#fef08a',
    paperColor: '#fffdf5',
    bandColor: '#ca8a04',
    stampText: 'CASTOR 5',
    filterBrandText: 'VANILLA',
    smokeColor: 'rgba(254, 249, 195, ',
    widthType: 'standard',
    price: 30,
    packImage: '/images/packs/castor_vanilla.png',
    requiredCount: 4,
    unlockDesc: '累计替烟 4 支解锁 · 香草奶香',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #fef9c3 0%, #fef08a 100%)',
      lidGradient: 'linear-gradient(180deg, #fffbeb 0%, #fef9c3 100%)',
      foilColor: '#fde047',
      logoText: 'CASTOR',
      subText: '卡斯特 · 香草 5 号',
      accentColor: '#ca8a04',
      sealText: '香草奶香',
      warningText: '烘焙香草柔甜 · 极度治愈舒适',
      tar: '5mg',
      nicotine: '0.5mg',
      co: '6mg',
      patternType: 'castor_shield',
      sealColor: '#ca8a04'
    }
  },

  // 21. [¥32] 钻石·荷花经典
  {
    id: 'diamond_hehua',
    lengthMm: 88,
    filterMm: 28,
    diameterMm: 6.4,
    specDesc: '88mm 清雅中支 · 28mm复古青莲中支嘴',
    slogan: '一品青莲，出淤泥而不染',
    name: '钻石·荷花经典',
    brand: '荷花 (Hehua)',
    description: '“一品青莲，清雅芬芳”，当代高知名度网红名烟，复古淡绿小清新，烟气清雅纯正，余味甘甜',
    filterColor: '#bbf7d0',
    paperColor: '#ffffff',
    bandColor: '#ca8a04',
    stampText: '荷花',
    filterBrandText: 'HEHUA',
    smokeColor: 'rgba(240, 253, 244, ',
    widthType: 'medium',
    price: 32,
    packImage: '/images/packs/hehua.png',
    requiredCount: 2,
    unlockDesc: '累计替烟 2 支解锁',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #dcfce7 0%, #bbf7d0 100%)',
      lidGradient: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)',
      foilColor: '#ca8a04',
      logoText: '荷 花',
      subText: 'DIAMOND · 一品青莲',
      accentColor: '#16a34a',
      sealText: '出水芙蓉',
      warningText: '心如荷花洁 远离焦油拥抱纯净肺呼吸',
      tar: '10mg',
      nicotine: '1.0mg',
      co: '10mg',
      patternType: 'lotus_crest',
      sealColor: '#16a34a'
    }
  },

  // 22. [¥32] 黄山·红方印经典
  {
    id: 'huangshan_hongfangyin',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm红方印金嘴',
    slogan: '一品黄山，天高云淡，乾隆红方印',
    name: '黄山·红方印经典',
    brand: '黄山 (Huangshan)',
    description: '“乾隆御赐红方印”，江南书卷气浓厚，古法手工采选自然醇化焦甜香，入喉温润绵长',
    filterColor: '#ca8a04',
    paperColor: '#fffbeb',
    bandColor: '#dc2626',
    stampText: '紅方印',
    filterBrandText: 'HUANGSHAN',
    smokeColor: 'rgba(235, 230, 215, ',
    widthType: 'standard',
    price: 32,
    packImage: '/images/packs/hongfangyin.png',
    requiredCount: 3,
    unlockDesc: '累计替烟 3 支解锁',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)',
      lidGradient: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)',
      foilColor: '#dc2626',
      logoText: '紅方印',
      subText: 'HUANGSHAN · 徽烟雅韵',
      accentColor: '#dc2626',
      sealText: '乾隆御赐',
      warningText: '寸香入画 愿您心明眼亮品味真生活',
      tar: '10mg',
      nicotine: '1.0mg',
      co: '10mg',
      patternType: 'red_seal',
      sealColor: '#dc2626'
    }
  },

  // 23. [¥45] 寿百年·黑俄先锋 (潮玩尊享)
  {
    id: 'sobranie_black',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm全黑金俄嘴',
    slogan: '伦敦沙皇御用，极致暗黑奢华先锋',
    name: '寿百年·黑俄先锋',
    brand: '寿百年 (Sobranie)',
    description: '源自 1879 伦敦的欧洲贵族潮玩名烟，全黑纯黑雾面烤漆配烫金沙皇双头鹰几何盾，长金滤嘴格外耀眼',
    filterColor: '#f59e0b',
    paperColor: '#18181b',
    bandColor: '#f59e0b',
    stampText: 'SOBRANIE',
    filterBrandText: 'LONDON',
    smokeColor: 'rgba(220, 215, 210, ',
    widthType: 'standard',
    price: 45,
    packImage: '/images/packs/sobranie_black.png',
    requiredCount: 6,
    unlockDesc: '累计替烟 6 支解锁 · 欧洲潮玩',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #09090b 0%, #18181b 100%)',
      lidGradient: 'linear-gradient(180deg, #18181b 0%, #27272a 100%)',
      foilColor: '#fbbf24',
      logoText: 'SOBRANIE',
      subText: 'BLACK RUSSIAN · 黑俄',
      accentColor: '#fbbf24',
      sealText: '沙皇双头鹰',
      warningText: '伦敦百年风尚 · 极致暗黑先锋美学',
      tar: '9mg',
      nicotine: '0.8mg',
      co: '9mg',
      patternType: 'sobranie_crest',
      sealColor: '#fbbf24'
    }
  },

  // 24. [¥60] 宽窄·五粮浓香
  {
    id: 'kuanzhai_wuliang',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm五粮酒香嘴',
    slogan: '方寸之间见宽窄，五粮浓香醉天下',
    name: '宽窄·五粮浓香',
    brand: '宽窄 (Kuanzhai)',
    description: '年轻人极为追捧的高端跨界神作，青砖灰瓦成都院落门头，捏破五粮浓香国酒爆珠，粮食酒香爆裂四溢',
    filterColor: '#ca8a04',
    paperColor: '#ffffff',
    bandColor: '#b45309',
    stampText: '宽窄',
    filterBrandText: 'LIQUOR',
    smokeColor: 'rgba(254, 243, 199, ',
    widthType: 'standard',
    hasBead: true,
    beadName: '五粮浓香国酒爆珠',
    beadColor: '#ef4444',
    price: 60,
    packImage: '/images/packs/kuanzhai.png',
    requiredCount: 5,
    unlockDesc: '累计替烟 5 支解锁',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
      lidGradient: 'linear-gradient(180deg, #475569 0%, #334155 100%)',
      foilColor: '#f59e0b',
      logoText: '宽 窄',
      subText: 'KUANZHAI · 五粮浓香',
      accentColor: '#f59e0b',
      sealText: '五粮浓香',
      warningText: '豁达宽窄 愿君品味清欢戒瘾泰然',
      tar: '10mg',
      nicotine: '1.0mg',
      co: '10mg',
      patternType: 'kuanzhai_gate',
      sealColor: '#f59e0b'
    }
  },

  // 25. [¥65] 软中华·经典国烟
  {
    id: 'chunghwa_soft',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 国烟经典标准支 · 25mm天安门红嘴',
    slogan: '爱我中华，国烟传世经典',
    name: '软中华·经典国烟',
    brand: '中华 (Chunghwa)',
    description: '“国烟”传世代表，华表双柱与天安门经典剪影，独特的梅子酸甜复合本香，气场沉稳大气',
    filterColor: '#dc2626',
    paperColor: '#fffdf5',
    bandColor: '#fbbf24',
    stampText: '中華',
    filterBrandText: 'CHUNGHWA',
    smokeColor: 'rgba(235, 225, 215, ',
    widthType: 'standard',
    price: 65,
    packImage: '/images/packs/chunghwa.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 国烟经典',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #b91c1c 0%, #991b1b 100%)',
      lidGradient: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)',
      foilColor: '#fbbf24',
      logoText: '中 華',
      subText: 'CHUNGHWA · 软包国烟',
      accentColor: '#fbbf24',
      sealText: '国烟传世',
      warningText: '国之骄傲 愿您放下烟瘾挺拔脊梁',
      tar: '11mg',
      nicotine: '1.0mg',
      co: '11mg',
      patternType: 'chunghwa_tiananmen',
      sealColor: '#fbbf24'
    }
  },

  // 26. [¥68] 牛来 (牛气冲天)
  {
    id: 'niulai_cinema',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 经典标准支 · 25mm曜黑金嘴 · 金樽琥珀醇香爆珠',
    slogan: '一朝鸿运当头，一声牛来乾坤',
    name: '牛来',
    brand: '牛来鸿运 (Niulai Fortune)',
    description: '“一朝鸿运当头，一声牛来乾坤”。原创动画风萌金小牛手绘插画与招财祥瑞金环相映成趣，黑金流光滤嘴内置【金樽琥珀醇香爆珠】，带来温润醇厚的视觉与感官代偿',
    filterColor: '#18181b', // 深邃黑金滤嘴
    paperColor: '#fffdf5',  // 象牙温润白纸
    bandColor: '#f59e0b',   // 祥瑞金圈
    stampText: '牛来',
    stampColor: '#d97706',
    filterBrandText: 'NIU LAI',
    smokeColor: 'rgba(252, 245, 230, ',
    widthType: 'standard',
    hasBead: true,
    beadName: '金樽琥珀爆珠',
    beadColor: '#f59e0b',
    price: 68,
    packImage: '/images/packs/niulai_cinema.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 鸿运牛来',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #201c18 0%, #0c0a0a 55%, #181410 100%)',
      lidGradient: 'linear-gradient(180deg, #2a241e 0%, #1a1612 100%)',
      foilColor: '#f59e0b',
      logoText: '牛 来',
      subText: 'NIULAI · 鸿运金牛 · 牛气冲天',
      accentColor: '#fbbf24',
      sealText: '牛气冲天',
      warningText: '牛来鸿运步步高 愿君早日无烟一身轻',
      tar: '8mg',
      nicotine: '0.8mg',
      co: '8mg',
      patternType: 'niulai_cinema',
      sealColor: '#b45309'
    }
  },

  // 27. [¥88] 迪加·凹凸曼 (动画光之巨人)
  {
    id: 'ultraman_tiga',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 光之标准支 · 25mm复合紫金能量嘴 · 奇迹光粒子爆珠',
    slogan: '那一年，我们都曾变成光',
    name: '迪加·凹凸曼',
    brand: '光之星云 (Diga Aotuman)',
    description: '“那一年，我们都曾变成光”。原创动画手绘风【迪加·凹凸曼】光之英雄徽章，经典红紫银三色复合装甲配黄金V型胸甲与冰蓝能量灯，捏破【奇迹光粒子爆珠】，唤醒心底不灭的光芒',
    filterColor: '#3b0764', // 复合紫装甲滤嘴
    paperColor: '#f8fafc',  // 钛银高光卷纸
    bandColor: '#fbbf24',   // 胸甲V型黄金护甲金圈
    stampText: '迪加凹凸曼',
    stampColor: '#0284c7',
    filterBrandText: 'DIGA',
    smokeColor: 'rgba(224, 242, 254, ',
    widthType: 'standard',
    hasBead: true,
    beadName: '奇迹光粒子爆珠',
    beadColor: '#38bdf8',
    price: 88,
    packImage: '/images/packs/ultraman_tiga.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 化身为光',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #1e1040 0%, #3b0764 48%, #7f1d1d 100%)',
      lidGradient: 'linear-gradient(180deg, #2e1065 0%, #1e1040 100%)',
      foilColor: '#38bdf8',
      logoText: '迪加·凹凸曼',
      subText: 'DIGA AOTUMAN · 动画光之巨人',
      accentColor: '#38bdf8',
      sealText: '化身为光',
      warningText: '相信光的人终将化身为光 愿君远离烟霾守护心底光芒',
      tar: '7mg',
      nicotine: '0.7mg',
      co: '7mg',
      patternType: 'ultraman_tiga',
      sealColor: '#0284c7'
    }
  },

  // 28. [¥89] 中华·双中支
  {
    id: 'chunghwa_double',
    lengthMm: 89,
    filterMm: 28,
    diameterMm: 6.4,
    specDesc: '89mm 尊荣中支 · 28mm双中支金红嘴',
    slogan: '双中支典范，经典中国红',
    name: '中华·双中支',
    brand: '中华 (Chunghwa)',
    description: '双中支品类引领者，传承中华经典梅子甜香，双铝箔分腔设计，握持感极为舒适优雅',
    filterColor: '#b91c1c',
    paperColor: '#fffdf5',
    bandColor: '#fbbf24',
    stampText: '中華',
    filterBrandText: 'CHUNGHWA',
    smokeColor: 'rgba(235, 225, 215, ',
    widthType: 'medium',
    hasBead: true,
    beadName: '国梅鎏金爆珠',
    beadColor: '#fbbf24',
    price: 89,
    packImage: '/images/packs/chunghwa_double.png',
    requiredCount: 10,
    unlockDesc: '累计替烟 10 支解锁',
    packCapacity: 20,
    packType: 'slender',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)',
      lidGradient: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
      foilColor: '#fbbf24',
      logoText: '中 華',
      subText: 'CHUNGHWA · 双中支',
      accentColor: '#fbbf24',
      sealText: '双中支开模',
      warningText: '典雅中支 愿您自律常清重获新生',
      tar: '10mg',
      nicotine: '0.9mg',
      co: '10mg',
      patternType: 'chunghwa_tiananmen',
      sealColor: '#fbbf24'
    }
  },

  // 29. [¥99] 倾城一笑·开心果 (女友特供·表情包典藏)
  {
    id: 'gf_happy_smile',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 宠爱标准支 · 25mm皇家绯红金嘴 · 蜜桃甜心爆珠',
    slogan: '一笑倾城百媚生，少抽香烟多宠她',
    name: '倾城一笑·开心果',
    brand: '欢喜冤家 (Sweetheart)',
    description: '“一笑倾城百媚生，少抽香烟多宠她”。皇家丝绒绯红鎏金礼盒镶嵌女友可爱灵动表情包特写，捏破【蜜桃甜心爆珠】，烦恼与烟瘾瞬间烟消云散',
    filterColor: '#9f1239', // 皇家丝绒玫瑰红滤嘴
    paperColor: '#fffdf5',  // 象牙温润卷纸
    bandColor: '#fbbf24',   // 皇家金箍圈
    stampText: '倾城一笑',
    stampColor: '#e11d48',
    filterBrandText: 'SWEET',
    smokeColor: 'rgba(255, 228, 230, ',
    widthType: 'standard',
    hasBead: true,
    beadName: '蜜桃甜心爆珠',
    beadColor: '#fb7185',
    price: 99,
    packImage: '/images/packs/gf_happy_smile.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 专属开心果',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #881337 0%, #4c0519 100%)',
      lidGradient: 'linear-gradient(180deg, #9f1239 0%, #881337 100%)',
      foilColor: '#fbbf24',
      logoText: '倾城一笑',
      subText: 'SWEETHEART · 专属开心果',
      accentColor: '#fb7185',
      sealText: '欢喜冤家',
      warningText: '看一眼开心果表情包 烦恼烟瘾统统消散',
      tar: '6mg',
      nicotine: '0.6mg',
      co: '6mg',
      patternType: 'gf_happy_smile',
      sealColor: '#e11d48'
    }
  },

  // 30. [¥100] 黄鹤楼·1916
  {
    id: 'huanghelou_1916',
    lengthMm: 74,
    filterMm: 30,
    diameterMm: 7.7,
    specDesc: '74mm 传世短支 · 30mm高比例奢华长嘴',
    slogan: '千古江山，千年名楼，传世1916',
    name: '黄鹤楼·1916',
    brand: '黄鹤楼 (Huanghelou)',
    description: '“千古名楼，传世1916”，高端中式烤烟天花板之一，复古手工羊皮纸质感，双环古楼黄铜徽印，雅香绝伦',
    filterColor: '#ca8a04',
    paperColor: '#fffbeb',
    bandColor: '#78350f',
    stampText: '1916',
    filterBrandText: 'VINTAGE',
    smokeColor: 'rgba(240, 235, 220, ',
    widthType: 'short',
    price: 100,
    packImage: '/images/packs/hhl1916.png',
    requiredCount: 15,
    unlockDesc: '累计替烟 15 支解锁',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #d97706 0%, #78350f 100%)',
      lidGradient: 'linear-gradient(180deg, #b45309 0%, #78350f 100%)',
      foilColor: '#fde68a',
      logoText: '黃鶴樓',
      subText: '1916 · 传世典藏',
      accentColor: '#fde68a',
      sealText: '纯手工选叶',
      warningText: '名楼风骨 愿君登高远眺心肺通达',
      tar: '10mg',
      nicotine: '1.0mg',
      co: '10mg',
      patternType: 'yellow_crane_1916',
      sealColor: '#fde68a'
    }
  },

  // 31. [¥100] 白沙·和天下
  {
    id: 'baisha_hetianxia',
    lengthMm: 84,
    filterMm: 25,
    diameterMm: 7.7,
    specDesc: '84mm 极品国烤 · 25mm和天下紫金嘴',
    slogan: '和达天下，和者无界，润泽万物',
    name: '白沙·和天下',
    brand: '白沙 (Baisha)',
    description: '“和达天下，有容乃大”，高端尊荣之作，深邃紫檀底色配汉唐祥云流光织锦，香气丰满充盈，甘润生津',
    filterColor: '#581c87',
    paperColor: '#fffdf5',
    bandColor: '#fbbf24',
    stampText: '和天下',
    filterBrandText: 'HETIANXIA',
    smokeColor: 'rgba(235, 228, 245, ',
    widthType: 'standard',
    price: 100,
    packImage: '/images/packs/hetianxia.png',
    requiredCount: 20,
    unlockDesc: '累计替烟 20 支解锁',
    packCapacity: 20,
    packType: 'standard',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #3b0764 0%, #18042b 100%)',
      lidGradient: 'linear-gradient(180deg, #581c87 0%, #3b0764 100%)',
      foilColor: '#fbbf24',
      logoText: '和天下',
      subText: 'HETIANXIA · 紫气东来',
      accentColor: '#fbbf24',
      sealText: '和气致祥',
      warningText: '和达天地 愿您心和气顺健康自愈',
      tar: '11mg',
      nicotine: '1.1mg',
      co: '11mg',
      patternType: 'hetianxia_pattern',
      sealColor: '#fbbf24'
    }
  },

  // 32. [¥520] 心动女神·白月光 (女友高定·一生挚爱)
  {
    id: 'gf_moonlight_muse',
    lengthMm: 97,
    filterMm: 30,
    diameterMm: 5.4,
    specDesc: '97mm 仙女修长细支 · 30mm珠光玫瑰嘴 · 初恋玫瑰爆珠',
    slogan: '抽烟只抽心动女神，一生只宠一个人',
    name: '心动女神·白月光',
    brand: '一生挚爱 (Moonlight Muse)',
    description: '“抽烟只抽心动女神，一生只宠一个人”。珠光月白配香槟玫瑰金520限定礼盒，典藏甜美女神全身写真立绘，捏破【初恋玫瑰爆珠】，满口皆是心动回甘',
    filterColor: '#db2777', // 玫瑰甜心粉红滤嘴
    paperColor: '#fffdf5',  // 珠光纯白细支卷纸
    bandColor: '#fbbf24',   // 香槟玫瑰金箍圈
    stampText: '心动女神',
    stampColor: '#db2777',
    filterBrandText: 'LOVE 520',
    smokeColor: 'rgba(252, 231, 243, ',
    widthType: 'slender',
    hasBead: true,
    beadName: '初恋玫瑰爆珠',
    beadColor: '#f472b6',
    price: 520,
    packImage: '/images/packs/gf_moonlight_muse.png',
    requiredCount: 0,
    unlockDesc: '初始默认解锁 · 520限定挚爱',
    packCapacity: 20,
    packType: 'slender',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #fffafc 0%, #fce7f3 100%)',
      lidGradient: 'linear-gradient(180deg, #ffffff 0%, #fdf2f8 100%)',
      foilColor: '#f472b6',
      logoText: '心动女神',
      subText: 'MOONLIGHT · 独家白月光',
      accentColor: '#ec4899',
      sealText: '一生挚爱',
      warningText: '仙女颜值超标 戒烟省钱宠女神',
      tar: '5mg',
      nicotine: '0.5mg',
      co: '5mg',
      patternType: 'gf_moonlight_muse',
      sealColor: '#db2777'
    }
  },

  // 33. [¥680] 高希霸·世纪六号 (古巴雪茄)
  {
    id: 'cohiba_siglo_vi',
    lengthMm: 150,
    filterMm: 28,
    diameterMm: 20.6,
    specDesc: '150mm 古巴大号雪茄 · 52环径全叶裹身',
    slogan: '哈瓦那雪茄之王，时间的慢享艺术',
    name: '高希霸·世纪六号 (古巴雪茄)',
    brand: 'Cohiba (高希霸)',
    description: '哈瓦那顶级古巴大号雪茄，深棕手工烟叶裹身，古巴黑黄棋盘金标，慢吸浓郁蓝云',
    filterColor: '#18181b',
    paperColor: '#5c321a',
    bandColor: '#f59e0b',
    smokeColor: 'rgba(195, 210, 230, ',
    widthType: 'cigar',
    isCigar: true,
    price: 680,
    packImage: '/images/packs/cohiba.png',
    requiredCount: 30,
    unlockDesc: '累计替烟 30 支解锁',
    packCapacity: 5,
    packType: 'cigar',
    lidLine: 168,
    packTheme: {
      boxGradient: 'linear-gradient(180deg, #09090b 0%, #18181b 36%, #d97706 36.5%, #b45309 100%)',
      lidGradient: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
      foilColor: '#f59e0b',
      logoText: 'COHIBA',
      subText: 'HABANA · SIGLO VI',
      accentColor: '#f59e0b',
      sealText: 'HECHO EN CUBA',
      warningText: '古巴顶级雪松原木手工盒 · 5支装',
      tar: '雪茄级',
      nicotine: '自然醇化',
      co: '烟叶自然',
      patternType: 'cohiba_checker',
      sealColor: '#000000'
    }
  }
];

export const DEFAULT_CIGARETTE = CIGARETTE_CATALOG.find(item => item.id === 'chaotianmen_gold') || CIGARETTE_CATALOG[1];

export function getCigaretteById(id) {
  return CIGARETTE_CATALOG.find(item => item.id === id) || DEFAULT_CIGARETTE;
}

/**
 * 核心解锁判定引擎 (根除条件达到无法点击目标 Bug，贯通 VIP 特权)
 */
export function isCigaretteUnlocked(id, totalCount) {
  // 1. VIP 特权：全图鉴免解锁直通
  try {
    if (vipService && vipService.isVip()) {
      return true;
    }
  } catch (e) {}

  const item = getCigaretteById(id);
  if (!item) return false;
  
  // 2. 初始默认解锁
  if (item.requiredCount === 0) return true;

  // 3. 统计替代记录数
  let count = totalCount;
  if (count === undefined) {
    try {
      const records = storageService.getRecords();
      count = Array.isArray(records) ? records.length : 0;
    } catch (e) {
      count = 0;
    }
  }
  return count >= item.requiredCount;
}


/**
 * 核心微距真实物理尺寸映射引擎 (毫米 mm 映射到 Canvas 像素与 UI 比例)
 */
export function computeCigaretteDimensions(cig, canvasH) {
  const item = cig || {};
  const lenMm = item.lengthMm || 84;
  const fltMm = item.filterMm || 25;
  const diaMm = item.diameterMm || 7.7;
  const topDiaMm = item.topDiameterMm || diaMm;

  let calculatedH = lenMm * 4.226;
  if (canvasH && typeof canvasH === "number") {
    calculatedH = Math.min(calculatedH, canvasH * 0.58);
  }

  if (item.isCigar || item.widthType === "cigar") {
    calculatedH = canvasH ? Math.min(345, canvasH * 0.51) : 345;
  }

  let cigW = 28;
  let topW = 28;

  if (item.isCigar || item.widthType === "cigar") {
    cigW = 42;
    topW = 42;
  } else if (item.widthType === "hand_rolled") {
    cigW = 16;
    topW = 34;
  } else if (item.widthType === "slender") {
    cigW = 20;
    topW = 20;
  } else if (item.widthType === "medium" || diaMm <= 6.5) {
    cigW = 24;
    topW = 24;
  } else if (item.widthType === "short") {
    cigW = 28;
    topW = 28;
  }

  const filterRatio = Math.max(0.08, Math.min(0.55, fltMm / lenMm));

  return {
    maxCigH: Math.round(calculatedH),
    cigW,
    topW,
    filterRatio,
    filterMm: fltMm,
    lengthMm: lenMm,
    diameterMm: diaMm
  };
}


/**
 * 计算抽出飞升动画的物理微缩样式 (UI rpx)
 */
export function computeFlightStyles(cig) {
  const item = cig || {};
  const lenMm = item.lengthMm || 84;
  const fltMm = item.filterMm || 25;

  let flightW = 26;
  let heroW = 38;
  if (item.isCigar || item.widthType === "cigar") {
    flightW = 40;
    heroW = 54;
  } else if (item.widthType === "slender") {
    flightW = 18;
    heroW = 28;
  } else if (item.widthType === "medium") {
    flightW = 22;
    heroW = 34;
  } else if (item.widthType === "hand_rolled") {
    flightW = 32;
    heroW = 46;
  }

  let flightH = Math.round((lenMm / 84) * 380);
  let heroH = Math.round((lenMm / 84) * 410);
  if (item.isCigar || item.widthType === "cigar") {
    flightH = 370;
    heroH = 420;
  } else if (item.widthType === "hand_rolled") {
    heroH = 340;
  }

  const filterRatio = Math.max(0.1, Math.min(0.55, fltMm / lenMm));
  const filterH = Math.round(flightH * filterRatio);
  const heroFilterH = Math.round(heroH * filterRatio);

  return {
    flightW,
    flightH,
    filterH,
    heroW,
    heroH,
    heroFilterH
  };
}

