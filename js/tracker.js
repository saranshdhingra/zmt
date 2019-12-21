var zmt_token,
	doc_user_email,
	imgs_url=chrome.extension.getURL('images/'),
	needs_reload=false,
	base_url = "https://zohomailtracker.com/api/v2/",
	zmt_settings,
	zmtLoaderPromise,
	zmtReloadCheckHandle,
	zoho_patt = new RegExp("^mail\.zoho\.[a-z]+$");

jQuery(document).ready(function($){

	//don't attach any handler if the URL is not like mail.zoho...
	if (!zoho_patt.test(window.location.host)) {
		return;
	}

	//add the zmt loader and alert HTML
	$("body").append(`<div id='zmt_loader'><div class='loader_spinner' style='background:url(${imgs_url}logo64.png);'></div><div class='msg'></div><div class='cancel_div'>If this is taking time, you can <a href='#'>cancel the tracker</a> and send the mail untracked!</div></div>`);
	$("body").append("<div id='zmt_app_alert'><div class='content'></div><div class='close'><i class='zmt_close_btn'></i></div></div>");

	refresh_settings(function(){
		// check_doc_email();
	});

	//triggers when any one of the "To","CC","BCC","Subject" fields is changed
	// $("body").on("keyup keypress focus blur change", ".zmCTxt .zm_sgst,.zmCTxt.subject-field>input,.ze_area", function (e) {
	// 	check_send_btn($(this));
	// });

	//drafts
	// $("body").on("click", ".zmList", function (e) {
	// 	check_send_btn($(this),true);
	// });
	$("body").on("mousemove", ".SCm",function(){
		check_send_btn($(this).find("[data-event='s']:not(.sending)"));
	});

	// $("body").on("click", ".zm_ry>span", function () {
	// 	//using recurse=true so that the function keeps running until the send button is visible
	// 	check_send_btn($(".ze_area"), true);
	// });


	//event handler for our fake button
	$("body").on("click", "[data-zmt_event='s']", function (e) {
		log("zmt btn event handler");
		//even though there should be no event handler for this!
		e.preventDefault();
		e.stopImmediatePropagation();

		//do our insertion if tracking is enabled
		if (zmt_settings.mail_tracking) {
			$(this).addClass("sending");
			insert_tracker($(this));
		}
		else {
			send_mail($(this));
		}
	});

	//update the sender and the UI helpers on changing the alias
	$("body").on("mouseup", ".zmcDrpDwnMnu.SC_Phr > li", function (e) {
		e.preventDefault();
		setTimeout(function(){
			$("[data-event='s'],[data-zmt_event='s']").each(function () {
				var btn = $(this);
				replace_send_btn(btn);
			});
		},500);
	});

	$("body").find("#zmt_app_alert .close").on("click", function () {
		$("#zmt_app_alert").removeClass(["visible", "success", "error", "info"]);
	});

	//our failsafe that cancels the tracker and simply sends the mail
	//in cases like it takes too long or something!
	$("body").on("click","#zmt_loader .cancel_div a",function(e){
		e.preventDefault();
		log("Tracking canceled!");
		$("[data-zmt_event='s'].sending").each(function(){
			let btn=$(this);
			zmtHideLoader(function(){
				send_mail(btn);
			});
		});
	});

	//we call this repetitively so that hypothetically, if a person is writing a mail and the extension updates, it won't be able to insert a tracker.
	//So, we update the user using our visuals!
	zmtReloadCheckHandle=setInterval(function () {
		check_page_needs_reload();
	},5000);

	//ctrl + Enter capture
	// $("body").on("keydown",".subject-field",function(e){
	// 	e.preventDefault();
	// 	e.stopImmediatePropagation();
	// 	e.stopPropagation();
	// 	console.log("keydown");
	// 	console.log(e);
	// 	if(e.ctrlKey && e.keyCode == 13){
	// 		//find the mail which is focussed
	// 		let sendBtn=$(".zmWorkSpace").find(".SCm").not(".zmHideD").find("[data-zmt_event='s']");

	// 		// console.log(sendBtn);
	// 	}

	// 	return false;
	// });

	// $("body").on("keyup",function(e){
	// 	e.preventDefault();
	// 	e.stopImmediatePropagation();
	// 	e.stopPropagation();
	// 	console.log("keyup");
	// 	if(e.ctrlKey && e.keyCode == 13){
	// 		//find the mail which is focussed
	// 		let sendBtn=$(".zmWorkSpace").find(".SCm").not(".zmHideD").find("[data-zmt_event='s']");

	// 		console.log(sendBtn);
	// 	}
	// });

});

