"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/app/components/auth/sign-out-button";

export function Navigation() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const userName = session.user.name ?? session.user.email ?? "User";
  const userImage = session.user.image;

  return (
    <div className="flex flex-1 items-center gap-6">
      <nav className="flex items-center gap-4">
        <Link href="/">Upload</Link>
        <Link href="/receipts">Receipts</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/categories">Categories</Link>
        <Link href="/profile">Profile</Link>
        <Link href="/settings">Settings</Link>
      </nav>

      <div className="ml-auto flex items-center gap-3">
        {userImage ? (
            <>
            {/* User avatar */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={userImage}
              alt={userName}
              className="h-8 w-8 rounded-full border"
            />
          </>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}

        <span className="hidden text-xs text-muted-foreground md:inline">
          {userName}
        </span>

        <div className="h-4 w-px bg-border" />

        <SignOutButton />
      </div>
    </div>
  );
}