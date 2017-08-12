//app.js
//Tyler Nishida, tnishida95@gmail.com

//Express
/*
creates a serv and makes it listen on the port 2000
by default, domain is localhost
	go to "localhost:2000" in browser to test
	make sure "node app.js" has been called from the command line
*/
var express = require('express');
var app = express();
var serv = require('http').Server(app);
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
serv.listen(2000);
//above line works as: serv.listen(2000);

//end Express
console.log("server started");

//array of sockets
var socketList = [];
//array of playerids
var playerList = [];
//key: roomNum, val: array of Player objects in the room
var roomList = {};
//key: roomNum, val: gameManager objects
var gameList = {};
//growing value to give unique ids to all connections
var playerid = 0;

//TODO: figure this out
function gameManager(playerCountInt) {
	this.playerCount = playerCountInt;
	//TODO: figure out how the states needed and list here
	this.phase = 0;
}

function Player(idInt, socketidInt, nameString, characterString) {
	this.id = idInt;
	this.sid = socketidInt;
	this.name = nameString;
	this.character = characterString;
}

const io = require('socket.io')(serv,{});

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

function buildGameBoard() {
	var gameScreenStr;
	var gameBoardStr; //TODO: start building the strings
}

//upon new socket connection
io.sockets.on('connection', function(socket){
	socket.num = playerid;
	playerList[playerList.length] = playerid;
	socketList[playerList.length] = socket;
	console.log('new socket connection, player  #' + socket.num);
	playerid++;
	printPlayerList();

	//upon socket disconnect
	socket.on('disconnect',function(){
		//get the index of the socket that just dc'd, cut it out of lists
		var index = playerList.indexOf(socket.num);
		socketList.splice(index,1);
		playerList.splice(index,1);
		console.log('player #' + socket.num + ' disconnected');
		printPlayerList();
		//TODO: update any rooms with the socket of the dc
	});

	//button presses
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
			num: roomNum
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
			io.to(socket.id).emit("loadLobby", {
				list: roomList[roomNum],
				num: roomNum
			});
			io.to(roomNum).emit("updateLobby", {
				list: roomList[roomNum],
				num: roomNum
			});
		}
		else {
			console.log("roomNum not found");
			//send error message
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
			console.log("invalid character selection: player count does not equal character count");
			return;
		}
		var goodCount = 0;
		var evilCount = 0;
		var charArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		//populate the charArray, showing which characters are in the game
		for(i = 0; i < characterSelections.length; i++) {
			characters = characterSelections[i];
			console.log(characters);
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
				console.log("invalid character selection: unmatched character names");
				return;
			}
		}
		/*
		rules check:
			merlin and assassin must be selected
			morgana must be selected with percival
			good and evil player numbers align with the rules
		*/
		console.log("Good: " + goodCount + ", Evil: " + evilCount);
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
			console.log("invalid character selection: rule breaking");
			return;
		}
		//remove reserved characters from the pool
		for(i = 0; i < roomList[roomNum].length; i++) {
			if(roomList[roomNum][i].character != "none") {
				if(roomList[roomNum][i].character == "mordred") {
					if(charArray[9] == 1) {
						charArray[9] = 0;
						break;
					}
					//get here if character was reserved but not selected; drops the reservation
					roomList[roomNum][i].character == "none";
				}
				//add more cases here as necessary
			}
		}
		//assign players a random character
		var randomNum;
		console.log("there are " + roomList[roomNum].length + " players in the room");
		for(i = 0; i < roomList[roomNum].length; i++) {
			console.log("checking if [" + roomList[roomNum][i].name +  "] has a character");
			console.log("[" + roomList[roomNum][i].name +  "] is " + roomList[roomNum][i].character);
			if(roomList[roomNum][i].character == "none") {
				process.stdout.write("getting randomNum: ");
				do {
					//TODO: consider reducing the range of values every iteration somehow
					//...not a big deal though
					//maybe create another array with the indexes of available characters in charArray,
					//then splice out elements as they are selected
					randomNum = Math.floor(Math.random() * 14);
					process.stdout.write(randomNum.toString() + " | ");
				}
				while(charArray[randomNum] != 1);
				console.log("\nRandomly selected #" + randomNum);
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
		console.log("Assigned characters:");
		for(i = 0; i < roomList[roomNum].length; i++) {
			console.log("\t[" + roomList[roomNum][i].name + "] is " + roomList[roomNum][i].character);
		}

		//TODO: build the game screen and send it off in strings to the clients
		io.to(roomNum).emit("loadGameScreen", {
			list: roomList[roomNum]
		});
	});

});
