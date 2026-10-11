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
    defaultAvatarSvg: DEFAULT_USER_AVATAR_SVG
  },

  methods: {
    onSwitchCategory(e) {
      const category = e.currentTarget.dataset.category;
      this.triggerEvent('changecategory', { category });
    },

    onLikeItem(e) {
      const id = e.currentTarget.dataset.id;
      this.triggerEvent('like', { id });
    }
  }
});
