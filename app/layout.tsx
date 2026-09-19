import type { Metadata } from "next";
import { Noto_Sans_Georgian, Noto_Serif_Georgian, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-sans-georgian",
});

const notoSerifGeorgian = Noto_Serif_Georgian({
  subsets: ["georgian", "latin"],
  weight: ["600", "700"],
  variable: "--font-noto-serif-georgian",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "ინვესტორი",
  description: "ქართული საიტი ინვესტიციებზე",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ka"
      className={`${notoSansGeorgian.variable} ${notoSerifGeorgian.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen bg-bg text-white flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}