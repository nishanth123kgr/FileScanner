import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import BackgroundEffects from "@/components/background-effects"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Static File Analysis",
  description: "Deep analysis of files for malware, vulnerabilities, and security threats",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased flex justify-center`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <div className="min-h-screen max-w-screen-xl bg-zinc-950 relative overflow-hidden">
            <div className="flex">
              <main className="flex-1 p-4 md:p-8 relative z-10">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
