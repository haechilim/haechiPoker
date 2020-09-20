var TOTAL_SEATS = 9;
var CARDS_DEALING_INTERVAL = 100;
var DEALING_FLOOR_INTERVAL = 500;
var BETTING_TIMEOUT = 8;

// 응답코드 (Response Code)
var RC_SUCCESS = 0;
var RC_NOT_YOUR_TURN = 1;
var RC_NO_PERMISSION = 2;
var RC_FULL = 3;
var RC_ALREADY_EXISTS = 4;

// 플레이어 상태
var PS_PLAYING = 0;
var PS_SITTING_OUT = 1;

// 게임 상태
var GS_BETTING = 0;
var GS_PRE_FLOP = 1;
var GS_FLOP = 2;
var GS_TURN = 3;
var GS_RIVER = 4;
var GS_RESULT = 5;
var GS_WAITING = 6;

// 카드 모양
var SPADE = 0;
var DIAMOND = 1;
var HEART = 2;
var CLUB = 3;

// 게임 데이터 요청 주기
var DATA_REQUEST_INTERVAL = 1000;

var myId;
var sequece = -1;

var game = {};
var dealerIndex = 0;
var turn;
var bettingTimer;

document.addEventListener("DOMContentLoaded", function() {
	init();
	bindEvents();
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
	req
	passDealerButton();
}

// ----------------------------------------

function updateTable() {
	updatePlayers();
	showAllFloorCards(true);
	updatePot();
}

function showAllFloorCards(visible) {
	if(!visible) {
		showAll(false);
		return;
	}
	
	switch(game.status) {
		case GS_PRE_FLOP:
			showAll(true);
			break;
		
		case GS_FLOP:
			dealFlopCards();
			break;
			
		case GS_TURN:
			dealTurnCards();
			break;
			
		case GS_RIVER:
			dealRiverCards();	
			break;
			
		case GS_BETTING:
			showAll(true);
			startBettingTimer();
			break;
	}
	
	function showAll(visible, count) {
		var length = visible ? game.floor.cards.length : 5;
		
		for(var index = 0; index < length; index++) {
			if(count && index == count) break;
			if(visible) updateFloorCard(index);
			showFloorCard(visible, index);
		}
	}
	
	function dealFlopCards() {
		animate(0, 2);
	}
	
	function dealTurnCards() {
		showAll(true, 3);
		animate(3, 3);
	}
	
	function dealRiverCards() {
		showAll(true, 4);
		animate(4, 4);
	}
	
	function animate(startIndex, endIndex) {
		var cardIndex = startIndex;
		
		var timer = setInterval(function() {
			updateFloorCard(cardIndex);
			showFloorCard(true, cardIndex++);
			
			if(cardIndex > endIndex) {
				clearInterval(timer);
				startBettingTimer();
			}
		}, DEALING_FLOOR_INTERVAL);
	}
}

function updatePlayers() {
	var players = game.players;
	
	for(var i = 0; i < players.length; i++) {
		var player = players[i];
		
		updatePlayer(player);
		updatePlayerCard(player, 1);
		updatePlayerCard(player, 2);
		
		showPlayer(player.seat, true);
		showPlayerChip(player.seat, player.betting > 0, player.betting);
	}
	
	if(game.status != GS_WAITING) showAllPlayerCards(true);
	
	if(getPlayer(game.dealer) != null) showPlayerDealerButton(getPlayer(game.dealer).seat, true);
}

function updatePlayer(player) {
	document.querySelector(".seat" + player.seat + " .avatar").setAttribute( 'src', 'image/avatar/avatar' + player.avatar + '.png' );
	document.querySelector(".seat" + player.seat + " .nickname").innerHTML = player.name;
	document.querySelector(".seat" + player.seat + " .chips").innerHTML = player.chip.toLocaleString();
}

function updatePlayerCard(player, number) {
	document.querySelector(".seat" + player.seat + " .card" + number).setAttribute("src", getCardImage(player, number));
}

function updatePot() {
	document.querySelector(".pot").innerHTML = "POT : " + game.floor.pot;
}

// ----------------------------------------

function getCardImage(player, number) {
	var index = number - 1;
	
	if(index < 0 || index >= player.cards.length) return "";
	
	var card = player.cards[index];
	
	return 'image/' + getCardFile(card.number, card.shape);
}

function getCardFile(number, shape) {
	if(number > 0) return getCardNumber(number) + '_of_' + getCardShape(shape) + '.png';
	return 'back.png';
	
	function getCardNumber(number) {
		if(number == 11) return "jack";
		else if(number == 12) return "queen";
		else if(number == 13) return "king";
		else if(number == 14) return "ace";
		else return number;
	}

	function getCardShape(shape) {
		if(shape == 0) return "spades";
		else if(shape == 1) return "diamonds";
		else if(shape == 2) return "hearts";
		else if(shape == 3) return "clubs";
	}
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
	requestJoin(function(json) {
		console.log(json);
		myId = json.id;
		if(json.code == RC_FULL) return;
		requestGameData();
		setInterval(requestGameData, DATA_REQUEST_INTERVAL);
	});
}

function initTable() {
	showAllPlayers(false);
	showAllPlayerChips(false);
	showAllPlayerCards(false);
	showAllPlayerTimers(false);
	showAllPlayerDealerButtons(false);
	showFloorChip(false);
	showAllFloorCards(false);
}

// ----------------------------------------

function startBettingTimer() {
	setTimeout(function() {
		//showPlayerTimer(getPlayer(game.actor).seat, true);
		//startPlayerTimer();
	}, DEALING_FLOOR_INTERVAL);
}

function startPlayerTimer() {
	var percent = 100;
	var step = 0.5;
	var interval = (BETTING_TIMEOUT * 1000) / (100 / step);
	var progress = getProgress(game.actor);
	
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
		initTable();
	});
	
	document.querySelector('#fold').addEventListener('click', function() {
		requestBetting(function() {
			
		});
	});
	
	document.querySelector('#call').addEventListener('click', function() {
		nextTurn();
		showBettingTimer();
		startPlayerTimer();
	});

	document.querySelector('#potButton').addEventListener('click', function() {
		requestStart(function(json) {
			if(json.code == RC_SUCCESS) {
				//requestBetting(function() {
					requestGameData();
					initTable();
				//});
			}
		});
	});
}

