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
	
	var context = $("#graph_by_sale")[0].getContext("2d");
		
	// x, y 축 그리기
	context.beginPath();
	context.moveTo(70,10);
	context.lineTo(70, 230);
	context.lineTo(470, 230);
	context.stroke();
	
	// 막대 그래프 그리기
	var r = 210 / data[0].buyQuantity; //높이 비율
	var barW = 50;	//막대기 가로크기
	var gap = 25;	//막대기 간격
	$.each(data, function(i){
		// 막대 그래프 그리기
		var barH = this.buyQuantity * r;
		
		var x = (barW + gap) * i + gap + 60;		
		var y = 230 - barH;
				
		context.fillStyle = "rgba(186, 68, 10, 0."+(7-i)+")";
		context.fillRect(x, y, barW, barH);
		
		//텍스트
		context.font = "12px '돋움, dotum, 굴림, gulim, sans-serif'";
		context.fillStyle = "black";
		context.textAlign = "center";
		context.fillText(this.couponName, x + barW/2, 246);
		context.fillText(this.buyQuantity, x + barW/2, y-5);
	});
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


