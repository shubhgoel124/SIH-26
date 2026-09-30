import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-helpers"

export async function GET() {
  const authResult = await requireRole("trainee")
  if (!authResult.ok) return authResult.response

  const profile = await prisma.traineeProfile.findUnique({
    where: { userId: authResult.session.user.id },
  })

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

  const profile = await prisma.traineeProfile.upsert({
    where: { userId: authResult.session.user.id },
    create: {
      userId: authResult.session.user.id,
      qualifications: qualifications ?? null,
      workExperience: workExperience ?? null,
      interests: Array.isArray(interests) ? interests : [],
      skills: Array.isArray(skills) ? skills : [],
      phone: phone ?? null,
      certificateUrls: Array.isArray(certificateUrls) ? certificateUrls : [],
    },
    update: {
      ...(qualifications !== undefined && { qualifications }),
      ...(workExperience !== undefined && { workExperience }),
      ...(interests !== undefined && { interests: Array.isArray(interests) ? interests : [] }),
      ...(skills !== undefined && { skills: Array.isArray(skills) ? skills : [] }),
      ...(phone !== undefined && { phone }),
      ...(certificateUrls !== undefined && {
        certificateUrls: Array.isArray(certificateUrls) ? certificateUrls : [],
      }),
    },
  })

  return NextResponse.json({ profile })
}
