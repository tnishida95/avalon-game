<template>
  <div id="lobby" class="text-center">
    <div class="btn-group btn-group-lg" role="group">
      <button type="button" class="btn btn-default" v-on:click="btnPressStartGame">Start Game</button>
      <button type="button" class="btn btn-default" v-on:click="btnPressDisbandGame">Disband Game</button>
      <button type="button" class="btn btn-default" data-toggle="collapse" data-target="#rulesContent">Rules</button>
    </div>
    <h6>{{ messageToHost }}</h6>
    <hr>
    <h3>Optional Special Characters</h3>
    <input type="checkbox" id="percival" value="percival" v-model="checkedChars">
    <label for="percival">Percival</label>
    <input type="checkbox" id="morgana" value="morgana" v-model="checkedChars">
    <label for="morgana">Morgana</label>
    <input type="checkbox" id="mordred" value="mordred" v-model="checkedChars">
    <label for="mordred">Mordred</label>
    <input type="checkbox" id="oberon" value="oberon" v-model="checkedChars">
    <label for="oberon">Oberon</label>
    <hr>
    <div id="currentParty">
      <span>Characters Selected: {{ prettyCheckedChars }}</span>
      <br>
      <span>{{ prettyLobbyStr }}</span>
    </div>
    <hr>
  </div>
</template>

<script>
export default {
  name: 'HostLobby',
  data: function() {
    return {
      checkedChars: [],
      messageToHost: "You are the host."
    };
  },
  computed: {
    prettyCheckedChars: function() {
      let pretty = "";
      if(this.checkedChars.length === 0) {
        return "none";
      }
      for(const character in this.checkedChars) {
        pretty += `[${this.checkedChars[character].toUpperCase()}]`;
      }
      return pretty;
    },
    prettyLobbyStr: function() {
      let lobbyStr = "Lobby Members: ";
      for(let i = 0; i < this.room.length; i++) {
        lobbyStr += `[${this.room[i].name}]`;
      }
      lobbyStr += ' - ';
      if(this.room.length < 5) {lobbyStr += `Need at least ${5 - this.room.length} more player(s).`;}
      else if (this.room.length === 5) {lobbyStr += 'There will be 3 Good and 2 Evil.';}
      else if (this.room.length === 6) {lobbyStr += 'There will be 4 Good and 2 Evil.';}
      else if (this.room.length === 7) {lobbyStr += 'There will be 4 Good and 3 Evil.';}
      else if (this.room.length === 8) {lobbyStr += 'There will be 5 Good and 3 Evil.';}
      else if (this.room.length === 9) {lobbyStr += 'There will be 6 Good and 3 Evil.';}
      else if (this.room.length === 10) {lobbyStr += 'There will be 6 Good and 4 Evil.';}
      else {lobbyStr += `There are too many players.`;}
      return lobbyStr;
    }
  },
  props: {
    room: Array,
    roomNum: String
  },
  methods: {
    btnPressDisbandGame: function(event) {
      this.$socket.emit('btnPressDisbandGame', {
        roomNum: this.roomNum
      });
      this.$emit('btnPressDisbandGame');
    },
    btnPressStartGame: function(event) {
      this.$socket.emit('btnPressStartGame', {
        charList: this.checkedChars,
        roomNum: this.roomNum
      });
    },
    listenInvalidCharacterSelect: function() {
      this.$socket.on('invalidCharacterSelect', (data) => {
        this.messageToHost = data.message;
      });
    }
  },
  beforeMount() {
    this.listenInvalidCharacterSelect();
  }
};
</script>

<style>
</style>
