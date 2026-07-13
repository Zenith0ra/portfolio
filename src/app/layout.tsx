import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://houlinzhi.com"),
  title: "Zenith | Linzhi Hou",
  description: "Personal portal of Linzhi Hou - CST Student @ Tsinghua University",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Zenith | Linzhi Hou",
    description: "CST Student @ Tsinghua University. Personal website with tools and projects.",
    url: "https://houlinzhi.com",
    siteName: "Linzhi Hou",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Zenith | Linzhi Hou",
    description: "CST Student @ Tsinghua University. Personal website with tools and projects.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} antialiased font-sans pt-14`}
      >
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
