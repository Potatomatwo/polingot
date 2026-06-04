// app/(main)/quests/page.tsx

import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { FeedWrapper } from "@/components/feed-wrapper";
import Image from "next/image";
import { Promo } from "@/components/promo";
import { quests } from "@/constants";


const QuestsPage = async () => {    
    const { userId } = await auth();
    
    if (!userId) {
        redirect("/");
    }
    
    const [userProgress, userSubscription] = await Promise.all([
        getUserProgress(userId),
        getUserSubscription(),
    ]);
    
    if (!userProgress || !userProgress.activeCourse) {
        redirect("/courses");
    }

    const isPro = !!userSubscription?.isActive;
    const userPoints = userProgress.points || 0;

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress  
                    activeCourse={userProgress.activeCourse}
                    hearts={userProgress.hearts}
                    points={userPoints}
                    hasActiveSubscription={isPro}
                />
                              {!isPro && <Promo />}
            </StickyWrapper>
            <FeedWrapper>
                <div className="w-full flex flex-col items-center">
                    <Image
                        src="/quest.svg"
                        alt="Quests"
                        height={90}
                        width={90}
                    />
                    <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">
                        Quests
                    </h1>
                    <p className="text-muted-foreground text-center text-lg mb-6">
                        Complete quests by earning points
                    </p>
                    <div className="w-full space-y-4">
                        {quests.map((quest) => {
                            const progress = Math.min((userPoints / quest.value) * 100, 100);
                            const isCompleted = userPoints >= quest.value;
                            
                            return (
                                <div
                                    key={quest.title}
                                    className="flex items-center w-full p-4 gap-x-4 border rounded-lg"
                                >
                                    <Image 
                                        src="/lighting.svg"
                                        alt="Points"      
                                        width={60}
                                        height={60}                      
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-neutral-700 font-bold">
                                                {quest.title}
                                            </p>
                                            {isCompleted ? (
                                                <span className="text-green-500 font-bold">
                                                    Completed! ✓
                                                </span>
                                            ) : (
                                                <p className="text-sm text-gray-500">
                                                    {userPoints} / {quest.value} XP
                                                </p>
                                            )}
                                        </div>
                                        {/* Progress Bar */}
                                        <div style={{
                                            height: '8px',
                                            width: '100%',
                                            backgroundColor: '#e5e7eb',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${progress}%`,
                                                backgroundColor: isCompleted ? '#22c55e' : '#22c55e',
                                                borderRadius: '4px',
                                                transition: 'width 0.3s ease-in-out'
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </FeedWrapper>
        </div>
    );
};

export default QuestsPage;
