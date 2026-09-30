import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import path from "path"

export type Role = "TRAINEE" | "TRAINER" | "ADMIN"
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"
export type CourseStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED"
export type MaterialType = "VIDEO" | "PDF" | "PRESENTATION" | "OTHER"
export type EnrollmentStatus = "ENROLLED" | "IN_PROGRESS" | "COMPLETED"
export type AnnouncementType = "NOTIFICATION" | "ACHIEVEMENT" | "NEW_CONTENT"

export type User = {
  id: string
  name: string
  email: string
  password: string
  role: Role
  approvalStatus: ApprovalStatus
  createdAt: string
}

export type TraineeProfile = {
  id: string
  userId: string
  qualifications?: string
  workExperience?: string
  interests: string[]
  skills: string[]
  phone?: string
  certificateUrls: string[]
  updatedAt: string
}

export type TrainerProfile = {
  id: string
  userId: string
  bio?: string
  subjectAreas: string[]
  yearsExperience?: number
  phone?: string
  updatedAt: string
}

export type Course = {
  id: string
  title: string
  description: string
  subjectTag: string
  trainerId: string
  startDate: string
  endDate: string
  status: CourseStatus
  createdAt: string
}

export type CourseMaterial = {
  id: string
  courseId: string
  title: string
  type: MaterialType
  fileUrl: string
  uploadedAt: string
}

export type Enrollment = {
  id: string
  traineeId: string
  courseId: string
  status: EnrollmentStatus
  progressPercent: number
  enrolledAt: string
  completionDate?: string
}

export type Questionnaire = {
  id: string
  courseId: string
  trainerId: string
  title: string
  deadline: string
  createdAt: string
}

export type Question = {
  id: string
  questionnaireId: string
  questionText: string
  options: string[]
  correctOption: number
  subjectTag: string
}

export type AssessmentAttempt = {
  id: string
  traineeId: string
  questionnaireId: string
  score: number
  answers: number[]
  submittedAt: string
}

export type CourseFeedback = {
  id: string
  traineeId: string
  courseId: string
  rating: number
  comments?: string
  createdAt: string
}

export type Announcement = {
  id: string
  postedById: string
  title: string
  body: string
  type: AnnouncementType
  postedAt: string
}

export type CompetencyMap = {
  id: string
  subjectTag: string
  trainerId: string
  proficiencyScore: number
  rationale?: string
}

export type Certificate = {
  id: string
  traineeId: string
  courseId?: string
  title: string
  issuer: string
  issueDate: string
  certificateUrl?: string
  verificationToken: string
  isPublic: boolean
}

export type Database = {
  users: User[]
  traineeProfiles: TraineeProfile[]
  trainerProfiles: TrainerProfile[]
  courses: Course[]
  courseMaterials: CourseMaterial[]
  enrollments: Enrollment[]
  questionnaires: Questionnaire[]
  questions: Question[]
  assessmentAttempts: AssessmentAttempt[]
  courseFeedbacks: CourseFeedback[]
  announcements: Announcement[]
  competencyMaps: CompetencyMap[]
  certificates: Certificate[]
}

const DATA_DIR = path.join(process.cwd(), "data")
const DB_PATH = path.join(DATA_DIR, "db.json")

let mutating = false

