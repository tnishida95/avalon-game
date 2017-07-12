//app.js

console.log("Hello World");

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
console.log("server started");
//End Express

var SOCKET_LIST = [];
var PLAYER_LIST = [];

var Player = function(id){
	var self = {
		id:id,
		name:id,
		character:none
	}
	return self;
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	console.log('new socket connection');
	socket.id = SOCKET_LIST.length;
	SOCKET_LIST[socket.id] = socket;

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
	});

});

setInterval(function(){
	var pack = [];
	for(var i in SOCKET_LIST[i]){
		var socket = SOCKET_LIST[i];
		pack.push({
			somedata:socket.somedata
			//here, make somedata stuff like player character, allies, etc?
		});
	}
	for(var i in SOCKET_LIST){
		socket.emit('updatePlayers',pack);
	}
