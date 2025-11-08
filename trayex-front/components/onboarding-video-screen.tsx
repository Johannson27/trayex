"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bus, Play, SkipForward } from "lucide-react"

interface OnboardingVideoScreenProps {
  onComplete: () => void
}

export function OnboardingVideoScreen({ onComplete }: OnboardingVideoScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Bus className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground">Bienvenido a Trayex</h1>
          <p className="text-primary-foreground/80 text-lg">Tu transporte universitario seguro</p>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video bg-card rounded-3xl overflow-hidden shadow-2xl">
          {!isPlaying ? (
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/90 to-secondary/90 hover:from-primary hover:to-secondary transition-all"
            >
              <div className="w-20 h-20 rounded-full bg-primary-foreground flex items-center justify-center">
                <Play className="w-10 h-10 text-primary ml-2" />
              </div>
            </button>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <video
                className="w-full h-full object-cover"
                autoPlay
                controls
                onEnded={onComplete}
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              >
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onComplete}
            size="lg"
            className="w-full h-14 rounded-2xl text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Comenzar a usar Trayex
          </Button>
          <button
            onClick={onComplete}
            className="w-full text-primary-foreground/70 hover:text-primary-foreground text-sm font-medium flex items-center justify-center gap-2"
          >
            <SkipForward className="w-4 h-4" />
            Saltar video
          </button>
        </div>
      </div>
    </div>
  )
}
