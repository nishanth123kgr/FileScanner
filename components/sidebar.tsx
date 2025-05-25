"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/utils/utils"
import { Button } from "@/components/ui/button"
import { Shield, Search, FileSearch, BarChart3, MessageSquare, Target, Settings, Menu, X } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Shield,
  },
  {
    name: "Vulnerability Scanning",
    href: "/vulnerability-scanning",
    icon: Search,
  },
  {
    name: "Static File Scanning",
    href: "/file-scanning",
    icon: FileSearch,
  },
  {
    name: "Log Analysis",
    href: "/log-analysis",
    icon: BarChart3,
  },
  {
    name: "Security Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    name: "Penetration Testing",
    href: "/pen-testing",
    icon: Target,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      {isMobile && (
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50" onClick={toggleSidebar}>
          {isOpen ? <X className="h-6 w-6 text-red-500" /> : <Menu className="h-6 w-6 text-red-500" />}
        </Button>
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out",
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0",
          "bg-black/40 backdrop-blur-xl border-r border-zinc-800/50",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-500" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent">
                CyberShield
              </h1>
            </div>
          </div>

          <nav className="flex-1 px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  pathname === item.href
                    ? "bg-red-500/10 text-red-500"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {pathname === item.href && <div className="ml-auto w-1.5 h-5 rounded-full bg-red-500" />}
              </Link>
            ))}
          </nav>

          <div className="p-4 mt-auto">
            <div className="p-4 rounded-lg bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50">
              <p className="text-xs text-zinc-400">
                CyberShield Pro v1.0.2
                <br />
                <span className="text-red-500">Premium License</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
