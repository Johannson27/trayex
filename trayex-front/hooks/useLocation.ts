import { useEffect, useState } from "react";

export type GeoPosition = {
    lat: number;
    lon: number;
};

export function useLocation() {
    const [position, setPosition] = useState<GeoPosition | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude
                });
                setLoading(false);
            },
            () => {
                setLoading(false);
            }
        );
    }, []);

    return { position, loading };
}
