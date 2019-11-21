import {getToken, removeToken} from "../../utils/token";
import {resetRouter} from "../../router/router";
import {logout_req, user_avatar, user_info} from "../../api/system/login_api";
import {MessageBox} from "element-ui";
// eslint-disable-next-line no-undef
const ava = require('../../assets/logo.png');
const state = {
    token: getToken(),
    name: '',
    nick: '',
    avatar: ava,
    roles: [],
    permit: {}
};
const mutations = {
    SET_NAME: (state, name) => {
        state.name = name
    }, SET_NICK: (state, nick) => {
        state.nick = nick
    }, SET_AVATAR: (state, avatar) => {
        state.avatar = avatar
    }, SET_ROLES: (state, roles) => {
        state.roles = roles
    }, SET_TOKEN: (state, token) => {
        state.token = token
    }, SET_PERMIT: (state, permit) => {
        state.permit = permit
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
        commit('SET_NICK', '');
        commit('SET_AVATAR', ava);
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
                const {authorities, roles, username, nick_name} = data.message;
                //roles must be a non-empty array
                if (!roles || roles.length <= 0) {
                    reject('getInfo: roles must be a non-null array!')
                }
                let role_list = [];
                for (let i = 0; i < roles.length; i++) {
                    role_list.push(roles[i].code);
                }
                let permits = {};
                for (let i = 0; i < authorities.length; i++) {
                    permits[authorities[i].authority] = true;
                }
                commit('SET_NICK', nick_name);
                commit('SET_ROLES', role_list);
                commit('SET_NAME', username);
                commit('SET_PERMIT', permits);
                user_avatar({username: state.name}).then((resp) => {
                    if (resp.data.status === 200) {
                        commit('SET_AVATAR', resp.data.message);
                    } else {
                        commit('SET_AVATAR', ava);
                    }
                }).catch(() => {
                    commit('SET_AVATAR', ava);
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
    },
    get_head({commit, state}) {
        user_avatar({username: state.name}).then((resp) => {
            if (resp.data.status === 200) {
                commit('SET_AVATAR', resp.data.message);
            } else {
                commit('SET_AVATAR', ava);
            }
        }).catch(() => {
            commit('SET_AVATAR', ava);
        });
    }
};
export default {
    namespaced: true,
    state,
    mutations,
    actions
}