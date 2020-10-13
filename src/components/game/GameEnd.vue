<template>
  <div class="container-fluid text-center">
    <h3>Game Over!</h3>
    <h4 v-bind:class="{ 'blue-text': (this.$store.state.game.winningTeam === 1),
        'red-text': (this.$store.state.game.winningTeam === 2) }">{{ winner }}</h4>
    <h4>This page is under construction.</h4>
    <p/>
    <v-btn v-if="isHost" v-on:click="btnPressRehostLobby">Rehost Lobby</v-btn>
    <v-btn v-else v-bind:disabled="!isHostReady" v-on:click="btnPressRejoinLobby">Rejoin Lobby</v-btn>
    <v-btn v-on:click="btnPressEndNoRejoin">Main Menu</v-btn>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'GameEnd',
  data: function() {
    return {
      isHostReady: false
    };
  },
  computed: {
    winner() {
      return (this.$store.state.game.winningTeam === 1) ? 'Good Wins!' : 'Evil Wins!';
    },
    isHost() {
      return (this.$store.state.room[0].name === this.$store.state.self.name);
    }
  },
  methods: {
    btnPressEndNoRejoin: function(event) {
      this.$socket.emit('btnPressEndNoRejoin', {
        roomNum: this.$store.state.roomNum
      });
    },
    btnPressRehostLobby: function(event) {
      this.$socket.emit('btnPressRehostLobby', {
        roomNum: this.$store.state.roomNum,
        self: this.$store.state.self
      });
    },
    btnPressRejoinLobby: function(event) {
      this.$socket.emit('btnPressRejoinLobby', {
        roomNum: this.$store.state.roomNum,
        self: this.$store.state.self
      });
    },
    listenHostReady: function() {
      this.$socket.on('hostReady', (data) => {
        this.isHostReady = true;
      });
    }
  },
  beforeMount() {
    this.listenHostReady();
  }
};
</script>

<style>
.blue-text {
  color: #C8C8FF !important;
}

.red-text {
  color: #FFC8C8 !important;
}
</style>
