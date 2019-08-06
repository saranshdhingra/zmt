class PubNubManager{
	constructor(){
		this.pubnub=false;
		this.channelName=false;
	}

	initPubnub(){
		if(this.pubnub===false){
			console.log("initializing pubnub");
			this.pubnub = new PubNub({
				subscribeKey: env.pubnub.subscribeKey,
				ssl: true
			});

			this.pubnub.addListener({
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
							});
						}
						else if(type=="contact"){
							chrome.notifications.create(`zmt_contact_${(new Date()).getMilliseconds()}`, {
								type: 'basic',
								title: 'Someone sent a contact entry!',
								message: `Type:${message.message.contactType}\nEmail:${message.message.email}`,
								iconUrl: 'images/icon_notif.png'
							});
						}
						else if(type=="global"){
							chrome.notifications.create(`zmt_global_${(new Date()).getMilliseconds()}`, {
								type: 'basic',
								title: message.message.title,
								message: message.message.body,
								iconUrl: 'images/icon_notif.png'
							});
						}
					}
					catch(err){
					}
				}
			});
		}
	}

	attachChannel(name){
		//no need to resubscribe
		if(this.pubnub!==false && name!==false && this.channelName!=name){
			this.pubnub.subscribe({
				// channels: [zmt_settings.user.channel],
				channels: [name]
			});
			this.channelName=name;
		}
	}

	detachChannel(){
		if(this.pubnub!==false && this.channelName!==false){
			this.pubnub.unsubscribe({
				channels:[this.channelName]
			});
			this.channelName=false;
		}
	}
}

var pubnubManager=new PubNubManager();
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

	chrome.storage.local.set({"last_updated_time":(new Date()).toString()});
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
			redirectUrl: "https://zohomailtracker.com/images/onepix.gif"
		};
	}
}, {
	urls: ["*://zohomailtracker.com/api/v2/img/*"]
}, ["blocking"]);

//message passing receiver
//this should take care of things like dynamically adding hashes to our whitelist
//need to refresh zmt_settings here
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	
	if (request.action == "add_hash") {
		//it is important to refresh the settings before we add the hash to local.
		refresh_settings(function(){
			//add_hash is recieved when a new hash is supposed to be added in our whitelist
			let hash = request.hash;
			hashes = zmt_settings.hashes === undefined ? [] : zmt_settings.hashes;
			if (hashes.indexOf(hash) == -1)
				hashes.push(request.hash);
			zmt_settings.hashes = hashes;
			sendResponse({'action':'done'});
			chrome.storage.local.set({
				zmt_settings: JSON.stringify(zmt_settings)
			});
		});
	}
	return true;
});


//function that simply gets the settings and stores them
function refresh_settings(callback) {
	chrome.storage.local.get("zmt_settings", function (result) {
		if (result.zmt_settings !== undefined) {
			window.zmt_settings = JSON.parse(result.zmt_settings);

			if(zmt_settings.user!==undefined && zmt_settings.user.verified && zmt_settings.user.channel!==undefined && zmt_settings.show_notifications){
				pubnubManager.initPubnub();
				pubnubManager.attachChannel(zmt_settings.user.channel);
			}
			else{
				pubnubManager.detachChannel();
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

chrome.notifications.onClicked.addListener(function(notifId){
	let arr = notifId.split("_"),
		type = arr[1],
		emailId = arr[1]=="email"?arr[arr.length - 1]:false;

	//open the options page with the email of the above id loaded!
	if(emailId)
		chrome.tabs.create({
			url: `options.html?email=${emailId}`
		});
});