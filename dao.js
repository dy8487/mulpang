var clog = require("clog");
var util = require("util");
var fs = require("fs");

clog.configure({"log level": 5});
//{'log': true, 'info': true, 'warn': true, 'error': true, 'debug': true}

// mongolian 모듈 import
var Mongolian = require("mongolian");
var server = new Mongolian;	// local server
// var server = new Mongolian("mongo://localhost:27017");	// remote server

var db = server.db("mulpang");
clog.info("mulpang DB 접속.");

var ObjectId = Mongolian.ObjectId;
db.member = db.collection("member");
db.shop = db.collection("shop");
db.coupon = db.collection("coupon");
db.purchase = db.collection("purchase");
db.epilogue = db.collection("epilogue");

// DB Access 하는 기능의 확장 모듈
var Dao = module.exports = function(options){
	if(!options){
		options = {};
	}
	this.cmd = options.cmd;				//요청할 작업 함수명
	this.callback = options.callback;	//작업 완료 후 호출할 콜백함수
	this.params = options.params;		//작업에 필요한 파라미터
	this.req = options.req;				//request
	this.res = options.res;				//response
	
	clog.log("[dao]", "cmd: ", this.cmd);
	clog.log("[dao]", "params: ", util.inspect(this.params));
	
	if(this.cmd){
		this[this.cmd].call(this); //call -> java의 reflection 과 같은 효과
	}
	
};

