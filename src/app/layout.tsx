import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/app/site";
import "./globals.css";

const barlow = Titillium_Web({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const description =
  "Consulta i minuti stimati all'arrivo dei prossimi treni della metro di Catania, in base agli orari pubblicati da Ferrovia Circumetnea.";

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: "Quando arriva la metro di Catania? | Orari e arrivi",
  description,
  applicationName: SITE_NAME,
  authors: [{ name: "berto", url: "https://instagram.com/albertocornacchia_" }],
  creator: "berto",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "/",
    siteName: SITE_NAME,
    title: "Quando arriva la metro di Catania? | Orari e arrivi",
    description,
  },
  twitter: {
    card: "summary",
    title: "Quando arriva la metro di Catania? | Orari e arrivi",
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${barlow.variable} h-full antialiased`}>
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL.toString(),
              inLanguage: "it-IT",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
