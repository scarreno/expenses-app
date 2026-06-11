"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Dictionary } from "@/app/types/dictionary";

type SignOutButtonProps = {
  dictionary: Dictionary;
};

export function SignOutButton({ dictionary }: SignOutButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      {dictionary.common.signOut}
    </Button>
  );
}