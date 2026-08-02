import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalPlayer from "@/components/GlobalPlayer";
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
        {/* Main application page routing */}
        {children}
        
        {/* Sits globally outside page mounts so navigation doesn't disrupt animations */}
        <GlobalPlayer />
        <Footer />
      </body>
    </html>
  );
}