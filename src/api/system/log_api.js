import REQ from '../../api/services'

export function get_logs(user, cur, size) {
    return REQ.get("/logs/get_logs/" + user + "/" + cur + "/" + size);
}

export function query_logs(cond) {
    return REQ.get("/logs/query_logs", {
        params: cond
    });
}

export function clear_logs(user) {
    return REQ.delete("/logs/clear_logs/" + user);
}