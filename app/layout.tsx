import type { Metadata, Viewport } from "next";
import "./globals.css";

import { AppProvider } from "@/lib/AppContext";
import { ToastProvider } from "@/components/Toast";

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Vylos | Your Financial Intelligence Engine",
  description: "Take control of your financial future with Vylos. Professional-grade tracking, automated health scoring, and AI-powered financial coaching.",
  keywords: ["personal finance", "wealth management", "budgeting app", "financial health", "savings tracker"],
  icons: {
    icon: [
      { url: "/favicon.ico?v=2" },
      { url: "/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=2", sizes: "512x512", type: "image/png" }
    ],
    shortcut: "/favicon.ico?v=2",
    apple: [
      { url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vylos"
  },
  openGraph: {
    title: "Vylos | Your Financial Intelligence Engine",
    description: "The premium way to track, understand, and grow your wealth.",
    url: "https://vylos.app",
    siteName: "Vylos",
    locale: "en_ZA",
    type: "website",
  },
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <Script
          id="theme-detection"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = JSON.parse(localStorage.getItem('vylos-storage') || '{}')?.state?.userProfile?.theme;
                  const savedTheme = localStorage.getItem('vylos-theme');
                  const isDark = savedTheme === 'dark' || theme === 'Dark' || (!savedTheme && !theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body
        className="min-h-screen bg-bg text-text-main selection:bg-primary/20 selection:text-primary font-[Inter,system-ui,sans-serif]"
        suppressHydrationWarning
      >
        <AppProvider>
          <ToastProvider>
            {children}
            <div id="vylos-portal-root" className="relative z-[10000]" />
            <div id="vylos-portal-root-datepicker" className="relative z-[10001]" />
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
