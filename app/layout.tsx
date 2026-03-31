import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import QueryProvider from "@/components/TanstackConfig";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codexa - AI powered code editor",
  description: "AI powered web based code editor for developers",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Codexa",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen overflow-hidden bg-tokyo-bg text-tokyo-fg font-mono`}
      >
      <QueryProvider>
        <SettingsProvider>
          <AuthProvider>
            <main className="flex-1 overflow-auto bg-tokyo-bg">
              {children}
            </main>
          </AuthProvider>
        </SettingsProvider>
      </QueryProvider>
      <SonnerToaster position="bottom-right" expand={true} richColors />
      </body>
    </html>
  );
}

