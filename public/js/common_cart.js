/* 장바구니 기능 */

$(function(){
	showCart();
	requestQuantity();
});

// 관심쿠폰을 보여준다.
function showCart(){
	var cart = window.localStorage.getItem("cart");
	if(cart != null){	// 관심쿠폰이 등록되어 있을 경우
		cart = JSON.parse(cart);
		$("#cart > ul").empty();
		$.each(cart, function(){
			var cartElement = '<li data-couponid="'+this.couponId+'"><a href="#"><img src="'+this.couponImg+'" width="48" height="28" alt="'+this.couponName+'"></a><button class="cart_close">관심쿠폰 삭제</button></li>';
			$("#cart > ul").append(cartElement);
		});
		
		// 관심쿠폰 갯수 표시
		$("#cart > .interest_cnt").text(cart.length);
		setRemoveCartEvent();
	}
}

// 관심쿠폰 등록 이벤트
function setAddCartEvent(){
	$(".btn_add_cart").click(function(){
		var coupon = $(this).parent("article");
		addCart(coupon);
	});
}

// 관심 쿠폰 등록(로컬 스토리지에 저장)
function addCart(coupon){
	var couponId = coupon.attr("data-couponid");
	var couponName = coupon.children("h1").text();
	var couponImg = coupon.children(".list_img").attr("src");
	
	var cart = window.localStorage.getItem("cart");
	if(cart == null){
		cart = [];
	}else{
		cart = JSON.parse(cart);
	}
	
	if(cart.length == 5){
		alert("관심쿠폰은 최대 5개까지만 등록 가능합니다.");
		return;
	}
	
	// 중복 여부 체크
	var duplicate = false;
	for(var i=0; i<cart.length; i++){
		if(couponId == cart[i].couponId){	// 중복
			duplicate = true;
			break;
		}
	}
		
	if(duplicate){
		alert(couponName + "은(는) 이미 등록되어 있습니다.");
	}else{
			cart.push({
				couponId: couponId,
				couponName: couponName,
				couponImg: couponImg,
				noti: true // 알림 서비스를 위한 초기설정
			});
			
			// JSON.stringify : 문자열을 직렬화 하여 저장
			window.localStorage.setItem("cart", JSON.stringify(cart));
			showCart();	
			requestQuantity();
			alert(couponName + "이(가) 관심쿠폰으로 등록되었습니다.");
	}

}

// 관심쿠폰 삭제 이벤트
function setRemoveCartEvent(){
	//unbind : 중복이벤트 방지
	$(".cart_close").unbind().click(function(){		
		var couponId = $(this).parents("li").attr("data-couponId");
		var cart = window.localStorage.getItem("cart");
		if(cart == null){	// 최초로 등록할때
			cart = [];
		}else{
			cart = JSON.parse(cart);
		}
		
		for(var i=0; i<cart.length; i++){
			if(couponId == cart[i].couponId){
				cart.splice(i, 1); //i번째의 1번 아이템 삭제
				window.localStorage.setItem("cart", JSON.stringify(cart));
				showCart();
				break;
			}
		}
		requestQuantity();
	});
}


var es = null;
// 관심쿠폰의 남은 수량을 받아서 10개 미만일 경우 알림 메세지를 보여준다.
function requestQuantity(){
	var cart = JSON.parse(window.localStorage.getItem("cart"));
	if(cart != null && cart.length > 0){
		var couponIdList = []; 
		$.each(cart, function(i){
			couponIdList.push(this.couponId);
		});
		// SSE 요청 시작
		if(es != null){
			es.close();
		}
		es = new EventSource("request?cmd=couponQuantity&couponIdList=" + couponIdList);
		es.onmessage = function(me){
			console.log(me.data);
			// 서버의 응답 처리
			$.each(eval(me.data), function(i){
				var resultCoupon = this;
				// 남은 갯수
				var count = resultCoupon.quantity - resultCoupon.buyQuantity;
				if(count < 10){
					$.each(cart, function(i){
						cartCoupon = this;
						if(resultCoupon._id == cartCoupon.couponId && cartCoupon.noti == true){
							cartCoupon.noti = false;
							var msg = cartCoupon.couponName + " 수량이 " + count + "개 밖에 남지 않았습니다.";
							showNoti({
								img: cartCoupon.couponImg,
								msg: msg
							});
							window.localStorage.setItem("cart", JSON.stringify(cart));
						}
					});
				}
			});
		};
	}
}

// 바탕화면 알림 서비스를 보여준다.
function showNoti(notiMsg){
	// 알림메세지 출력
	if(window.webkitNotifications 
		&& window.webkitNotifications.checkPermission() == 0){
		window.webkitNotifications.createNotification(notiMsg.img, "마감임박!!!", notiMsg.msg).show();
	}
}
