<template>
  <div class="text-center">
    <h3>Party Approval</h3>
    <h4><strong>{{ leaderName }}</strong> selected:</h4>
    <span>
      <v-chip outlined v-for="name in party" :key="name">{{ name }}</v-chip>
    </span>
    <p/>
    <v-btn x-large v-on:click="btnPressApprove" v-if="!isDone">Approve</v-btn>
    <p/>
    <v-btn x-large v-on:click="btnPressReject" v-if="!isDone">Reject</v-btn>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'PartyApproval',
  data: function() {
    return {
      isDone: false
    };
  },
  computed: {
    self() {
      return this.$store.state.self;
    },
    leaderName() {
      return this.$store.state.room[this.$store.state.game.partyLeader].name;
    },
    party() {
      const party = [];
      const game = this.$store.state.game;
      for(let i = 0; i < game.selectedParty.length; i++) {
        if(game.selectedParty[i] === -1) {
          break;
        }
        // this is kind of ugly, and a reason to redo the selectedParty system
        //   maybe just use the player names?
        party.push(this.$store.state.room[game.selectedParty[i]].name);
      }
      return party;
    }
  },
  methods: {
    btnPressApprove: function(event) {
      this.isDone = true;
      this.$socket.emit('btnPressPartyApproval', {
        roomNum: this.$store.state.roomNum,
        vote: 1,
        self: this.$store.state.self
      });
    },
    btnPressReject: function(event) {
      this.isDone = true;
      this.$socket.emit('btnPressPartyApproval', {
        roomNum: this.$store.state.roomNum,
        vote: 2,
        self: this.$store.state.self
      });
    },
  }
};
</script>

<style>
.v-btn {
  flex-direction: column;
  width: 80%;
}
</style>
