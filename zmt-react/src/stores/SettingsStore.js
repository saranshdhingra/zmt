import { observable, action } from 'mobx';

class SettingsStore {
    constructor () {
        this.settings = {
            tracking: false,
            notifications: false,
            debug: false,
            timezone: 'GMT'
        };
    }
    @observable settings;

    @action
    setTracking (status) {
        this.settings.tracking = status;
    }

    @action
    setNotifications (status) {
        this.settings.notifications = status;
    }

    @action
    setDebug (status) {
        this.settings.debug = status;
    }

    @action
    setTimezone (timezone) {
        this.settings.timezone = timezone;
    }

    setSettings (data) {
        if (!data)
            return;
        if (data.tracking !== undefined) {
            this.setTracking(data.tracking);
        }
        if (data.notifications !== undefined) {
            this.setNotifications(data.notifications);
        }
        if (data.debug !== undefined) {
            this.setDebug(data.debug);
        }
        if (data.timezone !== undefined) {
            this.setTimezone(data.timezone);
        }
    }
}
export default new SettingsStore();
