"use client"

import { useCallback, useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { RoleGate } from "@/components/sangam/role-gate"

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

type TrainerQuestionnaire = {
  id: string
  title: string
  deadline?: string
  course?: { title?: string; subjectTag?: string }
  _count?: { questions?: number; attempts?: number }
}

type ParticipationEnrollment = {
  trainee?: { name?: string }
  status?: string
  progressPercent?: number
}

type ParticipationAttempt = {
  trainee?: { name?: string }
  questionnaire?: { title?: string }
  score?: number
  submittedAt?: string
}

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

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

export default function TrainerDashboardPage() {
  return (
    <RoleGate allow="trainer">
      <TrainerDashboard />
    </RoleGate>
  )
}

function TrainerDashboard() {
  const [initialLoading, setInitialLoading] = useState(true)
  const [profile, setProfile] = useState<TrainerProfile>({})
  const [subjectAreasInput, setSubjectAreasInput] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [questionnaireList, setQuestionnaireList] = useState<TrainerQuestionnaire[]>([])
  const [participationCourseId, setParticipationCourseId] = useState("")
  const [participationCourseTitle, setParticipationCourseTitle] = useState("")
  const [enrollments, setEnrollments] = useState<ParticipationEnrollment[]>([])
  const [attempts, setAttempts] = useState<ParticipationAttempt[]>([])
  const [participationLoading, setParticipationLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [creatingCourse, setCreatingCourse] = useState(false)

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
  const [creatingQuestionnaire, setCreatingQuestionnaire] = useState(false)
  const [mcqs, setMcqs] = useState<McqDraft[]>([
    { questionText: "", options: ["", "", "", ""], correctOption: 0, subjectTag: "" },
  ])

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/trainer/profile")
    if (res.ok) {
      const data = await res.json()
      const p: TrainerProfile = data.profile ?? {}
      setProfile(p)
      setSubjectAreasInput((p.subjectAreas ?? []).join(", "))
    }
  }, [])

  const loadCourses = useCallback(async () => {
    const res = await fetch("/api/trainer/courses")
    if (res.ok) {
      const data = await res.json()
      setCourses(data.courses ?? [])
    }
  }, [])

  const loadQuestionnaires = useCallback(async () => {
    const res = await fetch("/api/trainer/questionnaires")
    if (res.ok) {
      const data = await res.json()
      setQuestionnaireList(data.questionnaires ?? [])
    }
  }, [])

  const loadParticipation = useCallback(async (courseId: string) => {
    if (!courseId) {
      setEnrollments([])
      setAttempts([])
      return
    }
    setParticipationLoading(true)
    try {
      const res = await fetch(`/api/trainer/participation/${courseId}`)
      if (res.ok) {
        const data = await res.json()
        setParticipationCourseTitle(data.course?.title ?? "")
        setEnrollments(data.enrollments ?? [])
        setAttempts(data.attempts ?? [])
      } else {
        toast.error("Could not load participation")
        setEnrollments([])
        setAttempts([])
      }
    } finally {
      setParticipationLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.all([loadProfile(), loadCourses(), loadQuestionnaires()]).finally(() =>
      setInitialLoading(false)
    )
  }, [loadProfile, loadCourses, loadQuestionnaires])

  useEffect(() => {
    if (courses.length && !participationCourseId) {
      setParticipationCourseId(courses[0].id)
    }
  }, [courses, participationCourseId])

  useEffect(() => {
    if (participationCourseId) {
      loadParticipation(participationCourseId)
    }
  }, [participationCourseId, loadParticipation])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const bio = (profile.bio ?? "").trim()
    const phone = (profile.phone ?? "").trim()
    const subjectAreas = splitCsv(subjectAreasInput)
    const yearsExperience = Number(profile.yearsExperience ?? "")

    if (!bio) {
      toast.error("Bio is required")
      return
    }
    if (subjectAreas.length === 0) {
      toast.error("Add at least one subject area")
      return
    }
    if (!Number.isFinite(yearsExperience) || yearsExperience < 0) {
      toast.error("Years of experience must be 0 or more")
      return
    }
    if (!phone) {
      toast.error("Phone number is required")
      return
    }
    if (!/^\d{10,15}$/.test(phone.replace(/[\s\-()+]/g, ""))) {
      toast.error("Enter a valid phone number (10–15 digits)")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/trainer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          subjectAreas,
          yearsExperience,
          phone,
        }),
      })
      if (res.ok) toast.success("Profile saved")
      else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? "Save failed")
      }
    } finally {
      setSaving(false)
    }
  }

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    const title = newCourse.title.trim()
    const description = newCourse.description.trim()
    const subjectTag = newCourse.subjectTag.trim()
    if (!title || !description || !subjectTag || !newCourse.startDate || !newCourse.endDate) {
      toast.error("Fill in every course field before creating")
      return
    }
    setCreatingCourse(true)
    try {
      const res = await fetch("/api/trainer/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          subjectTag,
          startDate: newCourse.startDate,
          endDate: newCourse.endDate,
          status: "ACTIVE",
        }),
      })
      if (res.ok) {
        toast.success("Course created")
        setNewCourse({ title: "", description: "", subjectTag: "", startDate: "", endDate: "" })
        await loadCourses()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? "Could not create course")
      }
    } finally {
      setCreatingCourse(false)
    }
  }

  const uploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    const fileInput = document.getElementById("trainer-material-file") as HTMLInputElement
    const file = fileInput?.files?.[0]
    const title = materialTitle.trim()
    if (!materialCourseId) {
      toast.error("Select a course")
      return
    }
    if (!title) {
      toast.error("Material title is required")
      return
    }
    if (!file) {
      toast.error("Choose a file to upload")
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
      const fileUrl = upData.url as string
      const res = await fetch("/api/trainer/materials/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: materialCourseId,
          title,
          type: materialType,
          fileUrl,
        }),
      })
      if (res.ok) {
        toast.success("Material added")
        setMaterialTitle("")
        fileInput.value = ""
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? "Could not save material")
      }
    } finally {
      setUploading(false)
    }
  }

  const createQuestionnaire = async (e: React.FormEvent) => {
    e.preventDefault()
    const title = questionnaireTitle.trim()
    if (!questionnaireCourseId) {
      toast.error("Select a course")
      return
    }
    if (!title) {
      toast.error("Questionnaire title is required")
      return
    }
    if (!questionnaireDeadline) {
      toast.error("Deadline is required")
      return
    }
    for (const [i, mcq] of mcqs.entries()) {
      if (!mcq.questionText.trim()) {
        toast.error(`Question ${i + 1}: question text is required`)
        return
      }
      if (mcq.options.some((o) => !o.trim())) {
        toast.error(`Question ${i + 1}: fill in every option`)
        return
      }
      if (!mcq.subjectTag.trim()) {
        toast.error(`Question ${i + 1}: subject tag is required`)
        return
      }
    }
    setCreatingQuestionnaire(true)
    try {
      const res = await fetch("/api/trainer/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: questionnaireCourseId,
          title,
          deadline: questionnaireDeadline,
          questions: mcqs.map((q) => ({
            questionText: q.questionText.trim(),
            options: q.options.map((o) => o.trim()),
            correctOption: q.correctOption,
            subjectTag: q.subjectTag.trim(),
          })),
        }),
      })
      if (res.ok) {
        toast.success("Questionnaire created")
        setQuestionnaireTitle("")
        setQuestionnaireDeadline("")
        setMcqs([{ questionText: "", options: ["", "", "", ""], correctOption: 0, subjectTag: "" }])
        loadQuestionnaires()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? "Create failed")
      }
    } finally {
      setCreatingQuestionnaire(false)
    }
  }

  const updateMcq = (index: number, patch: Partial<McqDraft>) => {
    setMcqs((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)))
  }

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
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Trainer dashboard</h1>
        <p className="text-sm text-slate-600">Manage courses, materials, assessments, and trainee progress.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto bg-slate-100 p-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="courses">My courses</TabsTrigger>
          <TabsTrigger value="library">Trainer library</TabsTrigger>
          <TabsTrigger value="questionnaires">Questionnaires</TabsTrigger>
          <TabsTrigger value="participation">Participation</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Help trainees understand your expertise.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={saveProfile}>
                <div className="space-y-2">
                  <Label htmlFor="bio" required>
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={profile.bio ?? ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="e.g. Capacity building specialist with 8 years training civil servants in digital literacy and leadership"
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjectAreas" required>
                    Subject areas (comma-separated)
                  </Label>
                  <Input
                    id="subjectAreas"
                    value={subjectAreasInput}
                    onChange={(e) => setSubjectAreasInput(e.target.value)}
                    placeholder="e.g. Digital Literacy, Leadership, Public Policy"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="years" required>
                      Years of experience
                    </Label>
                    <Input
                      id="years"
                      type="number"
                      min={0}
                      value={profile.yearsExperience ?? ""}
                      onChange={(e) => setProfile({ ...profile, yearsExperience: Number(e.target.value) })}
                      placeholder="e.g. 8"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" required>
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={profile.phone ?? ""}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-fit bg-sky-600 hover:bg-sky-700" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    "Save profile"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-4 space-y-4">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Create course</CardTitle>
              <CardDescription>New courses are published as active for trainee enrollment.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={createCourse}>
                <div className="space-y-2 sm:col-span-2">
                  <Label required>Title</Label>
                  <Input
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    placeholder="e.g. Digital Workplace Essentials"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label required>Description</Label>
                  <Textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    placeholder="e.g. Core digital skills for day-to-day organisational work: collaboration tools, file hygiene, and secure communication"
                    required
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label required>Subject tag</Label>
                  <Input
                    value={newCourse.subjectTag}
                    onChange={(e) => setNewCourse({ ...newCourse, subjectTag: e.target.value })}
                    placeholder="e.g. Digital Literacy"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label required>Start date</Label>
                  <Input
                    type="date"
                    value={newCourse.startDate}
                    onChange={(e) => setNewCourse({ ...newCourse, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label required>End date</Label>
                  <Input
                    type="date"
                    value={newCourse.endDate}
                    onChange={(e) => setNewCourse({ ...newCourse, endDate: e.target.value })}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 sm:col-span-2"
                  disabled={creatingCourse}
                >
                  {creatingCourse ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create course"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {courses.length === 0 ? (
            <EmptyBlock title="No courses yet" description="Create your first course to start enrolling trainees." />
          ) : (
            courses.map((c) => (
              <Card key={c.id} className="border-slate-200/80 shadow-sm">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                    {c.status && (
                      <Badge variant="outline" className="border-sky-200 text-sky-800">
                        {c.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{c.subjectTag}</p>
                  {c.description && <CardDescription className="pt-1">{c.description}</CardDescription>}
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="library" className="mt-4">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Upload course material</CardTitle>
              <CardDescription>Files are stored via upload, then linked to your course.</CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <p className="text-sm text-slate-500">Create a course before uploading materials.</p>
              ) : (
                <form className="grid gap-3 sm:grid-cols-2" onSubmit={uploadMaterial}>
                  <div className="space-y-2">
                    <Label required>Course</Label>
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
                    <Label required>Material type</Label>
                    <Select value={materialType} onValueChange={setMaterialType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["PDF", "VIDEO", "PRESENTATION", "OTHER"].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label required>Title</Label>
                    <Input
                      value={materialTitle}
                      onChange={(e) => setMaterialTitle(e.target.value)}
                      placeholder="e.g. Week 1 kickoff presentation"
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label required>File</Label>
                    <Input id="trainer-material-file" type="file" required />
                    <p className="text-xs text-slate-500">Upload a PDF, presentation, or video under 5MB.</p>
                  </div>
                  <Button type="submit" className="bg-sky-600 hover:bg-sky-700 sm:col-span-2" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading
                      </>
                    ) : (
                      "Upload material"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questionnaires" className="mt-4 space-y-4">
          {questionnaireList.length > 0 && (
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Your questionnaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {questionnaireList.map((q) => (
                  <div
                    key={q.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{q.title}</p>
                      <p className="text-xs text-slate-500">
                        {q.course?.title ?? "Course"} · {q._count?.questions ?? 0} questions ·{" "}
                        {q._count?.attempts ?? 0} attempts
                      </p>
                    </div>
                    {q.deadline && (
                      <span className="text-xs text-slate-400">
                        Due {new Date(q.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Create questionnaire</CardTitle>
              <CardDescription>Each question needs four options and one correct index (0 to 3).</CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <p className="text-sm text-slate-500">Create a course before adding questionnaires.</p>
              ) : (
                <form className="space-y-4" onSubmit={createQuestionnaire}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label required>Course</Label>
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
                      <Label required>Deadline</Label>
                      <Input
                        type="datetime-local"
                        value={questionnaireDeadline}
                        onChange={(e) => setQuestionnaireDeadline(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label required>Title</Label>
                      <Input
                        value={questionnaireTitle}
                        onChange={(e) => setQuestionnaireTitle(e.target.value)}
                        placeholder="e.g. Module 1 MCQ Check"
                        required
                      />
                    </div>
                  </div>
                  {mcqs.map((mcq, idx) => (
                    <div key={idx} className="space-y-3 rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">
                          Question {idx + 1}
                          <span className="ml-1 text-red-500" aria-hidden="true">
                            *
                          </span>
                        </p>
                        {mcqs.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setMcqs(mcqs.filter((_, i) => i !== idx))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        placeholder="e.g. Which practice best protects sensitive organisational files?"
                        value={mcq.questionText}
                        onChange={(e) => updateMcq(idx, { questionText: e.target.value })}
                        required
                      />
                      {mcq.options.map((opt, oi) => (
                        <div key={oi} className="space-y-1">
                          <Label required>{`Option ${oi + 1}`}</Label>
                          <Input
                            placeholder={
                              oi === 0
                                ? "e.g. Share via public drive links"
                                : oi === 1
                                  ? "e.g. Use role-based access and encryption"
                                  : oi === 2
                                    ? "e.g. Email unencrypted attachments"
                                    : "e.g. Store only on personal devices"
                            }
                            value={opt}
                            onChange={(e) => {
                              const options = [...mcq.options]
                              options[oi] = e.target.value
                              updateMcq(idx, { options })
                            }}
                            required
                          />
                        </div>
                      ))}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label required>Correct option index (0 to 3)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={3}
                            value={mcq.correctOption}
                            onChange={(e) => updateMcq(idx, { correctOption: Number(e.target.value) })}
                            placeholder="e.g. 1 for the second option"
                            required
                          />
                          <p className="text-xs text-slate-500">0 = first option, 1 = second, 2 = third, 3 = fourth</p>
                        </div>
                        <div className="space-y-2">
                          <Label required>Subject tag</Label>
                          <Input
                            value={mcq.subjectTag}
                            onChange={(e) => updateMcq(idx, { subjectTag: e.target.value })}
                            placeholder="e.g. Digital Literacy"
                            required
                          />
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
                  <Button type="submit" className="block bg-sky-600 hover:bg-sky-700" disabled={creatingQuestionnaire}>
                    {creatingQuestionnaire ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save questionnaire"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participation" className="mt-4 space-y-4">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Trainee participation</CardTitle>
              <CardDescription>Enrollment progress and assessment attempts for a selected course.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.length === 0 ? (
                <EmptyBlock title="No courses" description="Create a course to view participation." />
              ) : (
                <>
                  <div className="max-w-md space-y-2">
                    <Label>Course</Label>
                    <Select
                      value={participationCourseId}
                      onValueChange={(id) => {
                        setParticipationCourseId(id)
                      }}
                    >
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

                  {participationLoading ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading participation
                    </div>
                  ) : (
                    <>
                      {participationCourseTitle && (
                        <p className="text-sm font-medium text-slate-700">{participationCourseTitle}</p>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-600">
                              <th className="py-2 pr-4 font-medium">Trainee</th>
                              <th className="py-2 pr-4 font-medium">Status</th>
                              <th className="py-2 font-medium">Progress</th>
                            </tr>
                          </thead>
                          <tbody>
                            {enrollments.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="py-6 text-slate-500">
                                  No trainees enrolled in this course yet.
                                </td>
                              </tr>
                            ) : (
                              enrollments.map((row, i) => (
                                <tr key={i} className="border-b border-slate-100">
                                  <td className="py-3 pr-4">{row.trainee?.name ?? "Unknown"}</td>
                                  <td className="py-3 pr-4">
                                    <Badge variant="outline">{row.status ?? "Unknown"}</Badge>
                                  </td>
                                  <td className="py-3">
                                    {row.progressPercent != null ? (
                                      <div className="flex min-w-[120px] items-center gap-2">
                                        <Progress value={row.progressPercent} className="h-2 flex-1" />
                                        <span className="text-xs text-slate-500">{row.progressPercent}%</span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400">Not set</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">Assessment attempts</h3>
                        {attempts.length === 0 ? (
                          <p className="text-sm text-slate-500">No attempts recorded for this course.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-600">
                                  <th className="py-2 pr-4 font-medium">Trainee</th>
                                  <th className="py-2 pr-4 font-medium">Assessment</th>
                                  <th className="py-2 pr-4 font-medium">Score</th>
                                  <th className="py-2 font-medium">Submitted</th>
                                </tr>
                              </thead>
                              <tbody>
                                {attempts.map((a, i) => (
                                  <tr key={i} className="border-b border-slate-100">
                                    <td className="py-2 pr-4">{a.trainee?.name ?? "Unknown"}</td>
                                    <td className="py-2 pr-4">{a.questionnaire?.title ?? "Assessment"}</td>
                                    <td className="py-2 pr-4">{a.score ?? "-"}</td>
                                    <td className="py-2">
                                      {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
