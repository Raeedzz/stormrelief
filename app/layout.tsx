import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-loaded",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StormRelief — No claims. No waiting. Just relief.",
  description:
    "Parametric tornado insurance. Instant payouts the moment severe weather hits.",
  applicationName: "StormRelief",
  manifest: undefined,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StormRelief",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#050814",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="bg-storm-950 text-white antialiased">{children}</body>
    </html>
  );
}
