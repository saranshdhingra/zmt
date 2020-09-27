import React, {Component} from 'react';
import Main from "./containers/Main";
import Sidebar from "./common/sidebar/Sidebar";
import axios from 'axios';
import _ from 'lodash';
import ErrorContainer from "./common/errors/ErrorContainer";
import AppLoader from "./components/AppLoader";

const DEFAULT_ERR_MSG='There was an error with the request, please try again!';

class App extends Component{
    state={
        errors:[],
        loading:true
    }

    setLoadingState(status){
        this.setState({loading:status});
    }

    displayError(msg){
        this.setState(prevState=>{
           return {
               errors:[msg].concat(prevState.errors)
           };
        });
    }
    closeErrorBox(key){
        this.setState(prevState=>{
            let errors=[...prevState.errors];
            errors.splice(key,1);
            return {
                errors:errors
            };
        });
    }

    componentDidMount(){
        axios.defaults.baseURL = 'https://zohomailtracker.com/api/v3';

        axios.interceptors.response.use((response) =>{
            const resCode=_.get(response,'data.code',undefined),
                msg=_.get(response,'data.msg',DEFAULT_ERR_MSG);
            if(resCode!==1){
                this.displayError(msg);
                return Promise.reject(msg);
            }

            return response;
        },  (error) =>{
            this.displayError(DEFAULT_ERR_MSG);
            return Promise.reject(error);
        });
    }
    render() {
        if(this.state.loading){
            return (
                <AppLoader onLoaded={()=>{this.setLoadingState(false);}}/>

            );
        }

        return (
            <div className="App d-flex">
                <Sidebar/>
                <Main/>
                <ErrorContainer errors={this.state.errors} closeErrorBox={this.closeErrorBox.bind(this)}/>
            </div>
        );
    }
}

export default App;
