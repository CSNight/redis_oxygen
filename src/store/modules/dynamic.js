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
        if (router.component) {
            if (router.component === 'Index') { // Layout组件特殊处理
                router.component = Index;
                router.alwaysShow = true;
                if (router.children.length > 0) {
                    router.redirect =  `noRedirect`
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