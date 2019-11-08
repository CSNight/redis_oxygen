import REQ from '../../api/services'

export function user_avatar() {
    return REQ.get('/auth/user_avatar');
}

export function login_req(form) {
    return REQ.post('/auth/sign', form, {
        params: form
    });
}

export function user_info(name) {
    return REQ.get('/auth/user_info', {
        params: name
    });
}

export function logout_req() {
    return REQ.post('/auth/logout', {},);
}

export function register_req(form) {
    return REQ.post('/auth/register', {}, {
        params: form
    });
}