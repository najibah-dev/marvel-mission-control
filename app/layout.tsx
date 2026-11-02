import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marvel Mission Control — Your Marvel Journey",
  description: "Plan a prioritized Marvel catch-up journey before Avengers: Doomsday. Set your weekly time, track watched films, and explore the story map.",
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
