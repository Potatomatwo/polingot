import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Items } from "./items";
import { sql } from "drizzle-orm";
import db from "@/db/drizzle";
import { Quests } from "@/components/quests";

const ShopPage = async () => {
    const { userId } = await auth();
    
    if (!userId) {
        redirect("/");
    }
    
    const [userProgress, userSubscription] = await Promise.all([
        getUserProgress(userId),
        getUserSubscription(),
    ]);
    
    if (!userProgress) {
        redirect("/courses");
    }

    // If no active course, redirect to courses
    if (!userProgress.activeCourse) {
        redirect("/courses");
    }

    const isPro = userSubscription?.isActive === true; 
    // to enable subscrption: 
    // const isPro = true;

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress  
                    activeCourse={userProgress.activeCourse}
                    hearts={userProgress.hearts}
                    points={userProgress.points}
                    hasActiveSubscription={isPro}
                />
                <Quests points={userProgress.points} />
            </StickyWrapper>
            <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4">Shop</h1>
                <Items 
                    hearts={userProgress.hearts}
                    points={userProgress.points}
                    hasActiveSubscription={isPro}
                    darkMode={userProgress.darkMode || false}
                />
            </div>
        </div>
    );
};

export default ShopPage;