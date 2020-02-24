import REQ from '../../api/services'

export function getCeJobAll() {
    return REQ.get('/execution/cetAll');
}

export function getCeJobByUser() {
    return REQ.get('/execution/cetByUser');
}

export function getCeJobById(jid) {
    return REQ.get('/execution/cetById/' + jid);
}

export function addCeJob(dto) {
    return REQ.post('/execution/cetAdd', dto);
}

export function modifyCeJobConf(dto) {
    return REQ.put('/execution/cetConfUpdate', dto);
}

export function modifyCeJobState(jobId, state) {
    return REQ.put('/execution/cetStateUpdate/' + jobId + "/" + state);
}

export function delCeJob(jobId) {
    return REQ.delete('/execution/cetDelete/' + jobId);
}