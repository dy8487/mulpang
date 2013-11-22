/* 장바구니 기능 */

$(function(){
	showCart();
	requestQuantity();
});

// 관심쿠폰을 보여준다.
function showCart(){
	
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
	
}


var es = null;
// 관심쿠폰의 남은 수량을 받아서 10개 미만일 경우 알림 메세지를 보여준다.
function requestQuantity(){
	
}

// 바탕화면 알림 서비스를 보여준다.
function showNoti(msg){	
	
}
