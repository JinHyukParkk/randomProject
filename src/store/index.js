import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    onTab: {
      totalSearch: '',
      live: '',
      vod: '',
      post: '',
      bj: '',
      current: ''
    },
    userId: ''
  },
  mutations: {
    changeTab (state, tab) {
      let szCurTab = state.onTab['current']
      state.onTab[szCurTab] = ''
      state.onTab[tab] = 'on'
      state.onTab.current = tab
    },
    setCurrentTab (state, tab) {
      state.onTab.current = tab
    },
    setUserId (state, userId) {
      state.userId = userId
    }
  },
  actions: {
    callChangeTab ({ state, commit }, { tab }) {
      commit('changeTab', tab)
    },
    callSetCurrentTab ({ state, commit }, { tab }) {
      commit('setCurrentTab', tab)
    },
    callSetUserId ({ state, commit }, { userId }) {
      commit('setUserId', userId)
    }
  },
  getters: {
    getMsg (state) {
      return `${state.message} => Length : ${state.message.length}`
    }
  }
})
