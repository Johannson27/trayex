// src/services/auth.ts
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { signSessionToken } from "./jwt";

export async function registerUser(email: string | null, phone: string | null, password: string) {
    // 1) validar que no exista otro usuario con mismo email o phone
    const existing = await prisma.user.findFirst({
        where: { OR: [{ email: email ?? undefined }, { phone: phone ?? undefined }] },
    });
    if (existing) throw new Error("Email o teléfono ya registrado");

    // 2) hash del password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3) crear el usuario
    const user = await prisma.user.create({
        data: { email, phone, role: "STUDENT" },
    });

    // 4) crear su credencial asociada
    await prisma.passwordCredential.create({
        data: { userId: user.id, passwordHash },
    });

    // 5) firmar token
    const token = signSessionToken({ sub: user.id, role: user.role });

    return {
        user: { id: user.id, email: user.email, phone: user.phone, role: user.role },
        token,
    };
}

export async function validateUser(
    { email, phone }: { email?: string; phone?: string },
    password: string
) {
    // buscar al usuario junto con la credencial
    const user = await prisma.user.findFirst({
        where: { OR: [{ email: email ?? undefined }, { phone: phone ?? undefined }] },
        include: { credential: true },
    });
    if (!user || !user.credential) throw new Error("Credenciales inválidas");

    const ok = await bcrypt.compare(password, user.credential.passwordHash);
    if (!ok) throw new Error("Credenciales inválidas");

    const token = signSessionToken({ sub: user.id, role: user.role });

    return {
        user: { id: user.id, email: user.email, phone: user.phone, role: user.role },
        token,
    };
}
