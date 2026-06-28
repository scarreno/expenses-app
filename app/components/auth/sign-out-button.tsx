"use client";

import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";

import { Dictionary } from "@/app/types/dictionary";
import { Button } from "@/components/ui/button";

type SignOutButtonProps = {
  dictionary: Dictionary;
};

export function SignOutButton({ dictionary }: SignOutButtonProps) {
  return (
    <ClerkSignOutButton redirectUrl="/login">
      <Button type="button" variant="outline" size="sm">
        {dictionary.common.signOut}
      </Button>
    </ClerkSignOutButton>
  );
}