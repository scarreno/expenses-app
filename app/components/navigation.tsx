"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  IconCategory,
  IconChartBar,
  IconMenu2,
  IconReceipt,
  IconSettings,
  IconUpload,
  IconHome,
  IconUser,
} from "@tabler/icons-react";

import { SignOutButton } from "@/app/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Dictionary } from "@/app/types/dictionary";


type NavigationProps = {
  dictionary: Dictionary;
};

export function Navigation({ dictionary }: NavigationProps) {
  const pathname = usePathname();
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded || !isSignedIn || !user) {
    return null;
  }

  const userName =
    user.fullName ??
    user.username ??
    user.primaryEmailAddress?.emailAddress ??
    "User";

  const userImage = user.imageUrl;

  const navigationLinks = [
    { href: "/", label: dictionary.navigation.home, icon: IconHome },
    { href: "/upload", label: dictionary.navigation.upload, icon: IconUpload },
    { href: "/receipts", label: dictionary.navigation.receipts, icon: IconReceipt },
    { href: "/dashboard", label: dictionary.navigation.dashboard, icon: IconChartBar },
    { href: "/categories", label: dictionary.navigation.categories, icon: IconCategory },
    { href: "/profile", label: dictionary.navigation.profile, icon: IconUser },
    { href: "/settings", label: dictionary.navigation.settings, icon: IconSettings },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-w-0 flex-1 items-center">
      {/* Mobile Navigation */}
      <div className="flex w-full items-center justify-between lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open menu">
              <IconMenu2 size={18} />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-[280px] px-4">
            <SheetHeader className="border-b pb-4 text-left">
              <SheetTitle>{dictionary.common.menu}</SheetTitle>
            </SheetHeader>

            <nav className="mt-6 flex flex-col gap-2">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isActiveLink(link.href);

                return (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={
                        isActive
                          ? "flex items-center gap-3 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
                          : "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      }
                    >
                      <Icon size={18} />
                      {link.label}
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>

            <div className="mt-6 border-t pt-4">
              <SheetClose asChild>
                <Link
                  href="/profile"
                  className="mb-4 flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent"
                >
                  {userImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={userImage}
                        alt={userName}
                        className="h-9 w-9 rounded-full border"
                      />
                    </>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{dictionary.common.signedIn}</p>
                  </div>
                </Link>
              </SheetClose>

              <SignOutButton dictionary={dictionary} />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="text-sm font-semibold">
          <strong className="text-lg font-semibold">{dictionary.common.appName}</strong>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden min-w-0 flex-1 items-center justify-end gap-4 lg:flex">
        <nav className="flex items-center gap-2 text-sm">
          {navigationLinks.map((link) => {
            const Icon = link.icon;
            const isActive = isActiveLink(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
                    : "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                }
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="h-6 w-px bg-border" />

        <div className="flex min-w-0 items-center gap-3">
          {userImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userImage}
                alt={userName}
                className="h-8 w-8 shrink-0 rounded-full border"
              />
            </>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}

          <span className="truncate text-xs text-muted-foreground">
            {userName}
          </span>

          <div className="h-4 w-px bg-border" />

          <SignOutButton dictionary={dictionary} />
        </div>
      </div>
    </div>
  );
}