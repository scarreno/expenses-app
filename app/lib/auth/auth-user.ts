import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/app/lib/database/prisma";

async function getOrCreateCurrentUser(userId: string) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Clerk user not found");
  }

  let dbUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: userId,
      },
    });
  }

  return {
    ...dbUser,
    name:
      clerkUser.firstName ??
      clerkUser.fullName ??
      clerkUser.username ??
      "User",
    email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
    image: clerkUser.imageUrl ?? null,
  };
}

export async function getCurrentUserOrRedirect() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  return getOrCreateCurrentUser(userId);
}

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return getOrCreateCurrentUser(userId);
}

export async function getCurrentUserOrNull() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return getOrCreateCurrentUser(userId);
}