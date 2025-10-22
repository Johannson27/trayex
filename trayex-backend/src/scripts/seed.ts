import { prisma } from "../prisma";

async function main() {
    const count = await prisma.route.count();
    if (count > 0) {
        console.log("Routes already seeded");
        return;
    }

    await prisma.route.createMany({
        data: [
            {
                name: "Ruta 1 - Norte",
                description: "Campus Central → Zona Industrial",
                mainStops: ["Campus Central", "Av. Principal", "Centro Comercial", "Zona Industrial"] as any,
                status: "ACTIVE",
                capacity: 40,
            },
            {
                name: "Ruta 2 - Sur",
                description: "Campus Central → Residencias",
                mainStops: ["Campus Central", "Hospital", "Plaza Mayor", "Residencias"] as any,
                status: "SAFE",
                capacity: 40,
            },
            {
                name: "Ruta 3 - Este",
                description: "Campus Central → Parque Tecnológico",
                mainStops: ["Campus Central", "Biblioteca", "Estadio", "Parque Tecnológico"] as any,
                status: "INCIDENT",
                capacity: 40,
            },
            {
                name: "Ruta 4 - Oeste",
                description: "Campus Central → Terminal",
                mainStops: ["Campus Central", "Mercado", "Estación", "Terminal"] as any,
                status: "ACTIVE",
                capacity: 40,
            },
        ],
    });

    console.log("Seed done");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
