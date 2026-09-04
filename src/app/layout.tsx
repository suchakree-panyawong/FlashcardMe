import type { Metadata, Viewport } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlashcardMe - แอปแฟลชการ์ด",
  description: "แอปสร้างและทบทวนแฟลชการ์ดด้วยระบบ Spaced Repetition ใช้งานง่ายบนมือถือ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FlashcardMe",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={prompt.variable}>
      <head>
        <link rel="apple-touch-icon" href="/pwa-icon-192.jpg" />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  );
}