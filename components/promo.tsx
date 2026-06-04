"use client";  // Fixed: was "use cilent"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const Promo = () => {
    return(
        <div className="border-2 rounded-xl p-4 space-y-4">
            <div className="space-y-2">
                <div className="flex items-center gap-x-2">  {/* Fixed: was gap-x- */}
                    <Image 
                        src="/unlimited.svg"
                        alt="Pro"
                        height={26}
                        width={26}
                    />
                    <h3 className="font-bold text-lg">
                        Upgrade to Pro
                    </h3>
                </div>
                <p className="text-muted-foreground">
                    Get unlimited hearts and more!
                </p>
            </div>

            <Button
                disabled
                variant="super"
                className="w-full"
                size="lg"
            >
                <Link href="/shop">
                    jk lol i aint monetizing this
                </Link>
            </Button>
        </div>
    );
};
