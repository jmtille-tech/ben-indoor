import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ben Indoor — Diagnostic Loisirs",
  description: "Plateforme de diagnostic expérience visiteur pour espaces indoor",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#0d1520" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ben Indoor" />
      </head>
      <body>{children}</body>
    </html>
  );
}
