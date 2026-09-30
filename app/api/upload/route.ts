import { v2 as cloudinary } from "cloudinary"
import { mkdirSync, writeFileSync, existsSync } from "fs"
import path from "path"
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
  const uploadsDir = path.join(process.cwd(), "public", "uploads")
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true })
  }

  const ext = path.extname(file.name)
  const safeBase = sanitizeFilename(path.basename(file.name, ext))
  const filename = `${safeBase}-${cuid()}${ext}`
  const filePath = path.join(uploadsDir, filename)

  const bytes = await file.arrayBuffer()
  writeFileSync(filePath, Buffer.from(bytes))

  return { url: `/uploads/${filename}`, publicId: filename }
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
    const error = err as { error?: { name?: string; message?: string }; message?: string }

    if (error?.error?.name === "TimeoutError" || error?.message?.includes("timeout")) {
      return NextResponse.json(
        { error: "Upload timed out. Please try again with a smaller file or check your connection." },
        { status: 504 }
      )
    }

    if (error?.error?.message) {
      return NextResponse.json({ error: error.error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export const deleteFromCloudinary = async (
  publicIds: string | string[],
  resourceType: "image" | "raw" | "video" = "raw"
): Promise<{
  success: boolean
  deleted?: string[]
  error?: string
}> => {
  if (!useCloudinary) {
    return { success: true, deleted: [] }
  }

  try {
    const ids = typeof publicIds === "string" ? [publicIds] : publicIds

    if (ids.length === 0) {
      return { success: true, deleted: [] }
    }

    const results = await Promise.all(
      ids.map((id) => cloudinary.uploader.destroy(id, { resource_type: resourceType }))
    )

    const deleted = ids.filter((_, index) => results[index].result === "ok")

    return { success: true, deleted }
  } catch (err: unknown) {
    console.error("Cloudinary delete error:", err)
    const message = err instanceof Error ? err.message : "Unknown error during delete"
    return { success: false, error: message }
  }
}

export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    const regex = /\/(?:image|raw|video)\/upload\/(?:v\d+\/)?(.+)$/
    const match = url.match(regex)
    if (match) {
      const pathWithExt = match[1]
      const lastDotIndex = pathWithExt.lastIndexOf(".")
      return lastDotIndex > 0 ? pathWithExt.substring(0, lastDotIndex) : pathWithExt
    }
    return null
  } catch {
    return null
  }
}
