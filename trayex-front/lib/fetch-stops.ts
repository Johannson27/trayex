import stops from "../raw/managua-stops.json"

type Stop = {
    name?: string
    lat: number
    lon: number
}

export function fetchNearbyStops(
    userLat: number,
    userLon: number,
    limit = 3
): Stop[] {
    if (!stops || !stops.features) return []

    const parsed = stops.features
        .map((f: any) => {
            const [lon, lat] = f.geometry.coordinates

            return {
                name: f.properties.name || "Parada",
                lat,
                lon,
                distance: getDistance(userLat, userLon, lat, lon)
            }
        })
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, limit)

    return parsed
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}
