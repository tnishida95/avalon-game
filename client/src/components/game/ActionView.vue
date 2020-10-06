<template>
  <div class="container-fluid text-center">
      <component v-bind:is="currentAction"/>
      <p/>
      <span>Waiting for:
        <v-chip outlined v-for="name in this.$store.state.waitingOnList" :key="name">{{ name }}</v-chip>
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
      return ((this.$store.state.room.length - this.$store.state.waitingOnList.length) / this.$store.state.room.length) * 100;
    }
  },
};
</script>

<style>
</style>
