import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

import { logger } from "@/lib/logger";

export const metadata: Metadata = {
  title: "vibe2g - Watch Together",
  description: "Real-time collaborative video watching platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  logger.info({ event: 'app_render' }, 'Rendering RootLayout');

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
        suppressHydrationWarning
      >
        <Toaster richColors position="bottom-right" theme="dark" />
        {children}
      </body>
    </html>
  );
}
