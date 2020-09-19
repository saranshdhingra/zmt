import React from 'react';
import axios from 'axios';

class LoginComponent extends React.Component {

    state={
        currentEmail:''
    }

    _handleKeyDown(e){
        if (e.key === 'Enter') {
            this.startLogin();
        }
    }

    startLogin(){
        axios.post('/user/login',
            {
                email:this.state.currentEmail
            }
        ).then((response)=>{
            console.log(response);
        });

    }

    render() {
        return (
            <div className={'form-group'}>
                <label htmlFor='inputEmail'>Enter the email:</label>
                <input
                    type='email'
                    id='inputEmail'
                    className='form-control'
                    onChange={(e)=>{this.setState({currentEmail:e.target.value})}}
                    value={this.state.currentEmail}
                    onKeyDown={this._handleKeyDown.bind(this)}
                />
                <button onClick={this.startLogin.bind(this)}>Login</button>
            </div>
        );
    }
}

export default LoginComponent;
