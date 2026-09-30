"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Megaphone, Sparkles } from "lucide-react"

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
  NEW_CONTENT: "New Content",
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
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),transparent_50%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_40%),linear-gradient(180deg,rgba(226,241,255,0.7),transparent)]"
        aria-hidden="true"
      />
      <header className="border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-2xl font-bold tracking-tight text-sky-700">SANGAM</span>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="border-slate-200">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild className="bg-sky-600 hover:bg-sky-700">
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">Capacity Connect</p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">SANGAM</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Unified portal for capacity building — courses, assessments, certificates, and trainer-led programs for
          public sector learners.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-sky-600 hover:bg-sky-700">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-slate-200">
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Announcements</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-slate-500">No announcements yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {announcements.map((item) => {
              const Icon = typeIcons[item.type] ?? Bell
              return (
                <Card key={item.id} className="border-slate-200/80 bg-white/90">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                    <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-800">
                      <Icon className="mr-1 h-3 w-3" />
                      {typeLabels[item.type] ?? item.type}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{item.body}</p>
                    {item.postedAt && (
                      <p className="mt-2 text-xs text-slate-400">
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
