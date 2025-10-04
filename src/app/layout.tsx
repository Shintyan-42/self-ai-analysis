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
  title: "AI Career App - 地方の中高生向けキャリア発見アプリ",
  description: "15問の質問に答えて、AIが最適なキャリアロールモデルと進路を提案します。地方の中高生向けのキャリア発見アプリです。",
  keywords: ["キャリア", "進路", "AI", "地方", "中高生", "職業", "大学"],
  authors: [{ name: "AI Career App" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
