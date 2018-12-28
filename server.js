/*
server.js
Server-side javascript for avalon-game.

Tyler Nishida, tnishida95@gmail.com
*/

const express = require('express');
const app = express();
const port = process.env.PORT || 2000;

const serv = require('http').Server(app);
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use('/', express.static(__dirname + '/'));
serv.listen(port);
console.log(`Server started listening on port ${port}.`);
const gameStrBuilder = require('./gameStrBuilder');

const io = require('socket.io')(serv, {});
// array of sockets
const socketList = [];
// array of playerids
var playerList = [];

// key: roomNum, val: array of Player objects in the room
var roomList = {};
// key: roomNum, val: GameManager objects
var gameList = {};

// growing value to give unique ids to all connections
var playerid = 0;

/**
 * The player object.
 * @constructor
 * @param {int} id - The id of the player.
 * @param {int} socketid - The socket id of the player.
 * @param {string} name - The self-given player name.
 * @param {string} character - The character of the player.
 */
function Player(id, socketid, name, character) {
  this.id = id;
  this.sid = socketid;
  this.name = name;
  this.character = character;
}

/**
 * The GameManager object, responsible for keeping track
 * of the variables involves in game logic.
 * @constructor
 * @param {int} playerCount - The number of players in the game.
 */
function GameManager(playerCount) {
  this.playerCount = playerCount;

  // number of good and evil characters
  if(playerCount == 5) {this.goodNum = 3; this.evilNum = 2;}
  if(playerCount == 6) {this.goodNum = 4; this.evilNum = 2;}
  if(playerCount == 7) {this.goodNum = 4; this.evilNum = 3;}
  if(playerCount == 8) {this.goodNum = 5; this.evilNum = 3;}
  if(playerCount == 9) {this.goodNum = 6; this.evilNum = 3;}
  if(playerCount == 10) {this.goodNum = 6; this.evilNum = 4;}

  // array with the size of each quest; remember it is base 0
  if(playerCount == 5) {this.questSize = [2,3,2,3,3];}
  if(playerCount == 6) {this.questSize = [2,3,4,3,4];}
  if(playerCount == 7) {this.questSize = [2,3,3,4,4];}
  if(playerCount == 8) {this.questSize = [3,4,4,5,5];}
  if(playerCount == 9) {this.questSize = [3,4,4,5,5];}
  if(playerCount == 10) {this.questSize = [3,4,4,5,5];}

  /*
  0, 1, 2 = 1st quest: party select, voting, questing
  3, 4, 5 = 2nd quest
  6, 7, 8 = 3rd quest
  9, 10, 11 = 4th quest
  12, 13, 14 = 5th quest
  15 = assassin phase
  16 = game end/results/stats
  */
  this.phase = 0;
  /*
  0 = no status
  1 = success/accept/succeed/good
  2 = fail/reject/fail/evil
  */
  this.quests = [0,0,0,0,0];
  this.votes = [0,0,0,0,0,0,0,0,0,0];
  this.partyActions = [0,0,0,0,0,0];
  this.winningTeam = 0;

  // this tracks the quest actions taken for a given quest,
  // not the number of succeeded and failed quests
  this.successes = 0;
  this.failures = 0;

  this.partiesRejected = 0;
  this.actionsTaken = 0;

  // these numbers refer to the indices of Players in array at roomList[roomNum]
  this.partyLeader = 0;
  this.assassinated = -1;
  // could assign this a new array every time a new quest comes up
  // example usage: [0,2,3] -> the first, third, and fourth player in the room
  //   are in the party
  this.selectedParty = [-1,-1,-1,-1,-1,-1];

  // this will keep a history of the votes array
  // approvalHistory[quest][party number][player]
  // ex. approvalHistory[1][3][2] gets the approval vote of the third player for
  //   the fourth party on the second quest
  this.approvalHistory = [];

  // this will keep a history of the selectedParty array
  // approvalHistory[quest][party number][player]
  // ex. partyHistory[1][3][2] gets the player on the the fourth party of the
  //   second quest
  this.partyHistory = [];
}

