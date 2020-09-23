<template>
  <div id="lobby" class="text-center">
    <v-btn x-large>Waiting...</v-btn>
    <v-btn x-large v-on:click="btnPressLeaveGame">Leave Game</v-btn>
    <h3>Waiting for host to start the game.</h3>
    <v-divider/>
    <h3>Lobby Members: {{ this.room.length }}</h3>
    <p>{{ lobbySizeStr }}</p>
    <v-chip outlined v-for="player in this.room" :key="player.name">{{ player.name }}</v-chip>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'GuestLobby',
  computed: {
    lobbySizeStr: function() {
      let lobbyStr = "";
      if (this.room.length < 5) {lobbyStr = `Need at least ${5 - this.room.length} more player(s).`;}
      else if (this.room.length === 5) {lobbyStr = 'There will be 3 Good and 2 Evil.';}
      else if (this.room.length === 6) {lobbyStr = 'There will be 4 Good and 2 Evil.';}
      else if (this.room.length === 7) {lobbyStr = 'There will be 4 Good and 3 Evil.';}
      else if (this.room.length === 8) {lobbyStr = 'There will be 5 Good and 3 Evil.';}
      else if (this.room.length === 9) {lobbyStr = 'There will be 6 Good and 3 Evil.';}
      else if (this.room.length === 10) {lobbyStr = 'There will be 6 Good and 4 Evil.';}
      else {lobbyStr = `There are too many players.`;}
      return lobbyStr;
    }
  },
  props: {
    room: Array,
    roomNum: String
  },
  methods: {
    btnPressLeaveGame: function(event) {
      this.$socket.emit('btnPressLeaveGame', {
        roomNum: this.roomNum
      });
    },
  }
};
</script>

<style>
</style>
