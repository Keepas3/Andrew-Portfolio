import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteContent from "@/components/SiteContent";
import GlobalAudioMotion from "@/components/GlobalAudioMotion";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Andrew's Portfolio",
    template: "%s | Andrew's Portfolio",
  },
  description: "Check out my work",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GlobalAudioMotion />
        {/* Main application page routing + the globally-persistent audio
            player, wrapped together so the player's sticky bottom edge
            tucks away right where the footer begins (see .site-content
            in globals.css) */}
        <SiteContent>{children}</SiteContent>
        <Footer />
      </body>
    </html>
  );
}