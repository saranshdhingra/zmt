import React, {Component} from 'react';
import './SidebarMenuList.css';

export default class SidebarMenuList extends Component {

    getClasses () {
        return this.props.openStatus ? 'sidebarMenuList sidebarOpen' : 'sidebarMenuList';
    }

    getListItems () {
        const items = [
            {
                text:'Settings',
                link:'settings'
            },
            {
                text:'FAQ',
                link:'faq'
            },
            {
                text:'Contact',
                link:'contact'
            },
            {
                text:'Logout',
                link:'logout'
            }
        ];

        return items.map((item,index) => {
            return <li className='sidebarMenuItem' key={index}><a href={item.link}>{item.text}</a></li>;
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
