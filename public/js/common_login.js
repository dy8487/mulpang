/* 로그인 기능 */

$(function(){
	
	var tmpl = $("#tmpl_login_form").tmpl();
	$("#member_info").empty().append(tmpl);
	$("#login").submit(login);
	
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
					
					var tmpl = $("#tmpl_member_info").tmpl(data);
					$("#member_info").empty().append(tmpl);
					
				}
							
			}
		});
		
	return false; //submit 동작 중지
	
}













