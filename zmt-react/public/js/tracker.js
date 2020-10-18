const imagesBaseUrl = chrome.extension.getURL('images/'),
	failureImgSrc = `${imagesBaseUrl}tracker_failed.png`,
	successImgSrc = `${imagesBaseUrl}tracker_inserted.png`,
	apiBaseUrl = 'http://zohomailtracker.local/api/v3/',
	zohoDomainPattern = new RegExp('^mail\.zoho\.[a-z]+$'),
	failureMessages = {
		NEEDS_RELOAD: 'the page needs a reload!',
		DIFFERENT_USER: (sender) => `you are logged in the extension as ${window.user.email} but trying to send the email as ${sender}`,
		TRACKING_DISABLED: 'mail tracking is switched off!',
		UNVERIFIED_USER: 'user is not verified!',
		ANON_USER: 'user is not logged in!',
		SETTINGS_UNAVAILABLE: 'could not load saved settings!',
		DEFAULT_MSG: 'something went wrong!'
	},
	alertElId = 'zmt_app_alert',
	loaderId = 'zmt_loader';

var needsReload = false,
	zmtLoaderPromise,
	zmtReloadCheckHandle;

jQuery(document).ready(async function ($) {

	// don't attach any handler if the URL is not like zohoDomainPattern
	if (!zohoDomainPattern.test(window.location.host)) {
		return;
	}

	Sentry.init({
		dsn: env.sentryDsn,
		integrations: [
			new Sentry.Integrations.BrowserTracing()
		],
		ignoreErrors: ['ResizeObserver loop limit exceeded'],
		tracesSampleRate: 1.0
	});

	Sentry.setTag('version', helpers.currentVersion);

	addBoilerplateHtml();

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


	$('body').find(`#${alertElId} .close`).on('click', function () {
		$(`#${alertElId}`).removeClass(['visible', 'success', 'error', 'info']);
	});

	// our failsafe that cancels the tracker and simply sends the mail
	// in cases like it takes too long or something!
	$('body').on('click', `#${loaderId} .cancel_div a`, function (e) {
		e.preventDefault();
		log('Tracking canceled!');
		$('[data-zmt_event=\'s\'].sending').each(async function () {
			await zmtHideLoader();
			sendMail($(this));
		});
	});

	// we call this repetitively so that hypothetically, if a person is writing a mail and the extension updates, it won't be able to insert a tracker.
	// So, we update the user using our visuals!
	zmtReloadCheckHandle = setInterval(function () {
		checkPageNeedsReload();
	}, 5000);

});

/**
 * the function that gets the settings from localstorage and then stores a local copy of it!
 * @param callback
 * @returns {Promise<void>}
 */
async function refreshSettingsFromStorage () {
	log('refreshing settings');
	window.user = await helpers.storage.get('user');
	window.settings = await helpers.storage.get('settings');
	window.hashes = await helpers.storage.get('hashes');

	// add contextual data for sentry
	if (window.user && window.user.email) {
		Sentry.setTag('userEmail', window.user.email);
	}
	if (window.settings) {
		Sentry.setTag('settings', JSON.stringify(window.settings));
	}
}

/**
 * whenever the storage is changed,
 * we make sure to refresh it here
 */
chrome.storage.onChanged.addListener(async function (changes, namespace) {
	log('storage changed');

	// this is so that we don't refresh only when hashes are changed
	// this happens everytime an email is sent,
	// so refreshing while sending is not needed
	if (changes.user !== undefined || changes.settings != undefined) {
		log('zmt settings changed');
		await refreshSettingsFromStorage();

		// this makes sure if someone changes a setting, like user, mail tracking etc
		// it is reflected in the emails that are opened w/o a need for reload
		$('[data-event=\'s\']:not(.sending),[data-zmt_event=\'s\']:not(.sending)').each(function () {
			// $(this) is the button
			replaceSendBtn($(this));
		});
	}
});


