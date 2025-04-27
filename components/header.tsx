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
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" />
            <Link href="/" className="text-lg font-bold text-white">
              CyberTools
            </Link>
          </div>

          {isMobile ? (
            <>
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                {isOpen ? <X className="h-5 w-5 text-red-500" /> : <Menu className="h-5 w-5 text-red-500" />}
              </Button>

              {isOpen && (
                <div className="absolute top-16 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800">
                  <nav className="container mx-auto px-4 py-4">
                    <ul className="space-y-2">
                      <li>
                        <Link
                          href="/"
                          className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                            pathname === "/"
                              ? "bg-red-500/10 text-red-500"
                              : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
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
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      pathname === "/"
                        ? "bg-red-500/10 text-red-500"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
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
