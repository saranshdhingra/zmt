import React from 'react';
import './AppLoader.css';
import UserStore from "../stores/UserStore";

class AppLoader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.fetchSavedData();
    }

    //fetches persistent data from localstorage
    fetchSavedData(){
        const data={
            user:{
                email:undefined,
                verified:false
            }
        };
        setTimeout(()=>{
            UserStore.setUserEmail(data.user.email);
            UserStore.setUserVerified(data.user.verified);
            this.props.onLoaded();
        },3000);
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
