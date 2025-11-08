"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bus, ArrowRight } from "lucide-react"
import type { Screen, UserRole } from "@/app/app/page"

interface WelcomeScreenProps {
  onNavigate: (screen: Screen, role: UserRole) => void
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleCreateAccount = () => {
    setShowRoleSelection(true)
    setIsAnimating(true)
  }

  const handleRoleSelect = (role: UserRole) => {
    if (role === "student") {
      onNavigate("register-student", role)
    } else {
      onNavigate("register-driver", role)
    }
  }

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-between p-6 overflow-hidden">
      {/* Logo Circle */}
      <div
        className={`absolute top-1/4 flex items-center justify-center transition-all duration-500 ${
          isAnimating ? "top-8 left-8 scale-75" : ""
        }`}
      >
        <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center shadow-2xl">
          <Bus className="w-16 h-16 text-primary-foreground" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 mt-32">
        <h1 className="text-5xl font-bold text-primary tracking-tight">Trayex</h1>
        <p className="text-lg text-muted-foreground max-w-xs text-balance">
          {"Transporte universitario seguro y confiable"}
        </p>
      </div>

      {/* Bottom Card */}
      <div
        className={`w-full bg-primary rounded-t-3xl p-8 space-y-4 transition-all duration-500 ${
          showRoleSelection ? "h-[60vh]" : "h-auto"
        }`}
      >
        {!showRoleSelection ? (
          <>
            <Button
              size="lg"
              className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold text-lg h-14 rounded-2xl"
              onClick={() => onNavigate("login", null)}
            >
              Iniciar sesión
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-lg h-14 rounded-2xl bg-transparent"
              onClick={handleCreateAccount}
            >
              Crear una cuenta
            </Button>
          </>
        ) : (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-primary-foreground">{"¿Quién eres?"}</h2>
              <p className="text-primary-foreground/80">Selecciona tu tipo de cuenta</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect("student")}
                className="w-full bg-primary-foreground text-primary p-6 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="text-xl font-bold">👨‍🎓 Estudiante</h3>
                    <p className="text-sm text-muted-foreground mt-1">Reserva y viaja de forma segura</p>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("driver")}
                className="w-full bg-primary-foreground text-primary p-6 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="text-xl font-bold">🚍 Conductor</h3>
                    <p className="text-sm text-muted-foreground mt-1">Opera rutas y valida accesos</p>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </div>
              </button>
            </div>

            <Button
              variant="ghost"
              className="w-full text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => {
                setShowRoleSelection(false)
                setIsAnimating(false)
              }}
            >
              Volver
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
