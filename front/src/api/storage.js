// Утилиты для работы с localStorage (auth tokens)
const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export function getAccessToken() {
    return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
}

export function setAccessToken(token) {
    if (token) localStorage.setItem(ACCESS_KEY, token);
}

export function setRefreshToken(token) {
    if (token) localStorage.setItem(REFRESH_KEY, token);
}

export function setAuthTokens({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearAuth() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
}
