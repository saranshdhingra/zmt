import React, { Component } from 'react';
import './Settings.scss';
import UserStore from '../stores/UserStore';
import SettingsStore from '../stores/SettingsStore';
import { observer } from 'mobx-react';
import SettingsBlock from '../components/settings/SettingsBlock';
import StorageService from '../services/StorageService';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BrowserService from '../services/BrowserService';

@observer
class Settings extends Component {

    constructor (props) {
        super(props);
        this.userStore = UserStore;
        this.settingsStore = SettingsStore;
    }

    trackingChanged (e) {
        this.settingsStore.setTracking(e.target.checked);
        StorageService.set('settings', this.settingsStore.settings);
    }

    notificationsChanged (e) {
        this.settingsStore.setNotifications(e.target.checked);
        StorageService.set('settings', this.settingsStore.settings);
    }

    debugChanged (e) {
        this.settingsStore.setDebug(e.target.checked);
        StorageService.set('settings', this.settingsStore.settings);
    }

    getSettings () {
        const settings = [
            {
                label: 'Tracking',
                value: this.settingsStore.settings.tracking,
                changed: this.trackingChanged.bind(this)
            },
            {
                label: 'Show Notifications',
                value: this.settingsStore.settings.notifications,
                changed: this.notificationsChanged.bind(this)
            },
            {
                label: 'Debug Messages in Console',
                value: this.settingsStore.settings.debug,
                changed: this.debugChanged.bind(this)
            }
        ];

        return settings.map((setting, index) => {
            let props = {
                key: index,
                label: setting.label,
                type: setting.type || undefined,
                classes: setting.classes || undefined,
                options: setting.options || undefined,
                value: setting.value,
                changed: setting.changed
            };
            return (<SettingsBlock {...props} key={index} />);
        });
    }

    async componentDidMount () {
        // update the last_Seen_version, so we remove the 'NEW' text from the extension browser action
        // eslint-disable-next-line no-undef
        await StorageService.set('last_seen_version', BrowserService.getCurrentVersion());
        // eslint-disable-next-line no-undef
        BrowserService.removeBadgeText();
    }

    render () {
        return (
            <div className='col-12 tabContent'>
                <div className={'row justify-content-between'}>
                    <div className={'settingsSection settingsLeft col-12'}>
                        <h3 className={'pageTitle'}>
                            <FontAwesomeIcon icon={faCog} className={'icon'} />
                            Settings
                        </h3>
                        <div className='settingsBox'>
                            {this.getSettings()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Settings;
