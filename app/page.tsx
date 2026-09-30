"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Loader2, Megaphone, Sparkles } from "lucide-react"
import { SangamLogo } from "@/components/sangam/logo"

type Announcement = {
  id: string
  title: string
  body: string
  type: "NOTIFICATION" | "ACHIEVEMENT" | "NEW_CONTENT"
  postedAt: string
}

const typeLabels: Record<Announcement["type"], string> = {
  NOTIFICATION: "Notification",
  ACHIEVEMENT: "Achievement",
  NEW_CONTENT: "New content",
}

const typeStyles: Record<Announcement["type"], string> = {
  NOTIFICATION: "border-sky-200 bg-sky-50 text-sky-800",
  ACHIEVEMENT: "border-emerald-200 bg-emerald-50 text-emerald-800",
  NEW_CONTENT: "border-slate-200 bg-slate-100 text-slate-800",
}

const typeIcons: Record<Announcement["type"], typeof Bell> = {
  NOTIFICATION: Bell,
  ACHIEVEMENT: Sparkles,
  NEW_CONTENT: Megaphone,
}

export default function HomePage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setAnnouncements(Array.isArray(data) ? data : data.announcements ?? []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-slate-50 text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),transparent_50%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_40%),linear-gradient(180deg,rgba(226,241,255,0.7),transparent)]"
        aria-hidden="true"
      />
      <header className="border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="sangam-container flex flex-wrap items-center justify-between gap-3 py-3 sm:py-4">
          <div className="min-w-0">
            <span className="sm:hidden">
              <SangamLogo size={32} />
            </span>
            <span className="hidden sm:inline-flex">
              <SangamLogo size={40} subtitle="Capacity Connect" />
            </span>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button asChild variant="outline" size="sm" className="border-slate-200 sm:h-10 sm:px-4 sm:text-sm">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="bg-sky-600 hover:bg-sky-700 sm:h-10 sm:px-4 sm:text-sm">
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="sangam-container py-10 text-center sm:py-14 md:py-16">
        <div className="mb-5 flex justify-center sm:mb-6">
          <SangamLogo
            variant="stacked"
            size={56}
            className="[&_p]:text-2xl sm:[&_svg]:h-[72px] sm:[&_svg]:w-[72px] sm:[&_p]:text-4xl"
            subtitle="Capacity Connect"
          />
        </div>
        <p className="mx-auto mt-2 max-w-2xl px-1 text-base leading-relaxed text-slate-600 sm:text-lg">
          Unified portal for capacity building: courses, assessments, certificates, and trainer-led programs for
          organisational learners.
        </p>
        <div className="mt-6 flex w-full flex-col items-stretch justify-center gap-3 px-1 sm:mt-8 sm:flex-row sm:items-center sm:px-0">
          <Button asChild size="lg" className="w-full bg-sky-600 hover:bg-sky-700 sm:w-auto">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full border-slate-200 sm:w-auto">
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </section>

      <section className="sangam-container pb-12 sm:pb-16">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Announcements</h2>
            <p className="text-sm text-slate-500">Updates from your organisation administrators.</p>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
            Loading announcements
          </div>
        ) : announcements.length === 0 ? (
          <Card className="border-dashed border-slate-200 bg-white/60">
            <CardContent className="py-10 text-center text-sm text-slate-500">No announcements yet.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            {announcements.map((item) => {
              const Icon = typeIcons[item.type] ?? Bell
              return (
                <Card
                  key={item.id}
                  className="h-full border-slate-200/80 bg-white/90 shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardHeader className="flex flex-col gap-2 space-y-0 pb-2 sm:flex-row sm:items-start sm:justify-between">
                    <CardTitle className="min-w-0 text-base font-semibold leading-snug text-slate-900">
                      {item.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`w-fit shrink-0 ${typeStyles[item.type] ?? typeStyles.NOTIFICATION}`}
                    >
                      <Icon className="mr-1 h-3 w-3" />
                      {typeLabels[item.type] ?? item.type}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-600">{item.body}</p>
                    {item.postedAt && (
                      <p className="mt-3 text-xs font-medium text-slate-400">
                        {new Date(item.postedAt).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
