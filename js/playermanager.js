var constants = require("./constants");

var _this = {};
var gamedata = {};


// ------------------ 초기화 ----------------------

_this.init = function(data) {
	gamedata = data;
};

// ------------------ 스몰/빅 블라인드, 처음 할 사람 결정 ----------------------

_this.smallBlindBets = function() {
    var player = _this.getNextPlayer(gamedata.dealer, 1);
	gamedata.smallBlind = player.seat;
	this.bet(player, gamedata.betting.min / 2);
};

_this.bigBlindBets = function() {
    var player = _this.getNextPlayer(gamedata.dealer, 2);
	gamedata.smallBlind = player.seat;
	_this.bet(player, gamedata.betting.min);
};

_this.changeActor = function() {
	gamedata.actor = getNextPlayer(gamedata.dealer, 3).seat;
};

_this.getNextPlayer = function(seat, nth) {
	var count = 0;

	while(true) {
        seat = (seat + 1) % constants.MAX_PLAYER;

		var player = _this.getBySeat(seat);

		if(player != null) {
			count++;
			if(count == nth) return player;
		}
	}
};

// ------------------ get*by() 함수들 ----------------------

_this.getById = function(id) {
	for(var i = 0; i < gamedata.players.length; i++) {
		var player = gamedata.players[i];
		if(player.id == id) return player;
	}
	
	return null;
};

_this.getByName = function(name) {
	for(var i = 0; i < gamedata.players.length; i++) {
		var player = gamedata.players[i];
		if(player.name == name) return player;
	}
	
	return null;
};

_this.getBySeat = function(seat) {
	for(var i = 0; i < gamedata.players.length; i++) {
		var player = gamedata.players[i];
		if(player.seat == seat) return player;
	}
	
	return null;
};

_this.getByIndex = function(index) {
	return (index >= 0 && index < gamedata.players.length) ? gamedata.players[index] : null;
};

_this.getIndexById = function(id) {
	for(var index = 0; index < gamedata.players.length; index++) {
		if(gamedata.players[index].id == id) return index;
	}

	return null;
};

// ------------------ 베팅 ----------------------

_this.bet = function(player, chip) {
	if(player.chip < chip) chip = player.chip;

	gamedata.floor.pot += chip;
	player.chip -= chip;
	player.betting += chip;
};

// ------------------ 기타 ----------------------

_this.nameExists = function(name) {
	for(var i = 0; i < gamedata.players.length; i++) {
		if(gamedata.players[i].name == name) return true;
	}

	return false;
};


module.exports.init = _this.init;
module.exports.smallBlindBets = _this.smallBlindBets;
module.exports.bigBlindBets = _this.bigBlindBets;
module.exports.changeActor = _this.changeActor;
module.exports.getById = _this.getById;
module.exports.getByName = _this.getByName;
module.exports.getBySeat = _this.getBySeat;
module.exports.getByIndex = _this.getByIndex;
module.exports.getIndexById = _this.getIndexById;
module.exports.bet = _this.bet;
module.exports.nameExists = _this.nameExists;
