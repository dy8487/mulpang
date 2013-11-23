/* 로그인 기능 */

$(function(){
	
	$("#member_info > form").submit(login);
	
});

// 로그인
function login(){	
	
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
					window.location.href = "/";
				}
							
			}
		});
		
	return false; //submit 동작 중지
	
}













