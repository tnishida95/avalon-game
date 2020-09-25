<template>
  <div class="text-center">
    <h3>Select the party:</h3>
    <v-btn-toggle multiple v-bind:max="partySize" v-model="selectedParty" style="flex-direction: column;">
      <v-btn v-bind:value="player.name" outlined block v-for="player in this.testRoom" :key="player.name">
        {{ player.name }}
      </v-btn>
    </v-btn-toggle>
    <p>Selected: {{ selectedParty }}</p>
  </div>
</template>

<script>
export default {
  name: 'PartySelect',
  data: function() {
    return {
      partySize: 6,
      selectedParty: [],
      testRoom: [
        {
          name: "Tyler",
          character: "Merlin"
        },
        {
          name: "Anna",
          chracter: "Mordred"
        }
      ]
    };
  },
  computed: {
  },
  methods: {
    btnPressPartySubmit: function(event) {

    },
  },
  props: {
    room: Array,
    roomNum: String
  }
};
</script>

<style>
v-btn-toggle {
  flex-direction: column;
}
v-btn {
  border-width: 1px;
}
</style>
