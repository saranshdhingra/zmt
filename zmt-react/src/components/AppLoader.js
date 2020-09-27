import React from 'react';
import './AppLoader.css';
import UserStore from "../stores/UserStore";
import config from '../config/env';

class AppLoader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    //fetches persistent data from localstorage
    fetchSavedData(){
        const data={
            user:{
                email:config.TEST_EMAIL,
                verified:true,
                apiToken:config.TEST_API_KEY,
                channel:config.TEST_CHANNEL,
                timezone:'Asia/Kolkata',
            }
        };
        setTimeout(()=>{
            UserStore.setUserEmail(data.user.email);
            UserStore.setUserVerified(data.user.verified);
            UserStore.setUserApiToken(data.user.apiToken);
            UserStore.setChannel(data.user.channel);
            UserStore.setTimezone(data.user.timezone);
            this.props.onLoaded();
        },3000);
    }

    componentDidMount() {
        this.fetchSavedData();
    }

    render() {
        return (
            <div id='appLoader'>
                Loading...
            </div>
        );
    }
}

export default AppLoader;
