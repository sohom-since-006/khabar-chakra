import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khabar Chakra (খাবার চক্র)",
  description: "Community food-lifecycle platform: track freshness, share surplus, handle waste responsibly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
