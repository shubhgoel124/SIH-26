import { NextResponse } from "next/server"
import { readDb } from "@/lib/store"

export async function GET() {
  const db = readDb()

  const announcements = [...db.announcements]
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
    .map((a) => {
      const postedBy = db.users.find((u) => u.id === a.postedById)
      return {
        ...a,
        postedBy: postedBy
          ? { id: postedBy.id, name: postedBy.name }
          : { id: a.postedById, name: "Unknown" },
      }
    })

  return NextResponse.json({ announcements })
}
