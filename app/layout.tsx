import type { Metadata } from "next";
import Script from "next/script";
import { Sora, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AgentationGuard } from "@/components/AgentationGuard";
import { HappySeedsWatermark } from "@/components/HappySeedsWatermark";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";
import jsonMetadata from "../metadata.json";

const geistSans = Sora({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = jsonMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "production" && (
          <Script
            async
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ToastProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
        <HappySeedsWatermark />
        <AgentationGuard />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
