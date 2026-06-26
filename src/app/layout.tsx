import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { AppLayout } from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "Sistem Laporan Peternakan - Fajar Farm",
  description: "Sistem Laporan Peternakan Terintegrasi Next.js & Supabase untuk Fajar Farm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <ToastProvider>
            <AppLayout>{children}</AppLayout>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
