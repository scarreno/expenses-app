"use client";

import { signOut, useSession } from "next-auth/react";

export function SignOutButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session?.user) return null;

  return (
    <div
            style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            }}
        >
            <span>
            {session.user.name ?? session.user.email}
            </span>

            <button
            type="button"
            onClick={() =>
                signOut({
                callbackUrl: "/login",
                })
            }
            >
            Sign out
            </button>
        </div>
  );
}