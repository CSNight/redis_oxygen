import Vue from 'vue'
import App from './App.vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN'
import router from "@/router/router";

Vue.config.productionTip = false;
Vue.use(ElementUI, {locale});
new Vue({
    router,
    render: h => h(App),
}).$mount('#app');
