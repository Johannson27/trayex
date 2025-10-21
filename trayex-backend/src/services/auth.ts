// src/services/auth.ts
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { signSessionToken } from "./jwt";

export async function registerUser(
    email: string | null,
    phone: string | null,
    password: string,
    fullName?: string,
    extra?: {
        bloodType?: string;
        idNumber?: string;
        university?: string;
        emergencyName?: string;
        emergencyContact?: string;
    }
) {
    const existing = await prisma.user.findFirst({
        where: { OR: [{ email: email ?? undefined }, { phone: phone ?? undefined }] },
    });
    if (existing) throw new Error("Email o teléfono ya registrado");

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { email, phone, role: "STUDENT" },
    });

    await prisma.passwordCredential.create({
        data: { userId: user.id, passwordHash },
    });

    await prisma.studentProfile.create({
        data: {
            userId: user.id,
            fullName: fullName?.trim() || undefined,
            bloodType: extra?.bloodType || undefined,
            idNumber: extra?.idNumber || undefined,
            university: extra?.university || undefined,
            emergencyName: extra?.emergencyName || undefined,
            emergencyContact: extra?.emergencyContact || undefined,
        },
    });

    const token = signSessionToken({ sub: user.id, role: user.role });

    const full = await prisma.user.findUnique({
        where: { id: user.id },
        include: { student: true },
    });

    return {
        user: {
            id: full!.id,
            email: full!.email,
            phone: full!.phone,
            role: full!.role,
            student: full!.student ?? null,
        },
        token,
    };
}
export async function validateUser(
    { email, phone }: { email?: string; phone?: string },
    password: string
) {
    const user = await prisma.user.findFirst({
        where: { OR: [{ email: email ?? undefined }, { phone: phone ?? undefined }] },
        include: { credential: true, student: true }, // incluye student
    });
    if (!user || !user.credential) throw new Error("Credenciales inválidas");

    const ok = await bcrypt.compare(password, user.credential.passwordHash);
    if (!ok) throw new Error("Credenciales inválidas");

    const token = signSessionToken({ sub: user.id, role: user.role });

    return {
        user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            student: user.student ?? null, // manda perfil
        },
        token,
    };
}
