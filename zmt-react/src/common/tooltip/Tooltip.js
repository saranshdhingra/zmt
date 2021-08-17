import React, { Component } from 'react';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons/faQuestionCircle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Tooltip.css';

export default class Tooltip extends Component {
    getClasses () {
        const styleType = this.props.styleType || 'style-1';
        return `customTooltip ${styleType}`;
    }

    getTooltipPosition () {
        return this.props.position || 'right';
    }

    render () {
        const styleObj = this.props.style || {};
        return (
            <span style={styleObj} className={this.getClasses()} data-position={this.getTooltipPosition()}>
                <FontAwesomeIcon icon={faQuestionCircle} />
                <div className='content'>{this.props.content}</div>
            </span>
        );
    }
}
