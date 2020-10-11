import React, { Component } from 'react';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons/faQuestionCircle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Tooltip.css';

export default class Tooltip extends Component {
    getClasses () {
        return `customTooltip style-1`;
    }

    getTooltipPosition () {
        return this.props.position || 'right';
    }

    render () {
        return (

            <span className={this.getClasses()} data-position={this.getTooltipPosition()}>
                <FontAwesomeIcon icon={faQuestionCircle} />
                <div className='content'>{this.props.content}</div>
            </span>
        );
    }
}
