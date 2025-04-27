import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import BackgroundEffects from "@/components/background-effects"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CyberTools - Security Utilities",
  description: "Cybersecurity utilities and tools",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
            <div className="flex">
              <main className="flex-1 p-4 md:p-8 relative z-10">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
