<template>
  <div id="lobby" class="text-center">
      <v-btn x-large v-on:click="btnPressStartGame">Start Game</v-btn>
      <v-btn x-large v-on:click="btnPressDisbandGame">Disband Game</v-btn>
    <v-divider/>
    <h3>Special Characters</h3>
    <v-container>
      <v-row class="justify-center">
        <v-col cols="4">
          <v-checkbox input-value="true" readonly label="Merlin" color="blue" hint="Sees Evil." persistent-hint></v-checkbox>
          <v-checkbox v-model="checkedChars" label="Percival" value="percival" color="blue" hint="Sees Merlin." persistent-hint></v-checkbox>
        </v-col>
          <v-col cols="4">
          <v-checkbox input-value="true" readonly label="Assassin" color="red" hint="Tries to kill Merlin." persistent-hint></v-checkbox>
          <v-checkbox v-model="checkedChars" label="Morgana" value="morgana" color="red" hint="Masquerades as Merlin." persistent-hint></v-checkbox>
        </v-col>
        <v-col cols="4">
          <v-checkbox v-model="checkedChars" label="Mordred" value="mordred" color="red" hint="Unseen by Merlin." persistent-hint></v-checkbox>
          <v-checkbox v-model="checkedChars" label="Oberon" value="oberon" color="red" hint="Unseen by Evil, Evil unseen to him." persistent-hint></v-checkbox>
        </v-col>
      </v-row>
    </v-container>
    <v-divider/>
    <h3>Lobby Members: {{ room.length }}</h3>
    <p>{{ lobbySizeStr }}</p>
    <v-chip outlined v-for="player in room" :key="player.name">{{ player.name }}</v-chip>
    <v-divider/>
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
    room() {
      return this.$store.state.room;
    },
    lobbySizeStr: function() {
      let lobbyStr = "";
      const room = this.$store.state.room;
      if (room.length < 5) {lobbyStr = `Need at least ${5 - room.length} more player(s).`;}
      else if (room.length === 5) {lobbyStr = 'There will be 3 Good and 2 Evil.';}
      else if (room.length === 6) {lobbyStr = 'There will be 4 Good and 2 Evil.';}
      else if (room.length === 7) {lobbyStr = 'There will be 4 Good and 3 Evil.';}
      else if (room.length === 8) {lobbyStr = 'There will be 5 Good and 3 Evil.';}
      else if (room.length === 9) {lobbyStr = 'There will be 6 Good and 3 Evil.';}
      else if (room.length === 10) {lobbyStr = 'There will be 6 Good and 4 Evil.';}
      else {lobbyStr = `There are too many players.`;}
      return lobbyStr;
    }
  },
  methods: {
    btnPressDisbandGame: function(event) {
      this.$socket.emit('btnPressDisbandGame', {
        roomNum: this.$store.state.roomNum
      });
      this.$emit('btnPressDisbandGame');
    },
    btnPressStartGame: function(event) {
      this.$socket.emit('btnPressStartGame', {
        charList: this.checkedChars,
        roomNum: this.$store.state.roomNum
      });
    }
  }
};
</script>

<style>
</style>
