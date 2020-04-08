// gameStrBuilder.js

const utils = require('./utils');

exports.buildHostLobbyStr = function() {
  return `<div class="text-center">
      <div class="btn-group btn-group-lg" role="group">
            <button type="button" class="btn btn-default" data-toggle="collapse" data-target="#invalidCharacterSelectContent" onclick="btnPressStartGame()">Start Game</button>
            <button type="button" class="btn btn-default" onclick="btnPressDisbandGame()">Disband Game</button>
            <button type="button" class="btn btn-default" data-toggle="collapse" data-target="#rulesContent">Rules</button>
        </div>
        <h6 id="invalidCharacterSelectContent" class="collapse">Invalid character selection.</h6>
        <hr>
        <div class="btn-group-vertical" data-toggle="buttons">
            <label class="btn btn-default active">
                <input type="checkbox" autocomplete="off" name="charSelection" value="merlin" checked>Merlin</input>
            </label>
            <label class="btn btn-default" aria-pressed="false">
                <input type="checkbox" autocomplete="off" name="charSelection" value="percival">Percival</input>
            </label>
            <label class="btn btn-default active" aria-pressed="true">
                <input type="checkbox" autocomplete="off" name="charSelection" value="goodOne" checked>1st Servant of Arthur</input>
            </label>
            <label class="btn btn-default active" aria-pressed="true">
                <input type="checkbox" autocomplete="off" name="charSelection" value="goodTwo" checked>2nd Servant of Arthur</input>
            </label>
            <label class="btn btn-default" aria-pressed="false">
                <input type="checkbox" autocomplete="off" name="charSelection" value="goodThree">3rd Servant of Arthur</input>
            </label>
            <label class="btn btn-default" aria-pressed="false">
                <input type="checkbox" autocomplete="off" name="charSelection" value="goodFour">4th Servant of Arthur</input>
            </label>
            <label class="btn btn-default" aria-pressed="false">
                <input type="checkbox" autocomplete="off" name="charSelection" value="goodFive">5th Servant of Arthur</input>
            </label>
        </div>
        <div class="btn-group-vertical" data-toggle="buttons">
            <label class="btn btn-default active" aria-pressed="true">
                <input type="checkbox" autocomplete="off" name="charSelection" value="assassin" checked>Assassin</input>
            </label>
            <label class="btn btn-default" aria-pressed="false">
                <input type="checkbox" autocomplete="off" name="charSelection" value="morgana">Morgana</input>
            </label>
            <label class="btn btn-default" aria-pressed="false">
                <input type="checkbox" autocomplete="off" name="charSelection" value="mordred">Mordred</input>
            </label>
            <label class="btn btn-default" aria-pressed="false">
                <input type="checkbox" autocomplete="off" name="charSelection" value="oberon">Oberon</input>
            </label>
            <label class="btn btn-default active" aria-pressed="true">
                <input type="checkbox" autocomplete="off" name="charSelection" value="evilOne" checked>1st Minion of Mordred</input>
            </label>
            <label class="btn btn-default" aria-pressed="false">
                <input type="checkbox" autocomplete="off" name="charSelection" value="evilTwo">2nd Minion of Mordred</input>
            </label>
            <label class="btn btn-default" aria-pressed="false">
                <input type="checkbox" autocomplete="off" name="charSelection" value="evilThree">3rd Minion of Modred</input>
            </label>
        </div>
        <hr>
    </div>
    <div id="lobbyDiv"></div>`;
};
exports.buildGuestLobbyStr = function() {
  return `<div class="text-center">
        <div class="btn-group btn-group-lg" role="group">
            <button type="button" class="btn btn-default">Waiting...</button>
            <button type="button" class="btn btn-default" onclick="btnPressLeaveGame()">Leave Game</button>
            <button type="button" class="btn btn-default" data-toggle="collapse" data-target="#rulesContent">Rules</button>
        </div>
        <p>Waiting for host to start the game.</p>
        <hr>
    </div>
    <div id="lobbyDiv"></div>`;
};

