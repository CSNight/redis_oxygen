import REQ from '../../api/services'

export function newConf(dto) {
    return REQ.post('/dump/shakeConf', dto);
}

export function getShakes() {
    return REQ.get('/dump/shakeRecords');
}

export function getShakesByUser() {
    return REQ.get('/dump/shakeRecordsByUser');
}

export function deleteShakeRecord(id) {
    return REQ.delete('/dump/shakeRecord/' + id);
}

export function deleteMultiShake(dto) {
    return REQ.delete('/dump/deleteSelected', {
        data: dto
    });
}

export function clearShake() {
    return REQ.delete('/dump/deleteAll');
}