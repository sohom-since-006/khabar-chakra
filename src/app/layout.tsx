import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khabar Chakra (খাবার চক্র) — Smart Kitchen Food Tracker & Zero Waste",
  description: "Personal food tracking, smart pantry & fridge freshness lifecycle, 'Use This First' smart shelves, and domestic waste reduction analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[var(--kc-bg)] text-[var(--kc-ink)]">
        {children}
      </body>
    </html>
  );
}
