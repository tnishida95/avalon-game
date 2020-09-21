<template>
  <div id="lobby" class="text-center">
    <div class="btn-group btn-group-lg" role="group">
      <button type="button" class="btn btn-default">Waiting...</button>
      <button type="button" class="btn btn-default" v-on:click="btnPressLeaveGame">Leave Game</button>
      <button type="button" class="btn btn-default" data-toggle="collapse" data-target="#rulesContent">Rules</button>
    </div>
    <h3>Waiting for host to start the game.</h3>
    <div id="currentParty">
      <span>{{ prettyLobbyStr }}</span>
      <hr>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuestLobby',
  computed: {
    prettyLobbyStr: function() {
      let members = "";
      for(let i = 0; i < this.room.length; i++) {
        members += `[${this.room[i].name}]`;
        console.log(`member: ${this.room[i].name}`);
      }
      return `Lobby Members: ${members}`;
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
      this.$emit('btnPressLeaveGame');
    },
  }
};
</script>

<style>
</style>
