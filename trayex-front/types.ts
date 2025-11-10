// src/types.ts

// --- Pantallas / rol ---
export type Screen =
    | "welcome"
    | "login"
    | "register-student"
    | "register-driver"
    | "onboarding"
    | "dashboard";

export type UserRole = "student" | "driver" | null;

// --- Estados de reserva (UI) ---
export type ReservationStatus =
    | "PENDING"
    | "CONFIRMED"
    | "BOARDED"
    | "CANCELLED"
    | "COMPLETED"
    | "NO_SHOW";

// --- Forma que devuelve el BACKEND (status es string crudo) ---
export interface ApiReservation {
    id: string;
    status: string;
    offlineToken?: string | null;
    createdAt: string;
    timeslot: {
        id: string;
        startAt: string;
        endAt: string;
        zoneId: string;
        zone: { name: string };
    };
    stop: { id: string; name: string };
}

// --- Forma que usa la UI (status ya normalizado) ---
export interface Reservation {
    id: string;
    status: ReservationStatus;
    offlineToken?: string | null;
    createdAt: string;
    timeslot: {
        id: string;
        startAt: string;
        endAt: string;
        zoneId: string;
        zone: { name: string };
    };
    stop: { id: string; name: string };
}

// --- Notificaciones (UI) ---
export type UiNotification = {
    id: string;
    title: string;
    body: string;
    channel: string;
    sentAt: string | null;
    read: boolean;
};

