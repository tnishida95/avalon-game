/*
app.js
Server-side javascript for avalon-game.

Tyler Nishida, tnishida95@gmail.com
*/

var express = require('express');
var app = express();
var serv = require('http').Server(app);
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/index.html');
});
app.use('/',express.static(__dirname + '/'));
serv.listen(2000);
console.log("Server started listening on port 2000.");
var gameStrBuilder = require('./gameStrBuilder');

const io = require('socket.io')(serv,{});
//array of sockets
var socketList = [];
//array of playerids
var playerList = [];

//key: roomNum, val: array of Player objects in the room
var roomList = {};
//key: roomNum, val: GameManager objects
var gameList = {};

//growing value to give unique ids to all connections
var playerid = 0;

function Player(idInt, socketidInt, nameString, characterString) {
	this.id = idInt;
	this.sid = socketidInt;
	this.name = nameString;
	this.character = characterString;
}
function GameManager(playerCountInt) {
	//how many players in the game
	this.playerCount = playerCountInt;
	//number of good and evil characters
	if(playerCountInt == 5) {this.goodNum = 3; this.evilNum = 2;}
	if(playerCountInt == 6) {this.goodNum = 4; this.evilNum = 2;}
	if(playerCountInt == 7) {this.goodNum = 4; this.evilNum = 3;}
	if(playerCountInt == 8) {this.goodNum = 5; this.evilNum = 3;}
	if(playerCountInt == 9) {this.goodNum = 6; this.evilNum = 3;}
	if(playerCountInt == 10) {this.goodNum = 6; this.evilNum = 4;}

	//array with the size of each quest; remember it is base 0
	if(playerCountInt == 5) {this.questSize = [2,3,2,3,3];}
	if(playerCountInt == 6) {this.questSize = [2,3,4,3,4];}
	if(playerCountInt == 7) {this.questSize = [2,3,3,4,4];}
	if(playerCountInt == 8) {this.questSize = [3,4,4,5,5];}
	if(playerCountInt == 9) {this.questSize = [3,4,4,5,5];}
	if(playerCountInt == 10) {this.questSize = [3,4,4,5,5];}

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
	this.votesRejected = 0;
	/*
	0 = no status
	1 = success
	2 = fail
	*/
	this.quests = [0,0,0,0,0];

	this.successes = 0;
	this.failures = 0;

	//these numbers refer to the indices of Players in array at roomList[roomNum]
	this.partyLeader = 0;
	//could assign this a new array every time a new quest comes up
	//example usage: [0,2,3] -> the first, third, and fourth player in the room
	//	are in the party
	this.selectedParty = [-1,-1,-1,-1,-1,-1];

	//TODO NEXT NEXT: add data structure that captures the accepts/rejects from players
}

function printPlayerList() {
	if(playerList.length < 1) return;
	process.stdout.write("playerList: ");
	for(i = 0; i < playerList.length; i++)
		process.stdout.write("[" + playerList[i] + "]");
	console.log("");
}
function printRoomList() {
	console.log("-------------------------");
	var listSize = 0;
	for(roomNums in roomList) {
			listSize++;
			process.stdout.write("Room #" + roomNums + ": ");
			for(i = 0; i < roomList[roomNums].length; i++) {
				process.stdout.write("[" + roomList[roomNums][i].id + ":" + roomList[roomNums][i].name + "]");
			}
			console.log("");
	}
	if(listSize == 0) {
		console.log("no occupied rooms");
	}
	console.log("-------------------------");
}

function buildGameScreen(roomNum, character, charArray) {
	var firstGameBoardStr = gameStrBuilder.buildFirstGameBoardStr(gameList[roomNum].questSize);
	var firstActionPanelStr = gameStrBuilder.buildFirstActionPanelStr();
	var firstPlayerBoardStr = gameStrBuilder.buildFirstPlayerBoardStr(character, roomList[roomNum], charArray, gameList[roomNum].goodNum, gameList[roomNum].evilNum);
	var firstGameScreenStr = firstGameBoardStr +
	`<div id="progressDiv" class="progress text-center">
		<div class="progress-bar" style="width: 0%"></div>
		<p>PARTY SELECTION</p>
	</div>
	<hr>` + firstActionPanelStr + firstPlayerBoardStr;
	return firstGameScreenStr;
}

