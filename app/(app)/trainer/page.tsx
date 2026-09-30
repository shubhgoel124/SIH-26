"use client"

import { useCallback, useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

type TrainerProfile = {
  bio?: string
  subjectAreas?: string[]
  yearsExperience?: number
  phone?: string
}

type Course = { id: string; title: string; description?: string; subjectTag?: string; status?: string }

type McqDraft = {
  questionText: string
  options: string[]
  correctOption: number
  subjectTag: string
}

type ParticipationRow = {
  courseTitle?: string
  traineeName?: string
  status?: string
  progressPercent?: number
}

export default function TrainerDashboardPage() {
  const [profile, setProfile] = useState<TrainerProfile>({})
  const [courses, setCourses] = useState<Course[]>([])
  const [participation, setParticipation] = useState<ParticipationRow[]>([])
  const [saving, setSaving] = useState(false)

  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    subjectTag: "",
    startDate: "",
    endDate: "",
  })

  const [materialCourseId, setMaterialCourseId] = useState("")
  const [materialTitle, setMaterialTitle] = useState("")
  const [materialType, setMaterialType] = useState("PDF")
  const [uploading, setUploading] = useState(false)

  const [questionnaireCourseId, setQuestionnaireCourseId] = useState("")
  const [questionnaireTitle, setQuestionnaireTitle] = useState("")
  const [questionnaireDeadline, setQuestionnaireDeadline] = useState("")
  const [mcqs, setMcqs] = useState<McqDraft[]>([
    { questionText: "", options: ["", "", "", ""], correctOption: 0, subjectTag: "" },
  ])

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/trainer/profile")
    if (res.ok) {
      const data = await res.json()
      setProfile(data.profile ?? data)
    }
  }, [])

  const loadCourses = useCallback(async () => {
    const res = await fetch("/api/trainer/courses")
    if (res.ok) {
      const data = await res.json()
      setCourses(data.courses ?? data ?? [])
    }
  }, [])

  const loadParticipation = useCallback(async (courseId?: string) => {
    const id = courseId || courses[0]?.id
    if (!id) {
      setParticipation([])
      return
    }
    const res = await fetch(`/api/trainer/participation/${id}`)
    if (res.ok) {
      const data = await res.json()
      const rows =
        data.enrollments?.map((e: {
          trainee?: { name?: string }
          status?: string
          progressPercent?: number
          course?: { title?: string }
        }) => ({
          courseTitle: data.course?.title ?? e.course?.title,
          traineeName: e.trainee?.name,
          status: e.status,
          progressPercent: e.progressPercent,
        })) ??
        data.participation ??
        data.rows ??
        []
      setParticipation(rows)
    }
  }, [courses])

  useEffect(() => {
    loadProfile()
    loadCourses()
  }, [loadProfile, loadCourses])

  useEffect(() => {
    if (courses.length) loadParticipation(courses[0].id)
  }, [courses, loadParticipation])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/trainer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          subjectAreas:
            typeof profile.subjectAreas === "string"
              ? (profile.subjectAreas as unknown as string).split(",").map((s) => s.trim())
              : profile.subjectAreas,
        }),
      })
      if (res.ok) toast.success("Profile saved")
      else toast.error("Save failed")
    } finally {
      setSaving(false)
    }
  }

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/trainer/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCourse),
    })
    if (res.ok) {
      toast.success("Course created")
      setNewCourse({ title: "", description: "", subjectTag: "", startDate: "", endDate: "" })
      loadCourses()
    } else toast.error("Could not create course")
  }

  const uploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    const fileInput = document.getElementById("trainer-material-file") as HTMLInputElement
    const file = fileInput?.files?.[0]
    if (!file || !materialCourseId) {
      toast.error("Select course and file")
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("folder", "sangam-materials")
      const up = await fetch("/api/upload", { method: "POST", body: form })
      const upData = await up.json()
      if (!up.ok) {
        toast.error(upData.error ?? "Upload failed")
        return
      }
      const res = await fetch("/api/trainer/materials/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: materialCourseId,
          title: materialTitle,
          type: materialType,
          fileUrl: upData.url,
        }),
      })
      if (res.ok) {
        toast.success("Material added")
        setMaterialTitle("")
        fileInput.value = ""
      } else toast.error("Could not save material")
    } finally {
      setUploading(false)
    }
  }

  const createQuestionnaire = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch("/api/trainer/questionnaire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: questionnaireCourseId,
        title: questionnaireTitle,
        deadline: questionnaireDeadline,
        questions: mcqs,
      }),
    })
    if (res.ok) toast.success("Questionnaire created")
    else toast.error("Create failed")
  }

  const updateMcq = (index: number, patch: Partial<McqDraft>) => {
    setMcqs((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Trainer dashboard</h1>
        <p className="text-sm text-slate-600">Courses, library materials, and assessments.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex h-auto flex-wrap gap-1 bg-slate-100">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="library">Trainer Library</TabsTrigger>
          <TabsTrigger value="questionnaires">Questionnaires</TabsTrigger>
          <TabsTrigger value="participation">Participation</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={saveProfile}>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea value={profile.bio ?? ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Subject areas (comma-separated)</Label>
                  <Input
                    value={(profile.subjectAreas ?? []).join(", ")}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        subjectAreas: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Years of experience</Label>
                    <Input
                      type="number"
                      value={profile.yearsExperience ?? ""}
                      onChange={(e) => setProfile({ ...profile, yearsExperience: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={profile.phone ?? ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" className="w-fit bg-sky-600 hover:bg-sky-700" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create course</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={createCourse}>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Title</Label>
                  <Input value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject tag</Label>
                  <Input
                    value={newCourse.subjectTag}
                    onChange={(e) => setNewCourse({ ...newCourse, subjectTag: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input
                    type="date"
                    value={newCourse.startDate}
                    onChange={(e) => setNewCourse({ ...newCourse, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input
                    type="date"
                    value={newCourse.endDate}
                    onChange={(e) => setNewCourse({ ...newCourse, endDate: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="bg-sky-600 hover:bg-sky-700 sm:col-span-2">
                  Create course
                </Button>
              </form>
            </CardContent>
          </Card>
          {courses.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-lg">{c.title}</CardTitle>
                <p className="text-sm text-slate-600">{c.subjectTag} · {c.status}</p>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="library" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload course material</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={uploadMaterial}>
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select value={materialCourseId} onValueChange={setMaterialCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Material type</Label>
                  <Select value={materialType} onValueChange={setMaterialType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["VIDEO", "PDF", "PRESENTATION", "OTHER"].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Title</Label>
                  <Input value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>File</Label>
                  <Input id="trainer-material-file" type="file" required />
                </div>
                <Button type="submit" className="bg-sky-600 hover:bg-sky-700 sm:col-span-2" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload material"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questionnaires" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create questionnaire</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={createQuestionnaire}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select value={questionnaireCourseId} onValueChange={setQuestionnaireCourseId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Input
                      type="datetime-local"
                      value={questionnaireDeadline}
                      onChange={(e) => setQuestionnaireDeadline(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Title</Label>
                    <Input
                      value={questionnaireTitle}
                      onChange={(e) => setQuestionnaireTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {mcqs.map((mcq, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">Question {idx + 1}</p>
                      {mcqs.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setMcqs(mcqs.filter((_, i) => i !== idx))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      placeholder="Question text"
                      value={mcq.questionText}
                      onChange={(e) => updateMcq(idx, { questionText: e.target.value })}
                      required
                    />
                    {mcq.options.map((opt, oi) => (
                      <Input
                        key={oi}
                        placeholder={`Option ${oi + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const options = [...mcq.options]
                          options[oi] = e.target.value
                          updateMcq(idx, { options })
                        }}
                        required
                      />
                    ))}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Correct option index (0-based)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={3}
                          value={mcq.correctOption}
                          onChange={(e) => updateMcq(idx, { correctOption: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subject tag</Label>
                        <Input value={mcq.subjectTag} onChange={(e) => updateMcq(idx, { subjectTag: e.target.value })} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setMcqs([
                      ...mcqs,
                      { questionText: "", options: ["", "", "", ""], correctOption: 0, subjectTag: "" },
                    ])
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add question
                </Button>
                <Button type="submit" className="block bg-sky-600 hover:bg-sky-700">
                  Save questionnaire
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Trainee participation</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-2 pr-4">Course</th>
                    <th className="py-2 pr-4">Trainee</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {participation.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-slate-500">
                        No participation data.
                      </td>
                    </tr>
                  ) : (
                    participation.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-2 pr-4">{row.courseTitle ?? "—"}</td>
                        <td className="py-2 pr-4">{row.traineeName ?? "—"}</td>
                        <td className="py-2 pr-4">{row.status ?? "—"}</td>
                        <td className="py-2">{row.progressPercent != null ? `${row.progressPercent}%` : "—"}</td>
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
