import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Painel Financeiro",
  description: "Controle pessoal de renda, gastos e compromissos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${fraunces.variable} ${inter.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col md:flex-row">
          <Nav />
          <main className="flex-1 px-4 py-6 md:px-10 md:py-10">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
