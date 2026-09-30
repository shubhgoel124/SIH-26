"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

type SangamLogoProps = {
  className?: string
  /** Icon mark size in pixels (square). */
  size?: number
  /** Show the SANGAM wordmark next to the mark. */
  showWordmark?: boolean
  /** Optional subtitle under the wordmark. */
  subtitle?: string
  /** Compact = mark + wordmark only; stacked = mark above text (hero). */
  variant?: "inline" | "stacked"
}

/** Confluence mark: three streams meeting as one (sangam). */
export function SangamMark({ className, size = 36 }: { className?: string; size?: number }) {
  const gid = useId().replace(/:/g, "")
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sangamFlow-${gid}`} x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0369A1" />
          <stop offset="0.55" stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="#E0F2FE" />
      <path
        d="M10 12C12 18 16 22 24 26C16 28 12 32 10 38"
        stroke={`url(#sangamFlow-${gid})`}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M38 12C36 18 32 22 24 26C32 28 36 32 38 38"
        stroke={`url(#sangamFlow-${gid})`}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M24 8V40"
        stroke={`url(#sangamFlow-${gid})`}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="24" cy="26" r="4.5" fill="#0369A1" />
      <circle cx="24" cy="26" r="2" fill="#F0F9FF" />
    </svg>
  )
}

export function SangamLogo({
  className,
  size = 36,
  showWordmark = true,
  subtitle,
  variant = "inline",
}: SangamLogoProps) {
  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col items-center gap-3 text-center", className)}>
        <SangamMark size={size} />
        {showWordmark && (
          <div>
            <p className="text-3xl font-bold tracking-tight text-sky-700 sm:text-4xl">SANGAM</p>
            {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
        )}
      </div>
    )
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <SangamMark size={size} />
      {showWordmark ? (
        <span className="min-w-0 text-left leading-tight">
          <span className="block text-xl font-bold tracking-tight text-sky-700">SANGAM</span>
          {subtitle ? <span className="block text-xs font-medium text-slate-500">{subtitle}</span> : null}
        </span>
      ) : null}
    </span>
  )
}
