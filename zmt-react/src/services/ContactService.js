import axios from 'axios';

class ContactService {
    async sendContactRequest (data) {
        const response = await axios.post('/contact',
            data
        );
        return response.data;
    }

}

export default new ContactService();
