"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserOrRedirect } from "@/app/lib/auth/auth-user";
import { prisma } from "@/app/lib/database/prisma";

function buildCategoryCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function createCategory(formData: FormData) {
  const user = await getCurrentUserOrRedirect();

  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!displayName) {
    return;
  }

  const code = buildCategoryCode(displayName);

  if (!code) {
    return;
  }

  await prisma.category.create({
    data: {
      userId: user.id,
      code,
      displayName,
      isDefault: false,
      isActive: true,
    },
  });

  revalidatePath("/categories");
}

export async function updateCategory(formData: FormData) {
  const user = await getCurrentUserOrRedirect();

  const id = String(formData.get("id") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!id || !displayName) {
    return;
  }

  await prisma.category.updateMany({
    where: {
      id,
      userId: user.id,
    },
    data: {
      displayName,
    },
  });

  revalidatePath("/categories");
}

export async function deactivateCategory(formData: FormData) {
  const user = await getCurrentUserOrRedirect();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    return;
  }

  await prisma.category.updateMany({
    where: {
      id,
      userId: user.id,
    },
    data: {
      isActive: false,
    },
  });

  revalidatePath("/categories");
}

export async function reactivateCategory(formData: FormData) {
  const user = await getCurrentUserOrRedirect();

  const id = String(formData.get("id") ?? "");

  if (!id) return;

  await prisma.category.updateMany({
    where: {
      id,
      userId: user.id,
    },
    data: {
      isActive: true,
    },
  });

  revalidatePath("/categories");
}