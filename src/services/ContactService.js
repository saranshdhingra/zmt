import http from '../utils/http';

class ContactService {
    async sendContactRequest (data) {
        const response = await http.post('/contact',
            data
        );
        return response.data;
    }

}

export default new ContactService();
