// src/lib/intro.ts
export function hasSeenIntro(userId: string) {
    try {
        return localStorage.getItem(`intro_seen_${userId}`) === "1";
    } catch {
        return false;
    }
}

export function markIntroSeen(userId: string) {
    try {
        localStorage.setItem(`intro_seen_${userId}`, "1");
    } catch { }
}
