import Link from "next/link";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "Expenses MVP",
  description: "Personal expenses app",
};
import { APP_VERSION } from "@/app/lib/app-version";
import { SessionProvider } from "@/app/components/auth/session-provider";
import { Navigation } from "@/app/components/navigation";
import { SignOutButton } from "@/app/components/auth/sign-out-button";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
          <SessionProvider>
            <header
              style={{
                padding: "16px 32px",
                borderBottom: "1px solid #333",
                display: "flex",
                gap: 24,
                alignItems: "center",
              }}
            >
              <strong>Expenses MVP</strong>

              <Navigation />

              <div style={{ marginLeft: "auto" }}>
                <SignOutButton />
              </div>
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