/** Prints the list of players. */
function printPlayerList() {
  if(playerList.length < 1) return;
  process.stdout.write('playerList: ');
  for(let i = 0; i < playerList.length; i++) {
    process.stdout.write(`[${playerList[i]}]`);
  }
  console.log('');
}

/** Prints the list of rooms. */
function printRoomList() {
  console.log("-------------------------");
  let listSize = 0;
  for(roomNums in roomList) {
    listSize++;
    process.stdout.write("Room #" + roomNums + ": ");
    for(let i = 0; i < roomList[roomNums].length; i++) {
      process.stdout.write("[" + roomList[roomNums][i].id + ":" + roomList[roomNums][i].name + "]");
    }
    console.log("");
  }
  if(listSize == 0) {
    console.log("no occupied rooms");
  }
  console.log("-------------------------");
}

/**
 * Concatenates the result of the gameStrBuilder object for a given character in
 * a game.
 * @param {int} roomNum - The room number of the game.
 * @param {string} character - The character to base the game screen on.
 * @param {Array} charArray - The characters in the game.
 * @return {string} - The HTML of the game screen component.
 */
function buildGameScreen(roomNum, character, charArray) {
  const firstGameBoardStr = gameStrBuilder.buildFirstGameBoardStr(gameList[roomNum].questSize);
  const firstActionPanelStr = gameStrBuilder.buildFirstActionPanelStr();
  const firstPlayerBoardStr = gameStrBuilder.buildFirstPlayerBoardStr(character, roomList[roomNum], charArray, gameList[roomNum].goodNum, gameList[roomNum].evilNum);
  const firstGameScreenStr = firstGameBoardStr +
  `<div id="progressDiv" class="progress text-center">
    <div id="progressBarInner" class="progress-bar" style="width: 0%"></div>
    <p id="progressBarOuter">${roomList[roomNum][gameList[roomNum].partyLeader].name} is selecting a party.</p>
  </div>
  <hr>` + firstActionPanelStr + firstPlayerBoardStr;
  return firstGameScreenStr;
}

/**
 * Returns the current quest based on the phase of a given room.
 * @param {int} roomNum - The room number of the game.
 * @return {int} - The game's current quest.
 */
function getCurrentQuest(roomNum) {
  const currentPhase = gameList[roomNum].phase;
  if(currentPhase < 3) {return 0;}
  if(currentPhase < 6) {return 1;}
  if(currentPhase < 9) {return 2;}
  if(currentPhase < 12) {return 3;}
  if(currentPhase < 15) {return 4;}
}

/**
 * Constructs and emits HTML for the progress bar.
 * @param {string} progressType - Which progress bar will be needed.
 * @param {int} roomNum - The room number of the game.
 */
function updateProgressBar(progressType, roomNum) {
  let barWidth = 0;
  let innerText = "";
  let outerText = "";
  if(progressType === "approvingParty") {
    barWidth = (gameList[roomNum].actionsTaken / gameList[roomNum].playerCount) * 100;
    innerText = `${gameList[roomNum].actionsTaken} players voted...`;
    outerText = `...out of ${gameList[roomNum].playerCount}`;
  }
  else if (progressType === "partyApproved") {
    barWidth = 100;
    innerText = `Party accepted!  Players are questing...`;
  }
  else if (progressType === "partyRejected") {
    barWidth = 100;
    innerText = `Party rejected.  ${roomList[roomNum][gameList[roomNum].partyLeader].name} is selecting a party.`;
  }
  else if (progressType === "questing") {
    barWidth = (gameList[roomNum].actionsTaken / gameList[roomNum].playerCount) * 100;
    innerText = `${gameList[roomNum].actionsTaken} players departed...`;
    outerText = `...out of ${gameList[roomNum].playerCount}`;
  }
  else if (progressType === "questEnded") {
    if(gameList[roomNum].phase === 15) {
      barWidth = 100;
      innerText = `Three quests were successful! The Assassin is attempting to assassinate Merlin.`;
    }
    else if(gameList[roomNum].failures === 0) {
      barWidth = 100;
      innerText = `Quest succeeded! ${roomList[roomNum][gameList[roomNum].partyLeader].name} is selecting a party.`;
    }
    else {
      const partySize = gameList[roomNum].successes + gameList[roomNum].failures;
      barWidth = (gameList[roomNum].successes / partySize) * 100;
      innerText = `${gameList[roomNum].successes} / ${partySize} tried to succeed...`;

      // if it's the fourth quest that's ending and only one failure, it's
      //   still a success
      if(gameList[roomNum].phase === 11 && gameList[roomNum].failures === 1) {
        outerText = `...quest succeeded! ${roomList[roomNum][gameList[roomNum].partyLeader].name} is selecting a party.`;
      }
      else {
        outerText = `...quest failed! ${roomList[roomNum][gameList[roomNum].partyLeader].name} is selecting a party.`;
      }
    }
  }
  for(let j = 0; j < roomList[roomNum].length; j++) {
    io.to(roomList[roomNum][j].sid).emit("updateProgressBar", {
      barWidth: barWidth.toString() + "%",
      innerText: innerText,
      outerText: outerText,
    });
  }
}

