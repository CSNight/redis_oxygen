import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);
// eslint-disable-next-line
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
    nick: state => state.user.nick,
    token: state => state.user.token,
    roles: state => state.user.roles,
    permit: state => state.user.permit,
    avatar: state => state.user.avatar,
    identify: state => state.user.identify,
    loadMenus: state => state.dynamic.loadMenus,
    dynamic_routers: state => state.dynamic.routers,
    addRouters: state => state.dynamic.addRouters,
    baseUrl: state => state.app.BASE_API,
    channel: state => state.websocket.channel,
    client: state => state.websocket.client,
    events: state => state.websocket.events,
    visitedViews: state => state.tagsView.visitedViews,
    cachedViews: state => state.tagsView.cachedViews,
};
const store = new Vuex.Store({
    modules,
    getters
});

export default store
