<template>
  <div id="mainMenu" class="text-center">
    <v-form class="px-10">
      <v-text-field label="Name" v-model="nameInput"></v-text-field>
      <v-text-field label="Room Number" v-model="roomNumInput"></v-text-field>
    </v-form>
    <v-btn v-bind:disabled="snackbar" x-large v-on:click="btnPressNewGame">New Game</v-btn>
    <v-btn v-bind:disabled="snackbar" x-large v-on:click="btnPressJoinGame">Join Game</v-btn>
    <v-divider/>
  </div>
</template>

<script>
export default {
  name: 'MainMenu',
  data: function() {
    return {
      nameInput: "",
      roomNumInput: ""
    };
  },
  methods: {
    btnPressNewGame: function(event) {
      this.$socket.emit('btnPressNewGame', {
        name: this.nameInput
      });
      this.$emit('btnPressToLobby', this.nameInput, "new");
    },
    btnPressJoinGame: function(event) {
      this.$socket.emit('btnPressJoinGame', {
        name: this.nameInput,
        roomNum: this.roomNumInput
      });
      this.$emit('btnPressToLobby', this.nameInput, this.roomNumInput);
    }
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
