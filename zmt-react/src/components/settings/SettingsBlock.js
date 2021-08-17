import React from 'react';
import Checkbox from '../../common/checkbox/Checkbox';


class SettingsBlock extends React.Component {
    constructor (props) {
        super(props);
        this.state = {};
    }

    getCheckboxSetting () {
        return (
            <div className='settingsBlock d-flex justify-content-between'>
                <label>{this.props.label}</label>
                <Checkbox
                  checked={this.props.value}
                  changed={this.props.changed}
                />
            </div>
        );
    }

    render () {
        return (
            this.getCheckboxSetting()
        );
    }
}

export default SettingsBlock;
