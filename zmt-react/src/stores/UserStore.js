import {observable,action} from "mobx";

class UserStore{
    constructor(){
        this.user={
            email:undefined,
            verified:false
        };
    }
    @observable user;
    @observable a;

    @action
    setUserEmail(email){
        this.user.email=email;
    }
}
export default new UserStore();
