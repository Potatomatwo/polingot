import { useKey, useMedia } from "react-use";
import { CheckCircle, XCircle, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
    onCheck: () => void;
    onSkip?: () => void; 
    status: "correct" | "wrong" | "none" | "completed";
    disabled?: boolean;
    pending?: boolean; 
    lessonId?: number;
    challengeType?: "SELECT" | "ASSIST" | "TYPING" | "SPEAKING" | "LISTENING";
    showSkip?: boolean;  // Add show skip flag
}

export const Footer = ({
    onCheck,
    onSkip,
    status,
    disabled,
    pending = false, 
    lessonId,
    challengeType,
    showSkip = false,
}: Props) => {
    useKey("Enter", () => {
        if (!disabled) onCheck();  // 👈 respect the disabled state
    }, {}, [onCheck, disabled]);
    const isMobile = useMedia("(max-width: 1024px)");

    const isButtonDisabled = () => {
        if (status !== "none") return false;
        if (challengeType === "SPEAKING") return false;
        return disabled;
    };

    return(
        <footer className={cn(
            "lg:h-[140px] h-[100px] border-t-2",
            status === "correct" && "border-transparent bg-green-100",
            status === "wrong" && "border-transparent bg-rose-100",
        )}>
            <div className="max-w-[1140px] h-full mx-auto flex items-center justify-between px-6 lg:px-10">
                {/* Left side - Skip button for speaking challenges */}
                <div className="flex-1 flex justify-start">
                    {showSkip && status === "none" && (
                        <Button
                            onClick={onSkip}
                            variant="ghost"
                            size={isMobile ? "sm" : "default"}
                            className="text-neutral-500 hover:text-neutral-700"
                            disabled={disabled || pending} 
                        >
                            <SkipForward className="h-4 w-4 mr-2" />
                            Skip
                        </Button>
                    )}
                </div>

                {/* Center - Status message */}
                <div className="flex-1 flex justify-center">
                    {status === "correct" && (
                        <div className="text-green-500 font-bold text-base lg:text-2xl flex items-center">
                            <CheckCircle className="h-6 w-6 lg:h-10 lg:w-10 mr-4"/>
                            Nicely done!
                        </div>
                    )}
                    {status === "wrong" && (
                        <div className="text-rose-500 font-bold text-base lg:text-2xl flex items-center">
                            <XCircle className="h-6 w-6 lg:h-10 lg:w-10 mr-4"/>
                            Try again.
                        </div>
                    )}
                    {status === "completed" && (
                        <Button
                            variant="default"
                            size={isMobile ? "sm" : "lg"}
                            onClick={() => window.location.href = `/lesson/${lessonId}`}
                        >
                            Practice again
                        </Button>
                    )}
                </div>

                {/* Right side - Check/Continue button */}
                <div className="flex-1 flex justify-end">
                    <Button
                        disabled={isButtonDisabled()}
                        onClick={onCheck}
                        size={isMobile ? "sm" : "lg"}
                        variant={status === "wrong" ? "danger" : "secondary"}
                    >
                        {status === "none" && "Check"}
                        {status === "correct" && "Continue"}
                        {status === "wrong" && "Try Again"}
                        {status === "completed" && "Completed"}
                    </Button>
                </div>
            </div>
        </footer>
    );
};
