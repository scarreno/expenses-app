import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth/auth-user";
import { prisma } from "@/app/lib/database/prisma";
import { defaultUserSettings } from "@/app/lib/settings/default-user-settings";

export async function GET() {
  
    const user = await getCurrentUser();

    if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.userSettings.findUnique({
        where: {
            userId: user?.id,
        },
    });

    return NextResponse.json({
        ...defaultUserSettings,
        ...settings,
    });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const settings = await prisma.userSettings.upsert({
    where: {
      userId: user.id,
    },
    update: {
      locale: body.locale,
      language: body.language,
      dateFormat: body.dateFormat,
      currencyLocale: body.currencyLocale,
      currencyCode: body.currencyCode,
    },
    create: {
      userId: user.id,
      locale: body.locale,
      language: body.language,
      dateFormat: body.dateFormat,
      currencyLocale: body.currencyLocale,
      currencyCode: body.currencyCode,
    },
  });

  return NextResponse.json(settings);
}