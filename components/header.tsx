"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/utils/utils"
import { Button } from "@/components/ui/button"
import { Shield, FileSearch, Menu, X } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

export default function Header() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <header className="border-b border-zinc-800/50 bg-black/40 backdrop-blur-xl sticky top-0 z-50 animate-fadeIn">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Shield className="h-7 w-7 text-blue-500 animate-pulse" />
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md -z-10"></div>
            </div>
            <Link href="/" className="text-xl font-bold text-white glow-text">
              CyberTools
            </Link>
          </div>

          {isMobile ? (
            <>
              <Button variant="ghost" size="icon" onClick={toggleMenu} className="relative">
                {isOpen ? <X className="h-5 w-5 text-blue-500" /> : <Menu className="h-5 w-5 text-blue-500" />}
                <span className="absolute inset-0 rounded-md bg-blue-500/10 -z-10"></span>
              </Button>

              {isOpen && (
                <div className="absolute top-16 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50 animate-slideUpFade">
                  <nav className="container mx-auto px-4 py-4">
                    <ul className="space-y-2">
                      <li>
                        <Link
                          href="/"
                          className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                            pathname === "/"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                              : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white",
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          <FileSearch className="h-5 w-5" />
                          <span>File Analysis</span>
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <nav>
              <ul className="flex items-center gap-1">
                <li>
                  <Link
                    href="/"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all duration-200",
                      pathname === "/"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/20"
                        : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white",
                    )}
                  >
                    <FileSearch className="h-4 w-4" />
                    <span>File Analysis</span>
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
