import REQ from '../../api/services'

export function get_menu_tree() {
    return REQ.get('/menus/get_menu_tree');
}

export function get_icons() {
    return REQ.get('/menus/get_icons');
}

export function query_by(cond) {
    return REQ.get('/menus/query_menu', {
        params: cond
    });
}

export function new_menu(menu_ins) {
    return REQ.post('/menus/new_menu', menu_ins);
}

export function delete_menu(id) {
    return REQ.delete('/menus/delete_menu/' + id);
}

export function modify_menu(menu_ins) {
    return REQ.put('/menus/modify_menu', menu_ins);
}