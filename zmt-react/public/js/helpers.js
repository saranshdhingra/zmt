// this file will only contain helper functions or some static data


class ChromeStorageDriver {
	/**
	 * Func that sets the chrome.storage.local val for the given key
	 * @param key
	 * @param val
	 * @returns {Promise<unknown>}
	 */
	async set (key, val) {
		return new Promise((resolve) => {
			let data = {};
			data[key] = val;
			chrome.storage.local.set(data, () => {
				resolve();
			});
		});
	}

	/**
	 * Func to get item from chrome.storage.local by key
	 * @param key
	 * @returns {Promise<unknown>}
	 */
	async get (key) {
		return new Promise((resolve) => {
			chrome.storage.local.get(key, (result) => {
				resolve(result[key]);
			});
		});
	}

	/**
	 * Func that removes an item from chrome.storage.local by key
	 * @param key
	 * @returns {Promise<unknown>}
	 */
	async remove (key) {
		return new Promise((resolve) => {
			chrome.storage.local.remove(key, () => {
				resolve();
			});
		});
	}

	/**
	 * Func checks if a key exists in the chrome.storage.local
	 * @param key
	 * @returns {Promise<boolean>}
	 */
	async has (key) {
		const obj = await this.get(key);
		return obj[key] !== undefined;
	}
}

class StorageService {
	constructor () {
		this.driver = new ChromeStorageDriver();
	}

	set (key, val) {
		return this.driver.set(key, val);
	}

	async get (key) {
		return await this.driver.get(key);
	}

	remove (key) {
		return this.driver.remove(key);
	}

	has (key) {
		return this.driver.has(key);
	}
}


var helpers = {
	// function that gets a parameter value by name from a query string
	// credits: http://stackoverflow.com/a/901144/3209283
	getParameterByName: function (name, url) {
		if (!url) {
			url = window.location.href;
		}
		name = name.replace(/[\[\]]/g, '\\$&');
		var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	},

	is_email_valid: function (email) {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	},

	extractEmailsFromText: function (text) {
		try {
			return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
		}
		catch (err) {
			return 'N/A';
		}
	},

	currentVersion: chrome.runtime.getManifest().version,

	storage: new StorageService()
};
