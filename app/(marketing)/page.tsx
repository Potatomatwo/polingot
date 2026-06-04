"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";
import { Loader, MessageSquare } from "lucide-react";
import Link from "next/link";


export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="max-w-[988px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-2">
      
      <div className="relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] mb-8 lg:mb-0">
        <Image src="/images/combined.png" fill alt="Hero" />
      </div>

      <div className="flex flex-col items-center gap-y-8">
        <h1 className="text-xl lg:text-3xl font-bold text-neutral-600 max-w-[480px] text-center">
          Learn, practice, and master new languages with Polingot - your ultimate language learning companion.
        </h1>

        <div className="flex flex-col items-center gap-y-3 max-w-[330px] w-full">
          <ClerkLoading>
            <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
          </ClerkLoading>
          <ClerkLoaded>
  {!isLoaded ? null : isSignedIn ? (
    // ✅ Logged in
    <Button size="lg" className="w-full" asChild>
      <Link href="/learn">Continue Learning</Link>
    </Button>
  ) : (
    // ❌ Not logged in
    <div className="flex flex-col gap-y-2">
      <SignUpButton mode="modal" forceRedirectUrl="/learn">
        <Button size="lg" variant="secondary" className="w-full">
          Get Started
        </Button>
      </SignUpButton>

      <SignInButton mode="modal" forceRedirectUrl="/learn">
        <Button size="lg" variant="outline" className="w-full">
          I already have an account
        </Button>
      </SignInButton>
    </div>
  )}
</ClerkLoaded>
        </div>
      </div>

      {/* Feedback button — fixed bottom right */}
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSe0UtpaIl30FGqSEx0rImvYDGlS-e1mO3Ar3jITSTxe2uv5fg/viewform?usp=publish-editor"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-3 rounded-full shadow-lg transition flex items-center gap-x-2 z-50"
      >
        <MessageSquare className="h-5 w-5" />
        Feedback
      </a>
    </div>
  );
}
