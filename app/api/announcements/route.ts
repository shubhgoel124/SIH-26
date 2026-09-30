import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    include: {
      postedBy: { select: { id: true, name: true } },
    },
    orderBy: { postedAt: "desc" },
  })

  return NextResponse.json({ announcements })
}
