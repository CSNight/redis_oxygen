import REQ from '../../api/services'

export function getAll() {
    return REQ.get('/dba/databases/all');
}

export function getByUser(user_id) {
    return REQ.get('/dba/databases/' + user_id);
}

export function getByIns(ins_id) {
    return REQ.get('/dba/database/' + ins_id);
}

export function insFlushAll(ins_id) {
    return REQ.delete('/dba/flush/' + ins_id);
}

export function insFlushDb(ins_id, db) {
    return REQ.delete('/dba/flush/' + ins_id + "/" + db);
}


