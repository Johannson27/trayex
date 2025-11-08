import { prisma } from "../src/prisma";

async function main() {
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log("❌ No hay usuarios, crea uno primero (por registro o consola)");
        return;
    }

    const userId = user.id;

    await prisma.notification.createMany({
        data: [
            {
                userId,
                channel: "SYSTEM",
                template: "Bienvenido a Trayex",
                payload: { body: "Tu cuenta fue creada correctamente." } as any,
                status: "SENT",
                sentAt: new Date(),
            },
            {
                userId,
                channel: "ROUTE",
                template: "Ruta 1 - Norte",
                payload: {
                    title: "Salida en 10 minutos",
                    body: "La unidad está por llegar a tu parada.",
                } as any,
                status: "SENT",
                sentAt: new Date(Date.now() - 1000 * 60 * 15),
            },
        ],
    });

    console.log("✅ Semillas insertadas correctamente");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