function updateActionPanel(roomNum, character) {
	return gameStrBuilder.updateActionPanelStr(character, roomList[roomNum], gameList[roomNum]);
}
function updatePlayerBoard(roomNum, character) {
	//TODO: this one will NOT replace the actionPanelDiv
	//it will change the text at status inside the status buttons only
	//consider making this function handle only one status button at a time, and have it loop and to update each player
	return;
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
		var index = playerList.indexOf(socket.num);
		socketList.splice(index,1);
		playerList.splice(index,1);
		console.log('player #' + socket.num + ' disconnected');
		printPlayerList();
		//TODO: update any rooms with the socket of the dc
	});
	socket.on('btnPressNewGame',function(data){
		console.log("New Game button pressed");
		if(data == "ShoyuMordred") {
			var player = new Player(socket.num, socket.id, "Tyler", "mordred");
		}
		else {
			var player = new Player(socket.num, socket.id, data, "none");
		}
		console.log("Created new Player:");
		console.log("\tid: " + player.id);
		console.log("\tname: " + player.name);
		console.log("\tcharacter: " + player.character);
		//generate unique, four digit roomNum [1000,9999]
		do {
			roomNum = Math.floor(Math.random() * 9000) + 1000;
		}
		while (roomNum in roomList);
		//making an array of players that will fill the room
		var tmpArr = [player];
		roomList[roomNum] = tmpArr;
		printRoomList();
		socket.join(roomNum);
		io.to(roomNum).emit("loadLobby", {
			list: roomList[roomNum],
			num: roomNum,
			hostLobbyStr: gameStrBuilder.buildHostLobbyStr(),
			guestLobbyStr: gameStrBuilder.buildGuestLobbyStr()
		});
	});
	socket.on('btnPressJoinGame',function(data){
		roomNum = (data.room).toString();
		console.log("Join Game button pressed with roomNum: " + roomNum);
		if(roomNum in roomList) {
			if(data.name == "ShoyuMordred") {
				var player = new Player(socket.num, socket.id, "Tyler", "mordred");
			}
			else {
				var player = new Player(socket.num, socket.id, data.name, "none");
			}
			console.log("Created new Player:");
			console.log("\tid: " + player.id);
			console.log("\tname: " + player.name);
			console.log("\tcharacter: " + player.character);
			roomList[roomNum][roomList[roomNum].length] = player;
			printRoomList();
			socket.join(roomNum);
			io.to(roomNum).emit("loadLobby", {
				list: roomList[roomNum],
				num: roomNum,
				hostLobbyStr: gameStrBuilder.buildHostLobbyStr(),
				guestLobbyStr: gameStrBuilder.buildGuestLobbyStr()
			});
			io.to(roomNum).emit("updateLobby", {
				list: roomList[roomNum],
				num: roomNum
			});
		}
		else {
			console.log("roomNum " + roomNum + " not found");
		}
	});
	socket.on('btnPressLeaveGame',function(data){
		roomNum = data.room;
		//removing the player from the lobby
		for(i = 0; i < roomList[roomNum].length; i++) {
			if(roomList[roomNum][i].sid == socket.id) {
				console.log("Leave Game button pressed by: " + roomList[roomNum][i].name);
				roomList[roomNum].splice(i,1);
				break;
			}
		}
		socket.leave(roomNum);
		printRoomList();
		io.to(roomNum).emit("updateLobby", {
			list: roomList[roomNum],
			num: roomNum
		});
	});
	socket.on('btnPressDisbandGame',function(data){
		roomNum = data.room;
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
		roomNum = data.room;
		var characterSelections = data.charList;
		console.log("Start Game button pressed for roomNum: " + roomNum);
		if(characterSelections.length != roomList[roomNum].length) {
			console.error("invalid character selection: player count does not equal character count");
			return;
		}
		var goodCount = 0;
		var evilCount = 0;
		var charArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];

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
			else if (characters == "evilThree") {charArray[13] = 1;	evilCount++;}
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
		var charArrayCopy = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		for(i = 0; i < 14; i++) {
			if(charArray[i] == 1) {charArrayCopy[i] = 1;}
		}

		//assign players a random character
		var randomNum;
		console.log("\tthere are " + roomList[roomNum].length + " players in the room");
		for(i = 0; i < roomList[roomNum].length; i++) {
			if(roomList[roomNum][i].character == "none") {
				//process.stdout.write("getting randomNum: ");
				do {
					/*
					TODO: consider reducing the range of values every iteration somehow, not a big deal though
						maybe create another array with the indexes of available characters in charArray, then splice out elements as they are selected
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
				actionPanelStr: updateActionPanel(roomNum, roomList[roomNum][j].character),
			});
			/* uncomment after updateActionPanel() is done
			io.to(roomList[roomNum][j].sid).emit("updatePlayerBoard", {
				playerBoardStr: updatePlayerBoard(roomNum, roomList[roomNum][j].character)
			});
			*/
		}
		console.log("game started");

	}); //end btnPressStartGame()

	socket.on('btnPressPartySubmit',function(data){
		var partySelections = data.partySelections;
		var roomNum = data.room;
		var currentQuest;
		if(gameList[roomNum].phase == 0) {currentQuest = 0;}
		if(gameList[roomNum].phase == 3) {currentQuest = 1;}
		if(gameList[roomNum].phase == 6) {currentQuest = 2;}
		if(gameList[roomNum].phase == 9) {currentQuest = 3;}
		if(gameList[roomNum].phase == 12) {currentQuest = 4;}
		console.log(`Received btnPressPartySubmit from client, here's the list: ${partySelections}`);
		if(partySelections.length != gameList[roomNum].questSize[currentQuest]) {
			console.log(`Bad party select at ${roomNum}...${partySelections.length} selected, ${roomList[roomNum].length} in the room`);
			return;
		}
		gameList[roomNum].phase++;

		//filling out the selectedParty array...this could use some optimization
		console.log("Filling out selectedParty array...");
		var partySlot = 0;
		gameList[roomNum].selectedParty = [-1,-1,-1,-1,-1,-1];
		for(names in partySelections) {
			console.log(`Looking at ${names}...`);
			for(i = 0; i < roomList[roomNum].length; i++) {
				if(names === roomList[roomNum][i].name) {
					gameList[roomNum].selectedParty[partySlot] = i;
					partySlot++;
					console.log(`\tselectedParty[${partySlot}]: ${i}`);
					break;
				}
			}
		}
		//TODO NOW: update clients with next phase by emitting updateGameBoard
		//and updateActionPanel
	});

});
