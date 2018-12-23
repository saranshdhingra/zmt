var zmt_token,
	doc_user_email,
	needs_reload=false,
	base_url = "http://zmt.abc/api/v2/",
	zmt_settings,
	zoho_patt = new RegExp("^mail\.zoho\.[a-z]+$");

jQuery(document).ready(function($){

	//don't attach any handler if the URL is not like mail.zoho...
	if (!zoho_patt.test(window.location.host)) {
		return;
	}
	// console.log("injected");

	refresh_settings(function(){
		// check_doc_email();
	});

	//triggers when any one of the "To","CC","BCC","Subject" fields is changed
	$("body").on("keyup keypress focus blur change", ".zmCTxt .zm_sgst,.zmCTxt.subject-field>input,.ze_area", function (e) {
		check_send_btn($(this));
	});

	// $("body").on("click", ".zm_ry>span", function () {
	// 	//using recurse=true so that the function keeps running until the send button is visible
	// 	check_send_btn($(".ze_area"), true);
	// });


	//event handler for our fake button
	$("body").on("click", "[data-zmt_event='s']", function (e) {
		//even though there should be no event handler for this!
		e.preventDefault();
		e.stopImmediatePropagation();

		//do our insertion if tracking is enabled
		if (zmt_settings.mail_tracking) {
			insert_tracker($(this));
		}
		else {
			send_mail($(this));
		}
	});

	//we call this repetitively so that hypothetically, if a person is writing a mail and the extension updates, it won't be able to insert a tracker.
	//So, we update the user using our visuals!
	setInterval(function(){
		check_page_needs_reload();
	},5000);

});


function refresh_settings(){
	chrome.storage.local.get("zmt_settings", function (result) {
		if (result.zmt_settings !== undefined) {
			// console.log(result.zmt_settings);
			window.zmt_settings = JSON.parse(result.zmt_settings);
		}
	});
}

//function that checks that the send button exists in the DOM.
//if recurse is true and there is not send btn(near the el) , it will keep calling itself recursively.
function check_send_btn(el, recurse) {
	if (el.parents(".SC_mclst.zmCnew").find(".SCtxt[data-event='s']").length == 0) {
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
function replace_send_btn(el) {
	var send_btn = el.parents(".SC_mclst.zmCnew").find(".SCtxt[data-event='s']"),
		parent = send_btn.parents(".SC_flt"),
		tracking_str;
		
	if (zmt_settings && zmt_settings.mail_tracking && zmt_settings.user && zmt_settings.user.verified &&  !window.needs_reload) {
		tracking_str=`<ul class='zmt_tracking_status'><li><img src='${chrome.extension.getURL('images/tracker_inserted.png')}' data-tooltip="Tracker will be inserted on 'Send'"></li></ul>`;
		
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
		else if (window.needs_reload)
			failed_reason = "The page needs a reload!";

		failed_reason = `Tracker will not be inserted because <strong>${failed_reason}</strong>`;
			
		tracking_str = `<ul class='zmt_tracking_status'><li><img src='${chrome.extension.getURL('images/tracker_failed.png')}' data-tooltip='${failed_reason}'></li></ul>`;
	}

	//just to show the current info of tracking status!
	if (parent.find(".zmt_tracking_status").length == 0) {
		parent.append(tracking_str);
	}
}

function insert_tracker(send_btn){
	//find the tracking pixel in this mail and the subject of the mail
	var mail_body = send_btn.parents(".SC_mclst.zmCnew").children(".zmCE").find(".ze_area");

	remove_current_pixels_from_mail(mail_body);

	var subject = get_subject_field_val(send_btn),
		to_field = get_to_field_val(send_btn),
		cc_field = get_cc_field_val(send_btn),
		bcc_field = get_bcc_field_val(send_btn);

	fetch_hash_from_server(subject, to_field, cc_field, bcc_field, function (hash) {
		var img_str = "<img src='" + base_url + "img/show?hash=" + hash + "' class='zmt_pixel' />";

		//first make sure that the hash is added to the list of hashes to be blocked, then append the image in the ,mail.
		add_hash_to_local(hash, function () {
			mail_body.contents().find("body").append(img_str);
			send_mail(send_btn);
		});
	});
}

//function that checks if the tracking pixel is present in the mail_body element
//if a pixel is present, it removes it which means that in replies, or nested threads, a user won't get multiple notifications
//mail_body is the jquery element(iframe element)
function remove_current_pixels_from_mail(mail_body) {
	var imgs = mail_body.contents().find('img').filter(function () {
		var src = $(this).attr("src");
		//src was sometimes undefined
		if (typeof src != "undefined" && src.match(/http:\/\/zmt\.abc\/api\/v2\/img\?hash=\w+/)){
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

function fetch_hash_from_server(subject, to_field, cc_field, bcc_field, callback) {
	$.post(base_url + "img/new", {
		api_token: zmt_settings.user.api_token,
		subject: subject,
		to_field: to_field,
		cc_field: cc_field,
		bcc_field: bcc_field
	}, function (response) {
		var hash = response.hash;
		callback(hash);
	});
}

//add a hash to the local list of hashes
//let this task be handled by the background script
function add_hash_to_local(hash, callback) {
	chrome.runtime.sendMessage({
		action: 'add_hash',
		hash: hash
	}, function () {
		callback();
	});
}

function send_mail(btn) {
	btn.attr("data-event", "s").removeAttr("data-zmt_event");
	btn.find("b").trigger("click");
}

function check_doc_email(){
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
		//display the visual
		$(".zmt_tracking_status").each(function(){
			$(this).find("li").html(`<img src='${chrome.extension.getURL('images/tracker_failed.png ')}'data-tooltip='Tracker will not be inserted because <strong>The page needs a reload</strong>!'>`);
		});
		//remove the tracker handler
		$("[data-zmt_event='s']").removeAttr("data-zmt_event").attr("data-event","s");
		window.needs_reload=true;
	}
	window.needs_reload=false;
}