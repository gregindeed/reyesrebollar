import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { ConditionalLayout } from "@/components/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
      <body className={`${geistSans.variable} antialiased`}>
        <Theme
          accentColor="bronze"
          grayColor="sand"
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
