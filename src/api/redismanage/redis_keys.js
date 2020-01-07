import REQ from '../../api/services'

export function insScanKey(dto) {
    return REQ.get('/keys/scanner', {
        params: dto
    });
}

export function getKeyValue(dto) {
    return REQ.get('/keys/keyvalue', {
        params: dto
    });
}
export function deleteKey(dto) {
    return REQ.delete('/keys/delete', {
        data: dto
    });
}