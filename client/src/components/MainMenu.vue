<template>
  <div id="mainMenu" class="text-center">
    <v-form class="px-10">
      <v-text-field label="Name" v-model="name"></v-text-field>
      <v-text-field label="Room Number" v-model="roomNum"></v-text-field>
    </v-form>
    <v-btn v-on:click="btnPressNewGame">New Game</v-btn>
    <v-btn v-on:click="btnPressJoinGame">Join Game</v-btn>
    <hr>
  </div>
</template>

<script>
export default {
  name: 'MainMenu',
  data: function() {
    return {
      name: "",
      roomNum: ""
    };
  },
  methods: {
    btnPressNewGame: function(event) {
      this.$socket.emit('btnPressNewGame', {
        name: this.name
      });
      this.$emit('btnPressToLobby', this.name, "new");
    },
    btnPressJoinGame: function(event) {
      this.$socket.emit('btnPressJoinGame', {
        name: this.name,
        roomNum: this.roomNum
      });
      this.$emit('btnPressToLobby', this.name, this.roomNum);
    }
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
