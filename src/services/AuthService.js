import http from '../utils/http';
import UserStore from '../stores/UserStore';

class AuthService {
    constructor () {
        this.store = UserStore;
    }
    async login (email) {
        await http.post('/user/login',
            {
                email: email
            }
        );
        this.store.setUserEmail(email);
    }
    async verify (email, otp) {
        const response = await http.post('/user/verify',
            {
                email: email,
                otp: otp
            }
        );
        const data = response.data;
        this.store.setUserEmail(email);
        this.store.setUserVerified(true);
        this.store.setUserApiToken(data.user.api_token);
        this.store.setChannel(data.user.channel);
        this.store.setTimezone(data.user.timezone);
    }
}

export default new AuthService();