/**
 * function that checks that the send button exists in the DOM.
 * this ignores the button with .sending class attached, because at that very moment the mail is sending,
 * so we don't want to interfere
 * @param el
 * @param recurse
 * @returns {Promise<boolean>}
 */
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
		sender === window.user.email
	) {
		tooltipValue = 'Tracker will be inserted on \'Send\'';
		tooltipSrc = successImgSrc;

		// so that I can replace it back!
		sendBtn.attr('data-zmt_event', 's').removeAttr('data-event');
	}

	// if settings were not found,
	// or if mail tracking is switched off,
	// or if the user is not verified,
	// then simply add a visual to show the user that we won't be tracking this mail
	else {
		tooltipValue = `Tracker will not be inserted because ${getFailedReason(sender)}`;
		tooltipSrc = failureImgSrc;

		// we remove our custom event attribute so that even if we are not inserting a tracker, people can still send the emails
		// The need for this arised when we started realtime sync instead of a simple reload.
		// Example: we are banning users from tracking if their email is diff in zoho from our extension. But if the user logs out and then logs in from proper account, we must update the send button to track or not track
		sendBtn.attr('data-event', 's').removeAttr('data-zmt_event');
	}

	// if the icon already exists, then we simply replace the src and tooltip values
	if (parent.find('.zmt_tracking_status').length) {
		const img = parent.find('.zmt_tracking_status').find('img');
		img.attr('data-tooltip', tooltipValue);
		img.attr('alt', tooltipValue);
		if (img.attr('src') !== tooltipSrc) {
			img.attr('src', tooltipSrc);
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

		removeCurrentPixelsFromMail(mailBody);

		let subject = getSubjectFromSendBtn(sendBtn),
			toField = getRecipientFromSendBtn(sendBtn),
			ccField = getCcFromSendBtn(sendBtn),
			bccField = getBccFromSendBtn(sendBtn);

		if (!toField.length) {
			await zmtHideLoader();
			zmtShowAlert('Please fill up the Recipient!', 'error');
			return;
		}

		log('fetching hash from server');
		const hash = await fetchHashFromServer(sendBtn, subject, toField, ccField, bccField);
		log('hash received from server', hash);

		// first make sure that the hash is added to the list of hashes to be blocked, then append the image in the ,mail.
		await addHashToStorage(hash);
		log('hash added to localstorage', hash);

		// this is done because the onStorage Changed listener doesn't refresh the window settings when the hashes are changed.
		// this is done to avoid unnecessary refresh cycles.
		// the hash is only refreshed from here, moreover we it's not important for tracker to have an updated copy of the hashes immediately
		if (window.hashes && window.hashes.indexOf(hash) === -1) {
			window.hashes.push(hash);
		}

		await zmtHideLoader();
		let pixelImage = `<div class="zmt_pixel_div"><img src='${apiBaseUrl}img/show?hash=${hash}' class='zmt_pixel' /><br /></div>`;
		mailBody.contents().find('body').append(pixelImage);
	}
	catch (err) {
		log('Tracker failed', err);
		await zmtHideLoader();
		zmtShowAlert('Tracker inserting failed!', 'error');
		Sentry.captureException(err);
	}
}

/**
 * function that checks if the tracking pixel is present in the mailBody element
 * if a pixel is present, it removes it which means that in replies, or nested threads, a user won't get multiple notifications
 * mailBody is the jquery element(iframe element)
 * @param mailBody
 */
function removeCurrentPixelsFromMail (mailBody) {
	// Zoho converts the classes, so we simply remove divs containing zmt_pixel_div class
	mailBody.contents().find('div[class*="zmt_pixel_div"]').filter(function () {
		$(this).remove();
	});
}

/**
 * Computes the Subject relative to the send btn, which it fetches from the DOM.
 * @param send_btn
 * @returns {*|string|undefined}
 */
function getSubjectFromSendBtn (send_btn) {
	return send_btn.parents('.SC_mclst.zmCnew').find('[id^=\'zmsub_Cmp\']').val();
}

/**
 * Computes the Recipient relative to the send btn, which it fetches from the DOM.
 * @param send_btn
 * @returns {*}
 */
