var http = require('http');
var path = require('path');
var fs = require('fs');
var mimeTypes = {
	'.js' : 'text/javascript',
	'.html': 'text/html',
	'.css' : 'text/css'
};
var cache = {};

function cacheAndDeliver(f,cb){
	if(!cache[f]){
		fs.readFile(f,function(err,data){
			if(!err){
				cache[f] = {content:data};
			}
			cb(err,data);
		});
		return;
	}
	console.log('loading ' + f + ' from cache');
	cb(null,cache[f].content);
}
http.createServer(function(request,response){
	var lookup = path.basename(decodeURI(request.url)) || 'index.html';
	
	var f = 'content/' + lookup;
	fs.exists(f,function(exists){
		if(exists){
			cacheAndDeliver(f,function(err,data){
				if(err) {
					response.writeHead(500);
					response.end('Server Error!');
					return;
				}
				var headers = {'Content-type':mimeTypes[path.extname(lookup)]};
				response.writeHead(200,headers);
				response.end(data);
			});
			
			return;
		}
		
		response.writeHead(404);
		response.end('Not Found');
	});
}).listen(3000);