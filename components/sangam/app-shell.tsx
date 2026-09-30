"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, LogOut, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SangamLogo } from "@/components/sangam/logo"

const navByRole: Record<string, { label: string; href: string }[]> = {
  trainee: [{ label: "Dashboard", href: "/trainee" }],
  trainer: [{ label: "Dashboard", href: "/trainer" }],
  admin: [{ label: "Dashboard", href: "/admin" }],
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role
  const items = role ? navByRole[role] ?? [] : []

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" aria-label="Loading session" />
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-slate-50 text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),transparent_50%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_40%),linear-gradient(180deg,rgba(226,241,255,0.7),transparent)]"
        aria-hidden="true"
      />
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-md">
        <div className="sangam-container flex flex-wrap items-center justify-between gap-2 py-2.5 sm:gap-4 sm:py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
            <Link
              href="/"
              className="min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <span className="sm:hidden">
                <SangamLogo size={30} />
              </span>
              <span className="hidden sm:inline-flex">
                <SangamLogo size={34} subtitle="Capacity Connect" />
              </span>
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "bg-sky-100 text-sky-800"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {session?.user && (
              <span className="hidden max-w-[14rem] truncate text-sm text-slate-600 md:inline">
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
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
        {items.length > 0 && (
          <nav className="sangam-container flex gap-1 overflow-x-auto pb-2 sm:hidden">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-sky-100 text-sky-800"
                    : "bg-slate-50 text-slate-600"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="relative sangam-container py-4 sm:py-6 md:py-8">
        <div className="sangam-panel min-w-0 overflow-x-hidden">{children}</div>
      </main>
    </div>
  )
}