// ----------------------------------------

function requestGameData() {
	request("gamedata?id=" + myId, function(data) {
		if(sequece >= data.sequece) return;
		sequece = data.sequece;
		game = data;
		updateTable();
	});
}

function requestJoin(callback) {
	request("/join" + location.search, callback);
}

function requestStart(callback) {
	request("/start?id=" + myId, callback);
}

function requestBetting(callback) {
	request("/betting", callback);
}

function requestFold(callback) {
	request("/fold?id=" + myId, callback);
}

function request(url, callback) {
	var xhr = new XMLHttpRequest();
		
	xhr.addEventListener("load", function() {
		var json = JSON.parse(xhr.responseText);
		if(callback) callback(json);
	});
	
	xhr.open("GET", url, true);
	xhr.send();
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
	if(game.status == GS_PRE_FLOP && visible) animate();
	else {
		for(var seat = 0; seat < TOTAL_SEATS; seat++) {
			showPlayerCards(seat, visible);
		}
	}
	
	function animate() {
		var playerIndex = 0;
		var cardIndex = 1;
		var players = game.players;

		showAllPlayerCards(false);
		
		var timer = setInterval(function() {
			showPlayerCard(players[playerIndex++].seat, cardIndex, true);
			
			if(playerIndex == players.length) {
				playerIndex = 0;
				cardIndex++;
				
				if(cardIndex == 3) {
					startBettingTimer();
					clearInterval(timer);
				}
			}
		}, CARDS_DEALING_INTERVAL);
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

function showFloorCard(visible, cardIndex) {
	document.querySelector(".cards-on-floor .card" + cardIndex).style.display = visible ? "inline-flex" : "none";
}

function updateFloorCard(cardIndex) {
	var cards = game.floor.cards;
	
	if(cardIndex < 0 || cardIndex >= cards.length) return;
	
	var cardFile = getCardFile(cards[cardIndex].number, cards[cardIndex].shape);
	
	document.querySelector(".cards-on-floor .card" + cardIndex).setAttribute( 'src', 'image/' + cardFile);
}

function showFloorChip(visible) {
	document.querySelector("#total-chip-container").style.display = visible ? "flex" : "none";
}

// ----------------------------------------

function getProgress(actor) {
	var player = getPlayer(actor);
	
	if(!player) return;
	
	return document.querySelector(".seat" + player.seat + " .progress");
}

function updateProgressStatus(progress, percent) {
	progress.style.width = percent + "%";
}

function getPlayer(seat) {
	if(seat != -1) {
		var players = game.players;
		
		for(var i = 0; i < players.length; i++) {
			if(players[i].seat == seat) return players[i];
		}
	}
	
	return null;
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