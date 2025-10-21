"use client"

import { useEffect, useState } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { LoginScreen } from "@/components/login-screen"
import { RegisterStudentScreen } from "@/components/register-student-screen"
import { RegisterDriverScreen } from "@/components/register-driver-screen"
import { OnboardingVideoScreen } from "@/components/onboarding-video-screen"
import { DashboardScreen } from "@/components/dashboard-screen"

export type Screen = "welcome" | "login" | "register-student" | "register-driver" | "onboarding" | "dashboard"
export type UserRole = "student" | "driver" | null

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome")
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)

  //Log para confirmar la API base desde .env.local
  useEffect(() => {
    console.log("API base URL:", process.env.NEXT_PUBLIC_API_BASE_URL)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      // si ya estaba logueado, salta al dashboard
      setHasSeenOnboarding(true)
      setCurrentScreen("dashboard")
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
            if (!hasSeenOnboarding) {
              setCurrentScreen("onboarding")
            } else {
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
            setCurrentScreen("onboarding")
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
            setCurrentScreen("onboarding")
          }}
        />
      )}
      {currentScreen === "onboarding" && (
        <OnboardingVideoScreen
          onComplete={() => {
            setHasSeenOnboarding(true)
            setCurrentScreen("dashboard")
          }}
        />
      )}
      {currentScreen === "dashboard" && <DashboardScreen userRole={userRole} />}
    </main>
  )
}
