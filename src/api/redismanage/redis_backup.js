import REQ from '../../api/services'

export function getBackupAll() {
    return REQ.get('/backup/getAll');
}

export function getBackupList() {
    return REQ.get('/backup/getByUser');
}

export function getBackupInfo(id) {
    return REQ.get('/backup/getById/' + id);
}

export function deleteBackupRecord(id) {
    return REQ.delete('/backup/delete/' + id);
}