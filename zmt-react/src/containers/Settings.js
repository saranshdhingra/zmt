import React, {Component} from "react";
import LoginComponent from "../components/settings/LoginComponent";
import CurrentUserEmail from "../components/settings/CurrentUserEmail";
import './Settings.css';
import UserStore from "../stores/UserStore";
import {observer} from "mobx-react";

@observer
class Settings extends Component{

    constructor(props) {
        super(props);
        this.store=UserStore;
    }

    getLeftSection(){
        return this.store.user.email!==undefined ? (
            <div className={'settingsSection settingsLeft col-4 p-4'}>
                Settings
            </div>
        ) : null;
    }
    getEmailRow(){
        if(this.store.user.email===undefined || !this.store.user.verified){
            return (
                <LoginComponent />
            );
        }
        else{
            return (
                <CurrentUserEmail />
            )
        }
    }
    render() {
        return (
            <div className='col-12 tabContent'>
                <div className={'row justify-content-between'}>
                    {this.getLeftSection()}
                    <div className={'settingsSection settingsRight col-4 p-4'}>
                        {this.getEmailRow()}
                    </div>
                </div>
            </div>
        );
    }
}

export default Settings;
