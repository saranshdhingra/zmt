class PubNubManager {
	constructor () {
		this.pubnub = false;
		this.channelName = false;
	}

	initPubnub () {
		if (this.pubnub === false) {
			console.log('initializing pubnub');
			this.pubnub = new PubNub({
				subscribeKey: env.pubnub.subscribeKey,
				ssl: true
			});

			this.pubnub.addListener({
				message: function (message) {
					// handle message
					try {
						let type = message.message.type;
						if (type == 'emailView') {
							chrome.notifications.create(`zmt_email_${message.message.id}`, {
								type: 'basic',
								title: 'Someone viewed an email!',
								message: `Subject: ${message.message.sub}\nLocation: ${message.message.location}`,
								iconUrl: 'images/icon_notif.png'
							});
						}
						else if (type == 'contact') {
							chrome.notifications.create(`zmt_contact_${(new Date()).getMilliseconds()}`, {
								type: 'basic',
								title: 'Someone sent a contact entry!',
								message: `Type:${message.message.contactType}\nEmail:${message.message.email}`,
								iconUrl: 'images/icon_notif.png'
							});
						}
						else if (type == 'global') {
							chrome.notifications.create(`zmt_global_${(new Date()).getMilliseconds()}`, {
								type: 'basic',
								title: message.message.title,
								message: message.message.body,
								iconUrl: 'images/icon_notif.png'
							});
						}
					}
					catch (err) {
					}
				}
			});
		}
	}

	attachChannel (name) {
		// no need to resubscribe
		if (this.pubnub !== false && name !== false && this.channelName != name) {
			this.pubnub.subscribe({
				// channels: [zmt_settings.user.channel],
				channels: [name]
			});
			this.channelName = name;
		}
	}

	detachChannel () {
		if (this.pubnub !== false && this.channelName !== false) {
			this.pubnub.unsubscribe({
				channels: [this.channelName]
			});
			this.channelName = false;
		}
	}
}

var pubnubManager = new PubNubManager();

// when extension is loaded
chrome.runtime.onInstalled.addListener(async function () {
	await refreshSettingsFromStorage();

	// check if user has seen the changelog
	const version = await helpers.storage.get('last_seen_version'),
		cur_version = chrome.app.getDetails().version;

	if (version != cur_version) {
		chrome.browserAction.setBadgeText({
			text: 'NEW'
		});
	}
});

// open index.html page on Icon click
chrome.browserAction.onClicked.addListener(function (tab) {
	chrome.tabs.create({
		url: 'index.html'
	});
});

// this makes sure that users don't trigger a 'view' when they see the image themeselves.
chrome.webRequest.onBeforeRequest.addListener(function (info) {
	const hash = helpers.getParameterByName('hash', info.url);
	if (window.user && window.user.verified && hash != null && window.hashes && window.hashes.indexOf(hash) != -1) {
		return {
			redirectUrl: 'https://zohomailtracker.com/images/onepix.gif'
		};
	}
}, {
	urls: ['*://zohomailtracker.com/api/v3/img/show?hash=*']
}, ['blocking']);

// message passing receiver
// this should take care of things like dynamically adding hashes to our whitelist
// need to refresh zmt_settings here
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {

	if (request.action === 'add_hash') {
		// it is important to have the latest settings before we add the hash to local.
		await refreshSettingsFromStorage();
		let hashes = window.hashes ? window.hashes : [];

		// if we don't have the hash already, add it
		// this may happen in case of same messages being pushed from within other places of the extension
		if (hashes.indexOf(request.hash) === -1)
			hashes.push(request.hash);

		// this step may not be needed, because as soon as we set the new hashes in the storage
		// refreshSettingsFromStorage  will be called because of the event handler of onChanged
		window.hashes = hashes;
		await helpers.storage.set('hashes', hashes);
		console.log('added hash', request.hash);
		sendResponse({ 'action': 'done' });
	}
	return true;
});


/**
 * function that simply gets the settings and stores them
 */
async function refreshSettingsFromStorage () {
	let user = await helpers.storage.get('user'),
		settings = await helpers.storage.get('settings'),
		hashes = await helpers.storage.get('hashes');

	window.user = user;
	window.settings = settings;
	window.hashes = hashes;

	if (user !== undefined && settings !== undefined && user.verified && user.channel != undefined && settings.notifications) {
		pubnubManager.initPubnub();
		pubnubManager.attachChannel(user.channel);
	}
	else {
		pubnubManager.detachChannel();
	}
}


// whenever the storage is changed,
// we make sure to refresh it here
chrome.storage.onChanged.addListener(async function (changes, namespace) {
	await refreshSettingsFromStorage();
});
