import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DCS Store",
  description: "Minimal storefront template",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <header className="border-b border-gray-200">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-semibold tracking-tight">
              DCS Store
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
        <footer className="border-t border-gray-200 mt-20">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} DCS Store. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