exports.buildFirstGameBoardStr = function(questSizeArray) {
  return `<div id="gameBoardDiv" class="text-center">
        <h2>Game Board</h2>
        <div class="well">
            <p>Quests</p>
            <button type="button" class="quest-tile btn-lg btn-default">${questSizeArray[0]}</button>
            <button type="button" class="quest-tile btn btn-default">${questSizeArray[1]}</button>
            <button type="button" class="quest-tile btn btn-default">${questSizeArray[2]}</button>
            <button type="button" class="quest-tile btn btn-default">${questSizeArray[3]}</button>
            <button type="button" class="quest-tile btn btn-default">${questSizeArray[4]}</button>
            <hr>
            <p id="rejectedDisplay">Rejected Parties: 0</p>
            <hr>
            <p id="currentPartyDisplay">Current party: none</p>
        </div>
        <hr>
    </div>`;
};
exports.buildFirstActionPanelStr = function() {
  return `<div id="actionPanelDiv" class="text-center">
        <h2>Actions</h2>
        <div class="well">
            <button type="button" class="btn btn-default waiting-button">Waiting...</button>
            <p></p>
        </div>
        <hr>
    </div>`;
};
exports.buildFirstPlayerBoardStr = function(character, playerList, charArray, goodNum, evilNum) {
  let currentName;
  let currentChar;
  let currentIdentity;
  let specialCharacters = '[Merlin][Assassin]';
  if(charArray[1] == 1) {specialCharacters += '[Percival]';}
  if(charArray[8] == 1) {specialCharacters += '[Morgana]';}
  if(charArray[9] == 1) {specialCharacters += '[Mordred]';}
  if(charArray[10] == 1) {specialCharacters += '[Oberon]';}
  let firstPlayerBoardStr = `<div id="playerBoardDiv" class="text-center">
    <h2 data-toggle="collapse" data-target="#playerBoardContent">Players</h2>
    <div id="playerBoardContent" class="collapse-in">
      <div class="well">
        <div class="container-fluid">`;
  for(let i = 0; i < playerList.length; i++) {
    currentName = playerList[i].name;
    currentChar = playerList[i].character;
    currentIdentity = "?";
    if(character == "merlin") {
      if(currentChar == "merlin") {
        currentIdentity = "Merlin";
      }
      else if(currentChar == "assassin" ||
              currentChar == "morgana" ||
              currentChar == "oberon" ||
              currentChar == "evilOne" ||
              currentChar == "evilTwo" ||
              currentChar == "evilThree") {
        currentIdentity = "EVIL";
      }
      else if(charArray[9] != 1) {
        // no mordred (if mordred, all others are "?")
        // TODO: pretty sure don't need the if() block here; test later
        if(currentChar == "percival" ||
           currentChar == "goodOne" ||
           currentChar == "goodTwo" ||
           currentChar == "goodThree" ||
           currentChar == "goodFour" ||
           currentChar == "goodFive") {
          currentIdentity = "GOOD";
        }
      }
    } // end merlin block
    else if(character == "percival") {
      if(currentChar == "percival") {
        currentIdentity = "Percival";
      }
      else if(charArray[8] == 1) {
        // morgana in game
        if( currentChar == "merlin" || currentChar == "morgana") {
          currentIdentity = 'Merlin/Morgana';
        }
      }
      else {
        // no morgana
        if(currentChar == "merlin") {
          currentIdentity = "Merlin";
        }
        else if(currentChar == "percival") {
          currentIdentity = "Percival";
        }
      }
    } // end of percival block
    else if(character == "goodOne" ||
            character == "goodTwo" ||
            character == "goodThree" ||
            character == "goodFour" ||
            character == "goodFive") {
      if(currentChar == character) {
        currentIdentity = "Servant of Good";
      }
    } // end of basic good block
    else if(character == "oberon") {
      if(currentChar == "oberon") {
        currentIdentity = "Oberon";
      }
    } // end of oberon block
    else { // non-Oberon Evil
      if(currentChar == "assassin") {
        currentIdentity = "Assassin";
      }
      else if(currentChar == "mordred") {
        currentIdentity = "Mordred";
      }
      else if(currentChar == "morgana") {
        currentIdentity = "Morgana";
      }
      else if(currentChar == "evilOne" ||
              currentChar == "evilTwo" ||
              currentChar == "evilThree") {
        currentIdentity = "Minion of Evil";
      }
      if(charArray[10] != 1) {
        // no oberon (if there is oberon, the rest are "?")
        if(currentChar == "merlin" ||
           currentChar == "percival" ||
           currentChar == "goodOne" ||
           currentChar == "goodTwo" ||
           currentChar == "goodThree" ||
           currentChar == "goodFour" ||
           currentChar == "goodFive") {
          currentIdentity = "GOOD";
        }
      }
    }
    if(character === currentChar) {
      firstPlayerBoardStr += `<div class="row">
                <button type="button" class="btn btn-default col-xs-5" style="font-weight: bold">${currentIdentity}</button>
                <button type="button" class="btn btn-default col-xs-7" style="font-weight: bold">${currentName}</button>
            </div>`;
    }
    else {
      firstPlayerBoardStr += `<div class="row">
                <button type="button" class="btn btn-default col-xs-5">${currentIdentity}</button>
                <button type="button" class="btn btn-default col-xs-7">${currentName}</button>
            </div>`;
    }
  }
  firstPlayerBoardStr += `</div>
        <hr>
        <p>Special Characters Present: ${specialCharacters}</p>
        <p>There are ${goodNum} Agents of Good and ${evilNum} Agents of Evil.</p>
        </div>
    </div><hr></div>`;
  return firstPlayerBoardStr;
};

