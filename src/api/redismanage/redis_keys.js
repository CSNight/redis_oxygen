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

export function refreshKey(dto) {
    return REQ.get('/keys/refresh', {
        params: dto
    });
}

export function deleteKeys(dto) {
    return REQ.delete('/keys/delete', {
        data: dto
    });
}

export function expireKeys(dto, type) {
    return REQ.put('/keys/expires/' + type, dto);
}