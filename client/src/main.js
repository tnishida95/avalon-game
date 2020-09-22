// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import io from 'socket.io-client';
import vuetify from '@/plugins/vuetify';

Vue.config.productionTip = false;

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
    App
  },
  template: '<App/>',
  vuetify
});
