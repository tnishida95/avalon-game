//app.js

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
//key: roomNum, val: array of Players in the room
var roomList = {};
//growing value to give unique ids to all connections
var playerid = 0;


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
		console.log("no room currently");
	}
	console.log("-------------------------");
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
			var player = new Player(socket.num, socket.id, data.name, "none");
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
		var goodCount, evilCount = 0;
		var goodArray = [0,0,0,0,0];
		var evilArray = [0,0,0,0,0,0,0,0,0];
		//goodArray: 0 = merlin, 1 = percival, 2..4 = basic good
		//evilArray: 0 = assassin, 1 = morgana, 2 = mordred, 3 = oberon, 4..5 = basic evil
		for(characters in characterSelections) {
			if(characters == "merlin") {
				goodArray[0] = 1;
				goodCount++;
			}
			else if (characters == "percival") {
				goodArray[1] = 1;
				goodCount++;
			}
			else if (characters == "goodOne") {
				goodArray[2] = 1;
				goodCount++;
			}
			else if (characters == "goodTwo") {
				goodArray[3] = 1;
				goodCount++;
			}
			else if (characters == "goodThree") {
				goodArray[4] = 1;
				goodCount++;
			}
			else if (characters == "assassin") {
				evilArray[0] = 1;
				evilCount++;
			}
			else if (characters == "morgana") {
				evilArray[1] = 1;
				evilCount++;
			}
			else if (characters == "mordred") {
				evilArray[2] = 1;
				evilCount++;
			}
			else if (characters == "oberon") {
				evilArray[3] = 1;
				evilCount++;
			}
			else if (characters == "evilOne") {
				evilArray[4] = 1;
				evilCount++;
			}
			else if (characters == "evilTwo") {
				evilArray[5] = 1;
				evilCount++;
			}
			else if (characters == "evilThree") {
				evilArray[6] = 1;
				evilCount++;
			}
			else if (characters == "evilFour") {
				evilArray[7] = 1;
				evilCount++;
			}
			else if (characters == "evilFive") {
				evilArray[8] = 1;
				evilCount++;
			}
			else {
				return;
			}
		}
		/*
		rules check:
			merlin and assassin must be selected
			morgana must be selected with percival
			good and evil player numbers align with the rules
		*/
		if(
			(goodArray[0] == 0 || evilArray[0] == 0) ||
			(evilArray[1] == 1 && goodArray[1] == 0) ||
			((characterSelections.length == 5) && ((goodCount != 3) || (evilCount != 2))) ||
			((characterSelections.length == 6) && ((goodCount != 4) || (evilCount != 2))) ||
			((characterSelections.length == 7) && ((goodCount != 4) || (evilCount != 3))) ||
			((characterSelections.length == 8) && ((goodCount != 5) || (evilCount != 3))) ||
			((characterSelections.length == 9) && ((goodCount != 6) || (evilCount != 3))) ||
			((characterSelections.length == 10) && ((goodCount != 6) || (evilCount != 4)))
		) {
			return;
		}
		//TODO: randomly assign characters to the players...don't forget about preassigned

		io.to(roomNum).emit("loadGameScreen", {
			list: roomList[roomNum]
		});
	});


});
