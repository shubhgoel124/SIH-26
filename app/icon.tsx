import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

/** Browser tab / PWA icon: SANGAM confluence mark. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#E0F2FE",
          borderRadius: 8,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
          <path
            d="M10 12C12 18 16 22 24 26C16 28 12 32 10 38"
            stroke="#0EA5E9"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M38 12C36 18 32 22 24 26C32 28 36 32 38 38"
            stroke="#0EA5E9"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path d="M24 8V40" stroke="#0369A1" strokeWidth="5" strokeLinecap="round" />
          <circle cx="24" cy="26" r="5" fill="#0369A1" />
          <circle cx="24" cy="26" r="2.2" fill="#F0F9FF" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
