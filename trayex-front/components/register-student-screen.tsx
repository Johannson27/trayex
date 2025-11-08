"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Bus, User, Mail, Lock, Phone, Droplet, CreditCard, Building2 } from "lucide-react"
import { register, getMe } from "@/lib/api"
import { saveToken, saveUser } from "@/lib/session"
import { UNIVERSITIES_NI } from "@/lib/universities-ni";

interface RegisterStudentScreenProps {
  onBack: () => void
  onSuccess?: () => void
}

export function RegisterStudentScreen({ onBack, onSuccess }: RegisterStudentScreenProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    bloodType: "",
    idNumber: "",
    university: "",
    emergencyContact: "",
    emergencyName: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)

    if (step === 1) {
      if (!formData.fullName.trim()) return setErr("Ingresa tu nombre completo")
      if (!formData.email) return setErr("Ingresa tu correo institucional")
      if (formData.password.length < 8) return setErr("La contraseña debe tener al menos 8 caracteres")
      if (formData.password !== formData.confirmPassword) return setErr("Las contraseñas no coinciden")

      setStep(2)
      return
    }

    // Paso 2: registrar en backend con campos extra
    setLoading(true)
    try {
      const { token, user } = await register(
        formData.email,
        formData.password,
        formData.fullName.trim(),
        {
          bloodType: formData.bloodType || undefined,
          idNumber: formData.idNumber || undefined,
          university: formData.university || undefined,
          emergencyName: formData.emergencyName || undefined,
          emergencyContact: formData.emergencyContact || undefined,
        }
      )

      // Guarda token + user (dev: localStorage)
      saveToken ? saveToken(token) : localStorage.setItem("token", token)

      try {
        const me = await getMe(token) // { user: {..., student: {...}} }
        saveUser ? saveUser(me.user) : localStorage.setItem("user", JSON.stringify(me.user))
      } catch {
        saveUser ? saveUser(user) : localStorage.setItem("user", JSON.stringify(user))
      }

      onSuccess?.() // page.tsx te lleva a onboarding
    } catch (e: any) {
      const msg = e?.message ?? "No se pudo crear la cuenta"
      if (msg.includes("registrado") || msg.toLowerCase().includes("already")) {
        setErr("Este email ya está registrado")
      } else {
        setErr(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary p-6 pb-12 rounded-b-3xl shadow-lg">
        <button
          onClick={step === 2 ? () => setStep(1) : onBack}
          className="flex items-center gap-2 text-primary-foreground mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Bus className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground">Registro Estudiante</h1>
        </div>
        <p className="text-primary-foreground/80 ml-15">
          {step === 1 ? "Crea tu cuenta" : "Datos de emergencia"}
        </p>

        {/* Progreso */}
        <div className="flex gap-2 mt-6">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-primary-foreground" : "bg-primary-foreground/30"}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-primary-foreground" : "bg-primary-foreground/30"}`} />
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 p-6 -mt-6 overflow-y-auto">
        <div className="bg-card rounded-3xl shadow-xl p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Juan Pérez"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Correo institucional</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="estudiante@universidad.edu"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bloodType" className="text-sm font-medium">Tipo de sangre</Label>
                  <div className="relative">
                    <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                    <Select
                      value={formData.bloodType}
                      onValueChange={(value) => updateField("bloodType", value)}
                    >
                      <SelectTrigger className="pl-11 h-14 rounded-2xl border-2 focus:border-primary">
                        <SelectValue placeholder="Selecciona tu tipo de sangre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber" className="text-sm font-medium">Cédula de identidad</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="idNumber"
                      type="text"
                      placeholder="1234567890"
                      value={formData.idNumber}
                      onChange={(e) => updateField("idNumber", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university" className="text-sm font-medium">Universidad</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                    <Select
                      value={formData.university}
                      onValueChange={(value) => updateField("university", value)}
                    >
                      <SelectTrigger className="pl-11 h-14 rounded-2xl border-2 focus:border-primary">
                        <SelectValue placeholder="Selecciona tu universidad" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {UNIVERSITIES_NI.map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyName" className="text-sm font-medium">Nombre de contacto de emergencia</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="emergencyName"
                      type="text"
                      placeholder="María Pérez"
                      value={formData.emergencyName}
                      onChange={(e) => updateField("emergencyName", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-sm font-medium">Teléfono de emergencia</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="emergencyContact"
                      type="tel"
                      placeholder="+505 8888 8888"
                      value={formData.emergencyContact}
                      onChange={(e) => updateField("emergencyContact", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {err && (
              <div className="text-sm text-red-600 bg-red-100/70 rounded-xl p-3">
                {err}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 rounded-2xl text-lg font-semibold bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Procesando..." : step === 1 ? "Siguiente" : "Crear cuenta"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
