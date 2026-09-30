import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import type { Role } from "@/lib/generated/prisma"

const roleMap: Record<string, Role> = {
  trainee: "TRAINEE",
  trainer: "TRAINER",
  admin: "ADMIN",
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, password, role } = await req.json()

    if (!email || !name || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const mappedRole = roleMap[String(role).toLowerCase()]
    if (!mappedRole) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Trainees are auto-approved; Trainer/Admin need approval (except seeded demos)
    const approvalStatus = mappedRole === "TRAINEE" ? "APPROVED" : "PENDING"

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password,
        role: mappedRole,
        approvalStatus,
        ...(mappedRole === "TRAINEE"
          ? { traineeProfile: { create: { interests: [], skills: [], certificateUrls: [] } } }
          : {}),
        ...(mappedRole === "TRAINER"
          ? { trainerProfile: { create: { subjectAreas: [] } } }
          : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        approvalStatus: true,
      },
    })

    return NextResponse.json(
      {
        message:
          approvalStatus === "APPROVED"
            ? "Sign-up successful. You can sign in now."
            : "Sign-up received. An admin must approve your account before you can sign in.",
        user,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Sign-up error:", error)
    return NextResponse.json({ error: "Sign-up failed" }, { status: 500 })
  }
}
