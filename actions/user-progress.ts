"use server";

import db from "@/db/drizzle";
import { getCourseById, getUserProgress, getUserSubscription } from "@/db/queries";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { userProgress, challengeProgress, challenges } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { POINTS_TO_REFILL } from "@/constants";

export const purchaseDarkMode = async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const currentProgress = await getUserProgress(userId);
    if (!currentProgress) throw new Error("User progress not found");

    if (currentProgress.darkMode) {
        return { error: "already_owned" };
    }

    if (currentProgress.points < 500) {
        return { error: "insufficient_points" };
    }

    await db.update(userProgress).set({
        points: currentProgress.points - 500,
        darkMode: true,
    }).where(eq(userProgress.userId, userId));

    revalidatePath("/shop");
    revalidatePath("/learn");
    return { success: true };
};

export const toggleDarkMode = async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const currentProgress = await getUserProgress(userId);
    if (!currentProgress) throw new Error("User progress not found");

    await db.update(userProgress).set({
        darkMode: !currentProgress.darkMode,
    }).where(eq(userProgress.userId, userId));

    revalidatePath("/shop");
    revalidatePath("/learn");
    return { success: true, darkMode: !currentProgress.darkMode };
};

export const upsertUserProgress = async (courseId: number) => {

    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        throw new Error("Unauthorized");
    }

    const course = await getCourseById(courseId);

    if (!course) {
        throw new Error("Course not found.");
    }

    if (!course.units.length || !course.units[0].lessons.length) {
        throw new Error("Course is empty");
    }

    const existingUserProgress = await getUserProgress(userId);  

    if (existingUserProgress) {
        await db
            .update(userProgress)
            .set({
                activeCourseId: courseId,
                userName: user.firstName || "User",
                userImageSrc: user.imageUrl || "/icon.png"
            })
            .where(eq(userProgress.userId, userId));
    } else {
        await db.insert(userProgress).values({
            userId,
            activeCourseId: courseId,
            userName: user.firstName || "User",
            userImageSrc: user.imageUrl || "/icon.png"
        });
    }

    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
};

export const reduceHearts = async (challengeId: number, isPracticeMode: boolean = false) => {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // If in practice mode, don't reduce hearts
    if (isPracticeMode) {
        console.log("Practice mode - no hearts reduced");
        return { success: true, practiceMode: true };
    } //check for duplicates if you are enabling reduce hearts
        const currentUserProgress = await getUserProgress(userId);
    
    if (!currentUserProgress) {
        throw new Error("User progress not found.");
    }
        if (currentUserProgress.hearts === 0) {
        return { error: "hearts" };
    }
    
    //TEMPORARY DISABLING OF HEARTS, REMOVE THE BRACKETS IF NECESSARY
    /* const currentUserProgress = await getUserProgress(userId);
    const userSubscription = await getUserSubscription();

    const challenge = await db.query.challenges.findFirst({
        where: eq(challenges.id, challengeId),
    });
    if (!challenge) {
        throw new Error("Challenge not found");
    }

    const lessonId = challenge.lessonId;

    const existingChallengeProgress = await db.query.challengeProgress.findFirst({
        where: and(
            eq(challengeProgress.userId, userId),
            eq(challengeProgress.challengeId, challengeId),
        ),
    });
    const isPractice = !!existingChallengeProgress;

    if (!currentUserProgress) {
        throw new Error("User progress not found.");
    }

    // Pro users don't lose hearts
    if (userSubscription?.isActive) {
        return { success: true, proUser: true };
    }

    if (currentUserProgress.hearts === 0 && 
        !isPractice && 
        !userSubscription?.isActive
    ) {
        return { error: "hearts" };
    }
    
    await db.update(userProgress)
        .set({ 
            hearts: Math.max(currentUserProgress.hearts - 1, 0),    
        }).where(eq(userProgress.userId, userId));
    
    revalidatePath("/shop");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath("/lesson/");
    */
    return { success: true };
    
};

export const refillHearts = async () => {
    const { userId } = await auth();
    
    if (!userId) {
        return { error: "unauthorized" };
    }
    
    const currentUserProgress = await getUserProgress(userId);
    
    if (!currentUserProgress) {
        return { error: "not_found" };
    }

    const pointsNeeded = Number(POINTS_TO_REFILL) || 10;
    const currentPoints = Number(currentUserProgress.points) || 0;
    const currentHearts = Number(currentUserProgress.hearts) || 0;
    
    
    if (currentHearts === 5) {
        return { error: "already_full" };
    }
    
    if (currentPoints < pointsNeeded) {
        return { error: "insufficient_points" };
    }
    
    const newPoints = currentPoints - pointsNeeded;
    
    await db.update(userProgress)
        .set({
            hearts: 5,
            points: newPoints
        })
        .where(eq(userProgress.userId, userId));
    
    revalidatePath("/shop");
    revalidatePath("/learn");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    
    return { success: true, newHearts: 5, newPoints: newPoints };
};
