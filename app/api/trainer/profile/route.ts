import { NextRequest, NextResponse } from "next/server"
import { cuid, mutateDb, readDb } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"
import { badRequest, csvList, isValidPhone, text } from "@/lib/validation"

export async function GET() {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const db = readDb()
  const profile = db.trainerProfiles.find((p) => p.userId === authResult.session.user.id) ?? null

  return NextResponse.json({ profile })
}

export async function POST(req: NextRequest) {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const body = await req.json()
  const bio = text(body.bio)
  const phone = text(body.phone)
  const subjectAreas = csvList(body.subjectAreas)
  const yearsRaw = body.yearsExperience
  const yearsExperience =
    typeof yearsRaw === "number" ? yearsRaw : Number(text(yearsRaw))

  if (!bio) return badRequest("Bio is required")
  if (subjectAreas.length === 0) return badRequest("Add at least one subject area")
  if (!Number.isFinite(yearsExperience) || yearsExperience < 0) {
    return badRequest("Years of experience must be 0 or more")
  }
  if (!phone) return badRequest("Phone number is required")
  if (!isValidPhone(phone)) return badRequest("Enter a valid phone number (10–15 digits)")

  const userId = authResult.session.user.id

  const profile = mutateDb((db) => {
    const idx = db.trainerProfiles.findIndex((p) => p.userId === userId)
    const updatedAt = new Date().toISOString()

    if (idx === -1) {
      const created = {
        id: cuid(),
        userId,
        bio,
        subjectAreas,
        yearsExperience,
        phone,
        updatedAt,
      }
      db.trainerProfiles.push(created)
      return created
    }

    const existing = db.trainerProfiles[idx]
    existing.bio = bio
    existing.subjectAreas = subjectAreas
    existing.yearsExperience = yearsExperience
    existing.phone = phone
    existing.updatedAt = updatedAt
    return { ...existing }
  })

  return NextResponse.json({ profile })
}
