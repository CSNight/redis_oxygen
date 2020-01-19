import REQ from '../../api/services'

export function newConf(dto) {
    return REQ.post('/dump/shakeConf', dto);
}
