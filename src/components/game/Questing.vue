<template>
  <div class="text-center">
    <h3>Questing</h3>
    <h4>You were approved for the quest!</h4>
    <p/>
    <div v-if="!isDone">
      <v-btn x-large v-on:click="btnPressSuccess">Success</v-btn>
      <p/>
      <v-btn x-large v-on:click="btnPressSuccess" v-if="isGood">Success</v-btn>
      <v-btn x-large v-on:click="btnPressFail" v-else>Fail</v-btn>
    </div>
    <h3 v-if="isDone">Quested!</h3>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'Questing',
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
    isGood() {
      const character = this.$store.state.self.character;
      if(character === "Merlin" || character == "Percival" || character === "Agent of Good") {
        return true;
      }
      else {
        return false;
      }
    }
  },
  methods: {
    btnPressSuccess: function(event) {
      this.isDone = true;
      this.$socket.emit('btnPressQuestAction', {
        roomNum: this.$store.state.roomNum,
        questAction: 1,
        self: this.$store.state.self
      });
    },
    btnPressFail: function(event) {
      this.isDone = true;
      this.$socket.emit('btnPressQuestAction', {
        roomNum: this.$store.state.roomNum,
        questAction: 2,
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
