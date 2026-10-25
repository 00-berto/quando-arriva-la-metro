import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.css";

const barlow = Titillium_Web({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Quando arriva la metro?",
  description: "Prossime partenze della metropolitana di Catania",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${barlow.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
