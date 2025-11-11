// src/components/map-widget.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type LatLng = { lat: number; lng: number };
type MapWidgetProps = {
    center: LatLng;
    zoom?: number;
    style?: React.CSSProperties;
    buses?: LatLng[];
    stops?: (LatLng & { name?: string })[];
    path?: LatLng[];
    origin?: LatLng | null;
    destination?: LatLng | null;
    stopsOnPath?: (LatLng & { name?: string })[];
};

export function MapWidget({
    center,
    zoom = 13,
    style,
    buses = [],
    stops = [],
    path,
    origin = null,
    destination = null,
    stopsOnPath = [],
}: MapWidgetProps) {
    const mapRef = useRef<google.maps.Map | null>(null);
    const [ready, setReady] = useState(false);

    const busMarkersRef = useRef<google.maps.Marker[]>([]);
    const stopMarkersRef = useRef<google.maps.Marker[]>([]);
    const routeMarkersRef = useRef<google.maps.Marker[]>([]);
    const polylineRef = useRef<google.maps.Polyline | null>(null);

    // Espera a que el script de Google Maps esté disponible
    useEffect(() => {
        let mounted = true;

        const ensureGoogle = () => {
            if (typeof window !== "undefined" && (window as any).google?.maps) {
                mounted && setReady(true);
                return true;
            }
            return false;
        };

        if (ensureGoogle()) return;

        // reintenta varias veces durante ~2s
        const id = setInterval(() => {
            if (ensureGoogle()) clearInterval(id);
        }, 100);

        // por si el script dispara onload
        const handler = () => ensureGoogle();
        window.addEventListener("load", handler);

        return () => {
            mounted = false;
            clearInterval(id);
            window.removeEventListener("load", handler);
        };
    }, []);

    // Inicializa o recentra mapa
    useEffect(() => {
        if (!ready) return;
        const el = document.getElementById("trayex-map") as HTMLElement | null;
        if (!el) return;

        if (!mapRef.current) {
            mapRef.current = new google.maps.Map(el, {
                center,
                zoom,
                disableDefaultUI: true,
            });
        } else {
            mapRef.current.setCenter(center);
        }
    }, [ready, center, zoom]);

    const clearMarkers = (ref: React.MutableRefObject<google.maps.Marker[]>) => {
        ref.current.forEach((m) => m.setMap(null));
        ref.current = { current: [] } as any;
    };

    // Buses
    useEffect(() => {
        if (!ready || !mapRef.current) return;
        clearMarkers(busMarkersRef);
        busMarkersRef.current = buses.map(
            (p) =>
                new google.maps.Marker({
                    position: p,
                    map: mapRef.current!,
                    icon: { path: google.maps.SymbolPath.CIRCLE, scale: 5 },
                    title: "Bus",
                })
        );
    }, [ready, buses]);

    // Paradas sueltas (si las usas)
    useEffect(() => {
        if (!ready || !mapRef.current) return;
        clearMarkers(stopMarkersRef);
        stopMarkersRef.current = stops.map(
            (p) =>
                new google.maps.Marker({
                    position: p,
                    map: mapRef.current!,
                    icon: { path: google.maps.SymbolPath.CIRCLE, scale: 3 },
                    title: p.name ?? "Parada",
                })
        );
    }, [ready, stops]);

    // Polilínea + origen/destino + paradas del tramo
    useEffect(() => {
        if (!ready || !mapRef.current) return;

        if (polylineRef.current) {
            polylineRef.current.setMap(null);
            polylineRef.current = null;
        }
        clearMarkers(routeMarkersRef);

        if (path && path.length > 1) {
            polylineRef.current = new google.maps.Polyline({
                path,
                strokeOpacity: 1,
                strokeWeight: 4,
                map: mapRef.current,
            });
        }

        if (origin) {
            routeMarkersRef.current.push(
                new google.maps.Marker({
                    position: origin,
                    map: mapRef.current!,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 7,
                        fillColor: "#10B981",
                        fillOpacity: 1,
                        strokeColor: "#0B815A",
                        strokeWeight: 2,
                    },
                    title: "Inicio",
                })
            );
        }

        if (destination) {
            routeMarkersRef.current.push(
                new google.maps.Marker({
                    position: destination,
                    map: mapRef.current!,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 7,
                        fillColor: "#EF4444",
                        fillOpacity: 1,
                        strokeColor: "#B91C1C",
                        strokeWeight: 2,
                    },
                    title: "Destino",
                })
            );
        }

        if (stopsOnPath && stopsOnPath.length) {
            routeMarkersRef.current.push(
                ...stopsOnPath.map(
                    (s) =>
                        new google.maps.Marker({
                            position: { lat: s.lat, lng: s.lng },
                            map: mapRef.current!,
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 4,
                                fillColor: "#3B82F6",
                                fillOpacity: 1,
                                strokeColor: "#1D4ED8",
                                strokeWeight: 1,
                            },
                            title: s.name ?? "Parada",
                        })
                )
            );
        }
    }, [ready, path, origin, destination, stopsOnPath]);

    if (!ready) {
        return (
            <div
                id="trayex-map"
                style={{ width: "100%", height: "100%", ...(style || {}) }}
            >
                {/* placeholder mientras carga el script */}
            </div>
        );
    }

    return (
        <div id="trayex-map" style={{ width: "100%", height: "100%", ...(style || {}) }} />
    );
}
