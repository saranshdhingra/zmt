import React from 'react';
import './RadioBtn.scss';

class RadioBtn extends React.Component {

    render () {
        return (
            <div className={'radioBtn'}>
                <label>
                    <input
                      type={'radio'}
                      checked={this.props.checked}
                      name={this.props.name}
                      value={this.props.value || this.props.text}
                      onChange={(e) => { this.props.change(e.target.value); }}
                    />
                    <span>{this.props.text}</span>
                </label>
            </div>
        );
    }
}

export default RadioBtn;
