<template>
  <v-app id="app">
    <v-container style="max-width: 1000px;">
      <Header v-bind:headerText="headerText"/>
      <component v-bind:is="currentView" v-bind:room="room" v-bind:roomNum="roomNum"/>
      <Rules/>
      <Footer/>
    </v-container>
  </v-app>
</template>

<script>
import Header from './components/Header';
import MainMenu from './components/MainMenu';
import HostLobby from './components/HostLobby';
import GuestLobby from './components/GuestLobby';
import Pregame from './components/Pregame';
import Rules from './components/Rules';
import Footer from './components/Footer';
// import Game from './components/Game';

export default {
  name: 'App',
  components: {
    Header,
    MainMenu,
    HostLobby,
    GuestLobby,
    Pregame,
    Rules,
    Footer
    // Game
  },
  data: function() {
    return {
      currentView: "MainMenu",
      headerText: "Welcome to Avalon!",
      roomNum: "",
      room: []
    };
  },
  methods: {
    listenLoadLobby: function() {
      this.$socket.on('updateLobby', (data) => {
        console.log(`Received [updateLobby] with room #[${data.roomNum}]`);
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
    }
  },
  beforeMount() {
    this.listenLoadLobby();
    this.listenLoadMainMenu();
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
