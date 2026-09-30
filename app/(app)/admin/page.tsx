"use client"

import { useCallback, useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { toast } from "sonner"

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

const PIE_COLORS = ["#0284c7", "#0ea5e9", "#38bdf8", "#64748b"]

export default function AdminDashboardPage() {
  const [pending, setPending] = useState<PendingUser[]>([])
  const [stats, setStats] = useState<DashboardStats>({})
  const [competency, setCompetency] = useState<CompetencyRow[]>([])
  const [announcement, setAnnouncement] = useState({
    title: "",
    body: "",
    type: "NOTIFICATION",
  })

  const loadPending = useCallback(async () => {
    const res = await fetch("/api/admin/users")
    if (res.ok) {
      const data = await res.json()
      const users = data.pending ?? data.users ?? data ?? []
      setPending(
        Array.isArray(users)
          ? users.filter(
              (u: PendingUser) =>
                !u.approvalStatus || u.approvalStatus === "PENDING"
            )
          : []
      )
    }
  }, [])

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/admin/dashboard-stats")
    if (res.ok) setStats(await res.json())
  }, [])

  const loadCompetency = useCallback(async () => {
    const res = await fetch("/api/admin/competency-map")
    if (res.ok) {
      const data = await res.json()
      const rows = data.competencyMaps ?? data.map ?? data.competencyMap ?? data ?? []
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
    loadPending()
    loadStats()
    loadCompetency()
  }, [loadPending, loadStats, loadCompetency])

  const reviewUser = async (id: string, action: "approve" | "reject") => {
    const res = await fetch(`/api/admin/users/approve/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      toast.success(action === "approve" ? "User approved" : "User rejected")
      loadPending()
    } else toast.error("Action failed")
  }

  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(announcement),
    })
    if (res.ok) {
      toast.success("Announcement posted")
      setAnnouncement({ title: "", body: "", type: "NOTIFICATION" })
    } else toast.error("Could not post announcement")
  }

  const barData =
    stats.charts?.enrollmentsBySubject?.map((r) => ({
      name: r.subjectTag,
      count: r.count,
    })) ??
    stats.charts?.coursesBySubject?.map((r) => ({
      name: r.subjectTag,
      count: r.count,
    })) ??
    []
  const pieData =
    stats.charts?.enrollmentsByStatus?.map((r) => ({
      name: r.status,
      value: r.count,
    })) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Admin dashboard</h1>
        <p className="text-sm text-slate-600">Approvals, analytics, announcements, and competency map.</p>
      </div>

      <Tabs defaultValue="approval" className="w-full">
        <TabsList className="flex h-auto flex-wrap gap-1 bg-slate-100">
          <TabsTrigger value="approval">User Approval</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="competency">Competency Map</TabsTrigger>
        </TabsList>

        <TabsContent value="approval" className="mt-4 space-y-4">
          {pending.length === 0 ? (
            <p className="text-sm text-slate-500">No pending users.</p>
          ) : (
            pending.map((u) => (
              <Card key={u.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">{u.name}</CardTitle>
                    <p className="text-sm text-slate-600">
                      {u.email} · {u.role}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-sky-600 hover:bg-sky-700" onClick={() => reviewUser(u.id, "approve")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reviewUser(u.id, "reject")}>
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Courses</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{stats.counts?.courses ?? 0}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Enrollments</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{stats.counts?.enrollments ?? 0}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Certificates</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{stats.counts?.certifications ?? 0}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Assessment completion</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {stats.counts?.assessmentCompletionRate ?? 0}%
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity by subject</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {barData.length === 0 ? (
                <p className="text-sm text-slate-500">No chart data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#0284c7" name="Count" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enrollments by status</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {pieData.length === 0 ? (
                <p className="text-sm text-slate-500">No chart data yet.</p>
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
          <Card>
            <CardHeader>
              <CardTitle>Create announcement</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 max-w-xl" onSubmit={createAnnouncement}>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={announcement.title}
                    onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Body</Label>
                  <Textarea
                    value={announcement.body}
                    onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={announcement.type}
                    onValueChange={(v) => setAnnouncement({ ...announcement, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOTIFICATION">Notification</SelectItem>
                      <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                      <SelectItem value="NEW_CONTENT">New Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-fit bg-sky-600 hover:bg-sky-700">
                  Publish
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competency" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Competency map</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-2 pr-4">Subject</th>
                    <th className="py-2 pr-4">Trainer</th>
                    <th className="py-2 pr-4">Proficiency</th>
                    <th className="py-2">Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {competency.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-slate-500">
                        No competency records.
                      </td>
                    </tr>
                  ) : (
                    competency.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="py-2 pr-4 font-medium">{row.subjectTag}</td>
                        <td className="py-2 pr-4">{row.trainerName ?? "—"}</td>
                        <td className="py-2 pr-4">{row.proficiencyScore}</td>
                        <td className="py-2 text-slate-600">{row.rationale ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
