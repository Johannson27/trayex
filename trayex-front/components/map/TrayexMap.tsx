"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* Icons */
const busIcon = "https://cdn-icons-png.flaticon.com/512/61/61088.png";
const userIcon = "https://cdn-icons-png.flaticon.com/512/1077/1077012.png";

/* Función para animar movimiento de un marker */
function animateTo(marker: any, newPos: any, duration = 2000) {
    const oldPos = marker.getPosition();
    const steps = 60;
    let i = 0;

    const interval = setInterval(() => {
        i++;
        const lat = oldPos.lat() + ((newPos.lat - oldPos.lat()) * i) / steps;
        const lng = oldPos.lng() + ((newPos.lng - oldPos.lng()) * i) / steps;

        marker.setPosition({ lat, lng });

        if (i >= steps) clearInterval(interval);
    }, duration / steps);
}

// Distancia entre puntos
function distanceInMeters(a: any, b: any) {
    const R = 6371e3;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;

    const la1 = (a.lat * Math.PI) / 180;
    const la2 = (b.lat * Math.PI) / 180;

    const A =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
}

export default function TrayexMap({ origin, destination }: any) {
    const mapRef = useRef<any>(null);
    const map = useRef<any>(null);
    const userMarker = useRef<any>(null);
    const busMarkers = useRef<Map<number, any>>(new Map());
    const sentNearbyNotification = useRef(false);

    const [loaded, setLoaded] = useState(false);

    // Esperar Google Maps
    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).google) {
            setLoaded(true);
        } else {
            const interval = setInterval(() => {
                if ((window as any).google) {
                    setLoaded(true);
                    clearInterval(interval);
                }
            }, 300);
        }
    }, []);

    // Inicializar mapa
    useEffect(() => {
        if (!loaded || map.current) return;

        map.current = new google.maps.Map(mapRef.current, {
            center: { lat: 12.127, lng: -86.268 },
            zoom: 14,
            disableDefaultUI: true,
        });

        // Capa de tráfico (C)
        const traffic = new google.maps.TrafficLayer();
        traffic.setMap(map.current);

        locateUser();
        updateBuses();
        const t = setInterval(updateBuses, 7000);

        return () => clearInterval(t);
    }, [loaded]);

    // Ubicacion del usuario
    const locateUser = useCallback(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;

                if (userMarker.current) userMarker.current.setMap(null);

                userMarker.current = new google.maps.Marker({
                    map: map.current,
                    position: { lat: latitude, lng: longitude },
                    icon: { url: userIcon, scaledSize: new google.maps.Size(36, 36) },
                });

                map.current.setCenter({ lat: latitude, lng: longitude });
            },
            () => {
                const fallback = { lat: 12.127, lng: -86.268 };

                userMarker.current = new google.maps.Marker({
                    map: map.current,
                    position: fallback,
                    icon: { url: userIcon, scaledSize: new google.maps.Size(36, 36) },
                });

                map.current.setCenter(fallback);
            }
        );
    }, []);

    // Buses realtime + movimiento animado (A+D)
    const updateBuses = useCallback(async () => {
        const mock = [
            { id: 1, lat: 12.134, lng: -86.265 },
            { id: 2, lat: 12.130, lng: -86.269 },
            { id: 3, lat: 12.125, lng: -86.260 },
        ];

        mock.forEach((bus) => {
            const newPos = { lat: bus.lat, lng: bus.lng };

            // crear marker
            if (!busMarkers.current.has(bus.id)) {
                const marker = new google.maps.Marker({
                    map: map.current,
                    position: newPos,
                    icon: {
                        url: busIcon,
                        scaledSize: new google.maps.Size(38, 38),
                    },
                });

                busMarkers.current.set(bus.id, marker);
            } else {
                // animar movimiento (A)
                const marker = busMarkers.current.get(bus.id);
                animateTo(marker, newPos, 2000);

                // (D) detectar si está cerca
                if (userMarker.current) {
                    const dist = distanceInMeters(
                        marker.getPosition().toJSON(),
                        userMarker.current.getPosition().toJSON()
                    );

                    if (dist < 250 && !sentNearbyNotification.current) {
                        sendLocalPush(
                            "Tu bus está cerca 🚍",
                            "Prepárate, el bus está a menos de 250 metros."
                        );
                        sentNearbyNotification.current = true;
                    }
                }
            }
        });
    }, []);

    // Notificación (local) si el bus está cerca
    const sendLocalPush = (title: string, body: string) => {
        try {
            new Notification(title, { body });
        } catch { }
    };

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden">
            <div ref={mapRef} className="w-full h-full" />
        </div>
    );
}
