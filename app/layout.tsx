import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "eneso.cc - Link Shortener",
  description: "Link shortener and tracking service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}

