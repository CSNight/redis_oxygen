import Vue from 'vue'
import Router from 'vue-router'
import Index from '../layout/Index'
import Landing from "../layout/landing/Landing";

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
            meta: {title: 'Dashboard', icon: 'orange', affix: true, id: 'sss'}
        }]
    }, {
        path: '/system',
        name: 'system',
        component: Index,
        alwaysShow: true,
        redirect: '/system/org',
        meta: {title: '系统管理', icon: 'orange', id: 'aaa'},
        children: [
            {
                path: 'org',
                component: () => import('../views/user/OrgTable'),
                name: 'org',
                meta: {title: '部门管理', icon: 'none', affix: true, id: 'bbb'}

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
    // eslint-disable-next-line no-console
    //console.log([to, from, next]);
    next();
});


// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
    const newRouter = createRouter();
    router.matcher = newRouter.matcher // reset router
}

export default router