import REQ from '../../api/services'

export function get_roles() {
    return REQ.get('/roles/get_roles');
}