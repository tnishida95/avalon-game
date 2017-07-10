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
	console.log('socket connection');

	socket.on('happy',function(data){
		console.log('happy because ' + data.reason);
	});

	socket.emit('serverMsg',{
		msg:'hello',
	});

});