export function cuid() {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

function now() {
  return new Date().toISOString()
}

function emptyDb(): Database {
  return {
    users: [],
    traineeProfiles: [],
    trainerProfiles: [],
    courses: [],
    courseMaterials: [],
    enrollments: [],
    questionnaires: [],
    questions: [],
    assessmentAttempts: [],
    courseFeedbacks: [],
    announcements: [],
    competencyMaps: [],
    certificates: [],
  }
}

function seedDb(): Database {
  const db = emptyDb()
  const adminId = cuid()
  const trainerId = cuid()
  const trainer2Id = cuid()
  const traineeId = cuid()
  const pendingId = cuid()
  const courseId = cuid()
  const questionnaireId = cuid()

  db.users.push(
    {
      id: adminId,
      name: "Demo Admin",
      email: "admin@sangam.dev",
      password: "password",
      role: "ADMIN",
      approvalStatus: "APPROVED",
      createdAt: now(),
    },
    {
      id: trainerId,
      name: "Priya Sharma",
      email: "trainer@sangam.dev",
      password: "password",
      role: "TRAINER",
      approvalStatus: "APPROVED",
      createdAt: now(),
    },
    {
      id: trainer2Id,
      name: "Rahul Mehta",
      email: "trainer2@sangam.dev",
      password: "password",
      role: "TRAINER",
      approvalStatus: "APPROVED",
      createdAt: now(),
    },
    {
      id: traineeId,
      name: "Asha Verma",
      email: "trainee@sangam.dev",
      password: "password",
      role: "TRAINEE",
      approvalStatus: "APPROVED",
      createdAt: now(),
    },
    {
      id: pendingId,
      name: "Pending Trainer",
      email: "pending.trainer@sangam.dev",
      password: "password",
      role: "TRAINER",
      approvalStatus: "PENDING",
      createdAt: now(),
    }
  )

  db.trainerProfiles.push(
    {
      id: cuid(),
      userId: trainerId,
      bio: "Capacity building specialist focused on digital literacy and public administration.",
      subjectAreas: ["Digital Literacy", "Leadership", "Public Policy"],
      yearsExperience: 8,
      phone: "9876543210",
      updatedAt: now(),
    },
    {
      id: cuid(),
      userId: trainer2Id,
      bio: "Cybersecurity trainer for government departments.",
      subjectAreas: ["Cybersecurity", "Data Protection"],
      yearsExperience: 6,
      updatedAt: now(),
    }
  )

  db.traineeProfiles.push({
    id: cuid(),
    userId: traineeId,
    qualifications: "B.A. Public Administration",
    workExperience: "3 years as section officer",
    interests: ["Leadership", "Digital tools"],
    skills: ["MS Office", "Communication"],
    phone: "9123456780",
    certificateUrls: [],
    updatedAt: now(),
  })

  db.courses.push({
    id: courseId,
    title: "Digital Workplace Essentials",
    description:
      "Core digital skills for day-to-day organisational work: collaboration tools, file hygiene, and secure communication.",
    subjectTag: "Digital Literacy",
    trainerId,
    startDate: "2026-01-15T00:00:00.000Z",
    endDate: "2026-03-15T00:00:00.000Z",
    status: "ACTIVE",
    createdAt: now(),
  })

  db.courseMaterials.push(
    {
      id: cuid(),
      courseId,
      title: "Kickoff presentation",
      type: "PRESENTATION",
      fileUrl: "/uploads/sample-kickoff.pdf",
      uploadedAt: now(),
    },
    {
      id: cuid(),
      courseId,
      title: "Secure email practices",
      type: "PDF",
      fileUrl: "/uploads/sample-secure-email.pdf",
      uploadedAt: now(),
    }
  )

  db.enrollments.push({
    id: cuid(),
    traineeId,
    courseId,
    status: "IN_PROGRESS",
    progressPercent: 40,
    enrolledAt: now(),
  })

  db.questionnaires.push({
    id: questionnaireId,
    courseId,
    trainerId,
    title: "Module 1 MCQ Check",
    deadline: "2026-12-31T23:59:59.000Z",
    createdAt: now(),
  })

  db.questions.push(
    {
      id: cuid(),
      questionnaireId,
      questionText: "Which practice best protects sensitive organisational files?",
      options: [
        "Share via public drive links",
        "Use role-based access and encryption",
        "Email unencrypted attachments",
        "Store only on personal devices",
      ],
      correctOption: 1,
      subjectTag: "Digital Literacy",
    },
    {
      id: cuid(),
      questionnaireId,
      questionText: "What is a strong password practice?",
      options: [
        "Reuse one password everywhere",
        "Use short memorable words",
        "Use long unique passphrases with MFA",
        "Write passwords on sticky notes",
      ],
      correctOption: 2,
      subjectTag: "Cybersecurity",
    },
    {
      id: cuid(),
      questionnaireId,
      questionText: "Collaborative editing is safest when you...",
      options: [
        "Disable version history",
        "Grant everyone full admin rights",
        "Use organisational accounts with audit trails",
        "Share editable files on social media",
      ],
      correctOption: 2,
      subjectTag: "Digital Literacy",
    }
  )

  db.announcements.push(
    {
      id: cuid(),
      postedById: adminId,
      title: "SANGAM portal goes live",
      body: "Capacity Connect (SANGAM) is open for internal training enrollment across departments.",
      type: "NOTIFICATION",
      postedAt: now(),
    },
    {
      id: cuid(),
      postedById: adminId,
      title: "Digital Workplace Essentials now available",
      body: "New course by Priya Sharma covering secure collaboration and digital hygiene.",
      type: "NEW_CONTENT",
      postedAt: now(),
    },
    {
      id: cuid(),
      postedById: adminId,
      title: "First cohort certification milestone",
      body: "Celebrating organisations that completed foundational digital literacy modules.",
      type: "ACHIEVEMENT",
      postedAt: now(),
    }
  )

  db.competencyMaps.push(
    {
      id: cuid(),
      subjectTag: "Digital Literacy",
      trainerId,
      proficiencyScore: 92,
      rationale: "Authored multiple digital literacy modules with strong trainee ratings.",
    },
    {
      id: cuid(),
      subjectTag: "Leadership",
      trainerId,
      proficiencyScore: 78,
      rationale: "Listed expertise and prior facilitation in leadership workshops.",
    },
    {
      id: cuid(),
      subjectTag: "Cybersecurity",
      trainerId: trainer2Id,
      proficiencyScore: 88,
      rationale: "Specialist profile and questionnaire authoring in cybersecurity topics.",
    },
    {
      id: cuid(),
      subjectTag: "Data Protection",
      trainerId: trainer2Id,
      proficiencyScore: 81,
      rationale: "Mapped from subject areas and course feedback averages.",
    }
  )

  return db
}

function ensureDb(): Database {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  if (!existsSync(DB_PATH)) {
    const seeded = seedDb()
    writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2))
    return seeded
  }
  return JSON.parse(readFileSync(DB_PATH, "utf8")) as Database
}

export function readDb(): Database {
  return ensureDb()
}

export function writeDb(db: Database) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

export function mutateDb<T>(fn: (db: Database) => T): T {
  if (mutating) {
    throw new Error("Data store is busy. Retry the request.")
  }
  mutating = true
  try {
    const db = readDb()
    const result = fn(db)
    writeDb(db)
    return result
  } finally {
    mutating = false
  }
}

export function findUserByEmail(email: string) {
  return readDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function findUserById(id: string) {
  return readDb().users.find((u) => u.id === id)
}

export function resetDb() {
  const seeded = seedDb()
  writeDb(seeded)
  return seeded
}
