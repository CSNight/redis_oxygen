import Vue from 'vue'
import Router from 'vue-router'
import Index from '../layout/Index'
import Landing from "../layout/landing/Landing";
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import {getToken, removeToken} from "../utils/token";
import store from '@/store'

const whiteList = ['/'];
NProgress.configure({showSpinner: false});
Vue.use(Router);
export const constantRoutes = [
    {
        path: '/',
        name: 'Landing',
        component: Landing,
    },
    {
        path: '/home',
        name: 'Home',
        component: Index,
        children: [{
            path: 'dashboard',
            component: () => import('../components/HelloWorld'),
            name: 'dashboard',
            meta: {title: 'Dashboard', icon: 'fa-cog', affix: true, ref: 'sss'}
        }]
    }, {
        path: '/system',
        name: 'system',
        component: Index,
        alwaysShow: true,
        redirect: '/system/org',
        meta: {title: '系统管理', icon: 'fa-cog', ref: 'aaa'},
        children: [
            {
                path: '/system/org',
                component: () => import('../views/system/OrgTable'),
                name: 'org',
                meta: {title: '部门管理', icon: 'fa-sitemap', affix: true, ref: 'org_com'}

            }, {
                path: '/system/menu',
                component: () => import('../views/system/MenuTable'),
                name: 'menu',
                meta: {title: '菜单管理', icon: 'fa-list-ul', affix: true, ref: 'menu_com'}

            }
        ]
    },
    // 404 page must be placed at the end !!!
    {path: '*', redirect: '/404', hidden: true}
];

const createRouter = () => new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({y: 0}),
    routes: constantRoutes
});

const router = createRouter();
router.beforeEach(async (to, from, next) => {
    // start progress bar
    NProgress.start();
    const hasToken = getToken();

    if (hasToken && store) {
        let name = store.getters.name;
        if (!name || name === '') {
            await store.dispatch('user/user_info').then(() => {
                next();
            }).catch(() => {
                removeToken();
                next(`/?redirect=${to.path}`)
            });
        } else {
            next();
        }
    } else {
        /* has no token*/
        if (whiteList.indexOf(to.path) !== -1) {
            // in the free login whitelist, go directly
            next()
        } else {
            // other pages that do not have permission to access are redirected to the login page.
            next(`/?redirect=${to.path}`);
            NProgress.done()
        }
    }
});

router.afterEach(() => {
    // eslint-disable-next-line no-console
    console.log(router);
    // finish progress bar
    NProgress.done()
});


// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
    const newRouter = createRouter();
    router.matcher = newRouter.matcher // reset router
}

export default router