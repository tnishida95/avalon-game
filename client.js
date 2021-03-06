/*
client.js
Client-side javascript for avalon-game.

Tyler Nishida, tnishida95@gmail.com
*/

/* eslint-disable */

var socket = io();
var lobby;
var roomNum = -1;

const mainMenuStr = `<div class="text-center">
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

var btnPressNewGame = function(){
	socket.emit('btnPressNewGame',{
		name: $("#nameInput").val()
	});
}
var btnPressJoinGame = function(){
	socket.emit('btnPressJoinGame',{
		name: $("#nameInput").val(),
		roomNum: $("#roomInput").val()
	});
}
var btnPressStartGame = function(){
	let characterSelections = [];
	$.each($("input[name='charSelection']:checked"), function(){
		characterSelections.push($(this).val());
	});
	console.log(characterSelections);
	socket.emit('btnPressStartGame',{
		charList: characterSelections,
		roomNum: roomNum
	});
}
var btnPressLeaveGame = function(){
	socket.emit('btnPressLeaveGame',{
		roomNum: roomNum
	});
	roomNum = -1;
	loadMainMenu();
}
var btnPressDisbandGame = function(){
	socket.emit('btnPressDisbandGame',{
		roomNum: roomNum
	});
	roomNum = -1;
	loadMainMenu();
}
var btnPressPartySubmit = function(){
	let partySelections = [];
	$.each($("input[name='partySelection']:checked"), function(){
  		partySelections.push($(this).val());
	});
	console.log(partySelections);
	socket.emit('btnPressPartySubmit',{
		partySelections: partySelections,
		roomNum: roomNum
	});
}
var btnPressAcceptParty = function(){
	socket.emit('btnPressPartyApproval',{
  		vote: 1,
		roomNum: roomNum
	});
	document.getElementById("actionPanelDiv").innerHTML = '<button type="button" class="btn btn-default waiting-button">Submitted</button>';
}
var btnPressRejectParty = function(){
	socket.emit('btnPressPartyApproval',{
  		vote: 2,
		roomNum: roomNum
	});
	document.getElementById("actionPanelDiv").innerHTML = '<button type="button" class="btn btn-default waiting-button">Submitted</button>';
}
var btnPressSuccess = function(){
	socket.emit('btnPressQuestAction',{
  		questAction: 1,
		roomNum: roomNum
	});
	document.getElementById("actionPanelDiv").innerHTML = '<button type="button" class="btn btn-default waiting-button">Submitted</button>';
}
var btnPressFail = function(){
	socket.emit('btnPressQuestAction',{
  		questAction: 2,
		roomNum: roomNum
	});
	document.getElementById("actionPanelDiv").innerHTML = '<button type="button" class="btn btn-default waiting-button">Submitted</button>';
}
var btnPressAssassinSubmit = function(){
	let assassinSelection = [];
	$.each($("input[name='assassinSelection']:checked"), function(){
  		assassinSelection.push($(this).val());
	});
	console.log(assassinSelection);
	if(assassinSelection.length > 1) {
		console.log(`Bad assassin select. ${assassinSelection.length} selected.`);
		return;
	}
	socket.emit('btnPressAssassinSubmit',{
		assassinSelection: assassinSelection[0],
		roomNum: roomNum
	});
}

function loadMainMenu() {
	document.getElementById("title").innerHTML = 'Avalon';
	document.getElementById("centerDiv").innerHTML = mainMenuStr;
	document.getElementById("topDiv").innerHTML = '<h2 id="topText">Welcome to Avalon!</h2><hr>';
}

function updateLobby() {
	let lobbyListStr = `<div class="text-center"><p>${lobby.length} Players - `;
	if(lobby.length < 5) {
		let playersNeeded = 5 - lobby.length;
		lobbyListStr += 'Need at least ' + playersNeeded + ' more player(s).</p>';
	}
	else if (lobby.length == 5) {lobbyListStr += 'There will be 3 Good and 2 Evil.</p>';}
	else if (lobby.length == 6) {lobbyListStr += 'There will be 4 Good and 2 Evil.</p>';}
	else if (lobby.length == 7) {lobbyListStr += 'There will be 4 Good and 3 Evil.</p>';}
	else if (lobby.length == 8) {lobbyListStr += 'There will be 5 Good and 3 Evil.</p>';}
	else if (lobby.length == 9) {lobbyListStr += 'There will be 6 Good and 3 Evil.</p>';}
	else if (lobby.length == 10) {lobbyListStr += 'There will be 6 Good and 4 Evil.</p>';}
	else {lobbyListStr += 'Too many players.</p>';}
	for (i = 0; i < lobby.length; i++) {
		lobbyListStr += '[' + lobby[i].name + '] ';
	}
	lobbyListStr += '<hr></div>';

	document.getElementById("lobbyDiv").innerHTML = lobbyListStr;
}

//TODO: separate this function into loadHostLobby and loadGuestLobby
socket.on('loadLobby',function(data){
	console.log("Received: [loadLobby] from server");
	lobby = data.list;
	roomNum = data.roomNum;

	let hostLobbyStr = data.hostLobbyStr;
	//console.log("Here's the hostLobbyStr:\n" + hostLobbyStr);
	let guestLobbyStr = data.guestLobbyStr;
	//console.log("Here's the guestLobbyStr:\n" + guestLobbyStr);
	document.getElementById("title").innerHTML = `Avalon Room #${roomNum}`;
	document.getElementById("topDiv").innerHTML = `<h2 id="topText">Avalon Room #${roomNum}</h2><hr>`;
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

socket.on('invalidCharacterSelect',function(data){
	console.log("Received: [invalidCharacterSelect] from server");
	document.getElementById("invalidCharacterSelectContent").innerText = data.message;
})

socket.on('loadGameScreen',function(data){
	console.log("Received: [loadGameScreen] from server");
	lobby = data.list;
	// if rejoining a game in-progress
	if(roomNum === -1) {
		roomNum = data.roomNum;
	}
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
	document.getElementById("progressBarInner").style.width = data.barWidth;
	document.getElementById("progressBarInner").innerHTML = data.innerText;
	document.getElementById("progressBarOuter").innerHTML = data.outerText;
})
