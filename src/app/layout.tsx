import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Women’s Speaker Collective",
  // Short tagline — the default meta description for browser tabs, nav, and
  // social share previews. The fuller mission text lives on the homepage body.
  description: "Knowledge experts from the Indian PE and VC eco-system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
