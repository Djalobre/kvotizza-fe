// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-context";
import { ThemeScript } from "@/components/theme-script";
import { SessionProvider } from "next-auth/react";
import Providers from "./providers";
import Script from "next/script";
import * as gtag from "../lib/gtag";
import Analytics from "./analitika/analitika"; // Dodajte ovo

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kvotizza - Pametno poređenje kvota",
  description: "Uporedi kvote svih kladionica u Srbiji u realnom vremenu",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr" suppressHydrationWarning>
      <head>
        <ThemeScript />
        {/* GA4 Script */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_MEASUREMENT_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_MEASUREMENT_ID}');
          `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider>
            {children}
            <Analytics /> {/* Dodajte Analytics komponentu */}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
