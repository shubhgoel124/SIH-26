import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { currentPassword, newPassword } = await req.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ message: "Current and new passwords are required" }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ message: "Password must be at least 8 characters long" }, { status: 400 })
  }

  if (newPassword === currentPassword) {
    return NextResponse.json({ message: "New password must be different from current password" }, { status: 400 })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    })

    if (!existingUser) {
      return NextResponse.json({ message: "Account not found" }, { status: 404 })
    }

    if (existingUser.password !== currentPassword) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: newPassword },
    })

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Password change failed:", error)
    return NextResponse.json({ message: "Failed to update password" }, { status: 500 })
  }
}
