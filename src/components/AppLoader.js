import React from 'react';
import './AppLoader.css';
import UserStore from '../stores/UserStore';
import SettingsStore from '../stores/SettingsStore';
import StorageService from '../services/StorageService';

class AppLoader extends React.Component {
    constructor (props) {
        super(props);
        this.state = {};
    }

    // fetches persistent data from localstorage
    async fetchSavedData () {
        UserStore.setUserDetails(await StorageService.get('user'));
        SettingsStore.setSettings(await StorageService.get('settings'));
        this.props.onLoaded();
    }

    componentDidMount () {
        this.fetchSavedData();
    }

    render () {
        return (
            <div id='appLoader'>
                Loading...
            </div>
        );
    }
}

export default AppLoader;
