// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';

Vue.config.productionTip = false;

import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log(socket.id);
});
Vue.prototype.$socket = socket;
// TODO: remove this note
// adding socket to the global scope...
// use with this.$socket in component method blocks

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: {
    App
  },
  sockets: {
    connection: function() {
      console.log('socket connected');
    },
    from_server: function(val) {
      console.log("data from server received: " + val);
    }
  },
  template: '<App/>'
});
