var http = require("http");
var fs = require("fs");
var mime = require("mime");

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
	status: GAME_FLOP,
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
			,
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
					number: 11
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

var server = http.createServer(function(request, response) {
	if(request.url == "/gamedata") {
		response.writeHead(200, {
			"Content-Type": "application/json; charset=utf-8"
		});
		
		response.end(JSON.stringify(game));
		return;
	}
	
	var path = request.url == "/" ? "poker.html" : request.url.substr(1);
	var contentType = mime.getType(path);
	var binary = isBinary(contentType);
	
	if(binary) fs.readFile(path, handleFile);
	else fs.readFile(path, "UTF-8", handleFile);
	
	function handleFile(error, data) {
		response.writeHead(200, {
			"Content-Type": contentType + (binary ? "" : "; charset=utf-8")
		});
		
		response.end(data);
	}
});

server.listen(8888);

console.log("나 듣고 있다!");

function isBinary(type) {
	return !(type.startsWith("text") || type == "application/javascript");
}