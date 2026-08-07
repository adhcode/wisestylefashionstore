import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WiseStyle — Fashion House Operations",
  description: "Job, customer, tailor and payment management for WiseStyle Fashion House.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
