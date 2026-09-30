import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { Suspense } from "react"
import { SessionProvider } from "next-auth/react"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "SANGAM | Capacity Connect",
  description: "Capacity Connect portal for trainees, trainers, and administrators",
  icons: {
    icon: [{ url: "/sangam-mark.svg", type: "image/svg+xml" }],
    apple: [{ url: "/sangam-logo.png" }],
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <SessionProvider>
          <Suspense fallback={<div className="p-8 text-slate-600">Loading...</div>}>
            {children}
          </Suspense>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
