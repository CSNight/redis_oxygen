import axios from 'axios'
import {Message} from 'element-ui'
// create an axios instance
const service = axios.create({
    baseURL: 'http://localhost:8020', // url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 50000, // request timeout
});

// request interceptor
service.interceptors.request.use(
    config => {
        //config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        return config
    },
    error => {
        // do something with request error
        return Promise.reject(error)
    });

// response interceptor
service.interceptors.response.use(
    response => {
        return response
    },
    error => {
        Message({
            message: error.message,
            type: 'error',
            duration: 3 * 1000
        });
        return Promise.reject(error)
    }
);

export default service