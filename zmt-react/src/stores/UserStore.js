import {observable,action} from "mobx";

class UserStore{
    constructor(){
        this.user={
            email:undefined,
            verified:false,
            apiToken:'',
            channel:'',
            timezone:''
        };
    }
    @observable user;

    @action
    setUserEmail(email){
        this.user.email=email;
    }

    @action
    setUserVerified(status){
        this.user.verified=status;
    }

    @action
    setUserApiToken(token){
        this.user.apiToken=token;
    }

    @action
    setChannel(channelName){
        this.user.channel=channelName;
    }

    @action
    setTimezone(timezone){
        this.user.timezone=timezone;
    }

}
export default new UserStore();
