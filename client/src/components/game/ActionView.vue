<template>
  <div class="container-fluid text-center">
    <v-btn x-large v-on:click="btnPressReady" v-if="!isDone">Ready</v-btn>
    <p/>
    <span>Waiting for:
      <v-chip outlined v-for="name in this.waitingOnList" :key="name">{{ name }}</v-chip>
    </span>
    <v-progress-linear height="10" class="my-5" v-bind:value="progress"></v-progress-linear>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'ActionView',
  data: function() {
    return {
      isDone: false
    };
  },
  computed: {
    progress: function() {
      return ((this.room.length - this.waitingOnList.length) / this.room.length) * 100;
    }
  },
  methods: {
    btnPressReady: function(event) {
      this.isDone = true;
      this.$socket.emit('btnPressReady', {
        roomNum: this.roomNum,
        self: this.self
      });
    },
  },
  props: {
    room: Array,
    roomNum: String,
    self: Object,
    waitingOnList: Array
  }
};
</script>

<style>
</style>
