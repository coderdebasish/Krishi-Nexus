import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "Krishi-Nexus | Farm Intelligence Platform",
  description: "Smart Crop Advisory & Farm Resource Optimization System for Smallholder Farmers. From farm data to the right decision.",
  manifest: "/manifest.json",
  themeColor: "#0a0f0a",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="min-h-dvh flex flex-col">
          <Navbar />
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
