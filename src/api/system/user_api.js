import REQ from '../../api/services'

export function get_users() {
    return REQ.get('/users/get_users');
}