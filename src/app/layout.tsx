import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/anton";
import "./globals.css";
import { store } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: `${store.name} | Football Jerseys in Ghana`, template: `%s | ${store.name}` },
  description:
    "Club, national team and retro football jerseys delivered across Ghana. Add your name and number, pay with Mobile Money.",
};

export const viewport: Viewport = { themeColor: "#0b0b0b" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
