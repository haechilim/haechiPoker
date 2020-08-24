var TOTAL_SEATS = 9;

var turn = 0;
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
		seat: 0,
		name: "삐쭈",
		chip: 15000000
	},
	{
		id: 3,
		avatar: 11,
		seat: 8,
		name: "김아빠",
		chip: 99999
	}
];

document.addEventListener("DOMContentLoaded", function() {
	window.addEventListener('resize', function() {
		resize();
	});
	
	document.querySelector('#fold').addEventListener('click', function() {
		showDealerbutton(players[turn].seat, false);
		turn = (turn + 1) % players.length;
		showDealerbutton(players[turn].seat, true);
	});
	
	resize();	
	init();
	
	showDealerbutton(players[turn].seat, true);
});

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

function init() {
	initTable();
	initPlayers();
	players = sortBySeat();
}

function initTable() {
	showPlayers(false);
	showPlayerChips(false);
	showPlayerCards(false);
	showPlayerTimers(false);
	showPlayerDealerButtons(false);
	
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

function updatePlayer(player) {
	document.querySelector("#p" + player.seat + " .avatar").setAttribute( 'src', 'image/avatar/avatar' + player.avatar + '.png' );
	document.querySelector("#p" + player.seat + " .nickname").innerHTML = player.name;
	document.querySelector("#p" + player.seat + " .chips").innerHTML = player.chip.toLocaleString();
}

function showPlayer(seat, visible) {	
	document.querySelector("#p" + seat).style.display = visible ? "flex" : "none";
}

function showPlayers(visible) {
	for(var seat = 0; seat < TOTAL_SEATS; seat++) {
		showPlayer(seat, visible);
	}
}

function showDealerbutton(seat, visible) {
	document.querySelector("#p" + seat + " .dealerbutton").style.display = visible ? "flex" : "none";
}

function showPlayerDealerButtons(visible) {
	for(var seat = 0; seat < TOTAL_SEATS; seat++) {
		showDealerbutton(seat, visible);
	}
}

function showPlayerChip(seat, visible) {
	document.querySelector("#p" + seat + " .chip-container").style.display = visible ? "flex" : "none";
}

function showPlayerChips(visible) {
	for(var seat = 0; seat < TOTAL_SEATS; seat++) {
		showPlayerChip(seat, visible);
	}
}

function showHoldingCard(seat, visible) {
	document.querySelector("#p" + seat + " .holding-cards").style.display = visible ? "flex" : "none";
}

function showPlayerCards(visible) {
	for(var seat = 0; seat < TOTAL_SEATS; seat++) {
		showHoldingCard(seat, visible);
	}
}

function showPlayerTimer(seat, visible) {
	document.querySelector("#p" + seat + " .timer").style.display = visible ? "block" : "none";
}

function showPlayerTimers(visible) {
	for(var seat = 0; seat < TOTAL_SEATS; seat++) {
		showPlayerTimer(seat, visible);
	}
}

function showFloorCards(visible) {
	document.querySelector("#cards-on-floor").style.display = visible ? "flex" : "none";
}

function showFloorChip(visible) {
	document.querySelector("#total-chip-container").style.display = visible ? "flex" : "none";
}

function sortBySeat(desc) {	
	return players.sort(function(p1, p2) {
		var result = p1.seat - p2.seat;
		return desc ? -result : result;
	});
}