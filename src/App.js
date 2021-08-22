import React, { Component } from 'react';
import Main from './containers/Main';
import Sidebar from './common/sidebar/Sidebar';
import AppLoader from './components/AppLoader';

require('dotenv').config();

class App extends Component {
    state={
        loading: true
    }

    setLoadingState (status) {
        this.setState({ loading: status });
    }

    render () {
        if (this.state.loading) {
            return (
                <AppLoader onLoaded={() => { this.setLoadingState(false); }} />

            );
        }

        return (
            <div className='App d-flex'>
                <Sidebar />
                <Main />
            </div>
        );
    }
}

export default App;
