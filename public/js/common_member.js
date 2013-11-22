/* 회원 기능 */

$(function(){
	// 프로필 이미지 업로드 바를 숨긴다.
	$("#join_section progress").hide();
});

// 프로필 이미지를 업로드 한다.
function uploadProfileImage(){
	// 파일을 선택한 후에 파일 선택을 취소했을 경우
	if(this.files.length == 0) return;
	
	var progress = $("#join_section progress");
	
	// XMLHttpRequest 객체 생성
	
	
	// 업로드 시작시 발생
	xhr.upload.onloadstart = function(){
		
	};
	
	// 업로드 도중에 계속 발생
	xhr.upload.onprogress = function(e){
		
	};
	
	// 업로드 종료 시 발생
	xhr.upload.onload = function(){
		
	};
	
	// 서버의 응답 완료시 발생
	// 프로필 이미지를 업로드 하면 서버에서는 임시로 만들어지는 파일명을 응답으로 넘겨준다.
	xhr.onload = function(){
		
	};
	
	// 선택한 프로필 이미지를 서버로 업로드한다.
	
}