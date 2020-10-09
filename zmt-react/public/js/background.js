const notificationImgUrl = 'images/icon_notif.png',
	notificationTypes = {
		EMAIL_VIEW: { key: 'emailView', id: 'zmt_email' },
		CONTACT: { key: 'contact', id: 'zmt_contact' },
		GLOBAL: { key: 'global', id: 'zmt_global' }
	},
	blockingUrl = '*://zohomailtracker.com/api/v3/img/show?hash=*',
	replacementPixelUrl = 'https://zohomailtracker.com/images/onepix.gif';

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
				message: (message) => {
					// handle message
					this.displayNotification(message);
				}
			});
		}
	}

	async attachChannel (name) {
		console.log('attaching channel');

		// no need to resubscribe
		if (this.pubnub && name && this.channelName !== name) {
			await this.pubnub.subscribe({
				channels: [name]
			});
			this.channelName = name;
		}
	}

	async detachChannel () {
		console.log('detaching channel');
		if (this.pubnub !== false && this.channelName !== false) {
			await this.pubnub.unsubscribe({
				channels: [this.channelName]
			});
			this.channelName = false;
		}
	}

	displayNotification (message) {
		try {
			const type = message.message.type;
			if (type === notificationTypes.EMAIL_VIEW.key) {
				chrome.notifications.create(`${notificationTypes.EMAIL_VIEW.id}_${message.message.id}`, {
					type: 'basic',
					title: 'Someone viewed an email!',
					message: `Subject: ${message.message.sub}\nLocation: ${message.message.location}`,
					iconUrl: notificationImgUrl
				});
			}
			else if (type === notificationTypes.CONTACT.key) {
				chrome.notifications.create(`${notificationTypes.CONTACT.id}_${(new Date()).getMilliseconds()}`, {
					type: 'basic',
					title: 'Someone sent a contact entry!',
					message: `Type:${message.message.contactType}\nEmail:${message.message.email}`,
					iconUrl: notificationImgUrl
				});
			}
			else if (type === notificationTypes.GLOBAL.key) {
				chrome.notifications.create(`${notificationTypes.GLOBAL.id}_${(new Date()).getMilliseconds()}`, {
					type: 'basic',
					title: message.message.title,
					message: message.message.body,
					iconUrl: notificationImgUrl
				});
			}
		}
		catch (err) {
		}
	}
}

const pubnubManager = new PubNubManager();

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
			redirectUrl: replacementPixelUrl
		};
	}
}, {
	urls: [blockingUrl]
}, ['blocking']);

/**
 * message passing receiver
 * this should take care of things like dynamically adding hashes to our whitelist
 */
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

	if (user && user.verified && user.channel && settings && settings.notifications) {
		pubnubManager.initPubnub();
		pubnubManager.attachChannel(user.channel);
	}
	else {
		pubnubManager.detachChannel();
	}
}


/**
 * whenever the storage is changed,
 * we make sure to refresh it here
 */
chrome.storage.onChanged.addListener(async function (changes, namespace) {
	await refreshSettingsFromStorage();
});


/**
 * When the notification balloon is clicked
 * We should open the extension page
 */
chrome.notifications.onClicked.addListener(function (notificationId) {
	if (notificationId.indexOf(notificationTypes.EMAIL_VIEW.id) === 0 || notificationId.indexOf(notificationTypes.GLOBAL.id) === 0) {
		chrome.tabs.create({
			url: 'index.html'
		});
	}
});
