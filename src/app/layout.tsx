import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/hooks/auth-context";
import RoomProvider from "@/hooks/room-context";
import { ThemeProvider } from "@/hooks/theme-context";


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
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
           <Toaster position="top-center" richColors />
           <AuthProvider>
            <RoomProvider>
              {children}
            </RoomProvider>
           </AuthProvider>
           </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
