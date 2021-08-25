const notificationImgUrl = 'images/icon_notif.png',
	notificationTypes = {
		EMAIL_VIEW: { key: 'emailView', id: 'zmt_email' },
		CONTACT: { key: 'contact', id: 'zmt_contact' },
		GLOBAL: { key: 'global', id: 'zmt_global' }
	},
	blockingUrls = env.blockingUrls,
	replacementPixelUrl = env.replacementPixelUrl,
	sentryDsn = env.sentryDsn;

const SOCKETIO_ENDPOINT=env.socketIoEndpoint;

class NotificationManager {
	constructor(){
		this.socket = false;
	}

	init(token){
		if(this.socket===false){
			this.socket = io(SOCKETIO_ENDPOINT,{
				extraHeaders:{
					Authorization: `Bearer ${token}`,
					'X-source': 'chrome'
				}
			});

			this.socket.on("connect", () => {
				log("connected");
			});
			  
			this.socket.on("disconnect", () => {
				log("disconnected");
			});

			this.socket.on('message',(data)=>{
				try{
					const obj = JSON.parse(data);
					this.displayNotification(obj);
				}
				catch(err){
					log('Error in parsing notification content!');
				}
			});
		}
	}

	disconnect(){
		if(this.socket!==false){
			this.socket.disconnect();
			this.socket = false;
		}
	}

	displayNotification (message) {
		try {
			const type = message.type;
			if (type === notificationTypes.EMAIL_VIEW.key) {
				chrome.notifications.create(`${notificationTypes.EMAIL_VIEW.id}_${message.id}`, {
					type: 'basic',
					title: 'Someone viewed an email!',
					message: `Subject: ${message.sub}\nLocation: ${message.location}`,
					iconUrl: notificationImgUrl
				});
			}
			else if (type === notificationTypes.CONTACT.key) {
				chrome.notifications.create(`${notificationTypes.CONTACT.id}_${(new Date()).getMilliseconds()}`, {
					type: 'basic',
					title: 'Someone sent a contact entry!',
					message: `Type:${message.contactType}\nEmail:${message.email}`,
					iconUrl: notificationImgUrl
				});
			}
			else if (type === notificationTypes.GLOBAL.key) {
				chrome.notifications.create(`${notificationTypes.GLOBAL.id}_${(new Date()).getMilliseconds()}`, {
					type: 'basic',
					title: message.title,
					message: message.body,
					iconUrl: notificationImgUrl
				});
			}
		}
		catch (err) {
		}
	}
}

const notifManager = new NotificationManager();

Sentry.init({
	dsn: env.sentryDsn,
	integrations: [
		new Sentry.Integrations.BrowserTracing()
	],
	ignoreErrors: ['ResizeObserver loop limit exceeded'],
	tracesSampleRate: 1.0
});

Sentry.setTag('version', helpers.currentVersion);

// when extension is loaded
chrome.runtime.onInstalled.addListener(async function () {
	await refreshSettingsFromStorage();

	// check if user has seen the changelog
	const version = await helpers.storage.get('last_seen_version'),
		curVersion = helpers.currentVersion;

	if (version != curVersion) {
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

// this makes sure that users don't trigger a 'view' when they see the image themselves.
chrome.webRequest.onBeforeRequest.addListener(function (info) {
	const hash = helpers.getParameterByName('hash', info.url);
	if (window.user && window.user.verified && hash != null && window.hashes && window.hashes.indexOf(hash) != -1) {
		return {
			redirectUrl: replacementPixelUrl
		};
	}
}, {
	urls: blockingUrls
}, ['blocking']);

/**
 * message passing receiver
 * this should take care of things like dynamically adding hashes to our whitelist
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	if (request.action === 'add_hash') {
		log('received hash', request.hash);

		// it is important to have the latest settings before we add the hash to local.
		refreshSettingsFromStorage().then(function () {
			let hashes = window.hashes ? window.hashes : [];

			// if we don't have the hash already, add it
			// this may happen in case of same messages being pushed from within other places of the extension
			if (hashes.indexOf(request.hash) === -1)
				hashes.push(request.hash);

			log('added hash', request.hash);

			// this step may not be needed, because as soon as we set the new hashes in the storage
			// refreshSettingsFromStorage  will be called because of the event handler of onChanged
			window.hashes = hashes;
			helpers.storage.set('hashes', hashes).then(function () {
				log('storage updated', request.hash);
				sendResponse({ 'action': 'done' });
				log('response sent');
			});
		});
	}
	else if(request.action === 'login_successful'){
		log('login_successful', request.token);

		fetch(env.baseUrl + 'me',{
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + request.token
			}
		}).then(response=>response.json()).then((response)=>{
			try{

				const user = {
					email: response.user.email,
					verified: true,
					apiToken: response.user.api_token,
					channel: response.user.channel,
					timezone: response.user.timezone
				},
				settings = {
					tracking: true,
					notifications: true,
					debug: true
				};

				helpers.storage.set('user', user);
				helpers.storage.set('settings', settings);
				sendResponse({response:'logged_in'});
			}
			catch(err){
				log(err);
			}
		});
	}
	else if(request.action === 'login_failed'){
		log('login_failed','removing user details from storage');
		helpers.storage.set('user',{
			email: '',
			verified: false,
			apiToken: '',
			channel: '',
			timezone: ''
		});
	}

	// when we send return true, the content script waits for the sendResponse() function
	// i.e. calls it asynchronously
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

	// add contextual data for sentry
	if (window.user && window.user.email) {
		Sentry.setTag('userEmail', window.user.email);
	}
	if (window.settings) {
		Sentry.setTag('settings', JSON.stringify(window.settings));
	}

	if (user && user.verified && user.channel && settings && settings.notifications) {
		notifManager.init(user.apiToken);
	}
	else {
		notifManager.disconnect();
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

/**
 * Helper log function
 */
function log () {
	if (window.settings && window.settings.debug)
		console.log('zmt', JSON.stringify(Array.from(arguments)));
	Sentry.addBreadcrumb({
		category: 'log',
		message: JSON.stringify(Array.from(arguments)),
		level: Sentry.Severity.Info
	});
}
