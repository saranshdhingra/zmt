import React, {Component} from 'react';
import SidebarMenuList from "./SidebarMenuList";
import './SidebarContainer.scss';
import SidebarBtn from "./SidebarBtn";
// import Aux from "../general/Aux";

export default class SidebarContainer extends Component {
    getClasses () {
        return this.props.openStatus ? 'sidebarContainer open' : 'sidebarContainer';
    }

    render () {
        return (
            <div className={this.getClasses()}>
                <SidebarBtn click={this.props.toggleSidebar} openStatus={this.props.openStatus} />
                <SidebarMenuList openStatus={this.props.openStatus} />
            </div>
        );
    }
}
