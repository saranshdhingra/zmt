import React from 'react';
import axios from 'axios';
import {observer} from "mobx-react";
import UserStore from "../../stores/UserStore";
import AuthService from "../../services/AuthService";

@observer
class LoginComponent extends React.Component {

    constructor(props) {
        super(props);
        this.store=UserStore;
        this.authService=AuthService;
    }

    state={
        currentEmail:'',
        loggingIn:false,
        currentOtp:'',
        verifying:false
    }

    _handleKeyDown(e){
        if (e.key === 'Enter') {
            this.login();
        }
    }

    async login(){
        if(this.state.loggingIn){
            return;
        }
        this.setState({loggingIn:true});
        try{
            await this.authService.login(this.state.currentEmail);
        }
        finally{
            this.setState({loggingIn:false});
        }
    }

    async verify(){
        if(this.state.verifying){
            return;
        }
        this.setState({verifying:true});
        try{
            await this.authService.verify(this.state.currentEmail,this.state.currentOtp);
        }
        finally{
            this.setState({verifying:false});
        }
    }

    getOtpComponent(){
        if(this.store.user.email!==undefined && !this.store.user.verified){
           return (
               <div className='form-group'>
                    <label htmlFor='inputOtp'>Enter the Otp:</label>
                    <input
                        type='text'
                        id='inputOtp'
                        className='form-control'
                        onChange={(e) => {
                            this.setState({currentOtp: e.target.value})
                        }}
                        value={this.state.currentOtp}
                        onKeyDown={this._handleKeyDown.bind(this)}
                    />
                    <button
                        disabled={this.state.verifying ? true : null}
                        onClick={this.verify.bind(this)}
                    >
                        Login
                    </button>
               </div>
           );
        }
        return null;
    }

    render() {
        return (
            <div>
                <div className='form-group'>
                    <label htmlFor='inputEmail'>Enter the email:</label>
                    <input
                        type='email'
                        id='inputEmail'
                        className='form-control'
                        onChange={(e)=>{this.setState({currentEmail:e.target.value})}}
                        value={this.state.currentEmail}
                        onKeyDown={this._handleKeyDown.bind(this)}
                    />
                    <button
                        disabled={this.state.loggingIn ? true : null}
                        onClick={this.login.bind(this)}
                    >
                        Login
                    </button>
                </div>
                {this.getOtpComponent()}
            </div>
        );
    }
}

export default LoginComponent;
