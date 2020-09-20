/* eslint-disable */
<template>
  <div>
  <div class="text-center">
    <div class="btn-group btn-group-lg" role="group">
          <button type="button" class="btn btn-default" data-toggle="collapse" data-target="#invalidCharacterSelectContent" onclick="btnPressStartGame()">Start Game</button>
          <button type="button" class="btn btn-default" onclick="btnPressDisbandGame()">Disband Game</button>
          <button type="button" class="btn btn-default" data-toggle="collapse" data-target="#rulesContent">Rules</button>
      </div>
      <h6 id="invalidCharacterSelectContent" class="collapse">Invalid character selection.</h6>
      <hr>
      <div class="btn-group-vertical" data-toggle="buttons">
          <label class="btn btn-default active">
              <input type="checkbox" autocomplete="off" name="charSelection" value="merlin" checked>Merlin
          </label>
          <label class="btn btn-default" aria-pressed="false">
              <input type="checkbox" autocomplete="off" name="charSelection" value="percival">Percival
          </label>
          <label class="btn btn-default active" aria-pressed="true">
              <input type="checkbox" autocomplete="off" name="charSelection" value="goodOne" checked>1st Servant of Arthur
          </label>
          <label class="btn btn-default active" aria-pressed="true">
              <input type="checkbox" autocomplete="off" name="charSelection" value="goodTwo" checked>2nd Servant of Arthur
          </label>
          <label class="btn btn-default" aria-pressed="false">
              <input type="checkbox" autocomplete="off" name="charSelection" value="goodThree">3rd Servant of Arthur
          </label>
          <label class="btn btn-default" aria-pressed="false">
              <input type="checkbox" autocomplete="off" name="charSelection" value="goodFour">4th Servant of Arthur
          </label>
          <label class="btn btn-default" aria-pressed="false">
              <input type="checkbox" autocomplete="off" name="charSelection" value="goodFive">5th Servant of Arthur
          </label>
      </div>
      <div class="btn-group-vertical" data-toggle="buttons">
          <label class="btn btn-default active" aria-pressed="true">
              <input type="checkbox" autocomplete="off" name="charSelection" value="assassin" checked>Assassin
          </label>
          <label class="btn btn-default" aria-pressed="false">
              <input type="checkbox" autocomplete="off" name="charSelection" value="morgana">Morgana
          </label>
          <label class="btn btn-default" aria-pressed="false">
              <input type="checkbox" autocomplete="off" name="charSelection" value="mordred">Mordred
          </label>
          <label class="btn btn-default" aria-pressed="false">
              <input type="checkbox" autocomplete="off" name="charSelection" value="oberon">Oberon
          </label>
          <label class="btn btn-default active" aria-pressed="true">
              <input type="checkbox" autocomplete="off" name="charSelection" value="evilOne" checked>1st Minion of Mordred
          </label>
          <label class="btn btn-default" aria-pressed="false">
              <input type="checkbox" autocomplete="off" name="charSelection" value="evilTwo">2nd Minion of Mordred
          </label>
          <label class="btn btn-default" aria-pressed="false">
              <input type="checkbox" autocomplete="off" name="charSelection" value="evilThree">3rd Minion of Modred
          </label>
      </div>
      <hr>
  </div>
  <div id="lobbyDiv"></div>
  </div>
</template>

<script>
export default {
  name: 'Lobby',
  methods: {
    btnPressDisbandGame: function(event) {

    },
    btnPressLeaveGame: function(event) {

    },
    btnPressStartGame: function(event) {

    },
  }
};
</script>

<style>
</style>
