/* eslint-disable no-undef */
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

export default new ChromeStorageDriver();
