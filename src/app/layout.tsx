import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Snehasish Dutta Photography",
    default: "Snehasish Dutta | Fine Art & Destination Wedding Storyteller",
  },
  description:
    "Luxury destination wedding and fine art photography across India and worldwide. Unhurried, emotion-driven storytelling honoring intimacy, light, and timeless moments.",
  keywords: [
    "Wedding Photographer India",
    "Destination Wedding Photography",
    "Udaipur Wedding Photographer",
    "Goa Wedding Photography",
    "Kolkata Wedding Photographer",
    "Editorial Pre-Wedding Shoots",
    "Fine Art Couple Portraits",
    "Snehasish Dutta Photography",
  ],
  authors: [{ name: "Snehasish Dutta" }],
  creator: "Snehasish Dutta",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://snehasishphotography.com",
    title: "Snehasish Dutta | Fine Art & Destination Wedding Storyteller",
    description:
      "Luxury destination wedding and fine art photography across India and worldwide. Emotion-driven storytelling honoring intimacy, light, and timeless moments.",
    siteName: "Snehasish Dutta Photography",
    images: [
      {
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Snehasish Dutta Photography Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Snehasish Dutta | Fine Art & Destination Wedding Storyteller",
    description: "Destination wedding and editorial photography across India and worldwide.",
    images: ["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${plusJakartaSans.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}
