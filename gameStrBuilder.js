//gameStrBuilder.js

var buildHostLobbyStr = function() {
    return `<div class="text-center">
        <div class="btn-group btn-group-lg" role="group" style="box-shadow:0px 0px 0px 0px">
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
}
var buildGuestLobbyStr = function() {
    return `<div class="text-center">
        <div class="btn-group btn-group-lg" role="group" style="box-shadow:0px 0px 0px 0px">
            <button type="button" class="btn btn-default">Waiting...</button>
            <button type="button" class="btn btn-default" onclick="btnPressLeaveGame()">Leave Game</button>
            <button type="button" class="btn btn-default" data-toggle="collapse" data-target="#rulesContent">Rules</button>
        </div>
        <hr>
    </div>
    <div id="lobbyDiv"></div>`;
}

//TODO: change the successes display...the variable isn't being used how it was
//intended in the UI
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
    var specialCharacters = '[Merlin][Morgana]';
    if(charArray[1] == 1) {firstPlayerBoardStr += '[Percival]';}
    if(charArray[8] == 1) {firstPlayerBoardStr += '[Morgana]';}
    if(charArray[9] == 1) {firstPlayerBoardStr += '[Mordred]';}
    if(charArray[10] == 1) {firstPlayerBoardStr += '[Oberon]';}
    var firstPlayerBoardStr = `<div id="playerBoardDiv" class="text-center">
        <h2 data-toggle="collapse" data-target="#playerBoardContent">Players</h2>
        <div id="playerBoardContent" class="collapse-in">
            <div class="well" style="background:none;">
                <div class="container-fluid">`;
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
        firstPlayerBoardStr += `<div class="row">
            <button type="button" class="btn btn-default col-xs-3">${currentIdentity}</button>
            <button type="button" class="btn btn-default col-xs-5">${currentName}</button>
            <button type="button" class="btn btn-default col-xs-4" id="status${i}">Status</button>
        </div>`;
    }
    firstPlayerBoardStr += `</div>
        <hr>
        <p>Special Characters Present: ${specialCharacters}</p>
        <p>There are ${goodNum} Agents of Good and ${evilNum} Agents of Evil.</p>
        </div>
    </div><hr></div>`;
    return firstPlayerBoardStr;
}

var updateGameBoardStr = function(character, playerList, gameManager) {
    var gameBoardStr;
    var partyDisplayStr = "none";
    var firstQuestResult, secondQuestResult, thirdQuestResult, fourthQuestResult, fifthQuestResult;

    // if a party exists, fill the string
    if( gameManager.phase != 0 &&
        gameManager.phase != 3 &&
        gameManager.phase != 6 &&
        gameManager.phase != 9 &&
        gameManager.phase != 12 &&
        gameManager.phase != 15 &&
        gameManager.phase != 16) {
        partyDisplayStr = "";
        for(i = 0; i < gameManager.selectedParty.length; i++) {
            if(gameManager.selectedParty[i] != -1) {
                partyDisplayStr += '[' + playerList[gameManager.selectedParty[i]].name + ']';
            }
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
    var completedQuestElement = `<button type="button" style="box-shadow:0px 0px 0px 0px; background:none;" class="btn-lg btn-default">${gameManager.questSize[0]}</button>`;
    if(gameManager.phase < 3) {
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
            <p id="rejectedDisplay">Rejected Parties: ${gameManager.partiesRejected}</p>
            <p id="successesDisplay">Successes: ${gameManager.successes}, Failures: ${gameManager.failures}</p>
            <hr>
            <p id="currentPartyDisplay">Current party: ${partyDisplayStr}</p>
        </div>
        <hr>`;
    }
    else if(gameManager.phase < 6) {
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
            <p id="rejectedDisplay">Rejected Parties: ${gameManager.partiesRejected}</p>
            <p id="successesDisplay">Successes: ${gameManager.successes}, Failures: ${gameManager.failures}</p>
            <hr>
            <p id="currentPartyDisplay">Current party: ${partyDisplayStr}</p>
        </div>
        <hr>`;
    }
    else if(gameManager.phase < 9) {
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
            <p id="rejectedDisplay">Rejected Parties: ${gameManager.partiesRejected}</p>
            <p id="successesDisplay">Successes: ${gameManager.successes}, Failures: ${gameManager.failures}</p>
            <hr>
            <p id="currentPartyDisplay">Current party: ${partyDisplayStr}</p>
        </div>
        <hr>`;
    }
    else if(gameManager.phase < 12) {
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
            <p id="rejectedDisplay">Rejected Parties: ${gameManager.partiesRejected}</p>
            <p id="successesDisplay">Successes: ${gameManager.successes}, Failures: ${gameManager.failures}</p>
            <hr>
            <p id="currentPartyDisplay">Current party: ${partyDisplayStr}</p>
        </div>
        <hr>`;
    }
    else if(gameManager.phase < 15) {
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
            <p id="rejectedDisplay">Rejected Parties: ${gameManager.partiesRejected}</p>
            <p id="successesDisplay">Successes: ${gameManager.successes}, Failures: ${gameManager.failures}</p>
            <hr>
            <p id="currentPartyDisplay">Current party: ${partyDisplayStr}</p>
        </div>
        <hr>`;
    }
    else if(gameManager.phase == 15) {
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
        var winningTeamStr = 'Good has defeated Evil!';
        if(gameManager.winningTeam == 2) {
            winningTeamStr = 'Evil has defeated Good!';
        }

        gameBoardStr = `<h2>Game Board</h2>
        <div class="well" style="background:none;">
            <p>Quests</p>
            <button type="button" class="btn btn-default">${firstQuestResult}</button>
            <button type="button" class="btn btn-default">${secondQuestResult}</button>
            <button type="button" class="btn btn-default">${thirdQuestResult}</button>
            <button type="button" class="btn btn-default">${fourthQuestResult}</button>
            <button type="button" class="btn btn-default">${fifthQuestResult}</button>
            <hr>
            <h3 id="currentQuestDisplay">${winningTeamStr}</h3>
        </div>
        <hr>`;
    }
    return gameBoardStr;
}
var updateActionPanelStr = function(character, playerList, gameManager) {
    var currentPhase = gameManager.phase;
    var partyLeaderChar = playerList[gameManager.partyLeader].character;
	var actionPanelStr;
    var optionsStr;

	if( currentPhase == 0 || currentPhase == 3 || currentPhase == 6 || currentPhase == 9 || currentPhase == 12) { //party select
		if(partyLeaderChar == character) {
			optionsStr = `<div class="text-center"><div data-toggle="buttons">`;
			for(i = 0; i < playerList.length; i++) {
                currentName = playerList[i].name;
				optionsStr += `<label class="btn btn-default" style="width: 82.5%;">
                    <input type="checkbox" autocomplete="off" name="partySelection" value="${currentName}">${currentName}</input>
                </label>`;
			}
			optionsStr += `<hr><button type="button" class="btn btn-default btn-lg" style="width: 82.5%" onclick="btnPressPartySubmit()">Submit</button>`;
		}
		else {
			optionsStr = `<button type="button" class="btn btn-default" style="width: 82.5%; height: 80px;">Waiting for ${playerList[gameManager.partyLeader].name} to select a party...</button>`;
		}
	}
	else if(currentPhase == 1 || currentPhase == 4 || currentPhase == 7 || currentPhase == 10 || currentPhase == 13) { //party voting
        optionsStr = `<div class="well" style="background:none;">
            <div class="container-fluid">
                <button type="button" class="btn btn-default btn-lg col-xs-12" onclick="btnPressAcceptParty()">Accept</button>
                <hr>
                <button type="button" class="btn btn-default btn-lg col-xs-12" onclick="btnPressRejectParty()">Reject</button>
            </div>
        </div>`;
	}
	else if(currentPhase == 2 || currentPhase == 5 || currentPhase == 8 || currentPhase == 11 || currentPhase == 14) { //questing
        var playerSlot;
        for(i = 0; i < playerList.length; i++) {
            if(playerList[i].character === character) {
                playerSlot = i;
            }
        }
        if(gameManager.selectedParty.includes(playerSlot)) {
            if(character === "merlin" || character === "percival" ||
                character === "goodOne" || character === "goodTwo" || character === "goodThree" || character === "goodFour" || character === "goodFive") {
                optionsStr = `<div class="well" style="background:none;">
                    <div class="container-fluid">
                        <button type="button" class="btn btn-default btn-lg col-xs-12" onclick="btnPressSuccess()">Success</button>
                        <hr>
                        <button type="button" class="btn btn-default btn-lg col-xs-12" onclick="btnPressSuccess()">Success</button>
                    </div>
                </div>`;
            }
            else {
                optionsStr = `<div class="well" style="background:none;">
                    <div class="container-fluid">
                        <button type="button" class="btn btn-default btn-lg col-xs-12" onclick="btnPressSuccess()">Success</button>
                        <hr>
                        <button type="button" class="btn btn-default btn-lg col-xs-12" onclick="btnPressFail()">Fail</button>
                    </div>
                </div>`;
            }
        }
        else {
			optionsStr = `<button type="button" class="btn btn-default" style="width: 82.5%; height: 80px;">Waiting for party to complete the quest...</button>`;
		}
	}
	else if(currentPhase == 15) { //assassination
        var assassinSlot;
        for(i = 0; i < playerList.length; i++) {
            if(playerList[i].character === "assassin") {
                assassinSlot = i;
            }
        }
        console.log(`assassinSlot = ${assassinSlot}`);
        if(character === "assassin") {
    		optionsStr = `<div class="text-center"><div data-toggle="buttons">`;
    		for(i = 0; i < playerList.length; i++) {
                currentName = playerList[i].name;
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
    		optionsStr = `<button type="button" class="btn btn-default" style="width: 82.5%; height: 80px;">${playerList[assassinSlot].name} is attempting to assassinate Merlin!</button>`;
    	}
	}
	else { //game end
        optionsStr = `<div class="well" style="background:none;">
            <div class="container-fluid">
                <button type="button" class="btn btn-default btn-lg col-xs-12" onclick="btnPressLeaveGame()">Return to Menu</button>
            </div>
        </div>`;
	}

    actionPanelStr = `<h2>Actions</h2>
    <div class="well" style="background:none;">
        ${optionsStr}
        <p></p>
    </div>
    <hr>`;
    return actionPanelStr;
}
function updateProgressBarStr(barWidth, innerText, outerText) {
    return `<div id="progressBarInner" class="progress-bar" style="width: ${barWidth}%">${innerText}</div>
    <p id="progressBarOuter">${outerText}</p>`;
}


module.exports = {
    buildHostLobbyStr: buildHostLobbyStr,
    buildGuestLobbyStr: buildGuestLobbyStr,
    buildFirstGameBoardStr: buildFirstGameBoardStr,
    buildFirstActionPanelStr: buildFirstActionPanelStr,
    buildFirstPlayerBoardStr: buildFirstPlayerBoardStr,
    updateGameBoardStr: updateGameBoardStr,
    updateActionPanelStr: updateActionPanelStr,
    updateProgressBarStr: updateProgressBarStr
}
