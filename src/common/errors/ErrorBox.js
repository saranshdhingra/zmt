import React from 'react';
import { getClassesFromObj } from '../../utils/common';

// const ANIMATION_TIME=400;

class ErrorBox extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            entering: false,
            exiting: false
        };

        this.closeError = this.closeError.bind(this);
    }

    getClasses () {
        let cls = {
            'errorBox': true,
            'exiting': this.state.exiting
        };

        cls[this.props.type] = true;

        return getClassesFromObj(cls);
    }
    closeError () {
        this.props.closeErrorBox();
    }

    render () {
        return (
            <div className={this.getClasses()}>
                <span className='closeError' onClick={this.closeError}>X</span>
                {/* eslint-disable-next-line react/no-danger */}
                <span className='msg' dangerouslySetInnerHTML={{ __html: this.props.msg }} />
            </div>
        );
    }
}

export default ErrorBox;
