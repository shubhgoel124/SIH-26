"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = {
  trainee: [{ name: "Dashboard", href: "/trainee", icon: LayoutDashboard }],
  trainer: [{ name: "Dashboard", href: "/trainer", icon: LayoutDashboard }],
  admin: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }],
}

export function TopNavigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role as keyof typeof navigationItems | undefined
  const navItems = (role && navigationItems[role]) || []

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-sky-700">
            SANGAM
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-sky-100 text-sky-800"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {session?.user && (
            <span className="hidden text-sm text-slate-600 md:inline">
              {session.user.name}{" "}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize text-slate-700">
                {session.user.role}
              </span>
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-slate-200"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
