import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";
import { AppProvider } from "@/lib/AppContext";
import { ToastProvider } from "@/components/Toast";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vylos — Financial Command",
  description:
    "Vylos is your personal financial command center. Track spending, build goals, and get AI-powered budget insights.",
  keywords: ["personal finance", "budgeting", "savings", "AI finance"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen flex bg-[#f5f5f7] text-[#1d1d1f]">
        <AppProvider>
          <ToastProvider>
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
