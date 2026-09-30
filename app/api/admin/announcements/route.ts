import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"
import type { AnnouncementType } from "@/lib/generated/prisma"

const VALID_TYPES: AnnouncementType[] = ["NOTIFICATION", "ACHIEVEMENT", "NEW_CONTENT"]

export async function GET() {
  const authResult = await requireRole("admin")
  if (!authResult.ok) return authResult.response

  const announcements = await prisma.announcement.findMany({
    include: {
      postedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { postedAt: "desc" },
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

  const announcement = await prisma.announcement.create({
    data: {
      title,
      body,
      type,
      postedById: authResult.session.user.id,
    },
    include: {
      postedBy: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ announcement }, { status: 201 })
}
