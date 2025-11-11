// scripts/osm-build.js
// Uso:
//   node scripts/osm-build.js \
//     --stops ./raw/managua-stops.geojson \
//     --routes ./raw/managua-bus-routes.json \
//     --out-stops ./public/data/managua-stops.json \
//     --out-routes ./public/data/managua-routes.json

const fs = require("fs");
const path = require("path");

// tiny arg parser
const args = Object.fromEntries(
    process.argv.slice(2).reduce((acc, a, i, arr) => {
        if (a.startsWith("--")) acc.push([a.replace(/^--/, ""), arr[i + 1]]);
        return acc;
    }, [])
);

function readJSON(p) {
    return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJSON(p, data) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
    console.log("✔ Wrote", p);
}

// 1) Build stops.json from GeoJSON
function buildStops(geojson) {
    if (!geojson || !Array.isArray(geojson.features)) {
        throw new Error("Invalid stops GeoJSON");
    }
    const out = geojson.features
        .filter(f => f && f.geometry && f.geometry.type === "Point")
        .map(f => {
            const id = String(f.id || f.properties?.["@id"] || f.properties?.id || Math.random().toString(36).slice(2));
            const name =
                f.properties?.name ||
                f.properties?.ref ||
                f.properties?.local_ref ||
                "Parada sin nombre";
            const [lng, lat] = f.geometry.coordinates;
            return {
                id,
                name,
                lat,
                lng,
                isSafe: true // puedes mejorar esto con tu propia lógica
            };
        });
    return out;
}

// 2) Build routes.json from Overpass JSON of relations + members
function buildRoutes(overpassJson, stopsOut) {
    if (!overpassJson || !Array.isArray(overpassJson.elements)) {
        throw new Error("Invalid routes Overpass JSON");
    }

    // indexar nodos por id para cruzar nombres de paradas
    const nodeIndex = new Map();
    for (const el of overpassJson.elements) {
        if (el.type === "node") nodeIndex.set(el.id, el);
    }

    // Para cada relation route=bus: usa nombre/ref y toma hasta 3 paradas (roles stop/platform)
    const routes = [];
    for (const el of overpassJson.elements) {
        if (el.type !== "relation") continue;
        const tags = el.tags || {};
        if (tags.route !== "bus") continue;

        const routeId = String(el.id);
        const routeName = tags.name || tags.ref || `Ruta ${routeId}`;
        const description = tags.from && tags.to ? `${tags.from} ↔ ${tags.to}` : (tags.description || null);

        const stopNames = [];
        if (Array.isArray(el.members)) {
            for (const m of el.members) {
                if (m.type === "node" && (m.role === "stop" || m.role === "platform")) {
                    const n = nodeIndex.get(m.ref);
                    if (!n) continue;
                    const nm = n.tags?.name || n.tags?.ref || "Parada";
                    stopNames.push(nm);
                }
                if (stopNames.length >= 3) break; // nos quedamos con 3 para mainStops
            }
        }

        routes.push({
            id: routeId,
            name: routeName,
            description,
            mainStops: stopNames.length ? stopNames : (stopsOut.slice(0, 3).map(s => s.name)),
            status: "ACTIVE",
            estimatedTime: "—",
            capacity: "—",
            isFavorite: false
        });
    }

    // Deja únicas por nombre para no repetir (opcional)
    const uniqueByName = [];
    const seen = new Set();
    for (const r of routes) {
        const key = r.name;
        if (seen.has(key)) continue;
        seen.add(key);
        uniqueByName.push(r);
    }

    // Si salen muchas, recorta a 50 para empezar (opcional)
    return uniqueByName.slice(0, 50);
}

function main() {
    const stopsIn = args["stops"];
    const routesIn = args["routes"];
    const outStops = args["out-stops"] || "./public/data/managua-stops.json";
    const outRoutes = args["out-routes"] || "./public/data/managua-routes.json";

    if (!stopsIn || !routesIn) {
        console.error("Faltan args. Ejemplo:");
        console.error('node scripts/osm-build.js --stops ./raw/managua-stops.geojson --routes ./raw/managua-bus-routes.json');
        process.exit(1);
    }

    const stopsGeo = readJSON(stopsIn);
    const stopsOut = buildStops(stopsGeo);
    writeJSON(outStops, stopsOut);

    const routesOverpass = readJSON(routesIn);
    const routesOut = buildRoutes(routesOverpass, stopsOut);
    writeJSON(outRoutes, routesOut);

    console.log("✅ Listo. Puedes setear NEXT_PUBLIC_DATA_SOURCE=osm y probar.");
}

main();
