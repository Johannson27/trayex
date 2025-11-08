// src/lib/session.ts
const TOKEN_KEY = "trayex:token";
const USER_KEY = "trayex:user";
const REMEMBER_KEY = "remember_email";

export function saveToken(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
}

export function saveUser(user: any) {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user ?? {}));
}

export function getUser(): any | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function clearUser() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(USER_KEY);
}

/** Úsala siempre para cerrar sesión */
export function clearAllAuth() {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        // por si activaste “Recordar correo”
        localStorage.removeItem(REMEMBER_KEY);
        // por si en algún momento se guardó algo en sessionStorage
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
    } catch { }
}
