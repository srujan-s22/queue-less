import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QueueLess — Smart Campus Canteen Pre-Ordering & Queue Management",
  description: "Pre-order canteen food during class, reserve pickup slots, skip long lunch queues, and pick up fresh meals on time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FBFBF9] text-[#1A1C1E] font-sans selection:bg-[#1B4332] selection:text-white">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
