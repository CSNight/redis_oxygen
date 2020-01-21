import REQ from '../../api/services'

export function newConf(dto) {
    return REQ.post('/dump/shakeConf', dto);
}

export function getShakes(dto) {
    return REQ.get('/dump/shakeRecords');
}

export function getShakesByUser() {
    return REQ.get('/dump/shakeRecordsByUser');
}

export function deleteShakeRecord(id) {
    return REQ.delete('/dump/shakeRecord/' + id);
}
