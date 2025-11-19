"use client";

import { useState } from "react";

import { AccessIntroScreen } from "@/components/access-intro-screen";
import { WelcomeScreen } from "@/components/welcome-screen";
import { LoginScreen } from "@/components/login-screen";
import { RegisterStudentScreen } from "@/components/register-student-screen";
import { RegisterDriverScreen } from "@/components/register-driver-screen";
import { DashboardScreen } from "@/components/dashboard-screen";
import { getUser } from "@/lib/session";
import type { UserRole } from "@/types";

export type Screen =
    | "access-intro"
    | "welcome"
    | "login"
    | "register-student"
    | "register-driver"
    | "dashboard";


export default function AppRoot() {
    const [currentScreen, setCurrentScreen] = useState<Screen>("access-intro");
    const [userRole, setUserRole] = useState<UserRole>(null);

    const goTo = (screen: Screen, role?: UserRole | null) => {
        if (role !== undefined) {
            setUserRole(role);
        }
        setCurrentScreen(screen);
    };

    return (
        <main className="min-h-screen bg-background">
            {/* 1. INTRO / ACCESO */}
            {currentScreen === "access-intro" && (
                <AccessIntroScreen onContinue={() => goTo("welcome")} />
            )}

            {/* 2. WELCOME */}
            {currentScreen === "welcome" && (
                <WelcomeScreen
                    onNavigate={(screen, role) => {
                        goTo(screen as Screen, role);
                    }}
                />
            )}

            {/* 3. LOGIN */}
            {currentScreen === "login" && (
                <LoginScreen
                    userRole={userRole}
                    onBack={() => goTo("welcome", null)}
                    onSuccess={() => {
                        try {
                            const u = getUser();
                            let role: UserRole = null;

                            if (u?.role === "DRIVER") role = "driver";
                            else if (u?.role === "STUDENT") role = "student";
                            else if (u?.role === "STAFF") role = "staff";


                            setUserRole(role);
                            goTo("dashboard", role);

                        } catch {
                            goTo("dashboard");
                        }
                    }}
                />
            )}

            {/* 4. REGISTER STUDENT */}
            {currentScreen === "register-student" && (
                <RegisterStudentScreen
                    onBack={() => goTo("welcome", null)}
                    onSuccess={() => {
                        setUserRole("student");
                        goTo("dashboard", "student");
                    }}
                />
            )}

            {/* 5. REGISTER DRIVER */}
            {currentScreen === "register-driver" && (
                <RegisterDriverScreen
                    onBack={() => goTo("welcome", null)}
                    onSuccess={() => {
                        setUserRole("driver");
                        goTo("dashboard", "driver");
                    }}
                />
            )}

            {/* 6. DASHBOARD */}
            {currentScreen === "dashboard" && (
                <DashboardScreen userRole={userRole} />
            )}
        </main>
    );
}
