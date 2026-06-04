import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db/drizzle";
import { courses } from "@/db/schema";
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
        
        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const url = new URL(req.url);
        const filterParam = url.searchParams.get("filter");
        
        let data;
        
        if (filterParam) {
            try {
                const filter = JSON.parse(filterParam);
                if (filter.id && Array.isArray(filter.id) && filter.id.length > 0) {
                    if (filter.id.length === 1) {
                        // Single ID - use findFirst to get exact match
                        const record = await db.query.courses.findFirst({
                            where: eq(courses.id, filter.id[0]),
                        });
                        data = record ? [record] : [];
                    } else {
                        // Multiple IDs
                        data = await db.query.courses.findMany({
                            where: inArray(courses.id, filter.id),
                        });
                    }
                } else {
                    // No filter or empty filter
                    data = await db.query.courses.findMany();
                }
            } catch (e) {
                // If filter parsing fails, return all
                data = await db.query.courses.findMany();
            }
        } else {
            // No filter parameter
            data = await db.query.courses.findMany();
        }
        
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching courses:", error);
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

        const data = await db.insert(courses).values({
            title: body.title,
            imageSrc: body.imageSrc,
        }).returning();

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error creating course:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
