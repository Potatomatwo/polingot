import { NextResponse, NextRequest } from "next/server";
import db from "@/db/drizzle";
import { examPassages, examBlanks, examQuestions } from "@/db/schema";
import { IsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await IsAdmin();
        if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;
        const passageId = parseInt(id);
        if (isNaN(passageId)) return new NextResponse("Invalid ID", { status: 400 });

        const passage = await db.query.examPassages.findFirst({
            where: eq(examPassages.id, passageId),
        });
        if (!passage) return new NextResponse("Not Found", { status: 404 });

        // Also fetch blanks and questions so edit form can pre-populate
        const blanks = await db.query.examBlanks.findMany({
            where: eq(examBlanks.passageId, passageId),
        });
        const questions = await db.query.examQuestions.findMany({
            where: eq(examQuestions.passageId, passageId),
            orderBy: (examQuestions, { asc }) => [asc(examQuestions.order)],
        });

        return NextResponse.json({
            ...passage,
            blanks: blanks.map(b => ({
                blankNumber: b.blankNumber,
                correctAnswer: b.correctAnswer,
                acceptedAnswers: b.acceptedAnswers || "",
            })),
            questions: questions.map(q => ({
                question: q.question,
                sampleAnswer: q.sampleAnswer,
                markScheme: q.markScheme,
                maxMarks: q.maxMarks,
            })),
        });
    } catch (error) {
        console.error("Error fetching exam passage:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await IsAdmin();
        if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;
        const passageId = parseInt(id);
        if (isNaN(passageId)) return new NextResponse("Invalid ID", { status: 400 });

        const body = await req.json();

        const [passage] = await db.update(examPassages).set({
            title: body.title,
            content: body.content,
            courseId: body.courseId,
            timeLimit: body.timeLimit || 30,
            order: body.order || 0,
        }).where(eq(examPassages.id, passageId)).returning();

        if (!passage) return new NextResponse("Not Found", { status: 404 });

        // Delete and re-insert blanks
        await db.delete(examBlanks).where(eq(examBlanks.passageId, passageId));
        if (body.blanks && Array.isArray(body.blanks) && body.blanks.length > 0) {
            await db.insert(examBlanks).values(
                body.blanks.map((b: any) => ({
                    passageId,
                    blankNumber: b.blankNumber,
                    correctAnswer: b.correctAnswer,
                    acceptedAnswers: b.acceptedAnswers || null,
                }))
            );
        }

        // Delete and re-insert questions
        await db.delete(examQuestions).where(eq(examQuestions.passageId, passageId));
        if (body.questions && Array.isArray(body.questions) && body.questions.length > 0) {
            await db.insert(examQuestions).values(
                body.questions.map((q: any, i: number) => ({
                    passageId,
                    question: q.question,
                    sampleAnswer: q.sampleAnswer || "",
                    markScheme: q.markScheme || "",
                    maxMarks: q.maxMarks || 3,
                    order: i,
                }))
            );
        }

        return NextResponse.json(passage);
    } catch (error) {
        console.error("Error updating exam passage:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await IsAdmin();
        if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

        const { id } = await params;
        const passageId = parseInt(id);
        if (isNaN(passageId)) return new NextResponse("Invalid ID", { status: 400 });

        const [deleted] = await db.delete(examPassages)
            .where(eq(examPassages.id, passageId))
            .returning();

        if (!deleted) return new NextResponse("Not Found", { status: 404 });

        return NextResponse.json(deleted);
    } catch (error) {
        console.error("Error deleting exam passage:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}