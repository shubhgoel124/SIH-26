"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

type Profile = {
  qualifications?: string
  workExperience?: string
  interests?: string[]
  skills?: string[]
  phone?: string
  certificateUrls?: string[]
}

type Course = { id: string; title: string; description?: string; subjectTag?: string; status?: string }
type Enrollment = {
  id: string
  courseId: string
  status: string
  progressPercent?: number
  course?: Course
}
type Material = { id: string; title: string; type: string; fileUrl: string }
type Assessment = { id: string; title: string; deadline?: string; courseId?: string }
type Question = { id: string; questionText: string; options: string[] }
type Certificate = {
  id: string
  title: string
  issuer: string
  issueDate: string
  verificationToken: string
}

export default function TraineeDashboardPage() {
  const [profile, setProfile] = useState<Profile>({})
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [materialsCourseId, setMaterialsCourseId] = useState("")
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [feedbackCourseId, setFeedbackCourseId] = useState("")
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackComments, setFeedbackComments] = useState("")
  const [saving, setSaving] = useState(false)

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/trainee/profile")
    if (res.ok) {
      const data = await res.json()
      setProfile(data.profile ?? data)
    }
  }, [])

  const loadCourses = useCallback(async () => {
    const res = await fetch("/api/trainee/courses")
    if (res.ok) {
      const data = await res.json()
      setCourses(data.courses ?? data ?? [])
    }
  }, [])

  const loadEnrollments = useCallback(async () => {
    const res = await fetch("/api/trainee/enrollments")
    if (res.ok) {
      const data = await res.json()
      setEnrollments(data.enrollments ?? data ?? [])
    }
  }, [])

  const loadAssessments = useCallback(async () => {
    const res = await fetch("/api/trainee/assessments")
    if (res.ok) {
      const data = await res.json()
      setAssessments(data.assessments ?? data ?? [])
    }
  }, [])

  const loadCertificates = useCallback(async () => {
    const res = await fetch("/api/trainee/certificates")
    if (res.ok) {
      const data = await res.json()
      setCertificates(data.certificates ?? data ?? [])
    }
  }, [])

  useEffect(() => {
    loadProfile()
    loadCourses()
    loadEnrollments()
    loadAssessments()
    loadCertificates()
  }, [loadProfile, loadCourses, loadEnrollments, loadAssessments, loadCertificates])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/trainee/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          interests: typeof profile.interests === "string" ? (profile.interests as unknown as string).split(",") : profile.interests,
          skills: typeof profile.skills === "string" ? (profile.skills as unknown as string).split(",") : profile.skills,
        }),
      })
      if (res.ok) toast.success("Profile saved")
      else toast.error("Could not save profile")
    } finally {
      setSaving(false)
    }
  }

  const enroll = async (courseId: string) => {
    const res = await fetch(`/api/trainee/enroll/${courseId}`, { method: "POST" })
    if (res.ok) {
      toast.success("Enrolled")
      loadEnrollments()
      loadCourses()
    } else toast.error("Enrollment failed")
  }

  const loadMaterials = async (courseId: string) => {
    setMaterialsCourseId(courseId)
    const res = await fetch(`/api/trainee/courses/${courseId}/materials`)
    if (res.ok) {
      const data = await res.json()
      setMaterials(data.materials ?? data ?? [])
    } else setMaterials([])
  }

  const completeCourse = async (courseId: string) => {
    const res = await fetch(`/api/trainee/complete/${courseId}`, { method: "POST" })
    if (res.ok) {
      toast.success("Course marked complete")
      loadEnrollments()
    } else toast.error("Could not complete course")
  }

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackCourseId) return
    const res = await fetch(`/api/trainee/feedback/${feedbackCourseId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: feedbackRating, comments: feedbackComments }),
    })
    if (res.ok) toast.success("Feedback submitted")
    else toast.error("Feedback failed")
  }

  const openAssessment = async (id: string) => {
    setActiveAssessmentId(id)
    setAnswers({})
    const res = await fetch(`/api/trainee/assessment/${id}`)
    if (res.ok) {
      const data = await res.json()
      setQuestions(data.questions ?? data.questionnaire?.questions ?? [])
    }
  }

  const submitAssessment = async () => {
    if (!activeAssessmentId) return
    const answerList = questions.map((q) => answers[q.id] ?? 0)
    const res = await fetch(`/api/trainee/assessment/${activeAssessmentId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answerList }),
    })
    if (res.ok) {
      toast.success("Assessment submitted")
      setActiveAssessmentId(null)
      loadAssessments()
    } else toast.error("Submit failed")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Trainee dashboard</h1>
        <p className="text-sm text-slate-600">Manage your profile, courses, and assessments.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex h-auto flex-wrap gap-1 bg-slate-100">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="courses">Browse Courses</TabsTrigger>
          <TabsTrigger value="enrollments">My Enrollments</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Qualifications</Label>
                  <Textarea
                    value={profile.qualifications ?? ""}
                    onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Work experience</Label>
                  <Textarea
                    value={profile.workExperience ?? ""}
                    onChange={(e) => setProfile({ ...profile, workExperience: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Interests (comma-separated)</Label>
                  <Input
                    value={(profile.interests ?? []).join(", ")}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        interests: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Skills (comma-separated)</Label>
                  <Input
                    value={(profile.skills ?? []).join(", ")}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={profile.phone ?? ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" className="bg-sky-600 hover:bg-sky-700" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-4 space-y-4">
          {courses.length === 0 ? (
            <p className="text-sm text-slate-500">No courses available.</p>
          ) : (
            courses.map((c) => (
              <Card key={c.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                    {c.subjectTag && (
                      <Badge variant="outline" className="mt-1 border-sky-200 text-sky-800">
                        {c.subjectTag}
                      </Badge>
                    )}
                  </div>
                  <Button size="sm" className="bg-sky-600 hover:bg-sky-700" onClick={() => enroll(c.id)}>
                    Enroll
                  </Button>
                </CardHeader>
                {c.description && <CardContent className="pt-0 text-sm text-slate-600">{c.description}</CardContent>}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="enrollments" className="mt-4 space-y-4">
          {enrollments.map((en) => (
            <Card key={en.id}>
              <CardHeader>
                <CardTitle className="text-lg">{en.course?.title ?? en.courseId}</CardTitle>
                <p className="text-sm text-slate-600">
                  Status: {en.status}
                  {en.progressPercent != null && ` · ${en.progressPercent}% progress`}
                </p>
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
          ))}
          {materialsCourseId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Materials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {materials.length === 0 ? (
                  <p className="text-sm text-slate-500">No materials loaded.</p>
                ) : (
                  materials.map((m) => (
                    <a
                      key={m.id}
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-sky-600 hover:underline"
                    >
                      {m.title} ({m.type})
                    </a>
                  ))
                )}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={submitFeedback}>
                <div className="space-y-2">
                  <Label>Course ID</Label>
                  <Input value={feedbackCourseId} onChange={(e) => setFeedbackCourseId(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Rating (1–5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Comments</Label>
                  <Textarea value={feedbackComments} onChange={(e) => setFeedbackComments(e.target.value)} />
                </div>
                <Button type="submit" className="bg-sky-600 hover:bg-sky-700 sm:col-span-2">
                  Submit feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="mt-4 space-y-4">
          {!activeAssessmentId ? (
            assessments.map((a) => (
              <Card key={a.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{a.title}</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => openAssessment(a.id)}>
                    Take assessment
                  </Button>
                </CardHeader>
                {a.deadline && (
                  <CardContent className="pt-0 text-sm text-slate-500">
                    Deadline: {new Date(a.deadline).toLocaleString()}
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Assessment in progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="space-y-2 rounded-lg border border-slate-100 p-3">
                    <p className="font-medium text-slate-800">{q.questionText}</p>
                    <div className="space-y-1">
                      {q.options.map((opt, idx) => (
                        <label key={idx} className="flex cursor-pointer items-center gap-2 text-sm">
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
                ))}
                <div className="flex gap-2">
                  <Button className="bg-sky-600 hover:bg-sky-700" onClick={submitAssessment}>
                    Submit
                  </Button>
                  <Button variant="outline" onClick={() => setActiveAssessmentId(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="certificates" className="mt-4 space-y-4">
          {certificates.length === 0 ? (
            <p className="text-sm text-slate-500">No certificates yet.</p>
          ) : (
            certificates.map((cert) => (
              <Card key={cert.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{cert.title}</CardTitle>
                  <p className="text-sm text-slate-600">
                    {cert.issuer} · {new Date(cert.issueDate).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/verify/${cert.verificationToken}`}
                    className="text-sm font-medium text-sky-600 hover:text-sky-700"
                  >
                    Verify certificate
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