exports.updateGameBoardStr = function(character, playerList, game) {
  let gameBoardStr;
  let partyDisplayStr = "none";

  // if a party exists, fill the string
  if( game.phase != 0 &&
      game.phase != 3 &&
      game.phase != 6 &&
      game.phase != 9 &&
      game.phase != 12 &&
      game.phase != 15 &&
      game.phase != 16) {
    partyDisplayStr = "";
    for(let i = 0; i < game.selectedParty.length; i++) {
      if(game.selectedParty[i] != -1) {
        partyDisplayStr += '[' + playerList[game.selectedParty[i]].name + ']';
      }
    }
  }
  const fourthQuestAsterisk = (game.playerCount >= 7) ? "*" : "";

  if(game.phase < 15) {
    gameBoardStr = `<h2>Game Board</h2>
        <div class="well">
            <p>Quests</p>`;
    if(game.phase < 3) {
      gameBoardStr += `<button type="button" class="quest-tile btn-lg btn-default">${game.questSize[0]}</button>
                <button type="button" class="quest-tile btn btn-default">${game.questSize[1]}</button>
                <button type="button" class="quest-tile btn btn-default">${game.questSize[2]}</button>
                <button type="button" class="quest-tile btn btn-default">${game.questSize[3]}${fourthQuestAsterisk}</button>
                <button type="button" class="quest-tile btn btn-default">${game.questSize[4]}</button>
                <hr>
                <p id="currentQuestDisplay">Current Quest: 1</p>`;
    }
    else if(game.phase < 6) {
      gameBoardStr += `<button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[0])}">${utils.getTileStringFromQuestResult(game.quests[0])}</button>
                <button type="button" class="quest-tile btn-lg btn-default">${game.questSize[1]}</button>
                <button type="button" class="quest-tile btn btn-default">${game.questSize[2]}</button>
                <button type="button" class="quest-tile btn btn-default">${game.questSize[3]}${fourthQuestAsterisk}</button>
                <button type="button" class="quest-tile btn btn-default">${game.questSize[4]}</button>
                <hr>
                <p id="currentQuestDisplay">Current Quest: 2</p>`;
    }
    else if(game.phase < 9) {
      gameBoardStr += `<button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[0])}">${utils.getTileStringFromQuestResult(game.quests[0])}</button>
                <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[1])}">${utils.getTileStringFromQuestResult(game.quests[1])}</button>
                <button type="button" class="quest-tile btn-lg btn-default">${game.questSize[2]}</button>
                <button type="button" class="quest-tile btn btn-default">${game.questSize[3]}${fourthQuestAsterisk}</button>
                <button type="button" class="quest-tile btn btn-default">${game.questSize[4]}</button>
                <hr>
                <p id="currentQuestDisplay">Current Quest: 3</p>`;
    }
    else if(game.phase < 12) {
      gameBoardStr += `<button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[0])}">${utils.getTileStringFromQuestResult(game.quests[0])}</button>
                <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[1])}">${utils.getTileStringFromQuestResult(game.quests[1])}</button>
                <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[2])}">${utils.getTileStringFromQuestResult(game.quests[2])}</button>
                <button type="button" class="quest-tile btn-lg btn-default">${game.questSize[3]}${fourthQuestAsterisk}</button>
                <button type="button" class="quest-tile btn btn-default">${game.questSize[4]}</button>
                <hr>
                <p id="currentQuestDisplay">Current Quest: 4</p>`;
    }
    else {
      gameBoardStr += `<button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[0])}">${utils.getTileStringFromQuestResult(game.quests[0])}</button>
                <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[1])}">${utils.getTileStringFromQuestResult(game.quests[1])}</button>
                <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[2])}">${utils.getTileStringFromQuestResult(game.quests[2])}</button>
                <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[3])}">${utils.getTileStringFromQuestResult(game.quests[3])}</button>
                <button type="button" class="quest-tile btn-lg btn-default">${game.questSize[4]}</button>
                <hr>
                <p id="currentQuestDisplay">Current Quest: 5</p>`;
    }
    gameBoardStr += `<p id="rejectedDisplay">Rejected Parties: ${game.partiesRejected}</p>`;

    // whoAccepted, whoRejected
    if(game.phase > 1 || game.partiesRejected > 0) {
      // make list of players who accepted and rejected
      const lastApprovals = game.approvalHistory[game.approvalHistory.length - 1][game.approvalHistory[game.approvalHistory.length - 1].length - 1];
      gameBoardStr += `<p id="whoAccepted">Voted to Accept: `;
      for(let i = 0; i < lastApprovals.length; i++) {
        if(lastApprovals[i] == 1) {
          gameBoardStr += `[${playerList[i].name}]`;
        }
      }
      gameBoardStr += `</p><p id="whoRejected">Voted to Reject: `;
      for(let i = 0; i < lastApprovals.length; i++) {
        if(lastApprovals[i] == 2) {
          gameBoardStr += `[${playerList[i].name}]`;
        }
      }
      gameBoardStr += `</p>`;

      // in-game history table
      let historyHeader = "<thead><tr><th>Player</th>";
      for(let i = 0; i < game.partyHistories.length; i++) {
        for(let j = 0; j < game.partyHistories[i].length; j++) {
          historyHeader += `<th>Q${i+1}-P${j+1}</th>`;
        }
        if(game.questHistories[i] != null) {
          historyHeader += `<th>Q${i+1}</th>`;
        }
      }

      let historyRows = "";
      // for each player
      for(let i = 0; i < game.playerCount; i++) {
        historyRows += `<tr><td>${game.room[i].name}</td>`;
        // for each quest
        for(let j = 0; j < game.partyHistories.length; j++) {
          // for party histories in the quest
          for(let k = 0; k < game.partyHistories[j].length; k++) {
            // if player was in the party
            if(game.partyHistories[j][k].selectedParty.includes(i)) {
              historyRows += `<td style="background-color: #FFE164">`;
            }
            else {
              historyRows += `<td>`;
            }
            if(game.partyHistories[j][k].partyLeader === i) {
              historyRows += "&#x1f451; - ";
            }
            // if player approved the party
            if(game.partyHistories[j][k].votes[i] === 1) {
              historyRows += `&#x2714;</td>`;
            }
            else {
              historyRows += `&#x2716;</td>`;
            }
          }
          if(game.questHistories[j] != null) {
            // if quest was successful
            if(game.questHistories[j].isSuccessful) {
              historyRows += `<td class="good-blue">`;
            }
            else {
              historyRows += `<td class="evil-red">`;
            }
            // if player tried to succeed the quest
            if(game.questHistories[j].partyActions[i] === 1) {
              historyRows += `&#x2B50;</td>`;
            }
            else if(game.questHistories[j].partyActions[i] === 2) {
              historyRows += `&#x2B50;</td>`;
            }
            else {
              historyRows += `</td>`;
            }
          }
        }
        historyRows += `</tr>`;
      }
      gameBoardStr += `<hr>
        <table class="text-center table table-bordered table-hover">
          ${historyHeader}
          ${historyRows}
        </table>`;
      // end in-game history table
    }

    gameBoardStr += `<hr>
        <p id="currentPartyDisplay">Current party: ${partyDisplayStr}</p>
        </div>
        <hr>`;
  } // end game.phase < 15
  else if(game.phase == 15) {
    gameBoardStr = `<h2>Game Board</h2>
        <div class="well">
            <p>Quests</p>
            <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[0])}">${utils.getTileStringFromQuestResult(game.quests[0])}</button>
            <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[1])}">${utils.getTileStringFromQuestResult(game.quests[1])}</button>
            <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[2])}">${utils.getTileStringFromQuestResult(game.quests[2])}</button>
            <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[3])}">${utils.getTileStringFromQuestResult(game.quests[3])}</button>
            <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[4])}">${utils.getTileStringFromQuestResult(game.quests[4])}</button>
            <hr>
            <p id="currentQuestDisplay">Assassin Phase</p>
        </div>
        <hr>`;
  }
  else {
    const winningTeamStr = game.winningTeam == 1 ? 'Good has defeated Evil!' : 'Evil has defeated Good!';
    gameBoardStr = `<h2>Game Board</h2>
        <div class="well">
            <p>Quests</p>
            <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[0])}">${utils.getTileStringFromQuestResult(game.quests[0])}</button>
            <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[1])}">${utils.getTileStringFromQuestResult(game.quests[1])}</button>
            <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[2])}">${utils.getTileStringFromQuestResult(game.quests[2])}</button>
            <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[3])}">${utils.getTileStringFromQuestResult(game.quests[3])}</button>
            <button type="button" class="quest-tile btn btn-default ${utils.getStyleClassFromQuestResult(game.quests[4])}">${utils.getTileStringFromQuestResult(game.quests[4])}</button>
            <hr>
            <p id="currentQuestDisplay">Game End</p>`;
    if(game.assassinated != -1) {
      const assassinated = playerList[game.assassinated].character.includes("good") ?
        "a Servant of Arthur" : playerList[game.assassinated].character;
      gameBoardStr += `<p>The Assassin selected [${playerList[game.assassinated].name}], who was ${assassinated}.</p>`;
    }
    gameBoardStr +=`<h3>${winningTeamStr}</h3>
        </div>
        <hr>`;

    // game-end history table
    let historyHeader = "<thead><tr><th>Player</th><th>Character</th>";
    for(let i = 0; i < game.partyHistories.length; i++) {
      for(let j = 0; j < game.partyHistories[i].length; j++) {
        historyHeader += `<th>Q${i+1}-P${j+1}</th>`;
      }
      historyHeader += `<th>Q${i+1}</th>`;
    }

    let historyRows = "";
    // for each player
    for(let i = 0; i < game.playerCount; i++) {
      // TODO: use pretty name instead of "goodOne"
      const teamColorClass = (game.room[i].character === "merlin" ||
                            game.room[i].character === "percival" ||
                            game.room[i].character.includes("good")) ? "good-blue" : "evil-red";
      historyRows += `<tr><td class="${teamColorClass}">${game.room[i].name}</td><td class="${teamColorClass}">${game.room[i].character}</td>`;
      // for each quest
      for(let j = 0; j < game.partyHistories.length; j++) {
        // for party histories in the quest
        for(let k = 0; k < game.partyHistories[j].length; k++) {
          // if player was in the party
          if(game.partyHistories[j][k].selectedParty.includes(i)) {
            historyRows += `<td style="background-color: #FFE164">`;
          }
          else {
            historyRows += `<td>`;
          }
          if(game.partyHistories[j][k].partyLeader === i) {
            historyRows += "&#x1f451; - ";
          }
          // if player approved the party
          if(game.partyHistories[j][k].votes[i] === 1) {
            historyRows += `&#x2714;</td>`;
          }
          else {
            historyRows += `&#x2716;</td>`;
          }
        }
        if(game.questHistories[j] != null) {
          // if quest was successful
          if(game.questHistories[j].isSuccessful) {
            historyRows += `<td class="good-blue">`;
          }
          else {
            historyRows += `<td class="evil-red">`;
          }
          // if player tried to succeed the quest
          if(game.questHistories[j].partyActions[i] === 1) {
            historyRows += `&#x1F315;</td>`;
          }
          else if(game.questHistories[j].partyActions[i] === 2) {
            historyRows += `&#x1F311;</td>`;
          }
          else {
            historyRows += `</td>`;
          }
        }
      }
      historyRows += `</tr>`;
    }
    gameBoardStr += `<hr>
      <table class="text-center table table-bordered table-hover">
        ${historyHeader}
        ${historyRows}
      </table>`;
    // end game-end history table
  }

  return gameBoardStr;
};

