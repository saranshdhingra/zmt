import React, { Component } from 'react';
import './SidebarMenuList.css';
import UserStore from '../../stores/UserStore';
import StorageService from '../../services/StorageService';

export default class SidebarMenuList extends Component {
    constructor (props) {
        super(props);
        this.userStore = UserStore;
        this.logoutHandler = this.logoutHandler.bind(this);
    }
    getClasses () {
        return this.props.openStatus ? 'sidebarMenuList sidebarOpen' : 'sidebarMenuList';
    }

    async logoutHandler (e) {
        e.preventDefault();
        await StorageService.remove('user');
        this.userStore.logoutUser();
    }

    getListItems () {
        const items = [
            {
                text: 'Settings',
                link: 'settings'
            },
            {
                text: 'FAQ',
                link: 'faq'
            },
            {
                text: 'Contact',
                link: 'contact'
            },
            {
                text: 'Logout',
                link: 'logout',
                click: this.logoutHandler
            }
        ];

        return items.map((item, index) => {
            return (
                    <li
                      className='sidebarMenuItem'
                      key={index}
                    >
                        <a href={item.link} onClick={item.click ? item.click : undefined}>{item.text}</a>
                    </li>
            );
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
