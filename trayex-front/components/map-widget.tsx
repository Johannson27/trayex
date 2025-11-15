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

    // 👉 almacena el path calculado por Google Directions
    const [directionsPath, setDirectionsPath] = useState<LatLng[] | null>(null);

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
        ref.current.length = 0;
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

    // 👉 Cuando no tenemos path útil pero sí origen/destino, pedir DIRECTIONS a Google
    useEffect(() => {
        if (!ready || !mapRef.current) return;

        // Si ya viene un path bueno desde la ruta → no usamos Directions
        if (path && path.length > 1) {
            setDirectionsPath(null);
            return;
        }

        // Necesitamos al menos origen y destino
        if (!origin || !destination) return;

        const service = new google.maps.DirectionsService();

        service.route(
            {
                origin,
                destination,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (
                    status === google.maps.DirectionsStatus.OK &&
                    result &&
                    result.routes &&
                    result.routes[0]?.overview_path
                ) {
                    const pts = result.routes[0].overview_path.map((p) => ({
                        lat: p.lat(),
                        lng: p.lng(),
                    }));
                    console.log("🧭 Directions path recibido:", pts.length, "puntos");
                    setDirectionsPath(pts);
                } else {
                    console.warn("❌ Directions falló:", status, result);
                    setDirectionsPath(null);
                }
            }
        );
    }, [ready, path, origin, destination]);

    // Línea + origen/destino + paradas del tramo
    useEffect(() => {
        if (!ready || !mapRef.current) return;

        if (polylineRef.current) {
            polylineRef.current.setMap(null);
            polylineRef.current = null;
        }
        clearMarkers(routeMarkersRef);

        // escoger qué path dibujar: el de la ruta o el de Directions
        const effectivePath =
            path && path.length > 1
                ? path
                : directionsPath && directionsPath.length > 1
                    ? directionsPath
                    : null;

        if (effectivePath && effectivePath.length > 1) {
            console.log("🗺️ Dibujando polyline con", effectivePath.length, "puntos");
            polylineRef.current = new google.maps.Polyline({
                path: effectivePath,
                strokeColor: "#1D4ED8",
                strokeOpacity: 1,
                strokeWeight: 5,
                map: mapRef.current!,
            });

            const bounds = new google.maps.LatLngBounds();
            effectivePath.forEach((p) => bounds.extend(p));
            mapRef.current.fitBounds(bounds);
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
    }, [ready, path, directionsPath, origin, destination, stopsOnPath]);

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

export default MapWidget;
