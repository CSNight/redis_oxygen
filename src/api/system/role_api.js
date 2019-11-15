import REQ from '../../api/services'

export function get_roles() {
    return REQ.get('/roles/get_roles');
}

export function edit_role(param) {
    return REQ.put('/roles/modify_role', param);
}

export function update_role_menus(form) {
    return REQ.put('/roles/update_role_menus', form);
}

export function update_role_permits(form) {
    return REQ.put('/roles/update_role_permits', form);
}

export function delete_role(id) {
    return REQ.delete('/roles/delete_role/' + id);
}

export function add_role(form) {
    return REQ.post('/roles/new_role', form);
}