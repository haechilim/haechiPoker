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

var id = 0;

// ----------------------------------------

function join(parameter) {
	var code = JOIN_SUCCESS;

	if(game.players.length > MAX_PLAYER) code = JOIN_FULL
	else {
		var player = {
			id: id,
			name: parameter.name,
			avatar: parameter.avatar,
			seat: parameter.seat,
			chip: 0,
			betting: 0,
			cards: [],
			status: PLAYER_PLAYING
		}

		game.players.push(player);
	}	

	return {
		code: code,
		id: id++
	};
}

// ----------------------------------------

var server = http.createServer(function(request, response) {
	console.log("요청 URL: ", request.url);

	var urlPath = getUrlPath(request.url);
	var filepath = getFilePath(urlPath);
	var contentType = mime.getType(filepath);
	var parameter = getUrlParameters(request.url);

	if(urlPath == "/gamedata") jsonResponse(response, game);
	else if(urlPath == "/join") jsonResponse(response, join(parameter));
	
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