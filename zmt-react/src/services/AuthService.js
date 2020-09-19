import axios from "axios";
import UserStore from "../stores/UserStore";

class AuthService{
    constructor() {
        this.store=UserStore;
    }
    async login(email){
        await axios.post('/user/login',
            {
                email:email
            }
        );
        this.store.setUserEmail(email);
    }
    async verify(email,otp){
        await axios.post('/user/verify',
            {
                email:email,
                otp:otp
            }
        );
        this.store.setUserEmail(email);
        this.store.setUserVerified(true);
    }
}

export default new AuthService();
