import REQ from '@/api/services'

export function get_org_tree() {
    return REQ.get('/org/get_org_tree');
}

export function delete_org(id) {
    return REQ.delete('/org/delete_org/' + id);
}

export function modify_org(org_ent) {
    return REQ.put('/org/modify_org', 'org_ent=' + JSON.stringify(org_ent));
}