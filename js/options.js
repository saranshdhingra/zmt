var settings=[],
	base_url="http://zmt.abc/api/v2/";
jQuery(document).ready(function($){
	// refresh_settings();

	//start the verification process
	$("#verify_email").on("click",function(){
		var email=$("#user_email").val();
		//pre sending validation
		if(!is_email_valid(email)){
			show_errors("The email seems to be invalid!");
			return false;
		}
		$("#verify_email").attr("disabled",true);
		
		//start the OTP sending process
		$.post(base_url+"user/login",{email:email},function(response){
			console.log(response);
			$("#verify_email").removeAttr("disabled");
			// if(!check_response(response)){
			// 	return false;
			// }
			settings.user={email:email};
			chrome.storage.local.set({'zmt_settings':window.settings}, function() {
			});
		});

		$(".otp_input").removeClass("hidden");
		$("#verify_email").addClass("hidden");
		$("#change_email").removeClass("hidden");
		$("#user_email").attr("disabled",true);
	});

	//hitting enter on the email input should also verify the email
	$("#user_email").on("keypress",function(e){
		if(e.which==13){
			e.preventDefault();
			$("#verify_email").trigger("click");
		}
	});

	//clicking on `change email` should allow the user to change email
	$("#change_email").on("click",function(){
		$("#user_email").removeAttr("disabled");
		$(this).addClass("hidden");
		$("#verify_email").removeClass("hidden");
	});

	//verify the OTP
	$("#verify_otp").on("click",function(){
		var otp=$("#otp").val();
	});
});

// function refresh_settings(){

// 	var settings={
// 		'user':false,
// 		'mail_tracking':false,
// 		'mail_delay':false,
// 		'mail_delay_time':3
// 	}

// 	if(!settings.user){
// 		$(".user_settings").find(".input:not(:first)").addClass("hidden");
// 	}
// 	else if(is_email_valid(settings.user.email)){
// 		$(".user_settings").find(".input").removeClass("hidden");
// 	}
// }

function is_email_valid(email){
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function show_errors(str){
	alert(str);
}