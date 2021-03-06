import Cookies from 'js-cookie'

const TokenKey = 'LoginTK';

export function getToken() {
    return Cookies.get(TokenKey)
}

export function setToken(token) {
    return Cookies.set(TokenKey, token, {expires: 7, path: '/'})
}

export function removeToken() {
    return Cookies.remove(TokenKey)
}