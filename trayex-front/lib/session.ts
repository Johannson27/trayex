// src/lib/session.ts
const TOKEN_KEY = "token";
const USER_KEY = "user";

export function saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function saveUser(user: any) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function getUser(): any | null {
    const raw = localStorage.getItem(USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}
