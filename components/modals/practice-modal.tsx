// practice-modal.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePracticeModal } from "@/store/use-practice-modal";

export const PracticeModal = () => { 
    const [isClient, setIsClient] = useState(false);
    const { isOpen, close } = usePracticeModal();

    useEffect(() => setIsClient(true), []);

    const handleClose = () => {
        close();
    };

    if (!isClient) {
        return null;
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center w-full justify-center mb-5">
                        <Image
                            src="/heart.svg"
                            alt="Heart"
                            height={100}
                            width={100}
                        />
                    </div>
                    <DialogTitle className="text-center font-bold text-2xl">
                        Practice Lesson
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        Use practice lessons to regain hearts and points. You cannot lose hearts or points in practice lessons!
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className="flex flex-col gap-y-4 w-full">
                        <Button 
                            variant="primary" 
                            className="w-full" 
                            size="lg" 
                            onClick={handleClose}
                        >
                            I understand
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
