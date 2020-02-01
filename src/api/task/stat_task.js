import REQ from '../../api/services'

export function getStJobAll() {
    return REQ.get('/statistic/statAll');
}

export function getStJobByUser() {
    return REQ.get('/statistic/statByUser');
}

export function getStJobById(jid) {
    return REQ.get('/statistic/statById/' + jid);
}

export function addStJob(dto) {
    return REQ.post('/statistic/statAdd', dto);
}

export function modifyStJobConf(dto) {
    return REQ.put('/statistic/statConfUpdate', dto);
}

export function modifyStJobState(ins, state) {
    return REQ.put('/statistic/statStateUpdate/' + ins + "/" + state);
}

export function delStJob(ins) {
    return REQ.delete('/statistic/statDelete/' + ins);
}
