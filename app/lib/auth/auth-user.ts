import { auth } from "@/app/lib/auth/auth";
import { prisma } from '@/app/lib/database/prisma'
import { redirect } from "next/navigation";

export async function getCurrentUserOrRedirect() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return user;
}


export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}