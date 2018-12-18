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
	var hash = getParameterByName("hash", info.url);
	if (window.zmt_settings && window.zmt_settings.hashes && window.zmt_settings.hashes.indexOf(hash) != -1) {
		return {
			redirectUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
		};
	}
}, {
	urls: ["*://zohomailtracker.com/api/v2/img/show*"]
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

//function that gets a parameter value by name from a query string
//credits: http://stackoverflow.com/a/901144/3209283
function getParameterByName(name, url) {
	if (!url) {
		url = window.location.href;
	}
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//function that simply gets the settings and stores them
function refresh_settings(callback) {
	chrome.storage.local.get("zmt_settings", function (result) {
		if (result.zmt_settings !== undefined) {
			window.zmt_settings = JSON.parse(result.zmt_settings);
		}

		if(callback!==undefined)
			callback();
	});
}