function getRecipientFromSendBtn (send_btn) {
	return send_btn.parents('.SC_mclst.zmCnew').find('.zmCTxt.zmdrop.recipient-field').eq(0).find('.SC_cs').map(function () {
		let tooltip = $(this).attr('data-tooltip'),
			email = helpers.extractEmailsFromText(tooltip);

			if (email.length > 0 && helpers.is_email_valid(email[0])) {
				return email[0];
			}
			else {
				return $(this).find('input').val();
			}
	}).get().join(',');
}

/**
 * Computes the CC relative to the send btn, which it fetches from the DOM.
 * @param send_btn
 * @returns {*}
 */
function getCcFromSendBtn (send_btn) {
	return send_btn.parents('.SC_mclst.zmCnew').find('.zmCTxt.zmdrop.recipient-field').eq(1).find('.SC_cs').map(function () {
		let tooltip = $(this).attr('data-tooltip'),
			email = helpers.extractEmailsFromText(tooltip);

		if (email.length > 0 && helpers.is_email_valid(email[0])) {
			return email[0];
		} else {
			return $(this).find('input').val();
		}
	}).get().join(',');
}

/**
 * Computes the BCC relative to the send btn, which it fetches from the DOM.
 * @param send_btn
 * @returns {*}
 */
function getBccFromSendBtn (send_btn) {
	return send_btn.parents('.SC_mclst.zmCnew').find('.zmCTxt.zmdrop.recipient-field').eq(2).find('.SC_cs').map(function () {
		let tooltip = $(this).attr('data-tooltip'),
			email = helpers.extractEmailsFromText(tooltip);

		if (email.length > 0 && helpers.is_email_valid(email[0])) {
			return email[0];
		} else {
			return $(this).find('input').val();
		}
	}).get().join(',');
}

/**
 * Func that actually gets a new pixel from the server
 * @param sendBtn
 * @param subject
 * @param toField
 * @param ccField
 * @param bccField
 * @returns {Promise<unknown>}
 */
async function fetchHashFromServer (sendBtn, subject, toField, ccField, bccField) {
	const data = {
		api_token: window.user.apiToken,
		subject: subject,
		to_field: toField,
		cc_field: ccField,
		bcc_field: bccField
	};
	return new Promise((resolve, reject) => {
		$.post(`${apiBaseUrl}img/new`, data, async function (response) {
			// TODO, change this way of checking success
			if (response.code == '1') {
				resolve(response.hash);
			}
			else {
				log('Response code invalid while fetching hash', response);
				reject('Unable to generate tracking pixel!');
				Sentry.captureException(new Error(JSON.stringify({ response, data })));
				await zmtHideLoader();
				zmtShowAlert('Tracker inserting failed!', 'error');
			}
		}).fail(function (err) {
			log('ajax request failed in fetchHashFromServer', err, data);

			// Sentry.captureException(new Error(err));
			reject(new Error(err));
		});
	});
}

/**
 * add a hash to the localstorage by sending this msg to background script
 */
async function addHashToStorage (hash) {
	log('addHashToStorage func for hash', hash);
	return new Promise((resolve) => {
		chrome.runtime.sendMessage({
			action: 'add_hash',
			hash: hash
		}, function (response) {
			log('runtime.sendMessage callback', response);
			resolve();
		});
	});
}

/**
 * Func called when all other steps are done and we only need to send the email from Zoho's side
 * @param btn
 */
function sendMail (btn) {
	log('sendMail called');
	btn.removeClass('sending');
	btn.attr('data-event', 's').removeAttr('data-zmt_event');
	btn.find('b')[0].click();
}

/**
 * Computes the sender that will be used for sending this email
 * @param btn
 * @returns {string}
 */
function getEmailSender (btn) {
	var emailField = btn.parents('.SC_mclst.zmCnew').find('[id^=\'zm_fromaddr_Cmp\']'),
		email = [''];
	if (emailField.length) {
		email = helpers.extractEmailsFromText(emailField.text());
	}

	return email[0];
}


/**
 * we don't need to rely on the asynchronous nature of sendMessage because
 * if we chrome.runtime is available, then we simply return true.
 * If it is not available and it hit an exception, we return false
 */
