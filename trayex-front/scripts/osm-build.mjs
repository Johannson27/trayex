// scripts/osm-build.mjs
import fs from "fs";
import path from "path";

// --- parseo super simple de argumentos tipo --foo valor ---
function parseArgs() {
    const args = process.argv.slice(2);
    const out = {};
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith("--")) {
            const key = arg.slice(2);
            const val = args[i + 1];
            out[key] = val;
            i++;
        }
    }
    return out;
}

const args = parseArgs();

if (!args.stops || !args.routes || !args["out-stops"] || !args["out-routes"]) {
    console.error(
        "Uso: node scripts/osm-build.mjs --stops raw/managua-stops.geojson --routes raw/managua-bus-routes-overpass.json --out-stops public/data/managua-stops.json --out-routes public/data/managua-routes.json"
    );
    process.exit(1);
}

const stopsInput = path.resolve(args.stops);
const routesInput = path.resolve(args.routes);
const stopsOutput = path.resolve(args["out-stops"]);
const routesOutput = path.resolve(args["out-routes"]);

console.log("📥 Leyendo stops desde:", stopsInput);
console.log("📥 Leyendo rutas OSM desde:", routesInput);

// === 1) STOPS: GeoJSON -> formato de la app ===
const stopsGeo = JSON.parse(fs.readFileSync(stopsInput, "utf8"));

const stopsOut = (stopsGeo.features || []).map((feat, idx) => {
    const props = feat.properties || {};
    const coords = feat.geometry?.coordinates || [0, 0]; // [lng, lat]

    const id = String(
        props.id ??
        props.osm_id ??
        props["@id"] ??
        `stop-${idx}`
    );

    const name =
        props.name ||
        props.ref ||
        props["name:es"] ||
        "Parada";

    return {
        id,
        name,
        lat: Number(coords[1]),
        lng: Number(coords[0]),
        isSafe: true,
    };
});

fs.mkdirSync(path.dirname(stopsOutput), { recursive: true });
fs.writeFileSync(
    stopsOutput,
    JSON.stringify({ stops: stopsOut }, null, 2),
    "utf8"
);
console.log("✅ Generado:", stopsOutput, `(${stopsOut.length} paradas)`);

// === 2) ROUTES: Overpass JSON -> rutas con shape ===
const osm = JSON.parse(fs.readFileSync(routesInput, "utf8"));
const elements = osm.elements || [];

// indexar NODOS (aquí están los lat/lon de verdad)
const nodesById = new Map();
for (const el of elements) {
    if (el.type === "node") {
        nodesById.set(el.id, el); // tiene lat / lon
    }
}

// indexar WAYS (lista de ids de nodos)
const waysById = new Map();
for (const el of elements) {
    if (el.type === "way") {
        waysById.set(el.id, el); // tiene nodes: [...]
    }
}

// extraer solo las RELATIONS de bus
const relations = elements.filter(
    (el) => el.type === "relation" && el.tags?.route === "bus"
);

function buildShapeForRelation(rel) {
    const pts = [];

    for (const m of rel.members || []) {
        if (m.type !== "way") continue;
        const way = waysById.get(m.ref);
        if (!way || !Array.isArray(way.nodes)) continue;

        for (const nid of way.nodes) {
            const node = nodesById.get(nid);
            if (!node) continue;
            if (
                typeof node.lat === "number" &&
                typeof node.lon === "number"
            ) {
                pts.push({ lat: node.lat, lng: node.lon });
            }
        }
    }

    return pts;
}

const routesOut = [];

for (const rel of relations) {
    const tags = rel.tags || {};
    const ref = tags.ref || rel.id; // 101, 102, etc
    const shape = buildShapeForRelation(rel);

    if (!shape || shape.length < 2) {
        console.warn(
            `⚠️ Relation ${rel.id} (ref=${ref}) no tiene shape suficiente (${shape?.length || 0} puntos).`
        );
        continue;
    }

    const name =
        tags.name ||
        `Ruta ${ref}`;

    const desc =
        (tags.from && tags.to)
            ? `${tags.from} → ${tags.to}`
            : tags.operator || null;

    routesOut.push({
        id: `rt-${ref}`,
        name,
        description: desc,
        mainStops: [], // luego puedes rellenar con paradas reales
        status: "ACTIVE",
        estimatedTime: "—",
        capacity: "Bus estándar",
        isFavorite: false,
        shape,
    });
}

fs.mkdirSync(path.dirname(routesOutput), { recursive: true });
fs.writeFileSync(
    routesOutput,
    JSON.stringify({ routes: routesOut }, null, 2),
    "utf8"
);

console.log(
    "✅ Generado:",
    routesOutput,
    `(${routesOut.length} rutas con shape)`
);
