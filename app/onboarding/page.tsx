import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/app/lib/database/prisma";

export default async function OnboardingPage() {

  console.log('Pasa por el OnboardingPage');
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });

  redirect("/");
}