//the function that gets the settings from localstorage and then stores a local copy of it!
function refresh_settings(callback){
	log("refreshing settings");
	chrome.storage.local.get("zmt_settings", function (result) {
		if (result.zmt_settings !== undefined) {
			window.zmt_settings = JSON.parse(result.zmt_settings);
			if(callback!==undefined){
				callback();
			}
		}
	});
}

//whenever the storage is changed,
//we make sure to refresh it here
chrome.storage.onChanged.addListener(function (changes, namespace) {
	log("storage changed");
	if (Object.keys(changes).indexOf("zmt_settings") != -1) {
		log("zmt settings changed");
		refresh_settings(function(){
			//this makes sure if someone changes a setting, like user, mail tracking etc
			//it is reflected in the emails that are opened w/o a need for reload
			$("[data-event='s']:not(.sending),[data-zmt_event='s']:not(.sending)").each(function () {
				var btn = $(this);
				replace_send_btn(btn);
			});
		});
	}
});

//function that checks that the send button exists in the DOM.
//if recurse is true and there is not send btn(near the el) , it will keep calling itself recursively.
function check_send_btn(el, recurse) {
	if (el.parents(".SC_mclst.zmCnew").find(".SCtxt[data-event='s']:not(.sending)").length == 0) {
		//if you want to recurse
		if (recurse)
			setTimeout(function () {
				check_send_btn(el,recurse);
			}, 500);
		else
			return;
	} else {
		replace_send_btn(el);
	}
}

//button used to replce attr of send button so we can capture its click.
//basically our fake button
function replace_send_btn(el){
	log("inside replace_send_btn");
	var send_btn = el.parents(".SC_mclst.zmCnew").find(".SCtxt[data-event='s']").length ? el.parents(".SC_mclst.zmCnew").find(".SCtxt[data-event='s']"):el.parents(".SC_mclst.zmCnew").find(".SCtxt[data-zmt_event='s']"),
		parent = send_btn.parents(".SC_flt"),
		sender = getEmailSender(send_btn),
		tracking_str;
	if (zmt_settings && zmt_settings.mail_tracking && zmt_settings.user && zmt_settings.user.verified &&  !window.needs_reload && sender==zmt_settings.user.email) {
		tracking_str = `<ul class='zmt_tracking_status'><li><img src='${imgs_url}tracker_inserted.png' data-tooltip="Tracker will be inserted on 'Send'"></li></ul>`;
		
		//so that I can replace it back!
		send_btn.attr("data-zmt_event", "s").removeAttr("data-event");
	}

	//if settings were not found,
	//or if mail tracking is switched off,
	//or if the user is not verified,
	//then simply add a visual to show the user that we won't be tracking this mail
	else{
		let failed_reason = "";
		if (!zmt_settings)
			failed_reason = "Could not load saved settings!";
		else if (!zmt_settings.user)
			failed_reason = "User is not logged in!";
		else if (!zmt_settings.user.verified)
			failed_reason = "User is not verified!";
		else if (!zmt_settings.mail_tracking)
			failed_reason = "Mail tracking is switched off!";
		else if(sender!=zmt_settings.user.email)
			failed_reason = `You are logged in the extension as ${zmt_settings.user.email} but trying to send the email as ${sender}`;
		else if (window.needs_reload)
			failed_reason = "The page needs a reload!";

		failed_reason = `Tracker will not be inserted because ${failed_reason}`;
			
		tracking_str = `<ul class='zmt_tracking_status'><li><img src='${imgs_url}tracker_failed.png' data-tooltip='${failed_reason}'></li></ul>`;

		//we remove our custom event attribute so that even if we are not inserting a tracker, people can still send the emails
		//The need for this arised when we started realtime sync instead of a simple reload.
		//Example: we are banning users from tracking if their email is diff in zoho from our extension. But if the user logs out and then logs in from proper account, we must update the send button to track or not track
		send_btn.attr("data-event", "s").removeAttr("data-zmt_event");
	}

	//just to show the current info of tracking status!
	parent.find(".zmt_tracking_status").remove();
		parent.append(tracking_str);
}

