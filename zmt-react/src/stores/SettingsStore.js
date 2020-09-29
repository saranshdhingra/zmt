import { observable, action } from 'mobx';

class SettingsStore {
    constructor () {
        this.tracking = false;
        this.notifications = false;
        this.debug = false;
        this.timezone = 'GMT';
    }
    @observable tracking;
    @observable notifications;
    @observable debug;
    @observable timezone;

    @action
    setTracking (status) {
        this.tracking = status;
    }

    @action
    setNotifications (status) {
        this.notifications = status;
    }

    @action
    setDebug (status) {
        this.debug = status;
    }

    @action
    setTimezone (timezone) {
        this.timezone = timezone;
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
