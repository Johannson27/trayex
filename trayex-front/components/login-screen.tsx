"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Bus, Mail, Lock } from "lucide-react"
import type { UserRole } from "@/app/page"

interface LoginScreenProps {
  userRole: UserRole
  onBack: () => void
  onSuccess?: () => void
}

export function LoginScreen({ userRole, onBack, onSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Login:", { email, password, rememberMe, userRole })
    onSuccess?.()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary p-6 pb-12 rounded-b-3xl shadow-lg">
        <button onClick={onBack} className="flex items-center gap-2 text-primary-foreground mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Bus className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground">Iniciar sesión</h1>
        </div>
        <p className="text-primary-foreground/80 ml-15">
          {userRole === "student"
            ? "Accede con tu correo institucional"
            : userRole === "driver"
              ? "Accede con tus credenciales"
              : "Ingresa tus credenciales"}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 p-6 -mt-6">
        <div className="bg-card rounded-3xl shadow-xl p-6 space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {userRole === "student" ? "Correo institucional o número de estudiante" : "Correo o teléfono"}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  placeholder={userRole === "student" ? "estudiante@universidad.edu" : "correo@ejemplo.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  Recordar contraseña
                </Label>
              </div>
              <button type="button" className="text-sm text-primary font-medium hover:underline">
                {"¿Olvidaste tu contraseña?"}
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 rounded-2xl text-lg font-semibold bg-primary hover:bg-primary/90"
            >
              Iniciar sesión
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
