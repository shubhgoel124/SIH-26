"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navByRole: Record<string, { label: string; href: string }[]> = {
  trainee: [{ label: "Dashboard", href: "/trainee" }],
  trainer: [{ label: "Dashboard", href: "/trainer" }],
  admin: [{ label: "Dashboard", href: "/admin" }],
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role ?? "trainee"
  const items = navByRole[role] ?? navByRole.trainee

  return (
    <div className="relative min-h-screen w-full bg-slate-50 text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),transparent_50%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_40%),linear-gradient(180deg,rgba(226,241,255,0.7),transparent)]"
        aria-hidden="true"
      />
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold tracking-tight text-sky-700">
              SANGAM
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
      <main className="relative mx-auto w-full max-w-6xl px-4 py-8">
        <div className="rounded-[32px] bg-white/80 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.08)] ring-1 ring-white/60 backdrop-blur">
          {children}
        </div>
      </main>
    </div>
  )
}
