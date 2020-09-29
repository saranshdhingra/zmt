import Settings from "./Settings";
import React, {Component} from "react";
import Header from "../common/Header";
import './Main.css';
import UserStore from "../stores/UserStore";
import { observer } from "mobx-react";
import LoginComponent from "../components/settings/LoginComponent";

@observer
class Main extends Component{
    constructor(props) {
        super(props);
        this.store=UserStore;
    }

    getMainComponent(){
        if(this.store.user.verified){
            return (
                <Settings user={this.store.user}/>
            );
        }
        else{
            return <LoginComponent />
        }
    }
    render(){
        return (
            <div id='main'>
                <div className={'row'}>
                    <Header />
                    {this.getMainComponent()}
                </div>
            </div>
        );
    }
}
export default Main;
