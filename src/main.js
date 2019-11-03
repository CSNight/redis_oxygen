import Vue from 'vue'
import App from './App.vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN'
import router from "@/router/router";
import store from "@/store";
import '@/styles/index.scss'
import '@/icons'
import Axios from 'axios'

Vue.prototype.$axios = Axios
Axios.defaults.withCredentials = true;
Vue.config.productionTip = false;
Vue.use(ElementUI, {locale});
new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
