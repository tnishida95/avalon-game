<template>
  <div>
    <BoardView/>
    <ActionView/>
    <HistoryView/>
    <PlayerView/>
  </div>
</template>

<script>
import BoardView from './BoardView';
import ActionView from './ActionView';
import HistoryView from './HistoryView';
import PlayerView from './PlayerView';

export default {
  name: 'Game',
  components: {
    BoardView,
    ActionView,
    HistoryView,
    PlayerView
  },
  computed: {

  }
};
</script>

<style>
</style>
