import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Socle · Patrimoine",
  description: "Suivi personnel de patrimoine financier et immobilier",
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
          <aside className="border-b border-border p-4 md:w-56 md:border-b-0 md:border-r md:p-6">
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
          </aside>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
