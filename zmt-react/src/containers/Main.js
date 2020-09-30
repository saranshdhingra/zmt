import Settings from './Settings';
import React, { Component } from 'react';
import Header from '../common/Header';
import './Main.css';
import UserStore from '../stores/UserStore';
import { observer } from 'mobx-react';
import LoginComponent from '../components/settings/LoginComponent';
import UiStore from '../stores/UiStore';
import Faq from './Faq';

@observer
class Main extends Component {
    constructor (props) {
        super(props);
        this.userStore = UserStore;
        this.uiStore = UiStore;
    }

    getMainComponent () {
        if (this.userStore.user.verified) {
            switch (this.uiStore.openPage) {
                case 'settings':
                    return <Settings user={this.userStore.user} />;
                case 'faq':
                    return <Faq />;
                case 'contact':
                    return 'Contact';
                default:
                    return '404';
            }
        }
        else {
            return <LoginComponent />;
        }
    }
    render () {
        return (
            <div id='main'>
                <div className={'row'}>
                    <Header />
                    {this.getMainComponent()}
                </div>
            </div>
        );
    }
}
export default Main;
