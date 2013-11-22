var page = 1;	// 현재 페이지

// 페이지 로딩 후 실행
//window.onload = function(){};
$(function(){
	//setDetailEvent();
	if( $("body").attr("id") == "all" ){
		$("#coupon").attr("class", "list");
	}
	setSlideEvent();
	getCouponList();
});

// 쿠폰 상세보기 이벤트와 상세보기 닫기 이벤트를 추가한다.
function setDetailEvent(){
	$(".preview > .list_img, .preview > .detail_img").bind("click", function(){
		var coupon = $(this).parents("article");
		couponDetail(coupon);
	});
	$(".preview").bind("keydown", function(e){
		if(this.tagName.toLowerCase() == "article" && e.keyCode == 13){
			var coupon = $(this);
			couponDetail(coupon);
		}
	});
	
	// 상세정보 닫기 이벤트
	$(".btn_close_coupon_detail").click(function(){
		var coupon = $(this).parent();
		couponPreview(coupon);
	});
}

// 쿠폰 상세정보를 보여준다.
function couponDetail(coupon, forBuy){
	//상세보기 정보가 비어있을 경우 서버에 요청한다.
	if( coupon.children(".coupon_tab").size() == 0 ){
		
		var params = {
			cmd: "couponDetail",
			_id: coupon.attr("data-couponid")
			};
		$.ajax({
			url: "request",
			data: params,
			type: "get",
			dataType: "json",
			success: function(data){
				console.log(data);
				var couponDetail = $("#tmpl_coupon_detail").tmpl(data);
				coupon.children(".content").after(couponDetail);
						
				setTabEvent(coupon);
				setBuyEvent(coupon);
				
				if(forBuy){ //구매하기 화면
					showBuyForm(coupon);
				}else{ //상세화면
					hideBuyForm(coupon); //쿠폰 상세 화면일 경우 구매화면을 숨긴다.	
				}				
							
			}
		});
	}
	hideBuyForm(coupon); // 쿠폰 상세 화면일 경우 구매화면을 숨긴다.
	detailSlide(coupon);
	
}

// 쿠폰 상세보기 스타일로 전환
function detailSlide(coupon){
	coupon.removeClass("preview").addClass("detail");
}

// 쿠폰 상세정보를 닫는다.
function couponPreview(coupon){
	coupon.removeClass("detail").addClass("preview");
}

// 이전/다음 버튼 이벤트 등록
function setSlideEvent(){
	// 이전 버튼 클릭
	$("#coupon_control > .btn_pre").click(function(){
		if(page > 1){
			page--;
			couponSlide();
		}
	});
	
	// 다음 버튼 클릭
	$("#coupon_control > .btn_next").click(function(){
		var lastPage = Math.floor(($(".coupon_list > article").size()+4)/5);
		if(page < lastPage){
			page++;
			couponSlide();
		}
	});
}

// 이전/다음 페이지의 쿠폰을 보여준다.
function couponSlide(){
	$(".coupon_list > article").removeClass("coupon_off");
	setTimeout("sliding();", 0);
}

// 쿠폰을 슬라이딩 시킨다.
function sliding(){
	var firstAct = (page-1) * 5;	// 활성화 시작 쿠폰 번호
	var lastAct = (page*5) -1;		// 활성화 마지막 쿠폰 번호
	
	// 반복문(i: index, this: article)
	$(".coupon_list > article").each(function(i){
		var coupon = $(this);
		if(i < firstAct){
			coupon.removeClass("act next").addClass("pre coupon_off");
		}else if(i > lastAct){
			coupon.removeClass("act pre").addClass("next coupon_off");
		}else{
			coupon.removeClass("pre next").addClass("act");
		}
		coupon.addClass("p" + (i%5+1));
	});
}

//상세보기의 탭이벤트 추가
function setTabEvent(coupon){
	coupon.find(".coupon_tab > section > h1").click(function(){
		$(this).parent().removeClass("tab_off").siblings().addClass("tab_off"); //siblings -> 같은 레벨의 형제
	}).keydown(function(e){
		if(e.keyCode == 13){
			$(this).parent().removeClass("tab_off").siblings().addClass("tab_off");
		}
	});
	
	//갤러리 이미지 클릭시
	var bigPhoto = coupon.find(".photo_list + .big_photo > img");
	coupon.find(".photo_list img").click(function(e){
		var imgSrc = $(this).parent().attr("href");
		bigPhoto.attr("src", imgSrc);
		e.preventDefault(); //브라우저의 기본동작을 중지한다.
	});
	
}

//쿠폰 목록을 조회한다.
function getCouponList(){
	var params = {cmd: "couponList"};
	$.ajax({
		url: "request",
		data: params,
		type: "get",
		dataType: "json",
		success: function(data){
			console.log(data);
			var couponList = $("#tmpl_coupon_list").tmpl(data);
			$(".coupon_list").empty().append(couponList);
			
			var couponSizeOfLastPage = couponList.size() % 5;
			if(couponList.size() == 0 || couponSizeOfLastPage > 0){
				for(var i=couponSizeOfLastPage; i<5; i++){					
					$('<article class="preview no_content">')
						.append("<h1>등록된 상품이 없습니다.</h1>")
						.appendTo(".coupon_list");
				}
			}
			
			setAddCartEvent();
			setDetailEvent();
			sliding();
			setBuyFormEvent();
		}
	});
}

// 구매화면을 보여준다.
function showBuyForm(coupon){
	coupon.children(".coupon_tab").hide().next().show();
}

// 구매화면을 숨긴다.
function hideBuyForm(coupon){
	coupon.children(".coupon_tab").show().next().hide();
}

// 구매하기 버튼에 클릭이벤트 추가
function setBuyFormEvent(){
	$(".buy").click(function(e){
		e.preventDefault();
		var coupon = $(this).parents("article");
		
		if(coupon.children(".coupon_tab").size() == 0){
			
			// 상세보기 이전에 바로 구매버튼을 클릭했을 경우
			couponDetail(coupon, true);
			
		}else{
			
			// 상세보기 후 다시 목록으로 돌아와서 구매버튼 클릭시
			detailSlide(coupon);
			showBuyForm(coupon);
		
		}
		
		showBuyForm(coupon);
	});
}

//구매 수량 변경시 구매 금액을 계산한다.
function setTotalPrice(element, price){
	$(element).parents(".buy_section").find("output").text($(element).val() + price);
}

// 구매기능
function setBuyEvent(coupon){
	coupon.find("form").submit(function(e){
		
		var params = $(this).serialize();
		
		$.ajax({
			url: "request",
			data: params,
			type: "post",
			dataType: "json",
			success: function(data){
				if(data == 1){
					alert("쿠폰구매가 완료되었습니다.");
				}else{
					alert("쿠폰구매에 실패했습니다.");
				}	
				
				//쿠폰 목록으로 이동한다.
				window.location.reload();
				
			}
		});
		
		return false;		
	});	
	
}










