import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/app/lib/database/prisma";

async function getCurrentUserData(userId: string) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Clerk user not found");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!dbUser) {
    throw new Error("User not found in database");
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

  console.log('getCurrentUserOrRedirect', userId);

  if (!userId) {
    redirect("/login");
  }

  return getCurrentUserData(userId);
}

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return getCurrentUserData(userId);
}

export async function getCurrentUserOrNull() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    return await getCurrentUserData(userId);
  } catch {
    return null;
  }
}