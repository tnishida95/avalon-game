const utils = require('./utils');
const app = require('express')();
const path = require('path');
const serveStatic = require('serve-static');
app.use(serveStatic(__dirname + "/dist"));
const port = process.env.PORT || 3000;
const server = app.listen(port);
const io = require('socket.io')(server);
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
    // TODO: add input sanitization for name, roomNum
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
    // TODO: add input sanitization for name, roomNum
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
      // TODO: need to look into whether or not game can be looked at in the client...
      //   if it's easy, will need to send copy of the Game object with a revealedRoom set
      //   to each player every time a game update is sent to the client
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
    console.log(`[${data.self.name}] is ready`);
    game.waitingOnList.splice(game.waitingOnList.indexOf(data.self.name), 1);
    if(game.waitingOnList.length === 0) {
      console.log('all players ready, starting game');
      game.waitingOnList.push(room[game.partyLeader].name);
      // TODO: start the game
      for(let i = 0; i < roomList[roomNum].length; i++) {
        if(i === game.partyLeader) {
          io.to(roomList[roomNum][i].sid).emit('updateAction', {
            waitingOnList: game.waitingOnList,
            game: game,
            currentAction: 'PartySelect'
          });
        }
        else {
          io.to(roomList[roomNum][i].sid).emit('updateAction', {
            waitingOnList: game.waitingOnList,
            game: game,
            currentAction: 'Waiting'
          });
        }
      }
      console.log("\n~~~~~ Phase 0: Party Select ~~~~~");
    }
    else {
      io.to(roomNum).emit("updateAction", {
        waitingOnList: game.waitingOnList,
        game: game,
        currentAction: 'Pregame'
      });
    }
  });

  socket.on('btnPressPartySubmit', function(data) {
    const roomNum = data.roomNum;
    const partySelections = data.partySelections;
    if(roomList[roomNum] === undefined) {
      console.error(`room [${roomNum}] does not exist, returning to MainMenu`);
      io.to(socket.id).emit('loadMainMenu');
      return;
    }

    const game = gameList[roomNum];
    const room = game.room;
    console.log(`Client submitted party: ${partySelections}`);
    if(partySelections.length != game.questSize[getCurrentQuest(roomNum)]) {
      console.error(`\tBad party select at ${roomNum}:`);
      console.error(`\t\t${partySelections.length} selected, ${game.questSize[getCurrentQuest(roomNum)]} should be on.`);
      return;
    }
    game.phase++;
    console.log(`\n~~~~~ Phase ${game.phase}: Quest ${getCurrentQuest(roomNum) + 1}, Party Approval ~~~~~`);
    game.actionsTaken = 0;
    game.waitingOnList = [];
    for(let i = 0; i < room.length; i++) {
      game.waitingOnList.push(room[i].name);
    }

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
    io.to(roomNum).emit('updateAction', {
      waitingOnList: game.waitingOnList,
      game: game,
      currentAction: 'partyApproval'
    });
  });

  socket.on('btnPressPartyApproval', function(data) {
    const roomNum = data.roomNum;
    if(roomList[roomNum] === undefined) {
      console.error(`room [${roomNum}] does not exist, returning to MainMenu`);
      io.to(socket.id).emit('loadMainMenu');
      return;
    }

    const game = gameList[roomNum];
    const room = roomList[roomNum];
    game.waitingOnList.splice(game.waitingOnList.indexOf(data.self.name), 1);
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
        // party rejected, so...
        // ...record the history
        game.partyHistories[currentQuest].push(new PartyHistory(game.partyLeader, game.selectedParty, game.votes, false));

        // ...move the party leader
        game.partyLeader++;
        if(game.partyLeader === game.playerCount) {
          game.partyLeader = 0;
        }

        // ...increment partiesRejected and check if it's the fifth
        game.partiesRejected++;
        if(game.partiesRejected === 5) {
          // if five parties rejected, Evil wins
          game.phase = 16;
          game.winningTeam = 2;
          console.log(`\n~~~~~ Phase 16: Game End ~~~~~`);
          console.log("Here's the JSON of the game:", JSON.stringify(game));
          for(let i = 0; i < room.length; i++) {
            io.to(roomNum).emit('updateAction', {
              waitingOnList: game.waitingOnList,
              game: game,
              currentAction: 'gameEnd'
            });
          }
          return;
        }

        // ...return to party select phase
        game.phase--;
        console.log(`\n~~~~~ Phase ${game.phase}: Quest ${getCurrentQuest(roomNum) + 1}, Party Select ~~~~~`);
        game.waitingOnList = [room[game.partyLeader].name];
        for(let i = 0; i < roomList[roomNum].length; i++) {
          if(i === game.partyLeader) {
            io.to(room[i].sid).emit('updateAction', {
              waitingOnList: game.waitingOnList,
              game: game,
              currentAction: 'PartySelect'
            });
          }
          else {
            io.to(room[i].sid).emit('updateAction', {
              waitingOnList: game.waitingOnList,
              game: game,
              currentAction: 'Waiting'
            });
          }
        }
      } // end if (party rejected)
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

        game.waitingOnList = [];
        for(let i = 0; i < game.selectedParty.length; i++) {
          if(game.selectedParty[i] === -1) {
            break;
          }
          // this is kind of ugly, and a reason to redo the selectedParty system
          //   maybe just use the player names?
          game.waitingOnList.push(room[game.selectedParty[i]].name);
        }

        // ...send out Actions
        for(let i = 0; i < room.length; i++) {
          if(game.selectedParty.includes(i)) {
            io.to(room[i].sid).emit('updateAction', {
              waitingOnList: game.waitingOnList,
              game: game,
              currentAction: 'Questing'
            });
          }
          else {
            io.to(room[i].sid).emit('updateAction', {
              waitingOnList: game.waitingOnList,
              game: game,
              currentAction: 'Waiting'
            });
          }
        }
      } // end else (party approved)
    }
    else {
      // not everyone has voted; just update the waiting list
      io.to(roomNum).emit('updateAction', {
        waitingOnList: game.waitingOnList,
        game: game,
        currentAction: 'partyApproval'
      });
    }
  });

  socket.on('btnPressQuestAction', function(data) {
    const roomNum = data.roomNum;
    if(roomList[roomNum] === undefined) {
      console.error(`room [${roomNum}] does not exist, returning to MainMenu`);
      io.to(socket.id).emit('loadMainMenu');
      return;
    }
    const game = gameList[roomNum];
    const room = roomList[roomNum];
    game.waitingOnList.splice(game.waitingOnList.indexOf(data.self.name), 1);
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
        game.questHistories[currentQuest] = new QuestHistory(game.partyActions, true);
        console.log(`\t...Succeeded!`);
      }
      else {
        game.quests[currentQuest] = 2;
        game.questHistories[currentQuest] = new QuestHistory(game.partyActions, false);
        console.log(`\t...Failed!`);
      }
      // ...reset the party actions
      game.partyActions = [0,0,0,0,0,0,0,0,0,0];

      // ...change party leader
      game.partyLeader++;
      if(game.partyLeader === game.playerCount) {
        console.log(``);
        game.partyLeader = 0;
      }

      // ...move to next phase
      game.waitingOnList = [room[game.partyLeader].name];
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
        for(let i = 0; i < roomList[roomNum].length; i++) {
          if(i === game.partyLeader) {
            io.to(room[i].sid).emit('updateAction', {
              waitingOnList: game.waitingOnList,
              game: game,
              currentAction: 'PartySelect'
            });
          }
          else {
            io.to(room[i].sid).emit('updateAction', {
              waitingOnList: game.waitingOnList,
              game: game,
              currentAction: 'Waiting'
            });
          }
        }
      }
      else if(game.phase === 15) {
        console.log(`\n~~~~~ Phase 15: Assassin Phase ~~~~~`);
        // setting the waitingOnList to the Assassin player
        for(let i = 0; i < room.length; i++) {
          if(room[i].character === 'assassin') {
            game.waitingOnList = [room[i].name];
            break;
          }
        }
        for(let i = 0; i < room.length; i++) {
          if(room[i].character === 'assassin') {
            io.to(room[i].sid).emit('updateAction', {
              waitingOnList: game.waitingOnList,
              game: game,
              currentAction: 'Assassin'
            });
          }
          else {
            io.to(room[i].sid).emit('updateAction', {
              waitingOnList: game.waitingOnList,
              game: game,
              currentAction: 'Waiting'
            });
          }
        }
      }
      else {
        console.log(`\n~~~~~ Phase 16: Game End ~~~~~`);
        console.log("Here's the JSON of the game:", JSON.stringify(game));
        io.to(roomNum).emit('updateAction', {
          waitingOnList: game.waitingOnList,
          game: game,
          currentAction: 'GameEnd'
        });
      }
    } // end if questing had ended
    else {
      // not everyone has quested; just update the waiting list
      for(let i = 0; i < room.length; i++) {
        if(game.selectedParty.includes(i)) {
          io.to(room[i].sid).emit('updateAction', {
            waitingOnList: game.waitingOnList,
            game: game,
            currentAction: 'Questing'
          });
        }
        else {
          io.to(room[i].sid).emit('updateAction', {
            waitingOnList: game.waitingOnList,
            game: game,
            currentAction: 'Waiting'
          });
        }
      }
    }
  });

  socket.on('btnPressAssassinSubmit', function(data) {
    const roomNum = data.roomNum;
    if(roomList[roomNum] === undefined) {
      console.error(`room [${roomNum}] does not exist, returning to MainMenu`);
      io.to(socket.id).emit('loadMainMenu');
      return;
    }

    const game = gameList[roomNum];
    const room = roomList[roomNum];
    const assassinatedName = data.assassinatedName;
    for(let i = 0; i < room.length; i++) {
      if(room[i].name === assassinatedName) {
        game.assassinated = i;
      }
    }
    game.winningTeam = 0; // 1 = Good, 2 = Evil
    console.log(`The Assassin has chosen to assassinate ${assassinatedName}.`);
    if(room[game.assassinated].character === "merlin") {
      console.log(`Merlin [${room[game.assassinated].name}] has been assassinated!`);
      game.winningTeam = 2;
    }
    else {
      console.log(`Merlin survives!`);
      game.winningTeam = 1;
    }
    game.phase = 16;
    console.log(`\n~~~~~ Phase 16: Game End ~~~~~`);
    console.log("Here's the JSON of the game:", JSON.stringify(game));
    if(game.winningTeam === 1) {
      console.log("Good has defeated Evil!");
    }
    else {
      console.log("Evil has defeated Good!");
    }
    io.to(roomNum).emit('updateAction', {
      waitingOnList: game.waitingOnList,
      game: game,
      currentAction: 'GameEnd'
    });
  });

});
