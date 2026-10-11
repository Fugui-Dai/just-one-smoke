// components/custom-toast/custom-toast.js
import { triggerHaptic } from '../../utils/haptics.js';

Component({
  data: {
    rendered: false,
    visible: false,
    isExiting: false,
    title: '',
    desc: '',
    iconText: '',
    typeClass: 'type-info',
    customStyle: ''
  },

  methods: {

    /**
     * 显示灵动微胶囊 Toast
     * @param {Object} options
     * @param {string} options.title - 主标题
     * @param {string} [options.desc] - 副说明
     * @param {string} [options.icon] - 自定义图标或 Emoji
     * @param {string} [options.type] - flame | success | bead | warn | info
     * @param {number} [options.duration] - 停留时间(ms), 默认 2000
     */
    show(options = {}) {
      if (typeof options === 'string') {
        options = { title: options };
      }

      const title = options.title || '';
      const desc = options.desc || '';
      let type = options.type || 'info';

      // 根据标题关键词或原生 icon 类型做智能映射
      if (!options.type) {
        if (options.icon === 'success' || title.includes('成功') || title.includes('已保存') || title.includes('已同步') || title.includes('解锁')) {
          type = 'success';
        } else if (title.includes('点燃') || title.includes('火') || title.includes('抽')) {
          type = 'flame';
        } else if (title.includes('爆珠') || title.includes('炫赫门')) {
          type = 'bead';
        } else if (title.includes('未') || title.includes('已空') || title.includes('无法') || title.includes('请') || title.includes('注意')) {
          type = 'warn';
        }
      }

      let iconText = options.icon && options.icon.length > 2 ? options.icon : '';
      if (!iconText) {
        switch (type) {
          case 'flame':
            iconText = '🔥';
            break;
          case 'success':
            iconText = '✨';
            break;
          case 'bead':
            iconText = '🫧';
            break;
          case 'warn':
            iconText = '⚠️';
            break;
          default:
            iconText = '💡';
        }
      }

      // 触觉马达响应
      if (type === 'flame') {
        triggerHaptic('medium');
      } else if (type === 'warn') {
        triggerHaptic('medium');
      } else {
        triggerHaptic('light');
      }

      let customStyle = '';
      if (options.bottom !== undefined) {
        const bVal = typeof options.bottom === 'number' ? `${options.bottom}px` : options.bottom;
        customStyle = `bottom: calc(${bVal} + env(safe-area-inset-bottom, 0px));`;
      }

      if (this._hideTimer) clearTimeout(this._hideTimer);
      if (this._exitTimer) clearTimeout(this._exitTimer);

      this.setData({
        rendered: true,
        visible: true,
        isExiting: false,
        title,
        desc,
        iconText,
        typeClass: `type-${type}`,
        customStyle
      });

      const duration = typeof options.duration === 'number' ? options.duration : 2200;

      // 定时触发优雅退场动效
      this._exitTimer = setTimeout(() => {
        this.setData({ isExiting: true });
        this._hideTimer = setTimeout(() => {
          this.setData({
            rendered: false,
            visible: false,
            isExiting: false
          });
        }, 260); // 对应 CSS 退出动效耗时
      }, duration);
    },

    hide() {
      if (this._hideTimer) clearTimeout(this._hideTimer);
      if (this._exitTimer) clearTimeout(this._exitTimer);
      this.setData({ isExiting: true });
      this._hideTimer = setTimeout(() => {
        this.setData({
          rendered: false,
          visible: false,
          isExiting: false
        });
      }, 260);
    },

    preventTouchMove() {}
  }
});
