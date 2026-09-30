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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { RoleGate } from "@/components/sangam/role-gate"

type Profile = {
  qualifications?: string
  workExperience?: string
  interests?: string[]
  skills?: string[]
  phone?: string
}

type CourseEnrollment = {
  id: string
  status: string
  progressPercent?: number
  enrolledAt?: string
  completionDate?: string | null
}

type Course = {
  id: string
  title: string
  description?: string
  subjectTag?: string
  status?: string
  enrollment: CourseEnrollment | null
  trainer?: { name?: string }
}

type Enrollment = {
  id: string
  courseId: string
  status: string
  progressPercent?: number
  course?: { id: string; title: string; subjectTag?: string } | null
}

type Material = { id: string; title: string; type: string; fileUrl: string }

type QuestionnaireListItem = {
  id: string
  title: string
  deadline?: string
  course?: { title?: string; subjectTag?: string }
  attempts?: { id: string; score?: number; submittedAt?: string }[]
  _count?: { questions?: number }
}

type Question = { id: string; questionText: string; options: string[] }

type Certificate = {
  id: string
  title: string
  issuer: string
  issueDate: string
  verificationToken: string
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

export default function TraineeDashboardPage() {
  return (
    <RoleGate allow="trainee">
      <TraineeDashboard />
    </RoleGate>
  )
}

function TraineeDashboard() {
  const [initialLoading, setInitialLoading] = useState(true)
  const [profile, setProfile] = useState<Profile>({})
  const [interestsInput, setInterestsInput] = useState("")
  const [skillsInput, setSkillsInput] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [materialsCourseId, setMaterialsCourseId] = useState("")
  const [materialsLoading, setMaterialsLoading] = useState(false)
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireListItem[]>([])
  const [activeQuestionnaireId, setActiveQuestionnaireId] = useState<string | null>(null)
  const [activeTitle, setActiveTitle] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [existingAttempt, setExistingAttempt] = useState<{ score?: number; submittedAt?: string } | null>(
    null
  )
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [assessmentLoading, setAssessmentLoading] = useState(false)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [feedbackCourseId, setFeedbackCourseId] = useState("")
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackComments, setFeedbackComments] = useState("")
  const [saving, setSaving] = useState(false)
  const [enrollingId, setEnrollingId] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/trainee/profile")
    if (res.ok) {
      const data = await res.json()
      const p: Profile = data.profile ?? {}
      setProfile(p)
      setInterestsInput((p.interests ?? []).join(", "))
      setSkillsInput((p.skills ?? []).join(", "))
    }
  }, [])

  const loadCourses = useCallback(async () => {
    const res = await fetch("/api/trainee/courses")
    if (res.ok) {
      const data = await res.json()
      setCourses(data.courses ?? [])
    }
  }, [])

  const loadEnrollments = useCallback(async () => {
    const res = await fetch("/api/trainee/enrollments")
    if (res.ok) {
      const data = await res.json()
      setEnrollments(data.enrollments ?? [])
    }
  }, [])

  const loadQuestionnaires = useCallback(async () => {
    const res = await fetch("/api/trainee/assessments")
    if (res.ok) {
      const data = await res.json()
      setQuestionnaires(data.questionnaires ?? [])
    }
  }, [])

  const loadCertificates = useCallback(async () => {
    const res = await fetch("/api/trainee/certificates")
    if (res.ok) {
      const data = await res.json()
      setCertificates(data.certificates ?? [])
    }
  }, [])

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadProfile(),
      loadCourses(),
      loadEnrollments(),
      loadQuestionnaires(),
      loadCertificates(),
    ])
  }, [loadProfile, loadCourses, loadEnrollments, loadQuestionnaires, loadCertificates])

  useEffect(() => {
    refreshAll().finally(() => setInitialLoading(false))
  }, [refreshAll])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/trainee/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qualifications: profile.qualifications ?? "",
          workExperience: profile.workExperience ?? "",
          interests: splitCsv(interestsInput),
          skills: splitCsv(skillsInput),
          phone: profile.phone ?? "",
        }),
      })
      if (res.ok) {
        toast.success("Profile saved")
        loadProfile()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? "Could not save profile")
      }
    } finally {
      setSaving(false)
    }
  }

  const enroll = async (courseId: string) => {
    setEnrollingId(courseId)
    try {
      const res = await fetch(`/api/trainee/enroll/${courseId}`, { method: "POST" })
      if (res.ok) {
        toast.success("Enrolled successfully")
        await Promise.all([loadEnrollments(), loadCourses(), loadQuestionnaires()])
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? "Enrollment failed")
      }
    } finally {
      setEnrollingId(null)
    }
  }

  const loadMaterials = async (courseId: string) => {
    setMaterialsCourseId(courseId)
    setMaterialsLoading(true)
    try {
      const res = await fetch(`/api/trainee/courses/${courseId}/materials`)
      if (res.ok) {
        const data = await res.json()
        setMaterials(data.materials ?? [])
      } else {
        setMaterials([])
        toast.error("Could not load materials")
      }
    } finally {
      setMaterialsLoading(false)
    }
  }

  const completeCourse = async (courseId: string) => {
    const res = await fetch(`/api/trainee/complete/${courseId}`, { method: "POST" })
    if (res.ok) {
      toast.success("Course marked complete")
      loadEnrollments()
      loadCertificates()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Could not complete course")
    }
  }

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackCourseId) {
      toast.error("Select a course")
      return
    }
    const res = await fetch(`/api/trainee/feedback/${feedbackCourseId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: Number(feedbackRating),
        comments: feedbackComments,
      }),
    })
    if (res.ok) {
      toast.success("Feedback submitted")
      setFeedbackComments("")
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Feedback failed")
    }
  }

  const openAssessment = async (item: QuestionnaireListItem) => {
    setActiveQuestionnaireId(item.id)
    setActiveTitle(item.title)
    setAnswers({})
    setQuestions([])
    setExistingAttempt(null)
    setAssessmentLoading(true)
    try {
      const res = await fetch(`/api/trainee/assessment/${item.id}`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.questionnaire?.questions ?? [])
        setExistingAttempt(data.attempt ?? null)
      } else {
        toast.error("Could not load assessment")
        setActiveQuestionnaireId(null)
      }
    } finally {
      setAssessmentLoading(false)
    }
  }

  const submitAssessment = async () => {
    if (!activeQuestionnaireId) return
    if (questions.some((q) => answers[q.id] === undefined)) {
      toast.error("Please answer every question before submitting")
      return
    }
    const answerList = questions.map((q) => answers[q.id])
    const res = await fetch(`/api/trainee/assessment/${activeQuestionnaireId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answerList }),
    })
    if (res.ok) {
      const data = await res.json()
      toast.success(`Submitted. Score: ${Math.round(data.score)}%${data.passed ? " (passed)" : ""}`)
      setActiveQuestionnaireId(null)
      loadQuestionnaires()
      loadEnrollments()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? "Submit failed")
    }
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
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Trainee dashboard</h1>
        <p className="text-sm text-slate-600">Profile, courses, assessments, and certificates in one place.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex h-auto flex-wrap gap-1 bg-slate-100 p-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="courses">Browse courses</TabsTrigger>
          <TabsTrigger value="enrollments">My enrollments</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Keep your background and contact details up to date.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    value={profile.qualifications ?? ""}
                    onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="workExperience">Work experience</Label>
                  <Textarea
                    id="workExperience"
                    value={profile.workExperience ?? ""}
                    onChange={(e) => setProfile({ ...profile, workExperience: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interests">Interests (comma-separated)</Label>
                  <Input
                    id="interests"
                    value={interestsInput}
                    onChange={(e) => setInterestsInput(e.target.value)}
                    placeholder="Policy, leadership, data"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="Communication, analysis"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone ?? ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div className="flex items-end sm:col-span-2">
                  <Button type="submit" className="bg-sky-600 hover:bg-sky-700" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      "Save profile"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-4 space-y-4">
          {courses.length === 0 ? (
            <EmptyBlock
              title="No open courses"
              description="When trainers publish active courses, they will appear here for enrollment."
            />
          ) : (
            courses.map((c) => {
              const enrolled = c.enrollment != null
              return (
                <Card key={c.id} className="border-slate-200/80 shadow-sm">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg">{c.title}</CardTitle>
                        {enrolled && (
                          <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100">Enrolled</Badge>
                        )}
                      </div>
                      {c.subjectTag && (
                        <Badge variant="outline" className="border-sky-200 text-sky-800">
                          {c.subjectTag}
                        </Badge>
                      )}
                      {c.trainer?.name && (
                        <p className="text-sm text-slate-500">Trainer: {c.trainer.name}</p>
                      )}
                    </div>
                    {!enrolled ? (
                      <Button
                        size="sm"
                        className="shrink-0 bg-sky-600 hover:bg-sky-700"
                        disabled={enrollingId === c.id}
                        onClick={() => enroll(c.id)}
                      >
                        {enrollingId === c.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Enroll"
                        )}
                      </Button>
                    ) : (
                      <Badge variant="outline" className="shrink-0 border-slate-200 text-slate-600">
                        {c.enrollment?.status ?? "Active"}
                      </Badge>
                    )}
                  </CardHeader>
                  {c.description && (
                    <CardContent className="pt-0 text-sm leading-relaxed text-slate-600">{c.description}</CardContent>
                  )}
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="enrollments" className="mt-4 space-y-4">
          {enrollments.length === 0 ? (
            <EmptyBlock
              title="No enrollments yet"
              description="Browse courses and enroll to access materials, assessments, and feedback."
            />
          ) : (
            enrollments.map((en) => (
              <Card key={en.id} className="border-slate-200/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{en.course?.title ?? en.courseId}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge variant="outline">{en.status}</Badge>
                    {en.course?.subjectTag && (
                      <Badge variant="outline" className="border-sky-200 text-sky-800">
                        {en.course.subjectTag}
                      </Badge>
                    )}
                  </div>
                  {en.progressPercent != null && (
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Progress</span>
                        <span>{en.progressPercent}%</span>
                      </div>
                      <Progress value={en.progressPercent} className="h-2" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => loadMaterials(en.courseId)}>
                    View materials
                  </Button>
                  <Button size="sm" className="bg-sky-600 hover:bg-sky-700" onClick={() => completeCourse(en.courseId)}>
                    Mark complete
                  </Button>
                </CardContent>
              </Card>
            ))
          )}

          {materialsCourseId && (
            <Card className="border-sky-100 bg-sky-50/30">
              <CardHeader>
                <CardTitle className="text-base">Course materials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {materialsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading materials
                  </div>
                ) : materials.length === 0 ? (
                  <p className="text-sm text-slate-500">No materials for this course yet.</p>
                ) : (
                  materials.map((m) => (
                    <a
                      key={m.id}
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-sky-700 hover:bg-sky-50"
                    >
                      <span>{m.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {m.type}
                      </Badge>
                    </a>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Course feedback</CardTitle>
              <CardDescription>Share a rating after you have started a course.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={submitFeedback}>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Course</Label>
                  <Select value={feedbackCourseId} onValueChange={setFeedbackCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select enrolled course" />
                    </SelectTrigger>
                    <SelectContent>
                      {enrollments.map((en) => (
                        <SelectItem key={en.courseId} value={en.courseId}>
                          {en.course?.title ?? en.courseId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1 to 5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min={1}
                    max={5}
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="comments">Comments</Label>
                  <Textarea
                    id="comments"
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="bg-sky-600 hover:bg-sky-700 sm:col-span-2">
                  Submit feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="mt-4 space-y-4">
          {!activeQuestionnaireId ? (
            questionnaires.length === 0 ? (
              <EmptyBlock
                title="No assessments available"
                description="Enroll in courses that include questionnaires to see them here."
              />
            ) : (
              questionnaires.map((q) => {
                const submitted = (q.attempts?.length ?? 0) > 0
                const lastScore = q.attempts?.[0]?.score
                return (
                  <Card key={q.id} className="border-slate-200/80 shadow-sm">
                    <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                      <div>
                        <CardTitle className="text-lg">{q.title}</CardTitle>
                        {q.course?.title && (
                          <p className="text-sm text-slate-500">Course: {q.course.title}</p>
                        )}
                        {q.deadline && (
                          <p className="mt-1 text-xs text-slate-400">
                            Deadline: {new Date(q.deadline).toLocaleString()}
                          </p>
                        )}
                        {submitted && lastScore != null && (
                          <Badge className="mt-2 bg-slate-100 text-slate-700 hover:bg-slate-100">
                            Submitted · Score {lastScore}
                          </Badge>
                        )}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openAssessment(q)}>
                        {submitted ? "Review" : "Take assessment"}
                      </Button>
                    </CardHeader>
                  </Card>
                )
              })
            )
          ) : (
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle>{activeTitle}</CardTitle>
                {existingAttempt && (
                  <CardDescription>
                    You already submitted this assessment
                    {existingAttempt.score != null ? ` with score ${existingAttempt.score}.` : "."}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {assessmentLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading questions
                  </div>
                ) : existingAttempt ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                      Submitted on{" "}
                      {existingAttempt.submittedAt
                        ? new Date(existingAttempt.submittedAt).toLocaleString()
                        : "recorded date unavailable"}
                      {existingAttempt.score != null ? ` · Score ${existingAttempt.score}%` : ""}.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setExistingAttempt(null)
                        setAnswers({})
                      }}
                    >
                      Retake assessment
                    </Button>
                  </div>
                ) : (
                  questions.map((q, qi) => (
                    <div key={q.id} className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                      <p className="font-medium text-slate-800">
                        {qi + 1}. {q.questionText}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, idx) => (
                          <label
                            key={idx}
                            className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-sm hover:border-sky-100 hover:bg-white"
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={answers[q.id] === idx}
                              onChange={() => setAnswers({ ...answers, [q.id]: idx })}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))
                )}
                <div className="flex gap-2 pt-2">
                  {!existingAttempt && !assessmentLoading && questions.length > 0 && (
                    <Button className="bg-sky-600 hover:bg-sky-700" onClick={submitAssessment}>
                      Submit answers
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveQuestionnaireId(null)
                      setQuestions([])
                    }}
                  >
                    Back to list
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="certificates" className="mt-4 space-y-4">
          {certificates.length === 0 ? (
            <EmptyBlock
              title="No certificates yet"
              description="Complete courses to earn verifiable certificates."
            />
          ) : (
            certificates.map((cert) => (
              <Card key={cert.id} className="border-slate-200/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{cert.title}</CardTitle>
                  <p className="text-sm text-slate-600">
                    {cert.issuer} · {new Date(cert.issueDate).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <a
                    href={`/verify/${cert.verificationToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-sky-600 hover:text-sky-700"
                  >
                    Open verification page
                  </a>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
