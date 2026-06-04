import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { lessonCompletions } from "@/db/schema";

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();

    await db.insert(lessonCompletions).values({
        userId,
        lessonId: body.lessonId,
        heartsAtStart: body.heartsAtStart,
        heartsAtEnd: body.heartsAtEnd,
        xpEarned: body.xpEarned,
        timeSeconds: body.timeSeconds,
        mistakeCount: body.mistakeCount,
    });

    return NextResponse.json({ success: true });
}