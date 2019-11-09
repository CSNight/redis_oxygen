import REQ from '../../api/services'

export function get_menu_tree() {
    return REQ.get('/menus/get_menu_tree');
}
export function delete_menu(id) {
    return REQ.delete('/menus/delete_menu/' + id);
}
export function modify_menu(menu_ins) {
    return REQ.put('/menus/modify_menu', menu_ins);
}