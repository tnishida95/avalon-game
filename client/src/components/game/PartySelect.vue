<template>
  <div class="text-center">
    <h3>Select {{ partySize }} players for the party:</h3>
    <v-btn-toggle multiple group v-bind:max="partySize" v-model="partySelections">
      <v-hover v-slot:default="{ hover }" v-for="player in room" :key="player.name">
        <v-btn  block :elevation="hover ? 12 : 2" :class="{ 'on-hover': hover }" v-bind:value="player.name">
          {{ player.name }}
        </v-btn>
      </v-hover>
    </v-btn-toggle>
    <p/>
    <v-chip outlined v-for="name in this.partySelections" :key="name">{{ name }}</v-chip>
    <p/>
    <v-btn :disabled="partySelections.length > partySize || partySelections.length < partySize"
           x-large v-on:click="btnPressPartySubmit">Submit</v-btn>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'PartySelect',
  data: function() {
    return {
      partySelections: []
    };
  },
  computed: {
    room() {
      return this.$store.state.room;
    },
    partySize() {
      const phase = this.$store.state.game.phase;
      let currentQuest = -1;
      if(phase < 3) {
        currentQuest = 0;
      }
      else if(phase < 6) {
        currentQuest = 1;
      }
      else if(phase < 9) {
        currentQuest = 2;
      }
      else if(phase < 12) {
        currentQuest = 3;
      }
      else {
        currentQuest = 4;
      }
      return this.$store.state.game.questSize[currentQuest];
    }
  },
  methods: {
    btnPressPartySubmit: function(event) {
      console.log(this.partySelections);
      this.$socket.emit('btnPressPartySubmit', {
        roomNum: this.$store.state.roomNum,
        partySelections: this.partySelections
      });
    },
  },
};
</script>

<style>
.v-btn-toggle {
  flex-direction: column; width: 80%;
}
.v-btn-toggle > :not(.v-btn--active) {
  opacity: 0.5 !important;
}
.v-btn-toggle > :not(.v-btn--active):hover {
  opacity: 1 !important;
}
</style>
