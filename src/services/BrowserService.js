/* eslint-disable no-undef */
class BrowserService {
    constructor () {
        this.env = process.env.REACT_APP_BROWSER_DRIVER;
    }
    getCurrentVersion () {
        if (this.env === 'local') {
            return '4.0.1';
        }
        else if (this.env === 'chrome') {
            return chrome.runtime.getManifest().version;
        }
    }

    removeBadgeText () {
        if (this.env === 'chrome') {
            chrome.browserAction.setBadgeText({
                text: ''
            });
        }
    }
}

export default new BrowserService();
