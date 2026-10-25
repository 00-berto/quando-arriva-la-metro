import type { Metadata } from "next";
import { Barlow_Semi_Condensed, Titillium_Web } from "next/font/google";
import "./globals.css";

const barlow = Titillium_Web({
  //weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  weight: ["600"],
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
