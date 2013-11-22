
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
app.get('/request', function(res, req){
	res.io = io;
	router.request(res, req);
});

app.post('/request', router.request);

app.get('/*.html', router.forward);

var httpServer = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require("socket.io").listen(httpServer);














