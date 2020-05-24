<template>
  <div id="app">
    <MainMenu/>
  </div>
</template>

<script>
import MainMenu from './components/MainMenu';
// import Lobby from './components/Lobby';
// import Game from './components/Game'

export default {
  name: 'App',
  components: {
    MainMenu
    // Lobby,
    // Game
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