function insert_tracker(send_btn){
	log("inserting tracker");
	zmtShowLoader("Inserting tracker!",true);
	try{
		//find the tracking pixel in this mail and the subject of the mail
		var mail_body = send_btn.parents(".SC_mclst.zmCnew").find(".zmCE").find(".ze_area");

		remove_current_pixels_from_mail(mail_body);

		var subject = get_subject_field_val(send_btn),
			to_field = get_to_field_val(send_btn),
			cc_field = get_cc_field_val(send_btn),
			bcc_field = get_bcc_field_val(send_btn);
		
		if(to_field.length==0){
			zmtHideLoader(function(){
				zmtShowAlert("Please fill up the Recepient!", "error");
				send_btn.removeClass("sending");
			});
			return;
		}

		fetch_hash_from_server(send_btn, subject, to_field, cc_field, bcc_field, function (hash) {
			log("fetch_hash_from_server callback");
			var img_str = "<img src='" + base_url + "img/show?hash=" + hash + "' class='zmt_pixel' />";
			log(img_str);
			//first make sure that the hash is added to the list of hashes to be blocked, then append the image in the ,mail.
			add_hash_to_local(hash, function () {
				log("add_hash_to_local callback");
				zmtHideLoader(function(){
					log("zmtHideLoader callback");
					mail_body.contents().find("body").append(img_str);
					send_mail(send_btn);
				});
			});
		});
	}
	catch(err){
		log("Tracker failed",err);
		zmtHideLoader(function(){
			send_btn.removeClass("sending");
			zmtShowAlert("Tracker inserting failed!","error");
			send_mail(send_btn);
		});
	}
}

//function that checks if the tracking pixel is present in the mail_body element
//if a pixel is present, it removes it which means that in replies, or nested threads, a user won't get multiple notifications
//mail_body is the jquery element(iframe element)
function remove_current_pixels_from_mail(mail_body) {
	var imgs = mail_body.contents().find('img').filter(function () {
		var src = $(this).attr("src");
		//src was sometimes undefined
		if (typeof src != "undefined" && src.match(/https:\/\/zohomailtracker\.com\/api\/v2\/img\?hash=\w+/)){
			$(this).remove();
		}
	});
}

function get_subject_field_val(send_btn){
	return send_btn.parents(".SC_mclst.zmCnew").find("[id^='zmsub_Cmp']").val();
}

function get_to_field_val(send_btn){
	return send_btn.parents(".SC_mclst.zmCnew").find(".zmCTxt.zmdrop.recipient-field").eq(0).find(".SC_cs").map(function () {
		var tooltip=$(this).attr("data-tooltip"),
			email=extractEmails(tooltip);
		
			if(email.length>0 && is_email_valid(email[0])){
				return email[0];
			}
			else{
				return $(this).find("input").val();
			}
	}).get().join(",");
}

function get_cc_field_val(send_btn) {
	return send_btn.parents(".SC_mclst.zmCnew").find(".zmCTxt.zmdrop.recipient-field").eq(1).find(".SC_cs").map(function () {
		var tooltip = $(this).attr("data-tooltip"),
			email = extractEmails(tooltip);

		if (email.length > 0 && is_email_valid(email[0])) {
			return email[0];
		} else {
			return $(this).find("input").val();
		}
	}).get().join(",");
}

function get_bcc_field_val(send_btn) {
	return send_btn.parents(".SC_mclst.zmCnew").find(".zmCTxt.zmdrop.recipient-field").eq(2).find(".SC_cs").map(function () {
		var tooltip = $(this).attr("data-tooltip"),
			email = extractEmails(tooltip);

		if (email.length > 0 && is_email_valid(email[0])) {
			return email[0];
		} else {
			return $(this).find("input").val();
		}
	}).get().join(",");
}

