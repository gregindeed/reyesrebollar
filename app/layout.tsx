import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import { ThemeInjector } from "@/components/ThemeInjector";
import { siteConfig } from "@/site.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Refined modern serif for display headings — warm, premium voice.
// Variable font: omit `weight` to expose the full 300–500 range we use.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title:       siteConfig.metaTitle,
  description: siteConfig.metaDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ThemeInjector />
      </head>
      <body className={`${geistSans.variable} ${fraunces.variable} antialiased`}>
        <Theme
          accentColor={siteConfig.theme.radixAccent as any}
          grayColor={siteConfig.theme.radixGray as any}
          radius="small"
          scaling="100%"
          panelBackground="solid"
        >
          <ConditionalLayout>{children}</ConditionalLayout>
        </Theme>
      </body>
    </html>
  );
}
