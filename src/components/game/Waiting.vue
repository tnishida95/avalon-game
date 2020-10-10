<template>
  <div class="container-fluid text-center">
    <h3>Others players are taking action...</h3>
    <h4>{{ message }}</h4>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'Waiting',
  computed: {
    message() {
      const phase = this.$store.state.game.phase;
      if(phase === 0 || phase === 3 || phase === 6 || phase === 9 || phase === 12) {
        return 'Waiting for a party to be selected';
      }
      else if(phase === 1 || phase === 4 || phase === 7 || phase === 10 || phase === 13) {
        // TODO: don't think this ever will happen (view just stays on PartyApproval)
        return 'Waiting for approval votes to be cast.';
      }
      else if(phase === 2 || phase === 5 || phase === 8 || phase === 11 || phase === 14) {
        return 'Waiting for quest actions to be submitted.';
      }
      else {
        return 'The Assassin is attempting to assassinate Merlin!';
      }
    }
  }
};
</script>

<style>
</style>
