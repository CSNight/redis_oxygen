import REQ from '../../api/services'

export function login_req(form) {
    return REQ.post('/auth/sign', {}, {
        params: form
    });
}

export function logout_req(form) {
    return REQ.post('/auth/logout', form);
}

export function register(form) {
    return REQ.post('/auth/register', form);
}