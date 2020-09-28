<template>
  <div>
    <!-- <BoardView/> -->
    <ActionView/>
    <PlayerView/>
  </div>
</template>

<script>
import ActionView from './ActionView';
import PlayerView from './PlayerView';
// import BoardView from './BoardView';

export default {
  name: 'Game',
  components: {
    // BoardView,
    ActionView,
    PlayerView
  },
  methods: {
    listenUpdateAction: function() {
      this.$socket.on('updateAction', (data) => {
        this.$store.commit('setWaitingOnList', data.waitingOnList);
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
