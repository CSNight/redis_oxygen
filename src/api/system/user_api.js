import REQ from '../../api/services'

export function get_users() {
    return REQ.get('/users/get_users');
}

export function query_users(cond) {
    return REQ.get('/users/query_users', {
        params: cond
    });
}

export function get_org_user(id) {
    return REQ.get('/users/get_by_org/' + id)
}

export function new_user(user_ins) {
    return REQ.post('/users/new_user', user_ins)
}

export function edit_user(user_ins) {
    return REQ.put('/users/edit_user', user_ins);
}

export function change_pass(para) {
    return REQ.put('/users/change_pwd', para);
}

export function delete_user(id) {
    return REQ.delete('/users/delete_by_id/' + id);
}