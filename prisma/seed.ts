import { PrismaClient } from "../lib/generated/prisma"

const prisma = new PrismaClient()

async function main() {
  await prisma.assessmentAttempt.deleteMany()
  await prisma.question.deleteMany()
  await prisma.questionnaire.deleteMany()
  await prisma.courseFeedback.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.courseMaterial.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.competencyMap.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.course.deleteMany()
  await prisma.traineeProfile.deleteMany()
  await prisma.trainerProfile.deleteMany()
  await prisma.user.deleteMany()

  const admin = await prisma.user.create({
    data: {
      name: "Demo Admin",
      email: "admin@sangam.dev",
      password: "password",
      role: "ADMIN",
      approvalStatus: "APPROVED",
    },
  })

  const trainer = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "trainer@sangam.dev",
      password: "password",
      role: "TRAINER",
      approvalStatus: "APPROVED",
      trainerProfile: {
        create: {
          bio: "Capacity building specialist with a focus on digital literacy and public administration.",
          subjectAreas: ["Digital Literacy", "Leadership", "Public Policy"],
          yearsExperience: 8,
          phone: "9876543210",
        },
      },
    },
  })

  const trainer2 = await prisma.user.create({
    data: {
      name: "Rahul Mehta",
      email: "trainer2@sangam.dev",
      password: "password",
      role: "TRAINER",
      approvalStatus: "APPROVED",
      trainerProfile: {
        create: {
          bio: "Cybersecurity trainer for government departments.",
          subjectAreas: ["Cybersecurity", "Data Protection"],
          yearsExperience: 6,
        },
      },
    },
  })

  const trainee = await prisma.user.create({
    data: {
      name: "Asha Verma",
      email: "trainee@sangam.dev",
      password: "password",
      role: "TRAINEE",
      approvalStatus: "APPROVED",
      traineeProfile: {
        create: {
          qualifications: "B.A. Public Administration",
          workExperience: "3 years as section officer",
          interests: ["Leadership", "Digital tools"],
          skills: ["MS Office", "Communication"],
          phone: "9123456780",
        },
      },
    },
  })

  await prisma.user.create({
    data: {
      name: "Pending Trainer",
      email: "pending.trainer@sangam.dev",
      password: "password",
      role: "TRAINER",
      approvalStatus: "PENDING",
    },
  })

  const course = await prisma.course.create({
    data: {
      title: "Digital Workplace Essentials",
      description:
        "Core digital skills for day-to-day government and organisational work: collaboration tools, file hygiene, and secure communication.",
      subjectTag: "Digital Literacy",
      trainerId: trainer.id,
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-03-15"),
      status: "ACTIVE",
      materials: {
        create: [
          {
            title: "Kickoff presentation",
            type: "PRESENTATION",
            fileUrl: "https://res.cloudinary.com/demo/raw/upload/sample.pdf",
          },
          {
            title: "Secure email practices",
            type: "PDF",
            fileUrl: "https://res.cloudinary.com/demo/raw/upload/sample.pdf",
          },
        ],
      },
    },
  })

  await prisma.enrollment.create({
    data: {
      traineeId: trainee.id,
      courseId: course.id,
      status: "IN_PROGRESS",
      progressPercent: 40,
    },
  })

  const questionnaire = await prisma.questionnaire.create({
    data: {
      courseId: course.id,
      trainerId: trainer.id,
      title: "Module 1 MCQ Check",
      deadline: new Date("2026-12-31"),
      questions: {
        create: [
          {
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
            questionText: "Collaborative editing is safest when you...",
            options: [
              "Disable version history",
              "Grant everyone full admin rights",
              "Use organisational accounts with audit trails",
              "Share editable files on social media",
            ],
            correctOption: 2,
            subjectTag: "Digital Literacy",
          },
        ],
      },
    },
  })

  await prisma.announcement.createMany({
    data: [
      {
        postedById: admin.id,
        title: "SANGAM portal goes live",
        body: "Capacity Connect (SANGAM) is open for internal training enrollment across departments.",
        type: "NOTIFICATION",
      },
      {
        postedById: admin.id,
        title: "Digital Workplace Essentials now available",
        body: "New course by Priya Sharma covering secure collaboration and digital hygiene.",
        type: "NEW_CONTENT",
      },
      {
        postedById: admin.id,
        title: "First cohort certification milestone",
        body: "Celebrating organisations that completed foundational digital literacy modules.",
        type: "ACHIEVEMENT",
      },
    ],
  })

  await prisma.competencyMap.createMany({
    data: [
      {
        subjectTag: "Digital Literacy",
        trainerId: trainer.id,
        proficiencyScore: 92,
        rationale: "Authored multiple digital literacy modules with strong trainee ratings.",
      },
      {
        subjectTag: "Leadership",
        trainerId: trainer.id,
        proficiencyScore: 78,
        rationale: "Listed expertise and prior facilitation in leadership workshops.",
      },
      {
        subjectTag: "Cybersecurity",
        trainerId: trainer2.id,
        proficiencyScore: 88,
        rationale: "Specialist profile and questionnaire authoring in cybersecurity topics.",
      },
      {
        subjectTag: "Data Protection",
        trainerId: trainer2.id,
        proficiencyScore: 81,
        rationale: "Mapped from subject areas and course feedback averages.",
      },
    ],
  })

  console.log("Seeded SANGAM demo data")
  console.log({
    admin: "admin@sangam.dev / password",
    trainer: "trainer@sangam.dev / password",
    trainee: "trainee@sangam.dev / password",
    questionnaireId: questionnaire.id,
    courseId: course.id,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
