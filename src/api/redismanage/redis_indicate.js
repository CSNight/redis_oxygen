import REQ from '../../api/services'

export function getIndicators() {
    return REQ.get('/indicator');
}

export function addIndicator(dto) {
    return REQ.post('/indicator', dto);
}

export function updateIndicator(dto) {
    return REQ.put('/indicator', dto);
}

export function deleteIndicator(id) {
    return REQ.delete('/indicator/' + id);
}