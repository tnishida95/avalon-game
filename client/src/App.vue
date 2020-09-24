<template>
  <v-app id="app">
    <v-container style="max-width: 1000px;">
      <Header v-bind:headerText="headerText"/>
      <component v-bind:is="currentView"
                 v-bind:room="room"
                 v-bind:roomNum="roomNum"
                 v-bind:self="self"
                 v-bind:waitingOnList="waitingOnList"
                 v-bind:snackbar="snackbar"/>
      <Rules/>
      <Footer/>
    </v-container>
    <v-snackbar top v-model="snackbar" timeout="2000">
      {{ snackbarText }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import Header from './components/Header';
import MainMenu from './components/MainMenu';
import HostLobby from './components/HostLobby';
import GuestLobby from './components/GuestLobby';
import Rules from './components/Rules';
import Footer from './components/Footer';
import Game from './components/game/Game';

export default {
  name: 'App',
  components: {
    Header,
    MainMenu,
    HostLobby,
    GuestLobby,
    Game,
    Rules,
    Footer
  },
  data: function() {
    return {
      currentView: "MainMenu",
      headerText: "Welcome to Avalon!",
      roomNum: "",
      room: [],
      self: {},
      waitingOnList: [],
      snackbar: false,
      snackbarText: "Oops, something went wrong."
    };
  },
  methods: {
    listenUpdateLobby: function() {
      this.$socket.on('updateLobby', (data) => {
        this.roomNum = data.roomNum;
        this.headerText = `Room #${data.roomNum}`;
        this.room = data.room;
        if(this.$socket.id == this.room[0].sid) {
          this.currentView = 'HostLobby';
        }
        else {
          this.currentView = 'GuestLobby';
        }
        document.title = `Avalon - #${this.roomNum}`;
      });
    },
    listenLoadMainMenu: function() {
      this.$socket.on('loadMainMenu', (data) => {
        this.roomNum = -1;
        this.headerText = "Welcome to Avalon!";
        this.currentView = 'MainMenu';
      });
    },
    listenLoadGame: function() {
      this.$socket.on('loadGame', (data) => {
        this.room = data.room;
        this.self = data.self;
        this.waitingOnList = data.waitingOnList;
        this.currentView = 'Game';
      });
    },
    listenError: function() {
      this.$socket.on('error', (data) => {
        this.snackbar = true;
        this.snackbarText = data.message;
      });
    }
  },
  beforeMount() {
    this.listenUpdateLobby();
    this.listenLoadMainMenu();
    this.listenLoadGame();
    this.listenError();
  }
};
</script>

<style>
#app {
    font-family: "Amethysta";
}

.btn-default {
    border-radius: 0px !important;
}

.btn-group {
    box-shadow: none !important;
}

.well {
    background: none !important;
}

.rules-well {
    height: 500px;
    overflow: scroll;
}

.quest-tile {
    background: white !important;
    box-shadow: none !important;
}

.waiting-button {
    width: 82.5%;
    height: 80px;
}

.good-blue {
  background-color: #C8C8FF !important;
}

.evil-red {
  background-color: #FFC8C8 !important;
}

</style>
