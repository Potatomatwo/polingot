"use client";

import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Image from "next/image";
import { Loader } from "lucide-react";
import { ClerkProvider } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const { isSignedIn } = useUser();

  return (
    <header className="h-20 w-full border-b-2 border-slate-200 px-4">
      <div className="lg:max-w-5xl mx-auto flex items-center justify-between h-full">
        
        <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
          <Image src="/images/icon.png" alt="Logo" width={40} height={40} />
          <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">
            Polingot
          </h1>
        </div>

        <ClerkLoading>
          <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
        </ClerkLoading>

        <ClerkLoaded>
          {isSignedIn ? (
            <UserButton
            />
          ) : (
            <SignInButton mode="modal" forceRedirectUrl="/learn">
              <Button size="lg" variant="ghost">
                Login
              </Button>
            </SignInButton>
          )}
        </ClerkLoaded>

      </div>
    </header>
  );
};
