<template>
  <div id="lobby" class="text-center">
    <div class="btn-group btn-group-lg" role="group">
      <button type="button" class="btn btn-default" data-toggle="collapse" data-target="#invalidCharacterSelectContent" onclick="btnPressStartGame()">Start Game</button>
      <button type="button" class="btn btn-default" v-on:click="btnPressDisbandGame">Disband Game</button>
      <button type="button" class="btn btn-default" data-toggle="collapse" data-target="#rulesContent">Rules</button>
    </div>
    <h6 id="invalidCharacterSelectContent" class="collapse">Invalid character selection.</h6>
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
      <hr>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HostLobby',
  data: function() {
    return {
      checkedChars: [],
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
    btnPressDisbandGame: function(event) {
      this.$socket.emit('btnPressDisbandGame', {
        roomNum: this.roomNum
      });
      this.$emit('btnPressDisbandGame');
    },
    btnPressStartGame: function(event) {

    },
  }
};
</script>

<style>
</style>
