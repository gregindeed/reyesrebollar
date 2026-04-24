import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Rye } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const rye = Rye({
  variable: "--font-rye",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Reyes Rebollar Properties LLC",
  description:
    "A family real estate holding company building lasting value in El Cajon, California. Rooted in Los Limones, Michoacán.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${rye.variable} antialiased flex flex-col min-h-screen bg-background text-foreground`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