function extractEmails(text) {
	return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

function is_email_valid(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

function fetch_hash_from_server(send_btn, subject, to_field, cc_field, bcc_field, callback) {
	try{
		$.post(base_url + "img/new", {
			api_token: zmt_settings.user.api_token,
			subject: subject,
			to_field: to_field,
			cc_field: cc_field,
			bcc_field: bcc_field
		}, function (response) {
			if(response.code=="1"){
				var hash = response.hash;
				callback(hash);
			}
			else{
				zmtHideLoader(function () {
					zmtShowAlert("Tracker inserting failed!", "error");
					send_mail(send_btn);
				});
			}
		}).fail(function(err){
			log("request failed in fetch_hash_from_server",log);
			zmtHideLoader(function () {
				zmtShowAlert("Tracker inserting failed!", "error");
				send_mail(send_btn);
			});
		});
	}
	catch(err){
		log("exception in fetch_hash_from_server",err);
		zmtHideLoader(function () {
			zmtShowAlert("Tracker inserting failed!", "error");
			send_mail(send_btn);
		});
	}
}

//add a hash to the local list of hashes
//let this task be handled by the background script
function add_hash_to_local(hash, callback) {
	log("add_hash_to_local func for hash",hash);
	try{
		chrome.runtime.sendMessage({
			action: 'add_hash',
			hash: hash
		}, function () {
			//this part is not running at times!
			log("chrome.runtime callback");
			callback();	
		});
	}
	catch(err){
		log("error in add_hash_to_local",err);
		callback();
	}
}

function send_mail(btn) {
	log("send_mail called");
	btn.removeClass("sending");
	btn.attr("data-event", "s").removeAttr("data-zmt_event");
	btn.find("b").trigger("click");
}

function getEmailSender(btn){
	var emailField = btn.parents(".SC_mclst.zmCnew").find("[id^='zm_fromaddr_Cmp']"),
		email=[""];
	if(emailField.length){
		email=extractEmails(emailField.text());
	}
	
	return email[0];
}

//we don't need to rely on the asynchronous nature of sendMessage because
//if we chrome.runtime is available, then we simply return true.
//If it is not available and it hit an exception, we return false
function check_page_needs_reload(){
	try{
		chrome.runtime.sendMessage({
			action: 'checking_connection'
		}, function () {
		});
	}
	catch(err){
		log("chrome.runtime throws exception, probably page needs reload",err);
		//display the visual
		$(".zmt_tracking_status").each(function(){
			$(this).find("li").html(`<img src='${imgs_url}tracker_failed.png' data-tooltip='Tracker will not be inserted because The page needs a reload!'>`);
		});
		//remove the tracker handler
		$("[data-zmt_event='s']").removeAttr("data-zmt_event").attr("data-event","s");
		window.needs_reload=true;
		clearInterval(zmtReloadCheckHandle);
		return;
	}
	window.needs_reload=false;
}

//the function that shows the loader inside UI
function zmtShowLoader(msg,cancellable){
	$("#zmt_loader").find(".msg").text(msg);
	$("#zmt_loader").addClass("visible").find(".loader_spinner").addClass("visible");
	if(cancellable===true){
		$("#zmt_loader").find(".cancel_div").addClass("visible");
	}
	zmtLoaderPromise = new Promise(function (resolve, reject) {
		setTimeout(function () {
			resolve();
		}, 1000);
	});
}

//hide the loader
function zmtHideLoader(callback){
	//this will make sure that even if the hideLoader is called immediately after
	//show_loader we still show the loader for at least the duration of the timeout
	//used inside the showLoader method
	zmtLoaderPromise.then(function () {
		$("#zmt_loader").find(".msg").text("");
		$("#zmt_loader").removeClass("visible").find(".loader_spinner").removeClass("visible");
		if(callback!==undefined){
			callback();
		}
	});
}

function zmtShowAlert(msg,type){
	let allowedTypes = ["success", "error", "info"];
	if (allowedTypes.indexOf(type) == -1)
		return false;

	$("#zmt_app_alert").find(".content").html(msg);
	$("#zmt_app_alert").addClass(["visible", type]);
}

function log(){
	if (zmt_settings && zmt_settings.debug)
		console.log(arguments);
}