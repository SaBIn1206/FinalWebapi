import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Bakery Hub | Premium Custom Cakes & Combo Delivery",
  description: "Browse luxury cakes, customize flavors and weight, apply coupons, and get delivery in standard, same-day, or midnight slots.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${outfit.variable} bg-canvas text-ink antialiased min-h-full flex flex-col`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
