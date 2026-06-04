import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { challengeAttempts } from "@/db/schema";

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();

    await db.insert(challengeAttempts).values({
        userId,
        challengeId: body.challengeId,
        lessonId: body.lessonId,
        correct: body.correct,
    });

    return NextResponse.json({ success: true });
}