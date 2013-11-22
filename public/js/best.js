// RGraph(http://www.rgraph.net) 라이브러리를 import 한다.
Util.require("lib/rgraph/RGraph.common.core.js");
Util.require("lib/rgraph/RGraph.common.dynamic.js");
Util.require("lib/rgraph/RGraph.hbar.js");

// Chart.js(http://www.chartjs.org) 라이브러리를 imoprt 한다.
Util.require("lib/Chart.js");

// Flotr2(http://humblesoftware.com/flotr2) 라이브러리를 imoprt 한다.
Util.require("lib/flotr2.js");

// socket.io 라이브러리
Util.require("lib/socket.io.js");

$(function(){
	var sampleData = [{couponName: "와플세트", buyQuantity: 345}
					, {couponName: "베스킨라빈스", buyQuantity: 245}
					, {couponName: "일말에", buyQuantity: 128}
					, {couponName: "자연산 활어회", buyQuantity: 99}
					, {couponName: "치맥", buyQuantity: 50}];
	
	drawSaleGraph(sampleData);
	drawPointGraph(sampleData);
	drawViewGraph(sampleData);
	drawReplyGraph(sampleData);
});

// 판매순 그래프를 그린다.(Canvas)
function drawSaleGraph(data){
	
}


// 평가순 그래프를 그린다.(RGraph)
function drawPointGraph(data){
	
}


// 조회순 그래프를 그린다.(Chart.js)
var beforeCoupons = [];
var beforeCounts = [];
var animation = true;
function drawViewGraph(data){
	
}


// 댓글순 그래프를 그린다.(Flotr2)
function drawReplyGraph(data){	
	
}


