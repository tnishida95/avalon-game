<template>
  <div id="app">
    <Header v-bind:headerText="headerText"/>
    <!-- <MainMenu/> -->
    <component v-on:btnPressNewGame="btnPressNewGame" v-bind:is="currentView"/>
    <Footer/>
  </div>
</template>

<script>
import MainMenu from './components/MainMenu';
import Lobby from './components/Lobby';
import Header from './components/Header';
import Footer from './components/Footer';
// import Game from './components/Game';

export default {
  name: 'App',
  components: {
    Header,
    MainMenu,
    Lobby,
    Footer
    // Game
  },
  data: function() {
    return {
      currentView: "MainMenu",
      headerText: "Welcome to Avalon!",
      roomNum: ""
    };
  },
  methods: {
    btnPressNewGame: function(name) {
      console.log('gottem');
      this.currentView = 'Lobby';
      this.headerText = 'Room #';
    },
    listenLoadLobby: function() {
      // TODO: separate this function into loadHostLobby and loadGuestLobby
      this.$socket.on('loadLobby', (data) => {
        console.log(`Received [loadLobby] with room #[${data.roomNum}]`);
        this.roomNum = data.roomNum;
        this.headerText = `Room #${data.roomNum}`;
      });
    }
  },
  beforeMount() {
    this.listenLoadLobby();
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
