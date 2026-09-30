import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const profile = await prisma.trainerProfile.findUnique({
    where: { userId: authResult.session.user.id },
  })

  return NextResponse.json({ profile })
}

export async function POST(req: NextRequest) {
  const authResult = await requireRole("trainer")
  if (!authResult.ok) return authResult.response

  const body = await req.json()
  const { bio, subjectAreas, yearsExperience, phone } = body

  const profile = await prisma.trainerProfile.upsert({
    where: { userId: authResult.session.user.id },
    create: {
      userId: authResult.session.user.id,
      bio: bio ?? null,
      subjectAreas: Array.isArray(subjectAreas) ? subjectAreas : [],
      yearsExperience:
        typeof yearsExperience === "number" ? yearsExperience : null,
      phone: phone ?? null,
    },
    update: {
      ...(bio !== undefined && { bio }),
      ...(subjectAreas !== undefined && {
        subjectAreas: Array.isArray(subjectAreas) ? subjectAreas : [],
      }),
      ...(yearsExperience !== undefined && {
        yearsExperience: typeof yearsExperience === "number" ? yearsExperience : null,
      }),
      ...(phone !== undefined && { phone }),
    },
  })

  return NextResponse.json({ profile })
}
