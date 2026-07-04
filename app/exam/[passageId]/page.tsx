import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { examPassages, examBlanks, examQuestions } from "@/db/schema";
import { ExamClient } from "./examcilent";


export default async function ExamPage({ params }: { params: Promise<{ passageId: string }> }) {
    const { passageId } = await params;
    const { userId } = await auth();
    if (!userId) redirect("/");

    const passageId_num = parseInt(passageId);
    if (isNaN(passageId_num)) redirect("/learn");

    const passage = await db.query.examPassages.findFirst({
        where: eq(examPassages.id, passageId_num),
    });
    if (!passage) redirect("/learn");

    const blanks = await db.query.examBlanks.findMany({
        where: eq(examBlanks.passageId, passageId_num),
    });

    const questions = await db.query.examQuestions.findMany({
        where: eq(examQuestions.passageId, passageId_num),
    });

    return (
        <ExamClient
            passage={passage}
            blanks={blanks}
            questions={questions}
            userId={userId}
        />
    );
}