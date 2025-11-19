export async function reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

        const res = await fetch(url, {
            headers: {
                "User-Agent": "Trayex/1.0"
            }
        });

        if (!res.ok) return "Managua";

        const data = await res.json();
        const addr = data.address || {};

        return (
            addr.neighbourhood ||
            addr.suburb ||
            addr.city_district ||
            addr.village ||
            addr.town ||
            addr.city ||
            "Managua"
        );
    } catch {
        return "Managua";
    }
}
