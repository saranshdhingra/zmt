import LocalStorageDriver from './drivers/LocalStorageDriver';
import ChromeStorageDriver from './drivers/ChromeStorageDriver';
import BrowserService from './BrowserService';


class StorageService {
    constructor () {
        if (BrowserService.env === 'local') {
            this.driver = LocalStorageDriver;
        }
        else if (BrowserService.env === 'chrome') {
            this.driver = ChromeStorageDriver;
        }
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

    clear () {
        return this.driver.clear();
    }
}

export default new StorageService();
