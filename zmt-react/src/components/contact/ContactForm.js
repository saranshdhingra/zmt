import React from 'react';
import './ContactForm.scss';
import RadioBtnGroup from '../../common/radio-button/RadioBtnGroup';
import ContactService from '../../services/ContactService';

class ContactForm extends React.Component {
    constructor (props) {
        super(props);
        this.nameRef = React.createRef();
        this.emailRef = React.createRef();
        this.msgRef = React.createRef();

        this.state = {
            type: 'Feedback',
            sendingReq: false
        };

        this.typeChanged = this.typeChanged.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
    }

    getMessageTypes () {
        return [
            {
                label: 'Feedback',
                value: 'Feedback',
                checked: true
            },
            {
                label: 'Bug',
                value: 'Bug'
            },
            {
                label: 'Feature Request',
                value: 'Feature Request'
            }
        ];
    }

    typeChanged (type) {
        this.setState({ type: type });
    }

    async formSubmit (e) {
        e.preventDefault();
        const data = {
            name: this.nameRef.current.value,
            email: this.emailRef.current.value,
            type: this.state.type,
            msg: this.msgRef.current.value
        };
        try {
            this.setState({ sendingReq: true });
            await ContactService.sendContactRequest(data);
        }
        catch (err) {

        }
        finally {
            this.setState({ sendingReq: false });
        }
    }

    render () {
        return (
            <div className={`contactForm ${this.props.classes}`}>
                <div className={'form-group d-flex align-items-center'}>
                    <label htmlFor='contactName'>What should we call you?</label>
                    <input
                      type={'text'}
                      className={'form-control'}
                      id={'contactName'}
                      placeholder={'Your name'}
                      ref={this.nameRef}
                    />
                </div>
                <div className={'form-group d-flex align-items-center'}>
                    <label htmlFor='contactEmail'>Your email(<em>Promise we won't spam!</em>):</label>
                    <input
                      type={'email'}
                      className={'form-control'}
                      id={'contactEmail'}
                      placeholder={'Your email'}
                      ref={this.emailRef}
                      defaultValue={'123'}
                    />
                </div>
                <div className={'form-group d-flex align-items-center'}>
                    <label>This message is a:</label>
                    <RadioBtnGroup
                      options={this.getMessageTypes()}
                      name={'msgType'}
                      selected={this.state.type}
                      change={this.typeChanged}
                    />
                </div>
                <div className={'form-group d-flex align-items-start'}>
                    <label htmlFor='contactMsg'>Tell us what you thin:</label>
                    <textarea id={'contactMsg'} placeholder={'Your message'} className={'form-control'} ref={this.msgRef} defaultValue={'234'} />
                </div>
                <div className={'form-group btnRow'}>
                    <button className={'btn btn-color-primary'} onClick={this.formSubmit} disabled={this.state.sendingReq}>Submit</button>
                </div>
            </div>
        );
    }
}

export default ContactForm;
