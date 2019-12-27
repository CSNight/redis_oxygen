import REQ from '../../api/services'

export function getAllAuthorizes() {
    return REQ.get('/rights/get_auth_list');
}

export function getAuthorizesByUser(user_id) {
    return REQ.get('/rights/get_auth_list/' + user_id);
}

export function queryBy(exp) {
    return REQ.get('/rights/query_authorizes', {
        params: exp
    });
}