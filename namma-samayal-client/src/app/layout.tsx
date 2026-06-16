import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { Montserrat, Poppins, Nunito, Patrick_Hand, Kalam } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

// Legacy default — body still falls back to Montserrat in globals.css for now.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

// Notebook font system (4 fonts, exposed as CSS variables):
//   --font-ui        → Poppins       (navbar, buttons, chips, stats, numbers)
//   --font-body      → Nunito        (paragraph body, ingredient list, descriptions)
//   --font-title-hw  → Patrick Hand  (recipe title, section headings)
//   --font-note-hw   → Kalam         (sticky notes, step text, handwritten accents)
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});
const patrickHand = Patrick_Hand({
  variable: "--font-patrick-hand",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});
const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
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

// Runs BEFORE React hydrates so theme is applied before any paint — prevents flash.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('ns_theme');
    var pref = stored === 'dark' || stored === 'light' || stored === 'system' ? stored : 'system';
    var resolved = pref === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : pref;
    var root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.style.colorScheme = 'light';
    }
    root.setAttribute('data-theme', resolved);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${poppins.variable} ${nunito.variable} ${patrickHand.variable} ${kalam.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme-init script — runs before paint to set the right dark/light
            class on <html> from localStorage / system preference, preventing a
            theme flash. `beforeInteractive` executes before React hydrates;
            placing it inside <head> keeps the HTML structure valid. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        {/* Preconnect to Cloudinary — every recipe / ingredient image is served
            from there. Saves the TCP+TLS round-trip when the first image loads. */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Same idea for GTM's lazy-loaded script. */}
        {GTM_ID && (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          </>
        )}
      </head>
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">
        {GTM_ID && (
          <>
            {/* GTM dataLayer init — tiny inline, ships immediately so events
                queued before lazyOnload still register. */}
            <Script id="_gtm-init" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({'gtm.start': new Date().getTime(), event:'gtm.js'});`}
            </Script>
            {/* GTM main bundle — lazy-loaded after page is idle so it doesn't
                compete with LCP / FCP. Saves ~130 KiB of unused JS on first load. */}
            <Script
              id="_gtm-main"
              strategy="lazyOnload"
              src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
            />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          </>
        )}
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
