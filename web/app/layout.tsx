import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

const siteTitle = "OpenVScan – Open Vulnerability Scanner";
const siteDescription =
  "OpenVScan is a web security platform that combines open-source scanners with AI-assisted analysis for faster, more reliable pre-production testing.";

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: "%s | OpenVScan",
  },
  description: siteDescription,
  keywords: [
    "OpenVScan",
    "vulnerability scanning",
    "application security",
    "AI security tooling",
  ],
  authors: [{ name: "OpenVScan Contributors" }],
  creator: "Buddhsen Tripathi",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "https://github.com/Buddhsen-tripathi/openvscan",
    siteName: "OpenVScan",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Navbar />
      <body>{children}</body>
    </html>
  );
}
