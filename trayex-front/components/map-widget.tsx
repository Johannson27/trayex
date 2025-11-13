"use client";

import { useEffect, useRef, useState } from "react";

type LatLng = { lat: number; lng: number };
type EnrichedLatLng = LatLng & { name?: string };

type MapWidgetProps = {
    center: LatLng;
    zoom?: number;
    style?: React.CSSProperties;
    buses?: LatLng[];
    stops?: EnrichedLatLng[];
    path?: LatLng[];
    origin?: LatLng | null;
    destination?: LatLng | null;
    stopsOnPath?: EnrichedLatLng[];
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

    // Esperar a que google.maps exista
    useEffect(() => {
        let mounted = true;

        const ensureGoogle = () => {
            if (typeof window !== "undefined" && (window as any).google?.maps) {
                if (mounted) setReady(true);
                return true;
            }
            return false;
        };

        if (ensureGoogle()) return;

        const id = window.setInterval(() => {
            if (ensureGoogle()) window.clearInterval(id);
        }, 100);

        const onLoad = () => ensureGoogle();
        window.addEventListener("load", onLoad);

        return () => {
            mounted = false;
            window.clearInterval(id);
            window.removeEventListener("load", onLoad);
        };
    }, []);

    // Inicializar / recentrar mapa
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
        ref.current.length = 0; // 👈 vaciamos el array sin re-asignar
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

    // Paradas “sueltas”
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

    // Línea + origen/destino + paradas del tramo
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
                map: mapRef.current!,
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
            stopsOnPath.forEach((s) => {
                routeMarkersRef.current.push(
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
                );
            });
        }
    }, [ready, path, origin, destination, stopsOnPath]);

    if (!ready) {
        return (
            <div
                id="trayex-map"
                style={{ width: "100%", height: "100%", ...(style || {}) }}
            />
        );
    }

    return (
        <div
            id="trayex-map"
            style={{ width: "100%", height: "100%", ...(style || {}) }}
        />
    );
}

// 👇 por si en algún sitio lo importas como default
export default MapWidget;
