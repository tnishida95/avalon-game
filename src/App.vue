<template>
  <v-app id="app">
    <v-container style="max-width: 1000px;">
      <Header v-bind:headerText="headerText"/>
      <component v-bind:is="currentView"
                 v-bind:snackbar="snackbar"
                 v-bind:rejoinActionApp="this.rejoinActionApp"/>
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
  computed: {
    room() {
      return this.$store.state.room;
    },
    roomNum() {
      return this.$store.state.roomNum;
    }
  },
  data: function() {
    return {
      currentView: "MainMenu",
      headerText: "Welcome to Avalon!",
      snackbar: false,
      snackbarText: "Oops, something went wrong.",
      rejoinActionApp: 'Pregame'
    };
  },
  methods: {
    listenUpdateLobby: function() {
      this.$socket.on('updateLobby', (data) => {
        this.$store.commit('setRoomNum', data.roomNum);
        this.headerText = `Room #${data.roomNum}`;
        this.$store.commit('setRoom', data.room);
        if(this.$socket.id == data.room[0].sid) {
          this.currentView = 'HostLobby';
        }
        else {
          this.currentView = 'GuestLobby';
        }
        document.title = `Avalon - #${data.roomNum}`;
      });
    },
    listenLoadMainMenu: function() {
      this.$socket.on('loadMainMenu', (data) => {
        this.$store.commit('setRoom', []);
        this.$store.commit('setRoomNum', -1);
        this.$store.commit('setSelf', {});
        this.$store.commit('setWaitingOnList', []);
        this.$store.commit('setGame', {});
        this.$store.commit('setCharacterSelections', []);
        this.headerText = "Welcome to Avalon!";
        this.currentView = 'MainMenu';
        document.title = 'Avalon';
      });
    },
    listenLoadGame: function() {
      this.$socket.on('loadGame', (data) => {
        this.$store.commit('setRoom', data.room);
        this.$store.commit('setSelf', data.self);
        this.$store.commit('setWaitingOnList', data.waitingOnList);
        this.$store.commit('setGame', data.game);
        this.$store.commit('setCharacterSelections', data.characterSelections);
        this.currentView = 'Game';
      });
    },
    listenError: function() {
      this.$socket.on('error', (data) => {
        this.snackbar = true;
        this.snackbarText = data.message;
      });
    },
    listenRejoinGame: function() {
      this.$socket.on('rejoinGame', (data) => {
        this.$store.commit('setRoom', data.room);
        this.$store.commit('setRoomNum', data.roomNum);
        this.$store.commit('setSelf', data.self);
        this.$store.commit('setWaitingOnList', data.waitingOnList);
        this.$store.commit('setGame', data.game);
        const game = this.$store.state.game;
        const room = this.$store.state.room;
        const self = this.$store.state.self;
        const phase = this.$store.state.game.phase;

        let roomSpot = -1;
        for(let i = 0; i < room.length; i++) {
          if(room[i].name === self.name) {
            roomSpot = i;
            break;
          }
        }

        this.currentView = 'Game';
        // need to render the right Action component
        // did the player already take action?  are they supposed to be waiting instead?
        if(phase === 0 || phase === 3 || phase === 6 || phase === 9 || phase === 12) {
          // if player is the party leader
          if(room[game.partyLeader].name === self.name) {
            this.rejoinActionApp = 'PartySelect';
            return;
          }
        }
        else if(phase === 1 || phase === 4 || phase === 7 || phase === 10 || phase === 13) {
          // if the player didn't vote yet
          if(game.votes[roomSpot] === 0) {
            this.rejoinActionApp = 'PartyApproval';
            return;
          }
        }
        else if(phase === 2 || phase === 5 || phase === 8 || phase === 11 || phase === 14) {
          // if the player is on the quest and did not quest yet
          if(game.selectedParty.includes(roomSpot) && game.partyActions[roomSpot] === 0) {
            this.rejoinActionApp = 'Questing';
            return;
          }
        }
        else {
          // if the player is the Assassin
          if(self.character === 'Assassin') {
            this.rejoinActionApp = 'Assassin';
            return;
          }
        }
        this.rejoinActionApp = 'Waiting';
      });
    }
  },
  beforeMount() {
    this.listenUpdateLobby();
    this.listenLoadMainMenu();
    this.listenLoadGame();
    this.listenError();
    this.listenRejoinGame();
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
