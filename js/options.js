var settings = {
		'user': false,
		'mail_tracking': false,
		'show_notifications':false,
		'timezone': 'GMT'
	},
	messaging,
	base_url = env.baseUrl,
	timezones = helpers.timezones;
jQuery(document).ready(function($){

	//if we have arrived from clicking on the notification
	let emailHash = helpers.getParameterByName("email",window.location.href);
	if(emailHash!=null){
		let el=$(`<a href='#' class='show_email_views' data-email='${emailHash}'></a>`);
		$("body").append(el);
		setTimeout(function(){
			el.trigger("click");
			el.remove();
		},0);
	}

	//last seen version reset(for the NEW badge)
	chrome.storage.local.set({
		'last_seen_version': chrome.app.getDetails().version
	}, function () {
		chrome.browserAction.setBadgeText({
			text: ''
		});
	});

	//populate the timezone select box
	var t_arr=timezones.split(","),options="";
	for(let i=0;i<t_arr.length;i++){
		options+="<option value='"+t_arr[i]+"'>"+t_arr[i]+"</option>";
	}
	$("#timezone_setting").append(options);
	//initialize the settings
	refresh_settings();

	//logout button
	$(".logout").on("click",function(e){
		e.preventDefault();
		settings={};
		update_settings();
	});

	//start the verification process
	$("#verify_email").on("click",function(){
		var email=$("#user_email").val();
		//pre sending validation
		if(!helpers.is_email_valid(email)){
			show_errors("The email seems to be invalid!");
			return false;
		}
		$("#verify_email").attr("disabled",true);
		
		//start the OTP sending process
		$.post(base_url+"user/login",{email:email},function(response){
			console.log(response);
			$("#verify_email").removeAttr("disabled");
			settings.user={email:email};
			update_settings();
		});
	});

	//hitting enter on the email input should also verify the email
	$("#user_email").on("keypress",function(e){
		if(e.which==13){
			e.preventDefault();
			if(!$("#verify_email").hasClass("hidden"))
				$("#verify_email").trigger("click");
			else if(!$("#change_email").hasClass("hidden"))
				$("#change_email").trigger("click");
		}
	});

	//hitting enter on the OTP input should also click the 'verify' button
	$("#otp").on("keypress", function (e) {
		if (e.which == 13) {
			e.preventDefault();
			$("#verify_otp").trigger("click");
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

		//OTP verification
		$.post(base_url + "user/verify", {
			email: settings.user.email,
			otp: otp
		}, function (response) {
			console.log(response);
			if(!response.user.api_token){
				show_errors("Could not verify this user!");
			}
				settings.user.api_token=response.user.api_token;
				settings.user.verified=true;
				settings.user.channel = response.user.channel;
				settings.mail_tracking=true;
				settings.show_notifications=true;
			if(response.user.timezone)
				settings.timezone=response.user.timezone;
			if(response.user.hashes)
				settings.hashes=response.user.hashes;
			update_settings();
		});
	});

	$("#chk_show_notifs").on("change",function(){
		//when someone switches on their show_notifications button,
		//we simply get the channel if its not already there
		if($(this).prop("checked")=="1" && settings.user && !settings.user.channel){
			$.post(base_url+"user/channel",{
				api_token:settings.user.api_token
			},function(response){
				if(response.code=="1"){
					settings.user.channel=response.channel;
					update_settings();
				}
			});
		}
	});

	$("#save_settings").on("click",function(){
		//show notifications?
		if ($("#chk_show_notifs").prop("checked"))
			settings.show_notifications = true;
		else
			settings.show_notifications = false;

		//tracking	
		if ($("#chk_tracking_status").prop("checked"))
			settings.mail_tracking = true;
		else
			settings.mail_tracking = false;

		$.post(base_url + "user/update_timezone", {
			timezone : $("#timezone_setting").val(),
			api_token: settings.user.api_token
		}, function (response) {
			console.log(response);
			settings.timezone = $("#timezone_setting").val();
			update_settings();
		});
	});

	//Tabs
	$(".menu").find("a").on("click",function(e){
		e.preventDefault();
		if($(this).hasClass("active") || $(this).hasClass("logout"))
			return;
		
		var index=$(this).index(".menu a");
		$(".menu").find("a").removeClass("active").eq(index).addClass("active");
		// $(this).removeClass("active");

		$("#tab_contents").find(".tab_content").removeClass("active").eq(index).addClass("active");
	})

	//modals
	$(".modal_close").on("click",function(){
		$("#modal").removeClass("visible");
		setTimeout(function(){
			$("#modal_content").html("");
		},600);
	});

	//detect escape key
	$(document).keyup(function (e) {
		if (e.key === "Escape") {
			if($("#modal").hasClass("visible")){
				$(".modal_close").first().trigger("click");
			}
		}
	});

	//dismiss button on the alerts
	$(".announcement").find(".dismiss").on("click", function (e) {
		e.preventDefault();
		$(this).parent(".announcement").slideUp(function () {
			chrome.storage.local.set({
				'alert_dismissed':true
			},function(){});
		});
	});

	//accordion
	$("body").on("click",".accordion h4",function(){
		$(this).siblings("p").slideToggle();
	});
});

function update_settings(do_refresh,cb){

	//if the user wants to show notifications, but doesn't have any channel stored
	//Then we simply switch off the show_notifications toggle
	if (settings.show_notifications && !(settings.user && settings.user.channel)){
		settings.show_notifications = false;
	}

	chrome.storage.local.set({
		'zmt_settings': JSON.stringify(settings)
	}, function () {
		if(do_refresh===undefined || do_refresh)
			refresh_settings();
		if(cb!==undefined)
			cb();
	});
}

function refresh_settings(){
	chrome.storage.local.get("zmt_settings", function (result) {
		// console.log(result);
		if(result.zmt_settings!==undefined){
			console.log(result.zmt_settings);
			window.settings = JSON.parse(result.zmt_settings);
		}

		if(!settings.user){
			$("#user_email").removeAttr("disabled").val("");
			$("#verify_email").removeClass("hidden");
			$("#change_email").addClass("hidden");
		}

		if(settings.user && settings.user.email){
			$("#user_email").attr("disabled",true).val(settings.user.email);
			$("#verify_email").addClass("hidden");
			$("#change_email").removeClass("hidden");
		}

		if(!settings.user || (settings.user.email && settings.user.verified)){
			$(".otp_input").addClass("hidden");
		}
		else if(settings.user && settings.user.email && !settings.user.verified){
			$(".otp_input").removeClass("hidden");
		}

		if(settings.user && settings.user.email && settings.user.verified){
			$(".extra_settings").removeClass("hidden");
		}
		else{
			$(".extra_settings").addClass("hidden");
		}

		if(settings.mail_tracking){
			$("#chk_tracking_status").prop("checked",true);
		}
		else{
			$("#chk_tracking_status").prop("checked", false);
		}

		if(settings.show_notifications){
			$("#chk_show_notifs").prop("checked",true);
		}
		else{
			$("#chk_show_notifs").prop("checked", false);
		}

		var selected_tz=settings.timezone===undefined?"GMT":settings.timezone
		$("#timezone_setting").find("option[value='" + selected_tz + "']").attr("selected",true);

		load_history();

		$("body").on("click", ".show_email_views",function(e){
			console.log("clicked");
			e.preventDefault();
			var hash=$(this).attr("data-email");
			$.post(base_url + `emails/${hash}/details`, {
				api_token: settings.user.api_token
			}, function (response) {
				let html=`
					<div class='email_subject'><strong>Email: </strong> ${response.subject}</div>
					<table class="email_views">
						<thead>
							<tr>
								<td>S.No.</td>
								<td>IP</td>
								<td>Device</td>
								<td>Location</td>
								<td>User Agent</td>
								<td>Time</td>
							</tr>
						</thead>
						<tbody>
				`;
				if(response.details.length==0)
					html+="<tr><td colspan=6 style='text-align:center;'>This email hasn't been viewed yet!</td></tr>";
				else{
					for(let i=0;i<response.details.length;i++){
						let row=response.details[i];
						html+=`
							<tr class="email_view">
								<td>${(i+1)}</td>
								<td>${row.user_ip}</td>
								<td>${row.device}</td>
								<td>${row.location}</td>
								<td>${row.user_agent}</td>
								<td><div class="time">${row.viewed_at}</div></td>
							</tr>
						`;
					}
				}
				html+=`</tbody></table>`;
				show_modal(html,'success','Success!');
			});
		});
	});

	//
	chrome.storage.local.get('alert_dismissed',function(result){
		if(!result.alert_dismissed){
			$(".announcement").slideDown();
		}
	});
}

function load_history(){
	if(!settings.user || !settings.user.verified || !settings.user.api_token){
		$("#history_div").html("<tr><td colspan=7>You need to log in before seeing the history!</td></tr>");
		return;
	}

	$.post(base_url + "user/history", {
		api_token:settings.user.api_token
	}, function (response) {
		if(!response.history || response.history.length==0){
			$("#history_table").find("tbody").html("<tr><td colspan=7>No emails being tracked!</td></tr>");
			return;
		}

		var html="";
		for(let i=0;i<response.history.length;i++){
			let row=response.history[i];
			html+=`<tr>
						<td>${(i+1)}</td>
						<td><a href='#' data-email='${row.hash}' class='show_email_views'>Details</a></td>
						<td>${row.subject}</td>
						<td>${row.views_count}</td>
						<td>${row.to_field}</td>
						<td>${row.cc_field}</td>
						<td>${row.bcc_field}</td>
					</tr>`;
		}
		$("#history_table").find("tbody").html(html);

	});
}

function show_errors(str){
	// show_modal(str,'error','Errors!');
	alert(str);
}

function show_modal(str,type,title){
	$("#modal_content").html(str);
	$("#modal").addClass("visible");
}