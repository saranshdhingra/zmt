import React from 'react';
import { observer } from 'mobx-react';
import UserStore from '../../stores/UserStore';
import AuthService from '../../services/AuthService';
import './LoginComponent.scss';
import { getClassesFromObj } from '../../utils/common';
import StorageService from '../../services/StorageService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSignInAlt, faSync, faTimes } from '@fortawesome/free-solid-svg-icons';
import SettingsStore from '../../stores/SettingsStore';
import Tooltip from '../../common/tooltip/Tooltip';

@observer
class LoginComponent extends React.Component {

    constructor (props) {
        super(props);
        this.store = UserStore;
        this.settingsStore = SettingsStore;
        this.authService = AuthService;
        this.state = {
            currentEmail: this.store.user.email,
            loggingIn: false,
            changeRequested: false,
            currentOtp: '',
            verifying: false
        };
    }

    _handleKeyDown (e) {
        if (e.key === 'Enter') {
            this.login();
        }
    }

    inititateChange () {
        this.setState({ changeRequested: true });
    }

    cancelChange () {
        this.setState({ changeRequested: false });
    }

    getWrapperClasses () {
        const cls = {
            'emailWrapper': true,
            'changing': this.state.changeRequested
        };

        return getClassesFromObj(cls);
    }

    async login () {
        if (this.state.loggingIn) {
            return;
        }
        this.setState({ loggingIn: true });
        try {
            await this.authService.login(this.state.currentEmail);
            StorageService.set('user', this.store.user);
        }
        finally {
            this.setState({ loggingIn: false, changeRequested: false });
        }
    }

    async verify () {
        if (this.state.verifying) {
            return;
        }
        this.setState({ verifying: true });
        try {
            await this.authService.verify(this.state.currentEmail, this.state.currentOtp);

            // log the user in
            StorageService.set('user', this.store.user);

            // when we verify, make sure the initial options are on
            this.settingsStore.setTracking(true);
            this.settingsStore.setNotifications(true);
            this.settingsStore.setDebug(true);
            StorageService.set('settings', this.settingsStore.settings);
        }
        finally {
            this.setState({ verifying: false });
        }
    }

    getLoginBtn () {
        if (!this.store.user.email || this.state.changeRequested) {
            return (
                <button
                  disabled={this.state.loggingIn ? true : null}
                  onClick={this.login.bind(this)}
                  className='btn btn-color-primary'
                >
                    <FontAwesomeIcon icon={faSignInAlt} />
                    Login
                </button>
            );
        }
        else {
             return (
                    <button
                      onClick={this.inititateChange.bind(this)}
                      className='btn btn-color-primary'
                    >
                        <FontAwesomeIcon icon={faSync} />
                        Change
                     </button>);
        }
    }

    getOtpComponent () {
        if (this.store.user.email !== undefined && !this.store.user.verified) {
           return (
               <div className='form-group'>
                    <label htmlFor='inputOtp'>
                        Enter the Verification code 
                        <Tooltip styleType="style-2" style={{fontSize:'.9rem',margin:'0 5px'}} content={(
                            <div>
                                <p>A verification code has been sent to your email which you need to input here.</p>
                                <p>Be sure to check the <strong>Notifications</strong> folder too!</p>
                                <p><em>We need this so that we can verify your ownership to this email.</em></p>
                            </div>
                        )}/>:
                    </label>
                    <input
                      type='text'
                      id='inputOtp'
                      className='form-control'
                      onChange={(e) => {
                            this.setState({ currentOtp: e.target.value });
                        }}
                      value={this.state.currentOtp}
                      onKeyDown={this._handleKeyDown.bind(this)}
                    />
                    <button
                      disabled={this.state.verifying ? true : null}
                      onClick={this.verify.bind(this)}
                      className='btn btn-color-primary'
                    >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Verify
                    </button>
               </div>
           );
        }
        return null;
    }

    render () {
        return (
            <div className='col-12 tabContent'>
                <div className={'row justify-content-between'}>
                    <div className={'settingsSection settingsLeft col-4 p-4'}>
                        <div className='loginComponent'>
                <div className='form-group'>
                    <label htmlFor='inputEmail'>Enter the email:</label>
                    <div className={this.getWrapperClasses()}>
                        <input
                          type='email'
                          id='inputEmail'
                          className='form-control'
                          onChange={(e) => { this.setState({ currentEmail: e.target.value }); }}
                          value={this.state.currentEmail}
                          onKeyDown={this._handleKeyDown.bind(this)}
                          disabled={this.store.user.email && !this.state.changeRequested}
                        />
                        <button onClick={this.cancelChange.bind(this)} className='cancelBtn'>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    {this.getLoginBtn()}
                </div>
                {this.getOtpComponent()}
            </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginComponent;
