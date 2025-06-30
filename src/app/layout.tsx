import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevRatul Solar Clock",
  description:
    "A beautifully aligned solar clock that syncs with your location and visualizes time since sunset. Designed with elegance, stars, and real-time sunset countdown.",
  keywords: ["DevRatul Solar Clock"],
  authors: [
    {
      name: "DevRatul",
      url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}`,
    },
  ],
  applicationName: "DevRatul Solar Clock",
  creator: "Clock",
  publisher: "DevRatul",
  icons: {
    icon: "/icon-192x192.jpg",
  },
  robots: "index, follow",

  openGraph: {
    title: "DevRatul Solar Clock",
    description:
      "A beautifully aligned solar clock that syncs with your location and visualizes time since sunset. Designed with elegance, stars, and real-time sunset countdown.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}`,
    siteName: "DevRatul Solar Clock",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/og-solar-clock.jpg`,
        width: 1200,
        height: 600,
        alt: "DevRatul Solar Clock",
      },
    ],
    locale: "en_BD",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ⏰ Favicon using SVG Data URI */}
        <link
          rel="icon"
          href={`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>⏰</text></svg>`}
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icon-192x192.jpg" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
