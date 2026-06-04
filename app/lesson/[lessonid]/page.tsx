import { getLesson, getUserProgress, getUserSubscription, getNextLesson, getUnit } from "@/db/queries";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Quiz } from "../quiz";
import { KanaChartModal } from "../kana-chart-modal";

type Props = {
    params: Promise<{
        lessonid: string;
    }>;
};

export default async function LessonIdPage({ params }: Props) {
    console.log("=== PAGE DEBUG ===");
    
    const { lessonid } = await params;
    console.log("1. Lesson ID from params:", lessonid);
    
    const { userId } = await auth();
    console.log("2. UserId:", userId);
    
    if (!userId) {
        console.log("❌ REDIRECT: No userId");
        redirect("/learn");
    }

    const lessonId = parseInt(lessonid);
    console.log("3. Parsed lessonId:", lessonId);
    
    if (isNaN(lessonId)) {
        console.log("❌ REDIRECT: Invalid lessonId (NaN)");
        redirect("/learn");
    }

    const lessonData = getLesson(lessonId);
    const userProgressData = getUserProgress(userId);
    const userSubscriptionData = getUserSubscription();
    const nextLessonData = getNextLesson(lessonId);

    const [lesson, userProgress, userSubscription, nextLesson] = await Promise.all([
        lessonData,
        userProgressData,
        userSubscriptionData,
        nextLessonData,
    ]);
    
    console.log("4. Lesson exists?", !!lesson);
    console.log("5. UserProgress exists?", !!userProgress);
    console.log("5.5. UserSubscription exists?", !!userSubscription);
    console.log("5.6. NextLesson exists?", !!nextLesson);
    
    if (!lesson) {
        console.log("❌ REDIRECT: Lesson not found for ID:", lessonId);
        redirect("/learn");
    }
    
    if (!userProgress) {
        console.log("❌ REDIRECT: User progress not found for userId:", userId);
        redirect("/learn");
    }

    // Get the unit to find courseId
    const unit = await getUnit(lesson.unitId);
    const courseId = unit?.courseId;
    console.log("7.9. Course ID:", courseId);
    console.log("🔍 DEBUG courseId:");
    console.log("Unit:", unit);
    console.log("CourseId from unit:", courseId);
    const isPro = userSubscription?.isActive === true;
    const displayHearts = isPro ? 999 : userProgress.hearts;

    console.log("6. Lesson challenges count:", lesson.challenges?.length);
    console.log("7. User hearts:", userProgress.hearts);
    console.log("7.5. Is Pro:", isPro);
    console.log("7.6. Display hearts:", displayHearts);
    console.log("7.7. Next Lesson ID:", nextLesson?.id);

    const initialPercentage = lesson.challenges.length > 0
        ? (lesson.challenges.filter(c => c.completed).length / lesson.challenges.length) * 100
        : 0;
    
    console.log("🔍 DETAILED DEBUG:");
    console.log("UserSubscription object:", JSON.stringify(userSubscription, null, 2));
    console.log("isPro value:", isPro);
    console.log("displayHearts value:", displayHearts);
    console.log("Original hearts:", userProgress.hearts);    
    console.log("8. Initial percentage:", initialPercentage);
    console.log("✅ RENDERING QUIZ COMPONENT");
    console.log("🔴 PASSING TO QUIZ:", {
        userSubscription: userSubscription,
        isPro: userSubscription?.isActive,
        displayHearts: displayHearts,
        nextLessonId: nextLesson?.id,
        courseId: courseId
    });
    
    return (
    <>
        <Quiz 
            initialLessonId={lesson.id}
            initialLessonChallenges={lesson.challenges}
            initialHearts={displayHearts}
            initialPercentage={initialPercentage}
            userSubscription={userSubscription}
            nextLessonId={nextLesson?.id}
            courseId={courseId}
        />
        <KanaChartModal courseId={courseId} isFinished={false} />
    </>
);
}