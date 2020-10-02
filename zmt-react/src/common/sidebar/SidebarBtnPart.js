import React, {Component} from 'react';
import './SidebarBtnPart.css';

export default class SidebarBtnPart extends Component{
    getClasses(){
        return `btnPart ${this.props.cls}`;
    }
    render(){
        return (
            <span className={this.getClasses()}>&nbsp;</span>
        )
    }
}
