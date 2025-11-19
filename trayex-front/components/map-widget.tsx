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

    const mapRef = useRef<any>(null);
    const [ready, setReady] = useState(false);

    const busMarkersRef = useRef<any[]>([]);
    const stopMarkersRef = useRef<any[]>([]);
    const routeMarkersRef = useRef<any[]>([]);
    const polylineRef = useRef<any>(null);

    const [directionsPath, setDirectionsPath] = useState<LatLng[] | null>(null);

    // Esperar que google maps exista
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

    // Inicialización del mapa
    useEffect(() => {
        if (!ready) return;
        const el = document.getElementById("trayex-map") as HTMLElement | null;
        if (!el) return;

        if (!mapRef.current) {
            // @ts-ignore
            mapRef.current = new google.maps.Map(el, {
                center,
                zoom,
                disableDefaultUI: true,
            });
        } else {
            mapRef.current.setCenter(center);
        }
    }, [ready, center, zoom]);

    const clearMarkers = (ref: any) => {
        ref.current.forEach((m: any) => m.setMap(null));
        ref.current.length = 0;
    };

    // Buses
    useEffect(() => {
        if (!ready || !mapRef.current) return;
        clearMarkers(busMarkersRef);

        busMarkersRef.current = buses.map((p) => {
            // @ts-ignore
            return new google.maps.Marker({
                position: p,
                map: mapRef.current!,
                // @ts-ignore
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 5 },
                title: "Bus",
            });
        });
    }, [ready, buses]);

    // Paradas
    useEffect(() => {
        if (!ready || !mapRef.current) return;
        clearMarkers(stopMarkersRef);

        stopMarkersRef.current = stops.map((p) => {
            // @ts-ignore
            return new google.maps.Marker({
                position: p,
                map: mapRef.current!,
                // @ts-ignore
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 3 },
                title: p.name ?? "Parada",
            });
        });
    }, [ready, stops]);

    // Google Directions si no hay path manual
    useEffect(() => {
        if (!ready || !mapRef.current) return;

        if (path && path.length > 1) {
            setDirectionsPath(null);
            return;
        }

        if (!origin || !destination) return;

        // @ts-ignore
        const service = new google.maps.DirectionsService();

        service.route(
            {
                origin,
                destination,
                // @ts-ignore
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result: any, status: any) => {
                // @ts-ignore
                if (status === google.maps.DirectionsStatus.OK &&
                    result?.routes?.[0]?.overview_path) {
                    const pts = result.routes[0].overview_path.map((p: any) => ({
                        lat: p.lat(),
                        lng: p.lng(),
                    }));
                    setDirectionsPath(pts);
                } else {
                    setDirectionsPath(null);
                }
            }
        );
    }, [ready, path, origin, destination]);

    // Polyline + markers de ruta
    useEffect(() => {
        if (!ready || !mapRef.current) return;

        if (polylineRef.current) {
            polylineRef.current.setMap(null);
            polylineRef.current = null;
        }
        clearMarkers(routeMarkersRef);

        const effectivePath =
            path && path.length > 1
                ? path
                : directionsPath && directionsPath.length > 1
                    ? directionsPath
                    : null;

        if (effectivePath) {
            // @ts-ignore
            polylineRef.current = new google.maps.Polyline({
                path: effectivePath,
                strokeColor: "#1D4ED8",
                strokeOpacity: 1,
                strokeWeight: 5,
                map: mapRef.current!,
            });

            // @ts-ignore
            const bounds = new google.maps.LatLngBounds();
            effectivePath.forEach((p) => {
                // @ts-ignore
                bounds.extend(new google.maps.LatLng(p.lat, p.lng));
            });
            mapRef.current.fitBounds(bounds);
        }

        if (origin) {
            // @ts-ignore
            routeMarkersRef.current.push(
                new google.maps.Marker({
                    position: origin,
                    map: mapRef.current!,
                    icon: {
                        // @ts-ignore
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
            // @ts-ignore
            routeMarkersRef.current.push(
                new google.maps.Marker({
                    position: destination,
                    map: mapRef.current!,
                    icon: {
                        // @ts-ignore
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

        if (stopsOnPath.length) {
            stopsOnPath.forEach((s) => {
                // @ts-ignore
                routeMarkersRef.current.push(
                    new google.maps.Marker({
                        position: { lat: s.lat, lng: s.lng },
                        map: mapRef.current!,
                        icon: {
                            // @ts-ignore
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

    return (
        <div
            id="trayex-map"
            style={{ width: "100%", height: "100%", ...(style || {}) }}
        />
    );
}

export default MapWidget;