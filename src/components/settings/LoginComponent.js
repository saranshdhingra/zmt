import React from 'react';
import { observer } from 'mobx-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@material-ui/core';

@observer
class LoginComponent extends React.Component {
    getComponent(){
        return (
            <a href="https://zohomailtracker.com/oauth/login" className="btn loginBtn" target="_blank" rel="noopener noreferrer">
                <Button variant="contained" color="primary" startIcon={<FontAwesomeIcon icon={faSignInAlt} />}>
                    Login via Zoho
                </Button>
            </a>
        );
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
