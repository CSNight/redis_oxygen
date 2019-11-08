import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);
// https://webpack.js.org/guides/dependency-management/#requirecontext
const modulesFiles = require.context('./modules', true, /\.js$/);

// you do not need `import app from './modules/app'`
// it will auto require all vuex module from modules file
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
    // set './app.js' => 'app'
    const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1');
    const value = modulesFiles(modulePath);
    modules[moduleName] = value.default;
    return modules
}, {});
const getters = {
    sidebar: state => state.app.sidebar,
    device: state => state.app.device,
    name: state => state.user.name,
    token: state => state.user.token,
    avatar: state => state.user.avatar,
};
const store = new Vuex.Store({
    modules,
    getters
});

export default store
