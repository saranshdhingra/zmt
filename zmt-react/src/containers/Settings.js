import React, {Component} from "react";
import LoginComponent from "../components/settings/LoginComponent";
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
        return this.store.user.verified ? (
            <div className={'settingsSection settingsLeft col-4 p-4'}>
                Settings
            </div>
        ) : null;
    }

    render() {
        return (
            <div className='col-12 tabContent'>
                <div className={'row justify-content-between'}>
                    {this.getLeftSection()}
                </div>
            </div>
        );
    }
}

export default Settings;
