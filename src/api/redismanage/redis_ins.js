import REQ from '../../api/services'

export function getAll(update) {
    return REQ.get('/instance/get_instances/' + update);
}

export function getByUser(user_id) {
    return REQ.get('/instance/get_instance/' + user_id);
}

export function queryBy(exp) {
    return REQ.get('/instance/query_instance', {
        params: exp
    });
}

export function newInstance(dto) {
    return REQ.post('/instance/new_instance', dto);
}

export function refreshMeta(ins_id) {
    return REQ.put('/instance/update_meta/' + ins_id);
}

export function modifyState(dto) {
    return REQ.put('/instance/modify_state', dto);
}

export function modifyName(dto) {
    return REQ.put('/instance/modify_name', dto);
}

export function modifyConnect(dto) {
    return REQ.put('/instance/modify_conn', dto);
}

export function deleteIns(ins_id) {
    return REQ.delete('/instance/delete_instance/' + ins_id);
}