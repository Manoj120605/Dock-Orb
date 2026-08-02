import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Capsule AI",
  description: "Domain-Agnostic AI Workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased selection:bg-primary/30">{children}</body>
    </html>
  );
}
