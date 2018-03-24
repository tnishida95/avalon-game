//gameStrBuilder.js

var buildFirstGameBoardStr = function(questSizeArray) {
    return `<div id="gameBoardDiv" class="text-center">
        <h2>Game Board</h2>
        <div class="well" style="background:none;">
            <p>Quests</p>
            <button type="button" style="box-shadow:0px 0px 0px 0px; background:none;" class="btn-lg btn-default">${questSizeArray[0]}</button>
            <button type="button" class="btn btn-default">${questSizeArray[1]}</button>
            <button type="button" class="btn btn-default">${questSizeArray[2]}</button>
            <button type="button" class="btn btn-default">${questSizeArray[3]}</button>
            <button type="button" class="btn btn-default">${questSizeArray[4]}</button>
            <hr>
            <p id="currentQuestDisplay">Current Quest: 1</p>
            <p id="rejectedDisplay">Rejected Parties: 0</p>
            <p id="successesDisplay">Successes: 0, Failures: 0</p>
            <hr>
            <p id="currentPartyDisplay">Current party: none</p>
        </div>
        <hr>
    </div>`;
}
var buildFirstActionPanelStr = function() {
    return `<div id="actionPanelDiv" class="text-center">
        <h2>Actions</h2>
        <div class="well" style="background:none;">
            <button type="button" class="btn btn-default" style="width: 82.5%; height: 80px;">Waiting...</button>
            <p></p>
        </div>
        <hr>
    </div>`;
}
var buildFirstPlayerBoardStr = function(character, playerList, charArray, goodNum, evilNum) {
    var currentName;
    var currentChar;
    var currentIdentity;
    var firstPlayerBoardStr = `<div id="playerBoardDiv" class="text-center">
        <h2 data-toggle="collapse" data-target="#playerBoardContent">Players</h2>
        <div id="playerBoardContent" class="collapse-in">
            <div class="well" style="background:none;">`;
    for(i = 0; i < playerList.length; i++) {
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
        else { //non-Oberon Evil
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
                if( currentChar == "merlin" ||
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
        firstPlayerBoardStr += `<button type="button" class="btn btn-default" style="width: 20%;">${currentIdentity}</button>
        <button type="button" class="btn btn-default" style="width: 40%;">${currentName}</button>
        <button id="status${i}" type="button" class="btn btn-default" style="width: 20%;">Status</button>
        <p></p>`;
    }
    firstPlayerBoardStr += `<hr><p>Special Characters Present: [Merlin][Assassin]`;
    // listing other special characters
    if(charArray[1] == 1) {firstPlayerBoardStr += '[Percival]';}
    if(charArray[8] == 1) {firstPlayerBoardStr += '[Morgana]';}
    if(charArray[9] == 1) {firstPlayerBoardStr += '[Mordred]';}
    if(charArray[10] == 1) {firstPlayerBoardStr += '[Oberon]';}
    firstPlayerBoardStr += `<p>There are ${goodNum} Agents of Good and ${evilNum} Agents of Evil.</p></div></div><hr></div>`;
    return firstPlayerBoardStr;
}

updateGameBoardStr = function(character, playerList, gameManager) {
    var gameBoardStr;
    var partyDisplayStr = "none";
    var firstQuestResult, secondQuestResult, thirdQuestResult, fourthQuestResult, fifthQuestResult;

    // if a party exists, fill the string
    if( currentPhase != 0 ||
        currentPhase != 3 ||
        currentPhase != 6 ||
        currentPhase != 9 ||
        currentPhase != 12) {
        partyDisplayStr = "";
        for(player in gameManager.selectedParty) {
            selectedPartyArray += '[' + playerList[player] + ']';
        }
    }
    firstQuestResult = secondQuestResult = thirdQuestResult = fourthQuestResult = fifthQuestResult = "F";
    if(gameManager.quests[0] == 1) {
        firstQuestResult = "S";
    }
    if(gameManager.quests[1] == 1) {
        secondQuestResult = "S";
    }
    if(gameManager.quests[2] == 1) {
        thirdQuestResult = "S";
    }
    if(gameManager.quests[3] == 1) {
        fourthQuestResult = "S";
    }
    if(gameManager.quests[4] == 1) {
        fifthQuestResult = "S";
    }
    if(currentPhase < 3) {
        gameBoardStr = `<h2>Game Board</h2>
        <div class="well" style="background:none;">
            <p>Quests</p>
            <button type="button" style="box-shadow:0px 0px 0px 0px; background:none;" class="btn-lg btn-default">${gameManager.questSize[0]}</button>
            <button type="button" class="btn btn-default">${gameManager.questSize[1]}</button>
            <button type="button" class="btn btn-default">${gameManager.questSize[2]}</button>
            <button type="button" class="btn btn-default">${gameManager.questSize[3]}</button>
            <button type="button" class="btn btn-default">${gameManager.questSize[4]}</button>
            <hr>
            <p id="currentQuestDisplay">Current Quest: 1</p>
            <p id="rejectedDisplay">Rejected Parties: ${gameManager.votesRejected}</p>
            <p id="successesDisplay">Successes: ${gameManager.successes}, Failures: ${gameManager.failures}</p>
            <hr>
            <p id="currentPartyDisplay">Current party: ${partyDisplayStr}</p>
        </div>
        <hr>`;
    }
    else if(currentPhase < 6) {
        gameBoardStr = `<h2>Game Board</h2>
        <div class="well" style="background:none;">
            <p>Quests</p>
            <button type="button" class="btn btn-default">${firstQuestResult}</button>
            <button type="button" style="box-shadow:0px 0px 0px 0px; background:none;" class="btn-lg btn-default">${gameManager.questSize[1]}</button>
            <button type="button" class="btn btn-default">${gameManager.questSize[2]}</button>
            <button type="button" class="btn btn-default">${gameManager.questSize[3]}</button>
            <button type="button" class="btn btn-default">${gameManager.questSize[4]}</button>
            <hr>
            <p id="currentQuestDisplay">Current Quest: 2</p>
            <p id="rejectedDisplay">Rejected Parties: ${gameManager.votesRejected}</p>
            <p id="successesDisplay">Successes: ${gameManager.successes}, Failures: ${gameManager.failures}</p>
            <hr>
            <p id="currentPartyDisplay">Current party: ${partyDisplayStr}</p>
        </div>
        <hr>`;
    }
    else if(currentPhase < 9) {
        gameBoardStr = `<h2>Game Board</h2>
        <div class="well" style="background:none;">
            <p>Quests</p>
            <button type="button" class="btn btn-default">${firstQuestResult}</button>
            <button type="button" class="btn btn-default">${secondQuestResult}</button>
            <button type="button" style="box-shadow:0px 0px 0px 0px; background:none;" class="btn-lg btn-default">${gameManager.questSize[2]}</button>
            <button type="button" class="btn btn-default">${gameManager.questSize[3]}</button>
            <button type="button" class="btn btn-default">${gameManager.questSize[4]}</button>
            <hr>
            <p id="currentQuestDisplay">Current Quest: 3</p>
            <p id="rejectedDisplay">Rejected Parties: ${gameManager.votesRejected}</p>
            <p id="successesDisplay">Successes: ${gameManager.successes}, Failures: ${gameManager.failures}</p>
            <hr>
            <p id="currentPartyDisplay">Current party: ${partyDisplayStr}</p>
        </div>
        <hr>`;
    }
    else if(currentPhase < 12) {
        gameBoardStr = `<h2>Game Board</h2>
        <div class="well" style="background:none;">
            <p>Quests</p>
            <button type="button" class="btn btn-default">${firstQuestResult}</button>
            <button type="button" class="btn btn-default">${secondQuestResult}</button>
            <button type="button" class="btn btn-default">${thirdQuestResult}</button>
            <button type="button" style="box-shadow:0px 0px 0px 0px; background:none;" class="btn-lg btn-default">${gameManager.questSize[3]}</button>
            <button type="button" class="btn btn-default">${gameManager.questSize[4]}</button>
            <hr>
            <p id="currentQuestDisplay">Current Quest: 4</p>
            <p id="rejectedDisplay">Rejected Parties: ${gameManager.votesRejected}</p>
            <p id="successesDisplay">Successes: ${gameManager.successes}, Failures: ${gameManager.failures}</p>
            <hr>
            <p id="currentPartyDisplay">Current party: ${partyDisplayStr}</p>
        </div>
        <hr>`;
    }
    else if(currentPhase < 15) {
        gameBoardStr = `<h2>Game Board</h2>
        <div class="well" style="background:none;">
            <p>Quests</p>
            <button type="button" class="btn btn-default">${firstQuestResult}</button>
            <button type="button" class="btn btn-default">${secondQuestResult}</button>
            <button type="button" class="btn btn-default">${thirdQuestResult}</button>
            <button type="button" class="btn btn-default">${fourthQuestResult}</button>
            <button type="button" style="box-shadow:0px 0px 0px 0px; background:none;" class="btn-lg btn-default">${gameManager.questSize[4]}</button>
            <hr>
            <p id="currentQuestDisplay">Current Quest: 5</p>
            <p id="rejectedDisplay">Rejected Parties: ${gameManager.votesRejected}</p>
            <p id="successesDisplay">Successes: ${gameManager.successes}, Failures: ${gameManager.failures}</p>
            <hr>
            <p id="currentPartyDisplay">Current party: ${partyDisplayStr}</p>
        </div>
        <hr>`;
    }
    else if(currentPhase == 15) {
        gameBoardStr = `<h2>Game Board</h2>
        <div class="well" style="background:none;">
            <p>Quests</p>
            <button type="button" class="btn btn-default">${firstQuestResult}</button>
            <button type="button" class="btn btn-default">${secondQuestResult}</button>
            <button type="button" class="btn btn-default">${thirdQuestResult}</button>
            <button type="button" class="btn btn-default">${fourthQuestResult}</button>
            <button type="button" class="btn btn-default">${fifthQuestResult}</button>
            <hr>
            <p id="currentQuestDisplay">Assassin Phase</p>
        </div>
        <hr>`;
    }
    else {
        gameBoardStr = `<h2>Game Board</h2>
        <div class="well" style="background:none;">
            <p>Quests</p>
            <button type="button" class="btn btn-default">${firstQuestResult}</button>
            <button type="button" class="btn btn-default">${secondQuestResult}</button>
            <button type="button" class="btn btn-default">${thirdQuestResult}</button>
            <button type="button" class="btn btn-default">${fourthQuestResult}</button>
            <button type="button" class="btn btn-default">${fifthQuestResult}</button>
            <hr>
            <p id="currentQuestDisplay">Results</p>
        </div>
        <hr>`;
    }
}

module.exports = {
    buildFirstGameBoardStr: buildFirstGameBoardStr,
    buildFirstActionPanelStr: buildFirstActionPanelStr,
    buildFirstPlayerBoardStr: buildFirstPlayerBoardStr,
    updateGameBoardStr: updateGameBoardStr
}