function checkPageNeedsReload () {
	try {
		chrome.runtime.sendMessage({
			action: 'checking_connection'
		}, function () {
		});
	}
	catch (err) {
		log('chrome.runtime throws exception, probably page needs reload', err);
		const failureReason = `Tracker will not be inserted because ${failureMessages.NEEDS_RELOAD}`;

		// update any icons showing success indicators
		$('.zmt_tracking_status').each(function () {
			$(this).find('img').attr('src', failureImgSrc).attr('data-tooltip', failureReason).attr('alt', failureReason);
		});

		// remove the tracker handler
		$('[data-zmt_event=\'s\']').removeAttr('data-zmt_event').attr('data-event', 's');
		window.needsReload = true;
		clearInterval(zmtReloadCheckHandle);
		return;
	}
	window.needsReload = false;
}

/**
 * the function that shows the loader inside UI
 * @param msg
 * @param cancellable
 */
function zmtShowLoader (msg, cancellable) {
	$(`#${loaderId}`).find('.msg').text(msg);
	$(`#${loaderId}`).addClass('visible').find('.loader_spinner').addClass('visible');
	if (cancellable === true) {
		$(`#${loaderId}`).find('.cancel_div').addClass('visible');
	}
	zmtLoaderPromise = new Promise(function (resolve, reject) {
		setTimeout(function () {
			resolve();
		}, 1000);
	});
}

/**
 * hide the loader
 * @param callback
 */
async function zmtHideLoader () {
	log('inside zmtHideLoader');

	// this will make sure that even if the hideLoader is called immediately after
	// show_loader we still show the loader for at least the duration of the timeout
	// used inside the showLoader method
	await zmtLoaderPromise;
	$(`#${loaderId}`).find('.msg').text('');
	$(`#${loaderId}`).removeClass('visible').find('.loader_spinner').removeClass('visible');
}

/**
 * Shows alert on the side of the screen
 * @param msg
 * @param type
 * @returns {boolean}
 */
function zmtShowAlert (msg, type) {
	let allowedTypes = ['success', 'error', 'info'];
	if (allowedTypes.indexOf(type) === -1)
		return false;

	$(`#${alertElId}`).find('.content').html(msg);
	$(`#${alertElId}`).addClass(['visible', type]);
}

/**
 * Helper log function
 */
function log () {
	// if (window.settings && window.settings.debug)
		// console.log('zmt', JSON.stringify(Array.from(arguments)));
	Sentry.addBreadcrumb({
		category: 'log',
		message: JSON.stringify(Array.from(arguments)),
		level: Sentry.Severity.Info
	});
}

/**
 * Computes the reason why the tracker won't be inserted to show it to the user.
 * @param sender
 * @returns {string}
 */
function getFailedReason (sender) {
	if (!window.settings)
		return failureMessages.SETTINGS_UNAVAILABLE;
	else if (!window.user)
		return failureMessages.ANON_USER;
	else if (!window.user.verified)
		return failureMessages.UNVERIFIED_USER;
	else if (!window.settings.tracking)
		return failureMessages.TRACKING_DISABLED;
	else if (sender !== window.user.email)
		return failureMessages.DIFFERENT_USER(sender);
	else if (window.needsReload)
		return failureMessages.NEEDS_RELOAD;
	return failureMessages.DEFAULT_MSG;
}

/**
 * Func that appends HTML elements to DOM for our use
 */
function addBoilerplateHtml () {
	// add the zmt loader and alert HTML
	$('body').append(`
		<div id='${loaderId}'>
			<div class='loader_spinner' style='background:url(${imagesBaseUrl}logo64.png);'></div>
			<div class='msg'></div>
			<div class='cancel_div'>
				If this is taking time, you can <a href='#'>cancel the tracker</a> and send the mail untracked!
			</div>
		</div>`);
	$('body').append(`
		<div id='${alertElId}'>
			<div class='content'></div>
			<div class='close'><i class='zmt_close_btn'></i></div>
		</div>`);
}
