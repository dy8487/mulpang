/*
 * GET home page.
 */
var Dao = require("../dao");
var clog = require("clog");
var util = require("util");

exports.index = function(req, res) {
	res.render('index', {pageId : 'today', js:"index.js"});
};

exports.all = function(req, res) {
	//res.render('coupon_all', {pageId : 'all'});
	res.render('index', {pageId : 'all', js: "index.js"});
};

exports.forward = function(req, res) {
	var uri = req.path.substring(1);
	
	// coupon_location.html -> location.html
	var pageId = uri.substring( uri.indexOf("_") + 1 );
	// location.html -> location
	pageId = pageId.substring(0, pageId.lastIndexOf("."));
	res.render(uri, {pageId: pageId, js: pageId + ".js"});
};

exports.request = function(req, res){
	var params = {};
	if(req.method == "GET"){ //get 방식의 경우 req.query 에 저장됨
		params = req.query;
	}else if(req.method == "POST"){//post 방식의 경우 req.body 에 저장됨
		params = req.body;
	}
	
	var cmd = params.cmd; //ex) "couponList"
	delete params.cmd;	// cmd 파라메터 삭제
	
	new Dao({
		cmd: cmd,
		req: req,
		res: res,
		params: params,
		callback: function(err, result){
			if(err){
				clog.error("[router]", util.inspect(err));
			}else{
				res.json(result);
			}
		}
	});
};
