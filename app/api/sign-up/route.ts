import {
  cuid,
  findUserByEmail,
  mutateDb,
  type ApprovalStatus,
  type Role,
} from "@/lib/store"
import { NextRequest, NextResponse } from "next/server"

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

    const existing = findUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    const approvalStatus: ApprovalStatus =
      mappedRole === "TRAINEE" ? "APPROVED" : "PENDING"

    const user = mutateDb((db) => {
      const id = cuid()
      const createdAt = new Date().toISOString()
      const newUser = {
        id,
        email,
        name,
        password,
        role: mappedRole,
        approvalStatus,
        createdAt,
      }
      db.users.push(newUser)

      if (mappedRole === "TRAINEE") {
        db.traineeProfiles.push({
          id: cuid(),
          userId: id,
          interests: [],
          skills: [],
          certificateUrls: [],
          updatedAt: createdAt,
        })
      } else if (mappedRole === "TRAINER") {
        db.trainerProfiles.push({
          id: cuid(),
          userId: id,
          subjectAreas: [],
          updatedAt: createdAt,
        })
      }

      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        approvalStatus: newUser.approvalStatus,
      }
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
