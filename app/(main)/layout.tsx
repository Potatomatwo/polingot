import { Sidebar } from "../../components/sidebar";
import { MobileHeader } from "../../components/mobile-header";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

type Props = {
    children: React.ReactNode;
}
 
const MainLayout = async ({ children }: Props) => {
    const { userId } = await auth();
    
    if (!userId) {
        redirect("/");
    }
    
    // Fetch subscription data for the layout
    const userSubscription = await getUserSubscription();
    const isPro = userSubscription?.isActive === true;

    return (
        <>
            <MobileHeader />
            <Sidebar className="hidden lg:flex" />
            <main className="lg:pl-[256px] h-full pt-[50px] lg:pt-0">
                <div className="max-w-[1056px] mx-auto pt-6 h-full">
                    {children}
                </div>
                
                {/* Feedback button — fixed bottom right */}
                <Link
                    href="https://docs.google.com/forms/d/e/1FAIpQLSe0UtpaIl30FGqSEx0rImvYDGlS-e1mO3Ar3jITSTxe2uv5fg/viewform?usp=publish-editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-3 rounded-full shadow-lg transition flex items-center gap-x-2 z-50"
                >
                    <MessageSquare className="h-5 w-5" />
                    Feedback
                </Link>
            </main>
        </>
    );
};

export default MainLayout;