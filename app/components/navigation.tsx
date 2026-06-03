"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function Navigation() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div>
        <nav
            style={{
                display: "flex",
                gap: 16,
            }}
        >
        <Link href="/">Upload</Link>
        <Link href="/receipts">Receipts</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/profile">Profile</Link>
        <Link href="/categories">Categories</Link>
        </nav>
    </div>
    
  );
}