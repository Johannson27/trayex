import { NextResponse } from "next/server";

const PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim();

    // Validación rápida
    if (!query || query.length < 2) {
        return NextResponse.json({ universities: [] });
    }

    console.log("PLACES_API_KEY:", PLACES_API_KEY);
    console.log("Searching for:", query);

    if (!PLACES_API_KEY) {
        console.error("⚠️ GOOGLE_MAPS_API_KEY no está definida en el entorno");
        return NextResponse.json({ universities: [], error: "Missing API key" });
    }

    try {
        const url = `https://places.googleapis.com/v1/places:searchText`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": PLACES_API_KEY,
                "X-Goog-FieldMask":
                    "places.id,places.displayName,places.formattedAddress,places.location,places.photos",
            },
            body: JSON.stringify({
                textQuery: query,
                languageCode: "es",
                regionCode: "NI",
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Error Google Places:", response.status, text);
            return NextResponse.json({ universities: [], error: text });
        }

        const data = await response.json();

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

        console.log("Found universities:", universities.length);

        return NextResponse.json({ universities });
    } catch (error: any) {
        console.error("Fetch error:", error);
        return NextResponse.json({ universities: [], error: String(error) });
    }
}
