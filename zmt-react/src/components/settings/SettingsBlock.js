import React from 'react';
import Checkbox from "../../common/checkbox/Checkbox";
import Select from 'react-select';


class SettingsBlock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    getCheckboxSetting(){
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

    getDropdownSelectedOption(){
        if(this.props.value){
            return {value:this.props.value,label:this.props.value};
        }
    }

    getDropdownSetting(){
        const options=this.props.options;
        return (
            <div className='settingsBlock d-flex justify-content-between'>
                <label>{this.props.label}</label>
                <span className='dropdown'>
                    <Select options={options} value={this.getDropdownSelectedOption()} onChange={this.props.changed} />
                </span>
            </div>
        );
    }

    render() {
        return (
            this.props.type==='dropdown' ? this.getDropdownSetting() : this.getCheckboxSetting()
        );
    }
}

export default SettingsBlock;
