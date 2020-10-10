<template>
  <div class="container-fluid text-center">
    <h3>Game Over!</h3>
    <h4>{{ winner }}</h4>
    <h4>This page is under construction.</h4>
    <p/>
    <v-btn disabled>Rejoin Lobby</v-btn>
    <v-btn disabled>Main Menu</v-btn>
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
  }
};
</script>

<style>
</style>