Dao.prototype = { //prototype 은 javascript 의 객체 생성시 method 를 선언하면, 동작하는 내부 object 
	// 쿠폰 목록조회(오늘)
	couponList: function(){
		var dao = this;
		var resultArray = ["couponName","image","desc",
							"primeCost","price","useDate",
							"quantity","buyQuantity","saleDate",
							"position"];
		var resultAttr = {}; //resultArray 와 result 의 매핑
		for( var i=0; i<resultArray.length; i++ ){
			var attr = resultArray[i];
			resultAttr[attr] = 1;// -1 일 경우 가져오지 않음
		}
		//검색조건
		var query = {};
		
		var now = new Date();		
		
		// 검색조건(기간)
		// 현재 기준으로 판매시작일이 지난 쿠폰
		//query["saleDate.start"] = {"$lte": now};
		
		switch(this.params.search_date){
		case "buyable":			
			query["saleDate.finish"] = {"$gte": now};
			break;
		case "past":
			query["saleDate.finish"] = {"$lt": now};
			break;
		case "all":
			// 특별히 추가할 조건 없음
		}
		
		// 검색조건(지역명)
		if(this.params.search_location && this.params.search_location != ""){
			query["region"] = this.params.search_location;
		}
		
		// 검색조건(검색어)
		if(this.params.search_keyword && this.params.search_keyword.trim() != ""){
			// 정규표현식 i -> 대소문자 무시
			query["$or"] = [{couponName: new RegExp(this.params.search_keyword, "i")}, {desc: new RegExp(this.params.search_keyword, "i")}];
		}
		
		// 정렬 옵션
		var orderBy = {};
		if(this.params.list_order){
			orderBy[this.params.list_order] = -1;
		}else{	// 정렬 조건이 없을 경우
			orderBy = {
				"saleDate.start": -1,		// 판매 시작일의 내림차순(최근 판매 쿠폰 먼저)
				"saleDate.finish": 1		// 판매 종료일의 오름차순(종료가 얼마 남지 않은 쿠폰 먼저)
			};
		}
		
		db.coupon.find(query,resultAttr)
			.sort(orderBy)
			.toArray(
				function(err, result){
				//this.callback(err, result);	//이곳의 this 는 function 자체를 나타냄
					DaoUtil.objectIdToString(result);
					dao.callback(err, result);			
				});	
	},
	
	// 쿠폰 상세 조회
	couponDetail: function(){
		var dao = this;
		//아이디로 쿠폰을 조회한다.
		db.coupon.findOne({_id: new ObjectId(this.params._id)}, function(err, coupon){
			//쿠폰을 조회한 후 업체를 조회한다.
			db.shop.findOne({_id: coupon.shopId},function(err, shop){
				coupon.shop = shop;
				//업체를 조회한 후 후기를 조회한다.
				db.epilogue.find({couponId: coupon._id}).toArray(function(err, epilogue){
					coupon.epilogue = epilogue;
					//뷰 카운터를 하나 증가시킨다.
					//{조건},{변경된 문서} 
					db.coupon.update({_id:coupon._id},{"$inc":{viewCount: 1}}, function(err){
						
						// 웹소켓으로 수정된 조회수 top5 를 전송한다.						
						dao.topCoupon("viewCount", function(err, result){
							//sockets : 접속된 모든 클라이언트의 connection 이 들어가 있음
							//emit : 동작하라는 의미						
							dao.res.io.sockets.emit("websocketAnswer", result);	
						});
						DaoUtil.objectIdToString(coupon);
						dao.callback(err, coupon);
						
					});
				});
			});
		});
	},
	
	// 쿠폰 구매
	buyCoupon: function(){		
		this.params.regDate = new Date();
		this.params.couponId = new ObjectId(this.params.couponId);
		this.params.paymentInfo = {
			cardType: this.params.cardType,
			cardNumber: this.params.cardNumber,
			cardExpireDate: this.params.cardExpireYear + this.params.cardExpiremMonth,
			csv: this.params.csv,
			priace: parseInt( this.params.unitPrice ) * parseInt(this.params.quantity)
		};
		delete this.params.cardType;
		delete this.params.cardNumber;
		delete this.params.cardExpreYear;
		delete this.params.cardExpreMonth;
		delete this.params.csv;
		delete this.params.unitPrice;
		
		clog.debug(this.params);
		
		var dao = this;
		db.purchase.insert(this.params, function(err, result){
			//구매 성공시 구매 수량을 증가한다.
			db.coupon.update(
				{_id:dao.params.couponId}
				, {"$inc":{buyQuantity: parseInt(dao.params.quantity)}}
				, function(err, upateCount){
					dao.callback(err, upateCount);
				}
			);
		});
		
	},
	
		// 추천 쿠폰 조회
	topCoupon: function(condition, callback){
		var dao = this;
		
		// 검색 조건
		if(!condition){	// dao에서 호출할 경우 condition 파라미터를 넘긴다.
			condition = dao.params.condition;
		}
		
		// 정렬 방식
		var orderBy = {};
		orderBy[condition] = -1;	// cf.) {buyQnantity: -1}, -1: 내림차순
		
		// 출력할 결과 컬럼
		var resultAttr = {couponName: 1};
		resultAttr[condition] = 1;
		
		db.coupon.find({}, resultAttr).limit(5).sort(orderBy).toArray(function(err, result){
			clog.debug(condition + " 조회: ", result);
			DaoUtil.objectIdToString(result);
			if(callback){	// dao에서 호출할 경우 callback 파라미터를 넘긴다.
				callback(err, result);
			}else{
				dao.callback(err, result);
			}
		});
	},
	
	
	// 지정한 쿠폰 아이디 목록을 받아서 남은 수량을 넘겨준다.
	couponQuantity: function(){
		// 쿠폰 목록이 ","를 구분자로 하나의 문자열로 전달되므로 ","를 기준으로 자른다.
		var idArray = this.params.couponIdList.split(",");
		var idObjArray = [];
		for(var i=0; i<idArray.length; i++){
			idObjArray.push(new ObjectId(idArray[i]));
		}
		
		var dao = this;
		// 쿠폰아이디 배열에 포함된 쿠폰을 조회한다. 
		db.coupon.find(
			{_id: {"$in": idObjArray}}
			, {quantity: 1, buyQuantity: 1, couponName: 1}).toArray(
				function(err, list){
					DaoUtil.objectIdToString(list);
					
					// Server-Sent Events 형식의 응답 헤더 설정
					dao.res.contentType("text/event-stream");
					dao.res.write('data: ' + JSON.stringify(list));
					dao.res.write("\n\n");
					dao.res.write("retry: " + 1000*10);
					dao.res.write("\n");
					dao.res.end();
				});
	},

	// 회원 가입
	registMember: function(){
		// 임시로 저장한 프로필 이미지를 실제 이미지로 변경한다.
		var tmpDir = __dirname + "/public/tmp/";
		var tmpFileName = this.params.tmpFileName;
		var profileDir = __dirname + "/public/image/member/";		
		var profileFileName = this.params._id + "." + tmpFileName.split(".")[1];	// 이메일.이미지확장자
		this.params.profileImage = "member/" + profileFileName;	// DB에 등록할 프로필이미지를 지정한다.
		
		delete this.params.tmpFileName;
		
		this.params.regDate = new Date();
		var dao = this;
		db.member.insert(this.params, function(err, member){
			if(err){
				console.log(err.result.code);
			}
			
			if(err && err.result.code == 11000){	// 아이디 중복일 경우 발생하는 에러
				var errMsg = {
					err: err.result.code,
					msg: dao.params._id + "는 이미 등록된 이메일 입니다."
				};
				dao.callback(null, errMsg);	// router에서 에러가 있으면 응답하지 않으므로 null로 세팅
			}else{				
				fs.rename(tmpDir + tmpFileName, profileDir + profileFileName, function(err){
					dao.callback(err, member);
				});
			}
		});
	},
	
	// 로그인 처리
	login: function(){
		var dao = this;
		// 지정한 아이디와 비밀번호로 회원을 조회한다.
		db.member.findOne(this.params, {_id: 1, profileImage: 1}, function(err, member){
			if(member){
				
				//세션으로 profile 정보 대체
				dao.req.session.userId = member._id;
				dao.req.session.profileImage = member.profileImage;
				
				dao.callback(err, member);
				
			}else{
				var errMsg = {
					err: "아이디 비번 오류",
					msg: "아이디와 비밀번호를 확인하시기 바랍니다."
				};
				dao.callback(null, errMsg);
			}
		});
	},
	
	// 회원 정보 조회
	getMember: function(){		
		this.params._id = this.req.session.userId;
		var dao = this;
		if(this.params._id == undefined){	// 세션에 아이디가 없을 경우
			var err = {result: {err: "에러", msg: "로그인이 필요한 서비스입니다."}};
			dao.callback(null, err);
		}else{			
			// 회원 정보를 가져온다.
			db.member.findOne(this.params, {_id: 1, profileImage: 1}, function(err, member){
				var query = {email: dao.params._id};
				var resultAttr = {_id: 0, couponId: 1};
				var orderBy = {regDate: -1};
				
				// 회원의 구매 정보를 가져온다.
				db.purchase.find(query, resultAttr).sort(orderBy).toArray(function(err, couponList){					
					var couponIdArray = [];
					for(var i=0; i<couponList.length; i++){
						couponIdArray.push(couponList[i].couponId);
					}

					// 구매한 쿠폰 정보를 가져온다.
					db.coupon.find({_id: {"$in": couponIdArray}}, {couponName: 1, image: 1, regDate: 1}).toArray(function(err, couponList){
						
						// 해당 회원이 구매한 쿠폰의 후기 정보를 가져온다.
						db.epilogue.find({couponId: {"$in": couponIdArray}, writer: member._id}, {couponId: 1, content: 1, satisfaction: 1, regDate: 1}).toArray(function(err, epilogueList){
							DaoUtil.objectIdToString(couponList);
							
							// 쿠폰 정보에 후기 정보를 추가한다.
							while(epilogue = epilogueList.shift()){
								for(var i=0; i<couponList.length; i++){
									if(couponList[i]._id == epilogue.couponId.toString()){										
										couponList[i].epilogue = epilogue;
										break;
									}
								}
							}							
							member.coupon = couponList;
							
							dao.callback(err, member);
						});
					});
				});
			});
		}
	},
	
	// 회원 정보 수정
	updateMember: function(){
		
		var oldPassword = this.params.oldPassword;	// 이전 비밀번호	
		delete this.params.oldPassword;
		
		var dao = this;
		
		this.params._id = this.req.session.userId;
		
		if(!this.params._id){	// 세션에 아이디가 없을 경우
			var err = {err: "에러", msg: "로그인이 필요한 서비스입니다."};
			dao.callback(null, err);
		}else{	
			// 이전 비밀번호로 회원 정보를 조회한다.
			db.member.findOne({_id: this.params._id, password: oldPassword}, function(err, member){
				if(!member){	// 회원 정보가 조회되지 않을 경우
					var err = {err: "에러", msg: "비밀번호가 맞지 않습니다."};
					dao.callback(null, err);
				}else{
					if(dao.params.password.trim() != ""){	// 패스워드를 변경할 경우
						member.password = dao.params.password;
					}
					
					if(dao.params.tmpFileName){	// 프로필 이미지를 변경할 경우
						// 임시로 저장한 프로필 이미지를 실제 이미지로 변경한다.
						var tmpDir = __dirname + "/public/tmp/";
						var tmpFileName = dao.params.tmpFileName;
						var profileDir = __dirname + "/public/image/member/";						
						var profileFileName = dao.params._id + "." + tmpFileName.split(".")[1];	// 이메일.이미지확장자	
												
						fs.rename(tmpDir + tmpFileName, profileDir + profileFileName);
						member.profileImage = "member/" + profileFileName;
					}
					
					// 회원 정보를 수정한다.
					db.member.update({_id: member._id}, member, function(err, result){
						// 세션에 프로필 이미지 경로를 저장한다.
						dao.req.session.profileImage = member.profileImage;
						dao.callback(err, result);
					});
				}
			});
		}
	},
	
	// 쿠폰 후기 등록
	insertEpilogue: function(){
		
		this.params.writer = this.req.session.userId;
		
		if(!this.params.writer){
				
			var err = {err: "에러", msg: "로그인이 필요한 서비스입니다."};
			dao.callback(null, err);
			
		}else{
			
			this.params.regDate = new Date();	// 등록일
			this.params.couponId = new ObjectId(this.params.couponId);
		
			var dao = this;
			db.epilogue.insert(this.params, function(err, epilogueObj){
				// 후기 등록에 성공했을 경우
				// 쿠폰 컬렉션의 후기 수와 만족도 합계를 업데이트 한다.
				db.coupon.update({_id: dao.params.couponId}, {"$inc": {epilogueCount: 1}, "$inc": {satisfactionSum: parseInt(dao.params.satisfaction)}}, function(err, result){
					DaoUtil.objectIdToString(epilogueObj);
					dao.callback(err, epilogueObj);
				});
			});
			
		}
		
	}
	
};

// dao에서 사용하는 유틸리티 클래스
var DaoUtil = {};
// 지정한 객체나 객체 배열의 아이디(_id) 값을 문자열로 변환한다.
DaoUtil.objectIdToString = function(obj){
	if(obj instanceof Array){	// 배열일 경우
		for(var i=0; i<obj.length; i++){
			if(obj[i]._id != undefined){
				obj[i]._id = obj[i]._id.toString();
			}
		}
	}else if(obj instanceof Object){	// object일 경우
		if(obj._id != undefined){
			obj._id = obj._id.toString();
		}
	}
};



















