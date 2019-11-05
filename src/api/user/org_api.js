import axios from 'axios'

export function get_org_tree() {
    return axios.get('http://localhost:8020/org/get_org_tree');
}

export function delete_org(id) {
    return axios.delete('http://localhost:8020/org/delete_org/' + id);
}
