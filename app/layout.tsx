import Link from "next/link";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "Expenses MVP",
  description: "Personal expenses app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
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

          <nav
            style={{
              display: "flex",
              gap: 16,
            }}
          >
            <Link href="/">Upload</Link>
            <Link href="/receipts">Receipts</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
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
          Developed by Sergio © {new Date().getFullYear()}
        </footer>
        <Toaster richColors position="top-right" />        
      </body>
    </html>
  );
}