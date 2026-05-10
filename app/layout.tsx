import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AppProvider } from "@/lib/AppContext";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Vylos — Financial Intelligence Engine",
  description:
    "Vylos is a financial intelligence platform. Track spending, build resilience, and get formula-based insights.",
  keywords: ["personal finance", "budgeting", "savings", "financial engine"],
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
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
