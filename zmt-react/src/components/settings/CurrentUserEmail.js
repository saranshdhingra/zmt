import React from 'react';
import './CurrentUserEmail.scss';
import UserStore from "../../stores/UserStore";

class CurrentUserEmail extends React.Component {
    constructor(props) {
        super(props);
        this.store=UserStore;
        this.state={
            currentEmail:this.store.user.email,
            emailChangeInitiated:false
        };
    }

    getContainerClasses(){
        return this.state.emailChangeInitiated ? 'emailInner editing':'emailInner';
    }

    getOtpComponent(){
        return !this.store.user.verified ? (
            <div className={'otpRow col-12 p-0'}>
                OTP Required
            </div>
        ) : null;
    }

    getBtnText(){
        return this.state.emailChangeInitiated ? 'Update' : 'Change';
    }

    getDisabledAttr(){
        return !this.state.emailChangeInitiated ? 'disabled' : null;
    }

    toggleEditMode(){
        this.setState(prevState => ({
            emailChangeInitiated: !prevState.emailChangeInitiated
        }));
    }

    render() {
        return (
            <div className={'row'}>
                <label className={'col-12 h4 font-weight-light'}>Change User:</label>
                <div className={'emailContainer col-12 p-0'}>
                    <div className={this.getContainerClasses()}>
                        <button onClick={this.toggleEditMode.bind(this)}>{this.getBtnText()}</button>
                        <input
                            className={'p-2 d-block col-12'}
                            type={'email'}
                            id={'userEmail'}
                            value={this.state.currentEmail}
                            onChange={(e)=>{this.setState({currentEmail:e.target.value})}}
                            disabled={this.getDisabledAttr()}
                        />
                    </div>
                </div>
                {this.getOtpComponent()}
            </div>
        );
    }
}

export default CurrentUserEmail;
