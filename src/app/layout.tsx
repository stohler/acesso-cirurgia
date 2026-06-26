import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Poppins } from "next/font/google";

import { ConsentProvider } from "@/components/consent/consent-provider";
import { CONSENT_COOKIE_NAME, isConsentAccepted } from "@/lib/consent";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgendeSuaCirurgia.com.br",
  description:
    "Plataforma para estimativa de valores cirúrgicos por cidade, triagem criptografada e gestão médica por região.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  icons: {
    icon: "https://storage.googleapis.com/acesso-cirurgia-imagens/favicon.png",
    shortcut: "https://storage.googleapis.com/acesso-cirurgia-imagens/favicon.png",
    apple: "https://storage.googleapis.com/acesso-cirurgia-imagens/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialHasConsent = isConsentAccepted(cookieStore.get(CONSENT_COOKIE_NAME)?.value);

  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 pb-24 text-slate-900">
        <ConsentProvider initialHasConsent={initialHasConsent}>
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8">{children}</div>
        </ConsentProvider>
      </body>
    </html>
  );
}
