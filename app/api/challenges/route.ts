import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db/drizzle";
import { challenges } from "@/db/schema";
import { IsAdmin } from "@/lib/admin";
import { eq, inArray, and } from "drizzle-orm";

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
        let data;

        if (filterParam) {
            try {
                const filter = JSON.parse(filterParam);
                if (filter.lessonId && filter.order !== undefined) {
                    // Both lessonId AND order — used for import upsert lookup
                    data = await db.query.challenges.findMany({
                        where: and(
                            eq(challenges.lessonId, Number(filter.lessonId)),
                            eq(challenges.order, Number(filter.order))
                        ),
                    });
                } else if (filter.lessonId) {
                    // Just lessonId — used for filter dropdown
                    data = await db.query.challenges.findMany({
                        where: eq(challenges.lessonId, Number(filter.lessonId)),
                    });
                } else if (filter.id && Array.isArray(filter.id) && filter.id.length > 0) {
                    data = filter.id.length === 1
                        ? [await db.query.challenges.findFirst({ where: eq(challenges.id, filter.id[0]) })].filter(Boolean)
                        : await db.query.challenges.findMany({ where: inArray(challenges.id, filter.id) });
                } else {
                    data = await db.query.challenges.findMany();
                }
            } catch {
                data = await db.query.challenges.findMany();
            }
        } else {
            data = await db.query.challenges.findMany();
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching challenges:", error);
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

        // Validate required fields
        if (!body.question) {
            return new NextResponse("Question is required", { status: 400 });
        }
        if (!body.type) {
            return new NextResponse("Type is required", { status: 400 });
        }
        if (!body.lessonId) {
            return new NextResponse("Lesson ID is required", { status: 400 });
        }

        const data = await db.insert(challenges).values({
            question: body.question,
            type: body.type,
            lessonId: body.lessonId,
            order: body.order || 0,
        }).returning();
        
        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("❌ Error creating challenge:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
