import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Women’s Speaker Bureau",
  description:
    "Featuring expert speakers in the Indian Venture Capital and Private Equity Eco-System. In a quest to end MAN-els, spotlight women domain knowledge experts and enable warm introductions. Independent and self-hosted with thanks to our supporters.",
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
