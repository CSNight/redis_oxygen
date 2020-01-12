import REQ from '../../api/services'

export function getConfigs(ins) {
    return REQ.get('/config/configs/' + ins);
}