/*
client.js
Client-side javascript for avalon-game.

Tyler Nishida, tnishida95@gmail.com
*/

var socket = io();
var lobby;
var roomNum = -1;

var btnPressNewGame = function(){
	socket.emit('btnPressNewGame',$("#nameInput").val())
}
var btnPressJoinGame = function(){
	socket.emit('btnPressJoinGame',{
		name: $("#nameInput").val(),
		room: $("#roomInput").val()
	});
}
var btnPressStartGame = function(){
	var characterSelections = [];
	$.each($("input[name='charSelection']:checked"), function(){
		characterSelections.push($(this).val());
	});
	console.log(characterSelections);
	socket.emit('btnPressStartGame',{
		charList: characterSelections,
		room: roomNum
	});
}
var btnPressLeaveGame = function(){
	socket.emit('btnPressLeaveGame',{
		room: roomNum
	});
	roomNum = -1;
	loadMainMenu();
}
var btnPressDisbandGame = function(){
	socket.emit('btnPressDisbandGame',{
		room: roomNum
	});
	roomNum = -1;
	loadMainMenu();
}
var btnPressPartySubmit = function(){
	var partySelections = [];
	$.each($("input[name='partySelection']:checked"), function(){
  		partySelections.push($(this).val());
	});
	console.log(partySelections);
	socket.emit('btnPressPartySubmit',{
		partySelections: partySelections,
		room: roomNum
	});
}
var btnPressAcceptParty = function(){
	socket.emit('btnPressPartyApproval',{
  		vote: 1
	});
	document.getElementById("actionPanelDiv").innerHTML = '<button type="button" class="btn btn-default" style="width: 82.5%; height: 80px;">Submitted</button>';
}
var btnPressRejectParty = function(){
	socket.emit('btnPressPartyApproval',{
  		vote: 2
	});
	document.getElementById("actionPanelDiv").innerHTML = '<button type="button" class="btn btn-default" style="width: 82.5%; height: 80px;">Submitted</button>';
}
var btnPressSuccess = function(){
	socket.emit('btnPressQuestAction',{
  		questAction: 1
	});
	document.getElementById("actionPanelDiv").innerHTML = '<button type="button" class="btn btn-default" style="width: 82.5%; height: 80px;">Submitted</button>';
}
var btnPressFail = function(){
	socket.emit('btnPressQuestAction',{
  		questAction: 2
	});
	document.getElementById("actionPanelDiv").innerHTML = '<button type="button" class="btn btn-default" style="width: 82.5%; height: 80px;">Submitted</button>';
}
var btnPressAssassinSubmit = function(){
	var assassinSelection = [];
	$.each($("input[name='assassinSelection']:checked"), function(){
  		partySelections.push($(this).val());
	});
	console.log(assassinSelection);
	if(assassinSelection.length > 1) {
		console.log(`Bad assassin select. ${assassinSelection.length} selected.`)
		return;
	}
	socket.emit('btnPressAssassinSubmit',{
		assassinSelection: assassinSelection[0],
		room: roomNum
	});
}

function loadMainMenu() {
	document.getElementById("title").innerHTML = 'Avalon';
	var mainMenuStr = `<div class="text-center">
		<div id="inputArea">
			<input type="text" id="nameInput" maxlength="20" spellcheck="false" placeholder="Your Name">
			<p></p>
			<input type="text" id="roomInput" maxlength="20" spellcheck="false" placeholder="Room Number" data-toggle="collapse" data-target="#roomNumNotifyContent">
			<h6 id="roomNumNotifyContent" class="collapse">No Room # needed if not trying to join.</h6>
			<hr>
		</div>
		<div class="container">
			<div class="row">
				<button type="button" class="btn btn-default btn-lg col-xs-12 col-sm-4" onclick="btnPressNewGame()">New Game</button>
				<button type="button" class="btn btn-default btn-lg col-xs-12 col-sm-4" onclick="btnPressJoinGame()">Join Game</button>
				<button type="button" class="btn btn-default btn-lg col-xs-12 col-sm-4" data-toggle="collapse" data-target="#rulesContent">Rules</button>
			</div>
		</div>
		<hr>
	</div>`;
	document.getElementById("centerDiv").innerHTML = mainMenuStr;
	document.getElementById("topDiv").innerHTML = '<h2 id="topText">Welcome to Avalon!</h2><hr>';
}

