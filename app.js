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
//array of Player objects
var roomList = [];
var playerid = 0;


function Player(idInt, nameString, characterString) {
	this.id = idInt;
	this.name = nameString;
	this.character = characterString;
}

var io = require('socket.io')(serv,{});

function printPlayerList() {
	if(playerList.length < 1) return;
	process.stdout.write("playerList: ");
	for(i = 0; i < playerList.length; i++)
		process.stdout.write("[" + playerList[i] + "]");
	console.log("");
}


//upon new socket connection
io.sockets.on('connection', function(socket){
	socket.id = playerid;
	playerList[playerList.length] = playerid;
	socketList[playerList.length] = socket;
	console.log('new socket connection, player  #' + socket.id);
	playerid++;
	printPlayerList();

	//upon socket disconnect
	socket.on('disconnect',function(){
		//get the index of the socket that just dc'd, cut it out of lists
		var index = playerList.indexOf(socket.id);
		socketList.splice(index,1);
		playerList.splice(index,1);
		console.log('player #' + socket.id + ' disconnected');
		printPlayerList();
	});

	//button presses
	socket.on('btnPressNewGame',function(data){
		console.log("New Game button pressed");
		var player = new Player(socket.id, data, "none");
		console.log("Created new Player:");
		console.log("\tid: " + player.id);
		console.log("\tname: " + player.name);
		console.log("\tcharacter: " + player.character);
	});
	socket.on('btnPressJoinGame',function(data){
		console.log(data.message + socket.id);
	});

});
