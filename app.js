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
//End Express

//Socket.io
var io = require('socket.io')(serv,{});

//whenever there is a connection, print 'socket connection'
io.sockets.on('connection', function(socket){
	console.log('new socket connection');
	socket.id = Math.random();
	//make id or number the ID for the player...make sure it is unique
	socket.number = "" + Math.floor(10 * Math.random());
	SOCKET_LIST[socket.id] = socket;

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
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


