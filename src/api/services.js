import axios from 'axios'
import {Message, MessageBox} from 'element-ui'
import store from '@/store'

const baseUrl = 'http://localhost:8020';
// create an axios instance
const service = axios.create({
    baseURL: baseUrl, // url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 50000, // request timeout
});

// request interceptor//
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
        if (response.request.responseURL && response.request.responseURL === baseUrl + '/login') {
            MessageBox.confirm('登录过期请重新登录?', '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                center: true
            }).then(() => {
                store.dispatch("user/logout");
            });
            return Promise.reject("登录过期");
        } else {
            return response
        }

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