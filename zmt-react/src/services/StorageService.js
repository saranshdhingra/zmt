// import LocalStorageDriver from './drivers/LocalStorageDriver';
import ChromeStorageDriver from './drivers/ChromeStorageDriver';
import { isObservableObject, toJS } from 'mobx';


class StorageService {
    constructor () {
        this.driver = ChromeStorageDriver;
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

export default new StorageService();
