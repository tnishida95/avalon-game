<template>
  <div class="container-fluid text-center">
    <component v-bind:is="currentAction"
               v-bind:waitingOnList="waitingOnList"
               v-bind:room="room"
               v-bind:roomNum="roomNum"
               v-bind:self="self"/>
    <p/>
    <span>Waiting for:
      <v-chip outlined v-for="name in this.waitingOnList" :key="name">{{ name }}</v-chip>
    </span>
    <v-progress-linear height="10" class="my-5" v-bind:value="progress"></v-progress-linear>
    <v-divider/>
  </div>
</template>

<script>
import Pregame from './Pregame';
import PartySelect from './PartySelect';

export default {
  name: 'ActionView',
  components: {
    Pregame,
    PartySelect
  },
  data: function() {
    return {
      isDone: false,
      currentAction: 'Pregame'
    };
  },
  computed: {
    progress: function() {
      return ((this.room.length - this.waitingOnList.length) / this.room.length) * 100;
    }
  },
  methods: {

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
