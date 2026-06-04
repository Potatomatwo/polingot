import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db/drizzle";
import { units } from "@/db/schema";
import { IsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log("=== HIT units/[id]/route.ts ==="); 
    try {
        const isAdmin = await IsAdmin();
        
        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        
        const { id } = await params;
        const unitId = parseInt(id);
        
        if (isNaN(unitId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }
        
        const data = await db.query.units.findFirst({
            where: eq(units.id, unitId),
        });

        if (!data) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching unit:", error);
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
        const unitId = parseInt(id);
        
        if (isNaN(unitId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }
        
        const body = await req.json();

        const updateData: any = {
            title: body.title,
            imageSrc: body.imageSrc,
        };

        const data = await db.update(units)
            .set(updateData)
            .where(eq(units.id, unitId))
            .returning();

        if (!data.length) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error updating units:", error);
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
        const unitId = parseInt(id);
        
        if (isNaN(unitId)) {
            return new NextResponse("Invalid ID", { status: 400 });
        }
        
        const data = await db.delete(units)
            .where(eq(units.id, unitId))
            .returning();

        if (!data.length) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error deleting unit:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}