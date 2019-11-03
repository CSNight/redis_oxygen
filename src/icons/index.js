import Vue from 'vue'
import ElIcon from '@/components/ElIcon'
import SygIcon from '@/components/SvgIcon'// svg component

// register globally
Vue.component('el-icon', ElIcon);
Vue.component('svg-icon', SygIcon);
const req = require.context('./svg', false, /\.svg$/);
const requireAll = requireContext => requireContext.keys().map(requireContext);
requireAll(req);
