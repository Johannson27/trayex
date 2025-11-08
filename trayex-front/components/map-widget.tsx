// src/components/map-widget.tsx
"use client";

import { useEffect, useRef } from "react";

/** Tipos */
type LatLng = { lat: number; lng: number };
export type MapMarker = { id: string; lat: number; lng: number; label?: string };

type MapWidgetProps = {
    center: LatLng;
    zoom?: number;

    /** Marcadores genéricos (lo que usas en Dashboard) */
    markers?: MapMarker[];

    /** Compat con la versión anterior */
    buses?: LatLng[];
    stops?: LatLng[];

    className?: string;

    /** Soporta style y containerStyle (como en tu Dashboard) */
    style?: React.CSSProperties;
    containerStyle?: React.CSSProperties;
};

declare global {
    interface Window {
        __gmapsLoader?: Promise<void>;
    }
    // Si no tienes @types/google.maps, puedes descomentar:
    // var google: any;
}

/** Carga la API de Google Maps una sola vez en el navegador */
function loadGoogleMaps(apiKey: string): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    if (window.google?.maps) return Promise.resolve();

    if (!window.__gmapsLoader) {
        window.__gmapsLoader = new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
                apiKey
            )}&libraries=marker&loading=async`; // <-- loading=async
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
            document.head.appendChild(script);
        });
    }
    return window.__gmapsLoader!;
}

export function MapWidget({
    center,
    zoom = 14,
    markers = [],
    buses = [],
    stops = [],
    className,
    style,
    containerStyle,
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

                // Crear o actualizar el mapa
                if (!mapRef.current) {
                    mapRef.current = new google.maps.Map(ref.current, {
                        center,
                        zoom,
                        // mapId: "OPCIONAL_SI_TIENES",
                        disableDefaultUI: true,
                    });
                } else {
                    mapRef.current.setCenter(center);
                    mapRef.current.setZoom(zoom);
                }

                // Limpiar marcadores anteriores
                markersRef.current.forEach((m) => m.setMap(null));
                markersRef.current = [];

                // 1) marcador central (usuario)
                markersRef.current.push(
                    new google.maps.Marker({
                        position: center,
                        map: mapRef.current!,
                        title: "Tú",
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

                // 2) marcadores genéricos (azul oscuro)
                markers.forEach((m) => {
                    markersRef.current.push(
                        new google.maps.Marker({
                            position: { lat: m.lat, lng: m.lng },
                            map: mapRef.current!,
                            title: m.label ?? m.id,
                            label: m.label,
                            icon: {
                                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                                scale: 6,
                                fillColor: "#1e3a8a",
                                fillOpacity: 1,
                                strokeColor: "#ffffff",
                                strokeWeight: 1.5,
                            },
                        })
                    );
                });

                // 3) Compat: buses (verde)
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

                // 4) Compat: paradas (amarillo)
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
            markersRef.current.forEach((m) => m.setMap(null));
            markersRef.current = [];
        };
    }, [
        center.lat,
        center.lng,
        zoom,
        JSON.stringify(markers),
        JSON.stringify(buses),
        JSON.stringify(stops),
    ]);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                width: "100%",
                height: "100%",
                ...containerStyle,
                ...style,
            }}
        />
    );
}
