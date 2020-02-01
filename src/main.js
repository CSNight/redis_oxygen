import Vue from 'vue'
import App from './App.vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import "./assets/nucleo/css/nucleo.css";
import "./assets/fontawesome/css/fontawesome.css";
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from "./router/router";
import store from "./store";
import '@/styles/index.scss'
import '@/icons'
import axios from 'axios'
import websocket from "./api/websocket";
import i18n from './utils/lang' // Internationalization

Vue.prototype.$axios = axios;
Vue.prototype.$wss = websocket;
axios.defaults.withCredentials = true;
Vue.config.productionTip = false;
Vue.use(ElementUI, {i18n: (key, value) => i18n.t(key, value)});
new Vue({
    store,
    router,
    i18n,
    render: h => h(App),
}).$mount('#app');
