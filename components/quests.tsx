import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { quests } from "@/constants";
import { Progress } from "@/components/ui/progress";

type Props = {
    points: number; 
};

export const Quests = ({ points }: Props) => { 
    return(
        <div className="border-2 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between w-full">
                <h3 className="font-bold text-lg">
                    Quests
                </h3>
                <Link href="/quests">
                    <Button size="sm" variant="primaryOutline">
                        View all
                    </Button>
                </Link>
            </div>
            <ul className="w-full space-y-4">
                {quests.map((quest) => {
                    const progress = Math.min((points / quest.value) * 100, 100);
                    const isCompleted = points >= quest.value;
                    
                    return (
                        <li key={quest.title} className="flex items-center w-full pb-4 gap-x-3">
                            <Image 
                                src="/lighting.svg"
                                alt="Points"      
                                width={40}
                                height={40}                                      
                            />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-neutral-700 text-sm font-bold">
                                        {quest.title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {isCompleted ? "✓ Completed" : `${Math.round(progress)}%`}
                                    </p>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
