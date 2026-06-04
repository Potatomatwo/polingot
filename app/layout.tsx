import type { Metadata } from 'next';
import { Nunito } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from "@/components/ui/sonner";
import './globals.css'
import { ExitModal } from '@/components/modals/exit-modal';
import { HeartsModal } from '@/components/modals/hearts-modal';
import { PracticeModal } from '@/components/modals/practice-modal';
import { auth } from '@clerk/nextjs/server';
import { getUserProgress } from '@/db/queries';

const nunito = Nunito({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Lingotest',
    description: 'A language learning app built with Next.js and Clerk.',
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { userId } = await auth();
    let darkMode = false;

    if (userId) {
        const userProgress = await getUserProgress(userId);
        darkMode = userProgress?.darkMode ?? false;
    }

    return (
        <ClerkProvider>
            <html lang="en" className={darkMode ? "dark" : ""}>
                <body className={nunito.className}>
                    <Toaster />
                    <ExitModal />
                    <HeartsModal />
                    <PracticeModal />
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
}