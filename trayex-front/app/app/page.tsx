// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { WelcomeScreen } from "@/components/welcome-screen";
import { LoginScreen } from "@/components/login-screen";
import { RegisterStudentScreen } from "@/components/register-student-screen";
import { RegisterDriverScreen } from "@/components/register-driver-screen";
import { OnboardingVideoScreen } from "@/components/onboarding-video-screen";
import { DashboardScreen } from "@/components/dashboard-screen";
import { hasSeenIntro, markIntroSeen } from "@/lib/intro";
import { getToken, getUser } from "@/lib/session";


export type Screen =
    | "welcome"
    | "login"
    | "register-student"
    | "register-driver"
    | "onboarding"
    | "dashboard";

export type UserRole = "student" | "driver" | null;

export default function Home() {
    const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Al montar: decide pantalla según sesión real (usando helpers)
    useEffect(() => {
        try {
            const token = getToken();
            if (!token) {
                setCurrentScreen("welcome");
                setUserRole(null);
                return;
            }

            const u = getUser();
            const uid: string | undefined = u?.id;

            if (uid) {
                setUserId(uid);
                const firstTime = !hasSeenIntro(uid);
                setCurrentScreen(firstTime ? "onboarding" : "dashboard");
                const r: UserRole = u?.role === "DRIVER" ? "driver" : "student";
                setUserRole(r);
            } else {
                setCurrentScreen("login");
                setUserRole(null);
            }
        } catch {
            setCurrentScreen("welcome");
            setUserRole(null);
        }
    }, []);

    

    return (
        <main className="min-h-screen bg-background overflow-hidden">
            {currentScreen === "welcome" && (
                <WelcomeScreen
                    onNavigate={(screen, role) => {
                        setCurrentScreen(screen);
                        setUserRole(role);
                    }}
                />
            )}

            {currentScreen === "login" && (
                <LoginScreen
                    userRole={userRole}
                    onBack={() => {
                        setCurrentScreen("welcome");
                        setUserRole(null);
                    }}
                    onSuccess={() => {
                        try {
                            const u = getUser();
                            const uid: string | undefined = u?.id;
                            if (uid) {
                                setUserId(uid);
                                const firstTime = !hasSeenIntro(uid);
                                setCurrentScreen(firstTime ? "onboarding" : "dashboard");
                                const r: UserRole = u?.role === "DRIVER" ? "driver" : "student";
                                setUserRole(r);
                            } else {
                                setCurrentScreen("dashboard");
                            }
                        } catch {
                            setCurrentScreen("dashboard");
                        }
                    }}
                />
            )}

            {currentScreen === "register-student" && (
                <RegisterStudentScreen
                    onBack={() => {
                        setCurrentScreen("welcome");
                        setUserRole(null);
                    }}
                    onSuccess={() => {
                        try {
                            const u = getUser();
                            const uid: string | undefined = u?.id;
                            if (uid) {
                                setUserId(uid);
                                const firstTime = !hasSeenIntro(uid);
                                setCurrentScreen(firstTime ? "onboarding" : "dashboard");
                                setUserRole("student");
                            } else {
                                setCurrentScreen("onboarding");
                            }
                        } catch {
                            setCurrentScreen("onboarding");
                        }
                    }}
                />
            )}

            {currentScreen === "register-driver" && (
                <RegisterDriverScreen
                    onBack={() => {
                        setCurrentScreen("welcome");
                        setUserRole(null);
                    }}
                    onSuccess={() => {
                        try {
                            const u = getUser();
                            const uid: string | undefined = u?.id;
                            if (uid) {
                                setUserId(uid);
                                const firstTime = !hasSeenIntro(uid);
                                setCurrentScreen(firstTime ? "onboarding" : "dashboard");
                                setUserRole("driver");
                            } else {
                                setCurrentScreen("onboarding");
                            }
                        } catch {
                            setCurrentScreen("onboarding");
                        }
                    }}
                />
            )}

            {currentScreen === "onboarding" && (
                <OnboardingVideoScreen
                    onComplete={() => {
                        if (userId) markIntroSeen(userId);
                        setCurrentScreen("dashboard");
                    }}
                />
            )}

            {currentScreen === "dashboard" && <DashboardScreen userRole={userRole} />}
        </main>
    );
}
