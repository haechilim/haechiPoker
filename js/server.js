var http = require("http");
var fs = require("fs");
var mime = require("mime");

var MAX_PLAYER = 9;

// 에러 코드
var CODE_SUCCESS = 0;
var CODE_NOT_YOUR_TURN = 1;

// 참가요청에 대한 응답코드
var JOIN_SUCCESS = 0;
var JOIN_FULL = 1;
var JOIN_ALREADY_EXISTS = 2;

// 응답코드 (Response Code)
var RC_SUCCESS = 0;
var RC_NOT_YOUR_TURN = 1;
var RC_NO_PERMISSION = 2;

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
var GAME_WAITING = 6;

// 카드 모양
var SPADE = 0;
var DIAMOND = 1;
var HEART = 2;
var CLUB = 3;

var game = {
	code: CODE_SUCCESS,
	status: GAME_WAITING,
	dealer: -1,
	actor: -1,
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
			},
			{
				shape: DIAMOND,
				number: 9
			}
		]
	},
	betting: {
		min: 100,
		call: 200
	},
	players: []
};

var playerId = 0;

// ----------------------------------------

function join(parameter) {
	var code = JOIN_SUCCESS;
	var id = -1;
	var status = game.status == GAME_WAITING ? PLAYER_PLAYING : PLAYER_SITTING_OUT;
	var owner = !game.players.length == 0;

	if(game.players.length >= MAX_PLAYER) code = JOIN_FULL;
	else if(existsName(parameter.name)) code = JOIN_ALREADY_EXISTS;
	else {
		var player = {
			id: playerId,
			name: parameter.name,
			avatar: parameter.avatar,
			seat: parameter.seat,
			owner: owner,
			chip: 0,
			betting: 0,
			cards: [],
			status: status
		}

		game.players.push(player);
		id = playerId++;
	}
	
	return {
		code: code,
		id: id
	};
}

function start(parameter) {
	var code = RC_SUCCESS;
	var player = getPlayerById(parameter.id);

	if(!player.owner) code = RC_NO_PERMISSION;
	else {
		game.status = GAME_PRE_FLOP;
		setDealer();
		
	}
}

// ----------------------------------------

function setDealer() {
	var index = 0;

	for(var i = 0; i < game.players.length; i++) {
		var player = game.players[i];

		if(player.owner) {
			game.dealer = player.seat;
			return;
		}
	}
}

// ----------------------------------------

function getPlayerById(id) {
	for(var i = 0; i < game.players.length; i++) {
		var player = game.players[i];
		if(player.id == id) return player;
	}
	
	return null;
}

function getPlayerByName(name) {
	for(var i = 0; i < game.players.length; i++) {
		var player = game.players[i];
		if(player.name == name) return player;
	}
	
	return null;
}

function getPlayerByIndex(index) {
	return (index >= 0 && index < game.players.length) ? game.players[index] : null;
}

function existsName(name) {
	for(var i = 0; i < game.players.length; i++) {
		if(game.players[i].name == name) return true;
	}

	return false;
}

// ----------------------------------------

var server = http.createServer(function(request, response) {
	console.log("요청 URL: ", request.url);

	var urlPath = getUrlPath(request.url);
	var filepath = getFilePath(urlPath);
	var contentType = mime.getType(filepath);
	var parameter = getUrlParameters(request.url);

	switch(urlPath) {
		case "/gamedata":
			jsonResponse(response, game);
			return;

		case "/join":
			 jsonResponse(response, join(parameter));
			 return;

		case "/start":
			jsonResponse(response, start(parameter));
			return;
	}
	
	if(isText(contentType))	fs.readFile(filepath, "utf-8", content);
	else fs.readFile(filepath, content);
	
	function content(error, data) {
		if(error) {
			response.writeHead(404, {
				"content-type": "text/plain; charset=utf-8"
			});
				
			response.end("File Not Found");
		}
		else {
			response.writeHead(200, {
				"content-type": contentType + (isText(contentType) ? "; charset=utf-8" : ""),
				"cache-control": isText(contentType) ? "no-cache" : "max-age=31536000"
			});
				
			response.end(data);
		}
	}
});

server.listen(8888);
console.log("나 듣고 있다!");

// ----------------------------------------

function jsonResponse(response, data) {
	response.writeHead(200, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-cache"
	});
		
	response.end(JSON.stringify(data));
}

// ----------------------------------------

function getUrlPath(url) {
	var index = url.indexOf("?");
	return index < 0 ? url : url.substr(0, index);
}

function getUrlParameters(url) {
	var result = {};
	var part = parameterPart();
	var parameters = part.split("&");
	
	for(var i = 0; i < parameters.length; i++) {
		var tokens = parameters[i].split("=");
		
		if(tokens.length < 2) continue;
		
		result[tokens[0]] = tokens[1];
	}
	
	return result;
	
	
function parameterPart() {
		var tokens = url.split("?");
		return tokens.length > 1 ? tokens[1] : "";
	}
}

function getFilePath(urlPath) {
	if(urlPath == "/") return "poker.html";
	
	return urlPath.substr(1, urlPath.length - 1);
}

// ----------------------------------------

function isBinary(type) {
	return !(type.startsWith("text") || type == "application/javascript");
}

function isText(contentType) {
	return contentType == "text/html" || contentType == "text/css" || contentType == "application/javascript";
}