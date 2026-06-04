import { NextResponse } from "next/server";
import { IsAdmin } from "@/lib/admin";
import db from "@/db/drizzle";
import { lessonCompletions, lessons, userProgress } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
    const isAdmin = await IsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    const completions = await db.query.lessonCompletions.findMany({
        orderBy: [desc(lessonCompletions.completedAt)],
        with: { lesson: true },
    });

    const users = await db.query.userProgress.findMany();

    return NextResponse.json({ completions, users });
}