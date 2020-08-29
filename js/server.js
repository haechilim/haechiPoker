var http = require("http");
var fs = require("fs");
var mime = require("mime");

var server = http.createServer(function(request, response) {	
	var path = request.url == "/" ? "poker.html" : request.url.substr(1);	
	
	if(isBinaryFile(path)) fs.readFile(path, handleFile);
	else fs.readFile(path, "UTF-8", handleFile);
	
	function handleFile(error, data) {
		response.writeHead(200, {
			"Content-Type": mime.getType(path)
		});
		
		response.end(data);
	}
});

server.listen(8888);

console.log("나 듣고 있다!");

function isBinaryFile(url) {
	var extensions = [ ".html", ".css", ".js" ];
	
	for(var i = 0; i < extensions.length; i++) {
		if(url.endsWith(extensions[i])) return false;
	}
	
	return true;
}