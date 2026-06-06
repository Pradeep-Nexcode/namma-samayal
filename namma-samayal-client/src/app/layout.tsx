import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Namma Samayal — Tamil & South Indian Recipes",
    template: "%s",
  },
  description:
    "Authentic Tamil and South Indian recipes, ingredients, and traditional Kongu kitchen techniques — in English and Tamil.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">
        <ClientProviders>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          {modal}
        </ClientProviders>
      </body>
    </html>
  );
}
