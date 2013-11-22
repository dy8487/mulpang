
/**
 * Module dependencies.
 */

var express = require('express')
  , router = require('./routes/router')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('.html', require('jqtpl').__express);
app.locals.layout = true;
app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', router.index);
app.get('/index.html', router.index);
app.get('/coupon_all.html', router.all);

//app.get('/request', router.request);
app.get('/request', function(req, res){
	res.io = io;
	router.request(req, res);
});

app.post('/request', router.request);

app.get('/*.html', router.forward);

var httpServer = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// socket.io 서버 구동
var io = require("socket.io").listen(httpServer);

//기본적으로 connection 이벤트 발생
//클라이언트가 웹소켓서버에 접속할 때
//io.sockets : 전체
//socket : 특정 클라이언트
io.sockets.on("connection", function(socket){
	//서버역활을 하는 곳.
	socket.emit("welcome","접속을 환영합니다.");
	socket.broadcast.emit("welcome", socket.id + " 님이 들어왔습니다.");
	
	socket.on("hello", function(msg){
		console.log(msg);
	});
	
	socket.on("disconnect", function(){
		socket.broadcast.emit("welcome", socket.id + " 님이 나갔습니다.");
	});
	
});















