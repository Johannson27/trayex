// src/components/map-widget.tsx
"use client";

import { useEffect, useRef } from "react";

/** Tipos de props */
type LatLng = { lat: number; lng: number };

type MapWidgetProps = {
    center: LatLng;
    buses?: LatLng[];
    stops?: LatLng[];
    zoom?: number;
    className?: string;
    /** Altura/anchura si no quieres usar className */
    style?: React.CSSProperties;
};

declare global {
    interface Window {
        __gmapsLoader?: Promise<void>;
    }
    // Si instalas @types/google.maps tendrás tipado completo:
    // var google: any; // <- si no instalas tipos, descomenta esta línea para salir del paso
}

/** Carga la API de Maps una sola vez */
function loadGoogleMaps(apiKey: string): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    if (window.google?.maps) return Promise.resolve();

    if (!window.__gmapsLoader) {
        window.__gmapsLoader = new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=marker`;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
            document.head.appendChild(script);
        });
    }
    return window.__gmapsLoader!;
}

/** Componente React real (no clase externa) */
export function MapWidget({
    center,
    buses = [],
    stops = [],
    zoom = 14,
    className,
    style,
}: MapWidgetProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const mapRef = useRef<google.maps.Map | null>(null);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
        if (!apiKey) {
            console.warn("Falta NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
            return;
        }

        let cancelled = false;

        loadGoogleMaps(apiKey)
            .then(() => {
                if (cancelled || !ref.current) return;

                // Crear el mapa (si no existe)
                if (!mapRef.current) {
                    mapRef.current = new google.maps.Map(ref.current, {
                        center,
                        zoom,
                        mapId: "DEMO_MAP_ID", // opcional si tienes un Map ID
                        disableDefaultUI: true,
                    });
                } else {
                    mapRef.current.setCenter(center);
                    mapRef.current.setZoom(zoom);
                }

                // Limpiar marcadores anteriores
                markersRef.current.forEach((m) => m.setMap(null));
                markersRef.current = [];

                // Marcador del usuario (center)
                markersRef.current.push(
                    new google.maps.Marker({
                        position: center,
                        map: mapRef.current!,
                        title: "Tú",
                        // Ícono sencillo
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "#2563eb",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                        },
                    })
                );

                // Marcadores de buses
                buses.forEach((b, i) => {
                    markersRef.current.push(
                        new google.maps.Marker({
                            position: b,
                            map: mapRef.current!,
                            title: `Bus ${i + 1}`,
                            icon: {
                                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                                scale: 6,
                                fillColor: "#16a34a",
                                fillOpacity: 1,
                                strokeColor: "#ffffff",
                                strokeWeight: 1.5,
                            },
                        })
                    );
                });

                // Marcadores de paradas (stops)
                stops.forEach((s, i) => {
                    markersRef.current.push(
                        new google.maps.Marker({
                            position: s,
                            map: mapRef.current!,
                            title: `Parada ${i + 1}`,
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 6,
                                fillColor: "#f59e0b",
                                fillOpacity: 1,
                                strokeColor: "#ffffff",
                                strokeWeight: 1.5,
                            },
                        })
                    );
                });
            })
            .catch((err) => {
                console.error("[MapWidget] Error:", err);
            });

        return () => {
            cancelled = true;
            // Limpieza: quitamos marcadores
            markersRef.current.forEach((m) => m.setMap(null));
            markersRef.current = [];
        };
    }, [center.lat, center.lng, zoom, JSON.stringify(buses), JSON.stringify(stops)]);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                width: "100%",
                height: "100%",
                ...style,
            }}
        />
    );
}
