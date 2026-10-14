// components/leaderboard-view/leaderboard-view.js
import { DEFAULT_USER_AVATAR_SVG } from '../../utils/vectorIcons.js';

Component({
  properties: {
    list: {
      type: Array,
      value: []
    },
    myRankInfo: {
      type: Object,
      value: {}
    },
    profile: {
      type: Object,
      value: {}
    },
    isVip: {
      type: Boolean,
      value: false
    },
    vipTheme: {
      type: String,
      value: ''
    },
    currentCategory: {
      type: String,
      value: 'substituted'
    },
    totalSubstituted: {
      type: Number,
      value: 0
    },
    totalSavedMoney: {
      type: String,
      value: '0.00'
    },
    quitDays: {
      type: Number,
      value: 0
    },
    topPadding: {
      type: Number,
      value: 100
    }
  },

  data: {
    defaultAvatarSvg: DEFAULT_USER_AVATAR_SVG,
    vipAnimPhase: 'a'
  },

  observers: {
    'currentCategory, isVip': function(currentCategory, isVip) {
      if (this._lastCategory !== currentCategory || this._lastIsVip !== isVip) {
        this._lastCategory = currentCategory;
        this._lastIsVip = isVip;
        this.syncVipSweepAnimation();
      }
    }
  },

  lifetimes: {
    ready() {
      this.syncVipSweepAnimation();
    }
  },

  methods: {
    syncVipSweepAnimation() {
      const nextPhase = this.data.vipAnimPhase === 'a' ? 'b' : 'a';
      this.setData({ vipAnimPhase: nextPhase });
    },

    onSwitchCategory(e) {
      const category = e.currentTarget.dataset.category;
      this.triggerEvent('changecategory', { category });
    },

    onLikeItem(e) {
      const id = e.currentTarget.dataset.id;
      this.triggerEvent('like', { id });
    },

    onAvatarError() {
      this.setData({ 'profile.avatarUrl': '' });
    }
  }
});
