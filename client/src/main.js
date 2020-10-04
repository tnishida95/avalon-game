// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuex from 'vuex';
import App from './App';
import io from 'socket.io-client';
import vuetify from '@/plugins/vuetify';

Vue.config.productionTip = false;

Vue.use(Vuex);

// note: consider whether Vuex is needed here;
// project may be simple enough for
// Vue.prototype.$foo usage throughout
const store = new Vuex.Store({
  state: {
    room: [],
    roomNum: -1,
    self: {},
    waitingOnList: [],
    game: {}
  },
  mutations: {
    setRoom(state, payload) {
      state.room = payload;
    },
    setRoomNum(state, payload) {
      state.roomNum = payload;
    },
    setSelf(state, payload) {
      state.self = payload;
    },
    setWaitingOnList(state, payload) {
      state.waitingOnList = payload;
    },
    setGame(state, payload) {
      state.game = payload;
    }
  }
});

const port = process.env.PORT || 3000;
const socket = io(`http://localhost:${port}`);

socket.on('connect', () => {
  console.log(socket.id);
});

Vue.prototype.$socket = socket;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: {
    App,
  },
  template: '<App/>',
  store,
  vuetify
});
