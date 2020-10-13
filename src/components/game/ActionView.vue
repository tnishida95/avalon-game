<template>
  <div class="container-fluid text-center">
    <component v-bind:is="currentAction"/>
    <p/>
    <div v-if="this.$store.state.game.phase < 16">
      <span>Waiting for:
        <v-chip outlined v-for="name in this.$store.state.waitingOnList" :key="name">{{ name }}</v-chip>
      </span>
      <v-progress-linear height="10" class="my-5" v-bind:value="progress"></v-progress-linear>
      <v-divider/>
    </div>
  </div>
</template>

<script>
import Pregame from './Pregame';
import PartySelect from './PartySelect';
import PartyApproval from './PartyApproval';
import Questing from './Questing';
import Assassin from './Assassin';
import GameEnd from './GameEnd';
import Waiting from './Waiting';

export default {
  name: 'ActionView',
  components: {
    Pregame,
    PartySelect,
    PartyApproval,
    Questing,
    Assassin,
    GameEnd,
    Waiting
  },
  data: function() {
    return {
      isDone: false,
      currentAction: this.rejoinAction
    };
  },
  props: {
    rejoinAction: String
  },
  computed: {
    progress: function() {
      const phase = this.$store.state.game.phase;
      let max = 10;
      // pregame, party approval (this comes first because phase = 0 when Pregame)
      if(this.currentAction === 'Pregame' || phase === 1 || phase === 4 || phase === 7 || phase === 10 || phase === 13) {
        max = this.$store.state.room.length;
      }
      // party select, assassin
      else if(phase === 0 || phase === 3 || phase === 6 || phase === 9 || phase === 12) {
        max = 1;
      }
      // questing
      else if(phase === 2) {
        max = this.$store.state.game.questSize[0];
      }
      else if(phase === 5) {
        max = this.$store.state.game.questSize[1];
      }
      else if(phase === 8) {
        max = this.$store.state.game.questSize[2];
      }
      else if(phase === 11) {
        max = this.$store.state.game.questSize[3];
      }
      else if(phase === 14) {
        max = this.$store.state.game.questSize[4];
      }
      else {
        return 100;
      }
      return ((max - this.$store.state.waitingOnList.length) / max) * 100;
    }
  },
  methods: {
    listenUpdateAction: function() {
      this.$socket.on('updateAction', (data) => {
        this.$store.commit('setWaitingOnList', data.waitingOnList);
        this.$store.commit('setGame', data.game);
        if(data.currentAction !== '') {
          this.currentAction = data.currentAction;
        }
      });
    },
    listenEndGame: function() {
      this.$socket.on('endGame', (data) => {
        this.$store.commit('setWaitingOnList', data.waitingOnList);
        this.$store.commit('setGame', data.game);
        this.$store.commit('setRoom', data.room);
        this.currentAction = 'GameEnd';
      });
    }
  },
  beforeMount() {
    this.listenUpdateAction();
    this.listenEndGame();
  }
};
</script>

<style>
</style>
