<template>
  <div class="text-center">
    <h3>Game Board</h3>
    <h4>Quests:</h4>
    <v-btn icon x-large outlined class="mx-1" v-for="(quest, index) in game.quests" :key="index"
           v-bind:class="{ [`good-blue`]: (quest === 1), [`evil-red`]: (quest === 2) }">
      {{ game.questSize[index] }}
    </v-btn>
    <h4>Parties Rejected: {{ game.partiesRejected }}</h4>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'BoardView',
  computed: {
    game() {
      return this.$store.state.game;
    }
  },
};
</script>

<style>
.good-blue {
  background-color: #C8C8FF !important;
}

.evil-red {
  background-color: #FFC8C8 !important;
}
</style>
