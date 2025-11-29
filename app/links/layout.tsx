import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connect with Sammii",
  description: "Find me on LinkedIn, GitHub, and more",
  openGraph: {
    title: "Connect with Sammii",
    description: "Find me on LinkedIn, GitHub, and more",
    type: "profile",
  },
  twitter: {
    card: "summary",
    title: "Connect with Sammii",
    description: "Find me on LinkedIn, GitHub, and more",
  },
};

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

