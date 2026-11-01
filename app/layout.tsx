import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marvel Mission Control — Find your route",
  description: "Explore a curated route to Avengers: Infinity War. Fit movies into your time, track what you have watched, and understand the connections.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
