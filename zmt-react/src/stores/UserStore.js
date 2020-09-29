import { observable, action } from 'mobx';

class UserStore {
    constructor () {
        this.user = {
            email: undefined,
            verified: false,
            apiToken: '',
            channel: '',
            timezone: ''
        };
    }
    @observable user;

    @action
    setUserEmail (email) {
        this.user.email = email;
    }

    @action
    setUserVerified (status) {
        this.user.verified = status;
    }

    @action
    setUserApiToken (token) {
        this.user.apiToken = token;
    }

    @action
    setChannel (channelName) {
        this.user.channel = channelName;
    }

    @action
    setTimezone (timezone) {
        this.user.timezone = timezone;
    }

    setUserDetails (data) {
        if (!data)
            return;
        if (data.email !== undefined) {
            this.setUserEmail(data.email);
        }
        if (data.verified !== undefined) {
            this.setUserVerified(data.verified);
        }
        if (data.token !== undefined) {
            this.setUserApiToken(data.token);
        }
        if (data.channel !== undefined) {
            this.setChannel(data.channel);
        }
        if (data.timezone !== undefined) {
            this.setTimezone(data.timezone);
        }
    }

}
export default new UserStore();
