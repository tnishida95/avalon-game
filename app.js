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

var socketList = [];
var playerList = [];
var playerid = 0;

var Player = function(id){
	var self = {
		id:id,
		name:id,
		character:none
	}
	return self;
}

var io = require('socket.io')(serv,{});

function printPlayerList() {
	if(playerList.length < 1) return;
	for(i = 0; i < playerList.length; i++)
		process.stdout.write(" | " + playerList[i]);
	console.log(" |");
}

//upon new socket connection
io.sockets.on('connection', function(socket){
	socket.id = playerid;
	playerList[playerList.length] = playerid;
	socketList[playerList.length] = socket;
	console.log('new socket connection, player  #' + socket.id);
	playerid++;
	printPlayerList();

	//upon disconnect
	socket.on('disconnect',function(){
		//get the index of the socket that just dc'd, cut it out of lists
		var index = playerList.indexOf(socket.id);
		socketList.splice(index,1);
		playerList.splice(index,1);
		console.log('player #' + socket.id + ' disconnected');
		printPlayerList();
	});

	//upon pressing New Game button; broken
	socket.on('btnPressNewGame',function(data){
		console.log(data.message + socket.id);
	});

});
