import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getCurrentUserOrRedirect() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const user = await currentUser();

  return {
    id: userId,
    email: user?.primaryEmailAddress?.emailAddress ?? "",
    name: user?.fullName ?? user?.username ?? "User",
    image: user?.imageUrl ?? null,
  };
}

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await currentUser();

  return {
    id: userId,
    email: user?.primaryEmailAddress?.emailAddress ?? "",
    name: user?.fullName ?? user?.username ?? "User",
    image: user?.imageUrl ?? null,
  };
}

export async function getCurrentUserOrNull() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();

  return {
    id: userId,
    email: user?.primaryEmailAddress?.emailAddress ?? "",
    name: user?.fullName ?? user?.username ?? "User",
    image: user?.imageUrl ?? null,
  };
}