import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snippet Test Server",
  description: "Channel Talk snippet test server"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
