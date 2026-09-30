import {
  cuid,
  findUserByEmail,
  mutateDb,
  type ApprovalStatus,
  type Role,
} from "@/lib/store"
import { NextRequest, NextResponse } from "next/server"
import { badRequest, text } from "@/lib/validation"

const roleMap: Record<string, Role> = {
  trainee: "TRAINEE",
  trainer: "TRAINER",
  admin: "ADMIN",
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const email = text(payload.email).toLowerCase()
    const name = text(payload.name)
    const password = typeof payload.password === "string" ? payload.password : ""
    const role = text(payload.role).toLowerCase()

    if (!name) return badRequest("Full name is required")
    if (!email) return badRequest("Email is required")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest("Enter a valid email address")
    }
    if (!password || password.length < 6) {
      return badRequest("Password must be at least 6 characters")
    }
    if (!role) return badRequest("Select a role")

    const mappedRole = roleMap[role]
    if (!mappedRole) {
      return badRequest("Invalid role")
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
