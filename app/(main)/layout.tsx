import { Sidebar } from "../../components/sidebar";
import { MobileHeader } from "../../components/mobile-header";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProgress, getUserSubscription } from "@/db/queries";

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
                    {/* Pass isPro to children via context or cloneElement */}
                    {children}
                </div>
            </main>
        </>
    );
};

export default MainLayout;
