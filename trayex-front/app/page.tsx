"use client"

import { useEffect, useState } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { LoginScreen } from "@/components/login-screen"
import { RegisterStudentScreen } from "@/components/register-student-screen"
import { RegisterDriverScreen } from "@/components/register-driver-screen"
import { OnboardingVideoScreen } from "@/components/onboarding-video-screen"
import { DashboardScreen } from "@/components/dashboard-screen"
import { hasSeenIntro, markIntroSeen } from "@/lib/intro"

export type Screen = "welcome" | "login" | "register-student" | "register-driver" | "onboarding" | "dashboard"
export type UserRole = "student" | "driver" | null

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome")
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Al montar: si hay sesión, decide si mostrar onboarding (solo primera vez del usuario) o dashboard.
  useEffect(() => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setCurrentScreen("welcome") // ← landing primero
        setUserRole(null)
        return
      }

      const raw = localStorage.getItem("user")
      const u = raw ? JSON.parse(raw) : null
      const uid: string | undefined = u?.id

      if (uid) {
        setUserId(uid)
        const firstTime = !hasSeenIntro(uid)
        setCurrentScreen(firstTime ? "onboarding" : "dashboard")
        // rol si quieres hidratarlo
        const r = u?.role === "DRIVER" ? "driver" : "student"
        setUserRole(r)
      } else {
        // si por alguna razón no está cacheado el user, manda a login
        setCurrentScreen("login")
        setUserRole(null)
      }
    } catch {
      setCurrentScreen("welcome")
      setUserRole(null)
    }
  }, [])

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {currentScreen === "welcome" && (
        <WelcomeScreen
          onNavigate={(screen, role) => {
            setCurrentScreen(screen)
            setUserRole(role)
          }}
        />
      )}

      {currentScreen === "login" && (
        <LoginScreen
          userRole={userRole}
          onBack={() => {
            setCurrentScreen("welcome")
            setUserRole(null)
          }}
          onSuccess={() => {
            try {
              const raw = localStorage.getItem("user")
              const u = raw ? JSON.parse(raw) : null
              const uid: string | undefined = u?.id
              if (uid) {
                setUserId(uid)
                const firstTime = !hasSeenIntro(uid)
                setCurrentScreen(firstTime ? "onboarding" : "dashboard")
                const r = u?.role === "DRIVER" ? "driver" : "student"
                setUserRole(r)
              } else {
                setCurrentScreen("dashboard")
              }
            } catch {
              setCurrentScreen("dashboard")
            }
          }}
        />
      )}

      {currentScreen === "register-student" && (
        <RegisterStudentScreen
          onBack={() => {
            setCurrentScreen("welcome")
            setUserRole(null)
          }}
          onSuccess={() => {
            // tras registro, hacemos lo mismo que login:
            try {
              const raw = localStorage.getItem("user")
              const u = raw ? JSON.parse(raw) : null
              const uid: string | undefined = u?.id
              if (uid) {
                setUserId(uid)
                const firstTime = !hasSeenIntro(uid)
                setCurrentScreen(firstTime ? "onboarding" : "dashboard")
                setUserRole("student")
              } else {
                setCurrentScreen("onboarding")
              }
            } catch {
              setCurrentScreen("onboarding")
            }
          }}
        />
      )}

      {currentScreen === "register-driver" && (
        <RegisterDriverScreen
          onBack={() => {
            setCurrentScreen("welcome")
            setUserRole(null)
          }}
          onSuccess={() => {
            try {
              const raw = localStorage.getItem("user")
              const u = raw ? JSON.parse(raw) : null
              const uid: string | undefined = u?.id
              if (uid) {
                setUserId(uid)
                const firstTime = !hasSeenIntro(uid)
                setCurrentScreen(firstTime ? "onboarding" : "dashboard")
                setUserRole("driver")
              } else {
                setCurrentScreen("onboarding")
              }
            } catch {
              setCurrentScreen("onboarding")
            }
          }}
        />
      )}

      {currentScreen === "onboarding" && (
        <OnboardingVideoScreen
          onComplete={() => {
            if (userId) markIntroSeen(userId) // ← marca visto por usuario
            setCurrentScreen("dashboard")
          }}
        />
      )}

      {currentScreen === "dashboard" && <DashboardScreen userRole={userRole} />}
    </main>
  )
}
