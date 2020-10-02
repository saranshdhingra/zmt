import React from 'react';
import './Contact.scss';
import ContactForm from '../components/contact/ContactForm';

class Contact extends React.Component {
    render () {
        return (
            <div className='col-12 tabContent'>
                <div className={'row justify-content-between'}>
                    <div className={'contactSection settingsLeft col-12 p-4'}>
                        <div className={'row'}>
                            <h3 className={'col-12'}>Want to say something?</h3>
                            <ContactForm classes={'col-12'} name={'123'} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Contact;
