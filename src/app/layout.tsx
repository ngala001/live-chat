import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/hooks/auth-context";
import RoomProvider from "@/hooks/room-context";


export const metadata: Metadata = {
  title: "live-chat",
  description: "Have fun enjoy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="px-3">
           <Toaster position="top-center" richColors />
           <AuthProvider>
            <RoomProvider>
              {children}
            </RoomProvider>
           </AuthProvider>
        </div>
      </body>
    </html>
  );
}
