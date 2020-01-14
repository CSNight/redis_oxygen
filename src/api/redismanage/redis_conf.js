import REQ from '../../api/services'

export function getConfigs(ins) {
    return REQ.get('/config/configs/' + ins);
}

export function saveConfig(conf) {
    return REQ.put('/config/configs', conf);
}

export function rmsInfo(ins, refresh) {
    return REQ.get('/config/infos/' + ins + "/" + refresh);
}