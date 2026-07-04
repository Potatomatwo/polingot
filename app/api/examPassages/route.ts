import { NextResponse, NextRequest } from "next/server";
import db from "@/db/drizzle";
import { examPassages, examBlanks, examQuestions } from "@/db/schema";
import { IsAdmin } from "@/lib/admin";
import { eq, inArray } from "drizzle-orm";

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
                    data = await db.query.examPassages.findMany({
                        where: eq(examPassages.courseId, Number(filter.courseId)),
                    });
                } else if (filter.id && Array.isArray(filter.id) && filter.id.length > 0) {
                    data = await db.query.examPassages.findMany({
                        where: inArray(examPassages.id, filter.id),
                    });
                } else {
                    data = await db.query.examPassages.findMany();
                }
            } catch {
                data = await db.query.examPassages.findMany();
            }
        } else {
            data = await db.query.examPassages.findMany();
        }

        return NextResponse.json(data, {
        headers: {
            "Content-Range": `examPassages 0-${data.length - 1}/${data.length}`,
            "Access-Control-Expose-Headers": "Content-Range",
        },
    });
    } catch (error) {
        console.error("Error fetching exam passages:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const isAdmin = await IsAdmin();
        if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();

        const [passage] = await db.insert(examPassages).values({
            title: body.title,
            content: body.content,
            courseId: body.courseId,
            timeLimit: body.timeLimit || 30,
            order: body.order || 0,
        }).returning();

        // Save blanks
        if (body.blanksJson) {
            try {
                const blanksData = typeof body.blanksJson === "string"
                    ? JSON.parse(body.blanksJson)
                    : body.blanksJson;
                if (Array.isArray(blanksData) && blanksData.length > 0) {
                    await db.insert(examBlanks).values(
                        blanksData.map((b: any) => ({
                            passageId: passage.id,
                            blankNumber: b.blankNumber,
                            correctAnswer: b.correctAnswer,
                            acceptedAnswers: b.acceptedAnswers || null,
                        }))
                    );
                }
            } catch (e) {
                console.error("Error saving blanks:", e);
            }
        }

        // Save questions
        if (body.questionsJson) {
            try {
                const questionsData = typeof body.questionsJson === "string"
                    ? JSON.parse(body.questionsJson)
                    : body.questionsJson;
                if (Array.isArray(questionsData) && questionsData.length > 0) {
                    await db.insert(examQuestions).values(
                        questionsData.map((q: any, i: number) => ({
                            passageId: passage.id,
                            question: q.question,
                            sampleAnswer: q.sampleAnswer || "",
                            markScheme: q.markScheme || "",
                            maxMarks: q.maxMarks || 3,
                            order: i,
                        }))
                    );
                }
            } catch (e) {
                console.error("Error saving questions:", e);
            }
        }

        return NextResponse.json(passage);
    } catch (error) {
        console.error("Error creating exam passage:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}