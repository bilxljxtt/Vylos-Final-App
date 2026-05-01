import type { Metadata } from "next";
import { Geist_Mono, Sora } from "next/font/google";
import "./globals.css";

import { AppProvider } from "@/lib/AppContext";
import { ToastProvider } from "@/components/Toast";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Vylos — Financial Intelligence Engine",
  description:
    "Vylos is a deterministic financial intelligence platform. Track spending, build resilience, and get formula-based insights.",
  keywords: ["personal finance", "budgeting", "savings", "financial engine"],
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} ${sora.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <Script id="theme-detection" strategy="beforeInteractive">
          {`
            try {
              const theme = JSON.parse(localStorage.getItem('vylos-storage')).state.userProfile.theme;
              if (theme === 'Dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-bg text-text-main font-sora selection:bg-primary/20 selection:text-primary" suppressHydrationWarning>
        <AppProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
