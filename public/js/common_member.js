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
	
	// 1. XMLHttpRequest 객체 생성	
	var xhr = new XMLHttpRequest();
	
	// 2. 이벤트 등록	
	//xhr.onload -> 다운로드 상황
	// 업로드 시작시 발생
	xhr.upload.onloadstart = function(){
		progress.val(0).show();
	};
	
	// 업로드 도중에 계속 발생
	xhr.upload.onprogress = function(e){
		progress.val(e.loaded/e.total);
	};
	
	// 업로드 종료 시 발생
	xhr.upload.onload = function(){
		progress.hide();
	};	
	
	
	// 서버의 응답 완료시 발생
	// 프로필 이미지를 업로드 하면 서버에서는 임시로 만들어지는 파일명을 응답으로 넘겨준다.
	xhr.onload = function(){
		console.log("success");
		var tmpFileName = xhr.responseText;						
		console.log(tmpFileName);		
		$("#join_section form [name=tmpFileName]").val(tmpFileName);		// 회원가입
		//$("#my_coupon_section form[name=tmpFileName]").val(tmpFileName);	// 회원 수정
		// 업로드한 이미지를 보여준다.
		$("#join_section form img").attr("src", "tmp/" + tmpFileName);
		//$("#my_coupon_section form img").attr("src", "tmp/" + tmpFileName);
	};
	
	// 3. 선택한 프로필 이미지를 서버로 업로드한다.	
	var formData = new FormData();	
	console.log(this.files[0]);
	formData.append("profile", this.files[0]); //this 는 file
	xhr.open("post", "upload", true); //true : 비동기
	xhr.send(formData); //예전에는 문자열만 가능했음
	console.log("xhr.send...done");
	
}