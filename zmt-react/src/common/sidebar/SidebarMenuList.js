import React, { Component } from 'react';
import './SidebarMenuList.scss';
import UserStore from '../../stores/UserStore';
import StorageService from '../../services/StorageService';
import UiStore from '../../stores/UiStore';
import { observer } from 'mobx-react';
import { faChartLine, faCog, faEnvelopeOpen, faQuestionCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

@observer
class SidebarMenuList extends Component {
    constructor (props) {
        super(props);
        this.userStore = UserStore;
        this.uiStore = UiStore;
        this.logoutHandler = this.logoutHandler.bind(this);
        this.changePage = this.changePage.bind(this);
    }
    getClasses () {
        return this.props.openStatus ? 'sidebarMenuList sidebarOpen' : 'sidebarMenuList';
    }

    async logoutHandler (e) {
        e.preventDefault();
        await StorageService.remove('user');
        this.userStore.logoutUser();
    }

    changePage (e) {
        e.preventDefault();
        const page = e.target.getAttribute('data-page');

        this.uiStore.setOpenPage(page);
    }

    getDashboardLink () {
        return this.userStore.user.apiToken.length ? `https://zohomailtracker.com/web-login?api_token=${this.userStore.user.apiToken}` : '#';
    }

    getListItems () {
        const items = [
            {
                text: 'Dashboard',
                link: this.getDashboardLink(),
                external: true,
                icon: faChartLine,
                visible: this.userStore.user.verified
            },
            {
                text: 'Settings',
                link: 'settings',
                click: this.changePage,
                icon: faCog,
                visible: true
            },
            {
                text: 'FAQ',
                link: 'faq',
                click: this.changePage,
                icon: faQuestionCircle,
                visible: true
            },
            {
                text: 'Contact',
                link: 'contact',
                click: this.changePage,
                icon: faEnvelopeOpen,
                visible: true
            },
            {
                text: 'Logout',
                link: 'logout',
                click: this.logoutHandler,
                icon: faSignOutAlt,
                visible: this.userStore.user.verified
            }
        ];

        return items.map((item, index) => {
            return item.visible ? (
                    <li
                      className={`sidebarMenuItem ${item.link === UiStore.openPage ? 'selected' : ''}`}
                      key={index}
                    >
                        <a
                          href={item.link}
                          onClick={item.click ? item.click : undefined}
                          data-page={item.link}
                          target={item.external ? '_blank' : null}
                        >
                            {
                                item.icon && <FontAwesomeIcon icon={item.icon} className={'icon'} />
                            }
                            {item.text}
                        </a>
                    </li>
            ) : null;
        });
    }

    render () {
        return (
            <nav className={this.getClasses()}>
                {this.getListItems()}
            </nav>
        );
    }
}

export default SidebarMenuList;