exports.updateActionPanelStr = function(character, playerList, gameManager) {
  const currentPhase = gameManager.phase;
  const partyLeaderChar = playerList[gameManager.partyLeader].character;
  let optionsStr;

  if( currentPhase == 0 || currentPhase == 3 || currentPhase == 6 || currentPhase == 9 || currentPhase == 12) { // party select
    if(partyLeaderChar == character) {
      optionsStr = `<div class="text-center"><div data-toggle="buttons">`;
      for(let i = 0; i < playerList.length; i++) {
        const currentName = playerList[i].name;
        optionsStr += `<label class="btn btn-default" style="width: 82.5%;">
                    <input type="checkbox" autocomplete="off" name="partySelection" value="${currentName}">${currentName}</input>
                </label>`;
      }
      optionsStr += `<hr><button type="button" class="btn btn-default btn-lg" style="width: 82.5%" onclick="btnPressPartySubmit()">Submit</button>`;
    }
    else {
      optionsStr = `<button type="button" class="btn btn-default waiting-button">Waiting for ${playerList[gameManager.partyLeader].name} to select a party...</button>`;
    }
  }
  else if(currentPhase == 1 || currentPhase == 4 || currentPhase == 7 || currentPhase == 10 || currentPhase == 13) { // party voting
    optionsStr = `<div class="well">
            <div class="container-fluid">
                <button type="button" class="btn btn-default btn-lg col-xs-12" onclick="btnPressAcceptParty()">Accept</button>
                <hr>
                <button type="button" class="btn btn-default btn-lg col-xs-12" onclick="btnPressRejectParty()">Reject</button>
            </div>
        </div>`;
  }
  else if(currentPhase == 2 || currentPhase == 5 || currentPhase == 8 || currentPhase == 11 || currentPhase == 14) { // questing
    let playerSlot;
    for(let i = 0; i < playerList.length; i++) {
      if(playerList[i].character === character) {
        playerSlot = i;
      }
    }
    if(gameManager.selectedParty.includes(playerSlot)) {
      if(character === "merlin" || character === "percival" ||
                character === "goodOne" || character === "goodTwo" || character === "goodThree" || character === "goodFour" || character === "goodFive") {
        optionsStr = `<div class="well">
                    <div class="container-fluid">
                        <button type="button" class="btn btn-default btn-lg col-xs-12" onclick="btnPressSuccess()">Success</button>
                        <hr>
                        <button type="button" class="btn btn-default btn-lg col-xs-12" onclick="btnPressSuccess()">Success</button>
                    </div>
                </div>`;
      }
      else {
        optionsStr = `<div class="well">
                    <div class="container-fluid">
                        <button type="button" class="btn btn-default btn-lg col-xs-12" onclick="btnPressSuccess()">Success</button>
                        <hr>
                        <button type="button" class="btn btn-default btn-lg col-xs-12" onclick="btnPressFail()">Fail</button>
                    </div>
                </div>`;
      }
    }
    else {
      optionsStr = `<button type="button" class="btn btn-default waiting-button">Waiting for party to complete the quest...</button>`;
    }
  }
  else if(currentPhase == 15) { // assassination
    let assassinSlot;
    for(let i = 0; i < playerList.length; i++) {
      if(playerList[i].character === "assassin") {
        assassinSlot = i;
      }
    }
    if(character === "assassin") {
      optionsStr = `<div class="text-center"><div data-toggle="buttons">`;
      for(let i = 0; i < playerList.length; i++) {
        const currentName = playerList[i].name;
        if(playerList[i].character === "merlin" || playerList[i].character === "percival" ||
                    playerList[i].character === "goodOne" || playerList[i].character === "goodTwo" || playerList[i].character === "goodThree" || playerList[i].character === "goodFour" || playerList[i].character === "goodFive") {
          optionsStr += `<label class="btn btn-default" style="width: 82.5%;">
                        <input type="checkbox" autocomplete="off" name="assassinSelection" value="${currentName}">${currentName}</input>
                    </label>`;
        }
      }
      optionsStr += `<hr><button type="button" class="btn btn-default btn-lg" style="width: 82.5%" onclick="btnPressAssassinSubmit()">Assassinate</button>`;
    }
    else {
      optionsStr = `<button type="button" class="btn btn-default waiting-button">${playerList[assassinSlot].name} is attempting to assassinate Merlin!</button>`;
    }
  }
  else { // game end
    optionsStr = `<div class="well">
            <div class="container-fluid">
                <button type="button" class="btn btn-default btn-lg col-xs-12" onclick="btnPressLeaveGame()">Return to Menu</button>
            </div>
        </div>`;
  }

  const actionPanelStr = `<h2>Actions</h2>
    <div class="well">
        ${optionsStr}
        <p></p>
    </div>
    <hr>`;
  return actionPanelStr;
};
