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
db.member.find();

// 3. 이름이 kim인 회원 조회
// find(검색조건)
db.member.find({name: "kim"});

// 4. 한건 조회
// findOne()
db.member.findOne({name: "kim"});

// 5. 수정(kim의 나이를 21살로 수정)
// update(검색조건, 수정할문서)
db.member.update({name: "kim"}, {$set: {age: 10}}, false, true);
db.member.find();

var lee = db.member.findOne({name: "lee"});
lee.age = 30;
db.member.update({name: "lee"}, lee);

// 6. 삭제(lee 삭제)
// remove(검색조건)
db.member.remove({name: "lee"});
db.member.find();






