function createPlayer(socket, playerName) {
  let player;
  if(playerName == "ShoyuMordred") {
    player = new Player(socket.num, socket.id, "Tyler", "mordred");
  }
  else {
    player = new Player(socket.num, socket.id, playerName, "none");
  }
  console.log("Created new Player:");
  console.log("\tid: " + player.id);
  console.log("\tname: " + player.name);
  console.log("\tcharacter: " + player.character);
  return player;
}

//upon new socket connection
io.sockets.on('connection', function(socket){
  socket.num = playerid;
  playerList[playerList.length] = playerid;
  socketList[playerList.length] = socket;
  console.log('new socket connection, player  #' + socket.num);
  playerid++;
  printPlayerList();

  socket.on('disconnect',function(){
    //get the index of the socket that just dc'd, cut it out of lists
    let index = playerList.indexOf(socket.num);
    socketList.splice(index,1);
    playerList.splice(index,1);
    console.log('player #' + socket.num + ' disconnected');
    printPlayerList();
    //TODO: update any rooms with the socket of the dc
  });

  socket.on('btnPressNewGame',function(data){
    console.log("New Game button pressed");

    //generate unique, four digit roomNum [1000,9999]
    let roomNum;
    do {
      roomNum = Math.floor(Math.random() * 9000) + 1000;
    }
    while (roomNum in roomList);

    //this is for testing purposes, remove in full release version
    if(data.name == "1test") {
      roomNum = 123;
    }

    // creating a new player and putting it into a new room
    roomList[roomNum] = [createPlayer(socket, data.name)];
    printRoomList();
    socket.join(roomNum);
    io.to(roomNum).emit("loadLobby", {
      list: roomList[roomNum],
      roomNum: roomNum,
      hostLobbyStr: gameStrBuilder.buildHostLobbyStr(),
      guestLobbyStr: gameStrBuilder.buildGuestLobbyStr()
    });
  });

  socket.on('btnPressJoinGame',function(data){
    let roomNum = (data.roomNum).toString();
    console.log("Join Game button pressed with roomNum: " + roomNum);
    if(gameList[roomNum] != null) {
      console.log("\tGame already in progress, cannot join.");
      return;
    }
    if(roomNum in roomList) {
      roomList[roomNum][roomList[roomNum].length] = createPlayer(socket, data.name);
      printRoomList();
      socket.join(roomNum);
      io.to(roomNum).emit("loadLobby", {
        list: roomList[roomNum],
        roomNum: roomNum,
        hostLobbyStr: gameStrBuilder.buildHostLobbyStr(),
        guestLobbyStr: gameStrBuilder.buildGuestLobbyStr()
      });
      io.to(roomNum).emit("updateLobby", {
        list: roomList[roomNum]
      });
    }
    else {
      console.log("roomNum " + roomNum + " not found");
    }
  });
  socket.on('btnPressLeaveGame',function(data){
    let roomNum = data.roomNum;
    //removing the player from the lobby
    for(i = 0; i < roomList[roomNum].length; i++) {
      if(roomList[roomNum][i].sid == socket.id) {
        console.log("Leave Game button pressed by: " + roomList[roomNum][i].name);
        roomList[roomNum].splice(i,1);
        break;
      }
    }
    socket.leave(roomNum);
    io.to(roomNum).emit("updateLobby", {
      list: roomList[roomNum],
      roomNum: roomNum
    });
    //if there is no one in the room, remove it
    if(roomList[roomNum].length === 0) {
      console.log("Room #" + roomNum + " is empty. Removing room and game manager.");
      delete roomList[roomNum];
      if(gameList[roomNum] != null) {
        delete gameList[roomNum];
      }
    }
    else {
      printRoomList();
    }
  });
  socket.on('btnPressDisbandGame',function(data){
    let roomNum = data.roomNum;
    console.log("Disband Game button pressed for roomNum: " + roomNum);
    io.to(roomNum).emit("loadMainMenu", {
      list: roomList[roomNum],
      num: roomNum
    });
    //make all sockets leave the room
    for(i = 0; i < roomList[roomNum].length; i++) {
      console.log("\tLeft the socket room: " + roomList[roomNum][i].name);
      io.sockets.connected[(roomList[roomNum][i].sid)].leave(roomNum);
    }
    delete roomList[roomNum];
    printRoomList();
  });
  socket.on('btnPressStartGame',function(data){
    let roomNum = data.roomNum;
    let characterSelections = data.charList;
    console.log("Start Game button pressed for roomNum: " + roomNum);
    if(characterSelections.length != roomList[roomNum].length) {
      console.error("invalid character selection: player count does not equal character count");
      return;
    }
    let goodCount = 0;
    let evilCount = 0;
    let charArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    console.log("getting characters:")
    //populate the charArray, showing which characters are in the game
    for(i = 0; i < characterSelections.length; i++) {
      characters = characterSelections[i];
      console.log("\t" + characters);
      if(characters == "merlin") {charArray[0] = 1; goodCount++;}
      else if (characters == "percival") {charArray[1] = 1; goodCount++;}
      else if (characters == "goodOne") {charArray[2] = 1; goodCount++;}
      else if (characters == "goodTwo") {charArray[3] = 1; goodCount++;}
      else if (characters == "goodThree") {charArray[4] = 1; goodCount++;}
      else if (characters == "goodFour") {charArray[5] = 1; goodCount++;}
      else if (characters == "goodFive") {charArray[6] = 1; goodCount++;}
      else if (characters == "assassin") {charArray[7] = 1; evilCount++;}
      else if (characters == "morgana") {charArray[8] = 1; evilCount++;}
      else if (characters == "mordred") {charArray[9] = 1; evilCount++;}
      else if (characters == "oberon") {charArray[10] = 1; evilCount++;}
      else if (characters == "evilOne") {charArray[11] = 1; evilCount++;}
      else if (characters == "evilTwo") {charArray[12] = 1; evilCount++;}
      else if (characters == "evilThree") {charArray[13] = 1;  evilCount++;}
      else {
        console.error("invalid character selection: unmatched character names");
        return;
      }
    }
    /*
    rules check:
      merlin and assassin must be selected
      morgana must be selected with percival
      good and evil player numbers align with the rules
    */
    console.log("\tGood: " + goodCount + ", Evil: " + evilCount);
    if(
      (charArray[0] == 0 || charArray[7] == 0) ||
      (charArray[8] == 1 && charArray[1] == 0) ||
      ((characterSelections.length == 5) && ((goodCount != 3) || (evilCount != 2))) ||
      ((characterSelections.length == 6) && ((goodCount != 4) || (evilCount != 2))) ||
      ((characterSelections.length == 7) && ((goodCount != 4) || (evilCount != 3))) ||
      ((characterSelections.length == 8) && ((goodCount != 5) || (evilCount != 3))) ||
      ((characterSelections.length == 9) && ((goodCount != 6) || (evilCount != 3))) ||
      ((characterSelections.length == 10) && ((goodCount != 6) || (evilCount != 4)))
    ) {
      console.error("invalid character selection: rule breaking");
      return;
    }
    //remove reserved characters from the pool; only handles a single reservation
    for(i = 0; i < roomList[roomNum].length; i++) {
      if(roomList[roomNum][i].character != "none") {
        if(roomList[roomNum][i].character == "mordred") {
          if(charArray[9] == 1) {
            charArray[9] = 0;
            console.log("fulfilling mordred reservation to " + roomList[roomNum][i].name);
            break; //remove this if more reservations added
          }
          console.log("modred not selected, cannot fulfill reservation");
          roomList[roomNum][i].character = "none";
        }
        //add more cases here as necessary
      }
    }

    //this is to help buildGameScreen()
    let charArrayCopy = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    for(i = 0; i < 14; i++) {
      if(charArray[i] == 1) {charArrayCopy[i] = 1;}
    }

    //assign players a random character
    let randomNum;
    console.log("\tthere are " + roomList[roomNum].length + " players in the room");
    for(i = 0; i < roomList[roomNum].length; i++) {
      if(roomList[roomNum][i].character == "none") {
        //process.stdout.write("getting randomNum: ");
        do {
          /*
          consider reducing the range of values every iteration somehow,
            not a big deal though
          maybe create another array with the indexes of available
            characters in charArray, then splice out elements as they
            are selected
          */
          randomNum = Math.floor(Math.random() * 14);
        }
        while(charArray[randomNum] != 1);
        if(randomNum == 0) {roomList[roomNum][i].character = "merlin";}
        else if(randomNum == 1) {roomList[roomNum][i].character = "percival";}
        else if(randomNum == 2) {roomList[roomNum][i].character = "goodOne";}
        else if(randomNum == 3) {roomList[roomNum][i].character = "goodTwo";}
        else if(randomNum == 4) {roomList[roomNum][i].character = "goodThree";}
        else if(randomNum == 5) {roomList[roomNum][i].character = "goodFour";}
        else if(randomNum == 6) {roomList[roomNum][i].character = "goodFive";}
        else if(randomNum == 7) {roomList[roomNum][i].character = "assassin";}
        else if(randomNum == 8) {roomList[roomNum][i].character = "morgana";}
        else if(randomNum == 9) {roomList[roomNum][i].character = "mordred";}
        else if(randomNum == 10) {roomList[roomNum][i].character = "oberon";}
        else if(randomNum == 11) {roomList[roomNum][i].character = "evilOne";}
        else if(randomNum == 12) {roomList[roomNum][i].character = "evilTwo";}
        else if(randomNum == 13) {roomList[roomNum][i].character = "evilThree";}
        charArray[randomNum] = 0;
      }
    }
    console.log("assigned characters:");
    for(i = 0; i < roomList[roomNum].length; i++) {
      console.log("\t[" + roomList[roomNum][i].name + "] is " + roomList[roomNum][i].character);
    }
    gameList[roomNum] = new GameManager(roomList[roomNum].length);
    gameList[roomNum].partyLeader = Math.floor(Math.random() * roomList[roomNum].length);
    console.log("Party Leader assigned to player at index [" + gameList[roomNum].partyLeader + "], [" + roomList[roomNum][gameList[roomNum].partyLeader].name + "]");
    console.log("sending out game boards...");

    //build and send out boards
    for(j = 0; j < roomList[roomNum].length; j++) {
      process.stdout.write("\tsending board to [" + roomList[roomNum][j].sid + "]...");
      io.to(roomList[roomNum][j].sid).emit("loadGameScreen", {
        list: roomList[roomNum],
        gameScreenStr: buildGameScreen(roomNum, roomList[roomNum][j].character, charArrayCopy)
      });
      console.log("board sent");
    }
    for(j = 0; j < roomList[roomNum].length; j++) {
      io.to(roomList[roomNum][j].sid).emit("updateGameBoard", {
        gameBoardStr: gameStrBuilder.updateGameBoardStr(roomList[roomNum][j].character, roomList[roomNum], gameList[roomNum])
        });
      io.to(roomList[roomNum][j].sid).emit("updateActionPanel", {
        actionPanelStr: gameStrBuilder.updateActionPanelStr(roomList[roomNum][j].character, roomList[roomNum], gameList[roomNum])
      });
    }
    console.log("\n~~~~~ Phase 0: Party Select ~~~~~");

  }); //end btnPressStartGame()
  socket.on('btnPressPartySubmit',function(data){
    let partySelections = data.partySelections;
    let roomNum = data.roomNum;
    let currentQuest;
    if(gameList[roomNum].phase == 0) {currentQuest = 0;}
    else if(gameList[roomNum].phase == 3) {currentQuest = 1;}
    else if(gameList[roomNum].phase == 6) {currentQuest = 2;}
    else if(gameList[roomNum].phase == 9) {currentQuest = 3;}
    else if(gameList[roomNum].phase == 12) {currentQuest = 4;}
    else {console.error("Party submitted, but not in partySelect phase.");}
    console.log(`Client submitted party: ${partySelections}`);
    if(partySelections.length != gameList[roomNum].questSize[currentQuest]) {
      console.error(`\tBad party select at ${roomNum}:`);
      console.error(`\t\t${partySelections.length} selected, ${gameList[roomNum].questSize[currentQuest]} should be on.`);
      return;
    }
    gameList[roomNum].phase++;
    console.log(`\n~~~~~ Phase ${gameList[roomNum].phase}: Quest ${getCurrentQuest(roomNum) + 1}, Party Approval ~~~~~`);

    gameList[roomNum].actionsTaken = 0;

    //filling out the selectedParty array...this could use some optimization
    let partySlot = 0;
    gameList[roomNum].selectedParty = [-1,-1,-1,-1,-1,-1];
    for(i = 0; i < partySelections.length; i++) {
      //console.log(`Looking at ${partySelections[i]}...`);
      for(j = 0; j < roomList[roomNum].length; j++) {
        if(partySelections[i] === roomList[roomNum][j].name) {
          gameList[roomNum].selectedParty[partySlot] = j;
          partySlot++;
          //console.log(`\tselectedParty[${partySlot}]: ${j}`);
          break;
        }
      }
    }
    console.log(`selectedParty array: ${gameList[roomNum].selectedParty}`);
    for(j = 0; j < roomList[roomNum].length; j++) {
      io.to(roomList[roomNum][j].sid).emit("updateGameBoard", {
        gameBoardStr: gameStrBuilder.updateGameBoardStr(roomList[roomNum][j].character, roomList[roomNum], gameList[roomNum])
        });
      io.to(roomList[roomNum][j].sid).emit("updateActionPanel", {
        actionPanelStr: gameStrBuilder.updateActionPanelStr(roomList[roomNum][j].character, roomList[roomNum], gameList[roomNum])
      });
    }
  });
  socket.on('btnPressPartyApproval',function(data){
    let roomNum = data.roomNum;
    //find out which player pressed it, and save the vote
    for(i = 0; i < roomList[roomNum].length; i++) {
      if(socket.id === roomList[roomNum][i].sid) {
        gameList[roomNum].votes[i] = data.vote;
        console.log(`\tParty Approval: [${roomList[roomNum][i].name}] voted: ${data.vote}.`);
        break;
      }
    }
    gameList[roomNum].actionsTaken++;
    let currentQuest = getCurrentQuest(roomNum);

    //if everyone has voted
    if(gameList[roomNum].actionsTaken === gameList[roomNum].playerCount) {
      //record the party and votes
      if(gameList[roomNum].partiesRejected === 0) {
        gameList[roomNum].approvalHistory[currentQuest] = [];
        gameList[roomNum].partyHistory[currentQuest] = [];
      }
      gameList[roomNum].approvalHistory[currentQuest][gameList[roomNum].partiesRejected] = [];
      gameList[roomNum].partyHistory[currentQuest][gameList[roomNum].partiesRejected] = [];
      for(i = 0; i < gameList[roomNum].playerCount; i++) {
        gameList[roomNum].approvalHistory[currentQuest][gameList[roomNum].partiesRejected][i] = gameList[roomNum].votes[i];
      }
      for(i = 0; i < gameList[roomNum].questSize[currentQuest]; i++) {
        gameList[roomNum].partyHistory[currentQuest][gameList[roomNum].partiesRejected][i] = gameList[roomNum].selectedParty[i];
      }
      console.log(`approvalHistory[${currentQuest}][${gameList[roomNum].partiesRejected}]: ${gameList[roomNum].approvalHistory[currentQuest][gameList[roomNum].partiesRejected]}`);
      console.log(`partyHistory[${currentQuest}][${gameList[roomNum].partiesRejected}]: ${gameList[roomNum].partyHistory[currentQuest][gameList[roomNum].partiesRejected]}`);

      //tally the accepts and rejects
      let accepts = 0;
      let rejects = 0;
      console.log(`Final approval vote cast.  Votes:\n\t${gameList[roomNum].votes}`);
      for(i = 0; i < 10; i++) {
        if(gameList[roomNum].votes[i] === 1) {
          accepts++;
        }
        else if(gameList[roomNum].votes[i] === 2) {
          rejects++;
        }
        else if(gameList[roomNum].votes[i] === 0){
          break;
        }
      }
      console.log(`Accepts: ${accepts}, Rejects: ${rejects}`);
      if(rejects >= accepts) {
        //quest rejected, so...
        //...move the party leader
        gameList[roomNum].partyLeader++;
        if(gameList[roomNum].partyLeader === gameList[roomNum].playerCount) {
          gameList[roomNum].partyLeader = 0;
        }

        //...increment partiesRejected and check if it's the fifth
        gameList[roomNum].partiesRejected++;
        if(gameList[roomNum].partiesRejected === 5) {
          gameList[roomNum].phase = 15;
        }

        //...return to party select phase
        gameList[roomNum].phase--;
        console.log(`\n~~~~~ Phase ${gameList[roomNum].phase}: Quest ${getCurrentQuest(roomNum) + 1}, Party Select ~~~~~`);
        updateProgressBar("partyRejected", roomNum);
      }
      else {
        //moving to quest phase now, so...
        //...change the game phase
        gameList[roomNum].phase++;
        console.log(`\n~~~~~ Phase ${gameList[roomNum].phase}: Quest ${getCurrentQuest(roomNum) + 1}, Questing ~~~~~`);

        //...reset all the relevant variables
        gameList[roomNum].actionsTaken = 0;
        gameList[roomNum].successes = 0;
        gameList[roomNum].failures = 0;
        //maybe these go after party select?
        gameList[roomNum].partiesRejected = 0;
        gameList[roomNum].votes = [0,0,0,0,0,0,0,0,0,0];

        updateProgressBar("partyApproved", roomNum);
      }
      for(j = 0; j < roomList[roomNum].length; j++) {
        io.to(roomList[roomNum][j].sid).emit("updateGameBoard", {
          gameBoardStr: gameStrBuilder.updateGameBoardStr(roomList[roomNum][j].character, roomList[roomNum], gameList[roomNum])
          });
        io.to(roomList[roomNum][j].sid).emit("updateActionPanel", {
          actionPanelStr: gameStrBuilder.updateActionPanelStr(roomList[roomNum][j].character, roomList[roomNum], gameList[roomNum])
        });
      }
    }
    else {
      updateProgressBar("approvingParty", roomNum);
    }
  });
  socket.on('btnPressQuestAction',function(data){
    let roomNum = data.roomNum;
    //find out which player pressed it, and save the action
    for(i = 0; i < roomList[roomNum].length; i++) {
      if(socket.id === roomList[roomNum][i].sid) {
        gameList[roomNum].partyActions[i] = data.questAction;
        console.log(`\tQuest Action: [${roomList[roomNum][i].name}] quested: ${data.questAction}.`);
        break;
      }
    }
    if(data.questAction === 1) {
      gameList[roomNum].successes++;
    }
    else {
      gameList[roomNum].failures++;
    }
    gameList[roomNum].actionsTaken++;
    let currentQuest = getCurrentQuest(roomNum);
    if(gameList[roomNum].actionsTaken === gameList[roomNum].questSize[currentQuest]) {
      //quest has ended, so now...

      console.log("Final quest action taken. Quest...");
      //...save quest result
      if(gameList[roomNum].failures === 0 ||
         (currentQuest === 3 && gameList[roomNum].failures < 2) ) {
        gameList[roomNum].quests[currentQuest] = 1;
        console.log(`\t...Succeeded!`);
      }
      else {
        gameList[roomNum].quests[currentQuest] = 2;
        console.log(`\t...Failed!`);
      }

      //...change party leader
      gameList[roomNum].partyLeader++;
      if(gameList[roomNum].partyLeader === gameList[roomNum].playerCount) {
        console.log(``);
        gameList[roomNum].partyLeader = 0;
      }

      //...update clients with next phase
      updateProgressBar("questEnded", roomNum);
      gameList[roomNum].phase++;

      //count successes and failures
      let currentSuccesses = 0;
      let currentFailures = 0;
      for(i = 0; i < 5; i++) {
        if(gameList[roomNum].quests[i] === 1) {
          currentSuccesses++;
        }
        else if (gameList[roomNum].quests[i] === 2) {
          currentFailures++;
        }
        else {
          break;
        }
      }
      if(currentSuccesses >= 3) {
        gameList[roomNum].phase = 15;
      }
      if(currentFailures >= 3) {
        gameList[roomNum].phase = 16;
        gameList[roomNum].winningTeam = 2;
      }

      if(gameList[roomNum].phase < 15) {
        console.log(`\n~~~~~ Phase ${gameList[roomNum].phase}: Quest ${getCurrentQuest(roomNum) + 1}, Party Select ~~~~~`);
      }
      else if(gameList[roomNum].phase === 15) {
        console.log(`\n~~~~~ Phase 15: Assassin Phase ~~~~~`);
      }
      else {
        console.log(`\n~~~~~ Phase 16: Game End ~~~~~`);
      }
      for(j = 0; j < roomList[roomNum].length; j++) {
        io.to(roomList[roomNum][j].sid).emit("updateGameBoard", {
          gameBoardStr: gameStrBuilder.updateGameBoardStr(roomList[roomNum][j].character, roomList[roomNum], gameList[roomNum])
          });
        io.to(roomList[roomNum][j].sid).emit("updateActionPanel", {
          actionPanelStr: gameStrBuilder.updateActionPanelStr(roomList[roomNum][j].character, roomList[roomNum], gameList[roomNum])
        });
      }
    }
  });
  socket.on('btnPressAssassinSubmit',function(data){
    let roomNum = data.roomNum;
    let assassinatedName = data.assassinSelection;
    for(i = 0; i < roomList[roomNum].length; i++) {
      if(roomList[roomNum][i].name === assassinatedName) {
        gameList[roomNum].assassinated = i;
      }
    }
    gameList[roomNum].winningTeam = 0; //1 = Good, 2 = Evil
    console.log(`The Assassin has chosen to assassinate ${assassinatedName}.`);
    if(roomList[roomNum][gameList[roomNum].assassinated].character === "merlin") {
      console.log(`Merlin [${roomList[roomNum][gameList[roomNum].assassinated].name}] has been assassinated!`);
      console.log("Evil wins the game!");
      gameList[roomNum].winningTeam = 2;
    }
    else {
      console.log(`Merlin survives!`);
      console.log("Good wins the game!");
      gameList[roomNum].winningTeam = 1;
    }
    gameList[roomNum].phase = 16;
    console.log(`\n~~~~~ Phase 16: Game End ~~~~~`);
    if(gameList[roomNum].winningTeam === 1) {
      console.log("Good has defeated Evil!");
    }
    else {
      console.log("Evil has defeated Good!");
    }
    for(j = 0; j < roomList[roomNum].length; j++) {
      io.to(roomList[roomNum][j].sid).emit("updateGameBoard", {
        gameBoardStr: gameStrBuilder.updateGameBoardStr(roomList[roomNum][j].character, roomList[roomNum], gameList[roomNum])
        });
      io.to(roomList[roomNum][j].sid).emit("updateActionPanel", {
        actionPanelStr: gameStrBuilder.updateActionPanelStr(roomList[roomNum][j].character, roomList[roomNum], gameList[roomNum])
      });
    }
  });

});
