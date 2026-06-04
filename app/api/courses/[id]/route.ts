import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db/drizzle";
import { courses } from "@/db/schema";
import { IsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log("=== HIT courses/[id]/route.ts ==="); 
    try {
        const isAdmin = await IsAdmin();
        
        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        const { id } = await params;
        const courseId = parseInt(id);
        
        if (isNaN(courseId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }
        
        const data = await db.query.courses.findFirst({
            where: eq(courses.id, courseId),
        });

        if (!data) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching course:", error);
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
        const courseId = parseInt(id);
        
        if (isNaN(courseId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }
        
        const body = await req.json();

        const updateData: any = {
            title: body.title,       // 👈 correct fields
            imageSrc: body.imageSrc, // 👈 correct fields
        };

        const data = await db.update(courses)
            .set(updateData)
            .where(eq(courses.id, courseId))
            .returning();

        if (!data.length) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error updating course:", error);
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
        const courseId = parseInt(id);
        
        if (isNaN(courseId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }
        
        const data = await db.delete(courses)
            .where(eq(courses.id, courseId))
            .returning();

        if (!data.length) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error deleting course:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}