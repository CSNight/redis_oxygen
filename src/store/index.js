import Vue from 'vue'
import Vuex from 'vuex'
import app from './app'

Vue.use(Vuex);
const getters = {
    sidebar: state => state.app.sidebar,
    device: state => state.app.device,
    token: state => state.app.token,
    avatar: state => state.app.avatar,
    name: state => state.app.name
}
const store = new Vuex.Store({
    modules: {
        app,
    },
    getters
})

export default store
