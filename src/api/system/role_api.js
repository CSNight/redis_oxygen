import REQ from '../../api/services'

export function get_commands() {
    return REQ.get('/roles/get_commands');
}

export function get_roles() {
    return REQ.get('/roles/get_roles');
}

export function query_roles(cond) {
    return REQ.get('/roles/query_roles', {
        params: cond
    });
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

export function update_role_commands(form) {
    return REQ.put('/roles/update_role_commands', form);
}

export function delete_role(id) {
    return REQ.delete('/roles/delete_role/' + id);
}

export function add_role(form) {
    return REQ.post('/roles/new_role', form);
}