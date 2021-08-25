import React, { Component } from 'react';
import Main from './containers/Main';
import Sidebar from './common/sidebar/Sidebar';
import AppLoader from './components/AppLoader';
import StorageService from './services/StorageService';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import UserStore from './stores/UserStore';
import SettingsStore from './stores/SettingsStore';

const theme = createTheme({
    palette: {
      primary: {
        light: '#b989f1',
        main: '#9068be',
        dark: '#764ea5',
        contrastText: '#fff',
      },
      secondary: {
        light: '#8cf5f1',
        main: '#6ed3cf',
        dark: '#529492',
        contrastText: '#000',
      },
    },
});

class App extends Component {
    constructor(props){
        super(props);
        this.state={
            loading: true
        };

        StorageService.driver.onChanged(async function(){
            const user = await StorageService.get('user'),
                settings = await StorageService.get('settings');

            UserStore.setUserDetails(user);
            SettingsStore.setSettings(settings);
        });
    }

    setLoadingState (status) {
        this.setState({ loading: status });
    }

    render () {
        if (this.state.loading) {
            return (
                <ThemeProvider theme={theme}>
                    <AppLoader onLoaded={() => { this.setLoadingState(false); }} />
                </ThemeProvider>
            );
        }

        return (
            <ThemeProvider theme={theme}>
                <div className='App d-flex'>
                    <Sidebar />
                    <Main />
                </div>
            </ThemeProvider>
        );
    }
}

export default App;
