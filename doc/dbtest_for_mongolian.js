var Mongolian = require("mongolian");
var clog = require("clog");
var util = require("util");

clog.configure({"log level": 5});
//{"log": true, "info": true, "warn": true, "error": true, "debug": true}

var server = new Mongolian;	// localhost DB 접속
// remove DB 접속
// var server = new Mongolian("mongo://localhost:27017");

var db = server.db("test");
db.member = db.collection("member");

// 현재 DB 삭제
db.runCommand({dropDatabase: 1});

// 등록할 게시물
var m1 = {name: "kim", age: 20};
var m2 = {name: "lee", age: 28};
var m3 = {name: "kim", age: 35};

// 1. member 컬렉션에 회원 등록
// insert(등록할 문서)
db.member.insert(m1);
db.member.insert(m2);
db.member.insert(m3);

// 2. 모든 member 컬렉션의 문서 조회
// find()
db.member.find().toArray(function(err, result){
	clog.info("2. 모든 member 컬렉션의 문서 조회: " + util.inspect(result));
});

// 3. 이름이 kim인 회원 조회
// find(검색조건)
db.member.find({name: "kim"}).toArray(function(err, result){
	clog.debug("3. 이름이 kim인 회원 조회: " + util.inspect(result));
});

// 4. 한건 조회
// findOne()
db.member.findOne({name: "kim"}, function(err, result){
	clog.error("4. 한건 조회: " + util.inspect(result));
});


// 5. 수정(kim의 나이를 21살로 수정)
// update(검색조건, 수정할문서)
db.member.update({name: "kim"}, {$set: {age: 10}}, false, true, function(err, result){
	db.member.find({name: "kim"}).toArray(function(err, result){
		clog.warn("5. 수정(kim의 나이를 10살로 수정): " + util.inspect(result));
	});
});


db.member.findOne({name: "lee"}, function(err, lee){
	lee.age = 30;
	db.member.update({name: "lee"}, lee);
});

// 6. 삭제(kim 삭제)
// remove(검색조건)
db.member.remove({name: "kim"}, function(err, result){
	db.member.find().toArray(function(err, result){
		clog.log("6. 삭제(kim 삭제): " + util.inspect(result));
	});
});






















