import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { authEnabled } from "@/lib/auth";
import { logout } from "./connexion/actions";

export const metadata: Metadata = {
  title: "Socle · Patrimoine",
  description: "Suivi personnel de patrimoine financier et immobilier",
  appleWebApp: { capable: true, title: "Socle", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0f12" },
  ],
};

const nav = [
  { href: "/", label: "Synthèse" },
  { href: "/comptes", label: "Comptes & placements" },
  { href: "/immobilier", label: "Immobilier" },
  { href: "/import", label: "Import CSV" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
          <aside className="pt-[max(1rem,env(safe-area-inset-top))] border-b border-border p-4 md:w-56 md:border-b-0 md:border-r md:p-6">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              <span className="text-accent">▲</span> Socle
            </Link>
            <nav className="mt-4 flex gap-2 overflow-x-auto text-sm md:flex-col md:gap-1">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-muted hover:bg-surface hover:text-foreground">
                  {n.label}
                </Link>
              ))}
            </nav>
            {authEnabled() && (
              <form action={logout} className="mt-2 md:mt-4">
                <button className="px-3 text-xs text-muted hover:text-foreground">Se déconnecter</button>
              </form>
            )}
          </aside>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
