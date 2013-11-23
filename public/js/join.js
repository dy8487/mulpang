/* 회원가입 화면 */

$(function(){	
	// 프로필 이미지 선택 시(common_member.js의 uploadProfile 함수를 호출한다.)
	$("#profile").change(uploadProfileImage);
	
	// 회원 가입 버튼 클릭 이벤트
	$("#join_section > form").submit(registMember);
	
});

// 회원 가입
function registMember(){
	var form = $(this);
	if($("#password").val() != $("#password2").val()){
		alert("비밀번호와 비밀번호 확인이 맞지 않습니다.");
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
					alert("회원 가입이 완료되었습니다.");
					window.location.href = "/";
				}
							
			}
		});
		
	}
	return false; //submit 동작 중지
}