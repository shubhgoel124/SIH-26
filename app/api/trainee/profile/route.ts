import { NextRequest, NextResponse } from "next/server"
import { cuid, mutateDb, readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"
import { badRequest, csvList, isValidPhone, text } from "@/lib/validation"

export async function GET() {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const db = readDb()
  const profile = db.traineeProfiles.find((p) => p.userId === authResult.session.user.id) ?? null

  return NextResponse.json({ profile })
}

export async function POST(req: NextRequest) {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const body = await req.json()
  const qualifications = text(body.qualifications)
  const workExperience = text(body.workExperience)
  const phone = text(body.phone)
  const interests = csvList(body.interests)
  const skills = csvList(body.skills)
  const certificateUrls = Array.isArray(body.certificateUrls)
    ? body.certificateUrls.map((u: unknown) => text(u)).filter(Boolean)
    : undefined

  if (!qualifications) return badRequest("Qualifications are required")
  if (!workExperience) return badRequest("Work experience is required")
  if (interests.length === 0) return badRequest("Add at least one interest")
  if (skills.length === 0) return badRequest("Add at least one skill")
  if (!phone) return badRequest("Phone number is required")
  if (!isValidPhone(phone)) return badRequest("Enter a valid phone number (10–15 digits)")

  const userId = authResult.session.user.id

  const profile = mutateDb((db) => {
    const idx = db.traineeProfiles.findIndex((p) => p.userId === userId)
    const updatedAt = new Date().toISOString()

    if (idx === -1) {
      const created = {
        id: cuid(),
        userId,
        qualifications,
        workExperience,
        interests,
        skills,
        phone,
        certificateUrls: certificateUrls ?? [],
        updatedAt,
      }
      db.traineeProfiles.push(created)
      return created
    }

    const existing = db.traineeProfiles[idx]
    existing.qualifications = qualifications
    existing.workExperience = workExperience
    existing.interests = interests
    existing.skills = skills
    existing.phone = phone
    if (certificateUrls !== undefined) existing.certificateUrls = certificateUrls
    existing.updatedAt = updatedAt
    return { ...existing }
  })

  return NextResponse.json({ profile })
}
