import type { Metadata } from "next";
import { Jost, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"
import "./globals.css";

const jost = Jost({ subsets: ["latin"], variable: '--font-jost', weight: ['400', '500', '600', '700'] });
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://sammii.dev'),
  title: "sammii.dev",
  description: "Full-stack engineer portfolio",
  openGraph: {
    siteName: 'sammii.dev',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@sammiihk',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`overscroll-none ${jost.variable} ${inter.variable}`}>
      <body className={jost.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
