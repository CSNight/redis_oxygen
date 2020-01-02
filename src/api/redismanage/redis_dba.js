import REQ from '../../api/services'

export function getAll() {
    return REQ.get('/dba/databases/all');
}

export function getByUser(user_id) {
    return REQ.get('/dba/databases/' + user_id);
}

export function getByIns(ins_id) {
    return REQ.get('/dba/databases/' + ins_id);
}
