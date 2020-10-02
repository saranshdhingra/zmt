import React, {Component} from 'react';
import logo from '../images/logo128.png';
import './Header.css';

export default class Header extends Component{
    render(){
        return (
            <header className='col-12 d-flex justify-content-start'>
                <div className={'wrapper p-4'}>
                    <div id='logo'>
                        <a href='' >
                            <img src={logo} alt='ZMT Logo' /> Zoho Mail Tracker
                        </a>
                    </div>
                </div>
            </header>
        );
    }
}
