import { NextRequest, NextResponse } from "next/server"
import { cuid, mutateDb, readDb, type AnnouncementType } from "@/lib/store"
import { requireRole } from "@/lib/auth-helpers"

const VALID_TYPES: AnnouncementType[] = ["NOTIFICATION", "ACHIEVEMENT", "NEW_CONTENT"]

export async function GET() {
  const authResult = await requireRole("admin")
  if (!authResult.ok) return authResult.response

  const db = readDb()

  const announcements = [...db.announcements]
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
    .map((a) => {
      const postedBy = db.users.find((u) => u.id === a.postedById)
      return {
        ...a,
        postedBy: postedBy
          ? { id: postedBy.id, name: postedBy.name, email: postedBy.email }
          : { id: a.postedById, name: "Unknown", email: "" },
      }
    })

  return NextResponse.json({ announcements })
}

export async function POST(req: NextRequest) {
  const authResult = await requireRole("admin")
  if (!authResult.ok) return authResult.response

  const { title, body, type } = await req.json()

  if (!title || !body || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid announcement type" }, { status: 400 })
  }

  const announcement = mutateDb((db) => {
    const postedAt = new Date().toISOString()
    const entry = {
      id: cuid(),
      postedById: authResult.session.user.id,
      title,
      body,
      type: type as AnnouncementType,
      postedAt,
    }
    db.announcements.push(entry)
    const postedBy = db.users.find((u) => u.id === authResult.session.user.id)
    return {
      ...entry,
      postedBy: postedBy
        ? { id: postedBy.id, name: postedBy.name }
        : { id: authResult.session.user.id, name: authResult.session.user.name },
    }
  })

  return NextResponse.json({ announcement }, { status: 201 })
}
