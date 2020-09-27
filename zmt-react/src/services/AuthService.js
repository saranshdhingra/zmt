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
        const response = await axios.post('/user/verify',
            {
                email:email,
                otp:otp
            }
        );
        const data=response.data;
        console.log(data);
        this.store.setUserEmail(email);
        this.store.setUserVerified(true);
        this.store.setUserApiToken(data.user.api_token);
        this.store.setChannel(data.user.channel);
        this.store.setTimezone(data.user.timezone);
    }
}

export default new AuthService();
