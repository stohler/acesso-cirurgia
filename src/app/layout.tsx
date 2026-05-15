import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ConsentProvider } from "@/components/consent/consent-provider";

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
  title: "AgendeSuaCirurgia.com.br",
  description:
    "Plataforma para estimativa de valores cirúrgicos por cidade, triagem criptografada e gestão médica por região.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900">
        <ConsentProvider>
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8">{children}</div>
        </ConsentProvider>
      </body>
    </html>
  );
}
