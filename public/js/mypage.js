/* 마이페이지 화면 */

$(function(){
	
	$("#profile").change(uploadProfileImage);
	
	// 회원 가입 버튼 클릭 이벤트
	$("#join_section > form").submit(updateMember);
	
});

// 회원 정보를 보여준다.
function showMember(){
	
}

// 회원 정보를 수정한다.
function updateMember(){
	
	var form = $(this);
	if($("#password").val() != $("#password2").val()){
		alert("새비밀번호와 확인이 맞지 않습니다.");
	}else{
		
		var params = $(this).serialize();
		
		$.ajax({
			url: "request",
			dataType: "json",
			type: "post",
			data: params,
			success: function(data){
				
				if(data.err){
					alert(data.msg);
				}else{
					alert("회원 정보 수정이 완료되었습니다.");
					window.location.reload();
				}
							
			}
		}); 
		
	}
	
	return false;	//submit 동작 중지
	
}

// 상품후기 입력
function registEpilogue(){
	
}




















