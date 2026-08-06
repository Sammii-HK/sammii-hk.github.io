import type { Metadata } from "next";
import { Jost, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"
import "./globals.css";

const jost = Jost({ subsets: ["latin"], variable: '--font-jost', weight: ['400', '500', '600', '700'] });
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://sammii.dev'),
  title: "Sammii Kellow: AI Product Engineer & Design Engineer",
  description: "AI product engineer and design engineer in London. I build AI-native products end to end: agent systems, MCP tooling, and the interface. Open to senior, staff, founding, or contract roles, remote or London.",
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
