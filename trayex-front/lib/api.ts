// trayex-front/lib/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
// trayex-front/src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
    const headers = new Headers(init.headers || {});
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(`${API_BASE}${path}`, { ...init, headers, cache: "no-store" });
    const text = await res.text();
    if (!res.ok) {
        throw new Error(text || `HTTP ${res.status}`);
    }
    try { return JSON.parse(text) as T; } catch { return {} as T; }
}

export async function register(email: string, password: string, fullName?: string, extra?: any) {
    return apiRequest<{ user: any; token: string }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify({ email, password, fullName, ...extra }) }
    );
}

export async function login(email: string, password: string) {
    return apiRequest<{ user: any; token: string }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
    );
}

export async function getMe(token: string) {
    return apiRequest<{ user: any }>("/auth/me", { method: "GET" }, token);
}


export type Session = { token: string; user?: { id: string; role: string } } | null;

const KEY = "token";

export function saveToken(token: string) {
    localStorage.setItem(KEY, token);
}
export function getToken(): string | null {
    return localStorage.getItem(KEY);
}
export function clearToken() {
    localStorage.removeItem(KEY);
}

// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function getMyProfile(token: string) {
    const r = await fetch(`${API_URL}/me/profile`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<{
        user: { id: string; email: string | null; phone: string | null; role: string };
        profile: {
            id: string;
            userId: string;
            fullName?: string | null;
            bloodType?: string | null;
            idNumber?: string | null;
            university?: string | null;
            emergencyName?: string | null;
            emergencyContact?: string | null;
            qrToken?: string | null;
        } | null;
    }>;
}

export async function updateMyProfile(
    token: string,
    payload: Partial<{
        fullName: string;
        bloodType: string;
        idNumber: string;
        university: string;
        emergencyName: string;
        emergencyContact: string;
    }>
) {
    const r = await fetch(`${API_URL}/me/profile`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json() as Promise<{ profile: any }>;
}
