var zmt_token,
	doc_user_email,
	imagesBaseUrl = chrome.extension.getURL('images/'),
	needsReload = false,
	base_url = 'https://zohomailtracker.com/api/v3/',
	zmt_settings,
	zmtLoaderPromise,
	zmtReloadCheckHandle,
	zohoDomainPattern = new RegExp('^mail\.zoho\.[a-z]+$'),
	imageHashPattern = /https:\/\/zohomailtracker\.com\/api\/v3\/img\?hash=\w+/;

jQuery(document).ready(async function ($) {

	// don't attach any handler if the URL is not like zohoDomainPattern
	if (!zohoDomainPattern.test(window.location.host)) {
		return;
	}

	// add the zmt loader and alert HTML
	$('body').append(`
		<div id='zmt_loader'>
			<div class='loader_spinner' style='background:url(${imagesBaseUrl}logo64.png);'></div>
			<div class='msg'></div>
			<div class='cancel_div'>
				If this is taking time, you can <a href='#'>cancel the tracker</a> and send the mail untracked!
			</div>
		</div>`);
	$('body').append(`
		<div id='zmt_app_alert'>
			<div class='content'></div>
			<div class='close'><i class='zmt_close_btn'></i></div>
		</div>`);

	await refreshSettingsFromStorage();

	// on mouse move over the selector, we check if the send btn exists
	// if it does, we replace the btn with our custom one
	$('body').on('mousemove', '.SCm', async function () {
		let btn = $(this).find('[data-event=\'s\']:not(.sending)');
		if (await checkSendBtn(btn)) {
			replaceSendBtn(btn);
		}
	});


	// event handler for our fake button
	// this would come into DOM after a successful replaceSendBtn call
	$('body').on('click', '[data-zmt_event=\'s\']', async function (e) {
		log('zmt btn event handler');

		// even though there should be no event handler for this!
		e.preventDefault();
		e.stopImmediatePropagation();

		// do our insertion if tracking is enabled
		if (window.settings.tracking) {
			$(this).addClass('sending');
			await insertTracker($(this));
		}

		// sendMail will be called regardless of insertTracker succeeding or not
		$(this).removeClass('sending');
		sendMail($(this));
	});

	// update the sender and the UI helpers on changing the alias
	$('body').on('mouseup', '.zmcDrpDwnMnu.SC_Phr > li', function (e) {
		e.preventDefault();
		setTimeout(function () {
			$('[data-event=\'s\'],[data-zmt_event=\'s\']').each(function () {
				var btn = $(this);
				replaceSendBtn(btn);
			});
		}, 500);
	});

	$('body').find('#zmt_app_alert .close').on('click', function () {
		$('#zmt_app_alert').removeClass(['visible', 'success', 'error', 'info']);
	});

	// our failsafe that cancels the tracker and simply sends the mail
	// in cases like it takes too long or something!
	$('body').on('click', '#zmt_loader .cancel_div a', function (e) {
		e.preventDefault();
		log('Tracking canceled!');
		$('[data-zmt_event=\'s\'].sending').each(function () {
			let btn = $(this);
			zmtHideLoader(function () {
				sendMail(btn);
			});
		});
	});

	// we call this repetitively so that hypothetically, if a person is writing a mail and the extension updates, it won't be able to insert a tracker.
	// So, we update the user using our visuals!
	zmtReloadCheckHandle = setInterval(function () {
		checkPageNeedsReload();
	}, 5000);

	// ctrl + Enter capture
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

/**
 * the function that gets the settings from localstorage and then stores a local copy of it!
 * @param callback
 * @returns {Promise<void>}
 */
async function refreshSettingsFromStorage (callback) {
	log('refreshing settings');
	window.user = await helpers.storage.get('user');
	window.settings = await helpers.storage.get('settings');
	window.hashes = await helpers.storage.get('hashes');
}

// whenever the storage is changed,
// we make sure to refresh it here
chrome.storage.onChanged.addListener(async function (changes, namespace) {
	log('storage changed');

	// if (Object.keys(changes).indexOf("zmt_settings") != -1) {
	// 	log("zmt settings changed");
		await refreshSettingsFromStorage();

		// this makes sure if someone changes a setting, like user, mail tracking etc
		// it is reflected in the emails that are opened w/o a need for reload
		$('[data-event=\'s\']:not(.sending),[data-zmt_event=\'s\']:not(.sending)').each(function () {
			var btn = $(this);
			replaceSendBtn(btn);
		});

	// }
});

// function that checks that the send button exists in the DOM.
// this ignores the button with .sending class attached, because at that very moment the mail is sending,
// so we don't want to interfere
async function checkSendBtn (el, recurse) {
	return !!el.parents('.SC_mclst.zmCnew').find('.SCtxt[data-event=\'s\']:not(.sending)').length;
}

/**
 * button used to replace attr of send button so we can capture its click.
 * basically our fake button
 */
function replaceSendBtn (el) {
	log('inside replaceSendBtn');
	let sendBtn = el.parents('.SC_mclst.zmCnew').find('.SCtxt[data-event=\'s\']').length ? el.parents('.SC_mclst.zmCnew').find('.SCtxt[data-event=\'s\']') : el.parents('.SC_mclst.zmCnew').find('.SCtxt[data-zmt_event=\'s\']'),
		parent = sendBtn.parents('.SC_flt'),
		sender = getEmailSender(sendBtn),
		tooltipValue = '',
		tooltipSrc = '';

	if (window.settings &&
		window.settings.tracking &&
		window.user &&
		window.user.verified &&
		!window.needsReload &&
		sender == window.user.email
	) {
		tooltipValue = 'Tracker will be inserted on \'Send\'';
		tooltipSrc = `${imagesBaseUrl}tracker_inserted.png`;

		// so that I can replace it back!
		sendBtn.attr('data-zmt_event', 's').removeAttr('data-event');
	}

	// if settings were not found,
	// or if mail tracking is switched off,
	// or if the user is not verified,
	// then simply add a visual to show the user that we won't be tracking this mail
	else {
		tooltipValue = `Tracker will not be inserted because ${getFailedReason(sender)}`;
		tooltipSrc = `${imagesBaseUrl}tracker_failed.png`;

		// we remove our custom event attribute so that even if we are not inserting a tracker, people can still send the emails
		// The need for this arised when we started realtime sync instead of a simple reload.
		// Example: we are banning users from tracking if their email is diff in zoho from our extension. But if the user logs out and then logs in from proper account, we must update the send button to track or not track
		sendBtn.attr('data-event', 's').removeAttr('data-zmt_event');
	}

	// if the icon already exists, then we simply replace the src and tooltip values
	if (parent.find('.zmt_tracking_status').length) {
		parent.find('.zmt_tracking_status').attr('data-tooltip', tooltipValue);
		if (parent.find('zmt_tracking_status').attr('src') !== tooltipSrc) {
			parent.find('zmt_tracking_status').attr('src', tooltipSrc);
		}
	}

	// none found, we insert a new element
	else {
		let infoEl = `
		<ul class='zmt_tracking_status'>
			<li>
				<img src="${tooltipSrc}" data-tooltip="${tooltipValue}" />
			</li>
		</ul>`;
		parent.append(infoEl);
	}
}

/**
 * Func that calls the API to get the pixel hash
 * @param sendBtn
 * @returns {Promise<void>}
 */
async function insertTracker (sendBtn) {
	log('inserting tracker');
	zmtShowLoader('Inserting tracker!', true);
	try {
		// find the tracking pixel in this mail and the subject of the mail
		let mailBody = sendBtn.parents('.SC_mclst.zmCnew').find('.zmCE').find('.ze_area');

		remove_current_pixels_from_mail(mailBody);

		let subject = get_subject_field_val(sendBtn),
			toField = get_to_field_val(sendBtn),
			ccField = get_cc_field_val(sendBtn),
			bccField = get_bcc_field_val(sendBtn);

		if (!toField.length) {
			zmtHideLoader(function () {
				zmtShowAlert('Please fill up the Recipient!', 'error');
			});
			return;
		}

		log('fetching hash from server');
		const hash = await fetchHashFromServer(sendBtn, subject, toField, ccField, bccField);
		log('hash received from server', hash);

		let pixelImage = `<img src='${base_url}img/show?hash=${hash}' class='zmt_pixel' />`;

		// let pixelImage = '<div><img src="https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616__340.jpg" class="zmt_pixel" /><br /></div>';

		// first make sure that the hash is added to the list of hashes to be blocked, then append the image in the ,mail.
		await addHashToStorage(hash);
		console.log('hash added to localstorage', hash);

		zmtHideLoader(function () {
			log('zmtHideLoader callback');
			mailBody.contents().find('body').append(pixelImage);
		});
	}
	catch (err) {
		log('Tracker failed', err);
		zmtHideLoader(function () {
			zmtShowAlert('Tracker inserting failed!', 'error');
		});
	}
}

// function that checks if the tracking pixel is present in the mailBody element
// if a pixel is present, it removes it which means that in replies, or nested threads, a user won't get multiple notifications
// mailBody is the jquery element(iframe element)
function remove_current_pixels_from_mail (mailBody) {
	var imgs = mailBody.contents().find('img').filter(function () {
		let src = $(this).attr('src');

		// src was sometimes undefined
		if (typeof src != 'undefined' && src.match(imageHashPattern)) {
			$(this).remove();
		}
	});
}

function get_subject_field_val (send_btn) {
	return send_btn.parents('.SC_mclst.zmCnew').find('[id^=\'zmsub_Cmp\']').val();
}

function get_to_field_val (send_btn) {
	return send_btn.parents('.SC_mclst.zmCnew').find('.zmCTxt.zmdrop.recipient-field').eq(0).find('.SC_cs').map(function () {
		var tooltip = $(this).attr('data-tooltip'),
			email = extractEmails(tooltip);

			if (email.length > 0 && is_email_valid(email[0])) {
				return email[0];
			}
			else {
				return $(this).find('input').val();
			}
	}).get().join(',');
}

function get_cc_field_val (send_btn) {
	return send_btn.parents('.SC_mclst.zmCnew').find('.zmCTxt.zmdrop.recipient-field').eq(1).find('.SC_cs').map(function () {
		var tooltip = $(this).attr('data-tooltip'),
			email = extractEmails(tooltip);

		if (email.length > 0 && is_email_valid(email[0])) {
			return email[0];
		} else {
			return $(this).find('input').val();
		}
	}).get().join(',');
}

function get_bcc_field_val (send_btn) {
	return send_btn.parents('.SC_mclst.zmCnew').find('.zmCTxt.zmdrop.recipient-field').eq(2).find('.SC_cs').map(function () {
		var tooltip = $(this).attr('data-tooltip'),
			email = extractEmails(tooltip);

		if (email.length > 0 && is_email_valid(email[0])) {
			return email[0];
		} else {
			return $(this).find('input').val();
		}
	}).get().join(',');
}

function extractEmails (text) {
	return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}

function is_email_valid (email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

async function fetchHashFromServer (sendBtn, subject, toField, ccField, bccField) {
	return new Promise((resolve, reject) => {
		$.post(base_url + 'img/new', {
			api_token: window.user.apiToken,
			subject: subject,
			to_field: toField,
			cc_field: ccField,
			bcc_field: bccField
		}, function (response) {
			// TODO, change this way of checking success
			if (response.code == '1') {
				resolve(response.hash);
			}
			else {
				log('Response code invalid while fetching hash', response);
				reject('Unable to generate tracking pixel!');
				zmtHideLoader(function () {
					zmtShowAlert('Tracker inserting failed!', 'error');
					sendMail(sendBtn);
				});
			}
		}).fail(function (err) {
			log('ajax request failed in fetchHashFromServer', err);
			reject(err);
		});
	});
}

// add a hash to the localstorage by sending this msg to background script
async function addHashToStorage (hash) {
	log('addHashToStorage func for hash', hash);
	return new Promise((resolve) => {
		chrome.runtime.sendMessage({
			action: 'add_hash',
			hash: hash
		}, resolve);
	});
}

function sendMail (btn) {
	log('sendMail called');
	btn.removeClass('sending');
	btn.attr('data-event', 's').removeAttr('data-zmt_event');
	btn.find('b').trigger('click');
}

function getEmailSender (btn) {
	var emailField = btn.parents('.SC_mclst.zmCnew').find('[id^=\'zm_fromaddr_Cmp\']'),
		email = [''];
	if (emailField.length) {
		email = extractEmails(emailField.text());
	}

	return email[0];
}

// we don't need to rely on the asynchronous nature of sendMessage because
// if we chrome.runtime is available, then we simply return true.
// If it is not available and it hit an exception, we return false
function checkPageNeedsReload () {
	try {
		chrome.runtime.sendMessage({
			action: 'checking_connection'
		}, function () {
		});
	}
	catch (err) {
		log('chrome.runtime throws exception, probably page needs reload', err);

		// display the visual
		$('.zmt_tracking_status').each(function () {
			$(this).find('li').html(`<img src='${imagesBaseUrl}tracker_failed.png' data-tooltip='Tracker will not be inserted because The page needs a reload!'>`);
		});

		// remove the tracker handler
		$('[data-zmt_event=\'s\']').removeAttr('data-zmt_event').attr('data-event', 's');
		window.needsReload = true;
		clearInterval(zmtReloadCheckHandle);
		return;
	}
	window.needsReload = false;
}

// the function that shows the loader inside UI
function zmtShowLoader (msg, cancellable) {
	$('#zmt_loader').find('.msg').text(msg);
	$('#zmt_loader').addClass('visible').find('.loader_spinner').addClass('visible');
	if (cancellable === true) {
		$('#zmt_loader').find('.cancel_div').addClass('visible');
	}
	zmtLoaderPromise = new Promise(function (resolve, reject) {
		setTimeout(function () {
			resolve();
		}, 1000);
	});
}

// hide the loader
function zmtHideLoader (callback) {
	// this will make sure that even if the hideLoader is called immediately after
	// show_loader we still show the loader for at least the duration of the timeout
	// used inside the showLoader method
	zmtLoaderPromise.then(function () {
		$('#zmt_loader').find('.msg').text('');
		$('#zmt_loader').removeClass('visible').find('.loader_spinner').removeClass('visible');
		if (callback !== undefined) {
			callback();
		}
	});
}

function zmtShowAlert (msg, type) {
	let allowedTypes = ['success', 'error', 'info'];
	if (allowedTypes.indexOf(type) == -1)
		return false;

	$('#zmt_app_alert').find('.content').html(msg);
	$('#zmt_app_alert').addClass(['visible', type]);
}

function log () {
	if (window.settings && window.settings.debug)
		console.log(arguments);
}


function getFailedReason (sender) {
	if (!window.settings)
		return 'could not load saved settings!';
	else if (!window.user)
		return 'user is not logged in!';
	else if (!window.user.verified)
		return 'user is not verified!';
	else if (!window.settings.tracking)
		return 'mail tracking is switched off!';
	else if (sender != window.user.email)
		return `you are logged in the extension as ${window.user.email} but trying to send the email as ${sender}`;
	else if (window.needsReload)
		return 'the page needs a reload!';
	return 'something went wrong!';
}
