<template>
  <div id="mainMenu" class="text-center">
    <v-form class="px-10">
      <v-text-field label="Name" v-model="nameInput"></v-text-field>
      <v-text-field label="Room Number" v-model="roomNumInput"></v-text-field>
    </v-form>
    <v-btn v-bind:disabled="snackbar" x-large v-on:click="btnPressNewGame">New Game</v-btn>
    <v-btn v-bind:disabled="snackbar" x-large v-on:click="btnPressJoinGame">Join Game</v-btn>
    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn x-large v-bind="attrs" v-on="on" v-on:click="btnPressSeeLobbies">See Lobbies</v-btn>
      </template>
      <v-list>
        <v-list-item v-for="(lobby, index) in lobbies" :key="index">
          <v-list-item-title v-on:click="btnPressJoinFromList">
            #{{ lobby.roomNum }}: {{ lobby.size }} players
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'MainMenu',
  data: function() {
    return {
      nameInput: "",
      roomNumInput: "",
      lobbies: []
    };
  },
  methods: {
    btnPressNewGame: function(event) {
      this.$socket.emit('btnPressNewGame', {
        name: this.nameInput
      });
    },
    btnPressJoinGame: function(event) {
      this.$socket.emit('btnPressJoinGame', {
        name: this.nameInput,
        roomNum: this.roomNumInput
      });
    },
    btnPressSeeLobbies: function(event) {
      this.$socket.emit('btnPressSeeLobbies');
    },
    btnPressJoinFromList: function(event) {
      // TODO: going to want a more elegant solution than this...
      const lobbyText = event.target.innerHTML;
      const roomNumInput = lobbyText.substring(lobbyText.lastIndexOf("#") + 1, lobbyText.lastIndexOf(":"));
      this.$socket.emit('btnPressJoinGame', {
        name: this.nameInput,
        roomNum: roomNumInput
      });
    },
    listenLobbies: function() {
      this.$socket.on('lobbies', (data) => {
        this.lobbies = data.lobbies;
      });
    }
  },
  beforeMount() {
    this.listenLobbies();
  },
  props: {
    snackbar: Boolean
  }
};
</script>

<style>
#topText {
    text-align: center;
}

#nameInput,
#roomInput {
    text-align: center;
    height: auto;
    width: 40%;
    outline-width: 0px;
    outline-style: solid;
}

#footer {
    text-align: center;
}
</style>
