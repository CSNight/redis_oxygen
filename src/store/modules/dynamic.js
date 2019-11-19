import {constantRoutes} from '../../router/router'
import Index from '../../layout/Index'

const dynamic = {
    state: {
        routers: constantRoutes,
        addRouters: [],
        // 第一次加载菜单时用到
        loadMenus: false
    },
    mutations: {
        SET_ROUTERS: (state, routers) => {
            state.addRouters = routers;
            state.routers = constantRoutes.concat(routers)
        }, SET_LOAD_MENUS: (state, loadMenus) => {
            state.loadMenus = loadMenus
        }
    },
    actions: {
        GenerateRoutes({commit}, asyncRouter) {
            commit('SET_ROUTERS', asyncRouter)
        }, updateLoadMenus({commit}) {
            return new Promise(() => {
                commit('SET_LOAD_MENUS', true)
            })
        }
    }
};

export const filterAsyncRouter = (routers) => { // 遍历后台传来的路由字符串，转换为组件对象
    const accessedRouters = routers.filter(router => {
        let path_cnt = router.path.split('/').length;
        if (path_cnt > 2 && router.children && router.children.length === 0 && router.pid === 0) {
            const component = router.component;
            router.component = Index;
            router.redirect = router.path;
            router.children = [{
                path: router.path.split('/')[path_cnt - 1],
                name: router.path.split('/')[path_cnt - 1],
                component: loadView(router.path + "/" + component),
                meta: router.meta,
            }];
            delete router.meta;
            router.path = "/" + router.path.split('/')[1];
            return true;
        }
        if (router.component) {
            if (router.component === 'Index') { // Layout组件特殊处理
                router.component = Index;
                router.alwaysShow = true;
                if (router.children.length > 0) {
                    router.redirect = `noRedirect`
                }
            } else {
                const component = router.component;
                router.component = loadView(router.path + "/" + component)
            }
        }
        if (router.children && router.children.length) {
            router.children = filterAsyncRouter(router.children)
        }
        return true
    });
    return accessedRouters
};

export const loadView = (view) => { // 路由懒加载
    return () => import(`@/views${view}`)
};

export default dynamic