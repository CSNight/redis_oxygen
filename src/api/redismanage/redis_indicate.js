import REQ from '../../api/services'

export function getIndicators() {
    return REQ.get('/quota/indicator');
}

export function addIndicator(dto) {
    return REQ.post('/quota/indicator', dto);
}

export function updateIndicator(dto) {
    return REQ.put('/quota/indicator', dto);
}

export function deleteIndicator(id) {
    return REQ.delete('/quota/indicator/' + id);
}