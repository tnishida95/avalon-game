<template>
  <div>
    <BoardView/>
    <ActionView/>
    <PlayerView/>
  </div>
</template>

<script>
import BoardView from './BoardView';
import ActionView from './ActionView';
import PlayerView from './PlayerView';

export default {
  name: 'Game',
  components: {
    BoardView,
    ActionView,
    PlayerView
  }
};
</script>

<style>
</style>
