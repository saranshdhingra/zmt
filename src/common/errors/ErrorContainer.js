import React from 'react';
import ErrorBox from "./ErrorBox";
import './ErrorsContainer.scss';

class ErrorContainer extends React.Component {
    getErrors(){
        return this.props.errors.map((err,key)=>{
            return (
                <ErrorBox msg={err} type={'error'} key={key} closeErrorBox={()=>{this.props.closeErrorBox(key)}} />
            );
        });
    }
    render() {
        if(!this.props.errors.length)
            return null;

        return (
            <div id='errorsContainer'>
                {this.getErrors()}
            </div>
        );
    }
}

export default ErrorContainer;
