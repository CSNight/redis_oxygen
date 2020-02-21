import REQ from '../../api/services'

export function getUserConf() {
    return REQ.get('/mail/getUserConf');
}

export function getConfList() {
    return REQ.get('/mail/getAllConf');
}

export function setConf(conf) {
    return REQ.put('/mail/editUserConf', conf);
}

export function delConf() {
    return REQ.delete('/mail/deleteConf');
}

export function sendMail(conf) {
    return REQ.post('/mail/sendMail', conf);
}

export function getAllRecords() {
    return REQ.get('/mail/getAllRec');
}

export function getUserRecords() {
    return REQ.get('/mail/getUserRec');
}

export function getRecordById(mid) {
    return REQ.get('/mail/getRecByID/' + mid);
}

export function queryRecords(dto) {
    return REQ.get('/mail/searchUserRec', {
        params: dto
    });
}

export function deleteRecordById(mid) {
    return REQ.delete('/mail/deleteRecById/' + mid);
}

export function deleteMultiRecords(dto) {
    return REQ.delete('/mail/deleteRecMulti', {
        data: dto
    });
}