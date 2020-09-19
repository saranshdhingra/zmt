import {observable,action} from "mobx";

class UserStore{
    constructor(){
        this.user={
            email:undefined,
            verified:false
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
}
export default new UserStore();
