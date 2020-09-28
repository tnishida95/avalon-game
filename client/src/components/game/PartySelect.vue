<template>
  <div class="text-center">
    <h3>Select {{ partySize }} players for the party:</h3>
    <v-btn-toggle multiple group v-bind:max="partySize" v-model="selectedParty">
      <v-hover v-slot:default="{ hover }" v-for="player in testRoom" :key="player.name">
        <v-btn  block :elevation="hover ? 12 : 2" :class="{ 'on-hover': hover }" v-bind:value="player.name">
          {{ player.name }}
        </v-btn>
      </v-hover>
    </v-btn-toggle>
    <p/>
    <v-chip outlined v-for="name in this.selectedParty" :key="name">{{ name }}</v-chip>
    <p/>
    <v-btn :disabled="selectedParty.length > partySize || selectedParty.length < partySize"
           x-large v-on:click="btnPressPartySubmit">Submit</v-btn>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'PartySelect',
  data: function() {
    return {
      partySize: 2,
      selectedParty: [],
      testRoom: [
        {
          name: "Tyler",
          character: "Merlin"
        },
        {
          name: "Anna",
          chracter: "Mordred"
        },
        {
          name: "David",
          chracter: "Percival"
        },
        {
          name: "Mark",
          chracter: "Agent of Good"
        },
        {
          name: "Ivan",
          chracter: "Assassin"
        }
      ]
    };
  },
  computed: {
  },
  methods: {
    btnPressPartySubmit: function(event) {
      this.$socket.emit('btnPressPartySubmit', {
        // TODO
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
