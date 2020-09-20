var deck = require("./deck");
var pm = require("./playermanager");
var constants = require("./constants");
var util = require("./util");

var gamedata = {
	status: constants.gs.WAITING,
	dealer: -1,
	smallBlind: -1,
	bigBlind: -1,
	actor: -1,
	floor: {
		pot: 0,
		cards: []
	},
	betting: {
		min: 100,
		call: 0
	},
    players: [],
    sequece: 0
};

var lastPlayerId = 0;

module.exports.init = function() {
    pm.init(gamedata);
};

// ----------------------------------------

module.exports.join = function(name, avatar, seat) {
	var code = constants.rc.SUCCESS;
	var id = -1;
	var status = gamedata.status == constants.gs.WAITING ? constants.ps.PLAYING : constants.ps.SITTING_OUT;
	var owner = gamedata.players.length == 0;

	if(gamedata.players.length >= constants.MAX_PLAYER) code = constants.rc.FULL;
	else {
        var player = pm.getByName(name);

		if(player) {
			code = constants.rc.ALREADY_EXISTS;
			id = player.id;
		}
		else {
			id = lastPlayerId++;

			gamedata.players.push({
				id: id,
				name: name,
				avatar: avatar,
				seat: seat,
				owner: owner,
				chip: 10000,
				betting: 0,
				cards: [],
				status: status
            });
            
            gamedata.sequece++;
		}
	}
	
	return {
		code: code,
		id: id
	};
};

module.exports.start = function(id) {
	var code = constants.rc.SUCCESS;
	var player = pm.getById(id);

	if(!player.owner) code = constants.rc.NO_PERMISSION;
	else if(gamedata.status != constants.gs.WAITING) code = constants.rc.ILLEGAL_STATE;
	else {
        changeDealer();
        setGameStatus(constants.gs.PRE_FLOP);
        gamedata.sequece++;
    }

	return {
		code: code
    };

    function changeDealer() {
        gamedata.dealer = player.seat;
    }
};

module.exports.gamedata = function(id) {
    var data = util.copyObject(gamedata);

    data.players.forEach(function(player) {
        if(player.id == id) return;

        player.cards.forEach(function(card) {
            card.number = -1;
            card.shape = -1;
        });
    });

    return data;
};

// ------------------- 게임 상태 변경 ---------------------

function setGameStatus(status) {
    gamedata.status = status;

    switch(status) {
        case constants.gs.PRE_FLOP:
            setPreFlop();
            break;
    }
}

function setPreFlop() {
    deck.init();
    pm.smallBlindBets();
    pm.bigBlindBets();
    dealCards();

    function dealCards() {
        gamedata.players.forEach(function(player) {
            player.cards = [];
            player.cards.push(deck.select());
            player.cards.push(deck.select());
        });
    }
}