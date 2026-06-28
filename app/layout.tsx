import { Toaster } from "sonner";
import "./globals.css";

import Link from "next/link";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/app/components/auth/auth-provider";
import { Navigation } from "@/app/components/navigation";
import { getCurrentUserOrNull } from "@/app/lib/auth/auth-user";
import { getDictionary } from "@/app/lib/i18n/get-dictionary";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import { APP_VERSION } from "@/lib/utils/app-version";
import { cn } from "@/lib/utils";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});


const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});


export const metadata = {
  title: "Expenses MVP",
  description: "Personal expenses app",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserOrNull();

  const settings = user ? await getUserSettings(user.id) : null;
  const dictionary = await getDictionary(settings?.language ?? "en");

  return (
    <html
        lang={settings?.language ?? "en"}
        className={cn(
          "dark font-sans",
          fontSans.variable,
          fontSerif.variable,
          fontMono.variable
        )}
      >
      <body>
        <AuthProvider>
          <header className="flex items-center gap-6 border-b border-border px-8 py-4">
            <Link href="/" className="hidden text-sm font-semibold lg:block">
              <strong className="text-lg font-semibold">
                {dictionary.common.appName}
              </strong>
            </Link>

            <Navigation dictionary={dictionary} />
          </header>

          {children}

          <footer
            style={{
              marginTop: 32,
              padding: 24,
              borderTop: "1px solid #333",
              textAlign: "center",
              color: "#777",
              fontSize: 14,
            }}
          >
            Developed by Sergio © {new Date().getFullYear()} · v{APP_VERSION}
          </footer>

          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}