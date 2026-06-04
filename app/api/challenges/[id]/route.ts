import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db/drizzle";
import { challenges } from "@/db/schema";
import { IsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await IsAdmin();
        
        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        const { id } = await params;
        const challengeId = parseInt(id);
        
        if (isNaN(challengeId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }
        
        const data = await db.query.challenges.findFirst({
            where: eq(challenges.id, challengeId),
        });

        if (!data) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching challenge:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

        export async function PUT(
            req: NextRequest,
            { params }: { params: Promise<{ id: string }> }
        ) {
            try {
                const isAdmin = await IsAdmin();
                
                if (!isAdmin) {
                    return new NextResponse("Unauthorized", { status: 401 });
                }
                
                const { id } = await params;
                const challengeId = parseInt(id);
                
                if (isNaN(challengeId)) {
                    return new NextResponse("Invalid ID", { status: 400 });
                }
                
                const body = await req.json();
                console.log("📦 Updating challenge with body:", JSON.stringify(body, null, 2));

                const data = await db.update(challenges)
                    .set({
                        question: body.question,
                        type: body.type,
                        lessonId: body.lessonId,
                        order: body.order,
                    })
                    .where(eq(challenges.id, challengeId))
                    .returning();

                if (!data.length) {
                    return new NextResponse("Not Found", { status: 404 });
                }

                return NextResponse.json(data[0]);
            } catch (error) {
                console.error("Error updating challenge:", error);
                return new NextResponse("Internal Server Error", { status: 500 });
            }
        }

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await IsAdmin();
        
        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        const { id } = await params;
        const challengeId = parseInt(id);
        
        if (isNaN(challengeId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }
        
        const data = await db.delete(challenges)
            .where(eq(challenges.id, challengeId))
            .returning();

        if (!data.length) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error deleting challenge:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}