function updateLobby() {
	var lobbyListStr = `<div class="text-center"><p>${lobby.length} Players - `;
	if(lobby.length < 5) {
		var playersNeeded = 5 - lobby.length;
		lobbyListStr += 'Need at least ' + playersNeeded + ' more player(s).</p>';
	}
	else if (lobby.length == 5) {lobbyListStr += 'There will be 3 Good and 2 Evil.</p>';}
	else if (lobby.length == 6) {lobbyListStr += 'There will be 4 Good and 2 Evil.</p>';}
	else if (lobby.length == 7) {lobbyListStr += 'There will be 4 Good and 3 Evil.</p>';}
	else if (lobby.length == 8) {lobbyListStr += 'There will be 5 Good and 3 Evil.</p>';}
	else if (lobby.length == 9) {lobbyListStr += 'There will be 6 Good and 3 Evil.</p>';}
	else if (lobby.length == 10) {lobbyListStr += 'There will be 6 Good and 4 Evil.</p>';}
	else {lobbyListStr += 'Too many players.</p>';}
	for (var i = 0; i < lobby.length; i++) {
		lobbyListStr += '[' + lobby[i].name + '] ';
	}
	lobbyListStr += '<hr></div>';

	document.getElementById("lobbyDiv").innerHTML = lobbyListStr;
}

//TODO: separate this function into loadHostLobby and loadGuestLobby
socket.on('loadLobby',function(data){
	console.log("Received: [loadLobby] from server");
	lobby = data.list;
	roomNum = data.num;
	var hostLobbyStr = data.hostLobbyStr;
	console.log("Here's the hostLobbyStr:\n" + hostLobbyStr);
	var guestLobbyStr = data.guestLobbyStr;
	console.log("Here's the guestLobbyStr:\n" + guestLobbyStr);
	document.getElementById("title").innerHTML = `Avalon Room #${roomNum}`;
	document.getElementById("topDiv").innerHTML = `<h2 id="topText" style="text-align:center;">Avalon Room #${roomNum}</h2><hr>`;
	if(socket.id == lobby[0].sid) { //if host
	  document.getElementById("centerDiv").innerHTML = hostLobbyStr;
	}
	else {
	  document.getElementById("centerDiv").innerHTML = guestLobbyStr;
	}
	updateLobby();
})

socket.on('updateLobby',function(data){
	console.log("Received [updateLobby] from server");
	lobby = data.list;
	updateLobby();
})

socket.on('loadMainMenu',function(data){
	console.log("Received: [loadMainMenu] from server");
	loadMainMenu();
})

socket.on('loadGameScreen',function(data){
	console.log("Received: [loadGameScreen] from server");
	lobby = data.list;
	document.getElementById("centerDiv").innerHTML = data.gameScreenStr;
})

socket.on('updateGameBoard',function(data){
	console.log("Received: [updateGameBoard] from server");
	document.getElementById("gameBoardDiv").innerHTML = data.gameBoardStr;
})
socket.on('updateActionPanel',function(data){
	console.log("Received: [updateActionPanel] from server");
	lobby = data.list;
	document.getElementById("actionPanelDiv").innerHTML = data.actionPanelStr;
})
socket.on('updatePlayerBoard',function(data){
	console.log("Received: [updatePlayerBoard] from server");
	lobby = data.list;
	document.getElementById("playerBoardDiv").innerHTML = data.playerBoardStr;
})
socket.on('updateProgressBar',function(data){
	console.log("Received: [updateProgressBar] from server");
	document.getElementById("progressDiv").innerHTML = data.progressBarStr;
})
