var http = require("http");
var fs = require("fs");
var mime = require("mime");
var game = require("./game");
var constants = require("./constants");

// ----------------------------------------

function betting() {
	gamedata.status = constants.gs.BETTING;

	setActor();

	return { code: constants.rc.SUCCESS }
}

function fold(parameter) {
	var code = constants.rc.SUCCESS;
	var player = getPlayerById(parameter.id);

	if(gmae.actor != player.seat) code = constants.rc.NOT_YOUR_TURN;
	else if(gamedata.status != constants.gs.BETTING) code = constants.rc.NO_PERMISSION;
	else {
		
		setDealer();
		setSmallBlind();
		setBigBlind();
		setActor();
		dealCards();
	}

	return {
		code: code
	};
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
			jsonResponse(response, game.gamedata(parameter.id));
			return;

		case "/join":
			 jsonResponse(response, game.join(parameter.name, parameter.avatar, parameter.seat));
			 return;

		case "/start":
			jsonResponse(response, game.start(parameter.id));
			return;

		case "/betting":
			jsonResponse(response, betting());
			return;

		case "/fold":
			jsonResponse(response, fold(parameter));
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

server.listen(8888, function() {
	game.init();
	console.log("나 듣고 있다!");
});


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
