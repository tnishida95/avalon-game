<template>
  <div id="mainMenu">
    <div id="inputArea" class="text-center">
      <input v-model="name" type="text" id="nameInput" maxlength="20" spellcheck="false" placeholder="Your Name">
      <p></p>
      <input v-model="roomNum" type="number" id="roomInput" maxlength="20" spellcheck="false" placeholder="Room Number" data-toggle="collapse" data-target="#roomNumNotifyContent">
      <h6 id="roomNumNotifyContent" class="collapse">No Room # needed if not trying to join.</h6>
      <hr>
    </div>
    <div class="container">
      <div class="row">
        <button type="button" class="btn btn-default btn-lg col-xs-12 col-sm-4" v-on:click="btnPressNewGame">New Game</button>
        <button type="button" class="btn btn-default btn-lg col-xs-12 col-sm-4" v-on:click="btnPressJoinGame">Join Game</button>
        <button type="button" class="btn btn-default btn-lg col-xs-12 col-sm-4" data-toggle="collapse" data-target="#rulesContent">Rules</button>
      </div>
    </div>
    <hr>
  </div>
</template>

<script>
export default {
  name: 'MainMenu',
  components: {
  },
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
