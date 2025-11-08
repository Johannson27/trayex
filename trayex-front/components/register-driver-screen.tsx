"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Bus, User, Mail, Lock, Phone, Car, FileText, Upload } from "lucide-react"

interface RegisterDriverScreenProps {
  onBack: () => void
  onSuccess?: () => void
}

export function RegisterDriverScreen({ onBack, onSuccess }: RegisterDriverScreenProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    busNumber: "",
    brand: "",
    capacity: "",
    plate: "",
    license: null as File | null,
    idCard: null as File | null,
    circulation: null as File | null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Handle registration
      console.log("Register driver:", formData)
      onSuccess?.()
    }
  }

  const updateField = (field: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field: string, file: File | null) => {
    updateField(field, file)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary p-6 pb-12 rounded-b-3xl shadow-lg">
        <button
          onClick={step === 1 ? onBack : () => setStep(step - 1)}
          className="flex items-center gap-2 text-primary-foreground mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Bus className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground">Registro Conductor</h1>
        </div>
        <p className="text-primary-foreground/80 ml-15">
          {step === 1 ? "Datos personales" : step === 2 ? "Datos del vehículo" : "Documentación"}
        </p>

        {/* Progress Indicator */}
        <div className="flex gap-2 mt-6">
          <div
            className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-primary-foreground" : "bg-primary-foreground/30"}`}
          />
          <div
            className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-primary-foreground" : "bg-primary-foreground/30"}`}
          />
          <div
            className={`h-1 flex-1 rounded-full ${step >= 3 ? "bg-primary-foreground" : "bg-primary-foreground/30"}`}
          />
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 p-6 -mt-6 overflow-y-auto">
        <div className="bg-card rounded-3xl shadow-xl p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Nombre completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Carlos Rodríguez"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Teléfono
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+593 99 123 4567"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="conductor@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
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
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="busNumber" className="text-sm font-medium">
                    Número de bus
                  </Label>
                  <div className="relative">
                    <Bus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="busNumber"
                      type="text"
                      placeholder="Bus 42"
                      value={formData.busNumber}
                      onChange={(e) => updateField("busNumber", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-sm font-medium">
                    Marca del vehículo
                  </Label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="brand"
                      type="text"
                      placeholder="Mercedes-Benz"
                      value={formData.brand}
                      onChange={(e) => updateField("brand", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-sm font-medium">
                    Capacidad de pasajeros
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="40"
                      value={formData.capacity}
                      onChange={(e) => updateField("capacity", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plate" className="text-sm font-medium">
                    Placa del vehículo
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="plate"
                      type="text"
                      placeholder="ABC-1234"
                      value={formData.plate}
                      onChange={(e) => updateField("plate", e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-2 focus:border-primary"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="license" className="text-sm font-medium">
                    Licencia de conducir vigente
                  </Label>
                  <div className="relative">
                    <label
                      htmlFor="license"
                      className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary transition-colors bg-muted/30"
                    >
                      <div className="text-center space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {formData.license ? formData.license.name : "Subir licencia"}
                        </p>
                      </div>
                      <input
                        id="license"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange("license", e.target.files?.[0] || null)}
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idCard" className="text-sm font-medium">
                    Cédula de identidad
                  </Label>
                  <div className="relative">
                    <label
                      htmlFor="idCard"
                      className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary transition-colors bg-muted/30"
                    >
                      <div className="text-center space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {formData.idCard ? formData.idCard.name : "Subir cédula"}
                        </p>
                      </div>
                      <input
                        id="idCard"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange("idCard", e.target.files?.[0] || null)}
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="circulation" className="text-sm font-medium">
                    Circulación del vehículo
                  </Label>
                  <div className="relative">
                    <label
                      htmlFor="circulation"
                      className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary transition-colors bg-muted/30"
                    >
                      <div className="text-center space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {formData.circulation ? formData.circulation.name : "Subir circulación"}
                        </p>
                      </div>
                      <input
                        id="circulation"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange("circulation", e.target.files?.[0] || null)}
                        required
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 rounded-2xl text-lg font-semibold bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              {step < 3 ? (
                <>
                  Siguiente
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
