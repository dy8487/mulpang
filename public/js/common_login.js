/* 로그인 기능 */

$(function(){
	if(userInfo.userId == ""){
	
		var tmpl = $("#tmpl_login_form").tmpl();
		$("#member_info").empty().append(tmpl);
		$("#member_info > form").submit(login);
			
	}else{
		
		var tmpl = $("#tmpl_member_info").tmpl(userInfo);
		$("#member_info").empty().append(tmpl);
		
	}
	
	
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













