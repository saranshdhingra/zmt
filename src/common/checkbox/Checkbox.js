import React from 'react';

import './Checkbox.css';
import { getClassesFromObj } from '../../utils/common';

class Checkbox extends React.Component {
    constructor (props) {
        super(props);
    }

    getClasses () {
        const obj = {
            'checkbox': true,
            'd-flex': true,
            'align-items-center': true,
            'checked': this.props.checked
        };

        return getClassesFromObj(obj);
    }

    getCheckboxText () {
        return this.props.checked ? 'On' : 'Off';
    }

    render () {
        return (
            <span className={this.getClasses()}>
                <label>
                    <input
                      type='checkbox'
                      checked={this.props.checked}
                      onChange={this.props.changed}
                    />
                    <span className='thumb'>{this.getCheckboxText()}</span>
                </label>
            </span>
        );
    }
}

export default Checkbox;
