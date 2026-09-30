import { v2 as cloudinary } from "cloudinary"
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs"
import path from "path"
import os from "os"
import { NextRequest, NextResponse } from "next/server"
import { cuid } from "@/lib/store"

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET
const useCloudinary = Boolean(cloudName && apiKey && apiSecret)

if (useCloudinary) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    timeout: 60000,
  })
}

function sanitizeFilename(name: string): string {
  const base = path.basename(name)
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_")
  return cleaned.slice(0, 200) || "upload"
}

function uploadsDir() {
  const dirs = [
    path.join(process.cwd(), "public", "uploads"),
    path.join(os.tmpdir(), "sangam-uploads"),
  ]
  for (const dir of dirs) {
    try {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      return dir
    } catch {
      // try next
    }
  }
  return path.join(os.tmpdir(), "sangam-uploads")
}

async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<{ url: string; publicId: string }> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

  const isPdf = file.type === "application/pdf"
  const resourceType = isPdf ? "raw" : "auto"

  const result = await cloudinary.uploader.upload(base64, {
    folder,
    resource_type: resourceType,
    timeout: 60000,
  })

  return { url: result.secure_url, publicId: result.public_id }
}

async function uploadToLocal(file: File): Promise<{ url: string; publicId: string }> {
  const dir = uploadsDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const ext = path.extname(file.name)
  const safeBase = sanitizeFilename(path.basename(file.name, ext))
  const filename = `${safeBase}-${cuid()}${ext}`
  const filePath = path.join(dir, filename)

  const bytes = await file.arrayBuffer()
  writeFileSync(filePath, Buffer.from(bytes))

  // Served via /api/files so it works on Vercel (/tmp) and local (/public/uploads)
  return { url: `/api/files/${filename}`, publicId: filename }
}

export function readUploadedFile(filename: string): Buffer | null {
  const safe = path.basename(filename)
  const candidates = [
    path.join(process.cwd(), "public", "uploads", safe),
    path.join(os.tmpdir(), "sangam-uploads", safe),
  ]
  for (const filePath of candidates) {
    try {
      if (existsSync(filePath)) return readFileSync(filePath)
    } catch {
      // continue
    }
  }
  return null
}

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be under 5MB" }, { status: 400 })
    }

    const result = useCloudinary
      ? await uploadToCloudinary(file, folder)
      : await uploadToLocal(file)

    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error("Upload error:", err)
    const message = err instanceof Error ? err.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
