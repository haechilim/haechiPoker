var TOTAL_SEATS = 9;
var CARDS_DEALING_INTERVAL = 100;
var BETTING_TIMEOUT = 8;

// 에러 코드
var CODE_SUCCESS = 0;
var CODE_NOT_YOUR_TURN = 1;

// 플레이어 상태
var PLAYER_PLAYING = 0;
var PLAYER_SITTING_OUT = 1;

// 게임 상태
var GAME_BETTING = 0;
var GAME_PRE_FLOP = 1;
var GAME_FLOP = 2;
var GAME_TURN = 3;
var GAME_RIVER = 4;
var GAME_RESULT = 5;

// 카드 모양
var SPADE = 0;
var DIAMOND = 1;
var HEART = 2;
var CLUB = 3;

var game = {
	code: CODE_SUCCESS,
	status: GAME_RIVER,
	dealer: 3,
	actor: 2,
	floor: {
		pot: 300,
		cards: [
			{
				shape: CLUB,
				number: 14
			},
			{
				shape: HEART,
				number: 13
			},
			{
				shape: HEART,
				number: 4
			},
			{
				shape: DIAMOND,
				number: 8
			}
		]
	},
	betting: {
		min: 100,
		call: 200
	},
	players: [
		{
			id: 0,
			avatar: 1,
			seat: 6,
			name: "해치",
			chip: 30000,
			betting: 100,
			cards: [
				{
					shape: SPADE,
					number: 0
				},
				{
					shape: HEART,
					number: 0
				}
			],
			status: PLAYER_PLAYING
		},
		{
			id: 1,
			avatar: 3,
			seat: 2,
			name: "장삐쭈",
			chip: 15000,
			cards: [
				{
					shape: SPADE,
					number: 0
				},
				{
					shape: HEART,
					number: 0
				}
			],
			status: PLAYER_PLAYING
		},
		{
			id: 2,
			avatar: 9,
			seat: 8,
			name: "삐쭈",
			chip: 15000000,
			cards: [
				{
					shape: SPADE,
					number: 0
				},
				{
					shape: HEART,
					number: 0
				}
			],
			status: PLAYER_PLAYING
		},
		{
			id: 3,
			avatar: 11,
			seat: 4,
			name: "김아빠",
			chip: 99999,
			cards: [
				{
					shape: SPADE,
					number: 14
				},
				{
					shape: SPADE,
					number: 13
				}
			],
			status: PLAYER_PLAYING
		},
		{
			id: 4,
			avatar: 11,
			seat: 7,
			name: "임뽕구",
			chip: 1500000,
			betting: 200,
			cards: [
				{
					shape: SPADE,
					number: 0
				},
				{
					shape: HEART,
					number: 0
				}
			],
			status: PLAYER_PLAYING
		}
	]
};

var dealerIndex = 0;
var turn;
var bettingTimer;

document.addEventListener("DOMContentLoaded", function() {
	init();
	bindEvents();
	updateTable();
});

function nextGame() {
	dealerIndex = (dealerIndex + 1) % game.players.length;
	firstTurn();
}

function firstTurn() {
	turn = (dealerIndex + 3) % game.players.length;
}

function nextTurn() {
	turn = (turn + 1) % game.players.length;
}

function resetTable() {
	showAllPlayerCards(false);
	passDealerButton();
	dealCards();
	showBettingTimer();
	startBettingTimer();
}

// ----------------------------------------

function updateTable() {
	updatePlayers();
}

function updatePlayers() {
	var players = game.players;
	
	for(var i = 0; i < players.length; i++) {
		var player = players[i];
		
		updatePlayer(player);
		updatePlayerCard(player, 1);
		updatePlayerCard(player, 2);
		
		showPlayer(player.seat, true);
		showPlayerCards(player.seat, true);
		showPlayerChip(player.seat, player.betting > 0, player.betting);
	}
}

function updatePlayer(player) {
	document.querySelector(".seat" + player.seat + " .avatar").setAttribute( 'src', 'image/avatar/avatar' + player.avatar + '.png' );
	document.querySelector(".seat" + player.seat + " .nickname").innerHTML = player.name;
	document.querySelector(".seat" + player.seat + " .chips").innerHTML = player.chip.toLocaleString();
}

function updatePlayerCard(player, number) {
	document.querySelector(".seat" + player.seat + " .card" + number).setAttribute("src", getCardImage(player, number));
}

function getCardImage(player, number) {
	var index = number - 1;
	
	if(index < 0 || index >= player.cards.length) return "";
	
	var card = player.cards[index];
	
	return 'image/' + cardFile(card.number, card.shape);
	
	function cardFile(number, shape) {
		if(number > 0) return cardNumber(number) + '_of_' + cardShape(shape) + '.png';
		return 'back.png';
	}
	
	function cardNumber(number) {
		if(number == 11) return "jack";
		else if(number == 12) return "queen";
		else if(number == 13) return "king";
		else if(number == 14) return "ace";
		else return number;
	}

	function cardShape(shape) {
		if(shape == 0) return "spades";
		else if(shape == 1) return "diamonds";
		else if(shape == 2) return "hearts";
		else if(shape == 3) return "clubs";
	}
}

function getNumber(number) {
	if(number == 11) return "jack";
	else if(number == 12) return "queen";
	else if(number == 13) return "king";
	else if(number == 14) return "ace";
	
	return number;
}

// ----------------------------------------

function passDealerButton() {
	showAllPlayerDealerButtons(false);
	showPlayerDealerButton(game.players[dealerIndex].seat, true);
}

// ----------------------------------------

function init() {
	resize();
	initTable();
	sortPlayersBySeat();
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

// ----------------------------------------

function dealCards() {
	var playerIndex = 0;
	var cardIndex = 1;
	var players = game.players;
	
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
	showPlayerTimer(game.players[turn].seat, true);
}

// ----------------------------------------

function showPlayer(seat, visible) {
	document.querySelector(".seat" + seat).style.display = visible ? "flex" : "none";
}

function showPlayerCard(seat, number, visible) {
	document.querySelector(".seat" + seat + " .card" + number).style.display = visible ? "inline" : "none";
}

function showPlayerTimer(seat, visible) {
	document.querySelector(".seat" + seat + " .timer").style.display = visible ? "block" : "none";
}

function showPlayerChip(seat, visible, amount) {
	if(amount) document.querySelector(".seat" + seat + " .count").innerHTML = amount;
	document.querySelector(".seat" + seat + " .chip-container").style.display = visible ? "flex" : "none";
}

function showPlayerDealerButton(seat, visible) {
	document.querySelector(".seat" + seat + " .dealerbutton").style.display = visible ? "flex" : "none";
}

function showFloorCards(visible) {
	document.querySelector("#cards-on-floor").style.display = visible ? "flex" : "none";
}

function showFloorChip(visible) {
	document.querySelector("#total-chip-container").style.display = visible ? "flex" : "none";
}

// ----------------------------------------

function getProgress(turn) {
	return document.querySelector(".seat" + game.players[turn].seat + " .progress")
}

function updateProgressStatus(progress, percent) {
	progress.style.width = percent + "%";
}

// ----------------------------------------

function sortPlayersBySeat(desc) {	
	game.players = game.players.sort(function(p1, p2) {
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