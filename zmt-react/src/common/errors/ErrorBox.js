import React from 'react';
import {getClassesFromObj} from '../../utils/common';

const DESTROY_TIME=3000;
// const ANIMATION_TIME=400;

class ErrorBox extends React.Component {
    state={
        entering:false,
        exiting:false
    }
    getClasses(){
        let cls={
            'errorBox':true,
            'exiting':this.state.exiting
        };

        cls[this.props.type]=true;

        return getClassesFromObj(cls);
    }
    closeError(){
        this.props.closeErrorBox();
    }

    render() {
        return (
            <div className={this.getClasses()}>
                <span className='closeError' onClick={this.closeError.bind(this)}>X</span>
                <span className='msg'>{this.props.msg}</span>
            </div>
        );
    }
}

export default ErrorBox;
