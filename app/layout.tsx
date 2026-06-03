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
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme */}
        <meta name="theme-color" content="#0d1520" />

        {/* iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ben Indoor" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>{children}</body>
    </html>
  );
}
