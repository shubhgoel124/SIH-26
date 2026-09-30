import { NextResponse } from "next/server"

/** Trim unknown input to a string. Non-strings become "". */
export function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

/** Split comma-separated input into non-empty trimmed items. */
export function csvList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => text(v)).filter(Boolean)
  }
  return text(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

export function isBlank(value: unknown): boolean {
  return text(value).length === 0
}

/** Basic phone check: at least 10 digits after stripping common formatting. */
export function isValidPhone(value: unknown): boolean {
  const digits = text(value).replace(/[\s\-()+]/g, "")
  return /^\d{10,15}$/.test(digits)
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}
