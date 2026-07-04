import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProgress } from "@/db/queries";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { examPassages, examAttempts } from "@/db/schema";
import Link from "next/link";
import { Clock, BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ExamListPage() {
    const { userId } = await auth();
    if (!userId) redirect("/");

    const userProgress = await getUserProgress(userId);
    if (!userProgress?.activeCourseId) redirect("/courses");

    // Get passages for active course
    const passages = await db.query.examPassages.findMany({
        where: eq(examPassages.courseId, userProgress.activeCourseId),
        orderBy: (examPassages, { asc }) => [asc(examPassages.order)],
    });

    // Get user's attempts
    const attempts = await db.query.examAttempts.findMany({
        where: eq(examAttempts.userId, userId),
    });

    const attemptsByPassage = attempts.reduce((acc, a) => {
        if (!acc[a.passageId] || a.totalScore > acc[a.passageId].totalScore) {
            acc[a.passageId] = a;
        }
        return acc;
    }, {} as Record<number, typeof attempts[0]>);

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-700 mb-2">Exams</h1>
                <p className="text-neutral-500">
                    Reading comprehension exams for your current course.
                </p>
            </div>

            {passages.length === 0 ? (
                <div className="text-center py-16 text-neutral-400">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" />
                    <p className="font-medium">No exams available yet.</p>
                    <p className="text-sm mt-1">Check back later or ask your instructor.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-y-4">
                    {passages.map(passage => {
                        const attempt = attemptsByPassage[passage.id];
                        return (
                            <div key={passage.id} className="border-2 rounded-xl p-5 flex items-center justify-between hover:border-sky-300 transition">
                                <div className="flex flex-col gap-y-1">
                                    <div className="flex items-center gap-x-2">
                                        <h2 className="font-bold text-neutral-700">{passage.title}</h2>
                                        {attempt && (
                                            <span className="flex items-center gap-x-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                <CheckCircle className="h-3 w-3" />
                                                Attempted
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-x-3 text-sm text-neutral-400">
                                        <span className="flex items-center gap-x-1">
                                            <Clock className="h-3 w-3" />
                                            {passage.timeLimit} min
                                        </span>
                                        {attempt && (
                                            <span>
                                                Best score: <strong className="text-neutral-600">{attempt.totalScore}</strong>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button asChild variant={attempt ? "primaryOutline" : "secondary"}>
                                    <Link href={`/exam/${passage.id}`}>
                                        {attempt ? "Retry" : "Start"}
                                    </Link>
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}