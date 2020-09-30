import React, { Component } from 'react';
import './SidebarMenuList.css';
import UserStore from '../../stores/UserStore';
import StorageService from '../../services/StorageService';
import UiStore from '../../stores/UiStore';

export default class SidebarMenuList extends Component {
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
        const page = e.target.getAttribute('data-key');

        this.uiStore.setOpenPage(page);
    }

    getListItems () {
        const items = [
            {
                text: 'Settings',
                link: 'settings',
                click: this.changePage
            },
            {
                text: 'FAQ',
                link: 'faq',
                click: this.changePage
            },
            {
                text: 'Contact',
                link: 'contact',
                click: this.changePage
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
                        <a href={item.link} onClick={item.click ? item.click : undefined} data-key={item.link}>{item.text}</a>
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
