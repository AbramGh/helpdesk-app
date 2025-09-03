import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { MainNav } from "@/components/layout/main-nav"
import { UserNav } from "@/components/layout/user-nav"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Helpdesk Dashboard",
  description: "Internal helpdesk and ticketing system",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <div className="flex h-screen">
              <aside className="w-64 border-r bg-muted/10">
                <div className="p-6">
                  <div className="h-6"></div>
                </div>
                <MainNav />
              </aside>
              <div className="flex-1 flex flex-col">
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex h-14 items-center justify-end px-6">
                    <UserNav />
                  </div>
                </header>
                <main className="flex-1 overflow-auto">
                  <Suspense fallback={null}>{children}</Suspense>
                </main>
              </div>
            </div>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
