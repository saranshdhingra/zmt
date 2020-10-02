import React from 'react';
import RadioBtn from './RadioBtn';

class RadioBtnGroup extends React.Component {
    constructor (props) {
        super(props);
        this.state = {};
    }

    getRadioBtns () {
        return this.props.options.map((obj, index) => {
            return (
                <RadioBtn key={index} checked={this.props.selected === obj.value} text={obj.label} name={this.props.name} value={obj.value} change={this.props.change} />
            );
        });
    }

    render () {
        return (
            <div className={'radioGroup'}>
                {this.getRadioBtns()}
            </div>
        );
    }
}

export default RadioBtnGroup;
