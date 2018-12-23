//when extension is loaded
chrome.runtime.onInstalled.addListener(function () {
	refresh_settings();
	//check if user has seen the changelog
	chrome.storage.local.get("last_seen_version", function (result) {
		var version = result['last_seen_version'],
			cur_version = chrome.app.getDetails().version;

		//don't show anything if last seen version is same as current version
		if (version != cur_version) {
			chrome.browserAction.setBadgeText({
				text: 'NEW'
			});
			
		}
	});
});

//open options page on Icon click
chrome.browserAction.onClicked.addListener(function (tab) {
	chrome.tabs.create({
		url: "options.html"
	});
});

//this makes sure that users don't trigger a 'view' when they see the image themeselves.
chrome.webRequest.onBeforeRequest.addListener(function (info) {
	var hash = helpers.getParameterByName("hash", info.url);
	if (window.zmt_settings && window.zmt_settings.hashes && window.zmt_settings.hashes.indexOf(hash) != -1) {
		return {
			redirectUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
		};
	}
}, {
	urls: ["*://zmt.abc/api/v2/img/show*"]
}, ["blocking"]);

//message passing receiver
//this should take care of things like dynamically adding hashes to our whitelist
//need to refresh zmt_settings here
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	//it is important to refresh the settings before we add the hash to local.
	refresh_settings(function(){
		//add_hash is recieved when a new hash is supposed to be added in our whitelist
		if (request.action == "add_hash") {
			let hash = request.hash;
			hashes = zmt_settings.hashes === undefined ? [] : zmt_settings.hashes;
			if (hashes.indexOf(hash) == -1)
				hashes.push(request.hash);
			zmt_settings.hashes = hashes;
			chrome.storage.local.set({
				zmt_settings: JSON.stringify(zmt_settings)
			}, function () {
				sendResponse({});
			});
		}
		// else if (request.action == "settings_changed") {
		// 	refresh_settings();
		// 	sendResponse({});
		// }
	});
});



//pubnub
var pubnub = new PubNub({
	subscribeKey: env.pubnub.subscribeKey,
	ssl: true
});


//function that simply gets the settings and stores them
function refresh_settings(callback) {
	chrome.storage.local.get("zmt_settings", function (result) {
		if (result.zmt_settings !== undefined) {
			window.zmt_settings = JSON.parse(result.zmt_settings);
			if(zmt_settings.user!==undefined && zmt_settings.user.verified && zmt_settings.user.channel!==undefined && pubnub!==undefined){
				pubnub.subscribe({
					channels: ['global',zmt_settings.user.channel],
				});
			}
		}

		if(callback!==undefined)
			callback();
	});
}


//whenever the storage is changed,
//we make sure to refresh it here
chrome.storage.onChanged.addListener(function (changes, namespace) {
	if(Object.keys(changes).indexOf("zmt_settings")!=-1){
		refresh_settings();
	}
});


pubnub.addListener({
	status: function (statusEvent) {
		console.log("status", statusEvent);
		// if (statusEvent.category === "PNConnectedCategory") {
		// 	var payload = {
		// 		my: 'payload'
		// 	};
		// 	pubnub.publish({
		// 			message: payload
		// 		},
		// 		function (status) {
		// 			// handle publish response
		// 		}
		// 	);
		// }
	},
	message: function (message) {
		// handle message
		try{
			let type=message.message.type;
			if(type=="emailView"){
				chrome.notifications.create(`zmt_email_${message.message.id}`,{
					type:'basic',
					title:'Someone viewed an email!',
					message: `Subject: ${message.message.sub}\nLocation: ${message.message.location}`,
					iconUrl: 'images/icon_notif.png'
				},function(notifId){
					let arr=notifId.split("_"),
						emailId=arr[arr.length-1];
					//open the options page with the email of the above id loaded!
					chrome.tabs.create({
						url: `options.html?email=${emailId}`
					});
				});
			}
		}
		catch(err){
			console.log(err);
		}
	},
	presence: function (presenceEvent) {
		// handle presence
		console.log("presence", presence);
	}
});