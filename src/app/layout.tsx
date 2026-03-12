import type { Metadata } from "next";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";

export const metadata: Metadata = {
  title: "Texas Hold'em Poker",
  description: "Play Texas Hold'em Poker against an AI opponent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
