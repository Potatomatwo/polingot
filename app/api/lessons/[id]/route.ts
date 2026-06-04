import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db/drizzle";
import { lessons } from "@/db/schema";
import { IsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
        console.log("=== HIT lessons/[id]/route.ts ==="); 
    try {
        const isAdmin = await IsAdmin();
        
        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        const { id } = await params;
        const lessonId = parseInt(id);
        
        if (isNaN(lessonId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }
        
        const data = await db.query.lessons.findFirst({
            where: eq(lessons.id, lessonId),
        });

        if (!data) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching lesson:", error);
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
        const lessonId = parseInt(id);
        
        if (isNaN(lessonId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }
        
        const body = await req.json();

        const updateData: any = {
            title: body.title,
            unitId: body.unitId,
            order: body.order,
        };

        const data = await db.update(lessons)
            .set(updateData)
            .where(eq(lessons.id, lessonId))
            .returning();

        if (!data.length) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error updating lesson:", error);
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
        const lessonId = parseInt(id);
        
        if (isNaN(lessonId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }
        
        const data = await db.delete(lessons)
            .where(eq(lessons.id, lessonId))
            .returning();

        if (!data.length) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error deleting lesson:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}