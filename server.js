/*
server.js
Server-side javascript for avalon-game.

Tyler Nishida, tnishida95@gmail.com
*/

const express = require('express');
const app = express();
const port = process.env.PORT || 2000;

// eslint-disable-next-line
const serv = require('http').Server(app);
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use('/', express.static(__dirname + '/'));
serv.listen(port);
console.log(`Server started listening on port ${port}.`);
const gameStrBuilder = require('./gameStrBuilder');
const utils = require('./utils');

const io = require('socket.io')(serv, {});
// array of sockets
const socketList = [];

// key: roomNum, val: array of Player objects in the room
const roomList = {};
// key: roomNum, val: GameManager objects
const gameList = {};

/**
 * The player object.
 * @constructor
 * @param {int} socketid - The socket id of the player.
 * @param {string} name - The self-given player name.
 * @param {string} character - The character of the player.
 */
function Player(socketid, name, character) {
  this.sid = socketid;
  this.name = name;
  this.character = character;
}

/**
 * History of party selections.
 * @constructor
 * @param {int} partyLeader - Index of the leader in the room
 * @param {Array} selectedParty - Array containing the room indices of selected party members
 * @param {Array} votes - Array of approval votes
 * @param {boolean} isApproved - True if the party was approved
 */
function PartyHistory(partyLeader, selectedParty, votes, isApproved) {
  this.partyLeader = partyLeader;
  this.selectedParty = Array.from(selectedParty);
  this.votes = Array.from(votes);
  this.isApproved = isApproved;
}

/**
 * History of the actions taken on a quest.
 * @constructor
 * @param {Array} actions - Array of the action taken by the questing party
 * @param {boolean} isSuccessful - True if the quest
 */
function QuestHistory(actions, isSuccessful) {
  this.actions = Array.from(actions);
  this.isSuccessful = isSuccessful;
}

/**
 * The GameManager object, responsible for keeping track
 * of the variables involves in game logic.
 * @constructor
 * @param {Array} room - The list of players in the game.
 */
