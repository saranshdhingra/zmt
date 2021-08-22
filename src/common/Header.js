import React, { Component } from 'react';
import logo from '../images/logo.png';
import './Header.css';

export default class Header extends Component {
    render () {
        return (
            <header className='col-12 d-flex justify-content-start'>
                <div className={'wrapper'}>
                    <div id='logo'>
                        <a href='/' >
                            <img src={logo} alt='ZMT Logo' />
                        </a>
                    </div>
                </div>
            </header>
        );
    }
}
