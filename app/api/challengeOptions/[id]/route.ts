import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db/drizzle";
import { challengeOptions } from "@/db/schema";
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
        const optionId = parseInt(id);
        
        if (isNaN(optionId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }
        
        const data = await db.query.challengeOptions.findFirst({
            where: eq(challengeOptions.id, optionId),
        });

        if (!data) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching challenge option:", error);
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
        const optionId = parseInt(id);
        
        if (isNaN(optionId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }
        
        const body = await req.json();

        const updateData: any = {
            text: body.text,
            correct: body.correct,
            challengeId: body.challengeId,
        };
        
        if (body.imageSrc !== undefined) updateData.imageSrc = body.imageSrc;
        if (body.audioSrc !== undefined) updateData.audioSrc = body.audioSrc;

        const data = await db.update(challengeOptions)
            .set(updateData)
            .where(eq(challengeOptions.id, optionId))
            .returning();

        if (!data.length) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error updating challenge option:", error);
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
        const optionId = parseInt(id);
        
        if (isNaN(optionId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }
        
        const data = await db.delete(challengeOptions)
            .where(eq(challengeOptions.id, optionId))
            .returning();

        if (!data.length) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error deleting challenge option:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}