import { NextRequest, NextResponse } from "next/server"
import { readUploadedFile } from "@/app/api/upload/route"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, "")
  if (!safe) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const data = readUploadedFile(safe)
  if (!data) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  const ext = safe.split(".").pop()?.toLowerCase()
  const type =
    ext === "pdf"
      ? "application/pdf"
      : ext === "png"
        ? "image/png"
        : ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : "application/octet-stream"

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=3600",
    },
  })
}
