import axios from 'axios';

class ContactService {
    async sendContactRequest (data) {

        // try {
            const response = await axios.post('/contact',
                data
            );
            return response.body;

        // }
        // catch (err) {
        //
        // }

    }

}

export default new ContactService();
