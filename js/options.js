var settings = {
		'user': false,
		'mail_tracking': false,
		'show_notifications':false,
		'timezone': 'GMT'
	},
	messaging,
	base_url = env.baseUrl,
	timezones = helpers.timezones,
	alertCloseTimeoutHandle,
	loaderPromise,
	UserHistory={
		pageNum:1,
		perPage: env.userHistory.defaultPerPage,
		search:''
	};

jQuery(document).ready(function($){

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

	//initialize the GUI based on the settings stored in the localhost
	refresh_settings(function(){
		//if we have arrived from clicking on the notification
		let emailHash = helpers.getParameterByName("email", window.location.href);
		//only do something when we have come from the notification if the notification was meant for the logged in user!
		if (emailHash != null && settings.hashes && settings.hashes.indexOf(emailHash) != -1) {
			let el = $(`<a href='#' class='show_email_views' data-email='${emailHash}'></a>`);
			$("body").append(el);
			setTimeout(function () {
				el.trigger("click");
				el.remove();
			}, 0);
		}

		//fetch the history
		load_history();
	});

	//logout button
	$(".logout").on("click",function(e){
		e.preventDefault();
		settings={};
		update_settings();
		load_history();
		show_alert("You have been logged out!","info");
	});

	//start the verification process
	$("#verify_email").on("click",function(){
		var email=$("#user_email").val();
		//pre sending validation
		if(!helpers.is_email_valid(email)){
			show_alert("The email seems to be invalid!","error");
			return false;
		}
		$("#verify_email").attr("disabled",true);

		show_loader("Sending a request to verify the email!");
		
		//start the OTP sending process
		$.post(base_url+"user/login",{email:email},function(response){
			hide_loader();
			if(response.code=="0"){
				show_alert(response.msg,"error");
			}
			else{
				try{
					$("#verify_email").removeAttr("disabled");
					settings.user = { email: email };
					show_alert(response.msg, "success");
					update_settings();
				}
				catch(err){
					show_alert("There was an error in verifying the user, please try again!", "error");
				}
			}
		});
	});

	//hitting enter on the email input should also verify the email
	$("#user_email").on("keypress",function(e){
		if(e.which==13){
			e.preventDefault();
			$("#verify_email").trigger("click");
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

		show_loader("Checking the OTP!");
		//OTP verification
		$.post(base_url + "user/verify", {
			email: settings.user.email,
			otp: otp
		}, function (response) {
			hide_loader();
			if(response.code=="0"){
				show_alert(response.msg, "error");
				return;
			}
			else if(!response.user || !response.user.api_token){
				show_alert("Could not verify this user!","error");
				return;
			}
			else if(response.code=="1"){
				try{
					$("#otp").val("");	//clear the field on success
					settings.user.api_token = response.user.api_token;
					settings.user.verified = true;
					settings.user.channel = response.user.channel;
					settings.mail_tracking = true;
					settings.show_notifications = true;
					if (response.user.timezone)
						settings.timezone = response.user.timezone;
					if (response.user.hashes)
						settings.hashes = response.user.hashes;

					show_alert("User verified!", "success");
					update_settings();
				}
				catch(err){
					show_alert("There was an error in verifying the user, please try again!","error");
				}
			}
			else{
				show_alert("Request could not be completed!");
			}
		});
	});

	//save the settings based on what is selected in the GUI
	$("#save_settings").on("click",function(){
		show_loader("Saving Settings!");
		//show notifications?
		let p1=new Promise(function(resolve,reject){
			if ($("#chk_show_notifs").prop("checked")) {
				$.post(base_url + "user/channel", {
					api_token: settings.user.api_token
				}, function (response) {
					try{
						if (response.code == "1") {
							settings.user.channel = response.channel;
							settings.show_notifications = true;
						}
						else{
							settings.show_notifications = false;
						}
					}
					catch(err){
						resolve();
					}
					resolve();
				});
			}
			else{
				settings.show_notifications = false;
				resolve();			
			}
		});

		//tracking	
		if ($("#chk_tracking_status").prop("checked"))
			settings.mail_tracking = true;
		else
			settings.mail_tracking = false;

		//debug
		if ($("#chk_debug").prop("checked"))
			settings.debug = true;
		else
			settings.debug = false;

		let p2=$.post(base_url + "user/update_timezone", {
			timezone : $("#timezone_setting").val(),
			api_token: settings.user.api_token
		}, function (response) {
			if(response.code=="1")
				settings.timezone = $("#timezone_setting").val();
		});

		Promise.all([p1,p2]).then(function(){
			update_settings(true, function () {
				hide_loader();
				show_alert("Settings saved!", "success");
			});
		}).catch(function(){
			hide_loader();
			show_alert("There was an error!", "error");
			refresh_settings();
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
	$("body").on("click",".modal_close",function(){
		$("#modal").removeClass(["visible","confirmation"]);
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
			else if($("#app_notifs").hasClass("visible")){
				$("#app_notifs").find(".close").trigger("click");
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

	//options page notifications
	$("#app_notifs").find(".close").on("click",function(){
		$("#app_notifs").removeClass(["visible","success","error","info"]);
	});

	//accordion
	$("body").on("click",".accordion h4",function(){
		$(this).siblings("p").slideToggle();
	});

	//'Details' button in the history
	$("body").on("click", ".show_email_views", function (e) {
		e.preventDefault();
		var hash = $(this).attr("data-email");
		show_loader("Loading details of the email!");
		$.post(base_url + `emails/${hash}/details`, {
			api_token: settings.user.api_token
		}, function (response) {
			hide_loader();
			if(response.code=="0"){
				show_alert(response.msg,"error");
				return;
			}
			let html = `
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
			if (response.details.length == 0)
				html += "<tr><td colspan=6 style='text-align:center;'>This email hasn't been viewed yet!</td></tr>";
			else {
				for (let i = 0; i < response.details.length; i++) {
					let row = response.details[i];
					html += `
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
			html += `</tbody></table>`;
			show_modal(html, 'success', 'Success!');
		});
	});

	//'Delete' button in the history
	$("body").on("click", ".delete_email",function(e){
		e.preventDefault();
		let email=$(this).attr("data-email"),
			subject=$(this).attr("data-subject");

		showDeleteConfirmationDialog(email,subject);
	});

	//Delete the email when someone confirms
	$("body").on("click", ".delete_email_confirmed",function(){
		if(!settings.user || !settings.user.api_token){
			show_alert("You must be logged in to do that action","error");
			return;
		}
			
		show_loader("Deleting the email!");
		let hash=$(this).attr("data-email");
		//send the request
		$.post(base_url+`emails/${hash}/delete`,{
			api_token:settings.user.api_token
		},function(response){
			if(response.code=="1"){
				hide_loader();
				load_history();
				show_alert("The email was deleted!", "success");
				$("#modal_close").trigger("click");
				return;
			}

			log("email deletion rejected by server", hash, response);
			hide_loader();
			show_alert("The email could not be deleted!", "error");
			$("#modal_close").trigger("click");
		}).fail(function(err){
			log("email deletion failed", hash, err);
			hide_loader();
			show_alert("The email could not be deleted!", "error");
			$("#modal_close").trigger("click");
		});
	});

	//mute an email
	$("body").on("click",".mute_email",function(e){
		e.preventDefault();
		let hash=$(this).attr("data-email");
		log("Clicked mute email button for the email:"+hash);
		show_loader("Trying to mute the email!");
		$.post(`${base_url}emails/${hash}/mute`,{
			api_token:settings.user.api_token
		},function(response){
			if(response.code=="1"){
				hide_loader();
				show_alert("The email has been muted!","success");
				load_history();
				return;
			}

			log("Server rejected the mute email request");
			hide_loader();
			show_alert(response.msg, "error");
		}).fail(function(err){
			load_history();
			log("Server rejected the mute email request with the reason:",err);
			hide_loader();
			show_alert("Could not mute the email!", "error");
		});
	});

	$("body").on("click", ".unmute_email", function (e) {
		e.preventDefault();
		let hash = $(this).attr("data-email");
		log("Clicked unmute email button for the email:" + hash);
		show_loader("Trying to unmute the email!");
		$.post(`${base_url}emails/${hash}/unmute`, {
			api_token: settings.user.api_token
		}, function (response) {
			if (response.code == "1") {
				hide_loader();
				show_alert("The email has been unmuted!", "success");
				load_history();
				return;
			}

			log("Server rejected the unmute email request");
			hide_loader();
			show_alert(response.msg, "error");
		}).fail(function (err) {
			load_history();
			log("Server rejected the unmute email request with the reason:", err);
			hide_loader();
			show_alert("Could not unmute the email!", "error");
		});
	});

	//contact section
	$("#contact_form").on("submit",function(e){
		e.preventDefault();
		let data = $(this).serialize();
		show_loader("Sending your query!");
		$.post(base_url+"contact",data,function(response){
			hide_loader();
			if(response.code=="0"){
				show_alert(response.msg,"error");
			}
			else if(response.code=="1"){
				show_alert(response.msg, "success");
				if($("#contact_email").attr("readonly")){
					$("#contact_form").find("input[name]:not([type=email]),textarea").val("");
				}
				else{
					$("#contact_form").find("input[name],textarea").val("");
				}
			}
		})
	});

	//history pagination page num
	$("body").on("change", "#history_page_num_select",function(){
		UserHistory.pageNum = $(this).val();
		load_history();
	});

	//history pagination per page
	$("body").on("change", "#history_per_page_select", function () {
		UserHistory.perPage = $(this).val();
		UserHistory.pageNum = 1;	//this is important as the num of pages might change depending on the perPage value
		load_history();
	});

	//history search
	$("#history_search_btn").on("click",function(){
		let searchTerm=$("#history_search").val().trim();
		UserHistory.searchTerm=searchTerm;
		UserHistory.pageNum=1;
		UserHistory.perPage=env.userHistory.defaultPerPage;
		load_history();
	});

	//pressing enter should also trigger a search
	$("#history_search").on("keypress",function(e){
		if(e.which==13){
			$("#history_search_btn").trigger("click");
		}
	});
});

//updates the local storage with the current settings object
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

//refresh the GUI based on the settings stored in localstorage
function refresh_settings(callback){
	chrome.storage.local.get("zmt_settings", function (result) {
		if(result.zmt_settings!==undefined){
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

		if(settings.debug){
			$("#chk_debug").prop("checked",true);
		}
		else{
			$("#chk_debug").prop("checked",false);
		}

		var selected_tz=settings.timezone===undefined?"GMT":settings.timezone
		$("#timezone_setting").find("option").removeAttr("selected").siblings("option[value='" + selected_tz + "']").attr("selected",true);
		//select2 init
		$('select').select2({
			width: 'resolve'
		});

		//bind the user email to the contact form if the user has logged in!
		if (settings.user && settings.user.verified && settings.user.email) {
			$("#contact_email").val(settings.user.email).attr("readonly", true);
		}
		else{
			$("#contact_email").val("").removeAttr("readonly");
		}

		if(callback!==undefined)
			callback();
	});

	//
	chrome.storage.local.get('alert_dismissed',function(result){
		if(!result.alert_dismissed){
			$(".announcement").slideDown();
		}
	});
}

//function to get the history of emails
function load_history(){
	if(!settings.user || !settings.user.verified || !settings.user.api_token){
		$("#history_table").find("tbody").html("<tr><td colspan=7 style='text-align:center;'>You need to log in before seeing the history!</td></tr>");
		return;
	}

	$("#history_div").addClass("loading");

	$.post(base_url + "user/history", {
		api_token:settings.user.api_token,
		per_page:UserHistory.perPage,
		page_num:UserHistory.pageNum,
		search_term:UserHistory.searchTerm
	}, function (response) {
		$("#history_div").removeClass("loading");
		if(!response.history || response.history.length==0){
			$("#history_table").find("tbody").html("<tr><td colspan=7>No emails being tracked!</td></tr>");
			return;
		}

		var html="";
		for(let i=0;i<response.history.length;i++){
			let row=response.history[i],
				mute_txt = (row.is_muted) ? `<a href='#' data-email='${row.hash}' class='unmute_email' title='Unmute'><i class='icon-eye'></i></a>` : `<a href='#' data-email='${row.hash}' class='mute_email' title='Mute'><i class='icon-eye-off'></i></a>`;
			html+=`<tr>
						<td>${(i+1)}</td>
						<td>
							<a href='#' data-email='${row.hash}' class='show_email_views'><i class='icon-login'></i></a>
							<a href='#' data-email='${row.hash}' data-subject='${row.subject}' class='delete_email'><i class='icon-trash'></i></a>
							${mute_txt}
						</td>
						<td>${row.subject}</td>
						<td>${row.views_count}</td>
						<td class="to_field_cell">${row.to_field}</td>
						<td class="cc_field_cell">${row.cc_field}</td>
						<td class="bcc_field_cell">${row.bcc_field}</td>
					</tr>`;
		}

		//now add the pagination parts
		let pageNumOptions=`<option>${UserHistory.pageNum}</option>`,
			perPageOptions=`<option>${UserHistory.perPage}</option>`;

		if(response.page_num!==undefined && response.num_pages!==undefined){
			pageNumOptions="";
			let selectedString="";
			for(let i=1;i<=response.num_pages;i++){
				selectedString=(i==response.page_num)?"selected":"";
				pageNumOptions+=`<option ${selectedString}>${i}</option>`
			}
		}

		if(response.per_page!==undefined){
			perPageOptions="";
			let perPageArr=[5,10,25,50];
			for(let i=1;i<=perPageArr.length;i++){
				selectedString=(perPageArr[i-1]==response.per_page)?"selected":"";
				perPageOptions+=`<option ${selectedString}>${perPageArr[i-1]}</option>`;
			}
		}

		if(response.search_term!==undefined){
			$("#history_search").val(response.search_term);
		}

		html+=`<tr class="pagination">
					<td colspan="7">
						<label style="float:left;">
							<span>Page Num:</span>
							<select id="history_page_num_select">
								${pageNumOptions}
							</select>
						</label>
						<label style="float:right;">
							<span>Per Page:</span>
							<select id="history_per_page_select">
								${perPageOptions}
							</select>
						</label>
					</td>
				</tr>`;
		$("#history_table").find("tbody").html(html);
	});
}

//In-GUI notifications/alerts
function show_alert(str,type){
	clearTimeout(alertCloseTimeoutHandle);
	let allowedTypes=["success","error","info"];
	if(allowedTypes.indexOf(type)==-1)
		return false;

	$("#app_notifs").find(".content").html(str);
	$("#app_notifs").addClass(["visible", type]);
	alertCloseTimeoutHandle=setTimeout(function(){
		$("#app_notifs").find(".close").trigger("click");
	},5000);
}

function show_modal(str,type,title){
	$("#modal_content").html(str);
	$("#modal").addClass("visible");
}

//simply shows the spinning
function show_loader(str){
	$("#loader").find(".msg").text(str);
	$("#loader").addClass("visible").find(".loader_spinner").addClass("visible");
	loaderPromise=new Promise(function(resolve,reject){
		setTimeout(function(){
			resolve();
		},1000);
	});
}

//hides the spinning loader
function hide_loader(){
	//this will make sure that even if the hide_loader is called immediately after
	//show_loader we still show the loader for at least the duration of the timeout
	//used inside the show_loader method
	loaderPromise.then(function(){
		$("#loader").find(".msg").text("");
		$("#loader").removeClass("visible").find(".loader_spinner").removeClass("visible");
	});
}

function showDeleteConfirmationDialog(emailHash,subject){
	let content=`
		<div class="confirmation">
			<div class="dialog_header">Are you sure?</div>
			<div class="dialog_body">You are deleting the email with subject: <strong>${subject}</strong>! Are you sure you want to proceed?</div>
			<div class="disalog_footer"><button class='delete_email_confirmed' data-email="${emailHash}">Yes</button> <button class='modal_close'>Cancel</button></div>
	`;

	$("#modal_content").html(content).addClass("visible");
	$("#modal").addClass(["visible","confirmation"]);
}

function log() {
	if (settings && settings.debug)
		console.log(arguments);
}