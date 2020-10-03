import React from 'react';
import './Contact.scss';
import ContactForm from '../components/contact/ContactForm';
import { faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class Contact extends React.Component {
    render () {
        return (
            <div className='col-12 tabContent'>
                <div className={'row justify-content-between'}>
                    <div className={'contactSection settingsLeft col-12'}>
                        <div className={'row'}>
                            <h3 className={'pageTitle col-12'}>
                                <FontAwesomeIcon icon={faEnvelopeOpen} className={'icon'} />
                                Want to say something?
                            </h3>
                            <ContactForm classes={'col-12'} name={'123'} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Contact;
