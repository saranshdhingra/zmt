import React, {Component} from 'react';
import SidebarBtnPart from "./SidebarBtnPart";
import './SidebarBtn.css';

export default class SidebarBtn extends Component {
    getClasses () {
        return this.props.openStatus ? 'sidebarBtnContainer open' : 'sidebarBtnContainer';
    }

    render () {
        return (
            <div className={this.getClasses()} onClick={()=>{this.props.click();}}>
                <div className='sidebarBtn'>
                    <SidebarBtnPart cls="type-1" />
                    <SidebarBtnPart cls="type-1" />
                    <SidebarBtnPart cls="type-1" />
                    <SidebarBtnPart cls="type-2" />
                </div>
            </div>
        );
    }
}
