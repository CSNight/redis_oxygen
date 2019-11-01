import Vue from 'vue'
import ElIcon from '@/layout/sider/ElIcon'// svg component

// register globally
Vue.component('svg-icon', ElIcon);

const req = require.context('./svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req);
