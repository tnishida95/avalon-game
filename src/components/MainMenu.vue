<template>
  <div id="MainMenu">
    <h2 id="topText">Welcome to Avalon!</h2>
    <hr>
    <div id="inputArea" class="text-center">
      <input type="text" id="nameInput" maxlength="20" spellcheck="false" placeholder="Your Name">
      <p></p>
      <input type="text" id="roomInput" maxlength="20" spellcheck="false" placeholder="Room Number" data-toggle="collapse" data-target="#roomNumNotifyContent">
      <h6 id="roomNumNotifyContent" class="collapse">No Room # needed if not trying to join.</h6>
      <hr>
    </div>
    <div class="container">
      <div class="row">
        <button type="button" class="btn btn-default btn-lg col-xs-12 col-sm-4" onclick="btnPressNewGame()">New Game</button>
        <button type="button" class="btn btn-default btn-lg col-xs-12 col-sm-4" onclick="btnPressJoinGame()">Join Game</button>
        <button type="button" class="btn btn-default btn-lg col-xs-12 col-sm-4" data-toggle="collapse" data-target="#rulesContent">Rules</button>
      </div>
    </div>
    <hr>

    <!-- class="collapse in" for expanded by default -->
    <div id="rulesContent" class="collapse">
      <div class="well rules-well">
        <h3>Overview</h3>
        <p>All players are randomly assigned a character. This character is either on the side of Good or the side of Evil, and may have a special ability that affects the game in some way.  Agents of Evil are told who the other Evil players are.  All players are candidates to go on quests.  The side of Good wishes to complete three quests successfully, and Evil wishes three quests to fail.  Merlin has knowledge of the agents of Evil, and must try to guide Good to approve only Good players on the questing party.  But he must hide his identity; the Assassin has a chance to kill Merlin at the end of the game.  If she successfully kills Merlin, Evil wins instead.</p>
        <h4>Selection Phase</h4>
        <p>At the start of each round, the current party leader proposes a set of players who will go on the quest.  The size of the party is predetermined, decided by the number of players and the quest.  All players are free to talk during this phase to convince others of their suspicions or state who they would like to be on the party.  For Good, it is critical no Evil players make it onto the quest.</p>
        <h4>Voting Phase</h4>
        <p>Once an official decision is made, further discussion can take place before it is voted on.  If a majority of players reject the party, a different player is assigned the role of party leader and players are reselected.  If five parties are rejected within a single voting phase, Good foreits the game.  If the majority approves the party, the game continues the questing phase.</p>
        <h4>Questing Phase</h4>
        <p>Once a majority agrees on a party, that party will go on the quest.  Agents of Good can only help it succeed, but agents of Evil can choose to contribute to its success or fail the quest.  Only one fail action is neccessary for the quest to fail.  Once every player has selected an action, the actions are revealed but not associated with the acting player.  After, the party is disbanded and the game returns to the selection phase of a new quest.</p>
        <h4>Game End</h4>
        <p>Questing ends when three quests have succeeded or three quests have failed.  If the latter occurs, Evil wins and the game is over.  If the former occurs, the Assassin will select an agent of Good.  If that player is Merlin, Evil wins despite the results of the quests.</p>
        <hr>
        <h3>Good and Evil Numbers</h3>
        <table class="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Players</th>
              <th>5</th>
              <th>6</th>
              <th>7</th>
              <th>8</th>
              <th>9</th>
              <th>10</th>
            </tr>
          </thead>
          <tr>
            <td>Good</td>
            <td>3</td>
            <td>4</td>
            <td>4</td>
            <td>5</td>
            <td>6</td>
            <td>6</td>
          </tr>
          <tr>
            <td>Evil</td>
            <td>2</td>
            <td>2</td>
            <td>3</td>
            <td>3</td>
            <td>3</td>
            <td>4</td>
          </tr>
        </table>
        <hr>
        <h3>Quests and Party Sizes</h3>
        <table class="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Players</th>
              <th>5</th>
              <th>6</th>
              <th>7</th>
              <th>8</th>
              <th>9</th>
              <th>10</th>
            </tr>
          </thead>
          <tr>
            <td>1st Quest</td>
            <td>2</td>
            <td>2</td>
            <td>2</td>
            <td>3</td>
            <td>3</td>
            <td>3</td>
          </tr>
          <tr>
            <td>2nd Quest</td>
            <td>3</td>
            <td>3</td>
            <td>3</td>
            <td>4</td>
            <td>4</td>
            <td>4</td>
          </tr>
          <tr>
            <td>3rd Quest</td>
            <td>2</td>
            <td>4</td>
            <td>3</td>
            <td>4</td>
            <td>4</td>
            <td>4</td>
          </tr>
          <tr>
            <td>4th Quest</td>
            <td>3</td>
            <td>3</td>
            <td>4*</td>
            <td>5*</td>
            <td>5*</td>
            <td>5*</td>
          </tr>
          <tr>
            <td>5th Quest</td>
            <td>3</td>
            <td>4</td>
            <td>4</td>
            <td>5</td>
            <td>5</td>
            <td>5</td>
          </tr>
        </table>
        <h4></h4>
        <p>* Requires 2 or more Fails to fail the quest.</p>
        <hr>
        <h3>Good Special Characters</h3>
        <h4>Merlin</h4>
        <p>Sees all agents of Evil, except for Mordred.  If killed by the Assassin at the end of a game, Evil wins.</p>
        <h4>Percival</h4>
        <p>Sees Merlin.  If Morgana is also in play, Percival will see both but not who is who.</p>
        <h3>Evil Special Characters</h3>
        <h4>Assassin</h4>
        <p>If Good succeeds in three quests, the Assassin chooses an agent of Good to kill.  If Merlin is chosen, Evil wins.</p>
        <h4>Mordred</h4>
        <p>Unseen by Merlin.  Mordred's player will not be revealed as an agent of Evil to Merlin.</p>
        <h4>Oberon</h4>
        <p>Unseen by agents of Evil, and does not see agents of Evil.  Oberon does not know who the Evil players are, and the Evil players do not know he is Evil.</p>
        <h4>Morgana</h4>
        <p>Appears as Merlin to Percival.  Percival will see both Merlin and Morgana, but not know which player is actually Merlin.</p>
      </div>
      <hr>
    </div> <!-- rulesContent -->

    <div id="footer">
      <span>Tyler Nishida | Based on "The Resistance: Avalon" board game by Don Eskridge and published by Indie Boards & Cards | Not endorsed by or affiliated with designer or publisher | <a href="https://github.com/tnishida95/avalon-game">GitHub</a></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainMenu'
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
