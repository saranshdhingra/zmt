class LocalStorageDriver {
    /**
     * Func that sets the localstorage val for the given key
     * @param key
     * @param val
     * @returns {Promise<unknown>}
     */
    async set (key, val) {
        return new Promise((resolve) => {
            localStorage.setItem(key, val);
            resolve();
        });
    }

    /**
     * Func to get item from localstorage by key
     * @param key
     * @returns {Promise<unknown>}
     */
    async get (key) {
        return new Promise((resolve) => {
            let val = localStorage.getItem(key);
            resolve(val);
        });
    }

    /**
     * Func that removes an item from localstorage by key
     * @param key
     * @returns {Promise<unknown>}
     */
    async remove (key) {
        return new Promise((resolve) => {
            localStorage.removeItem(key);
            resolve();
        });
    }

    /**
     * Func checks if a key exists in the localstorage
     * @param key
     * @returns {Promise<boolean>}
     */
    async has (key) {
        return await this.get(key) !== null;
    }
}

export default new LocalStorageDriver();
