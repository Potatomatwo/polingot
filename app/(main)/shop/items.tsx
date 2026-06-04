"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { refillHearts, purchaseDarkMode, toggleDarkMode  } from "@/actions/user-progress";
import { toast } from "sonner";
import { createStripeUrl } from "@/actions/user-subscription";
import { POINTS_TO_REFILL } from "@/constants";

type Props = {
    hearts: number;
    points: number;
    hasActiveSubscription: boolean;
    darkMode: boolean;
};

export const Items = ({
    hearts,
    points,
    hasActiveSubscription,
    darkMode,
}: Props) => {
    const [pending, startTransition] = useTransition();

    const handleRefillHearts = () => {
        if (hearts === 5) {
            toast.error("Hearts are already full!");
            return;
        }
        
        if (points < POINTS_TO_REFILL) {
            toast.error(`Not enough points! Need ${POINTS_TO_REFILL} points.`);
            return;
        }

        startTransition(() => {
            refillHearts()
                .then((response) => {
                    if (response?.error) {
                        if (response.error === "already_full") {
                            toast.error("Hearts are already full!");
                        } else if (response.error === "insufficient_points") {
                            toast.error("Not enough points!");
                        } else {
                            toast.error("Something went wrong.");
                        }
                    } else {
                        toast.success("Hearts refilled successfully!");
                        window.location.reload();
                    }
                })
                .catch((error) => {
                    console.error("Refill error:", error);
                    toast.error("Something went wrong.");
                });
        });
    };
    const handleToggleDarkMode = () => {
        startTransition(() => {
            toggleDarkMode()
                .then(() => {
                    toast.success(darkMode ? "Dark mode disabled!" : "Dark mode enabled!");
                    window.location.reload();
                })
                .catch(() => toast.error("Something went wrong."));
        });
    };
    const handlePurchaseDarkMode = () => {
    if (points < 500) {
        toast.error("Not enough points! Need 500 points.");
        return;
    }
    startTransition(() => {
        purchaseDarkMode()
            .then((response) => {
                if (response?.error === "insufficient_points") {
                    toast.error("Not enough points!");
                } else {
                    toast.success("Dark mode unlocked!");
                    window.location.reload();
                }
            })
            .catch(() => toast.error("Something went wrong."));
    });
};

    const onUpgrade = () => {
        startTransition(() => {
            createStripeUrl()
                .then((response) => {
                    if (response?.data && typeof response.data === 'string') {
                        window.location.href = response.data;
                    } else {
                        toast.error("Failed to create checkout session. Please try again.");
                    }
                })
                .catch((error) => {
                    console.error("Stripe error:", error);
                    toast.error("Something went wrong. Please try again.");
                });
        });
    };

    return (
        <ul className="w-full">
            {/* Refill hearts item */}
            <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
                <Image 
                    src="/heart.svg" 
                    alt="Heart" 
                    width={60} 
                    height={60} 
                />
                <div className="flex-1">
                    <p className="text-neutral-700 text-base lg:text-xl font-bold">
                        Refill hearts
                    </p>
                    <p className="text-neutral-500 text-sm">
                        {hearts}/5 hearts remaining
                    </p>
                </div>
                <Button
                    onClick={handleRefillHearts}
                    disabled={pending || hearts === 5 || points < POINTS_TO_REFILL}
                >
                    {pending ? (
                        "Processing..."
                    ) : hearts === 5 ? (
                        "Full"
                    ) : (
                        <div className="flex items-center gap-x-1">
                            <Image 
                                src="/lighting.svg"
                                alt="Points"
                                width={20}
                                height={20}
                            />
                            <span>{POINTS_TO_REFILL}</span>
                        </div>
                    )}
                </Button>
            </div>

            {/* Unlimited hearts item */}
            <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2">
                <Image 
                    src="/unlimited.svg"
                    alt="unlimited"
                    height={60}
                    width={60}
                />
                <div className="flex-1">
                    <p className="text-neutral-700 text-base lg:text-xl font-bold">
                        Unlimited hearts
                    </p>
                </div>
                <Button
                    onClick={onUpgrade}
                    disabled={true}
                    className="opacity-50 cursor-not-allowed"
                >
                    {hasActiveSubscription ? "Settings" : "You don't need this"}
                </Button>
            </div>

            {/* Dark mode item */}
            <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2">
                <Image src="/images/moon.svg" alt="Dark Mode" height={60} width={60} />
                <div className="flex-1">
                    <p className="text-neutral-700 text-base lg:text-xl font-bold">
                        Dark Mode
                    </p>
                    <p className="text-neutral-500 text-sm">
                        {darkMode ? "Currently enabled — click to disable" : "IN DEVELOPMENT, DONT BUY THIS UNLESS YOU WANNA MAKE YOUR EYES BLEED"}
                    </p>
                </div>
                <Button
                    onClick={darkMode ? handleToggleDarkMode : handlePurchaseDarkMode}
                    disabled={pending || (!darkMode && points < 500)}
                    variant={darkMode ? "danger" : "default"}
                >
                    {pending ? "Processing..." : darkMode ? (
                        "Disable"
                    ) : (
                        <div className="flex items-center gap-x-1">
                            <Image src="/lighting.svg" alt="Points" width={20} height={20} />
                            <span>500</span>
                        </div>
                    )}
                </Button>
            </div>
        </ul>
    );
};