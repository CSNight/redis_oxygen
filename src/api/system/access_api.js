import REQ from '../../api/services'

export function get_permits() {
    return REQ.get('/permit/get_permits');
}

export function query_permits(query) {
    return REQ.get('/permit/query_permit', {
        params: query
    });
}

export function new_permit(form) {
    return REQ.post('/permit/create_permit/', form);
}

export function edit_permit(form) {
    return REQ.put('/permit/edit_permit/', form);
}

export function delete_permit(id) {
    return REQ.delete('/permit/delete_permit/' + id);
}