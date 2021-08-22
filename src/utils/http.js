import axios from 'axios';
import _ from 'lodash';
import UserStore from '../stores/UserStore';
import { reaction } from 'mobx';
import * as Swal from "sweetalert2";

// require('dotenv').config();

const DEFAULT_ERR_MSG = 'There was an error with the request, please try again!';

// whenever the token changes in the userstore, we update our axios headers
reaction(() => {
    return UserStore.apiToken;
}, (apiToken) => {
    http.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`;
});

/**
 * Helper function to display the error
 */
const displayError=async (msg)=>{
    await Swal.fire('Error', msg, 'error');
}

console.log(process.env.REACT_APP_API_BASE_URL,process.env);

const http = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    responseType: 'json'
});

// simple response interceptors
http.interceptors.response.use(async (response) => {
    const resCode = _.get(response, 'data.code', undefined),
        msg = _.get(response, 'data.msg', DEFAULT_ERR_MSG);
    if (resCode !== 1) {
        await displayError(msg);
        return Promise.reject(msg);
    }

    return response;
}, async (error) => {
    await displayError(DEFAULT_ERR_MSG);
    return Promise.reject(error);
});

export default http;
