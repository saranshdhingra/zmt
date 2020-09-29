import LocalStorageDriver from './drivers/LocalStorageDriver';


class StorageService {
    constructor () {
        this.driver = LocalStorageDriver;
    }

    set (key, val) {
        return this.driver.set(key, JSON.stringify(val));
    }

    async get (key) {
        let data = await this.driver.get(key);
        return data ? JSON.parse(data) : data;
    }

    remove (key) {
        return this.driver.remove(key);
    }

    has (key) {
        return this.driver.has(key);
    }
}

export default new StorageService();
