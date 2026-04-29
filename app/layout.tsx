import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIFY Assessment Platform",
  description: "Production-grade learner portal UI for gated agent-building assessments."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
