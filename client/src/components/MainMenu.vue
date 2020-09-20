<template>
  <div id="MainMenu">
    <h2 id="topText">Welcome to Avalon!</h2>
    <hr>
    <div id="inputArea" class="text-center">
      <input v-model="name" type="text" id="nameInput" maxlength="20" spellcheck="false" placeholder="Your Name">
      <p></p>
      <input v-model="room" type="text" id="roomInput" maxlength="20" spellcheck="false" placeholder="Room Number" data-toggle="collapse" data-target="#roomNumNotifyContent">
      <h6 id="roomNumNotifyContent" class="collapse">No Room # needed if not trying to join.</h6>
      <hr>
    </div>
    <div class="container">
      <div class="row">
        <button type="button" class="btn btn-default btn-lg col-xs-12 col-sm-4" v-on:click="btnPressNewGame">New Game</button>
        <button type="button" class="btn btn-default btn-lg col-xs-12 col-sm-4" onclick="btnPressJoinGame()">Join Game</button>
        <button type="button" class="btn btn-default btn-lg col-xs-12 col-sm-4" data-toggle="collapse" data-target="#rulesContent">Rules</button>
      </div>
    </div>
    <hr>

  <Rules/>

    <div id="footer">
      <span>Tyler Nishida | Based on "The Resistance: Avalon" board game by Don Eskridge and published by Indie Boards & Cards | Not endorsed by or affiliated with designer or publisher | <a href="https://github.com/tnishida95/avalon-game">GitHub</a></span>
    </div>
  </div>
</template>

<script>
import Rules from './Rules';

export default {
  name: 'MainMenu',
  components: {
    Rules
  },
  data: function() {
    return {
      name: "",
      room: ""
    };
  },
  methods: {
    btnPressNewGame: function(event) {
      this.$socket.emit('btnPressNewGame', {
        name: this.name
      });
      // TODO: now, pass event up to the App component and replace MainMenu with Lobby
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
