import {Settings} from "./Settings";
import React, {Component} from "react";
import Header from "../common/Header";
import './Main.css';
import UserStore from "../stores/UserStore";
import { observer } from "mobx-react";

@observer
class Main extends Component{
    constructor(props) {
        super(props);
        this.store=UserStore;
    }
    render(){
        return (
            <div id='main'>
                <div className={'row'}>
                    <Header />
                    <Settings user={this.store.user}/>
                </div>
            </div>
        );
    }
}
export default Main;
