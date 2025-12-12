"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Flag, FlaskConical, BarChart3, Key, BookOpen } from "lucide-react"

const navigation = [
  { name: "Feature Flags", href: "/flags", icon: Flag },
  { name: "Experiments", href: "/experiments", icon: FlaskConical },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "API Keys", href: "/settings/api-keys", icon: Key },
  { name: "SDK Docs", href: "/docs/sdk", icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Flag className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">FeatureFlag</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
