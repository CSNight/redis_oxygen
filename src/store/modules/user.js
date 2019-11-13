import {getToken, removeToken} from "../../utils/token";
import {resetRouter} from "../../router/router";
import {logout_req, user_avatar, user_info} from "../../api/system/login_api";
import {MessageBox} from "element-ui";


const state = {
    token: getToken(),
    name: '',
    avatar: '',
    roles: []
};
const mutations = {
    SET_NAME: (state, name) => {
        state.name = name
    }, SET_AVATAR: (state, avatar) => {
        state.avatar = avatar
    }, SET_ROLES: (state, roles) => {
        state.roles = roles
    }, SET_TOKEN: (state, token) => {
        state.token = token
    },
};
const actions = {
    login({commit}, name) {
        commit('SET_NAME', name)
    },
    logout({commit}) {
        commit('SET_TOKEN', '');
        commit('SET_ROLES', []);
        commit('SET_NAME', '');
        commit('SET_AVATAR', '');
        removeToken();
        resetRouter();
        return new Promise((resolve, reject) => {
            logout_req().then((response) => {
                if (response.data.status === 200) {
                    resolve(response.data)
                }
                location.reload();
            }).catch(error => {
                reject(error);
                location.reload();
            })
        })
    },
    user_info({commit, state}) {
        return new Promise((resolve, reject) => {
            user_info({username: state.name}).then(response => {
                const {data} = response;

                if (!data) {
                    reject('Verification failed, please Login again.')
                }
                const {roles, username} = data.message;
                //roles must be a non-empty array
                if (!roles || roles.length <= 0) {
                    reject('getInfo: roles must be a non-null array!')
                }
                commit('SET_ROLES', roles);
                commit('SET_NAME', username);
                user_avatar({username: state.name}).then((resp) => {
                    commit('SET_AVATAR', resp.data.message);
                });
                commit('SET_TOKEN', getToken());
                resolve(data)
            }).catch(error => {
                removeToken();
                reject(error);
                MessageBox.confirm('登录过期请重新登录?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {

                });
            });
        })
    }
};
export default {
    namespaced: true,
    state,
    mutations,
    actions
}