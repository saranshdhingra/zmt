import React from 'react';
import './ContactForm.scss';
import RadioBtnGroup from '../../common/radio-button/RadioBtnGroup';
import ContactService from '../../services/ContactService';
import { faExclamationTriangle, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { validate } from 'validate.js';
import Swal from 'sweetalert2';
import { observer } from 'mobx-react';
import UserStore from '../../stores/UserStore';
import BrowserService from '../../services/BrowserService';

const DEFAULT_MSG_TYPE = 'Feedback';

@observer
class ContactForm extends React.Component {
    constructor (props) {
        super(props);
        this.nameRef = React.createRef();
        this.emailRef = React.createRef();
        this.msgRef = React.createRef();

        this.state = {
            type: DEFAULT_MSG_TYPE,
            sendingReq: false,
            errors: {}
        };

        this.typeChanged = this.typeChanged.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
    }

    getInitialEmail () {
        return UserStore.user.verified ? UserStore.user.email : '';
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

    getErrorComponent (error) {
        return (
            <span className={'error'} title={error}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
            </span>
        );
    }

    getFormFields () {
        return {
            name: this.nameRef.current.value,
            email: this.emailRef.current.value,
            type: this.state.type,
            message: this.msgRef.current.value,
            version: BrowserService.getCurrentVersion()
        };
    }

    clearInputs () {
        this.nameRef.current.value = '';
        this.emailRef.current.value = '';
        this.msgRef.current.value = '';
    }

    validateForm () {
        const rules = {
            name: {
                presence: true,
                length: { minimum: 4 }
            },
            email: {
                presence: true,
                email: true
            },
            type: {
                presence: true,
                inclusion: this.getMessageTypes().map((type) => type.label)
            },
            message: {
                presence: true,
                length: { minimum: 4 }
            }
        },
        result = validate(this.getFormFields(), rules);

        // no errors means result iis undefined
        if (result !== undefined) {
            this.setState({ errors: result });
        }
        else {
            this.setState({ errors: {} });
        }
        return result;
    }

    async formSubmit (e) {
        e.preventDefault();

        // front end validation
        if (this.validateForm() !== undefined) {
            return;
        }
        const data = this.getFormFields();

        try {
            this.setState({ sendingReq: true });
            const response = await ContactService.sendContactRequest(data);
            await Swal.fire('Success', response.msg, 'success');
            this.clearInputs();
        }
        catch (err) {
            console.log(err);
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
                    <div className={'inputContainer'}>
                        <input
                          type={'text'}
                          className={'form-control'}
                          id={'contactName'}
                          placeholder={'Your name'}
                          ref={this.nameRef}
                        />
                    </div>
                    {
                        this.state.errors.name && this.getErrorComponent(this.state.errors.name[0])
                    }
                </div>
                <div className={'form-group d-flex align-items-center'}>
                    <label htmlFor='contactEmail'>Your email ( <em>Promise we won't spam!</em> )</label>
                    <div className={'inputContainer'}>
                        <input
                          type={'email'}
                          className={'form-control'}
                          id={'contactEmail'}
                          placeholder={'Your email'}
                          ref={this.emailRef}
                          defaultValue={this.getInitialEmail()}
                          disabled={!!this.getInitialEmail().length}
                        />
                    </div>
                    {
                        this.state.errors.email && this.getErrorComponent(this.state.errors.email[0])
                    }
                </div>
                <div className={'form-group d-flex align-items-center'}>
                    <label>This message is a:</label>
                    <RadioBtnGroup
                      classes={'inputContainer'}
                      options={this.getMessageTypes()}
                      name={'msgType'}
                      selected={this.state.type}
                      change={this.typeChanged}
                    />
                    {
                        this.state.errors.type && this.getErrorComponent(this.state.errors.type[0])
                    }
                </div>
                <div className={'form-group d-flex align-items-start'}>
                    <label htmlFor='contactMsg'>Tell us what you think:</label>
                    <div className={'inputContainer'}>
                        <textarea id={'contactMsg'} placeholder={'Your message'} className={'form-control'} ref={this.msgRef} />
                    </div>
                    {
                        this.state.errors.message && this.getErrorComponent(this.state.errors.message[0])
                    }
                </div>
                <div className={'form-group btnRow'}>
                    <button className={'btn btn-color-primary'} onClick={this.formSubmit} disabled={this.state.sendingReq}>
                        <FontAwesomeIcon icon={faPaperPlane} />
                        Submit
                    </button>
                </div>
            </div>
        );
    }
}

export default ContactForm;
