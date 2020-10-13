// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuex from 'vuex';
import App from './App';
import io from 'socket.io-client';
import vuetify from '@/plugins/vuetify';

Vue.config.productionTip = false;

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    room: [],
    roomNum: -1,
    self: {},
    waitingOnList: [],
    game: {},
    characterSelections: []
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
    },
    setCharacterSelections(state, payload) {
      state.characterSelections = payload;
    }
  }
});

let socket;
if(process.env.PORT) {
  socket = io();
}
else {
  // if here, then we're in a dev env
  socket = io('http://localhost:3000');
}

socket.on('connect', () => {
  console.log('Successfully established socket connection');
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
