<template>
  <div class="text-center">
    <h3>Game Board</h3>
    <h4>Quests:</h4>
    <v-btn icon x-large outlined class="mx-1 good-blue">{{ this.$store.state.game.questSize[0] }}</v-btn>
    <v-btn icon x-large outlined class="mx-1 evil-red">{{ this.$store.state.game.questSize[1] }}</v-btn>
    <v-btn icon x-large outlined class="mx-1" elevation="5">{{ this.$store.state.game.questSize[2] }}</v-btn>
    <v-btn icon x-large outlined class="mx-1">{{ this.$store.state.game.questSize[3] }}</v-btn>
    <v-btn icon x-large outlined class="mx-1">{{ this.$store.state.game.questSize[4] }}</v-btn>
    <p/>
    <h4>Parties Rejected:</h4>
    <v-btn icon small outlined>1</v-btn>
    <v-btn icon small outlined>2</v-btn>
    <v-btn icon small>3</v-btn>
    <v-btn icon small>4</v-btn>
    <v-btn icon small class="evil-red">5</v-btn>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'BoardView'
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
