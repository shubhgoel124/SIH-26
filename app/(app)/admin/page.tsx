"use client"

import { useCallback, useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { RoleGate } from "@/components/sangam/role-gate"

type PendingUser = {
  id: string
  name: string
  email: string
  role: string
  approvalStatus?: string
}

type DashboardStats = {
  counts?: {
    courses?: number
    enrollments?: number
    certifications?: number
    assessmentCompletionRate?: number
  }
  charts?: {
    coursesBySubject?: { subjectTag: string; count: number }[]
    enrollmentsByStatus?: { status: string; count: number }[]
    enrollmentsBySubject?: { subjectTag: string; count: number }[]
  }
}

type CompetencyRow = {
  id: string
  subjectTag: string
  trainerName?: string
  proficiencyScore: number
  rationale?: string
}

const PIE_COLORS = ["#0284c7", "#0ea5e9", "#38bdf8", "#64748b", "#94a3b8"]

function EmptyBlock({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed border-slate-200 bg-slate-50/50">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  return (
    <RoleGate allow="admin">
      <AdminDashboard />
    </RoleGate>
  )
}

function AdminDashboard() {
  const [initialLoading, setInitialLoading] = useState(true)
  const [pending, setPending] = useState<PendingUser[]>([])
  const [stats, setStats] = useState<DashboardStats>({})
  const [competency, setCompetency] = useState<CompetencyRow[]>([])
  const [announcement, setAnnouncement] = useState({
    title: "",
    body: "",
    type: "NOTIFICATION",
  })
  const [publishing, setPublishing] = useState(false)
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  const loadPending = useCallback(async () => {
    const res = await fetch("/api/admin/users")
    if (res.ok) {
      const data = await res.json()
      const list = data.pending ?? []
      setPending(Array.isArray(list) ? list : [])
    }
  }, [])

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/admin/dashboard-stats")
    if (res.ok) {
      const data = await res.json()
      setStats(data)
    }
  }, [])

  const loadCompetency = useCallback(async () => {
    const res = await fetch("/api/admin/competency-map")
    if (res.ok) {
      const data = await res.json()
      const rows = data.competencyMaps ?? []
      setCompetency(
        Array.isArray(rows)
          ? rows.map((r: CompetencyRow & { trainer?: { name?: string } }) => ({
              ...r,
              trainerName: r.trainerName ?? r.trainer?.name,
            }))
          : []
      )
    }
  }, [])

  useEffect(() => {
    Promise.all([loadPending(), loadStats(), loadCompetency()]).finally(() => setInitialLoading(false))
  }, [loadPending, loadStats, loadCompetency])

  const reviewUser = async (id: string, action: "approve" | "reject") => {
    setReviewingId(id)
    try {
      const res = await fetch(`/api/admin/users/approve/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        toast.success(action === "approve" ? "User approved" : "User rejected")
        loadPending()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? "Action failed")
      }
    } finally {
      setReviewingId(null)
    }
  }

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    const title = announcement.title.trim()
    const body = announcement.body.trim()
    if (!title) {
      toast.error("Announcement title is required")
      return
    }
    if (!body) {
      toast.error("Announcement body is required")
      return
    }
    setPublishing(true)
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, type: announcement.type }),
      })
      if (res.ok) {
        toast.success("Announcement posted")
        setAnnouncement({ title: "", body: "", type: "NOTIFICATION" })
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? "Could not post announcement")
      }
    } finally {
      setPublishing(false)
    }
  }

  const barData =
    stats.charts?.enrollmentsBySubject?.map((r) => ({
      name: r.subjectTag,
      count: r.count,
    })) ?? []

  const pieData =
    stats.charts?.enrollmentsByStatus?.map((r) => ({
      name: r.status,
      value: r.count,
    })) ?? []

  if (initialLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" aria-label="Loading dashboard" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Admin dashboard</h1>
        <p className="text-sm text-slate-600">Approvals, analytics, announcements, and competency mapping.</p>
      </div>

      <Tabs defaultValue="approval" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto bg-slate-100 p-1">
          <TabsTrigger value="approval">User approval</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="competency">Competency map</TabsTrigger>
        </TabsList>

        <TabsContent value="approval" className="mt-4 space-y-4">
          {pending.length === 0 ? (
            <EmptyBlock title="No pending users" description="New sign-ups awaiting approval will appear here." />
          ) : (
            pending.map((u) => (
              <Card key={u.id} className="border-slate-200/80 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4">
                  <div>
                    <CardTitle className="text-lg">{u.name}</CardTitle>
                    <p className="text-sm text-slate-600">
                      {u.email}
                    </p>
                    <Badge variant="outline" className="mt-2 border-sky-200 text-sky-800">
                      {u.role}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      className="bg-sky-600 hover:bg-sky-700"
                      disabled={reviewingId === u.id}
                      onClick={() => reviewUser(u.id, "approve")}
                    >
                      {reviewingId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={reviewingId === u.id}
                      onClick={() => reviewUser(u.id, "reject")}
                    >
                      Reject
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Courses</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-slate-900">
                {stats.counts?.courses ?? 0}
              </CardContent>
            </Card>
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Enrollments</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-slate-900">
                {stats.counts?.enrollments ?? 0}
              </CardContent>
            </Card>
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Certificates</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-slate-900">
                {stats.counts?.certifications ?? 0}
              </CardContent>
            </Card>
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Assessment completion</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold text-slate-900">
                {stats.counts?.assessmentCompletionRate ?? 0}%
              </CardContent>
            </Card>
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <Card className="min-w-0 border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Enrollments by subject</CardTitle>
                <CardDescription>Bar chart from enrollments grouped by course subject.</CardDescription>
              </CardHeader>
              <CardContent className="h-64 min-w-0 sm:h-72">
                {barData.length === 0 ? (
                  <p className="text-sm text-slate-500">No enrollment data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#0284c7" name="Enrollments" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card className="min-w-0 border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Enrollments by status</CardTitle>
                <CardDescription>Distribution of enrollment statuses.</CardDescription>
              </CardHeader>
              <CardContent className="h-64 min-w-0 sm:h-72">
                {pieData.length === 0 ? (
                  <p className="text-sm text-slate-500">No status breakdown yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="mt-4">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Create announcement</CardTitle>
              <CardDescription>Published announcements appear on the public home page.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid max-w-xl gap-4" onSubmit={createAnnouncement}>
                <div className="space-y-2">
                  <Label htmlFor="ann-title" required>
                    Title
                  </Label>
                  <Input
                    id="ann-title"
                    value={announcement.title}
                    onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                    placeholder="e.g. New leadership course now open for enrollment"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ann-body" required>
                    Body
                  </Label>
                  <Textarea
                    id="ann-body"
                    value={announcement.body}
                    onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })}
                    placeholder="e.g. Departments can now enroll staff in Digital Workplace Essentials. Batch starts next Monday."
                    required
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label required>Type</Label>
                  <Select
                    value={announcement.type}
                    onValueChange={(v) => setAnnouncement({ ...announcement, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select announcement type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOTIFICATION">Notification</SelectItem>
                      <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                      <SelectItem value="NEW_CONTENT">New content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-fit bg-sky-600 hover:bg-sky-700" disabled={publishing}>
                  {publishing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing
                    </>
                  ) : (
                    "Publish"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competency" className="mt-4">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Competency map</CardTitle>
              <CardDescription>Trainer proficiency by subject area.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {competency.length === 0 ? (
                <p className="py-6 text-sm text-slate-500">No competency records yet.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600">
                      <th className="py-2 pr-4 font-medium">Subject</th>
                      <th className="py-2 pr-4 font-medium">Trainer</th>
                      <th className="py-2 pr-4 font-medium">Proficiency</th>
                      <th className="py-2 font-medium">Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competency.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="py-3 pr-4 font-medium text-slate-800">{row.subjectTag}</td>
                        <td className="py-3 pr-4">{row.trainerName ?? "Unassigned"}</td>
                        <td className="py-3 pr-4">{row.proficiencyScore}</td>
                        <td className="py-3 text-slate-600">{row.rationale ?? "Not provided"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
