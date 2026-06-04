import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db/drizzle";
import { lessons } from "@/db/schema";
import { IsAdmin } from "@/lib/admin";
import { eq, inArray } from "drizzle-orm";

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
                if (filter.unitId) {
                    data = await db.query.lessons.findMany({
                        where: eq(lessons.unitId, Number(filter.unitId)),
                    });
                } else if (filter.id && Array.isArray(filter.id) && filter.id.length > 0) {
                    data = filter.id.length === 1
                        ? [await db.query.lessons.findFirst({ where: eq(lessons.id, filter.id[0]) })].filter(Boolean)
                        : await db.query.lessons.findMany({ where: inArray(lessons.id, filter.id) });
                } else {
                    data = await db.query.lessons.findMany();
                }
            } catch {
                data = await db.query.lessons.findMany();
            }
        } else {
            data = await db.query.lessons.findMany();
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching lessons:", error);
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

        const data = await db.insert(lessons).values({
            title: body.title,
            description: body.description || "",
            unitId: body.unitId,
            order: body.order || 0,
        }).returning();
        
        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error creating lesson:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
