"use client"

import { useState } from "react"
import {
  User,
  MapPin,
  Phone,
  Shield,
  HelpCircle,
  MessageCircle,
  FileText,
  Bus,
  Star,
  Settings,
  LogOut,
  Plus,
  X,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { UserRole } from "@/app/page"

type ProfileScreenProps = {
  userRole: UserRole
}

type EmergencyContact = {
  id: string
  name: string
  phone: string
  relationship: string
}

export function ProfileScreen({ userRole }: ProfileScreenProps) {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: "1", name: "María González", phone: "+593 99 123 4567", relationship: "Madre" },
  ])
  const [shareTrip, setShareTrip] = useState(true)
  const [analytics, setAnalytics] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)

  const handleAddContact = () => {
    if (emergencyContacts.length < 2) {
      setShowAddContact(true)
    }
  }

  const handleRemoveContact = (id: string) => {
    setEmergencyContacts(emergencyContacts.filter((c) => c.id !== id))
  }

  const renderStudentView = () => (
    <div className="flex-1 overflow-y-auto pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 px-6 pt-8 pb-12 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center border-4 border-primary-foreground/30">
            <User className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Ana Rodríguez</h1>
            <p className="text-primary-foreground/80 text-sm">Ingeniería de Sistemas</p>
            <p className="text-primary-foreground/60 text-xs mt-1">Facultad de Ciencias</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* Favorite Stops */}
        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">Paradas favoritas</h2>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
              <div>
                <p className="font-medium text-sm">Campus Central</p>
                <p className="text-xs text-muted-foreground">Parada principal</p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                Favorita
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
              <div>
                <p className="font-medium text-sm">Av. Principal</p>
                <p className="text-xs text-muted-foreground">Cerca de casa</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Emergency Contacts */}
        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="font-semibold text-foreground">Contactos de emergencia</h2>
            </div>
            {emergencyContacts.length < 2 && (
              <Button variant="ghost" size="sm" className="rounded-full" onClick={handleAddContact}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
                <div className="flex-1">
                  <p className="font-medium text-sm">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.phone}</p>
                  <p className="text-xs text-muted-foreground mt-1">{contact.relationship}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-destructive hover:text-destructive"
                  onClick={() => handleRemoveContact(contact.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {emergencyContacts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No hay contactos de emergencia</p>
            )}
            {emergencyContacts.length < 2 && (
              <p className="text-xs text-muted-foreground text-center">
                Puedes agregar hasta {2 - emergencyContacts.length} contacto(s) más
              </p>
            )}
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-semibold text-foreground">Privacidad</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">Compartir viaje</p>
                <p className="text-xs text-muted-foreground">Permite que tus contactos vean tu ubicación</p>
              </div>
              <Switch checked={shareTrip} onCheckedChange={setShareTrip} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">Análisis de uso</p>
                <p className="text-xs text-muted-foreground">Ayúdanos a mejorar la app</p>
              </div>
              <Switch checked={analytics} onCheckedChange={setAnalytics} />
            </div>
          </div>
        </Card>

        {/* Help and Support */}
        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Ayuda y soporte</h2>
          </div>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start rounded-2xl h-auto py-3">
              <MessageCircle className="w-5 h-5 mr-3 text-primary" />
              <div className="text-left">
                <p className="font-medium text-sm">Chat en vivo</p>
                <p className="text-xs text-muted-foreground">Habla con nuestro equipo</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start rounded-2xl h-auto py-3">
              <FileText className="w-5 h-5 mr-3 text-primary" />
              <div className="text-left">
                <p className="font-medium text-sm">Preguntas frecuentes</p>
                <p className="text-xs text-muted-foreground">Encuentra respuestas rápidas</p>
              </div>
            </Button>
          </div>
        </Card>

        {/* Emergency Call Button */}
        <Button
          size="lg"
          className="w-full h-16 rounded-3xl text-lg font-bold bg-destructive hover:bg-destructive/90 shadow-lg"
        >
          <Phone className="w-6 h-6 mr-2" />
          Llamada de emergencia
        </Button>

        {/* Settings and Logout */}
        <div className="space-y-2 pt-2">
          <Button variant="outline" className="w-full justify-start rounded-2xl h-auto py-3 bg-transparent">
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Configuración</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-2xl h-auto py-3 text-destructive hover:text-destructive"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </div>
  )

  const renderDriverView = () => (
    <div className="flex-1 overflow-y-auto pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 px-6 pt-8 pb-12 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center border-4 border-primary-foreground/30">
            <User className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Carlos Mendoza</h1>
            <Badge className="mt-2 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              Conductor
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* Bus Information */}
        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bus className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Información del bus</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
              <p className="text-sm text-muted-foreground">Número de bus</p>
              <p className="font-bold text-lg text-primary">B-12</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
              <p className="text-sm text-muted-foreground">Marca del transporte</p>
              <p className="font-medium text-sm">TransUniversitario</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
              <p className="text-sm text-muted-foreground">Capacidad de pasajeros</p>
              <p className="font-medium text-sm">40 personas</p>
            </div>
          </div>
        </Card>

        {/* Vehicle Details */}
        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-semibold text-foreground">Detalles del vehículo</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
              <p className="text-sm text-muted-foreground">Placa</p>
              <p className="font-bold text-sm">ABC-1234</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl">
              <p className="text-sm text-muted-foreground">Modelo</p>
              <p className="font-medium text-sm">Mercedes-Benz Sprinter 2022</p>
            </div>
          </div>
        </Card>

        {/* Trip Status */}
        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">Estado del viaje</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl border-2 border-accent/30">
              <div>
                <p className="font-bold text-sm text-foreground">Estado actual</p>
                <p className="text-xs text-muted-foreground mt-1">Última actualización: hace 2 min</p>
              </div>
              <Badge className="bg-accent text-accent-foreground">En camino</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-muted/50 rounded-2xl text-center">
                <p className="text-xs text-muted-foreground">Viajes hoy</p>
                <p className="font-bold text-lg text-primary">8</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-2xl text-center">
                <p className="text-xs text-muted-foreground">Pasajeros</p>
                <p className="font-bold text-lg text-primary">156</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-2xl text-center">
                <p className="text-xs text-muted-foreground">Horas</p>
                <p className="font-bold text-lg text-primary">6.5</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Rating */}
        <Card className="p-5 rounded-3xl shadow-lg border-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
            <h2 className="font-semibold text-foreground">Calificación</h2>
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 rounded-2xl">
            <div>
              <p className="text-sm text-muted-foreground">Promedio general</p>
              <p className="text-xs text-muted-foreground mt-1">Basado en 234 calificaciones</p>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <p className="font-bold text-2xl text-foreground">4.8</p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">Comentarios recientes:</p>
            <div className="p-3 bg-muted/50 rounded-2xl">
              <p className="text-xs italic text-foreground">"Excelente conductor, muy puntual y amable"</p>
            </div>
          </div>
        </Card>

        {/* Settings and Logout */}
        <div className="space-y-2 pt-2">
          <Button variant="outline" className="w-full justify-start rounded-2xl h-auto py-3 bg-transparent">
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Configuración</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start rounded-2xl h-auto py-3 text-destructive hover:text-destructive"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </div>
  )

  return userRole === "student" ? renderStudentView() : renderDriverView()
}
