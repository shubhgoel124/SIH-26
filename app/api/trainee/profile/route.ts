import { NextRequest, NextResponse } from "next/server"
import { cuid, mutateDb, readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

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
  const {
    qualifications,
    workExperience,
    interests,
    skills,
    phone,
    certificateUrls,
  } = body

  const userId = authResult.session.user.id

  const profile = mutateDb((db) => {
    const idx = db.traineeProfiles.findIndex((p) => p.userId === userId)
    const updatedAt = new Date().toISOString()

    if (idx === -1) {
      const created = {
        id: cuid(),
        userId,
        qualifications: qualifications ?? undefined,
        workExperience: workExperience ?? undefined,
        interests: Array.isArray(interests) ? interests : [],
        skills: Array.isArray(skills) ? skills : [],
        phone: phone ?? undefined,
        certificateUrls: Array.isArray(certificateUrls) ? certificateUrls : [],
        updatedAt,
      }
      db.traineeProfiles.push(created)
      return created
    }

    const existing = db.traineeProfiles[idx]
    if (qualifications !== undefined) existing.qualifications = qualifications
    if (workExperience !== undefined) existing.workExperience = workExperience
    if (interests !== undefined) existing.interests = Array.isArray(interests) ? interests : []
    if (skills !== undefined) existing.skills = Array.isArray(skills) ? skills : []
    if (phone !== undefined) existing.phone = phone
    if (certificateUrls !== undefined) {
      existing.certificateUrls = Array.isArray(certificateUrls) ? certificateUrls : []
    }
    existing.updatedAt = updatedAt
    return { ...existing }
  })

  return NextResponse.json({ profile })
}
