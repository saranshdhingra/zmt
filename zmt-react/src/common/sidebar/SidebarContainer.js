import React, {Component} from 'react';
import SidebarMenuList from "./SidebarMenuList";
import './SidebarContainer.scss';
import SidebarBtn from "./SidebarBtn";
import UserStore from "../../stores/UserStore";
// import Aux from "../general/Aux";

export default class SidebarContainer extends Component {
    constructor(props) {
        super(props);
        this.store=UserStore;
    }

    getClasses () {
        return this.props.openStatus ? 'sidebarContainer open' : 'sidebarContainer';
    }

    render () {
        return (
            <div className={this.getClasses()}>
                <SidebarBtn click={this.props.toggleSidebar} openStatus={this.props.openStatus} />
                {
                    this.store.user.verified && (<div className='sidebarWelcome'>Hey, {this.store.user.email}</div>)
                }
                <SidebarMenuList openStatus={this.props.openStatus} />
            </div>
        );
    }
}
