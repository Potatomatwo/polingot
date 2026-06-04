import { NextResponse, NextRequest } from "next/server";
import { IsAdmin } from "@/lib/admin";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    const isAdmin = await IsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { userId, unlimited } = body;

    await db.update(userProgress).set({
        hearts: unlimited ? 999 : 5,
    }).where(eq(userProgress.userId, userId));

    return NextResponse.json({ success: true });
}