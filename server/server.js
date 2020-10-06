const utils = require('./utils');
const app = require('express')();
const serv = require('http').createServer(app);
const port = process.env.PORT || 3000;
serv.listen(port);
const io = require('socket.io')(serv);
console.log(`Server started listening on port ${port}.`);

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
 * @param {Array} partyActions - Array of the action taken by the questing party
 * @param {boolean} isSuccessful - True if the quest
 */
function QuestHistory(partyActions, isSuccessful) {
  this.partyActions = Array.from(partyActions);
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

  // contains an array of possible parties
  this.partyHistories = [];
  // contains a single quest history per index
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
  this.partyActions = [0,0,0,0,0,0,0,0,0,0];
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

  // names of players that the game is waiting on to proceed
  this.waitingOnList = [];
  for(let i = 0; i < room.length; i++) {
    this.waitingOnList.push(room[i].name);
  }
}

/** Prints the list of connected sockets. */
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

io.on('connection', (socket) => {
  socketList[socketList.length] = socket;
  console.log(`socket [${socket.id}] connected, there are ${socketList.length} connections`);
  printSocketList();

  socket.on('disconnect', function() {
    // get the index of the socket that just dc'd, cut it out of lists
    const index = socketList.indexOf(socket.id);
    socketList.splice(index, 1);
    console.log(`socket [${socket.id}] disconnected`);
    printSocketList();
    // TODO: if the host of a party disconnects, the room should be removed
    // TODO: if all players in a game have disconnected, the room and game should be removed
  });

  socket.on('btnPressNewGame', function(data) {
    console.log(`[${data.name}] pressed New Game`);
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
    io.to(roomNum).emit("updateLobby", {
      room: roomList[roomNum],
      roomNum: roomNum.toString()
    });
  });
  socket.on('btnPressJoinGame', function(data) {
    const roomNum = (data.roomNum).toString();
    console.log(`[${data.name}] pressed Join Game with roomNum: ${data.roomNum}`);
    if(gameList[roomNum] != null) {
      const game = gameList[roomNum];
      const room = game.room;
      // checking if player is rejoining a game
      for(let i = 0; i < room.length; i++) {
        if(room[i].name === data.name) {
          console.log(`Player [${data.name}] is rejoining the game in room [${roomNum}].`);
          socket.join(roomNum);
          room[i].sid = socket.id;
          io.to(room[i].sid).emit("loadGame", {
            self: {
              sid: room[i].sid,
              name: room[i].name,
              character: utils.getPrettyName(room[i].character)
            },
            room: utils.getRevealedRoom(data.charList, room, room[i].character),
            waitingOnList: gameList[roomNum].waitingOnList
          });
          return;
        }
      } // end rejoin
      console.log(`player tried to join room [${roomNum}], but game is already in progress`);
      io.to(socket.id).emit("error", {
        message: 'Game is already in progress, cannot join.'
      });
      return;
    }
    else if(roomNum in roomList) {
      // first, make sure there won't be duplicate names
      for(let i = 0; i < roomList[roomNum].length; i++) {
        if(data.name === roomList[roomNum][i].name) {
          console.log(`player tried to join room [${roomNum}] with duplicate name [${data.name}]`);
          io.to(socket.id).emit("error", {
            message: 'Someone in the lobby already has that name.'
          });
          return;
        }
      }

      roomList[roomNum].push(createPlayer(socket, data.name));
      printRoomList();
      socket.join(roomNum);
      io.to(roomNum).emit("updateLobby", {
        room: roomList[roomNum],
        roomNum: roomNum
      });
    }
    else {
      console.log(`room [${roomNum}] not found`);
      io.to(socket.id).emit("error", {
        message: `Room ${roomNum} not found.`
      });
    }
  });
  socket.on('btnPressLeaveGame', function(data) {
    const roomNum = data.roomNum;
    if(roomList[roomNum] !== undefined) {
      // removing the player from the lobby
      for(let i = 0; i < roomList[roomNum].length; i++) {
        if(roomList[roomNum][i].sid === socket.id) {
          console.log("Leave Game button pressed by: " + roomList[roomNum][i].name);
          roomList[roomNum].splice(i, 1);
          break;
        }
      }
      socket.leave(roomNum);
      printRoomList();
      io.to(roomNum).emit("updateLobby", {
        room: roomList[roomNum],
        roomNum: roomNum
      });
    }
    else {
      console.error(`room [${roomNum}] does not exist, returning to MainMenu`);
    }
    io.to(socket.id).emit('loadMainMenu');
  });
  socket.on('btnPressDisbandGame', function(data) {
    const roomNum = data.roomNum;
    console.log("Disband Game button pressed for roomNum: " + roomNum);
    if(roomList[roomNum] !== undefined) {
      io.to(roomNum).emit("loadMainMenu");
      // make all sockets leave the room
      for(let i = 0; i < roomList[roomNum].length; i++) {
        socket.leave(roomNum);
        console.log("\tLeft the socket room: " + roomList[roomNum][i].name);
      }
      delete roomList[roomNum];
      printRoomList();
    }
    else {
      console.error(`room [${roomNum}] does not exist, returning to MainMenu`);
      io.to(socket.id).emit('loadMainMenu');
    }

  });
  socket.on('btnPressStartGame', function(data) {
    const roomNum = data.roomNum;
    const characterSelections = [...data.charList];
    console.log("Start Game button pressed for roomNum: " + roomNum);

    // TODO: investigate if there's a way to handle this better...try/catch maybe?
    if(roomList[roomNum] === undefined) {
      console.error(`room [${roomNum}] does not exist, returning to MainMenu`);
      io.to(socket.id).emit('loadMainMenu');
      return;
    }

    const {isValid, message} = utils.assignCharacters(characterSelections, roomList[roomNum]);
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
    for(let i = 0; i < roomList[roomNum].length; i++) {
      const revealedRoom = utils.getRevealedRoom(data.charList, roomList[roomNum], roomList[roomNum][i].character);
      game.room = revealedRoom;
      io.to(roomList[roomNum][i].sid).emit("loadGame", {
        self: {
          sid: roomList[roomNum][i].sid,
          name: roomList[roomNum][i].name,
          character: utils.getPrettyName(roomList[roomNum][i].character)
        },
        room: revealedRoom,
        waitingOnList: gameList[roomNum].waitingOnList,
        game: game,
        characterSelections: [...data.charList]
      });
    }
  });
  socket.on('btnPressReady', function(data) {
    const roomNum = data.roomNum;
    if(roomList[roomNum] === undefined) {
      console.error(`room [${roomNum}] does not exist, returning to MainMenu`);
      io.to(socket.id).emit('loadMainMenu');
      return;
    }

    const game = gameList[roomNum];
    const room = game.room;
    game.waitingOnList.splice(game.waitingOnList.indexOf(data.self.name), 1);
    if(game.waitingOnList.length === 0) {
      console.log('all players ready, starting game');
      game.waitingOnList.push(room[game.partyLeader].name);
      // TODO: start the game
      for(let i = 0; i < roomList[roomNum].length; i++) {
        if(i === game.partyLeader) {
          io.to(roomList[roomNum][i].sid).emit('updateAction', {
            waitingOnList: game.waitingOnList,
            currentAction: 'PartySelect'
          });
        }
        else {
          io.to(roomList[roomNum][i].sid).emit('updateAction', {
            waitingOnList: game.waitingOnList,
            currentAction: 'Waiting'
          });
        }
      }
      console.log("\n~~~~~ Phase 0: Party Select ~~~~~");
    }
    else {
      io.to(roomNum).emit("updateAction", {
        waitingOnList: game.waitingOnList,
        currentAction: 'Pregame'
      });
    }
  });

});
