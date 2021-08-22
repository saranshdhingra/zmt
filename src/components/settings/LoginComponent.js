import React from 'react';
import { observer } from 'mobx-react';
import UserStore from '../../stores/UserStore';
import AuthService from '../../services/AuthService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import SettingsStore from '../../stores/SettingsStore';
import { Button, Typography } from '@material-ui/core';

@observer
class LoginComponent extends React.Component {

    constructor (props) {
        super(props);
        this.store = UserStore;
        this.settingsStore = SettingsStore;
        this.authService = AuthService;
    }

    getComponent(){
        if(this.store.user.email===undefined || this.store.user.apiToken===undefined){
            return (
                <a href="https://zohomailtracker.com/oauth/login" className="btn loginBtn" target="_blank" rel="noopener noreferrer">
                    <Button variant="contained" color="primary" startIcon={<FontAwesomeIcon icon={faSignInAlt} />}>
                        Login via Zoho
                    </Button>
                </a>
            );
        }
        else{
            return (
                <>
                <Typography variant="h4">
                    Logged in as <strong>{this.store.user.email}</strong><br />
                </Typography>
                <Button variant="contained" color="primary" startIcon={<FontAwesomeIcon icon={faSignOutAlt} />}>
                    Logout
                </Button>
                </>
            );
        }
    }

    render () {
        return (
            <div className='col-12 tabContent'>
                <div className={'row justify-content-between'}>
                    <div className={'settingsSection settingsLeft col-8 p-4'}>
                        <div className='loginComponent'>
                            {this.getComponent()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginComponent;
