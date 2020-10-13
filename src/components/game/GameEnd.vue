<template>
  <div class="container-fluid text-center">
    <h3>Game Over!</h3>
    <h4 v-bind:class="{ 'blue-text': (this.$store.state.game.winningTeam === 1),
        'red-text': (this.$store.state.game.winningTeam === 2) }">{{ winner }}</h4>
    <h4>This page is under construction.</h4>
    <p/>
    <v-btn disabled>Rejoin Lobby</v-btn>
    <v-btn v-on:click="btnPressEndNoRejoin">Main Menu</v-btn>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'GameEnd',
  computed: {
    winner() {
      return (this.$store.state.game.winningTeam === 1) ? 'Good Wins!' : 'Evil Wins!';
    }
  },
  methods: {
    btnPressEndNoRejoin: function(event) {
      // TODO
      console.log("TODO");
    }
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
