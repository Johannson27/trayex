"use client";

import Image from "next/image";

export type TabId = "home" | "bus" | "money" | "ticket" | "bell" | "user";

interface StudentBottomNavProps {
    active: TabId;
    onChange: (tab: TabId) => void;
}

const TABS: {
    id: TabId;
    icon: string;
    label: string;
    customWidth?: number;
    customHeight?: number;
}[] = [
        { id: "home", icon: "/assets/home.svg", label: "Inicio" },
        { id: "bus", icon: "/assets/bus.svg", label: "Rutas" },

        // ⭐ Aquí podés modificar el tamaño individual del icono de TARIFAS
        {
            id: "money",
            icon: "/assets/money.svg",
            label: "Tarifas",
            customWidth: 18,      // <--- CAMBIALO A TU GUSTO
            customHeight: 5      // <--- CAMBIALO A TU GUSTO
        },

        { id: "ticket", icon: "/assets/ticket.svg", label: "Pases" },
        { id: "bell", icon: "/assets/bell.svg", label: "Alertas" },
        { id: "user", icon: "/assets/user.svg", label: "Perfil" },
    ];

export function StudentBottomNav({ active, onChange }: StudentBottomNavProps) {
    return (
        <div className="fixed inset-x-0 bottom-0 flex justify-center pointer-events-none z-50">
            <div className="relative w-full max-w-md h-16">
                <div className="absolute inset-0 bg-white/95 shadow-[0_-6px_20px_rgba(0,0,0,0.12)] rounded-t-2xl"></div>

                <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-auto">
                    {TABS.map((tab) => {
                        const isActive = tab.id === active;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onChange(tab.id)}
                                className="flex flex-col items-center gap-1 text-[11px]"
                            >
                                <Image
                                    src={tab.icon}
                                    alt={tab.label}
                                    width={tab.customWidth ?? 22}
                                    height={tab.customHeight ?? 22}
                                    className={`transition-all ${isActive ? "scale-110 opacity-100" : "opacity-50"}`}
                                />
                                <span
                                    className={`transition-all ${isActive ? "text-blue-600" : "text-slate-400"
                                        }`}
                                >
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
