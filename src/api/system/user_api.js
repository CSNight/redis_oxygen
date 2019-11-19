import REQ from '../../api/services'

export function get_users() {
    return REQ.get('/users/get_users');
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