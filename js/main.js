var TOTAL_SEATS = 9;
var CARDS_DEALING_INTERVAL = 100;
var BETTING_TIMEOUT = 8;

var players = [
	{
		id: 0,
		avatar: 1,
		seat: 4,
		name: "해치",
		chip: 30000
	},
	{
		id: 1,
		avatar: 3,
		seat: 1,
		name: "장삐쭈",
		chip: 15000
	},
	{
		id: 2,
		avatar: 9,
		seat: 7,
		name: "삐쭈",
		chip: 15000000
	},
	{
		id: 3,
		avatar: 11,
		seat: 8,
		name: "김아빠",
		chip: 99999
	},
	{
		id: 4,
		avatar: 11,
		seat: 5,
		name: "임뽕구",
		chip: 1500000
	}
];

var dealerIndex = 0;
var turn;
var bettingTimer;

document.addEventListener("DOMContentLoaded", function() {
	init();
	resetTable();
	bindEvents();
});

function nextGame() {
	dealerIndex = (dealerIndex + 1) % players.length;
	firstTurn();
}

function firstTurn() {
	turn = (dealerIndex + 3) % players.length;
}

function nextTurn() {
	turn = (turn + 1) % players.length;
}

function resetTable() {
	showAllPlayerCards(false);
	passDealerButton();
	dealCards();
	showBettingTimer();
	startBettingTimer();
}

function passDealerButton() {
	showAllPlayerDealerButtons(false);
	showPlayerDealerButton(players[dealerIndex].seat, true);
}

// ----------------------------------------

function init() {
	resize();
	initTable();
	initPlayers();
	players = sortPlayersBySeat();
	firstTurn();
}

function initTable() {
	showAllPlayers(false);
	showAllPlayerChips(false);
	showAllPlayerCards(false);
	showAllPlayerTimers(false);
	showAllPlayerDealerButtons(false);
	
	showFloorCards(false);
	showFloorChip(false);
}

function initPlayers() {
	for(var i = 0; i < players.length; i++) {
		var player = players[i];
		
		updatePlayer(player);
		showPlayer(player.seat, true);
	}
}

// ----------------------------------------

function dealCards() {
	var playerIndex = 0;
	var cardIndex = 1;
	
	var timer = setInterval(function() {
		showPlayerCard(players[playerIndex++].seat, cardIndex, true);
		
		if(playerIndex == players.length) {
			playerIndex = 0;
			cardIndex++;
			
			if(cardIndex == 3) clearInterval(timer);
		}
	}, CARDS_DEALING_INTERVAL);
}

function startBettingTimer() {
	var percent = 100;
	var step = 0.5;
	var interval = (BETTING_TIMEOUT * 1000) / (100 / step);
	var progress = getProgress(turn);
	
	stopBettingTimer();
	
	bettingTimer = setInterval(function() {
		if(percent < 0) stopBettingTimer();
		updateProgressStatus(progress, percent);
		percent -= step;
	}, interval);
}

function stopBettingTimer() {
	if(bettingTimer) clearInterval(bettingTimer)
}

// ----------------------------------------

function bindEvents() {
	window.addEventListener('resize', function() {
		resize();
	});
	
	document.querySelector('#fold').addEventListener('click', function() {
		nextGame();
		resetTable();
	});
	
	document.querySelector('#call').addEventListener('click', function() {
		nextTurn();
		showBettingTimer();
		startBettingTimer();
	});
}

// ----------------------------------------

function showAllPlayers(visible) {
	for(var seat = 0; seat < TOTAL_SEATS; seat++) {
		showPlayer(seat, visible);
	}
}

function showAllPlayerDealerButtons(visible) {
	for(var seat = 0; seat < TOTAL_SEATS; seat++) {
		showPlayerDealerButton(seat, visible);
	}
}

function showAllPlayerChips(visible) {
	for(var seat = 0; seat < TOTAL_SEATS; seat++) {
		showPlayerChip(seat, visible);
	}
}

function showAllPlayerCards(visible) {
	for(var seat = 0; seat < TOTAL_SEATS; seat++) {
		showPlayerCards(seat, visible);
	}
}

function showAllPlayerTimers(visible) {
	for(var seat = 0; seat < TOTAL_SEATS; seat++) {
		showPlayerTimer(seat, visible);
	}
}

function showPlayerCards(seat, visible) {
	showPlayerCard(seat, 1, visible);
	showPlayerCard(seat, 2, visible);
}

function showBettingTimer() {
	showAllPlayerTimers(false);
	showPlayerTimer(players[turn].seat, true);
}

// ----------------------------------------

function updatePlayer(player) {
	document.querySelector("#p" + player.seat + " .avatar").setAttribute( 'src', 'image/avatar/avatar' + player.avatar + '.png' );
	document.querySelector("#p" + player.seat + " .nickname").innerHTML = player.name;
	document.querySelector("#p" + player.seat + " .chips").innerHTML = player.chip.toLocaleString();
}

function showPlayer(seat, visible) {
	document.querySelector("#p" + seat).style.display = visible ? "flex" : "none";
}

function showPlayerCard(seat, number, visible) {
	document.querySelector("#p" + seat + " .card" + number).style.display = visible ? "inline" : "none";
}

function showPlayerTimer(seat, visible) {
	document.querySelector("#p" + seat + " .timer").style.display = visible ? "block" : "none";
}

function showPlayerChip(seat, visible) {
	document.querySelector("#p" + seat + " .chip-container").style.display = visible ? "flex" : "none";
}

function showPlayerDealerButton(seat, visible) {
	document.querySelector("#p" + seat + " .dealerbutton").style.display = visible ? "flex" : "none";
}

function showFloorCards(visible) {
	document.querySelector("#cards-on-floor").style.display = visible ? "flex" : "none";
}

function showFloorChip(visible) {
	document.querySelector("#total-chip-container").style.display = visible ? "flex" : "none";
}

// ----------------------------------------

function getProgress(turn) {
	return document.querySelector("#p" + players[turn].seat + " .progress")
}

function updateProgressStatus(progress, percent) {
	progress.style.width = percent + "%";
}

// ----------------------------------------

function sortPlayersBySeat(desc) {	
	return players.sort(function(p1, p2) {
		var result = p1.seat - p2.seat;
		return desc ? -result : result;
	});
}

function resize() {
	var DEFAULT_WIDTH = 1919;
	var DEFAULT_HEIGHT = 1057;
	
	var ratioX = window.innerWidth / DEFAULT_WIDTH;
	var ratioY = window.innerHeight / DEFAULT_HEIGHT;
	var offsetX = (DEFAULT_WIDTH - window.innerWidth) / 2;
	var offsetY = (DEFAULT_HEIGHT - window.innerHeight) / 2;
	
	document.body.style.transform = "scale(" + Math.min(ratioX, ratioY) + ")";
	document.getElementById("table").style.transform = "translate(0px, " + (ratioY > 1 ? -offsetY : 0) + "px)";
	window.scrollTo(0, offsetY);
}