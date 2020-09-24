<template>
  <div>
    <Pregame v-bind:self="self"/>
    <ActionView v-bind:waitingOnList="waitingOnList"
                v-bind:room="room"
                v-bind:roomNum="roomNum"
                v-bind:self="self"/>
    <PlayerView v-bind:room="room"/>
  </div>
</template>

<script>
import Pregame from './Pregame';
import ActionView from './ActionView';
import PlayerView from './PlayerView';

export default {
  name: 'Game',
  components: {
    Pregame,
    ActionView,
    PlayerView
  },
  props: {
    roomNum: String,
    room: Array,
    self: Object,
    waitingOnList: Array
  },
  methods: {
    listenUpdateAction: function() {
      this.$socket.on('updateAction', (data) => {
        this.waitingOnList = data.waitingOnList;
      });
    }
  },
  beforeMount() {
    this.listenUpdateAction();
  }
};
</script>

<style>
</style>
