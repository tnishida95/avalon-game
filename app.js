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
//end Express
console.log("server started");

//array of sockets
var socketList = [];
//array of playerids
var playerList = [];
//key: roomNum, val: array of Players in the room
var roomList = [];
//growing value to give unique ids to all connections
var playerid = 0;


function Player(idInt, nameString, characterString) {
	this.id = idInt;
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
	if(roomList.length < 1) {
		console.log("no room currently");
		return;
	}
	console.log("-------------------------");
	for(roomNums in roomList) {
			process.stdout.write("Room #" + roomNums + ": ");
			for(i = 0; i < roomList[roomNums].length; i++) {
				process.stdout.write("[" + roomList[roomNums][i].id + ":" + roomList[roomNums][i].name + "]");
			}
			console.log("");
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
	});

	//button presses
	socket.on('btnPressNewGame',function(data){
		console.log("New Game button pressed");
		var player = new Player(socket.num, data, "none");
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
		socket.join(data);
		io.to(roomNum).emit("joinSocketRoom", roomNum);
		//io.to(socket.id).emit("updateLobby", {
		//	list: roomList[roomNum],
		//	num: roomNum
		//});
	});
	socket.on('btnPressJoinGame',function(data){
		roomNum = (data.room).toString();
		console.log("Join Game button pressed with roomNum: " + roomNum);
		if(roomNum in roomList) {
			var player = new Player(socket.num, data.name, "none");
			roomList[roomNum][roomList[roomNum].length] = player;
			printRoomList();
		}
		else {
			console.log("roomNum not found");
			//send error message
		}
	});

});
