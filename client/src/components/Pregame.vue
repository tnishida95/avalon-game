<template>
  <div id="pregame" class="text-center">
    <h3>Game Starting!</h3>
    <h4>You are: <strong>Merlin</strong></h4>
    <h5>See Evil players, but lose game if killed by Assassin.</h5>
    <h5>Mordred cannot be seen.</h5>
    <h4>Special Characters:</h4>
    <h5>(Evil) <strong>Assassin</strong>: Attempts to kill Merlin at the end of the game.</h5>
    <h5>(Good) <strong>Percival</strong>: Can see Merlin.</h5>
    <div class="container-fluid">
      <button type="button" class="btn btn-default btn-lg col-xs-12">Ready</button>
    </div>
    <h2>Show player board div here.</h2>
    <hr>
  </div>
</template>

<script>
export default {
  name: 'Pregame',
};
</script>

<style>
</style>
