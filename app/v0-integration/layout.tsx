import React from "react";
import { ThemeProvider } from "../../components/theme-provider";
import { V0Navigation } from "../../components/v0/navigation";
import { APIProvider } from "../../components/v0/api-provider";
import { Toaster } from "../../components/ui/toaster";

export default function V0IntegrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <APIProvider>
        <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
          
          {/* Floating Orbs */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          
          <V0Navigation />
          <main className="flex-1 overflow-auto relative z-10">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
      </APIProvider>
    </ThemeProvider>
  );
} 