function GameManager(room) {
  this.room = room;
  this.playerCount = room.length;
  this.partyHistories = [];
  this.questHistories = [];

  // number of good and evil characters
  if(this.playerCount == 5) {this.goodNum = 3; this.evilNum = 2;}
  if(this.playerCount == 6) {this.goodNum = 4; this.evilNum = 2;}
  if(this.playerCount == 7) {this.goodNum = 4; this.evilNum = 3;}
  if(this.playerCount == 8) {this.goodNum = 5; this.evilNum = 3;}
  if(this.playerCount == 9) {this.goodNum = 6; this.evilNum = 3;}
  if(this.playerCount == 10) {this.goodNum = 6; this.evilNum = 4;}

  // array with the size of each quest; remember it is base 0
  if(this.playerCount == 5) {this.questSize = [2,3,2,3,3];}
  if(this.playerCount == 6) {this.questSize = [2,3,4,3,4];}
  if(this.playerCount == 7) {this.questSize = [2,3,3,4,4];}
  if(this.playerCount == 8) {this.questSize = [3,4,4,5,5];}
  if(this.playerCount == 9) {this.questSize = [3,4,4,5,5];}
  if(this.playerCount == 10) {this.questSize = [3,4,4,5,5];}

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

  // these numbers refer to the indices of Players in array at room
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
function printSocketList() {
  process.stdout.write('socketList: ');
  for(let i = 0; i < socketList.length; i++) {
    process.stdout.write(`[${socketList[i].id.substring(0,5)}...]`);
  }
  console.log('');
}

/** Prints the list of rooms. */
function printRoomList() {
  console.log("-------------------------");
  let listSize = 0;
  for(const roomNums in roomList) {
    listSize++;
    process.stdout.write("Room #" + roomNums + ": ");
    for(let i = 0; i < roomList[roomNums].length; i++) {
      process.stdout.write("[" + roomList[roomNums][i].sid + ":" + roomList[roomNums][i].name + "]");
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
  const game = gameList[roomNum];
  let barWidth = 0;
  let innerText = "";
  let outerText = "";
  if(progressType === "approvingParty") {
    barWidth = (game.actionsTaken / game.playerCount) * 100;
    innerText = `${game.actionsTaken} players voted...`;
    outerText = `...out of ${game.playerCount}`;
  }
  else if (progressType === "partyApproved") {
    barWidth = 100;
    innerText = `Party accepted!  Players are questing...`;
  }
  else if (progressType === "partyRejected") {
    barWidth = 100;
    innerText = `Party rejected.  ${game.room[game.partyLeader].name} is selecting a party.`;
  }
  else if (progressType === "questing") {
    barWidth = (game.actionsTaken / game.playerCount) * 100;
    innerText = `${game.actionsTaken} players departed...`;
    outerText = `...out of ${game.playerCount}`;
  }
  else if (progressType === "questEnded") {
    if(game.phase === 15) {
      barWidth = 100;
      innerText = `Three quests were successful! The Assassin is attempting to assassinate Merlin.`;
    }
    else if(game.failures === 0) {
      barWidth = 100;
      innerText = `Quest succeeded! ${game.room[game.partyLeader].name} is selecting a party.`;
    }
    else {
      const partySize = game.successes + game.failures;
      barWidth = (game.successes / partySize) * 100;
      innerText = `${game.successes} / ${partySize} tried to succeed...`;

      // if it's the fourth quest that's ending,
      //   and a 7 or more player game,
      //   and only one failure, it's
      //   still a success
      if(game.phase === 11 &&
         (game.room.length > 6) &&
         game.failures === 1) {
        outerText = `...quest succeeded! ${game.room[game.partyLeader].name} is selecting a party.`;
      }
      else {
        outerText = `...quest failed! ${game.room[game.partyLeader].name} is selecting a party.`;
      }
    }
  }
  for(let j = 0; j < game.room.length; j++) {
    io.to(game.room[j].sid).emit("updateProgressBar", {
      barWidth: barWidth.toString() + "%",
      innerText: innerText,
      outerText: outerText
    });
  }
}

/**
 * Player creation function to handle chracter reservations and console logging.
 * @param {int} socket - The socket of the player.
 * @param {string} playerName - The self-given player name.
 * @return {Player} - The Player object.
 */
function createPlayer(socket, playerName) {
  let player;
  if(playerName === process.env.MORDRED) {
    player = new Player(socket.id, "Tyler", "mordred");
  }
  else if(playerName === process.env.MORGANA) {
    player = new Player(socket.id, "Tyler", "morgana");
  }
  else {
    player = new Player(socket.id, playerName, "none");
  }
  console.log("Created new Player:");
  console.log("\tsocket id: " + player.sid);
  console.log("\tname: " + player.name);
  console.log("\tcharacter: " + player.character);
  return player;
}

// upon new socket connection
io.on('connection', function(socket) {
  socketList[socketList.length] = socket;
  console.log('new socket connection: ' + socket.id);
  printSocketList();

  socket.on('disconnect',function() {
    // get the index of the socket that just dc'd, cut it out of lists
    const index = socketList.indexOf(socket.id);
    socketList.splice(index,1);
    console.log('socket [' + socket.id + '] disconnected');
    printSocketList();
    // TODO: update any rooms with the socket of the dc
  });
  socket.on('btnPressNewGame',function(data) {
    console.log("New Game button pressed");

    // generate unique, four digit roomNum [1000,9999]
    let roomNum;
    do {
      roomNum = Math.floor(Math.random() * 9000) + 1000;
    }
    while (roomNum in roomList);

    // TODO: this is for testing purposes, remove in full release version
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
  socket.on('btnPressJoinGame',function(data) {
    const roomNum = (data.roomNum).toString();
    console.log("Join Game button pressed with roomNum: " + roomNum);
    if(gameList[roomNum] != null) {
      // checking if player is rejoining a game
      const game = gameList[roomNum];
      const room = game.room;
      for(let i = 0; i < room.length; i++) {
        if(room[i].name === data.name) {
          console.log(`Player [${data.name}] is rejoining the game in room [${roomNum}].`);
          socket.join(roomNum);
          room[i].sid = socket.id;
          const charArray = [];
          for(let j = 0; j < room.length; j++) {
            charArray.push(room[j].character);
          }
          io.to(room[i].sid).emit("loadGameScreen", {
            list: room,
            roomNum: roomNum,
            gameScreenStr: buildGameScreen(roomNum, room[i].character, charArray)
          });
          io.to(room[i].sid).emit("updateGameBoard", {
            gameBoardStr: gameStrBuilder.updateGameBoardStr(room[i].character, room, gameList[roomNum])
          });
          io.to(room[i].sid).emit("updateActionPanel", {
            actionPanelStr: gameStrBuilder.updateActionPanelStr(room[i].character, room, gameList[roomNum])
          });
          return;
        }
      } // end rejoin
      console.log("\tGame already in progress, cannot join.");
    }
    else if(roomNum in roomList) {
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
  socket.on('btnPressLeaveGame',function(data) {
    const roomNum = data.roomNum;
    // removing the player from the lobby
    for(let i = 0; i < roomList[roomNum].length; i++) {
      if(roomList[roomNum][i].sid === socket.id) {
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
    // if there is no one in the room, remove it
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
  socket.on('btnPressDisbandGame',function(data) {
    const roomNum = data.roomNum;
    console.log("Disband Game button pressed for roomNum: " + roomNum);
    io.to(roomNum).emit("loadMainMenu", {
      list: roomList[roomNum],
      num: roomNum
    });
    // make all sockets leave the room
    for(let i = 0; i < roomList[roomNum].length; i++) {
      console.log("\tLeft the socket room: " + roomList[roomNum][i].name);
      io.connected[(roomList[roomNum][i].sid)].leave(roomNum);
    }
    delete roomList[roomNum];
    printRoomList();
  });
  socket.on('btnPressStartGame',function(data) {
    const roomNum = data.roomNum;
    const characterSelections = data.charList;
    console.log("Start Game button pressed for roomNum: " + roomNum);

    const {isValid, message, charArray} = utils.assignCharacters(characterSelections, roomList[roomNum]);
    if(!isValid) {
      io.to(socket.id).emit("invalidCharacterSelect", {
        message: message
      });
      return;
    }

    // create a new GameManager and designate the first party leader
    gameList[roomNum] = new GameManager(roomList[roomNum]);
    const game = gameList[roomNum];
    const room = game.room;
    game.partyLeader = Math.floor(Math.random() * room.length);
    console.log(`Party Leader assigned to player at index [${game.partyLeader}]: [${room[game.partyLeader].name}]`);

    console.log("sending out game boards...");
    for(let j = 0; j < room.length; j++) {
      process.stdout.write("\tsending board to [" + room[j].sid + "]...");
      io.to(room[j].sid).emit("loadGameScreen", {
        list: room,
        gameScreenStr: buildGameScreen(roomNum, room[j].character, charArray)
      });
      console.log("board sent");
    }
    for(let j = 0; j < room.length; j++) {
      io.to(room[j].sid).emit("updateGameBoard", {
        gameBoardStr: gameStrBuilder.updateGameBoardStr(room[j].character, room, game)
      });
      io.to(room[j].sid).emit("updateActionPanel", {
        actionPanelStr: gameStrBuilder.updateActionPanelStr(room[j].character, room, game)
      });
    }
    console.log("\n~~~~~ Phase 0: Party Select ~~~~~");
  });
  socket.on('btnPressPartySubmit',function(data) {
    const partySelections = data.partySelections;
    const roomNum = data.roomNum;
    const game = gameList[data.roomNum];
    const room = game.room;
    let currentQuest;
    if(game.phase == 0) {currentQuest = 0;}
    else if(game.phase == 3) {currentQuest = 1;}
    else if(game.phase == 6) {currentQuest = 2;}
    else if(game.phase == 9) {currentQuest = 3;}
    else if(game.phase == 12) {currentQuest = 4;}
    else {console.error("Party submitted, but not in partySelect phase.");}
    console.log(`Client submitted party: ${partySelections}`);
    if(partySelections.length != game.questSize[currentQuest]) {
      console.error(`\tBad party select at ${roomNum}:`);
      console.error(`\t\t${partySelections.length} selected, ${game.questSize[currentQuest]} should be on.`);
      return;
    }
    game.phase++;
    console.log(`\n~~~~~ Phase ${game.phase}: Quest ${getCurrentQuest(roomNum) + 1}, Party Approval ~~~~~`);

    game.actionsTaken = 0;

    // filling out the selectedParty array...
    // TODO: this could use some optimization
    let partySlot = 0;
    game.selectedParty = [-1,-1,-1,-1,-1,-1];
    for(let i = 0; i < partySelections.length; i++) {
      // console.log(`Looking at ${partySelections[i]}...`);
      for(let j = 0; j < room.length; j++) {
        if(partySelections[i] === room[j].name) {
          game.selectedParty[partySlot] = j;
          partySlot++;
          // console.log(`\tselectedParty[${partySlot}]: ${j}`);
          break;
        }
      }
    }
    console.log(`selectedParty array: ${game.selectedParty}`);
    for(let j = 0; j < room.length; j++) {
      io.to(room[j].sid).emit("updateGameBoard", {
        gameBoardStr: gameStrBuilder.updateGameBoardStr(room[j].character, room, game)
      });
      io.to(room[j].sid).emit("updateActionPanel", {
        actionPanelStr: gameStrBuilder.updateActionPanelStr(room[j].character, room, game)
      });
    }
  });
  socket.on('btnPressPartyApproval',function(data) {
    const roomNum = data.roomNum;
    const game = gameList[roomNum];
    const room = roomList[roomNum];
    // find out which player pressed it, and save the vote
    for(let i = 0; i < room.length; i++) {
      if(socket.id === room[i].sid) {
        game.votes[i] = data.vote;
        console.log(`\tParty Approval: [${room[i].name}] voted: ${data.vote}.`);
        break;
      }
    }
    game.actionsTaken++;
    const currentQuest = getCurrentQuest(roomNum);

    // if everyone has voted
    if(game.actionsTaken === game.playerCount) {
      // record the party and votes
      if(game.partiesRejected === 0) {
        game.approvalHistory[currentQuest] = [];
        game.partyHistory[currentQuest] = [];
      }
      game.approvalHistory[currentQuest][game.partiesRejected] = [];
      game.partyHistory[currentQuest][game.partiesRejected] = [];
      for(let i = 0; i < game.playerCount; i++) {
        game.approvalHistory[currentQuest][game.partiesRejected][i] = game.votes[i];
      }
      for(let i = 0; i < game.questSize[currentQuest]; i++) {
        game.partyHistory[currentQuest][game.partiesRejected][i] = game.selectedParty[i];
      }
      console.log(`approvalHistory[${currentQuest}][${game.partiesRejected}]: ${game.approvalHistory[currentQuest][game.partiesRejected]}`);
      console.log(`partyHistory[${currentQuest}][${game.partiesRejected}]: ${game.partyHistory[currentQuest][game.partiesRejected]}`);

      // tally the accepts and rejects
      let accepts = 0;
      let rejects = 0;
      console.log(`Final approval vote cast.  Votes:\n\t${game.votes}`);
      for(let i = 0; i < 10; i++) {
        if(game.votes[i] === 1) {
          accepts++;
        }
        else if(game.votes[i] === 2) {
          rejects++;
        }
        else if(game.votes[i] === 0) {
          break;
        }
      }
      console.log(`Accepts: ${accepts}, Rejects: ${rejects}`);
      if(game.partyHistories[currentQuest] == null) {
        game.partyHistories[currentQuest] = [];
      }
      if(rejects >= accepts) {
        // quest rejected, so...
        // ...record the history
        game.partyHistories[currentQuest].push(new PartyHistory(game.partyLeader, game.selectedParty, game.votes, false));

        // ...move the party leader
        game.partyLeader++;
        if(game.partyLeader === game.playerCount) {
          game.partyLeader = 0;
        }

        // TODO: is this right?
        // ...increment partiesRejected and check if it's the fifth
        game.partiesRejected++;
        if(game.partiesRejected === 5) {
          game.phase = 15;
        }

        // ...return to party select phase
        game.phase--;
        console.log(`\n~~~~~ Phase ${game.phase}: Quest ${getCurrentQuest(roomNum) + 1}, Party Select ~~~~~`);
        updateProgressBar("partyRejected", roomNum);
      }
      else {
        // approved and moving to quest phase now, so...
        // ...record the history
        game.partyHistories[currentQuest].push(new PartyHistory(game.partyLeader, game.selectedParty, game.votes, true));

        // ...change the game phase
        game.phase++;
        console.log(`\n~~~~~ Phase ${game.phase}: Quest ${getCurrentQuest(roomNum) + 1}, Questing ~~~~~`);

        // ...reset all the relevant variables
        game.actionsTaken = 0;
        game.successes = 0;
        game.failures = 0;
        // maybe these go after party select?
        game.partiesRejected = 0;
        game.votes = [0,0,0,0,0,0,0,0,0,0];

        updateProgressBar("partyApproved", roomNum);
      }
      for(let j = 0; j < room.length; j++) {
        io.to(room[j].sid).emit("updateGameBoard", {
          gameBoardStr: gameStrBuilder.updateGameBoardStr(room[j].character, room, game)
        });
        io.to(room[j].sid).emit("updateActionPanel", {
          actionPanelStr: gameStrBuilder.updateActionPanelStr(room[j].character, room, game)
        });
      }
    }
    else {
      updateProgressBar("approvingParty", roomNum);
    }
  });
  socket.on('btnPressQuestAction',function(data) {
    const roomNum = data.roomNum;
    const game = gameList[roomNum];
    const room = roomList[roomNum];
    // find out which player pressed it, and save the action
    for(let i = 0; i < room.length; i++) {
      if(socket.id === room[i].sid) {
        game.partyActions[i] = data.questAction;
        console.log(`\tQuest Action: [${room[i].name}] quested: ${data.questAction}.`);
        break;
      }
    }
    if(data.questAction === 1) {
      game.successes++;
    }
    else {
      game.failures++;
    }
    game.actionsTaken++;
    const currentQuest = getCurrentQuest(roomNum);
    if(game.actionsTaken === game.questSize[currentQuest]) {
      // quest has ended, so now...

      console.log("Final quest action taken. Quest...");
      if(game.questHistories[currentQuest] == null) {
        game.questHistories[currentQuest] = [];
      }

      // ...determine successfulness
      // if no failures OR
      //   4th quest AND more than six players AND less than two failures
      if(game.failures === 0 ||
         (currentQuest === 3 && room.length > 6 && game.failures < 2) ) {
        game.quests[currentQuest] = 1;
        game.questHistories[currentQuest].push(new QuestHistory(game.partyActions, true));
        console.log(`\t...Succeeded!`);
      }
      else {
        game.quests[currentQuest] = 2;
        game.questHistories[currentQuest].push(new QuestHistory(game.partyActions, false));
        console.log(`\t...Failed!`);
      }

      // ...change party leader
      game.partyLeader++;
      if(game.partyLeader === game.playerCount) {
        console.log(``);
        game.partyLeader = 0;
      }

      // ...update clients with next phase
      updateProgressBar("questEnded", roomNum);
      game.phase++;

      // count successes and failures
      let currentSuccesses = 0;
      let currentFailures = 0;
      for(let i = 0; i < 5; i++) {
        if(game.quests[i] === 1) {
          currentSuccesses++;
        }
        else if (game.quests[i] === 2) {
          currentFailures++;
        }
        else {
          break;
        }
      }
      if(currentSuccesses >= 3) {
        game.phase = 15;
      }
      if(currentFailures >= 3) {
        game.phase = 16;
        game.winningTeam = 2;
      }

      if(game.phase < 15) {
        console.log(`\n~~~~~ Phase ${game.phase}: Quest ${getCurrentQuest(roomNum) + 1}, Party Select ~~~~~`);
      }
      else if(game.phase === 15) {
        console.log(`\n~~~~~ Phase 15: Assassin Phase ~~~~~`);
      }
      else {
        console.log(`\n~~~~~ Phase 16: Game End ~~~~~`);
        console.log("Here's the JSON of the game:", JSON.stringify(game));
      }
      for(let j = 0; j < room.length; j++) {
        io.to(room[j].sid).emit("updateGameBoard", {
          gameBoardStr: gameStrBuilder.updateGameBoardStr(room[j].character, room, game)
        });
        io.to(room[j].sid).emit("updateActionPanel", {
          actionPanelStr: gameStrBuilder.updateActionPanelStr(room[j].character, room, game)
        });
      }
    }
  });
  socket.on('btnPressAssassinSubmit',function(data) {
    const roomNum = data.roomNum;
    const assassinatedName = data.assassinSelection;
    for(let i = 0; i < roomList[roomNum].length; i++) {
      if(roomList[roomNum][i].name === assassinatedName) {
        gameList[roomNum].assassinated = i;
      }
    }
    gameList[roomNum].winningTeam = 0; // 1 = Good, 2 = Evil
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
    console.log("Here's the JSON of the game:", JSON.stringify(gameList[roomNum]));
    if(gameList[roomNum].winningTeam === 1) {
      console.log("Good has defeated Evil!");
    }
    else {
      console.log("Evil has defeated Good!");
    }
    for(let j = 0; j < roomList[roomNum].length; j++) {
      io.to(roomList[roomNum][j].sid).emit("updateGameBoard", {
        gameBoardStr: gameStrBuilder.updateGameBoardStr(roomList[roomNum][j].character, roomList[roomNum], gameList[roomNum])
      });
      io.to(roomList[roomNum][j].sid).emit("updateActionPanel", {
        actionPanelStr: gameStrBuilder.updateActionPanelStr(roomList[roomNum][j].character, roomList[roomNum], gameList[roomNum])
      });
    }
  });
});
