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