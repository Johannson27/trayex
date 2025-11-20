import { NextResponse } from "next/server";

const PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(req: Request) {
    console.log("PLACES_API_KEY:", PLACES_API_KEY);

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query || query.trim().length < 2) {
        return NextResponse.json({ universities: [] });
    }

    try {
        // Use PLACES API NEW (v1)
        const url = `https://places.googleapis.com/v1/places:searchText`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": PLACES_API_KEY!,
                "X-Goog-FieldMask":
                    "places.id,places.displayName,places.formattedAddress,places.location,places.photos",
            },
            body: JSON.stringify({
                textQuery: query,
                languageCode: "es",
                regionCode: "NI",
            }),
        });

        const data = await response.json();

        // Normalizar resultados
        const universities =
            data.places?.map((place: any) => ({
                placeId: place.id,
                name: place.displayName?.text || "",
                address: place.formattedAddress || "",
                lat: place.location?.latitude || 0,
                lng: place.location?.longitude || 0,

                photo:
                    place.photos?.[0]?.name
                        ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${PLACES_API_KEY}&max_width=800`
                        : null,
            })) || [];

        return NextResponse.json({ universities });
    } catch (error: any) {
        return NextResponse.json({ error: String(error) });
    }

}
