import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db/drizzle";
import { units } from "@/db/schema";
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
                if (filter.courseId) {
                    data = await db.query.units.findMany({
                        where: eq(units.courseId, Number(filter.courseId)),
                    });
                } else if (filter.id && Array.isArray(filter.id) && filter.id.length > 0) {
                    data = filter.id.length === 1
                        ? [await db.query.units.findFirst({ where: eq(units.id, filter.id[0]) })].filter(Boolean)
                        : await db.query.units.findMany({ where: inArray(units.id, filter.id) });
                } else {
                    data = await db.query.units.findMany();
                }
            } catch {
                data = await db.query.units.findMany();
            }
        } else {
            data = await db.query.units.findMany();
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching units:", error);
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

        const data = await db.insert(units).values({
            title: body.title,
            description: body.description || "",
            courseId: body.courseId,
            order: body.order || 0,
        }).returning();

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error creating unit:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
