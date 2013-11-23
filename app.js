
/**
 * Module dependencies.
 */

var express = require('express')
  , router = require('./routes/router')
  , http = require('http')
  , path = require('path');

var app = express();

/* 
 * Express (Node.js의 웹 프레임 워크) 에서의 Middleware 개념은 
 * 쉽게 설명하자면 Java 에서의 Filter 와 비슷한 개념입니다. 
 * 자주 쓰이고 통념적으로 쓰이는 행위들을 미리 걸러주는 역할을 한다고 
 * 볼 수 있습니다.
 * http://crazia.tistory.com/entry/Express-Nodejs-%EC%9D%98-%EC%9B%B9%ED%94%84%EB%A0%88%EC%9E%84%EC%9B%8C%ED%81%AC-%EC%9D%B5%EC%8A%A4%ED%94%84%EB%A0%88%EC%8A%A4%EC%97%90%EC%84%9C%EC%9D%98-%EB%AF%B8%EB%93%A4%EC%9B%A8%EC%96%B4-%EB%A7%8C%EB%93%A4%EA%B8%B0
 * 
 * */  

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('.html', require('jqtpl').__express);
app.locals.layout = true;
app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.bodyParser({
	uploadDir: __dirname + "/public/tmp", //파일업로드 임시 저장경로
	keepExtension: true //확장자 유지여부
}));

//쿠키 사용
app.use(express.cookieParser());
//세션 사용
//app.use(express.session({cookie: {maxAge: 1000*60*30}}));

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
app.post('/upload', router.upload);
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















