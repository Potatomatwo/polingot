import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Header } from "./header";
import { getCourseProgress, getLessonPercentage, getUnits, getUserProgress, getUserSubscription } from "@/db/queries";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Unit } from "./unit";
import { lessons, units as unitsSchema } from "@/db/schema";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";

const LearnPage = async () => {
    const { userId } = await auth();
    
    if (!userId) redirect("/courses");
    
    const courseProgressData = getCourseProgress();
    const lessonPercentageData = getLessonPercentage();
    const unitsData = getUnits();
    const userProgressData = getUserProgress(userId);
    const userSubscriptionData = getUserSubscription();
    
    const [
        userProgress,
        units,
        courseProgress,
        lessonPercentage,
        userSubscription,
    ] = await Promise.all([
        userProgressData,
        unitsData,
        courseProgressData,
        lessonPercentageData,
        userSubscriptionData,
    ]);

    if (!userProgress || !userProgress.activeCourse){
        redirect("/courses")
    }

    if (!courseProgress) {
        redirect("/courses");
    }

    const isPro = userSubscription?.isActive === true;

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress 
                    activeCourse={userProgress.activeCourse}
                    hearts={userProgress.hearts}
                    points={userProgress.points}
                    hasActiveSubscription={isPro}
                />
                {/* Promo section - only show if not Pro */}
                {!isPro && <Promo />}
                <Quests points={userProgress.points} />
            </StickyWrapper>
            <FeedWrapper>
                <Header title={userProgress.activeCourse.title} />
                {units.map((unit) => (
                    <div key={unit.id} className="mb-10"> 
                        <Unit
                            id={unit.id}
                            order={unit.order}
                            description={unit.description}
                            title={unit.title}
                            lessons={unit.lessons}
                            activeLesson={courseProgress.activeLesson as any}
                            activeLessonPercentage={lessonPercentage}
                        />
                    </div>
                ))}
            </FeedWrapper>        
        </div>
    );
};

export default LearnPage;
