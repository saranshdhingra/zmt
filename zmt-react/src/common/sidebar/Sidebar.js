import React, {Component} from 'react';
import SidebarContainer from "./SidebarContainer";

export default class Sidebar extends Component {
    constructor (props) {
        super(props);
        this.state = {
            open:true
        };
    }

    toggleSidebar () {
        const status = this.state.open;
        this.setState({open:!status});
    }

    render () {
        return (
            <SidebarContainer openStatus={this.state.open} toggleSidebar={this.toggleSidebar.bind(this)} />
        );
    }
}
