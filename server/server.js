const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log(`socket [${socket.id}] connected`);

  socket.on('disconnect',function() {
    // get the index of the socket that just dc'd, cut it out of lists
    // const index = socketList.indexOf(socket.id);
    // socketList.splice(index, 1);
    console.log(`socket [${socket.id}] disconnected`);

    // TODO: if the host of a party disconnects, the room should be removed
    // TODO: if all players in a game have disconnected, the room and game should be removed
  });

  socket.on('btnPressNewGame',function(data) {
    console.log("New Game button pressed");
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
