"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { Screen, UserRole } from "@/types"

interface WelcomeScreenProps {
  onNavigate: (screen: Screen, role: UserRole) => void
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const [showRoleSelection, setShowRoleSelection] = useState(false)

  const handleCreateAccount = () => {
    setShowRoleSelection(true)
  }

  const handleRoleSelect = (role: UserRole) => {
    if (role === "student") {
      onNavigate("register-student", role)
    } else {
      onNavigate("register-driver", role)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      {/* Fondo a pantalla completa */}
      <Image
        src="/assets/bg-dashboard.jpg"
        alt="Fondo bienvenida Trayex"
        fill
        priority
        className="object-cover"
      />

      {/* Capa de contenido */}
      <div className="relative z-10 min-h-screen flex flex-col px-6 pt-20 pb-10 max-w-md mx-auto">
        {/* Logo + tagline (lo bajamos un poco con pt-20 y gap) */}
        <header className="flex flex-col items-center gap-3">
          <Image
            src="/assets/logo-trayex.svg"
            alt="Trayex"
            width={220}
            height={80}
            className="drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
          />
        </header>

        {/* Spacer para empujar la tarjeta hacia abajo */}
        <div className="flex-1" />

        {/* Tarjeta inferior */}
        <section className="mb-4">
          <div className="bg-white/95 rounded-[32px] px-6 py-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
            {!showRoleSelection ? (
              <div className="space-y-4">
                {/* Iniciar Sesión */}
                <Button
                  size="lg"
                  className="w-full h-12 text-[14px] font-semibold rounded-full border-none text-white shadow-[0_14px_30px_rgba(0,0,0,0.35)] transition-all duration-200 hover:brightness-110 hover:translate-y-[1px] active:translate-y-[2px]"
                  style={{
                    background:
                      "linear-gradient(90deg, #FFC933 0%, #F6A33A 50%, #F27C3A 100%)",
                  }}
                  onClick={() => onNavigate("login", null)}
                >
                  Iniciar Sesion
                </Button>

                {/* Registrarse */}
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-12 text-[14px] font-semibold rounded-full border-0 bg-white text-[#555] shadow-[0_10px_24px_rgba(0,0,0,0.22)] hover:bg-neutral-50 hover:translate-y-[1px] active:translate-y-[2px] transition-all duration-200"
                  onClick={handleCreateAccount}
                >
                  Registrarse
                </Button>

                <p className="pt-2 text-center text-[11px] text-neutral-400">
                  ¿Necesitas ayuda?
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    ¿Quién eres?
                  </h2>
                  <p className="text-sm text-slate-500">
                    Selecciona tu tipo de cuenta
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Estudiante */}
                  <button
                    onClick={() => handleRoleSelect("student")}
                    className="w-full bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-[0_14px_30px_rgba(0,0,0,0.35)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)] active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-left">
                        <h3 className="text-[15px] font-semibold">
                          👨‍🎓 Estudiante
                        </h3>
                        <p className="text-[12px] text-slate-300 mt-1">
                          Reserva y viaja de forma segura
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </button>

                  {/* Conductor */}
                  <button
                    onClick={() => handleRoleSelect("driver")}
                    className="w-full bg-white text-slate-900 px-5 py-4 rounded-2xl border border-slate-200 shadow-[0_14px_30px_rgba(0,0,0,0.28)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_18px_40px_rgba(0,0,0,0.4)] active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-left">
                        <h3 className="text-[15px] font-semibold">
                          🚍 Conductor
                        </h3>
                        <p className="text-[12px] text-slate-500 mt-1">
                          Opera rutas y valida accesos
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </button>
                </div>

                {/* Volver */}
                <Button
                  variant="ghost"
                  className="w-full h-10 text-xs text-slate-500 rounded-full hover:bg-slate-100/70 transition-colors duration-200"
                  onClick={() => setShowRoleSelection(false)}
                >
                  Volver
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
