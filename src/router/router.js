import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/layout/Index'

Vue.use(Router);
export const constantRoutes = [
    {
        path: '/',
        name: 'Home',
        component: Index,
        children: [{
            path: 'dashboard',
            component: () => import('@/components/HelloWorld'),
            name: 'dashboard',
            meta: {title: 'Dashboard', icon: 'orange', affix: true, id: 'sss'}
        }]
    }, {
        path: '/hello',
        name: 'Hello',
        component: Index,
        alwaysShow: true,
        redirect: '/hello/dashboard',
        meta: {title: 'Hello1', icon: 'orange', id: 'aaa'},
        children: [
            {
                path: 'dashboard',
                component: () => import('@/views/user/OrgTable'),
                name: 'helloss',
                meta: {title: 'Hello2', icon: 'none', affix: true, id: 'bbb'}

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