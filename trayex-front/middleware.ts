import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("trayex_token")?.value || "";
    return NextResponse.next();
}

export const config = {
    matcher: ["/app/:path*"],
};
