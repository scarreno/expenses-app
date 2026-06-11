import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "Expenses MVP",
  description: "Personal expenses app",
};
import { APP_VERSION } from "@/app/lib/app-version";
import { SessionProvider } from "@/app/components/auth/session-provider";
import { Navigation } from "@/app/components/navigation";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import { getDictionary } from "@/app/lib/i18n/get-dictionary";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = await getCurrentUserOrRedirect();
  const settings = await getUserSettings(user.id);
  const dictionary = getDictionary(settings.language);

  
  return (
    <html lang="es" className={cn("dark font-sans", geist.variable)}>
      <body>
          <SessionProvider>
          <header className="flex items-center gap-6 border-b border-border px-8 py-4">
            <Link href="/" className="hidden text-sm font-semibold lg:block">
              <strong className="text-lg font-semibold">{dictionary.common.appName}</strong>
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
        </SessionProvider>
      </body>
    </html>
  );
}