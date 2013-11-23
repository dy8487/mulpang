var http = require('http');
var fs = require('fs');
http.createServer(function(req, res) {
	//res.writeHead(200, {
	//	'Content-Type' : 'text/html'
	//});
	//console.log(req);
	
	var filename = req.url.substring(1);
	fs.readFile(filename, function(err, data){		
		res.end(data);
		//console.log("result:" + data);
	});	
	
	
	
	
	
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
