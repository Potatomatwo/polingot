import { getLesson, getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Quiz } from "./quiz";
import { Promo } from "@/components/promo";

const LessonPage = async () =>{
    const { userId } = await auth();
    if (!userId) {
        redirect("/learn");
    }

    const lessonData = getLesson();
    const userProgressData = getUserProgress(userId);

    const[
        lesson,
        userProgress,
    ] = await Promise.all([
        lessonData,
        userProgressData,
    ]);

    if (!lesson|| !userProgress) {
        redirect("/learn")
    }
    <Promo />

    const initialPercentage = lesson.challenges
    .filter((challenge) => challenge.completed)
    .length / lesson.challenges.length * 100;

    return(
        <Quiz 
        initialLessonId={lesson.id}
        initialLessonChallenges={lesson.challenges}
        initialHearts={userProgress.hearts}
        initialPercentage={initialPercentage}
        userSubscription={null}
        />
    );
};

export default LessonPage;
