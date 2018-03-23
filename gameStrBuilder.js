//gameStrBuilder.js

var buildFirstGameBoardStr = function(qSize1, qSize2, qSize3, qSize4, qSize5) {
    return `<div id="gameBoardDiv" class="text-center">
        <h2>Game Board</h2>
        <div class="well" style="background:none;">
            <p>Quests</p>
            <button type="button" style="box-shadow:0px 0px 0px 0px; background:none;" class="btn-lg btn-default">${qSize1}</button>
            <button type="button" class="btn btn-default">${qSize2}</button>
            <button type="button" class="btn btn-default">${qSize3}</button>
            <button type="button" class="btn btn-default">${qSize4}</button>
            <button type="button" class="btn btn-default">${qSize5}</button>
            <hr>
            <p id="currentQuestDisplay">Current Quest: 1</p>
            <p id="rejectedDisplay">Rejected Parties: 0</p>
            <p id="successesDisplay">Successes: 0, Failures: 0</p>
            <hr>
            <p id="currentPartyDisplay">Current party: none</p>
        </div>
        <hr>
    </div>`
}
var buildFirstActionPanelStr = function() {
    return `<div id="actionPanelDiv" class="text-center">
        <h2>Actions</h2>
        <div class="well" style="background:none;">
            <button type="button" class="btn btn-default" style="width: 82.5%; height: 80px;">Waiting...</button>
            <p></p>
        </div>
        <hr>
    </div>`
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

module.exports = {
    buildFirstGameBoardStr: buildFirstGameBoardStr,
    buildFirstActionPanelStr: buildFirstActionPanelStr,
    buildFirstPlayerBoardStr: buildFirstPlayerBoardStr
}
