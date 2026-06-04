import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db/drizzle";
import { challengeOptions, challenges } from "@/db/schema";  // Added challenges import
import { IsAdmin } from "@/lib/admin";
import { eq, inArray } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";  // Fixed import

type ChallengeOption = InferSelectModel<typeof challengeOptions>;

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Allow': 'GET, POST, OPTIONS',
        },
    });
}

export async function GET(req: NextRequest) {
    try {
        const isAdmin = await IsAdmin();
        if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

        const url = new URL(req.url);
        const filterParam = url.searchParams.get("filter");
        let data: ChallengeOption[] = [];

        if (filterParam) {
            try {
                const filter = JSON.parse(filterParam);

                if (filter.lessonId) {
                    // Fetch challenges for the lesson
                    const lessonChallenges = await db.query.challenges.findMany({
                        where: eq(challenges.lessonId, Number(filter.lessonId)),
                    });
                    const challengeIds = lessonChallenges.map(c => c.id);

                    if (challengeIds.length === 0) {
                        data = [];
                    } else {
                        data = await db.query.challengeOptions.findMany({
                            where: inArray(challengeOptions.challengeId, challengeIds),
                        });
                    }
                } else if (filter.challengeId) {
                    data = await db.query.challengeOptions.findMany({
                        where: eq(challengeOptions.challengeId, Number(filter.challengeId)),
                    });
                } else if (filter.id && Array.isArray(filter.id) && filter.id.length > 0) {
                    if (filter.id.length === 1) {
                        const record = await db.query.challengeOptions.findFirst({
                            where: eq(challengeOptions.id, filter.id[0]),
                        });
                        data = record ? [record] : [];
                    } else {
                        data = await db.query.challengeOptions.findMany({
                            where: inArray(challengeOptions.id, filter.id),
                        });
                    }
                } else {
                    data = await db.query.challengeOptions.findMany();
                }
            } catch (error) {
                console.error("Filter parse error:", error);
                data = await db.query.challengeOptions.findMany();
            }
        } else {
            data = await db.query.challengeOptions.findMany();
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching challenge options:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const isAdmin = await IsAdmin();
        
        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        console.log("📦 Received body:", JSON.stringify(body, null, 2));
        
        // Validate required fields
        if (!body.text) {
            return new NextResponse("Text is required", { status: 400 });
        }
        if (body.correct === undefined) {
            return new NextResponse("Correct flag is required", { status: 400 });
        }
        if (!body.challengeId) {
            return new NextResponse("Challenge ID is required", { status: 400 });
        }

        const data = await db.insert(challengeOptions).values({
            text: body.text,
            correct: body.correct,
            challengeId: body.challengeId,
            imageSrc: body.imageSrc || null,
            audioSrc: body.audioSrc || null,
        }).returning();
        
        console.log("✅ Challenge option created:", data[0]);
        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("❌ Error creating challenge option:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}